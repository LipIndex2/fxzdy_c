import { PoolManager } from "../../../../../core/pool/PoolManager";
import { Handler } from "../../../../../core/utils/Handler";
import { WorldManager } from "../../../world/WorldManager";
import { BattleCommandType } from "../../BattleCommand";
import { DamageVo } from "../../DamageVo";
import { FightTimeCheck } from "../../FightTimeCheck";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { BehaviorUtils } from "../BehaviorUtils";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { AbnormalType, PassivitySkillFlag } from "../SkillEnum";

export class HeiDongMonsterSkill2 extends FightSkillInfo {
    /***黑洞2技能触发秒杀时要延迟处理 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);
        let param: { delay: number, heal: number } = behavior.cfg.param;
        if (this.selectUnits) {
            for (let i = 0; i < this.selectUnits.length; i++) {
                this.selectUnits[i].clearAllAbnormalStatusByType(AbnormalType.notSelect);//清空所有不可选择
                this.selectUnits[i].setAbnormalStatus(AbnormalType.notSelect)
                this.skill.battleLogic.createTimeCheck(param.delay, Handler.create(this, this.onKillBuff, [behavior, this.selectUnits[i]], false))
                behavior.showSkillEffect(this.selectUnits[i])
            }
        }
    }

    private onKillBuff(behavior: SkillBehavior, target: BattleUnit): void {
        if (target && target.isActive) {
            target.clearAbnormalStatus(AbnormalType.notSelect)
            let damageVo = PoolManager.getItem(DamageVo)
            damageVo.caster = this.skill.owner
            damageVo.status = BattleConstantConfig.Kill;
            damageVo.skillInfo = this.skill;
            damageVo.value = target.attr.hp;
            damageVo.target = target;
            target.hurt(damageVo)
            let param: { healBuff: string } = behavior.cfg.param;
            if (param.healBuff) {
                this.skill.owner.battleLogic.buffMgr.buffControlByGroup(param.healBuff, behavior.owner, behavior.owner as BattleUnit, behavior)
            }
        }
    }
}

/***黑洞3技能牵引目标到指定位置并持续时间内不断扣血 */
export class HeiDongMonsterSkill3 extends FightSkillInfo {
    private buff: string
    private fightTimeCheckList: FightTimeCheck[] = []
    private isAct: boolean = false;//是否正常引导过技能
    private isHurt: boolean = false;//是否造成过伤害

    /***技能开始 */
    public beginSkillHandler(): void {
        this.buff = null;
        this.isAct = false;
        this.isHurt = false
    }

    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);
        if (owner instanceof BattleUnit && !owner.isActive)
            return
        //x:0;y:200;speed:800;amount:5000;interval:16;amountInterval:500
        let param: { x: number, y: number, speed: number, amount: number, amountInterval: number; interval: number, buff: string } = behavior.cfg.param;
        if (param) {
            if (param.buff) {
                this.buff = param.buff;
            }
            if (this.selectUnits) {
                for (let i = 0; i < this.selectUnits.length; i++) {
                    let fightTimeCheck = BehaviorUtils.pull(owner.pos.x + param.x, owner.pos.y + param.y, param.speed, param.interval, owner.battleLogic.randomMgr.randomInt(10, 25), this.selectUnits[i])
                    if (fightTimeCheck) {
                        // this.selectUnits[i].setAbnormalStatus(AbnormalType.notSelect)
                        this.selectUnits[i].setAbnormalStatus(AbnormalType.NotMove)
                        this.selectUnits[i].setAbnormalStatus(AbnormalType.NotAttack)
                        this.fightTimeCheckList.push(fightTimeCheck)
                        this.selectUnits[i].showUnit()?.setShadowVisible(false)
                        owner.battleLogic.command.send(BattleCommandType.addChild, this.selectUnits[i].uid, WorldManager.ins().effectLayer)
                    }
                }
                this.fightTimeCheckList.push(this.skill.battleLogic.createTimeCheck(param.amountInterval, Handler.create(this, this.hurt, [behavior, param, owner, this.selectUnits], false), -1))
            }
        }
    }

    protected hurtHandler(behavior: SkillBehavior, taker: BattleUnit, damageVo: DamageVo): void {
        damageVo.ignoreNotSelect = true;

        let P3240_p101Parm: { amount: number } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P3240_p101)
        if (P3240_p101Parm && this.selectUnits) {
            //噬万物每吸附一个目标则提升本次技能伤害3%
            damageVo.value = Math.ceil(damageVo.value * (1 + this.selectUnits.length * P3240_p101Parm.amount / BattleConstantConfig.getRandBase));
        }

        let P3240_p104Parm: { cd: number } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P3240_p104)
        if (!this.isHurt && P3240_p104Parm && this.selectUnits) {
            //吞噬万物每吸附一个目标则降低吞噬万物0.5s冷却时间
            (behavior.owner as BattleUnit).attr.updateCD(2, P3240_p104Parm.cd)
        }
        this.isHurt = true;
        super.hurtHandler(behavior, taker, damageVo)
    }

    /***执行行为 */
    protected actionBehavior(behavior: SkillBehavior, caster: ICaster, takers: BattleUnit[]): void {
        super.actionBehavior(behavior, caster, takers)
        if (behavior.cfg.param)
            this.isAct = true;
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        if (this.isAct) {
            if (this.buff) {
                this.skill.owner.battleLogic.buffMgr.buffControlByGroup(this.buff, this.skill.owner, this.skill.owner)
            }

            for (let i = 0; i < this.fightTimeCheckList.length; i++) {
                this.fightTimeCheckList[i].destoryTimeCheck();
            }

            if (this.selectUnits) {
                for (let i = 0; i < this.selectUnits.length; i++) {
                    this.selectUnits[i].clearAbnormalStatus(AbnormalType.NotMove)
                    this.selectUnits[i].clearAbnormalStatus(AbnormalType.NotAttack)
                    // this.selectUnits[i].clearAbnormalStatus(AbnormalType.notSelect)
                    if (this.selectUnits[i].isActive) {
                        this.selectUnits[i].showUnit()?.setShadowVisible(true)
                        this.selectUnits[i].battleLogic.showMgr.setStatue(this.selectUnits[i].uid, { shadowVisible: true, angle: 0 })
                        this.selectUnits[i].battleLogic.command.send(BattleCommandType.addChild, this.selectUnits[i].uid, WorldManager.ins().roleLayer)
                    }
                }
            }
        }
    }
}