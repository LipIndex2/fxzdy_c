import G from "db://assets/scripts/core/comm/G";
import * as fgui from "fairygui-cc";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { PVPModel } from "db://assets/scripts/game/modules/pvp/model/PVPModel";
import { PVPUtils } from "db://assets/scripts/game/modules/pvp/utils/PVPUtils";
import { PVPInfoUtils } from "db://assets/scripts/game/modules/pvp/utils/PVPInfoUtils";
import {
    PVPChallengeOtherOneRowComp
} from "db://assets/scripts/game/modules/pvp/components/PVPChallengeOtherOneRowComp";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { FightManager } from "db://assets/scripts/game/modules/fight/FightManager";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { PVPI18nKeys } from "db://assets/scripts/game/modules/pvp/PVPI18nKeys";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import GIns from "../../../GIns";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";


const { GObject } = fgui;

/**
 * PVP
 */
export class PVPChooseOppoView extends UICommWin {

    static pkgName: string = "pvp";

    static viewName: string = "PVPChooseOppoView";


    private _oppoArray: Array<Vo.arena.ArenaOpponentVo> = [];

    private get view(): ui.pvp.PVPChooseOppoView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.PVP_REFRESH_DATA,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.PVP_REFRESH_DATA:
                this.reset();
                break;
        }

    }


    public onInit(): void {
        G.Logger.debug(" onInit ")

        this.view.btnRefresh.onClick(this.onClickRefresh, this);


        this.view.oppoList.setVirtual();
        this.view.oppoList.itemRenderer = this.renderOppoItem.bind(this);

        this.view.labelMyPowerNum.text = "我的战力: " + StringUtils.getFightStr(FightManager.ins().getFightByDefault());
    }

    public onOpen(args: any): void {

        this.reset();
    }


    public onClose(): void {
        G.Logger.debug(" onClose ");

    }

    onClickRefresh() {
        const context = PVPModel.ins().getContext();

        const todayRefreshTimes = context.refreshOppoInfoCount;
        const maxCount = PVPUtils.getMaxRefreshOppoCount();
        const restCount = maxCount - todayRefreshTimes;
        // 达到上限
        if (restCount <= 0) {
            GIns.floatingTextMgr.showTips(PVPI18nKeys.REFRESH_OPPO_REACHED_MAX_COUNT);
            return;
        }

        PVPModel.ins().sendRefreshChallengeList();
    }

    @LogBusiness("刷新界面")
    private reset() {
        const context = PVPModel.ins().getContext();

        const todayRefreshTimes = context.refreshOppoInfoCount;
        const maxCount = PVPUtils.getMaxRefreshOppoCount();
        const restCount = Math.max(0, maxCount - todayRefreshTimes);
        this.view.btnRefresh.title = `刷新${restCount}/${maxCount}`

        this._oppoArray = (context.opponentVos || [])
            .sort((a, b) => {
                return b.score - a.score
            });
        this.view.oppoList.numItems = this._oppoArray.length;


    }

    // 对手信息
    renderOppoItem(index: number, comp: ui.pvp.components.PVPChallengeOtherOneRowComp) {

        const arenaOpponentVo = this._oppoArray[index];
        if (!arenaOpponentVo) {
            return;
        }
        const rankConfigId = arenaOpponentVo.rankConfigId;
        const config = PVPUtils.getConfigById(rankConfigId);


        comp.labelName.text = PVPInfoUtils.getNameByOppo(arenaOpponentVo);

        const fightNum = PVPInfoUtils.getPowerNumByOppo(arenaOpponentVo);
        comp.labelPower.text = "战力: " + StringUtils.getFightStr(fightNum);

        comp.getController("c1").selectedIndex = 0;
        if (fightNum > FightManager.ins().getFightByDefault()) {
            comp.getController("c1").selectedIndex = 1;
        }

        FguiScriptUtils.toMyScriptClass(comp, PVPChallengeOtherOneRowComp)
            .reset(config, arenaOpponentVo, this);
    }

}