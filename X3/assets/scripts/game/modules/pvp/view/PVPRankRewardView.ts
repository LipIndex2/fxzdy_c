import G from "db://assets/scripts/core/comm/G";
import { I18nManager } from "db://assets/scripts/core/i18n/I18nManager";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { PVPRankBigLogoChooseComp } from "db://assets/scripts/game/modules/pvp/components/PVPRankBigLogoChooseComp";
import { PVPRankSettleTabComp } from "db://assets/scripts/game/modules/pvp/components/PVPRankSettleTabComp";
import { PVPModel } from "db://assets/scripts/game/modules/pvp/model/PVPModel";
import { PVPUtils } from "db://assets/scripts/game/modules/pvp/utils/PVPUtils";
import * as fgui from "fairygui-cc";
import { PrivilegeAdditionController } from "../../vip/PrivilegeAdditionController";

/**
 * PVP 段位奖励 UI
 */
export class PVPRankRewardView extends UICommWin {

    static pkgName: string = "pvp";

    static viewName: string = "PVPRankRewardView";

    // 奖励
    private _rewards: NoOwnerItem[] = [];
    // 排行榜配置
    private _rankConfigs: table.arena.ArenaRankConfig[];
    // 当前选择的段位配置
    private _curChooseConfig: table.arena.ArenaRankConfig;
    private _curChooseIndex: number = -1;

    private get view(): ui.pvp.PVPRankRewardView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
        }

    }


    public onInit(): void {
        G.Logger.debug(" onInit ");

        this.view.btnLeftSide.onClick(this.onBtnLeftSideClick, this);
        this.view.btnRightSide.onClick(this.onBtnRightSideClick, this);

        this.view.rankList.setVirtual();
        this.view.rankList.on(fgui.Event.CLICK_ITEM, this.onClickRankItem, this);
        this.view.rankList.itemRenderer = this.itemRendererForRankLogo.bind(this);
        this._rankConfigs = PVPUtils.getAllRankConfigs();
        //最左侧和最右侧都加一个空的数据 保证所有数据都能到中间
        this.view.rankList.numItems = this._rankConfigs.length + 2;
        this.view.rankList.on(fgui.Event.SCROLL, this.onScrollRankList, this);
        this.view.rankList.on(fgui.Event.SCROLL_END, this.onScrollEnd, this)
    }

    onClickRankItem(event: fgui.Event) {
        const curIndex = this.view.rankList.selectedIndex;
        // 点击滑动
        this.view.rankList.scrollToView(curIndex - 1, true, true);
    }

    // L
    onBtnLeftSideClick() {
        if (this._curChooseIndex > 1) {
            // 向左滑动
            this.view.rankList.scrollToView(this._curChooseIndex - 2, true, true);
        }
    }

    // R
    onBtnRightSideClick() {
        if (this._curChooseIndex < this._rankConfigs.length - 2) {
            // 向右滑动
            this.view.rankList.scrollToView(this._curChooseIndex, true, true);
        }
    }


    public onOpen(args: any): void {
        const myIndex = this._rankConfigs.findIndex(it => it.id == PVPModel.ins().getContext().getCurrentRankConfigId());
        if (myIndex > 0) {
            this.view.rankList.scrollToView(myIndex, false, true);
        } else {
            //不需要滚动
            this.onScrollRankList();
            this.onScrollEnd();
        }
    }

    public onClose(): void {
        G.Logger.debug(" onClose ");
    }

    protected onScrollRankList() {
        this.view.dialogComp.visible = false;
        var midX: number = this.view.rankList.scrollPane.posX + this.view.rankList.viewWidth / 2;
        var cnt: number = this.view.rankList.numChildren;
        for (var i: number = 0; i < cnt; i++) {
            var obj: fgui.GObject = this.view.rankList.getChildAt(i);
            var dist: number = Math.abs(midX - obj.x - obj.width / 2);
            if (dist > obj.width) //no intersection
                obj.setScale(1, 1);
            else {
                var ss: number = 1 + (1 - dist / obj.width) * 0.4;
                obj.setScale(ss, ss);
            }
        }

        let centerIdx = this.view.rankList.getFirstChildInView() + 1;
        this.setChooseRankIndex(centerIdx);
    }

    protected onScrollEnd(): void {
        this.view.dialogComp.visible = false;
        if (this._curChooseConfig) {
            const isHaveFirstReachReward = PVPModel.ins().getContext().isHaveGainFirstReachReward(this._curChooseConfig);
            if (!PVPUtils.isFirstRankConfig(this._curChooseConfig) && !isHaveFirstReachReward) {
                //未获得首次奖励才展示
                let rewards = [];
                this._curChooseConfig.firstReachRankRewards?.forEach((value) => {
                    let cnt = value.v;
                    cnt += PrivilegeAdditionController.ins().getArenaReward(value.k, value.v);
                    rewards.push({ k: value.k, v: cnt });
                })
                if (rewards.length > 0) {
                    //显示奖励
                    this.view.dialogComp.visible = true;
                    this.view.getTransition('t0').play();
                    let noOwnerItem = NoOwnerItem.createByConfigKv(rewards[0]);
                    this.view.dialogComp.imageIcon.icon = noOwnerItem.getItemSmallIconPath();
                    this.view.dialogComp.labelCount.text = `x${noOwnerItem.count}`;
                }
            }
        }
    }

    @LogBusiness("刷新界面")
    private reset() {
        const score = PVPModel.ins().getContext().score;


        let config: table.arena.ArenaRankConfig;
        if (this._curChooseConfig) {
            config = this._curChooseConfig;
        } else {
            config = PVPUtils.getConfigByScore(score);
        }
        if (!config) {
            return;
        }

        // 段位名
        this.view.labelRankLogoName.text = config.name;
        // 优先特殊描述
        const specialRankDesc = I18nManager.ins().translateOrBlank(config.specialRankDesc);
        if (StringUtils.isNotBlank(specialRankDesc)) {
            this.view.labelRankScoreRange.text = specialRankDesc;
        } else {
            this.view.labelRankScoreRange.text = `${config.minScore}-${config.maxScore}`;
        }

        // daily
        const dailyRewards = ItemUtils.parseKvArrayToItemArray(config.dailySettleRewards);
        // @ts-ignore
        (this.view.settleDailyComp as PVPRankSettleTabComp).reset("日奖励", dailyRewards);

        // weekly
        const weeklyRewards = ItemUtils.parseKvArrayToItemArray(config.weeklySettleRewards);
        // @ts-ignore
        (this.view.settleWeeklyComp as PVPRankSettleTabComp).reset("周奖励", weeklyRewards);

        // // first reach
        // const firstReachRewards = ItemUtils.parseKvArrayToItemArray(config.firstReachRankRewards);
        // // @ts-ignore
        // (this.view.settleFirstReachComp as PVPRankSettleTabComp).reset("首次到达奖励", firstReachRewards);
        // const isHaveFirstReachReward = PVPModel.ins().getContext().isHaveGainFirstReachReward(config);
        // this.view.settleFirstReachComp.getController("haveGainFlag").selectedIndex = isHaveFirstReachReward ? 1 : 0;
        // this.view.settleFirstReachComp.visible = !PVPUtils.isFirstRankConfig(config);
    }

    itemRendererForItem(index: number, itemFrameBtn: ui.comm.item.ItemFrameBtn) {
        const noOwnerItem = this._rewards[index];
        if (!noOwnerItem) {
            return;
        }
        // @ts-ignore
        (itemFrameBtn as ItemFrameBtn).resetByNoOwnerItem(noOwnerItem);
    }

    itemRendererForRankLogo(index: number, logo: ui.pvp.logo.PVPRankBigLogoChooseComp) {
        logo.setPivot(0.5, 0);
        const config = this._rankConfigs[(index - 1)];
        if (!config) {
            logo.visible = false;
            return;
        }
        logo.visible = true;

        // @ts-ignore
        (logo as PVPRankBigLogoChooseComp).reset(index, config);
    }

    setChooseRankIndex(indexForRankList: number) {
        if (this._curChooseIndex != indexForRankList) {
            this._curChooseIndex = indexForRankList;
            const config = this._rankConfigs[indexForRankList - 1];
            if (!config) {
                return;
            }
            this._curChooseConfig = config;
            this.reset();
        }
    }
}