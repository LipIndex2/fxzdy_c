import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIPetGroupKey } from "../const/UIPetGroupConfig";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import NotificationKey from "../../../event/NotificationKey";
import { PetGroupShowPet2 } from "../com/PetGroupShowPet2";
import GIns from "../../../GIns";
import { AttrConfigEffect } from "../../attr/structs/AttrConfigEffect";


/** 星灵羁绊激活/升级界面 */
@bindScript(UIPetGroupKey.PET_GROUP_UP_INFO_VIEW)
export class PetMainView extends UICommWin {
    static pkgName: string = "petGroup";
    static viewName: string = "PetGroupUpInfoView";

    private petGroupCfg: table.pet.PetGroupConfig
    private attrs: Readonly<Array<Readonly<{ k: any, v: any }>>>

    private get view(): ui.petGroup.view.groupUpInfo.PetGroupUpInfoView {
        return this._view as any;
    }

    protected onInit() {
        let view = this.view;

        view.BtnClose.onClick(this.closeSelf, this);

        view.petList.itemRenderer = this.petRenderer.bind(this);
        view.petList.setVirtual()

        view.addList.itemRenderer = this.attrRenderer.bind(this);

    }

    protected onOpen(petGroupId: number, isReopen?: boolean) {
        let view = this.view;

        this.petGroupCfg = G.TableManager.getDataById(table.pet.PetGroupConfig, petGroupId);
        view.lblGroupName.text = this.petGroupCfg.groupName;

        view.petList.numItems = this.petGroupCfg.petBaseIds.length;

        let vo = GIns.petModel.petGroupContext.getGroupVo(petGroupId);
        this.attrs = vo.getStarAttrs();
        view.addList.numItems = this.attrs.length;
    }

    private petRenderer(index: number, item: PetGroupShowPet2) {
        item.setData(this.petGroupCfg.petBaseIds[index]);
        item.setShowPlus(index < this.petGroupCfg.petBaseIds.length - 1);
    }

    private attrRenderer(index: number, item: ui.petGroup.view.groupUpInfo.PetGroupUpAddItem) {
        let attr = this.attrs[index];
        let attrEff = AttrConfigEffect.create(attr.k, attr.v);
        item.desc.text = "队伍" + attrEff.config.attrName + attrEff.getShowValueTextWithSymbol();
    }
}
