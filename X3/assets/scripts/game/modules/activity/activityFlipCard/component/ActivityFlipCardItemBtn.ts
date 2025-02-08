import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { ActivityFlipCardModelVo } from "db://assets/scripts/game/modules/activity/model/ActivityFlipCardModelVo";
import { FguiNotificationGComponent } from "db://assets/scripts/core/mvc/view/FguiNotificationGComponent";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { UIGainKeys } from "db://assets/scripts/game/modules/gain/const/UIGainKeys";
import { GainItemEffectViewOpenArgs } from "db://assets/scripts/game/modules/gain/view/GainItemEffectView";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { ActivityFlipCardSubView } from "db://assets/scripts/game/modules/activity/activityFlipCard/ActivityFlipCardSubView";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { GameTimer } from "../../../../../core/timer/GameTimer";
import GIns from "../../../../GIns";

@bindFguiExtension("ui://activityFlipCard/ActivityFlipCardItemBtn")
export class ActivityFlipCardItemBtn extends FguiNotificationGComponent {
    private _vo: ActivityFlipCardModelVo;
    private _config: table.activity.Lottery.LotteryConfig;
    private _gridIndex: number;
    private _isFlipCard: boolean = false;
    private _isGain: boolean = false;
    private _isBigRewardGrid: boolean = false;
    private _parentUI: ActivityFlipCardSubView;

    /***是否特效播放中，拦截update */
    private effecting: boolean = false;

    get view(): ui.activityFlipCard.btn.ActivityFlipCardItemBtn {
        return this as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.FLIP_CARD_NEW, NotificationKey.FLIP_CARD_GAIN];
    }

    notificationHandler(name: string, args?: any) {
        switch (name) {
            case NotificationKey.FLIP_CARD_NEW: {
                if (args == this._gridIndex) {
                    this.onFlipCard();
                }
                break;
            }
            case NotificationKey.FLIP_CARD_GAIN: {
                if (args == this._gridIndex) {
                    this.onGain();
                }
                break;
            }
        }
    }

    protected onInit() {
        super.onInit();

        this.view.onClick(this.onClickFlipCard, this);
    }

    protected onPreDispose() {
        GameTimer.ins().clearAll(this);
        FacadeManager.ins().removeNotification(this);
        super.onPreDispose();
    }

    onClickFlipCard() {
        if (!this._vo.isChooseBigReward()) {
            FloatingTextManager.ins().showTips("当前未选择大奖, 无法进行抽奖");
            return;
        }

        // 未翻牌
        if (!this._isFlipCard) {
            // // 已抽到大奖
            const costItems = this._vo.getFlipCardCostItem();
            const isC = BackpackManager.ins().isCanPayItem(costItems, true);
            if (!isC) {
                FloatingTextManager.ins().showTips("道具不足");
                return;
            }

            // 发送翻牌
            this._vo.sendFlipCard(this._gridIndex);
            return;
        }

        if (!this._isGain) {
            this._parentUI.setBanClick(false);
            this._vo.sendGainCard(this._gridIndex);
        }
    }

    reset(parentUI: ActivityFlipCardSubView, index: number, vo: ActivityFlipCardModelVo, config: table.activity.Lottery.LotteryConfig) {
        this._parentUI = parentUI;
        this._gridIndex = index;
        this._vo = vo;
        this._config = config;

        // RedDotUtils.castComp(this.view.redDot)
        //     .reset(RedDotKeys.ActivityFlipCard_grid, [index]);

        this.updateUI();
    }

    private updateUI() {
        if (this.effecting) return;

        const gridIndex = this._gridIndex;

        this._isFlipCard = this._vo.isFlipCard(gridIndex);
        this._isGain = this._vo.isGain(gridIndex);
        this._isBigRewardGrid = this._vo.isBigRewardGrid(gridIndex);

        // 获得奖励
        const item = this._vo.getGainReward(this._gridIndex);
        if (item) {
            this.view.imageItem.icon = item.getIconPath();
            this.view.imageBigReward.icon = item.getIconPath();
            this.view.T_count.text = `${item.count}`;
        }

        this.view.getController("isOpen").selectedIndex = this._isFlipCard ? 1 : 0;
        if (this._isGain) {
            this.view.getController("isNotGain").selectedIndex = 0;
        } else {
            if (this._isBigRewardGrid) {
                // big
                this.view.getController("isNotGain").selectedIndex = 2;
            } else {
                // normal
                this.view.getController("isNotGain").selectedIndex = 1;
            }
        }
    }

    onFlipCard() {
        if (this.effecting) return;

        this._isFlipCard = true;
        this.effecting = true;

        if (!this._parentUI.isSkipEffect) {
            this._parentUI.showEffect(this, 10010199);
            GameTimer.ins().once(560, this, this.onFlipCardEnd);
        } else {
            this.onFlipCardEnd();
        }
    }

    private onFlipCardEnd(): void {
        const isBigRewardGridIndex = this._vo.isBigRewardGrid(this._gridIndex);
        if (isBigRewardGridIndex) {
            this._parentUI.showEffect(this, 10010200, 0.6);
            GIns.floatingTextMgr.showTips("恭喜抽出本层大奖!");
            this._vo.addBigRewardChooseCount(this._vo.getMyChooseBigRewardIndex());
        }
        this.effecting = false;
        this.updateUI();
    }

    onGain() {
        this._isGain = true;

        //是否已领取大奖
        const isBigRewardGridIndex = this._vo.isEnterNextRound;
        if (isBigRewardGridIndex) {
            this._parentUI.isEffecting = true;
            this._parentUI.showEffect(this, 10010201, 0.4);
            // 大奖动画交互完成后, 进入下一轮

            GameTimer.ins().once(600, this, () => {
                this.view.getController("isNotGain").selectedIndex = 0;
            });
            // 大奖动画交互完成后, 进入下一轮
            this._vo.goToNextRound();

            return;
        }

        if (!this._vo.isGain(this._gridIndex)) {
            return;
        }

        this.updateUI();

        FacadeManager.ins().emit(NotificationKey.FLIP_CARD_REWARD_LIST_UPDATE);
        // 获得 anim
        // const item = this._vo.getGainReward(this._gridIndex);
        // UIManager.ins().open(UIGainKeys.GainItemEffectView, GainItemEffectViewOpenArgs.create([item]));
    }
}
