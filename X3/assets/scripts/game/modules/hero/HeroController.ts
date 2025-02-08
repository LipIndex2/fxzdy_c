import G from "../../../core/comm/G";
import FGUIManager from "../../../core/fgui/FGUIManager";
import { UIManager } from "../../../core/mvc/UIManager";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { TableManager } from "../../../core/table/TableManager";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import GIns from "../../GIns";
import NotificationKey from "../../event/NotificationKey";
import { RedDotKeys } from "../common/redDot/RedDotKeys";
import { RedDotManager } from "../common/redDot/RedDotManager";
import { ModuleOpenManager } from "../moduleopen/ModuleOpenManager";
import { SettingsConfigManager } from "../settings/config/SettingsConfigManager";
import { HeroManager } from "./HeroManager";
import { HeroVo } from "./HeroVo";
import { UIHeroKey } from "./const/UIHeroConfig";
import { HeroAttrItem } from "./item/HeroAttrItem";
import { HeroAttrItem2 } from "./item/HeroAttrItem2";
import { HeroFragmentBarItem } from "./item/HeroFragmentBarItem";
import { HeroItem2 } from "./item/HeroItem2";
import { HeroSkinItem } from "./item/HeroSkinItem";
import { WeaponItem } from "./item/WeaponItem";
import { HeroSkinPage } from "./page/HeroSkinPage";
import { HeroSwitchPage } from "./page/HeroSwitchPage";
import { HeroUpLevelPage } from "./page/HeroUpLevelPage";
import { HeroUpStarPage } from "./page/HeroUpStarPage";
import { HeroMainScrollPane } from "./pane/HeroMainScrollPane";
import { HeroScrollPane } from "./pane/HeroScrollPane";
import { HeroPotentialPage } from "./page/HeroPotentialPage";

export class HeroController extends BaseController {

    protected _heroCostItemMap: Map<number, boolean> = null;

    listenNotifications(): string[] {
        return [
            NotificationKey.HERO_UP_LEVEL,
            NotificationKey.HERO_UP_STAGE,
            NotificationKey.HERO_UP_STAR,
            NotificationKey.HERO_SKIN_WEAR,
            NotificationKey.EVENT_CHANGE_ITEMS,
            NotificationKey.EVENT_CHANGE_ITEMS2,
            NotificationKey.FIGHT_UPDATE_ONE_HERO,
            NotificationKey.FIGHT_UPDATE_ALL_HERO,
            NotificationKey.FORMATION_SET_UP_FORMATION,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.HERO_SKIN_WEAR:
                G.GameTimer.once(200, this, () => {
                    let heroVo4 = GIns.heroMgr.getHeroVoByID(args.heroBaseId);
                    this.checkHeroRedDot(heroVo4);
                });
            case NotificationKey.FORMATION_SET_UP_FORMATION:
                G.GameTimer.once(200, this, () => {
                    this.checkAllHeroRedDot();
                });
                break;
            case NotificationKey.HERO_UP_LEVEL:
                G.GameTimer.once(200, this, () => {
                    this.checkHeroItemRedDot();
                });
                break;
            case NotificationKey.HERO_UP_STAGE:
                this.heroUpStage(args);
                G.GameTimer.once(200, this, () => {
                    this.checkHeroItemRedDot();
                });
                break;
            case NotificationKey.HERO_UP_STAR:
                this.heroUpStar(args);
                let heroVo3 = GIns.heroMgr.getHeroVoByID(args);
                G.GameTimer.once(200, this, () => {
                    this.checkHeroRedDot(heroVo3);
                });
                break;
            case NotificationKey.EVENT_CHANGE_ITEMS:
                G.GameTimer.once(1000, this, () => {
                    this.refreshItemRedDot(args);
                });
                break
            case NotificationKey.EVENT_CHANGE_ITEMS2:
                this.heroCountChang(args);
                break;
            case NotificationKey.FIGHT_UPDATE_ONE_HERO:
                this.updateHeroFight(args);
                break;
            case NotificationKey.FIGHT_UPDATE_ALL_HERO:
                this.updateAllHeroFight();
                break;
        }
    }

    constructor () {
        super();
    }

    onInit(): void {
        FGUIManager.ins().bindScript("ui://hero/HeroSwitchPage", HeroSwitchPage);
        FGUIManager.ins().bindScript("ui://hero/HeroUpLevelPage", HeroUpLevelPage);
        FGUIManager.ins().bindScript("ui://hero/HeroUpStar", HeroUpStarPage);
        FGUIManager.ins().bindScript("ui://hero/HeroSkinPage", HeroSkinPage);
        FGUIManager.ins().bindScript("ui://hero/HeroAttrItem", HeroAttrItem);
        FGUIManager.ins().bindScript("ui://hero/HeroSkinItem", HeroSkinItem);
        FGUIManager.ins().bindScript("ui://hero/HeroAttrItem2", HeroAttrItem2);
        FGUIManager.ins().bindScript("ui://hero/HeroFragmentBarItem", HeroFragmentBarItem);
        FGUIManager.ins().bindScript("ui://hero/WeaponItem", WeaponItem);
        FGUIManager.ins().bindScript("ui://hero/HeroItem2", HeroItem2);
        FGUIManager.ins().bindScript("ui://hero/HeroMainScrollPane", HeroMainScrollPane);
        FGUIManager.ins().bindScript("ui://hero/HeroScrollPane", HeroScrollPane);
        FGUIManager.ins().bindScript("ui://hero/HeroPotentialPage", HeroPotentialPage);
    }

    /** 更新英雄碎片数量 */
    public heroCountChang(args: Vo.reward.RewardResult[]) {
        for (let k in args) {
            let cfg: table.item.ItemConfig = TableManager.getDataById(table.item.ItemConfig, args[k].baseId);
            if (!cfg) return;
            if (cfg.type == "HERO_CARD") {
                //英雄
                HeroManager.ins().activeHero(args[k].baseId);
                G.FacadeManager.emit(NotificationKey.HERO_ACTIVATE_FROM_ITEM, args[k].baseId);
            } else if (cfg.type == "HERO_FRAGMENT") {
                //碎片
                HeroManager.ins().addFragment(args[k].baseId, args[k].amount);
            } else if (ServerEnums.ItemType[cfg.type] == ServerEnums.ItemType.HERO_SKIN) {
                //英雄皮肤
                let skinCfg = G.TableManager.getDataById(table.hero.HeroSkinConfig, cfg.id);
                if (skinCfg) {
                    let heroVo = HeroManager.ins().getHeroVoByID(skinCfg.heroBaseId);
                    if (heroVo) {
                        if (heroVo.heroVoData.heroSkinIds.indexOf(skinCfg.id) == -1) {
                            heroVo.heroVoData.heroSkinIds.push(skinCfg.id);
                            G.FacadeManager.emit(NotificationKey.FIGHT_UPDATE_ONE_HERO, skinCfg.heroBaseId);
                        }
                    }
                }
            }
        }
    }

    public heroUpStage(posId: number) {
        UIManager.ins().close(UIHeroKey.HERO_UP_STAGE_WIN);
        UIManager.ins().open(UIHeroKey.HERO_UP_STAGE_SUCCED_WIN, posId);
    }

    public heroUpStar(heroId: HeroVo) {
        if (!heroId) return;
        UIManager.ins().open(UIHeroKey.HERO_UP_STAR_SUCCEED_WIN, heroId);
    }

    /** 更新单个英雄战力 */
    public updateHeroFight(heroId: number) {
        let heroVo = HeroManager.ins().getHeroVoByID(heroId);
        heroVo.updateFight();
    }

    /** 更新所有英雄战力 */
    public updateAllHeroFight() {
        let heroVos = HeroManager.ins().getAllHeroVo();
        for (let heroVo of heroVos) {
            heroVo.updateFight();
        }
    }

    /** ========================红点========================== */

    /** 道具刷新红点 */
    public refreshItemRedDot(args: Map<number, number>) {
        if (this._heroCostItemMap == null) {
            this._heroCostItemMap = new Map();
            let items = GIns.heroMgr.getHeroConstantCfg("HERO:UPDATE_RED_ITEMS").content.split(";");
            items.forEach((value: string) => {
                this._heroCostItemMap.set(Number(value), true);
            })
        }

        let itemIds: number[] = Array.from(args.keys());
        for (let i = 0; i < itemIds.length; i++) {
            let cfg: table.item.ItemConfig = TableManager.getDataById(table.item.ItemConfig, itemIds[i]);
            if (!cfg) return;
            if (cfg.type == "HERO_CARD" || cfg.type == "HERO_FRAGMENT") {
                this.refreshRedDot();
                return;
            }
            if (this._heroCostItemMap.has(itemIds[i])) {
                this.checkHeroItemRedDot();
                return;
            }
        }
    }

    /**检测所有红点展示*/
    public refreshRedDot() {
        if (!ModuleOpenManager.ins().isCanOpenModuleWithoutTips(ServerEnums.SystemType.HERO)) {
            return;
        }

        G.GameTimer.once(200, this, () => {
            this.checkAllHeroRedDot();
        });
    }

    //所有英雄item的红点
    // @redDotTrigger(RedDotKeys.Hero_list)
    // public checkAllHeroRedDot(): boolean {
    //     let allHeroVo = HeroManager.ins().getAllHeroVo();
    //     for (let heroVo of allHeroVo) {
    //         if (heroVo.isCanActive || heroVo.isCanUpgrade() || heroVo.isCanUpStar()) {
    //             return true;
    //         }
    //     }
    //     return false;
    // }

    /**刷新上阵的英雄红点*/
    public checkHeroItemRedDot() {
        if (!ModuleOpenManager.ins().isCanOpenModuleWithoutTips(ServerEnums.SystemType.HERO)) {
            return;
        }
        let idMap = GIns.heroMgr.getPosToHeroIds();
        let ids = Object.keys(idMap);
        for (let id of ids) {
            let heroVo = GIns.heroMgr.getHeroVoByID(idMap[id]);
            if (heroVo) {
                this.checkHeroRedDot(heroVo);
            }
        }
    }

    /**刷新所有的英雄红点*/
    public checkAllHeroRedDot() {
        if (!ModuleOpenManager.ins().isCanOpenModuleWithoutTips(ServerEnums.SystemType.HERO)) {
            return;
        }
        let allHeroVo = HeroManager.ins().getAllHeroVo();
        for (let heroVo of allHeroVo) {
            this.checkHeroRedDot(heroVo);
        }
    }

    /**单个英雄红点*/
    public checkHeroRedDot(heroVo: HeroVo) {
        if (!heroVo) return;
        let isCanUpgrade: boolean = heroVo.isCanUpgrade();
        RedDotManager.ins().setRedDot(RedDotKeys.Hero_item_train, isCanUpgrade, [heroVo.baseId]);
        if (isCanUpgrade) {
            //可升级的时候才去判断是否可升5级
            RedDotManager.ins().setRedDot(RedDotKeys.Hero_item_train_five, heroVo.isCanUpgradeMore(5), [heroVo.baseId]);
        } else {
            RedDotManager.ins().setRedDot(RedDotKeys.Hero_item_train_five, false, [heroVo.baseId]);
        }
        RedDotManager.ins().setRedDot(RedDotKeys.Hero_item_star, heroVo.isCanUpStar(), [heroVo.baseId]);
        RedDotManager.ins().setRedDot(RedDotKeys.Hero_item_activate, heroVo.isCanActive, [heroVo.baseId]);
        RedDotManager.ins().setRedDot(RedDotKeys.Hero_item_dna, heroVo.isCanOpenDna(), [heroVo.baseId]);
        RedDotManager.ins().setRedDot(RedDotKeys.Hero_item_dna_level_up, heroVo.isCanDnaLevelUp(), [heroVo.baseId]);
        RedDotManager.ins().setRedDot(RedDotKeys.Hero_item_dna_awaken, heroVo.isCanDnaAwaken(), [heroVo.baseId]);
        this.checkSkinRedDot(heroVo)
    }

    public checkSkinRedDot(heroVo: HeroVo) {
        heroVo.heroVoData.heroSkinIds?.forEach((skinId: number) => {
            if (skinId == heroVo.heroVoData?.useSkinId) {
                RedDotManager.ins().markRedDotForeverRead(RedDotKeys.Hero_item_skin_item, [heroVo.baseId, skinId]);
            }
            RedDotManager.ins().setRedDot(RedDotKeys.Hero_item_skin_item, true, [heroVo.baseId, skinId]);
            // let imageId = SettingsConfigManager.getSkinImageId(heroVo.baseId, skinId);
            // if (imageId > 0) {
            //     RedDotManager.ins().setRedDot(RedDotKeys.Set_skin_image_item, true, [imageId]);
            // }
        });

        GIns.settingsModel.context.checkShowRedDotByHero(heroVo)
    }
}

HeroController.ins().doInit();
