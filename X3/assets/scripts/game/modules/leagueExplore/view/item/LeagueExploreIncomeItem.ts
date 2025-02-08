import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { ItemUtils } from "../../../item/utils/ItemUtils";
import { ILeagueExploreIncomeVo } from "../../model/vo/ILeagueExploreIncomeVo";

/**
 * 勘探收益item
 */
@bindFguiExtension('ui://leagueExplore/LeagueExploreIncomeItem')
export class LeagueExploreIncomeItem extends fgui.GButton {

    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExploreIncomeItem";

    protected _itemId: number = 0;
    private get view(): ui.leagueExplore.item.LeagueExploreIncomeItem {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {

    }

    protected onPreDispose(): void {

    }

    public setData(data: ILeagueExploreIncomeVo, additionStr:string = ''): void {
        if (this._itemId != data.itemId) {
            this._itemId = data.itemId;
            let cfg = ItemUtils.getItemConfigByItemId(data.itemId);
            this.view.iconLoader.icon = cfg ? cfg.smallIconPath : '';
        }
        this.view.lbValue.text = data.itemAmountPerHour + '/时';
        this.view.lbAddition.text = additionStr;
    }
}