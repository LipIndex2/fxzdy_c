import G from "../../../core/comm/G";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { RedDotKeys } from "../common/redDot/RedDotKeys";

/**
 * 魔方控制器
 */
export class MagicCubeController extends BaseController {
    listenNotifications(): string[] {
        return [
            NotificationKey.HERO_ACTIVATE,
            NotificationKey.EVENT_CHANGE_ITEMS2,
            NotificationKey.MAGICCUBE_REFRESH_DATA,
            NotificationKey.EVENT_RECEIVE_SERVER_ITEM_CHANGE,
            NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS,
            NotificationKey.FORMATION_SET_UP_FORMATION,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.HERO_ACTIVATE:
            case NotificationKey.MAGICCUBE_REFRESH_DATA:
                G.GameTimer.once(500, this, () => {
                    this.refreshRedDotByIndexInterceptor(args);
                    this.emit(NotificationKey.FIGHT_UPDATE_ONE_HERO, args);
                });
                break;
            case NotificationKey.FORMATION_SET_UP_FORMATION:
                G.GameTimer.once(200, this, this.refreshRedDot);
                break;
            case NotificationKey.EVENT_RECEIVE_SERVER_ITEM_CHANGE:
            case NotificationKey.EVENT_CHANGE_ITEMS2:
            case NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS:
                G.GameTimer.once(1000, this, this.refreshRedDotByPosHero);
                break;
        }
    }

    constructor() {
        super();
    }

    onInit(): void {}

    private _isCanUnlock: boolean;
    //刷新所有红点
    refreshRedDot() {
        if (!GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.HERO)) return;
        this._isCanUnlock = GIns.magicCubeMgr.isCanUnlock();
        if (!this._isCanUnlock) return;

        let allHeroVo = GIns.heroMgr.getAllHeroVo();
        for (let heroVo of allHeroVo) {
            if (heroVo.heroVoData.isActivate) {
                this.refreshRedDotByIndex(heroVo.heroVoData.baseId);
            }
        }
    }

    //刷新上阵英雄的魔法红点
    refreshRedDotByPosHero() {
        if (!GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.HERO)) return;
        this._isCanUnlock = GIns.magicCubeMgr.isCanUnlock();
        if (!this._isCanUnlock) return;

        let idMap = GIns.heroMgr.getPosToHeroIds();
        let ids = Object.keys(idMap);
        for (let id of ids) {
            let heroVo = GIns.heroMgr.getHeroVoByID(idMap[id]);
            if (heroVo) {
                this.refreshRedDotByIndex(heroVo.heroVoData.baseId);
            }
        }
    }

    //刷新单个红点条件拦截
    refreshRedDotByIndexInterceptor(heroId: number) {
        if (!GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.HERO)) return;
        this._isCanUnlock = GIns.magicCubeMgr.isCanUnlock();
        if (!this._isCanUnlock) return;
        this.refreshRedDotByIndex(heroId);
    }

    //刷新单个红点
    refreshRedDotByIndex(heroId: number) {
        let heroVo = GIns.heroMgr.getHeroVoByID(heroId);
        let cubeVo = GIns.magicCubeMgr.getMagicCubeVoByHeroId(heroId);
        //激活红点
        GIns.redDotMgr.setRedDot(RedDotKeys.Cube_activate, !cubeVo && this._isCanUnlock && heroVo.heroVoData.isActivate && heroVo.posId != null, [heroVo.baseId]);
        //升级红点
        GIns.redDotMgr.setRedDot(RedDotKeys.Cube_upgrade, cubeVo && cubeVo.isCanUp(false) && heroVo.posId != null, [heroVo.baseId]);
        //转换红点
        // GIns.redDotMgr.setRedDot(RedDotKeys.Cube_convert, cubeVo && cubeVo.isCanConvert(), [heroVo.baseId]);
    }
}
MagicCubeController.ins().doInit();
