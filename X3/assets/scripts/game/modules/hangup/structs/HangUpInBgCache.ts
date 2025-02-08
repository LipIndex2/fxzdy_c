import { HangUpConfigManager } from "db://assets/scripts/game/modules/hangup/config/HangUpConfigManager";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { HangUpUtils } from "db://assets/scripts/game/modules/hangup/utils/HangUpUtils";
import { HangUpModel } from "db://assets/scripts/game/modules/hangup/model/HangUpModel";
import { BattleManager } from "db://assets/scripts/game/comm/battle/BattleManager";
import HangUpState = ServerEnums.HangUpState;
import FightType = ServerEnums.FightType;
import GIns from "../../../GIns";

// 后台缓存
export class HangUpInBgCache {
    // 是否在后台
    private _state: HangUpState = HangUpState.NO_HANG_UP;

    // 通关数量
    private _passCount: number = 0;
    // 开始
    startLevelId: number = 0;
    startTimeMs: number = 0;
    // 结束
    endLevelId: number = 0;
    // fail
    failCount: number = 0;
    // 最后开战时间
    lastStartTimeMs: number = 0;


    get passCount(): number {
        return this._passCount;
    }

    get state(): HangUpState {
        return this._state;
    }

    @LogBusiness("[挂机/后台] 后端重置状态")
    reset(vo: Vo.trunkinstance.TrunkInstanceVo) {
        const oldState = this._state;
        const newState = vo.hangUpState;
        const curLevelId = vo.hangUpInstanceId;
        const startLevelId = vo.startHangUpInstanceId;

        this._state = newState;
        this.startLevelId = startLevelId;
        this.endLevelId = curLevelId;
        this.lastStartTimeMs = vo.lastHangUpBattleStartTime;

        if (newState == HangUpState.HANG_UP_FINISH) {
            this.endLevelId = curLevelId;
        }

        const diffCount = HangUpUtils.calcDiffLevelCount(startLevelId, curLevelId);
        this._passCount = Math.max(0, diffCount);

        if (oldState != newState) {
            console.info(`后端更新了挂机状态, 旧状态: ${oldState}, 新状态: ${newState}`);
            FacadeManager.ins().emit(NotificationKey.HANG_UP_IN_BG_UPDATE);
        }
    }

    // 是否在挂机 / 挂机完成
    isInBgState(): boolean {
        return this._state == HangUpState.HANG_UP_ING
            || this._state == HangUpState.HANG_UP_FINISH
            ;
    }

    setState(state: ServerEnums.HangUpState) {
        const oldState = this._state;
        this._state = state;

        FacadeManager.ins().emit(NotificationKey.HANG_UP_IN_BG_UPDATE);
    }


    // 首个挂机关卡
    setInBgFirstLevel(startLevelId: number) {
        this._state = HangUpState.HANG_UP_ING;
        this.startLevelId = startLevelId;
        this.endLevelId = startLevelId;
        this.startTimeMs = TimeManager.serverNow;

        FacadeManager.ins().emit(NotificationKey.HANG_UP_SET_IN_BG);
    }

    addFailCount(count: number = 1): number {
        this.failCount += count;

        // TODO 暂时写死 3 次
        if (this.failCount < 3) {
            return this.failCount;
        }

        // 失败超过 n 次 | 进入完成状态
        this._state = ServerEnums.HangUpState.HANG_UP_FINISH;
        console.info("[挂机关卡] 后台挂机, 失败次数过多. 结束自动挂机", this);

        // 战斗结束
        HangUpModel.ins().sendFinishHangUp();
        GIns.battleMgr.removeHideBattle(FightType.TRUNK_INSTANCE);
        // GIns.battleMgr.stopHideBattle(FightType.TRUNK_INSTANCE);

        // event 
        FacadeManager.ins().emit(NotificationKey.HANG_UP_IN_BG_UPDATE);
        FacadeManager.ins().emit(NotificationKey.HANG_UP_IN_BG_END);
        return this.failCount;
    }

    clear() {
        this._state = HangUpState.NO_HANG_UP;
        this.failCount = 0;
        this._passCount = 0;
        this.startLevelId = 0;
        this.startTimeMs = 0;
        this.endLevelId = 0;
        this.lastStartTimeMs = 0;

        FacadeManager.ins().emit(NotificationKey.HANG_UP_IN_BG_UPDATE);
    }

    getEndLevelName(): string {
        return HangUpConfigManager.getHangUpConfigByLevelId(this.endLevelId)?.showLevelId?.toString() || "";
    }

    /**
     * 下一场战斗等待时间
     */
    getNextChallengeWaitTimeMs(isWin: boolean): number {
        const curTimeMs = TimeManager.serverNow;
        let waitSec = 0;
        if (isWin) {
            waitSec = HangUpConfigManager.waitSecondPerInBgBattleWin;
        } else {
            waitSec = HangUpConfigManager.waitSecondPerInBgBattleFail;
        }
        const waitMs = waitSec * 1000;
        const diffTimeMs = Math.max(0, this.lastStartTimeMs + waitMs - curTimeMs);
        return diffTimeMs;
    }


}