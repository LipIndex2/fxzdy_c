import { Handler } from "../../../../../core/utils/Handler";
import { IBattleUnitData } from "../../../../modules/battle/vo/IBattleUnitData";
import { BattleCommandType } from "../../BattleCommand";
import { ActorUnitNode } from "../../node/ActorUnitNode";
import { MonsterShowUnit } from "../../show/MonsterShowUnit";
import { MonsterUnit } from "../../unit/battle/MonsterUnit";
import { PassivitySkillFlag } from "../SkillEnum";

export class MaLiJuLiMonsterShow extends MonsterShowUnit {
    /***当前瓶子类型，1红，2蓝，4绿，8紫 */
    public pingZiType: number = 1;

    /***初始化监听的战斗指令 */
    protected initCommand(): void {
        super.initCommand();
        this.unitData.battleLogic.command.reg(BattleCommandType.maLiJuLi, this.uid, new Handler(this, this.updatePingZiModel))
    }

    protected onSpineLoaded(): void {
        super.onSpineLoaded();
        this.updatePingZiModel();
    }

    private updatePingZiModel(): void {
        if (!this.pingZiType)
            return

        if (this.node instanceof ActorUnitNode) {
            let slot1 = this.node.findSlot("pingzi_1");
            if (slot1)
                slot1.color.a = 0
            let slot2 = this.node.findSlot("pingzi_2");
            if (slot2)
                slot2.color.a = 0
            let slot3 = this.node.findSlot("pingzi_4");
            if (slot3)
                slot3.color.a = 0
            let slot4 = this.node.findSlot("pingzi_8");
            if (slot4)
                slot4.color.a = 0

            let nowSlot = this.node.findSlot("pingzi_" + this.pingZiType);
            if (nowSlot)
                nowSlot.color.a = 1
        }
    }
}


export class MaLiJuLiMonster extends MonsterUnit {
    /***当前瓶子类型，1红，2蓝，4绿，8紫 */
    public pingZiType: number = 1;
    public lastPingZiType: number = 0;
    /***当前瓶子的参数 */
    public nowPingZiParm: { lv?: string[], zi?: string[] };
    public canMoveSkill3: boolean = false;

    public init(data: table.monster.MonsterAttributeConfig, battleData?: IBattleUnitData, attr?: { [key: number]: number }): void {
        super.init(data, battleData, attr)
        this.battleLogic.regEvent("setPingZiType", this.uid, new Handler(this, this.setPingZiType, null, false))
    }

    /**更新AI */
    protected attack() {
        let b = super.attack()
        if (b) {
            let P3210_x101Parm = this.attr.getPassiveSkillFlag(PassivitySkillFlag.P3210_x101)
            if (P3210_x101Parm && this.skillInfo.skillIndex == P3210_x101Parm.skillIndex) {
                this.attr.triggerAllBehavoirs()
                this.skillInfo = null;
                this._attackEndTime = 0
            }
        }
        return b;
    }

    public setPingZiType(nextPingZiType: number, param: { lv?: string[], zi?: string[] }): void {
        if (nextPingZiType) {
            this.pingZiType = nextPingZiType;
            this.nowPingZiParm = param;
            this.battleLogic.command.send(BattleCommandType.maLiJuLi, this.uid)
        }
    }

    /****判断能否发动技能 */
    protected checkCanActivateSkills(): boolean {
        return this.isBeginToFight && !this.battleLogic.isSafe && !this.isAttacking && (!this._moveVec.isCrtl || this.isMoveAttack || this.canMoveSkill3)
    }
}