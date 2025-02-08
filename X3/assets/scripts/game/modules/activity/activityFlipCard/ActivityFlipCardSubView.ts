import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { ActivityModel } from "../../../comm/activity/model/ActivityModel";
import NotificationKey from "../../../event/NotificationKey";
import { UIActivityKey } from "../const/UIActivityConfig";
import { ActivityFlipCardModelVo, EnumFlipCardState } from "db://assets/scripts/game/modules/activity/model/ActivityFlipCardModelVo";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { HeaderItem } from "db://assets/scripts/game/modules/common/header/HeaderItem";
import { RuleController } from "db://assets/scripts/game/modules/rule/RuleController";
import { I18nManager } from "db://assets/scripts/core/i18n/I18nManager";
import GIns from "db://assets/scripts/game/GIns";
import { ActivityFlipCardItemBtn } from "db://assets/scripts/game/modules/activity/activityFlipCard/component/ActivityFlipCardItemBtn";
import { ActivityFlipCardConfigManager } from "db://assets/scripts/game/modules/activity/activityFlipCard/config/ActivityFlipCardConfigManager";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { ModelNode } from "../../common/node/ModelNode";
import * as fgui from "fairygui-cc";
import FguiUtils from "../../../../core/utils/FguiUtils";
import { UIGainKeys } from "../../gain/const/UIGainKeys";
import ArrayUtils from "../../../../core/utils/ArrayUtils";
import { GameTimer } from "../../../../core/timer/GameTimer";

/**
 * 翻牌
 */
@bindScript(UIActivityKey.ActivityFlipCardSubView)
export class ActivityFlipCardSubView extends UIView {
    static pkgName: string = "activityFlipCard";
    static viewName: string = "ActivityFlipCardSubView";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    private _vo: ActivityFlipCardModelVo;
    private _activityId: number = 0;
    private _showConfig: table.activity.ActivityConstant.ActivityClientConfig;
    private _flipCardConfig: table.activity.Lottery.LotteryConfig;
    private _listToGridCountMap: Map<FGUI.GList, number> = new Map();
    private _isFirst: boolean = true;
    /****是否跳过动画 */
    public isSkipEffect: boolean = false;

    private get view(): ui.activityFlipCard.ActivityFlipCardSubView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_CHANGE_ITEMS,
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_REQUEST_BACK,
            NotificationKey.CLOSE_ViEW,
            NotificationKey.CHARGE_COMPLETE,
            NotificationKey.FLIP_CARD_NEXT_ROUND,
            NotificationKey.FLIP_CARD_REWARD_LIST_UPDATE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.EVENT_CHANGE_ITEMS: {
                this.resetOneKey();
                return;
            }
            case NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK:
            case NotificationKey.ACTIVITY_UPDATE:
                if (args === this._vo?.activityId) {
                    this._vo = ActivityModel.ins().getActivityVoById(args);
                    this.reset();
                }
                break;

            case NotificationKey.CHARGE_COMPLETE:
                GIns.activityModel.sendActivity(this._vo.activityId);
                break;
            case NotificationKey.FLIP_CARD_NEXT_ROUND:
            case NotificationKey.ACTIVITY_REQUEST_BACK:
                this.reset();
                break;
            case NotificationKey.CLOSE_ViEW:
                if (args == UIGainKeys.GainItemPopUpView) this.reset(true);
                break;
            case NotificationKey.FLIP_CARD_REWARD_LIST_UPDATE:
                this.reset();
                break;
        }
    }

    protected onInit() {
        // 子界面
        this.view.getController("isSubView").selectedIndex = this._layer == EnumUIViewLayer.SUBVIEW ? 1 : 0;
        this.view.btnBack.onClick(() => {
            this.closeSelf();
        }, this);

        this._listToGridCountMap = new Map<FGUI.GList, number>();
        this._listToGridCountMap.set(this.view.itemList6, 6);
        this._listToGridCountMap.set(this.view.itemList5, 5);
        this._listToGridCountMap.set(this.view.itemList4, 4);
        this._listToGridCountMap.set(this.view.itemList3, 3);
        this._listToGridCountMap.set(this.view.itemList2, 2);

        for (let [gList, count] of this._listToGridCountMap) {
            gList.setVirtual();
            gList.itemRenderer = this.irItem.bind(this);
        }

        this.view.btnRule.onClick(this.openRule, this);
        this.view.btnOneKeyFlip.onClick(this.onClickOneKey, this);
        this.view.btnChooseBigReward.onClick(this.openChooseBigRewardUI, this);

        this.view.skipItem.onClick(this.onClickSkip, this);

        G.GameTimer.loop(500, this, this.updateTime);
    }

    onClickOneKey() {
        const isCanUse = this._vo.isCanUseOneKey();
        if (!isCanUse) {
            Logger.game("不给用");
            return;
        }

        this.setBanClick(true);
        this.sendOneKeyFlipCard(() => {
            this.setBanClick(false);
        });
    }

    private sendOneKeyFlipCard(doneCb: Function) {
        const flipCardCostItem = this._vo.getFlipCardCostItem();
        let maxCanPayCount = GIns.backpackMgr.getMaxCanPayCount(flipCardCostItem);
        if (maxCanPayCount <= 0) {
            doneCb();
            Logger.game("无法支付发牌");
            return;
        }

        let tempCount = maxCanPayCount;
        const toSendArray = [];

        const flipCardCount = this._vo.getFlipCardCount();
        for (let i = 0; i < flipCardCount; i++) {
            const gridState = this._vo.gridIndexToStateMap.getOrDefault(i, EnumFlipCardState.NO);
            if (gridState < EnumFlipCardState.FLIP_NO_GAIN) {
                if (tempCount > 0) {
                    tempCount -= 1;
                    toSendArray.push(i);
                } else {
                    break;
                }
            }
        }

        if (ArrayUtils.isEmpty(toSendArray)) {
            Logger.game("没有任何一个格子能翻");
            doneCb();
            return;
        }

        const oldRoundId = this._vo.getCurrentRoundId();

        for (let gridIndex of toSendArray) {
            GameTimer.ins().once(400 * gridIndex + 200, this, () => {
                if (this._vo.isHaveFlipBigReward()) {
                    Logger.game("已经翻到了大奖");
                    return;
                }

                if (this._vo.isFlipCard(gridIndex)) {
                    Logger.game(`格子已经翻了. index = ${gridIndex}`);
                    return;
                }

                if (this._vo.getCurrentRoundId() != oldRoundId) {
                    Logger.game("下一轮了");
                    return;
                }
                this._vo.sendFlipCard(gridIndex);
            });
        }

        GameTimer.ins().once(200 * toSendArray.length + 200, this, () => {
            doneCb();
        });
    }

    openChooseBigRewardUI() {
        UIManager.ins().open(UIActivityKey.ActivityFlipCardChooseBigRewardWin, this._vo);
    }

    // onClickJump() {
    //     const jumpId = this._blackShopConfig.jumpId;
    //     JumpManager.ins().jumpById(jumpId);
    // }

    openRule() {
        RuleController.ins().openRule(this._showConfig.ruleId, this.view.btnRule);
    }

    protected irItem(index: number, comp: ActivityFlipCardItemBtn): void {
        comp.reset(this, index, this._vo, this._flipCardConfig);
    }

    protected updateTime(): void {
        const leftTimeMs = this._vo?.getLeftTime();
        this.view.T_restTime.text = TimeUtils.formatTimeMsToDayHourMinuteSecondText(leftTimeMs);

        // const restTimeText2 = TimeUtils.formatTimeMsToDayHourMinuteCN(leftTimeMs);
        // this.view.T_cdTimeStr.text = `活动倒计时: ${restTimeText2}`;
    }

    protected onOpen(clientConfig: table.activity.ActivityConstant.ActivityClientConfig, isReopen?: boolean): void {
        if (this._layer != EnumUIViewLayer.SUBVIEW) {
            const activityIdByType = ActivityModel.ins().getActivityIdByType(ServerEnums.ActivityType.LOTTERY);
            clientConfig = TableManager.getAllData(table.activity.ActivityConstant.ActivityClientConfig).filter((it) => it.typeParam == activityIdByType)[0];
        }
        let activityId = clientConfig?.typeParam || 0;
        this._vo = ActivityModel.ins().getActivityVoById(activityId);
        if (this._vo == null) {
            return;
        }
        this._activityId = activityId;
        this._showConfig = clientConfig;

        const name = I18nManager.ins().translateOrBlank(clientConfig.name);
        this.view.T_title1.text = name[0];
        this.view.T_title2.text = name.substring(1);

        // header
        if (this._showConfig.headerItemId > 0) {
            this.view.headerItem.visible = true;
            FguiScriptUtils.toMyScriptClass(this.view.headerItem, HeaderItem).reset(this._showConfig.headerItemId, true);
        } else {
            this.view.headerItem.visible = false;
        }

        this.view.skipItem.getController("c1").selectedIndex = this.isSkipEffect ? 1 : 0;
        G.GameTimer.once(2, this, () => {
            this.reset();
        });
    }

    public isEffecting: boolean = false;
    public reset(forceReset: boolean = false): void {
        if (!forceReset && this.isEffecting) return;

        this.isEffecting = false;
        this.setBanClick(false);
        this.view.T_turnText.text = `第${this._vo.getCurrentRoundId()}轮`;

        if (this._isFirst) {
            this._vo.sendChooseBigRewardIfNull(0);

            this._isFirst = false;
        }

        // big
        this.view.bigReward.visible = this._vo.isChooseBigReward();
        const myChooseBigReward = this._vo.getMyChooseBigReward();
        if (myChooseBigReward) {
            FguiScriptUtils.toMyScriptClass(this.view.bigReward, ItemFrameBtn).resetByNoOwnerItem(myChooseBigReward);
            //@ts-ignore
            this.view.bigReward.isShowLockDesc(false);
            //@ts-ignore
            this.view.bigReward.isShowCount(false);
        }

        const roundId = this._vo.getCurrentRoundId();
        this.view.getController("girdType").selectedIndex = this._vo.getOneLineGridCount();
        this._flipCardConfig = ActivityFlipCardConfigManager.getConfigByActivityIdAndRoundId(this._vo.activityId, roundId);

        let index = this._vo.getOneLineGridCount();
        // 格子
        for (let [gList, count] of this._listToGridCountMap) {
            if (index == count) {
                gList.numItems = count * count;
            } else {
                gList.numItems = 0;
            }
            gList.refreshVirtualList();
        }

        //大奖描述和形象
        let cfg = TableManager.getDataById(table.activity.Lottery.LotteryNormalConfig, this._vo.activityId);
        this.view.T_awardDesc.text = cfg?.awardDesc || "";

        if (cfg?.modelId) {
            this.view.modelNode.visible = true;
            this.view.img_model.visible = false;
            let modelNode = this.view.modelNode as any;
            modelNode.loadByModelId(cfg?.modelId);
            modelNode.setScale(3, 3);
        } else {
            this.view.modelNode.visible = false;
            this.view.img_model.visible = true;
            this.view.img_model.icon = cfg.iconPath;
        }

        this.resetOneKey();
        this.updateTime();
    }

    resetOneKey() {
        this.view.btnOneKeyFlip.visible = this._vo.isCanSeeOneKey();

        this.view.btnOneKeyFlip.grayed = !this._vo.isCanUseOneKey();
    }

    protected onClose(): void {
        G.GameTimer.clearAll(this);
    }

    setBanClick(isShow: boolean) {
        this.view.banClick.visible = isShow;
    }

    /***播放特效 */
    public showEffect(item: ActivityFlipCardItemBtn, modelId: number, timeScale: number = 1): void {
        if (!item.parent) return;

        let modelNode = fgui.UIPackage.createObject("comm", "ModelNode") as ModelNode;
        modelNode.timeScale = timeScale;
        modelNode.loadByModelId(modelId, false);
        this.view.addChild(modelNode);
        let p = FguiUtils.changeCoorTo(item, this.view);
        modelNode.setPosition(p.x + item.width * 0.5, p.y + item.height * 0.5);
    }

    private onClickSkip() {
        this.isSkipEffect = !this.isSkipEffect;

        this.view.skipItem.getController("c1").selectedIndex = this.isSkipEffect ? 1 : 0;
    }
}
