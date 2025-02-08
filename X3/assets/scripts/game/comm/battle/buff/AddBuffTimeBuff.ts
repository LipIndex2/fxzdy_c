import { BattleUtils } from "../BattleUtils";
import { SkillBuff } from "../skill/SkillBuff";
/***
 * 增加BUFF的持续时间
 * group buff组别数组
 * time:要增加的毫秒数
 */
export class AddBuffTimeBuff extends SkillBuff {
    protected buffHandler(): void {
        let effectParam: { group: string[], time: number } = this.effectParm1;
        if (effectParam) {
            for (let i = 0; i < effectParam.group.length; i++) {
                let groups = this.battleLogic.buffMgr.getBuffGroupByGroup(effectParam.group[i], this.target.uid);
                for (let j = 0; j < groups.length; j++) {
                    groups[j].addBuffTime(BattleUtils.getFrameByTime(effectParam.time))
                }
            }
        }
    }
}