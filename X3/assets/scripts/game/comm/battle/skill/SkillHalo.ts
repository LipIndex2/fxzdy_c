import { Vec2 } from "cc";
import { WorldManager } from "../../world/WorldManager";
import { FightTimeCheck } from "../FightTimeCheck";
import { ActorUnitNode } from "../node/ActorUnitNode";
import { BattleUnit } from "../unit/battle/BattleUnit";
import { ICaster } from "./ICaster";
import { ITarget } from "./ITarget";
import { BattleUtils } from "../BattleUtils";
import { SkillUtils } from "./SkillUtils";
import { v2 } from "cc";
import { HaloType, LeaderSkillTriggerType } from "./SkillEnum";
import G from "../../../../core/comm/G";
import { SkillBehavior } from "./SkillBehavior";
import { MathUtils } from "../../../../core/utils/MathUtils";
import { BattleDebugManager } from "../BattleDebugManager";
import { PassivitySkillUtils } from "./PassivitySkillUtils";
import { BattleLogic } from "../BattleLogic";
import * as fgui from "fairygui-cc";
import { TweenUtils } from "../../../../core/utils/TweenUtils";
import { Tween } from "cc";

export class SkillHalo extends FightTimeCheck {

    public id: string
    public uid: number;
    public cfg: table.battle.HaloConfig;
    /***当前处理逻辑 */
    public battleLogic: BattleLogic;

    /***释放者数据 */
    public caster: ICaster;
    /***范围内的单位 */
    public units: BattleUnit[] = []

    /***循环帧数 */
    public timeLoop: number = 0;
    /***每次触发的帧数 */
    public trigger: number = 0;
    /***持续时间 */
    public maxTime: number = 0;
    public effectType: string
    /***BUFF效果参数1 */
    public effectParm1: any;
    /***BUFF效果参数2 */
    public effectParm2: any;

    public x: number
    public y: number;

    public target: ITarget;

    private areaImg: ui.commBattle.battleComp.BattleBuffAreaComp | ui.commBattle.battleComp.BattleDebuffBuffAreaComp;
    private effects: ActorUnitNode[]
    private checkInRangeTimeIndex: number
    /***所属技能行为 */
    public skillBehavior: SkillBehavior
    /***创建BUFF时双方的距离 */
    public distance: number = 0;

    /**生效次数 */
    public count?: number;

    public init(uid: number, cfg: table.battle.HaloConfig, from: ICaster, target: ITarget, battleLogic: BattleLogic): void {
        this.cfg = cfg;
        this.uid = uid;
        this.effectType = cfg.effectType
        this.id = cfg.id
        this.caster = from;
        this.target = target;
        this.count = cfg.countLimit || -1;
        this.battleLogic = battleLogic

        this.effectParm1 = cfg.effectParam;
        this.effectParm2 = cfg.effectParam2

        if (cfg.timeLimit) {
            this.maxTime = BattleUtils.getFrameByTime(cfg.timeLimit)
        }

        if (cfg.interval) {
            this.trigger = BattleUtils.getFrameByTime(cfg.interval)
        }

        let fighter = this.battleLogic.getBatteUintByUid(from.casterUid)
        if (fighter && target instanceof BattleUnit) {
            this.distance = MathUtils.distance(fighter.pos, target.pos)
        }
        this.x = this.target.pos.x;
        this.y = this.target.pos.y;
        this.createAreaImg();
    }

    /**下一帧时间 */
    public nextFrame(): void {
        if (this._isReadyToRemove)
            return;

        this.index++;
        if (this.index >= this.maxIndex) {
            this.index = 0;

            this.time++;
            this.updatePos();
            this.triggerHandler()
            if (this.maxTime && this.time >= this.maxTime) {
                this.completeHandler();
                //移除
                this._isReadyToRemove = true;
            }
            else {
                this.checkUnitsInRange()
            }
        }
    }

    public set isReadyToRemove(v: boolean) {
        if (this._isReadyToRemove)
            return

        this._isReadyToRemove = v;
        if (v)
            this.completeHandler();
    }

    public get isReadyToRemove(): boolean {
        return this._isReadyToRemove;
    }

    private initCheckInRangeTimeIndex(): void {
        this.checkInRangeTimeIndex = 10;
    }

    public updatePos(): void {
        if (!this.cfg.canMove)
            return
        this.x = this.target.pos.x;
        this.y = this.target.pos.y;

        if (this.effects) {
            for (let i = 0; i < this.effects.length; i++) {
                if (this.effects[i] && this.effects[i].isValid) {
                    this.effects[i].setPosition(this.x, this.y)
                }
            }
        }

        this.updateAreaPos()
    }

    protected updateAreaPos(): void {
        if (this.areaImg?.node?.isValid) {
            this.areaImg.x = this.x;
            this.areaImg.y = -this.y;
        }
    }

    private static _tempPoint: Vec2;
    private static get tempPoint(): Vec2 {
        if (!this._tempPoint)
            this._tempPoint = v2(0, 0)
        return this._tempPoint
    }

    /***缓存的BUFF列表，假如角色的ATTRBUFF无改变，则一直使用 */
    private cacheAttrBuffMap: { [uid: number]: { [attrId: number]: { value: number, per: number } } } = {};

    /***清除ATTR类型的BUFF缓存列表 */
    public clearCacheAttrBuff(from: BattleUnit): void {
        delete this.cacheAttrBuffMap[from.uid];
    }

    /***检查单位是否在光环内 */
    private checkUnitsInRange(force: boolean = false): void {
        this.checkInRangeTimeIndex--;
        if (this.checkInRangeTimeIndex == 0 || force) {
            this.initCheckInRangeTimeIndex();

            let targetTeamId = SkillUtils.getTeamIdByFaction(this.caster.teamId, this.cfg.targetFaction);
            SkillHalo.tempPoint.set(this.x, this.y);
            let targets = this.battleLogic.unitCollisionsManager.getCircleUnits(targetTeamId, SkillHalo.tempPoint, this.cfg.range) as BattleUnit[];
            this.units = SkillUtils.behaviorFilterTargertsByTargetType(this.caster, targets, this.cfg.targetType, this.cfg.targetParam, this.cfg.num)
            BattleDebugManager.ins().showRangeCircle(null, SkillHalo.tempPoint.x, SkillHalo.tempPoint.y, this.cfg.range)
            // this.units = targets.slice(0, this.cfg.num || 9999999) as BattleUnit[]
        }
    }

    //检查光环列表是否属于属性增加，是否阵型相符，是否范围内
    public getHaloAttr(target: BattleUnit): { [key: number]: { value: number, per: number } } {
        if (!this.units)
            return
        if (this.units.indexOf(target) == -1) {
            this.clearCacheAttrBuff(target)
            return null;
        }

        if (this.cacheAttrBuffMap[target.uid])
            return this.cacheAttrBuffMap[target.uid];

        var returnMap: { [attrId: number]: { value: number, per: number } } = this.cacheAttrBuffMap[target.uid] = {};

        if (!this.isReadyToRemove) {

            if (this.effectType == HaloType.Attr) {
                //属性增益、减益
                for (let attrKey in this.effectParm1) {
                    const config = G.TableManager.getDataById(table.battle.AttributeConfig, attrKey);
                    if (config) {
                        if (!returnMap[config.tid]) {
                            returnMap[config.tid] = { value: 0, per: 0 }
                        }
                        let attrData = returnMap[config.tid];

                        var value: number = returnMap[config.tid].value;//汇总属性
                        var per: number = returnMap[config.tid].per;

                        value += +this.effectParm1[attrKey];

                        attrData.value = value;
                        attrData.per = per;
                    }
                }
            }
        }

        return returnMap;
    }

    /**触发 */
    protected triggerHandler(): void {
        this.timeLoop++;
        if (this.trigger != 0 && this.timeLoop >= this.trigger) {
            //执行BUFF
            this.actionHaloEffect();
            this.timeLoop = 0;
        }
    }

    /***结束后的回调 */
    protected completeHandler(): void {
        super.completeHandler()

        this.createEndEffect(this.cfg.modelUp, false);
        this.createEndEffect(this.cfg.modelDown, true);

        this.remove();
    }


    protected createAreaImg(): void {
        if (this.battleLogic.isNotShowBattleEffect()) {
            return;
        }

        if (!this.areaImg) {
            if (this.cfg.areaType == 2) {
                this.areaImg = fgui.UIPackage.createObject("commBattle", "BattleDebuffBuffAreaComp") as ui.commBattle.battleComp.BattleDebuffBuffAreaComp;
            }
            else if (this.cfg.areaType == 1) {
                this.areaImg = fgui.UIPackage.createObject("commBattle", "BattleBuffAreaComp") as ui.commBattle.battleComp.BattleBuffAreaComp;
            }

            if (this.areaImg) {
                WorldManager.ins().shadowLayer.addChild(this.areaImg.node);
                this.areaImg.img.height = this.cfg.range * 2;
                this.areaImg.img.width = this.cfg.range * 2;
                TweenUtils.yoyoAlpha(this.areaImg.img.node, 0.5, 100, 255)
            }
        }
        this.updateAreaPos();
    }

    public onAdd(): void {
        this.initCheckInRangeTimeIndex();
        if (this.cfg.modelUp) {
            this.createHaloEffect(this.cfg.modelUp, false)
        }

        if (this.cfg.modelDown) {
            this.createHaloEffect(this.cfg.modelDown, true)
        }
    }

    public actionHaloEffect(): void {
        if (this.target instanceof BattleUnit && this.target.isDeath)
            return;
        this.checkUnitsInRange(true)
        this.haloHandler();
        this.checkMissileNum();
        if (this.count > 0) {
            this.count--;
            if (this.count == 0) {
                this.isReadyToRemove = true
            }
        }
    }

    /***检查子弹数 */
    public checkMissileNum(): void {
        if (this.cfg.missileNum) {
            PassivitySkillUtils.checkLeaderSkillCon(LeaderSkillTriggerType.Bullet, this.caster.teamId, this.caster.caster, this.caster.caster, this.cfg.missileNum);
        }
    }

    public checkHaloFirstPassSkill(): void {
        if (this.units) {
            for (let i = 0; i < this.units.length; i++)
                PassivitySkillUtils.checkHaloFirstPassSkill(this.units[i], this.cfg.id)
        }
    }

    /***判断目标是否在光环内 */
    public checkTargetInUnits(target: BattleUnit): boolean {
        this.checkUnitsInRange(true);
        return this.units.indexOf(target) != -1;
    }

    protected haloHandler(): void {
    }

    /***创建特效 */
    private createHaloEffect(param: { begin: number | number[], loop: number }, isBg: boolean): void {
        if (this.battleLogic.isNotShowBattleEffect()) {
            return;
        }
        if (param.begin) {
            if (param.begin instanceof Array) {
                let begins = param.begin as number[]
                for (let i = 0; i < begins.length; i++) {
                    let eff = this.createEffectHandler(begins[i], this.target.pos, false, isBg, () => {
                        if (eff.isValid)
                            eff.destroy()
                        if (i == 0)
                            this.createLoopEffect(isBg, param)
                    });
                }
            }
            else {
                let eff = this.createEffectHandler(param.begin, this.target.pos, false, isBg, () => {
                    if (eff.isValid)
                        eff.destroy()
                    this.createLoopEffect(isBg, param)
                });
            }
        }
        else {
            this.createLoopEffect(isBg, param)
        }
    }

    private createEndEffect(param: { end: number }, isBg: boolean): void {
        if (param && param.end) {
            let eff = this.createEffectHandler(param.end, v2(this.x, this.y), false, isBg, () => {
                if (eff.isValid)
                    eff.destroy()
            });
        }
    }

    private createLoopEffect(isBg: boolean, param: { loop: number }): void {
        if (this.isReadyToRemove || !param.loop)//已移除就不再添加特效
            return

        if (!this.effects)
            this.effects = []
        this.effects.push(this.createEffectHandler(param.loop, v2(this.x, this.y), true, isBg))
    }

    private createEffectHandler(modelId: number, pos: Vec2, isLoop: boolean, isBg: boolean, listener?: (aniName: string) => void): ActorUnitNode {
        let node: ActorUnitNode = new ActorUnitNode();
        node.loadByModelId(modelId, isLoop);
        node.setPosition(pos.x, pos.y);
        node.setCompleteListener(listener);

        if (!isBg)
            WorldManager.ins().roleLayer.addChild(node);
        else
            WorldManager.ins().bgLayer.addChild(node);
        return node
    }

    public remove(): void {
        if (this.effects) {
            for (let i = 0; i < this.effects.length; i++) {
                if (this.effects[i] && this.effects[i].isValid)
                    this.effects[i].destroy();
            }
        }

        if (this.areaImg) {
            Tween.stopAllByTarget(this.areaImg.node)
            this.areaImg.dispose()
            this.areaImg = null;
        }
    }
}