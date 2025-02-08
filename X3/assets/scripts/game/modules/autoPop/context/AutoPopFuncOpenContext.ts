import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import LoginNotificationKey from "db://assets/scripts/main/modules/LoginNotificationKey";
import G from "../../../../core/comm/G";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { UIMainKey } from "../../../ui/main/const/UIMainConfig";
import { ConditionUtils } from "../../condition/ConditionUtils";
import { UIFuncOpenKey } from "../../funcOpen/funcOpenController";
import { AutoPopBaseContext } from "./AutoPopBaseContext";
import { FightType } from "../../../comm/battle/enum/FightType";

/** 功能开启自动弹框 */
export class AutoPopFuncOpenContext extends AutoPopBaseContext {
    //已经开启过的功能列表
    private hasShowList: number[] = [];
    //弹窗显示队列
    private _showQueue: Array<table.verify.PlayerSystemOpenConfig> = [];
    private funcConfigs: table.verify.PlayerSystemOpenConfig[] = [];

    listenNotifications(): string[] {
        return [
            LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE,
            NotificationKey.FIGHT_UPDATE_ONE_HERO,
            NotificationKey.FIGHT_UPDATE_ALL_HERO,
            // 解锁
            ...ConditionUtils.getUnlockEventNameArray(),
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE:
                this.initData();
                break
            case NotificationKey.FIGHT_UPDATE_ONE_HERO:
            case NotificationKey.FIGHT_UPDATE_ALL_HERO:
                this.checkShowQueue();
                break
            default:
                break;
        }

        const ok = ConditionUtils.isNeedHandleForUnlock(event);
        if (ok) {
            this.checkShowQueue();
        }
    }

    protected initData(): void {
        //获取服务端的功能开启列表
        let vo = GIns.playerModel.Vo.sysOpenMap;

        this.hasShowList = Object.keys(vo).map((key) => {
            return Number(key);
        });
        this._showQueue.length = 0;
        let cfgs = G.TableManager.getAllData(table.verify.PlayerSystemOpenConfig);
        this.funcConfigs = [];
        cfgs.forEach((cfg) => {
            if (cfg.showOpen) {
                this.funcConfigs.push(cfg);
            }
        });
    }

    protected checkShowQueue() {
        let hasNewOpen: boolean = false;
        let cfgs = this.funcConfigs;
        cfgs.forEach((cfg) => {
            let systemId = ServerEnums.SystemType[cfg.id];
            //是否开放过
            if (this.hasShowList.indexOf(systemId) == -1 && this._showQueue.indexOf(cfg) == -1) {
                let unLock = GIns.conditionMgr.checkCondition(cfg.conditions) && cfg.serverOpenDays <= G.TimeManager.serverHaveOpenDay;
                if (unLock) {
                    this._showQueue.push(cfg);
                    hasNewOpen = true;
                }
            }
        });
        if (hasNewOpen) {
            this.onAutoPopDataChange();
            G.FacadeManager.emit(NotificationKey.SYSTEM_OPEN_FUNCTION);
        }
    }

    public checkPopNext(): boolean {
        let result: boolean = false;
        if (this._showQueue.length > 0
            && G.UIManager.isOpened(UIFuncOpenKey.FUNCOPEN_VIEW) == false
            && GIns.battleMgr.battleLogic && GIns.battleMgr.battleLogic.fightType == FightType.TRUNK_MAP
            && G.UIManager.isUiTop(UIMainKey.MAIN_PAGE)) {
            let cfg = this._showQueue.shift();
            let systemId = ServerEnums.SystemType[cfg.id];
            this.hasShowList.push(systemId);
            GIns.playerModel.sendUpdateSysOpen(systemId, 1);
            G.UIManager.open(UIFuncOpenKey.FUNCOPEN_VIEW, cfg);
            result = true;
        }
        return result;
    }
}
