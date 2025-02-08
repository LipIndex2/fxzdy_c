import { BaseAutoFight } from "./BaseAutoFight";
import { v2 } from "cc";

export class ArenaAutoFight extends BaseAutoFight {

    private enemyX: number = 0;
    private enemyY: number = 0
    public setData(...parm): void {
        super.setData(...parm)
    }

    /***设置导航点 */
    protected initPaths(): void {
        let mapCfg = this.battleLogic.mapCfg;
        this.enemyX = mapCfg.enemyPos[0]
        this.enemyY = mapCfg.enemyPos[1]
        this.paths.push({ x: this.enemyX, y: this.enemyY });
        let heros = this.battleLogic.unitProcessor.heroes;
        for (let i = 0; i < heros.length; i++) {
            heros[i].setMoveTarget(v2(this.enemyX, this.enemyY))
        }
    }

    // public autoHandler(): void {
    //     let mainScene = BattleManager.ins().mainScene;
    //     let team = mainScene.getHeroTeam();
    //     if (!team.isMoving && !team.getTeamSelectMainTarget) {
    //         if (team.targetMovePoint) {
    //             let dis = Vec2.distance(team.targetMovePoint, team.pos);
    //             if (dis <= 20) {
    //                 team.stopMove()
    //                 return;
    //             }
    //             else if (team.getTeamSelectMainTarget()) {
    //                 //在队伍范围内，判断英雄是否能进入战斗
    //                 team.stopMove()
    //                 return;
    //             }
    //         }
    //         let resPoint = this.paths[this.nowIndex];
    //         team.setMoveVec(resPoint.x, resPoint.y)
    //     } else if (team.targetMovePoint) {
    //         team.stopMove()
    //         return;
    //     }
    // }

}