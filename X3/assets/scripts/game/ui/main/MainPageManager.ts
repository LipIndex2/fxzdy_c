import BaseSingleton from "db://assets/scripts/core/base/BaseSingleton";
import G from "db://assets/scripts/core/comm/G";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { ActivityGrowthPathVo } from "db://assets/scripts/game/modules/activity/model/ActivityGrowUpVo";
import { UIBackpackKeys } from "db://assets/scripts/game/modules/backpack/const/UIBackpackKeys";
import { DrawCardUIKeys } from "db://assets/scripts/game/modules/drawcard/DrawCardUIKeys";
import { UIEmailKeys } from "db://assets/scripts/game/modules/email/const/UIEmailKeys";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { UIGameModeKeys } from "db://assets/scripts/game/modules/gameMode/UIGameModeKeys";
import { GrowthPathUIKeys } from "db://assets/scripts/game/modules/growthpath/GrowthPathUIKeys";
import { UIHeroKey } from "db://assets/scripts/game/modules/hero/const/UIHeroConfig";
import { ModuleOpenManager } from "db://assets/scripts/game/modules/moduleopen/ModuleOpenManager";
import { RankUIKeys } from "db://assets/scripts/game/modules/rank/RankUIKeys";
import { RankMainViewOpenArgs } from "db://assets/scripts/game/modules/rank/view/RankMainView";
import { UITaskKeys } from "db://assets/scripts/game/modules/task/UITaskKeys";
import { EnumTabItemNameForClient } from "db://assets/scripts/game/ui/main/const/EnumTabItemNameForClient";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { Logger } from "../../../core/log/Logger";
import { TableManager } from "../../../core/table/TableManager";
import { ActivityModel } from "../../comm/activity/model/ActivityModel";
import { UIActivityKey } from "../../modules/activity/const/UIActivityConfig";
import { ChargeController } from "../../modules/charge/ChargeController";
import { ConditionManager } from "../../modules/condition/ConditionManager";
import { UIFriendConfig } from "../../modules/friend/const/UIFriendConfig";
import { UIFuilKey } from "../../modules/fuli/const/fuliConst";
import { ShopModel } from "../../modules/shop/model/ShopModel";
import { EnumTabSideType } from "./const/EnumTabSideType";
import { LimitPackController } from "../../modules/limitPack/LimitPackController";
import { SystemSettingUIKeys } from "db://assets/scripts/game/modules/systemsetting/SystemSettingUIKeys";
import { UINoticeKey } from "../../../main/modules/notice/const/UINoticeConfig";
import { SeasonUIKeys } from "../../modules/season/SeasonUIKeys";
import { SeasonManager } from "../../modules/season/SeasonManager";
import { ActivityState } from "../../modules/season/EnumSeason";

export class MainPageManager extends BaseSingleton {
    clickTabItemByName(config: table.mainpage.MainPageTabItemConfig):boolean {
        //判断功能解锁
        if (config.systemId) {
            let id = ServerEnums.SystemType[config.systemId];
            if (id) {
                let unLock = ModuleOpenManager.ins().isCanOpenModule(id, false);
                if (!unLock) {
                    //未解锁
                    let lockDesc = ModuleOpenManager.ins().getModuleLockTips(id);
                    if (lockDesc) {
                        FloatingTextManager.ins().showTips(lockDesc);
                    } else {
                        Logger.error(id + "功能未解锁");
                    }
                    return false;
                }
            }
        }

        //配置表中有配置页面，直接打开
        if (config.viewName) {
            if (config.activityIds) {
                for (let id of config.activityIds) {
                    //判断活动是否开启
                    let vo = ActivityModel.ins().getActivityVoById(id);
                    if (vo && vo.isShowEntrance()) {
                        G.UIManager.open(config.viewName, id);
                        return true;
                    }
                }
            } else {
                switch (config.nameForClient) {
                    case "entrance":
                    case "openCharge":
                        //通用活动合集入口
                        let data = {
                            id: config.id,
                            pageIndex: 0,
                        };

                        G.UIManager.open(config.viewName, data);
                        break;

                    default:
                        G.UIManager.open(config.viewName);
                        break;
                }
            }
            return true;
        }

        let nameForClient = config.nameForClient;

        switch (nameForClient) {
            /****************************  功能  ******************************/
            case EnumTabItemNameForClient.settings:
                G.UIManager.open(SystemSettingUIKeys.SystemSettingBaseView);
                break;
            case EnumTabItemNameForClient.BACKPACK:
                G.UIManager.open(UIBackpackKeys.BACKPACK_VIEW);
                break;
            case EnumTabItemNameForClient.EMAIL:
                G.UIManager.open(UIEmailKeys.UI_EMAIL_BOX_KEY);
                break;
            case EnumTabItemNameForClient.NOTICE:
                G.UIManager.open(UINoticeKey.NoticeWin);
                break;
            case EnumTabItemNameForClient.TASK:
                G.UIManager.open(UITaskKeys.TaskView);
                break;
            case EnumTabItemNameForClient.RANK:
                G.UIManager.open(RankUIKeys.RankMainView, RankMainViewOpenArgs.create(ServerEnums.RankingType.PLAYER_FIGHT));
                break;
            case EnumTabItemNameForClient.HERO:
                UIManager.ins().open(UIHeroKey.HERO_MAIN_VIEW);
                break;
            case EnumTabItemNameForClient.SHOP:
                ShopModel.ins().openShopMain(101);
                break;
            case EnumTabItemNameForClient.FRIEND:
                UIManager.ins().open(UIFriendConfig.FRIEND_MAIN_VIEW);
                break;
            case EnumTabItemNameForClient.drawCard:
                {
                    const isCanOpen = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.RECRUIT);
                    if (isCanOpen) G.UIManager.open(DrawCardUIKeys.DrawCardNormalView);
                }
                break;
            case EnumTabItemNameForClient.gameMode:
                G.UIManager.open(UIGameModeKeys.GameModeMainView);
                break;
            

            /****************************  活动  ******************************/
            case EnumTabItemNameForClient.FULI:
                G.UIManager.open(UIFuilKey.fuliMain);
                break;
            case EnumTabItemNameForClient.growUp:
                {
                    let vo = ActivityModel.ins().getDefaultActivityVoByType<ActivityGrowthPathVo>(ServerEnums.ActivityType.GROW_UP);
                    if (vo) G.UIManager.open(GrowthPathUIKeys.GrowthPathMainView);
                };
                break;
            case EnumTabItemNameForClient.CHARGE:
                ChargeController.ins().openChargeMainView();
                break;
            case EnumTabItemNameForClient.LIMIT_PACK:
                LimitPackController.ins().openPopupWin();
                break;
            case EnumTabItemNameForClient.FIRST_CHARGE:
                G.UIManager.open(UIActivityKey.FirstChargeWin);
                break;
            case EnumTabItemNameForClient.PET_GIFT:
                G.UIManager.open(UIActivityKey.PetGiftMainView)
                break;
            case EnumTabItemNameForClient.SEASON:
            case EnumTabItemNameForClient.SEASON_SUB:
                SeasonManager.ins().openView(nameForClient);
                break;
        }
        return true;
    }

    /**点击页签判断
     * @returns 返回是否可以打开界面
     */
    onClickTabAndCheck(index, showLockTipsFlag = true): boolean {
        let unLock = true;

        let _tabItemConfigs = G.TableManager.getAllData(table.mainpage.MainPageTabItemConfig)
            .toDataStream()
            .filter((it) => it.sideType == EnumTabSideType.BOTTOM)
            .toArray();
        let config = _tabItemConfigs[index];
        //判断功能解锁
        if (config.systemId) {
            let id = ServerEnums.SystemType[config.systemId];
            unLock = ModuleOpenManager.ins().isCanOpenModule(id, showLockTipsFlag);
        }

        return unLock;
    }

    private _allClientCfgs: table.activity.ActivityConstant.ActivityClientConfig[];

    /**
     * 判断入口是否有活动开启
     * @param id 入口id
     * */
    public isEntranceActivityOpen(id: number): boolean {
        let isShow = false;
        if (!this._allClientCfgs) {
            this._allClientCfgs = TableManager.getAllData(table.activity.ActivityConstant.ActivityClientConfig);
        }

        for (let clientCfg of this._allClientCfgs) {
            switch (clientCfg.type) {
                case "1":
                    if (id == clientCfg.parentId
                        && ConditionManager.ins().checkCondition(clientCfg.conditionText)
                    ) {
                        let vo = ActivityModel.ins().getActivityVoById(clientCfg.typeParam);
                        if (vo && vo.isShowEntrance()) {
                            isShow = true;
                        }
                    }
                    break;
                case "3":
                    break;
                default:
                    if (ConditionManager.ins().checkCondition(clientCfg.conditionText)) {
                        isShow = true;
                    }
                    break;
            }
        }
        return isShow;
    }
}
