
import FacadeManager from "../../../core/mvc/FacadeManager";
import NotificationKey from "../../event/NotificationKey";
import { IBattleTeamHpChangeVo } from "../../modules/battle/vo/IBattleTeamHpChangeVo";
import { BattleLogicManager } from "../battle/BattleLogicManager";
import { HpShowType } from "../battle/config/BattleSetting";
import { WorldUnitTeam } from "../battle/enum/BattleEnum";
import { FightType } from "../battle/enum/FightType";
import HpStateUtils from "../battleEx/HpStateUtils";

export default class HpMonitor {
    protected _teamId: WorldUnitTeam;
    protected _hpShowType: HpShowType;
    protected fightType: FightType;

    private _maxHp: number;
    private _curHp: number;

    constructor (teamId: WorldUnitTeam, hpShowType: HpShowType, fightType: FightType) {
        this._teamId = teamId;
        this._hpShowType = hpShowType;
        this.fightType = fightType
        this.initHp();
    }

    get type() {
        return this._hpShowType;
    }

    /**初始化 */
    private initHp() {
        this._maxHp = this._curHp = HpStateUtils.getMaxHpByType(this.fightType, this._teamId, this._hpShowType);
    }

    /**
     * hp
     */
    private getCurHp() {
        return HpStateUtils.getCurHpByType(this.fightType, this._teamId, this._hpShowType);
    }

    /**
     * hpMax
     */
    private getMaxHp() {
        this._maxHp = HpStateUtils.getMaxHpByType(this.fightType, this._teamId, this._hpShowType);
        return this._maxHp;
    }

    /**通知更新 */
    public update() {
        let battleLogic = BattleLogicManager.ins().getNotCreate(this.fightType)
        if (!battleLogic || battleLogic.isNotShowBattleEffect())
            return
        let lastMaxHp = this._maxHp;
        let maxHp = this.getMaxHp();
        if (!maxHp) return;
        let curHp = this.getCurHp();
        if (curHp != this._curHp || lastMaxHp != maxHp) {
            this._curHp = curHp;
            FacadeManager.ins().emit(NotificationKey.BATTLE_HP_CHANGED, { teamId: this._teamId, type: this._hpShowType, totalHP: maxHp, curHp } as IBattleTeamHpChangeVo);
        }
    }
}
