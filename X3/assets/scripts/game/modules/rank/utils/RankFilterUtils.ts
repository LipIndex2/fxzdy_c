import { EnumRankGroupType } from "db://assets/scripts/game/modules/rank/enums/EnumRankGroupType";

export class RankFilterUtils {

    /**
     * 不可以看到
     * @param groupType 分组
     */
    static isNotCanSee(groupType: string) {
        return groupType === EnumRankGroupType.JJC
            || groupType === EnumRankGroupType.DAILY_BOSS
            ;
    }
}