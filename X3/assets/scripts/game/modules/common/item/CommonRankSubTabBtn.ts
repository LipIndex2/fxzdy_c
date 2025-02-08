import * as fgui from "fairygui-cc";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { DailyBossConfigManager } from "db://assets/scripts/game/modules/dailyBoss/config/DailBossConfigManager";
import { DailyBossModel } from "db://assets/scripts/game/modules/dailyBoss/model/DailyBossModel";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import GIns from "../../../GIns";


/**
 * 排行榜 sub type
 */
export class CommonRankSubTabBtn extends fgui.GComponent {

    static pkgName: string = "comm";
    static viewName: string = "CommonRankSubTabBtn";

    private _subType: number = 0;
    private _rankType: ServerEnums.RankingType;

    private get view(): ui.comm.rank.CommonRankSubTabBtn {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onConstruct(): void {
        this.view.onClick(this.onClickChangeSubType, this)
    }

    reset(
        rankType: ServerEnums.RankingType,
        subType: number,
        isLast: boolean,
        isChoose: boolean,
    ) {
        this._rankType = rankType;
        this._subType = subType;

        this.view.imageColLine.visible = !isLast;
        this.view.getController("click").selectedIndex = isChoose ? 1 : 0;
        
        // name
        if (this._rankType == ServerEnums.RankingType.DAILY_BOSS) {
            // 每日boss
            const bossType = subType;
            const config = DailyBossConfigManager.getBossThemeConfigByBossType(bossType);
            this.view.labelTitle.text = config?.name || "";
        }
    }


    onClickChangeSubType() {
        if (this._rankType == ServerEnums.RankingType.DAILY_BOSS) {
            // 每日boss
            const bossType = this._subType;

            if (!DailyBossModel.ins().context.isBossTypeOpen(bossType)) {
                GIns.floatingTextMgr.showTips("该BOSS未开启");
                return;
            }
        }
// change sub type
        FacadeManager.ins().emit(NotificationKey.RANK_SUB_TYPE_CHANGE, this._subType);
    }

}