import { _decorator } from 'cc';
import BaseSingleton from "db://assets/scripts/core/base/BaseSingleton";
import { AttrData } from "db://assets/scripts/game/modules/attr/AttrManager";
import { IModuleAttrApi } from "db://assets/scripts/game/modules/attr/api/IModuleAttrApi";
import { IFightFromModuleData } from "db://assets/scripts/game/modules/fight/api/IFightFromModuleApi";
import G from '../../../core/comm/G';
import GIns from '../../GIns';
import { AttrEffectUtils } from '../attr/utils/AttrEffectUtils';
import { IBattleCaptainData } from '../battle/vo/IBattleCaptainData';
import { CaptainSkillModel } from './model/CaptainSkillModel';
import { CaptainSkillUtils, ICaptainFetterData } from './utils/CaptainSkillUtils';
import { IBattleTeamData } from '../battle/vo/IBattleTeamData';
import { ServerEnums } from '../../../libs/extras/ServerEnums';
import { GroupType } from '../hero/HeroEnum';

const { ccclass, property } = _decorator;

/**
 * 战队科技
 */
export class CaptainSkillManager extends BaseSingleton implements IModuleAttrApi {

    onInit(): void {
        CaptainSkillUtils.onInit();
    }

    /**获取所有激活的战队科技技能配置列表*/
    public getAllActiveSkillCfgs(): table.captain.CaptainSkillConfig[] {
        return GIns.captainSkillModel.context.activeSkillCfgs;
    }

    /**获取上阵的队长技能数据 */
    public getCaptainData() {
        let cfgs = this.getAllActiveSkillCfgs();
        let realCaptainSkillIds = cfgs.map((value) => value.id + '');
        let data: IBattleTeamData = {
            skillIds: realCaptainSkillIds,
            type: ServerEnums.UnitType.CAPTAIN
        };
        return data;
    }

    /**
     * 获取某个 captainId 的所有加成属性
     * @param captainId
     */
    getCaptainSkillAttrById(captainId: number): AttrData[] {
        let arr: AttrData[] = [];
        const lv = CaptainSkillModel.ins().getLvBySkillId(captainId);
        // 满足等级的所有配置
        const config = CaptainSkillUtils.getCaptainSkillLvConfigByIdAndLv(captainId, lv);
        if (config) {
            if (config.addAttrArray1?.length > 0) {
                // let effectType1 = AttrEffectUtils.getEffectTypeByName(config.effectType1);
                arr = arr.concat(AttrData.fromTableConfig(config.addAttrArray1))
            }
            if (config.effectType2 && config.addAttrArray2?.length > 0) {
                let effectType2 = AttrEffectUtils.getEffectTypeByName(config.effectType2);
                arr = arr.concat(AttrData.fromTableConfig(config.addAttrArray2, effectType2))
            }
        }
        return arr;
    }

    /**核心科技加成*/
    getCaptainSkillCoreAttrs():AttrData[] {
        let arr: AttrData[] = [];
        let coreLv = GIns.captainSkillModel.context.coreLv;
        let config = G.TableManager.getDataById(table.captain.CaptainCoreLevelConfig, coreLv);
        if (config) {
            arr = arr.concat(AttrData.fromTableConfig(config.attrs))
        }
        return arr;
    }

    /**
     * 该模块所有合并后的属性
     */
    getMergedAllAddAttrDataArray(): Array<AttrData> {
        const captainIdArray = CaptainSkillModel.ins().getAllCaptainSkillId();

        let arr: AttrData[] = [];
        for (let captainId of captainIdArray) {
            let list: AttrData[] = this.getCaptainSkillAttrById(captainId);
            arr = arr.concat(list)
        }
        let coreAttrs = this.getCaptainSkillCoreAttrs();
        if (coreAttrs && coreAttrs.length > 0) {
            arr = arr.concat(coreAttrs);
        }
        return arr;
    }

    /**获取所有技能战力修正*/
    getAllAddPowers(): IFightFromModuleData[] {
        let arr: IFightFromModuleData[] = [];
        let cfgs = this.getAllActiveSkillCfgs();
        cfgs?.forEach((cfg) => {
            let data: IFightFromModuleData = {
                Mod: cfg.cpMod / 10000,
                Fight: cfg.cpWorth
            }
            arr.push(data);
        })
        return arr;
    }

    /**是否解锁了某个职业的羁绊*/
    isHaveUnlockAnyFetterForCareer(career:number, fetterCnt:number):boolean {
        let typeVo = GIns.formationCfgMgr.getPassiveFetterTypeVo(GroupType.CAREER, career);
        if (typeVo && typeVo.minTriggerCnt <= fetterCnt) {
            return this.isHaveUnlockFetter(typeVo.cntCfgsMap.get(typeVo.minTriggerCnt).allCfgs[0].id);
        }
        return false;
    }

    getMaxFetterCntFroCareer(career:number):number {
        let typeVo = GIns.formationCfgMgr.getPassiveFetterTypeVo(GroupType.CAREER, career);
        if (typeVo) {
            for (let i = typeVo.maxTriggerCnt; i >= typeVo.minTriggerCnt; i--) {
                let cntCfg = typeVo.cntCfgsMap.get(i);
                if (cntCfg && this.isHaveUnlockFetter(cntCfg.allCfgs[0].id)) {
                    return i;
                }
            }
        }
        return 0;
    }

    /**
     * 是否解锁了羁绊
     * @param fetterId
     */
    isHaveUnlockFetter(fetterId: number): boolean {
        let fetterData: ICaptainFetterData = CaptainSkillUtils.getFetterData(fetterId);
        if (fetterData == null) {
            //没有配置 代表没有限制
            return true;
        }
        let lv = GIns.captainSkillModel.getLvBySkillId(fetterData.captainId);
        if (lv >= fetterData.captainLv) {
            //满足等级条件
            return true;
        }
        return false;
    }

    isUnlockCaptainSkill(): boolean {
        let map = GIns.captainSkillModel.getCaptainIdToLvMap();
        let isUnlock: boolean = false;
        for (let lv of map.values()) {
            if (lv >= 0) {
                isUnlock = true;
                break;
            }
        }
        return isUnlock;
    }
}



