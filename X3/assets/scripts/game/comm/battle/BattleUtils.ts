import { Vec2, v2 } from "cc";
import BattleTimer from "../../../core/timer/BattleTimer";
import RandomUtils from "../../../core/utils/RandomUtils";
import { BattleLogicManager } from "./BattleLogicManager";
import { WorldUnitTeam } from "./enum/BattleEnum";
import { FightType } from "./enum/FightType";
import { TableManager } from "../../../core/table/TableManager";

export class BattleUtils {


    // public static frameDeltaMs: number = 16 * BattleTimer.battleTickFrame;

    /***每帧毫秒数 */
    public static get frameDeltaMs(): number {
        return 16 * BattleTimer.battleTickFrame
    }

    /***通过时间转换为帧数 */
    public static getFrameByTime(time: number): number {
        let fps = 60 / BattleTimer.battleTickFrame;
        return Math.ceil(fps / 1000 * time)
    }

    /***帧转毫秒 */
    public static getTimeByFrame(frame: number): number {
        let fps = 60 / BattleTimer.battleTickFrame;
        return Math.ceil(1 / fps * frame * 1000)
    }

    /***通过对话内容权重和概率获得对话内容 */
    public static getUnitTalk(talkObj: { str: string[], pro: number[] }, talkProbability: number): string {
        if (!talkObj)
            return null

        if (!RandomUtils.isRandTrue(talkProbability)) {
            return null;
        }

        let talkStr = "";
        let index = RandomUtils.randomProbability(talkObj.pro)
        talkStr = talkObj.str[index]
        return talkStr
    }

    public static setPosNotBlockPos(fightType: FightType, pos: Vec2, num: number = 20): Vec2 {
        let battleLogic = BattleLogicManager.ins().get(fightType)
        let teamPos = battleLogic.getTeamByTeamId(WorldUnitTeam.Self).pos
        let teamPosTile = battleLogic.aStar.getTilePoint(teamPos.x, teamPos.y)
        let tempPos = v2()
        let newPos = battleLogic.aStar.getTilePoint(pos.x, pos.y);
        let numberTurns: number = 0;
        while (true) {
            if (!battleLogic.unitCollisionsManager.isInBlock(pos)) {
                let paths = battleLogic.aStar.findPaths(teamPos, pos, false, 0, false);
                if (paths && paths.length > 0 && paths.length < 15) {
                    return pos;
                }
            }

            numberTurns++;

            //寻找上下左右可走的一格
            for (let i = -numberTurns; i < numberTurns; i++) {
                for (let j = -numberTurns; j < numberTurns; j++) {
                    tempPos.set(newPos.x + i, newPos.y + j)
                    let path2 = battleLogic.aStar.findPathsByTile(teamPosTile, tempPos, false, 0, false)
                    if (path2?.length) {
                        return battleLogic.aStar.getPixelPoint(tempPos.x, tempPos.y);
                    }
                }
            }

            if (numberTurns > 20) {
                break
            }
        }
        return teamPos
    }

    /***获取召唤物的的特效模型 */
    public static getSummonModel(modelId: number, skinId: number): number {
        let skinCfg = TableManager.getDataById(table.hero.HeroSkinConfig, skinId);
        if (skinCfg && skinCfg.changeSummonModelData && skinCfg.changeSummonModelData[modelId]) {
            modelId = skinCfg.changeSummonModelData[modelId];
        }
        return modelId;
    }

    /***获取皮肤的特效模型 */
    public static getSkinEffectModel(modelId: number, skinId: number): number {
        let skinCfg = TableManager.getDataById(table.hero.HeroSkinConfig, skinId);
        if (skinCfg && skinCfg.changeModelData && skinCfg.changeModelData[modelId]) {
            modelId = skinCfg.changeModelData[modelId];
        }
        return modelId;
    }
}