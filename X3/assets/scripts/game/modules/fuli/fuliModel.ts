import { I18nManager } from "../../../core/i18n/I18nManager";
import { BaseModel } from "../../../core/mvc/model/BaseModel";
import { TableManager } from "../../../core/table/TableManager";
import { TimeManager } from "../../../core/time/TimeManager";
import { EnumUtils } from "../../../core/utils/EnumUtils";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import { ActivityModel } from "../../comm/activity/model/ActivityModel";
import { ConditionManager } from "../condition/ConditionManager";
import { ModuleOpenI18nKeys } from "../moduleopen/ModuleOpenI18nKeys";
import { WorldBossModel } from "../worldBoss/model/WorldBossModel";

export class FuliModel extends BaseModel {




    //获取满足条件的福利界面相关的活动配置列表
    public getFuliConfigList() {
        let cfgs = TableManager.getAllData(table.activity.ActivityConstant.ActivityClientConfig);
        let result: table.activity.ActivityConstant.ActivityClientConfig[] = cfgs.filter((cfg) => {
            //属于福利入口并且达到显示条件
            if (cfg.parentId == 9 && ConditionManager.ins().checkCondition(cfg.conditionText)) {
                //活动条件也要满足
                let isOpen = ActivityModel.ins().isActivityOpenById(cfg.typeParam);

                return isOpen;

            }

            return false;
        })
        return result;

    }

    //通过活动id获取世界boss活动配置
    public getWorldBossConfigById(id: number) {
        let cfgs = TableManager.getAllData(table.activity.WorldBoss.ActivityWorldbossConfig);
        let result = cfgs.find((cfg) => {
            if (cfg.active == id) {
                return true;
            }
            return false;
        })
        return result;
    }

    /**获取活动配置 */
    public getActiveConfigById(id: number) {
        let result = TableManager.getDataById(table.activity.ActivityConstant.ActivityConfig, id);

        return result;
    }


    canChallenge(bossId: number) {

        //功能解锁表
        const moduleName: string = EnumUtils.getEnumKeyNameByValue(ServerEnums.SystemType, ServerEnums.SystemType.WORLD_BOSS)
        let cfg = TableManager.getDataById(table.verify.PlayerSystemOpenConfig, moduleName);
        let openTips = ConditionManager.ins().getOpenConditionTips(cfg.conditions);
        if (openTips) {
            //未解锁

            return openTips;
        }

        let cfgs = WorldBossModel.ins().getWorldBossAllCfg();
        let _worldBossConfig = cfgs.find((cfg) => {
            return cfg.id == bossId;
        }
        );

        // //开服天数
        // let openDay = _worldBossConfig.openDay;
        // let nowDay = TimeManager.serverHaveOpenDay;
        // if (openDay > nowDay) {
        //     //未到开服天数

        //     let tips = I18nManager.ins().lang(ModuleOpenI18nKeys.SERVER_OPEN_DAYS, openDay);

        //     return tips;
        // }

        return "";



    }

    public getActiveOpenTime(id: number) {

    }

    



}