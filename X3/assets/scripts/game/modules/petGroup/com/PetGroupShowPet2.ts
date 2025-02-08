import * as fgui from "fairygui-cc"
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { petGroupBaseShowPet } from "./petGroupBaseShowPet";
import { QualityUtils } from "../../common/quality/QualityUtils";
import G from "db://assets/scripts/core/comm/G";
import { ModelNode } from "../../common/node/ModelNode";
import { EnumQuality } from "../../common/quality/enums/EnumQuality";

@bindFguiExtension("ui://petGroup/PetGroupShowNode2")
export class PetGroupShowPet2 extends petGroupBaseShowPet {
    static pkgName: string = "petGroup";
    static viewName: string = "PetGroupShowNode2";

    setShowPlus(show: boolean) {
        this.view.getController("jia").selectedIndex = show ? 1 : 0;
    }
}