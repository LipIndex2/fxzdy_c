import G from "db://assets/scripts/core/comm/G";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { UIView } from "db://assets/scripts/core/mvc/view/UIView";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import { EnumUtils } from "db://assets/scripts/core/utils/EnumUtils";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { ModelNode } from "db://assets/scripts/game/modules/common/node/ModelNode";
import { EnumQuality } from "db://assets/scripts/game/modules/common/quality/enums/EnumQuality";
import { DrawCardGainItemComp } from "db://assets/scripts/game/modules/drawcard/components/DrawCardGainItemComp";
import { DrawCardConfigManager } from "db://assets/scripts/game/modules/drawcard/config/DrawCardConfigManager";
import { EnumGainNewHeroType } from "db://assets/scripts/game/modules/drawcard/enums/EnumGainNewHeroType";
import { DrawCardModel } from "db://assets/scripts/game/modules/drawcard/model/DrawCardModel";
import { DrawCardFirstGetItemViewOpenArgs } from "db://assets/scripts/game/modules/drawcard/view/DrawCardFirstGetItemView";
import { HeroUtils } from "db://assets/scripts/game/modules/hero/utils/HeroUtils";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import GIns from "../../../GIns";
import { IAdPlayVo } from "../../ad/model/vo/IAdPlayVo";
import { DrawCardManager } from "../DrawCardManager";
import { DrawCardUIKeys } from "../DrawCardUIKeys";
import { DebugUtils } from "db://assets/scripts/core/utils/DebugUtils";

export class DrawCardResultViewOpenArgs {
    // 抽的卡池id
    poolId: ServerEnums.RecruitType;
    // 抽卡次数
    drawCount: number = 1;
    // 奖励道具
    rewardItems: Vo.reward.RewardResult[];

    static create(poolId: number, rewardItems: Vo.reward.RewardResult[], drawCount: number): DrawCardResultViewOpenArgs {
        let args = new DrawCardResultViewOpenArgs();
        args.poolId = poolId;
        args.rewardItems = rewardItems;
        args.drawCount = drawCount;
        return args;
    }
}

/**
 * 抽卡结果
 */
@bindScript(DrawCardUIKeys.DrawCardResultView)
export class DrawCardResultView extends UIView {
    // 弹出道具的时间差
    private readonly POP_UP_DIFF_TIME_MS = 100;

    static pkgName: string = "drawCard";

    static viewName: string = "DrawCardResultView";

    // 奖励道具
    private _items: NoOwnerItem[];
    // 抽卡次数
    private _totalDrawCount: number;
    // 卡池
    private _poolId: number;
    // 当前展示结果的数量
    private _showCount: number;
    // 等待退出英雄界面
    private _waitExitHeroPage: boolean = false;

    private _sid: any;

    private get view(): ui.drawCard.DrawCardResultView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.CLOSE_GET_NEW_HERO_VIEW];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.CLOSE_GET_NEW_HERO_VIEW: {
                console.info("【抽卡】 关闭了英雄首次获得界面!");
                this._waitExitHeroPage = false;
                break;
            }
        }
    }

    protected onInit() {
        super.onInit();

        const modelNodeSweep = this.view.spineTitle as ModelNode;
        modelNodeSweep.loadByPath(DrawCardConfigManager.getDrawCardGainItemTitleSpineAssetPath());
        modelNodeSweep.playOrders([
            {
                name: "animation",
                isLoop: true,
            },
        ]);

        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = this.itemRendererForOneDrawResult.bind(this);

        this.view.fgClose.onClick(this.onClickFgClose, this);
    }

    @LogBusiness("打开抽卡结果界面")
    protected onOpen(args: DrawCardResultViewOpenArgs) {
        this.setBtnVisible(false);

        super.onOpen(args);

        const poolId = args.poolId;
        const rewardItems = args.rewardItems;
        const drawCount = args.drawCount;
        const items = ItemUtils.convertToNoOwnerItemArrayByServerRewards(rewardItems);
        if (items.length <= 0) {
            return;
        }

        //  pool show
        this.view.getController("isCanContinue").selectedIndex = 1;
        if (poolId == ServerEnums.RecruitType.AWAKE_WEAPON_SPECIAL || poolId == ServerEnums.RecruitType.AWAKE_WEAPON_NORMAL || poolId == ServerEnums.RecruitType.ACTIVITY_RECRUIT) {
            this.view.getController("isCanContinue").selectedIndex = 0;
        }

        this._items = items;
        this._totalDrawCount = drawCount;
        this._poolId = poolId;

        Logger.debug(`抽卡结果！. 抽卡次数 = ${drawCount}, poolId = ${poolId}, 奖励 = `, items);

        // 中大奖
        const loveItemIds = items
            .toDataStream()
            .filter((it) => it.isHero() || it.isWeapon())
            .map((it) => it.itemId)
            .toArray();

        if (ArrayUtils.isNotEmpty(loveItemIds)) {
            Logger.debug("抽中大奖", loveItemIds);
            DrawCardModel.ins().addFirstGainItemIdToQueue(loveItemIds);
        }

        this.reset();
        this.view.btnAd.visible = false;
    }

    protected updateAdBtn(): void {
        if (this._poolId == ServerEnums.RecruitType.NORMAL && this._totalDrawCount == 1) {
            //普通招募单抽需要显示广告招募
            let isUnlock = GIns.drawCardModel.context.isUnlockAdNormal;
            let remainTimes = GIns.adModel.getRemainAdTimes(GIns.drawCardModel.context.normalAdTimes, ServerEnums.AdvertType.NORMAL_RECRUIT);
            let totalTimes = GIns.adModel.getTotalAdTimes(ServerEnums.AdvertType.NORMAL_RECRUIT);
            if (isUnlock && remainTimes > 0) {
                //有剩余次数
                this.view.btnAd.visible = true;

                const drawCardConfigById = DrawCardConfigManager.getDrawCardConfigById(this._poolId);
                if (drawCardConfigById) {
                    // 消耗
                    const costItemPerDraw = ItemUtils.parseKvArrayToOnlyOneItem(drawCardConfigById?.costItems);
                    if (costItemPerDraw) {
                        this.view.btnAd.iconTop.icon = costItemPerDraw.getItemSmallIconPath();
                    }
                }
                this.view.btnAd.lbTimesTop.text = `x1`;
                this.view.btnAd.title = `免费招募${remainTimes}/${totalTimes}`;
            } else {
                this.view.btnAd.visible = false;
            }
        } else {
            this.view.btnAd.visible = false;
        }
    }

    protected onClickAd(): void {
        let args: IAdPlayVo = {
            type: ServerEnums.AdvertType.NORMAL_RECRUIT,
        };
        this.emit(NotificationKey.AD_START_PLAY, args);
    }

    private setBtnVisible(flag: boolean) {
        this.view.btnAgain.visible = flag;
        this.view.btnOk.visible = flag;
    }

    protected onClose() {
        clearInterval(this._sid);
        DrawCardManager.ins().isDrawCardIng = false;
        super.onClose();
    }

    // 确认关闭
    private onBtnOkClick() {
        G.FacadeManager.emit(NotificationKey.DRAW_CARD_EXIT_RESULT);

        this.view.btnOk.offClick(this.onBtnOkClick, this);
        this.view.btnAgain.offClick(this.onBtnAgainClick, this);

        this.closeSelf();
    }

    onClickFgClose() {
        this.closeSelf();
    }

    // 再抽一次
    private onBtnAgainClick() {
        const poolId = this._poolId;
        const drawCount = this._totalDrawCount;

        const drawCardConfigById = DrawCardConfigManager.getDrawCardConfigById(poolId);
        if (!drawCardConfigById) {
            G.Logger.error(`抽卡配置不存在. id = ${poolId}`);
            return;
        }

        // 消耗
        const costItemPerDraw = ItemUtils.parseKvArrayToOnlyOneItem(drawCardConfigById.costItems);
        const costItemPerDraw2 = ItemUtils.parseKvArrayToOnlyOneItem(drawCardConfigById.costItems2);

        // n 次抽卡消耗的道具
        const totalCostItems = costItemPerDraw.multiply(drawCount);
        const result = BackpackManager.ins().isCanPayReturnResult([totalCostItems]);

        if (result.isCanPay) {
            // 抽 by 卡池
            DrawCardModel.ins().sendDrawByPoolAndCount(poolId, drawCount);

            // this.view.btnOk.offClick(this.onBtnOkClick, this);
            // this.view.btnAgain.offClick(this.onBtnAgainClick, this);
            // // 二次确认支付 | 策划说不需要二次确认了又
            // G.UIManager.open(UIItemKeys.ItemCostConfirmView, ItemCostConfirmViewOpenArgs.create(`进行 ${drawCount} 次招募 ?`, totalCostItems, () => {
            //     // 抽
            //     DrawCardModel.ins().sendDrawByPoolAndCount(poolId, drawCount)
            // }))

            return;
        }

        const missingCount = result.calculateMissingCount(costItemPerDraw.itemId, costItemPerDraw.count);
        if (missingCount <= 0) {
            return;
        }

        // 兑换的数量
        const missingItem = costItemPerDraw.multiply(missingCount);

        GIns.drawCardMgr.showExchangeConfirmView(poolId, missingItem, () => {
            DrawCardModel.ins().sendDrawByPoolAndCount(poolId, drawCount);
            // this.view.btnOk.offClick(this.onBtnOkClick, this);
            // this.view.btnAgain.offClick(this.onBtnAgainClick, this);
        });

        // // 补充道具
        // const fromItem = costItemPerDraw2.multiply(missingCount);

        // // 兑换确认
        // G.UIManager.open(UIItemKeys.ItemExchangeConfirmView, ItemExchangeConfirmViewOpenArgs.create(fromItem, missingItem, () => {
        //     DrawCardModel.ins().sendDrawByPoolAndCount(poolId, drawCount)

        //     this.view.btnOk.offClick(this.onBtnOkClick, this);
        //     this.view.btnAgain.offClick(this.onBtnAgainClick, this);
        // }));
    }

    @LogBusiness("展示抽卡结果")
    private reset() {
        // 再抽 n 次
        this.view.btnAgain.title = `再抽${this._totalDrawCount}次`;

        const drawCount = this._totalDrawCount;

        // 逐个显示奖励
        let curCount = 0;
        this._sid = setInterval(() => {
            if (curCount > drawCount) {
                clearInterval(this._sid);
                return;
            }

            // 等待退出英雄界面
            if (this._waitExitHeroPage) {
                console.info("【抽卡结果】正在等待退出新英雄确认界面");
                return;
            }
            this._showCount = curCount;
            this.view.itemList.numItems = curCount;

            const context = DrawCardModel.ins().context;

            // 下一个
            curCount++;
            const noOwnerItem = this._items[curCount - 1];
            let isStop = false;
            if (noOwnerItem) {
                const itemType = noOwnerItem.getItemType();

                const enumKeyName = EnumUtils.getEnumKeyNameByValue(ServerEnums.ItemType, itemType);
                DebugUtils.isDebugMode() && console.log(`draw card no.${curCount}. itemType = ${itemType} | ${enumKeyName}`);

                // 碎片, 如果是英雄转换的, 也伪装成英雄获得
                if (itemType == ServerEnums.ItemType.HERO_FRAGMENT) {
                    const serverExtraData = noOwnerItem.getHeroFragmentExtraData();
                    if (serverExtraData) {
                        // 英雄转的碎片
                        const heroId = serverExtraData.heroBaseId;
                        const toFragmentCount = noOwnerItem.count;

                        const heroQuality = HeroUtils.getQualityConfigByHeroId(heroId)?.id || 0;

                        // 高品质碎片才播放
                        if (heroQuality >= EnumQuality.Red) {
                            // fragment 碎片伪装成英雄
                            GameTimer.ins().once(1, this, () => {
                                G.UIManager.open(
                                    DrawCardUIKeys.DrawCardFirstGetItemView,
                                    DrawCardFirstGetItemViewOpenArgs.create(heroId, EnumGainNewHeroType.HERO_DUPLICATE_TO_FRAGMENT, toFragmentCount)
                                );
                            });

                            isStop = true;
                        }
                    }
                }

                if (itemType == ServerEnums.ItemType.HERO_CARD || itemType == ServerEnums.ItemType.AWAKE_WEAPON) {
                    // 尝试播放中大奖动画
                    const isShow = DrawCardModel.ins().tryShowFirstGainSpecialItem();
                    if (isShow) {
                        isStop = true;
                    }
                }
            }
            if (isStop) {
                this._waitExitHeroPage = true;
                return;
            }
        }, this.POP_UP_DIFF_TIME_MS);
    }

    itemRendererForOneDrawResult(index: number, comp: DrawCardGainItemComp) {
        const item = this._items[index];
        if (!item) {
            comp.visible = false;
            return;
        }

        // 已经显示过
        const curCount = index + 1;
        if (curCount < this._showCount) {
            console.info("【抽卡】 已经显示完了");
            return;
        }
        comp.reset(item);

        // 最后一个播放了 | 才允许显示按钮
        if (curCount == this._totalDrawCount) {
            this.showButtons();
        }
    }

    private showButtons() {
        this.view.getTransition("enter").play(() => {
            this.setBtnVisible(true);
            // this.view.drawComp
            this.view.btnOk.onClick(this.onBtnOkClick, this);
            this.view.btnAgain.onClick(this.onBtnAgainClick, this);
            this.view.btnAd.onClick(this.onClickAd, this);
            this.updateAdBtn();
        });
    }
}
