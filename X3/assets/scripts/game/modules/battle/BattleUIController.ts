import {_decorator} from 'cc';
import {BaseController} from "db://assets/scripts/core/mvc/controller/BaseController";

const {ccclass, property} = _decorator;

/**
 * 战斗 UI
 */
export class BattleUIController extends BaseController {
    listenNotifications(): string[] {
        return [];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
        }
    }

    onInit(): void {
    }

}

BattleUIController.ins().doInit();


