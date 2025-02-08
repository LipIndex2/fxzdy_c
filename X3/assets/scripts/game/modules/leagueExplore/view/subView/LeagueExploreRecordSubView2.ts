import { EnumUIViewLayer } from "../../../../../core/comm/LayerManager";
import { bindScript } from "../../../../../core/comm/UIScriptManager";
import { UIView, ViewAdaptType } from "../../../../../core/mvc/view/UIView";
import NotificationKey from "../../../../event/NotificationKey";
import GIns from "../../../../GIns";
import { EnumRuleKeys } from "../../../rule/enums/EnumRuleKeys";
import { RuleController } from "../../../rule/RuleController";
import { UILeagueExploreConfig } from "../../const/UILeagueExploreConfig";
import { LeagueExploreRecordItem2 } from "../item/LeagueExploreRecordItem2";

/**
 * 联盟日志页面
 */
@bindScript(UILeagueExploreConfig.LeagueExploreRecordSubView2)
export class LeagueExploreRecordSubView2 extends UIView {

    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExploreRecordSubView2";

    /**界面层级 */
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    /**适配类型 */
    protected adaptType = ViewAdaptType.TOP;

    /**是否第一次打开*/
    protected _isFirstOpen: boolean = true;

    private get view(): ui.leagueExplore.subView.LeagueExploreRecordSubView2 {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.LEAGUE_EXPLORE_LEAGUE_RECORD_CHANGE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.LEAGUE_EXPLORE_LEAGUE_RECORD_CHANGE:
                this.updateUI();
                break;
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.listRecord.setVirtual();
        this.view.listRecord.itemRenderer = this.itemRendererForRecord.bind(this);
        this.view.btnRule.onClick(this.onClickRule, this);
    }

    protected onPreDispose(): void {

    }

    protected itemRendererForRecord(index: number, item: LeagueExploreRecordItem2): void {
        item.setData(GIns.leagueExploreModel.leagueRecords[index]);
    }

    protected onClickRule():void {
        RuleController.ins().openRule(EnumRuleKeys.LEAGUE_EXPLORE_RECORD, this.view.btnRule);
    }

    protected updateUI(): void {
        let records = GIns.leagueExploreModel.leagueRecords;
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
            GIns.leagueExploreModel.sendLoadLeagueExploreRecord();
        }
    }

    protected onClose(dontDispose?: boolean): void {

    }
}