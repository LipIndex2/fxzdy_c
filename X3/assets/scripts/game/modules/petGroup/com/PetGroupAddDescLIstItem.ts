import * as fgui from "fairygui-cc"
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import G from "../../../../core/comm/G";
import { PetGroupShowPet } from "./PetGroupShowPet";
import GIns from "../../../GIns";
import { AttrUtils } from "../../attr/utils/AttrUtils";
import { TStage } from "../PetGroupContext";
import { AttrConfigEffect } from "../../attr/structs/AttrConfigEffect";
import { Color } from "cc";
import { ColorUtils } from "db://assets/scripts/core/utils/ColorUtils";

@bindFguiExtension("ui://petGroup/PetGroupAddDescLIstItem")
export class PetGroupAddDescLIstItem extends fgui.GComponent {
    static pkgName: string = "petGroup";
    static viewName: string = "PetGroupAddDescLIstItem";

    private attrs: AttrConfigEffect[];

    private activeCtrl: fgui.Controller
    private progressCtrl: fgui.Controller

    private get view(): ui.petGroup.view.groupAddInfo.PetGroupAddDescLIstItem {
        return this as any;
    }

    protected onInit(): void {
        let view = this.view;
        view.list.itemRenderer = this.renderAttr.bind(this);
        // view.list.setVirtual();
        this.activeCtrl = view.getController("c1");
        this.progressCtrl = view.getController("c2");
    }

    setData(petGroupId: number, data: Readonly<XJ.Pet.IGroupInfo>) {
        let view = this.view;
        let petGroupContext = GIns.petModel.petGroupContext;

        let petGroupVo = petGroupContext.getGroupVo(petGroupId);

        if (data.stage == 0) {
            view.lblProgress.text = "";
        } else {
            view.lblProgress.text = `${Math.min(petGroupVo.starNum, data.activeStar)}/${data.activeStar}`
        }

        let progressIdx: number
        if (petGroupVo.isActived(data.stage)) {
            progressIdx = 2;
            view.lblProgress.color = ColorUtils.COLOR_GREEN2;;
            this.activeCtrl.selectedIndex = 1;
        } else {
            progressIdx = 1;
            view.lblProgress.color = ColorUtils.COLOR_RED2;
            this.activeCtrl.selectedIndex = 0;
        }

        this.progressCtrl.selectedIndex = progressIdx;

        if (data.stage == 0) {
            view.lblLVName.text = `LV${data.stage + 1} 集齐该组合星灵`;
            view.lbladdDesc.text = "激活加成：";
        } else {
            view.lblLVName.text = `LV${data.stage + 1} 该组合星灵总星级达到${data.activeStar}`;
            view.lbladdDesc.text = "羁绊加成：";
        }

        this.attrs = AttrUtils.parseKvArrayToAttrArray(data.allActiveAttr);
        view.list.numItems = this.attrs.length;
    }

    private renderAttr(index: number, item: ui.petGroup.com.PetGroupAddAttrListItem) {
        let attrEff = this.attrs[index];
        item.desc.text = "队伍" + attrEff.config.attrName + attrEff.getShowValueTextWithSymbol();

        item.getController("c1").selectedIndex = this.activeCtrl.selectedIndex;
    }
}