import * as fgui from "fairygui-cc";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { HangUpModel } from "db://assets/scripts/game/modules/hangup/model/HangUpModel";
import G from "db://assets/scripts/core/comm/G";
import { Node } from "cc";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { ShakeUtils } from "../../../../core/utils/ShakeUtils";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";

enum EnumChallengeState {
    NO_PASS = 0,
    PASS = 1,
    CHALLENGE = 2
}

/**
 * 单个关卡 预览
 */
@bindFguiExtension("ui://hangUp/HangUpRoadOneStepComp")
export class HangUpRoadOneStepComp extends fgui.GComponent {

    private _config: table.trunkinstance.TrunkInstanceConfig;
    private _index: number = 0;

    private get view(): ui.hangUp.components.HangUpRoadOneStepComp {
        return this as any;
    }

    private onChallengeClick() {
        if (this._index == 0) {
            return;
        }
        let levelId = this._config.id;
        if (!HangUpModel.ins().isHaveBigReward(levelId)) {
            return;
        }
        const oldVisible = this.view.dialogComp.visible;
        // click 
        this.view.dialogComp.visible = !oldVisible;

        setTimeout(() => {
            G.Canvas.once(Node.EventType.TOUCH_START, () => {
                this.view.dialogComp.visible = false
            }, this)
        }, 100)
    }

    reset(index: number,
          config: table.trunkinstance.TrunkInstanceConfig,
          lastOneFlag: boolean,
          lastLevelId: number = -1
    ) {
        this.view.dialogComp.visible = false;
        
        this._index = index;
        this._config = config;
        this.view.clearClick();


        // 挑战中 ？
        const levelId = config.id;

        // 小飞机 = 当前已通关的关卡 | TODO 之前是挑战
        const isCurLevel = HangUpModel.ins().getCurrentLevelId() == levelId;
        this.view.bgTitle.visible = isCurLevel;

        // 进度条是否显示
        this.view.bar.visible = !lastOneFlag;

        const context = HangUpModel.ins().context;


        const isCurrentChallenge = context.isCurrentStayLevel(levelId);
        let isPassLevel = context.isPass(levelId);

        // 关卡名称
        this.view.labelLevelId.text = config.showLevelId + "";

        // 是否有大奖
        let rewardKvArray = config.rewards;

        // 是否有大奖
        const haveBigRewardFlag = ArrayUtils.isNotEmpty(rewardKvArray)
        this.view.challengeComp.getController("haveBigRewardFlag").selectedIndex = (haveBigRewardFlag ? 1 : 0);

        
        if (haveBigRewardFlag) {
            this.view.onClick(this.onChallengeClick, this);
        }
        // 没有大奖的不允许 click
        this.view.touchable = haveBigRewardFlag;

        this.stopShakerHandler()
        // 大奖道具
        let bigRewardItem: NoOwnerItem | null = null
        if (haveBigRewardFlag) {
            bigRewardItem = ItemUtils.parseKvArrayToOnlyOneItem(rewardKvArray)
            // 小图标
            this.view.challengeComp.imageIcon.icon = bigRewardItem?.getItemSmallIconPath();
            
            if (lastLevelId + 1 == this._config.id) {
                this.view.getTransition("t1").play();
            }
            
        }
        if (bigRewardItem) {
            // 有奖励
            let itemConfigByItemId = ItemUtils.getItemConfigByItemId(bigRewardItem.itemId);
            if (itemConfigByItemId) {
                this.view.dialogComp.imageReward.icon = itemConfigByItemId.smallIconPath;
                this.view.dialogComp.labelRewardCount.text = `x${bigRewardItem.count}`;
            }
        }

        if (lastLevelId == this._config.id) {
            this.view.bar.tweenValue(100, 0.5)
        }

        if (isCurrentChallenge) {
            this.view.bar.value = 0;
            this.view.challengeComp.getController("passState").selectedIndex = EnumChallengeState.CHALLENGE;
        } else {

            if (isPassLevel) {
                this.view.bar.value = 100;
                this.view.challengeComp.getController("passState").selectedIndex = EnumChallengeState.PASS;
            } else {
                this.view.bar.value = 0;
                this.view.challengeComp.getController("passState").selectedIndex = EnumChallengeState.NO_PASS;
                GameTimer.ins().loop(2000, this, this.onShakerHandler);
                this.onShakerHandler()
            }
        }
    }

    private onShakerHandler(): void {
        ShakeUtils.shake(this.view.challengeComp.imageIcon.node)
    }

    private stopShakerHandler(): void {
        GameTimer.ins().clear(this, this.onShakerHandler);
        ShakeUtils.stopShake(this.view.challengeComp.imageIcon.node)
    }

    public dispose(): void {
        this.stopShakerHandler()
        super.dispose()
    }
}