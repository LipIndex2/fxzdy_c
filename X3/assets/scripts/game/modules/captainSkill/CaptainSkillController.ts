import { _decorator } from 'cc';
import G from "db://assets/scripts/core/comm/G";
import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import {
    CaptainSkillDescPanelComp
} from "db://assets/scripts/game/modules/captainSkill/components/CaptainSkillDescPanelComp";
import {
    CaptainSkillContentComp
} from "db://assets/scripts/game/modules/captainSkill/components/CaptainSkillContentComp";
import NotificationKey from '../../event/NotificationKey';

const {ccclass, property} = _decorator;

/**
 * FGUI 通用组件
 * 绑定 comm/ 包下的
 */
export class CaptainSkillController extends BaseController {
    listenNotifications(): string[] {
        return [
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
        }
    }

    onInit(): void {

        // 战队技能描述面板
        G.FGUIManager.bindScript("ui://captainSkill/CaptainSkillDescPanelComp", CaptainSkillDescPanelComp);
        G.FGUIManager.bindScript("ui://captainSkill/CaptainSkillContentComp", CaptainSkillContentComp);
    }

}

CaptainSkillController.ins().doInit();


