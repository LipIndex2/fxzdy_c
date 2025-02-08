import * as fgui from "fairygui-cc";
import { JumpManager } from "db://assets/scripts/game/modules/jump/JumpManager";


/**
 * 英雄item
 * - 纯展示用 | 非养成
 */
export class RightTabBtn extends fgui.GButton {

    private _jumpId: number;

    private get view(): ui.comm.btn.RightTabBtn {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onConstruct(): void {
        this.view.onClick(this.jumpToOther, this);
    }


    reset(name: string, iconPath: string, jumpId: number) {

        this.view.title = name;
        this.view.imageTab.icon = iconPath;
        this._jumpId = jumpId;
    }

    private jumpToOther() {
        JumpManager.ins().jumpById(this._jumpId);
    }
}