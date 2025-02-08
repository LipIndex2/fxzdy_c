import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { PlayerAvatar } from "../../common/playerInfo/PlayerAvatar";
import { FriendI18nKeys } from "../const/FriendI18nKeys";


/** 好友申请item */
export class FriendPlayerInfoItem extends fgui.GComponent {
    static pkgName: string = "friend";
    static viewName: string = "FriendPlayerInfoItem";

    protected _vo: Vo.friend.FriendApplyVo = null

    private get view(): ui.friend.item.FriendPlayerInfoItem {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onInit() {

    }

    public updatePlayerInfo(data: Vo.player.PlayerBaseVo): void {
        //@ts-ignore
        let avatarComp = this.view.avatar as PlayerAvatar
        avatarComp.resetByPlayerInfo(data)
        this.view.lbName.text = data.name
        this.view.lbPower.text = G.I18nManager.lang(FriendI18nKeys.fight, data.fight)
    }

    public updateTrunk(trunkInstanceId: number): void {
        let trunkTaskCfg = G.TableManager.getDataById(table.trunkinstance.TrunkInstanceConfig, trunkInstanceId)
        let showLevelId:string = '0'
        if (trunkTaskCfg != undefined) {
            showLevelId = trunkTaskCfg.showLevelId + "";
        }
        this.view.lbChapter.text = G.I18nManager.lang(FriendI18nKeys.trunkInstanceId, showLevelId)
    }

    public updateOnline(logoutTime: number): void {
        if (logoutTime <= 0) {
            //在线
            this.view.lbOnline.visible = true
            this.view.lbOffline.visible = false
            this.view.lbOnline.text = G.I18nManager.lang(FriendI18nKeys.online)
        } else {
            //离线
            this.view.lbOnline.visible = false
            this.view.lbOffline.visible = true
            let serverTime = G.TimeManager.serverNow
            this.view.lbOffline.text = TimeUtils.formatDiffTimeMsToFriendOfflineTimeText(serverTime - logoutTime)
        }
    }
}