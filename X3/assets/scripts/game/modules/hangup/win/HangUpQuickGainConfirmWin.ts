import { Color } from "cc";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { DateUtils } from "db://assets/scripts/core/utils/DateUtils";
import { TimeUtils } from "db://assets/scripts/game/comm/utils/TimeUtils";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import GIns from "db://assets/scripts/game/GIns";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import { HangUpModel } from "db://assets/scripts/game/modules/hangup/model/HangUpModel";
import { HangUpUtils } from "db://assets/scripts/game/modules/hangup/utils/HangUpUtils";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { IAdPlayVo } from "../../ad/model/vo/IAdPlayVo";
import { HangUpUIKeys } from "../HangUpUIKeys";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { FguiGListUtils } from "db://assets/scripts/core/utils/FguiGListUtils";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { BtnChangGui1WithItem } from "../../common/btn/BtnChangGui1WithItem";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";


@bindScript(HangUpUIKeys.HangUpQuickGainConfirmWin)
export class HangUpQuickGainConfirmWin extends UICommWin {

    static pkgName: string = "hangUp";
    static viewName: string = "HangUpQuickGainConfirmWin";

    protected _rewards:{k:number, v:number}[] = [];

    private get view(): ui.hangUp.win.HangUpQuickGainConfirmWin {
        return this._view as any;
    }


    listenNotifications(): string[] {
        return [
            NotificationKey.HANG_UP_SPEED_UP_COUNT_CHANGE,
            NotificationKey.EVENT_CHANGE_ITEMS,
            NotificationKey.AD_GET_REWARD_COMPLETE
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.HANG_UP_SPEED_UP_COUNT_CHANGE:
                this.reset();
                break;
            case NotificationKey.EVENT_CHANGE_ITEMS:
                this.reset();
                break;
            case NotificationKey.AD_GET_REWARD_COMPLETE:
                if (args == ServerEnums.AdvertType.FAST_HANG_UP) {
                    this.resetAdUI();
                }
                break;
        }

    }


    protected onInit() {
        super.onInit();

        // this.view.btnNo.onClick(() => {
        //     this.closeSelf();
        // }, this);
        this.view.btnOk.onClick(this.onClickSpeedUp0, this);
        this.view.btnAd.onClick(this.onClickAd, this);
        this.view.btnItem.onClick(this.onClickItem, this);

        this.view.listReward.setVirtual();
        this.view.listReward.itemRenderer = this.itemRendererForReward.bind(this);

        GameTimer.ins().loop(30, this, this.updateRestTime);

        let btnItem = FguiScriptUtils.toMyScriptClass(this.view.btnItem, BtnChangGui1WithItem);
        btnItem.setLbStyle(1);
        let costs = HangUpUtils.getExtraFastHangUpCosts();
        let noOwnerItem = costs?.length > 0 ? NoOwnerItem.createByConfigKv(costs[0]) : NoOwnerItem.create(0, 0);
        btnItem.reset('快速挂机', noOwnerItem);

        let btnOk = FguiScriptUtils.toMyScriptClass(this.view.btnOk, BtnChangGui1WithItem);
        btnOk.setStyle(1);
        btnOk.setLbStyle(0);
    }

    protected onPreDispose() {
        GameTimer.ins().clearAll(this);

        super.onPreDispose();
    }


    protected onOpen(args: any, isReopen?: boolean) {
        super.onOpen(args, isReopen);

        this.reset();
        this._rewards = GIns.hangUpModel.context.getHangUpRewards(HangUpUtils.getExtraFastHangUpSeconds() * 1000);
        this.view.listReward.numItems = this._rewards.length;
    }

    protected itemRendererForReward(index:number, item:ItemFrameBtn):void {
        item.resetByConfigKv(this._rewards[index]);
    }

    // 挂机时间
    updateRestTime() {

        const restTimeMs = DateUtils.getNextDayRestTimeMs(TimeManager.serverNow);


        const timeText = TimeUtils.formatTimeMsToPositiveTimeText(restTimeMs);
        this.view.labelResetTime
            .setVar("time", timeText)
            .flushVars();
    }


    /**
     * 加速
     */
    onClickSpeedUp0() {
        console.debug(" onClickSpeedUp0 ")

        // 是否可以加速
        const result = HangUpModel.ins().isCanSpeedUp();
        if (result.isMaxTimesFlag) {
            GIns.floatingTextMgr.showTips("今日快速挂机次数已用完")
            return;
        }
        // if (!result.canSpeedUp) {
        //     GIns.floatingTextMgr.showTips("加速失败！")
        //     return;
        // }
        let btnOk = FguiScriptUtils.toMyScriptClass(this.view.btnOk, BtnChangGui1WithItem);
        if (btnOk.isCanPay() == false) {
            GIns.floatingTextMgr.showTips(btnOk.getNoPayTip());
            return;
        }
        // net
        HangUpModel.ins().sendDrawFastHangUpReward()
    }

    protected onClickAd(): void {
        let args: IAdPlayVo = {
            type: ServerEnums.AdvertType.FAST_HANG_UP
        }
        this.emit(NotificationKey.AD_START_PLAY, args)
    }

    protected onClickItem():void {
        let btnItem = FguiScriptUtils.toMyScriptClass(this.view.btnItem, BtnChangGui1WithItem);
        if (btnItem.isCanPay(true) == false) {
            GIns.floatingTextMgr.showTips(btnItem.getNoPayTip());
            return;
        }
        GIns.hangUpModel.sendDrawExtraFastHangUpReward();
    }

    reset() {
        this.updateRestTime();

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

        let btnOk = FguiScriptUtils.toMyScriptClass(this.view.btnOk, BtnChangGui1WithItem);

        const curSpeedUpCount = HangUpModel.ins().getSpeedUpCount();
        const maxSpeedUpHangUpCount = HangUpUtils.getMaxSpeedUpHangUpCount();
        const restSpeedUpCount = maxSpeedUpHangUpCount - curSpeedUpCount;

        let lbBtnOk:string = `次数(${restSpeedUpCount}/${maxSpeedUpHangUpCount})`
        // 加速结果
        const speedUpResult = HangUpModel.ins().isCanSpeedUp();
        let costItem = speedUpResult.costItem;
        // this.view.getController("isPay").selectedIndex = costItem == null ? 0 : 1;
        this.view.getController("isPay").selectedIndex = 0;
        if (costItem) {
            // 下面按钮
            btnOk.reset(lbBtnOk, costItem);
        } else {
            btnOk.reset(lbBtnOk, NoOwnerItem.create(1, 0));
        }
        // 不可以加速
        // if (speedUpResult.canSpeedUp) {
        //     this.view.btnOk.getChild('icon').grayed = false;
        // } else {
        //     this.view.btnOk.getChild('icon').grayed = true;
        // }
        // 加速最大次数 ?
        if (speedUpResult.isMaxTimesFlag) {
            this.view.btnOk.lbFree.text = "次数已用完";

        }
        this.resetAdUI()
    }

    public resetAdUI(): void {
        let todayAdvertGetFastHangUpFreeTimes = GIns.hangUpModel.context.todayAdvertGetFastHangUpFreeTimes
        let remianTimes = GIns.adModel.getRemainAdTimes(todayAdvertGetFastHangUpFreeTimes, ServerEnums.AdvertType.FAST_HANG_UP)
        if (remianTimes > 0) {
            let totalTimes = GIns.adModel.getTotalAdTimes(ServerEnums.AdvertType.FAST_HANG_UP)
            this.view.btnAd.visible = true
            this.view.btnAd.title = `免费快速挂机${remianTimes}/${totalTimes}`
        } else {
            this.view.btnAd.visible = false
        }
    }
}