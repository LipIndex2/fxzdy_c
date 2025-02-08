import { TableManager } from "../../../../../core/table/TableManager";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { FightTimeCheck } from "../../FightTimeCheck";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { Handler } from "../../../../../core/utils/Handler";
import { Vec2 } from "cc";
import { BattleUtils } from "../../BattleUtils";
import { CollisionUtils } from "../../../math/CollisionUtils";
import { PassivitySkillFlag } from "../SkillEnum";
import { HeroShowUnit } from "../../show/HeroShowUnit";
import RandomUtils from "../../../../../core/utils/RandomUtils";
import { DirctionType } from "../../enum/BattleEnum";
import { v2 } from "cc";
import { HeroUnit } from "../../unit/battle/HeroUnit";

export class HuiMieZheShow extends HeroShowUnit {
    protected getActionEffectData(): table.battle.SkillEffectConfig {
        if (this.unitData.skillInfo.skillIndex == 0) {
            if (RandomUtils.randomBoolean())
                return TableManager.getDataById(table.battle.SkillEffectConfig, this.unitData.skillInfo.cfg.anim)
            else
                return TableManager.getDataById(table.battle.SkillEffectConfig, this.unitData.skillInfo.cfg.anim + 1)
        }
        return this.unitData.skillInfo.getActionEffectData()
    }
}

export class HuiMieZhe extends HeroUnit {
    public canPassivitySkill1: boolean = true;//是否能触发被动的复活
    public enterFight(teamEnter: boolean = true): boolean {
        let b = super.enterFight(teamEnter)
        if (b) {
            this.canPassivitySkill1 = true
        }
        return b
    }
}

export class HuiMieZheSkill2 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);
        let param: { rate: number } = behavior.cfg.param;
        if (param?.rate && behavior.effectType == "addBuff" && behavior.selectUnits?.length) {
            let b = owner.battleLogic.randomMgr.isRandTrue(param.rate);
            if (b) {
                this.addBuff(behavior, behavior.effectParam, owner, behavior.selectUnits);
            }
        }
    }
}

export class HuiMieZheSkill3 extends FightSkillInfo {
    private isEffect: boolean = false
    private moveTimeCheck: FightTimeCheck;
    private delayTimeCheck: FightTimeCheck
    private nowNum: number = 0;
    private behaviorsDatas: { behaviorId: string; delay: number; }[]
    /***技能开始 */
    public beginSkillHandler(): void {
        this.nowNum = 0;
        this.behaviorsDatas = this.skill.behaviorsTiming;
        this.isEffect = false;
    }

    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        let param: { jump: number, hurt: number, num: number, delay: number, delay2: number, buff: string } = behavior.cfg.param;
        if (param?.hurt) {
            if (this.nowNum == 1) {
                behavior.animModelId = { up: [22400005], low: [22400006] };
            }
            else if (this.nowNum == 2) {
                behavior.animModelId = { up: [22400007], low: [22400008] };
            }
            else if (this.nowNum == 3) {
                behavior.animModelId = { up: [22400009], low: [22400010] };
            }
        }

        super.beginBehaviorEffect(behavior, owner);
        if (owner instanceof BattleUnit) {
            if (param?.jump) {
                this.nowNum++;
                owner.envActive = false;
                let target = behavior.selectUnits?.length ? behavior.selectUnits[0] : behavior.skillTarget;
                if (target.pos.x > owner.pos.x) {
                    owner.setDirction(DirctionType.Left)
                }
                else {
                    owner.setDirction(DirctionType.Rigth)
                }
                let dis = MathUtils.distance(target.pos, this.skill.owner.pos)
                let moveDistance = dis / BattleUtils.getFrameByTime(726)
                let vec = CollisionUtils.calVecTemp(owner.pos, target.pos, moveDistance);
                this.moveTimeCheck = this.skill.battleLogic.createTimeCheck(16, new Handler(this, this.onMoveHandler, [v2(vec.x, vec.y)]), -1, true)
            }
            else if (param?.hurt) {
                owner.envActive = true;
                if (this.moveTimeCheck)
                    this.moveTimeCheck.isReadyToRemove = true;

                let P2240_x102Parm = owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P2240_x102)
                if (P2240_x102Parm || this.nowNum >= param.num) {
                    if (param.buff && behavior.selectUnits?.length) {
                        for (let i = 0; i < behavior.selectUnits.length; i++) {
                            owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, behavior.selectUnits[i], behavior)
                        }
                    }
                }

                if (this.nowNum >= param.num) {
                    this.nowNum = 0;
                }
                else {
                    // this.delayTimeCheck = this.skill.battleLogic.createTimeCheck(param.delay, new Handler(this, this.nextJumpHandler, [behavior, owner]))
                    if (this.nowNum == 0) {
                        behavior.animModelId = { up: [22400005], low: [22400006] };
                    }
                    else if (this.nowNum == 1) {
                        behavior.animModelId = { up: [22400007], low: [22400008] };
                        this.nextJumpHandler(behavior, owner, param.delay)
                    }
                    else if (this.nowNum == 2) {
                        behavior.animModelId = { up: [22400009], low: [22400010] };
                        this.nextJumpHandler(behavior, owner, param.delay2)
                    }
                }
            }
        }
    }

    private onMoveHandler(moveVec: Vec2): void {
        this.skill.owner.forceMove(moveVec)
    }

    private nextJumpHandler(oldBehavior: SkillBehavior, owner: ICaster, delay: number): void {
        // this.skill.owner.showUnit()?.setState(ActorState.Attack, (this.skill as SkillData).animName);
        for (let i = 0; i < this.behaviorsDatas.length; i++) {
            let trigger = i == 0 ? 0 : delay;
            let behavior = SkillBehavior.createBehavior(this.behaviorsDatas[i].behaviorId, trigger, this.skill);
            behavior.setCaster(this.skill.owner);
            behavior.skillTarget = oldBehavior.skillTarget;
            if (oldBehavior.skillTarget.unit)
                behavior.skillTargetUid = oldBehavior.skillTarget.unit.uid;
            if (behavior.isOnTime) {
                behavior.actionEffect();
            }
            if (!behavior.isEnd) {
                this.skill.owner.attr.addSkillBehavoir(behavior)
            }
        }
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        // this.skill.owner.envActive = true;
        if (this.moveTimeCheck)
            this.moveTimeCheck.isReadyToRemove = true;

        if (this.delayTimeCheck)
            this.delayTimeCheck.isReadyToRemove = true;
    }
}

export class HuiMieZhePassivitySkill1 extends FightSkillInfo {
    private haveBuff: boolean = false
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        let param: { hp: number, buff: string, skill2: number, num: number, notDie: number } = behavior.cfg.param;
        if (param?.notDie && owner instanceof HuiMieZhe && !owner.canPassivitySkill1) {
            return
        }
        super.beginBehaviorEffect(behavior, owner)
        if (owner instanceof HuiMieZhe) {
            if (param?.skill2) {
                for (let k = 0; k < owner.attr.passSkills.length; k++) {
                    if (owner.attr.passSkills[k].cfg.group == "2240_s201") {
                        let behaviors = owner.attr.passSkills[k].behaviorsTiming
                        for (let i = 0; i < behaviors.length; i++) {
                            let behaviorCfg = TableManager.getDataById(table.battle.BehaviorConfig, behaviors[i].behaviorId)
                            if (behaviorCfg && behaviorCfg.effectType == "addBuff") {
                                for (let j = 0; j < param.num; j++)
                                    this.addBuff(behavior, behaviorCfg.effectParam, owner, behavior.selectUnits);
                            }
                        }
                        break
                    }
                }
            }
            else if (param?.hp) {
                let rate = Math.ceil((owner.hp / owner.hpMax) * BattleConstantConfig.getRandBase)
                if (!this.haveBuff && rate <= param.hp) {
                    owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, owner, behavior)
                    this.haveBuff = true;
                }
                else if (this.haveBuff && rate > param.hp) {
                    owner.attr.removeBuffGroup(param.buff)
                    this.haveBuff = false;
                }
            }

            if (param?.notDie) {
                owner.canPassivitySkill1 = false
                let P2240_x101Parm: { buff: string } = owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P2240_x101)
                if (P2240_x101Parm?.buff) {
                    owner.battleLogic.buffMgr.buffControlByGroup(P2240_x101Parm.buff, owner, owner, behavior)
                }
            }
        }
    }
}