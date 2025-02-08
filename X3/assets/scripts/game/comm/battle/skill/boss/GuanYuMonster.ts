import { tween } from "cc";
import { ActorState } from "../../enum/BattleEnum";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { SkillBuff } from "../SkillBuff";
import { BuffGroupFlagType, PassivitySkillFlag } from "../SkillEnum";
import { v3 } from "cc";
import { ActorUnitNode } from "../../node/ActorUnitNode";
import { MonsterUnit } from "../../unit/battle/MonsterUnit";
import { MonsterShowUnit } from "../../show/MonsterShowUnit";

export class GuanYuMonsterShow extends MonsterShowUnit {
    public unitData: GuanYuMonster;
    /***是否武圣形态 */
    private _isWuSheng: boolean = false;
    private toUpdateAction: boolean = false
    private lastScale: number = 1;
    public get isWuSheng(): boolean {
        return this._isWuSheng;
    }
    public set isWuSheng(value: boolean) {
        if (this._isWuSheng != value) {
            this.toUpdateAction = true;
        }
        this._isWuSheng = value;
    }

    protected setStateHandler(actionName: string, loop: boolean, timeScaler?: number): void {
        if (this.isWuSheng) {
            actionName += "2";
        }
        if (this.unitData.comboSpeed) {
            timeScaler *= this.unitData.comboSpeed
        }
        super.setStateHandler(actionName, loop, timeScaler)
        this.toUpdateAction = false;
    }

    /***动作播放完毕 */
    protected nodeActionComplete(aniName: string): void {
        super.nodeActionComplete(aniName)
        if (this._state == ActorState.Running) {
            if (this.toUpdateAction) {
                this.setStateHandler("move", true, this._spineNode.runTimeScale)
            }
        }
        else if (this._state == ActorState.Idle) {
            if (this.toUpdateAction) {
                this.setStateHandler("idle", true, this._spineNode.runTimeScale)
            }
        }
    }

    /***创建战斗特效 */
    public createFightEffect(modelId: number, posType: number, target: BattleUnit, layer: number, isLoop: boolean, fightDir: number, timeScale: number = null): ActorUnitNode {
        if (this.unitData.comboSpeed) {
            timeScale *= this.unitData.comboSpeed
        }
        return super.createFightEffect(modelId, posType, target, layer, isLoop, fightDir, timeScale)
    }

    public updateBuff(buff: SkillBuff): void {
        super.updateBuff(buff)
        if (buff.skillBuffGroup.cfg.flag == BuffGroupFlagType.GuanYu) {
            if (!this.isWuSheng)
                this.lastScale = this._spineNode.modelScale
            this.isWuSheng = true;
            tween().target(this._spineNode.node).to(0.15, { scale: this.lastScale < 0 ? v3(-1.5, 1.5) : v3(1.5, 1.5) }).start();
        }
    }

    public removeBuff(buff: SkillBuff): void {
        super.removeBuff(buff)
        if (buff.skillBuffGroup.cfg.flag == BuffGroupFlagType.GuanYu) {
            this.isWuSheng = false;
            if (this._spineNode.node.isValid)
                tween().target(this._spineNode.node).to(0.15, { scale: this._spineNode.modelScale < 0 ? v3(-this.lastScale, this.lastScale) : v3(this.lastScale, this.lastScale) }).start();
        }
    }
}

export class GuanYuMonster extends MonsterUnit {
    public comboSpeed: number = 0;//连击的速度
    /***攻击完成 */
    protected attackActionComplete(isForce: boolean): void {
        this.comboSpeed = 0;
        let skill = this.skillInfo;//要结束的技能
        super.attackActionComplete(isForce)
        if (!isForce) {
            let P2310_x101Parm: { rate: number, speed: number } = this.attr.getPassiveSkillFlag(PassivitySkillFlag.P2310_x101)
            if (P2310_x101Parm && (skill?.skillIndex == 0 || skill?.skillIndex == 1)) {
                if (this.selectMainTarget?.unit?.isActive) {
                    //判断目标是否死亡
                    let skill3 = this.attr.getSkillByIndex(2, true)
                    if (!skill3.isActive() && this.battleLogic.randomMgr.isRandTrue(P2310_x101Parm.rate)) {
                        //判断大招是否有CD,无CD的话触发多1次技能
                        this.useSkillByIndex(skill.skillIndex)
                        this.comboSpeed = P2310_x101Parm.speed;
                    }
                }
            }
        }
    }

    /***进行攻击 */
    protected attack(): boolean {
        let b = super.attack();
        if (b && this.comboSpeed) {
            this._attackEndTime = Math.ceil(this._attackEndTime / this.comboSpeed);
        }
        return b
    }
}