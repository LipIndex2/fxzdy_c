import * as fgui from "fairygui-cc"
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import GIns from "../../../GIns";
import { AttrUtils } from "../../attr/utils/AttrUtils";
import { AttrConfigEffect } from "../../attr/structs/AttrConfigEffect";
import { Color } from "cc";
import { ColorUtils } from "db://assets/scripts/core/utils/ColorUtils";

@bindFguiExtension("ui://pet/PetStarAddDescLIstItem")
export class PetStarAddDescLIstItem extends fgui.GComponent {
    static pkgName: string = "pet";
    static viewName: string = "PetStarAddDescLIstItem";

    private attrs: AttrConfigEffect[]

    private activeCtrl: fgui.Controller
    private progressCtrl: fgui.Controller

    private get view(): ui.pet.view.PetAddInfo.PetStarAddDescLIstItem {
        return this as any;
    }

    protected onInit(): void {
        let view = this.view;
        view.list.itemRenderer = this.renderAttr.bind(this);
        // view.list.setVirtual();
        this.activeCtrl = view.getController("c1");
        this.progressCtrl = view.getController("c2");
    }

    /**
     * 
     * @param petCfgId 
     * @param star 0表示激活，其余代表指定星级
     */
    setData(petCfgId: number, star: number) {
        let view = this.view;
        let petCfgMgr = GIns.petCfgMgr;

        let attrs = petCfgMgr.getStarAttrKV(petCfgId, star);
        let vo = GIns.petModel.petContext.getDataByCfgId(petCfgId);


        let activeIdx = 0, progressIdx = 0
        if (star == 0) {
            view.lblLVName.text = "激活星灵加成：";
            if (vo.active) {
                activeIdx = 1;
            }
        } else {
            view.lblLVName.text = `${star}星星灵加成：`;

            //升星进度
            let vo = GIns.petModel.petContext.getDataByCfgId(petCfgId);
            view.lblProgress.text = `(${Math.min(vo.star, star)}/${star})`

            if (vo.star < star) {
                //未激活该星级
                if (vo.star < star) {
                    progressIdx = 1;
                } else {
                    progressIdx = 2;
                }
            } else {
                //激活该星级
                activeIdx = 1;
            }
        }
        this.activeCtrl.selectedIndex = activeIdx;
        this.progressCtrl.selectedIndex = progressIdx;

        this.attrs = AttrUtils.parseKvArrayToAttrArray(attrs);
        view.list.numItems = this.attrs.length;
    }

    private renderAttr(index: number, item: ui.pet.view.PetAddInfo.PetStarAddAttrListItem) {
        let attrEff = this.attrs[index];
        item.desc.text = "队伍" + attrEff.config.attrName + attrEff.getShowValueTextWithSymbol();

        item.getController("c1").selectedIndex = this.activeCtrl.selectedIndex;
    }
}