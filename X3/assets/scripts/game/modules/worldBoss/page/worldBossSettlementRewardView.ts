import { bindScript } from "../../../../core/comm/UIScriptManager";
import { ViewBlackBgComp } from "../../../../core/mvc/view/comp/ViewBlackBgComp";
import { ViewEffectComp } from "../../../../core/mvc/view/comp/ViewEffectComp";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { WorldBossUiKey } from "../const/WorldBossConst";
import { WorldBossModel } from "../model/WorldBossModel";
import { WorldBossManager } from "../WorldBossManager";
/**
 * 结算奖励
 */
@bindScript(WorldBossUiKey.WORLD_BOSS_SETTLEMENT_VIEW)
export class WorldBossSettlementRewardView extends UICommWin
{
    static pkgName: string = "worldBoss";

    static viewName: string = "worldBossSettlementReward";

    private _uiKeys = [WorldBossUiKey.WORLD_BOSS_ALL_SERVER_REWARD_VIEW, WorldBossUiKey.WORLD_BOSS_PERSON_RANK_REWARD_VIEW];



    private get view(): ui.worldBoss.worldBossSettlementReward {
        return this._view as any;
    }


    public onInit(): void {
        this.viewContainer.bindByGList(this._uiKeys, this.view.tabList);
       
    }
    private mWorldBossConfig: table.worldboss.WorldBossConfig;

    protected onOpen(args: {cfg:table.worldboss.WorldBossConfig,pageIndex:number }): void {
        this.mWorldBossConfig = args.cfg;
        this.viewContainer.selectIndex = args.pageIndex;
    }

    onPreChangeView(index: number) {

        //返回商店id
        return this.mWorldBossConfig;
    }


}