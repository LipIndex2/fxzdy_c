/**
 * 竞技场 信息
 */
export class PVPInfoUtils {


// 名
    static getNameByOppo(vo: Vo.arena.ArenaOpponentVo): string {
        const baseVo = vo.baseVo;
        if (baseVo) {
            return baseVo.name;
        }
        return vo.robotBaseVo.robotName;
    }

    static getPowerNumByOppo(vo: Vo.arena.ArenaOpponentVo) {
        const baseVo = vo.baseVo;
        if (baseVo) {
            return baseVo.fight;
        }
        
        // 机器人的战斗力
        return vo.robotBaseVo.fight;
    }

    static getNameByRecord(vo: Vo.arena.ArenaChallengeRecord) {
        const baseVo = vo.defenderBaseVo;
        if (baseVo) {
            return baseVo.name;
        }
        return vo.defenderRobotBaseVo?.robotName || "";
    }

    static getBalanceScoreText(winFlag: boolean, currentScore: number, maxScore: number) {
        if (winFlag) {
            return `[color=#00ff00]${currentScore}[/color]/${maxScore}`;
        } else {
            return `[color=#ff0000]${currentScore}[/color]/${maxScore}`;
        }
    }

    // 高分段没有分母
    static getHighRankScoreText(winFlag: boolean, currentScore: number) {
        if (winFlag) {
            return `[color=#00ff00]${currentScore}[/color]`;
        } else {
            return `[color=#ff0000]${currentScore}[/color]`;
        }
    }
}