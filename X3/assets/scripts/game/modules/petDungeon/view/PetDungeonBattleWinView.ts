import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { WorldController } from "../../../comm/world/WorldController";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { CommonBattleResultViewOpenArgs } from "../../battle/args/CommonBattleResultViewOpenArgs";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { ModelNode } from "../../common/node/ModelNode";
import { HangUpUtils } from "../../hangup/utils/HangUpUtils";
import { UIPetDungeonConfig } from "../const/UIPetDungeonConfig";
import { PetDungeonBattleHeroList } from "./component/PetDungeonBattleHeroList";

@bindScript(UIPetDungeonConfig.PetDungeonBattleWinView)
export class PetDungeonBattleWinView extends UICommWin {
    static pkgName: string = "petDungeon";
    static viewName: string = "PetDungeonBattleWinView";

    protected _args: CommonBattleResultViewOpenArgs;
    protected _isClickNext: boolean = false;
    /**自动下一关时间*/
    protected _autoNextLevelTime: number = 0;
    protected _timerKey: string = null;
    /**是否跨天*/
    protected _isDayChange:boolean = false;

    private get view(): ui.petDungeon.view.PetDungeonBattleWinView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.SYSTEM_NEW_DAY
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch(event) {
            case NotificationKey.SYSTEM_NEW_DAY:
                this._isDayChange = true;
                break;
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.winComp.itemList.setVirtual();
        this.view.winComp.itemList.itemRenderer = this.itemRendererForReward.bind(this);
        this.view.winComp.btnData.onClick(this.onClickBattleData, this);
        this.view.winComp.btnNext.onClick(this.onClickNext, this);
    }

    protected onPreDispose(): void {

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
            let result:boolean = this._args.callbackForNextLevel();
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
        return this._args.autoNextLevelInitSecond > 0 && this._args.callbackForNextLevel != null && this._isDayChange == false;
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._args = args as CommonBattleResultViewOpenArgs;
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

        FguiScriptUtils.toMyScriptClass(this.view.winComp.heroComp, PetDungeonBattleHeroList).updateUI();

        let rewardCnt: number = this._args?.rewards ? this._args.rewards.length : 0;
        this.view.winComp.itemList.numItems = rewardCnt;
        this.view.winComp.lbNoneRewardTip.visible = rewardCnt <= 0;
        this.view.winComp.btnGouXuan.selected = GIns.petDungeonMgr.isSelectAutoNext;
        if (this.hasNextLevel()) {
            this.view.winComp.gNext.visible = true;
            this._autoNextLevelTime = this._args.autoNextLevelInitSecond;
            this.view.winComp.lbAutoTime.text = `自动战斗(${this._autoNextLevelTime}s)`
        } else {
            this.view.winComp.gNext.visible = false;
        }

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