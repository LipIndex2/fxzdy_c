import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import { PlayerAvatar } from "../../common/playerInfo/PlayerAvatar";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { PlayerModel } from "../../player/model/PlayerModel";
import { RankUtils } from "../../rank/utils/RankUtils";
import { I18WorldBossKey } from "../../worldBoss/const/WorldBossConst";
import { LeagueManager } from "../leagueManager";
import { LeagueModel } from "../LeagueModel";
import { PlayerTitleSmallComp } from "../../common/playerInfo/PlayerTitleSmallComp";
import { SettingsModel } from "../../settings/model/SettingsModel";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UILeagueKey } from "../const/UILeagueConst";

/**
 * 联盟boss排行榜
 */
@bindScript(UILeagueKey.LeagueBossRankView)
export class LeagueBossRankView extends UICommWin {
    
    static pkgName: string = "leagueBoss";
    static viewName: string = "leagueBossRankView";

    private mLeagueBossConfig: table.league.LeagueBossConfig;

    private get view(): ui.leagueBoss.leagueBossRankView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_LEAGUE_BOSS_RANK_RESP
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {

            case NotificationKey.EVENT_LEAGUE_BOSS_RANK_RESP:
                if (args == this.jobIndex) {
                    this.updateView();
                }

                break;


        }
    }

    private rankLimit: number;

    protected onInit(): void {
        let view = this.view;

        view.tabList.itemRenderer = this.tabRender.bind(this);
        view.tabList.onClick(this.selectJob, this);

        view.rankList.setVirtual()
        view.rankList.itemRenderer = this.irRank.bind(this);
        view.rankList.on(fgui.Event.CLICK_ITEM, this.onRankClick, this);


        //  view.tabList.selectedIndex = 0;
        const config = RankUtils.getRankTypeConfigByRankType(ServerEnums.RankingType.LEAGUE_BOSS);
        this.rankLimit = config.limit;

    }

    //当前的职业   
    private jobIndex = 0;

    private allCfg: table.league.LeagueBossConfig[];

    public onOpen(cfg: table.league.LeagueBossConfig): void {
        this.mLeagueBossConfig = cfg;

        let cfgs = this.allCfg = LeagueModel.ins().getLeagueBossConfigInStage(cfg.stage);

        this.view.tabList.numItems = cfgs.length;

        let index = cfgs.findIndex((v) => v.id == this.mLeagueBossConfig.id);
        if (index == -1) {
            index = 0;
        }
        this.view.tabList.selectedIndex = index;

        this.selectJob();


    }

    private updateView(): void {
        let view = this.view;
        let rankVo = LeagueManager.ins().mLeagueBossRankingVo;
        view.rankList.numItems = this.rankLimit;
        view.myRank.getController('rank').selectedIndex = 4
        //我的
        if (rankVo.rank > 0) {
            view.myRank.myRankTxt.fontSize = 40;
            view.myRank.myRankTxt.text = `${rankVo.rank}`;
            view.myRank.rankValue.visible = true;
            view.myRank.myRankNoRank.visible = false;
            view.myRank.myRank.visible = true;

        } else {
            view.myRank.myRankTxt.fontSize = 25;
            view.myRank.myRankTxt.text = G.I18nManager.lang(I18WorldBossKey.i18n_worldBoss_noRank);
            view.myRank.rankValue.visible = false;
            view.myRank.myRankNoRank.visible = true;
            view.myRank.myRank.visible = false;
        }
        let noCtr = view.myRank.getController("noRank");
        noCtr.selectedIndex = 1;
        const avatar = FguiScriptUtils.toMyScriptClass(view.myRank.playerAvatar, PlayerAvatar);
        avatar.resetMe();
        view.myRank.nameTxt.text = PlayerModel.ins().Vo.name;
        let str = StringUtils.numShortToKM(rankVo.value);
        view.myRank.rankValue.text = `${str}`;
        FguiScriptUtils.toMyScriptClass(view.myRank.titleComp, PlayerTitleSmallComp).resetByTitleId(SettingsModel.ins().context.getTitleId())
    }

    private tabRender(index: number, item: ui.leagueBoss.btn.leagueBossRankTab): void {
        let cfg = this.allCfg[index];
        let career = ServerEnums.Career[cfg.career];
        item.iconImg.url = ItemUtils.getCareerIconNoBg(career);
    }

    private selectJob(): void {

        let index = this.view.tabList.selectedIndex;
        let cfg = this.allCfg[index];
        this.jobIndex = cfg.id;
        LeagueManager.ins().leagueBossRank = [];
        LeagueModel.ins().loadLeagueBossRank(cfg.id, 1)
        // this.updateView();
    }


    private irRank(index: number, item: ui.comm1.league.component.leagueRankCell): void {
        let rankVo: Vo.ranking.RankItemVo = LeagueManager.ins().leagueBossRank[index];
        let ctr = item.getController("rank");
        let noCtr = item.getController("noRank");

        if (index < 3) {
            ctr.selectedIndex = index;
        } else {
            item.rankTxt.text = `${index + 1}`;
            ctr.selectedIndex = 3;
        }

        noCtr.selectedIndex = rankVo ? 1 : 0;

        if (rankVo) {
            const avatar = FguiScriptUtils.toMyScriptClass(item.playerAvatar, PlayerAvatar);
            avatar.resetByPlayerInfo(rankVo.baseVo);
            item.nameTxt.text = rankVo.baseVo.name;
            let str = StringUtils.numShortToKM(rankVo.value)
            item.rankValue.text = `${str}`;
            FguiScriptUtils.toMyScriptClass(item.titleComp, PlayerTitleSmallComp)
                .resetByTitleId(rankVo.baseVo.title)
        }
    }

    private onRankClick(): void {

        let index = this.view.rankList.selectedIndex;

    }


}