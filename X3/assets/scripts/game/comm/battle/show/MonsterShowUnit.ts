import { Vec2 } from "cc";
import { PoolManager } from "../../../../core/pool/PoolManager";
import { TableManager } from "../../../../core/table/TableManager";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { DamageVo } from "../DamageVo";
import { MonsterType } from "../enum/BattleEnum";
import { AnimBaseUnitNode } from "../node/AnimBaseUnitNode";
import { SkillBehavior } from "../skill/SkillBehavior";
import { SkillData } from "../skill/SkillData";
import { BehaviorRangeType } from "../skill/SkillEnum";
import { SkillAngleRectChargeComp } from "../ui/SkillAngleRectChargeComp";
import { SkillArcChargeComp } from "../ui/SkillArcChargeComp";
import { SkillChargeComp } from "../ui/SkillChargeComp";
import { SkillEllipseChargeComp } from "../ui/SkillEllipseChargeComp";
import { SkillRectChargeComp } from "../ui/SkillRectChargeComp";
import { MonsterUnit } from "../unit/battle/MonsterUnit";
import { BattleShowUnit } from "./BattleShowUnit";
import * as fgui from "fairygui-cc";

export class MonsterShowUnit extends BattleShowUnit {
    public unitData: MonsterUnit;

    public onInitData(): void {
        super.onInitData();
        if (this.unitData.cfg.monsterType == MonsterType.Elite) {
            this._spineNode.colorYoYo()
        }
        this.delayToDispose = 1000;
    }

    public setSpineNode(node: AnimBaseUnitNode) {
        super.setSpineNode(node)
        node.name = "MonsterShowUnit"
    }

    /***初始化监听的战斗指令 */
    protected initCommand(): void {
        super.initCommand();
    }

    protected initShadowImg(): void {
        if (!this.shadow) {
            //添加影子
            let shadowUrl = "BattleShadowSmallComp"
            if (this.unitData.cfg.monsterType == MonsterType.Boss)
                shadowUrl = "BattleShadowBigComp"
            this.shadow = fgui.UIPackage.createObject("commBattle", shadowUrl) as ui.commBattle.battleComp.BattleShadowBigComp;
        }
    }

    protected updateHpBar(): void {
        if (this.unitData.attr.getMonsterCfg()?.hpBarMode == 1) {
            return
        }
        super.updateHpBar()
    }


    /***死亡动作后的特效计时器key */
    protected dieActionTimer1: string
    /***死亡动作播放完回调 */
    protected onDieActionComplete(): void {
        this.dieActionTimer1 = GameTimer.ins().once(this.delayToDispose, this, () => {
            if (!this.isDisposed) {
                this.node.fadeOut(1000)
                this.dieActionTimer1 = GameTimer.ins().once(850, this, () => {
                    if (!this.isDisposed)
                        this.visible = false;
                })
            }
        })
    }

    /***蓄力组件 */
    protected skillChargeComps: SkillChargeComp[]

    /***开始蓄力 */
    public beginCharge(behavior: SkillBehavior): void {
        super.beginCharge(behavior)
        this.disposeChargeComp()

        this.skillChargeComps = [];
        this.createChargeComp(behavior)
    }

    /***创建蓄力组件 */
    protected createChargeComp(behavior: SkillBehavior): void {
        let skillChargeComp: SkillChargeComp = null;
        let effectParam: { behavior: string, chargedId: string, arrow: number } = behavior.effectParam;
        let self = behavior.cfg.rangeType != BehaviorRangeType.TARGET_CIRCLE;
        if (effectParam.chargedId) {
            //读取蓄力表范围
            let cfg = TableManager.getDataById(table.battle.SkillChargedShowConfig, effectParam.chargedId);
            if (cfg) {
                if (cfg.type == 1 && cfg.parm?.group) {
                    //读取子弹组的该子弹所有子弹方向，正常只支持3类型的物理子弹
                    let gunArr = this.unitData.battleLogic.gunGroupMgr.getChargeWidthAndHeight(cfg.parm.group, behavior, this.unitData, cfg.parm)
                    if (gunArr?.length) {
                        for (let k = 0; k < gunArr.length; k++) {
                            this.crateChargeCompUiHandlerByChargedId(behavior, gunArr[k], self)
                        }
                    }
                }
                else if (cfg.type == 0) {
                    //自定义范围，宽高wh,半径r,a是扇形角度，用的是目标的坐标
                    if (cfg.parm.list) {
                        for (let i = 0; i < cfg.parm.list.length; i++) {
                            this.crateChargeCompUiHandlerByChargedId(behavior, cfg.parm.list[i], self)
                        }
                    }
                    else {
                        this.crateChargeCompUiHandlerByChargedId(behavior, cfg.parm, self)
                    }
                }
            }
            return;
        }
        else {
            //读取行为表的范围
            skillChargeComp = this.crateChargeCompUiHandler(behavior.cfg.rangeType)
        }

        if (skillChargeComp) {
            skillChargeComp.setData(behavior, (!self && behavior.skillTarget) ? behavior.skillTarget.pos : this.pos, effectParam.arrow == 1)
            this.skillChargeComps.push(skillChargeComp)
        }
    }

    protected crateChargeCompUiHandler(rangeType: number): SkillChargeComp {
        if (rangeType == BehaviorRangeType.SELF_ARC) {
            return new SkillArcChargeComp()
        }
        else if (rangeType == BehaviorRangeType.SELF_CIRCLE) {
            return new SkillEllipseChargeComp()
        }
        else if (rangeType == BehaviorRangeType.TARGET_CIRCLE) {
            return new SkillEllipseChargeComp()
        }
        else if (rangeType == BehaviorRangeType.SELF_RECTANGLE) {
            return new SkillRectChargeComp()
        }
        else if (rangeType == BehaviorRangeType.SELF_RECTANGLE_ANGEL) {
            return new SkillAngleRectChargeComp()
        }

        return null
    }

    protected crateChargeCompUiHandlerByChargedId(behavior: SkillBehavior, parm: { w: number, h: number, a: number, r: number, fixAngle: number, atkPoint?: number, pos?: Vec2 }, self: boolean): void {
        let effectParam: { behavior: string, chargedId: string, arrow: number } = behavior.effectParam;
        let skillChargeComp: SkillChargeComp = null;
        if (parm?.w && parm?.h)
            skillChargeComp = this.crateChargeCompUiHandler(BehaviorRangeType.SELF_RECTANGLE)
        else if (parm.a) {
            skillChargeComp = this.crateChargeCompUiHandler(BehaviorRangeType.SELF_ARC)
        }
        else if (parm.r) {
            if (self) {
                skillChargeComp = this.crateChargeCompUiHandler(BehaviorRangeType.SELF_CIRCLE)
            }
            else {
                skillChargeComp = this.crateChargeCompUiHandler(BehaviorRangeType.TARGET_CIRCLE)
            }
        }

        if (skillChargeComp) {
            if (parm.pos) {
                skillChargeComp.setData(behavior, parm.pos, effectParam.arrow == 1, parm)
            }
            else
                skillChargeComp.setData(behavior, (!self && behavior.skillTarget) ? behavior.skillTarget.pos : (parm.atkPoint ? this.unitData.atkPoint as Vec2 : this.pos), effectParam.arrow == 1, parm)
            this.skillChargeComps.push(skillChargeComp)
        }
    }

    /***更新蓄力动作 */
    protected updateChargedHandler(): void {
        super.updateChargedHandler()
        if (this.skillChargeComps) {
            let rate = (this.chargedMax - this.unitData.charged) / this.chargedMax;//当前进度
            for (let i = 0; i < this.skillChargeComps.length; i++) {
                this.skillChargeComps[i].update(rate);
            }
        }
    }

    public endCharge(): void {
        super.endCharge();
        //结束蓄力
        this.disposeChargeComp()
    }

    /***攻击完成 */
    protected attackActionComplete(isForce: boolean, skillInfo: SkillData, isStopSkillEffect: boolean = true): void {
        if (this.unitData) {
            this.disposeChargeComp()
        }
        super.attackActionComplete(isForce, skillInfo, isStopSkillEffect)
    }

    protected disposeChargeComp(): void {
        if (this.skillChargeComps) {
            for (let i = 0; i < this.skillChargeComps.length; i++) {
                this.skillChargeComps[i].dispose()
            }
            this.skillChargeComps.length = 0;
        }
    }

    protected onDie(damageVo?: DamageVo) {
        super.onDie(damageVo)
        this.disposeChargeComp()
    }

    public onRebirth(): void {
        this.visible = true
        this.node.fadeIn(1000)
        if (this.dieActionTimer1)
            GameTimer.ins().clearByKey(this.dieActionTimer1)
    }

    /**销毁 */
    dispose() {
        this.disposeChargeComp()
        super.dispose();
        // PoolManager.recovery(this);
    }

    onRecovery(): void {
        this.unitData = null;
    }

    poolInit(): void {
        this.isDisposed = false;
        this.readyToDispose = false;
    }
}