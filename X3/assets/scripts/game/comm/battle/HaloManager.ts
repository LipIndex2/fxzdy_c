import { TableManager } from "../../../core/table/TableManager";
import { ICaster } from "./skill/ICaster";
import { ITarget } from "./skill/ITarget";
import { SkillHalo } from "./skill/SkillHalo";
import { BattleUnit } from "./unit/battle/BattleUnit";
import { HaloType, SkillSubType } from "./skill/SkillEnum";
import { SkillBehavior } from "./skill/SkillBehavior";
import HaloFactory from "./factory/HaloFactory";
import { BulletUnit } from "./unit/bullet/BulletUnit";
import { BattleLogic } from "./BattleLogic";
import { SkillUtils } from "./skill/SkillUtils";
import { HurtHalo } from "./halo/HurtHalo";
import BattleConstantConfig from "./config/BattleConstantConfig";

export class HaloManager {

    /**HaloMgr的数组，会不断遍历，当HALONFO标记删除，才会删除 */
    private halos: SkillHalo[] = [];
    private uid: number = 0;
    public battleLogic: BattleLogic;

    /***重置当前的战斗BUFF */
    public clear(): void {
        HurtHalo.hurtMap = {}
        for (var i: number = 0; i < this.halos.length; i++) {
            this.halos[i].isReadyToRemove = true;
        }
        this.halos.length = 0;
        this.uid = 0;
    }

    /***检查BUFF */
    public update(): void {
        let halos = this.halos;
        if (halos.length) {
            for (var i: number = 0; i < halos.length; i++) {
                let haloInfo: SkillHalo = halos[i]
                if (haloInfo.isReadyToRemove) {
                    this.halos.splice(i, 1);
                    i--;
                }
                else
                    haloInfo.nextFrame();
            }
        }
    }

    public addHalo(haloId: string, from: ICaster, target: ITarget, behavior: SkillBehavior): void {
        let cfg = TableManager.getDataById(table.battle.HaloConfig, haloId);
        if (cfg) {

            if (cfg.group) {
                this.removeHaloByIdAndHeroUid(from.casterUid, cfg.group)
            }
            let info = HaloFactory.createHalo(cfg);
            if (from instanceof BulletUnit) {
                from = from.caster;
            }
            info.init(++this.uid, cfg, from, target, this.battleLogic);
            info.skillBehavior = behavior;
            this.halos.push(info)
            info.onAdd();
            if (info.cfg.conditionType == 1) {
                info.actionHaloEffect();
            }
            info.checkHaloFirstPassSkill();
        }
    }

    /***因目标者死亡而移除他的所有光环 */
    public removeHaloByHeroDie(uid: number): void {
        for (let i = 0; i < this.halos.length; i++) {
            if (this.halos[i].target instanceof BattleUnit) {
                if (this.halos[i].cfg.dieRemove && this.halos[i].target.uid == uid) {
                    this.halos[i].isReadyToRemove = true
                }
            }
        }
    }

    /**移除对应英雄内光环组的的所有光环 */
    public removeHaloByIdAndHeroUid(uid: number, haloId: string): void {
        for (let i = 0; i < this.halos.length; i++) {
            if (this.halos[i].cfg.group == haloId && this.halos[i].caster.casterUid == uid) {
                this.halos[i].remove();
                this.halos.splice(i, 1)
                i--;
            }
        }
    }

    //检查光环列表是否属于属性增加，是否阵型相符，是否范围内
    public getHaloAttr(target: BattleUnit): { [key: number]: { value: number, per: number } } {
        var returnMap: { [attrId: number]: { value: number, per: number } } = {};
        for (var i: number = 0; i < this.halos.length; i++) {
            var haloInfo: SkillHalo = this.halos[i];
            if (!haloInfo.isReadyToRemove) {
                if (haloInfo.effectType == HaloType.Attr) {
                    //属性增益、减益
                    let attrMap = haloInfo.getHaloAttr(target);
                    for (let attrKey in attrMap) {
                        if (!returnMap[attrKey]) {
                            returnMap[attrKey] = { value: 0, per: 0 }
                        }

                        let attrData = returnMap[attrKey];
                        attrData.value += attrMap[attrKey].value;
                        attrData.per += attrMap[attrKey].per;;
                    }
                }
            }
        }

        return returnMap
    }

    /***是否在免疫技能子类型的范围内 */
    public getHasNotHurtBySkillSubType(target: BattleUnit, skillSubType: SkillSubType): boolean {
        for (var i: number = 0; i < this.halos.length; i++) {
            var haloInfo: SkillHalo = this.halos[i];
            if (!haloInfo.isReadyToRemove) {
                if (haloInfo.effectType == HaloType.NotHurtBySkillSubType) {
                    var effectParam: { subType: number } = haloInfo.cfg.effectParam;
                    if (SkillUtils.checkSkillSubType(effectParam.subType, skillSubType) && haloInfo.caster.teamId == target.teamId)
                        return haloInfo.checkTargetInUnits(target)
                }
            }
        }
        return false;
    }

    /***获取技能的伤害系数的加值 */
    public getAddSkillAmount(entity: ICaster, skillIndex: number, skillId: string): number {
        if (entity instanceof BulletUnit) {
            entity = entity.caster;
        }

        let value = 0;
        for (var i: number = 0; i < this.halos.length; i++) {
            var halo: SkillHalo = this.halos[i];
            if (!halo.isReadyToRemove) {
                if (halo.effectType == HaloType.AddSkillAmount) {
                    var effectParam: { amount: number, skillIndex: number, skillId: string } = halo.effectParm1;
                    if (!halo.isReadyToRemove && (effectParam.skillIndex == skillIndex || effectParam.skillId == skillId) && halo.checkTargetInUnits(entity as BattleUnit)) {
                        value += effectParam.amount;
                    }
                }
            }
        }
        return value;
    }

    /***检查目标是否在锁血范围内，返回锁血的血量百分比 */
    public getLockingBlood(entity: BattleUnit): number {
        if (entity instanceof BulletUnit) {
            entity = entity.caster;
        }

        let value = 0;
        for (var i: number = 0; i < this.halos.length; i++) {
            var halo: SkillHalo = this.halos[i];
            if (!halo.isReadyToRemove) {
                if (halo.effectType == HaloType.LockingBlood) {
                    var effectParam: { amount: number } = halo.effectParm1;
                    if (!halo.isReadyToRemove && halo.checkTargetInUnits(entity as BattleUnit)) {
                        value = Math.max(effectParam.amount, value);
                    }
                }
            }
        }
        return Math.ceil(value * entity.hpMax / BattleConstantConfig.getRandBase);
    }
}