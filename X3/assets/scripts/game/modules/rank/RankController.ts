import { _decorator } from 'cc';
import G from "db://assets/scripts/core/comm/G";
import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import { RankOneRowComp } from "db://assets/scripts/game/modules/rank/components/RankOneRowComp";
import { RankTop3Comp } from "db://assets/scripts/game/modules/rank/components/RankTop3Comp";
import { RankFooterItemComp } from "db://assets/scripts/game/modules/rank/components/RankFooterItemComp";
import { RankForMeComp } from "db://assets/scripts/game/modules/rank/components/RankForMeComp";

const {ccclass, property} = _decorator;

/**
 * 邮件控制器
 */
export class RankController extends BaseController {

    listenNotifications(): string[] {
        return [];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
        }
    }

    onInit(): void {
        // common
        G.FGUIManager.bindScript("ui://comm/RankTop3Comp", RankTop3Comp);
        
        
        // rank
        G.FGUIManager.bindScript("ui://rank/RankForMeComp", RankForMeComp);
        G.FGUIManager.bindScript("ui://rank/RankOneRowComp", RankOneRowComp);
        G.FGUIManager.bindScript("ui://rank/RankFooterItemComp", RankFooterItemComp);

    }

}

RankController.ins().doInit();


