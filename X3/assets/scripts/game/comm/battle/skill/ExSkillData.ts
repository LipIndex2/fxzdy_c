import { Vec2, v2 } from "cc";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import { TableManager } from "../../../../core/table/TableManager";
import { MathUtils } from "../../../../core/utils/MathUtils";
import NotificationKey from "../../../event/NotificationKey";
import { AttrEnum } from "../attribute/AttrEnum";
import { BattleLogic } from "../BattleLogic";
import BattleConstantConfig from "../config/BattleConstantConfig";
import { WorldUnitTeam } from "../enum/BattleEnum";
import { BattleUnit } from "../unit/battle/BattleUnit";
import { BaseSkillData } from "./BaseSkillData";
import { LeaderSkillTriggerType } from "./SkillEnum";
import { BattleUtils } from "../BattleUtils";

export class ExSkillData extends BaseSkillData {
    public teamId: number
    protected _cfg: table.captain.CaptainSkillConfig | table.battle.CollectionSkillConfig;
    public isOnce: boolean = false;
    public selectTarget: BattleUnit

    public init(owner: BattleUnit, skillId: string, battleLogic?: BattleLogic) {
        super.init(owner, skillId, battleLogic);
        this.resPreCd();
    }

    public get cfg() {
        return this._cfg;
    }

    public get triggerType(): number {
        return this._cfg.triggerType;
    }

    protected initConfig(): void {
    }

    /**下一帧时间 */
    public nextFrame(): void {
        this.index++;
        if (this.index >= this.maxIndex) {
            this.index = 0;
            this.triggerHandler()
        }
    }

    /**触发 */
    protected triggerHandler(): void {
        if (!this.battleLogic.isInBattle())
            return;

        if (this._preCD > 0)
            this._preCD--;

        if (this._cd > 0)
            this._cd--;

        //非其他类型就是时间类型，才按CD自动触发
        if (!this._cfg.triggerType && this._preCD <= 0 && this._cd <= 0) {
            if (!this.isOnce || !this._cfg.once)
                this.actionSkill();
        }
    }

    /**执行技能 */
    public actionSkill(target: BattleUnit = null): void {
        this.selectTarget = target;
        this.isOnce = true;
        this.refreshCD();
    }

    public enterBattleState(): void {
        this.isOnce = false;
    }

    /**设置执行刷新CD */
    public refreshCD() {
        this.resCd();
        this.resPreCd();
    }

    public resCd(): void {
        this._cd = this._maxCd;//重置CD
        if (this.teamId == WorldUnitTeam.Self)
            FacadeManager.ins().emit(NotificationKey.BATTLE_LEADERSKILL_CD_UPDATE, this);
    }

    public resPreCd(): void {
        this.setPreCd(this._maxPreCD)//重置CD
        if (this.teamId == WorldUnitTeam.Self)
            FacadeManager.ins().emit(NotificationKey.BATTLE_LEADERSKILL_CD_UPDATE, this);
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

    /***进度0~1 */
    public progress(): number {
        if (this.isOnce && this._cfg.once)
            return 0;

        switch (this.triggerType) {
            case LeaderSkillTriggerType.Time:
                return 1 - this.totalCdTimeMs / this.totalCdMaxTimeMs;
            case LeaderSkillTriggerType.Bullet:
                //每射出N发子弹触发
                let triggerBulletParam: { num: number } = this.cfg.triggerParam;
                return this.missileNum / triggerBulletParam.num;
            case LeaderSkillTriggerType.SkillNum:
                //每射出N发子弹触发
                let triggerSkillNumParam: { num: number } = this.cfg.triggerParam;
                return this.skillNum / triggerSkillNumParam.num;
            case LeaderSkillTriggerType.Damage:
                //增加的伤害
                let triggerDamageParam: { amount: number } = this.cfg.triggerParam;
                let targetHurt = Math.ceil(this.battleLogic.getTeamInitAttrValue(this.teamId, AttrEnum.ATK) * triggerDamageParam.amount / BattleConstantConfig.getRandBase);
                return this.hurtNum / targetHurt;
            case LeaderSkillTriggerType.Move:
                let triggerMoveParam: { dis: number } = this.cfg.triggerParam;
                return this.addMoveDis / triggerMoveParam.dis;
        }

        return 0;
    }

    private lastMovePosMap: { [uid: number]: Vec2 } = {};
    private addMoveDis: number = 0;
    /***设置移动距离 */
    public setMoveDistance(uid: number, pos: Vec2): void {
        if (!this.battleLogic.isInBattle())
            return;

        if (!this.lastMovePosMap[uid]) {
            this.lastMovePosMap[uid] = v2(pos.x, pos.y);
        }
        this.addMoveDis += MathUtils.distance(this.lastMovePosMap[uid], pos);
        this.lastMovePosMap[uid].x = pos.x;
        this.lastMovePosMap[uid].y = pos.y;
    }

    /***检查触发条件 */
    public executeMoveDistance(dis: number): boolean {
        if (this.addMoveDis >= dis) {
            this.addMoveDis = 0;
            return true
        }
        return false
    }

    /***累计的子弹发射次数 */
    private missileNum: number = 0
    /*** 设置累计的子弹发射次数 */
    public setMissileNum(num: number): void {
        this.missileNum += num;
    }

    /***
     * 造成子弹发射次数，触发就清空之前的次数
     *  */
    public executeMissileNum(para: number): number {
        if (this.missileNum >= para) {
            let num = Math.floor(this.missileNum / para);
            this.missileNum = this.missileNum % para;
            return num
        }
        return 0
    }

    /***累计的造成的伤害 */
    private hurtNum: number = 0
    /*** 设置累计的造成的伤害 */
    public setHurtNum(num: number): void {
        this.hurtNum += num;
    }

    /***
    * 造成累计的造成的伤害，触发就清空之前的次数
    *  */
    public executeHurtNum(para: number): number {
        if (this.hurtNum >= para) {
            let num = Math.floor(this.hurtNum / para);
            this.hurtNum = this.hurtNum % para;
            return num
        }
        return 0
    }

    /***累计的技能使用次数 */
    private skillNum: number = 0
    /*** 设置累计的技能使用次数 */
    public setSkillNum(num: number): void {
        this.skillNum += num;
    }

    /***
     * 造成技能使用次数，触发就清空之前的次数
     *  */
    public executeSkillNum(para: number): number {
        if (this.skillNum >= para) {
            let num = Math.floor(this.skillNum / para);
            this.skillNum = this.skillNum % para;
            return num
        }
        return 0
    }
}