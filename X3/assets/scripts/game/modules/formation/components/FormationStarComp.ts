import * as fgui from 'fairygui-cc';
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import GIns from '../../../GIns';
import { ICollectiblesDungeonLevelVo } from '../../collectiblesDungeon/model/vo/ICollectiblesDungeonLevelVo';
import { FormationVo } from '../vo/FormationVo';

/**
 * 挑战星级展示
*/
@bindFguiExtension('ui://formation/FormationStarComp')
export class FormationStarComp extends fgui.GComponent {

    protected _levelId: number = 0;
    protected _levelVo: ICollectiblesDungeonLevelVo = null;
    protected _formationVo: FormationVo = null;
    get view(): ui.formation.view.FormationStarComp {
        return this as any
    }

    protected onInit(): void {
        this.view.listCond.itemRenderer = this.itemRendererForCond.bind(this);
    }

    protected onPreDispose(): void {

    }

    protected itemRendererForCond(index: number, item: ui.formation.view.FormationStarItem): void {
        item.lbCond.text = this._levelVo.conditions[index].desc;
        item.getController('state').selectedIndex = this._levelVo.conditions[index].checkFormation(this._formationVo) ? 0 : 1;
    }

    public updateUI(levelId: number, formationVo: FormationVo): void {
        if (this._levelId != levelId) {
            this._levelId = levelId;
            this._levelVo = GIns.collectiblesDungeonModel.getLevelVo(levelId);
        }
        this._formationVo = formationVo;
        if (this._levelVo) {
            this.view.listCond.numItems = this._levelVo.conditions.length;
        }
    }
}