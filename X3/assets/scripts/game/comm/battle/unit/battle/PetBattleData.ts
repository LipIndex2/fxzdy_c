import { TableManager } from "../../../../../core/table/TableManager";
import { BattleLogic } from "../../BattleLogic";
import { BattleUtils } from "../../BattleUtils";
import { FightTimeCheck } from "../../FightTimeCheck";
import { ICreatePetData } from "../../interface/BattleInterface";

/***宠物的出战数据 */
export class PetBattleData extends FightTimeCheck implements ICreatePetData {
    public cfg: table.pet.PetConfig;
    public teamId: number;
    private _petId: string;
    /***有值的话，属性全部使用这个 */
    public attr?: { [key: number]: number }
    public battleLogic: BattleLogic;

    public skills: string[]

    /**前置CD帧数 */
    protected _preCD = 0;
    /**普通CD帧数 */
    protected _cd = 0;
    /**前置CD帧数 */
    protected _maxPreCD = 0;
    /**普通CD帧数 */
    protected _maxCd = 0;
    /***服务端的UID，大地图的话是无的 */
    public uid?: number

    public constructor () {
        super()
    }

    public get petId(): string {
        return this._petId;
    }
    public set petId(value: string) {
        this._petId = value;
        this.cfg = TableManager.getDataById(table.pet.PetConfig, value)
        if (this.cfg) {
            this._maxPreCD = BattleUtils.getFrameByTime(this.cfg.precd || 0);//重置CD
            this._maxCd = BattleUtils.getFrameByTime(this.cfg.cd || 0);//重置CD
        }
        this.resPreCd()
        this.maxTime = -1;
    }

    public initSkills(skills: string[]): void {
        this.skills = skills;
    }

    /**触发 */
    protected triggerHandler(): void {
        if (this.battleLogic.isInBattle() && this._preCD > 0)
            this._preCD--;

        if (this._cd > 0)
            this._cd--;

        if (this._preCD == 0 && this._cd == 0) {
            this.actionSkill()
        }
    }

    /**执行技能 */
    public actionSkill(): void {
        this.battleLogic.usePet(this)
        this._cd = -1;
        // this.refreshCD();
    }

    public resCd(): void {
        if (this._maxCd)
            this._cd = this._maxCd;
    }

    public resPreCd(): void {
        this._preCD = this._maxPreCD;
    }

    /**设置执行刷新CD */
    public refreshCD() {
        this.resCd()
    }
}