import * as fgui from "fairygui-cc"
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import GIns from "../../../GIns";
import { QualityUtils } from "../../common/quality/QualityUtils";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { HeroUtils } from "../../hero/utils/HeroUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotPath } from "../../common/redDot/structs/RedDotPath";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import G from "../../../../core/comm/G";
import { Sprite } from "cc";
import FGUILoader from "../../../../core/fgui/com/FGUILoader";

enum EState {
    lock = 0,       //未解锁
    compound = 1,   //可合成
    unlock = 2,     //已解锁
}

/** 列表的宠物 cell */
@bindFguiExtension("ui://comm/PetCellV")
export class PetCellV extends fgui.GButton {
    static pkgName: string = "comm";
    static viewName: string = "PetCellV";

    index: number

    private _star: number
    private choseState: fgui.Controller

    private get view(): ui.comm.pet.PetCellV {
        return this as any;
    }

    onInit() {
        let view = this.view
        this.choseState = this.getController("choseState")
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

        let cardState: EState, redPath: RedDotPath
        if (vo.active == false) {
            let fragementCount = GIns.backpackMgr.getItemCountByItemId(cfgData.fragmentItemId)
            if (fragementCount >= cfgData.activeCostFragment) {
                cardState = EState.compound
            } else {
                cardState = EState.lock
            }
            redPath = RedDotKeys.Pet_active
        } else {
            cardState = EState.unlock
            redPath = RedDotKeys.Pet_UpStar
        }
        this.getController("state").setSelectedIndex(cardState)
            ; (this.view.redDot as any as RedDotCom).reset(redPath, [cfgData.id])
    }

    private starItem(index: number, item: ui.comm.item.StarIconItem) {
        item.starIcon.icon = ItemUtils.getStarIcon(this._star);
    }

    set choose(v: boolean) {
        if (v) {
            let gloader = this.view.bg as FGUILoader;
            gloader.set9Grid(30, 116, 40, 40);

            this.choseState.setSelectedIndex(1)
        } else {
            this.choseState.setSelectedIndex(0)
        }
    }
}