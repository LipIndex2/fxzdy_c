import { TableManager } from "../../../../core/table/TableManager";
import { BattleLogic } from "../BattleLogic";
import { BattleUtils } from "../BattleUtils";
import { FightTimeCheck } from "../FightTimeCheck";
import { AttrEnum } from "../attribute/AttrEnum";
import BattleConstantConfig from "../config/BattleConstantConfig";
import { BattleUnit } from "../unit/battle/BattleUnit";
import { FightSkillInfo } from "./FightSkillInfo";
import { SkillSubType } from "./SkillEnum";

export class BaseSkillData extends FightTimeCheck {

    /***技能组 */
    public group: number = 0;
    public level: number = 0;
    /**技能顺序 */
    public skillIndex: number;
    /**前置CD帧数 */
    protected _preCD = 0;
    /**普通CD帧数 */
    protected _cd = 0;
    /**前置CD帧数 */
    protected _maxPreCD = 0;
    /**普通CD帧数 */
    protected _maxCd = 0;
    /**技能Id */
    public skillId: string;
    /**技能拥有者 */
    protected _owner: BattleUnit;

    protected _cfg: table.battle.SkillConfig | table.battle.PassivitySkillConfig | table.captain.CaptainSkillConfig | table.battle.CollectionSkillConfig;

    protected _behaviors: { behaviorId: string, delay: number }[];

    public fightSkillInfo: FightSkillInfo;
    /***是否触发了第一个行为 */
    public isBeginBehavior: boolean = false;
    public battleLogic: BattleLogic;

    public init(owner: BattleUnit, skillId: string, battleLogic?: BattleLogic) {
        this._owner = owner;
        this.battleLogic = owner ? owner.battleLogic : battleLogic;
        this.skillId = skillId;
        this.initConfig();
        if (this._cfg) {
            this._maxPreCD = BattleUtils.getFrameByTime(this._cfg.precd || 0);//重置CD
            this._maxCd = BattleUtils.getFrameByTime(this._cfg.cd || 0);//重置CD
        }
    }

    public get owner(): BattleUnit {
        return this._owner
    }

    /***
     * *受击时的仇恨类型
     * 0是谁打我，我打谁
     * 1是谁打我，我都不理
     * 2是谁打我，我索敌他附近最近的单位
     *  */
    public getNotHatred(): number {
        return 0
    }

    protected initConfig(): void {
    }

    public get name(): string {
        return ""
    }

    /**设置执行刷新CD */
    public refreshCD() {
    }

    public get cfg() {
        return this._cfg;
    }

    public getSubType(): SkillSubType {
        return 0;
    }

    /**技能行为时序 */
    public get behaviorsTiming() {
        if (!this._behaviors) {
            this._behaviors = [];
            for (let i = 0; i < 10; i++) {
                let behavior = this._cfg["behavior_" + i];
                if (!behavior) {
                    break;
                }
                this._behaviors.push(behavior);
            }
        }
        return this._behaviors;
    }

    /***移除该被动下的所有addbuff行为 */
    public removeAllBehaviorBuff(): void {
        let behaviorTimings = this.behaviorsTiming;
        for (let i = 0; i < behaviorTimings.length; i++) {
            let cfg = TableManager.getDataById(table.battle.BehaviorConfig, behaviorTimings[i].behaviorId)
            if (cfg) {
                if (cfg.effectType == "addBuff") {
                    let buffId = (cfg.effectParam as { buffId: number }).buffId;
                    let buffGroupCfg = TableManager.getDataById(table.battle.BuffGroupConfig, buffId)
                    if (buffGroupCfg && buffGroupCfg.buff) {
                        for (let j = 0; j < buffGroupCfg.buff.length; j++) {
                            let buff = this.owner.attr.getBuffById(buffGroupCfg.buff[j])
                            if (buff)
                                buff.isReadyToRemove = true;
                        }
                    }
                }
                else if (cfg.effectType == "addPassivity") {
                    let flag = (cfg.effectParam as { flag: string }).flag;
                    this.owner.attr.removePassiveSkillFlag(flag)
                }
                else if (cfg.effectType == "pushPassivity") {
                    let skill = (cfg.effectParam as { skill: string }).skill;
                    this.owner.attr.removePassiveSkill(skill)
                }
            }
        }
    }

    public resCd(): void {
        let cdr = 0
        if (this._maxCd > 0) {
            let addCdr = this.battleLogic.buffMgr.getUpdateCdPercent(this.owner, this.skillIndex)
            cdr = (this._owner.getAttrValue(AttrEnum.CDR) + addCdr) / BattleConstantConfig.getRandBase;
        }
        this._cd = Math.ceil(this._maxCd / (1 + cdr));//重置CD
    }

    public resPreCd(): void {
        this.setPreCd(this._maxPreCD)//重置CD
    }

    protected savePreCD: number = 0;
    public setPreCd(maxCd: number): void {
        let cdr = 0
        if (maxCd > 0) {
            let addCdr = this.battleLogic.buffMgr.getUpdatePreCD(this.owner, this.skillIndex)
            cdr += addCdr;
        }
        this._preCD = Math.max(0, maxCd - cdr)
        if (this.savePreCD != 0) {
            this._preCD += this.savePreCD;
        }
    }

    public clearAllCd(): void {
        this._cd = this._preCD = 0;
    }

    public isActive() {
        if (!this._cd && !this._preCD) {
            return true
        }
        return false
    }

    /**当前CD，返回的是帧 */
    public get cd(): number {
        return this._cd;
    }

    /**当前CD，返回的是帧 */
    public set cd(v: number) {
        this._cd = v
    }

    public updateMaxCd(cd: number): void {
        this._maxCd = BattleUtils.getFrameByTime(cd);
        if (this._cd > this._maxCd) {
            this._cd = this._maxCd;
        }
    }

    // 剩余 cd 毫秒
    public get cdTimeMs(): number {
        return BattleUtils.getTimeByFrame(this._cd);
    }

    /**最大CD，返回的是帧 */
    public get cdMax(): number {
        return this._maxCd;
    }

    // 最大 cd 毫秒
    public get cdMaxTimeMs(): number {
        return BattleUtils.getTimeByFrame(this._maxCd);
    }

    // 剩余 前置cd 毫秒
    public get preCdTimeMs(): number {
        return BattleUtils.getTimeByFrame(this._preCD);
    }

    // 最大 前置cd 毫秒
    public get preCdMaxTimeMs(): number {
        return BattleUtils.getTimeByFrame(this._maxPreCD);
    }

    // 剩余总 cd 毫秒
    public get totalCdTimeMs(): number {
        const preCD1 = this._preCD;
        const cd1 = this._cd;
        return BattleUtils.getTimeByFrame(Math.max(cd1, preCD1));
    }

    // 剩余最大 cd 毫秒
    public get totalCdMaxTimeMs(): number {
        const maxCd1 = this._maxCd;
        const maxPreCD1 = this._maxPreCD;
        return BattleUtils.getTimeByFrame(Math.max(maxCd1, maxPreCD1));
    }


    /**前置CD，返回的是帧 */
    public get preCD(): number {
        return this._preCD;
    }

    public set preCD(c: number) {
        this._preCD = c;
    }

    /**最大前置CD，返回的是帧 */
    public get maxPreCD(): number {
        return this._maxPreCD;
    }

    /**
     * 获取英雄配置 id
     */
    public getHeroConfigId(): number {
        return this._owner.attr.getHeroConfigId();
    }

    /**触发 */
    protected triggerHandler(): void {
        if (this.battleLogic.isInBattle() && this._preCD > 0)
            this._preCD--;

        if (this._cd > 0)
            this._cd--;
    }

    public destoryTimeCheck(): void {
    }
}