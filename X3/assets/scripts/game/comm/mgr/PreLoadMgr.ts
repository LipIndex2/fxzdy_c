import { sp } from "cc";
import BaseSingleton from "../../../core/base/BaseSingleton";
import { Res } from "../../../core/res/Res";
import { ResRef } from "../../../core/res/ResRef";
import { TableManager } from "../../../core/table/TableManager";
import { HeroUtils } from "../../modules/hero/utils/HeroUtils";

/***
 * 预加载管理器
 */
export class PreLoadMgr extends BaseSingleton {

    /***预加载1个英雄的技能特效 */
    public loadHeroEffect(heroId: number): void {
        let heroCfg = HeroUtils.getHeroConfigById(heroId)
        if (heroCfg) {
            this.getHeroSkillEffect(heroCfg.skill0)
            this.getHeroSkillEffect(heroCfg.skill1)
            this.getHeroSkillEffect(heroCfg.skill2)
        }
    }

    private getHeroSkillEffect(skillId: string): void {
        let skillCfg = TableManager.getDataById(table.battle.SkillConfig, skillId);
        if (skillCfg) {
            if (skillCfg.anim) {
                this.loadModelByAnim(skillCfg.anim)
            }
            if (skillCfg.anim2) {
                this.loadModelByAnim(skillCfg.anim)
            }
        }
    }

    private loadModelByAnim(anim: string): void {
        let effCfg = TableManager.getDataById(table.battle.SkillEffectConfig, anim);
        if (effCfg.modelId) {
            for (let i = 0; i < effCfg.modelId.length; i++)
                this.loadModelById(effCfg.modelId[i])
        }
        if (effCfg.modelUpId) {
            for (let i = 0; i < effCfg.modelUpId.length; i++)
                this.loadModelById(effCfg.modelUpId[i])
        }
        if (effCfg.bgModelId) {
            for (let i = 0; i < effCfg.bgModelId.length; i++)
                this.loadModelById(effCfg.bgModelId[i])
        }
        if (effCfg.bgModelId) {
            for (let i = 0; i < effCfg.bgModelId.length; i++)
                this.loadModelById(effCfg.bgModelId[i])
        }
        if (effCfg.sceneEffect) {
            this.loadModelById(effCfg.sceneEffect)
        }
    }

    private loadModelById(modelId: number): void {
        let modelCfg = TableManager.getDataById(table.model.ModelConfig, modelId);
        if (modelCfg) {
            this.load(modelCfg.modelPath, sp.SkeletonData);
        }
    }

    public load(url: string, type: any): void {
        Res.getResRef({ url: url, type: type }, null, (ref: ResRef) => {
            if (!ref) {
                //加载失败
            } else {
                //加载成功
            }
        });
    }
}