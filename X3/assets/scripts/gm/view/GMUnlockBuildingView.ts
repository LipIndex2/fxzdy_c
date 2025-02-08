import * as fgui from "fairygui-cc";
import {GmModel} from "db://assets/scripts/gm/model/GMModel";
import { FormationManager } from "../../game/modules/formation/FormationManager";
import { HeroManager } from "../../game/modules/hero/HeroManager";
import { UIManager } from "../../core/mvc/UIManager";
import { UICommonKey } from "../../game/modules/common/const/UICommonConfig";
import G from "../../core/comm/G";
import { MapModel } from "../../game/tiledMap/model/MapModule";


/**
 * GM 解锁建筑
 */
export class GMUnlockBuildingView extends fgui.GComponent {


    // region 静态属性 for FGUI
    static pkgName: string = "gm";

    static viewName: string = "GMUnlockBuildingView";


    private get view(): ui.gm.GMUnlockBuildingView {
        return this as any;
    }

    constructor() {
        super();
    }

    onConstruct() {
        this.onInit()
    }

    public onInit() {


        this.view.heroAttrInputBox.labelTitle.text = "建筑id组:id1,id2,id3";
        // button
        this.view.btnOk.labelTitle.text = "解 锁"

        this.view.btnOk.on(fgui.Event.CLICK, this.onClickOk, this)

    }


    private onClickOk() {
        const mapId = this.view.heroAttrInputBox.inputName.text;
        let ids = mapId.split(",");
        for(let id of ids){
            MapModel.ins().sendUnlockBuilding(Number(id));
        }
    }
}