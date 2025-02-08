import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { DailyBossOneRowComp } from "db://assets/scripts/game/modules/dailyBoss/components/DailyBossOneRowComp";
import { DailyBossConfigManager } from "db://assets/scripts/game/modules/dailyBoss/config/DailBossConfigManager";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { DailyBossUIKeys } from "../DailyBossUIKeys";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";


export class DailyBossUnlockNewHardViewOpenArgs {
    newHardId: number;

    static create(
        hardId: number,
    ): DailyBossUnlockNewHardViewOpenArgs {
        const args = new DailyBossUnlockNewHardViewOpenArgs();
        args.newHardId = hardId;
        return args;
    }

}

/**
 * 每日 Boss | 结算伤害界面
 */
export class DailyBossUnlockNewHardView extends UICommWin {

    static pkgName: string = "dailyBoss";

    static viewName: string = "DailyBossUnlockNewHardView";
    private _configs: table.dailyboss.DailyBossRankConfig[];

    private _hardId: number = 1;
    private _config: table.dailyboss.DailyBossDifficultyConfig;

    private get view(): ui.dailyBoss.DailyBossUnlockNewHardView {
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

        this.view.onClick(() => {
            this.closeSelf()
        }, this);

    }

    itemRenderer(index: number, comp: DailyBossOneRowComp) {
        comp.reset(this._configs[index])
    }

    @LogBusiness("打开界面")
    public onOpen(args: DailyBossUnlockNewHardViewOpenArgs): void {
        this._hardId = args.newHardId;

        this.reset();

    }


    @LogBusiness("关闭界面")
    protected onClose() {
        super.onClose();
    }

    reset() {
        const config = DailyBossConfigManager.getDifficultyConfig(this._hardId);
        if (!config) {
            return;
        }
        this._config = config;
        this.view.labelHard.text = config.unlockName;

    }
}

UIScriptManager.bindScript(DailyBossUIKeys.DailyBossUnlockNewHardView, DailyBossUnlockNewHardView);