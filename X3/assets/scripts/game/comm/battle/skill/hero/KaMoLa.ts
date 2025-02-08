import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { SkillTargetType, TargetFaction } from "../SkillEnum";
import { SkillUtils } from "../SkillUtils";
import { DirctionType } from "../../enum/BattleEnum";
import { BattleUtils } from "../../BattleUtils";
import { HeroUnit } from "../../unit/battle/HeroUnit";
import { v2 } from "cc";

export class KaMoLa extends HeroUnit {
    /***检测选中的技能 */
    // protected attack(): boolean {
    //     let b = super.attack()
    //     if (b && this.skillInfo.skillIndex == 1) {
    //         if (this.dirction == DirctionType.Left) {
    //             this.setDirction(DirctionType.Rigth)
    //         }
    //     }
    //     return b;
    // }
}

export class KaMoLaSkill2 extends FightSkillInfo {
    private selectTarget: BattleUnit;
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        if (owner instanceof BattleUnit) {
            let param: { hp: number, flash: number, cd: number } = behavior.cfg.param;
            if (param?.flash) {
                this.selectTarget = behavior.selectUnits[0]
                if (!this.selectTarget)
                    return

                if (param.flash == 1) {
                    //一阶段瞬移到目标
                    owner.setPosXYForce(this.selectTarget.pos.x, this.selectTarget.pos.y)
                    owner.setDirction(this.selectTarget.dirction)
                }
                else if (param.flash == 2) {
                    //一阶段瞬移回原来的位置
                    let pos = v2(0, 0);
                    if (this.selectTarget.dirction == DirctionType.Rigth) {
                        pos.set(this.selectTarget.pos.x + 60, this.selectTarget.pos.y)
                    }
                    else {
                        pos.set(this.selectTarget.pos.x - 60, this.selectTarget.pos.y)
                    }
                    pos = BattleUtils.setPosNotBlockPos(owner.battleLogic.fightType, pos)
                    owner.setPosXYForce(pos.x, pos.y)
                }
            }
        }
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        super.skillCompleteHandler()
    }
}