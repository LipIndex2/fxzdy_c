/** 系统相关 （不区分角色）*/
export class LocalSysData {
    /**示例
     * loginTime：string;
     * 使用
     * let loginTime = LocalStorage.sys.loginTime;
     * LocalSysStorage.sys.loginTime = loginTime;
     */
    league: { leagueBossStage: number }

    season: { signed: number }

    /***设备UID */
    deviceUuid: string;
}

/** 角色相关 */
export class LocalPlayerData {
    /**示例
     * loginTime：string;
     * 使用
     * let loginTime = LocalStorage.player.loginTime;
     * LocalStorage.player.loginTime = loginTime;
     */

    battleTest: { isTestStopEnemy: boolean, isTestStopHero: boolean, isTestOnlyNormal: boolean, isTestNotHurt: boolean, lastJson: string };

    /**记录世界地图坐标
     * vaildTime 有效时间
     * mapId 地图Id
     * pos 位置
     */
    worldMapLocation: { vaildTime: number, mapId: number, pos: { x: number, y: number } };

    season: { signed: number  }
}