import { BaseController } from "../../../../core/mvc/controller/BaseController";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import ArrayUtils from "../../../../core/utils/ArrayUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import { DrawCardResultViewOpenArgs } from "../../drawcard/view/DrawCardResultView";
import { ItemUtils } from "../../item/utils/ItemUtils";

export class LimitTimeCareerDrawController extends BaseController {
    listenNotifications(): string[] {
        return [NotificationKey.ACTIVITY_UPDATE, NotificationKey.ACTIVITY_UPDATE + "_RECRUIT"];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ACTIVITY_UPDATE:
                break;
            case NotificationKey.ACTIVITY_UPDATE + "_RECRUIT":
                this.showAward(args);
                break;
            default:
                break;
        }
    }

    private showAward(arge: any) {
        // let data = arge.addition as Vo.activity.CareerRecruitResultVo;

        // 抽取结果要接入【抽卡结果展示】
        const rewardResults = arge.rewards;
        // 后端会一发抽多个道具, 但实际配置中不会
        // const finalRewards = ItemUtils.combineObject1s(rewardResults);
        // const finalRewards = this.combineObject1s(rewardResults);
        // .toDataStream()
        // .flatMap((it) => it)
        // .toArray();

        if (ArrayUtils.isNotEmpty(rewardResults)) {
            // 获得道具, 不弹出
            // FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, finalRewards as Vo.reward.RewardResult[]);

            // 抽卡获得结果展示 UI
            const openArgs = DrawCardResultViewOpenArgs.create(ServerEnums.RecruitType.ACTIVITY_RECRUIT, rewardResults, rewardResults.length);
            FacadeManager.ins().emit(NotificationKey.DRAW_CARD_GAIN_ITEMS, openArgs);
        }
    }

    //合并奖励道具数组
    private combineObject1s(rewards: Vo.reward.RewardResult[]): Vo.reward.RewardResult[] {
        let finalRewards: Vo.reward.RewardResult[] = [];

        for (let reward of rewards) {
            if (reward) {
                let isAdd = false;
                for (let item of finalRewards) {
                    if (item && reward.baseId == item.baseId) {
                        item.amount += reward.amount;
                        isAdd = true;
                    }
                }
                if (!isAdd) {
                    finalRewards.push(reward);
                }
            }
        }

        return finalRewards;
    }
}
LimitTimeCareerDrawController.ins().doInit();
