import { v2 } from "cc";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import RandomUtils from "../../../../../core/utils/RandomUtils";
import { BattleUtils } from "../../BattleUtils";
import BattleShowFactory from "../../factory/BattleShowFactory";
import { BaseLeaderSkillUnit } from "./BaseLeaderSkillUnit";
import { WorldManager } from "../../../world/WorldManager";
import { SkillBehavior } from "../../skill/SkillBehavior";
import { LeaderSkillShowUnit } from "../../show/LeaderSkillShowUnit";
import { BattleCommandType } from "../../BattleCommand";
import { Handler } from "../../../../../core/utils/Handler";
import { WorldUnitTeam } from "../../enum/BattleEnum";
import { AnimBaseUnitNode } from "../../node/AnimBaseUnitNode";

export class WuRenJiUnitShow extends LeaderSkillShowUnit {
    /***初始化监听的战斗指令 */
    protected initCommand(): void {
        super.initCommand()
        this.unitData.battleLogic.command.reg(BattleCommandType.wuRenJiHongZha, this.uid, new Handler(this, this.showBoomEffect))
    }

    private showBoomEffect(): void {
        let eff: AnimBaseUnitNode
        if (this.unitData.teamId == WorldUnitTeam.Self) {
            eff = BattleShowFactory.showEffectModel(10010030, v2(this.pos.x + RandomUtils.randomInt(50, 150) + 160, this.pos.y + RandomUtils.randomInt(50, 150) + 160), null, false, false)
            eff.angle = 30;
        }
        else {
            eff = BattleShowFactory.showEffectModel(10010030, v2(this.pos.x - RandomUtils.randomInt(50, 150) - 160, this.pos.y - RandomUtils.randomInt(50, 150) - 160), null, false, false)
            eff.angle = -30;
        }
        WorldManager.ins().effectLayer.addChild(eff);
        eff = BattleShowFactory.showEffectModel(10010031, v2(eff.position.x, eff.position.y), null, true, false)
    }

    protected onSpineLoaded(): void {
        super.onSpineLoaded();
        let absScaleX = Math.abs(this._spineNode.getScale().x)
        let absScaleY = Math.abs(this._spineNode.getScale().y)
        this._spineNode.setScale(absScaleX, absScaleY);
        if (this.unitData.teamId == WorldUnitTeam.Enemy) {
            this._spineNode.setScale(-absScaleX, -absScaleY);
        }
    }
}

export class WuRenJiUnit extends BaseLeaderSkillUnit {

    //startX:0;startY:0;endX:400;endY:400;speed:300
    private behaviors: SkillBehavior[];
    private nextBoomIndex: number = 0;
    private interval: number = 0;
    private curInterval: number = 0;
    initParam(): void {
        let param: { startX: number, startY: number, endX: number, endY: number, speed: number, interval: number } = this._cfg.param;

        let teamPos = this.battleLogic.getTeamPosByTeamId(this.teamId)
        let startX = +param.startX + teamPos.x;
        let startY = +param.startY + teamPos.y;
        let endX = +param.endX + teamPos.x;
        let endY = +param.endY + teamPos.y;
        if (this.teamId == WorldUnitTeam.Enemy) {
            startX = teamPos.x - +param.startX;
            startY = teamPos.y - +param.startY;
            endX = teamPos.x - +param.endX;
            endY = teamPos.y - +param.endY;
        }

        this.curInterval = this.interval = BattleUtils.getFrameByTime(param.interval);

        this._startVec.set(startX, startY);
        this.pos.set(startX, startY);

        let radians = MathUtils.getRadians(this._pos.x, this._pos.y, endX, endY);

        let speed = param.speed / 1000;
        this._moveVec.set(speed * Math.cos(radians), speed * Math.sin(radians));

        this.nextBoomIndex = BattleUtils.getFrameByTime(this.battleLogic.randomMgr.randomInt(0, 333))// RandomUtils.randomInt(0, 20)


        this.behaviors = [];
        let behaviorTimings = this.skill.behaviorsTiming;
        for (let i = 0; i < behaviorTimings.length; i++) {

            let trigger = behaviorTimings[i].delay || 0
            const behavior = SkillBehavior.createBehavior(behaviorTimings[i].behaviorId, trigger, this.skill);
            if (!behavior) {
                continue;
            }
            behavior.index = 0;
            behavior.setCaster(this)
            this.behaviors.push(behavior);
        }
    }

    update(): boolean {
        let b = super.update();
        this.pos.add2f(this._moveVec.x * BattleUtils.frameDeltaMs, this._moveVec.y * BattleUtils.frameDeltaMs);
        this.nextBoomIndex--;
        if (this.nextBoomIndex <= 0) {
            this.nextBoomIndex = BattleUtils.getFrameByTime(RandomUtils.randomInt(83, 500))
            this.battleLogic.command.send(BattleCommandType.wuRenJiHongZha, this.uid)
        }

        this.curInterval--;
        if (this.curInterval <= 0) {
            this.curInterval = this.interval;
            for (let i = 0; i < this.behaviors.length; i++) {
                this.behaviors[i].actionEffect()
            }
        }
        return b;
    }
}