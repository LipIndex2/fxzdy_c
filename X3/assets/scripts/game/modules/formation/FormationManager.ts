import BaseSingleton from "../../../core/base/BaseSingleton";
import { TableManager } from "../../../core/table/TableManager";
import { HeroManager } from "../hero/HeroManager";
import { FormationVo } from "./vo/FormationVo";
import { PositionVo } from "./vo/PositionVo";
import { SoltVo } from "./vo/SoltVo";
import { FormationModel } from "db://assets/scripts/game/modules/formation/model/FormationModel";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { FightType } from "db://assets/scripts/game/comm/battle/enum/FightType";
import G from "db://assets/scripts/core/comm/G";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { EventCaptainSkillChange } from "db://assets/scripts/game/modules/captainSkill/event/EventCaptainSkillChange";
import { HeroCampType } from "db://assets/scripts/game/modules/hero/HeroEnum";
import { EventPetChange } from "../pet/event/EventPetChange";
import { TeamChallengeModel } from "../teamChallenge/model/TeamChallengeModel";


export class FormationManager extends BaseSingleton {
    /**槽位等级状态 */
    private _soltLevelDirty = true;
    /**共鸣等级 */
    private _commonLevel = 1;
    private _avgLv = 1;

    /**槽位等阶状态 */
    private _soltStageDirty = true;
    /**共鸣等级 */
    private _commonStage = 0;

    /**槽位映射 */
    private _soltVoMap: { [positionId: number]: SoltVo } = {};
    /**所有玩法的布阵数据 */
    private _formationMap: { [key: string]: FormationVo } = {};

    /**布阵后自动战斗记录数据*/
    protected _autoFightParamMap: Map<FightType, any> = new Map()

    /**用于记录上阵中有其他玩家英雄的皮肤*/
    protected _skinMap: Map<FightType, Map<number, number>> = new Map()

    /**当前上阵宠物id*/
    protected _trunkPetId:number = 0
    /**宠物战力修正*/
    protected _trunkPetFightMod:number = 0

    /**组队副本可操作阵位 */
    protected _poses:number[];

    constructor () {
        super();
        this.initSlot();
    }

    private initSlot() {
        let posCfg = TableManager.getAllData(table.formation.FormationPositionConfig);
        for (let cfg of posCfg) {
            this._soltVoMap[cfg.id] = new SoltVo();
        }
    }

    /**所有玩法的布阵数据 */
    public get formationMap():{ [key: string]: FormationVo } {
        return this._formationMap;
    }

    /**是否自动挑战*/
    public isAutoFightType(type: FightType): boolean {
        return type == FightType.DAILY_BOSS
            || type == FightType.LEAGUE_BOSS
            || type == FightType.LADDER
            || type == FightType.SECRET_INSTANCE
            || type == FightType.SEASON_SECRET
            || type == FightType.SEASON_BOSS
            || type == FightType.COLLECTIBLES_DUNGEON
    }

    /**添加自动战斗记录数据*/
    public addAutoFightParam(type: FightType, param: any): void {
        if (this.isAutoFightType(type)) {
            this._autoFightParamMap.set(type, param)
        }
    }

    /**获取自动战斗记录参数*/
    public getAutoFightParam(type: FightType): any {
        if (this._autoFightParamMap.has(type)) {
            return this._autoFightParamMap.get(type)
        }
        return null
    }

    /**清除自动战斗记录参数*/
    public deleteAutoFightParam(type: FightType): boolean {
        if (this._autoFightParamMap.has(type)) {
            this._autoFightParamMap.delete(type)
            return true
        }
        return false
    }

    /**转布阵key */
    public getFormationKey(fightType: XJ.EFightType, index: number = 0, subType: string = null) {
        if (!subType) {
            return fightType + "_" + index;
        }
        return fightType + "_" + index + "_" + subType;
    }

    /**自定义数据转布阵key */
    public getFormationKeyByObject(vo: Vo.formation.CustomFormationVo) {
        return this.getFormationKey(vo.fightType, vo.index, vo.subParam);
    }

    /**
     * 获取布阵信息 | 如果没有阵容, 默认返回主线阵容
     * @param fightType 战斗类型
     * @param index 布阵下标（兼容多队）
     * @param subType 子布阵类型
     */
    public getFormationVoByType(fightType: XJ.EFightType,
        index: number = 0,
        subType: string = null,
    ) { 
        
            let formationKey = this.getFormationKey(fightType, index, subType);
            let formationVo = this._formationMap[formationKey];
            if (!formationVo) {
                // 不同步主线阵容
                formationVo = this._formationMap[formationKey] = new FormationVo(fightType, index, subType);
                formationVo.initSoltDatas(this._soltVoMap);
    
            }
            return formationVo;
     
    }

    /**删除布阵信息*/
    public deleteFormationVoByType(fightType: XJ.EFightType,
    index: number = 0,
    subType: string = null,
    ) {
        let formationKey = this.getFormationKey(fightType, index, subType);
        let formationVo = this._formationMap[formationKey];
        if (formationVo) {
            delete this._formationMap[formationKey]
        }
        return formationVo;
    }

    // 阵容是否为空
    isHveFormationByFightType(fightType: XJ.EFightType, index: number, subType: string) {
        let formationKey = this.getFormationKey(fightType, index, subType);
        let formationVo = this._formationMap[formationKey];
        if (formationVo) {
            return !formationVo.isEmptyFormation();
        }
        return formationVo != null;
    }

    /**获取布阵信息 临时信息 */
    public getTempFormationVoByType(fightType: XJ.EFightType,
        index: number = 0,
        subType: string = null
    ): FormationVo {
        const formationVo = this.getFormationVoByType(fightType, index, subType).clone();
        if(fightType == ServerEnums.FightType.TEAM_INSTANCE){
            //组队副本数据需要二次加工
           return TeamChallengeModel.ins().getFormationVo(formationVo);
        }else{
            return formationVo;
        }
         
    }

    /**获取该类型的所有布阵 (多队)*/
    public getFormationVosByType(fightType: XJ.EFightType) {
        let arr = [];
        for (const key in this._formationMap) {
            if (this._formationMap[key].fightType == fightType) {
                arr.push(this._formationMap[key]);
            }
        }
        return;
    }

    /** 设置槽位数据组 */
    public updateSoltData(vo: Vo.formation.SlotVo) {
        if (!vo) return;
        let slotVo = this._soltVoMap[vo.slotBaseId];
        if (slotVo) {
            slotVo.setSoltVoData(vo);
            this._soltStageDirty = this._soltLevelDirty = true; //记录脏数据
        }
    }

    /** 设置槽位数据组 */
    public updateSoltDatas(vos: Vo.formation.SlotVo[]) {
        if (!vos) return;
        for (let vo of vos) {
            let slotVo = this._soltVoMap[vo.slotBaseId];
            if (slotVo) {
                slotVo.setSoltVoData(vo);
            }
        }
        this._soltStageDirty = this._soltLevelDirty = true; //记录脏数据
    }

    /**更新布阵数据 */
    public updatePosData(fightType: XJ.EFightType, vo: Vo.formation.PositionVo) {
        if (!vo) return;
        this.getFormationVoByType(fightType).updatePosData(vo);
    }

    /**更新宠物战力修正*/
    protected updateTrunkPetFightMod(petId:number):void {
        if (this._trunkPetId != petId) {
            this._trunkPetId = petId
            let petCfg = G.TableManager.getDataById(table.pet.PetConfig, petId)
            if (petCfg) {
                this._trunkPetFightMod = petCfg.cpMod
            } else {
                this._trunkPetFightMod = 0
            }
        }
    }

    /**更新宠物战力修正*/
    public get trunkPetFightMod():number {
        return this._trunkPetFightMod
    }

    /**更新布阵数据组 （仅传统布阵使用）*/
    public updatePosDatasByTrunk(fightType: XJ.EFightType, vos: Vo.formation.PositionVo[], collectiblesId: number, petId:number) {
        if (!vos) {
            return;
        }
        const formationVo = this.getFormationVoByType(fightType);
        // 更换了收藏品
        if (formationVo.collectionsId !== collectiblesId) {
            formationVo.collectionsId = collectiblesId;
        }
        // 更换了宠物
        if (formationVo.petId !== petId) {
            formationVo.petId = petId;
            G.FacadeManager.emit(NotificationKey.PET_CHANGE, EventPetChange.create(fightType, petId))
        }
        formationVo.updatePosDatas(vos);
        this.updateTrunkPetFightMod(petId)
    }

    /**更新布阵数据组 （通用布阵）这里做整个的数据更新的呢*/
    public updatePosDatas(vo: Vo.formation.CustomFormationVo) {
        if (!vo) {
            return;
        }

        const formationVo = this.getFormationVoByType(vo.fightType, vo.index, vo.subParam);
        let collectiblesId = vo.formationVo.collectiblesId;
        let petId = vo.formationVo.petBaseId;
        // 更换了收藏品
        if (formationVo.collectionsId !== collectiblesId) {
            formationVo.collectionsId = collectiblesId;
        }

        // 更换了宠物
        if (formationVo.petId !== petId) {
            formationVo.petId = petId;
            G.FacadeManager.emit(NotificationKey.PET_CHANGE, EventPetChange.create(vo.fightType, petId))
        }

        let posVos = [];
        for (let key of Object.keys(vo.formationVo.positionVoMap)) {
            const posVo = vo.formationVo.positionVoMap[key];
            posVos.push(posVo);
        }

        formationVo.updatePosDatas(posVos);
    }

    /** 阵位id获取 阵位信息 （世界）*/
    public getPosVoById(posId: number) {
        return this.getFormationVoByType(ServerEnums.FightType.TRUNK_MAP).getPosDataById(posId) || null;
    }

    /**
     * 判断是否达到目标等级
     * @param targetLv
     */
    public isGreaterEqualsThanLv(targetLv: number): boolean {
        if (!targetLv) {
            return true;
        }
        return this.getCommonLevel() >= targetLv;
    }

    /**
     * 默认阵容 | 大世界
     */
    public getDefaultFormationVo(): FormationVo {
        return this.getFormationVoByType(ServerEnums.FightType.TRUNK_MAP);
    }


    /**
     * default 阵容位置
     */
    public getDefaultFormationPositionArray(): PositionVo[] {
        return this.getDefaultFormationVo()?.allPosData || [];
    }

    /**
     * 刷新共鸣等级
     */
    private refreshCommonLevel(): number {
        let level = 9999;
        for (const key in this._soltVoMap) {
            let soltVo = this._soltVoMap[key];
            if (soltVo.level < level) {
                level = soltVo.level;
            }
        }
        return level || 1;
    }

    private refreshAvgCommonLevel(): number {
        let level = 0;
        let count = 0;
        for (const key in this._soltVoMap) {
            let soltVo = this._soltVoMap[key];
            level += soltVo.level
            count += 1;
        }
        if (count <= 0) {
            return 1;
        }
        return Math.floor(level / count);
    }

    /** 获取共鸣等级(槽位最低等级) */
    public getCommonLevel(): number {
        this.tryUpdateLv();
        return this._commonLevel;
    }

    private tryUpdateLv() {
        if (!this._soltLevelDirty) {
            return;
        }
        this._avgLv = this.refreshAvgCommonLevel();
        this._commonLevel = this.refreshCommonLevel();
        this._soltLevelDirty = false;
    }

    /**
     * 平均共鸣等级
     * */
    public getAvgCommonLevel(): number {
        this.tryUpdateLv();
        return this._avgLv;
    }


    /**刷新共鸣等阶*/
    private refreshCommonStage() {
        let stage = 9999;
        for (const key in this._soltVoMap) {
            let soltVo = this._soltVoMap[key];
            if (soltVo.stage < stage) {
                stage = soltVo.stage;
            }
        }
        return stage || 0;
    }

    /** 获取共鸣等阶(槽位最低等阶)*/
    public getCommonStage() {
        if (this._soltStageDirty) {
            this._commonStage = this.refreshCommonStage();
            this._soltStageDirty = false;
        }
        return this._commonStage;
    }

    /** 获取所有阵位Vo数据*/
    public getAllPosData(): PositionVo[] {
        return this.getFormationVoByType(ServerEnums.FightType.TRUNK_MAP).allPosData;
    }

    /** 获取所有上阵的PosVo*/
    public getHeroInPosVos(
        fightType: XJ.EFightType = ServerEnums.FightType.TRUNK_MAP,
        index: number = 0,
        subType: string = null,
    ) {
        let posVos: PositionVo[] = [];
        let allPosData = this.getFormationVoByType(fightType, index, subType).allPosData;
        for (let data of allPosData) {
            if (data.heroId) {
                posVos.push(data);
            }
        }

        return posVos;
    }

    /**
     * 获取无英雄的阵位id（无则返回空数组）
     * @param allPosData 阵位数据组
     * @returns
     */
    public getVacantPosIds(allPosData: PositionVo[], fightType: FightType = null): PositionVo[] {
        let idArr: PositionVo[] = [];
        if(fightType == FightType.TEAM_INSTANCE){
            const poses = this.getPoses();
            for (let data of allPosData) {
                if (!data.heroId && data.isUnlock && poses.indexOf(data.BaseId) != -1) {
                    idArr.push(data);
                }
            }
        }else{
            for (let data of allPosData) {
                if (!data.heroId && data.isUnlock) {
                    idArr.push(data);
                }
            }
        }

        return idArr;
    }


    /** 获取一键布阵的data */
    public getFormationDatas(limitCampType: HeroCampType | null, excludes:number[] = null, fightType:FightType = null) {
        let heroVos = HeroManager.ins().getHeroListByFight();
        if (limitCampType) {
            heroVos = heroVos.filter(vo => vo.campType === limitCampType);
        }
        if (excludes) {
            heroVos = heroVos.filter(vo => excludes.indexOf(vo.baseId) == -1)
        }

        let posCfg = TableManager.getAllData(table.formation.FormationPositionConfig);

        let positionVos: Vo.formation.PositionVo[] = [];
        if(fightType == FightType.TEAM_INSTANCE){
            const poses = this.getPoses();
			poses.forEach((v,k)=>{
                let vo: Vo.formation.PositionVo = {
                    position: v,
                    heroBaseId: heroVos[k].baseId,
                }
                positionVos.push(vo);
			})
 
        }else{
            for (let i = 0; i < posCfg.length; i++) {
                if (i < heroVos.length) {
                    const cfg = posCfg[i];
                    let soltVo = this._soltVoMap[cfg.id];
    
                    if (soltVo?.isUnlock) {
                        let vo: Vo.formation.PositionVo = {
                            position: cfg.id,
                            heroBaseId: heroVos[i].baseId,
                        }
                        positionVos.push(vo);
                    }
                }
            }    
        }

        return positionVos;
    }

    /** 获取推荐布阵的缺少英雄 */
    public getFormationDiscoutLack(heroList: string) {
        let heroL = heroList.split(",");
        let lackList = [];
        for (let heroId of heroL) {
            if (heroId) {
                let vo = HeroManager.ins().isHaveHero(Number(heroId));
                if (!vo) lackList.push(heroId)
            }
        }
        return lackList;
    }


    /** 
     * 获取推荐布阵的布阵数据，并根据缺少的对象补齐
     * isCompletion 补齐队伍
     *  */
    public getFormationDiscountDatas(heroList: string, lackId: string[], isCompletion = true) {
        let heroL = heroList.split(",");
        let heroVos = HeroManager.ins().getHeroListByFight();
        if (lackId.length > 0) {//过滤当前已选中的
            heroVos = heroVos.filter(vo => { return heroL.indexOf(String(vo.baseId)) == -1 });
            heroL = heroL.filter(vo => { return lackId.indexOf(vo) == -1 });
        }

        let posCfg = TableManager.getAllData(table.formation.FormationPositionConfig);

        let positionVos: Vo.formation.PositionVo[] = [];
        for (let i = 0; i < posCfg.length; i++) {
            const cfg = posCfg[i];
            let soltVo = this._soltVoMap[cfg.id];

            if (soltVo?.isUnlock) {
                let vo: Vo.formation.PositionVo = null;
                let heroBaseId = heroL[i] ? Number(heroL[i]) : ((heroVos[i - heroL.length] && isCompletion) ? heroVos[i - heroL.length].baseId : null);
                vo = { position: cfg.id, heroBaseId: heroBaseId, }
                positionVos.push(vo);
            }
        }

        return positionVos;
    }

    /**站位强度排序 */
    getSoltTop(){
        const list = [];
        const t = this;
        for (const key in this._soltVoMap) {
            list.push(key);
        }
        list.sort((a:string, b:string)=>{
            const aVo = this._soltVoMap[a];
            const bVo = this._soltVoMap[b];
            return (bVo.stage * 100000 + bVo.level * 1000) - (aVo.stage * 100000 + aVo.level * 1000);
        })
        return list;
    }

    getSlotVo(id:number):SoltVo{
        return this._soltVoMap[id];
    }

    /**获取上阵了几个英雄 */
    getHeroCount(reqVo: Vo.formation.SetupFormationReqVo):number{
        const vos = reqVo.positionVos;
        let count = 0;
        vos.forEach(v=>{
            if(v.heroBaseId){
                count++;
            }
        })
        return count;
    }
    
    setPoses(poses:number[]){
        this._poses = poses;
    }

    getPoses():number[]{
       return this._poses;
    }


    setSkinMap(type:FightType, map:Map<number,number>){
        this._skinMap.set(type, map);
    }

    getSkinMap(type:FightType):Map<number,number>{
        return this._skinMap.get(type);
    }
}

