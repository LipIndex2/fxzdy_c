import { TableManager } from "db://assets/scripts/core/table/TableManager";

export class RobotConfigManager {

    /**
     * 机器人配置id
     * @param robotConfigId
     */
    static getRobotConfigById(robotConfigId: number): table.arena.ArenaRobotConfig {
        return TableManager.getDataById(table.arena.ArenaRobotConfig, robotConfigId)
    }

    /**
     * 机器人形象
     * @param robotConfigId
     */
    static getRobotShowConfigById(robotConfigId: number): table.arena.ArenaRobotShowConfig {
        return TableManager.getDataById(table.arena.ArenaRobotShowConfig, robotConfigId)
    }
}