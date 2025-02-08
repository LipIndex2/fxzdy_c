import * as fgui from "fairygui-cc";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { HangUpUIKeys } from "db://assets/scripts/game/modules/hangup/HangUpUIKeys";
import { HangUpPerHourData } from "db://assets/scripts/game/modules/hangup/structs/HangUpPerHourData";
import { ModelNode } from "db://assets/scripts/game/modules/common/node/ModelNode";
import { JumpManager } from "db://assets/scripts/game/modules/jump/JumpManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { HangUpUtils } from "db://assets/scripts/game/modules/hangup/utils/HangUpUtils";
import { BattleRecordManager } from "db://assets/scripts/game/comm/battle/BattleRecordManager";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import NotificationKey from "../../../event/NotificationKey";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommonKey } from "../../common/const/UICommonConfig";


const { GObject } = fgui;

/**
 * 挂机挑战 - 胜利
 */
@bindScript(HangUpUIKeys.HangUpBattleResultFailV2View)
export class HangUpBattleResultFailV2View extends UICommWin {

    private _levelId: number;
    // 通关道具奖励
    private _passBigRewardItemArray: Array<NoOwnerItem> = [];

    // 通关提升的数值
    private _passHangUpItemArray: Array<HangUpPerHourData> = [];

    static pkgName: string = "hangUp";
    static viewName: string = "HangUpBattleResultFailV2View";

    private get view(): ui.hangUp.viewV2.HangUpBattleResultFailV2View {
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
        console.debug(" onInit ")

        // 跳转
        this.view.panel.btnModule1.title = "英雄培养";
        this.view.panel.btnModule2.title = "招募";
        this.view.panel.btnModule3.title = "装备";


        // wait 4spine 动画
        GameTimer.ins().once(3200, this, () => {

            // outside
            this.view.panel.btnData.onClick(this.onClickBattleData0, this);
            this.view.panel.btnModule1.onClick(this.onClickJumpHero, this)
            this.view.panel.btnModule2.onClick(this.onClickJumpDrawCard, this)
            this.view.panel.btnModule3.onClick(this.onClickJumpEquip, this)
        });


    }


    protected onPreDispose() {
        GameTimer.ins().clearAll(this);

        super.onPreDispose();
    }

    protected onOpen() {

        // 模型
        const modelNode = this.view.modelNode as ModelNode;
        modelNode.loadByPath(HangUpUtils.getFailResultSpineAssetPath())
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

        this.view.getTransition("enter").play();
    }


    onClose() {


        // 关闭战斗界面
        G.FacadeManager.emit(NotificationKey.CLOSE_BATTLE_VIEW);

        // 关闭战斗界面, 回到主底图
        // FacadeManager.ins().emit(NotificationKey.EXIT_BATTLE)


        console.debug(" onClose ")

        // 重新打开 关卡界面
        UIManager.ins().open(HangUpUIKeys.HangUpMainView)
    }

    /**
     * 点击 【数据统计】
     */
    private onClickBattleData0() {
        console.debug(" onClickNextLevel0 ")


        // 战斗数据
        BattleRecordManager.ins().showRecordView(ServerEnums.FightType.TRUNK_INSTANCE, false,);
    }

    private onClickJumpHero() {
        this.closeCommonBattleView()
        JumpManager.ins().jumpByEnum(ServerEnums.SystemType.HERO)
    }

    private onClickJumpDrawCard() {
        this.closeCommonBattleView()
        JumpManager.ins().jumpByEnum(ServerEnums.SystemType.RECRUIT)
    }

    private onClickJumpEquip() {
        this.closeCommonBattleView()
        JumpManager.ins().jumpByEnum(ServerEnums.SystemType.EQUIP)
    }

    private closeCommonBattleView() {
        this.closeSelf()
        UIManager.ins().close(UICommonKey.CommonBattleView)
    }
}