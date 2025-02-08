import G from "../../../../../core/comm/G";
import { Handler } from "../../../../../core/utils/Handler";
import { AttrEnum } from "../../attribute/AttrEnum";
import { FightTimeCheck } from "../../FightTimeCheck";
import { HeroShowUnit } from "../../show/HeroShowUnit";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { HeroUnit } from "../../unit/battle/HeroUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { SkillBuff } from "../SkillBuff";
import { SkillBuffGroup } from "../SkillBuffGroup";
import { BuffType, PassivitySkillFlag } from "../SkillEnum";
import { WorldManager } from "../../../world/WorldManager";
import { ScreenAdaptManager } from "../../../../../core/comm/ScreenAdaptManager";
import * as fgui from "fairygui-cc";
import { tween } from "cc";
import { Tween } from "cc";

export class LuXiFaShow extends HeroShowUnit {
    protected blackComp: ui.commBattle.battleComp.BattleBlackComp;
    public showBlackComp(): void {
        if (!this.blackComp) {
            this.blackComp = fgui.UIPackage.createObject("commBattle", "BattleBlackComp") as ui.commBattle.battleComp.BattleBlackComp;
        }
        WorldManager.ins().effectSecondTopLayer.addChild(this.blackComp.node);
        this.blackComp.width = ScreenAdaptManager.viewWidth * 3;
        this.blackComp.height = ScreenAdaptManager.viewHeight * 3;
        this.blackComp.setPosition(this.pos.x, -this.pos.y);
        this.blackComp.alpha = 0;
        tween(this.blackComp).to(0.5, { alpha: 0.5 }).delay(2).to(0.5, { alpha: 0 }).start();
        WorldManager.ins().effectSecondTopLayer.addChild(this.node);
    }

    public hideBlackComp(): void {
        if (this.blackComp) {
            Tween.stopAllByTarget(this.blackComp);
            this.blackComp.dispose()
            this.blackComp = null;
        }
        WorldManager.ins().roleLayer.addChild(this.node);
    }

    /**销毁 */
    dispose() {
        super.dispose()
        this.hideBlackComp();
    }
}

export class LuXiFa extends HeroUnit {
    private atkSpeedToAttrMap: { [key: number]: number } = {}
    get atkTimeScale() {
        let atkSpeed = this.getAttrValue(AttrEnum.ATK_SPD)
        if (atkSpeed > 0) {
            let P4340_s201Parm = this.attr.getPassiveSkillFlag(PassivitySkillFlag.P4340_s201)
            if (P4340_s201Parm) {
                for (let attrKey in P4340_s201Parm) {
                    const config = G.TableManager.getDataById(table.battle.AttributeConfig, attrKey);
                    if (config) {
                        this.atkSpeedToAttrMap[config.tid] = P4340_s201Parm[attrKey] * atkSpeed / 100;
                    }
                }
            }
        }
        return this.attr.atkTimeSpeed / 1000;
    }

    /***获取当前绑定的对应显示单位，不一定有值 */
    public showUnit(): LuXiFaShow {
        return super.showUnit() as LuXiFaShow;
    }

    /***根据属性类型获取属性，包含战斗中所有加成 */
    getAttrValue(key: AttrEnum): number {
        return super.getAttrValue(key) + (this.atkSpeedToAttrMap[key] || 0)
    }
}

/***
 * 路西法的左轮手枪有着已被固定的攻击速度，每超出上限1%攻速会转化为1%攻击力；此外，进入战斗后累积受到最大生命值50%的伤害后进入隐匿状态持续3秒，解除自身所有不利状态并清除当前仇恨并且隐匿不打断自身攻击效果
 *  */
export class LuXiFaSkill2 extends FightSkillInfo {
}

export class LuXiFaSkill3 extends FightSkillInfo {
    private fightTimeCheck: FightTimeCheck
    private buffs: SkillBuffGroup[] = []
    protected hurtDelayHandler(behavior: SkillBehavior, effectParam: { amount: number, buff: string[] }, caster: ICaster, takers: BattleUnit[]): void {
        let param: { delay: number, buff: string } = behavior.cfg.param;
        if (param && param.delay) {
            let selectTarget = takers.concat();
            let P4340_x101Parm = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P4340_x101)
            if (P4340_x101Parm && behavior.cfg.num > selectTarget.length) {
                let num = behavior.cfg.num - selectTarget.length;
                while (num > 0) {
                    let index = caster.battleLogic.randomMgr.randomInt(0, takers.length - 1)
                    selectTarget.push(takers[index])
                    num--;
                }
            }

            for (let i = 0; i < selectTarget.length; i++) {
                let buff = caster.battleLogic.buffMgr.buffControlByGroup(param.buff, caster, selectTarget[i], behavior)
                if (buff)
                    this.buffs.push(buff)
            }
            this.fightTimeCheck = this.skill.battleLogic.createTimeCheck(param.delay, Handler.create(this, super.hurtDelayHandler, [behavior, effectParam, caster, selectTarget]))
        }
        else
            super.hurtDelayHandler(behavior, effectParam, caster, takers)
    }

    public buffBeforce(buff: SkillBuff): void {
        super.buffBeforce(buff)
        if (buff.effectType == BuffType.FlagBuff && buff.cfg.effectParam.type == "luxifa") {
            if (this.skill.owner instanceof LuXiFa)
                this.skill.owner.showUnit()?.showBlackComp()
        }
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        for (let i = 0; i < this.buffs.length; i++) {
            this.buffs[i].removeAll();
        }
        this.buffs.length = 0;

        if (this.fightTimeCheck) {
            this.fightTimeCheck.destoryTimeCheck();
            this.fightTimeCheck = null;
        }

        if (this.skill.owner instanceof LuXiFa)
            this.skill.owner.showUnit()?.hideBlackComp()
    }
}
