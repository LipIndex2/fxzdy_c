import * as fgui from "fairygui-cc";
import { FriendModel } from "../model/FriendModel";


/** 好友申请item */
export class FriendGiveOrDrawBtn extends fgui.GButton {
    static pkgName: string = "friend";
    static viewName: string = "FriendGiveOrDrawBtn";

    private get view(): ui.friend.btn.FriendGiveOrDrawBtn {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onInit() {
        this.view.onClick(this.onClickItem, this)
    }

    protected onClickItem(): void {

    }

    public setData(data: Vo.friend.SingleFriendVo): void {
        if (FriendModel.ins().hasDrawGiftForOne(data.drawState)) {
            //可领取状态
            this.view.iconDraw.visible = true
            this.view.iconGive.visible = false
            this.view.iconDisable.visible = false
            this.view.enabled = true
        } else if (FriendModel.ins().hasGiveGiftFroOne(data.giveState)) {
            //可赠送状态
            this.view.iconDraw.visible = true
            this.view.iconGive.visible = true
            this.view.iconDisable.visible = false
            this.view.enabled = true
        } else {
            //其他就是不可用状态
            this.view.iconDraw.visible = false
            this.view.iconGive.visible = false
            this.view.iconDisable.visible = true
            this.view.enabled = false
        }
    }

}