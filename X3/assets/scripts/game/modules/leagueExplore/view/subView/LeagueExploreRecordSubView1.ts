import { EnumUIViewLayer } from "../../../../../core/comm/LayerManager";
import { bindScript } from "../../../../../core/comm/UIScriptManager";
import { UIView, ViewAdaptType } from "../../../../../core/mvc/view/UIView";
import { ServerEnums } from "../../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../../event/NotificationKey";
import GIns from "../../../../GIns";
import { EnumRuleKeys } from "../../../rule/enums/EnumRuleKeys";
import { RuleController } from "../../../rule/RuleController";
import { UILeagueExploreConfig } from "../../const/UILeagueExploreConfig";
import { LeagueExploreRecordItem1 } from "../item/LeagueExploreRecordItem1";
import { LeagueExploreRecordItem2 } from "../item/LeagueExploreRecordItem2";

/**
 * 个人日志页面
 */
@bindScript(UILeagueExploreConfig.LeagueExploreRecordSubView1)
export class LeagueExploreRecordSubView1 extends UIView {

    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExploreRecordSubView1";

    /**界面层级 */
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    /**适配类型 */
    protected adaptType = ViewAdaptType.TOP;

    /**是否第一次打开*/
    protected _isFirstOpen: boolean = true;

    private get view(): ui.leagueExplore.subView.LeagueExploreRecordSubView1 {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.LEAGUE_EXPLORE_MY_RECORD_CHANGE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.LEAGUE_EXPLORE_MY_RECORD_CHANGE:
                this.updateUI();
                break;
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.listRecord.setVirtual();
        this.view.listRecord.itemProvider = this.itemProviderForRecord.bind(this);
        this.view.listRecord.itemRenderer = this.itemRendererForRecord.bind(this);
        this.view.btnRule.onClick(this.onClickRule, this);
    }

    protected onPreDispose(): void {

    }

    protected itemProviderForRecord(index:number):string {
        let logType = GIns.leagueExploreModel.myRecords[index].logType;
        if (logType == ServerEnums.LeagueExploreLogType.OCCUPY_BUILDING || logType == ServerEnums.LeagueExploreLogType.BE_OCCUPY_BUILDING) {
            return 'ui://leagueExplore/LeagueExploreRecordItem2';
        }
        return 'ui://leagueExplore/LeagueExploreRecordItem1';
    }

    protected itemRendererForRecord(index: number, item: any): void {
        let data = GIns.leagueExploreModel.myRecords[index];
        if (data.logType == ServerEnums.LeagueExploreLogType.OCCUPY_BUILDING || data.logType == ServerEnums.LeagueExploreLogType.BE_OCCUPY_BUILDING) {
            let itemComp2 = item as LeagueExploreRecordItem2;
            itemComp2.setDataByPlayer(data);
        } else {
            let itemComp1 = item as LeagueExploreRecordItem1;
            itemComp1.setData(data);
        }
    }

    protected onClickRule():void {
        RuleController.ins().openRule(EnumRuleKeys.LEAGUE_EXPLORE_PERSON_RECORD, this.view.btnRule);
    }

    protected updateUI(): void {
        let records = GIns.leagueExploreModel.myRecords;
        if (records.length <= 0) {
            this.view.getController('state').selectedIndex = 2;
            return
        }
        this.view.getController('state').selectedIndex = 1;
        this.view.listRecord.numItems = records.length;
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        if (this._isFirstOpen) {
            this._isFirstOpen = false;
            GIns.leagueExploreModel.sendLoadPlayerExploreRecord();
        }
    }

    protected onClose(dontDispose?: boolean): void {

    }
}