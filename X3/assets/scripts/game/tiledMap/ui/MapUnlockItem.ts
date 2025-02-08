import * as fgui from "fairygui-cc";
import { TableManager } from "../../../core/table/TableManager";
import { MapManager } from "../MapManager";
import { ItemUtils } from "../../modules/item/utils/ItemUtils";
import { ConditionManager } from "../../modules/condition/ConditionManager";
import { BackpackManager } from "../../modules/backpack/BackpackManager";
import { GameTimer } from "../../../core/timer/GameTimer";
import FacadeManager from "../../../core/mvc/FacadeManager";
import NotificationKey from "../../event/NotificationKey";
import { TimeManager } from "../../../core/time/TimeManager";
import FGUICocosNodeComponent from "../../../core/fgui/com/FGUICocosNodeComponent";
import { bindFguiExtension, bindScript } from "../../../core/comm/UIScriptManager";
import GIns from "../../GIns";
import { ConditionUtils } from "../../modules/condition/ConditionUtils";
import ArrayUtils from "../../../core/utils/ArrayUtils";
import { js } from "cc";
import { EnumConditionType } from "../../modules/condition/enum/EnumConditionType";
import { ICondition } from "../../modules/condition/ICondition";
import G from "../../../core/comm/G";
import { Logger } from "../../../core/log/Logger";

export enum ELockType {
    LV = 0,         //等级锁
    material = 1,   //材料锁
    bar = 2,        //进度条
}

declare global {
    namespace XJ {
        namespace Pet {
            interface IMapBuildingUpdateBarParam {
                object_id: number
                curBar: number
            }
        }
    }
}

/** 地图建筑解锁条件Fgui item */
@bindFguiExtension("ui://map/Unlock_item")
export class MapUnlockItem extends FGUICocosNodeComponent {
    static pkgName: string = "map";
    static viewName: string = "Unlock_item";

    // /**是否已解锁 */
    // private _isUnlock = true;

    /**是否材料已足够 */
    private _isEnough = false;

    /**前置条件是否满足 */
    private _isConditionOk = true;

    private _cfg: table.map.MapBuildingConfig;

    private _object_id: number
    private _lockType: ELockType = ELockType.LV

    /** 建筑任务id */
    protected _taskId: number

    /**解锁条件 */
    private _conditionsNotificationKeys: string[];

    private get view(): ui.map.item.Unlock_item {
        return this as any;
    }

    constructor() {
        super();
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_CHANGE_ITEMS,
            NotificationKey.MAP_BUILDING_UNLOCK_COST_ANIM,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.EVENT_CHANGE_ITEMS:
                this.checkMaterial();
                break;
            case NotificationKey.MAP_BUILDING_UNLOCK_COST_ANIM:
                GameTimer.ins().once(500, this, this.onUnlockAnim);
                break;
            default:
                if (this._conditionsNotificationKeys && this._conditionsNotificationKeys.indexOf(event) != -1) {
                    this.updateInfo();
                    if (event == NotificationKey.MAP_BUILDING_TASK_CHG) {
                        let taskId = args;
                        if (this._taskId === taskId) {
                            this.updateBar();
                        }
                    }
                }
                break;
        }
    }

    /**添加条件事件 */
    private addConditionsNotification() {
        let keys = ConditionUtils.getConditionsNotificationKeys(this._cfg?.openVerify);
        if (!ArrayUtils.equal(this._conditionsNotificationKeys, keys)) {
            this.removeConditionsNotification(); //移除原有的监听
            FacadeManager.ins().registerByNames(keys, this);
            this._conditionsNotificationKeys = keys;
        }
    }

    /**删除条件事件 */
    private removeConditionsNotification() {
        if (this._conditionsNotificationKeys) {
            FacadeManager.ins().removeByNames(this._conditionsNotificationKeys, this);
            this._conditionsNotificationKeys = null;
        }
    }


    onInit() {
        FacadeManager.ins().registerNotification(this);
        this.view.bar.titleType = fgui.ProgressTitleType.ValueAndMax;
    }

    /**
     * 设置状态
     * @param object_id  对象id
     * @returns
     */
    setId(object_id: number) {
        if (!object_id) return;
        this._cfg = TableManager.getDataById(table.map.MapBuildingConfig, object_id);
        this.updateInfo();
    }

    /** 更新建筑UI信息 */
    updateInfo() {
        if (!this._cfg) return;
        let cfg = this._cfg;

        let isUnlock = MapManager.ins().getBuildingUnlockById(cfg.id);
        if (isUnlock) {
            this.view.visible = false;
            return;
        }

        let titleStr: string
        let cond = GIns.conditionMgr.getCondition(cfg.openVerify, EnumConditionType.ASSIGN_TASK_COMPLETED);
        if (cond && cond.check() == false) {
            //未完成指定建筑任务，显示任务进度
            this._lockType = ELockType.bar
            this._taskId = cond.value();
            let cfg = G.TableManager.getDataById(table.map.MapBuildingTaskConfig, this._taskId);
            this.view.bar.max = cfg.totalProgress;
        } else {
            this._taskId = null;
            titleStr = ConditionUtils.getConditionsTitle(cfg.openVerify);
            if (titleStr !== null) {
                //有未完成的条件，显示条件
                this._lockType = ELockType.LV;
            } else {
                //显示材料解锁
                this._lockType = ELockType.material;
            }
        }

        if (titleStr || (cond && cond.check() == false)) {
            this.addConditionsNotification();
            this._isConditionOk = false;

        } else {
            this.removeConditionsNotification();
        }

        if (this._lockType == ELockType.LV) {
            this.view.T_Lv.text = titleStr;
        } else if (this._lockType == ELockType.material) {
            this.updateCost();
        } else if (this._lockType == ELockType.bar) {
            this.updateBar();
        }

        this.view.getController("c1").selectedIndex = this._lockType;
    }

    updateCost() {
        if (!this._cfg) return;
        let cfg = this._cfg;
        if (cfg.costItems) {
            // this.view.getController("c1").selectedIndex = 1;
            let id = Number.parseInt(cfg.costItems[0].k);
            let num = Number.parseInt(cfg.costItems[0].v);
            this.view.I_icon.icon = ItemUtils.getItemConfigByItemId(id).smallIconPath;
            this.view.T_num.text = num + "";
            this._isEnough = BackpackManager.ins().isCanPayTheseItemArrayByConfig(cfg.costItems);
            this.view.getController("enough").selectedIndex = this._isEnough ? 1 : 0;
        } else {
            this.view.visible = false;
            return;
        }
    }

    updateBar() {
        this.view.bar.value = GIns.mapModel.getMapBuildingTaskProgress(this._taskId);
    }

    private checkMaterial() {
        if (this._lockType == ELockType.material && this._isConditionOk && !this._isEnough) {
            this.updateCost();
        }
    }

    private onUnlockAnim() {
        if (!this._cfg) return;
        let cfg = this._cfg;
        if (cfg.costItems) {
            let stepMs = 100;
            let num = Number.parseInt(cfg.costItems[0].v);
            let animNum = Math.min(num, 10);
            let time = (animNum - 1) * stepMs + 1; //+1 为了被除数不为0
            let perMSCost = num / time;
            let startTime = TimeManager.serverNow; //开始时间
            GameTimer.ins().frameLoop(1, this, () => {
                let cost = (TimeManager.serverNow - startTime) * perMSCost;
                if (cost > num) {
                    GameTimer.ins().clearAll(this);
                    //可能会出现动画结束，但是数量大于0的情况
                    this.view.T_num.text = "0";
                    return;
                }
                this.view.T_num.text = Math.floor(num - cost).toString();
            });
        }
    }

    onPreDispose() {
        GameTimer.ins().clearAll(this);
        this.removeConditionsNotification();
        FacadeManager.ins().removeNotification(this);
    }
}
