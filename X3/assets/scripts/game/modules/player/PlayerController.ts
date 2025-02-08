import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import G from "db://assets/scripts/core/comm/G";
import {
    PlayerInfoOneHeroSlotComp
} from "db://assets/scripts/game/modules/player/components/PlayerInfoOneHeroSlotComp";


export class PlayerController extends BaseController {

    listenNotifications(): string[] {
        return [];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
        }
    }

    constructor() {
        super();
    }

    onInit(): void {

        G.FGUIManager.bindScript("ui://playerInfo/PlayerInfoOneHeroSlotComp", PlayerInfoOneHeroSlotComp);
    }

}

PlayerController.ins().doInit();