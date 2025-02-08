import { Constructor } from "cc";
import BaseSingleton from "db://assets/scripts/core/base/BaseSingleton";
import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { ConditionActivityIsOver } from "db://assets/scripts/game/modules/condition/impl/ConditionActivityIsOver";
import { ConditionActivityNotDone } from "db://assets/scripts/game/modules/condition/impl/ConditionActivityNotDone";
import { ConditionArenaRankGte } from "db://assets/scripts/game/modules/condition/impl/ConditionArenaRankGte";
import { ConditionUnlockBuilding } from "db://assets/scripts/game/modules/condition/impl/ConditionBuildingUnlock";
import { ConditionByOpenGVG } from "db://assets/scripts/game/modules/condition/impl/ConditionByOpenGVG";
import {
    ConditionDailyBossDifficultyGte
} from "db://assets/scripts/game/modules/condition/impl/ConditionDailyBossDifficultyGte";
import { ConditionHaveSeeMap } from "db://assets/scripts/game/modules/condition/impl/ConditionHaveSeeMap";
import { ConditionHeroStarGte } from "db://assets/scripts/game/modules/condition/impl/ConditionHeroStarGte";
import { ConditionIsLeagueJoin } from "db://assets/scripts/game/modules/condition/impl/ConditionIsLeagueJoin";
import { ConditionItemAmountGte } from "db://assets/scripts/game/modules/condition/impl/ConditionItemAmountGte";
import { ConditionPlayerGuidePass } from "db://assets/scripts/game/modules/condition/impl/ConditionPlayerGuidePass";
import {
    ConditionPlayerHangUpLevelIdPass
} from "db://assets/scripts/game/modules/condition/impl/ConditionPlayerHangUpLevelIdPass";
import { ConditionPlayerLevelGte } from "db://assets/scripts/game/modules/condition/impl/ConditionPlayerLevelGte";
import {
    ConditionPlayerTrunkTaskFinish
} from "db://assets/scripts/game/modules/condition/impl/ConditionPlayerTrunkTaskFinish";
import { ConditionRoleCreateDayGte } from "db://assets/scripts/game/modules/condition/impl/ConditionRoleCreateDayGte";
import { ConditionTrunkTaskComplete } from "db://assets/scripts/game/modules/condition/impl/ConditionTrunkTaskComplete";
import { ConditionUnlockTalent } from "db://assets/scripts/game/modules/condition/impl/ConditionUnlockTalent";
import { ConditionActivityHasAward } from "./impl/ConditionActivityHasAward";
import { ConditionActivityHasGoodsBuy } from "./impl/ConditionActivityHasGoodsBuy";
import { ConditionActivityPopToday } from "./impl/ConditionActivityPopToday";
import { ConditionActivityRushRankSettlePop } from "./impl/ConditionActivityRushRankSettlePop";
import { ConditionAssignHeroActiveSkin } from "./impl/ConditionAssignHeroActiveSkin";
import { ConditionAssignHeroStarGe } from "./impl/ConditionAssignHeroStarGe";
import { ConditionAssignMonthCardActivated } from "./impl/ConditionAssignMonthCardActivated";
import { ConditionAssignTaskComplete } from "./impl/ConditionAssignTaskComplete";
import { ConditionBuyGoodsNumById } from "./impl/ConditionBuyGoodsNumById";
import { ConditionBuyGoodsNumById2 } from "./impl/ConditionBuyGoodsNumById2";
import { ConditionCaptainSkillLevelGe } from "./impl/ConditionCaptainSkillLevelGe";
import { ConditionPassAssignSecretInstanceFloor } from "./impl/ConditionPassAssignSecretInstanceFloor";
import { ConditionPassGuardShipInstanceFloorGe } from "./impl/ConditionPassGuardShipInstanceFloorGe";
import { ConditionPassSecretInstanceFloorGe } from "./impl/ConditionPassSecretInstanceFloorGe";
import { ConditionRecentlyDailyChargeGe } from "./impl/ConditionRecentlyDailyChargeGe";
import { ConditionRecentlyDailyChargeLe } from "./impl/ConditionRecentlyDailyChargeLe";
import { ConditionSeasonActivity } from "./impl/ConditionSeasonActivity";
import { ConditionStimulationAssignDeviceLevelGe } from "./impl/ConditionStimulationAssignDeviceLevelGe";
import { ConditionSystemOpenDayGe } from "./impl/ConditionSystemOpenDayGe";
import { ConditionSystemOpenHourGe } from "./impl/ConditionSystemOpenHourGe";
import { ConditionTalentActivity } from "./impl/ConditionTalentActivity";
import { ConditionTeamInstance } from "./impl/ConditionTeamInstance";
import { ConditionUnderTrunkInstance } from "./impl/ConditionUnderTrunkInstance";
import { ConditionVipLevelGte } from "./impl/ConditionVipLevelGte";

export class ConditionFactory extends BaseSingleton {
    /**
     * 编写所有条件 class
     * TODO 新增条件后, 添加到这里
     */
    getMyConditionClassArray(): Constructor<ICondition>[] {
        return [
            // 前端
            ConditionActivityIsOver,
            ConditionActivityNotDone,
            ConditionPassGuardShipInstanceFloorGe,
            ConditionByOpenGVG,
            ConditionSeasonActivity,

            // 后端
            ConditionIsLeagueJoin,
            ConditionPlayerLevelGte,
            ConditionPlayerTrunkTaskFinish,
            ConditionPlayerHangUpLevelIdPass,
            ConditionPlayerGuidePass,
            ConditionUnlockBuilding,
            ConditionHeroStarGte,
            ConditionArenaRankGte,
            ConditionHaveSeeMap,
            ConditionRoleCreateDayGte,
            ConditionDailyBossDifficultyGte,
            ConditionTrunkTaskComplete,
            ConditionVipLevelGte,
            ConditionUnlockTalent,
            ConditionAssignHeroStarGe,
            ConditionRecentlyDailyChargeGe,
            ConditionRecentlyDailyChargeLe,
            ConditionAssignMonthCardActivated,
            ConditionPassSecretInstanceFloorGe,
            ConditionPassAssignSecretInstanceFloor,
            ConditionAssignHeroActiveSkin,
            ConditionBuyGoodsNumById,
            ConditionBuyGoodsNumById2,
            ConditionTalentActivity,
            ConditionSystemOpenDayGe,
            ConditionStimulationAssignDeviceLevelGe,
            ConditionTeamInstance,
            ConditionItemAmountGte,
            ConditionSystemOpenHourGe,
            ConditionActivityHasGoodsBuy,
            ConditionAssignTaskComplete,
            ConditionActivityHasAward,
            ConditionCaptainSkillLevelGe,
            ConditionUnderTrunkInstance,
            ConditionActivityRushRankSettlePop,
            ConditionActivityPopToday,
        ];
    }
}
