import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { SkillBuff } from "../SkillBuff";
import { SkillTargetType, TargetFaction } from "../SkillEnum";
import { SkillUtils } from "../SkillUtils";

export class SiKeMoSkill2 extends FightSkillInfo {
    private takeEffectNum: number = 0;
    private invalidSkillNum: number = 0;
    private invalidSkillMaxNum: number = 0;
    private invalidSkillBuffId: string
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        let param: { takeEffectNum: number, buff: string, num: number } = behavior.cfg.param;
        if (param?.takeEffectNum) {
            if (this.takeEffectNum < param.takeEffectNum) {
                this.takeEffectNum++;
                super.beginBehaviorEffect(behavior, owner);
            }
        }
        else {
            super.beginBehaviorEffect(behavior, owner);
            if (param?.buff) {
                this.invalidSkillBuffId = param.buff;
                this.invalidSkillMaxNum = param.num;
                if (behavior.selectUnits?.length) {
                    for (let i = 0; i < behavior.selectUnits.length; i++) {
                        owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, behavior.selectUnits[i], behavior);
                    }
                }
            }
        }
    }

    /**技能重置，如脱战 */
    public resetSkill(): void {
        this.takeEffectNum = 0;
        this.invalidSkillNum = 0;
        super.resetSkill();
    }

    /**检查BUFF是否能被触发，要看对应BUFF有无接入，不一定有 */
    public checkBuffCanActive(skillBuff: SkillBuff): boolean {
        let b = super.checkBuffCanActive(skillBuff);
        if (b) {
            if (this.invalidSkillNum >= this.invalidSkillMaxNum) {
                return false;
            }
            return true;
        }
        return b;
    }

    /***buff执行后 */
    public buffAfter(buff: SkillBuff): void {
        super.buffAfter(buff)
        if (this.invalidSkillBuffId == buff.skillBuffGroup.cfg.id) {
            this.invalidSkillNum++;
            if (this.invalidSkillNum >= this.invalidSkillMaxNum) {
                let enemys = SkillUtils.skillTarget(SkillTargetType.Nearset, TargetFaction.EnemySide, this.skill.owner, this.skill.owner, 9999, 0)
                if (enemys?.length) {
                    for (let i = 0; i < enemys.length; i++) {
                        enemys[i].attr.removeBuffGroup(buff.skillBuffGroup.cfg.id);
                    }
                }
            }
        }
    }
}