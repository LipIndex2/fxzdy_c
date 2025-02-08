import G from "db://assets/scripts/core/comm/G";
import { GroupType, HeroCampType, HeroCareerType } from "db://assets/scripts/game/modules/hero/HeroEnum";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import BaseSingleton from "../../../core/base/BaseSingleton";
import { IFormationFetterTypeVo, IFormationFetterVo, IFromationFetterCntCfgs } from "./vo/IFormationFetterVo";


/**
 * 羁绊配置处理
*/
export class FormationConfigManager extends BaseSingleton {
    protected _isInit: boolean = false;

    protected _fetterCfgMap: Map<string, IFormationFetterVo> = new Map();

    onInit(): void {
        if (this._isInit == false) {
            this._isInit = true;

            let allCfgs = G.TableManager.getAllData(table.formation.FormationGroupConfig);
            allCfgs.forEach((cfg) => {
                //这里只处理有被动技能的 主动技能需要在战队科技中处理
                let vo: IFormationFetterVo = null;
                if (this._fetterCfgMap.has(cfg.groupType)) {
                    vo = this._fetterCfgMap.get(cfg.groupType);
                } else {
                    vo = {
                        groupType: cfg.groupType,
                        typeVoMap: new Map()
                    }
                    this._fetterCfgMap.set(cfg.groupType, vo);
                }
                let typeVo: IFormationFetterTypeVo = null;
                if (vo.typeVoMap.has(cfg.typeParam)) {
                    typeVo = vo.typeVoMap.get(cfg.typeParam);
                    if (typeVo.minTriggerCnt > cfg.triggerCount) {
                        typeVo.minTriggerCnt = cfg.triggerCount
                    }
                    if (typeVo.maxTriggerCnt < cfg.triggerCount) {
                        typeVo.maxTriggerCnt = cfg.triggerCount;
                    }
                } else {
                    typeVo = {
                        typeParam: cfg.typeParam,
                        cntCfgsMap: new Map(),
                        minTriggerCnt: cfg.triggerCount,
                        maxTriggerCnt: cfg.triggerCount,
                    };
                    vo.typeVoMap.set(cfg.typeParam, typeVo);
                }
                let cntCfgs: IFromationFetterCntCfgs = null;
                if (typeVo.cntCfgsMap.has(cfg.triggerCount)) {
                    cntCfgs = typeVo.cntCfgsMap.get(cfg.triggerCount);
                } else {
                    cntCfgs = {
                        triggetCnt: cfg.triggerCount,
                        passiveCfgs: [],
                        captainSkillCfgs: [],
                        allCfgs:[]
                    };
                    typeVo.cntCfgsMap.set(cfg.triggerCount, cntCfgs);
                }
                if (cfg.passiveId > 0) {
                    cntCfgs.passiveCfgs.push(cfg);
                }
                if (cfg.captainSkillId > 0) {
                    cntCfgs.captainSkillCfgs.push(cfg)
                }
                cntCfgs.allCfgs.push(cfg);
            });
        }
    }

    /**获取被动列表*/
    public getPassiveFetterTypeVo(groupType: GroupType, type: HeroCampType | HeroCareerType | ServerEnums.Career): IFormationFetterTypeVo {
        if (this._fetterCfgMap.has(groupType)) {
            let groupVo = this._fetterCfgMap.get(groupType);
            if (type) {
                let typeVo = groupVo.typeVoMap.get(type);
                if (typeVo) {
                    return typeVo;
                }
            }
        }
        return null;
    }

    /**获取被动列表*/
    public getPassiveFetterCfgs(groupType: GroupType, type: HeroCampType | HeroCareerType | ServerEnums.Career): IFromationFetterCntCfgs[] {
        let typeVo = this.getPassiveFetterTypeVo(groupType, type);
        if (typeVo) {
            return Array.from(typeVo.cntCfgsMap.values());
        }
        return [];
    }
}

