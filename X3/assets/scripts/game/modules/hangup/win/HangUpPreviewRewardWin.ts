import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { HangUpModel } from "db://assets/scripts/game/modules/hangup/model/HangUpModel";
import { TimeUtils } from "db://assets/scripts/game/comm/utils/TimeUtils";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { EnumHangUpType } from "db://assets/scripts/game/modules/hangup/context/HangUpContext";
import { HangUpUtils } from "db://assets/scripts/game/modules/hangup/utils/HangUpUtils";
import { HangUpConfigManager } from "db://assets/scripts/game/modules/hangup/config/HangUpConfigManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { HangUpUIKeys } from "../HangUpUIKeys";


@bindScript(HangUpUIKeys.HangUpPreviewRewardWin)
export class HangUpPreviewRewardWin extends UICommWin {

    static pkgName: string = "hangUp";
    static viewName: string = "HangUpPreviewRewardWin";

    private _gainItemArray: Array<NoOwnerItem> = [];


    private get view(): ui.hangUp.win.HangUpPreviewRewardWin {
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


    protected onInit() {
        super.onInit();

        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = this.irItem.bind(this);

        this.view.btnOk.onClick(this.onClickGain, this);

        GameTimer.ins().loop(30, this, this.updateHangUpTime);
    }

    protected onPreDispose() {
        GameTimer.ins().clearAll(this);

        super.onPreDispose();
    }


    protected onClose() {
        // 关闭领取奖励
        HangUpModel.ins().sendDrawHangUpReward()

        super.onClose();
    }

    protected onOpen(args: any, isReopen?: boolean) {
        super.onOpen(args, isReopen);

        this.reset();
    }

    // 挂机时间
    updateHangUpTime() {

        const hangUpTimeMs: number = HangUpModel.ins().getTotalHangUpTimeMs();

        this.view.labelHangUpTime.text = TimeUtils.formatTimeMsToPositiveTimeText(hangUpTimeMs);
    }

    reset() {
        // 最大通关关卡
        const levelId = HangUpModel.ins().getMaxPassLevelId()

        // 是否通过任意一个关卡
        const isPassAnyLevel: boolean = HangUpModel.ins().isPassAnyLevel()
        if (!isPassAnyLevel) {
            console.debug(`没有通关过任何一个关卡! leveId = ${levelId}`)
            return;
        }


        let config = HangUpConfigManager.getConfigById(levelId);
        if (!config) {
            console.error(`找不到主线挂机关卡. levelId: ${levelId}`)
            return;
        }

        // net 挂机奖励
        HangUpModel.ins().sendLoadHangUpRewardInfo();
        // 挂机时间
        this.updateHangUpTime();


        let typeToUIMap = new Map([
            [EnumHangUpType.GOLD, this.view.tipsHangUpGold],
            [EnumHangUpType.EXP, this.view.tipsHangUpExp],
            [EnumHangUpType.LV_UP_ITEM, this.view.tipsHangUpLvUpItem]
        ]);
        HangUpUtils.handleHangUpUI(config, typeToUIMap)

    }


    private irItem(index: number, comp: ItemFrameBtn) {
        const item = this._gainItemArray[index];
        if (!item) {
            return
        }

        comp.reset(item.itemId, item.count);
    }


    onClickGain() {
        console.debug(" onClickGain ")

        // 策划说要关闭
        this.closeSelf()
    }

    onRespGainItems(itemIdToCountMap: Map<number, number>) {
        const noOwnerItems = (itemIdToCountMap || new Map()).toDataStream()
            .map(it => NoOwnerItem.create(it.key, it.value))
            .toArray();

        this._gainItemArray = noOwnerItems;
        this.view.itemList.numItems = noOwnerItems.length;
    }
}