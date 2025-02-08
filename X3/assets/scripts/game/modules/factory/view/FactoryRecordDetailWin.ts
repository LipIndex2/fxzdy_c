import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { FightType } from "../../../comm/battle/enum/FightType";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { UIFactoryConfig } from "../const/UIFactoryConfig";
import { IFactoryRecord } from "../model/vo/IFactoryRecord";
import { FactoryProductLineOwerPanel } from "./component/FactoryProductLineOwerPanel";

/**
 * 星际工厂战报详情
 */
@bindScript(UIFactoryConfig.FactoryRecordDetailWin)
export class FactoryRecordDetailWin extends UICommWin {

    static pkgName: string = "factory";
    static viewName: string = "FactoryRecordDetailWin";

    protected _recordData: IFactoryRecord = null
    private get view(): ui.factory.view.FactoryRecordDetailWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.FACTORY_RECORD_DEL,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.FACTORY_RECORD_DEL:
                let index = args?.findIndex((value) => value == this._recordData?.vo.id)
                if (index != -1) {
                    this.closeSelf()
                }
                break
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.owerPanel.setStyle(1)
        this.view.btnDetail.onClick(this.onClickDetail, this)
        this.view.btnDelete.onClick(this.onClickDelete, this)
    }

    protected onPreDispose(): void {

    }

    protected onClickDetail(): void {
        let defBaseVo: Vo.player.PlayerBaseVo = {
            id: GIns.playerModel.playerId,
            name: GIns.playerModel.playerName,
            headIcon: GIns.settingsModel.context.getHeadIconId(),
        } as Vo.player.PlayerBaseVo;

        GIns.battleRecordMgr.showRecordViewByServer(
            FightType.FACTORY,
            this._recordData.vo.attackerBaseVo,
            defBaseVo,
            this._recordData.vo.attackerStatisticsVos,
            this._recordData.vo.defenderStatisticsVos,
            !this._recordData.vo.defend
        )
    }

    protected onClickDelete(): void {
        GIns.factoryModel.sendDelFactoryRecord({ recordIds: [this._recordData.vo.id] })
    }

    protected get owerPanel(): FactoryProductLineOwerPanel {
        return FguiScriptUtils.toMyScriptClass(this.view.pOwer, FactoryProductLineOwerPanel)
    }

    protected updateUI(): void {
        this.view.lbMsgTitle.text = this._recordData.title
        this.view.lbMsg.text = this._recordData.content
        this.view.lbMsgTime.text = this._recordData.timeStr
        let diffTime: number = G.TimeManager.serverNow - this._recordData.vo.time
        this.view.lbTime.text = TimeUtils.formatDiffTimeMsToFriendOfflineTimeText(diffTime)
        let recordExpireDays:number = Math.ceil(GIns.factoryModel.constCfg.recordExpireMinutes / (60 * 24))
        this.view.lbTip.text = `邮件最长保留${recordExpireDays}天，过期系统自动删除`

        this.owerPanel.setShowState(1)
        this.owerPanel.updatePlayerInfo(this._recordData.vo.attackerBaseVo)
        this.owerPanel.updateHeros(this._recordData.vo.attackFormationVisitVo?.positionVisitVos)
        this.owerPanel.updateCollections(this._recordData.vo.attackFormationVisitVo?.collectiblesVisitVo)
        this.owerPanel.updatePet(this._recordData.vo.attackFormationVisitVo?.petVisitVo)
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._recordData = args as IFactoryRecord
        if (this._recordData == null) {
            this.closeSelf()
            return
        }
        this.updateUI()
    }

    protected onClose(dontDispose?: boolean): void {

    }
}