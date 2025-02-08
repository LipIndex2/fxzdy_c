import G from "../../../core/comm/G";
import {BaseController} from "../../../core/mvc/controller/BaseController";
import {ServerEnums} from "../../../libs/extras/ServerEnums";
import LoginNotificationKey from "../../../main/modules/LoginNotificationKey";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import {RedDotKeys} from "../common/redDot/RedDotKeys";
import {ConditionUtils} from "../condition/ConditionUtils";
import {UICollectionsKey} from "./const/UICollectionsConfig";

export class CollectionsController extends BaseController {
    private waitShowSetEffs: XJ.collections.ISetActiveWinParam[] = [];

    protected _isOpen: boolean = false;
    protected _isInit: boolean = false;

    listenNotifications(): string[] {
        return [
            // 解锁 tabItem 用
            ...ConditionUtils.getUnlockEventNameArray(),
            LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE,
            NotificationKey.COLLECTIONS_ACTIVE_SET,
            NotificationKey.COLLECTIONS_SET_ACTIVE_WIN_CLOSE,
            NotificationKey.EVENT_CHANGE_ITEMS,
            NotificationKey.COLLECTIONS_PUSH_EXPIRED,
        ]
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE:
                this._isInit = true;
                this.onOpenHandler();
                break;
            case NotificationKey.COLLECTIONS_ACTIVE_SET:
                this.tryShowActiveSetWin(args);
                this.updateRedDotForSuitId(args?.suidCfgId);
                break;
            case NotificationKey.COLLECTIONS_SET_ACTIVE_WIN_CLOSE:
                this.tryShowActiveSetWin();
                break;
            case NotificationKey.EVENT_CHANGE_ITEMS:
                this.onItemChangeHandler(args);
                break;
            case NotificationKey.COLLECTIONS_PUSH_EXPIRED:
                (args as Vo.collectibles.CollectiblesVo[])?.forEach((vo) => {
                    this.updateRedDotForCfgId(vo.baseId);
                })
                break;
        }
        const ok = ConditionUtils.isNeedHandleForUnlock(event)
        if (ok) {
            if (this._isOpen == false && this._isInit) {
                //实时检测是否开启了
                this.onOpenHandler();
            }
        }
    }

    protected onOpenHandler(): void {
        this._isOpen = GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.COLLECTIBLES);
        if (this._isOpen) {
            //功能开启之后的相应处理
            this.refreshAllRedDot();
        }
    }

    protected onItemChangeHandler(args: Map<number, number>): void {
        let needRefresh: boolean = false;
        for (let [key, value] of args) {
            if (GIns.collectionsModel.allCostItemMap.has(key)) {
                needRefresh = true;
                break;
            }
            if (GIns.collectionsModel.allFragmentToIdMap.has(key)) {
                needRefresh = true;
                break;
            }
        }
        if (needRefresh) {
            //需要刷新红点
            G.GameTimer.clearAll(this);
            //延时等待数据刷新完成
            G.GameTimer.once(1000, this, () => {
                this.refreshAllRedDot();
            })
        }
    }

    /**刷新红点*/
    protected refreshAllRedDot(): void {
        if (this._isOpen) {
            let allCfgs = G.TableManager.getAllData(table.collectibles.CollectiblesConfig);
            let allSuitIds: number[] = [];
            allCfgs.forEach((cfg) => {
                this.updateRedDotForCfgId(cfg.id);
                if (cfg?.suitId && allSuitIds.indexOf(cfg.suitId) == -1) {
                    allSuitIds.push(cfg.suitId);
                }
            })
            allSuitIds?.forEach((suitId) => {
                this.updateRedDotForSuitId(suitId);
            })
        }
    }

    /**更新套装红点*/
    protected updateRedDotForSuitId(suitId: number): void {
        GIns.redDotMgr.setRedDot(RedDotKeys.Collections_suit_up_active, GIns.collectionsModel.redSuit(suitId), [suitId])
    }

    /**更新单个收藏品红点*/
    protected updateRedDotForCfgId(collCfgId: number): void {
        let vo = GIns.collectionsModel.context.getCollectionById(collCfgId);
        GIns.redDotMgr.setRedDot(RedDotKeys.Collections_item_compound, vo && GIns.collectionsModel.redCompound(collCfgId), [collCfgId]);
        GIns.redDotMgr.setRedDot(RedDotKeys.Collections_item_upLV, vo && GIns.collectionsModel.redUpLV(collCfgId), [collCfgId]);
        GIns.redDotMgr.setRedDot(RedDotKeys.Collections_item_upStar, vo && GIns.collectionsModel.redUpStar(collCfgId), [collCfgId]);
    }

    tryShowActiveSetWin(param?: XJ.collections.IActiveSetParam) {
        if (param) {
            param.newActiveStar.forEach(n => {
                this.waitShowSetEffs.push({
                    suitCfgId: param.suidCfgId,
                    activeStar: n,
                });
            });
        }
        if (this.waitShowSetEffs.length > 0) {
            G.UIManager.open(UICollectionsKey.SET_ACTIVE_WIN, this.waitShowSetEffs.shift());
        }
    }
}

CollectionsController.ins().doInit();
