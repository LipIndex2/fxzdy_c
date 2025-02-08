import G from "db://assets/scripts/core/comm/G";
import UIScriptManager from "db://assets/scripts/core/comm/UIScriptManager";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { BattleRecordManager } from "db://assets/scripts/game/comm/battle/BattleRecordManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import {
    CommonBattleResultViewOpenArgs
} from "db://assets/scripts/game/modules/battle/args/CommonBattleResultViewOpenArgs";
import { UICommonKey } from "db://assets/scripts/game/modules/common/const/UICommonConfig";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";
import { ModelNode } from "db://assets/scripts/game/modules/common/node/ModelNode";
import { HangUpUtils } from "db://assets/scripts/game/modules/hangup/utils/HangUpUtils";
import * as fgui from "fairygui-cc";
import { BattleManager } from "../../../comm/battle/BattleManager";
import { WorldController } from "../../../comm/world/WorldController";


const { GObject } = fgui;

/**
 * 挂机挑战 - 胜利
 */
export class CommonBattleResultWinView extends UICommWin {

    static pkgName: string = "commBattle";
    static viewName: string = "CommonBattleResultWinView";

    // 通关道具奖励
    private _passBigRewardItemArray: Array<NoOwnerItem> = [];

    // 参数
    private _args: CommonBattleResultViewOpenArgs;
    // 自动下一关
    private _autoNextLevelInitSecond: number = 0;

    private get view(): ui.commBattle.battle.CommonBattleResultWinView {
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


        // 奖励道具
        this.view.panel.itemList.setVirtual();
        this.view.panel.itemList.itemRenderer = this.iRItem.bind(this);


        this.view.panel.btnData.onClick(this.onClickBattleData0, this);
        this.view.btnData.onClick(this.onClickBattleData0, this);
    }

    public onOpen(args: CommonBattleResultViewOpenArgs): void {
        G.Logger.debug(" onOpen ");
        if (!args) {
            return;
        }
        this._args = args;

        // 模型
        const modelNode = this.view.modelNode as ModelNode;
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


        this.reset();
        this.view.getTransition("enter").play(() => {
            if (this.view?.node?.isValid) {
                // btn
                this.view.btnNextLevel.onClick(this.onClickNextLevel0, this);
                if (this._autoNextLevelInitSecond > 0) {
                    G.GameTimer.loop(1000, this, this.onCd);
                }
            }
        });
    }

    onCd() {
        this._autoNextLevelInitSecond = Math.max(0, this._autoNextLevelInitSecond - 1);
        this.view.labelAutoNext.text = `${this._autoNextLevelInitSecond}秒后进入下一关`;
        if (this._autoNextLevelInitSecond > 0) {
            return;
        }
        this.view.btnNextLevel.fireClick();
        G.GameTimer.clear(this, this.onCd);


    }


    onClose() {
        // loading
        G.FacadeManager.emit(NotificationKey.LOADING_VIEW_SHOW);


        // 关闭战斗
        if (!WorldController.ins().isClickNextLevel)
            G.FacadeManager.emit(NotificationKey.CLOSE_BATTLE_VIEW);

        G.GameTimer.clearAll(this);

        G.Logger.debug(" onClose ")

    }


    /**
     * 点击 【下一关】
     */
    private onClickNextLevel0() {
        // 不显示下一关
        if (!this._args.isShowNextLevel) {
            this.closeSelf();
            return;
        }
        G.Logger.debug(" 下一关 ")
        WorldController.ins().isClickNextLevel = true;
        const cb = this._args.callbackForNextLevel
        cb && cb();
        this.closeSelf();
    }

    /**
     * 点击 【数据统计】
     */
    private onClickBattleData0() {
        G.Logger.debug(" onClickNextLevel0 ")

        // 战斗数据
        BattleRecordManager.ins().showRecordView(this._args.fightType, true);
    }


    private reset() {
        const panelS = BattleManager.ins().isPanelShow(this._args.fightType, { items: this._args.rewards });
        this.view.panel.visible = panelS;
        this.view.btnData.visible = !panelS;
        this.view.lbTeamTips.text = this._args?.emailTips || '';
      

        let isCanNext = this._args.isShowNextLevel || false;
        const autoNextLevelInitSecond = this._args.autoNextLevelInitSecond || 0;
        this._autoNextLevelInitSecond = autoNextLevelInitSecond;
        let isAutoNext = autoNextLevelInitSecond > 0;
        this.view.btnNextLevel.visible = isCanNext;

        this.view.getController("isCanNext").selectedIndex = isCanNext ? 1 : 0;
        this.view.getController("isAutoChallengeNext").selectedIndex = isAutoNext ? 1 : 0;
        this.view.labelAutoNext.text = `${autoNextLevelInitSecond}秒后进入下一关`;
        // this.view.btnNextLevel.visible = isCanNext;


        // 道具
        this._passBigRewardItemArray = this._args.rewards || [];
        this.view.panel.itemList.numItems = this._passBigRewardItemArray.length;

    }


    iRItem(index: number, comp: ItemFrameBtn): void {
        let noOwnerItem = this._passBigRewardItemArray[index];
        if (!noOwnerItem) {
            return;
        }

        comp.resetByNoOwnerItem(noOwnerItem);

    }
}

UIScriptManager.bindScript(UICommonKey.CommonBattleResultWinView, CommonBattleResultWinView)