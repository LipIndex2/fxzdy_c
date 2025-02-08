import { Color } from "cc";
import G from "db://assets/scripts/core/comm/G";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";
import { ModelNode } from "db://assets/scripts/game/modules/common/node/ModelNode";
import { HangUpUtils } from "db://assets/scripts/game/modules/hangup/utils/HangUpUtils";
import { PVPRankBigLogoComp } from "db://assets/scripts/game/modules/pvp/components/PVPRankBigLogoComp";
import { PVPRankScoreBar } from "db://assets/scripts/game/modules/pvp/components/PVPRankScoreBar";
import { PVPInfoUtils } from "db://assets/scripts/game/modules/pvp/utils/PVPInfoUtils";
import { PVPUtils } from "db://assets/scripts/game/modules/pvp/utils/PVPUtils";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import * as fgui from "fairygui-cc";
import { BattleRecordManager } from "../../../comm/battle/BattleRecordManager";
import GIns from "../../../GIns";
import { PrivilegeAdditionController } from "../../vip/PrivilegeAdditionController";
import { PVPBattleResultViewOpenArgs } from "../interface/IPvpArgs";


const { GObject } = fgui;


/**
 * PVP 战斗结果
 */
export class PVPBattleResultView extends UICommWin {

    static pkgName: string = "pvp";

    static viewName: string = "PVPBattleResultView";


    private _winFlag: boolean;
    // 道具
    private _rewards: Array<NoOwnerItem> = [];
    private _config: table.arena.ArenaRankConfig;
    private _changeScore: number = 0;
    private _previousScore: number = 0;
    private _finalScore: number = 0;
    // 是否升段位
    private _isLvUp: boolean = false;
    private _sid1: number;
    // 结算后的段位配置id
    private _afterRankConfigId: number = 0;

    private get view(): ui.pvp.PVPBattleResultView {
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
        G.Logger.debug(" onInit ")


        this.view.rewardPart.itemList.setVirtual();
        this.view.rewardPart.itemList.itemRenderer = this.renderForItem.bind(this);

        this.view.btnData.onClick(this.onClickBtnData, this)
    }

    public onOpen(args: PVPBattleResultViewOpenArgs): void {

        // args
        const winFlag = args.winFlag;
        this._winFlag = winFlag;
        this._finalScore = args.finalScore;
        this._changeScore = args.changeScore;
        this._rewards = args.rewards;
        this._rewards.forEach((value) => {
            value.count += PrivilegeAdditionController.ins().getArenaReward(value.itemId, value.count)
        })
        this._previousScore = args.previousScore;
        this._afterRankConfigId = args.afterRankConfigId;

        const modelNode = this.view.modelNode as ModelNode;
        if (winFlag) {
            modelNode.loadByPath(HangUpUtils.getWinResultSpineAssetPath());
            modelNode.playOrders(
                [
                    {
                        name: "unlocking1",
                        isLoop: false
                    },
                    {
                        name: "idle1",
                        isLoop: true
                    },
                ]
            );
        } else {
            modelNode.loadByPath(HangUpUtils.getFailResultSpineAssetPath());
            modelNode.playOrders(
                [
                    {
                        name: "unlocking2",
                        isLoop: false
                    },
                    {
                        name: "idle2",
                        isLoop: true
                    },
                ]
            );
        }

        this.view.touchable = false;
        this.view.getTransition("enter").play(() => {
            this.view.touchable = true;
        });

        this.reset();

    }

    private onClickBtnData(): void {
        BattleRecordManager.ins().showRecordView(ServerEnums.FightType.ARENA, this._winFlag)
    }

    public onClose(): void {
        G.Logger.debug(" onClose ");

        clearTimeout(this._sid1);

        // 晋升排位
        if (this._isLvUp) {
            // rank lvUp UI
            G.FacadeManager.emit(NotificationKey.PVP_RANK_LV_UP, { newScore: this._finalScore, oldScore: this._previousScore });
        }
        // 关闭战斗
        G.FacadeManager.emit(NotificationKey.CLOSE_BATTLE_VIEW);
    }


    @LogBusiness("刷新界面")
    private reset() {
        let afterConfig = PVPUtils.getConfigById(this._afterRankConfigId);
        if (!afterConfig) {
            afterConfig = PVPUtils.getConfigByScore(this._finalScore);
        }

        const preConfig = PVPUtils.getConfigByScore(this._previousScore);
        if (!preConfig) {
            console.error(`没找到升段位前的配置. score = ${this._previousScore}`);
            return;
        }
        if (!afterConfig) {
            console.error(`没找到升段位后的配置. score = ${this._finalScore}, configId = ${this._afterRankConfigId}`);
            return;
        }
        this._config = preConfig;

        // 原始积分
        const maxScore = preConfig.maxScore || 999999999;
        const minScore = preConfig.minScore;

        const maxScoreValue = maxScore - minScore;
        const preScoreValue = Math.max(0, this._previousScore - minScore);

        // bar | 初始化
        this.view.rankPart.barRankScore.max = maxScoreValue;
        this.view.rankPart.barRankScore.value = preScoreValue;
        this.view.rankPart.barRankScore.labelTitle.text = `${this._previousScore}/${maxScore}`;
        this.view.rankPart.labelRankScore.text = PVPInfoUtils.getBalanceScoreText(this._winFlag, this._finalScore, maxScore);


        // 奖励
        this.view.rewardPart.itemList.numItems = this._rewards.length;

        let useTimes: number = GIns.pvpModel.getContext().extraChallengeRewardTimes;
        let maxTimes: number = PVPUtils.getChallengeRewardsMaxCount();
        let remainTimes: number = Math.max(0, maxTimes - useTimes);
        if (this._winFlag && this._rewards.length <= 0 && remainTimes <= 0) {
            //胜利显示提示
            this.view.rewardPart.lbTip.visible = true;
        } else {
            this.view.rewardPart.lbTip.visible = false;
        }
        // rank title
        this.view.rankPart.labelTitle.text = preConfig.name;
        // 积分
        if (this._winFlag) {
            this.view.rankPart.labelAddRankScore.text = "+" + this._changeScore.toString();
            this.view.rankPart.labelAddRankScore.color = new Color("#4DFA4D");
        } else {
            this.view.rankPart.labelAddRankScore.text = this._changeScore.toString();
            this.view.rankPart.labelAddRankScore.color = new Color("#FF0000");
        }

        // 说进度条不需要文本了...
        this.view.rankPart.barRankScore.labelTitle.visible = false;

        if (afterConfig?.maxScore > 0) {
            // 动画升段位
            this._sid1 = setTimeout(() => {
                // bar
                FguiScriptUtils.toMyScriptClass(this.view.rankPart.barRankScore, PVPRankScoreBar)
                    .reset(
                        preConfig.minScore,
                        preConfig.maxScore,
                        this._previousScore,
                        this._finalScore,
                        (currentScore, maxScore) => {
                            this.view.rankPart.labelRankScore.text = PVPInfoUtils.getBalanceScoreText(this._winFlag, currentScore, maxScore);
                        },
                        () => {
                            const nextScore = maxScore + 1;
                            this.lvUpRank(nextScore);
                        },
                        this
                    );
            }, 1000);

            // logo
            FguiScriptUtils.toMyScriptClass(this.view.rankPart.logo, PVPRankBigLogoComp)
                .reset(preConfig);
        } else {
            // 王者段位, 直接结算
            // 没有分母
            this.view.rankPart.labelRankScore.text = PVPInfoUtils.getHighRankScoreText(this._winFlag, this._finalScore);

            this._config = afterConfig;

            this.view.rankPart.barRankScore.max = 1;
            this.view.rankPart.barRankScore.value = 1;
            this.view.rankPart.barRankScore.labelTitle.text = `${this._finalScore}`;

            this.view.rankPart.labelTitle.text = afterConfig.name;
            // logo
            FguiScriptUtils.toMyScriptClass(this.view.rankPart.logo, PVPRankBigLogoComp)
                .reset(afterConfig);

        }

    }

    // 升段位
    lvUpRank(preScore: number) {
        this._isLvUp = true;

        const nextScore = preScore + 1;
        const config = PVPUtils.getConfigByScore(nextScore);
        if (!config) {
            console.warn(`升段位没有找到配置. score = ${nextScore}`);
            return;
        }
        this._config = config;

        const maxScore = config.maxScore || 999999999;
        const maxScoreForThisRank = maxScore;

        // logo
        FguiScriptUtils.toMyScriptClass(this.view.rankPart.logo, PVPRankBigLogoComp)
            .reset(config);


        // rank title
        this.view.rankPart.labelTitle.text = config.name;

        // bar
        FguiScriptUtils.toMyScriptClass(this.view.rankPart.barRankScore, PVPRankScoreBar)
            .reset(
                config.minScore,
                config.maxScore || 999999999,
                preScore,
                this._finalScore,
                (currentScore, maxScore) => {
                    this.view.rankPart.labelRankScore.text = PVPInfoUtils.getBalanceScoreText(this._winFlag, currentScore, maxScore);
                },
                () => {
                    this.lvUpRank(maxScore + 1);
                },
                this
            );


    }

    // 挑战奖励 items
    renderForItem(index: number, comp: ItemFrameBtn) {

        const r = this._rewards[index];
        if (!r) {
            return;
        }
        comp.resetByNoOwnerItem(r);
    }

    // star 
    renderForStar(index: number, comp: ui.pvp.list.PVPRankStarComp) {
        comp.getController("reachFlag").selectedIndex = index < this._config.starMaxCount ? 1 : 0;

    }

}