import * as fgui from "fairygui-cc"
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import GIns from "../../../GIns";
import { QualityUtils } from "../../common/quality/QualityUtils";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { HeroUtils } from "../../hero/utils/HeroUtils";



/** 列表的宠物 cell */
@bindFguiExtension("ui://comm/PetCellH")
export class PetCellH extends fgui.GButton {
    static pkgName: string = "comm";
    static viewName: string = "PetCellH";

    private _star: number

    private get view(): ui.comm.pet.PetCellH {
        return this as any;
    }

    onInit() {
        let view = this.view
        view.stars.itemRenderer = this.starItem.bind(this);
        
    }

    setData(cfgData: table.pet.PetConfig) {
        let view = this.view

        let qualityCfg = QualityUtils.getQualityConfigById(cfgData.quality)
        view.bg.icon = qualityCfg.petCardQualityBgPath

        view.petIcon.icon = ItemUtils.getNormaHeadByPath(cfgData.headPath)


        let vo = GIns.petModel.petContext.getDataByCfgId(cfgData.id)
        this._star = vo.star

        view.stars.numItems = HeroUtils.getShowStarCount(vo.star)
    }

    private starItem(index: number, item: ui.comm.item.StarIconItem) {
        item.starIcon.icon = ItemUtils.getStarIcon(this._star);


    }

}