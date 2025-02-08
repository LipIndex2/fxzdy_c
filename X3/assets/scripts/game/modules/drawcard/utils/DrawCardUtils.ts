import G from "db://assets/scripts/core/comm/G";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { MapUtils } from "db://assets/scripts/core/utils/MapUtils";
import { EnumDrawCardTabType } from "db://assets/scripts/game/modules/drawcard/enums/EnumDrawCardTabType";

export class DrawCardUtils {

    /**
     * 普通卡池id
     */
    public static readonly NORMAL_DRAW_CARD_POOL_ID = 1;

    // 达到此次数时，开启批量开启宝箱功能
    private static readonly KEY_OPEN_DRAW_CARD_BATCH = "RECRUIT:BATCH_OPEN_NEED_TIMES";
    // 英雄大小缩放
    private static readonly KEY_SHOW_HERO_SCALE = "RECRUIT:showHeroScale";

    private static readonly typeToProgressMaxCountMap = new Map<ServerEnums.RecruitType, number>();

    /**
     * 显示英雄大小缩放
     */
    static getShowHeroScale(): number {
        return G.TableManager.getDataById(table.recruit.RecruitConstantConfig, DrawCardUtils.KEY_SHOW_HERO_SCALE).content.toInt()
    }

    /**
     * 开启批量抽卡, 需要抽了多少次才开启
     */
    static getOpenDrawCardBatchNeedTimes(): number {
        return G.TableManager.getDataById(table.recruit.RecruitConstantConfig, DrawCardUtils.KEY_OPEN_DRAW_CARD_BATCH).content.toInt()
    }


    /**
     * 获取进度最大值
     * @param type
     */
    static getProgressMaxCount(type: ServerEnums.RecruitType) {
        return MapUtils.getOrCreate(this.typeToProgressMaxCountMap, type, () => {
            return G.TableManager.getAllData(table.recruit.NormalRecruitProgressConfig)
                .toDataStream()
                .map(it => it.id)
                .maxByWeightNumber(it => it, 0)
        });
    }

    /**
     * 新英雄 title spine path
     */
    static getNewHeroTitleSpinePath() {
        return G.TableManager.getDataById(table.recruit.RecruitConstantConfig, "RECRUIT:newHeroTitleSpinePath").content;
    }

    /**
     * 获取 tab
     * @param type
     */
    static getTabIndexByType(type: ServerEnums.RecruitType): EnumDrawCardTabType {
        if (type == ServerEnums.RecruitType.NORMAL) {
            return EnumDrawCardTabType.NORMAL;
        }
        if (type == ServerEnums.RecruitType.SPECIAL) {
            return EnumDrawCardTabType.SPECIAL_HERO;
        }

        if (type == ServerEnums.RecruitType.AWAKE_WEAPON_NORMAL
            || type == ServerEnums.RecruitType.AWAKE_WEAPON_SPECIAL
        ) {
            return EnumDrawCardTabType.WEAPON;
        }

        return EnumDrawCardTabType.NORMAL;
    }
}