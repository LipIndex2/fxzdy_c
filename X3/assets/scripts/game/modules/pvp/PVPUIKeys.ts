import { UIBindingKey } from "db://assets/scripts/core/mvc/ui/UIBindingKey";
import { PVPMainView } from "db://assets/scripts/game/modules/pvp/view/PVPMainView";
import { PVPBattleResultView } from "./view/PVPBattleResultView";
import { PVPChooseOppoView } from "./view/PVPChooseOppoView";
import { PVPDefendView } from "./view/PVPDefendView";
import { PVPRankLvUpView } from "./view/PVPRankLvUpView";
import { PVPRankRewardView } from "./view/PVPRankRewardView";
import { PVPRecordView } from "./view/PVPRecordView";

/**
 * 竞技场
 */
export class PVPUIKeys {

    /**
     * 竞技场主界面
     */
    static readonly PVPMainView = UIBindingKey.create("PVPMainView", PVPMainView);
    /**
     * 竞技场挑战界面
     */
    static readonly PVPChooseOppoView = UIBindingKey.create("PVPChooseOppoView", PVPChooseOppoView);
    /**
     * JJC 记录
     */
    static readonly PVPRecordView = UIBindingKey.create("PVPRecordView", PVPRecordView);
    /**
     * JJC 升段位
     */
    static readonly PVPRankLvUpView = UIBindingKey.create("PVPRankLvUpView", PVPRankLvUpView);
    /**
     * JJC 防守界面
     */
    static readonly PVPDefendView = UIBindingKey.create("PVPDefendView", PVPDefendView);
    /**
     * JJC 战斗结果 + 排位结算
     */
    static readonly PVPBattleResultView = UIBindingKey.create("PVPBattleResultView", PVPBattleResultView);
    /**
     * JJC 奖励面板
     */
    static readonly PVPRankRewardView = UIBindingKey.create("PVPRankRewardView", PVPRankRewardView);
}