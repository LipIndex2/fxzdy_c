import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { GVGUIKeys } from "db://assets/scripts/game/modules/gvg/GVGUIKeys";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { GVGModel } from "db://assets/scripts/game/modules/gvg/GVGModel";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { GVGRecordTextItemComp } from "db://assets/scripts/game/modules/gvg/item/GVGRecordTextItemComp";
import { GVGRecordWinOpenArgs } from "db://assets/scripts/game/modules/gvg/structs/GVGRecordWinOpenArgs";

/**
 * 联盟对决
 */
@bindScript(GVGUIKeys.GVGRecordWin)
export class GVGRecordWin extends UICommWin {

    static pkgName: string = "gvg";
    static viewName: string = "GVGRecordWin";

    // 是否只有我自己
    private _isOnlyMe: boolean = false;
    // 列表
    private _dataList: Vo.leaguewar.LeagueWarFightReportVo[] = [];

    private _isFilter: boolean = false;
    private _filterPlayerId: number = 0;
    private _isJustSeeDefence: boolean = false;

    private get view(): ui.gvg.GVGRecordWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.GVG_LOAD_RECORDS_DONE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.GVG_LOAD_RECORDS_DONE: {
                this.reset(args);
                break;
            }
        }

    }

    protected onInit() {
        // TODO 初始化

        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = this.irItem.bind(this);

        this.view.labelJustShowMe.onClick(this.onClickSeeMe, this);
        this.view.btnGouXuan.onClick(this.onClickSeeMe, this);
    }

    onClickSeeMe() {
        this._isOnlyMe = !this._isOnlyMe;

        this.requestData();
    }

    @LogBusiness("打开界面")
    public onOpen(args: GVGRecordWinOpenArgs): void {
        if (args) {
            this._isFilter = true;
            this._filterPlayerId = args.playerId || 0;
            this._isJustSeeDefence = args.isJustSeeDefence;
        }

        this.requestData();
    }


    private requestData() {
        // 战斗报告
        GVGModel.ins().sendGetFightReports({
            onlyMe: this._isOnlyMe
        } as Vo.leaguewar.GetFightReportsC2S);
    }

    @LogBusiness("关闭界面")
    protected onClose() {
        super.onClose();


    }

    irItem(index: number, comp: GVGRecordTextItemComp) {
        const item: Vo.leaguewar.LeagueWarFightReportVo = this._dataList[index];

        comp.reset(item);
    }

    private reset(dataList: Vo.leaguewar.LeagueWarFightReportVo[]) {
        if (!dataList) {
            Logger.game("后端没有记录");
            return;
        }

        if (this._isFilter) {
            // filter
            this._dataList = dataList.filter(it => {
                if (this._isJustSeeDefence) {
                    return it.defendId == this._filterPlayerId;

                }
                return it.defendId == this._filterPlayerId
                    || it.attackId == this._filterPlayerId;
            });
        } else {
            this._dataList = dataList;
        }
        this.view.itemList.numItems = this._dataList.length;
    }
}