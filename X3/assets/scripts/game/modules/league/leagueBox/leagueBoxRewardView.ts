import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { TableManager } from "../../../../core/table/TableManager";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { ItemListComp } from "../../common/item/ItemListComp";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { UILeagueKey } from "../const/UILeagueConst";
import { LeagueManager } from "../leagueManager";
import { LeagueModel } from "../LeagueModel";

@bindScript(UILeagueKey.LeagueBoxRewardView)
export class LeagueBoxRewardView extends UICommWin {
    static pkgName: string = "leagueBox";

    static viewName: string = "leagueBoxPreview";



    private get view(): ui.leagueBox.leagueBoxPreview {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.EVENT_LEAGUE_BOX_PROGRESS_CHANGE];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_LEAGUE_BOX_PROGRESS_CHANGE:
                this.updateView();
                break;



        }
    }

    protected onInit(): void {
        let view = this.view;
        view.getRewardBtn.onClick(this.onClickGetReward, this);

        this.view.iconLoader.icon = LeagueManager.ins().boxIconPath
    }

    public onOpen(): void {

        this.updateView();

    }


    private updateView(): void {
        let view = this.view;
        let lastWeekBoxLevel = LeagueManager.ins().mLeagueVo.lastWeekBoxLevel;
        let ctrl = view.getController("c1");
        let cfg = TableManager.getDataById(table.league.LeagueBoxLevelConfig, lastWeekBoxLevel);
        if (LeagueModel.ins().canOpenLeagueBoxWeekBox()) {
            //打开宝箱
            ctrl.selectedIndex = 1;
            view.boxName.text = cfg.boxName;
            view.boxIcon.icon = cfg.iconPath;
        }
        else {
            //当前等级
            let level = LeagueModel.ins().getLeagueBoxLevel(LeagueManager.ins().mLeagueVo.leagueBoxProgress);
            cfg = TableManager.getDataById(table.league.LeagueBoxLevelConfig, level);
            let boxExp = LeagueModel.ins().getLeagueBoxExp(LeagueManager.ins().mLeagueVo.leagueBoxProgress)
            ctrl.selectedIndex = 0;
            view.boxName.text = cfg.boxName;
            view.boxIcon.icon = cfg.iconPath;

            view.keyLimitTxt.text = `${boxExp.exp}/${boxExp.maxExp}`;
            const items = ItemUtils.parseKvArrayToItemArray(cfg.rewards);
            FguiScriptUtils.toMyScriptClass(view.rewardList, ItemListComp)
                .reset(items);
        }

    }

    private onClickGetReward(): void {
        LeagueModel.ins().sendOpenLeagueBox();
    }



}