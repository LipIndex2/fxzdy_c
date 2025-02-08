import G from "../../../../core/comm/G";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { FriendI18nKeys } from "../const/FriendI18nKeys";
import { FriendModel } from "../model/FriendModel";
import { FriendBasePage } from "../page/FriendBasePage";

/**
 * 好友界面
 */
export class FriendMainWin extends UICommWin {

    static pkgName: string = "friend";
    static viewName: string = "FriendMainWin";

    protected _pages: FriendBasePage[] = []

    /**自动刷新时间*/
    protected _pageAutoRefreshTime: number = 60000
    private get view(): ui.friend.view.FriendMainWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.FRIEND_DATA_CHANGE,
            NotificationKey.FRIEND_APPLY_CHANGE,
            NotificationKey.FRIEND_BLACK_CHANGE,
            NotificationKey.FRIEND_RECOMMEND_CHANGE,
            NotificationKey.FRIEND_DATA_ID_CHANGE,
            NotificationKey.FRIEND_APPLY_COUNT_CHANGE,
            NotificationKey.FRIEND_BLACK_ID_CHANGE,
            NotificationKey.FRIEND_MY_APPLY_CHANGE,
            NotificationKey.FRIEND_GIVE_GIFT_COMPLETE
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.FRIEND_DATA_CHANGE:
                this.updatePage(0)
                this.updateUI()
                break
            case NotificationKey.FRIEND_APPLY_CHANGE:
                this.updatePage(2)
                break
            case NotificationKey.FRIEND_RECOMMEND_CHANGE:
                this.updatePage(1)
                break
            case NotificationKey.FRIEND_BLACK_CHANGE:
                this.updatePage(3)
                break
            case NotificationKey.FRIEND_DATA_ID_CHANGE:
                FriendModel.ins().checkAndRefreshFriends()
                //好友变更影响到推荐列表(推荐列表不展示好友)
                this.updatePage(1)
                this.updateUI()
                break
            case NotificationKey.FRIEND_APPLY_COUNT_CHANGE:
                FriendModel.ins().checkAndRefreshApplies()
                break
            case NotificationKey.FRIEND_BLACK_ID_CHANGE:
                FriendModel.ins().checkAndRefreshBlacks()
                break
            case NotificationKey.FRIEND_MY_APPLY_CHANGE:
                this.updatePage(1)
                break
            case NotificationKey.FRIEND_GIVE_GIFT_COMPLETE:
                GIns.floatingTextMgr.showTips(G.I18nManager.lang(FriendI18nKeys.giftSuccTip))
                break
        }
    }

    protected updatePage(index: number): void {
        if (index >= 0 && index < this._pages.length) {
            let page = this._pages[index]
            if (page.visible) {
                page?.updateUI()
            } else {
                page.refreshDirty = true
            }
        }
    }

    protected updateUI(): void {
        let index = this.view.getController('tab').selectedIndex
        if (index == 3) {
            //显示黑名单
            this.view.lbNum.text = FriendModel.ins().blackCount + "/" + FriendModel.ins().maxBlackCount
        } else {
            this.view.lbNum.text = FriendModel.ins().friendCount + "/" + FriendModel.ins().maxFriendCount
        }
    }

    /***组件初始化 */
    protected onInit(): void {

        this.view.lbTitle.text = G.I18nManager.lang(FriendI18nKeys.title)
        this.view.tab0.title = G.I18nManager.lang(FriendI18nKeys.tab1)
        this.view.tab1.title = G.I18nManager.lang(FriendI18nKeys.tab2)
        this.view.tab2.title = G.I18nManager.lang(FriendI18nKeys.tab3)
        this.view.tab3.title = G.I18nManager.lang(FriendI18nKeys.tab4)

        this.view.getController('tab').onChanged(this.onChangedTab, this)

        FguiScriptUtils.toMyScriptClass(this.view.tab0.redDot, RedDotCom).reset(RedDotKeys.Friend_list)
        FguiScriptUtils.toMyScriptClass(this.view.tab2.redDot, RedDotCom).reset(RedDotKeys.Friend_apply)
    }

    protected onChangedTab(): void {
        this.updateUI()
    }

    protected onTimer(): void {
        let index = this.view.getController('tab').selectedIndex
        this.updatePage(index)
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        //@ts-ignore
        this._pages = [this.view.pageList, this.view.pageRecommend, this.view.pageApply, this.view.pageBlack]

        this._pages.forEach((page) => {
            page.maxRefreshTime = this._pageAutoRefreshTime
        })
        //一分钟刷新一下列表 主要是刷新离线时长
        G.GameTimer.loop(this._pageAutoRefreshTime, this, this.onTimer)
        this.updateUI()
    }

    protected onClose(): void {
        G.GameTimer.clearAll(this)
        this._pages.forEach((page) => {
            page.clearView()
        })
        this._pages.length = 0
    }
}