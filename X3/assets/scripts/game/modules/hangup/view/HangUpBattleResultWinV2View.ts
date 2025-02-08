import * as fgui from "fairygui-cc";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { HangUpUtils } from "db://assets/scripts/game/modules/hangup/utils/HangUpUtils";
import { ItemUtils } from "../../item/utils/ItemUtils";
import ArrayUtils from "../../../../core/utils/ArrayUtils";
import { HangUpModel } from "db://assets/scripts/game/modules/hangup/model/HangUpModel";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { HangUpUIKeys } from "db://assets/scripts/game/modules/hangup/HangUpUIKeys";
import { HangUpPerHourData } from "db://assets/scripts/game/modules/hangup/structs/HangUpPerHourData";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { ModelNode } from "db://assets/scripts/game/modules/common/node/ModelNode";
import { HangUpBattleResultWinV2ViewOpenArgs } from "../interface/IHangUpArgs";
import { IHangUpMainViewArg } from "./HangUpMainView";
import { BattleRecordManager } from "db://assets/scripts/game/comm/battle/BattleRecordManager";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { HangUpPerHourIconComp } from "db://assets/scripts/game/modules/hangup/components/HangUpPerHourIconComp";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import { HangUpConfigManager } from "db://assets/scripts/game/modules/hangup/config/HangUpConfigManager";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import G from "../../../../core/comm/G";
import { WorldController } from "../../../comm/world/WorldController";
import GIns from "../../../GIns";
import { bindScript } from "../../../../core/comm/UIScriptManager";


const { GObject } = fgui;

// 胜利方式
enum EnumHangUpWinType {
    WIN_MANUAL = 0,
    WIN_IN_AUTO = 1,
    FAIL_IN_AUTO_BUT_SHOW_WIN = 2,

}

/**
 * 挂机挑战 - 胜利
 */
@bindScript(HangUpUIKeys.HangUpBattleResultWinV2View)
export class HangUpBattleResultWinV2View extends UICommWin {

    static pkgName: string = "hangUp";
    static viewName: string = "HangUpBattleResultWinV2View";

    private _levelId: number;
    // 通关道具奖励
    private _passBigRewardItemArray: Array<NoOwnerItem> = [];

    // 通关提升的数值
    private _passHangUpItemArray: Array<HangUpPerHourData> = [];

    // 是否显示下一关
    private _isShowNextLevel: boolean = true;
    private _args: HangUpBattleResultWinV2ViewOpenArgs;
    // 胜利方式
    private _winType: EnumHangUpWinType = EnumHangUpWinType.WIN_MANUAL;
    private _startCdTimeMs: number = 0;

    private get view(): ui.hangUp.viewV2.HangUpBattleResultWinV2View {
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


        // 奖励道具
        this.view.panel.itemList.setVirtual();
        this.view.panel.itemList.itemRenderer = this.renderItemForItemList.bind(this);


        // 挂机升级
        this.view.panel.hangUpItemList.setVirtual();
        this.view.panel.hangUpItemList.itemRenderer = this.renderItemForHangUpItem.bind(this);

    }

    public onOpen(args: HangUpBattleResultWinV2ViewOpenArgs): void {
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
        this.reset(args);

        const context = HangUpModel.ins().context;

        // 是否可以自动战斗?
        const isCanAutoChallenge = context.isCanAutoChallengeNextLevel() && this._isShowNextLevel;
        this.view.labelAutoTips.visible = isCanAutoChallenge;


        // 倒计时先隐藏
        this.view.labelAutoTips.visible = false;
        this.view.getTransition("enter").play(() => {
            // outside
            this.view.btnNextLevel.onClick(this.onClickNextLevel0, this);
            this.view.panel.btnData.onClick(this.onClickBattleData0, this);


            // 可以自动战斗
            if (isCanAutoChallenge) {
                // TODO 倒计时自动战斗 | 策划一直在调整这个时间
                GameTimer.ins().once(0, this, () => {

                    this.view.labelAutoTips.visible = true;
                    this.view.getTransition("cd").play();


                    this._startCdTimeMs = TimeManager.serverNow;
                    GameTimer.ins().loop(500, this, () => {
                        const passTimeMs = TimeManager.serverNow - this._startCdTimeMs;
                        const restSec = Math.max(0, HangUpConfigManager.autoChallengeWaitSecond - Math.floor(passTimeMs / 1000));
                        this.view.labelAutoTips.text = `${restSec}秒后自动挑战下一关`;

                        if (restSec <= 0) {
                            this.view.btnNextLevel.fireClick();
                            GameTimer.ins().clearAll(this);
                        }
                    });


                    return;
                })
            }


        });
    }


    protected onPreDispose() {
        GameTimer.ins().clearAll(this);

        super.onPreDispose();
    }

    onClose() {

        // 关闭战斗界面, 回到主底图
        if (!this.isClickNext) {
            G.FacadeManager.emit(NotificationKey.CLOSE_BATTLE_VIEW);
            // G.FacadeManager.emit(NotificationKey.EXIT_BATTLE)
        }
        // this.isClickNext


        console.debug(" onClose ")

        if (this._isShowNextLevel && !this.isClickNext) {
            // 重新打开 关卡界面
            UIManager.ins().open(HangUpUIKeys.HangUpMainView, { lastLevelId: this._levelId } as IHangUpMainViewArg)
        }
    }

    private isClickNext = false;

    /**
     * 点击 【下一关】
     */
    private onClickNextLevel0() {
        console.debug(" onClickNextLevel0 ")

        // no auto
        this.setNotAutoChallenge();

        const isReachMaxLevel = HangUpModel.ins().isReachMaxLevel();
        if (isReachMaxLevel) {
            GIns.floatingTextMgr.showTips("已挑战到最大关卡");
            G.FacadeManager.emit(NotificationKey.CLOSE_BATTLE_VIEW);
            this.closeSelf();
            return
        }

        this.isClickNext = true;
        WorldController.ins().isClickNextLevel = true;

        // net 发起挑战
        let nextLevelId = HangUpModel.ins().getMyNextLevelId();
        HangUpModel.ins().sendChallengeTrunkInstance({
            instanceId: nextLevelId
        })
        this.closeSelf();


        // 关闭战斗界面, 回到主底图
        // FacadeManager.ins().emit(NotificationKey.EXIT_BATTLE)


    }

    /**
     * 点击 【数据统计】
     */
    private onClickBattleData0() {
        console.debug(" onClickNextLevel0 ")

        // no auto
        this.setNotAutoChallenge();

        // 战斗数据
        BattleRecordManager.ins().showRecordView(ServerEnums.FightType.TRUNK_INSTANCE, true);
    }


    private reset(args: HangUpBattleResultWinV2ViewOpenArgs) {
        let levelId = args.levelId;
        const isWin = args.isWin;

        this._levelId = levelId;

        // 挂机关卡配置
        if (!levelId) {
            console.error("levelId is null");
            return;
        }
        const levelConfig = HangUpUtils.getHangUpConfigByLevelId(this._levelId);
        if (!levelConfig) {
            console.error("config is null");
            return;
        }
        const isShowNextLevel = !levelConfig.isNotShowNextLevel;
        this._isShowNextLevel = isShowNextLevel;
        this.view.btnNextLevel.visible = isShowNextLevel;
        this.setHaveRewardState(levelConfig);


        // 关卡收益
        this._passHangUpItemArray = HangUpUtils.createHangUpPerHourDataArrayByConfig(levelConfig);
        this.view.panel.hangUpItemList.numItems = this._passHangUpItemArray.length;

        // 道具
        let noOwnerItems = ItemUtils.parseKvArrayToItemArray(levelConfig.rewards);
        if (ArrayUtils.isNotEmpty(noOwnerItems)) {
            this._passBigRewardItemArray = noOwnerItems;
            this.view.panel.itemList.numItems = noOwnerItems.length;
        } else {
            this.view.panel.itemList.numItems = 0;
        }

        // 战斗中 n 关卡之后获得 xxx
        let nextLevelCountRewardTips = HangUpModel.ins().context.getNextLevelCountRewardTips(true);
        let haveRewardFlag = nextLevelCountRewardTips.haveRewardFlag;
        // 清空所有文本
        this.view.panel.labelTips.visible = haveRewardFlag;
        this.view.panel.imageNextNLevelReward.visible = haveRewardFlag;
        this.view.panel.labelRewardCount.visible = haveRewardFlag;
        if (haveRewardFlag) {
            const levelCount = nextLevelCountRewardTips.levelCount;
            const rewardItem = nextLevelCountRewardTips.rewardItem;

            // N 关卡之后获得 xxx
            this.view.panel.labelRewardCount.text = `x${rewardItem.count}`
            this.view.panel.imageNextNLevelReward.icon = rewardItem.getItemSmallIconPath();
            this.view.panel.labelTips
                .setVar("levelCount", `${levelCount}`)
                .flushVars()
        }


    }

    private setHaveRewardState(hangUpConfig: table.trunkinstance.TrunkInstanceConfig) {
        const isHaveReward = HangUpUtils.isLevelConfigHaveReward(hangUpConfig)

        // this.view.panel.getController("haveRewardFlag").selectedIndex = isHaveReward ? 1 : 0;

        // 说统一只显示效率, 需求改了又
        this.view.panel.getController("haveRewardFlag").selectedIndex = 0;


    }


    /**
     * 挂机收益
     * @param index
     * @param comp
     */
    renderItemForHangUpItem(index: number, comp: HangUpPerHourIconComp): void {
        let data = this._passHangUpItemArray[index];
        comp.reset(data);

    }


    private onTouchOutSide(event: fgui.Event) {
        console.debug(event, " onTouchEnd ")

        this.emit(NotificationKey.LOADING_VIEW_SHOW);

        // // 点击空白处退出
        // let isIn = TouchUtils.isFguiTouchInUi(event, this.view._uiTrans)
        // if (isIn) {
        //     return
        // }
        this.closeSelf()
    }

    /**
     * 奖励
     * @param index
     * @param item
     */
    renderItemForItemList(index: number, item: ui.comm.item.ItemFrameBtn): void {
        let noOwnerItem = this._passBigRewardItemArray[index];
        if (!noOwnerItem) {
            return;
        }

        let config = noOwnerItem.getItemConfig();
        if (!config) {
            return;
        }

        item.item.img_item.icon = config.iconPath;
        item.item.T_num.text = "" + noOwnerItem.count;
        item.item.img_frame.icon = noOwnerItem.getQualityIconPath();

    }

    /**
     * 设置不自动挑战
     * @private
     */
    private setNotAutoChallenge() {
        GameTimer.ins().clearAll(this);
        this.view.labelAutoTips.visible = false;
    }
}