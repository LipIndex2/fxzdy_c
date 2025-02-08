import { DrawCardModel } from "../../../../game/modules/drawcard/model/DrawCardModel";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { DrawCardUtils } from "../../../../game/modules/drawcard/utils/DrawCardUtils";
import { ItemUtils } from "../../../../game/modules/item/utils/ItemUtils";
import G from "../../../../core/comm/G";
import { NoOwnerItem } from "../../../../game/modules/backpack/vo/NoOwnerItem";
import { DrawCardConfigManager } from "db://assets/scripts/game/modules/drawcard/config/DrawCardConfigManager";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { CdUtils } from "db://assets/scripts/game/comm/utils/CdUtils";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { EnumCDKeys } from "db://assets/scripts/core/const/EnumCDKeys";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { ModelNode } from "db://assets/scripts/game/modules/common/node/ModelNode";
import { ColorUtils } from "db://assets/scripts/core/utils/ColorUtils";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import { EnumRedDotShowType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotShowType";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import RecruitType = ServerEnums.RecruitType;
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";

/**
 * 抽卡
 * 武器卡池
 */
@bindFguiExtension("ui://drawCard/DrawCardEquipPage")
export class DrawCardEquipPage extends FGUI.GComponent implements INotification {

    // 配置
    private _config: table.recruit.RecruitConfig;
    // 抽一发需要消耗的道具
    private _costItemPerDraw: NoOwnerItem;
    // 替代消耗道具
    private _costItemPerDraw2: NoOwnerItem;
    // 卡池类型
    private _tabType = ServerEnums.RecruitType.NORMAL

    // model
    private _modelNodeLeft: ModelNode;
    private _modelNodeRight: ModelNode;


    private get view(): ui.drawCard.tabPage.DrawCardEquipPage {
        return this as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.DRAW_CARD_GAIN_ITEMS,
            NotificationKey.DRAW_CARD_WEAPON_BOX_SCORE_CHANGE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.DRAW_CARD_GAIN_ITEMS: {
                this.reset();
                break;
            }
            case NotificationKey.DRAW_CARD_WEAPON_BOX_SCORE_CHANGE: {
                this.reset();
                break;
            }

        }
    }


    protected onConstruct() {
        super.onConstruct();

        this.reset();

        this.view.boxLeft.getController("isShowDialog").selectedIndex = 0;

        this.view.rightTab1.onClick(this.onClickRightTab1, this);
        this.view.boxLeft.btnBox.onClick(this.onClickBox, this);

        FacadeManager.ins().registerNotification(this);

        this._modelNodeLeft = FguiScriptUtils.toMyScriptClass(this.view.armL, ModelNode);
        this._modelNodeLeft.loadByPath(DrawCardConfigManager.spineForWeaponArmLeft);
        this._modelNodeRight = FguiScriptUtils.toMyScriptClass(this.view.armR, ModelNode);
        this._modelNodeRight.loadByPath(DrawCardConfigManager.spineForWeaponArmRight);

    }


    protected onPreDispose() {


        GameTimer.ins().clearAll(this);
        FacadeManager.ins().removeNotification(this);
        FGUI.GRoot.inst.offClick(this.closeBoxDialog, this);

        super.onPreDispose();
    }

    onClickRightTab1() {
        FacadeManager.ins().emit(NotificationKey.EVENT_JUMP_TO_OTHER_FEATURE, DrawCardConfigManager.jumpIdForWeaponRightTab1)
    }

    onClickBox() {
        // 领取宝箱
        const context = DrawCardModel.ins().context;

        // 宝箱
        if (!context.isCanGainOnceWeaponBoxReward()) {

            const ctrl = this.view.boxLeft.getController("isShowDialog");
            const oldI = ctrl.selectedIndex;
            const newIndex = (oldI + 1) % 2;
            ctrl.selectedIndex = newIndex;
            // open
            if (newIndex == 1) {
                GameTimer.ins().once(200, this, () => {
                    FGUI.GRoot.inst.offClick(this.closeBoxDialog, this);
                    FGUI.GRoot.inst.onceClick(this.closeBoxDialog, this);
                })
            }

            console.error("进度未满, 却点击领取奖励");
            return;
        }

//cd
        if (CdUtils.isInCd(EnumCDKeys.gainDrawCardWeaponBox, 1000)) {
            console.warn("领取奖励 CD 中");
            return;
        }
        // net
        DrawCardModel.ins().sendDrawAwakeWeaponRecruitScoreReward();
    }

    closeBoxDialog() {
        this.view.boxLeft.getController("isShowDialog").selectedIndex = 0;
    }

    public reset() {
        const context = DrawCardModel.ins().context;

        // config 
        const poolId = DrawCardUtils.NORMAL_DRAW_CARD_POOL_ID;
        const config: table.recruit.RecruitConfig = DrawCardConfigManager.getDrawCardConfigById(poolId);
        if (!config) {
            G.Logger.error(`抽卡配置不存在. id = ${poolId}`)
            return;
        }
        this._config = config;

        // 消耗
        this._costItemPerDraw = ItemUtils.parseKvArrayToOnlyOneItem(config.costItems);
        this._costItemPerDraw2 = ItemUtils.parseKvArrayToOnlyOneItem(config.costItems2);

        if (!this._costItemPerDraw) {
            G.Logger.error(`抽卡竟然没有消耗?! poolId=${poolId}`)
        }
        const costItemPerDraw2 = this._costItemPerDraw2;
        if (costItemPerDraw2) {
            G.Logger.debug(costItemPerDraw2, "替代抽卡的道具 = ")
        } else {
            G.Logger.debug("没有替代消耗的道具")

        }

        // 抽卡次数 normal
        const drawCount1 = DrawCardModel.ins().getDrawCardCount(ServerEnums.RecruitType.AWAKE_WEAPON_NORMAL);

        // 抽卡次数 special
        const drawCount2 = DrawCardModel.ins().getDrawCardCount(ServerEnums.RecruitType.AWAKE_WEAPON_SPECIAL);


        // box score
        const weaponBoxScore = context.getWeaponBoxScore();
        const maxScore = DrawCardConfigManager.weaponScoreBoxConfig.score;

        const leftScore = StringUtils.padStart(weaponBoxScore, 3, " ");
        const rightScore = StringUtils.padStart(maxScore, 3, " ");
        this.view.boxLeft.btnBox.labelProgressCount.text = `${leftScore}/${rightScore}`;
        const fillValue = weaponBoxScore / maxScore;
        this.view.boxLeft.btnBox.fgBar.fillAmount = fillValue;
        if (fillValue >= 1) {
            this.view.boxLeft.btnBox.labelProgressCount.color = ColorUtils.createColor("#5FFE5C");
        } else {
            this.view.boxLeft.btnBox.labelProgressCount.color = ColorUtils.createColor("#FFFFFF");

        }

        const reward = ItemUtils.parseKvArrayToOnlyOneItem(DrawCardConfigManager.weaponScoreBoxConfig.rewards);
        this.view.boxLeft.imageItem.icon = reward.getItemSmallIconPath();
        this.view.boxLeft.labelItemCount.text = `x${reward.count}`;


        this.refreshRedDot();
    }

    refreshRedDot() {
        const context = DrawCardModel.ins().context;
        const isCanBox = context.isCanGainOnceWeaponBoxReward();
        const redDotCom = RedDotUtils.castComp(this.view.boxLeft.redDot);
        if (isCanBox) {
            redDotCom.showByType(EnumRedDotShowType.REWARD);
        } else {
            redDotCom.showByType(EnumRedDotShowType.NULL);
        }
    }


    playerAnim(type: ServerEnums.RecruitType, cb: () => void) {
        // TODO 跳动画
        const skipAnimFlag = DrawCardModel.ins().skipAnimFlag;
        if (skipAnimFlag) {
            console.info("跳过动画直接抽");
            cb && cb();
            return;
        }
        console.info("播放动画抽");

        if (type == RecruitType.AWAKE_WEAPON_NORMAL) {
            // l
            this._modelNodeLeft.playOrders([
                {
                    name: "idle",
                    callbackForComplete: () => {
                        this._modelNodeLeft.gotoAndStop(0);
                        cb && cb();
                    }
                }
            ])
        } else if (type == RecruitType.AWAKE_WEAPON_SPECIAL) {
            // r
            this._modelNodeRight.playOrders([
                {
                    name: "idle",
                    callbackForComplete: () => {
                        this._modelNodeRight.gotoAndStop(0);
                        cb && cb();
                    }
                }
            ])
        }
    }

}