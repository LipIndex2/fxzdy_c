import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { GVGUIKeys } from "db://assets/scripts/game/modules/gvg/GVGUIKeys";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { GVGRankItemComp } from "db://assets/scripts/game/modules/gvg/item/GVGRankItemComp";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { GVGModel } from "db://assets/scripts/game/modules/gvg/GVGModel";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { PlayerModel } from "db://assets/scripts/game/modules/player/model/PlayerModel";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { GVGMyRankNumComp } from "db://assets/scripts/game/modules/gvg/components/GVGMyRankNumComp";
import { GListEffectType } from "db://assets/scripts/core/prototypes/FguiGListEffect";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

/**
 * 联盟对决
 */
@bindScript(GVGUIKeys.GVGRankWin)
export class GVGRankWin extends UICommWin {

    static pkgName: string = "gvg";
    static viewName: string = "GVGRankWin";

    private _dataList: Vo.leaguewar.LeagueWarPlayerScoreRankItemVo[] = [];


    // 是否我自己
    private _isMe: boolean = true;

    private get view(): ui.gvg.GVGRankWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.GVG_LOAD_MY_CONTRIBUTION_DONE,
            NotificationKey.GVG_LOAD_OPPO_CONTRIBUTION_DONE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.GVG_LOAD_MY_CONTRIBUTION_DONE: {
                this.reset(args, true);
                break;
            }
            case NotificationKey.GVG_LOAD_OPPO_CONTRIBUTION_DONE: {
                this.reset(args, false);
                break;
            }
        }

    }

    protected onInit() {
        // TODO 初始化
        this.clearMe();
        
        this.view.btnList.itemRenderer = this.irBtn.bind(this);
        this.view.btnList.numItems = 2;
        this.view.btnList.selectedIndex = 0;
        this.view.btnList.onClick(() => {
            this.onSelectChange();
        }, this);

        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = this.irRank.bind(this);
        this.view.itemList.effectType = GListEffectType.FADE_IN;
        this.view.itemList.effectParams = {delay: 0.4, interval: 0.06};
    }

    onSelectChange() {
        this._isMe = this.view.btnList.selectedIndex == 0;
        this.view.itemList.numItems = 0;

        GameTimer.ins().once(300, this, () => {
            this.requestData();
        });
    }

    @LogBusiness("打开界面")
    public onOpen(args: any): void {

        this.requestData();
    }


    private requestData() {
        const context = GVGModel.ins().context;

        const stage = context.getStage();

        if (stage == ServerEnums.LeagueWarStatus.SIGN_UP
            || stage == ServerEnums.LeagueWarStatus.SET_FORMATION
        ) {
            Logger.game("当前未经过战斗阶段 | 所以没有排名");
            return;
        }

        if (this._isMe) {
            this.clearMe();
            GVGModel.ins().sendGetPlayerScoreRanks();
        } else {
            GVGModel.ins().sendGetOpponentScoreRanks();
        }
    }

    @LogBusiness("关闭界面")
    protected onClose() {

        GameTimer.ins().clearAll(this);

        super.onClose();

    }

    private reset(dataList: Vo.leaguewar.LeagueWarPlayerScoreRankItemVo[],
                  isShowMe: boolean
    ) {
        if (!dataList) {
            Logger.game("没有数据");
            return;
        }
        this._dataList = dataList || [];
        this.view.itemList.numItems = this._dataList.length;

        this.tryResetMe(dataList);
    }

    irRank(index: number, comp: GVGRankItemComp) {
        comp.reset(index, this._dataList[index])
    }

    irBtn(index: number, comp: ui.gvg.btn.GVGChooseLeagueBtn) {
        if (index == 0) {
            comp.title = "我方联盟";
            return;
        }
        comp.title = "敌方联盟";
    }

    private tryResetMe(dataList: Vo.leaguewar.LeagueWarPlayerScoreRankItemVo[]) {
        const index = dataList.findIndex(item => item.playerId == PlayerModel.ins().playerId);
        const isFoundMe = index >= 0;
        if (!isFoundMe) {
            return;
        }
        const vo = dataList[index]

        FguiScriptUtils.toMyScriptClass(this.view.myRank, GVGMyRankNumComp)
            .reset(index + 1, vo);

    }

    private clearMe() {
        FguiScriptUtils.toMyScriptClass(this.view.myRank, GVGMyRankNumComp)
            .resetMe(0);
    }
}