import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { LeagueBargainUIKeys } from "db://assets/scripts/game/modules/leagueBargain/LeagueBargainUIKeys";
import { LeagueBargainBuyItemComp } from "db://assets/scripts/game/modules/leagueBargain/item/LeagueBargainBuyItemComp";
import { LeagueModel } from "db://assets/scripts/game/modules/league/LeagueModel";
import {
    LeagueBargainConfigManager
} from "db://assets/scripts/game/modules/leagueBargain/config/LeagueBargainConfigManager";
import {
    LeagueBargainRewardComp
} from "db://assets/scripts/game/modules/leagueBargain/components/LeagueBargainRewardComp";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { LeagueBargainManager } from "db://assets/scripts/game/modules/leagueBargain/LeagueBargainManager";
import { RuleController } from "db://assets/scripts/game/modules/rule/RuleController";
import { EnumRuleKeys } from "db://assets/scripts/game/modules/rule/enums/EnumRuleKeys";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { UIItemKeys } from "db://assets/scripts/game/modules/item/UIItemKeys";
import { ItemCostConfirmViewOpenArgs } from "db://assets/scripts/game/modules/item/view/confirm/ItemCostConfirmView";
import { TimeUtils } from "db://assets/scripts/game/comm/utils/TimeUtils";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";

@bindScript(LeagueBargainUIKeys.LeagueBargainMainView)
export class LeagueBargainMainView extends UICommWin {

    static pkgName = "leagueBargain"
    static viewName = "LeagueBargainMainView"

    private _datas: Vo.league.LeagueBargainMemberVo[] = [];
    private _config: table.league.LeagueBargainGiftConfig;
    private _isBuy: boolean;
    private _rewards: NoOwnerItem[] = [];

    get view(): ui.leagueBargain.LeagueBargainMainView {
        return this._view as any;
    }


    listenNotifications(): string[] {
        return [
            NotificationKey.LEAGUE_BARGAIN_UPDATE,
            NotificationKey.LEAGUE_BARGAIN_NEW,
            NotificationKey.LEAGUE_BARGAIN_CLOSE,
            NotificationKey.EVENT_EXIT_LEAGUE,
        ]
    }

    notificationHandler(event: string, args?: any) {
        switch (event) {
            case           NotificationKey.EVENT_EXIT_LEAGUE : {
                UIManager.ins().close(UIItemKeys.ItemCostConfirmView);
                this.closeSelf();
                break;
            }
            case           NotificationKey.LEAGUE_BARGAIN_UPDATE : {
                this.reset();
                break;
            }
            case           NotificationKey.LEAGUE_BARGAIN_NEW : {
                this.playAnim(args);
                break;
            }
            case           NotificationKey.LEAGUE_BARGAIN_CLOSE : {
                UIManager.ins().close(UIItemKeys.ItemCostConfirmView);
                FloatingTextManager.ins().showTips("活动已结束");
                this.closeSelf();
                break;
            }
        }
    }

    protected onInit() {
        super.onInit();
        this.view.floatItem.visible = false;

        LeagueBargainManager.ins().sendLoadInit();

        this.view.rowList.setVirtual();
        this.view.rowList.itemRenderer = this.irItem.bind(this);
        // this.view.rowList.onClick(this.onClickDetails, this);
        // this.view.btnInfo.onClick(this.onClickInfo, this);
        this.view.btnInfo.onClick(this.onClickDetails, this);
        this.view.btnRule.onClick(this.onClickRule, this);

        this.view.btnKill.onClick(this.onClickKill, this);
        this.view.btnBuy.onClick(this.onClickBuy, this);

        GameTimer.ins().loop(1000, this, this.updateTime);

        this.updateTime();

        FguiScriptUtils.toMyScriptClass(this.view.btnKill.redDot, RedDotCom).reset(RedDotKeys.leagueBargain_kill);
    }

    protected onClose(dontDispose: boolean = false) {
        GameTimer.ins().clearAll(this);

    }

    updateTime() {
        const bargainContext = LeagueModel.ins().bargainContext;
        if (!bargainContext.isOpen()) {
            this.view.labelTime.text = "未开启"
            return;
        }

        if (bargainContext.getDiffTimeMs() <= 0) {
            FloatingTextManager.ins().showTips("砍价已结束");
            this.closeSelf();
            return;
        }

        const restTimeText = bargainContext.getRestTimeText();
        this.view.labelTime.text = `${restTimeText}`;
    }

    onClickDetails() {
        UIManager.ins().open(LeagueBargainUIKeys.LeagueBargainInfoWin);
    }

    onClickRule() {
        RuleController.ins().openRule(EnumRuleKeys.LEAGUE_BARGAIN, this.view.btnRule);
    }

    onClickKill() {
        const context = LeagueModel.ins().bargainContext;

        // CD 中
        const restCdTimeMs: number = context.getRestCdTimeMs();
        if (restCdTimeMs > 0) {
            const restTimeText = TimeUtils.formatTimeMsToPositiveTimeText(restCdTimeMs);
            FloatingTextManager.ins().showTips(`${restTimeText}后才能再次砍价`);

            return;
        }

        LeagueModel.ins().sendBargainGift();
    }

    onClickBuy() {
        const context = LeagueModel.ins().bargainContext;

        const costItem: NoOwnerItem = context.getCostItem();

        UIManager.ins().open(UIItemKeys.ItemCostConfirmView,
            ItemCostConfirmViewOpenArgs.create(
                true,
                costItem,
                "确认花费",
                "购买礼包?",
                "(建议所有联盟成员砍价后购买)",
                () => {
                    LeagueModel.ins().sendBuyBargainGift();
                }
            ));
    }

    protected onOpen(args: any, isReopen?: boolean) {
        super.onOpen(args, isReopen);

        this.reset();
    }

    irItem(index: number, comp: LeagueBargainBuyItemComp) {

        comp.reset(index, this._datas[index], this._config);

    }

    private reset() {
        const context = LeagueModel.ins().bargainContext;

        if (!context.isOpen()) {
            Logger.warn("联盟砍价 未开启")
            return;
        }

        const bargainGiftId = context.data?.bargainGiftId || 0;
        const config = LeagueBargainConfigManager.getGiftConfigById(bargainGiftId);
        if (!config) {
            return;
        }
        this._config = config;

        // msg
        const rate = context.getHaveDiscountRate10000();
        this.view.textMsg.text = LeagueBargainConfigManager.getMessageByRate(rate);


        const isHaveKill = context.isHaveKill();
        const isBuy = context.isBuy();

        this.view.getController("isHaveKill").selectedIndex = isHaveKill ? 1 : 0;
        this.view.getController("isBuy").selectedIndex = isBuy ? 1 : 0;
        this._datas = context.getHaveDiscountMemberInfoArray();
        this.view.rowList.numItems = this._datas.length;

        // price
        this.view.labelMoneyOld.text = `${context.getMaxPrice()}`;
        this.view.labelMoneyNew.text = `${context.getMoneyNew()}`;
        this.view.labelHaveDiscountMoney.text = `${context.getHaveDiscountMoney()}`;

        const discountPersonCount = context.getDiscountPersonCount();
        const maxCount = context.getMaxPersonCount();
        this.view.labelPerson.text = `当前 [color=#00ffd8]${discountPersonCount}/${maxCount}[/color] 人累计议价   `;

        const noOwnerItems = ItemUtils.parseKvArrayToItemArray(config.rewards);
        this._rewards = noOwnerItems;

        const arr = [
            this.view.r1,
            this.view.r2,
            this.view.r3,
            this.view.r4,
        ];
        for (let i = 0; i < arr.length; i++) {
            const comp = arr[i] as any as LeagueBargainRewardComp;
            const item = noOwnerItems[i];
            comp.reset(item)
        }
    }

    private playAnim(minusPrice: number) {
        this.view.floatItem.visible = true;
        this.view.floatItem.labelCount.text = `-${minusPrice}`;
        this.view.getTransition("float").play(() => {
            this.view.floatItem.visible = false;
        });
    }
}