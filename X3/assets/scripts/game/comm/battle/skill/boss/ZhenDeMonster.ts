import { ColorUtils } from "../../../../../core/utils/ColorUtils";
import { Handler } from "../../../../../core/utils/Handler";
import { BattleCommandType } from "../../BattleCommand";
import { ActorState } from "../../enum/BattleEnum";
import { FightTimeCheck } from "../../FightTimeCheck";
import { MonsterShowUnit } from "../../show/MonsterShowUnit";
import { MonsterUnit } from "../../unit/battle/MonsterUnit";
import { SkillBuff } from "../SkillBuff";
import { BuffType } from "../SkillEnum";

export class ZhenDeMonsterShow extends MonsterShowUnit {
    private flagColors: string[] = ["#00ccff", "#c000ff", "#ffe400", "#ff4b4b"];
    private nowFlagColor: string = ""

    /***初始化监听的战斗指令 */
    protected initCommand(): void {
        super.initCommand();
        this.unitData.battleLogic.command.reg(BattleCommandType.zhenDe, this.uid, new Handler(this, this.updateFlagColor))
    }

    setState(state: ActorState, anim?: string, timeScale?: number, directionParm: number = 0, loopType: number = 0) {
        super.setState(state, anim, timeScale, directionParm, loopType)

        //没旗子
        this.setQiziColor("ef_qizixunhuan", this.nowFlagColor)
        this.setQiziColor("ef_qizixunhuan3", this.nowFlagColor)
    }

    public setQiziColor(slotName: string, color: string): void {

        let slot = this._spineNode.findSlot(slotName)
        if (slot) {
            if (color == "") {
                slot.color.a = 0;
            }
            else {
                slot.color.a = 1;
                let colors = ColorUtils.colorStringToRGB(this.nowFlagColor)
                slot.color.r = +colors[0] / 255;
                slot.color.g = +colors[1] / 255;
                slot.color.b = +colors[2] / 255;
            }
        }
    }

    public updateBuff(buff: SkillBuff): void {
        super.updateBuff(buff)
        this.updateFlagColor(buff)
    }

    public updateFlagColor(buff: SkillBuff): void {
        if (buff.effectType == BuffType.FlagBuff && buff.effectParm1.type == "zhende") {
            this.nowFlagColor = this.flagColors[buff.layer - 1]
        }
    }

    public removeBuff(buff: SkillBuff): void {
        super.removeBuff(buff)
        if (buff.effectType == BuffType.FlagBuff && buff.effectParm1.type == "zhende") {
            this.nowFlagColor = "";
        }
    }
}


export class ZhenDeMonster extends MonsterUnit {

    public flagBuffUid: number;
    public removeBuffTime: number
    private timerCheck: FightTimeCheck;

    protected onMove(): void {
        super.onMove();
        if (this.timerCheck) {
            this.timerCheck.isReadyToRemove = true;
            this.timerCheck = null;
        }
    }

    protected onStopMove(): void {
        super.onStopMove()
        if (this.flagBuffUid && !this.timerCheck) {
            this.timerCheck = this.battleLogic.createTimeCheck(this.removeBuffTime, new Handler(this, this.onTimeHandler))
        }
    }

    private onTimeHandler(): void {
        let groupBuff = this.battleLogic.buffMgr.getBuffGroupByGroupUid(this.flagBuffUid)
        if (!groupBuff)
            return

        let buffs = groupBuff.buffs
        if (!buffs || buffs.length == 0) {
            this.timerCheck = null;
            return;
        }
        let isRmove: boolean = false;
        if (buffs) {
            for (let i = 0; i < buffs.length; i++) {
                buffs[i].layer--;
                // this.updateFlagColor(buffs[i])
                this.battleLogic.command.send(BattleCommandType.zhenDe, this.uid, buffs[i])
                if (buffs[i].layer == 0) {
                    buffs[i].isReadyToRemove = true;
                    isRmove = true;
                }
            }
        }
        this.timerCheck = null;
        if (!isRmove) {//减下1层
            this.timerCheck = this.battleLogic.createTimeCheck(this.removeBuffTime, new Handler(this, this.onTimeHandler))
        }
        else {
            this.flagBuffUid = 0;
        }
    }
}