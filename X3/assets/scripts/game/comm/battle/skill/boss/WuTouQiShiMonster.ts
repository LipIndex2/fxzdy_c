import { PoolManager } from "../../../../../core/pool/PoolManager";
import { GameTimer } from "../../../../../core/timer/GameTimer";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { DamageVo } from "../../DamageVo";
import { ActorState } from "../../enum/BattleEnum";
import { MonsterShowUnit } from "../../show/MonsterShowUnit";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { MonsterUnit } from "../../unit/battle/MonsterUnit";
import { PassivitySkillData } from "../PassivitySkillData";
import { SkillData } from "../SkillData";
import { BuffGroupFlagType } from "../SkillEnum";

export class WuTouQiShiMonsterShow extends MonsterShowUnit {
    public isPossess: boolean = false;//是否支配状态
    public setPossess(v: boolean): void {
        this.isPossess = v;
        this.setOtherVisible(!v)
        if (v)
            this.setAlpha(0)
        else
            this.setAlpha(1)
    }

    setState(state: ActorState, anim?: string, timeScale?: number, directionParm: number = 0, loopType: number = 0) {
        if (state == ActorState.Running && (this.unitData as WuTouQiShiMonster).beginToPossess) {
            return
        }
        super.setState(state, anim, timeScale, directionParm, loopType)
    }

    protected setStateHandler(actionName: string, loop: boolean, timeScaler?: number): void {
        if (actionName == "die") {
            this.onDieActionComplete();
        }
        else
            super.setStateHandler(actionName, loop, timeScaler)
    }

    /***死亡动作播放完回调 */
    protected onDieActionComplete(): void {
        this.visible = false;
    }
}

export class WuTouQiShiMonster extends MonsterUnit {
    public beginToPossess: boolean = false;
    public possessCanSkill3: boolean = false;
    public isPossess: boolean = false;//是否支配状态\
    public possessTarget: BattleUnit;
    public possessSkillData: PassivitySkillData

    /****判断能否发动技能 */
    protected checkCanActivateSkills(): boolean {
        if (this.skillInfoCtrl?.cfg.belongType == "221_p1") {
            return true;
        }
        return super.checkCanActivateSkills();
    }

    /***当前状态是否能移动攻击 */
    public canMoveAttack(): boolean {
        if (this.skillInfo?.cfg.belongType == "221_p1") {
            return true;
        }
        return super.canMoveAttack();
    }

    /****技能释放的其他条件检查 */
    protected skillOtherConditionCheckHandler(skill: SkillData): boolean {
        let b = super.skillOtherConditionCheckHandler(skill)
        if (!b)
            return false;

        if (this.isPossess)
            return false;
        return true;
    }

    /***获取当前绑定的对应显示单位，不一定有值 */
    public showUnit(): WuTouQiShiMonsterShow {
        return super.showUnit() as WuTouQiShiMonsterShow;
    }

    /**是否能移动 */
    protected canMove(): boolean {
        return !this.beginToPossess && super.canMove();
    }

    /***是否可以选中 */
    public canSelect(): boolean {
        return !this.isPossess && super.canSkill()
    }

    /***脱离战斗 */
    public exitFight(): void {
        super.exitFight()
        if (this.isPossess) {
            //触发过的话，脱战要重新计算过复活的CD
            this.showUnit()?.setPossess(false);
            if (this.possessTarget)
                this.setPosXYForce(this.possessTarget.pos.x, this.possessTarget.pos.y)

            let lifeStealHp = Math.ceil(this.hpMax * this.possessTarget.hp / this.possessTarget.hpMax)
            let lifeStealHpDamageVo = PoolManager.getItem(DamageVo)
            lifeStealHpDamageVo.skillInfo = this.possessSkillData;
            lifeStealHpDamageVo.caster = this;
            lifeStealHpDamageVo.target = this;
            lifeStealHpDamageVo.status = BattleConstantConfig.Heal;
            lifeStealHpDamageVo.value = lifeStealHp
            this.battleLogic.heal(lifeStealHpDamageVo);

            this.detach()
        }
    }

    /**更新AI */
    protected updateAI() {
        super.updateAI()
        if (this.isPossess && this.possessTarget) {
            if (!this.possessTarget.isActive) {
                this.setPosXYForce(this.possessTarget.pos.x, this.possessTarget.pos.y)
                this.detach();
                this.showUnit()?.setPossess(false);
                this.toDie();
            }
            else {
                if (!this.possessTarget.selectHatredTarget) {
                    this.possessTarget.checkEnterFight()
                }
                this.selectHatredTarget = this.possessTarget.selectHatredTarget
                this.selectMainTarget = this.possessTarget.selectMainTarget
            }
        }
    }

    public setPossess(target: BattleUnit): void {
        this.isPossess = true;
        this.showUnit()?.setPossess(true);
        this.possessTarget = target;
        this.stopAction()
        this.setPosXYForce(this.possessTarget.pos.x, this.possessTarget.pos.y)
    }

    /**
    * 脱离
    */
    public detach(): void {
        if (this.isPossess) {
            let groups = this.battleLogic.buffMgr.getAllBuffGroupByFlag(BuffGroupFlagType.WuTouQiShi, this)
            for (let i = 0; i < groups.length; i++) {
                groups[i].removeAll()
            }
            this.possessSkillData.cd = this.possessSkillData.cdMax;
            this.beginToPossess = false;
            this.isPossess = false;
            if (this.possessTarget && this.possessTarget.isActive)
                this.possessTarget.toDie()
            this.possessTarget = null;
        }
    }

    /***攻击完成 */
    protected attackActionComplete(isForce: boolean): void {
        let skillInfo = this.skillInfo;
        if (skillInfo && skillInfo.cfg.belongType == "221_p1") {
            if (!isForce)
                super.attackActionComplete(isForce);
        }
        else
            super.attackActionComplete(isForce)
    }

    /**更新位置 */
    public updatePos(): void {
        if (!this._moveVec.isCrtl && this.isPossess && this.possessTarget) {
            this.setPosXYForce(this.possessTarget.pos.x, this.possessTarget.pos.y)
        }
        return super.updatePos()
    }
}