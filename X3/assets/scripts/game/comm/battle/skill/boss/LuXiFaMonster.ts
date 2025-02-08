import G from "../../../../../core/comm/G";
import { AttrEnum } from "../../attribute/AttrEnum";
import { PassivitySkillFlag } from "../SkillEnum";
import { WorldManager } from "../../../world/WorldManager";
import { ScreenAdaptManager } from "../../../../../core/comm/ScreenAdaptManager";
import * as fgui from "fairygui-cc";
import { tween } from "cc";
import { Tween } from "cc";
import { MonsterShowUnit } from "../../show/MonsterShowUnit";
import { MonsterUnit } from "../../unit/battle/MonsterUnit";

export class LuXiFaMonsterShow extends MonsterShowUnit {
    protected blackComp: ui.commBattle.battleComp.BattleBlackComp;

    /***初始化监听的战斗指令 */
    protected initCommand(): void {
        super.initCommand();
        this.addEvent("hideBlackComp", this, this.hideBlackComp)
        this.addEvent("showBlackComp", this, this.showBlackComp)
    }

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
}

export class LuXiFaMonster extends MonsterUnit {
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
    public showUnit(): LuXiFaMonsterShow {
        return super.showUnit() as LuXiFaMonsterShow;
    }

    /***根据属性类型获取属性，包含战斗中所有加成 */
    getAttrValue(key: AttrEnum): number {
        return super.getAttrValue(key) + (this.atkSpeedToAttrMap[key] || 0)
    }
}