import { DEBUG } from "cc/env";
import G from "../../../../core/comm/G";
import { PoolManager } from "../../../../core/pool/PoolManager";
import { MathUtils } from "../../../../core/utils/MathUtils";
import { Attribute } from "../../../modules/attr/AttrEnum";
import { BattleDebugManager } from "../BattleDebugManager";
import { BattleLogic } from "../BattleLogic";
import { BattleUtils } from "../BattleUtils";
import BattleConstantConfig from "../config/BattleConstantConfig";
import { FightTimeCheck } from "../FightTimeCheck";
import { BattleUnit } from "../unit/battle/BattleUnit";
import { ICaster } from "./ICaster";
import { PassivitySkillData } from "./PassivitySkillData";
import { SkillBehavior } from "./SkillBehavior";
import { SkillBuffGroup } from "./SkillBuffGroup";
import { BuffEffectPos, BuffGroupFlagType, BuffType, LeaderSkillTriggerType, PassivitySkillType } from "./SkillEnum";
import { PassivitySkillUtils } from "./PassivitySkillUtils";
import UrlUtils from "db://assets/scripts/core/utils/UrlUtils";

export class SkillBuff extends FightTimeCheck {

    /***释放者数据 */
    public caster: ICaster;
    /**配置 */
    public cfg: table.battle.BuffConfig;
    /**开始时间 */
    // public startTime: number;
    /**结束时间 */
    // public endTime?: number;
    /**生效次数 */
    public count?: number;
    /**施法者uid */
    public casterUid?: number;
    /***创建BUFF时双方的距离 */
    public distance: number = 0;

    /**buff嵌套层数（防止buff重复嵌套）*/
    public nestedTimes = 0;

    /**施法者施法时的攻击力*/
    public casterAtk: number;

    /***当前BUFF层数 */
    public layer: number = 0
    /***配置层数 */
    public cfgLayer: number = 0;
    /***BUFF效果参数1 */
    public effectParm1: any;
    /***BUFF效果参数2 */
    public effectParm2: any;
    /***是否脱战不清除BUFF */
    public notExitBattleOutBuff: boolean = false

    //--------------------
    /***循环帧数 */
    public timeLoop: number = 0;
    /***每次触发的帧数 */
    public trigger: number = 0;
    /***持续时间 */
    public maxTime: number = 0;
    /***依附的目标*/
    public target: BattleUnit;
    /***所属Buff组别 */
    private _buffGroupUid: number;
    public skillBuffGroup: SkillBuffGroup;
    /***所属技能行为 */
    private _skillBehavior: SkillBehavior;
    /***是否之前就已经满层 */
    public isLastMax: boolean = false
    /***当前处理逻辑 */
    public battleLogic: BattleLogic;

    /***增加或减少的额外时间 */
    private addTimeMax: number = 0;
    /***非英雄产生的BUFF */
    public notHero: boolean = false
    /***是否包含死亡单位 */
    public includeDie: boolean = false

    init(cfg: table.battle.BuffConfig, timeLimit: number, battleLogic: BattleLogic) {
        // let now = TimeManager.battleNow;
        this.cfg = cfg;
        this.effectParm1 = cfg.effectParam;
        this.effectParm2 = cfg.effectParam2
        this.battleLogic = battleLogic;
        // this.startTime = now;

        if (timeLimit) {
            this.maxTime = BattleUtils.getFrameByTime(timeLimit)
        }

        if (cfg.interval) {
            this.trigger = BattleUtils.getFrameByTime(cfg.interval)
        }

        if (cfg.countLimit) {
            this.count = cfg.countLimit;
        }
        this.notExitBattleOutBuff = cfg.notExitBattleOutBuff == 1;
    }

    public setData(data: any): void {

    }

    public setAddTimeMax(addTimeMax: number): void {
        this.addTimeMax = addTimeMax
    }

    public get totalMaxTime(): number {
        if (this.maxTime <= 0)
            return this.maxTime;
        return Math.max(this.maxTime + this.addTimeMax, 1)
    }

    public setTarget(caster: ICaster, target: BattleUnit): void {
        this.caster = caster.caster ? caster.caster : caster;
        this.target = target;
        let fighter = this.battleLogic.getBatteUintByUid(caster.casterUid)
        if (fighter && target instanceof BattleUnit) {
            this.distance = MathUtils.distance(fighter.pos, target.pos)
            if (this.skillBuffGroup.cfg.flag == BuffGroupFlagType.ANuBiSi) {
                let flagParm: { scale: number } = this.skillBuffGroup.cfg.flagParm
                let scale = Math.max(0.1, 1 - flagParm.scale / BattleConstantConfig.getRandBase * this.layer)
                this.target.attr.setSizeScale(scale)
                this.target?.showUnit()?.fadeScale(scale)
            }
        }
    }

    public get skillBehavior(): SkillBehavior {
        return this._skillBehavior;
    }
    public set skillBehavior(value: SkillBehavior) {
        this._skillBehavior = value;
        if (value && value.skill instanceof PassivitySkillData && value.skill.condition == PassivitySkillType.ConType_1) {
            this.notExitBattleOutBuff = true;//被动1带来的BUFF脱战不清楚
        }
    }

    public get id(): string {
        return this.cfg.id;
    }

    get conditionType() {
        return this.cfg.conditionType;
    }

    get effectType() {
        return this.cfg.effectType;
    }

    public get buffGroupUid(): number {
        return this._buffGroupUid;
    }

    public set buffGroupUid(value: number) {
        this._buffGroupUid = value;
        this.skillBuffGroup = this.battleLogic.buffMgr.getBuffGroupByGroupUid(this._buffGroupUid);
    }

    public setSkillBuffGroup(skillBuffGroup: SkillBuffGroup) {
        this._buffGroupUid = skillBuffGroup.uid;
        this.skillBuffGroup = skillBuffGroup
    }

    /**检查BUFF是否能被触发，要看对应BUFF有无接入，不一定有 */
    public checkBuffCanActive(): boolean {
        if (this.skillBehavior && this.skillBehavior.skill && this.skillBehavior.skill.fightSkillInfo) {
            return this.skillBehavior.skill.fightSkillInfo.checkBuffCanActive(this)
        }
        return true;
    }

    active() {
        this.skillBehavior?.skill?.fightSkillInfo?.buffAfter(this)
        if (!this.isAlive())
            return

        if (this.skillBuffGroup.cfg.animPosType == BuffEffectPos.OnceForAct || this.skillBuffGroup.cfg.animPosType2 == BuffEffectPos.OnceForAct)
            this.target.addBuffEff(this.skillBuffGroup)

        if (this.count > 0) {
            this.count--;
            if (this.count <= 0) {
                this.isReadyToRemove = true;
            }
        }
    }

    public resData(): void {
        this.isReadyToRemove = false;
        this.time = 0;
        if (this.cfg.countLimit) {
            this.count = this.cfg.countLimit;
        }
    }

    public isAlive(): boolean {
        return !this.isReadyToRemove
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

    /**下一帧时间 */
    public nextFrame(): void {
        if (this._isReadyToRemove)
            return;

        this.index++;
        if (this.index >= this.maxIndex) {
            this.index = 0;

            this.time++;
            this.triggerHandler()
            this.nestedTimes = 0;
            if (this.totalMaxTime && this.time >= this.totalMaxTime) {
                this.completeHandler(true);
                //移除
                this._isReadyToRemove = true;
            }
        }
    }

    /**触发 */
    protected triggerHandler(): void {
        this.timeLoop++;
        if (this.trigger != 0 && this.timeLoop >= this.trigger) {
            //执行BUFF
            this.actionBuffEffect();
            this.timeLoop = 0;
        }
    }

    /***结束后的回调 */
    protected completeHandler(timeOut: boolean = false): void {
        this.remove();
        super.completeHandler()
    }

    public actionBuffEffect(): void {
        if (this.target.isDeath && !this.includeDie)
            return;

        this.skillBehavior?.skill?.fightSkillInfo?.buffBeforce(this)
        this.buffHandler();
        this.checkMissileNum();
        this.active()
    }

    /***检查子弹数 */
    public checkMissileNum(): void {
        if (this.cfg.missileNum) {
            PassivitySkillUtils.checkLeaderSkillCon(LeaderSkillTriggerType.Bullet, this.caster.teamId, this.caster.caster, this.caster.caster, this.cfg.missileNum);
        }
    }

    public onAddBuff(): void {

    }

    /***清空BUFFCD */
    public clearBuffTime(): void {
        this.time = 0;
    }

    public addTime(frame: number): void {
        this.maxTime += frame;
    }

    /***加快使用时间 */
    public useTime(frame: number): void {
        for (let i = 0; i < frame; i++) {
            if (this._isReadyToRemove)
                return;
            this.nextFrame()
        }
    }

    protected buffHandler(): void {
        let target = this.target
        if (!target.attr.isDeath() || this.includeDie) {
            if (this.effectType == BuffType.PreCd) {
                //减少前置冷却时间
                let effectParam: { cd: number, skillIndex: number, skillBelong: string } = this.effectParm1;
                if (effectParam?.skillIndex != null)
                    target.attr.updateMaxPreCD(effectParam.skillIndex, +effectParam.cd)
                else if (effectParam?.skillBelong != null)
                    target.attr.updateMaxPreCDById(effectParam.skillBelong, +effectParam.cd)
            }
            else if (this.effectType == BuffType.PreCd2) {
                //减少前置冷却时间
                let effectParam: { cd: number, skillIndex: number, skillBelong: string, isAddMax: number } = this.effectParm1;
                if (effectParam?.skillIndex != null)
                    target.attr.updatePreCD(effectParam.skillIndex, +effectParam.cd, effectParam.isAddMax == 1)
                else if (effectParam?.skillBelong != null)
                    target.attr.updatePreCDById(effectParam.skillBelong, +effectParam.cd, effectParam.isAddMax == 1)
            }
            else if (this.effectType == BuffType.PreCd3) {
                //减少前置冷却时间
                let effectParam: { cd: number, skillIndex: number, skillBelong: string, isAddMax: number } = this.effectParm1;
                if (effectParam?.skillIndex != null)
                    target.attr.updatePreCDBySave(effectParam.skillIndex, +effectParam.cd)
            }
            else if (this.effectType == BuffType.UpdateCdMax) {
                //减少普通CD的最大冷却时间
                let effectParam: { cd: number, skillIndex: number, skillBelong: string } = this.effectParm1;
                if (effectParam?.skillIndex != null)
                    target.attr.updateMaxCD(effectParam.skillIndex, +effectParam.cd)
                else if (effectParam?.skillBelong != null)
                    target.attr.updateMaxCDById(effectParam.skillBelong, +effectParam.cd)
            }
            else if (this.effectType == BuffType.UpdateCd) {
                //减少普通CD的当前时间
                let effectParam: { cd: number, skillIndex: number, skillBelong: string, randomSkill: number } = this.effectParm1;
                if (effectParam.randomSkill) {
                    //随机1个技能
                    let skills = target.attr.noNormalActiveSkills
                    let randomIndex = this.battleLogic.randomMgr.randomInt(0, skills.length - 1)
                    if (skills[randomIndex])
                        target.attr.updateCD(skills[randomIndex].skillIndex, +effectParam.cd);
                }
                else {
                    if (effectParam?.skillIndex != null)
                        target.attr.updateCD(effectParam.skillIndex, +effectParam.cd)
                    else if (effectParam?.skillBelong != null)
                        target.attr.updateCDById(effectParam.skillBelong, +effectParam.cd)
                }
            }
            else if (this.effectType == BuffType.Attr) {
                //这里主要计算最大生命值
                for (let attrKey in this.effectParm1) {
                    const config = G.TableManager.getDataById(table.battle.AttributeConfig, attrKey);
                    if (config && config.id == Attribute.HP_INC) {
                        let value = this.effectParm1[attrKey] * this.layer;
                        this.target.attr.addMaxHp(value, false);
                    }
                }
            }
            else if (this.effectType == BuffType.Abnormal) {
                //增加异常
                let effectParam: { type: number } = this.effectParm1;
                if (effectParam) {
                    this.target.setAbnormalStatus(effectParam.type)
                }
            }
            else if (this.effectType == BuffType.Halo) {
                //添加光环
                let effectParam: { halo: string } = this.effectParm1;
                if (effectParam) {
                    for (let i = 0; i < effectParam.halo.length; i++)
                        this.battleLogic.haloMgr.addHalo(effectParam.halo[i], this.caster, this.target, this.skillBehavior)
                }
            }
        }
    }

    public remove(): void {
        if (this.target) {
            if (this.effectType == BuffType.ResistAttr) {
                this.battleLogic.buffMgr.clearCacheAttrBuff(this.target)
            }
            else if (this.effectType == BuffType.ChangeAttr) {
                this.battleLogic.buffMgr.clearCacheAttrBuff(this.target)
            }
            else if (this.effectType == BuffType.AttrToAttr) {
                this.battleLogic.buffMgr.clearCacheAttrBuff(this.target)
            }
            else if (this.effectType == BuffType.ZhanYi) {
                this.battleLogic.buffMgr.clearCacheAttrBuff(this.target)
            }
            else if (this.effectType == BuffType.AttrValue) {
                this.battleLogic.buffMgr.clearCacheAttrBuff(this.target)
            }
            else if (this.effectType == BuffType.Attr) {
                this.battleLogic.buffMgr.clearCacheAttrBuff(this.target)
                //这里主要计算最大生命值
                for (let attrKey in this.effectParm1) {
                    const config = G.TableManager.getDataById(table.battle.AttributeConfig, attrKey);
                    if (config && config.id == Attribute.HP_INC) {
                        let value = this.effectParm1[attrKey] * this.layer;
                        this.target.attr.addMaxHp(value, true);
                    }
                }
            }
            else if (this.effectType == BuffType.PreCd) {
                let effectParam: { cd: number, skillIndex: number } = this.effectParm1;
                this.target.attr.updateMaxPreCD(effectParam.skillIndex, -1);
            }
            else if (this.effectType == BuffType.UpdateCdMax) {
                let effectParam: { cd: number, skillIndex: number } = this.effectParm1;
                this.target.attr.updateMaxCD(effectParam.skillIndex, -1);
            }
            else if (this.effectType == BuffType.Abnormal) {
                let effectParam: { type: number } = this.effectParm1;
                this.target.attr.clearAbnormalStatus(effectParam.type)
            }
        }

        let endParam: { remove: string, removePassiveSkill: string, removeHalo: string } = this.cfg.endParam
        if (endParam) {
            if (this.target) {
                //buff移除后的处理
                if (endParam.remove) {
                    if (!this?.skillBuffGroup?.isAddToRemove)
                        this.target.attr.removeGroupBuff(endParam.remove)
                }
                if (endParam.removePassiveSkill) {
                    this.target.attr.removePassiveSkill(endParam.removePassiveSkill)
                }
            }
            if (endParam.removeHalo) {
                this.battleLogic.haloMgr.removeHaloByIdAndHeroUid(this.caster.casterUid, endParam.removeHalo)
            }
        }

        this.battleLogic.buffMgr.removeUpdateBuffGroup(this);
        if (this.target) {
            this.target.attr.removeBuffStatueByEffectType(this.effectType)
            this.target.attr.removeBuffListById(this.id)
            this.target.removeBuff(this)

            if (DEBUG && UrlUtils.getURLQuery(UrlUtils.ShowBattleLog))
                console.log(`[${this.target.attr.name}] 移除BUFF ${this.cfg.name}(${this.cfg.id})`)
        }
    }

    /**提取需要克隆的字段 */
    public getCloneData(): any {
        return null;
    }

    /**设置需要克隆的字段 */
    public setCloneData(data: any): void {

    }

    dispose() {
        this.remove();
        this.target = null;
        PoolManager.recovery(this);
    }

    public destoryTimeCheck(): void {
    }
}