import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ActivitySyncData } from "../../../comm/activity/model/ActivityModel";
import GIns from "../../../GIns";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { HeaderItem } from "../../common/header/HeaderItem";
import { QualityUtils } from "../../common/quality/QualityUtils";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { RuleController } from "../../rule/RuleController";
import { UIActivityKey } from "../const/UIActivityConfig";
import { ActivitySummonHeroVo } from "../model/ActivitySummonHeroVo";
import NotificationKey from "../../../event/NotificationKey";
import { UIGainKeys } from "../../gain/const/UIGainKeys";
import { ModelNode } from "../../common/node/ModelNode";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { UIManager } from "../../../../core/mvc/UIManager";
import { tween } from "cc";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { EnumRedDotShowType } from "../../common/redDot/enums/EnumRedDotShowType";
import { UICommonKey } from "../../common/const/UICommonConfig";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";

/**
 * 抽奖活动组3
 * 召唤英雄 -- 主界面
 */
@bindScript(UIActivityKey.SummonHeroMainView)
export class SummonHeroMainView extends UIView {
    static pkgName: string = "activitySummonHero";
    static viewName: string = "SummonHeroMainView";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    private get view(): ui.activitySummonHero.SummonHeroMainView {
        return this._view as any;
    }

    private _vo: ActivitySummonHeroVo;
    private _ruleId: number = 0;

    private _count: number;

    listenNotifications(): string[] {
        return [
            NotificationKey.ACTIVITY_UPDATE + "_CALL",
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_END_REFRESH,
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.ACTIVITY_REQUEST_BACK,
            NotificationKey.LOTTERY_GROUP_NEW_BIG_REWARD,
        ];
    }
    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ACTIVITY_UPDATE + "_CALL":
                //抽奖返回
                this.playAnim(args);
                break;
            case NotificationKey.ACTIVITY_UPDATE:
                if (args === this._vo.activityId) {
                    GIns.activityModel.sendActivity(this._vo.activityId);
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
            case NotificationKey.LOTTERY_GROUP_NEW_BIG_REWARD:
                //@ts-ignore
                this.view.dialogPage.addDialog(this._vo.record[this._vo.record.length - 1]);
                break;
            default:
                break;
        }
    }

    onInit() {
        this.view.list_award.setVirtual();
        this.view.list_award.itemRenderer = this.awardItemRenderer.bind(this);

        this.view.btnRule.on(fgui.Event.CLICK, this.onRuleClick, this);
        this.view.btn_get1.on(fgui.Event.CLICK, this.onGetClick.bind(this, 1), this);
        this.view.btn_get10.on(fgui.Event.CLICK, this.onGetClick.bind(this, 10), this);
        this.view.skipItem.on(fgui.Event.CLICK, this.onSkipClick, this);

        this.view.btn_shuaxin.on(fgui.Event.CLICK, this.onOpenBigWin, this);
        this.view.btn_shiwan.on(fgui.Event.CLICK, this.onClickShiWan, this);
        this.view.demoGetBtn.on(fgui.Event.CLICK, this.onGetDemoReward, this);
    }

    onOpen(args: any, isReopen?: boolean) {
        if (args) {
            this._vo = GIns.activityModel.getActivityVoById(args.typeParam) as ActivitySummonHeroVo;
            this._ruleId = args.ruleId;
        }
        if (!this._vo) {
            this.closeSelf();
            return;
        }

        FguiScriptUtils.toMyScriptClass(this.view.headerItem, HeaderItem).reset(this._vo.cfg.costItems[0].k, true, true);

        this.view.T_name1.text = args.name;
        let name = this.view.T_name1.text;
        this._vo.title = name;
        this.view.T_name1.text = this.view.T_name2.text = this.view.T_name3.text = name[0];
        this.view.T_name4.text = this.view.T_name5.text = this.view.T_name6.text = name.slice(1, name.length);

        this.view.skipItem.getController("c1").selectedIndex = this._vo.skipAnimation ? 1 : 0;
        this.updateUI();
        //@ts-ignore
        this.view.dialogPage.setActivityVo(this._vo);
        if (this._vo.record.length > 0) {
            //@ts-ignore
            this.view.dialogPage.addDialog(this._vo.record[0]);
        }
    }

    private updateUI() {
        this.view.btn_shiwan.visible = !!this._vo.cfg.trialId;

        let rewardItem = ItemUtils.parseKvArrayToOnlyOneItem(this._vo.cfg.trialRewards);
        this.view.demoGetBtn.demoRewardLab.text = `x${rewardItem.count}`;
        this.view.demoGetBtn.demoRewardItem.icon = rewardItem.getItemSmallIconPath();
        this.view.demoGetBtn.visible = !this._vo.activityVo.receivedTrialReward;
        FguiScriptUtils.toMyScriptClass(this.view.demoGetBtn.redDot, RedDotCom).showByType(
            this._vo.activityVo.passTrial && !this._vo.activityVo.receivedTrialReward ? EnumRedDotShowType.REWARD : EnumRedDotShowType.NULL
        );

        if (!this._vo.bigRewardId) {
            this.onClickShiwan();
        }

        //奖励预览
        this.view.list_award.numItems = this._vo.roundCfg.awardArray.length;

        //@ts-ignore 大奖
        this.view.awardItem.reset(this._vo.bigRewardId, 1);
        let heroVo = GIns.heroMgr.getHeroVoByID(this._vo.bigRewardId);
        this.view.T_name.text = heroVo.heroCfg.name;
        QualityUtils.setFGUIFontColorByQuality(this.view.T_name, heroVo.heroCfg.quality);

        if (!this._count) {
            this._count = this._vo.miniCount;
            this.view.T_count.text = `${this._vo.miniCount}`;
        } else {
            //播放动画
            if (this._count != this._vo.miniCount) {
                this._count = this._vo.miniCount;

                this.selAnim();
            }
        }

        //@ts-ignore 模型
        this.view.modelNode.loadByModelId(heroVo.heroCfg.showModelId);
        this.view.modelNode.setScale(3, 3);

        //招募按钮状态
        let costItem = NoOwnerItem.createByConfigKv(this._vo.cfg.costItems[0]);
        const totalCostItems = costItem.multiply(10);
        //@ts-ignore
        this.view.btn_get10.reset("招募10次", totalCostItems);
        //@ts-ignore
        this.view.btn_get1.reset("招募1次", costItem);

        if (this._vo.isAllRoundFinish) {
            this.view.btn_get10.grayed = true;
            this.view.btn_get1.grayed = true;
        } else {
            this.view.btn_get10.grayed = false;
            this.view.btn_get1.grayed = false;
        }

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

    protected onClose(dontDispose?: boolean): void {
        G.GameTimer.clearAll(this);
    }

    private _starTextPosY: number;
    private selAnim() {
        if (!this._starTextPosY) this._starTextPosY = this.view.T_count.y;
        this.view.T_count2.visible = true;

        //上一关， 往下翻
        this.view.T_count2.y = this._starTextPosY - 50;
        this.view.T_count2.alpha = 0;
        this.view.T_count2.text = this._count + "";
        // this.view.T_count.text = this._count + 1 + "";
        tween(this.view.T_count)
            .to(0.4, { y: this._starTextPosY + 50, alpha: 0 })
            .call(() => {
                this.view.T_count2.alpha = 0;
                this.view.T_count.y = this._starTextPosY;
                this.view.T_count.alpha = 1;
                this.updateUI();

                this.view.T_count.text = `${this._vo.miniCount}`;
            })
            .start();
        tween(this.view.T_count2).to(0.4, { y: this._starTextPosY, alpha: 1 }).start();
    }

    //预览奖励
    private awardItemRenderer(index: number, item: ui.activitySummonHero.awardItem) {
        let itemData = this._vo.roundCfg.awardArray[index];
        if (itemData.k == this._vo.roundCfg.jackpotId) {
            //@ts-ignore
            item.item.reset(this._vo.bigRewardId, itemData.v);
        } else if (itemData.k == this._vo.roundCfg.secondId) {
            //@ts-ignore
            item.item.reset(this._vo.secondRewardId, itemData.v);
        } else {
            //@ts-ignore
            item.item.reset(itemData.k, itemData.v);
        }

        let pop = this._vo.roundCfg.probability[index];
        item.T_pop.text = `${pop}%`;
    }

    //预选大奖
    private onClickShiwan() {
        //可选次数
        let itemId = this._vo.roundCfg.jackpotId;
        let count = this._vo.getBigRewardLeftChooseCount(itemId);
        if (count == 0) {
            for (let i = 0; i < this._vo.roundCfg.jackpots.length; i++) {
                if (this._vo.getBigRewardLeftChooseCount(this._vo.roundCfg.jackpots[i]) != 0) {
                    itemId = this._vo.roundCfg.jackpots[i];
                    break;
                }
            }
        }
        this._vo.bigRewardId = itemId;
        let syncData = {
            activityId: this._vo.activityId,
            itemId: "JACKPOT",
            hidePopWin: 1,
            otherParams: this._vo.bigRewardId.toString(),
        } as ActivitySyncData;
        GIns.activityModel.sendBuyGoods(syncData);
    }

    //抽奖动画
    protected playAnim(vo: any): void {
        if (this._vo.skipAnimation) {
            this.onPlayDrawAnim(vo);
            return;
        }
        //打开遮罩
        G.UIManager.open(UICommonKey.TouchMaskWin);
        let aniNode = this.view.aniNode as ModelNode;
        aniNode.loadByPath("spine/ui/shengjibiaoxian/shengjibiaoxian1_upper");
        aniNode.playOrders([
            {
                name: "enter",
                isLoop: false,
                callbackForComplete: () => {
                    this.onPlayDrawAnim(vo);
                },
            },
        ]);
    }

    //抽奖返回
    private onPlayDrawAnim(vo: any) {
        let data = vo.addition as Vo.activity.CallHeroResultVo;
        this._vo.miniCount = data.guaranteeTimes;

        //关闭遮罩
        G.UIManager.close(UICommonKey.TouchMaskWin);
        //更新积分
        G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, data.scoreRewardResults);

        // G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, vo.rewards);
        // 这个是纯弹出
        let items = ItemUtils.convertToNoOwnerItemArrayByServerRewards(vo.rewards);
        FacadeManager.ins().emit(NotificationKey.EVENT_GAIN_ITEM_POP_UP, items);

        //是否中大奖
        if (data.triggerJackpot) {
            GIns.activityModel.sendActivity(this._vo.activityId);
            GIns.floatingTextMgr.showTips("恭喜您获得本轮大奖！");
        } else {
            this.updateUI();
        }
    }

    private onRuleClick() {
        RuleController.ins().openRule(this._ruleId, this.view.btnRule);
    }

    private onGetClick(drawCount: number) {
        if (this._vo.isAllRoundFinish) {
            GIns.floatingTextMgr.showTips("本轮活动已结束！");
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
                itemId: "CALL",
                times: drawCount,
                key: "CALL",
                hidePopWin: 1,
            } as ActivitySyncData;
            GIns.activityModel.sendActionByKey(syncData);
            return;
        } else {
            GIns.floatingTextMgr.showTips("消耗道具不足");
            GIns.backpackMgr.isCanPayItem(totalCostItems, true);
        }
    }

    private onSkipClick() {
        this._vo.skipAnimation = !this._vo.skipAnimation;
        this.view.skipItem.getController("c1").selectedIndex = this._vo.skipAnimation ? 1 : 0;
    }

    private onOpenBigWin() {
        UIManager.ins().open(UIActivityKey.SummonHeroChooseBigRewardWin, this._vo);
    }

    private onClickShiWan() {
        GIns.careerTrialModel.sendEnterBattle(this._vo.cfg.trialId);
    }

    //领取参与奖
    private onGetDemoReward() {
        if (!this._vo.activityVo.passTrial) {
            GIns.floatingTextMgr.showTips("试玩阵容后可领取");
            return;
        }

        if (this._vo.activityVo.receivedTrialReward) {
            return;
        }

        let syncData = {
            activityId: this._vo.activityId,
            itemId: "",
            hidePopWin: 2,
        } as ActivitySyncData;
        GIns.activityModel.sendDrawItemReward(syncData);
    }
}
