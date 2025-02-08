import * as fgui from "fairygui-cc"
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { petGroupBaseShowPet } from "./petGroupBaseShowPet";
import { QualityUtils } from "../../common/quality/QualityUtils";
import G from "db://assets/scripts/core/comm/G";
import { ModelNode } from "../../common/node/ModelNode";
import { EnumQuality } from "../../common/quality/enums/EnumQuality";

@bindFguiExtension("ui://petGroup/PetGroupShowNode")
export class PetGroupShowPet extends petGroupBaseShowPet {
    static pkgName: string = "petGroup";
    static viewName: string = "PetGroupShowNode";
}