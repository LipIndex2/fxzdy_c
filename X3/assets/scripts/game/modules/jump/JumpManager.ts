import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { EnumUtils } from "db://assets/scripts/core/utils/EnumUtils";
import { EntranceMainViewOpenArgs } from "db://assets/scripts/game/modules/activity/entrance/structs/EntranceMainViewOpenArgs";
import { DailyBossModel } from "db://assets/scripts/game/modules/dailyBoss/model/DailyBossModel";
import { EnumJumpByCodeKeyName } from "db://assets/scripts/game/modules/jump/const/EnumJumpByCodeKeyName";
import { EnumJumpType } from "db://assets/scripts/game/modules/jump/const/EnumJumpType";
import { ModuleOpenManager } from "db://assets/scripts/game/modules/moduleopen/ModuleOpenManager";
import { RankUIKeys } from "db://assets/scripts/game/modules/rank/RankUIKeys";
import { RankMainViewOpenArgs } from "db://assets/scripts/game/modules/rank/view/RankMainView";
import { ShopModel } from "db://assets/scripts/game/modules/shop/model/ShopModel";
import { UIMainKey } from "db://assets/scripts/game/ui/main/const/UIMainConfig";
import { IMainContainerPageOpenArgs } from "db://assets/scripts/game/ui/main/structs/IMainContainerPageOpenArgs";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import BaseSingleton from "../../../core/base/BaseSingleton";
import G from "../../../core/comm/G";
import GIns from "../../GIns";
import { ActivityConfigManager } from "../../comm/activity/config/ActivityConfigManager";
import { FightType } from "../../comm/battle/enum/FightType";
import { MainPageManager } from "../../ui/main/MainPageManager";
import { ActivityController } from "../activity/ActivityController";
import { UIActivityKey } from "../activity/const/UIActivityConfig";
import { ChargeController } from "../charge/ChargeController";
import { MonthCardController } from "../monthCard/MonthCardController";
import { SeasonUIKeys } from "../season/SeasonUIKeys";
import { SeasonManager } from "../season/SeasonManager";

export class JumpManager extends BaseSingleton {
    jumpByEnum(moduleEnum: ServerEnums.SystemType) {
        const systemName = EnumUtils.getEnumKeyNameByValue(ServerEnums.SystemType, moduleEnum);
        let config = TableManager.getDataById(table.verify.PlayerSystemOpenConfig, systemName);
        if (!config) {
            return;
        }
        let jumpId = config.jumpId;

        this.jumpById(jumpId);
    }

    /**
     * 跳转
     */
    @LogBusiness("触发跳转")
    jumpById(jumpId: number, arg?: any) {
        this.jump0(jumpId, arg);
    }

    private jump0(jumpId: number, arg: any) {
        if (this.checkCanJump() == false) {
            return;
        }
        const jumpConfig = TableManager.getDataById(table.jump.JumpConfig, jumpId);
        if (!jumpConfig) {
            Logger.error(`jumpId:${jumpId} 对应的跳转配置不存在`);
            return;
        }

        // 模块是否开启 | 无提示
        const isCan = ModuleOpenManager.ins().isCanOpenModuleByName(jumpConfig.needModuleName, true);
        if (!isCan) {
            return;
        }

        console.info("跳转到 config = " + jumpConfig.id);

        // 小写的跳转类型
        const jumpType = jumpConfig.type || "";
        switch (jumpType) {
            case EnumJumpType.UI: {
                const uiName = jumpConfig.keyName;

                // 优先用自己的参数
                const finalOpenArgs = arg || jumpConfig.args;
                UIManager.ins().open(uiName, finalOpenArgs);
                break;
            }
            case EnumJumpType.UI_BY_CONFIG_ID: {
                const uiName = jumpConfig.keyName;
                UIManager.ins().open(uiName, jumpConfig.openConfigId);
                break;
            }
            case EnumJumpType.Code: {
                this.jumpByCode(jumpConfig, arg);
                break;
            }
            case EnumJumpType.Activity: {
                this.jumpByActivity(jumpConfig, arg);
                break;
            }
            default: {
                Logger.error(`jumpId:${jumpId} 跳转类型不支持. type = ${jumpType}`);
                break;
            }
        }
    }

    private jumpByCode(jumpConfig: table.jump.JumpConfig, arg: any) {
        const keyName = jumpConfig.keyName;

        console.info(`[Jump] Code. 代码跳转. configId = ${jumpConfig?.id}`);
        switch (keyName) {
            case EnumJumpByCodeKeyName.PVPRank: {
                // 排行榜, 竞技场
                UIManager.ins().open(RankUIKeys.RankMainView, RankMainViewOpenArgs.create(ServerEnums.RankingType.ARENA));
                break;
            }
            case EnumJumpByCodeKeyName.DailyBossRank: {
                // 排行榜, 竞技场
                const subTab = DailyBossModel.ins().context.getBossType();
                UIManager.ins().open(RankUIKeys.RankMainView, RankMainViewOpenArgs.create(ServerEnums.RankingType.DAILY_BOSS, subTab));
                break;
            }
            case EnumJumpByCodeKeyName.Shop: {
                const openConfigId = jumpConfig.openConfigId;
                console.info("跳转到商店", openConfigId);

                ShopModel.ins().openShopMain(openConfigId);
                break;
            }
            case EnumJumpByCodeKeyName.Charge: {
                console.info("跳转到商城", jumpConfig.args);
                ChargeController.ins().openChargeMainView(jumpConfig.args);
                break;
            }
            case EnumJumpByCodeKeyName.DrawCard_normal: {
                UIManager.ins().open(UIMainKey.MainContainerPage, {
                    page: 1,
                    drawCardType: ServerEnums.RecruitType.NORMAL,
                } as IMainContainerPageOpenArgs);
                break;
            }
            case EnumJumpByCodeKeyName.League: {
                // 联盟
                UIManager.ins().open(UIMainKey.MainContainerPage, {
                    page: 3,
                } as IMainContainerPageOpenArgs);
                break;
            }
            case EnumJumpByCodeKeyName.DrawCard_heroStar: {
                UIManager.ins().open(UIMainKey.MainContainerPage, {
                    page: 1,
                    drawCardType: ServerEnums.RecruitType.SPECIAL,
                } as IMainContainerPageOpenArgs);
                break;
            }
            case EnumJumpByCodeKeyName.DrawCard_equip: {
                UIManager.ins().open(UIMainKey.MainContainerPage, {
                    page: 1,
                    drawCardType: ServerEnums.RecruitType.AWAKE_WEAPON_SPECIAL,
                } as IMainContainerPageOpenArgs);
                break;
            }
            case EnumJumpByCodeKeyName.MonthCardForeverBuyWin: {
                MonthCardController.ins().jumpToBuyWin(ServerEnums.MonthCardType.FOREVER);
                break;
            }
            case EnumJumpByCodeKeyName.MonthCardBuyWin: {
                MonthCardController.ins().jumpToBuyWin(ServerEnums.MonthCardType.MONTH);
                break;
            }
            case EnumJumpByCodeKeyName.SeasonMainView: {
                if (SeasonManager.ins().isSeason()) {
                    const isShow = SeasonManager.ins().isShowSubIcon();
                    if (isShow) {
                        const pages = SeasonManager.ins().getSubOpenPageData();
                        if (pages) {
                            G.UIManager.open(SeasonUIKeys.SeasonSubContainerView, pages);
                            return;
                        }
                    }
                    UIManager.ins().open(SeasonUIKeys.SeasonMainView);
                }
                break;
            }
        }
    }

    /**活动跳转*/
    protected jumpByActivity(jumpConfig: table.jump.JumpConfig, arg: any = null): boolean {
        let activityId: number = Number(jumpConfig.keyName);
        let activityCfg = G.TableManager.getDataById(table.activity.ActivityConstant.ActivityConfig, activityId);
        if (activityCfg == null) {
            console.info("跳转活动不存在 activityId:", activityId);
            return false;
        }
        let noActiveTip: string = "活动未开启";
        if (ActivityController.ins().isActivityUnlock(activityId) == false) {
            GIns.floatingTextMgr.showTips(noActiveTip);
            return false;
        }
        let enterCfg = ActivityConfigManager.getEnterCfg(activityId);
        if (enterCfg == null) {
            console.info("跳转活动不存在 | ActivityConfig,MainPageTabItemConfig,ActivityClientConfig | activityId = ", activityId);
            return false;
        }
        if (enterCfg.clientCfg) {
            if (enterCfg.clientCfg.parentId == 26) {
                //开服活动跳转
                G.UIManager.open(UIActivityKey.openChargeView, { id: enterCfg.clientCfg.parentId, defaultId: activityId });
                return true;
            } else if (enterCfg.clientCfg.parentId == 27 || enterCfg.clientCfg.parentId == 30) {
                //通行证跳转
                G.UIManager.open(enterCfg.clientCfg.UIView, activityId);
                return true;
            } else if (enterCfg.clientCfg.parentId) {
                //活动合集跳转
                G.UIManager.open(UIActivityKey.EntranceMainView, {
                    id: enterCfg.clientCfg.parentId,
                    defaultTypeParam: activityId,
                } as EntranceMainViewOpenArgs);
                return true;
            }
        }
        if (enterCfg.mainCfg) {
            return MainPageManager.ins().clickTabItemByName(enterCfg.mainCfg);
        }
        return false;
    }

    /**根据活动id跳转*/
    public jumpByActivityId(activityId: number, force: boolean = false): boolean {
        if (force == false && this.checkCanJump() == false) {
            return false;
        }
        let allCfgs = G.TableManager.getAllData(table.jump.JumpConfig);
        let cfg = allCfgs?.find((value) => value.type == EnumJumpType.Activity && value.keyName == activityId + "");
        if (cfg) {
            return this.jumpByActivity(cfg);
        }
    }

    /**检测是否可以跳转*/
    protected checkCanJump(): boolean {
        if (GIns.battleMgr.battleLogic?.fightType == FightType.LEAGUE_EXPLORE_MAP) {
            //在资源勘探中无法跳转
            GIns.floatingTextMgr.showTips("资源勘探中，暂不可跳转");
            return false;
        }
        if (GIns.battleMgr.battleLogic?.fightType == FightType.PET_DUNGEON_MAP) {
            //在资源勘探中无法跳转
            GIns.floatingTextMgr.showTips("次元裂隙中，暂不可跳转");
            return false;
        }
        return true;
    }
}
