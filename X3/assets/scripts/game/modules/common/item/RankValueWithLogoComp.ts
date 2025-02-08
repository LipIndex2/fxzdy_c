import * as fgui from "fairygui-cc";
import { DailyBossConfigManager } from "db://assets/scripts/game/modules/dailyBoss/config/DailBossConfigManager";


/**
 * 排行帮 subType 列表组件 | 最多 4 个
 */
export class RankValueWithLogoComp extends fgui.GComponent {

    static pkgName: string = "comm";
    static viewName: string = "RankValueWithLogoComp";
    private _subTypes: number[] = [];
    private _chooseSubType: number;

    private get view(): ui.comm.rank.RankValueWithLogoComp {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onConstruct(): void {
    }

    reset(rankValueText: string, iconPath: string) {
        this.view.labelRankValueWithLogo.text = rankValueText;
        this.view.imageRankSmallLogo.icon = iconPath;
    }



    resetByDailyBoss(rankValue: string, difficulty: number) {
        const iconPath = DailyBossConfigManager.getDifficultyRankSmallIcon(difficulty);
        this.reset(rankValue, iconPath);
    }
    
}