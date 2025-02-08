import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { EnumTabItemNameForClient } from "../../../ui/main/const/EnumTabItemNameForClient";

export interface IActivityEnterCfg {
    mainCfg: table.mainpage.MainPageTabItemConfig,
    clientCfg: table.activity.ActivityConstant.ActivityClientConfig
}

export class ActivityConfigManager {

    static _enterCfgMap: Map<number, IActivityEnterCfg> = new Map()
    private static _aidToScoreItemIdMap: Map<number, number> = new Map();

    static init() {

        this._aidToScoreItemIdMap = new Map();
        const scoreItemIdsStr = TableManager.getDataById(table.activity.ActivityConstant.ActivityConstantConfig, "ACTIVITY:LOTTERY_SCORE_ITEM_IDS")?.content || "{}"
        const activityIdStrToScoreItemIdObj = JSON.parse(scoreItemIdsStr);
        for (let activityIdStr in activityIdStrToScoreItemIdObj) {
            const scoreItemId = activityIdStrToScoreItemIdObj[activityIdStr];
            this._aidToScoreItemIdMap.set(activityIdStr.toInt(), scoreItemId);
        }
    }

    static getConfigById(activityId: number): table.activity.ActivityConstant.ActivityConfig {
        return TableManager.getDataById(table.activity.ActivityConstant.ActivityConfig, activityId)
    }

    /**获取活动入口配置信息*/
    static getEnterCfg(activityId: number): IActivityEnterCfg {
        if (this._enterCfgMap.has(activityId)) {
            return this._enterCfgMap.get(activityId)
        }
        let activityCfg = TableManager.getDataById(table.activity.ActivityConstant.ActivityConfig, activityId)
        if (activityCfg == null) {
            return null
        }
        let activityType = ServerEnums.ActivityType[activityCfg.type]
        let mainTabCfgs = TableManager.getAllData(table.mainpage.MainPageTabItemConfig)
        //入口配置
        let mainCfg: table.mainpage.MainPageTabItemConfig = null
        let clientAllCfgs = TableManager.getAllData(table.activity.ActivityConstant.ActivityClientConfig)
        let clientCfg = clientAllCfgs.find((value) => value.typeParam == activityId && value.parentId);
        if (clientCfg && clientCfg.parentId) {
            //配置存在
            mainCfg = mainTabCfgs.find((value) => value.viewArge == clientCfg.parentId + '')
            return {mainCfg: mainCfg, clientCfg: clientCfg}
        } else {
            //其他单独活动
            if (activityType == ServerEnums.ActivityType.FIRST_CHARGE) {
                //首充
                mainCfg = mainTabCfgs.find((value) => value.nameForClient == EnumTabItemNameForClient.FIRST_CHARGE)
            } else if (activityType == ServerEnums.ActivityType.SIGN) {
                //七日登录
                mainCfg = mainTabCfgs.find((value) => value.nameForClient == EnumTabItemNameForClient.SIGN && value.activityIds[0] == activityId)
            } else if (activityType == ServerEnums.ActivityType.BATTLE_PASS) {
                //星际通行证
                mainCfg = mainTabCfgs.find((value) => value.nameForClient == EnumTabItemNameForClient.BATTLE_PASS)
            } else if (activityType == ServerEnums.ActivityType.PET_GIFT) {
                //星灵活动
                mainCfg = mainTabCfgs.find((value) => value.nameForClient == EnumTabItemNameForClient.PET_GIFT)
            } else if (activityType == ServerEnums.ActivityType.DIAMOND_BANK) {
                //星钻银行
                mainCfg = mainTabCfgs.find((value) => value.nameForClient == EnumTabItemNameForClient.DIAMOND_BANK)
            }
            let enterCfg = {mainCfg: mainCfg, clientCfg: clientCfg}
            this._enterCfgMap.set(activityId, enterCfg)
            return enterCfg
        }
    }

    static getScoreItemIdByActivityId(activityId: number) {
        return this._aidToScoreItemIdMap.get(activityId);
    }
}