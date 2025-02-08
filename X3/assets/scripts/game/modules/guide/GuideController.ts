import G from "../../../core/comm/G";
import { Logger } from "../../../core/log/Logger";
import { UIManager } from "../../../core/mvc/UIManager";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { LocalStorageUtils } from "../../../core/utils/LocalStorageUtils";
import UrlUtils from "../../../core/utils/UrlUtils";
import GIns from "../../GIns";
import { BattleExpandManager } from "../../comm/battleEx/BattleExpandManager";
import { LocalStorageKeys } from "../../comm/cache/LocalStorageKeys";
import NotificationKey from "../../event/NotificationKey";
import { MapManager } from "../../tiledMap/MapManager";
import { GuideConditions } from "./GuideConditions";
import { GuideVerifyType } from "./const/GuideEnum";
import { GuideGroupManager } from "./GuideGroupManager";
import { GuideManager } from "./GuideManager";
import { UIGuideConfig } from "./const/UIGuideConfig";
import { IGuideVerifyArgs } from "./const/IGuideVerifyArgs";
import { GuideMaskItem } from "./item/GuideMaskItem";
import { GuideTouchRangeItem } from "./item/GuideTouchRangeItem";
import { GuideModel } from "./model/GuideModel";
import GuideRunner from "./starter/GuideRunner";
import { TableManager } from "../../../core/table/TableManager";
import LoginNotificationKey from "../../../main/modules/LoginNotificationKey";

/** 引导 */
export class GuideController extends BaseController {
    private _guideEventMap: { [key: string]: GuideVerifyType } = {};

    private _isInitType = false;

    private _isStartGuide = false;

    listenNotifications(): string[] {
        if (UrlUtils.hasUrlParam(UrlUtils.Guide)) return null;//跳过引导

        return [
            LoginNotificationKey.INIT_GAME_WORLD_COMPLETED,
            NotificationKey.GUIDE_START,
            NotificationKey.GUIDE_FINISH,

            NotificationKey.HERO_UP_LEVEL,
            NotificationKey.MAP_TEAN_POS_UPDATE,
            NotificationKey.OPEN_ViEW,
            NotificationKey.CLOSE_ViEW,
            NotificationKey.EVENT_CHANGE_ITEMS,
            NotificationKey.MAP_BUILDING_UNLOCK,
            NotificationKey.MAP_MIST_UNLOCKED,
            NotificationKey.MAP_AREA_TRANSFER_END,
            NotificationKey.EVENT_TRUNK_TASK_CHANGE,
            NotificationKey.GUIDE_CLICK_BTN,
            NotificationKey.MAP_ACTIVE_BUILDING,

            NotificationKey.SYSTEM_OPEN_FUNCTION1,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.INIT_GAME_WORLD_COMPLETED:
                this.startGuide();
                return;
            case NotificationKey.GUIDE_START:
                this.enterGuide(args);
                return;
            case NotificationKey.GUIDE_FINISH:
                GuideGroupManager.ins().finishGroup(args);
                return;
        }

        let type = this._guideEventMap[event];
        if (type) {
            switch (event) {
                case NotificationKey.OPEN_ViEW:
                    if (args == "ACCOUNT_WIN") return;
                    this.pushVerifyInPool(type, [1, args]);
                    break;
                case NotificationKey.CLOSE_ViEW:
                    if (args == "ACCOUNT_WIN") return;
                    this.pushVerifyInPool(type, [0, args]);
                    break;
                case NotificationKey.MAP_AREA_TRANSFER_END:
                    this.pushVerifyInPool(type, MapManager.ins().getMapID());
                    break;
                default:
                    this.pushVerifyInPool(type, args);
                    break;
            }
            return;
        }
    }

    constructor() {
        super();
    }

    onInit(): void {
        this.initType();
    }

    private initType() {
        if (this._isInitType) return;
        this._isInitType = true;

        this._guideEventMap[NotificationKey.HERO_UP_LEVEL] = GuideVerifyType.LEVEL;
        this._guideEventMap[NotificationKey.MAP_TEAN_POS_UPDATE] = GuideVerifyType.TRIGGER;

        this._guideEventMap[NotificationKey.OPEN_ViEW] = GuideVerifyType.VIEW;
        this._guideEventMap[NotificationKey.CLOSE_ViEW] = GuideVerifyType.VIEW;

        this._guideEventMap[NotificationKey.EVENT_CHANGE_ITEMS] = GuideVerifyType.HAS_ITEM;

        this._guideEventMap[NotificationKey.MAP_BUILDING_UNLOCK] = GuideVerifyType.UNLOCK_BUILDING;
        this._guideEventMap[NotificationKey.MAP_MIST_UNLOCKED] = GuideVerifyType.UNLOCK_BUILDING;

        this._guideEventMap[NotificationKey.MAP_AREA_TRANSFER_END] = GuideVerifyType.ENTER_WORLD;

        this._guideEventMap[NotificationKey.EVENT_TRUNK_TASK_CHANGE] = GuideVerifyType.TASK;

        this._guideEventMap[NotificationKey.GUIDE_CLICK_BTN] = GuideVerifyType.BUTTON;

        this._guideEventMap[NotificationKey.MAP_ACTIVE_BUILDING] = GuideVerifyType.ENTER_BUILDING;

        this._guideEventMap[NotificationKey.HANG_UP_MAX_PASS_LEVEL_ID_CHANGE2] = GuideVerifyType.PASS_STAGE;

        this._guideEventMap[NotificationKey.SYSTEM_OPEN_FUNCTION1] = GuideVerifyType.OPEN_FUNCTION;
    }


    private _verifyPool: IGuideVerifyArgs[];
    private pushVerifyInPool(type: GuideVerifyType, args: any) {
        if (!this._verifyPool) {
            this._verifyPool = [];
        }
        this._verifyPool.push({ type, args });
        G.GameTimer.callLater(this, this.verifyGuide); //延迟执行 一帧内的多个事件，
    }

    private startGuide() {
        this._isStartGuide = true;
        GuideGroupManager.ins().init();
        GuideGroupManager.ins().checkGroupRunVirefy();
    }

    /** 引导事件接收 */
    private verifyGuide() {
        if (!this._isStartGuide) return;
        if (!this._verifyPool?.length) return;

        //触发引导
        if (GuideManager.ins().isGuiding) {
            //更新引导完成状态
            GuideManager.ins().checkFinishCondition(this._verifyPool);
        }

        //不在引导
        if (!GuideManager.ins().isGuiding) {
            GuideGroupManager.ins().checkGroupRunCondition(this._verifyPool);
        }

        this._verifyPool = [];
    }

    /** 进入引导 */
    private enterGuide(id: number) {
        let cfg = TableManager.getDataById(table.guide.GuideConfig, id);
        if (cfg && cfg.id == GuideManager.ins().guideCfg?.id) {
            if (cfg.id === 1001) {
                //新手引导进入新手地图是播放传送特效
                BattleExpandManager.ins().GuideTransferHeroAnimInFirst();
            }
            UIManager.ins().open(UIGuideConfig.GUIDE_MAIN_VIEW);

            Logger.debug("===============开始引导================");
            Logger.debug("引导id = " + id + "引导组id = " + cfg.group);
        }
    }
}
GuideController.ins().doInit();
