import { _decorator } from 'cc';
import G from "db://assets/scripts/core/comm/G";
import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import { TalentOneLvComp } from "db://assets/scripts/game/modules/talent/components/TalentOneLvComp";
import {
    TalentConfirmLvUpViewComp
} from "db://assets/scripts/game/modules/talent/components/TalentConfirmLvUpViewComp";
import NotificationKey from '../../event/NotificationKey';
import { UIManager } from '../../../core/mvc/UIManager';
import { UITalentKeys } from './UITalentKeys';

const { ccclass, property } = _decorator;

/**
 * 天赋
 */
export class TalentController extends BaseController {
    listenNotifications(): string[] {
        return [
            NotificationKey.FETTER_UNLOCK_NEW,
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.FETTER_UNLOCK_NEW: {
                UIManager.ins().open(UITalentKeys.TalentNewEffectTipsWin, args)
                break;
            }
        }
    }

    onInit(): void {

        G.FGUIManager.bindScript("ui://talent/TalentOneLvComp", TalentOneLvComp);
        G.FGUIManager.bindScript("ui://talent/TalentConfirmLvUpView", TalentConfirmLvUpViewComp);

    }

}

TalentController.ins().doInit();


