import G from "db://assets/scripts/core/comm/G";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { ChatModel } from "db://assets/scripts/game/modules/chat/model/ChatModel";
import { UICommWin, UIWinEffectType } from "db://assets/scripts/core/mvc/view/UICommWin";
import { ChatLeftItemBtn } from "db://assets/scripts/game/modules/chat/components/ChatLeftItemBtn";
import { ChatLeftTabItemVo } from "db://assets/scripts/game/modules/chat/vo/ChatLeftTabItemVo";
import { EnumChatPageType } from "db://assets/scripts/game/modules/chat/enums/EnumChatPageType";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { ChatContentPage } from "db://assets/scripts/game/modules/chat/page/ChatContentPage";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { ChatMainViewOpenArgs } from "db://assets/scripts/game/modules/chat/structs/ChatMainViewOpenArgs";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { EventChatChangeTab } from "db://assets/scripts/game/modules/chat/event/EventChatChangeTab";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { Logger } from "db://assets/scripts/core/log/Logger";
import ChannelType = ServerEnums.ChannelType;

/**
 * 聊天
 */
export class ChatMainView extends UICommWin {

    static pkgName: string = "chat";
    static viewName: string = "ChatMainView";

    private _itemArray: ChatLeftTabItemVo[] = [];

    // choose
    private _chooseChannelType: ChannelType;
    private _choosePlayerId: number = 0;

    /**展开动画类型*/
    protected _effectType: UIWinEffectType = UIWinEffectType.Flat;
    /**展开动画内容分组名称*/
    protected _flatCenterGroup: string = 'G_all';

    private get view(): ui.chat.ChatMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_EXIT_LEAGUE,
            NotificationKey.CHAT_TAB_REFRESH,
            NotificationKey.CHAT_CHANGE_TAB_INDEX,
            NotificationKey.CHAT_CLICK_SETTINGS,
            NotificationKey.CHAT_ON_NEW_MESSAGE,
            NotificationKey.CHAT_CHOOSE_TAB,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case  NotificationKey.CHAT_CHOOSE_TAB: {
                this.scrollToIndex(args);
                break;
            }
            case  NotificationKey.CHAT_CLICK_SETTINGS: {
                this.setChooseTab(args, false);
                break;
            }
            case  NotificationKey.CHAT_CHANGE_TAB_INDEX: {
                this.setChooseTab(args, true);
                break;
            }
            case  NotificationKey.EVENT_EXIT_LEAGUE:
            case  NotificationKey.CHAT_TAB_REFRESH: {
                this.resetTab();
                break;
            }
            case NotificationKey.CHAT_ON_NEW_MESSAGE: {
                this.refreshTab();
                break;
            }
        }
    }

    protected onInit() {
        this.view.tabList.setVirtual();
        this.view.tabList.itemRenderer = this.irForLeftTab.bind(this);

        this.view.btnSetting.onClick(this.clickSetting, this);
        this.view.btnSetting.getController("isChoose").selectedIndex = 0;

    }

    clickSetting() {
        // setting
        this.view.getController("pageType").selectedIndex = 1;


        const oldIndex = this.view.btnSetting.getController("isChoose").selectedIndex
        // 已选中下不会再变换
        if (oldIndex == 0) {
            // toggle
            this.view.btnSetting.getController("isChoose").selectedIndex = (oldIndex + 1) % 2;
        }


        FacadeManager.ins().emit(NotificationKey.CHAT_CLICK_SETTINGS, EventChatChangeTab.create(
            ServerEnums.ChannelType.PRIVATE,
            -1
        ));
    }

    // tab
    irForLeftTab(index: number, btn: ChatLeftItemBtn) {
        const item = this._itemArray[index];

        btn.reset(index, item);

        btn.refreshChooseState(
            this._chooseChannelType,
            this._choosePlayerId
        );
    }


    @LogBusiness("打开界面")
    public onOpen(args: ChatMainViewOpenArgs): void {
        G.Logger.debug(" onOpen ")

// choose
        this._chooseChannelType = args.channelType;
        this._choosePlayerId = args.playerId;


        this.reset();
    }


    @LogBusiness("关闭界面")
    protected onClose() {
        super.onClose();
    }

    private reset() {

        const context = ChatModel.ins().context;

        this._itemArray = context.getLeftTabItemArray() || [];
        this.view.tabList.numItems = this._itemArray.length;

        this.view.getController("pageType").selectedIndex = EnumChatPageType.CHAT;

        this.refreshTabAndContent();

    }

    // 刷新 tab + 右边的内容
    private refreshTabAndContent() {
        const item: ChatLeftTabItemVo = this._itemArray.find(it => {
            return it.playerId == this._choosePlayerId
                && it.channelType == this._chooseChannelType;
        });
        if (!item) {
            return;
        }
        const chatContentPage = FguiScriptUtils.toMyScriptClass(this.view.pageChat, ChatContentPage);
        chatContentPage.reset(item);
    }

    // tab 

    /**
     * 是否清理设置
     * @param event
     * @param isClearSettings
     * @private
     */
    private setChooseTab(event: EventChatChangeTab, isClearSettings: boolean) {
        if (isClearSettings) {
            // content
            this.view.btnSetting.getController("isChoose").selectedIndex = 0;
            this.view.getController("pageType").selectedIndex = 0;
        } else {
        }

        const oldChannelType = this._chooseChannelType;
        const oldPlayerId = this._choosePlayerId;

        const newChannelType = event.channelType;
        const newPlayerId = event.playerId;

        // choose
        this._chooseChannelType = newChannelType;
        this._choosePlayerId = newPlayerId;

        if (oldChannelType == newChannelType && newPlayerId == oldPlayerId) {
            Logger.debug("[Chat] tab 选择一致. 所以不变化");
            return;
        }

        this.view.tabList.refreshVirtualList();

        this.refreshTabAndContent();
    }

    // tab 
    private refreshTab() {
        const context = ChatModel.ins().context;

        this._itemArray = context.getLeftTabItemArray() || [];
        this.view.tabList.numItems = this._itemArray.length;
    }

    private resetTab() {
        // choose
        this._chooseChannelType = ServerEnums.ChannelType.WORLD;
        this._choosePlayerId = 0;

        this.refreshTab();
        this.refreshTabAndContent();
    }

    scrollToIndex(tabIndex: number) {

        const childIndex = this.view.tabList.itemIndexToChildIndex(tabIndex);
        // 已经是选中了他
        if (this.view.tabList.selectedIndex == childIndex) {
            return
        }
        this.view.tabList.selectedIndex = childIndex;
        this.view.tabList.scrollToView(childIndex);
    }
}