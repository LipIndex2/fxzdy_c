import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIView } from "../../../../core/mvc/view/UIView";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { ActivitySyncData } from "../../../comm/activity/model/ActivityModel";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { ActivityGirlGroupVo } from "../../activity/model/ActivityGirlGroupVo";
import { UIGirlGroupKey } from "../const/UIGirlGroupKey";
import { TableManager } from "../../../../core/table/TableManager";
import { GirlGroupAwardItem } from "../item/GirlGroupAwardItem";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { DialogData } from "../page/DialogBoxPage";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { RuleController } from "../../rule/RuleController";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";

/**
 * STK 女团
 * 主界面
 */
@bindScript(UIGirlGroupKey.GirlGroupMainView)
export class GirlGroupMainView extends UIView {
    static pkgName: string = "girlGroup";
    static viewName: string = "GirlGroupMainView";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;

    private get view(): ui.girlGroup.GirlGroupMainView {
        return this._view as any;
    }

    //活动Vo
    private _vo: ActivityGirlGroupVo;

    //礼包map
    private _goodsMap: { [day: number]: table.activity.GirlGroup.GirlGroupGoodsConfig[] } = {};

    /**当前是第几天*/
    private _curDay: number = 0;
    //tab的index
    private _tabIndex: number = 0;
    //真对话列表
    private _dialogs: string[] = [];
    //配置的对话列表

    //
    private _isFirst = true;

    listenNotifications(): string[] {
        return [
            NotificationKey.ACTIVITY_STUFF_UPDATE,
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_REQUEST_BACK,
            NotificationKey.ACTIVITY_END_REFRESH,
            NotificationKey.CHARGE_COMPLETE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ACTIVITY_STUFF_UPDATE:
                if (args.activityId == this._vo.activityId) {
                    this.onReceiveData(args);
                }
                break;
            case NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK:
                if (args == this._vo.activityId) {
                    this._vo = GIns.activityModel.getActivityVoById(args);
                    this._vo.updatePlayerVo(this._vo.activityVo.playerVo);
                    this.updateUI();
                }
                break;
            case NotificationKey.ACTIVITY_UPDATE:
                if (args == this._vo.activityId) {
                    GIns.activityModel.sendActivity(this._vo.activityId);
                }
                break;
            case NotificationKey.CHARGE_COMPLETE:
            case NotificationKey.ACTIVITY_REQUEST_BACK:
                GIns.activityModel.sendActivity(this._vo.activityId);
                break;
            case NotificationKey.ACTIVITY_END_REFRESH:
                if (args === this._vo.activityId) {
                    this.closeSelf();
                }
                break;
        }
    }

    protected onInit(): void {
        this.view.footer.btnBack.on(fgui.Event.CLICK, this.closeSelf, this);
        this.view.btnRule.on(fgui.Event.CLICK, this.onBtnRuleClick, this);
        this.view.btn_award1.on(fgui.Event.CLICK, this.onBtnAwardClick, this);
        this.view.btn_award2.on(fgui.Event.CLICK, this.onBtnAwardClick, this);

        this.view.list_tab.itemRenderer = this.tabItemRenderer.bind(this);
        this.view.list_award.itemRenderer = this.awardItemRenderer.bind(this);
        // this.view.list_diaolog.setVirtual();
        // this.view.list_diaolog.itemRenderer = this.dialogItemRenderer.bind(this);

        //红点
        FguiScriptUtils.toMyScriptClass(this.view.btn_award1.redDot, RedDotCom).reset(RedDotKeys.GirlGroup_reward1);
        FguiScriptUtils.toMyScriptClass(this.view.btn_award2.redDot, RedDotCom).reset(RedDotKeys.GirlGroup_reward2);
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._vo = GIns.activityModel.getActivityVoByType(ServerEnums.ActivityType.GIRL_GROUP) as ActivityGirlGroupVo;
        if (!this._vo) {
            this.closeSelf();
            return;
        }
        //@ts-ignore
        this.view.dialogBoxPage.setActivityId(this._vo.activityId);

        //@ts-ignore
        this.view.playerPage.updateUI(this._vo);
        //进入直播间
        this.sendEnterOrLeaveRoom(true);
        this._curDay = this._vo.openDay;
        this._goodsMap = this._vo.goodsMap;
        // let tabKeys = Object.keys(this._goodsMap);
        // this.view.list_tab.numItems = tabKeys.length;

        this.updateUI();
        this.onTimer();
        G.GameTimer.loop(1000, this, this.onTimer);

        GIns.audioMgr.playMusic("KPAbgm3")
    }

    protected onClose(dontDispose?: boolean): void {
        G.GameTimer.clear(this, this.onTimer);
        //离开直播间
        this.sendEnterOrLeaveRoom(false);
        GIns.mapMgr.playMapMusic()
    }

    //时间
    private onTimer() {
        if (this._vo.getLeftTime() > 0) {
            let endTimeText = TimeUtils.formatTimeMsToDayHourMinuteSecondText(this._vo.getLeftTime());
            this.view.T_time.text = `活动倒计时:[color=#3CFE37]${endTimeText}[/color]`;
        } else {
            this.view.T_time.text = `活动已结束!`;
            this.closeSelf();
        }
    }

    private updateUI(): void {
        let tabKeys = Object.keys(this._goodsMap);
        this.view.list_tab.numItems = tabKeys.length;

        //标题
        this.view.T_title.text = "STK女团";
        // let icon = TableManager.getDataById(table.activity.GirlGroup.GirlGroupConstantConfig, "GIRLGROUP:SHOW_GEAD_ICON").content;
        // this.view.img_head.img_head.icon = icon;
        //房间名
        let name = TableManager.getDataById(table.activity.GirlGroup.GirlGroupConstantConfig, "GIRLGROUP:LIVE_ROOM_NAME").content;
        this.view.T_roomName.text = name;
        //观看人数
        let num = TableManager.getDataById(table.activity.GirlGroup.GirlGroupConstantConfig, "GIRLGROUP:LIVE_ROOM_PEOPLE_NUM").content;
        this.view.T_peopleNum.text = `观看：${num}人`;

        this.view.list_award.numItems = this._goodsMap[this._tabIndex + 1].length;

        this.view.btn_award1.visible = !this._vo.playerVo.gainDailyReward;
    }

    //发送 进入或离开房间 协议
    private sendEnterOrLeaveRoom(isEnter: boolean): void {
        let syncData = {
            activityId: this._vo.activityId,
            itemId: isEnter ? "ENTER" : "LEAVE",
        } as ActivitySyncData;
        GIns.activityModel.sendBuyGoods(syncData);
    }

    //玩家进入，直接刷出欢迎对话
    private onPlayerEnter(vo: Vo.activity.GirlGroupVisitorVo): void {
        // this.view.T_peopleNum.text = `观看：${vo.totalVisitNum}人`;
        let data: DialogData = {
            type: 1,
            text: vo.name,
        };
        //@ts-ignore
        this.view.dialogBoxPage.addDialog(data);
    }

    // --------列表渲染----
    private _tabItem;
    //tab
    private tabItemRenderer(index: number, item: ui.girlGroup.btn.GirlGroupTabBtn): void {
        let tabKeys = Object.keys(this._goodsMap);
        let cfg: table.activity.GirlGroup.GirlGroupGoodsConfig[] = this._goodsMap[tabKeys[index]];
        FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.GirlGroup_tab, [index]);

        let tabCfg = TableManager.getDataById(table.activity.GirlGroup.GirlGroupGoodsConditionConfig, cfg[0].conditionId);

        item.T_day.text = item.T_day2.text = `第${tabCfg.openDay}天`;

        //状态 0 未解锁， 1解锁
        let state = 0;
        if (GIns.conditionMgr.checkCondition(tabCfg.earlyConditions) || this._curDay >= tabCfg.openDay) {
            state = 1;
            if (index != 0) GIns.redDotMgr.setRedDot(RedDotKeys.GirlGroup_tab, true, [index]);
        }

        if (this._curDay < tabCfg.openDay && state == 0) {
            item.gp_tips.visible = this._vo.isBuyGoodsByDay(index);
        } else {
            item.gp_tips.visible = false;
        }

        if (this._isFirst) {
            if (this._curDay >= tabCfg.openDay && state >= 1) {
                if (this._tabItem) {
                    this._tabItem.getController("button").selectedIndex = 0;
                }
                this._tabItem = item;
                item.getController("button").selectedIndex = 1;
                this._tabIndex = index;
            }
            this._isFirst = false;
        }

        item.img_suo.visible = state == 0;
        // item.gp_tips.visible = false;
        item.T_tips.text = tabCfg.earlyTips;
        item.img_tips.width = item.T_tips.width + 10;

        item.clearClick();
        let self = this;
        if (state == 0) {
            item.onClick(() => {
                GIns.floatingTextMgr.showTips(tabCfg.tips);
            }, this);
        } else {
            item.onClick(() => {
                if (self._tabItem) {
                    self._tabItem.getController("button").selectedIndex = 0;
                }
                self._tabItem = item;
                item.getController("button").selectedIndex = 1;
                self._tabIndex = index;
                self.view.list_award.numItems = this._goodsMap[this._tabIndex + 1].length;
                GIns.redDotMgr.markRedDotForeverRead(RedDotKeys.GirlGroup_tab, [index]);
            }, this);
        }
    }

    //奖励
    private awardItemRenderer(index: number, item: GirlGroupAwardItem): void {
        let cfg = this._goodsMap[this._tabIndex + 1][index];
        item.setData(cfg, this._curDay);
    }

    // ----点击事件----
    //提示按钮
    private onBtnRuleClick(): void {
        RuleController.ins().openRule(EnumRuleKeys.GIRL_GROUP, this.view.btnRule);
    }

    //奖励按钮
    private onBtnAwardClick(evt: any): void {
        let btn = evt.currentTarget;
        switch (btn.name) {
            case "btn_award1": //每日应援
                if (!this._vo.playerVo.gainDailyReward) {
                    let data = {
                        activityId: this._vo.activityId,
                        itemId: "DAILY",
                        hidePopWin: 2,
                    } as ActivitySyncData;
                    GIns.activityModel.sendDrawItemReward(data);
                    this._vo.playerVo.gainDailyReward = true;
                } else {
                    GIns.floatingTextMgr.showTips("今日已应援");
                }
                break;
            case "btn_award2": //全服成团礼
                G.UIManager.open(UIGirlGroupKey.GirlGroupAllBuyWin);
                break;
        }
    }

    //113 -8协议返回处理
    private onReceiveData(args: any): void {
        let vo: Vo.activity.GirlGroupPlayerVo | Vo.activity.GirlGroupBuyGoodsVo | Vo.activity.GirlGroupVisitorVo;
        switch (args.key) {
            case "PLAYER_CHARGE": //自己充值
                vo = args.stuffVo as Vo.activity.GirlGroupPlayerVo;
                this._vo.buyGoodsIds = vo.goodsIds;
                let data1: DialogData = {
                    type: 2,
                    text: GIns.playerModel.Vo.name,
                };
                //@ts-ignore
                this.view.dialogBoxPage.addDialog(data1);
                this.updateUI();
                break;
            case "ENTER": //玩家进入
                vo = args.stuffVo as Vo.activity.GirlGroupVisitorVo;
                this.onPlayerEnter(vo);
                break;
            case "CHARGE": //其他人充值
                vo = args.stuffVo as Vo.activity.GirlGroupBuyGoodsVo;
                this._vo.totalBuyNum = vo.totalBuyNum;
                let data2: DialogData = {
                    type: 2,
                    text: vo.name,
                };
                //@ts-ignore
                this.view.dialogBoxPage.addDialog(data2);
                break;
        }
    }
}
