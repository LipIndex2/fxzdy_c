import FGUIManager from "../../../core/fgui/FGUIManager";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import { FightType } from "../../comm/battle/enum/FightType";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { FormationManager } from "./FormationManager";
import { CampAttrItem } from "./item/CampAttrItem";
import { FormationRecHeroItem } from "./item/FormationRecHeroItem";
import { FromationRecItem } from "./item/FromationRecItem";
import { FormationModel } from "./model/FormationModel";
import { FormationHeroListPage } from "./page/FormationHeroListPage";
import { FormationItemPage } from "./page/FormationItemPage";


export class FormationController extends BaseController {

    listenNotifications(): string[] {
        return [
            NotificationKey.GUIDE_GET_HERO,
            NotificationKey.PET_ACTIVER,
            NotificationKey.COLLECTIONS_EQUIP_COLL_CHG,
        ]
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.GUIDE_GET_HERO:
                this.sendInBattleHero(args);
                break;
            case NotificationKey.PET_ACTIVER:
                if (GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.PET)) {
                    // 宠物解锁 激活的第一个宠物自动上阵
                    let activePets = GIns.petModel.petContext.getAllActivePetId()
                    if (activePets?.length == 1) {
                        //代表是第一次激活
                        let formationVo = FormationManager.ins().getFormationVoByType(ServerEnums.FightType.TRUNK_MAP)
                        if (formationVo) {
                            formationVo.petId = activePets[0];
                            FormationModel.ins().setUpFormation(ServerEnums.FightType.TRUNK_MAP, formationVo.toSetUpReqVo());
                        }
                    }
                }
                break;
            case NotificationKey.COLLECTIONS_EQUIP_COLL_CHG:
                //检测当前上阵的收藏品是否已过期
                this.checkAllCollectionsVaild();
                break;
        }
    }

    constructor() {
        super();
    }

    onInit(): void {
        FGUIManager.ins().bindScript("ui://formation/FormationItemPage", FormationItemPage);
        FGUIManager.ins().bindScript("ui://formation/FormationHeroListPage", FormationHeroListPage);
        FGUIManager.ins().bindScript("ui://formation/CampAttrItem", CampAttrItem);
        FGUIManager.ins().bindScript("ui://formation/FormationRecHeroItem", FormationRecHeroItem);
        FGUIManager.ins().bindScript("ui://formation/FromationRecItem", FromationRecItem);
    }

    //解救队友并上阵
    private sendInBattleHero(heroId: number) {
        let posVos = FormationManager.ins().getAllPosData();
        let posId = FormationManager.ins().getVacantPosIds(posVos);
        if (posId[0]) {
            FormationModel.ins().sendInBattleHero(posId[0].BaseId, heroId[0]);
        }
    }

    /**检测当前上阵的收藏品是否已过期*/
    protected checkAllCollectionsVaild(): void {
        let context = GIns.collectionsModel.context;
        let activeIds: number[] = context.getAllActiveCollections();
        let showIds: number[] = [];
        activeIds?.forEach((id) => {
            let vo = context.getCollectionById(id);
            if (vo && vo.getUnlockBattleSkill()?.length > 0) {
                //可上阵
                showIds.push(id);
            }
        })
        let voMap = GIns.formationMgr.formationMap;
        for (let key in voMap) {
            let vo = voMap[key];
            if (vo?.collectionsId > 0 && showIds.indexOf(vo.collectionsId) == -1) {
                //代表收藏品已失效
                vo.collectionsId = 0;
                if (vo.fightType == FightType.TRUNK_MAP) {
                    //主线
                    this.emit(NotificationKey.FORMATION_SET_UP_FORMATION);
                    this.emit(NotificationKey.BATTLE_FORMATION_CHANGED);
                    this.emit(NotificationKey.FIGHT_UPDATE_ALL_HERO);
                } else {
                    //其他
                    this.emit(NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION, vo.fightType);
                }
            }
        }
    }
}

FormationController.ins().doInit();