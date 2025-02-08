import { UITransform } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { EnumTouchSide, TouchSideUtils } from "../../../../core/utils/TouchSideUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { ActivityModel, ActivitySyncData } from "../../../comm/activity/model/ActivityModel";
import { UiTweenMgr } from "../../../../core/comm/UiTweenMgr";
import NotificationKey from "../../../event/NotificationKey";
import { BackpackManager } from "../../backpack/BackpackManager";
import { HeroItem } from "../../common/item/HeroItem";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { ModelNode } from "../../common/node/ModelNode";
import { EnumRedDotShowType } from "../../common/redDot/enums/EnumRedDotShowType";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { FloatingTextManager } from "../../floatingText/FloatingTextManager";
import { HeroManager } from "../../hero/HeroManager";
import { UIItemKeys2 } from "../../item/UIItemKeys";
import { EventClickItem } from "../../item/event/EventClickItem";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { ItemSmallTipsViewOpenArgs2 } from "../../item/view/tips/ItemSmallTipsView2";
import { RuleController } from "../../rule/RuleController";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { UIActivityKey } from "../const/UIActivityConfig";
import { ActivitySignInVo } from "../model/ActivitySignInVo";
import GIns from "../../../GIns";

/**
 * 签到送英雄
 * 主界面
 */
export class GiveHeroView extends UIView {
    static pkgName: string = "activityGiveHero";
    static viewName: string = "GiveHeroView";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    /** 签到vo */
    private _data: ActivitySignInVo;

    private _isClose = false;

    private get view(): ui.activityGiveHero.GiveHeroView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK, NotificationKey.ACTIVITY_UPDATE, NotificationKey.ACTIVITY_REQUEST_BACK];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK:
                if (args == this._data.activityId) {
                    this._data = ActivityModel.ins().getActivityVoById(args);
                    this.updateList();
                    this.updateData();
                }
                break;
            case NotificationKey.ACTIVITY_UPDATE:
            case NotificationKey.ACTIVITY_REQUEST_BACK:
                ActivityModel.ins().sendActivity(this._data.activityId);
                break;
        }
    }

    protected onInit(): void {
        this.view.panelBottom.list_hero.setVirtual();
        this.view.panelBottom.list_award.itemRenderer = this.awardItemRenderer.bind(this);
        this.view.panelBottom.btn_get.on(fgui.Event.CLICK, this.onGetClick, this);
        this.view.panelTop.btn_award.on(fgui.Event.CLICK, this.onAwardClick, this);
        this.view.panelTop.btnRule.onClick(this.onClickRule, this);

        this.view.panelTop.head.visible = false;
    }

    protected onClickRule(): void {
        RuleController.ins().openRule(EnumRuleKeys.GIVE_HERO, this.view.panelTop.btnRule);
    }

    protected onOpen(arge: table.activity.ActivityConstant.ActivityClientConfig, isReopen?: boolean): void {
        let cfg = arge;
        this._data = ActivityModel.ins().getActivityVoById(cfg.typeParam);
        this.updateList();

        // if (this._data._isFirst) {
        this.view.panelTop.getTransition("t0").play();
        this.view.panelBottom.getTransition("t0").play();
        this.view.panelBottom.list_hero.itemRenderer = UiTweenMgr.ins().listItemRendererEffect(this.view.panelBottom.list_hero.node.uuid, this.heroItemRenderer, this);
        let self = this;
        G.GameTimer.once(500, this, () => {
            if (!self._isClose) {
                self.view.panelBottom.list_award.scrollToView(self._index2, true);
            }
        });
        // } else {
        //     this.view.panelBottom.list_hero.itemRenderer = this.heroItemRenderer.bind(this);
        //     this.view.panelBottom.list_award.scrollToView(this._index2, false);
        // }

        this.updateData();
        this.resetHeaderItem();
    }

    protected onClose(): void {
        this._isClose = true;
        this._data._isFirst = false;
        G.GameTimer.clearAll(this);
        this.view?.panelBottom.list_hero?._children?.forEach((value) => {
            G.GameTimer.clearAll(value);
        });
        UiTweenMgr.ins().removeListItemRendererEffect(this.view.panelBottom.list_hero.node.uuid);
    }

    /**
     * 头顶道具
     */
    private resetHeaderItem() {
        const itemId1 = 4;
        const itemId2 = 1;

        // 对应的头顶图标
        const itemIdToImageLoaderMap = new Map<number, ui.comm.header.HeadItemCompV2>([
            [itemId1, this.view.panelTop.headItem1],
            [itemId2, this.view.panelTop.headItem2],
        ]);

        itemIdToImageLoaderMap.forEach((headerItem, itemId) => {
            const itemConfig = ItemUtils.getItemConfigByItemId(itemId);
            if (!itemConfig) {
                return;
            }
            headerItem.imageItem.icon = itemConfig.smallIconPath;
            const itemCount = BackpackManager.ins().getItemCountByItemId(itemId) || 0;
            headerItem.labelItemCount.text = itemCount.toString();
        });
    }

    private updateData() {
        this.updateHeroList();
        this.view.panelBottom.T_day.text = `${this._data.activityVo.dailyRewardIds.length}`;

        if (!this._data.hasAward()) {
            this.view.panelBottom.btn_get.text = "明日再来";
        }

        if (this._data.isActivityOver()) {
            G.FacadeManager.emit(NotificationKey.ACTIVITY_TAB_UPDATE, 0);
            this.closeSelf();
        }
        let hasRed = this._data.hasAward();
        FguiScriptUtils.toMyScriptClass(this.view.panelBottom.redDot, RedDotCom).showByType(hasRed ? EnumRedDotShowType.REWARD : EnumRedDotShowType.NULL);
    }

    protected updateHeroList(): void {
        this.view.panelBottom.list_hero.numItems = this._data.signList.length;
        // let childIndex = this.view.list_hero.itemIndexToChildIndex(this._index);
        //虚拟列表轮动到为加载的item会报错
        this.view.panelBottom.list_hero.scrollToView(this._index);
    }

    /** 更新列表 */
    private updateList() {
        this.view.panelBottom.list_award.removeChildrenToPool();
        this.view.panelBottom.list_award.numItems = this._data.totalSignRewardCfgs.length;
    }

    //滚动到某个item
    private _index: number = 0;
    //签到列表
    private heroItemRenderer(index: number, item: ui.activityGiveHero.item.GiveHeroItem2): void {
        let data = this._data.signList[index];
        if (!data) return;
        item.T_day.text = `${data.condition}日`;
        let itemId = data.dailyRewards[0].k;
        let itemNum = data.dailyRewards[0].v;
        let itemConfig = ItemUtils.getItemConfigByItemId(itemId);
        //道具类型
        item.getController("c2").selectedIndex = ServerEnums.ItemType[itemConfig.type] == ServerEnums.ItemType.HERO_CARD ? 1 : 0;
        if (ServerEnums.ItemType[itemConfig.type] == ServerEnums.ItemType.HERO_CARD) {
            let heroVo = HeroManager.ins().getHeroVoByID(itemId);
            // @ts-ignore
            let heroItem = item.heroItem as HeroItem;
            heroItem.setHeroVo(heroVo, true);
            heroItem.isShowName(false);
            heroItem.isShowLevel(false);
            heroItem.isShowCamp(false);
        } else {
            //@ts-ignore
            let propItem = item.item as ItemFrameBtn;
            propItem.reset(itemId, itemNum);
        }

        /**0：待领取
         * 1：可领取
         * 2：已领取*/
        let rewardState = this._data.isCanGetAwardById(data.id);

        //领取状态
        item.getController("c1").selectedIndex = rewardState;
        // @ts-ignore
        item.item.isCanClick(rewardState !== 1);

        if (rewardState == 1 && !this._index) {
            this._index = index;
        }
        if (data.condition == this._data.activityVo.totalLoginDays && !this._index) {
            this._index = index;
        }

        item.heroItem.onClick((event) => {
            if (this._data.isCanGetAwardById(data.id) == 1) {
                this.onGetClick();
            } else {
                let cfg = ItemUtils.getItemConfigByItemId(itemId);
                // event 点击道具
                G.FacadeManager.emit(NotificationKey.CLICK_ITEM, EventClickItem.create(event, cfg, item.heroItem.node.getComponent(UITransform), itemNum));
            }
        });
        item.item.onClick((event) => {
            if (this._data.isCanGetAwardById(data.id) == 1) {
                this.onGetClick();
            }
        });

        G.GameTimer.clearAll(item);
        let modelNode = item.modelNode as ModelNode;
        if (rewardState == 1) {
            modelNode.visible = true;
            modelNode.loadByPath("spine/ui/Q_qiandaoshaoguang/Q_qiandaoshaoguang");
            G.GameTimer.loop(2000, item, () => {
                if (modelNode) {
                    modelNode.visible = true;
                    modelNode.playOrders([
                        {
                            name: "enter",
                            callbackForComplete: () => {
                                modelNode.visible = false;
                            },
                        },
                    ]);
                }
            });
        } else {
            modelNode.visible = false;
            modelNode.clearOrders();
        }
    }
    //滚动到某个item
    private _index2: number;
    //累计奖励列表
    private awardItemRenderer(index: number, item: ui.activityGiveHero.item.GiveHeroItem1): void {
        let data = this._data.totalSignRewardCfgs[index];
        item.T_day.text = `${data.condition}`;

        //是否是大奖
        item.getController("c2").selectedIndex = data.isBagAward ? 1 : 0;
        if (this._data.activityVo.dailyRewardIds.length >= data.condition) {
            if (this._data.isHadGetTotalReward(data.id)) {
                item.getController("c1").selectedIndex = 2;
                let itemId = this._data.activityVo.totalRewardId2ItemIdMap[data.id];
                if (this._data.getHeroItemIdToHeroId(itemId)) itemId = this._data.getHeroItemIdToHeroId(itemId);
                //@ts-ignore
                item.item.reset(itemId, 1);
            } else {
                item.getController("c1").selectedIndex = 1;
            }
            item.img_jdt.width = 152;
        } else {
            item.getController("c1").selectedIndex = 0;
            if (this._data.totalSignRewardCfgs[index - 1]) {
                let lastData = this._data.totalSignRewardCfgs[index - 1];
                item.img_jdt.width = 152 * ((this._data.activityVo.dailyRewardIds.length - lastData.condition) / (data.condition - lastData.condition));
            } else {
                item.img_jdt.width = 152 * (this._data.activityVo.dailyRewardIds.length / data.condition);
            }
        }

        //解绑点击事件
        item.img_award.clearClick();

        if (this._data.activityVo.dailyRewardIds.length >= data.condition) {
            item.img_award.onClick(this.onGetTotalClick.bind(this, data.id), this);
        } else {
            let fun2 = (event) => {
                let itemId = this._data.activityVo.totalRewardId2ItemIdMap[data.id];
                let cfg = ItemUtils.getItemConfigByItemId(itemId);
                if (cfg) {
                    // event 点击道具
                    G.FacadeManager.emit(NotificationKey.CLICK_ITEM, EventClickItem.create(event, cfg, item.img_award.node.getComponent(UITransform), 1));
                } else {
                    const clickPos = event.pos;
                    const touchSideEnum: EnumTouchSide = TouchSideUtils.getTouchSideByPosInCanvas(clickPos);
                    G.UIManager.open(UIItemKeys2.ItemSmallTipsView2, ItemSmallTipsViewOpenArgs2.create(data.desc, touchSideEnum, item.img_award.node.getComponent(UITransform)));
                }
            };
            item.img_award.offClick(fun2, this);
            item.img_award.onClick(fun2, this);
        }

        if (item.getController("c1").selectedIndex == 1 && !this._index2) {
            this._index2 = index;
        }
        if (this._data.activityVo.dailyRewardIds.length < data.condition && !this._index2) {
            this._index2 = index;
        }
        if (item.getController("c1").selectedIndex == 1) {
            //可领取时
            item.getTransition("t0").play(null, Number.MAX_SAFE_INTEGER - 1);
        } else {
            item.getTransition("t0").stop();
        }
    }

    /** 领取累计签到奖励 */
    private onGetTotalClick(id: number) {
        let syncData = {
            activityId: this._data.activityId,
            itemId: "TOTAL_" + id,
            hidePopWin: 2,
            otherParams: "TOTAL",
        } as ActivitySyncData;
        ActivityModel.ins().sendDrawItemReward(syncData);
    }

    /** 领取签到奖励 */
    private onGetClick() {
        if (!this._data.hasAward()) {
            GIns.floatingTextMgr.showTips("今日已签到");
            return;
        }

        let data = {
            activityId: this._data.activityId,
            //领取全部
            itemId: "DAILY_id",
            hidePopWin: 2,
        } as ActivitySyncData;

        ActivityModel.ins().sendDrawItemReward(data);
    }

    private onAwardClick() {
        G.UIManager.open(UIActivityKey.GiveHeroAwardWin, this._data);
    }
}
UIScriptManager.bindScript(UIActivityKey.GiveHeroView, GiveHeroView);
