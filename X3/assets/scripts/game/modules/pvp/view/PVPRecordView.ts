import G from "db://assets/scripts/core/comm/G";
import * as fgui from "fairygui-cc";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { PVPModel } from "db://assets/scripts/game/modules/pvp/model/PVPModel";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { PVPRecordOneRowComp } from "db://assets/scripts/game/modules/pvp/components/PVPRecordOneRowComp";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";


const {GObject} = fgui;

/**
 * PVP 记录
 */
export class PVPRecordView extends UICommWin {

    static pkgName: string = "pvp";

    static viewName: string = "PVPRecordView";


    // 记录
    private _records: Array<Vo.arena.ArenaChallengeRecord> = [];

    private get view(): ui.pvp.PVPRecordView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.PVP_GET_RECORDS,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.PVP_GET_RECORDS:
                this.reset(args as Array<Vo.arena.ArenaChallengeRecord>);
                break;
        }

    }


    public onInit(): void {
        G.Logger.debug(" onInit ")


        this.view.recordList.setVirtual();
        this.view.recordList.itemRenderer = this.renderForRecord.bind(this);
    }

    public onOpen(args: any): void {

        // records
        PVPModel.ins().sendLoadChallengeRecord();
    }


    public onClose(): void {
        G.Logger.debug(" onClose ");

    }

    onClickRefresh() {
        PVPModel.ins().sendRefreshChallengeList();
    }

    @LogBusiness("刷新界面")
    private reset(records: Array<Vo.arena.ArenaChallengeRecord>) {
        const haveRecordFlag = ArrayUtils.isNotEmpty(records);
        this.view.getController("haveRecordFlag").selectedIndex = haveRecordFlag ? 1 : 0;
        
        this._records = records.reverse();
        this.view.recordList.numItems = this._records.length;
    }

    // 对手信息
    renderForRecord(index: number, comp: ui.pvp.list.PVPRecordOneRowComp) {

        const vo: Vo.arena.ArenaChallengeRecord = this._records[index];
        if (!vo) {
            return;
        }

        // @ts-ignore
        (comp as PVPRecordOneRowComp).reset(vo);
    }

}