import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import G from "../../../core/comm/G";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import NotificationKey from "../../event/NotificationKey";
import { RedDotKeys } from "../common/redDot/RedDotKeys";
import { RedDotManager, redDotTrigger } from "../common/redDot/RedDotManager";
import { ConditionUtils } from "../condition/ConditionUtils";
import { ModuleOpenManager } from "../moduleopen/ModuleOpenManager";
import { WeaponVo } from "../weapon/vo/WeaponVo";
import { IllustrationsScoreBtn } from "./btn/IllustrationsScoreBtn";
import { IllustrationsHeroItem } from "./item/IllustrationsHeroItem";
import { IllustrationsIconItem } from "./item/IllustrationsIconItem";
import { IllustrationsRewardItem } from "./item/IllustrationsRewardItem";
import { IllustrationsWeaponItem } from "./item/IllustrationsWeaponItem";
import { IllustrationsModel, IllustrationsScoreState } from "./model/IllustrationsModel";


export class IllustrationsController extends BaseController {

    /**英雄阵营红点*/
    protected _heroCampRedDotKeys = [
        RedDotKeys.Illustrations_Hero_Camp1,
        RedDotKeys.Illustrations_Hero_Camp2,
        RedDotKeys.Illustrations_Hero_Camp3,
        RedDotKeys.Illustrations_Hero_Camp4,
    ]

    listenNotifications(): string[] {
        return [
            // 解锁 tabItem 用
            ...ConditionUtils.getUnlockEventNameArray(),
            NotificationKey.ILLUSTRATIONS_INIT_COMPLETE,
            NotificationKey.ILLUSTRATIONS_HERO_CHANGE,
            NotificationKey.ILLUSTRATIONS_WEAPON_CHANGE,
            NotificationKey.ILLUSTRATIONS_PET_CHANGE,
            NotificationKey.WEAPON_ITEM_CHANGE,
            NotificationKey.HERO_ACTIVATE,
            NotificationKey.HERO_UP_STAR,
            NotificationKey.HERO_ACTIVATE_FROM_ITEM,
            NotificationKey.PET_ACTIVER,
            NotificationKey.PET_UP_STAR,
        ];
    }


    notificationHandler(event: string, args?: any): void {

        switch (event) {
            case NotificationKey.ILLUSTRATIONS_INIT_COMPLETE:
                this.checkAllRedDot()
                break
            case NotificationKey.ILLUSTRATIONS_HERO_CHANGE:
                this.checkHeroRedDotById(args)
                break
            case NotificationKey.HERO_ACTIVATE:
            case NotificationKey.HERO_ACTIVATE_FROM_ITEM:
            case NotificationKey.HERO_UP_STAR:
                this.handleHeroDataChange(args)
                break
            case NotificationKey.ILLUSTRATIONS_PET_CHANGE:
                this.checkAllPetRedDot()
                break
            case NotificationKey.PET_ACTIVER:
            case NotificationKey.PET_UP_STAR:
                this.handlePetDataChange(args)
                break
            case NotificationKey.ILLUSTRATIONS_WEAPON_CHANGE:
                this.checkAllWeaponRedDot()
                break
            case NotificationKey.WEAPON_ITEM_CHANGE:
                this.handleWeaponDataChange(args)
                break
        }
        const ok = ConditionUtils.isNeedHandleForUnlock(event)
        if (ok) {
            this.checkAllRedDot();
        }
    }

    constructor () {
        super();
    }

    onInit(): void {
        G.FGUIManager.bindScript("ui://illustrations/IllustrationsScoreBtn", IllustrationsScoreBtn)
        G.FGUIManager.bindScript("ui://illustrations/IllustrationsHeroItem", IllustrationsHeroItem)
        G.FGUIManager.bindScript("ui://illustrations/IllustrationsWeaponItem", IllustrationsWeaponItem)
        G.FGUIManager.bindScript("ui://illustrations/IllustrationsIconItem", IllustrationsIconItem)
        G.FGUIManager.bindScript("ui://illustrations/IllustrationsRewardItem", IllustrationsRewardItem)
        this.initRedDot()
    }

    protected initRedDot(): void {
    }

    protected handleHeroDataChange(heroId: number): void {
        IllustrationsModel.ins().updateHeroStateAndScoreById(heroId)
        this.checkHeroRedDotById(heroId)
    }

    protected handleWeaponDataChange(vos: WeaponVo[]): void {
        vos?.forEach((value) => {
            IllustrationsModel.ins().updateWeaponStateAndScoreById(value.base.baseId)
        })
        this.checkAllWeaponRedDot()
    }

    protected handlePetDataChange(petCfgId: number) {
        IllustrationsModel.ins().updatePetStateAndScoreById(petCfgId)
        this.checkAllPetRedDot()
    }

    /**检测所有红点展示*/
    public checkAllRedDot(): void {

        this.checkAllHeroRedDot()
        this.checkAllWeaponRedDot()
        this.checkAllPetRedDot()
        this.checkRewardRedDot()
    }

    /**检测所有英雄图鉴红点*/
    public checkAllHeroRedDot(): void {
        let isOpen: boolean = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.ILLUSTRATIONS, false)

        let hasRedDots: boolean[] = new Array(this._heroCampRedDotKeys.length).fill(false)
        if (isOpen) {
            let heros = IllustrationsModel.ins().heros
            for (let i = 0; i < heros.length; i++) {
                if (heros[i].state == IllustrationsScoreState.CanDraw) {
                    let index = heros[i].cfg.camp - 1
                    if (index >= 0 && index < hasRedDots.length) {
                        hasRedDots[heros[i].cfg.camp - 1] = true
                    }
                }
            }
        }

        hasRedDots.forEach((value, index) => {
            RedDotManager.ins().setRedDot(this._heroCampRedDotKeys[index], value)
        })
    }

    protected checkHeroRedDotById(heroId: number): void {
        let heroCfg = G.TableManager.getDataById(table.hero.HeroConfig, heroId)
        if (heroCfg) {
            this.checkHeroRedDotByCamp(heroCfg.camp)
        } else {
            this.checkAllHeroRedDot()
        }
    }

    /**根据阵营检测红点*/
    public checkHeroRedDotByCamp(camp: number): void {
        if (camp > 0 && camp <= this._heroCampRedDotKeys.length) {
            let index = IllustrationsModel.ins().heros.findIndex((value) => value.state == IllustrationsScoreState.CanDraw && value.cfg.camp == camp)
            RedDotManager.ins().setRedDot(this._heroCampRedDotKeys[camp - 1], index != -1)
        }
    }

    /**检测所有武器红点*/
    @redDotTrigger(RedDotKeys.Illustrations_Weapon_All)
    public checkAllWeaponRedDot(): boolean {
        let isOpen: boolean = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.ILLUSTRATIONS, false)
        if (isOpen == false) {
            return false
        }
        let isOpen2: boolean = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.AWAKE_WEAPON, false)
        if (isOpen2 == false) {
            return false
        }
        let index = IllustrationsModel.ins().weapons.findIndex((value) => value.state == IllustrationsScoreState.CanDraw)
        return index != -1
    }

    /**检测奖励红点*/
    @redDotTrigger(RedDotKeys.Illustrations_Reward)
    public checkRewardRedDot(): boolean {
        let isOpen: boolean = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.ILLUSTRATIONS, false)
        if (isOpen == false) {
            return false
        }
        let curLv: number = IllustrationsModel.ins().rewardLv
        let rewards = G.TableManager.getAllData(table.illustrations.IllustrationsLevelConfig)

        if (curLv >= rewards.length) {
            return false
        }
        let curScore = IllustrationsModel.ins().score
        let maxScore = rewards[curLv].needScore


        if (curScore >= maxScore) {
            //可领取
            return true
        }
        return false
    }

    /**检测所有宠物红点*/
    @redDotTrigger(RedDotKeys.Illustrations_Pet_All)
    public checkAllPetRedDot() {
        let isOpen: boolean = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.ILLUSTRATIONS, false)
        if (isOpen == false) {
            return false
        }
        let isOpen2: boolean = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.PET, false)
        if (isOpen2 == false) {
            return false
        }
        for (let data of IllustrationsModel.ins().pets) {
            if (data.state == IllustrationsScoreState.CanDraw) {
                return true
            }
        }
        return false
    }
}

IllustrationsController.ins().doInit();