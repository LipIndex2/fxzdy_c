import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { GVGUIKeys } from "db://assets/scripts/game/modules/gvg/GVGUIKeys";
import { GVGOneChallengeItemComp } from "db://assets/scripts/game/modules/gvg/item/GVGOneChallengeItemComp";
import { GVGModel } from "db://assets/scripts/game/modules/gvg/GVGModel";
import { EnumGVGTeamType } from "db://assets/scripts/game/modules/gvg/enums/EnumGVGTeamType";
import { RuleController } from "db://assets/scripts/game/modules/rule/RuleController";
import { EnumRuleKeys } from "db://assets/scripts/game/modules/rule/enums/EnumRuleKeys";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { GVGChallengeScorePanelComp } from "db://assets/scripts/game/modules/gvg/components/GVGChallengeScorePanelComp";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import GIns from "db://assets/scripts/game/GIns";
import { UIPage } from "db://assets/scripts/core/mvc/view/UIPage";
import { Logger } from "db://assets/scripts/core/log/Logger";

export interface GVGChallengeViewOpenArgs {
    teamType: EnumGVGTeamType;
    layerNum: number
}

/**
 * 联盟对决
 */
@bindScript(GVGUIKeys.GVGChallengeView)
export class GVGChallengeView extends UIPage {

    static pkgName: string = "gvg";
    static viewName: string = "GVGChallengeView";

    private _teamType: EnumGVGTeamType = EnumGVGTeamType.OPPO;
    private _layerNum: number = 1;
    private _dataArray: Vo.leaguewar.LeagueWarDefenderVo[] = [];
    // 是否对手
    private _isOppo: boolean = true;

    private get view(): ui.gvg.GVGChallengeView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.GVG_INFO_CHANGE,
            NotificationKey.GVG_FIGHTER_DATA_CHANGE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.GVG_FIGHTER_DATA_CHANGE:
            case NotificationKey.GVG_INFO_CHANGE: {
                this.reset();
                break;
            }
        }

    }

    protected onInit() {
        this.view.btnBack.onClick(() => {
            this.closeSelf();
        }, this);
        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = this.irItem.bind(this);

        // 规则
        this.view.ruleBtn.onClick(() => {
            RuleController.ins().openRule(EnumRuleKeys.LEAGUE_WAR_CHALLENGE, this.view.ruleBtn);
        }, this);
    }

    @LogBusiness("打开界面")
    public onOpen(args: GVGChallengeViewOpenArgs): void {

        this._layerNum = args?.layerNum || 1;
        this._teamType = args?.teamType || EnumGVGTeamType.OPPO;

        this.reset();

        Logger.game(`[GVG] 打开了第 ${this._layerNum} 层, 数据 = `, this._dataArray);
    }


    @LogBusiness("关闭界面")
    protected onClose() {
        super.onClose();


    }

    private reset() {
        const context = GVGModel.ins().context;

        // 结束则弹出去
        const stage = context.getStage();
        Logger.game(`[GVG] GVGChallengeView 更新了联盟阶段 stage = ${stage} `);
        if (stage == ServerEnums.LeagueWarStatus.END
            || stage == ServerEnums.LeagueWarStatus.SETTLE
        ) {
            // GIns.floatingTextMgr.showTips("联盟对决已结束");
            this.closeSelf();
            return;
        }

        // 是否敌人
        this._isOppo = this._teamType == EnumGVGTeamType.OPPO;
        // 阵容
        this._dataArray = context.getLayerCanSeeFighterDataArray(this._teamType, this._layerNum);
        this.view.itemList.numItems = this._dataArray.length;
        this.view.itemList.refreshVirtualList();


        FguiScriptUtils.toMyScriptClass(this.view.scorePanel, GVGChallengeScorePanelComp)
            .reset(this._layerNum);
    }

    irItem(index: number, comp: GVGOneChallengeItemComp) {
        const data = this._dataArray[index];

        comp.reset(index, this._isOppo, data);


    }
}