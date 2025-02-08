import G from "../../../../core/comm/G"
import { ViewBlackBgComp } from "../../../../core/mvc/view/comp/ViewBlackBgComp"
import { UIWin } from "../../../../core/mvc/view/UIWin"
import { ServerEnums } from "../../../../libs/extras/ServerEnums"
import { BattleRecordManager } from "../../../comm/battle/BattleRecordManager"
import NotificationKey from "../../../event/NotificationKey"
import { IBattleResultWinData } from "../../battle/vo/IBattleResultWinData"
import { ModelNode } from "../../common/node/ModelNode"
import { HangUpUtils } from "../../hangup/utils/HangUpUtils"

/**
 * 好友切磋结果界面
 */
export class FriendBattleResultWin extends UIWin {

    static pkgName: string = "friend"
    static viewName: string = "FriendBattleResultWin"

    private _winFlag: boolean

    private get view(): ui.friend.view.FriendBattleResultWin {
        return this._view as any
    }

    listenNotifications(): string[] {
        return []
    }

    notificationHandler(eventName: string, args?: any): void {

    }

    protected initComp(): void {
        this.addComp(new ViewBlackBgComp())
    }

    protected onInit(): void {

        this.view.btnData.onClick(this.onClickBtnData, this)
        this.view.btnShare.onClick(this.onClickShare, this)
    }

    protected onOpen(args: IBattleResultWinData): void {
        // args
        this._winFlag = args.isWin
        this.view.btnShare.visible = this._winFlag
        const modelNode = this.view.modelNode as ModelNode
        if (this._winFlag) {
            modelNode.loadByPath(HangUpUtils.getWinResultSpineAssetPath())
            modelNode.playOrders(
                [
                    {
                        name: "unlocking1",
                        isLoop: false
                    },
                    {
                        name: "idle1",
                        isLoop: true
                    },
                ]
            )
        } else {
            modelNode.loadByPath(HangUpUtils.getFailResultSpineAssetPath())
            modelNode.playOrders(
                [
                    {
                        name: "unlocking2",
                        isLoop: false
                    },
                    {
                        name: "idle2",
                        isLoop: true
                    },
                ]
            )
        }

        this.view.touchable = false
        this.view.getTransition("enter").play(() => {
            this.view.touchable = true
        })
    }

    private onClickBtnData(): void {
        BattleRecordManager.ins().showRecordView(ServerEnums.FightType.FRIEND, this._winFlag)
    }

    protected onClickShare(): void {
        console.log('点击分享')
    }

    protected onClose(): void {
        G.Logger.debug(" onClose ")
        // 关闭战斗
        G.FacadeManager.emit(NotificationKey.CLOSE_BATTLE_VIEW)
    }
}