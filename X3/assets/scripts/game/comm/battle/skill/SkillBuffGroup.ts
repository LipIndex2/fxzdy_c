import ArrayUtils from "../../../../core/utils/ArrayUtils";
import { BattleUnit } from "../unit/battle/BattleUnit";
import { ICaster } from "./ICaster";
import { SkillBehavior } from "./SkillBehavior";
import { SkillBuff } from "./SkillBuff";
import { BuffConditionType } from "./SkillEnum";

export class SkillBuffGroup {
    public uid: number;
    public cfg: table.battle.BuffGroupConfig
    public target: BattleUnit;
    public from: ICaster;
    public buffIds: string[] = [];
    public buffs: SkillBuff[] = []
    public behavior: SkillBehavior;
    /***添加而导致删除的 */
    public isAddToRemove: boolean = false;
    public constructor (cfg: table.battle.BuffGroupConfig) {
        this.cfg = cfg;
    }

    public get hasBuff(): boolean {
        return this.buffIds.length > 0
    }

    public isShowEffect(): boolean {
        if (this.hasBuff) {
            if (this.isAddToRemove && !this.cfg.timeLimit)
                return false
            return true;
        }
        return false;
    }

    public isCanRemoveEffect(): boolean {
        if (this.isAddToRemove && !this.cfg.timeLimit)
            return false

        return true;
    }

    public addBuff(buff: SkillBuff): void {
        if (ArrayUtils.iPush(this.buffIds, buff.id))
            this.buffs.push(buff)
    }

    /***触发 */
    public active(): void {
        let tempBuffs = this.buffs.concat();//防止触发后移除
        for (let i = 0; i < tempBuffs.length; i++) {
            if (tempBuffs[i].cfg.conditionType == BuffConditionType.NOW) {
                tempBuffs[i].actionBuffEffect()
            }
        }
    }

    /***检查BUFF是否被打断 */
    public checkBreak(): void {
        if (this.cfg.isBreak && this.from instanceof BattleUnit && this.behavior && this.behavior.skill) {
            if (!this.from.skillInfo || this.from.skillInfo != this.behavior.skill) {
                while (this.buffs.length) {
                    this.buffs.shift().isReadyToRemove = true;
                }
                this.buffIds.length = 0;
                this.buffs.length = 0;
                this.target.clearBuffEffect(this)
            }
        }
    }

    public removeBuffById(id: string): boolean {
        let index = this.buffIds.indexOf(id)
        if (index != -1) {
            this.buffIds.splice(index, 1)
            if (this.buffIds.length == 0) {
                this.target.clearBuffEffect(this)
                return true;
            }
        }

        return false;
    }

    public removeAll(): void {
        for (let i = 0; i < this.buffs.length; i++) {
            this.buffs[i].isReadyToRemove = true;
        }
    }

    /***清空BUFF的CD */
    public clearBuffTime(): void {
        for (let i = 0; i < this.buffs.length; i++) {
            if (!this.buffs[i].isReadyToRemove) {
                this.buffs[i].clearBuffTime()
            }
        }
    }

    /***增加BUFF的持续时间 */
    public addBuffTime(frame: number): void {
        for (let i = 0; i < this.buffs.length; i++) {
            if (!this.buffs[i].isReadyToRemove) {
                this.buffs[i].addTime(frame)
            }
        }
    }

    /***使用BUFF时间 */
    public useBuffTime(frame: number): void {
        for (let i = 0; i < this.buffs.length; i++) {
            if (!this.buffs[i].isReadyToRemove) {
                this.buffs[i].useTime(frame)
            }
        }
    }

    /***改变层数 */
    public changeLayer(layer: number): void {
        for (let i = 0; i < this.buffs.length; i++) {
            if (!this.buffs[i].isReadyToRemove) {
                this.buffs[i].layer = Math.min(layer, this.buffs[i].cfgLayer)
            }
        }
    }

    /***添加层数 */
    public addLayer(layer: number): void {
        for (let i = 0; i < this.buffs.length; i++) {
            if (!this.buffs[i].isReadyToRemove) {
                this.buffs[i].layer += layer
                this.buffs[i].layer = Math.min(this.buffs[i].layer, this.buffs[i].cfgLayer)
            }
        }
    }
}