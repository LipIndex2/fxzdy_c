import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { UIFactoryConfig } from "../const/UIFactoryConfig";
import { FactoryRecordItem } from "./item/FactoryRecordItem";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";

/**
 * 星际工厂战报
 */
@bindScript(UIFactoryConfig.FactoryRecordWin)
export class FactoryBuyPowerWin extends UICommWin {

    static pkgName: string = "factory";
    static viewName: string = "FactoryRecordWin";

    protected _isSendRead: boolean = false
    protected _isSendDel: boolean = false
    private get view(): ui.factory.view.FactoryRecordWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.FACTORY_RECORD_UPDATE,
            NotificationKey.FACTORY_RECORD_READ,
            NotificationKey.FACTORY_RECORD_DEL,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.FACTORY_RECORD_UPDATE:
                this.updateUI()
                break
            case NotificationKey.FACTORY_RECORD_READ:
                if (this._isSendRead) {
                    GIns.floatingTextMgr.showTips('所有战报已读完成')
                }
                this._isSendRead = false
                break
            case NotificationKey.FACTORY_RECORD_DEL:
                if (this._isSendDel) {
                    GIns.floatingTextMgr.showTips('已删除所有已读战报')
                }
                this._isSendDel = false
                break
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.listRecord.setVirtual()
        this.view.listRecord.itemRenderer = this.itemRendererForRecord.bind(this)
        this.view.btnReadAll.onClick(this.onClickReadAll, this)
        this.view.btnDelAll.onClick(this.onClickDelAll, this)
    }

    protected onPreDispose(): void {

    }

    protected itemRendererForRecord(index: number, item: FactoryRecordItem): void {
        item.setData(GIns.factoryModel.records[index])
    }

    protected onClickReadAll(): void {
        let recordIds: number[] = GIns.factoryModel.getRecordIdsByReadState(false)
        if (recordIds.length <= 0) {
            GIns.floatingTextMgr.showTips('暂无未读战报')
            return
        }
        GIns.factoryModel.sendReadFactoryRecord({ recordIds: recordIds })
        this._isSendRead = true
    }

    protected onClickDelAll(): void {
        let recordIds: number[] = GIns.factoryModel.getRecordIdsByReadState(true)
        if (recordIds.length <= 0) {
            GIns.floatingTextMgr.showTips('暂无已读战报')
            return
        }
        GIns.factoryModel.sendDelFactoryRecord({ recordIds: recordIds })
        this._isSendDel = true
    }

    protected updateUI(): void {
        if (GIns.factoryModel.records.length > 0) {
            this.view.getController('state').selectedIndex = 0
            this.view.listRecord.numItems = GIns.factoryModel.records.length
        } else {
            this.view.getController('state').selectedIndex = 1
        }
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this.updateUI()
        GIns.factoryModel.records?.forEach((record) => [
            GIns.redDotMgr.markRedDotForeverRead(RedDotKeys.Factory_record_item, [record.vo.id])
        ])
    }

    protected onClose(dontDispose?: boolean): void {

    }
}