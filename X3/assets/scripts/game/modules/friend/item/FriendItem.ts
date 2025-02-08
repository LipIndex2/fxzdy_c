import * as fgui from "fairygui-cc";
import { FriendGiveOrDrawBtn } from "../btn/FriendGiveOrDrawBtn";
import { FriendModel } from "../model/FriendModel";


/** 好友申请item */
export class FriendItem extends fgui.GComponent {
    static pkgName: string = "friend";
    static viewName: string = "FriendItem";

    protected _vo: Vo.friend.SingleFriendVo = null

    private get view(): ui.friend.item.FriendItem {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onInit() {
        this.view.btnGive.onClick(this.onClickItem, this)
    }

    protected onClickItem(): void {
        if (this._vo.drawState == 2) {
            //可领取状态
            FriendModel.ins().sendGiveAndDrawGift({ friendId: this._vo.playerVo.baseVo.id })
        } else if (this._vo.giveState == 1) {
            //可赠送状态
            FriendModel.ins().sendGiveAndDrawGift({ friendId: this._vo.playerVo.baseVo.id })
        }
    }

    public setData(data: Vo.friend.SingleFriendVo): void {
        this._vo = data
        //@ts-ignore
        let playerComp = this.view.player as FriendPlayerInfoItem
        playerComp.updatePlayerInfo(data.playerVo.baseVo)
        playerComp.updateTrunk(data.trunkInstanceId)
        playerComp.updateOnline(data.logoutTime)

        //@ts-ignore
        let btnComp = this.view.btnGive as FriendGiveOrDrawBtn
        btnComp.setData(data)
    }

}