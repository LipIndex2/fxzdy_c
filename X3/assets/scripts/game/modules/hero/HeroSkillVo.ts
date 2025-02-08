import { TableManager } from "../../../core/table/TableManager";
import { SkillConfigDatas } from "../../table/battle/SkillConfigDatas";
import { HeroSkillData } from "./HeroVo";





/** 英雄VO */
export class HeroSkillVo {

    /** 英雄数据data */
    private _skillVoData: HeroSkillData;

    /** 设置英雄数据 */
    public setData(data: HeroSkillData) {
        if (!data) return;
        this._skillVoData = data;
    }

    get data() {
        return this._skillVoData;
    }

    /** 获取当前等级的技能id(为解锁技能返回"") */
    get nowSkillId() {
        let cfg: table.battle.SkillConfig;
        if (this._skillVoData.unlock) {
            cfg = SkillConfigDatas.ins().getConfigByLevel(this._skillVoData.groupId, this._skillVoData.level);
        }
        return cfg?.id || "";
    }

}