import { Tween } from "cc";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import GIns from "db://assets/scripts/game/GIns";
import { DrawCardTabBtn } from "db://assets/scripts/game/modules/drawcard/btn/DrawCardTabBtn";
import { DrawStateComp } from "db://assets/scripts/game/modules/drawcard/components/DrawStateComp";
import { DrawCardConfigManager } from "db://assets/scripts/game/modules/drawcard/config/DrawCardConfigManager";
import { DrawCardUIKeys } from "db://assets/scripts/game/modules/drawcard/DrawCardUIKeys";
import { EnumDrawCardTabType } from "db://assets/scripts/game/modules/drawcard/enums/EnumDrawCardTabType";
import { EventDrawCardNetResult } from "db://assets/scripts/game/modules/drawcard/event/EventDrawCardNetResult";
import { DrawCardEquipPage } from "db://assets/scripts/game/modules/drawcard/tabPage/DrawCardEquipPage";
import { DrawCardNormalPage } from "db://assets/scripts/game/modules/drawcard/tabPage/DrawCardNormalPage";
import { DrawCardUtils } from "db://assets/scripts/game/modules/drawcard/utils/DrawCardUtils";
import { DrawCardEquipConfirmWinOpenArgs } from "db://assets/scripts/game/modules/drawcard/view/DrawCardEquipConfirmWin";
import { DrawCardResultViewOpenArgs } from "db://assets/scripts/game/modules/drawcard/view/DrawCardResultView";
import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { LogBusiness } from "../../../../core/log/LogBusiness";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import NotificationKey from "../../../../game/event/NotificationKey";
import { BackpackManager } from "../../../../game/modules/backpack/BackpackManager";
import { NoOwnerItem } from "../../../../game/modules/backpack/vo/NoOwnerItem";
import { DrawCardModel } from "../../../../game/modules/drawcard/model/DrawCardModel";
import { ItemUtils } from "../../../../game/modules/item/utils/ItemUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { AudioManager, SoundType } from "../../../comm/mgr/AudioManager";
import { IAdPlayVo } from "../../ad/model/vo/IAdPlayVo";
import { UICommonKey } from "../../common/const/UICommonConfig";
import { ModelNode } from "../../common/node/ModelNode";
import { DrawCardManager } from "../DrawCardManager";
import { DrawCardAdvancedPage } from "../tabPage/DrawCardAdvancedPage";
import { EnumRedDotReadType } from "../../common/redDot/enums/EnumRedDotReadType";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";

/**
 * 抽卡主界面
 */
@bindScript(DrawCardUIKeys.DrawCardNormalView)
export class DrawCardNormalView extends UIView {
    static pkgName: string = "drawCard";
    static viewName: string = "DrawCardNormalView";

    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    //当前抽奖类型
    private _type: ServerEnums.RecruitType = ServerEnums.RecruitType.NORMAL;
    // 当前页签
    private _curTabType: EnumDrawCardTabType = EnumDrawCardTabType.NORMAL;
    // 配置
    private _config: table.recruit.RecruitConfig;
    // 抽一发需要消耗的道具
    private _costItemPerDraw: NoOwnerItem;
    // 替代消耗道具
    private _costItemPerDraw2: NoOwnerItem;

    // right, 抽一发需要消耗的道具
    private _costItemPerDraw11: NoOwnerItem;
    // right, 替代消耗道具
    private _costItemPerDraw12: NoOwnerItem;
    private _anim1: Tween<FGUI.GComponent>;

    /**item 宽度 */
    private readonly _ItemWidth = 330 + 35;
    // tab
    private _tabArray: EnumDrawCardTabType[] = [];

    private get view(): ui.drawCard.DrawCardNormalView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_CHANGE_ITEMS,
            NotificationKey.DRAW_CARD_STATE_CHANGE,
            NotificationKey.DRAW_CARD_UPDATE_HERO_INFO,
            NotificationKey.DRAW_CARD_PLAY_GET_ANIM,
            NotificationKey.DRAW_CARD_RESULT_ANIM,
            NotificationKey.AD_GET_REWARD_COMPLETE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_CHANGE_ITEMS:
                this.updateUI();
                break;
            case NotificationKey.DRAW_CARD_STATE_CHANGE:
                this.updateUI();
                break;
            case NotificationKey.DRAW_CARD_UPDATE_HERO_INFO:
                //@ts-ignore    高级招募
                this.view.advancedPage.updateUI();
                break;
            case NotificationKey.DRAW_CARD_PLAY_GET_ANIM:
                this.playDrawCardAnim(args);
                break;
            case NotificationKey.DRAW_CARD_RESULT_ANIM:
                this.playDrawCardResultAnim(args);
                break;
            case NotificationKey.AD_GET_REWARD_COMPLETE:
                if (args == ServerEnums.AdvertType.WEAPON_RECRUIT) {
                    this.resetButtonState();
                }
                break;
        }
    }

    protected onInit() {
        super.onInit();
        GIns.redDotMgr.markRead(EnumRedDotReadType.ONCE, RedDotKeys.drawCard_draw);
        //跳过动画
        this.view.skipAnimButton.onClick(this.onClickSkipAnimButton, this);
        // 抽卡
        this.view.drawComp.buttonDraw1.onClick(this.clickDraw1, this);
        this.view.drawComp.buttonDraw10.onClick(this.clickDraw10, this);

        this.view.drawComp.btnAd.onClick(this.onClickAd, this);

        this.view.list_tab.itemRenderer = this.irTab.bind(this);
        this.view.list_tab.on(FGUI.Event.CLICK_ITEM, this.onClickItem, this);

        this.view.getTransition("t0").play();

        this.view.getController("tabIndex").selectedIndex = 0;
    }

    // 头顶道具图标
    private resetHeaderIcon() {
        if (this._curTabType == EnumDrawCardTabType.NORMAL) {
            // 道具1
            this.view.headItem1.visible = true;
            const itemId1 = DrawCardConfigManager.getHeadIcon1ItemId();
            const itemConfig1 = ItemUtils.getItemConfigByItemId(itemId1);
            if (itemConfig1) {
                this.view.headItem1.imageItem.icon = itemConfig1.smallIconPath;
                this.view.headItem1.labelItemCount.text = "" + BackpackManager.ins().getItemCountByItemId(itemId1);
            }

            // 道具2
            const itemId2 = DrawCardConfigManager.getHeadIcon2ItemId();
            const itemConfig2 = ItemUtils.getItemConfigByItemId(itemId2);
            if (itemConfig2) {
                this.view.headItem2.imageItem.icon = itemConfig2.smallIconPath;
                this.view.headItem2.labelItemCount.text = "" + BackpackManager.ins().getItemCountByItemId(itemId2);
            }
        } else if (this._curTabType == EnumDrawCardTabType.SPECIAL_HERO) {
            this.view.headItem1.visible = false;
            // 道具2
            const cfg = DrawCardConfigManager.getDrawCardConfigById(this._type);
            const itemId2 = cfg.costItems[0].k;
            const itemConfig2 = ItemUtils.getItemConfigByItemId(itemId2);
            if (itemConfig2) {
                this.view.headItem2.imageItem.icon = itemConfig2.smallIconPath;
                this.view.headItem2.labelItemCount.text = "" + BackpackManager.ins().getItemCountByItemId(itemId2);
            }
        } else if (this._curTabType == EnumDrawCardTabType.WEAPON) {
            this.view.headItem1.visible = true;
            // 道具1
            const c1 = DrawCardConfigManager.getDrawCardConfigById(ServerEnums.RecruitType.AWAKE_WEAPON_NORMAL);
            const c2 = DrawCardConfigManager.getDrawCardConfigById(ServerEnums.RecruitType.AWAKE_WEAPON_SPECIAL);

            const itemId1 = c1.costItems[0]?.k;
            const itemConfig1 = ItemUtils.getItemConfigByItemId(itemId1);
            this.view.headItem1.imageItem.icon = itemConfig1.smallIconPath;
            this.view.headItem1.labelItemCount.text = "" + BackpackManager.ins().getItemCountByItemId(itemId1);

            const itemId2 = c2.costItems[0]?.k;
            const itemConfig2 = ItemUtils.getItemConfigByItemId(itemId2);
            this.view.headItem2.imageItem.icon = itemConfig2.smallIconPath;
            this.view.headItem2.labelItemCount.text = "" + BackpackManager.ins().getItemCountByItemId(itemId2);
        }
    }

    protected onOpen(type: ServerEnums.RecruitType) {
        if (type) {
            this._type = type;
        }

        // 转成 tabIndex
        this._curTabType = DrawCardUtils.getTabIndexByType(this._type);

        const context = DrawCardModel.ins().context;
        const tabArray = context.getCanSeeTabArray();

        if (tabArray.length > 2) {
            this.view.list_tab.setVirtualAndLoop();
        } else {
            this.view.list_tab.setVirtual();
        }
        this._tabArray = tabArray;
        this.view.list_tab.numItems = tabArray.length;
        this.view.getController("tabIndex").selectedIndex = 0;

        //@ts-ignore    普通抽奖
        this.view.normalPage.onOpen();
        // 高级招募
        FguiScriptUtils.toMyScriptClass(this.view.advancedPage, DrawCardAdvancedPage).updateUI();

        this.updateUI();
        // 跳过动画
        this.resetSkipButton();

        this.setTab(this._curTabType);
    }

    protected onClose() {
        [this.view.normalPage.d1, this.view.normalPage.d2, this.view.normalPage.d3, this.view.normalPage.d4].forEach((it) => {
            it.clearClick();
        });

        this._anim1?.stop();
        super.onClose();
    }

    @LogBusiness("抽 1 次卡 | 左边")
    private clickDraw1() {
        const context = DrawCardModel.ins().context;
        // 武器特殊的
        if (this._curTabType == EnumDrawCardTabType.WEAPON) {
            // let comp = FguiScriptUtils.toMyScriptClass(this.view.drawComp, DrawStateComp);
            // if (comp.isAdDraw) {
            //     //播放广告
            //     let args: IAdPlayVo = {
            //         type: ServerEnums.AdvertType.WEAPON_RECRUIT,
            //     };
            //     this.emit(NotificationKey.AD_START_PLAY, args);
            //     return;
            // }
            // 如果有免费次数, 直接抽
            // 如果只有一张, 也直接抽
            if (context.isHaveWeaponFreeDrawCount() || context.isJustHave1DrawItem(ServerEnums.RecruitType.AWAKE_WEAPON_NORMAL)) {
                DrawCardModel.ins().sendAwakeWeaponNormalRecruit({
                    times: 1,
                });

                return;
            }

            // win
            UIManager.ins().open(DrawCardUIKeys.DrawCardEquipConfirmWin, DrawCardEquipConfirmWinOpenArgs.create(ServerEnums.RecruitType.AWAKE_WEAPON_NORMAL));

            return;
        }

        // 常规的
        const costItemPerDraw = this._costItemPerDraw;

        if (!this.isNeedSetUpHero()) {
            return;
        }

        // 10次卡
        const costItem10 = costItemPerDraw.multiply(1);
        const result = BackpackManager.ins().isCanPayReturnResult([costItem10]);

        if (result.isCanPay) {
            // 抽
            this.drawCard(false);
            return;
        }

        const missingCount = result.calculateMissingCount(costItemPerDraw.itemId, costItemPerDraw.count);
        if (missingCount <= 0) {
            return;
        }

        // 兑换的数量
        const missingItem = costItemPerDraw.multiply(missingCount);
        GIns.drawCardMgr.showExchangeConfirmView(this._type, missingItem, () => {
            this.drawCard(false);
        });

        // // 补充道具
        // const fromItem = this._costItemPerDraw2.multiply(missingCount);

        // let self = this;
        // // 兑换确认
        // G.UIManager.open(
        //     UIItemKeys.ItemExchangeConfirmView,
        //     ItemExchangeConfirmViewOpenArgs.create(fromItem, missingItem, () => {
        //         // 抽 1
        //         self.drawCard(false);
        //     })
        // );
    }

    @LogBusiness("抽 10 次卡 | 右边")
    private clickDraw10() {
        const context = DrawCardModel.ins().context;

        // 武器特殊的
        if (this._curTabType == EnumDrawCardTabType.WEAPON) {
            // 1抽直接抽
            if (context.isJustHave1DrawItem(ServerEnums.RecruitType.AWAKE_WEAPON_SPECIAL)) {
                DrawCardModel.ins().sendAwakeWeaponSpecialRecruit({
                    times: 1,
                });
                return;
            }
            const costItemPerDraw11 = this._costItemPerDraw11;
            const result = BackpackManager.ins().isCanPayReturnResult([costItemPerDraw11]);

            // not can pay
            if (!result.isCanPay) {
                GIns.floatingTextMgr.showTips("道具不足");

                // FacadeManager.ins().emit(NotificationKey.EVENT_ITEM_GET_WAY_POP_UP, costItemPerDraw11.itemId);

                // 道具来源 2
                // const itemId1 = costItemPerDraw11.itemId;
                // const needCount = costItemPerDraw11.count;
                // FacadeManager.ins().emit(NotificationKey.EVENT_ITEM_GET_WAY_POP_UP_2, [itemId1, needCount]);
                BackpackManager.ins().isCanPayItem(costItemPerDraw11, true);
                return;
            }

            // win
            UIManager.ins().open(DrawCardUIKeys.DrawCardEquipConfirmWin, DrawCardEquipConfirmWinOpenArgs.create(ServerEnums.RecruitType.AWAKE_WEAPON_SPECIAL));

            return;
        }

        const costItemPerDraw = this._costItemPerDraw;

        if (!this.isNeedSetUpHero()) {
            return;
        }

        // 10次卡
        const costItem10: NoOwnerItem = costItemPerDraw.multiply(10);

        const result = BackpackManager.ins().isCanPayReturnResult([costItem10]);

        if (result.isCanPay) {
            // 抽 10
            this.drawCard(true);
            return;
        }

        const missingCount = result.calculateMissingCount(costItemPerDraw.itemId, costItemPerDraw.count);
        if (missingCount <= 0) {
            return;
        }

        // 兑换的数量
        const missingItem = costItemPerDraw.multiply(missingCount);

        GIns.drawCardMgr.showExchangeConfirmView(this._type, missingItem, () => {
            this.drawCard(true);
        });

        // // 补充道具
        // const fromItem = this._costItemPerDraw2.multiply(missingCount);

        // let self = this;
        // // 兑换确认
        // G.UIManager.open(
        //     UIItemKeys.ItemExchangeConfirmView,
        //     ItemExchangeConfirmViewOpenArgs.create(fromItem, missingItem, () => {
        //         // 抽 10
        //         self.drawCard(true);
        //     })
        // );
    }

    protected onClickAd(): void {
        //播放广告
        if (this._curTabType == EnumDrawCardTabType.NORMAL) {
            let args: IAdPlayVo = {
                type: ServerEnums.AdvertType.NORMAL_RECRUIT,
            };
            this.emit(NotificationKey.AD_START_PLAY, args);
        } else if (this._curTabType == EnumDrawCardTabType.WEAPON) {
            let args: IAdPlayVo = {
                type: ServerEnums.AdvertType.WEAPON_RECRUIT,
            };
            this.emit(NotificationKey.AD_START_PLAY, args);
        }
    }

    //抽奖
    private drawCard(isDraw10: boolean) {
        if (this._curTabType == EnumDrawCardTabType.NORMAL) {
            DrawCardModel.ins().sendNormalRecruit({
                oneKey: isDraw10,
                advert: false,
            });
        } else if (this._curTabType == EnumDrawCardTabType.SPECIAL_HERO) {
            this.showDrawSpecialCardEffect(isDraw10);
        } else if (this._curTabType == EnumDrawCardTabType.WEAPON) {
            // ignored
        }
    }

    private showDrawSpecialCardEffect(oneKey: boolean): void {
        if (DrawCardModel.ins().skipAnimFlag) {
            this.drawSpecialCardHandler(oneKey);
            return;
        }

        G.UIManager.open(UICommonKey.TouchMaskWin);
        // DrawCardManager.ins().isDrawCardIng = true;
        const modelNode1 = this.view.modelNode1 as ModelNode;
        modelNode1.loadByModelId(10010050, false);

        const modelNode2 = this.view.modelNode1 as ModelNode;
        modelNode2.loadByModelId(10010051, false);

        GameTimer.ins().once(700, this, this.drawSpecialCardHandler, [oneKey]);
        FguiScriptUtils.toMyScriptClass(this.view.advancedPage, DrawCardAdvancedPage).playDrawEffect();
    }

    private drawSpecialCardHandler(oneKey: boolean): void {
        DrawCardModel.ins().sendSpecialRecruit({
            oneKey: oneKey,
        });
        G.UIManager.close(UICommonKey.TouchMaskWin);
    }

    //播放抽奖动画
    private playDrawCardAnim(args: { data: any; c2s: any }) {
        if (!DrawCardModel.ins().skipAnimFlag && !DrawCardManager.ins()._isAwardWin) {
            if (this._type == ServerEnums.RecruitType.NORMAL) {
                // 普通抽奖动画
                FguiScriptUtils.toMyScriptClass(this.view.normalPage, DrawCardNormalPage).playerAnim(args.data, args.c2s);
            }
        } else {
            if (this._type == ServerEnums.RecruitType.NORMAL) {
                DrawCardManager.ins().recNormalRecruit(args.data, args.c2s);
            }
        }
        DrawCardManager.ins()._isAwardWin = false;
    }

    //判断是否有设置心愿英雄
    private isNeedSetUpHero() {
        if (this._type == ServerEnums.RecruitType.SPECIAL) {
            if (DrawCardManager.ins().upHeroId > 0) {
                return true;
            }
            GIns.floatingTextMgr.showTips("请先设置心愿英雄");
            return false;
        }
        return true;
    }

    private clickBack() {
        AudioManager.ins().playSound(SoundType.winBack);
        this.closeSelf();
    }

    protected onPreDispose() {
        GameTimer.ins().clearAll(this);
        super.onPreDispose();
    }

    private updateUI() {
        this.updateData();

        // 头顶道具图标
        this.resetHeaderIcon();

        // 按钮
        this.resetButtonState();

        this.updatePageUI();
    }

    private updatePageUI() {
        // @ts-ignore
        this.view.normalPage.reset();
        //@ts-ignore    高级招募
        this.view.advancedPage.updateUI();
    }

    /**
     * 按钮状态
     * @private
     */
    private resetButtonState() {
        const costItemPerDraw = this._costItemPerDraw;

        let comp = FguiScriptUtils.toMyScriptClass(this.view.drawComp, DrawStateComp);
        let rightItem = costItemPerDraw.multiply(10);
        if (this._type == ServerEnums.RecruitType.AWAKE_WEAPON_NORMAL) {
        }

        comp.reset(this._curTabType);
    }

    private onClickItem(item: ui.drawCard.btn.DrawCardTabBtn) {
        let tabIndex = item.getController("tabIndex").selectedIndex;
        this.setTab(tabIndex);
    }

    //顶部tab
    irTab(index: number, item: DrawCardTabBtn) {
        const tabIndex = this._tabArray[index] % 3;
        const isChoose = this._curTabType == tabIndex;

        item.reset(tabIndex as EnumDrawCardTabType, isChoose);
    }

    //切换tab
    private setTab(index: EnumDrawCardTabType) {
        this._curTabType = index;

        this._type = index + 1;

        this.view.getController("tabIndex").selectedIndex = index;

        this.view.list_tab.scrollPane.posX = (this._curTabType - 0.5) * this._ItemWidth - 29; //循环内都是一样的

        this.updateUI();
    }

    //跳过动画
    private onClickSkipAnimButton() {
        DrawCardModel.ins().skipAnimFlag = !DrawCardModel.ins().skipAnimFlag;
        this.resetSkipButton();
    }

    private resetSkipButton() {
        this.view.skipAnimButton.buttonSkip.imageGou.visible = DrawCardModel.ins().skipAnimFlag;
    }

    private updateData() {
        // is show skip ?
        const isCanSkip = DrawCardModel.ins().context.isCanSkipAnim(this._curTabType);
        this.view.skipAnimButton.visible = isCanSkip;
        if (!isCanSkip) {
            // 不可以跳过
            DrawCardModel.ins().context.setIsSkipAnim(false);
        }

        // 武器卡池很特殊
        if (this._curTabType == EnumDrawCardTabType.WEAPON) {
            const config1 = DrawCardConfigManager.getDrawCardConfigById(ServerEnums.RecruitType.AWAKE_WEAPON_NORMAL);
            this._config = config1;

            // 消耗 1
            this._costItemPerDraw = ItemUtils.parseKvArrayToOnlyOneItem(config1.costItems);
            this._costItemPerDraw2 = ItemUtils.parseKvArrayToOnlyOneItem(config1.costItems2);

            // 消耗 2
            const config2 = DrawCardConfigManager.getDrawCardConfigById(ServerEnums.RecruitType.AWAKE_WEAPON_SPECIAL);
            this._costItemPerDraw11 = ItemUtils.parseKvArrayToOnlyOneItem(config2.costItems);
            this._costItemPerDraw12 = ItemUtils.parseKvArrayToOnlyOneItem(config2.costItems2);

            return;
        }

        // 单卡池
        const config = DrawCardConfigManager.getDrawCardConfigById(this._type);
        if (!config) {
            G.Logger.error(`抽卡配置不存在. id = ${this._type}`);
            return;
        }
        this._config = config;

        // 消耗
        this._costItemPerDraw = ItemUtils.parseKvArrayToOnlyOneItem(config.costItems);
        this._costItemPerDraw2 = ItemUtils.parseKvArrayToOnlyOneItem(config.costItems2);

        if (!this._costItemPerDraw) {
            G.Logger.error(`抽卡竟然没有消耗?! poolId=${this._type}`);
        }
        const costItemPerDraw2 = this._costItemPerDraw2;
        if (costItemPerDraw2) {
            G.Logger.debug(costItemPerDraw2, "替代抽卡的道具 = ");
        } else {
            G.Logger.debug("没有替代消耗的道具");
        }
    }

    private playDrawCardResultAnim(event: EventDrawCardNetResult) {
        const type = event.type;
        const is10 = event.is10;
        const rewards = event.rewards;
        const drawCount = event.drawCount;

        const equipPage = FguiScriptUtils.toMyScriptClass(this.view.pageEquip, DrawCardEquipPage);
        equipPage.playerAnim(type, () => {
            FacadeManager.ins().emit(NotificationKey.DRAW_CARD_GAIN_ITEMS, DrawCardResultViewOpenArgs.create(type, rewards, drawCount));
        });
    }
}
