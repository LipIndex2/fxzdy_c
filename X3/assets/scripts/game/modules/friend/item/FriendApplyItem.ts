import * as fgui from "fairygui-cc";
import { FriendModel } from "../model/FriendModel";
import { FriendPlayerInfoItem } from "./FriendPlayerInfoItem";


/** 好友申请item */
export class FriendApplyItem extends fgui.GComponent {
    static pkgName: string = "friend";
    static viewName: string = "FriendApplyItem";

    protected _vo: Vo.friend.FriendApplyVo = null

    private get view(): ui.friend.item.FriendApplyItem {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onInit() {
        this.view.btnOk.onClick(this.onClickOk, this)
        this.view.btnCancel.onClick(this.onClickCancel, this)
    }


    protected onClickOk(): void {
        FriendModel.ins().sendAgreeApply({ targetId: this._vo.simpleVo.baseVo.id })
    }

    protected onClickCancel(): void {
        FriendModel.ins().sendDisagreeApply({ targetId: this._vo.simpleVo.baseVo.id })
    }

    public setData(data: Vo.friend.FriendApplyVo): void {
        this._vo = data
        //@ts-ignore
        let playerComp = this.view.player as FriendPlayerInfoItem
        playerComp.updatePlayerInfo(data.simpleVo.baseVo)
        playerComp.updateTrunk(data.trunkInstanceId)
        playerComp.updateOnline(data.simpleVo.logoutTime)
    }

}