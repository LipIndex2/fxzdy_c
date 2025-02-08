import * as fgui from "fairygui-cc";
import { FriendModel } from "../model/FriendModel";
import { FriendPlayerInfoItem } from "./FriendPlayerInfoItem";
import G from "../../../../core/comm/G";
import { FriendI18nKeys } from "../const/FriendI18nKeys";


/** 好友黑名单item */
export class FriendBlackItem extends fgui.GComponent {
    static pkgName: string = "friend";
    static viewName: string = "FriendBlackItem";

    protected _vo: Vo.friend.FriendQueryVo = null

    private get view(): ui.friend.item.FriendBlackItem {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onInit() {
        this.view.btnCancel.onClick(this.onClickCancel, this)
        this.view.btnCancel.title = G.I18nManager.lang(FriendI18nKeys.cancelBlacklist)
    }

    protected onClickCancel(): void {
        FriendModel.ins().sendRemoveFromBlacklist({ targetId: this._vo.playerVo.baseVo.id })
    }

    public setData(data: Vo.friend.FriendQueryVo): void {
        this._vo = data
        //@ts-ignore
        let playerComp = this.view.player as FriendPlayerInfoItem
        playerComp.updatePlayerInfo(data.playerVo.baseVo)
        playerComp.updateTrunk(data.trunkInstanceId)
        playerComp.updateOnline(data.playerVo.logoutTime)
    }

}