import { BaseActivityVo } from "db://assets/scripts/game/comm/activity/model/BaseActivityVo";
import { ActivityGrowthPathVo } from "db://assets/scripts/game/modules/activity/model/ActivityGrowUpVo";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { ActivityDisplayVo } from "../../../modules/activity/model/ActivityDisplayVo";
import { ActivityFirstChargeVo } from "../../../modules/activity/model/ActivityFirstChargeVo";
import { ActivitySignInVo } from "../../../modules/activity/model/ActivitySignInVo";
import { ActivityTotalChargeDayVo } from "../../../modules/activity/model/ActivityTotalChargeDayVo";
import { ActivityTotalChargeVo } from "../../../modules/activity/model/ActivityTotalChargeVo";
import { ActivityBattlePassVo } from "../../../modules/activity/model/ActivityBattlePassVo";
import { ActivityFundVo } from "../../../modules/activity/model/ActivityFundVo";
import { ActivityGirlGroupVo } from "../../../modules/activity/model/ActivityGirlGroupVo";
import { ActivityDiamondBankVo } from "../../../modules/activity/model/ActivityDiamondBankVo";
import { ActivitySevenDayTaskModelVo } from "db://assets/scripts/game/modules/activity/model/ActivitySevenDayTaskModelVo";
import { ActivityRushRankVo } from "../../../modules/activity/model/ActivityRushRankVo";
import { ActivityReachStandardVo } from "../../../modules/activity/model/ActivityReachStandardVo";
import { ActivityHeroSupplyModelVo } from "db://assets/scripts/game/modules/activity/model/ActivityHeroSupplyModelVo";
import { ActivityPetGiftVo } from "../../../modules/activity/model/ActivityPetGiftVo";
import { ActivityDoubleWeekVo } from "../../../modules/activity/model/ActivityDoubleWeekVo";
import { ActivityMallModelVo } from "db://assets/scripts/game/modules/activity/model/ActivityMallModelVo";
import { ActivityFlipCardModelVo } from "db://assets/scripts/game/modules/activity/model/ActivityFlipCardModelVo";
import { ActivityCareerTrialsVo } from "../../../modules/activity/model/ActivityCareerTrialsVo";
import { ActivityLimitTimeCareerDrawVo } from "../../../modules/activity/model/ActivityLimitTimeCareerDrawVo";
import { ActivityRouletteLotteryVo } from "../../../modules/activity/model/ActivityRouletteLotteryVo";
import { ActivitySummonHeroVo } from "../../../modules/activity/model/ActivitySummonHeroVo";
import { DebugUtils } from "db://assets/scripts/core/utils/DebugUtils";

/**
 * 活动工厂类
 * 新类型活动vo在这统一按类型创建
 */
export class ActivityFactory {
    /**创建活动vo
     * @param type 前端定义的活动类型
     * @param vo 活动下发的基础vo
     */
    public static creatActivityVo(type: ServerEnums.ActivityType, vo: any): any {
        let temp: BaseActivityVo | null = null;
        let ActivityType = ServerEnums.ActivityType;
        switch (type) {
            case ActivityType.LOTTERY:
                temp = new ActivityFlipCardModelVo(vo);
                break;
            case ActivityType.ACTIVITY_MALL:
                temp = new ActivityMallModelVo(vo);
                break;
            case ActivityType.GROW_UP:
                temp = new ActivityGrowthPathVo(vo);

                break;
            case ActivityType.FIRST_CHARGE:
                temp = new ActivityFirstChargeVo(vo);
                break;
            case ActivityType.SIGN:
                temp = new ActivitySignInVo(vo);
                break;
            case ActivityType.HERO_SUPPLY:
                temp = new ActivityHeroSupplyModelVo(vo);
                break;

            case ActivityType.CARNIVAL:
                temp = new ActivitySevenDayTaskModelVo(vo);
                break;

            case ActivityType.DISPLAY:
                temp = new ActivityDisplayVo(vo);
                break;
            case ActivityType.BATTLE_PASS:
                temp = new ActivityBattlePassVo(vo);
                break;
            case ActivityType.RUSH_RANK:
                temp = new ActivityRushRankVo(vo);
                break;
            case ActivityType.TOTAL_CHARGE:
                temp = new ActivityTotalChargeVo(vo);
                break;
            case ActivityType.TOTAL_CHARGE_DAY:
                temp = new ActivityTotalChargeDayVo(vo);
                break;
            case ActivityType.FUND:
                temp = new ActivityFundVo(vo);
                break;
            case ServerEnums.ActivityType.GIRL_GROUP:
                temp = new ActivityGirlGroupVo(vo);
                break;
            case ActivityType.DIAMOND_BANK:
                temp = new ActivityDiamondBankVo(vo);
                break;
            case ActivityType.REACH_STANDARD:
                temp = new ActivityReachStandardVo(vo);
                break;
            case ActivityType.PET_GIFT:
                temp = new ActivityPetGiftVo(vo);
                break;
            case ActivityType.DOUBLE_WEEKLY:
                temp = new ActivityDoubleWeekVo(vo);
                break;
            case ActivityType.CAREER_TRIAL:
                temp = new ActivityCareerTrialsVo(vo);
                break;
            case ActivityType.CAREER_RECRUIT:
                temp = new ActivityLimitTimeCareerDrawVo(vo);
                break;
            case ActivityType.ROULETTE_LOTTERY:
                temp = new ActivityRouletteLotteryVo(vo);
                break;
            case ActivityType.CALL_HERO:
                temp = new ActivitySummonHeroVo(vo);
                break;
            default:
                DebugUtils.isDebugMode() && console.log("活动类型为", type, "的活动vo无实例可以创建，请检查");
                break;
        }

        temp?.onInitDone();

        return temp;
    }
}
