import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { ActivityHeroSupplyModelVo } from "db://assets/scripts/game/modules/activity/model/ActivityHeroSupplyModelVo";
import { ActivityModel } from "db://assets/scripts/game/comm/activity/model/ActivityModel";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import { TimeUtils } from "db://assets/scripts/game/comm/utils/TimeUtils";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { RuleController } from "db://assets/scripts/game/modules/rule/RuleController";
import { EnumRuleKeys } from "db://assets/scripts/game/modules/rule/enums/EnumRuleKeys";
import { UIPage } from "db://assets/scripts/core/mvc/view/UIPage";
import { UIActivityKey } from "db://assets/scripts/game/modules/activity/const/UIActivityConfig";
import {
    HeroSupplyConfigManager
} from "db://assets/scripts/game/modules/activity/heroSupply/config/HeroSupplyConfigManager";
import { HeroSupplyItemComp } from "db://assets/scripts/game/modules/activity/heroSupply/components/HeroSupplyItemComp";
import { ChargeConfigManager } from "db://assets/scripts/game/modules/charge/config/ChargeConfigManager";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { EnumUIViewLayer } from "db://assets/scripts/core/comm/LayerManager";
import { ViewAdaptType } from "db://assets/scripts/core/mvc/view/UIView";
import G from "db://assets/scripts/core/comm/G";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import GIns from "../../../GIns";


@bindScript(UIActivityKey.HeroSupplySubView)
export class HeroSupplySubView extends UIPage {

    static pkgName: string = "heroSupply";
    static viewName: string = "HeroSupplySubView";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;


    private _vo: ActivityHeroSupplyModelVo;
    private _configs: table.activity.HeroSupply.HeroSupplyRewardConfig[] = [];

    get view(): ui.heroSupply.HeroSupplySubView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.CLOSE_ViEW,
            NotificationKey.SYSTEM_NEW_DAY,
            NotificationKey.HERO_SUPPLY_UPDATE,
            NotificationKey.EVENT_RECEIVE_SERVER_ITEM_CHANGE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.CLOSE_ViEW:
            case NotificationKey.SYSTEM_NEW_DAY:
            case NotificationKey.HERO_SUPPLY_UPDATE:
            case NotificationKey.EVENT_RECEIVE_SERVER_ITEM_CHANGE: {
                this.reset();
                break;
            }
        }
    }


    protected onInit() {

        const vo: ActivityHeroSupplyModelVo = ActivityModel.ins().getActivityVoByType(ServerEnums.ActivityType.HERO_SUPPLY) as ActivityHeroSupplyModelVo;
        if (!vo) {
            return;
        }
        this._vo = vo;

        const activityId = vo.activityId;
        const chargeId = HeroSupplyConfigManager.getChargeIdByActivityId(activityId);
        const rmb = ChargeConfigManager.getRMBByChargeId(chargeId)

        this.view.btnBuy.title = `${rmb}元`;
        this.view.btnBuy.onClick(this.onClickBuy, this);

        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = this.irItem.bind(this);

        this.view.btnGain.onClick(() => {
            vo.sendOneKeyGain();
        }, this);
        this.view.btnInfo.onClick(() => {
            RuleController.ins().openRule(EnumRuleKeys.HERO_SUPPLY, this.view.btnInfo);
        }, this);

        this.onUpdateTime();
        GameTimer.ins().loop(1000, this, this.onUpdateTime);
    }

    protected onOpen(args: any, isReopen?: boolean) {
        GameTimer.ins().frameOnce(5, this, () => {
            this.reset();
        });
        let clinetCfg:table.activity.ActivityConstant.ActivityClientConfig = args;
        GIns.redDotMgr.markRedDotForeverRead(RedDotKeys.Activity_entrance_item_new, [clinetCfg.parentId, clinetCfg.typeParam]);
    }

    onClickBuy() {
        UIManager.ins().open(UIActivityKey.HeroSupplyBuyTipsWin);
    }
 
    onUpdateTime() {
        const vo: ActivityHeroSupplyModelVo = ActivityModel.ins().getActivityVoByType(ServerEnums.ActivityType.HERO_SUPPLY) as ActivityHeroSupplyModelVo;
        if (!vo) {
            return;
        }

        const endTimeMs = vo.getEndTimeMs();
        if (endTimeMs > 0) {
            // 相差时间
            const diffTimeMs = Math.max(0, endTimeMs - TimeManager.serverNow);

            const timeText = TimeUtils.formatTimeMsToDayHourMinuteSecondText(diffTimeMs);
            this.view.labelRestTime.text = `${timeText}`;
        } else {
            this.view.labelRestTime.text = `永久开启`;
        }

        if (vo.isGainAllRewards()) {
            this.view.labelNextGainTime.text = "已全部领取";
        } else {
            if (vo.isCanGainAll()) {
                this.view.labelNextGainTime.text = "";
            } else {


                let timeText = TimeUtils.formatTimeMsToDayHourMinuteSecond1(G.TimeManager.remainingRefreshTime);
                this.view.labelNextGainTime.text = `${timeText}后可领取`;
            }
        }

    }

    protected onClose() {
        GameTimer.ins().clearAll(this);

        super.onPreDispose();
    }

    private reset() {
        const vo: ActivityHeroSupplyModelVo = ActivityModel.ins().getActivityVoByType(ServerEnums.ActivityType.HERO_SUPPLY) as ActivityHeroSupplyModelVo;
        if (!vo) {
            return;
        }
        const activityId = vo.activityId;

        const isBuy = vo.isBuy();
        const isGainAll = vo.isGainAllWhichICan();
        this.view.getController("isBuy").selectedIndex = isBuy ? 1 : 0;
        this.view.getController("isGainAll").selectedIndex = isGainAll ? 1 : 0;

        // progress
        this._configs = HeroSupplyConfigManager.getRewardConfigArrayByActivityId(activityId);
        this.view.itemList.numItems = this._configs.length;
    }

    irItem(index: number, comp: HeroSupplyItemComp) {

        comp.reset(this._configs[index]);

    }
}