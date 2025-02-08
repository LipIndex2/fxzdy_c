import { UIManager } from "../../../core/mvc/UIManager";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import NotificationKey from "../../event/NotificationKey";
import { UIResurgenceConfig } from "./const/UIResurgenceConfig";
import { ResurgenceViewOpenArgs } from "db://assets/scripts/game/ui/resurgence/structs/ResurgenceViewOpenArgs";


export class ResurgenceController extends BaseController {

    listenNotifications(): string[] {
        return [
            NotificationKey.TEAM_DIE,
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.TEAM_DIE:
                this.openResurgenceView(args);
                break;
        }
    }

    /** 团灭界面 */
    private openResurgenceView(fightType:ServerEnums.FightType) {
        if(fightType == ServerEnums.FightType.SECRET_INSTANCE ||
            fightType == ServerEnums.FightType.SEASON_SECRET
        ) return;
        UIManager.ins().open(UIResurgenceConfig.ResurgenceView, {
            fightType: fightType
        } as ResurgenceViewOpenArgs);
    }

}
ResurgenceController.ins().doInit();