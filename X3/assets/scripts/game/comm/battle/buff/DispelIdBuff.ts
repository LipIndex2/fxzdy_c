import { SkillBuff } from "../skill/SkillBuff";

/***
 * 驱散知道BUFFID
 */
export class DispelIdBuff extends SkillBuff {

    protected buffHandler(): void {
        let buffList: SkillBuff[] = this.battleLogic.buffMgr.getBuffListByEffect(this.caster)
        if (buffList?.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                let targetBuff: SkillBuff = buffList[i];
                let effectParam: { ids: string[] } = this.effectParm1
                if (targetBuff.cfg.stateType && effectParam.ids.indexOf(targetBuff.id) != -1) {
                    targetBuff.isReadyToRemove = true;
                }
            }
        }
    }
}