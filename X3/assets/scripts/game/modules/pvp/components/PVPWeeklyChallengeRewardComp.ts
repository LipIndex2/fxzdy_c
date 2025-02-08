import * as fgui from "fairygui-cc";
import G from "db://assets/scripts/core/comm/G";
import { PVPModel } from "db://assets/scripts/game/modules/pvp/model/PVPModel";
import { PVPContext } from "db://assets/scripts/game/modules/pvp/context/PVPContext";
import { PVPTaskListItemComp } from "db://assets/scripts/game/modules/pvp/components/PVPTaskListItemComp";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { PVPUtils } from "db://assets/scripts/game/modules/pvp/utils/PVPUtils";
import { TimeUtils } from "db://assets/scripts/game/comm/utils/TimeUtils";

/**
 * 每周挑战面板 com
 */
export class PVPWeeklyChallengeRewardComp extends fgui.GComponent {
    private _config: table.arena.ArenaRankConfig;
    private _configs: table.arena.ArenaWeeklyRewardConfig[];
    private _context: PVPContext;


    private get view(): ui.pvp.components.PVPWeeklyChallengeRewardComp {
        return this as any;
    }

    constructor() {
        super();
    }


    onConstruct() {
        this.view.tabList.setVirtual();
        this.view.tabList.itemRenderer = this.itemRenderForRewardTab.bind(this);

        this._configs = G.TableManager.getAllData(table.arena.ArenaWeeklyRewardConfig);
        this.view.tabList.numItems = this._configs.length;

        this._context = PVPModel.ins().getContext();


        GameTimer.ins().frameLoop(10, this, this.updateCountDownTimeText);
    }

    protected onPreDispose() {
        GameTimer.ins().clearAll(this);
        super.onPreDispose();
    }

    // cdt
    updateCountDownTimeText() {
        const curTimeMs = G.TimeManager.serverNow;
        const nextRefreshTimeMs = PVPUtils.getPVPWeeklyNextRefreshTimeMs(curTimeMs);

        const restTimeMs = Math.max(0, nextRefreshTimeMs - curTimeMs);

        const timeText = TimeUtils.formatTimeMsToPositiveTimeText(restTimeMs);
        this.view.labelResetTime.text = `${timeText} 后重置`;

    }

    reset() {
        this.view.tabList.refreshVirtualList();

        const count = PVPModel.ins().getContext()?.todayChallengeTimes?.toString() || "0";
        this.view.labelDesc
            .setVar("count", count)
            .flushVars()
        ;
    }

    itemRenderForRewardTab(index: number, comp: ui.pvp.list.PVPTaskListItemComp) {
        const config = this._configs[index];
        if (!config) {
            return;
        }
        // @ts-ignore
        (comp as PVPTaskListItemComp).reset(config);
    }

}