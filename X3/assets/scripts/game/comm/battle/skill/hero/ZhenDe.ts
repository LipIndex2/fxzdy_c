import { ColorUtils } from "../../../../../core/utils/ColorUtils";
import { ActorState } from "../../enum/BattleEnum";
import { HeroUnit } from "../../unit/battle/HeroUnit";
import { SkillBuff } from "../SkillBuff";
import { BuffType, PassivitySkillFlag } from "../SkillEnum";
import { FightSkillInfo } from "../FightSkillInfo";
import { SkillBehavior } from "../SkillBehavior";
import { ICaster } from "../ICaster";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightTimeCheck } from "../../FightTimeCheck";
import { Handler } from "../../../../../core/utils/Handler";
import { BattleCommandType } from "../../BattleCommand";
import { HeroShowUnit } from "../../show/HeroShowUnit";
import { ActorUnitNode } from "../../node/ActorUnitNode";

export class ZhenDeShow extends HeroShowUnit {
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
        if (this._spineNode instanceof ActorUnitNode) {
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


export class ZhenDe extends HeroUnit {

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

export class ZhenDeSkill2 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { buff: string, initLayer: number, removeTime: number, layer: number, buff2: string, buff3: string, buff3Layer: number } = behavior.cfg.param;
        if (param && param.buff) {
            let groupBuff = owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, owner as BattleUnit, behavior)
            if (owner instanceof ZhenDe) {
                owner.flagBuffUid = groupBuff.uid;
                owner.removeBuffTime = param.removeTime;


                for (let i = 0; i < groupBuff.buffs.length; i++) {
                    if (groupBuff.buffs[i].effectType == BuffType.FlagBuff && groupBuff.buffs[i].effectParm1.type == "zhende") {

                        if (param.initLayer && groupBuff.buffs[i].layer == 1) {
                            //初始层数
                            groupBuff.buffs[i].layer = param.initLayer;
                            if (owner instanceof ZhenDe)
                                owner.battleLogic.command.send(BattleCommandType.zhenDe, owner.uid, groupBuff.buffs[i])
                        }

                        if (param.buff3 && groupBuff.buffs[i].layer >= param.buff3Layer) {
                            owner.battleLogic.buffMgr.buffControlByGroup(param.buff3, owner, owner as BattleUnit, behavior)
                            owner.breakRiderCollisionBuff()
                        }

                        if (groupBuff.buffs[i].layer >= param.layer) {
                            owner.battleLogic.buffMgr.buffControlByTarget(groupBuff.buffs[i], owner, param.buff2, owner, behavior)
                        }

                        let P5210_p104Parm: { layer: number, buff: string } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P5210_p104)
                        if (P5210_p104Parm && P5210_p104Parm.buff) {
                            //贞德红旗下获得霸体
                            if (groupBuff.buffs[i].layer >= P5210_p104Parm.layer) {
                                owner.battleLogic.buffMgr.buffControlByGroup(P5210_p104Parm.buff, owner, owner as BattleUnit, behavior)
                            }
                        }
                    }
                }
            }
        }
    }
}

export class ZhenDePassivitySkill1 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)

        let param: { buff: string } = behavior.cfg.param;
        if (param && param.buff) {
            //消耗旗子触发BUFF
            let buffs = owner.battleLogic.buffMgr.getBuffListByEffect(owner as BattleUnit, BuffType.FlagBuff);
            if (buffs) {
                for (let i = 0; i < buffs.length; i++) {
                    if (buffs[i].effectParm1.type == "zhende" && buffs[i].layer > 1) {
                        owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, behavior.skillTarget as BattleUnit, behavior)
                        buffs[i].layer--;
                        if (owner instanceof ZhenDe)
                            owner.battleLogic.command.send(BattleCommandType.zhenDe, owner.uid, buffs[i])
                    }
                }
            }
        }
    }
}
