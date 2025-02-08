import BattleConstantConfig from "../config/BattleConstantConfig";
import { SkillBuff } from "../skill/SkillBuff";

/***
 * 驱散AbnormalType
 */
export class DispelAbnormalTypeBuff extends SkillBuff {
    public num: number = -1;
    public resData(): void {
        super.resData()
        let effectParam: { type: number[], group: string, random: number, num: number } = this.effectParm1
        this.num = effectParam.num || -1;
    }

    protected buffHandler(): void {
        let effectParam: { type: number[], group: string, random: number, num: number } = this.effectParm1
        let randomNum = effectParam.random || 0;
        let buffList: SkillBuff[] = this.battleLogic.buffMgr.getBuffListByEffect(this.target)
        if (buffList?.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                let targetBuff: SkillBuff = buffList[i];
                if (!targetBuff.isReadyToRemove && targetBuff.cfg.abnormalType) {
                    if ((this.num == -1 || this.num > 0) && targetBuff.cfg.stateType && effectParam.group && BattleConstantConfig.checkAbnormalType(effectParam.group, targetBuff.cfg.abnormalType + "")) {
                        targetBuff.isReadyToRemove = true;
                        if (this.num)
                            this.num--;
                        randomNum--;
                        if (effectParam.random && randomNum <= 0) {
                            break
                        }
                    }

                    if ((this.num == -1 || this.num > 0) && targetBuff.cfg.stateType && effectParam.type && effectParam.type.indexOf(targetBuff.cfg.abnormalType) != -1) {
                        targetBuff.isReadyToRemove = true;
                        if (this.num)
                            this.num--;
                        randomNum--;
                        if (effectParam.random && randomNum <= 0) {
                            break
                        }
                    }
                }
            }
        }
    }
}