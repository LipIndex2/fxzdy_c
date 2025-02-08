import * as fgui from "fairygui-cc";
import { FriendModel } from "../model/FriendModel";
import { FriendPlayerInfoItem } from "./FriendPlayerInfoItem";
import G from "../../../../core/comm/G";
import { FriendI18nKeys } from "../const/FriendI18nKeys";


/** 好友推荐item */
export class FriendRecommendItem extends fgui.GComponent {
    static pkgName: string = "friend";
    static viewName: string = "FriendRecommendItem";

    protected _vo: Vo.friend.FriendQueryVo = null

    private get view(): ui.friend.item.FriendRecommendItem {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onInit() {
        this.view.btnApply.onClick(this.onClickApply, this)
        this.view.btnApply.title = G.I18nManager.lang(FriendI18nKeys.apply)
        this.view.lbApplied.text = G.I18nManager.lang(FriendI18nKeys.applied)
    }

    protected onClickApply(): void {
        FriendModel.ins().sendApplyFriends({ targetIds: [this._vo.playerVo.baseVo.id] })
    }

    public setData(data: Vo.friend.FriendQueryVo): void {
        this._vo = data
        //@ts-ignore
        let playerComp = this.view.player as FriendPlayerInfoItem
        playerComp.updatePlayerInfo(data.playerVo.baseVo)
        playerComp.updateTrunk(data.trunkInstanceId)
        playerComp.updateOnline(data.playerVo.logoutTime)

        if (FriendModel.ins().isApplied(data.playerVo.baseVo.id)) {
            this.view.lbApplied.visible = true
            this.view.btnApply.visible = false
        } else {
            this.view.lbApplied.visible = false
            this.view.btnApply.visible = true
        }
    }

}