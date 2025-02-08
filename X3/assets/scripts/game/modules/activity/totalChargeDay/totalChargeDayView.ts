import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { ActivitySyncData } from "../../../comm/activity/model/ActivityModel";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { ActivityController, ETotalChargeDayState } from "../ActivityController";
import { UIActivityKey } from "../const/UIActivityConfig";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ItemListComp } from "../../common/item/ItemListComp";
import { UIChargeConfig } from "../../charge/const/UIChargeConfig";
import { HeaderItem } from "../../common/header/HeaderItem";
import { EnumCurrencyItemId } from "../../backpack/vo/BackpackContext";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { EnumRedDotShowType } from "../../common/redDot/enums/EnumRedDotShowType";
import { RuleController } from "../../rule/RuleController";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { ActivityTotalChargeDayVo } from "../model/ActivityTotalChargeDayVo";

let ETotalChargeDayState2SortOrder = {
    [ETotalChargeDayState.draw]: 0,
    [ETotalChargeDayState.notFinish]: 1,
    [ETotalChargeDayState.lock]: 2,
    [ETotalChargeDayState.hasDraw]: 3
}

/**累天充值 */
@bindScript(UIActivityKey.totalChargeDayView)
export class totalChargeDayView extends UIView {
    static pkgName: string = "totalChargeDay";
    static viewName: string = "totalChargeDayView";
    protected _layer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    private endTime: number;
    private mActivityClientConfig: table.activity.ActivityConstant.ActivityClientConfig;
    private mTotalChargeDayConfigList: table.activity.TotalChargeDay.TotalChargeDayConfig[];
    private mTotalChargeDayVo: Vo.activity.TotalChargeDayVo;

    private itemId2Index: Record<string, number> = {}
    private hasInit: Record<string, true> = {}

    private get view(): ui.totalChargeDay.totalChargeDayView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_END_REFRESH,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ACTIVITY_UPDATE:
                if (args == this.mActivityClientConfig.typeParam) {
                    this.sortList()
                    this.updateView();
                }
                break;
            case NotificationKey.ACTIVITY_END_REFRESH:
                let activityId = this.mActivityClientConfig.typeParam;
                if (args === activityId) {
                    this.closeSelf();
                }
                break;
        }
    }

    protected onInit(): void {
        let view = this.view;

        view.list.itemRenderer = this.rewardListCellRander.bind(this);
        view.list.setVirtual()

        view.btnRule.onClick(this.onShowRule, this);

        let headItem = this.view.headerItem as any as HeaderItem
        headItem.reset(EnumCurrencyItemId.DIAMOND, true)
    }

    protected onOpen(arge: table.activity.ActivityConstant.ActivityClientConfig, isReopen?: boolean): void {
        this.mActivityClientConfig = arge;
        this.mTotalChargeDayConfigList = ActivityController.ins().getTotalChargeDayViewCfgs(this.mActivityClientConfig.typeParam);

        this.sortList()
        this.updateView();
    }

    private updateView(): void {
        let vo = GIns.activityModel.getActivityVoById(this.mActivityClientConfig.typeParam) as ActivityTotalChargeDayVo;
        this.mTotalChargeDayVo = vo.activityVo;
        this.endTime = vo.endTime;


        this.clearTick();
        G.GameTimer.loop(1000, this, this.onEndTimeTick);
        this.onEndTimeTick();
        this.view.list.numItems = this.mTotalChargeDayConfigList.length;
        this.view.chargeDayTxt.text = `${this.mTotalChargeDayVo.chargeDay}/${this.mTotalChargeDayConfigList.length}天`
    }

    protected onClose(): void {
        this.clearTick();
    }

    //清除倒计时
    private clearTick() {
        G.GameTimer.clearAll(this);
    }

    //活动倒计时
    private onEndTimeTick(): void {
        let leftTime = this.endTime - G.TimeManager.serverNow;
        if (leftTime <= 0) {
            this.clearTick();
            return;
        }
        this.view.endTimeTxt.text = `${TimeUtils.formatTimeMsToDayHourMinuteSecond(leftTime)}`;
    }

    private sortList() {
        let actCtrl = ActivityController.ins()
        this.mTotalChargeDayConfigList.sort((ga, gb) => {
            // 列表排序 →可领取>进行中＞未解锁＞已领取→排序id降序
            let sa = actCtrl.getTotalChargeDayState(ga)
            let sb = actCtrl.getTotalChargeDayState(gb)
            let sortOrder: number
            if (sa != sb) {
                sortOrder = ETotalChargeDayState2SortOrder[sa] - ETotalChargeDayState2SortOrder[sb]
            } else {
                sortOrder = ga.id - gb.id
            }
            return sortOrder
        })
    }

    private rewardListCellRander(index: number, item: ui.totalChargeDay.com.totalChargeDayCell): void {
        let cfg = this.mTotalChargeDayConfigList[index];
        let { chargeDay } = cfg
        let activityId = this.mActivityClientConfig.typeParam;

        let c1 = item.getController("state");
        let state = ActivityController.ins().getTotalChargeDayState(cfg)
        c1.selectedIndex = state;

        item.taskName.text = `累计充值[color=#19df51]${chargeDay}[/color]天可领取`

        const noOwnerItems = ItemUtils.parseKvArrayToItemArray(cfg.rewards)
        if (state == ETotalChargeDayState.draw)
            ItemUtils.noOwnerItemEffect(noOwnerItems, cfg.effects)
        const itemListComp = FguiScriptUtils.toMyScriptClass(item.rewards, ItemListComp)
        itemListComp.reset(noOwnerItems)

        let vo = GIns.activityModel.getActivityVoById(activityId) as ActivityTotalChargeDayVo;
        if (vo) {
            let totalChargeDayVo: Vo.activity.TotalChargeDayVo = vo.activityVo
            let dailyMoney;
            if (state == ETotalChargeDayState.draw || state == ETotalChargeDayState.hasDraw) {
                dailyMoney = cfg.chargeMoney;
            } else {
                dailyMoney = totalChargeDayVo.dailyMoney;
            }
            item.progressTip.text = `${dailyMoney / 100}/${cfg.chargeMoney / 100}`
        }

        this.itemId2Index[item.id] = index
        if (!this.hasInit[item.id]) {
            this.hasInit[item.id] = true
            item.btn.onClick(() => {
                let index = this.itemId2Index[item.id]
                let cfg = this.mTotalChargeDayConfigList[index];
                let state = ActivityController.ins().getTotalChargeDayState(cfg)
                if (state == ETotalChargeDayState.draw) {
                    let msg: ActivitySyncData = {
                        activityId: activityId,
                        itemId: cfg.id.toString()
                    }
                    GIns.activityModel.sendDrawItemReward(msg);
                } else if (state == ETotalChargeDayState.notFinish) {
                    //跳转至每日特惠界面
                    G.UIManager.open(UIChargeConfig.CHARGE_MAIN_VIEW, { page: 3 })
                }
            })

            let redCom = item.btn.redDot as any as RedDotCom
            redCom.showByType(EnumRedDotShowType.REWARD)
        }
    }

    private onShowRule() {
        RuleController.ins().openRule(EnumRuleKeys.TOTAL_CHARGE_DAY, this.view.btnRule)
    }
}