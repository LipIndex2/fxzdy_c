import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { WorldController } from "../../../comm/world/WorldController";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { CommonBattleResultViewOpenArgs } from "../../battle/args/CommonBattleResultViewOpenArgs";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { ModelNode } from "../../common/node/ModelNode";
import { HangUpUtils } from "../../hangup/utils/HangUpUtils";
import { UICollectiblesDungeonConfig } from "../const/UICollectiblesDungeonConfig";
import { CollectiblesDungeonConditionVo } from "../model/vo/CollectiblesDungeonConditionVo";

@bindScript(UICollectiblesDungeonConfig.CollectiblesDungeonBattleWinView)
export class CollectiblesDungeonBattleWinView extends UICommWin {
    static pkgName: string = "collectiblesDungeon";
    static viewName: string = "CollectiblesDungeonBattleWinView";

    protected _args: CommonBattleResultViewOpenArgs;
    protected _isClickNext: boolean = false;
    /**自动下一关时间*/
    protected _autoNextLevelTime: number = 0;
    protected _timerKey: string = null;

    protected _battleResult: Vo.collectiblesdungeon.CollectiblesDungeonChallengeResult = null;
    protected _conditions: CollectiblesDungeonConditionVo[] = [];
    protected _stars: ui.collectiblesDungeon.component.CollectiblesDungeonStar[] = [];
    protected _starResults: boolean[] = [];

    private get view(): ui.collectiblesDungeon.view.CollectiblesDungeonBattleWinView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
        ];
    }

    notificationHandler(event: string, args?: any): void {

    }

    /***组件初始化 */
    protected onInit(): void {
        this._stars = [
            this.view.winComp.star1,
            this.view.winComp.star2,
            this.view.winComp.star3
        ];

        this.view.winComp.listCond.itemRenderer = this.itemRendererForCond.bind(this);
        this.view.winComp.listReward.setVirtual();
        this.view.winComp.listReward.itemRenderer = this.itemRendererForReward.bind(this);
        this.view.winComp.btnData.onClick(this.onClickBattleData, this);
        this.view.winComp.btnNext.onClick(this.onClickNext, this);
    }

    protected onPreDispose(): void {

    }

    protected itemRendererForCond(index: number, item: ui.collectiblesDungeon.item.CollectiblesDungeonBattleCondItem): void {
        item.lbCond.text = this._conditions[index].desc;
        item.getController('state').selectedIndex = this._starResults.length > index && this._starResults[index] ? 0 : 1;
    }

    protected itemRendererForReward(index: number, item: ItemFrameBtn): void {
        item.resetByNoOwnerItem(this._args.rewards[index]);
    }

    /**
     * 点击 【数据统计】
     */
    private onClickBattleData() {
        // 战斗数据
        GIns.battleRecordMgr.showRecordView(this._args.fightType, true);
    }

    /**添加计时器*/
    protected addTimer(): void {
        if (!this._timerKey) {
            this._timerKey = G.GameTimer.loop(1000, this, this.onTimer);
        }
        this.onTimer();
    }

    protected onClickNext(): void {
        if (this.hasNextLevel()) {
            let result: boolean = this._args.callbackForNextLevel();
            WorldController.ins().isClickNextLevel = result;
            this._isClickNext = result;
        }
        this.closeSelf();
    }

    /**移除计时器*/
    protected removeTimer(): void {
        if (this._timerKey) {
            G.GameTimer.clearByKey(this._timerKey)
            this._timerKey = null
        }
    }

    protected onTimer(): void {
        if (this.view.winComp.btnGouXuan.selected) {
            this._autoNextLevelTime--;
            this.view.winComp.lbAutoTime.text = `自动战斗(${this._autoNextLevelTime}s)`
            if (this._autoNextLevelTime > 0) {
                return;
            }
            this.onClickNext();
        }
    }

    /**有下一关*/
    protected hasNextLevel(): boolean {
        return this._args.autoNextLevelInitSecond > 0 && this._args.callbackForNextLevel != null;
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._args = args as CommonBattleResultViewOpenArgs;
        this._battleResult = args.param;
        const modelNode = this.view.winComp.modelNode as ModelNode;
        modelNode.loadByPath(HangUpUtils.getWinResultSpineAssetPath())
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

        let rewardCnt: number = this._args?.rewards ? this._args.rewards.length : 0;
        this.view.winComp.listReward.numItems = rewardCnt;
        this.view.winComp.btnGouXuan.selected = GIns.petDungeonMgr.isSelectAutoNext;
        if (this.hasNextLevel()) {
            this.view.winComp.gNext.visible = true;
            this._autoNextLevelTime = this._args.autoNextLevelInitSecond;
            this.view.winComp.lbAutoTime.text = `自动战斗(${this._autoNextLevelTime}s)`
        } else {
            this.view.winComp.gNext.visible = false;
        }

        let levelId: number = GIns.collectiblesDungeonModel.battleId;
        let levelVo = GIns.collectiblesDungeonModel.getLevelVo(levelId);

        if (this._battleResult) {
            this._starResults = [this._battleResult.star1 > 0, this._battleResult.star2 > 0, this._battleResult.star3 > 0];
            let starCnt = this._starResults.filter((value) => value == true).length;
            this._stars.forEach((star, index) => {
                if (index < starCnt) {
                    star.getController('state').selectedIndex = 0;
                } else {
                    star.getController('state').selectedIndex = 1;
                }
            })
        }
        this._conditions = levelVo ? levelVo.conditions : [];
        this.view.winComp.listCond.numItems = this._conditions.length;

        this.view.winComp.lbTip.text = `今日剩余挑战次数：${GIns.collectiblesDungeonModel.vo.challengeCount}`;

        this.view.winComp.getTransition("enter").play(() => {
            if (this.view?.node?.isValid) {
                if (this.hasNextLevel()) {
                    this.addTimer();
                }
            }
        });
    }

    protected onClose(dontDispose?: boolean): void {
        GIns.petDungeonMgr.isSelectAutoNext = this.view.winComp.btnGouXuan.selected;
        this.emit(NotificationKey.LOADING_VIEW_SHOW);
        if (!this._isClickNext) {
            this.emit(NotificationKey.CLOSE_BATTLE_VIEW);
        }
        G.GameTimer.clearAll(this);
    }
}