import { TableManager } from "../../../core/table/TableManager";

/** 属性 */
export class AttrInfo {
    /***属性枚举 */
    public type: number;
    /***值 */
    public value: number = 0;
    public cfg: table.battle.AttributeConfig

    public constructor (type: number) {
        this.type = type;
        this.cfg = TableManager.getDataById(table.battle.AttributeConfig, type);
    }
}