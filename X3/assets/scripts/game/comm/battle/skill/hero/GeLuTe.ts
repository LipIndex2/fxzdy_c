import { BattleUtils } from "../../BattleUtils";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { DamageVo } from "../../DamageVo";
import { ActorState, WorldUnitTeam } from "../../enum/BattleEnum";
import { FightFormula } from "../../FightFormula";
import { ActorUnitNode } from "../../node/ActorUnitNode";
import { HeroShowUnit } from "../../show/HeroShowUnit";
import { HeroUnit } from "../../unit/battle/HeroUnit";
import { SkillBuff } from "../SkillBuff";
import { BuffGroupFlagType, PassivitySkillFlag } from "../SkillEnum";

export class GeLuTeShow extends HeroShowUnit {
    /***是否变身形态 */
    private _isChange: boolean = false;
    private toUpdateAction: boolean = false
    public get isChange(): boolean {
        return this._isChange;
    }
    public set isChange(value: boolean) {
        if (this._isChange != value) {
            this.toUpdateAction = true;
        }
        this._isChange = value;
    }

    protected setStateHandler(actionName: string, loop: boolean, timeScaler?: number): void {
        if (actionName == "die" && (this.unitData as GeLuTe).sleepTime) {
            actionName = "Pskill01"
        }
        if (this.isChange) {
            actionName += "2";
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
        this.updateShadowImgScale();
        this.isWeakup = false
    }

    public updateBuff(buff: SkillBuff): void {
        super.updateBuff(buff)
        if (buff.skillBuffGroup.cfg.flag == BuffGroupFlagType.GeLuTe) {
            this.isChange = true;
        }
    }

    public removeBuff(buff: SkillBuff): void {
        super.removeBuff(buff)
        if (buff.skillBuffGroup.cfg.flag == BuffGroupFlagType.GeLuTe) {
            if ((this.unitData as GeLuTe).buffGroupId && this.unitData.isDeath) {
            }
            else {
                this.isChange = false;
            }
        }
    }

    protected onDie(damageVo?: DamageVo) {
        super.onDie(damageVo)
        this.setShadowVisible(true)
        if ((this.unitData as GeLuTe).sleepTime) {
            this.setShadowVisible(false)
        }
    }

    /**获取模型高度 */
    get modelHeight() {
        if (!this._spineNode)
            return 0;
        if (this.isChange) {
            return this._spineNode.modelHeight + 50
        }
        return this._spineNode.modelHeight;
    }

    protected updateShadowImgScale(): void {
        if (this.isChange) {
            if (this._spineNode && this.shadow)
                this.shadow.scaleX = this.shadow.scaleY = this._spineNode.modelWidth / this.shadow.img.width * 1.5;
        }
        else
            super.updateShadowImgScale();
        this._hpBar?.update()
    }

    private isWeakup: boolean = false
    public showWeakup(): void {
        if (this.node instanceof ActorUnitNode) {
            let event = this.node.getEventByName("loopEnd")
            if (event && event.intValue) {
                this.node.skipLoop = true;
                this.node.gotoAndPlay(event.intValue)
            }
            this.isWeakup = true
            this.setShadowVisible(true)
        }
    }

    /***死亡动作播放完回调 */
    protected onDieActionComplete(): void {
        if (this.isWeakup) {
            this.setState(ActorState.Idle)
        }
        else
            super.onDieActionComplete();
    }
}

export class GeLuTe extends HeroUnit {
    public sleepTime: number = 0;
    private weakTime: number = 0;
    protected onDie(damageVo?: DamageVo) {
        let canRevive: boolean = false
        let P1141_p101Parm: { time: number, amount: number, halo: string } = this.attr.getPassiveSkillFlag(PassivitySkillFlag.P1141_p101);
        if (P1141_p101Parm) {
            let myUnits = this.battleLogic.unitProcessor.getUnitsByTeamId(WorldUnitTeam.Self);
            for (let i = 0; i < myUnits.length; i++) {
                if (myUnits[i].isActive) {
                    canRevive = true;
                    break
                }
            }
        }

        if (canRevive) {
            this.weakTime = BattleUtils.getFrameByTime(P1141_p101Parm.time)
            this.sleepTime = this.weakTime + 80;
            if (P1141_p101Parm.halo)
                this.battleLogic.haloMgr.addHalo(P1141_p101Parm.halo, this, this, this.attr.getPassiveSkillFlagSkillBehavior(PassivitySkillFlag.P1141_p101))
        }
        this.attr.setCanRebirth(!canRevive)
        super.onDie(damageVo)
        if (canRevive) {
            this._moveVec.resetVec()
            this.showUnit()?.hideRebirthBar()
        }
    }

    private onRevive(): void {
        this.setState(ActorState.Idle);
        let P1141_p101Parm: { time: number, amount: number, halo: string } = this.attr.getPassiveSkillFlag(PassivitySkillFlag.P1141_p101);
        let value = Math.floor(this.attr.maxHp * P1141_p101Parm.amount / BattleConstantConfig.getRandBase);
        let behavior = this.attr.getPassiveSkillFlagSkillBehavior(PassivitySkillFlag.P1141_p101)
        let hp = FightFormula.heal(behavior, this, this, value, false)
        this.battleLogic.heal(hp);
        this.battleLogic.haloMgr.removeHaloByIdAndHeroUid(this.uid, P1141_p101Parm.halo);
        this.checkEnterFight()
        if (this.buffGroupId) {
            this.battleLogic.buffMgr.buffControlByGroup(this.buffGroupId, this, this, behavior)
        }
    }

    /***获取当前绑定的对应显示单位，不一定有值 */
    public showUnit(): GeLuTeShow {
        return super.showUnit() as GeLuTeShow;
    }

    /**检测状态 */
    protected checkSelfState() {
        if (this.sleepTime) {
            let canRevive: boolean = false
            let myUnits = this.battleLogic.unitProcessor.getUnitsByTeamId(WorldUnitTeam.Self);
            for (let i = 0; i < myUnits.length; i++) {
                if (myUnits[i].isActive) {
                    canRevive = true
                    break
                }
            }

            if (!canRevive) {
                this.sleepTime = 0
                this.weakTime = 0;
                return;
            }

            this.sleepTime--;
            if (this.sleepTime == 0) {
                this.onRevive();
            }
        }

        if (this.weakTime) {
            this.weakTime--;
            if (this.weakTime == 0) {
                this.showUnit()?.showWeakup()
            }
        }

        return super.checkSelfState();
    }

    /**
     * 记录的BUFFID，假如存在状物变身后死亡，要回到变身状态
     */
    public buffGroupId: string;
    public updateBuff(buff: SkillBuff): void {
        super.updateBuff(buff)
        if (buff.skillBuffGroup.cfg.flag == BuffGroupFlagType.GeLuTe) {
            if (this.attr.getSkillById("1141_x101")) {
                this.buffGroupId = buff.skillBuffGroup.cfg.id;
            }
        }
    }
}