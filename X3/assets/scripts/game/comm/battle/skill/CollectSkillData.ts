import { TableManager } from "../../../../core/table/TableManager";
import { BattleUnit } from "../unit/battle/BattleUnit";
import { ExSkillData } from "./ExSkillData";

export class CollectSkillData extends ExSkillData {
    protected _cfg: table.battle.CollectionSkillConfig;

    protected initConfig(): void {
        this._cfg = TableManager.getDataById(table.battle.CollectionSkillConfig, this.skillId);
    }

    /**执行技能 */
    public actionSkill(target: BattleUnit = null): void {
        super.actionSkill(target)
        this.battleLogic.useCollectSkill(this)
    }
}