import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";

@bindFguiExtension('ui://petDungeon/PetDungeonToyDelBtn')
export class PetDungeonToyDelBtn extends fgui.GButton {

    static pkgName: string = "petDungeon";
    static viewName: string = "PetDungeonToyDelBtn";

    protected _isOpen: boolean = false;

    private get view(): ui.petDungeon.component.PetDungeonToyDelBtn {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {

    }

    protected onPreDispose(): void {

    }

    public isOpen(value: boolean): void {
        if (this._isOpen != value) {
            this._isOpen = value;
            this.view.getController('state').selectedIndex = value ? 1 : 0;
            this.view.iconDel.getController('state').selectedIndex = value ? 1 : 0;
        }
    }
}