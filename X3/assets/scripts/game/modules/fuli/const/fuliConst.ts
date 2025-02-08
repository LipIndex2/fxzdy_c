import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { WorldBossPage } from "../page/worldBossPage";
import { fuliMainView } from "../view/fuliMainView";

export enum UIFuilKey
{   
    fuliMain = "fuliMain",
    worldBoss = "worldBoss"
}

export enum I18FuliKey
{
    i18n_fuli_fuliMain = "i18n:fuli:fuliMain",
    i18n_fuli_worldBoss = "i18n:fuli:worldBoss"
}

UIScriptManager.bindScript(UIFuilKey.fuliMain, fuliMainView);
UIScriptManager.bindScript(UIFuilKey.worldBoss, WorldBossPage);


