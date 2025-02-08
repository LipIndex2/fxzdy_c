import { TableManager } from "../../../../core/table/TableManager";
import { BattleUnit } from "../unit/battle/BattleUnit";
import { ExSkillData } from "./ExSkillData";

export class LeaderSkillData extends ExSkillData {
    protected _cfg: table.captain.CaptainSkillConfig;

    protected initConfig(): void {
        this._cfg = TableManager.getDataById(table.captain.CaptainSkillConfig, this.skillId);
    }

    /**执行技能 */
    public actionSkill(target: BattleUnit = null): void {
        super.actionSkill(target)
        this.battleLogic.useLeaderSkill(this)
    }
}