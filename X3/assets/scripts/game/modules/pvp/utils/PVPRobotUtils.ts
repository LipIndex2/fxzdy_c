import G from "db://assets/scripts/core/comm/G";


export class PVPRobotUtils {

    /**
     * 机器人配置id
     * @param robotConfigId
     */
    static getRobotConfigById(robotConfigId: number): table.arena.ArenaRobotConfig {
        return G.TableManager.getDataById(table.arena.ArenaRobotConfig, robotConfigId)
    }
}