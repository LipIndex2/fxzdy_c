import NotificationKey from "../../../../game/event/NotificationKey";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { DrawCardConfigManager } from "db://assets/scripts/game/modules/drawcard/config/DrawCardConfigManager";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import { math } from "cc";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { DrawCardTenCountButton } from "db://assets/scripts/game/modules/drawcard/components/DrawCardTenCountButton";
import { DrawCardModel } from "db://assets/scripts/game/modules/drawcard/model/DrawCardModel";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { DrawCardUIKeys } from "../DrawCardUIKeys";
import RecruitType = ServerEnums.RecruitType;

export class DrawCardEquipConfirmWinOpenArgs {
    type: ServerEnums.RecruitType

    static create(type: ServerEnums.RecruitType) {
        const args = new DrawCardEquipConfirmWinOpenArgs();
        args.type = type;
        return args;
    }
}

/**
 * 抽卡主界面
 */
@bindScript(DrawCardUIKeys.DrawCardEquipConfirmWin)
export class DrawCardEquipConfirmWin extends UICommWin {

    static pkgName: string = "drawCard";
    static viewName: string = "DrawCardEquipConfirmWin";

    private _type: RecruitType;

    private _showItem: NoOwnerItem;
    private _buyItem: NoOwnerItem;
    private _useCount: number = 1;
    private _isUse: boolean = false;


    private get view(): ui.drawCard.win.DrawCardEquipConfirmWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_CHANGE_ITEMS,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_CHANGE_ITEMS:
                this.reset();
                break;
        }

    }


    protected onInit() {

        super.onInit();

        this.view.btnAdd1.onClick(this.onClickAdd1, this);
        this.view.btnAdd10.onClick(this.onClickAdd10, this);
        this.view.btnMinus1.onClick(this.onClickMinus1, this);
        this.view.btnMinus10.onClick(this.onClickMinus10, this);
        this.view.btnMax.onClick(this.onClickMax, this);

        this.view.btnBuy.onClick(this.onClickBuy, this);
        this.view.btnUse.onClick(this.onClickUse, this);
    }

    onClickBuy() {
        // TODO 兑换

        if (this._type == ServerEnums.RecruitType.AWAKE_WEAPON_NORMAL) {
            DrawCardModel.ins().sendBuyAwakeWeaponRecruitCostItems({
                recruitId: 3,
                buyAmount: this._useCount
            });

        }
        if (this._type == ServerEnums.RecruitType.AWAKE_WEAPON_SPECIAL) {
            DrawCardModel.ins().sendBuyAwakeWeaponRecruitCostItems({
                recruitId: 4,
                buyAmount: this._useCount
            });

        }

        this.closeSelf();

    }

    onClickUse() {
        // TODO 播放动画

        if (this._type == ServerEnums.RecruitType.AWAKE_WEAPON_NORMAL) {
            DrawCardModel.ins().sendAwakeWeaponNormalRecruit({
                times: this._useCount
            });

        }
        if (this._type == ServerEnums.RecruitType.AWAKE_WEAPON_SPECIAL) {
            DrawCardModel.ins().sendAwakeWeaponSpecialRecruit({
                times: this._useCount
            });

        }

        this.closeSelf();
    }

    onClickAdd1() {
        this.add(1);
    }

    onClickAdd10() {
        this.add(10);
    }

    onClickMinus1() {
        this.add(-1);
    }

    onClickMinus10() {
        this.add(-10);
    }

    onClickMax() {
        this.add(99999999);
    }

    add(count: number) {
        const curCount = this.view.labelCount.text.toInt();
        const showItem = this._showItem;

        let maxCount = 0;
        if (this._isUse) {
            maxCount = BackpackManager.ins().getItemCountByItem(showItem);
        } else {
            maxCount = BackpackManager.ins().getMaxCanPayCount(this._buyItem);
        }
        // 最多10个
        const finalCount = math.clamp(curCount + count, 1, Math.min(10, maxCount));

        this._useCount = finalCount;
        this.view.labelCount.text = finalCount.toString();

        this.reset();
    }


    protected onOpen(args: DrawCardEquipConfirmWinOpenArgs, isReopen?: boolean) {

        this._type = args.type;
        let typeConfig = DrawCardConfigManager.getDrawCardConfigById(this._type);

        // item
        let showItem = ItemUtils.parseKvArrayToOnlyOneItem(typeConfig.costItems);
        let buyItem = ItemUtils.parseKvArrayToOnlyOneItem(typeConfig.costItems2);

        this._showItem = showItem;
        this._buyItem = buyItem;

        this.reset();
    }


    reset() {

        const showItem = this._showItem;

        // 目标道具
        const itemFrameBtn = FguiScriptUtils.toMyScriptClass(this.view.itemShow, ItemFrameBtn);

        // buy / use ?
        const haveCount = BackpackManager.ins().getItemCountByItemId(showItem.itemId);
        const isHaveCount = haveCount > 0;
        this._isUse = isHaveCount;
        this.view.getController("isHave").selectedIndex = isHaveCount ? 1 : 0;

        const haveItem = showItem.clone();
        haveItem.count = haveCount;
        itemFrameBtn.resetByNoOwnerItem(haveItem);

        // 道具名
        const itemName = showItem.getItemNameToI18n();
        if (this._isUse) {
            // use
            this.view.labelTips.text = `拥有${itemName} [color=#ffd248]×${haveCount}[/color]`;

            const btn = FguiScriptUtils.toMyScriptClass(this.view.btnBuy, DrawCardTenCountButton);
            btn.reset(this._type, showItem, this._useCount, false);
        } else {
            // buy
            this.view.labelTips.text = `购买${itemName} [color=#FF0000]×${this._useCount}[/color]`;

            const btn = FguiScriptUtils.toMyScriptClass(this.view.btnBuy, DrawCardTenCountButton);
            btn.reset(this._type, this._buyItem, this._useCount, true);
        }
        this.view.labelCount.text = this._useCount.toString();

    }


}