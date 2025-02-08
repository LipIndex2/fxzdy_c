import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { TableManager } from "../../../../core/table/TableManager";
import GIns from "../../../GIns";
import { GroupType, HeroCampType, HeroCareerType } from "../../hero/HeroEnum";
import { IFetterData } from "./IFetterData";
import { PositionVo } from "./PositionVo";
import { SoltVo } from "./SoltVo";

/**多队玩法需要在这里添加类型
 * @see ServerEnums.FightType
 */
export enum TeamsFightType {}

/** 布阵数据Vo */
export class FormationVo {
    /**玩法类型*/
    public fightType: XJ.EFightType;

    /**阵容下标 兼容多队 */
    public index: number = 0;

    /**子类型参数 （空则没有子类型）*/
    public subType: string;

    /**是否是多队 */
    public isTeams: boolean = false;

    // 收藏品id
    private _collectionsId: number = 0;

    // 宠物ID
    private _petId: number = 0;

    /** 所有布阵vo数据 */
    private _allPosData: PositionVo[] = [];
    /** 所有布阵vo数据，按照ID存储 */
    private _allPosDataMap: { [posID: number]: PositionVo } = {};

    /**羁绊是否脏数据 */
    private _isFetterDirty: boolean = true;

    constructor(fightType: XJ.EFightType, index: number = 0, subType: string = null) {
        this.fightType = fightType;
        this.index = index;
        this.subType = subType;
        this.isTeams = !!TeamsFightType[fightType];
        this.initPositionVos();
    }

    public get allPosData(): PositionVo[] {
        return this._allPosData;
    }

    // 收藏品id
    get collectionsId(): number {
        return this._collectionsId;
    }
    // 收藏品id
    set collectionsId(value: number) {
        this._collectionsId = value;
    }

    //宠物id
    get petId(): number {
        return this._petId;
    }

    //宠物id
    set petId(value: number) {
        this._petId = value;
    }

    /**获取阵位数据 */
    public getPosDataById(posId: number) {
        return this._allPosDataMap[posId];
    }

    // 获取指定类型英雄的数量
    getCountByCareerType(type: ServerEnums.Career): number {
        let n = 0;
        for (let posId in this._allPosDataMap) {
            const posVo = this._allPosDataMap[posId];
            if (posVo.heroId) {
                let cfg = TableManager.getDataById(table.hero.HeroConfig, posVo.heroId);
                const heroCareer = ServerEnums.Career[cfg.career];
                if (heroCareer == type) {
                    n += 1;
                }
            }
        }
        return n;
    }

    /**初始化 */
    private initPositionVos() {
        let posCfg = TableManager.getAllData(table.formation.FormationPositionConfig);
        for (let cfg of posCfg) {
            let vo = new PositionVo(cfg.id);
            vo.isTeams = this.isTeams;
            this._allPosDataMap[cfg.id] = vo;
            this._allPosData.push(vo);
        }
    }

    /** 初始化布阵数据组 */
    public initSoltDatas(voMap: { [positionId: number]: SoltVo }) {
        if (!voMap) return;
        for (const positionId in voMap) {
            let posVo = this._allPosDataMap[positionId];
            if (posVo) {
                posVo.setSoltVoData(voMap[positionId]);
            }
        }
    }

    /** 初始化布阵数据 */
    public updatePosData(vo: Vo.formation.PositionVo) {
        if (!vo) return;
        let posVo = this._allPosDataMap[vo.position];
        if (posVo) {
            let posVoDate = {
                positionId: vo.position,
                heroBaseId: vo.heroBaseId,
            };
            posVo.setPosVoData(posVoDate);
        }
        this._isFetterDirty = true;
    }

    /** 初始化布阵数据组 */
    public updatePosDatas(vos: Vo.formation.PositionVo[]) {
        if (!vos) return;
        for (let vo of vos) {
            this.updatePosData(vo);
        }
    }

    /**克隆 */
    public clone() {
        let formationVo = new FormationVo(this.fightType, this.index, this.subType);
        formationVo.collectionsId = this._collectionsId;
        formationVo.petId = this._petId;
        let allPosData = formationVo.allPosData;
        for (let newPosData of allPosData) {
            let oldPosData = this._allPosDataMap[newPosData.BaseId];
            newPosData.setSoltVoData(oldPosData.soltVo);
            newPosData.setPosVoData(oldPosData.getPositionVoData());
        }
        return formationVo;
    }

    /*******************************************  布阵羁绊  ****************************************/
    /** 所有阵营数据，按照Type存储 */
    private _allCampByType: { [type: number]: HeroCampType };
    /** 所有职业数据，按照Type存储 */
    private _allCareerByType: { [type: number]: ServerEnums.Career };

    /**
     * 更新羁绊数组
     */
    public updateCampCount() {
        this._isFetterDirty = false;

        this._allCampByType = {};
        this._allCareerByType = {};
        let allData = this._allPosData;

        for (let posVo of allData) {
            if (posVo.heroId) {
                let cfg = TableManager.getDataById(table.hero.HeroConfig, posVo.heroId);
                if (this._allCampByType[cfg.camp]) {
                    this._allCampByType[cfg.camp] += 1;
                } else {
                    this._allCampByType[cfg.camp] = 1;
                }

                let heroVo = GIns.heroMgr.getHeroVoByID(posVo.heroId);
                if (this._allCareerByType[ServerEnums.Career[cfg.career]]) {
                    this._allCareerByType[ServerEnums.Career[cfg.career]] += heroVo.getCareerCount();
                } else {
                    this._allCareerByType[ServerEnums.Career[cfg.career]] = heroVo.getCareerCount();
                }
            }
        }
    }

    /** 获取对应type的阵营羁绊数量  不填则获取所有羁绊data */
    public getCampCount(type: number) {
        if (this._isFetterDirty) {
            this.updateCampCount();
        }

        let arr: IFetterData[] = [];
        if (!type) {
            for (let k in this._allCampByType) {
                let data: IFetterData = {
                    type: Number(k),
                    num: this._allCampByType[k] || 0,
                };
                arr.push(data);
            }
        } else {
            let data: IFetterData = {
                type: type,
                num: this._allCampByType[type] || 0,
            };
            arr.push(data);
        }

        return arr;
    }

    /** 获取对应type的职业羁绊数量  不填则获取所有羁绊data */
    public getCareerCount(type: number) {
        if (this._isFetterDirty) {
            this.updateCampCount();
        }

        let arr: IFetterData[] = [];
        if (!type) {
            for (let k in this._allCareerByType) {
                let data: IFetterData = {
                    type: Number(k),
                    num: this._allCareerByType[k] || 0,
                };
                arr.push(data);
            }
        } else {
            let data: IFetterData = {
                type: type,
                num: this._allCareerByType[type] || 0,
            };
            arr.push(data);
        }

        arr.sort((a, b) => {
            return b.num - a.num;
        });

        return arr;
    }

    /** 获取数量最多的阵营羁绊 */
    public getLargestCamp(): IFetterData {
        if (this._isFetterDirty) {
            this.updateCampCount();
        }

        let type = HeroCampType.Human;
        let num = 0;
        for (let k in this._allCampByType) {
            if (this._allCampByType[k] > num) {
                num = this._allCampByType[k];
                type = Number(k);
            }
        }

        return { type: type, num: num };
    }

    /** 获取数量最多的职业羁绊 */
    public getLargestCareer(): IFetterData {
        if (this._isFetterDirty) {
            this.updateCampCount();
        }

        let type = HeroCareerType.Guard;
        let num = 0;
        for (let k in this._allCareerByType) {
            if (this._allCareerByType[k] > num) {
                num = this._allCareerByType[k];
                type = Number(k);
            }
        }

        return { type: type, num: num };
    }

    /**
     * 获取对应阵营或者职业羁绊配置表
     * @param groupType  GroupType.CAMP阵营    GroupType.CAREER职业
     * @param type  HeroCampType  HeroCareerType
     */
    public getCampFetterCfg(groupType: GroupType, type: HeroCampType | HeroCareerType | ServerEnums.Career) {
        let allCfg = TableManager.getAllData(table.formation.FormationGroupConfig);
        let cfgArr: table.formation.FormationGroupConfig[] = [];
        for (let cfg of allCfg) {
            if (cfg.groupType == groupType && cfg.typeParam == type) {
                cfgArr.push(cfg);
            }
        }

        return cfgArr;
    }

    /** 获取所有已激活的阵容羁绊 */
    public getAllActivateSkillCfgs() {
        let arr: table.formation.FormationGroupConfig[] = [];

        if (!GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.FETTER)) {
            return arr;
        }
        //阵营
        let campDatas = this.getCampCount(null);
        campDatas?.forEach((data) => {
            if (data.num > 0) {
                let cfgs = this.getCampFetterCfg(GroupType.CAMP, data.type);
                cfgs.forEach((cfg) => {
                    if (cfg.passiveId > 0 && cfg.triggerCount <= data.num) {
                        arr.push(cfg);
                    }
                });
            }
        });
        //职业
        let careerDatas = this.getCareerCount(null);
        careerDatas?.forEach((data) => {
            if (data.num > 0) {
                let cfgs = this.getCampFetterCfg(GroupType.CAREER, data.type);
                cfgs.forEach((cfg) => {
                    if (cfg.passiveId > 0 && cfg.triggerCount <= data.num) {
                        let isUnlock = GIns.captainSkillMgr.isHaveUnlockFetter(cfg.id);
                        if (isUnlock) {
                            arr.push(cfg);
                        }
                    }
                });
            }
        });
        return arr;
    }

    /** 获取所有已激活的战队科技技能*/
    public getAllActivateCaptainSkillCfgs() {
        let arr: table.formation.FormationGroupConfig[] = [];
        //阵营
        let campDatas = this.getCampCount(null);
        campDatas?.forEach((data) => {
            if (data.num > 0) {
                let cfgs = this.getCampFetterCfg(GroupType.CAMP, data.type);
                cfgs.forEach((cfg) => {
                    if (cfg.captainSkillId > 0 && cfg.triggerCount <= data.num) {
                        arr.push(cfg);
                    }
                });
            }
        });

        //职业
        let careerDatas = this.getCareerCount(null);
        careerDatas?.forEach((data) => {
            if (data.num > 0) {
                let cfgs = this.getCampFetterCfg(GroupType.CAREER, data.type);
                cfgs.forEach((cfg) => {
                    if (cfg.captainSkillId > 0 && cfg.triggerCount <= data.num) {
                        let isUnlock = GIns.captainSkillMgr.isHaveUnlockFetter(cfg.id);
                        if (isUnlock) {
                            arr.push(cfg);
                        }
                    }
                });
            }
        });
        return arr;
    }

    /** 获取所有的推荐列表阵容 */
    public getAllFormationRecList(): Array<table.formation.FormationDiscountConfig[]> {
        let allCfg = TableManager.getAllData(table.formation.FormationDiscountConfig);
        let cfgArr: Array<table.formation.FormationDiscountConfig[]> = [];
        for (let cfg of allCfg) {
            cfgArr[cfg.tapIdx - 1] = cfgArr[cfg.tapIdx - 1] || [];
            cfgArr[cfg.tapIdx - 1].push(cfg);
        }

        return cfgArr;
    }

    /**
     * 获取对应上阵数量激活的最高效果
     * @param groupType  GroupType.CAMP阵营    GroupType.CAREER职业
     * @param type  HeroCampType  HeroCareerType
     * @param count  上阵的数量
     */
    public getCampFetterLvCfg(groupType: GroupType, type: HeroCampType | HeroCareerType | ServerEnums.Career, count: number) {
        let allCfg = TableManager.getAllData(table.formation.FormationGroupConfig);
        let lvCfg: table.formation.FormationGroupConfig = null;
        for (let cfg of allCfg) {
            if (cfg.groupType == groupType && cfg.typeParam == type && count >= cfg.triggerCount) {
                if (!lvCfg || cfg.triggerCount > lvCfg.triggerCount) {
                    lvCfg = cfg;
                }
            }
        }

        return lvCfg;
    }

    toSetUpReqVo(): Vo.formation.SetupFormationReqVo {
        return {
            petBaseId: this._petId,
            collectiblesId: this._collectionsId,
            positionVos: this._allPosData.map((posVo) => posVo.toReqPosVo()),
        } as Vo.formation.SetupFormationReqVo;
    }

    // 是否空阵容
    isEmptyFormation(): boolean {
        if (!this._allPosData) {
            return true;
        }
        let isEmpty = true;
        for (let allPosDatum of this._allPosData) {
            if (!isEmpty) {
                break;
            }
            const heroId = allPosDatum.heroId || 0;
            isEmpty = heroId == 0;
        }
        return isEmpty;
    }

    // 是否满阵容
    isFullFormation(): boolean {
        if (!this._allPosData) {
            return true;
        }
        let isFull: boolean = true;
        for (let i = 0; i < this._allPosData.length; i++) {
            if (!this._allPosData[i].heroId) {
                isFull = false;
                break;
            }
        }
        return isFull;
    }
}
