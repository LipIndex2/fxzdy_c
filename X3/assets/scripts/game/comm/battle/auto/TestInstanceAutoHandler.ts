import { BaseAutoFight } from "./BaseAutoFight";

export class TestInstanceAutoHandler extends BaseAutoFight {

    public setData(...parm): void {
        super.setData(...parm)
    }

    // public autoHandler(): void {
    //     let mainScene = BattleManager.ins().mainScene;
    //     let team = mainScene.getHeroTeam();
    //     if (!team.isMoving) {
    //         let vec = CollisionUtils.calVecTemp(team.pos, new Vec2(this.autoX, this.autoY), team.moveDistance);
    //         team.setMoveVec(vec)
    //     }
    // }
}