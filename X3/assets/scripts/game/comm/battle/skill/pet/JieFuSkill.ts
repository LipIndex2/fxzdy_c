import HpStateUtils from "../../../battleEx/HpStateUtils";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { HpShowType } from "../../config/BattleSetting";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { SkillTargetType, TargetFaction } from "../SkillEnum";
import { SkillUtils } from "../SkillUtils";
import { JieFu } from "./JieFu";

export class JieFuSkill2 extends FightSkillInfo {
    /***当前形态，0是无变化，1是不攻击，2是可攻击 */
    private changeType: number = 0;
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);
        let param: { bigBuff: string, smallBuff: string, hp: number, skill: string } = behavior.cfg.param;
        if (param?.bigBuff) {
            if (!owner.battleLogic.isInBattle())
                return

            let selfHp = HpStateUtils.getCurHpByType(owner.battleLogic.fightType, SkillUtils.getTeamIdByFaction(owner.teamId, TargetFaction.OurSide), HpShowType.TOTAL);
            let selfMaxHp = HpStateUtils.getMaxHpByType(owner.battleLogic.fightType, SkillUtils.getTeamIdByFaction(owner.teamId, TargetFaction.OurSide), HpShowType.TOTAL);
            let selfHpPercent = selfHp / selfMaxHp * 100;
            let targetHp = param.hp / BattleConstantConfig.getRandBase * 100;
            let heros = SkillUtils.skillTarget(SkillTargetType.Nearset, TargetFaction.OurSide, owner, owner as BattleUnit, 2000, 0)
            if (this.changeType != 1 && selfHpPercent > targetHp) {
                //变大，加攻击力
                if (heros?.length) {
                    for (let i = 0; i < heros.length; i++) {
                        if (param.bigBuff)
                            owner.battleLogic.buffMgr.buffControlByGroup(param.bigBuff, owner, heros[i], behavior)
                        if (param.smallBuff)
                            heros[i].attr.removeBuffGroup(param.smallBuff);
                    }
                }
                (owner as JieFu).isChangeAtk = false;
                if (this.changeType == 2)
                    this.activeSkill(behavior, { skill: param.skill }, owner.caster);
                this.changeType = 1;
            }
            else if (this.changeType != 2 && selfHpPercent < targetHp) {
                //变小，加防御力
                if (heros?.length) {
                    for (let i = 0; i < heros.length; i++) {
                        if (param.smallBuff)
                            owner.battleLogic.buffMgr.buffControlByGroup(param.smallBuff, owner, heros[i], behavior)
                        if (param.bigBuff)
                            heros[i].attr.removeBuffGroup(param.bigBuff);
                    }
                }
                (owner as JieFu).isChangeAtk = true;
                this.activeSkill(behavior, { skill: param.skill }, owner.caster);
                this.changeType = 2;
            }
        }
    }

    /**技能重置，如脱战 */
    public resetSkill(): void {
        this.changeType = 0;
    }
}