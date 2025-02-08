import G from "db://assets/scripts/core/comm/G";
import * as fgui from "fairygui-cc";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { PVPModel } from "db://assets/scripts/game/modules/pvp/model/PVPModel";
import { PVPUtils } from "db://assets/scripts/game/modules/pvp/utils/PVPUtils";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { PVPRankStarListComp } from "db://assets/scripts/game/modules/pvp/components/PVPRankStarListComp";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { VipModel } from "../../vip/model/VipModel";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { PrivilegeAdditionController } from "../../vip/PrivilegeAdditionController";


const { GObject } = fgui;

export class PVPRankLvUpViewOpenArgs {
    newScore: number;
    oldScore: number;

    static create(score: number, oldScore: number): PVPRankLvUpViewOpenArgs {
        const args = new PVPRankLvUpViewOpenArgs();
        args.newScore = score;
        args.oldScore = oldScore;
        return args;
    }
}

/**
 * PVP
 */
export class PVPRankLvUpView extends UICommWin {

    static pkgName: string = "pvp";

    static viewName: string = "PVPRankLvUpView";

    private _score: number;
    private _oldScore: number;
    private _config: table.arena.ArenaRankConfig;
    private _rewards: Array<NoOwnerItem>;


    private get view(): ui.pvp.PVPRankLvUpView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {

    }


    public onInit(): void {
        G.Logger.debug(" onInit ")

        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = this.renderForItem.bind(this);
    }

    public onOpen(args: PVPRankLvUpViewOpenArgs): void {
        this._score = args.newScore;
        this._oldScore = args.oldScore;

        this.reset();
    }


    public onClose(): void {
        G.Logger.debug(" onClose ");


        // 关闭战斗
        G.FacadeManager.emit(NotificationKey.CLOSE_BATTLE_VIEW);
    }

    onClickRefresh() {
        PVPModel.ins().sendRefreshChallengeList();
    }

    @LogBusiness("刷新界面")
    private reset() {
        const config = PVPUtils.getConfigByScore(this._score);
        const oldConfig = PVPUtils.getConfigByScore(this._oldScore);
        if (!config || !oldConfig) {
            console.error(`出错. score = ${this._score}`);
            return;
        }
        this._config = config;


        // reach rewards
        this._rewards = ItemUtils.parseKvArrayToItemArray(config.firstReachRankRewards);
        this._rewards.forEach((value) => {
            value.count += PrivilegeAdditionController.ins().getArenaReward(value.itemId, value.count)
        })
        this.view.itemList.numItems = this._rewards.length;

        // first gain ?
        const context = PVPModel.ins().getContext();
        const isHaveGain = context.havaRankReward;//context.isHaveGainFirstReachReward(config);
        this.view.getController("haveGainFlag").selectedIndex = isHaveGain ? 1 : 0;

        // logo
        this.view.imageRankLogo2.icon = config.logoBigAssetPath;
        this.view.labelRankName2.text = config.name;

        // star List
        FguiScriptUtils.toMyScriptClass(this.view.starComp2, PVPRankStarListComp)
            .reset(config);


        // logo
        this.view.imageRankLogo1.icon = oldConfig.logoBigAssetPath;
        this.view.labelRankName1.text = oldConfig.name;

        // star List
        FguiScriptUtils.toMyScriptClass(this.view.starComp1, PVPRankStarListComp)
            .reset(oldConfig);

    }


    // 挑战奖励
    renderForItem(index: number,
        comp: ui.comm.item.ItemFrameBtn
    ) {
        const item = this._rewards[index];
        if (!item) {
            return;
        }

        // @ts-ignore
        (comp as ItemFrameBtn).resetByNoOwnerItem(item);

    }

}