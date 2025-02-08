import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import G from "../../../core/comm/G";
import NotificationKey from "../../event/NotificationKey";
import { RedDotKeys } from "../common/redDot/RedDotKeys";
import { RedDotManager } from "../common/redDot/RedDotManager";

import { ServerEnums } from "../../../libs/extras/ServerEnums";
import GIns from "../../GIns";
import { FriendGiveOrDrawBtn } from "./btn/FriendGiveOrDrawBtn";
import { FriendApplyItem } from "./item/FriendApplyItem";
import { FriendBlackItem } from "./item/FriendBlackItem";
import { FriendItem } from "./item/FriendItem";
import { FriendPlayerInfoItem } from "./item/FriendPlayerInfoItem";
import { FriendRecommendItem } from "./item/FriendRecommendItem";
import { FriendModel } from "./model/FriendModel";
import { FriendApplyPage } from "./page/FriendApplyPage";
import { FriendBlackPage } from "./page/FriendBlackPage";
import { FriendListPage } from "./page/FriendListPage";
import { FriendRecommendPage } from "./page/FriendRecommendPage";


export class FriendController extends BaseController {

    listenNotifications(): string[] {
        return [
            NotificationKey.SYSTEM_NEW_DAY,
            NotificationKey.FRIEND_INIT_COMPLETE,
            NotificationKey.FRIEND_SIMPLE_DATA_CHANGE,
            NotificationKey.FRIEND_APPLY_COUNT_CHANGE,
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.SYSTEM_NEW_DAY:
                //跨天刷新好友列表
                if (GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.FRIEND)) {
                    GIns.friendModel.resetGiveAndDrawCount()
                }
            case NotificationKey.FRIEND_INIT_COMPLETE:
                this.checkAllRedDots()
                break
            case NotificationKey.FRIEND_SIMPLE_DATA_CHANGE:
                this.checkFriendGiveAndDrawGift()
                break
            case NotificationKey.FRIEND_APPLY_COUNT_CHANGE:
                this.checkFriendApply()
                break
        }
    }

    constructor() {
        super();
    }

    public checkAllRedDots(): void {
        this.checkFriendGiveAndDrawGift()
        this.checkFriendApply()
    }

    public checkFriendGiveAndDrawGift(): boolean {
        let hasGiveOrDrawGiftBySimple = FriendModel.ins().hasGiveOrDrawGiftBySimple()
        RedDotManager.ins().setRedDot(RedDotKeys.Friend_giveAndDrawGift, hasGiveOrDrawGiftBySimple)
        return hasGiveOrDrawGiftBySimple
    }

    public checkFriendApply(): boolean {
        let hasFriendApply = FriendModel.ins().applyCount > 0
        RedDotManager.ins().setRedDot(RedDotKeys.Friend_apply, hasFriendApply)
        return hasFriendApply
    }

    onInit(): void {
        G.FGUIManager.bindScript("ui://friend/FriendGiveOrDrawBtn", FriendGiveOrDrawBtn)
        G.FGUIManager.bindScript("ui://friend/FriendPlayerInfoItem", FriendPlayerInfoItem)
        G.FGUIManager.bindScript("ui://friend/FriendItem", FriendItem)
        G.FGUIManager.bindScript("ui://friend/FriendRecommendItem", FriendRecommendItem)
        G.FGUIManager.bindScript("ui://friend/FriendApplyItem", FriendApplyItem)
        G.FGUIManager.bindScript("ui://friend/FriendBlackItem", FriendBlackItem)
        G.FGUIManager.bindScript("ui://friend/FriendListPage", FriendListPage)
        G.FGUIManager.bindScript("ui://friend/FriendRecommendPage", FriendRecommendPage)
        G.FGUIManager.bindScript("ui://friend/FriendApplyPage", FriendApplyPage)
        G.FGUIManager.bindScript("ui://friend/FriendBlackPage", FriendBlackPage)
        this.initRedDot()
    }

    protected initRedDot(): void {
    }
}

FriendController.ins().doInit();