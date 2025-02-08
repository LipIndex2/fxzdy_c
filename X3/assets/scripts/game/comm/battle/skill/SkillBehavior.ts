import { PoolManager } from "../../../../core/pool/PoolManager";
import { TableManager } from "../../../../core/table/TableManager";
import { BattleUtils } from "../BattleUtils";
import { FightTimeCheck } from "../FightTimeCheck";
import { BaseSkillData } from "./BaseSkillData";
import { ICaster } from "./ICaster";
import { ITarget } from "./ITarget";
import { SkillData } from "./SkillData";
import { BattleUnit } from "../unit/battle/BattleUnit";
import { LeaderSkillData } from "./LeaderSkillData";
import { EffectLayer, SkillEffectPos } from "./SkillEnum";

export class SkillBehavior extends FightTimeCheck {
    /**
     * 创建行为
     */
    static createBehavior(behaviorId: string, delay: number = 0, skill?: BaseSkillData): SkillBehavior {
        let cfg = TableManager.getDataById(table.battle.BehaviorConfig, behaviorId);
        if (!cfg) {
            console.warn(`不存在的行为：${behaviorId}`);
            return;
        }

        let behavior = PoolManager.getItem(SkillBehavior);
        behavior.init(cfg, delay, skill);
        return behavior;
    }

    /***创建并触发1个行为 */
    static createBehaviorAndActionEffect(behaviorId: string, caster: ICaster, selectTarget: ITarget, skill?: BaseSkillData): SkillBehavior {
        let behavior = this.createBehavior(behaviorId, 0, skill)
        behavior.index = 0;
        behavior.setCaster(caster)
        if (selectTarget) {
            behavior.skillTarget = selectTarget;
            behavior.skillTargetUid = selectTarget.uid;
        }
        behavior.actionEffect();
        return behavior;
    }

    /***释放者 */
    public owner: ICaster;
    /***创建行为时的攻击力 */
    public atk: number = 0;
    /***创建行为时的属性 */
    protected _attrs: { [key: number]: number }
    /**技能目标对象单位id */
    public skillTargetUid: number;
    /**技能目标对象 */
    public skillTarget: ITarget;
    /***行为序列 */
    public index: number = 0;

    /**行为Id */
    public cfg: table.battle.BehaviorConfig;

    /**启动帧数 */
    public startTime: number;
    /***循环帧数 */
    public timeLoop: number = 0;
    /***每次触发的帧数 */
    public trigger: number = 0;
    /***持续时间 */
    public maxTime: number = 0;
    /***所属技能 */
    public skill: BaseSkillData;

    /***临时的属性加成 */
    private addAttrMap: { [key: string]: number }
    /***临时伤害系数加成 */
    public tempAddDamageValue: number = 0;
    /***替换的伤害系数 */
    public changeDamageValue: number = 0;
    /***扩展数据 */
    public exData: any
    /***行为选中的目标 */
    public selectUnits: BattleUnit[]
    /***技能的分组ID */
    public skillGroupIndex: number;

    public init(cfg: table.battle.BehaviorConfig, delay: number, skill?: BaseSkillData) {
        // let now = TimeManager.battleNow;
        // this.startTime = now + delay;
        this.cfg = cfg;
        this.startTime = BattleUtils.getFrameByTime(delay);
        this.maxTime = this.startTime || 0;
        this.skill = skill;
        // this.endTime = this.startTime + (cfg.time || 0);
    }

    public setCaster(owner: ICaster): void {
        this.owner = owner
        this.atk = owner.atk;
    }

    public get isOnTime() {
        return this.startTime == 0 || this.time >= this.startTime;
    }

    // /**是否执行完成 */
    public get isEnd() {
        return this.maxTime == 0 || this.time >= this.maxTime;
    }

    /**行为效果类型 */
    public get effectType() {
        return this.cfg.effectType;
    }

    /**行为效果参数 */
    public get effectParam() {
        return this.cfg.effectParam;
    }

    /***技能系数 */
    public get damageValue(): number {
        if (this.changeDamageValue)
            return this.changeDamageValue;

        let v = 10000;
        if (this.cfg.effectParam) {
            var param: { amount: number } = this.cfg.effectParam
            if (param)
                v = param.amount;
        }
        return v + this.tempAddDamageValue;
    }

    /**执行行为效果 */
    public actionEffect(isRefreshCd: boolean = true) {
        // BehaviorUtils.actionBehaviorEffect(this, this.owner);
        if (!(this.skill instanceof LeaderSkillData) && isRefreshCd)
            this.skill.refreshCD()

        if (this.skill instanceof SkillData)
            this.skill.onSkillActionByBehavior(this.skillTarget)
        this.skill.fightSkillInfo.beginBehaviorEffect(this, this.owner)
        this.skill.isBeginBehavior = true;
        this.isReadyToRemove = true;

        if (this.skill instanceof SkillData)
            this.skill.battleLogic.effectMgr.showSkillCD(this.owner as BattleUnit, this.skill)
    }

    private isFighterPosEffect: boolean = false;
    public animPosType: number;
    public animModelId: { up?: number[], low?: number[] }
    public showSkillEffect(target: BattleUnit): void {
        let modelId = this.animModelId ? this.animModelId : this.cfg.modelId;
        if (modelId) {

            let dir = 1;
            if (this.owner instanceof BattleUnit) {
                dir = this.owner.dirction;
            }

            let animPosType = this.animPosType ? this.animPosType : this.cfg.animPosType;

            if (animPosType == SkillEffectPos.Fighter_Pos) {
                if (this.isFighterPosEffect)
                    return
                //施法者自身位置的话，只会触发1次
                this.isFighterPosEffect = true;
                target = this.owner.caster as BattleUnit;
            }

            let upModel: number[] = (modelId as { up: number[], low: number[] }).up;
            if (upModel)
                for (let i = 0; i < upModel.length; i++) {
                    target.createFightEffect(+upModel[i], animPosType, target, EffectLayer.RoleLayer, false, dir, null, this.owner?.caster)
                }

            let lowModel: number[] = (modelId as { up: number[], low: number[] }).low;
            if (lowModel)
                for (let i = 0; i < lowModel.length; i++) {
                    target.createFightEffect(+lowModel[i], animPosType, target, EffectLayer.BgLayer, false, dir, null, this.owner?.caster)
                }
        }
    }

    /**触发 */
    protected triggerHandler(): void {
        if (this.time >= this.startTime) {
            //执行技能
            this.timeLoop = 0;
            this.actionEffect()
        }
    }

    /***添加临时属性加成，主要给这次技能给战斗公式那边使用 */
    public pushTempAttr(key: string, value: number): void {
        if (!this.addAttrMap)
            this.addAttrMap = {};

        if (!this.addAttrMap[key])
            this.addAttrMap[key] = 0;
        this.addAttrMap[key] += value;
    }

    public getTempAttrByKey(key: string): number {
        if (!this.addAttrMap)
            return 0;
        return this.addAttrMap[key] || 0;
    }

    public getTempAttr(): { [key: string]: number } {
        return this.addAttrMap
    }

    public destoryTimeCheck(): void {
    }
}