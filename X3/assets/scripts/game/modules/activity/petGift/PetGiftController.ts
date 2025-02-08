import { BaseController } from "../../../../core/mvc/controller/BaseController";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { ActivityModel } from "../../../comm/activity/model/ActivityModel";
import { ActivityPetGiftVo } from "../model/ActivityPetGiftVo";

export class PetGiftController extends BaseController {
    private _activityId: number

    listenNotifications(): string[] {
        return [
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
        }
    }

    isBtnUnlock(){       
        const vo: ActivityPetGiftVo = ActivityModel.ins().getActivityVoByType(ServerEnums.ActivityType.PET_GIFT) as ActivityPetGiftVo;
        if (!vo || vo.isFinishBuy(vo.activityId)) {
            return false;
        }
        return true
    }
 
}