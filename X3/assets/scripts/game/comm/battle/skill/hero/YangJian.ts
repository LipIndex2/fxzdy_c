import { Handler } from "../../../../../core/utils/Handler";
import ObjectUtils from "../../../../../core/utils/ObjectUtils";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { DamageVo } from "../../DamageVo";
import { DirctionType } from "../../enum/BattleEnum";
import { FightFormula } from "../../FightFormula";
import { FightTimeCheck } from "../../FightTimeCheck";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { BulletUnit } from "../../unit/bullet/BulletUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { ITarget } from "../ITarget";
import { PassivitySkillData } from "../PassivitySkillData";
import { SkillBehavior } from "../SkillBehavior";
import { SkillData } from "../SkillData";
import { PassivitySkillFlag } from "../SkillEnum";

export class YangJianSkill2 extends FightSkillInfo {
    private bullet: BulletUnit
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        this.bullet = null
        super.beginBehaviorEffect(behavior, owner);
        let param: { delay: number } = behavior.cfg.param;
        if (param?.delay && this.selectUnits?.length > 0) {
            let summons = this.skill.battleLogic.getSummons(this.skill.owner.casterUid)
            for (let i = 0; i < summons.length; i++) {
                summons[i].setDirction(this.skill.owner.dirction == DirctionType.Rigth ? DirctionType.Left : DirctionType.Rigth);
                summons[i].setPosXY(this.skill.owner.dirction == DirctionType.Rigth ? (this.selectUnits[0].pos.x - 60) : (this.selectUnits[0].pos.x + 60), this.selectUnits[0].pos.y)
                summons[i].updatePos()
                summons[i].updateNode()
                summons[i].stopAction()
                summons[i].useSkillByIndex(this.skill.skillIndex);
            }
            this.skill.battleLogic.createTimeCheck(param.delay, new Handler(this, (bullet: BulletUnit) => {
                if (bullet) {
                    if (bullet.showUnit()) {
                        bullet.showUnit().visible = false;
                    }
                }
            }, [this.bullet]))
        }
        this.bullet = null;

    }

    /***公式计算的处理 */
    protected fightFormulaHandler(behavior: SkillBehavior, caster: ICaster, taker: BattleUnit): void {
        let P2220_x101Parm: { amount: number } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P2220_x101)
        if (P2220_x101Parm?.amount) {
            if (this.selectUnits?.length == 1)
                behavior.tempAddDamageValue += P2220_x101Parm.amount;
        }
        super.fightFormulaHandler(behavior, caster, taker)
    }

    protected missileHandler(behavior: SkillBehavior, effectParam: { missileId: string, notHurtPoint?: number }, caster: ICaster, taker: ITarget): BulletUnit {
        let bullet = super.missileHandler(behavior, effectParam, caster, taker);
        if (bullet) { this.bullet = bullet }
        return bullet;
    }

    private summonDelayTimer: FightTimeCheck
    protected summon(behavior: SkillBehavior,
        effectParam: { id: number, x: number, y: number, num?: number, randomFix?: number, isMapPoint?: number, time?: number, attr?: number, attrAmount?: number },
        caster: BattleUnit, takers: BattleUnit[]) {
        if (behavior.skill instanceof PassivitySkillData)
            // GameTimer.ins().callLater(this, this.summonDelay, [behavior, effectParam, caster, takers])
            this.summonDelayTimer = caster.battleLogic.createTimeCheck(1, new Handler(this, this.summonDelay, [behavior, effectParam, caster, takers], false))
        else
            this.summonDelay(behavior, effectParam, caster, takers);
    }

    protected summonDelay(behavior: SkillBehavior,
        effectParam: { id: number, x: number, y: number, num?: number, randomFix?: number, isMapPoint?: number, time?: number, attr?: number, attrAmount?: number },
        caster: BattleUnit, takers: BattleUnit[]) {

        let summons = caster.battleLogic.getSummons(this.skill.owner.casterUid)
        //主动技能触发的召唤才判断攻击目标
        if (summons.length > 0) {
            if (behavior.skill instanceof SkillData) {
                for (let i = 0; i < summons.length; i++) {
                    if (summons[i].summon.byUid == caster.casterUid) {
                        let param: { behavior: string } = behavior.cfg.param;
                        if (param?.behavior)
                            this.onNewBehaviorHandler(param.behavior, behavior, caster, this.skill);
                        return
                    }
                }
            }
            else {
                return
            }
        }
        else {
            let param: { behavior: string } = behavior.cfg.param;
            if (param?.behavior)
                this.onNewBehaviorHandler(param.behavior, behavior, caster, this.skill);
        }

        let P2220_p104Parm: { summon: number } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P2220_p104)
        if (P2220_p104Parm?.summon) {
            let newParam: { id: number, attr: number, x: number, y: number, num?: number } = ObjectUtils.copy(effectParam) as any
            ObjectUtils.mergeSameObj(newParam, P2220_p104Parm)
            newParam.id = P2220_p104Parm.summon;
            super.summon(behavior, newParam, caster, takers);
        }
        else
            super.summon(behavior, effectParam, caster, takers);

        let P2220_x101Parm: { buff: string[] } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P2220_x101)
        if (P2220_x101Parm?.buff) {
            let summons = caster.battleLogic.getSummons(this.skill.owner.casterUid)
            for (let i = 0; i < summons.length; i++) {
                if (summons[i].summon.byUid == caster.casterUid) {
                    for (let j = 0; j < P2220_x101Parm.buff.length; j++)
                        summons[i].battleLogic.buffMgr.buffControlByGroup(P2220_x101Parm.buff[j], caster, summons[i], behavior)
                }
            }
        }
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        if (this.summonDelayTimer)
            this.summonDelayTimer.isReadyToRemove = true
    }
}

export class YangJianSkill3 extends FightSkillInfo {
    private healHp: number = 0;

    /***技能开始 */
    public beginSkillHandler(): void {
        let summons = this.skill.battleLogic.getSummons(this.skill.owner.casterUid)
        for (let i = 0; i < summons.length; i++) {
            summons[i].stopAction()
            summons[i].useSkillByIndex(this.skill.skillIndex)
        }
    }

    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        this.healHp = 0
        super.beginBehaviorEffect(behavior, owner);
        let param: { heal: number } = behavior.cfg.param;
        if (param?.heal) {
            let summons = owner.battleLogic.getSummons(owner.casterUid)
            for (let i = 0; i < summons.length; i++) {
                let hp = FightFormula.heal(behavior, owner, summons[i], this.healHp * param.heal / BattleConstantConfig.getRandBase, false)
                summons[i].battleLogic.heal(hp)
            }
        }
    }

    protected hurtHandler(behavior: SkillBehavior, taker: BattleUnit, damageVo: DamageVo): void {
        super.hurtHandler(behavior, taker, damageVo);
        if (damageVo.value) {
            this.healHp += damageVo.value;
        }
    }
}