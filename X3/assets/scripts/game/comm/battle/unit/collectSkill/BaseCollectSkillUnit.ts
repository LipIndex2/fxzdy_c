import { Vec2 } from "cc";
import { IPool } from "../../../../../core/pool/IPoolInstance";
import { BattleUtils } from "../../BattleUtils";
import { ICaster } from "../../skill/ICaster";
import { BaseUnit } from "../BaseUnit";
import { v2 } from "cc";
import { BattleCommandType } from "../../BattleCommand";
import { BattleUnit } from "../battle/BattleUnit";
import { CollectSkillData } from "../../skill/CollectSkillData";
import { SkillBehavior } from "../../skill/SkillBehavior";

export class BaseCollectSkillUnit extends BaseUnit implements IPool, ICaster {

    public _cfg: table.battle.CollectionSkillConfig;
    /***所属队伍 */
    public teamId: number;
    /***目标队伍 */
    public targetTeamId: number

    public skill: CollectSkillData;

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
        let attack = 0
        let units = this.battleLogic.unitProcessor.getUnitsByTeamId(this.teamId)
        for (let i = 0; i < units.length; i++) {
            if (units[i].isActive) {
                attack += units[i].atk;
            }
        }
        return attack
    }

    init(data: table.battle.CollectionSkillConfig) {
        this._cfg = data;
        this._isActive = true;
        this._runTime = 0;
        this.skill = this.battleLogic.getCollectSkillById(this._cfg.id + "")
        this._maxTime = BattleUtils.getFrameByTime(this._cfg.castTime);
    }

    initParam(): void {
        let team = this.battleLogic.getTeamByTeamId(this.teamId)
        this.setPosXY(team.pos.x, team.pos.y)
        this.actionBehavior();
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

    public actionBehavior(): void {
        let behaviorTimings = this.skill.behaviorsTiming;
        for (let i = 0; i < behaviorTimings.length; i++) {
            let trigger = behaviorTimings[i].delay || 0
            const behavior = SkillBehavior.createBehavior(behaviorTimings[i].behaviorId, trigger, this.skill);
            if (!behavior) {
                continue;
            }
            behavior.index = 0;
            behavior.setCaster(this)
            behavior.actionEffect()
        }
    }

    dispose() {
        this.battleLogic.command.send(BattleCommandType.dispose, this.uid)
    }
}