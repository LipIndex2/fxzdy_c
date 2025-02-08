import { Handler } from "../../../../../core/utils/Handler";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import { DamageVo } from "../../DamageVo";
import { FightTimeCheck } from "../../FightTimeCheck";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { HeroShowUnit } from "../../show/HeroShowUnit";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { BehaviorUtils } from "../BehaviorUtils";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { AbnormalType, PassivitySkillFlag } from "../SkillEnum";

export class TiaoTiaoQiShouShow extends HeroShowUnit {
    protected get moveAction(): string {
        return "move"
    }
}

/***跳跳骑手3技能把对方拉到自己前面 */
export class TiaoTiaoQiShouSkill3 extends FightSkillInfo {
    private isTrigger: boolean = false
    private timerCheck: FightTimeCheck
    private fightTimeCheckList: FightTimeCheck[] = []
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        this.isTrigger = false;
        super.beginBehaviorEffect(behavior, owner);
        if (owner instanceof BattleUnit && !owner.isActive)
            return
        let param: { x: number, y: number, speed: number, interval: number, delay: number } = behavior.cfg.param;
        if (param)
            this.timerCheck = this.skill.battleLogic.createTimeCheck(param.delay, Handler.create(this, this.onDelayHandler, [behavior, owner]))
    }

    private onDelayHandler(behavior: SkillBehavior, owner: ICaster): void {
        let param: { x: number, y: number, speed: number, interval: number, delay: number } = behavior.cfg.param;
        if (this.selectUnits) {
            this.isTrigger = true;
            for (let i = 0; i < this.selectUnits.length; i++) {
                let fightTimeCheck = BehaviorUtils.pull(owner.pos.x + (param.x || 0), owner.pos.y + (param.y || 0), param.speed, param.interval, 0, this.selectUnits[i])
                if (fightTimeCheck) {
                    // this.selectUnits[i].setAbnormalStatus(AbnormalType.notSelect)
                    this.selectUnits[i].setAbnormalStatus(AbnormalType.NotMove)
                    this.selectUnits[i].setAbnormalStatus(AbnormalType.NotAttack)
                    this.fightTimeCheckList.push(fightTimeCheck)
                }
            }
        }
    }

    protected hurtHandler(behavior: SkillBehavior, taker: BattleUnit, damageVo: DamageVo): void {
        //minDis:100;amount:35
        //钩锁对过近的目标和不能位移的目标造成额外20%伤害
        let P5240_p101Parm: { minDis: number, amount: number } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P5240_p101)
        if (P5240_p101Parm) {
            let dis = MathUtils.distance(behavior.owner.pos, taker.pos)
            if (dis <= P5240_p101Parm.minDis || !taker.attr.canMove() || !taker.attr.canForceMove()) {
                damageVo.value = Math.ceil(damageVo.value * (1 + P5240_p101Parm.amount / BattleConstantConfig.getRandBase));
            }
        }
        //钩锁对命中目标附加流血效果
        let P5240_p104Parm: { buff: string } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P5240_p104)
        if (P5240_p104Parm) {
            this.skill.owner.battleLogic.buffMgr.buffControlByGroup(P5240_p104Parm.buff, behavior.skill.owner, taker, behavior)
        }

        super.hurtHandler(behavior, taker, damageVo)
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        if (this.timerCheck)
            this.timerCheck.destoryTimeCheck();
        if (this.isTrigger) {
            for (let i = 0; i < this.fightTimeCheckList.length; i++) {
                this.fightTimeCheckList[i].destoryTimeCheck();
            }

            if (this.selectUnits) {
                for (let i = 0; i < this.selectUnits.length; i++) {
                    this.selectUnits[i].clearAbnormalStatus(AbnormalType.NotMove)
                    this.selectUnits[i].clearAbnormalStatus(AbnormalType.NotAttack)
                    // this.selectUnits[i].clearAbnormalStatus(AbnormalType.notSelect)
                }
            }
        }
    }
}