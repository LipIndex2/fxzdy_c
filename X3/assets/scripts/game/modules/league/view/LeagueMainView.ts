import { Logger } from "db://assets/scripts/core/log/Logger";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import GIns from "db://assets/scripts/game/GIns";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import { LeagueFlagComp } from "db://assets/scripts/game/modules/league/comp/LeagueFlagComp";
import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { LocalStorageUtils } from "../../../../core/utils/LocalStorageUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { ModuleOpenManager } from "../../moduleopen/ModuleOpenManager";
import { I18WorldBossKey } from "../../worldBoss/const/WorldBossConst";
import { I18LeagueKey, UILeagueKey } from "../const/UILeagueConst";
import { LeagueControler } from "../leagueControler";
import { LeagueManager } from "../leagueManager";
import { LeagueModel } from "../LeagueModel";
import { leagueMenu } from "./leagueMenu";

/**联盟状态本地记录key*/
const LeagueMainLocalState: string = 'LeagueMainLocalState'

@bindScript(UILeagueKey.LeagueMainView)
export class LeagueMainView extends UIView {

    static pkgName: string = "league";
    static viewName: string = "LeagueMainView";

    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    protected _isShowEnterAni: boolean = false

    private get view(): ui.league.leagueMain.LeagueMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_LEAGUE_RANK_RESP,
            NotificationKey.EVENT_LEAGUE_INFO_CHANGE,
            NotificationKey.EVENT_LEAGUE_NAME_CHANGE,
            NotificationKey.EVENT_HAVE_LEAGUE,
            NotificationKey.EVENT_EXIT_LEAGUE,
            NotificationKey.EVENT_LEAGUE_NOTICE_CHANGE,
            NotificationKey.EVENT_LEAGUE_BOSS_STAGE_INFO_CHANGE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_LEAGUE_RANK_RESP:
                this.updateRank();
                break;
            case NotificationKey.EVENT_LEAGUE_BOSS_STAGE_INFO_CHANGE:
                this.updateBtns();
                break;
            case NotificationKey.EVENT_LEAGUE_INFO_CHANGE:
            case NotificationKey.EVENT_HAVE_LEAGUE:
                this.updateMyLeague();
                break;
            case NotificationKey.EVENT_EXIT_LEAGUE:
            case NotificationKey.EVENT_LEAGUE_NOTICE_CHANGE:
            case NotificationKey.EVENT_LEAGUE_NAME_CHANGE:
                this.updateMyLeague();
                break;
        }
    }


    protected onInit(): void {
        // 红点
        RedDotUtils.castComp(this.view.btnPanel2.centerBtn.centerBtn.redDot)
            .reset(RedDotKeys.League_center);
        RedDotUtils.castComp(this.view.btnPanel1.centerBtn.centerBtn.redDot)
            .reset(RedDotKeys.League_center);


        let view = this.view;


        this.view.myLeagueCom.onClick(() => {
            this.openCenterView();
        });

        view.btnPanel1.centerBtn.onClick(this.openCenterView, this);
        //红点绑定


        view.rankBtn.onClick(this.openRankView, this);

        view.btnPanel2.centerBtn.onClick(this.openCenterView, this);


        const leagueMenu1 = FguiScriptUtils.toMyScriptClass(view.pMenu, leagueMenu);
        leagueMenu1.pageChangeCallback = this.onMenuPageChange.bind(this)

        // 在联盟中
        if (LeagueManager.ins().isInLeague()) {
            // gvg
            GIns.GVGModel.sendGetLeagueWarInfo();

        }

    }


    protected onPreDispose() {
        GameTimer.ins().clearAll(this);

        super.onPreDispose();
    }


    handleStartChangeAni(isDown: boolean): void {
        this.view.btnPanel1.touchable = isDown;
        this.view.btnPanel2.touchable = !isDown;
        this.view.btnPanel1.visible = this.view.bgPanel1.visible = true;
        this.view.btnPanel2.visible = this.view.bgPanel2.visible = true;
    }

    handleEndChangeAni(isDown: boolean): void {
        this.view.btnPanel1.touchable = isDown;
        this.view.btnPanel2.touchable = !isDown;
        this.view.btnPanel1.visible = this.view.bgPanel1.visible = isDown;
        this.view.btnPanel2.visible = this.view.bgPanel2.visible = !isDown;
    }

    /**打开联盟中心 */
    private openCenterView(): void {
        LeagueModel.ins().openLeagueCenter();
    }

    /**打开联盟排行榜 */
    private openRankView(): void {
        LeagueModel.ins().openLeagueRank();
    }

    protected onMenuPageChange(page: number) {
        if (page === 2) {
            this.handleStartChangeAni(true)
            this.view.getTransition("up").stop()
            this.view.getTransition("down").play(() => {
                if (this.view?.node?.isValid) {
                    this.handleEndChangeAni(true)
                }
            });
            LocalStorageUtils.set(this.getLocalKey(), 2)
        } else {
            this.handleStartChangeAni(false)
            this.view.getTransition("down").stop()
            this.view.getTransition("up").play(() => {
                if (this.view?.node?.isValid) {
                    this.handleEndChangeAni(false)
                }
            });
            LocalStorageUtils.set(this.getLocalKey(), 1)
        }
    }

    public onOpen(): void {
        if (LeagueManager.ins().mPlayerLeagueLoginVo && LeagueManager.ins().mPlayerLeagueLoginVo.leagueId) {
            LeagueModel.ins().loadLeagueInfo();
            LeagueModel.ins().getLeagueRankList(1);
            LeagueModel.ins().loadStageLeagueBoss();
            this.updateBtns();
            this.view.leagueList.visible = false;
            this.view.leagueMain.visible = true;
            this.view.leagueMain.enabled = false;
            this.tryToPlayEnterAni()
        } else {
            this.view.leagueList.visible = true;
            this.view.leagueMain.visible = false;
            this.view.leagueMain.enabled = true;
        }

    }

    private updateMyLeague(): void {
        let vo = LeagueManager.ins().mLeagueVo;
        let view = this.view;
        if (LeagueManager.ins().mPlayerLeagueLoginVo && LeagueManager.ins().mPlayerLeagueLoginVo.leagueId && vo) {

            view.myLeagueCom.nameLb.text = `${vo.name}`;
            const level = vo.level;

            view.myLeagueCom.lvLb.text = `Lv.${level}`;
            let cfg = LeagueModel.ins().getLeagueLevelConfig(level);
            if (!cfg) {
                Logger.error(`配置有问题. 联盟等级找不到配置 level = ${level}`);
            }
            const memberCount = cfg?.memberCount || 0;

            view.myLeagueCom.memberNumLb.text = `${vo.memberCount}/${memberCount}`;


            FguiScriptUtils.toMyScriptClass(this.view.myLeagueCom.flagCom, LeagueFlagComp)
                .change(vo.icon, vo.banner);

            view.leagueList.visible = false;
            view.leagueMain.visible = true;
            this.view.leagueMain.enabled = false;
            this.updateChat(vo.notice ? vo.notice : G.I18nManager.lang(I18LeagueKey.i18n_league_NoNotice));
            this.updateBtns();
            this.tryToPlayEnterAni();
        } else {
            view.leagueList.visible = true;
            view.leagueMain.visible = false;
            this.view.leagueMain.enabled = true;
        }
    }

    protected tryToPlayEnterAni(): void {
        if (this._isShowEnterAni) {
            return
        }
        this._isShowEnterAni = true
        let key = this.getLocalKey()
        let localData = LocalStorageUtils.get(key, Number)
        if (localData == 2) {
            this.handleEndChangeAni(true);
            this.view.getTransition('enter').play()
            FguiScriptUtils.toMyScriptClass(this.view.pMenu, leagueMenu).playEnterAni(2)
        } else {
            this.handleEndChangeAni(false);
            this.view.getTransition('enter').play()
            FguiScriptUtils.toMyScriptClass(this.view.pMenu, leagueMenu).playEnterAni(1)
        }
    }

    protected getLocalKey() {
        return 'LeagueMainLocalState_' + GIns.playerModel.playerId
    }

    protected updateChat(notice: string): void {
        FguiScriptUtils.toMyScriptClass(this.view.pMenu, leagueMenu).updateChat(notice)
    }

    private updateRank(): void {
        let rankData = LeagueManager.ins().mEventRankDataResp;
        if (rankData.myRankNum > 0)
            this.view.rankBtn.rankLb.text = `第${rankData.myRankNum}名`;
        else {
            //未上榜
            this.view.rankBtn.rankLb.text = G.I18nManager.lang(I18WorldBossKey.i18n_worldBoss_noRank);
        }
    }

    /**玩法按钮的显示 */
    private updateBtns(): void {
        //联盟科技
        let techBtn1 = this.view.pMenu.item2.techBtn;
        let techBtn2 = this.view.btnPanel2.techBtn;

        //红点绑定
        FguiScriptUtils.toMyScriptClass(techBtn1.redDot, RedDotCom)
            .reset(RedDotKeys.League_tech);
        FguiScriptUtils.toMyScriptClass(techBtn2.techBtn.redDot, RedDotCom)
            .reset(RedDotKeys.League_tech);

        let openTips = ModuleOpenManager.ins().getModuleLockTips(ServerEnums.SystemType.LEAGUE_TECH);
        let ctr = techBtn1.getController("lock");
        let ctr1 = techBtn2.getController("lock");
        techBtn1.clearClick();
        techBtn2.clearClick();
        techBtn1.onClick(() => {
            LeagueControler.ins().openLeagueTech();
        }, this);

        techBtn2.onClick(() => {
            LeagueControler.ins().openLeagueTech();
        }, this);
        //
        //  let lockTips =  G.I18nManager.translate("i18n:godSequence:layerLock");
        if (openTips) {
            ctr.selectedIndex = 1;
            techBtn1.openTimeLb.text = openTips;

            ctr1.selectedIndex = 1;
            techBtn2.tips.text = openTips;
        } else {
            ctr.selectedIndex = 0;
            ctr1.selectedIndex = 2;

            //活动提示 暂时没有
        }


        //联盟boss
        let bossBtn1 = this.view.pMenu.item2.bossBtn;
        let bossBtn2 = this.view.btnPanel2.bossBtn;

        //绑定红点
        FguiScriptUtils.toMyScriptClass(bossBtn1.redDot, RedDotCom)
            .reset(RedDotKeys.leagueBoss);
        FguiScriptUtils.toMyScriptClass(bossBtn2.bossBtn.redDot, RedDotCom)
            .reset(RedDotKeys.leagueBoss);

        openTips = ModuleOpenManager.ins().getModuleLockTips(ServerEnums.SystemType.LEAGUE_BOSS);
        ctr = bossBtn1.getController("lock");
        ctr1 = bossBtn2.getController("lock");
        bossBtn1.clearClick();
        bossBtn2.clearClick();
        bossBtn1.onClick(() => {
            LeagueControler.ins().openLeagueBoss();
        }, this);

        bossBtn2.onClick(() => {
            LeagueControler.ins().openLeagueBoss();
        }, this);

        if (openTips) {
            ctr.selectedIndex = 1;
            bossBtn1.lockTips.text = openTips;

            ctr1.selectedIndex = 1;
            bossBtn2.tips.text = openTips;
        } else {
            ctr.selectedIndex = 0;
            ctr1.selectedIndex = 2;

            //活动提示 当前挑战
            let info = LeagueManager.ins().leagueBossStageInfo

            if (info?.bossStage) {
                bossBtn1.tips.text = `当前挑战:${info.bossStage}阶`;
                bossBtn2.tips.text = `当前挑战:${info.bossStage}阶`;
            } else {
                bossBtn1.tips.text = '';
                bossBtn2.tips.text = '';
            }
        }

        //联盟宝箱
        let boxBtn1 = this.view.pMenu.item2.boxBtn;
        let boxBtn2 = this.view.btnPanel2.boxBtn;

        //绑定红点
        FguiScriptUtils.toMyScriptClass(boxBtn1.redDot, RedDotCom)
            .reset(RedDotKeys.League_box);
        FguiScriptUtils.toMyScriptClass(boxBtn2.boxBtn.redDot, RedDotCom)
            .reset(RedDotKeys.League_box);

        openTips = ModuleOpenManager.ins().getModuleLockTips(ServerEnums.SystemType.LEAGUE_BOX);
        ctr = boxBtn1.getController("lock");
        ctr1 = boxBtn2.getController("lock");

        boxBtn1.clearClick();
        boxBtn1.onClick(() => {
            LeagueControler.ins().openLeagueBox();
        }, this);

        boxBtn2.clearClick();
        boxBtn2.onClick(() => {
            LeagueControler.ins().openLeagueBox();
        }, this);

        if (openTips) {
            ctr.selectedIndex = 1;
            boxBtn1.openTimeLb.text = openTips;

            ctr1.selectedIndex = 1;
            boxBtn2.tips.text = openTips;
        } else {
            ctr.selectedIndex = 0;
            ctr1.selectedIndex = 2;

            //活动提示
            boxBtn1.openTimeLb.text = ``;
            boxBtn2.tips.text = ``;
        }


    }
}