import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import GIns from "../../../GIns";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { HeaderItem } from "../../common/header/HeaderItem";
import { RuleController } from "../../rule/RuleController";
import { UIActivityKey } from "../const/UIActivityConfig";
import { ActivityRouletteLotteryVo } from "../model/ActivityRouletteLotteryVo";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { ActivitySyncData } from "../../../comm/activity/model/ActivityModel";
import NotificationKey from "../../../event/NotificationKey";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import { UIGainKeys } from "../../gain/const/UIGainKeys";

/**
 * 抽奖活动组2
 * 轮盘抽奖 -- 主界面
 */
@bindScript(UIActivityKey.RouletteLotteryMainView)
export class RouletteLotteryMainView extends UIView {
    static pkgName: string = "activityRouletteLottery";
    static viewName: string = "RouletteLotteryMainView";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    private get view(): ui.activityRouletteLottery.RouletteLotteryMainView {
        return this._view as any;
    }

    private _vo: ActivityRouletteLotteryVo;

    private _ruleId: number = 0;

    listenNotifications(): string[] {
        return [
            NotificationKey.ACTIVITY_UPDATE + "_NEXT_ROUND",
            NotificationKey.ACTIVITY_UPDATE + "_LOTTERY",
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_END_REFRESH,
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.ACTIVITY_REQUEST_BACK,
            NotificationKey.CLOSE_ViEW,
        ];
    }
    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ACTIVITY_UPDATE + "_NEXT_ROUND":
                GIns.activityModel.sendActivity(this._vo.activityId);
                break;
            case NotificationKey.ACTIVITY_UPDATE + "_LOTTERY":
                //抽奖返回
                this.onPlayDrawAnim(args);
                break;
            case NotificationKey.ACTIVITY_UPDATE:
                if (args === this._vo.activityId) {
                    // GIns.activityModel.sendActivity(this._vo.activityId);
                    this.updateUI();
                }
                break;
            case NotificationKey.ACTIVITY_END_REFRESH:
                if (args === this._vo.activityId) {
                    this.closeSelf();
                }
                break;
            case NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK:
                if (args === this._vo.activityId) {
                    this._vo = GIns.activityModel.getActivityVoById(args);
                    this.updateUI();
                }
                break;
            case NotificationKey.ACTIVITY_REQUEST_BACK:
                this.updateUI();
                break;
            case NotificationKey.CLOSE_ViEW:
                if (args == UIGainKeys.GainItemPopUpView) {
                    let count = this._vo.getPoolLeftGetCount(this._vo.jackpotPoolCfg.id);
                    if (count == 0 && this._vo.isShowTip) {
                        this._vo.openNextWin();
                    }
                }
                break;
            default:
                break;
        }
    }

    onInit() {
        this.view.btnRule.on(fgui.Event.CLICK, this.onRuleClick, this);
        this.view.btn_one.on(fgui.Event.CLICK, this.onGetClick.bind(this, 1), this);
        this.view.btn_ten.on(fgui.Event.CLICK, this.onGetClick.bind(this, 10), this);
        this.view.skipItem.on(fgui.Event.CLICK, this.onSkipClick, this);
    }

    onOpen(args: any, isReopen?: boolean) {
        if (args) {
            this._vo = GIns.activityModel.getActivityVoById(args.typeParam) as ActivityRouletteLotteryVo;
            this._ruleId = args.ruleId;
        }
        if (!this._vo) {
            this.closeSelf();
            return;
        }

        FguiScriptUtils.toMyScriptClass(this.view.headerItem, HeaderItem).reset(this._vo.cfg.costItems[0].k, true, true);

        this.view.T_name1.text = args.name;
        let name = this.view.T_name1.text;
        this.view.T_name1.text = this.view.T_name2.text = this.view.T_name3.text = name[0];
        this.view.T_name4.text = this.view.T_name5.text = this.view.T_name6.text = name.slice(1, name.length);

        this.updateUI();
    }

    private updateUI() {
        //是否跳过动画
        this.view.skipItem.getController("c1").selectedIndex = this._vo.skipAnimation ? 1 : 0;

        //@ts-ignore  当前轮盘状态
        this.view.page.setData(this._vo);

        //招募按钮状态
        let costItem = NoOwnerItem.createByConfigKv(this._vo.cfg.costItems[0]);
        const totalCostItems = costItem.multiply(10);
        //@ts-ignore
        this.view.btn_ten.reset("转动10次", totalCostItems);
        //@ts-ignore
        this.view.btn_one.reset("转动1次", costItem);

        //当前大奖轮次
        this.view.T_round.text = `大奖轮次:[color=#FFEC6C]第${this._vo.round}轮[/color]`;

        //本次活动大奖
        this.view.T_awardName.text = this._vo.cfg.awardDesc;
        this.view.T_bigAward.text = `抽中全部大奖[color=#FFCD54](${this._vo.bigRewardChooseCount}/3)[/color]可获得余下[color=#FF5656]所有奖励[/color]`;

        //倒计时
        this.onTimer();
        G.GameTimer.loop(1000, this, this.onTimer);
    }

    private onTimer() {
        let time = this._vo.getLeftTime();
        if (time > 0) {
            let timeTest = TimeUtils.formatTimeMsToDayHourMinuteSecondText(time);
            this.view.T_time.text = `活动倒计时:[color=#3CFE37]${timeTest}[/color]`;
        } else {
            this.view.T_time.text = "";
        }
    }

    private onRuleClick() {
        RuleController.ins().openRule(this._ruleId, this.view.btnRule);
    }

    private onGetClick(drawCount: number) {
        if (this._vo.isAllRoundFinish) {
            GIns.floatingTextMgr.showTips("恭喜您已获得全部奖励！");
            return;
        }

        //消耗道具
        let costItem = ItemUtils.parseKvArrayToOnlyOneItem(this._vo.cfg.costItems);

        const totalCostItems = costItem.multiply(drawCount);
        const result = GIns.backpackMgr.isCanPayReturnResult([totalCostItems]);

        if (result.isCanPay) {
            // 抽奖
            //@ts-ignore
            // this.view.page.showDrawAnim1(drawCount);
            let syncData = {
                activityId: this._vo.activityId,
                itemId: "LOTTERY",
                times: drawCount,
                key: "LOTTERY",
                hidePopWin: 1,
            } as ActivitySyncData;
            GIns.activityModel.sendActionByKey(syncData);
            return;
        } else {
            GIns.floatingTextMgr.showTips("消耗道具不足");
            GIns.backpackMgr.isCanPayItem(totalCostItems, true);
        }
    }

    //播放抽奖动画
    private onPlayDrawAnim(vo: any) {
        // if (this._vo.skipAnimation) {
        // }

        //@ts-ignore  当前轮盘状态
        this.view.page.onPlayDrawAnim(vo);

        // if (vo.activityId != this._vo.activityId) return;

        // //数据更新
        // let data = vo.addition as Vo.activity.RouletteLotteryResultVo;
        // for (let id of data.rewardIds) {
        //     this._vo.addPoolGetCount(id);
        // }

        // let rewards = [];
        // if (data.takeAll) {
        //     G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, data.extraRewardResults);
        //     GIns.activityModel.sendActivity(this._vo.activityId);

        //     //合并两组奖励
        //     rewards = rewards.concat(data.extraRewardResults, vo.rewards);
        // } else {
        //     rewards = vo.rewards;
        // }
        // // 这个是纯弹出
        // let items = ItemUtils.convertToNoOwnerItemArrayByServerRewards(rewards);
        // FacadeManager.ins().emit(NotificationKey.EVENT_GAIN_ITEM_POP_UP, items);

        // this.updateUI();
    }

    private onSkipClick() {
        this._vo.skipAnimation = !this._vo.skipAnimation;
        this.view.skipItem.getController("c1").selectedIndex = this._vo.skipAnimation ? 1 : 0;
    }

    protected onClose(dontDispose?: boolean): void {
        G.GameTimer.clearAll(this);
    }
}
