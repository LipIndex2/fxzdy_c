import { Node, Tween, Vec3 } from "cc";
import * as fgui from "fairygui-cc";
import { HangUpRoadOneStepComp } from "../components/HangUpRoadOneStepComp";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { HangUpModel } from "db://assets/scripts/game/modules/hangup/model/HangUpModel";
import { HangUpUIKeys } from "db://assets/scripts/game/modules/hangup/HangUpUIKeys";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { HangUpChallengeViewOpenArgs } from "db://assets/scripts/game/modules/hangup/view/HangUpChallengeView";
import { HangUpUtils } from "db://assets/scripts/game/modules/hangup/utils/HangUpUtils";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { TimeUtils } from "db://assets/scripts/game/comm/utils/TimeUtils";
import { HangUpI18nKeys } from "db://assets/scripts/game/modules/hangup/HangUpI18nKeys";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { ModelNode } from "db://assets/scripts/game/modules/common/node/ModelNode";
import { HangUpConfigManager } from "db://assets/scripts/game/modules/hangup/config/HangUpConfigManager";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import { EnumRedDotShowType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotShowType";
import { SmallBattleLogic } from "../../../comm/battle/smallBattle/SmallBattleLogic";
import { TableManager } from "../../../../core/table/TableManager";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { TweenUtils } from "db://assets/scripts/core/utils/TweenUtils";
import { TimeUnit } from "db://assets/scripts/core/utils/TimeUnit";
import GIns from "../../../GIns";
import { BattleUIUtils } from "db://assets/scripts/game/modules/battle/utils/BattleUIUtils";
import { Color } from "cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { ShakeUtils } from "db://assets/scripts/core/utils/ShakeUtils";
import { Vec2 } from "cc";
import { v2 } from "cc";


const { GObject } = fgui;

export interface IHangUpMainViewArg {
    lastLevelId?: number;
    isNeedOpenAnim?: boolean;
}

/**
 * 挂机
 */
@bindScript(HangUpUIKeys.HangUpMainView)
export class HangUpMainView extends UICommWin {

    static pkgName: string = "hangUp";
    static viewName: string = "HangUpMainView";


    // 飘字次数
    private __floatCount = 0;
    // 动画 index
    private _animIndex: number = 0;
    private _configArray: table.trunkinstance.TrunkInstanceConfig[] = [];
    // 动画
    private _hangUpFloatAnimTween: Tween<any>;
    // 飘字原始位置
    private _oldTextPosition: Vec3;
    /***是否胜利回到这个界面后显示特效 */
    private _lastLevelId: number = -1;

    // ui world pos
    private _uiWorldPos: Vec3;
    private smallBattle: SmallBattleLogic

    // 快速领取
    private _tweenQuickGain: Tween<Node>;
    private _isNeedOpenAnim: boolean;


    private get view(): ui.hangUp.HangUpMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.HANG_UP_MAX_PASS_LEVEL_ID_CHANGE,
            NotificationKey.HANG_UP_CHALLENGE_LEVEL,
            NotificationKey.HANG_UP_UPDATE_GAIN_LEVEL_ID,
            NotificationKey.HANG_UP_SET_IN_BG,
            NotificationKey.HANG_UP_IN_BG_UPDATE,
            NotificationKey.HANG_UP_SPEED_UP_COUNT_CHANGE,
            RedDotKeys.hangUp_roadReward.toEventName(),
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.HANG_UP_SET_IN_BG: {
                // 设置到后台
                this.closeSelf();
                break;
            }
            case NotificationKey.HANG_UP_IN_BG_UPDATE:
            case NotificationKey.HANG_UP_MAX_PASS_LEVEL_ID_CHANGE: {
                this.reset();
                break;
            }
            case NotificationKey.HANG_UP_UPDATE_GAIN_LEVEL_ID:
                this.resetDialog();
                break;
            case NotificationKey.HANG_UP_CHALLENGE_LEVEL:
                this.closeSelf();
                break;
            case NotificationKey.HANG_UP_SPEED_UP_COUNT_CHANGE:
                this.playBtnQuickGainEffect();
                break;
            case RedDotKeys.hangUp_roadReward.toEventName():
                this.refreshRedDot();
                break;
        }

    }


    protected onPreDispose() {
        GameTimer.ins().clearAll(this);
        this._tweenQuickGain?.destroySelf();
        this.smallBattle?.dispose();
        super.onPreDispose();
    }

    public onInit(): void {
        console.debug(" onInit ");


        this._oldTextPosition = this.view.tipsHangUpAnim.node.position.clone();

        // 红点
        RedDotUtils.castComp(this.view.btnQuickGain.redDot)
            .reset(RedDotKeys.hangUp_quickGain);

        this.view.btnPreview.onClick(this.onClickPreview, this)
        this.view.btnBack.onClick(this.onClickBack, this)
        this.view.btnDialog.onClick(this.onClickDialog, this)
        this.view.btnBox.onClick(this.onClickHangUpBox, this)
        this.view.btnQuickGain.onClick(this.onClickQuickGain, this)
        this.view.btnChallenge.onClick(this.onClickChallenge0, this)


        // 关卡
        this.view.levelList.setVirtual();
        this.view.levelList.itemRenderer = this.irRoad.bind(this);

        // 挂机动画
        this.view.tipsHangUpAnim.visible = false;


        const spineModelNode = FguiScriptUtils.toMyScriptClass(this.view.spineTop, ModelNode);
        spineModelNode.loadByPath(HangUpConfigManager.spineAssetPath);

        // 挂机时间
        GameTimer.ins().frameLoop(30, this, this.updateHangUpTime.bind(this));
        // 挂机动画
        GameTimer.ins().loop(1000, this, this.playDropRewardAnim.bind(this));


        this.smallBattle = new SmallBattleLogic()
    }

    private btnQuickGainPos: Vec2
    private playBtnQuickGainEffect(): void {
        const curSpeedUpCount = HangUpModel.ins().getSpeedUpCount();
        const maxSpeedUpHangUpCount = HangUpUtils.getMaxSpeedUpHangUpCount();
        const restSpeedUpCount = maxSpeedUpHangUpCount - curSpeedUpCount;
        if (restSpeedUpCount > 0) {
            if (!this.btnQuickGainPos) {
                this.btnQuickGainPos = v2(this.view.btnQuickGain.node.pos.x, this.view.btnQuickGain.node.pos.y)
                TweenUtils.yoyoOnAxisY(this.view.btnQuickGain.node);
            }
        }
        else {
            Tween.stopAllByTarget(this.view.btnQuickGain.node)
            if (this.btnQuickGainPos) {
                GameTimer.ins().once(200, this, () => {
                    this.view.btnQuickGain.node.setPosition(this.btnQuickGainPos.x, this.btnQuickGainPos.y)
                })
            }
        }
    }

    onClickPreview() {
        UIManager.ins().open(HangUpUIKeys.HangUpPreviewRoadView);
    }

    onClickBack() {
        this.closeSelf();
    }

    private onClickDialog(event: fgui.Event) {
        const context = HangUpModel.ins().context;
        let nextRewardLevelId = context.getNextGainRewardLevelId();
        if (nextRewardLevelId == null) {
            console.debug(`不可以获取奖励 levelId = ${nextRewardLevelId}`);
            return;
        }
        let isPass = HangUpModel.ins().isPass(nextRewardLevelId);
        if (!isPass) {
            console.debug(`没有通过 levelId = ${nextRewardLevelId}`)
            return;
        }

        // dialog reward
        HangUpModel.ins().sendDrawInstanceReward(nextRewardLevelId);
    }

    /**
     * 点击挑战按钮
     */
    onClickChallenge0() {
        const isReachMaxLevel = HangUpModel.ins().isReachMaxLevel();
        if (isReachMaxLevel) {
            GIns.floatingTextMgr.showTips("已到达最大关卡");
            return;
        }

        const nextLevelId = HangUpModel.ins().getMyNextLevelId();
        UIManager.ins().open(HangUpUIKeys.HangUpChallengeView, HangUpChallengeViewOpenArgs.create(nextLevelId));
    }

    /**
     * 点击挂机按钮
     */
    onClickHangUpBox() {
        let isPassAnyLevel = HangUpModel.ins().isPassAnyLevel();
        if (!isPassAnyLevel) {
            GIns.floatingTextMgr.showTips(HangUpI18nKeys.HANG_UP_MUST_PASS_ANY_LEVEL);
            return;
        }


        // UIManager.ins().open(HangUpUIKeys.HangUpGainRewardView);
        UIManager.ins().open(HangUpUIKeys.HangUpPreviewRewardWin);
    }


    // 点击快速领取
    onClickQuickGain() {
        UIManager.ins().open(HangUpUIKeys.HangUpQuickGainConfirmWin);
    }

    public onOpen(arg: IHangUpMainViewArg = null): void {
        console.debug(" onOpen ");

        this._lastLevelId = arg?.lastLevelId;
        this._isNeedOpenAnim = arg?.isNeedOpenAnim || true;

        if (this._isNeedOpenAnim) {
            // 打开动画
            this.view.getTransition("playFirst").play(() => {
                // this._tweenQuickGain = TweenUtils.yoyoOnAxisY(this.view.btnQuickGain.node);
                this.playBtnQuickGainEffect()
            });
        }
        else {
            this.playBtnQuickGainEffect()
        }

        // wait anim
        GameTimer.ins().once(200, this, () => {
            this.refreshRedDot();

            this.reset();
            this.initSmallBattle()
        })
    }

    private initSmallBattle(): void {
        let cfg = HangUpModel.ins().getCurrentLevelConfig()
        if (!cfg)
            return
        let battleCfg = TableManager.getDataById(table.trunkinstance.TrunkInstanceSmallBattleConfig, cfg.smallBattleId)
        if (!battleCfg)
            return
        if (this.smallBattle && !this.smallBattle.isInit)
            this.smallBattle.init(battleCfg, this.view.nodePoint.node)
        this.smallBattle.start()
    }

    private reset() {
        // 是否通关 ？
        let isPassAnyLevel = HangUpModel.ins().isPassAnyLevel();
        this.view.getController("canGainHangUpRewardFlag").selectedIndex = isPassAnyLevel ? 1 : 0;

        const isReachMaxLevel = HangUpModel.ins().isReachMaxLevel();
        this.view.btnChallenge.visible = !isReachMaxLevel;

        // 关卡配置
        let nextLevelId = HangUpModel.ins().getMyNextLevelId();
        let nextLevelConfig = HangUpUtils.getHangUpConfigByLevelId(nextLevelId);
        if (nextLevelConfig) {
            const power = BattleUIUtils.getPowerByBattleConfigId(nextLevelConfig.battleConfigId)
            this.view.btnChallenge.labelPower.text = power.toString();

            // color
            const color = HangUpUtils.getColorByPower(nextLevelId, power);
            if (color == Color.RED) {
                this.view.btnChallenge.labelPower.color = new Color("#FF7070");
                this.view.btnChallenge.labelPower.strokeColor = new Color("#c20808");
            } else if (color == Color.GREEN) {
                this.view.btnChallenge.labelPower.color = new Color("#7aea72");
                this.view.btnChallenge.labelPower.strokeColor = new Color("#0e7d03");

            } else {
                this.view.btnChallenge.labelPower.color = new Color("#FFFFFF");
                this.view.btnChallenge.labelPower.strokeColor = new Color("#000000");

            }
        }

        // in bg ?
        const isInBg = HangUpModel.ins().context.isInBgState();
        this.view.getController("isInBg").selectedIndex = isInBg ? 1 : 0;

        // 关卡
        this.updateRoadList();

        // 更新挂机时间
        this.updateHangUpTime();

        // 气泡
        this.resetDialog();
    }

    private resetDialog() {
        // n 关后的奖励提示
        let nextLevelCountRewardTips = HangUpModel.ins().context.getNextLevelCountRewardTips(false);
        let haveRewardFlag = nextLevelCountRewardTips.haveRewardFlag;
        // 可以领取的奖励
        let isCanGain = nextLevelCountRewardTips.canGainRewardFlag;
        this.view.btnDialog.getController("canGainFlag").selectedIndex = isCanGain ? 1 : 0;

        this.view.btnDialog.touchable = isCanGain;

        const spineModelNode = FguiScriptUtils.toMyScriptClass(this.view.spineTop, ModelNode);
        spineModelNode.setScale(1.5, 1.5);
        // 可以领取奖励
        if (isCanGain) {
            spineModelNode.playOrders([
                {
                    name: HangUpConfigManager.animNameForHaveReward,
                },
                {
                    name: HangUpConfigManager.animNameForIdle,
                    isLoop: true
                }
            ]);

            // 显示下一关奖励
            if (haveRewardFlag) {
                this.view.btnDialog.labelNextLevelRewardTitle
                    .setVar("levelCount", nextLevelCountRewardTips.levelCount.toString())
                    .flushVars()
                let rewardItem = nextLevelCountRewardTips.rewardItem;
                this.view.btnDialog.gainComp.labelNextLevelRewardCount.text = `x${rewardItem.count}`;
                this.view.btnDialog.gainComp.imageNextLevelRewardItem.icon = rewardItem.getItemSmallIconPath()
            }
        } else {
            spineModelNode.playOrders([
                {
                    name: HangUpConfigManager.animNameForNoReward,
                },
                {
                    name: HangUpConfigManager.animNameForIdle,
                    isLoop: true
                }
            ]);

            // 显示下一关奖励
            if (haveRewardFlag) {
                this.view.btnDialog.labelNextLevelRewardTitle
                    .setVar("levelCount", nextLevelCountRewardTips.levelCount.toString())
                    .flushVars()
                let rewardItem = nextLevelCountRewardTips.rewardItem;
                this.view.btnDialog.canGainRewardComp.labelNextLevelRewardCount.text = `x${rewardItem.count}`;
                this.view.btnDialog.canGainRewardComp.imageNextLevelRewardItem.icon = rewardItem.getItemSmallIconPath()
            }
        }
        // 是否有大奖励可领取
        this.view.getController("haveBigRewardFlag").selectedIndex = haveRewardFlag ? 1 : 0;

        this.refreshRedDot();
    }

    private playDropRewardAnim() {
        this.__floatCount++;
        if (this.__floatCount < 3) {
            return;
        }
        // 获取下一个获得的道具动画 item
        const diffItem: NoOwnerItem = HangUpModel.ins().getCurrentAnimGainItem()
        if (!diffItem) {
            this.view.tipsHangUpAnim.visible = false;
            return;
        }
        let itemConfig = diffItem.getItemConfig();
        if (!itemConfig) {
            this.view.tipsHangUpAnim.visible = false;
            return;
        }
        this.view.tipsHangUpAnim._uiOpacity.opacity = 255;
        this.view.tipsHangUpAnim.visible = true;

        this.view.tipsHangUpAnim.imageItem.icon = itemConfig.iconPath;
        let count = diffItem.count;
        this.view.tipsHangUpAnim.title.text = "+" + count;

        // 是否有数量
        let isNeedPlay = count > 0;
        this.view.tipsHangUpAnim.visible = isNeedPlay;
        if (!isNeedPlay) {
            return;
        }

        // anim
        this.view.getTransition("playHangUpFloatAnim").play()

    }

    /**
     * 更新挂机时间
     */
    updateHangUpTime() {
        const hangUpTimeMs: number = HangUpModel.ins().getTotalHangUpTimeMs();

        if (hangUpTimeMs <= 0) {
            this.view.labelBoxTime.text = "00:00:00";
            this.view.btnBox.getController("type").selectedIndex = 0;
            return;
        }

        this.view.labelBoxTime.text = TimeUtils.formatTimeMsToPositiveTimeText(hangUpTimeMs);

        if (hangUpTimeMs >= 0 && hangUpTimeMs < TimeUnit.MINUTES.toMilliseconds(10)) {
            // [0, 10min)
            if (this.shakeTimerId)
                this.stopShakerHandler()
            this.view.btnBox.getController("type").selectedIndex = 0;
        } else if (hangUpTimeMs >= TimeUnit.MINUTES.toMilliseconds(10) && hangUpTimeMs < TimeUnit.MINUTES.toMilliseconds(60)) {
            // [10 min, 60 min)
            if (this.shakeTimerId)
                this.stopShakerHandler()
            this.view.btnBox.getController("type").selectedIndex = 1;
        } else {
            // [60 min, +oo)
            this.view.btnBox.getController("type").selectedIndex = 2;
            if (!this.shakeTimerId) {
                this.shakeTimerId = GameTimer.ins().loop(3000, this, this.onShakerHandler);
                this.onShakerHandler()
            }
        }
    }

    private shakeTimerId: string;
    private onShakerHandler(): void {
        ShakeUtils.shake(this.view.btnBox.node, 2, 4, 32, 2)
    }

    private stopShakerHandler(): void {
        GameTimer.ins().clear(this, this.onShakerHandler);
        ShakeUtils.stopShake(this.view.btnBox.node)
        this.shakeTimerId = null;
    }

    public onClose(): void {
        this.stopShakerHandler();
        GameTimer.ins().clearAll(this);
        this.smallBattle.stop()
        FacadeManager.ins().emit(NotificationKey.HANG_UP_EXIT_MAIN_VIEW);

        console.debug(" onClose ");

    }


    /**
     * 挑战路
     * @param index
     * @param comp
     * @private
     */
    private irRoad(index: number, comp: HangUpRoadOneStepComp) {
        const hangUpConfig = this._configArray[index];
        let lastOneIndex = this._configArray.length - 1;
        let lastOneFlag = index == lastOneIndex;
        if (!hangUpConfig) {
            return
        }

        comp.reset(index, hangUpConfig, lastOneFlag, this._lastLevelId)
    }

    /**
     * 更新 road
     * @private
     */
    private updateRoadList() {

        // 只取 [-20, +50]
        // let allConfigArray = TableManager.getAllData(table.trunkinstance.TrunkInstanceConfig);
        const currentLevelId = HangUpModel.ins().getCurrentLevelId();
        let allConfigArray = HangUpConfigManager.getCanSeeConfigArrayByCurLevelId(currentLevelId);
        this._configArray = allConfigArray;
        // .toDataStream()
        // .filter(it => it.showInRoadFlag)
        // .toArray();
        this.view.levelList.numItems = this._configArray.length;

        // 选中当前关卡
        let nextLevelId = HangUpModel.ins().getMyNextLevelId();
        let targetIndex = 0
        allConfigArray.findIndex((it, index) => {
            if (it.id == nextLevelId) {
                targetIndex = index
            }
        })
        // no.3 on left
        const finalIndex = Math.max(targetIndex - 2, 0)
        this.view.levelList.scrollToView(finalIndex, true, true);
        GameTimer.ins().once(100, this, () => {
            this.view.levelList.scrollPane.scrollLeft(0.4);
        })

        this._lastLevelId = -1;
    }

    private refreshRedDot() {
        const redDotCom = RedDotUtils.castComp(this.view.btnDialog.redDot);
        const redDotCom2 = RedDotUtils.castComp(this.view.btnDialog.redDot2);
        const context = HangUpModel.ins().context;
        const isCanGain = context.isCanGainAnyRoadReward();
        if (isCanGain) {
            redDotCom.showByType(EnumRedDotShowType.ITEM_HEIGHT_LIGHT);
            redDotCom2.showByType(EnumRedDotShowType.REWARD);
        } else {
            redDotCom.showByType(EnumRedDotShowType.NULL);
            redDotCom2.showByType(EnumRedDotShowType.NULL);
        }
    }
}