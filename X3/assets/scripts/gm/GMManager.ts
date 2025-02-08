import { EventKeyboard, EventTouch, input, Input, KeyCode, Vec2 } from "cc";
import { DEBUG } from "cc/env";
import BaseSingleton from "db://assets/scripts/core/base/BaseSingleton";
import { UIGmKeys } from "db://assets/scripts/gm/const/UIGmKeys";
import { Logger, LogType } from "db://assets/scripts/core/log/Logger";
import { ConditionManager } from "db://assets/scripts/game/modules/condition/ConditionManager";
import { UITaskKeys } from "db://assets/scripts/game/modules/task/UITaskKeys";
import { UITalentKeys } from "db://assets/scripts/game/modules/talent/UITalentKeys";
import { HangUpUIKeys } from "db://assets/scripts/game/modules/hangup/HangUpUIKeys";
import { DrawCardUIKeys } from "db://assets/scripts/game/modules/drawcard/DrawCardUIKeys";
import { UIBattleKeys } from "../game/modules/battle/UIBattleKeys";
import { UICaptainSkillKeys } from "db://assets/scripts/game/modules/captainSkill/UICaptainSkillKeys";
import { RankUIKeys } from "db://assets/scripts/game/modules/rank/RankUIKeys";
import { RankMainViewOpenArgs } from "db://assets/scripts/game/modules/rank/view/RankMainView";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { PVPUIKeys } from "db://assets/scripts/game/modules/pvp/PVPUIKeys";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { DailyBossUIKeys } from "db://assets/scripts/game/modules/dailyBoss/DailyBossUIKeys";
import { DailyBossModel } from "db://assets/scripts/game/modules/dailyBoss/model/DailyBossModel";
import { DailyBossBattleResultViewOpenArgs } from "../game/modules/dailyBoss/interface/IDailyBossArgs";
import {
    HangUpBattleResultFailV2ViewOpenArgs,
    HangUpBattleResultWinV2ViewOpenArgs
} from "../game/modules/hangup/interface/IHangUpArgs";
import { PVPBattleResultViewOpenArgs } from "../game/modules/pvp/interface/IPvpArgs";
import { MapModel } from "db://assets/scripts/game/tiledMap/model/MapModule";
import { MapInstanceManager } from "db://assets/scripts/game/modules/mapInstance/MapInstanceManager";
import { GrowthPathUIKeys } from "db://assets/scripts/game/modules/growthpath/GrowthPathUIKeys";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { GodSequenceUIKeys } from "db://assets/scripts/game/modules/godsequence/GodSequenceUIKeys";
import { ChatUIKeys } from "db://assets/scripts/game/modules/chat/ChatUIKeys";
import { ChatMainViewOpenArgs } from "db://assets/scripts/game/modules/chat/structs/ChatMainViewOpenArgs";
import { RedDotManager } from "db://assets/scripts/game/modules/common/redDot/RedDotManager";
import { JumpManager } from "db://assets/scripts/game/modules/jump/JumpManager";
import { UIItemKeys } from "db://assets/scripts/game/modules/item/UIItemKeys";
import { PlayerUIKeys } from "db://assets/scripts/game/modules/player/PlayerUIKeys";
import { RedemptionUIKeys } from "db://assets/scripts/game/modules/redemption/RedemptionUIKeys";
import { ChannelManager } from "../core/sdk/ChannelManager";
import { ConnectProcedure } from "../main/procedure/ConnectProcedure";
import LoginModel from "../main/modules/login/model/LoginModel";
import { ChooseServerModel } from "../main/modules/login/model/ChooseServerModel";
import { GmModel } from "./model/GMModel";
import { SystemSettingUIKeys } from "db://assets/scripts/game/modules/systemsetting/SystemSettingUIKeys";
import { UIActivityKey } from "db://assets/scripts/game/modules/activity/const/UIActivityConfig";
import { GuideManager } from "db://assets/scripts/game/modules/guide/GuideManager";
import GIns from "../game/GIns";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { EventTaskProgressChange } from "db://assets/scripts/game/modules/task/event/EventTaskProgressChange";
import { LocalStorageUtils } from "../core/utils/LocalStorageUtils";
import { GuideConfigDatas } from "../game/table/guide/GuideConfigDatas";
import { TableManager } from "../core/table/TableManager";

/**
 * GM 管理器
 */
export class GMManager extends BaseSingleton {


    // 开关test业务
    private _toggleTestBiz: boolean = false;

    private _touchPoints: Vec2[] = [];
    private _touchStartTimeMs = 0;


    protected onInit() {
        super.onInit();


        // Canvas.ins().on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        // Canvas.ins().on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        // Canvas.ins().on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onTouchStart(event: EventTouch) {
        this._touchPoints = []; // 开始新的触摸，重置路径
        const touch = event.getUILocation();
        this._touchPoints.push(touch);

        this._touchStartTimeMs = Date.now();
    }


    onTouchEnd(event: EventTouch) {
        const touch = event.getUILocation();
        this._touchPoints.push(touch);

        if (!this.isGestureForOpenGM()) {
            return;
        }
        console.log('手势打开 GM');

        this.openGM();
    }

    private isGestureForOpenGM(): boolean {
        let endTimeMs = Date.now();
        const diffTimeMs = endTimeMs - this._touchStartTimeMs;
        // 需要间隔 5s
        if (diffTimeMs < 4000) {
            return false;
        }

        let startPos = this._touchPoints[0];
        let endPos = this._touchPoints[1];

        let distance = Math.sqrt(Math.pow(endPos.x - startPos.x, 2) + Math.pow(endPos.y - startPos.y, 2));
        return distance > 200;
    }


    private openGM() {
        UIManager.ins().open(UIGmKeys.GMView);
    }

    /**
     * 初始化 debug 快捷键
     */
    initDebugShortcut() {
        // 键盘
        input.on(Input.EventType.KEY_DOWN,
            (event: EventKeyboard) => {
                this.onKeyDown(event.keyCode)
            },
            this
        )
    }

    private onKeyDown(key: KeyCode) {
        switch (key) {
            case KeyCode.BACK_QUOTE: {
                // 键盘的 "`", 左上角 esc 下方
                //  打开 GM 面板
                UIManager.ins().open(UIGmKeys.GMView)
                return;
            }
            case KeyCode.F10: {
                UIManager.ins().open(UIGmKeys.BattleLogView)
                return;
            }
        }
    }

    spLogin(str: string) {
        if (str && str[0] == "{" && str[str.length - 1] == "}") {
            try {
                let json = JSON.parse(str);
                //{"address":"192.168.11.56:2222","sign":"b8bcf121f1d1637b9d4c5ccd6029b8c5","serverName":"lhc","serverId":63,"account":"lhc00.1_63","timestamp":1679915926419}
                if (json && json.sign && json.account) {
                    ChooseServerModel.ins().serverVo = {
                        id: json.serverId,
                        name: json.serverName,
                        address: json.address,
                        states: 1,
                        startTime: null
                    };
                    LoginModel.ins().getAccount = () => {
                        return json.account;
                    }
                    LoginModel.ins().getLoginSignAndTime = () => {
                        return { sign: json.sign, timestamp: json.timestamp, param: json.loginParam };
                    }
                    ChannelManager.ins().channel.realName = false;
                    ConnectProcedure.start();
                }
            } catch (error) {
            }
        }
    }
}
