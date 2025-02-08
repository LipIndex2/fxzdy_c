import G from "db://assets/scripts/core/comm/G";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { ColorUtils } from "db://assets/scripts/core/utils/ColorUtils";
import { DateUtils } from "db://assets/scripts/core/utils/DateUtils";
import { TimeUtils } from "db://assets/scripts/game/comm/utils/TimeUtils";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { EnumRedDotShowType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotShowType";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import { DrawCardConfigManager } from "db://assets/scripts/game/modules/drawcard/config/DrawCardConfigManager";
import { DrawCardManager } from "db://assets/scripts/game/modules/drawcard/DrawCardManager";
import { EnumDrawCardTabType } from "db://assets/scripts/game/modules/drawcard/enums/EnumDrawCardTabType";
import { DrawCardModel } from "db://assets/scripts/game/modules/drawcard/model/DrawCardModel";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import GIns from "../../../GIns";
import RecruitType = ServerEnums.RecruitType;


/**
 * 抽卡按钮
 */
@bindFguiExtension("ui://drawCard/DrawStateComp")
export class DrawStateComp extends FGUI.GComponent implements INotification {
    private _curTab: EnumDrawCardTabType;
    protected _isAdDraw: boolean = false

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_CHANGE_ITEMS,
            NotificationKey.DRAW_CARD_AD_TIMES_RESET,
        ]
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_CHANGE_ITEMS: {
                this.refreshRedDot(this._curTab);
                break;
            }
            case NotificationKey.DRAW_CARD_AD_TIMES_RESET: {
                this.reset(this._curTab);
                break;
            }

        }
    }


    protected onInit() {

        FacadeManager.ins().registerNotification(this);
        //去除免费倒计时
        this.view.labelTipsFree.text = "";
        // GameTimer.ins().frameLoop(30, this, this.onFrame);
    }


    protected onPreDispose() {
        GameTimer.ins().clearAll(this);
        FacadeManager.ins().removeNotification(this);
    }

    onFrame() {
        if (this._curTab != EnumDrawCardTabType.WEAPON) {
            this.view.labelTipsFree.text = "";
            return;
        }
        const currentEpochTimeMs = TimeManager.serverNow;
        const nextResetTime = DateUtils.getNextResetTimeByResetHour(currentEpochTimeMs, 0);
        const diffTimeMs = nextResetTime - currentEpochTimeMs;
        const text = TimeUtils.formatTimeMsToPositiveTimeText(diffTimeMs);

        this.view.labelTipsFree.text = `${text}后免费`;
    }

    get view(): ui.drawCard.components.DrawStateComp {
        return this as any;
    }

    reset(curTab: EnumDrawCardTabType) {
        this._curTab = curTab;

        let leftItem: NoOwnerItem;
        let rightItem: NoOwnerItem;


        if (curTab == EnumDrawCardTabType.NORMAL) {
            const drawCardConfigById = DrawCardConfigManager.getDrawCardConfigById(ServerEnums.RecruitType.NORMAL);
            if (!drawCardConfigById) {
                G.Logger.error(`抽卡配置不存在. tab = ${curTab}`)
                return;
            }

            // 消耗
            leftItem = ItemUtils.parseKvArrayToOnlyOneItem(drawCardConfigById.costItems);
            rightItem = leftItem?.multiply(10);
        }
        if (curTab == EnumDrawCardTabType.SPECIAL_HERO) {
            const drawCardConfigById = DrawCardConfigManager.getDrawCardConfigById(ServerEnums.RecruitType.SPECIAL);
            if (!drawCardConfigById) {
                G.Logger.error(`抽卡配置不存在. tab = ${curTab}`)
                return;
            }

            // 消耗
            leftItem = ItemUtils.parseKvArrayToOnlyOneItem(drawCardConfigById.costItems);
            rightItem = leftItem?.multiply(10);
        }
        if (curTab == EnumDrawCardTabType.WEAPON) {
            const config1 = DrawCardConfigManager.getDrawCardConfigById(ServerEnums.RecruitType.AWAKE_WEAPON_NORMAL);
            if (!config1) {
                G.Logger.error(`抽卡配置不存在. tab = ${curTab}`)
                return;
            }
            const config2 = DrawCardConfigManager.getDrawCardConfigById(ServerEnums.RecruitType.AWAKE_WEAPON_SPECIAL);
            if (!config2) {
                G.Logger.error(`抽卡配置不存在. tab = ${curTab}`)
                return;
            }

            // 消耗
            leftItem = ItemUtils.parseKvArrayToOnlyOneItem(config1.costItems);
            rightItem = ItemUtils.parseKvArrayToOnlyOneItem(config2.costItems);
        }

        this.resetButton(curTab, leftItem, rightItem);

        this.refreshRedDot(curTab);
    }

    private resetButton(tab: EnumDrawCardTabType,
        leftItem: NoOwnerItem,
        rightItem: NoOwnerItem
    ) {
        const context = DrawCardModel.ins().context;


        const isCanPay1 = BackpackManager.ins().isCanPayItem(leftItem, false);
        const isCanPay10 = BackpackManager.ins().isCanPayItem(rightItem, false);

        // tab
        this.view.getController("tabIndex").selectedIndex = this._curTab;


        // 按钮里的道具图标
        this.view.buttonDraw1.costCom.imageItem.icon = leftItem.getItemSmallIconPath();
        this.view.buttonDraw10.costCom.imageItem.icon = rightItem.getItemSmallIconPath();

        // 数量
        this.view.buttonDraw1.costCom.labelCount.text = "" + leftItem.count;
        this.view.buttonDraw10.costCom.labelCount.text = "" + rightItem.count;

        this.view.buttonDraw1.costCom.getController("canPayFlag").selectedIndex = isCanPay1 ? 1 : 0;
        this.view.buttonDraw10.costCom.getController("canPayFlag").selectedIndex = isCanPay10 ? 1 : 0;

        // 字体颜色 = 是否能支付
        // if (isCanPay1) {
        //     this.view.buttonDraw1.labelItemCount.color = ColorUtils.COLOR_WHITE;
        //     this.view.buttonDraw1.labelItemCount.stroke = 3;
        // } else {
        //     this.view.buttonDraw1.labelItemCount.color = ColorUtils.COLOR_RED;
        //     this.view.buttonDraw1.labelItemCount.stroke = 1;
        // }
        // if (isCanPay10) {
        //     this.view.buttonDraw10.labelItemCount.color = ColorUtils.COLOR_WHITE;
        //     this.view.buttonDraw10.labelItemCount.stroke = 3;
        // } else {
        //     this.view.buttonDraw10.labelItemCount.color = ColorUtils.COLOR_RED;
        //     this.view.buttonDraw10.labelItemCount.stroke = 1;
        // }

        // weapon
        if (this._curTab == EnumDrawCardTabType.WEAPON) {
            // free draw weapon
            if (context.isHaveWeaponFreeDrawCount()) {
                this.view.buttonDraw1.costCom.labelCount.color = ColorUtils.COLOR_WHITE;
                this.view.buttonDraw1.costCom.labelCount.stroke = 3;
            }


        }

        let count = +TableManager.getDataById(table.recruit.RecruitConstantConfig, "RECRUIT:SPECIAL_GUARANTEE_TIMES").content;
        this.view.labelDesc3.text = `${count - DrawCardManager.ins().specialTotalGuarantee}`;
        this._isAdDraw = false
        if (this._curTab == EnumDrawCardTabType.WEAPON) {
            this.view.buttonDraw1.labelBig.text = "普通招募";
            this.view.buttonDraw10.labelBig.text = "高级招募";

            //去除免费次数
            this.view.getController("isFree").selectedIndex = 0;
            // 免费次数
            // const isHave = context.isHaveWeaponFreeDrawCount();
            // this._isAdDraw = GIns.adModel.getRemainAdTimes(GIns.drawCardModel.context.weaponAdDrawCount, ServerEnums.AdvertType.WEAPON_RECRUIT) > 0
            // this.view.getController("isFree").selectedIndex = isHave || this._isAdDraw ? 1 : 0;
            // if (isHave) {
            //     this.view.buttonDraw1.costCom.labelCount.text = "免费";
            // }
            // 保底
            const restEnsureTimes = context.getRestEnsureTimes(ServerEnums.RecruitType.AWAKE_WEAPON_SPECIAL);
            this.view.labelTipsPay.text = `${restEnsureTimes}次后必得橙色专武`;
        } else {
            this.view.getController("isFree").selectedIndex = 0
        }
        this.view.buttonDraw1.getController('isAd').selectedIndex = this._isAdDraw ? 1 : 0

        let remainTimes: number = 0;
        let totalTimes: number = 0;
        let isUnlock: boolean = false;
        if (this._curTab == EnumDrawCardTabType.NORMAL) {
            remainTimes = GIns.adModel.getRemainAdTimes(context.normalAdTimes, ServerEnums.AdvertType.NORMAL_RECRUIT);
            totalTimes = GIns.adModel.getTotalAdTimes(ServerEnums.AdvertType.NORMAL_RECRUIT);
            isUnlock = GIns.drawCardModel.context.isUnlockAdNormal;
        } else if (this._curTab == EnumDrawCardTabType.WEAPON) {
            remainTimes = GIns.adModel.getRemainAdTimes(context.weaponAdDrawCount, ServerEnums.AdvertType.WEAPON_RECRUIT);
            totalTimes = GIns.adModel.getTotalAdTimes(ServerEnums.AdvertType.WEAPON_RECRUIT);
            isUnlock = GIns.drawCardModel.context.isUnlockAdWeapon;
        }
        if (isUnlock && remainTimes > 0) {
            //有剩余次数
            this.view.btnAd.visible = true;
            this.view.btnAd.iconTop.icon = leftItem.getItemSmallIconPath();
            this.view.btnAd.lbTimesTop.text = `x1`;
            this.view.btnAd.title = `免费招募${remainTimes}/${totalTimes}`;
            let redDotAd = RedDotUtils.castComp(this.view.btnAd.redDot2);
            redDotAd.showByType(EnumRedDotShowType.REWARD);
        } else {
            this.view.btnAd.visible = false;
        }
    }

    protected resetAdBtn(): void {

    }


    private refreshRedDot(curTab: EnumDrawCardTabType) {
        const redDotCom1 = RedDotUtils.castComp(this.view.redDot1);

        const redDotCom2 = RedDotUtils.castComp(this.view.redDot2);

        // 十连抽的红点机制一直改... 注释的代码就是不同的人药的效果不一样
        const context = DrawCardModel.ins().context;
        if (curTab == EnumDrawCardTabType.NORMAL) {
            redDotCom1.reset(RedDotKeys.Null);

            const isCan10 = context.isCanDraw10(RecruitType.NORMAL)
            if (isCan10) {
                redDotCom2.showByType(EnumRedDotShowType.HIGH);
                // redDotCom2.reset(RedDotKeys.drawCard_normalHero_draw10);
            } else {
                // redDotCom2.reset(RedDotKeys.Null);
                redDotCom2.showByType(EnumRedDotShowType.NULL);
            }
        }
        if (curTab == EnumDrawCardTabType.SPECIAL_HERO) {
            redDotCom1.reset(RedDotKeys.Null);

            const isCan10 = context.isCanDraw10(RecruitType.SPECIAL)
            if (isCan10) {
                redDotCom2.showByType(EnumRedDotShowType.HIGH);
                // redDotCom2.reset(RedDotKeys.drawCard_chooseHero_draw10);
            } else {
                // redDotCom2.reset(RedDotKeys.Null);
                redDotCom2.showByType(EnumRedDotShowType.NULL);
            }
        }

        if (curTab == EnumDrawCardTabType.WEAPON) {
            const isHave = context.isHaveWeaponFreeDrawCount();
            if (isHave) {
                redDotCom1.reset(RedDotKeys.drawCard_equip_free);
            } else {
                redDotCom1.reset(RedDotKeys.Null);
            }

            const isCan10 = context.isCanDraw10(RecruitType.AWAKE_WEAPON_SPECIAL)
            if (isCan10) {
                redDotCom2.showByType(EnumRedDotShowType.HIGH);
                // redDotCom2.reset(RedDotKeys.drawCard_equip_draw10);
            } else {
                // redDotCom2.reset(RedDotKeys.Null);
                redDotCom2.showByType(EnumRedDotShowType.NULL);
            }

        }

        // if (this.view.btnAd.visible) {
        //     let redDotAd = RedDotUtils.castComp(this.view.btnAd.redDotTop);
        //     if (curTab == EnumDrawCardTabType.NORMAL) {
        //         redDotAd.reset(RedDotKeys.drawCard_normalHero_ad);
        //     } else if (curTab == EnumDrawCardTabType.WEAPON) {
        //         redDotAd.reset(RedDotKeys.drawCard_equip_ad);
        //     }
        // }
    }

    public get isAdDraw(): boolean {
        return this._isAdDraw
    }
}