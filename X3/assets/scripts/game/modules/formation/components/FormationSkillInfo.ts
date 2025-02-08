import * as fgui from 'fairygui-cc';
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { FguiScriptUtils } from '../../../../core/utils/FguiScriptUtils';
import { ItemUtils } from "../../item/utils/ItemUtils";
import { FormationSkillVisitVo, FormationSkillVo } from '../vo/FormationSkillVo';
import { FormationSkillIcon } from './FormationSkillIcon';

/**
 * 上阵技能展示
*/
@bindFguiExtension('ui://comm/FormationSkillInfo')
export class FormationSkillInfo extends fgui.GComponent {

    get view(): ui.comm.formation.FormationSkillInfo {
        return this as any
    }

    public get infoComp(): FormationSkillIcon {
        return FguiScriptUtils.toMyScriptClass(this.view.pInfo, FormationSkillIcon)
    }

    protected updateState(): void {
        if (this.infoComp.isHaveData) {
            this.view.getController('setFlag').selectedIndex = 1
            this.view.lbName.text = this.infoComp.skillName;
            this.view.lbName.color = ItemUtils.getTextColor(this.infoComp.skillQuality)
        } else {
            this.view.getController('setFlag').selectedIndex = 0
        }
    }

    public updateData(baseId: number, star: number, lv:number = -1): void {
        this.infoComp.updateData(baseId, star, lv);
        this.updateState();
    }

    public updateByVisitVo(vo: FormationSkillVisitVo): void {
        this.infoComp.updateByVisitVo(vo);
        this.updateState();
    }

    public updateByVo(vo: FormationSkillVo): void {
        this.infoComp.updateByVo(vo);
        this.updateState();
    }
}