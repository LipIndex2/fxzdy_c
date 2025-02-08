import * as fgui from "fairygui-cc";
import { FGUIMaskUtils } from "db://assets/scripts/game/ui/common/mask/FGUIMaskUtils";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { HangUpModel } from "db://assets/scripts/game/modules/hangup/model/HangUpModel";
import { TouchUtils } from "../../../../core/utils/TouchUtils";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";
import { TimeUtils } from "db://assets/scripts/game/comm/utils/TimeUtils";
import { HangUpUtils } from "db://assets/scripts/game/modules/hangup/utils/HangUpUtils";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import { Color } from "cc"
import { EnumHangUpType } from "db://assets/scripts/game/modules/hangup/context/HangUpContext";
import { HangUpI18nKeys } from "db://assets/scripts/game/modules/hangup/HangUpI18nKeys";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { CdUtils } from "db://assets/scripts/game/comm/utils/CdUtils";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import GIns from "../../../GIns";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { HangUpUIKeys } from "../HangUpUIKeys";
import { UICommWin, UIWinEffectType } from "../../../../core/mvc/view/UICommWin";


/**
 * 挂机奖励结算界面
 */
@bindScript(HangUpUIKeys.HangUpGainRewardView)
export class HangUpGainRewardView extends UICommWin {


    static pkgName: string = "hangUp";
    static viewName: string = "HangUpGainRewardView";

    /**不可以点击背景关闭 */
    protected _canCloseByBg = false;
    /**不需要弹窗动画 */
    protected _effectType: UIWinEffectType = UIWinEffectType.None;

    private _gainItemArray: Array<NoOwnerItem> = [];

    private get view(): ui.hangUp.HangUpGainRewardView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.HANG_UP_SPEED_UP_COUNT_CHANGE,
            NotificationKey.EVENT_CHANGE_ITEMS,
            NotificationKey.HANG_UP_GAIN_ITEM_RESULT,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.HANG_UP_SPEED_UP_COUNT_CHANGE:
                this.reset();
                break;
            case NotificationKey.HANG_UP_GAIN_ITEM_RESULT:
                this.onRespGainItems(args);
                break;
            case NotificationKey.EVENT_CHANGE_ITEMS:
                this.reset();
                break;
        }

    }

    public onInit(): void {
        console.debug(" onInit ")

        // i18n
        this.view.labelSpeedUpTips.text = HangUpI18nKeys.SPEED_UP_HANG_UP_TIPS;
        this.view.btnBuyMax.labelBuyMax.text = HangUpI18nKeys.BUY_HANG_UP_MAX_TIPS;
        this.view.labelMaxHangUpTimeDesc.text = HangUpI18nKeys.MAX_HANG_UP_HOUR;

        // outside
        this.view.onClick(this.onClick0, this);

        // gain
        this.view.btnGain.onClick(this.onClickGain, this);
        this.view.btnSpeedUp.onClick(this.onClickSpeedUp0, this);

        // 挂机奖励列表
        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = this.irItem.bind(this);

        // 挂机时间
        GameTimer.ins().frameLoop(30, this, this.updateHangUpTime.bind(this))
        // 挂机奖励
        // GameTimer.ins().frameLoop(30, this, this.updateRewardItemList.bind(this))
    }


    @CdUtils.ExecuteInCDTimeMs(1000, "挂机奖励领取 CD 中")
    onClickGain() {
        console.debug(" onClickGain ")

        if (this._gainItemArray.length > 0) {
            // net 领取奖励
            HangUpModel.ins().sendDrawHangUpReward()

        }

        // 策划说要关闭
        this.closeSelf()
    }

    /**
     * 加速
     */
    onClickSpeedUp0() {

        // 是否可以加速
        const result = HangUpModel.ins().isCanSpeedUp();
        if (result.isMaxTimesFlag) {
            GIns.floatingTextMgr.showTips("今日快速挂机次数已用完")
            return;
        }
        if (!result.canSpeedUp) {
            GIns.floatingTextMgr.showTips("加速失败！")
            return;
        }

        // net
        HangUpModel.ins().sendDrawFastHangUpReward()
    }

    public onOpen(): void {
        // bg mask
        // FGUIMaskUtils.createBackgroundMask(this.view)
        this.reset();
    }

    private reset() {
        // 图标
        const levelId = HangUpModel.ins().getMaxPassLevelId()
        const isPassAnyLevel: boolean = HangUpModel.ins().isPassAnyLevel()
        if (!isPassAnyLevel) {
            console.debug(`没有通关过任何一个关卡! leveId = ${levelId}`)
            return;
        }

        let config = TableManager.getDataById(table.trunkinstance.TrunkInstanceConfig, levelId);
        if (!config) {
            console.error(`找不到主线挂机关卡. levelId: ${levelId}`)
            return;
        }

        const curSpeedUpCount = HangUpModel.ins().getSpeedUpCount();
        const maxSpeedUpHangUpCount = HangUpUtils.getMaxSpeedUpHangUpCount();
        const restSpeedUpCount = maxSpeedUpHangUpCount - curSpeedUpCount;
        this.view.btnSpeedUp.labelSpeedUpCount
            .setVar("currentCount", restSpeedUpCount.toString())
            .setVar("maxCount", maxSpeedUpHangUpCount.toString())
            .flushVars();

        // 加速结果
        const speedUpResult = HangUpModel.ins().isCanSpeedUp();
        let costItem = speedUpResult.costItem;
        if (costItem) {
            this.view.btnSpeedUp.imageCost.icon = costItem.getItemSmallIconPath();
            this.view.btnSpeedUp.labelCost.text = costItem.count.toString();
            let isCanPay = BackpackManager.ins().isCanPayItem(costItem);
            if (isCanPay) {
                this.view.btnSpeedUp.labelCost.color = new Color("#FFFFFF");
            } else {
                this.view.btnSpeedUp.labelCost.color = new Color("#FF0000");
            }
        } else {
            this.view.btnSpeedUp.imageCost.visible = false;
            this.view.btnSpeedUp.labelCost.visible = false;
        }
        this.view.btnSpeedUp.getController("freeFlag").selectedIndex = speedUpResult.freeFlag ? 1 : 0;
        // 不可以加速
        if (speedUpResult.canSpeedUp) {
            this.view.btnSpeedUp.imageCost.visible = true;
            this.view.btnSpeedUp.labelCost.visible = true;
            this.view.btnSpeedUp.bg.grayed = false;
        } else {
            this.view.btnSpeedUp.bg.grayed = true;
        }
        // 加速最大次数 ?
        if (speedUpResult.isMaxTimesFlag) {
            this.view.btnSpeedUp.labelFree.text = "次数已用完";

        }

        // text

        let typeToUIMap = new Map([
            [EnumHangUpType.GOLD, this.view.tipsHangUpGold],
            [EnumHangUpType.EXP, this.view.tipsHangUpExp],
            [EnumHangUpType.LV_UP_ITEM, this.view.tipsHangUpLvUpItem]
        ]);
        HangUpUtils.handleHangUpUI(config, typeToUIMap)

        // 挂机奖励列表
        this.updateRewardItemList();

        // 挂机时间
        this.updateHangUpTime();
    }

    /**
     * 更新挂机时间
     */
    updateHangUpTime() {
        const hangUpTimeMs = HangUpModel.ins().getTotalHangUpTimeMs()

        if (hangUpTimeMs <= 0) {
            this.view.labelHangUpTime.text = TimeUtils.formatTimeMsToPositiveTimeText(0)
            return;
        }
        this.view.labelHangUpTime.text = TimeUtils.formatTimeMsToPositiveTimeText(hangUpTimeMs)
    }


    public onClose(): void {

        GameTimer.ins().clearAll(this)

        console.debug(" onClose ")


    }


    private onClick0(event: fgui.Event) {
        console.debug(event, " onTouchEnd ")

        // 点击空白处退出背包面板
        // let uiPos = event.getUILocation(v2(0, 0));
        let isIn = TouchUtils.isFguiTouchInUi(event, this.view.bg._uiTrans)
        if (isIn) {
            return
        }
        this.closeSelf()
    }

    private irItem(index: number, comp: ItemFrameBtn) {
        const item = this._gainItemArray[index];
        if (!item) {
            return
        }

        comp.reset(item.itemId, item.count)
    }

    onRespGainItems(itemIdToCountMap: Map<number, number>) {
        const noOwnerItems = (itemIdToCountMap || new Map()).toDataStream()
            .map(it => NoOwnerItem.create(it.key, it.value))
            .toArray();

        this._gainItemArray = noOwnerItems;
        this.view.itemList.numItems = noOwnerItems.length;
    }

    private updateRewardItemList() {

        // TODO 前端计算挂机奖励 废弃
        // let noOwnerItems = HangUpModel.ins().calcHangUpItemArray();
        // this._gainItemArray = noOwnerItems;
        // this.view.itemList.numItems = noOwnerItems.length;

        HangUpModel.ins().sendLoadHangUpRewardInfo();

    }
}