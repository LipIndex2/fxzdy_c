import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { GVGUIKeys } from "db://assets/scripts/game/modules/gvg/GVGUIKeys";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { ItemListComp2 } from "db://assets/scripts/game/modules/common/item/ItemListComp2";
import { GVGModel } from "db://assets/scripts/game/modules/gvg/GVGModel";

/**
 * 联盟对决
 */
@bindScript(GVGUIKeys.GVGRewardPreviewWin)
export class GVGRewardPreviewWin extends UICommWin {

    static pkgName: string = "gvg";
    static viewName: string = "GVGRewardPreviewWin";

    private get view(): ui.gvg.GVGRewardPreviewWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
        }

    }

    protected onInit() {
        // TODO 初始化

    }

    @LogBusiness("打开界面")
    public onOpen(args: any): void {



        this.reset();
    }


    @LogBusiness("关闭界面")
    protected onClose() {
        super.onClose();


    }

    private reset() {

        const context = GVGModel.ins().context;

        // player
        const personalRewardForWin = context.getRewardsForPersonalChallenge(true);
        const personalRewardForFail = context.getRewardsForPersonalChallenge(false);
        // 个人挑战奖励
        FguiScriptUtils.toMyScriptClass(this.view.itemListForMyWin, ItemListComp2)
            .reset(personalRewardForWin);
        FguiScriptUtils.toMyScriptClass(this.view.itemListForMyFail, ItemListComp2)
            .reset(personalRewardForFail);

        // league
        const leagueRewardForWin = context.getRewardsForLeagueSettle(true);
        const leagueRewardForFail = context.getRewardsForLeagueSettle(false);
        // 联盟挑战奖励
        FguiScriptUtils.toMyScriptClass(this.view.itemListForLeagueWin, ItemListComp2)
            .reset(leagueRewardForWin);
        FguiScriptUtils.toMyScriptClass(this.view.itemListForLeagueFail, ItemListComp2)
            .reset(leagueRewardForFail);
    }
}