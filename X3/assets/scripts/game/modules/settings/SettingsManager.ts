import { IModuleAttrApi } from "db://assets/scripts/game/modules/attr/api/IModuleAttrApi";
import { AttrData } from "db://assets/scripts/game/modules/attr/AttrManager";
import { SettingsModel } from "db://assets/scripts/game/modules/settings/model/SettingsModel";
import BaseSingleton from "db://assets/scripts/core/base/BaseSingleton";
import { IBattleUnitData } from "../battle/vo/IBattleUnitData";
import GIns from "../../GIns";
import G from "../../../core/comm/G";
import { ServerEnums } from "../../../libs/extras/ServerEnums";

export class SettingsManager extends BaseSingleton implements IModuleAttrApi {


    getMergedAllAddAttrDataArray(): Array<AttrData> {
        const context = SettingsModel.ins().context;

        return context.getAllAddAttrDataArray();
    }

    /**获取角色形象的英雄单位数据*/
    getHeroBattleDataForImage():IBattleUnitData[] {
        let curImage = GIns.settingsModel.context.getImageId();
        let cfg = G.TableManager.getDataById(table.set.SetShowConfig, curImage);
        if (cfg) {
            let heroVo = GIns.heroMgr.getHeroVoByID(cfg.heroId);
            let temp = heroVo.allAttrDataArr();
            let attrs = {};
            for (let i = 0; i < temp.length; i++) {
                let attrCfg = G.TableManager.getDataById(table.battle.AttributeConfig, temp[i].id);
                if (!attrs[attrCfg.tid]) attrs[attrCfg.tid] = temp[i].num;
                else attrs[attrCfg.tid] += temp[i].num;
            }
            let heroSkills = GIns.heroMgr.getHeroSkills(cfg.heroId);
            let data: IBattleUnitData = {
                configId: cfg.heroId,
                type: ServerEnums.UnitType.HERO,
                level: GIns.formationMgr.getCommonLevel(),
                stage: GIns.formationMgr.getCommonStage(),
                star: heroVo.star,
                skillIds: heroSkills,
                modelId: cfg.heroModelId,
                skinId: heroVo.skinId,
                attrs: attrs,
                position: 1,
            } as IBattleUnitData;
            return [data];
        }
        return []
    }
}