import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";

@bindFguiExtension("ui://account/ComAccount")
export default class AccountHistoryCom extends fgui.GComponent {

    private _data: string[];

    public get view(): ui.account.com.ComAccount {
        return (this as any);
    }

    public initData(data: string[], clickFun: Function): void {
        this._data = data;
        let list = this.view.list_account;
        list.itemRenderer = this.renderListItem.bind(this);
        list.setVirtual();
        list.numItems = data.length;
        list.on(fgui.Event.CLICK_ITEM, () => {
            clickFun(list.selectedIndex);
        }, this);
    }

    private renderListItem(index: number, item: fgui.GComponent) {
        item.getChild("title").text = this._data[index];
    }
}