import { director } from "cc";
import G from "../../../core/comm/G";
import { Logger } from "../../../core/log/Logger";
import { UIManager } from "../../../core/mvc/UIManager";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import NotificationKey from "../../event/NotificationKey";
import { UICommonKey } from "../../modules/common/const/UICommonConfig";
import { UIMainKey } from "../../ui/main/const/UIMainConfig";
import { WorldController } from "../world/WorldController";
import { BattleManager } from "./BattleManager";
import { FightType } from "./enum/FightType";
import { UIStimulationConfig } from "../../modules/stimulation/const/UIStimulationConfig";
import GIns from "../../GIns";

/**战斗暂停类型*/
export enum BattlePauseType {
    /**因为UI层级导致的暂停*/
    UI = 0x00000001,
    /**手动设置暂停*/
    Manual = 0x00000010
}

export class BattleController extends BaseController {
    /**当前战斗是否暂停*/
    protected _isPuase: boolean = false
    /**暂停值*/
    protected _pauseValue: number = 0
    listenNotifications(): string[] {
        return [
            NotificationKey.BATTLE_START,
            NotificationKey.OPEN_ViEW,
            NotificationKey.CLOSE_ViEW,
            NotificationKey.PAUSE_BATTLE,
            NotificationKey.CONTINUE_BATTLE,
            NotificationKey.ENTER_WORLD,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.BATTLE_START:
                this.onBattleStart();
                break;
            case NotificationKey.OPEN_ViEW:
                this.onOtherViewOpen(args);
                break;
            case NotificationKey.CLOSE_ViEW:
                this.onOtherViewClose();
                break;
            case NotificationKey.PAUSE_BATTLE:
                this.setPauseByType(true, BattlePauseType.Manual);
                break;
            case NotificationKey.CONTINUE_BATTLE:
                this.setPauseByType(false, BattlePauseType.Manual);
                break;
            case NotificationKey.ENTER_WORLD:
                this.resetPauseState();
                break
        }
    }

    constructor() {
        super();
        Logger.game("Battle");
    }

    onInit(): void {
        //FGUIManager.ins().bindScript("ui://battleNum/HurtNum", HurtBattleNum);
        //FGUIManager.ins().bindScript("ui://battleNum/RealHurtNum", RealHurtBattleNum);
        //FGUIManager.ins().bindScript("ui://battleNum/CritNum", CirtBattleNum);
        //FGUIManager.ins().bindScript("ui://battleNum/NormalHurtNum", NormalHurtNum);
        //FGUIManager.ins().bindScript("ui://battleNum/CritRealHurtNum", CirtBattleNum);
        //FGUIManager.ins().bindScript("ui://battleNum/HealNum", HealNum);
        //FGUIManager.ins().bindScript("ui://battleNum/ShieldNum", ShieldBattleNum);
        //FGUIManager.ins().bindScript("ui://battleNum/MaterialNum", BattleNum);
        //FGUIManager.ins().bindScript("ui://comm/RebirthItem", RebirthItem);
        //FGUIManager.ins().bindScript("ui://battleNum/AttrUpNum", AttrUpNum);
        //FGUIManager.ins().bindScript("ui://battleNum/AbnormalDownNum", AbnormalDownNum);
        //FGUIManager.ins().bindScript("ui://battleRecord/BattleRecordItem", BattleRecordItem);
        //FGUIManager.ins().bindScript("ui://battleNum/OtherNum", OtherNum);

    }

    private onBattleStart(): void {
        G.UIManager.close(UICommonKey.TouchMaskWin)
        BattleManager.ins().openFightAi();
    }

    private resetPauseState(): void {
        this._isPuase = false
        this._pauseValue = 0
    }

    private onOtherViewOpen(uiKey: string): void {
        if (uiKey == UIMainKey.MAIN_PAGE)
            return;

        if (BattleManager.ins().battleLogic?.fightType == FightType.TRUNK_MAP && this.isActiveShowMapUI() == false) {
            //在主线界面打开主界面的界面后，暂停战斗逻辑
            this.setPauseByType(true, BattlePauseType.UI)
        }
    }

    private onOtherViewClose(): void {
        if (BattleManager.ins().battleLogic?.fightType == FightType.TRUNK_MAP && this.isActiveShowMapUI()) {
            //在主线界面打开主界面的界面后，暂停战斗逻辑
            this.setPauseByType(false, BattlePauseType.UI)
        }
    }

    /**展示地图的UI是否处于激活状态*/
    protected isActiveShowMapUI():boolean {
        let isActive:boolean = false
        let uis:string[] = this.showMapUIs()
        for (let i = 0; i < uis.length; i++) {
            if (UIManager.ins().isActive(uis[i])) {
                isActive = true
                break
            }
        }
        return isActive
    }

    /**需要展示地图的pageUI列表*/
    protected showMapUIs():string[] {
        return [
            UIMainKey.MAIN_PAGE,
            UIStimulationConfig.StimulationMainView,
        ]
    }

    private setPauseByType(isPuase: boolean, type: BattlePauseType): void {
        if (isPuase) {
            this._pauseValue |= type;
        } else if (this._pauseValue & type) {
            this._pauseValue -= type;
        }
        let isRealPuase: boolean = this._pauseValue > 0;
        if (this._isPuase != isRealPuase) {
            this._isPuase = isRealPuase;
            if (isRealPuase) {
                BattleManager.ins().pauseBattle();
                let value = this._pauseValue & BattlePauseType.UI
                this.hideOrShowMap(value <= 0);
            } else {
                BattleManager.ins().resumeBattle();
                this.hideOrShowMap(true);
                if (WorldController.ins().isExitBattle) {
                    WorldController.ins().isExitBattle = false;
                }
            }
            this.emit(NotificationKey.BATTLE_PAUSE_STATE_CHANGE)
        }
    }

    private hideOrShowMap(v: boolean): void {
        if (!v && WorldController.ins().isExitBattle) {//从其他玩法且到主场景时不隐藏地图
            return
        }
        
        let mapRoot = GIns.mapMgr.curMap.mapNode()
        mapRoot.active = v
    }
}

BattleController.ins().doInit();