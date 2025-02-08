import * as fgui from "fairygui-cc";
import {GmModel} from "db://assets/scripts/gm/model/GMModel";
import { FormationManager } from "../../game/modules/formation/FormationManager";
import { HeroManager } from "../../game/modules/hero/HeroManager";
import { UIManager } from "../../core/mvc/UIManager";
import { UICommonKey } from "../../game/modules/common/const/UICommonConfig";
import G from "../../core/comm/G";
import { ITransfer } from "../../game/tiledMap/interface/ITransfer";


/**
 * GM 英雄属性
 */
export class GMTransferMapView extends fgui.GComponent {


    // region 静态属性 for FGUI
    static pkgName: string = "gm";

    static viewName: string = "GMTransferMapView";

    // endregion


    private get view(): ui.gm.GMTransferMapView {
        return this as any;
    }

    constructor() {
        super();
    }

    onConstruct() {
        this.onInit()
    }

    public onInit() {


        this.view.heroAttrInputBox.labelTitle.text = "地图id";
        // button
        this.view.btnOk.labelTitle.text = "传 送"

        this.view.btnOk.on(fgui.Event.CLICK, this.onClickOk, this)

    }


    private onClickOk() {
        const mapId = this.view.heroAttrInputBox.inputName.text.toInt();
        G.UIManager.open(UICommonKey.TransferAnimToPointWin, {mapId: mapId} as NCommon.ITransferAnimToPointWin_param)
    }
}