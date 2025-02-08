import BattleTimer from "../../../../core/timer/BattleTimer";
import { Handler } from "../../../../core/utils/Handler";
import { InterpolationMoveComp } from "../comp/InterpolationMoveComp";
import { ActorUnitNode } from "../node/ActorUnitNode";
import { BaseCollectSkillUnit } from "../unit/collectSkill/BaseCollectSkillUnit";
import { BaseShowUnit } from "./BaseShowUnit";

export class CollectSkillShowUnit extends BaseShowUnit {
    public unitData: BaseCollectSkillUnit;

    public setSpineNode(node: ActorUnitNode) {
        super.setSpineNode(node)
        this.interpolationMoveComp = new InterpolationMoveComp(BattleTimer.battleTickFrame, new Handler(this, this.onInterpolationMove, null, false))
    }

    public update(): void {
        this.setSpinesPosXY(this.unitData.pos.x, this.unitData.pos.y)
        for (let i = 0; i < this._spineNodeList.length; i++) {
            if (this.statueData) {
                if (this.statueData.addAngle != null) {
                    this._spineNodeList[i].angle += this.statueData.addAngle;
                }
                if (this.statueData.angle != null) {
                    this._spineNodeList[i].angle = this.statueData.angle;
                }
            }
        }
        super.update()
    }

    private interpolationMoveComp: InterpolationMoveComp;
    public setSpinesPosXY(x: number, y: number): void {
        this.interpolationMoveComp.update(this.pos);
    }

    private onInterpolationMove(x: number, y: number): void {
        super.setSpinesPosXY(x, y)
    }
}