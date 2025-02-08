import BaseSingleton from "../../../core/base/BaseSingleton";
import { TableManager } from "../../../core/table/TableManager";
import { BattleLogicManager } from "../../comm/battle/BattleLogicManager";
import { FightType } from "../../comm/battle/enum/FightType";
import { BattleModel } from "../battle/model/BattleModel";

/**
 * 副本boss
 */
export class MapInstanceManager extends BaseSingleton {

    //已通关的副本id
    private _allPassMapInstanceIds;

    /** 当前副本id */
    private _mapInstanceId;
    //配置表
    private _mapInstanceCfg: table.map.MapInstanceConfig;
    /** 进入副本时的地图 */
    private _enterMapId;
    /** 进入副本时的位置 */
    private _enterMapPos: { x: number, y: number } = { x: 0, y: 0 };

    /** 登录下发已通关的副本id */
    public initData(data: Array<number>) {
        this._allPassMapInstanceIds = data;
    }

    /** =========================get set=============================== */

    /** 已通关的副本id */
    get allPassMapInstanceIds() {
        return this._allPassMapInstanceIds;
    }

    /** 保存已通关的副本id */
    public set passMapInstanceId(id: number) {
        this._allPassMapInstanceIds.push(id);
    }


    /** 当前副本id（退出副本时赋空） */
    get mapInstanceId() {
        return this._mapInstanceId
    }
    set mapInstanceId(id: number) {
        this._mapInstanceId = id;
        if (!id) {
            this._mapInstanceCfg = null;
        } else {
            this._mapInstanceCfg = TableManager.getDataById(table.map.MapInstanceConfig, id);
        }
    }

    /** 当前副本配置表 */
    get mapInstanceCfg() {
        if (!this.mapInstanceId) return null;
        if (!this._mapInstanceCfg)
            this._mapInstanceCfg = TableManager.getDataById(table.map.MapInstanceConfig, this.mapInstanceId);
        return this._mapInstanceCfg
    }

    /** 助战英雄id */
    public get helpHeroId(): number {
        if (!this.mapInstanceId) return null;
        let cfg = TableManager.getDataById(table.map.InstanceHelpConfig, this.mapInstanceCfg.helpConfigId);
        if (!cfg) return null;
        return cfg.heroBaseId
    }


    /** 副本地图id */
    get mapId() {
        if (!this.mapInstanceId) return null;
        let cfg = TableManager.getDataById(table.map.MapInstanceConfig, this.mapInstanceId);
        let battleCfg = TableManager.getDataById(table.battle.BattleConfig, cfg.battleConfigId);
        return battleCfg.mapId;
    }

    /** 进入副本时的地图 */
    get enterMapId() {
        return this._enterMapId;
    }
    set enterMapId(id: number) {
        this._enterMapId = id;
    }

    /** 进入副本时的位置 */
    get enterMapPos() {
        return this._enterMapPos;
    }
    set enterMapPos(data: { x: number, y: number }) {
        this._enterMapPos.x = data.x;
        this._enterMapPos.y = data.y;
    }


    /** =========================外部调用方法=============================== */

    /** 判断副本id是否已通过 (副本id和建筑id一致) */
    public isPass(id: number) {
        for (let mapId of this.allPassMapInstanceIds) {
            if (mapId && mapId == id) {
                return true;
            }
        }

        return false;
    }

    /** 刷新怪物
     * @param resourceIds 怪物资源id @see table.battle.MonsterResourceConfig.resourceId
     */
    public createMonster(resourceIds: number[]) {
        let logic = BattleLogicManager.ins().getNotCreate(FightType.MAP_INSTANCE)
        if (logic)
            BattleModel.ins().sendLoadBattleMonster(resourceIds, logic.battleConfigId);
    }
}