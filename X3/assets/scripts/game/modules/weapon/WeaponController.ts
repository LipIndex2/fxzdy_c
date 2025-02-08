import G from "db://assets/scripts/core/comm/G";
import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import { TableManager } from "../../../core/table/TableManager";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import LoginNotificationKey from "../../../main/modules/LoginNotificationKey";
import GIns from "../../GIns";
import NotificationKey from "../../event/NotificationKey";
import { RedDotKeys } from "../common/redDot/RedDotKeys";
import { BtnWearWeapon } from "./BtnWearWeapon";
import { WeaponManager } from "./WeaponManager";
import { UIWeaponConfig } from "./const/UIWeaponConfig";
import { WeaponAttrItem } from "./item/WeaponAttrItem";
import { WeaponBagItem } from "./item/WeaponBagItem";
import { WeaponBaseItem } from "./item/WeaponBaseItem";
import { WeaponConsumeAddItem } from "./item/WeaponConsumeAddItem";
import { WeaponConsumeItem } from "./item/WeaponConsumeItem";
import { WeaponSelectItem } from "./item/WeaponSelectItem";
import { WeaponUpAttrItem } from "./item/WeaponUpAttrItem";
import { WeaponUpAttrItem2 } from "./item/WeaponUpAttrItem2";
import { WeaponAttrPanel } from "./panel/WeaponAttrPanel";
import { WeaponSkillListItem } from "./item/WeaponSkillListItem";

export class WeaponController extends BaseController {
    listenNotifications(): string[] {
        return [
            LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE,
            NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS,
            NotificationKey.EVENT_CHANGE_ITEMS2,
            NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS,
            NotificationKey.WEAPON_UP_STAR_COMPLETE,
            NotificationKey.WEAPON_ITEM_CHANGE,
            NotificationKey.WEAPON_TAKE_OFF_COMPLETE,
            NotificationKey.WEAPON_WEAR_COMPLETE,
            NotificationKey.HERO_ACTIVATE,
            NotificationKey.HERO_ACTIVATE_FROM_ITEM,
            NotificationKey.EVENT_CHANGE_ITEMS,
            NotificationKey.FORMATION_SET_UP_FORMATION,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE:
                this.refreshRedDot();
                this.refreshAllBagRedDot();
                break;
            case NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS:
                this.removeWeaponItems(args);
                break;
            case NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS:
            case NotificationKey.EVENT_CHANGE_ITEMS2:
                this.addWeaponItems(args);
                break;
            case NotificationKey.WEAPON_UP_STAR_COMPLETE:
                this.showUpSuccWin(args);
                break;
            case NotificationKey.EVENT_CHANGE_ITEMS:

            case NotificationKey.WEAPON_TAKE_OFF_COMPLETE:
            case NotificationKey.WEAPON_WEAR_COMPLETE:
            case NotificationKey.FORMATION_SET_UP_FORMATION:
                this.refreshRedDot();
                break;
            case NotificationKey.WEAPON_ITEM_CHANGE:
                this.refreshRedDot();
                this.refreshAllBagRedDot();
                break;
            case NotificationKey.HERO_ACTIVATE:
            case NotificationKey.HERO_ACTIVATE_FROM_ITEM:
                this.refreshRedDotByIndexInterceptor(args);
                break;
        }
    }

    constructor() {
        super();
    }

    onInit(): void {
        G.FGUIManager.bindScript("ui://comm/BtnWearWeapon", BtnWearWeapon);
        G.FGUIManager.bindScript("ui://comm/WeaponBaseItem", WeaponBaseItem);
        G.FGUIManager.bindScript("ui://comm/WeaponBagItem", WeaponBagItem);
        G.FGUIManager.bindScript("ui://weapon/WeaponAttrItem", WeaponAttrItem);
        G.FGUIManager.bindScript("ui://weapon/WeaponTipsSkillItem", WeaponSkillListItem);
        G.FGUIManager.bindScript("ui://weapon/WeaponUpAttrItem", WeaponUpAttrItem);
        G.FGUIManager.bindScript("ui://weapon/WeaponUpAttrItem2", WeaponUpAttrItem2);
        G.FGUIManager.bindScript("ui://weapon/WeaponConsumeAddItem", WeaponConsumeAddItem);
        G.FGUIManager.bindScript("ui://weapon/WeaponConsumeItem", WeaponConsumeItem);
        G.FGUIManager.bindScript("ui://weapon/WeaponSelectItem", WeaponSelectItem);
        G.FGUIManager.bindScript("ui://weapon/WeaponAttrPanel", WeaponAttrPanel);
    }

    /**移除武器*/
    protected removeWeaponItems(args: Vo.reward.RewardResult[]) {
        for (let k in args) {
            let cfg: table.item.ItemConfig = TableManager.getDataById(table.item.ItemConfig, args[k].baseId);
            if (!cfg) return;
            if (cfg.type == "AWAKE_WEAPON") {
                //赋能武器
                WeaponManager.ins().deleteWeapon(Number(args[k].contents));
            }
        }
    }

    /**新增武器数量*/
    protected addWeaponItems(args: Vo.reward.RewardResult[]) {
        for (let k in args) {
            let cfg: table.item.ItemConfig = TableManager.getDataById(table.item.ItemConfig, args[k].baseId);
            if (!cfg) return;
            if (cfg.type == "AWAKE_WEAPON") {
                //赋能武器
                WeaponManager.ins().addWeapon(args[k].contents as Vo.awakeweapon.AwakeWeaponVo);
            }
        }
    }

    protected showUpSuccWin(args: Vo.awakeweapon.UpStarS2C): void {
        G.UIManager.open(UIWeaponConfig.WEAPON_UP_STAR_SUCC_VIEW, args);
    }

    //刷新所有红点
    refreshRedDot() {
        if (!GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.HERO)) return;
        if (!GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.AWAKE_WEAPON)) return;
        let allHeroVo = GIns.heroMgr.getAllHeroVo();
        for (let heroVo of allHeroVo) {
            if (heroVo.heroVoData.isActivate) {
                this.refreshRedDotByIndex(heroVo.heroVoData.baseId);
                GIns.redDotMgr.setRedDot(RedDotKeys.Hero_item_weapon_active, !!heroVo.posId);
            }
        }
    }

    refreshAllBagRedDot() {
        GIns.redDotMgr.removeMarkRead(RedDotKeys.backpack);
        let allWeapons = GIns.weaponMgr.getBagWeapons();
        GIns.redDotMgr.clearAll(RedDotKeys.backpack_weapon_item);
        allWeapons?.forEach((value) => {
            GIns.redDotMgr.setRedDot(RedDotKeys.backpack_weapon_item, true, [value.base.id]);
        });
    }

    //刷新单个红点条件拦截
    refreshRedDotByIndexInterceptor(heroId: number) {
        if (!GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.HERO)) return;
        if (!GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.AWAKE_WEAPON)) return;
        this.refreshRedDotByIndex(heroId);
    }

    //刷新单个红点
    refreshRedDotByIndex(heroId: number) {
        let curWeapon = GIns.weaponMgr.getWeaponForHero(heroId);
        let heroVo = GIns.heroMgr.getHeroVoByID(heroId);

        if (curWeapon == null) {
            //未穿戴
            let canWearWeapons = GIns.weaponMgr.getCanWearIdleWeapons(heroId);
            //穿戴红点
            GIns.redDotMgr.setRedDot(RedDotKeys.Hero_item_weapon_wear, canWearWeapons?.length > 0 && !!heroVo.posId, [heroId]);
            GIns.redDotMgr.setRedDot(RedDotKeys.Hero_item_weapon_up, false, [heroId]);
            GIns.redDotMgr.setRedDot(RedDotKeys.Hero_item_weapon_exclusive, false, [heroId]);
        } else {
            GIns.redDotMgr.setRedDot(RedDotKeys.Hero_item_weapon_wear, false, [heroId]);
            if (GIns.weaponMgr.isWeaponCanUpStar(curWeapon)) {
                //当前武器可升级
                GIns.redDotMgr.setRedDot(RedDotKeys.Hero_item_weapon_up, !!heroVo.posId, [heroId]);
                GIns.redDotMgr.setRedDot(RedDotKeys.Hero_item_weapon_exclusive, false, [heroId]);
            } else if (curWeapon.cfg.heroBaseId != heroId) {
                //当前穿戴的不是专武

                let weapons = GIns.weaponMgr.getCanWearIdleWeapons(heroId, ServerEnums.AwakeWeaponType.EXCLUSIVE);
                //当前不是专武 并且有专武可装备
                GIns.redDotMgr.setRedDot(RedDotKeys.Hero_item_weapon_exclusive, weapons?.length > 0 && !!heroVo.posId, [heroId]);
                GIns.redDotMgr.setRedDot(RedDotKeys.Hero_item_weapon_up, false, [heroId]);
            } else {
                GIns.redDotMgr.setRedDot(RedDotKeys.Hero_item_weapon_up, false, [heroId]);
                GIns.redDotMgr.setRedDot(RedDotKeys.Hero_item_weapon_exclusive, false, [heroId]);
            }
        }
    }
}

WeaponController.ins().doInit();
