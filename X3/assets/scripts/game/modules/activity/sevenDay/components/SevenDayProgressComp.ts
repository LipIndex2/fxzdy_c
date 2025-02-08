import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { ActivityModel, ActivitySyncData } from "db://assets/scripts/game/comm/activity/model/ActivityModel";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import {
    ActivitySevenDayTaskModelVo
} from "db://assets/scripts/game/modules/activity/model/ActivitySevenDayTaskModelVo";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { CdUtils } from "db://assets/scripts/game/comm/utils/CdUtils";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import { EnumRedDotShowType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotShowType";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { EventClickItem } from "db://assets/scripts/game/modules/item/event/EventClickItem";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";


@bindFguiExtension("ui://sevenDay/SevenDayProgressComp")
export class SevenDayProgressComp extends FGUI.GComponent {
    private _config: table.activity.Carnival.CarnivalRewardConfig;
    private _isSameActivity: boolean = true;

    // 是否可以领取
    private _isCanGain: boolean = false;
    // 是否已领取
    private _isHaveGain: boolean = false;
    // 奖励道具
    private _rewardItem: NoOwnerItem;

    get view(): ui.sevenDay.item.SevenDayProgressComp {
        return this as any;
    }


    protected onConstruct() {
        super.onConstruct();

        this.view.btnGain.onClick(this.onClickGain0, this);
    }

    @CdUtils.ExecuteInCDTimeMs(500)
    onClickGain0(event: FGUI.Event) {
        const vo: ActivitySevenDayTaskModelVo = ActivityModel.ins().getActivityVoByType(ServerEnums.ActivityType.CARNIVAL) as ActivitySevenDayTaskModelVo;
        if (!vo) {
            Logger.error(`活动未开启 | ActivityType.CARNIVAL`)
            return;
        }

        const config = this._config;
        if (!config) {
            return;
        }

        if (!this._isSameActivity) {
            Logger.error(`活动id 不一致 | 请检查进度奖励配置 CarnivalRewardConfig `)
            return;
        }

        if (this._isHaveGain) {
            // FloatingTextManager.ins().showTips("已领取奖励");
            // 弹出
            FacadeManager.ins().emit(NotificationKey.CLICK_ITEM, EventClickItem.create(
                event,
                this._rewardItem?.getItemConfig(),
                this.view.item._uiTrans
            ))
            return;
        }
        if (!this._isCanGain) {
            // FloatingTextManager.ins().showTips("未能领取");
            // 弹出
            FacadeManager.ins().emit(NotificationKey.CLICK_ITEM, EventClickItem.create(
                event,
                this._rewardItem?.getItemConfig(),
                this.view.item._uiTrans
            ))
            return;
        }

        // 领取奖励
        ActivityModel.ins().sendDrawItemReward({
            activityId: config.activityId,
            itemId: `SCORE_${config.id}`,
            hidePopWin: 2
        } as ActivitySyncData);

    }


    reset(config: table.activity.Carnival.CarnivalRewardConfig,
          isFirst: boolean,
          isLast: boolean,
    ) {
        if (!config) {
            return;
        }
        this._config = config;
        this.view.getController("isLast").selectedIndex = isLast ? 1 : 0;

        if (isFirst) {
            // this.view.bar.width = 80;
            this.view.bar.width = 100;
        } else {
            this.view.bar.width = 120;
        }

        const vo: ActivitySevenDayTaskModelVo = ActivityModel.ins().getActivityVoByType(ServerEnums.ActivityType.CARNIVAL) as ActivitySevenDayTaskModelVo;
        if (!vo) {
            Logger.error(`活动未开启 | ActivityType.CARNIVAL`)
            return;
        }

        // 活动id
        const isSameActivity = vo.activityId == config.activityId;
        this._isSameActivity = isSameActivity;
        if (!isSameActivity) {
            Logger.error(`开启的活动不一致, 配置错误 CarnivalRewardConfig | 进度奖励 activityId = ${config.activityId} | 七日活动的 activityId = ${vo.activityId}`);
            return;
        }


        // rewards
        const items = ItemUtils.parseKvArrayToItemArray(config.rewards);
        const item = items[0];
        if (item) {
            // 道具
            FguiScriptUtils.toMyScriptClass(this.view.item, ItemFrameBtn)
                .resetByNoOwnerItem(item);
        } else {
            Logger.error(`策划缺少配置奖励. 请检查 CarnivalRewardConfig | configId = ${config?.id}`);
        }
        this._rewardItem = item;

        // score
        const needScore = config.scoreEnd;
        // text bar
        this.view.labelProgress.text = `${needScore}`;
        // bar
        let value = vo.getProgressPercent100ByConfig(config);
        const isReach = value >= 100;
        this.view.bar.value = value;
        this.view.bar.max = 100;

        // 是否领取过
        const isHaveGain = vo.isGainRewardConfig(config.id)
        this._isHaveGain = isHaveGain;
        this.view.getController("isGain").selectedIndex = isHaveGain ? 1 : 0;


        this.view.imgPoint.grayed = !isReach;

        const isCanGain = isReach && !isHaveGain;
        this._isCanGain = isCanGain;


        this.refreshRedDotUI(this.view.redDot1, isCanGain);
        this.refreshRedDotUI(this.view.redDot2, isCanGain);
    }

    private refreshRedDotUI(redDot: ui.comm.com.RedDot, isCanGain: boolean) {
        const redDotCom = RedDotUtils.castComp(redDot);
        if (isCanGain) {
            redDotCom.showByType(EnumRedDotShowType.ITEM_HEIGHT_LIGHT);
        } else {
            redDotCom.showByType(EnumRedDotShowType.NULL);
        }
    }
}