import { Vec2 } from "cc"
import { TableManager } from "../../../../core/table/TableManager";
import { BattleLogic } from "../BattleLogic";

export class BaseAutoFight {
    public battleLogic: BattleLogic;
    /***当前刷怪导航点 */
    protected nowIndex: number = 0;
    public paths: { x: number, y: number }[] = []
    public setData(...parm): void {
        this.initPaths()
    }

    /***设置导航点 */
    protected initPaths(): void {
        let battleCfg = TableManager.getDataById(table.battle.BattleConfig, this.battleLogic.battleConfigId);
        let monsterResourceIds = battleCfg.monsterResourceIds;
        for (let i = 0, len = monsterResourceIds.length; i < len; i++) {
            let cfg = TableManager.getDataById(table.battle.MonsterResourceConfig, monsterResourceIds[i]);
            if (cfg) {
                let resourceItem = this.battleLogic.unitProcessor.mapIns.getUnitPosObjectByObjectId(cfg.resourceId)
                this.paths.push(resourceItem);
            }
        }
    }

    public autoHandler(): void {
        if (!this.paths?.length) return; //临时容错

        let team = this.battleLogic.unitProcessor.myTeam;
        if (!team.isMoving && !team.isTeamFighting) {
            if (team.targetMovePoint) {
                let dis = Vec2.distance(team.targetMovePoint, team.pos);
                if (dis <= 20) {
                    team.stopMove()
                    return;
                }
                else if (team.getTeamSelectMainTarget()) {
                    //在队伍范围内，判断英雄是否能进入战斗
                    team.stopMove()
                    return;
                }
            }
            let resPoint = this.paths[this.nowIndex];
            if (!resPoint) return;   //临时容错

            team.setMoveVec(resPoint.x, resPoint.y)
        } else if (team.targetMovePoint) {
            team.stopMove()
            return;
        }
    }

    /***是否最后1个点 */
    public isEnd(): boolean {
        return this.nowIndex == this.paths.length - 1;
    }

    /***下1个点，如果有 */
    public next(): void {
        if (this.nowIndex < (this.paths.length - 1)) {
            this.nowIndex++;
        }
    }

    /***检查是否不执行自动 */
    public checkStopAuto(): boolean {
        return true
    }

    public stop(): void {
    }

    public close(): void {

    }
}