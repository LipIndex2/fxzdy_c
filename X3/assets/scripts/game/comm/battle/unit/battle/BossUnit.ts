import { ActorState, DirctionType, UnitType } from "../../enum/BattleEnum";
import { MonsterUnit } from "./MonsterUnit";
import { DamageVo } from "../../DamageVo";
import { SkillData } from "../../skill/SkillData";
import { SkillFactory } from "../../skill/SkillFactory";
import { IBattleUnitData } from "../../../../modules/battle/vo/IBattleUnitData";
import { AbnormalType } from "../../skill/SkillEnum";

export class BossUnit extends MonsterUnit {
    protected _type: UnitType = UnitType.Boss;

    /**初始化怪物数据 */
    init(data: table.monster.MonsterAttributeConfig, battleData?: IBattleUnitData, attr?: { [key: number]: number }) {
        super.init(data, battleData, attr);
    }

    /** 是否受环境影响 */
    get envActive() {
        return false;
    }

    /** 是否受环境影响 */
    set envActive(v: boolean) {
    }

    protected initRandomMoveTime(): void {
    }

    /***进入战斗 */
    public enterFight(): boolean {
        let b = super.enterFight();
        this.setAbnormalStatus(AbnormalType.ImmuneControl)
        return b;
    }


    onDie(damageVo?: DamageVo) {
        super.onDie(damageVo);
        this.battleLogic.markBossDead(this.uid);
    }
}

export class ChongHou extends BossUnit {
    public setDirction(dir: DirctionType): void {
        super.setDirction(DirctionType.Rigth)
    }

    /****飘字的高度 */
    get hurtNumHight(): number {
        return 100
    }

    protected setChargeAction(): void {
        this.isCharged = true;
        this.setState(ActorState.Attack, "idle", null, 0, 1);
    }

    protected getActiveSkill(): SkillData {
        let skill = this._attr.getActiveSkill();
        if (skill.skillIndex == 2) {
            let b = this.battleLogic.randomMgr.randomBoolean()
            if (b) {
                let newSkill: SkillData = SkillFactory.create(skill.cfg.belongType);
                newSkill.init(this, "9501_s4")
                newSkill.skillIndex = 2;
                return newSkill;
            }
        }

        return skill
    }
}