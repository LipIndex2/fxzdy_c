import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { ViewBlackBgComp } from "../../../../core/mvc/view/comp/ViewBlackBgComp";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { TableManager } from "../../../../core/table/TableManager";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { ActivityModel } from "../../../comm/activity/model/ActivityModel";
import NotificationKey from "../../../event/NotificationKey";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { FloatingTextManager } from "../../floatingText/FloatingTextManager";
import { ModuleOpenManager } from "../../moduleopen/ModuleOpenManager";
import { MonthCardI18nKeys } from "../../monthCard/const/MonthCardI18nKeys";
import { MonthCardMainWin } from "../../monthCard/view/MonthCardMainWin";
import { UIActivityKey } from "../const/UIActivityConfig";
import GIns from "../../../GIns";

/**
 * 通行证总和弹窗
 */
export class PassGroupWin extends UIWin {
    static pkgName: string = "activityPass";
    static viewName: string = "PassGroupWin";

    //所有通行证配置
    private _allPassCfgs: table.activity.BattlePass.BattlePassConfig[];
    //所有基金配置
    private _allFundCfgs: table.activity.Fund.FundConfig[];
    //已开启的通行证的配置
    private _allOpenPassCfgs: any[];

    /**打开参数*/
    private _args: any;

    private get view(): ui.activityPass.Win.PassGroupWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_REQUEST_BACK,
            NotificationKey.MONTHCARD_DATA_CHANGE,
            NotificationKey.ACTIVITY_END_REFRESH,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK:
            case NotificationKey.ACTIVITY_UPDATE:
            case NotificationKey.ACTIVITY_REQUEST_BACK:
                this.updateData();
                break;
            case NotificationKey.MONTHCARD_DATA_CHANGE:
                this.updateMonthCard();
                break;
            case NotificationKey.ACTIVITY_END_REFRESH:
                this.updateData();
                break;
        }
    }

    protected initComp(): void {
        this.addComp(new ViewBlackBgComp());
    }

    protected get centerView(): ui.activityPass.panel.PassCenterPanel {
        return this.view.pGroup.pCenter;
    }

    protected onInit(): void {
        this.centerView.panel1.list_pass.itemRenderer = this.itemRendererForPass.bind(this);
        this.centerView.list_tab.itemRenderer = this.itemRendererForTab.bind(this);
        this.centerView.list_tab.on(fgui.Event.CLICK_ITEM, this.onClickTab, this);
        this.centerView.list_tab.numItems = 2;
    }

    private itemRendererForTab(index: number, item: ui.activityPass.btn.PassSelectBtn): void {
        if (index == 0) {
            item.T_title.text = "基金";
            item.getController("c1").selectedIndex = 0;
            FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.Pass_Fund);
        } else {
            item.T_title.text = MonthCardI18nKeys.title;
            item.getController("c1").selectedIndex = 1;
            FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.MonthCard_enter);
        }
    }

    protected onClickTab(item: ui.activityPass.btn.PassSelectBtn): void {
        let index = this.centerView.list_tab.getChildIndex(item);
        if (index == 1) {
            let isOpen = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.MONTH_CARD, false);
            if (isOpen == false) {
                let tipStr = ModuleOpenManager.ins().getModuleLockTips(ServerEnums.SystemType.MONTH_CARD);
                GIns.floatingTextMgr.showTips(tipStr);
                this.centerView.list_tab.selectedIndex = 0;
                return;
            }
        }
        this.centerView.getController("c1").selectedIndex = index;
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this.centerView.list_tab.selectedIndex = 0;
        this.centerView.getController("c1").selectedIndex = 0;
        this._args = args;
        this._allPassCfgs = TableManager.getAllData(table.activity.BattlePass.BattlePassConfig);
        this._allFundCfgs = TableManager.getAllData(table.activity.Fund.FundConfig);
        this.updateData();
        this.updateMonthCard();

        this.view.pGroup.getTransition("t0").play();

        if (!this.passList || this.passList.length <= 0) {
            this.centerView.getController("c1").selectedIndex = 1;
            this.centerView.list_tab.selectedIndex = 1;
        }
    }

    private updateData() {
        this.centerView.panel1.list_pass.numItems = this.passList.length;
    }

    protected updateMonthCard(): void {
        let comp = FguiScriptUtils.toMyScriptClass(this.centerView.panel2, MonthCardMainWin);
        comp.updateUI();
    }

    /**  已开启的通行证活动列表 */
    public get passList() {
        this._allOpenPassCfgs = [];
        // for (let i = 0; i < this._allPassCfgs.length; i++) {
        //     let passCfg = this._allPassCfgs[i];
        //     if (ActivityModel.ins().getActivityVoById(passCfg.activityId)) {
        //         this._allOpenPassCfgs.push(passCfg);
        //     }
        // }
        for (let i = 0; i < this._allFundCfgs.length; i++) {
            let fundCfg = this._allFundCfgs[i];
            if (ActivityModel.ins().getActivityVoById(fundCfg.activityId)) {
                this._allOpenPassCfgs.push(fundCfg);
            }
        }
        return this._allOpenPassCfgs;
    }

    private itemRendererForPass(index: number, item: ui.activityPass.item.PassGroupItem): void {
        let cfg = this._allOpenPassCfgs[index];
        item.Img_bg.icon = cfg.iconPath;
        item.T_title.text = cfg.passName;
        FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.Pass_item, [cfg.activityId]);

        let UIview = this.getUIKey(cfg.activityId);

        // let activityVo = ActivityModel.ins().getActivityVoById(cfg.activityId);
        // let hasReward = activityVo.isRewardCanGetList;
        // RedDotManager.ins().setRedDot(RedDotKeys.Pass_item, hasReward, [cfg.activityId])

        item.clearClick();
        let self = this;
        item.onClick(() => {
            G.UIManager.open(UIview, cfg.activityId);
        }, self);
    }

    private _activityCfgs: table.activity.ActivityConstant.ActivityClientConfig[];
    //获取当前活动对应界面
    private getUIKey(activityId: number) {
        if (!this._activityCfgs) this._activityCfgs = TableManager.getAllData(table.activity.ActivityConstant.ActivityClientConfig);

        for (let i = 0; i < this._activityCfgs.length; i++) {
            let cfg = this._activityCfgs[i];
            if (cfg.type == "1" && cfg.typeParam == activityId) {
                return cfg.UIView;
            }
        }

        return null;
    }
}
UIScriptManager.bindScript(UIActivityKey.PassGroupWin, PassGroupWin);
