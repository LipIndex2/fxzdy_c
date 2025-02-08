import { ConditionUtils } from "../../condition/ConditionUtils";
import GIns from "../../../GIns";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { GuideController } from "../GuideController";
import { GuideGroupManager } from "../GuideGroupManager";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { TableManager } from "db://assets/scripts/core/table/TableManager";

/**引导组启动器 */
export default class GuideGroupEnder implements INotification {
    private _groupCfg: table.guide.GuideGroupConfig;
    private _isTriggered = false;

    listenNotifications(): string[] | null {
        return ConditionUtils.getConditionsNotificationKeys(this._groupCfg.closeVerify);
    }
    notificationHandler(eventName: string, args?: any): void {
        if (!this._isTriggered && this.isClose()) {
            this._isTriggered = true;
            GuideGroupManager.ins().closeGroup(this._groupCfg.groupId);
            FacadeManager.ins().removeNotification(this);
        }
    }

    static create(guideId: number) {
        let cfg = TableManager.getDataById(table.guide.GuideGroupConfig, guideId);
        if (!cfg) {
            console.error("未找到引导组配置，id = " + guideId);
            return;
        }

        if (!cfg.closeVerify) return null;
        return new GuideGroupEnder(cfg);
    }


    constructor(cfg: table.guide.GuideGroupConfig) {
        this._groupCfg = cfg;
        FacadeManager.ins().registerNotification(this);
    }


    get groupCfg() {
        return this._groupCfg;
    }

    /**
     * 获取启动的通知。
     * @returns string[] - 条件通知键数组
     */
    startNotificationKeys(): string[] {
        return ConditionUtils.getConditionsNotificationKeys(this._groupCfg.openVerify);
    }

    /**检测是否满足启动条件 */
    private isClose() {
        return GIns.conditionMgr.checkCondition(this._groupCfg.closeVerify);
    }

    public destroy() {
        if (this._isTriggered) return;
        FacadeManager.ins().removeNotification(this);
    }
}