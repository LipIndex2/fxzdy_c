import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { ResurgenceView } from "../view/ResurgenceView";

export enum UIResurgenceConfig {
    ResurgenceView = "ResurgenceView",
 }
 
 UIScriptManager.bindScript(UIResurgenceConfig.ResurgenceView, ResurgenceView);