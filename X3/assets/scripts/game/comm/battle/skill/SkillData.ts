import { Vec2 } from "cc";
import { TableManager } from "../../../../core/table/TableManager";
import { BattleUtils } from "../BattleUtils";
import { BattleUnit } from "../unit/battle/BattleUnit";
import { SkillBehavior } from "./SkillBehavior";
import { AbnormalType, LeaderSkillTriggerType, PassivitySkillFlag, PassivitySkillType, SkillSubType, SkillType } from "./SkillEnum";
import { BaseSkillData } from "./BaseSkillData";
import G from "../../../../core/comm/G";
import { PassivitySkillUtils } from "./PassivitySkillUtils";
import { ITarget } from "./ITarget";
import { BattleLogic } from "../BattleLogic";
import { Utils } from "../../../../core/utils/Utils";
import RandomUtils from "../../../../core/utils/RandomUtils";

export class SkillData extends BaseSkillData {

    protected _cfg: table.battle.SkillConfig;
    /**正面攻击点 */
    public atkPoint: Vec2;
    /**背面攻击点 */
    public atkPointBack: Vec2;
    /***扩展技能的所属技能 */
    public ownerSkill: SkillData;

    /**技能拥有者 */
    get owner() {
        return this._owner;
    }

    public getNotHatred(): number {
        return this._cfg.notHatred
    }

    public init(owner: BattleUnit, skillId: string, battleLogic?: BattleLogic) {
        super.init(owner, skillId, battleLogic);
        if (!this._cfg)
            return

        if (this._cfg.atkPoint) {
            // this.atkPoint = new Vec2(+this._cfg.atkPoint.x, +this._cfg.atkPoint.y);
            this.atkPoint = new Vec2(+this._cfg.atkPoint.x, +this._cfg.atkPoint.y);
            if (this._cfg.atkPoint.bx != undefined && this._cfg.atkPoint.by != undefined)
                this.atkPointBack = new Vec2(+this._cfg.atkPoint.bx, +this._cfg.atkPoint.by);
            else
                this.atkPointBack = this.atkPoint;
        }
        this.resPreCd();
    }

    public get name(): string {
        if (this._cfg)
            return this._cfg.name
    }

    protected initConfig(): void {
        this._cfg = TableManager.getDataById(table.battle.SkillConfig, this.skillId);
        if (!this._cfg) {
            G.Logger.fight(`技能ID ${this.skillId} 找不到`)
        }
    }

    /**下一帧时间 */
    public nextFrame(): void {
        this.isCdCheck = false;
        this.index++;
        if (this.index >= this.maxIndex) {
            this.index = 0;
            this.triggerHandler()
        }
    }

    /**检索目标类型 */
    public get searchType() {
        return this._cfg.targetType;
    }

    public get cfg(): table.battle.SkillConfig {
        return this._cfg;
    }

    /**技能类型 */
    public get type(): SkillType {
        return this.cfg.type;
    }

    /**技能子类型 */
    public getSubType(): SkillSubType {
        return this.cfg.subType;
    }

    public getActionEffectData(): table.battle.SkillEffectConfig {
        let anim = this.getSkinAction(this.cfg.anim)
        if (this.cfg.animList?.length) {
            let index = RandomUtils.randomInt(0, this.cfg.animList.length)
            if (index) {
                anim = this.getSkinAction(this.cfg.animList[index - 1])
            }
        }
        let cfg = TableManager.getDataById(table.battle.SkillEffectConfig, anim);
        return cfg;
    }

    public getBackActionEffectData(): table.battle.SkillEffectConfig {
        if (!this.cfg.anim2)
            return null;
        let anim = this.getSkinAction(this.cfg.anim2)
        let cfg = TableManager.getDataById(table.battle.SkillEffectConfig, anim);
        return cfg;
    }

    /***获取皮肤动作 */
    private getSkinAction(anim: string): string {
        let skinId = this.owner.attr.skinId;
        let skinCfg = TableManager.getDataById(table.hero.HeroSkinConfig, skinId)
        if (skinCfg && skinCfg.changeActionData && skinCfg.changeActionData[anim]) {
            anim = skinCfg.changeActionData[anim]
        }
        return anim
    }

    /**动作名字 */
    public get animName(): string {
        return this.getActionEffectData().anim;
    }

    /**背面动作名字 */
    public get animBackName(): string {
        return this.getBackActionEffectData().anim;
    }

    /**施法距离 */
    public get castingRange() {
        let addDis = this.battleLogic.buffMgr.getAttackDis(this.owner, this.skillIndex)
        return (this._cfg.castingRange || 50) + addDis;
    }

    /**技能的动作帧数 */
    public get castTime() {
        let time = this.cfg.castTime
        return BattleUtils.getFrameByTime(time)
    }

    /***是否添加了引导时的霸体效果 */
    private isImmuneControl: boolean = false;
    /**执行技能 */
    public actionSkill(): SkillBehavior[] {
        this.isFirstAction = true;
        this.isBeginBehavior = false;
        this.fightSkillInfo.beginSkillHandler();
        this.isImmuneControl = false;
        let PSkill_ImmuneControlParm = this.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.PSkill_ImmuneControl)
        if (PSkill_ImmuneControlParm && this.cfg.type == SkillType.Guiding_Skills) {
            //全队英雄释放引导技能期间自身获得霸体效果
            this.owner.setAbnormalStatus(AbnormalType.ImmuneControl)
            this.isImmuneControl = true;
        }

        let behaviors: SkillBehavior[] = [];
        let behaviorTimings = this.behaviorsTiming;
        let skillGroupIndex = Utils.getGID()
        for (let i = 0; i < behaviorTimings.length; i++) {

            let trigger = behaviorTimings[i].delay || 0
            trigger = Math.ceil(trigger / this.owner.getSkillAtkSpeed(1, this))
            if (this.skillIndex == 0 || this.cfg.isByAtkSpeed || this.battleLogic.buffMgr.isSkillBeAttackSpeed(this.owner, this.skillIndex)) {
                // 根据攻速设置行为的执行间隔
                trigger = Math.ceil(trigger / this.owner.atkTimeScale)
            }

            const behavior = SkillBehavior.createBehavior(behaviorTimings[i].behaviorId, trigger, this);
            if (!behavior) {
                continue;
            }
            behavior.skillGroupIndex = skillGroupIndex;
            behavior.index = i;
            behaviors.push(behavior);
        }
        return behaviors;
    }

    /***是否首次触发 */
    private isFirstAction: boolean = true
    /***行为被触发 */
    public onSkillActionByBehavior(target: ITarget): void {
        if (this.isFirstAction) {
            PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_2, this.owner, target.unit, this);
            if (this.skillIndex != 0)
                PassivitySkillUtils.checkLeaderSkillCon(LeaderSkillTriggerType.SkillNum, this.owner.teamId, this.owner, this.owner, 1)
        }
        this.isFirstAction = false;
    }

    public skillCompleteHandler(isForce: boolean): void {
        if (this.isImmuneControl) {
            this.owner.clearAbnormalStatus(AbnormalType.ImmuneControl)
            this.isImmuneControl = false;
        }
        this.fightSkillInfo.skillCompleteHandler()
        if (!isForce || this.isBeginBehavior) {
            PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_9, this.owner, this.owner, this);
            PassivitySkillUtils.updatePassSkillFunction(this.owner, PassivitySkillType.ConType_23, "setSkillCompleteNum");
            PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_23, this.owner, this.owner, this);
        }
        this.isBeginBehavior = false;
    }

    public updateMaxPreCd(cd: number): void {
        if (cd == -1)
            this._maxPreCD = BattleUtils.getFrameByTime(this._cfg.precd || 0);
        else
            this._maxPreCD = BattleUtils.getFrameByTime(cd);

        if (this._preCD > this._maxPreCD) {
            this.setPreCd(this._maxPreCD)
        }
    }

    public updatePreCd(cd: number, isAddMax: boolean = false): void {
        this._preCD -= BattleUtils.getFrameByTime(cd);
        if (!isAddMax && this._preCD > this._maxPreCD) {
            this.setPreCd(this._maxPreCD)
        }
        else if (this._preCD < 0)
            this._preCD = 0;
    }

    public updatePreCDBySave(cd: number): void {
        this._preCD -= BattleUtils.getFrameByTime(cd);
        this.savePreCD -= BattleUtils.getFrameByTime(cd);
        if (this._preCD < 0)
            this._preCD = 0;
    }

    public updateMaxCd(cd: number): void {
        if (cd == -1)
            this._maxCd = BattleUtils.getFrameByTime(this._cfg.cd || 0);
        else
            this._maxCd = BattleUtils.getFrameByTime(cd);

        if (this._cd > this._maxCd) {
            this._cd = this._maxCd;
        }
    }

    public updateCd(cd: number): void {
        this._cd -= BattleUtils.getFrameByTime(cd);
        if (this._cd > this._maxCd) {
            this._cd = this._maxCd;
        }
        else if (this._cd < 0)
            this._cd = 0;
    }

    /***当前技能是否支持移动攻击 */
    public canMoveSkill(): boolean {
        return this.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.PMove_Attack_s01) || (this.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P3210_x101)?.skillIndex == this.skillIndex)
    }

    private isCdCheck: boolean = false;
    /**设置执行刷新CD */
    public refreshCD() {
        if (this.isCdCheck)
            return
        this.savePreCD = 0;
        this.isCdCheck = true;
        if (this.ownerSkill && !this.cfg.activeSkillNoRefreshCD) {
            this.isCdCheck = false;
            this.ownerSkill.refreshCD()
        }
        this.resCd();
    }
}