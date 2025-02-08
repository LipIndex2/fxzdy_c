import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { ModuleOpenManager } from "db://assets/scripts/game/modules/moduleopen/ModuleOpenManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { HangUpUIKeys } from "db://assets/scripts/game/modules/hangup/HangUpUIKeys";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { HangUpI18nKeys } from "db://assets/scripts/game/modules/hangup/HangUpI18nKeys";
import { HangUpManager } from "db://assets/scripts/game/modules/hangup/HangUpManager";
import { ModelUtils } from "db://assets/scripts/game/modules/common/model/ModelUtils";
import { MainPageUtils } from "db://assets/scripts/game/ui/main/utils/MainPageUtils";
import { CdUtils } from "db://assets/scripts/game/comm/utils/CdUtils";
import { EnumCDKeys } from "db://assets/scripts/core/const/EnumCDKeys";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { Node, sp, tween, Tween, v3 } from "cc";
import { HangUpModel } from "db://assets/scripts/game/modules/hangup/model/HangUpModel";
import { HangUpConfigManager } from "db://assets/scripts/game/modules/hangup/config/HangUpConfigManager";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { TimeUnit } from "db://assets/scripts/core/utils/TimeUnit";
import HangUpState = ServerEnums.HangUpState;
import SystemType = ServerEnums.SystemType;
import { Logger } from "db://assets/scripts/core/log/Logger";
import { ShakeUtils } from "db://assets/scripts/core/utils/ShakeUtils";

/**
 * 挂机入口
 */
@bindFguiExtension("ui://comm/HangUpEntryBtn")
export class HangUpEntryBtn extends FGUI.GButton implements INotification {

    // spine 节点
    private _spineNode: Node;
    private _tweenArray: Tween<any>[] = [];
    private _content: string = "托管中";


    get view(): ui.comm.footer.btn.HangUpEntryBtn {
        return this as any;
    }


    listenNotifications(): string[] {
        return [
            NotificationKey.HANG_UP_SET_IN_BG,
            NotificationKey.HANG_UP_IN_BG_UPDATE,
            NotificationKey.HANG_UP_IN_BG_PASS_NEW_LEVEL_ID,
            NotificationKey.HANG_UP_MAX_PASS_LEVEL_ID_CHANGE,
            NotificationKey.HANG_UP_EXIT_MAIN_VIEW,
            NotificationKey.HANG_UP_IN_BG_END,
            NotificationKey.HANG_UP_GAIN_IN_BG_REWARD,
            NotificationKey.HANG_UP_MAX_PASS_LEVEL_ID_CHANGE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            // 主线关卡
            case NotificationKey.HANG_UP_SET_IN_BG:
            case NotificationKey.HANG_UP_IN_BG_UPDATE: {
                this.resetInBgState();
                break;
            }
            case NotificationKey.HANG_UP_IN_BG_END: {
                this.resetInBgEnd();
                break;
            }
            case NotificationKey.HANG_UP_IN_BG_PASS_NEW_LEVEL_ID: {
                this.playPassLevelInBgAnim();
                break;
            }
            case NotificationKey.HANG_UP_MAX_PASS_LEVEL_ID_CHANGE: {
                // 最大关卡变更
                this.resetHangUpBtn();
                this.updateBoxDialog();
                break;
            }

            case NotificationKey.HANG_UP_EXIT_MAIN_VIEW: {
                this.updateLeiNuoSpineAnim(true);
                break;
            }
            case NotificationKey.HANG_UP_GAIN_IN_BG_REWARD: {
                this.updateBoxDialog();
                break;
            }
        }
    }


    protected onInit() {
        FacadeManager.ins().registerNotification(this);

        const redDotCom = RedDotUtils.castComp(this.view.redDot);
        redDotCom.reset(RedDotKeys.hangUp);

        // def
        this.view.getController("isInBg").selectedIndex = 0;
        this.view.labelAddLevelCount.alpha = 0;

        this.view.charList.setVirtual();
        this.view.charList.itemRenderer = this.irChar.bind(this);
        this.view.charList.touchable = false;
        this.view.charList.numItems = this._content.length;


        // 关卡-雷诺,吉祥物
        // this.resetSpineForLeiNuo();

        this.view.onClick(this.onClickOpenHangUpUI, this);


        // 挂机
        this.resetHangUpBtn();

        // 关卡-雷诺,吉祥物
        this.resetSpineForLeiNuo();


        // 多少ms 更新一次动画
        const intervalSec = MainPageUtils.getRandomPlayNextSecond();
        const intervalTimeMs = Math.max(5000, intervalSec * 1000);
        GameTimer.ins().loop(intervalTimeMs, this, this.updateLeiNuoSpineAnimBySchedule);

        this.resetInBgState();
    }


    protected onPreDispose() {
        this.stopShakerHandler()
        GameTimer.ins().clearAll(this);
        FacadeManager.ins().removeNotification(this);


        super.onPreDispose();
    }

    /**
     * 重置主线关卡
     * @private
     */
    private resetHangUpBtn() {
        const isCanOpen = ModuleOpenManager.ins().isCanOpenModuleWithoutTips(ServerEnums.SystemType.TRUNK_INSTANCE)

        this.view.getController("isUnlock").selectedIndex = isCanOpen ? 1 : 0;
        if (isCanOpen) {
            this.view.labelTitle
                .setVar("title", HangUpI18nKeys.HANG_UP_MAIN_PAGE_TITLE)
                .setVar("levelName", HangUpManager.ins().getCurrentLevelName())
                .flushVars();
        } else {
            this.view.labelLock.text = "挂机";
        }

    }

    resetInBgState() {
        const context = HangUpModel.ins().context;

        const inBgCache = context.getInBgCache();

        const state = inBgCache.state;
        this.view.getController("isInBg").selectedIndex = Math.max(0, state - 1);


        this.view.labelLevelId.text = inBgCache.getEndLevelName();

        this.updateBoxDialog();

    }


    resetInBgEnd() {
        const context = HangUpModel.ins().context;

        this.view.getController("isInBg").selectedIndex = 2;

        const inBgCache = context.getInBgCache();

    }


    // anim 
    updateLeiNuoSpineAnimBySchedule() {
        this.updateBoxDialog();

        this.updateLeiNuoSpineAnim(false);
    }

    // 气泡
    updateBoxDialog() {
        if (!ModuleOpenManager.ins().isCanOpenModuleWithoutTips(SystemType.TRUNK_INSTANCE)) {
            this.view.btnDialog.visible = false;
            this.view.btnDialog.touchable = false;
            return;
        }

        const context = HangUpModel.ins().context;
        // 气泡
        if (!context.isShowRewardDialog()) {
            this.view.btnDialog.visible = false;
            this.view.btnDialog.touchable = false;
            return;
        }


        const hangUpTimeMs = context.getTotalHangUpTimeMs();

        // 都用紫色箱子
        let isCanSee = false;
        if (hangUpTimeMs >= 0 && hangUpTimeMs < TimeUnit.HOURS.toMilliseconds(1)) {
            // [0, 1h)
            this.view.btnDialog.bg1.visible = false;
            this.view.btnDialog.bg2.visible = false;
        } else if (hangUpTimeMs >= TimeUnit.HOURS.toMilliseconds(1) && hangUpTimeMs < TimeUnit.HOURS.toMilliseconds(8)) {
            // [1h, 8h)
            isCanSee = true;
            this.view.btnDialog.bg1.visible = true;
            this.view.btnDialog.btnBox.getController("type").selectedIndex = 2;
        } else {
            // [8h, +oo)
            isCanSee = true;
            this.view.btnDialog.bg2.visible = true;
            this.view.btnDialog.btnBox.getController("type").selectedIndex = 2;
        }

        this.view.btnDialog.visible = isCanSee;
        this.view.btnDialog.touchable = isCanSee;
        if (isCanSee) {
            if (!this.shakeTimerId) {
                this.shakeTimerId = GameTimer.ins().loop(3000, this, this.onShakerHandler);
                this.onShakerHandler()
            }
        }
        else {
            if (this.shakeTimerId)
                this.stopShakerHandler()
        }
    }

    private shakeTimerId: string
    private onShakerHandler(): void {
        ShakeUtils.shake(this.view.btnDialog.btnBox.node, 2, 4, 32, 2)
    }

    private stopShakerHandler(): void {
        GameTimer.ins().clear(this, this.onShakerHandler);
        ShakeUtils.stopShake(this.view.btnDialog.btnBox.node)
        this.shakeTimerId = null;
    }

    // anim 
    updateLeiNuoSpineAnim(forcePlayFlag: boolean = false) {
        if (!this._spineNode) {
            return;
        }

        if (!forcePlayFlag) {
            if (CdUtils.isInCd(EnumCDKeys.hangUpFooterLeiNuoAnim, 5000)) {
                return;
            }
        }

        // spine
        const spine = this._spineNode.getComponent(sp.Skeleton);

        const context = HangUpModel.ins().context;
        const state = context.getInBgCache().state;
        // 后台挂机中
        if (state == HangUpState.HANG_UP_ING) {
            const animName = HangUpConfigManager.defaultAnimNameWhenInBg;
            this.updateSpineAnimThenIdle(spine, animName);
            return;
        }
        // 结算
        if (state == HangUpState.HANG_UP_FINISH) {
            const animName = HangUpConfigManager.inBgFinishAnimName;
            this.updateSpineAnimThenIdle(spine, animName);
            return;
        }

        // 挂机奖励可以领取一些了 1h+
        if (context.isCanGainSomeReward()) {
            // 可以领奖
            this.updateSpineAnimThenIdle(spine, "anim5");
            return;
        }

        // 随机动画
        const randomAnimName = MainPageUtils.getSpineHangUpRandomAnimName();
        this.updateSpineAnimThenIdle(spine, randomAnimName);
    }

    // play 'animName' then play 'idle'
    private updateSpineAnimThenIdle(spine: sp.Skeleton, randomAnimName: string) {
        // 更新动画名
        spine.setAnimation(0, randomAnimName, false);
        // 清除之前的事件监听器
        spine.setCompleteListener(null);

        // 添加完成事件监听器
        spine.setCompleteListener((trackEntry) => {
            // 播放完成后，播放 anim1 并设置循环播放
            const defaultAnimName = MainPageUtils.getDefaultAnimName();
            spine.setAnimation(0, defaultAnimName, true);
        });
    }

    // anim init
    private resetSpineForLeiNuo() {
        if (this._spineNode) {
            return;
        }
        const spineRoot = this.view.spineRoot.node;
        ModelUtils.createSpineNodeByAssetPath(
            HangUpConfigManager.leiNuoSpineAssetPath,
            spineRoot
        )
            .then((it: sp.Skeleton) => {
                if (this._spineNode) {
                    this._spineNode.destroy();
                }
                this._spineNode = it.node;
                const defaultAnimName = MainPageUtils.getDefaultAnimName();
                it.setAnimation(0, defaultAnimName, true);
            });
    }

    // 打开挂机关卡
    private onClickOpenHangUpUI() {
        let isCan = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.TRUNK_INSTANCE);
        if (!isCan) {
            Logger.game("挂机系统未解锁")
            return;
        }

        const context = HangUpModel.ins().context;

        // 后台完成
        if (this.view.getController("isInBg").selectedIndex == 2) {
            UIManager.ins().open(HangUpUIKeys.HangUpInBgResultWin);
        }

        // 奖励累计了一定程度
        const isHaveReward = this.view.btnDialog.visible;

        // 有奖励时不需要动画
        UIManager.ins().open(HangUpUIKeys.HangUpMainView, {
            isNeedOpenAnim: !isHaveReward
        });
        if (isHaveReward) {
            if (context.isShowRewardDialog()) {
                GameTimer.ins().once(500, this, () => {
                    // 直接帮忙打开奖励
                    UIManager.ins().open(HangUpUIKeys.HangUpPreviewRewardWin);
                });
            }
        }

    }

    // 后台通关
    playPassLevelInBgAnim() {
        const context = HangUpModel.ins().context;
        const inBgCache = context.getInBgCache();

        this.view.labelAddLevelCount.text = "+1";
        this.view.getTransition("passInBg").play();

        this.view.labelLevelId.text = inBgCache.getEndLevelName();
    }


    irChar(index: number,
        comp: ui.comm.footer.item.HangUpSmallCharItemComp
    ) {
        comp.labelChar.text = this._content[index] || "";

        const jumpHeight = 20; // 跳动的高度
        const jumpDuration = 0.1; // 单次跳动的持续时间
        const delayBetweenChars = 0.1; // 每个字符之间的延迟时间

        GameTimer.ins().loop(3000, this, () => {
            // 使用 tween 为每个字符设置跳动动画
            this._tweenArray[index]?.stop();
            this._tweenArray[index] = tween(comp.labelChar.node)
                .delay(index * delayBetweenChars)
                .by(jumpDuration, {
                    // 上升
                    position: v3(0, jumpHeight, 0)
                }, { easing: 'quadOut' })
                .by(jumpDuration, {
                    // 回到原位
                    position: v3(0, -jumpHeight, 0)
                }, { easing: 'quadIn' })
                .start();
        });
    }

}