import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { IContainer } from "../../../../core/mvc/viewContainer/IContainer";
import { TableManager } from "../../../../core/table/TableManager";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ActivityModel } from "../../../comm/activity/model/ActivityModel";
import NotificationKey from "../../../event/NotificationKey";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { ConditionManager } from "../../condition/ConditionManager";
import { UIFuilKey } from "../../fuli/const/fuliConst";
import { WorldBossController } from "../../worldBoss/worldBossController";
import { UIActivityKey } from "../const/UIActivityConfig";
import { BaseActivityVo } from "db://assets/scripts/game/comm/activity/model/BaseActivityVo";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import { EntranceMainViewOpenArgs } from "db://assets/scripts/game/modules/activity/entrance/structs/EntranceMainViewOpenArgs";
import G from "../../../../core/comm/G";
import GIns from "../../../GIns";
import { ActivityCareerTrialsVo } from "../model/ActivityCareerTrialsVo";

/**
 * 活动整合入口主页
 *
 */
@bindScript(UIActivityKey.EntranceMainView)
export class EntranceMainView extends UIPage implements IContainer {
    static pkgName: string = "activityEntrance";
    static viewName: string = "EntranceMainView";

    private _uiKeys = [];
    private _isChange = false;

    //当前打开的页面key
    private _currentPageKey: string;

    //入口id
    private _tabId: number;
    private _chooseSubIndex: number = 0;

    private _configs: table.activity.ActivityConstant.ActivityClientConfig[] = [];

    //第一次进入
    private _firstInit = true;

    private get view(): ui.activityEntrance.EntranceMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.ACTIVITY_END_REFRESH,
            NotificationKey.ACTIVITY_DATA_RELOAD,
            NotificationKey.ACTIVITY_TAB_UPDATE,
            NotificationKey.SYSTEM_NEW_DAY,
            NotificationKey.ACTIVITY_SET_BOTTOM_STYLE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.ACTIVITY_END_REFRESH:
            case NotificationKey.ACTIVITY_DATA_RELOAD:
                //活动更新或结束
                this.updateView();
                break;
            case NotificationKey.ACTIVITY_TAB_UPDATE:
                if (args) this._chooseSubIndex = args;
                this.clearTabList();
                this._isChange = true;
                this.updateView();
                break;
            case NotificationKey.SYSTEM_NEW_DAY:
                if (args) this._chooseSubIndex = args;
                this.clearTabList();
                this._isChange = true;
                this.updateView();
                break;
            case NotificationKey.ACTIVITY_SET_BOTTOM_STYLE:
                this.view.getController("c1").selectedIndex = args;
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
        this.view.tabList.itemRenderer = this.irTabBtn.bind(this);
        this.view.btnBack.onClick(this.closeSelf, this);
    }

    public onOpen(data: EntranceMainViewOpenArgs) {
        if (!data) {
            console.error(`[EntranceMainView] 打开参数错误 data ${data}`);
            this.closeSelf();
            return;
        }
        this._tabId = data.id;
        if (!this._chooseSubIndex) {
            this._chooseSubIndex = data.pageIndex;
        }
        this.updateView(data.defaultTypeParam);
    }

    /**
     * 刷新界面
     * 此方法用于根据当前配置和条件刷新界面显示
     */
    private updateView(defaultTypeParam: number = 0) {
        const oldConfigs = this._configs;
        // 重置配置列表
        this._configs = [];

        // 获取所有相关配置
        let cs = TableManager.getAllData(table.activity.ActivityConstant.ActivityClientConfig);
        for (let c of cs) {
            // 检查配置是否适用于当前界面
            const tabId = this._tabId;
            const isSameParent = c.parentId == tabId;
            const isOk = ConditionManager.ins().checkCondition(c.conditionText);
            if (isSameParent && isOk) {
                // 根据配置类型处理
                switch (c.type) {
                    case "1":
                        // 处理活动类型配置
                        let vo: BaseActivityVo = ActivityModel.ins().getActivityVoById(c.typeParam);
                        if (vo && !vo.isActivityOver()) {
                            this._configs.push(c);
                        }
                        break;
                    case "3":
                        // ?
                        break;
                    default:
                        // 默认情况下添加配置
                        this._configs.push(c);
                        break;
                }
            }
        }

        // TODO A 要, B 不要
        // // old keep
        // if (ArrayUtils.isNotEmpty(oldConfigs)) {
        //     // 将 oldConfigs 中不在新配置列表中的项添加到 _configs 中
        //     for (let oldCfg of oldConfigs) {
        //         if (!this._configs.some(newCfg => newCfg.id === oldCfg.id)) {
        //             this._configs.push(oldCfg);
        //         }
        //     }
        // }

        // 如果没有配置，关闭界面
        if (this._configs.length < 1) {
            this.closeSelf();
            return;
        }

        // 排序配置
        this._configs.sort((a, b) => a.order - b.order);

        // 查找默认配置的索引
        if (defaultTypeParam > 0) {
            this._chooseSubIndex = this._configs.findIndex((value) => value.typeParam == defaultTypeParam);
        }
        // 确保索引有效
        if (this._chooseSubIndex == -1 || this._chooseSubIndex >= this._configs.length) {
            this._chooseSubIndex = 0;
        }

        // 更新UI键列表
        this._uiKeys = [];
        for (let c of this._configs) {
            this._uiKeys.push(c.UIView);
        }

        //判断是否不一样
        let isBind = false;
        if (oldConfigs.length != this._configs.length) {
            isBind = true;
        } else {
            for (let i = 0; i < oldConfigs.length; i++) {
                if (oldConfigs[i].typeParam != this._configs[i].typeParam) {
                    isBind = true;
                    break;
                }
            }
        }

        // 绑定按钮
        if (isBind) {
            this.view.tabList.numItems = this._configs.length;
            this.view.tabList.scrollPane.scrollRight();
            this.viewContainer.bindByGList(this._uiKeys, this.view.tabList);
        }

        this.careerTrials();

        // 更新选中的界面
        if (this.viewContainer.selectIndex != this._chooseSubIndex) {
            this.viewContainer.selectIndex = this._chooseSubIndex;
            this.onChangedView(this._chooseSubIndex);
        } else if (this._isChange) {
            // 强制重新打开界面
            this.viewContainer.forceOpen(this._chooseSubIndex);
            this.onChangedView(this._chooseSubIndex);
            this._isChange = false;
        } else if (!this.viewContainer.checkSameIndex(this._chooseSubIndex, this._currentPageKey)) {
            this.viewContainer.forceOpen(this._chooseSubIndex);
            this.onChangedView(this._chooseSubIndex);
        }
    }

    //职业试炼特殊需求 -- 试炼开始之后默认打开战令界面
    private careerTrials() {
        let cfg = this._configs[this._chooseSubIndex];
        if (cfg.UIView == "CareerTrialsMainView" && this._firstInit) {
            let vo: ActivityCareerTrialsVo = GIns.activityModel.getActivityVoById(cfg.typeParam);
            // if (!!vo.activityVo.trialId && this._firstInit) {
            this._chooseSubIndex = 1;
            this._firstInit = false;
            // } else if (!vo.activityVo.trialId) {
            // this._firstInit = false;
            // }
        }
    }

    public onClose(): void {
        this.clearTabList();
    }

    private irTabBtn(index: number, item: ui.activityEntrance.btn.tabBtn) {
        let cfg = this._configs[index];

        item.title = cfg.name;
        item.iconUp.icon = cfg.upIcon;
        item.iconDown.icon = cfg.downIcon;

        if (cfg.UIView == UIFuilKey.worldBoss) {
            // 世界b
            let bossId = WorldBossController.ins().getBossIdByActivityId(cfg.typeParam);
            FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.Activity_worldBoss, [bossId]);
            return;
        } else {
            let activityCfg = TableManager.getDataById(table.activity.ActivityConstant.ActivityConfig, cfg.typeParam);
            if (activityCfg?.type == "CAREER_TRIAL") {
                FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.Activity_entrance_item, [cfg.parentId, cfg.typeParam + cfg.order]);
            } else {
                FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.Activity_entrance_item, [cfg.parentId, cfg.typeParam]);
            }
        }
    }

    onPreChangeView(index: number): table.activity.ActivityConstant.ActivityClientConfig | null {
        if (ArrayUtils.isEmpty(this._configs)) {
            return null;
        }
        return this._configs[index] || null;
    }

    //切换页签完成
    public onChangedView(subIndex: number) {
        this._chooseSubIndex = subIndex;
        this._currentPageKey = this._uiKeys[subIndex];
    }

    /**点击页签判断
     * @returns 返回是否可以打开界面
     */
    onClickTabAndCheck(index: number): boolean {
        return true;
    }
}
