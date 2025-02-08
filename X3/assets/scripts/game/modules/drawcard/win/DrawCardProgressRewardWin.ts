import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { DrawCardUIKeys } from "../DrawCardUIKeys";
import { DrawCardModel } from "db://assets/scripts/game/modules/drawcard/model/DrawCardModel";
import GIns from "db://assets/scripts/game/GIns";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { MonthCardController } from "db://assets/scripts/game/modules/monthCard/MonthCardController";
import { DrawCardConfigManager } from "db://assets/scripts/game/modules/drawcard/config/DrawCardConfigManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import {
    DrawCardNormalHeadRewardComp
} from "db://assets/scripts/game/modules/drawcard/components/DrawCardNormalHeadRewardComp";


/**
 * 抽卡
 * 心愿英雄
 */
@bindScript(DrawCardUIKeys.DrawCardProgressRewardWin)
export class DrawCardProgressRewardWin extends UICommWin {

    static pkgName: string = "drawCard";
    static viewName: string = "DrawCardProgressRewardWin";
    private _isActive: boolean = false;
    private _configs: table.recruit.NormalRecruitProgressConfig[] = [];
    private _isMoreInfo: boolean = false;


    listenNotifications(): string[] {
        return [
            NotificationKey.MONTHCARD_BUY_COMPLETE,
            NotificationKey.MONTHCARD_DATA_CHANGE,
            NotificationKey.CLOSE_ViEW,
        ]
    }


    notificationHandler(event: string, args?: any) {
        switch (event) {
            case NotificationKey.CLOSE_ViEW: 
            case NotificationKey.MONTHCARD_DATA_CHANGE: 
            case NotificationKey.MONTHCARD_BUY_COMPLETE: {
                this.reset();
                break;
            }
        }
    }

    private get view(): ui.drawCard.win.DrawCardProgressRewardWin {
        return this._view as any;
    }

    protected onInit(): void {
        this.view.headList.itemRenderer = this.irComp.bind(this);

        // 激活更多
        this.view.btnJump.onClick(this.onClickJumpActive, this);
        this.view.btnActiveMore.onClick(this.onClickJumpActive, this);
        this.view.btnRule.onClick(this.onClickMoreInfo, this);

        this._configs = DrawCardConfigManager.getNormalProgressConfigArray();
        this.view.getController("isMoreInfo").selectedIndex = 0;

    }

    onClickMoreInfo() {
        this._isMoreInfo = !this._isMoreInfo;
        this.view.getController("isMoreInfo").selectedIndex = this._isMoreInfo ? 1 : 0;
    }

    onClickJumpActive() {
// 跳转去月卡
        MonthCardController.ins().openBuyWin();
    }

    protected onOpen(args: any): void {

        this.reset();
    }


    protected onClose(): void {
    }

    private reset() {

        this._isActive = GIns.monthCardModel.isAciveByType(ServerEnums.MonthCardType.MONTH)
        this.view.getController("isActive").selectedIndex = this._isActive ? 1 : 0;

        const context = DrawCardModel.ins().context;

        const haveUseCount = context.getShowUseNormalProgressScore();
        const noUseProgressCount = context.getShowNoUseNormalProgressCount();

        const maxProgressCount = DrawCardConfigManager.maxProgressCount;
        this.view.labelSubTitle.text = `每 [color=#ffcd54][size=40]${maxProgressCount}[/size][/color] 抽内必得`;
        // 累计招募次数
        const drawCardCount = context.getDrawCardCount(ServerEnums.RecruitType.NORMAL);
        this.view.labelProgressCount.text = `${drawCardCount}`;
        this.view.labelRTTips.text = `已消耗累计次数：${haveUseCount}\n`
            + `未消耗累计次数：${noUseProgressCount}`;

        this.view.headList.numItems = this._configs.length;

    }

    irComp(i: number, comp: DrawCardNormalHeadRewardComp) {
        const config = this._configs[i];

        comp.reset(config);
    }
}