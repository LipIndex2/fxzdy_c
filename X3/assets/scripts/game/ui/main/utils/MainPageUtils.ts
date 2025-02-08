import G from "db://assets/scripts/core/comm/G";
import { ConditionManager } from "db://assets/scripts/game/modules/condition/ConditionManager";
import { EnumTabSideType } from "db://assets/scripts/game/ui/main/const/EnumTabSideType";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { ActivityModel } from "../../../comm/activity/model/ActivityModel";
import GIns from "../../../GIns";
import { MainPageManager } from "../MainPageManager";

export class MainPageUtils {
    static _allTabCfgs:table.mainpage.MainPageTabItemConfig[] = [];
    static _tabCfgsSideMap:Map<string, table.mainpage.MainPageTabItemConfig[]> = new Map();

    /**初始化*/
    static initTabListForSide():void {
        if (this._allTabCfgs.length <= 0) {
            let allCfgs = G.TableManager.getAllData(table.mainpage.MainPageTabItemConfig);
            if (allCfgs) {
                this._allTabCfgs = allCfgs.concat();
                this._allTabCfgs.sort((a, b) => {
                    return a.sort - b.sort;
                });

                this._allTabCfgs.forEach((cfg) => {
                    let arr = null;
                    if (this._tabCfgsSideMap.has(cfg.sideType)) {
                        arr  = this._tabCfgsSideMap.get(cfg.sideType);
                    } else {
                        arr = [];
                        this._tabCfgsSideMap.set(cfg.sideType, arr);
                    }
                    arr.push(cfg);
                })
            }
        }
    }

    /**根据类型获取配置列表*/
    static getAllCfgsBySideType(sideType:string):table.mainpage.MainPageTabItemConfig[] {
        if (this._tabCfgsSideMap.has(sideType)) {
            return this._tabCfgsSideMap.get(sideType);
        }
        return [];
    }
    /**
     * 获取某一边的 tab item 配置
     * @param sideType
     */
    static getTabItemConfigArrayBySideType(sideType: EnumTabSideType): table.mainpage.MainPageTabItemConfig[] {
        this.initTabListForSide();
        let cfgs: table.mainpage.MainPageTabItemConfig[] = [];
        let allCfg = this.getAllCfgsBySideType(sideType);
        for (let cfg of allCfg) {
            if (cfg && cfg.sideType == sideType) {
                if (ServerEnums.ActivityType[cfg.nameForClient]) {
                    //有开启的活动时才显示按钮
                    let activityId = 0;
                    if (cfg.activityIds && cfg.activityIds.length > 0) {
                        for (let id of cfg.activityIds) {
                            if (ActivityModel.ins().getActivityVoById(id)) {
                                activityId = id;
                                break;
                            }
                        }
                    } else {
                        activityId = ActivityModel.ins().getActivityIdByType(ServerEnums.ActivityType[cfg.nameForClient]);
                    }
                    let activityVo = ActivityModel.ins().getActivityVoById(activityId); //各自模块Vo 继承BaseActivityVo， 判断是否显示入口
                    if (activityId > 0 && ConditionManager.ins().checkCondition(cfg.conditionText) && activityVo.isShowEntrance()) {
                        cfgs.push(cfg);
                    }
                } else {
                    //功能只需要判断是否开启
                    if (ConditionManager.ins().checkCondition(cfg.conditionText)) {
                        if (cfg.nameForClient == "entrance") {
                            //综合活动入口，有活动开启时才显示
                            let isShow = false;
                            isShow = MainPageManager.ins().isEntranceActivityOpen(cfg.id);

                            if (isShow) {
                                cfgs.push(cfg);
                            }
                        } else {
                            cfgs.push(cfg);
                        }
                    }
                }
            }
        }

        return cfgs;
    }

    /**
     * 只获取一个
     * @param sideType
     */
    static getOnlyOneTabItemConfigBySideType(sideType: EnumTabSideType): table.mainpage.MainPageTabItemConfig {
        return G.TableManager.getAllData(table.mainpage.MainPageTabItemConfig)
            .toDataStream()
            .filter((it) => it.sideType == sideType)
            .first(null);
    }

    static getBackHomeConfig(): table.mainpage.MainPageTabItemConfig | null {
        return G.TableManager.getAllData(table.mainpage.MainPageTabItemConfig)
            .toDataStream()
            .filter((it) => it.nameForClient.toLowerCase() == "backhome")
            .first(null);
    }

    static getDefaultAnimName(): string {
        return G.TableManager.getDataById(table.mainpage.MainPageKvConfig, "mainpage:spine:defaultAnimName")?.value || "";
    }

    static getRandomPlayNextSecond(): number {
        const newVar = G.TableManager.getDataById(table.mainpage.MainPageKvConfig, "mainpage:spine:randomPlayNextSecond")?.value || "";
        return newVar.toInt();
    }

    static getSpineHangUpRandomAnimName(): string | null {
        const csv = G.TableManager.getDataById(table.mainpage.MainPageKvConfig, "mainpage:spine:randomAnimNameCsv")?.value || "";
        const animNames = csv.split(",");
        if (animNames == null || animNames.length == 0) {
            return null;
        }
        return animNames[Math.floor(Math.random() * animNames.length)];
    }

    /** 获取已开启的轮播活动组 */
    static getOpenedBannerActivityGroup() {
        let openActivityCfgs: table.activity.ActivityConstant.ActivityClientConfig[] = [];
        let allCfg = G.TableManager.getAllData(table.activity.ActivityConstant.ActivityClientConfig);
        for (let cfg of allCfg) {
            if (cfg && cfg.type == "3" && GIns.conditionMgr.checkCondition(cfg.conditionText)) {
                if (cfg.typeParam && !cfg.parentId && !cfg.UIView) {
                    //功能
                    openActivityCfgs.push(cfg);
                } else {
                    //活动
                    let activityVo = ActivityModel.ins().getActivityVoById(cfg.typeParam);
                    if (activityVo && !activityVo.isDone() && !activityVo.isActivityOver()) openActivityCfgs.push(cfg);
                }
            }
        }

        openActivityCfgs.sort((a, b) => {
            return a.order - b.order;
        });

        return openActivityCfgs;
    }
}
