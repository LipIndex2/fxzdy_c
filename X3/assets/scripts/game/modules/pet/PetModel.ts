import { debug } from "cc";
import G from "../../../core/comm/G";
import { BaseModel } from "../../../core/mvc/model/BaseModel";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { EnumGainNewHeroType } from "../drawcard/enums/EnumGainNewHeroType";
import { UIPetKey } from "./const/UIPetConfig";
import { PetConfigManager } from "./PetConfigManager";
import { PetContext } from "./vo/PetContext";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import { systemFight } from "../fight/FightManager";
import { PetGroupContext } from "../petGroup/PetGroupContext";
import { UIPetGroupKey } from "../petGroup/const/UIPetGroupConfig";

/**
 * 星灵模块
 * @author GameCreator
 */
export class PetModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 50;

    private _petContext = new PetContext();
    private _petGroupContext = new PetGroupContext

    constructor() {
        super();
        this.regist();
    }

    public static getModule(): number {
        return this.ins().MODULE;
    }

    /**
     * 注册所有从服务端收到的回调。
     */
    private regist(): void {
        // 注册所有的服务器消息指令
        let moduleId = this.MODULE;
        this.registerMsg(moduleId, 1, this.recActivePet);
        this.registerMsg(moduleId, 2, this.recUpLV);
        this.registerMsg(moduleId, 3, this.recUpStage);
        this.registerMsg(moduleId, 4, this.recUpStar);
        this.registerMsg(moduleId, 5, this.recActiveGroup);
    }

    listenNotifications(): string[] {
        return [NotificationKey.EVENT_CHANGE_ITEMS2];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.EVENT_CHANGE_ITEMS2:
                let newGetPetId = this._petContext.handleAutoActivePet(args);
                if (newGetPetId.length > 0) {
                    this.heandGetNewPet(newGetPetId, true);
                }
                break;
        }
    }

    /*********************************协议发送*********************************/
    /**
     * 激活星灵
     * @param petBaseId 星灵配置ID
     * 模块号：50	指令号：1
     */
    sendActivePet(petBaseId: number) {
        let param: Vo.pet.ActiveC2S = {
            petBaseId: petBaseId,
        };
        this.send(this.MODULE, 1, param);
    }

    /**
     * 星灵升级
     * 模块号：50	指令号：2
     */
    sendUpLV() {
        this.send(this.MODULE, 2);
    }

    /**
     * 星灵升阶
     * 模块号：50	指令号：3
     */
    sendUpStage() {
        this.send(this.MODULE, 3);
    }
    /**
     * 星灵升星
     * 模块号：50	指令号：4
     */
    sendUpStar(petBaseId: number) {
        let param: Vo.pet.UpStarC2S = {
            petBaseId: petBaseId,
        };
        this.send(this.MODULE, 4, param);
    }

    /**
     * 星灵羁绊激活/升级
     * 模块号：50	指令号：5
     */
    sendActiveUpPetGroup(groupId: number) {
        let param: Vo.pet.ActiveGroupC2S = {
            groupId: groupId
        };
        this.send(this.MODULE, 5, param);
    }

    /*********************************协议监听*********************************/
    /**
     * 激活星灵
     * 模块号：50	指令号：1
     */
    recActivePet(data: Vo.pet.ActiveS2C) {
        if (data.code < 0) {
            return;
        }
        let { content } = data;
        this._petContext.recActive(content);
        this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, content.costItemResults);
        this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, content.rewardResults);
        this.heandGetNewPet([content.rewardResults[0].baseId], true);

        let posVos = GIns.formationMgr.getAllPosData();
        GIns.fightMgr.updateSystemFight(posVos, systemFight.PET);
    }

    /**
     * 星灵升级
     * 模块号：50	指令号：2
     */
    recUpLV(data: Vo.pet.UpLevelS2C) {
        if (data.code < 0) {
            return;
        }
        let voUpLv = data.content;
        this._petContext.recUpLV(voUpLv);
        this.emit(NotificationKey.FIGHT_UPDATE_ALL_HERO);
        this.emit(NotificationKey.FIGHT_RECALCULATE_ALL_HERO);
        let posVos = GIns.formationMgr.getAllPosData();
        GIns.fightMgr.updateSystemFight(posVos, systemFight.PET);
        this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, voUpLv.costItemResults);
        this.emit(NotificationKey.PET_UP_SHARE_LV);
    }

    /**
     * 星灵升阶
     * 模块号：50	指令号：3
     */
    recUpStage(data: Vo.pet.UpStageS2C) {
        if (data.code < 0) {
            return;
        }
        let voUpStage = data.content;
        this._petContext.recUpStage(voUpStage);
        this.emit(NotificationKey.FIGHT_UPDATE_ALL_HERO);
        this.emit(NotificationKey.FIGHT_RECALCULATE_ALL_HERO);
        let posVos = GIns.formationMgr.getAllPosData();
        GIns.fightMgr.updateSystemFight(posVos, systemFight.PET);
        this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, voUpStage.costItemResults);
        this.emit(NotificationKey.PET_UP_STAGE_LV);
        G.UIManager.open(UIPetKey.PET_UP_STAGE_SUCCESS_VIEW);
    }
    /**
     * 星灵升星
     * 模块号：50	指令号：4
     */
    recUpStar(data: Vo.pet.UpStarS2C) {
        if (data.code < 0) {
            return;
        }

        let { content } = data;
        let petCfgId = content.petVo.petBaseId;
        this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, content.costItemResults);
        this._petContext.recUpStar(content);
        this.petGroupContext.recPetUpStar(petCfgId);
        GIns.petCfgMgr.updateStarAttrs();
        this.emit(NotificationKey.PET_UP_STAR, petCfgId);

        //当前升星的宠物id
        let { petBaseId: curUpStarPetCfgId, star } = data.content.petVo;
        //是否主线当前上阵的宠物id
        let curOnArrayPetCfgId = 0;
        let arrVo = GIns.formationMgr.getFormationVoByType(ServerEnums.FightType.TRUNK_MAP);
        if (arrVo) {
            curOnArrayPetCfgId = arrVo.petId;
        }
        if (curUpStarPetCfgId == curOnArrayPetCfgId) {
            // let curPetStarCfg = GIns.petCfgMgr.getPetStarCfg(curOnArrayPetCfgId, star);
            // let lastPetStarCfg = GIns.petCfgMgr.getPetStarCfg(curOnArrayPetCfgId, star - 1);
            let petSkillChgInfo = GIns.petCfgMgr.skillChgInfo(curOnArrayPetCfgId, star);
            if (petSkillChgInfo) {
                this.emit(NotificationKey.PET_SKILL_CHANGED);
            }
        }

        let args: IPet.IPetUpStarSuccessUIArgs = {
            petCfgId: petCfgId,
        };
        this.emit(NotificationKey.FIGHT_UPDATE_ALL_HERO);
        this.emit(NotificationKey.FIGHT_RECALCULATE_ALL_HERO);
        let posVos = GIns.formationMgr.getAllPosData();
        GIns.fightMgr.updateSystemFight(posVos, systemFight.PET);
        G.UIManager.open(UIPetKey.PET_UP_STAR_SUCCESS_VIEW, args);

        // let curPetId = GIns.formationMgr.getDefaultFormationVo()?.petId;
        // if (curPetId == data.petCfgId) {
        //     this.emitNow(NotificationKey.FIGHT_UPDATE_ALL_HERO);
        // }
    }

    /**
     * 激活羁绊
     * 模块号：50	指令号：5
     */
    recActiveGroup(data: Vo.pet.ActiveGroupS2C) {
        if (data.code < 0) return;
        this.petGroupContext.recActiveGroup(data.content);
        this.emit(NotificationKey.PET_GROUP_ACTIVE_UP);

        G.UIManager.open(UIPetGroupKey.PET_GROUP_UP_INFO_VIEW, data.content.groupId);
    }

    /*********************************协议推送*********************************/

    // region 自己的方法

    get petContext(): PetContext {
        return this._petContext;
    }

    get petGroupContext(): PetGroupContext {
        return this._petGroupContext;
    }

    initData(petInitVo: Vo.pet.PetLoginVo) {
        GIns.petCfgMgr.init();
        this._petContext.initData(petInitVo);
        this._petGroupContext.initData(petInitVo);
        GIns.itemModel.addInitDataByPet(petInitVo);
        // GIns.petCfgMgr.updateAllRed()
    }

    /**
     *
     * @param petCfgId
     * @param fightFloatAni 飘战力动画
     */
    heandGetNewPet(petCfgId: number[], fightFloatAni: boolean) {
        GIns.petCfgMgr.updateStarAttrs();
        GIns.petCfgMgr.updateMaxLv();

        this.petGroupContext.RedRefreshGroup();

        this.emit(NotificationKey.PET_ACTIVER, petCfgId);
        if (fightFloatAni) {
            //第一次激活星灵的时候，飘战力
            this.emit(NotificationKey.FIGHT_UPDATE_ALL_HERO);
            this.emit(NotificationKey.FIGHT_RECALCULATE_ALL_HERO);
        }
        GIns.drawCardModel.addFirstGainItemIdToQueue(petCfgId);
        GIns.drawCardModel.tryShowNewGainHeroByType(EnumGainNewHeroType.REWARD);
    }
}
