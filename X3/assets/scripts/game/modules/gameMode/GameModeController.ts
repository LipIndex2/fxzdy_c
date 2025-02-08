import {_decorator} from 'cc';
import G from "db://assets/scripts/core/comm/G";
import {BaseController} from "db://assets/scripts/core/mvc/controller/BaseController";
import {
    GameModeTabComp
} from "db://assets/scripts/game/modules/gameMode/components/GameModeTabComp";

const {ccclass, property} = _decorator;

/**
 * 游戏模式
 */
export class GameModeController extends BaseController {

    listenNotifications(): string[] {
        return [];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
        }
    }

    onInit(): void {
        G.FGUIManager.bindScript("ui://gameMode/GameModeTabComp", GameModeTabComp);

    }

}

GameModeController.ins().doInit();


