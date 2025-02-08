import * as fgui from "fairygui-cc";
import { UISecretAreaKey } from "../const/UISecretAreaConfig";
import { UIView } from "../../../../core/mvc/view/UIView";
import { TableManager } from "../../../../core/table/TableManager";
import { awardListItem } from "../item/awardListItem";
import { bindScript } from "../../../../core/comm/UIScriptManager";

/**
 * 奇点秘境
 * 奖励预览
 */
@bindScript(UISecretAreaKey.SecretAreaAwardView)
export class SecretAreaAwardView extends UIView {
    static pkgName: string = "secretArea";
    static viewName: string = "SecretAreaAwardView";

    //当前显示层数
    private _level:number;
    private _allCfg:table.secretinstance.SecretInstanceConfig[];

    private get view(): ui.secretArea.view.SecretAreaAwardView {
        return this._view as any;
    }


    protected onInit(): void {
        this.view.footer.btnBack.on(fgui.Event.CLICK, this.closeSelf, this);

        this.view.list_award.itemRenderer = this.awardItem.bind(this);
    }

    protected onOpen(args: any): void {
        this._allCfg = TableManager.getAllData(table.secretinstance.SecretInstanceConfig);
        this.view.list_award.numItems = this._allCfg.length;

    }


    private awardItem(index:number, item:awardListItem){
        item.updateData(this._allCfg[index].id);
    }



}