import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { IContainer } from "../../../../core/mvc/viewContainer/IContainer";
import { TableManager } from "../../../../core/table/TableManager";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ActivityModel } from "../../../comm/activity/model/ActivityModel";
import { BaseActivityVo } from "../../../comm/activity/model/BaseActivityVo";
import NotificationKey from "../../../event/NotificationKey";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { ConditionManager } from "../../condition/ConditionManager";
import { UIActivityKey } from "../const/UIActivityConfig";

/**
 * 活动整合入口主页
 *
 */
@bindScript(UIActivityKey.openChargeView)
export class OpenChargeView extends UIPage implements IContainer {
    static pkgName: string = "activityOpenCharge";

    static viewName: string = "openChargeView";

    private _uiKeys = [];

    //  private _footerComp: CommonFooterView;
    private _isChange = false;

    //入口id
    private _id: number;
    private _index: number = 0;
    private _defaultId: number = 0;

    //当前打开的页面key
    private _currentPageKey: string;

    private cfgs: table.activity.ActivityConstant.ActivityClientConfig[] = [];

    private get view(): ui.activityOpenCharge.openChargeView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_REQUEST_BACK,
            NotificationKey.ACTIVITY_END_REFRESH,
            NotificationKey.ACTIVITY_DATA_RELOAD,
            NotificationKey.ACTIVITY_TAB_UPDATE,
            NotificationKey.SYSTEM_NEW_DAY,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK:
            case NotificationKey.ACTIVITY_UPDATE:
            case NotificationKey.ACTIVITY_REQUEST_BACK:
            case NotificationKey.ACTIVITY_END_REFRESH:
            case NotificationKey.ACTIVITY_DATA_RELOAD:
                //活动更新或结束
                this.updateView();
                break;
            case NotificationKey.ACTIVITY_TAB_UPDATE:
                if (args) this._index = args;
                this.clearTabList();
                this._isChange = true;
                this.updateView();
                break;
            case NotificationKey.SYSTEM_NEW_DAY:
                if (args) this._index = args;
                this.clearTabList();
                this._isChange = true;
                this.updateView();
                break;
        }
    }

    //清理tab列表
    private clearTabList() {
        this._uiKeys = [];
        // this.cfgs = null;
    }

    public onInit(): void {
        this.view.footer.btnBack.onClick(this.closeSelf, this);
        this.view.tabList.itemRenderer = this.itemRendererForBtn.bind(this);
    }

    public onOpen(data: { pageIndex: number; id: number; defaultId?: number }) {
        if (!data) {
            return;
        }
        this._id = data.id;
        this._index = data.pageIndex;
        this._defaultId = data.defaultId;
        this.updateView();
    }

    //刷新界面
    private updateView() {
        // if (!this.cfgs) {
        let oldCfgs = this.cfgs;
        this.cfgs = [];
        let allCfgs = TableManager.getAllData(table.activity.ActivityConstant.ActivityClientConfig);
        for (let cfg of allCfgs) {
            if (cfg.parentId == this._id && ConditionManager.ins().checkCondition(cfg.conditionText)) {
                switch (cfg.type) {
                    case "1":
                        let vo = ActivityModel.ins().getActivityVoById(cfg.typeParam) as BaseActivityVo;
                        if (vo && vo.isShowEntrance()) {
                            this.cfgs.push(cfg);
                            //  this._uiKeys.push(cfg.UIView);
                        }
                        break;
                    case "3":
                        break;
                    default:
                        this.cfgs.push(cfg);
                        // this._uiKeys.push(cfg.UIView);
                        break;
                }
            }
        }
        // }

        if (this.cfgs.length < 1) {
            this.closeSelf();
            return;
        }

        //排序
        this.cfgs.sort((a, b) => a.order - b.order);
        if (this._defaultId > 0) {
            this._index = this.cfgs.findIndex((value) => value.typeParam == this._defaultId);
        }
        if (this._index == -1 || this._index >= this.cfgs.length) {
            this._index = 0;
        }

        let curUIKey = null;
        if (this._uiKeys.length > 0) {
            curUIKey = this._uiKeys[this._index];
        }

        this._uiKeys = [];
        for (let cfg of this.cfgs) {
            this._uiKeys.push(cfg.UIView);
        }
        let forceUpdate: boolean = false;
        if (curUIKey && this._uiKeys.indexOf(curUIKey) == -1) {
            //代表页面不存在
            this._index = 0;
            forceUpdate = true;
        }
        //判断是否不一样
        let isBind = false;
        if (oldCfgs.length != this.cfgs.length) {
            isBind = true;
        } else {
            for (let i = 0; i < oldCfgs.length; i++) {
                if (oldCfgs[i].typeParam != this.cfgs[i].typeParam) {
                    isBind = true;
                    break;
                }
            }
        }

        // 绑定按钮
        if (isBind) {
            this.view.tabList.numItems = this.cfgs.length;
            this.view.tabList.scrollPane.scrollRight();
            this.viewContainer.bindByGList(this._uiKeys, this.view.tabList);
        }

        if (this.viewContainer.selectIndex != this._index || forceUpdate) {
            this.viewContainer.forceOpen(this._index);
            this.onChangedView(this._index);
        } else if (this._isChange) {
            this.viewContainer.forceOpen(this._index);
            this._isChange = false;
        } else if (!this.viewContainer.checkSameIndex(this._index, this._currentPageKey)) {
            this.viewContainer.forceOpen(this._index);
            this.onChangedView(this._index);
        }
    }

    public onClose(): void {
        this.clearTabList();
    }

    private itemRendererForBtn(index: number, item: ui.activityOpenCharge.btn.tabBtn) {
        let cfg = this.cfgs[index];
        item.iconUp.icon = cfg.upIcon;
        item.iconDown.icon = cfg.downIcon;
        item.title = cfg.name;
        FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.Activity_openCharge_item, [cfg.typeParam]);
    }

    onPreChangeView(index: number) {
        //返回配置
        return this.cfgs[index];
    }

    //切换页签完成
    public onChangedView(index) {
        this._index = index;
        this._currentPageKey = this._uiKeys[index];
    }

    /**点击页签判断
     * @returns 返回是否可以打开界面
     */
    onClickTabAndCheck(index): boolean {
        return true;
    }
}
