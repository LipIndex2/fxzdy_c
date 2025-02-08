import { UIBindingKey } from "../../../core/mvc/ui/UIBindingKey";
import { BattleStartView } from "./view/BattleStartView";
import { CommonChallengeView } from "db://assets/scripts/game/modules/common/battle/CommonChallengeView";

/**
 * UI 战斗相关
 */
export class UIBattleKeys {

    /**
     * 战斗开始
     */
    static readonly BattleStartView = UIBindingKey.create("BattleStartView", BattleStartView)
    /**
     * 战斗统计
     */
    static readonly BattleRecordView = "BattleRecordView"

    /**
     * 挑战确认
     */
    static readonly CommonChallengeView = UIBindingKey.create("CommonChallengeView", CommonChallengeView)

}