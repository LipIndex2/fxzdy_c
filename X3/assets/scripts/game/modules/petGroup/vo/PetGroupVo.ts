import G from "db://assets/scripts/core/comm/G";
import GIns from "../../../GIns";
import { TStage } from "../PetGroupContext";
import { AttrData } from "../../attr/AttrManager";

export class PetGroupVo {
    private _vo: Vo.pet.PetGroupVo
    private _cfg: table.pet.PetGroupConfig

    private _allStarAttrs: XJ.Pet.IGroupInfo[]

    /** 指定阶段的属性缓存 */
    private _fightAttrCache: {
        stage: number   //星级，0为激活羁绊，大于0为指定星级
        attr: AttrData[]//缓存的当前星级生效的总属性
    } = {} as any

    static create(petGroupId: number, vo?: Vo.pet.PetGroupVo) {
        let pgv = new PetGroupVo();
        pgv._vo = vo;
        pgv._cfg = G.TableManager.getDataById(table.pet.PetGroupConfig, petGroupId);
        return pgv;
    }

    resetVo(vo: Vo.pet.PetGroupVo) {
        this._vo = vo;
    }

    /**
     * 羁绊配置Id
     */
    get groupId(): number {
        return this._cfg.id;
        // return this._vo.groupId;
    }

    /**
     * 是否激活
     */
    get activated(): boolean {
        if (!this._vo) {
            return false;
        }
        return this._vo.activated;
    }

    /**
     * 当前激活星数
     */
    get activateStarNum(): number {
        if (!this._vo) {
            return 0;
        }
        return this._vo.activateStarNum;
    }
    //===============================================

    /**
     * 当前羁绊的总星数
     */
    get starNum() {
        let star = 0
        let petContext = GIns.petModel.petContext;
        for (let petCfgId of this._cfg.petBaseIds) {
            let petVo = petContext.getDataByCfgId(petCfgId);
            if (petVo && petVo.star) {
                star += petVo.star;
            }
        }
        return star;
    }



    //region条件判断==========================================================================
    /**
     * 是否满星激活
     */
    isMax() {
        return this.activateStarNum >= this._cfg.activeStar4;
    }

    /**
     * 获取指定阶段是否激活了
     * @param stage 0代表收集阶段，1激活星数1，2代表激活星数2，以此类推
     */
    isActived(stage: TStage) {
        if (stage == 0) {
            return this.activated;
        }

        let stageInfo = this.getStageGroupInfo(stage);
        return this.activateStarNum >= stageInfo.activeStar;
    }

    /**
     * 获取指定阶段是否能激活
     * @param stage 0代表收集阶段，1激活星数1，2代表激活星数2，以此类推
     */
    isStageCanActive(stage: TStage) {
        if (stage == 0) {
            if (this.activated) return false;

            let petContext = GIns.petModel.petContext;
            for (let petCfgId of this._cfg.petBaseIds) {
                let petVo = petContext.getDataByCfgId(petCfgId);
                if (petVo.active == false) {
                    return false;
                }
            }
        } else {
            if (this.activated == false) return false;

            let stageInfo = this.getStageGroupInfo(stage);
            return this.activateStarNum < stageInfo.activeStar && this.starNum >= stageInfo.activeStar;

        }
        return true
    }

    /** 是否能激活羁绊 */
    isCanActive() {
        return this.isStageCanActive(0);
    }

    /** 羁绊能否升级 */
    isCanUpLV() {
        if (this.isMax() || this.activated == false) return false;
        let curStage = this.getCurStage();
        return this.isStageCanActive(curStage + 1);
    }


    //region 数据获取=========================================================================
    getAllStarAttrs(): Readonly<Array<Readonly<XJ.Pet.IGroupInfo>>> {
        if (!this._allStarAttrs) {
            let petGroupCfg = this._cfg;

            let allActiveAttr1 = [...petGroupCfg.baseAttrs, ...petGroupCfg.starAttrs1];
            let allActiveAttr2 = [...petGroupCfg.baseAttrs, ...petGroupCfg.starAttrs1, ...petGroupCfg.starAttrs2];
            let allActiveAttr3 = [...petGroupCfg.baseAttrs, ...petGroupCfg.starAttrs1, ...petGroupCfg.starAttrs2, ...petGroupCfg.starAttrs3];
            let allActiveAttr4 = [...petGroupCfg.baseAttrs, ...petGroupCfg.starAttrs1, ...petGroupCfg.starAttrs2, ...petGroupCfg.starAttrs3, ...petGroupCfg.starAttrs4];
            this._allStarAttrs = [
                {
                    stage: 0,
                    activeStar: 0,
                    curStageAttr: petGroupCfg.baseAttrs,
                    allActiveAttr: petGroupCfg.baseAttrs,
                },
                {
                    stage: 1,
                    activeStar: petGroupCfg.activeStar1,
                    curStageAttr: petGroupCfg.starAttrs1,
                    allActiveAttr: allActiveAttr1,
                },
                {
                    stage: 2,
                    activeStar: petGroupCfg.activeStar2,
                    curStageAttr: petGroupCfg.starAttrs2,
                    allActiveAttr: allActiveAttr2,
                },
                {
                    stage: 3,
                    activeStar: petGroupCfg.activeStar3,
                    curStageAttr: petGroupCfg.starAttrs3,
                    allActiveAttr: allActiveAttr3,
                },
                {
                    stage: 4,
                    activeStar: petGroupCfg.activeStar4,
                    curStageAttr: petGroupCfg.starAttrs4,
                    allActiveAttr: allActiveAttr4,
                }
            ];
        }

        return this._allStarAttrs;
    }

    /**
     * 获取激活的属性
     */
    getActiveFightAttrs(): AttrData[] {
        if (this.activated == false) {
            return [];
        }

        let curStage = this.getCurStage();
        if (this._fightAttrCache.stage != curStage) {
            this._fightAttrCache.attr = this.getAllStarAttrs()[curStage].allActiveAttr.map(v => { return AttrData.create(v.k, v.v); });
            this._fightAttrCache.stage = curStage
        }

        return this._fightAttrCache.attr;
    }

    /**
     * 
     * @param stage 0为激活羁绊属性，大于0的为指定等级的星级属性
     * @returns 
     */
    getStageGroupInfo(stage: TStage): Readonly<XJ.Pet.IGroupInfo> {
        return this.getAllStarAttrs()[stage];
    }

    /**
     * 获取当前所处阶段
     */
    getCurStage(): TStage {
        let activateStarNum = this.activateStarNum;
        if (activateStarNum < this._cfg.activeStar1) {
            return 0;
        }
        if (activateStarNum < this._cfg.activeStar2) {
            return 1;
        }
        if (activateStarNum < this._cfg.activeStar3) {
            return 2;
        }
        if (activateStarNum < this._cfg.activeStar4) {
            return 3;
        }

        return 4
    }

    /**
     * 获取指定阶段激活的所有的属性
     * @param stage 0为激活属性，大于0的数为指定的等级属性
     * @returns 
     */
    getStarAllActiveAttrs(stage?: TStage) {
        if (stage === undefined) {
            stage = this.getCurStage();
        }

        return this.getStageGroupInfo(stage).allActiveAttr;
    }
    /**
     * 获取指定阶段的属性
     * @param stage 
     */
    getStarAttrs(stage?: TStage) {
        if (stage === undefined) {
            stage = this.getCurStage();
        }
        return this.getStageGroupInfo(stage).curStageAttr;
    }

    /**
     * 未满星级激活的情况下，获取当前阶段需要激活的星数
     */
    getStageMaxStar() {
        let curStage = this.getCurStage();
        return this.getStageGroupInfo(curStage).activeStar;
    }

    /**
     * 获取当前激活的星灵数量
     */
    getActivePetNum() {
        let num = 0;
        let petContext = GIns.petModel.petContext;
        for (let petCfgId of this._cfg.petBaseIds) {
            let petVo = petContext.getDataByCfgId(petCfgId);
            if (petVo.active) {
                ++num;
            }
        }
        return num;
    }
    /**
     * 获取激活羁绊需要的星灵数量
     * @returns 
     */
    getAllActivePetNum() {
        return this._cfg.petBaseIds.length;
    }
}