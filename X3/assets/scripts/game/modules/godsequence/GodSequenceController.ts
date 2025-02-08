import G from "../../../core/comm/G";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import LoginNotificationKey from "../../../main/modules/LoginNotificationKey";
import { FightType } from "../../comm/battle/enum/FightType";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { EnumRedDotReadType } from "../common/redDot/enums/EnumRedDotReadType";
import { RedDotKeys } from "../common/redDot/RedDotKeys";
import { FormationManager } from "../formation/FormationManager";
import { GodSequenceModel } from "./model/GodSequenceModel";


export class GodSequenceController extends BaseController {
    protected _isOpenAll: boolean = false;
    protected _allOpenEndTime: number = 0;

    listenNotifications(): string[] {
        return [
            LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE,
            NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION,
            NotificationKey.GOD_SEQUENCE_START_CHALLENGE,
            NotificationKey.SYSTEM_NEW_DAY,
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE:
                this.updateLeadderAllOpenState();
                this.refreshRedDot()
            case NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION:
                if (args == FightType.LADDER) {
                    //序列保存完阵容直接进入挑战
                    let id = FormationManager.ins().getAutoFightParam(FightType.LADDER)
                    if (id > 0) {
                        GodSequenceModel.ins().sendChallengeLadder({ ladderConfigId: id })
                        FormationManager.ins().deleteAutoFightParam(FightType.LADDER)
                    }
                }
                break
            case NotificationKey.GOD_SEQUENCE_START_CHALLENGE:
                // GIns.redDotMgr.markRead(EnumRedDotReadType.TODAY_ONCE, RedDotKeys.Ladder_challenge_times)
                break
            case NotificationKey.SYSTEM_NEW_DAY:
                this.updateLeadderAllOpenState();
                break;
        }
    }

    onInit(): void {

    }

    /**是否全部开启*/
    public get isOpenAll(): boolean {
        return this._isOpenAll;
    }

    /**全部开启结束时间 仅isOpenAll == true时有效*/
    public get allOpenEndTime(): number {
        return this._allOpenEndTime;
    }

    protected refreshRedDot(): void {
        // GIns.redDotMgr.setRedDot(RedDotKeys.Ladder_challenge_times, true)
    }

    /**检测是否全部开启*/
    protected updateLeadderAllOpenState(): void {
        let allCfgs = G.TableManager.getAllData(table.ladder.LadderTypeConfig);
        let isOpenAll: boolean = true;
        let curOpenDay = G.TimeManager.serverHaveOpenDay;
        let curZeroTime: number = G.TimeManager.todayZero;
        let maxDay: number = 0;
        for (let i = 0; i < allCfgs?.length; i++) {
            let specialOpenDayRange = allCfgs[i].specialOpenDayRange.concat();
            //排序一下 防止配置时 不按照从小到大的顺序
            specialOpenDayRange.sort((a, b) => {
                return a - b;
            })
            if (specialOpenDayRange.length <= 0) {
                isOpenAll = false
                break;
            }
            if (curOpenDay < specialOpenDayRange[0] || curOpenDay > specialOpenDayRange[specialOpenDayRange.length - 1]) {
                isOpenAll = false;
                break
            }
            if (maxDay == 0 || maxDay < specialOpenDayRange[specialOpenDayRange.length - 1]) {
                maxDay = specialOpenDayRange[specialOpenDayRange.length - 1];
            }
        }
        if (isOpenAll) {
            //如果开启了 计算结束时间
            this._allOpenEndTime = (maxDay - curOpenDay + 1) * 24 * 3600 * 1000 + curZeroTime;
        }
        if (this._isOpenAll != isOpenAll) {
            this._isOpenAll = isOpenAll;
            this.emit(NotificationKey.GOD_SEQUENCE_OPEN_STATE_CHANGE)
        }
    }
}

GodSequenceController.ins().doInit();
