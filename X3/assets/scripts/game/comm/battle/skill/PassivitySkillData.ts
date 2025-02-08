import { Vec2 } from "cc";
import G from "../../../../core/comm/G";
import { TableManager } from "../../../../core/table/TableManager";
import { BattleUtils } from "../BattleUtils";
import BattleConstantConfig from "../config/BattleConstantConfig";
import { BattleUnit } from "../unit/battle/BattleUnit";
import { BaseSkillData } from "./BaseSkillData";
import { PassivitySkillUtils } from "./PassivitySkillUtils";
import { SkillBehavior } from "./SkillBehavior";
import { PassivitySkillType, SkillSubType } from "./SkillEnum";
import { MathUtils } from "../../../../core/utils/MathUtils";
import { v2 } from "cc";
import { FightType } from "../enum/FightType";
import { BattleLogic } from "../BattleLogic";

export class PassivitySkillData extends BaseSkillData {

    protected _cfg: table.battle.PassivitySkillConfig;
    /**技能拥有者 */
    protected _owner: BattleUnit;

    /**条件类型 */
    public condition: number = 0;
    /***是否只触发1次 */
    public onceTrigger: boolean = false;
    /***间隔时间 */
    protected interval: number = 0;

    /***通过主动创建的被动的源主动技能 */
    public ownerSkillData?: BaseSkillData;
    /***是否额外产生的技能 */
    public isOhterSkill: boolean = false;

    public get cfg(): table.battle.PassivitySkillConfig {
        return this._cfg;
    }

    public init(owner: BattleUnit, skillId: string, battleLogic?: BattleLogic) {
        super.init(owner, skillId, battleLogic)
        if (this.cfg) {
            this.condition = this.cfg.condition;
            if (this.cfg.condition == PassivitySkillType.ConType_14 || this.cfg.condition == PassivitySkillType.ConType_29 || this.cfg.condition == PassivitySkillType.ConType_30) {
                if (this._maxCd == 0)
                    this._maxCd = 1;
            }
            this.resPreCd();
            this.resInterval()
        }
    }

    protected resInterval(): void {
        this.interval = BattleUtils.getFrameByTime(this.cfg.interval || 0);
    }

    protected initConfig(): void {
        this._cfg = TableManager.getDataById(table.battle.PassivitySkillConfig, this.skillId);
        if (!this._cfg) {
            G.Logger.fight(`被动技能ID ${this.skillId} 找不到`)
        }
    }

    public get name(): string {
        if (this._cfg)
            return this._cfg.name
    }

    /**技能子类型 */
    public getSubType(): SkillSubType {
        return this.cfg.subType;
    }

    public getNotHatred(): number {
        return this._cfg.notHatred
    }

    /**执行技能 */
    public actionSkill(): SkillBehavior[] {
        if (this.onceTrigger)
            return

        let behaviors: SkillBehavior[] = [];
        let behaviorTimings = this.behaviorsTiming;
        for (let i = 0; i < behaviorTimings.length; i++) {

            let trigger = behaviorTimings[i].delay || 0
            const behavior = SkillBehavior.createBehavior(behaviorTimings[i].behaviorId, trigger, this);
            if (!behavior) {
                continue;
            }
            behavior.index = 0;
            behaviors.push(behavior);
        }
        return behaviors;
    }

    /**设置执行刷新CD */
    public refreshCD() {
        this.resCd();
    }

    /**下一帧时间 */
    public nextFrame(): void {
        if (this._isReadyToRemove)
            return;

        this.index++;
        if (this.index >= this.maxIndex) {
            this.index = 0;
            this.triggerHandler()
        }
    }

    protected triggerHandler(): void {
        super.triggerHandler();
        if (this.interval == 0) {
            this.resInterval()
            if (this.condition == PassivitySkillType.ConType_6 || this.condition == PassivitySkillType.ConType_27 || this.condition == PassivitySkillType.ConType_28) {
                //时间触发的类型，CD为0后，马上触发
                if (this._cd == 0 && this.battleLogic.isInBattle()) {
                    PassivitySkillUtils.checkPassSkillCon(this.condition, this._owner, this._owner)
                }
            }
        }
        else {
            this.interval--;
        }
    }

    private lastMovePos: Vec2;
    private addMoveDis: number = 0;
    /***设置移动距离 */
    public setMoveDistance(pos: Vec2): void {
        if (this.cfg.conditionValue2 && this.cfg.conditionValue2[0] == 1 && !this.battleLogic.isInBattle())
            return

        if (!this.lastMovePos)
            this.lastMovePos = v2(pos.x, pos.y)
        this.addMoveDis += MathUtils.distance(this.lastMovePos, pos)
        this.lastMovePos.x = pos.x;
        this.lastMovePos.y = pos.y;
    }

    /***检查触发条件 */
    public executeMoveDistance(dis: number): boolean {
        if (this.addMoveDis >= dis) {
            this.addMoveDis = 0;
            return true
        }
        return false
    }


    private addTime: number = 0;
    private lastFrame: number = 0;
    private beginTime: number = 0;
    /***设置移动时间 */
    public setMoveTime(nowFrame: number): void {
        if (nowFrame == 0) {
            this.addTime = 0;
            this.lastFrame = 0;
            this.beginTime = 0;
            return;
        }

        if (this.lastFrame > 0) {
            let addTime = BattleUtils.getTimeByFrame(nowFrame - this.lastFrame)
            if (addTime < 0)
                addTime = 0;
            this.addTime += addTime;
            this.beginTime += addTime;
        }
        this.lastFrame = nowFrame
    }

    /***检查触发条件 */
    public executeMoveTime(time: number, maxTime: number): boolean {
        if (this.beginTime >= maxTime && this.addTime >= time) {
            this.addTime = 0;
            return true
        }
        return false
    }

    /***格挡次数 */
    private blockNum: number = 0
    /***设置格挡次数  */
    public setBlockNum(): void {
        this.blockNum++;
    }

    /***
   * 格挡次数
   *  */
    public executeBlockNum(para: number): boolean {
        if (this.blockNum >= para) {
            this.blockNum = 0;
            return true
        }
        return false
    }



    /***技能释放结束的次数 */
    private skillCompleteNum: number = 0
    /***设置累计的受到的伤害  */
    public setSkillCompleteNum(): void {
        this.skillCompleteNum++;
    }

    /***
   * 技能释放结束的次数
   *  */
    public executeSkillCompleteNum(para: number): boolean {
        if (this.skillCompleteNum >= para) {
            this.skillCompleteNum = 0;
            return true
        }
        return false
    }


    /***累计的受到的伤害 */
    private totalHurt: number = 0
    /***设置累计的受到的伤害  */
    public setTotalHurt(num: number): void {
        this.totalHurt += num;
    }

    /***
    * 累计的受到的伤害，不清空
    *  */
    public executeTotalHurt(para: number, isClean: number): boolean {
        if ((this.totalHurt / this.owner.attr.maxHp * BattleConstantConfig.getRandBase) >= para) {
            if (isClean) {
                this.totalHurt = 0;
            }
            return true
        }
        return false
    }


    /***累计的子弹发射次数 */
    private missileNum: number = 0
    /*** 设置累计的子弹发射次数 */
    public setMissileNum(num: number, missileId: string = null): void {
        if (this.cfg.conditionValue2?.indexOf(missileId) != -1)
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

    /***击杀次数 */
    private killNum: number = 0
    /***设置击杀数  */
    public setKillNum(): void {
        this.killNum++;
    }

    /***
   * 击杀次数
   *  */
    public executeSkillNum(isClear: number, para: number): boolean {
        if (this.killNum >= para) {
            if (isClear)
                this.killNum = 0;
            return true
        }
        return false
    }

    /***助攻次数 */
    private assistNum: number = 0
    /***设置助攻数  */
    public setAssistNum(): void {
        this.assistNum++;
    }

    /***
   * 助攻次数
   *  */
    public executeAssistNum(isClear: number, para: number): boolean {
        if (this.assistNum >= para) {
            if (isClear)
                this.assistNum = 0;
            return true
        }
        return false
    }
}