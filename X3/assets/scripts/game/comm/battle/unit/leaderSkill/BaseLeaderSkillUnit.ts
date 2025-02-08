import { Vec2 } from "cc";
import { IPool } from "../../../../../core/pool/IPoolInstance";
import { BattleUtils } from "../../BattleUtils";
import { ICaster } from "../../skill/ICaster";
import { BaseUnit } from "../BaseUnit";
import { v2 } from "cc";
import { LeaderSkillData } from "../../skill/LeaderSkillData";
import { BattleCommandType } from "../../BattleCommand";
import { BattleUnit } from "../battle/BattleUnit";
import { SkillBehavior } from "../../skill/SkillBehavior";
import { AttrEnum } from "../../attribute/AttrEnum";

export class BaseLeaderSkillUnit extends BaseUnit implements IPool, ICaster {

    public _cfg: table.captain.CaptainSkillConfig;
    /***所属队伍 */
    public teamId: number;
    /***目标队伍 */
    public targetTeamId: number

    public skill: LeaderSkillData;

    protected _isActive: boolean;

    /**移动向量 */
    protected _moveVec: Vec2 = v2();
    /**起始位置 */
    protected _startVec: Vec2 = v2();

    /**运行时间 */
    protected _runTime: number = 0;
    /**最大运行时间 */
    protected _maxTime: number = 0;

    get atkPoint() {
        return this._pos;
    }

    public get name(): string {
        return this._cfg.name
    }

    public get atk(): number {
        return this.battleLogic.getTeamInitAttrValue(this.teamId, AttrEnum.ATK)
    }

    init(data: table.captain.CaptainSkillConfig) {
        this._cfg = data;
        this._isActive = true;
        this._runTime = 0;
        this.skill = this.battleLogic.getLeaderSkillById(this._cfg.id + "")
        this._maxTime = BattleUtils.getFrameByTime(this._cfg.castTime);
    }

    initParam(...arg): void {

    }

    get casterUid() {
        return this._uid;
    }

    update(): boolean {
        this._runTime++;
        this.checkTrigger();
        return true
    }

    /**检测是否触发 */
    checkTrigger() {
        if (this._runTime >= this._maxTime) {
            this._isActive = false;
        }
    }

    get isActive(): boolean {
        return this._isActive;
    }

    /***是否存在场景中，false的话证明被移除了Uid */
    public inScene(): boolean {
        return true
    }

    public get caster(): BattleUnit {
        return null
    }

    dispose() {
        this.battleLogic.command.send(BattleCommandType.dispose, this.uid)
    }
}