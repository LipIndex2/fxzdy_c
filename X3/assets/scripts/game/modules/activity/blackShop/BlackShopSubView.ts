import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { ActivityModel } from "../../../comm/activity/model/ActivityModel";
import NotificationKey from "../../../event/NotificationKey";
import { UIActivityKey } from "../const/UIActivityConfig";
import { ActivityMallModelVo } from "db://assets/scripts/game/modules/activity/model/ActivityMallModelVo";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { HeaderItem } from "db://assets/scripts/game/modules/common/header/HeaderItem";
import { BlackShopRowComp } from "db://assets/scripts/game/modules/activity/blackShop/component/BlackShopRowComp";
import { ActivityMallConfigManager } from "db://assets/scripts/game/modules/mall/config/ActivityMallConfigManager";
import { RuleController } from "db://assets/scripts/game/modules/rule/RuleController";
import { EnumRuleKeys } from "db://assets/scripts/game/modules/rule/enums/EnumRuleKeys";
import { I18nManager } from "db://assets/scripts/core/i18n/I18nManager";
import {
    BlackShopConfigManager
} from "db://assets/scripts/game/modules/activity/blackShop/config/BlackShopConfigManager";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { JumpManager } from "db://assets/scripts/game/modules/jump/JumpManager";
import GIns from "db://assets/scripts/game/GIns";
import { NodeUtils } from "db://assets/scripts/core/utils/NodeUtils";

/** 开服累充 */
@bindScript(UIActivityKey.BlackShopSubView)
export class BlackShopSubView extends UIView {

    static pkgName: string = "blackShop";
    static viewName: string = "BlackShopSubView";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    private _vo: ActivityMallModelVo;
    protected _configs: table.activity.Mall.ActivityMallGoodsConfig[] = []
    private _activityId: number = 0;
    private _config: table.activity.ActivityConstant.ActivityClientConfig;
    private _blackShopConfig: table.activity.BlackShop.BlackShopConfig;

    private get view(): ui.blackShop.BlackShopSubView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_REQUEST_BACK,
            NotificationKey.CLOSE_ViEW,
            NotificationKey.CHARGE_COMPLETE,
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
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
            case NotificationKey.CLOSE_ViEW:
            case NotificationKey.ACTIVITY_REQUEST_BACK:
                this.reset();
                break;
        }
    }

    protected onInit() {

        G.GameTimer.loop(500, this, this.updateTime)

        this.view.rowList.setVirtual();
        this.view.rowList.itemRenderer = this.irItem.bind(this);

        this.view.btnRule.onClick(this.openRule, this);

        this.view.btn_jumpBlack.onClick(this.onClickJump, this);
    }

    onClickJump() {
        const jumpId = this._blackShopConfig.jumpId;
        JumpManager.ins().jumpById(jumpId);
    }

    openRule() {
        RuleController.ins().openRule(this._config.ruleId, this.view.btnRule);
    }

    protected irItem(index: number, comp: BlackShopRowComp): void {
        const config = this._configs[index];
        comp.reset(this._vo, config);
    }

    protected updateTime(): void {
        const leftTimeMs = this._vo?.getLeftTime();
        this.view.T_restTime.text = TimeUtils.formatTimeMsToDayHourMinuteSecondText(leftTimeMs);
    }


    protected onOpen(config: table.activity.ActivityConstant.ActivityClientConfig, isReopen?: boolean): void {
        let activityId = config?.typeParam || 0;
        this._vo = ActivityModel.ins().getActivityVoById(activityId)
        if (this._vo == null) {
            return
        }
        this._activityId = activityId;
        this._config = config;
        this._blackShopConfig = BlackShopConfigManager.getConfigByActivityId(activityId);
        if (!this._blackShopConfig) {
            Logger.error(`没找到配置. BlackShopConfig | activityId = ${activityId} `);
            return;
        }
        this.view.img_bg.icon = this._blackShopConfig.bgPath;
        this.view.btn_jumpBlack.icon = this._blackShopConfig.jumpBtnImagePath;


        if (this._blackShopConfig.itemId > 0) {
            this.view.headerItem.visible = true;
            FguiScriptUtils.toMyScriptClass(this.view.headerItem, HeaderItem)
                .reset(this._blackShopConfig.itemId, true);

        } else {
            this.view.headerItem.visible = false;
            //
            // FguiScriptUtils.toMyScriptClass(this.view.headerItem, HeaderItem)
            //     .reset(EnumCurrencyItemId.DIAMOND, true);

        }

        this.reset();
    }


    public reset(): void {
        if (NodeUtils.isNotValidNode(this.view.node)) {
            return;
        }
        const config = this._config;
        const name = I18nManager.ins().translateOrBlank(config.name);
        this.view.T_title1.text = name[0];
        this.view.T_title2.text = name.substring(1);

        this._configs = ActivityMallConfigManager.getGoodConfigArrayByActivityId(this._activityId);
        // 排序
        this._configs.sort((v1, v2) => {
            if (this._vo.isBuyMax(v1.id)) {
                return 1;
            }
            if (this._vo.isBuyMax(v2.id)) {
                return -1;
            }
            return v1.sort - v2.sort || v1.id - v2.id;
        })

        this.view.rowList.numItems = this._configs.length;
        this.view.rowList.refreshVirtualList();

        this.updateTime()
        if (this._blackShopConfig.desc1)
            this.view.desLab1.text = this._blackShopConfig.desc1;
        else
            this.view.desLab1.text = "";

        if (this._blackShopConfig.desc2)
            this.view.desLab2.text = this._blackShopConfig.desc2;
        else
            this.view.desLab2.text = "";
    }

    protected onClose(): void {
        G.GameTimer.clearAll(this);
    }
}