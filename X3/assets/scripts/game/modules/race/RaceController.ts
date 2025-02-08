import { _decorator } from 'cc';
import G from "db://assets/scripts/core/comm/G";
import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import { RaceLogoComp } from "db://assets/scripts/game/modules/race/components/RaceLogoComp";

const {ccclass, property} = _decorator;

/**
 * 种族
 */
export class RaceController extends BaseController {

    listenNotifications(): string[] {
        return [];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
        }
    }

    onInit(): void {
        // comm1
        G.FGUIManager.bindScript("ui://comm1/RaceLogoComp", RaceLogoComp);


    }

}

RaceController.ins().doInit();


