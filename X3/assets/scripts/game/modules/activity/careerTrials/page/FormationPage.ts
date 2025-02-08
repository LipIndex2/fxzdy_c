import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { ActivityCareerTrialsVo } from "../../model/ActivityCareerTrialsVo";
import { TableManager } from "../../../../../core/table/TableManager";
import GIns from "../../../../GIns";
/**
 * 职业试炼
 * 推荐阵容page
 */
@bindFguiExtension("ui://activityCareerTrials/formationPage")
export class FormationPage extends fgui.GComponent {
    static pkgName: string = "activityCareerTrials";
    static viewName: string = "formationPage";

    private get view(): ui.activityCareerTrials.page.formationPage {
        return this as any;
    }

    private _vo: ActivityCareerTrialsVo;
    private _selTabId: number = 0;

    public setData(vo: ActivityCareerTrialsVo, selTabId: number) {
        this._vo = vo;
        this._selTabId = selTabId;

        for (let i = 0; i < 6; i++) {
            let item = this.view["heroItem" + i];
            if (i < 2) {
                let cfg = TableManager.getDataById(table.hero.HeroConfig, this._vo.getCfgById(this._selTabId).showHeros[i]);
                item.reset(this._vo.getCfgById(this._selTabId).showHeros[i], 1, cfg.initStar);
                item.isShowName(false);
                item.isCanClick(true);
                item.showCareer();
                item.isShowStar(false);
                item.isShowLevel(false);

                if (this._vo.getCfgById(this._selTabId).coreHeroIds.indexOf(this._vo.getCfgById(this._selTabId).showHeros[i]) != -1) {
                    item.isShowCore(true);
                } else {
                    item.isShowCore(false);
                }
            } else {
                let heroVo = GIns.heroMgr.getHeroVoByID(this._vo.getCfgById(this._selTabId).showHeros[i]);
                item.setHeroVo(heroVo, true);
                item.isShowName(false);
                item.isShowCamp(false);
                item.setClickShowDetail();
                item.isShowStar(false);
                item.isShowLevel(false);
            }
        }
    }
}
