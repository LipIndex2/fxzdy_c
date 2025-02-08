import * as fgui from "fairygui-cc";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { VipModel } from "../../vip/model/VipModel";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { PrivilegeAdditionController } from "../../vip/PrivilegeAdditionController";

export class PVPDailyRewardTipsComp extends fgui.GComponent {
    private _config: table.arena.ArenaRankConfig;
    private _noOwnerItems: Array<NoOwnerItem>;

    private get view(): ui.pvp.components.PVPDailyRewardTipsComp {
        return this as any;
    }

    constructor() {
        super();
    }


    onConstruct() {
        this.onInit()
    }

    public onInit() {
        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = this.itemRenderForStar.bind(this);

    }

    // @LogBusiness("[JJC 每日奖励 tips Panel] reset")
    resetByDaily(config: table.arena.ArenaRankConfig) {
        this._config = config;

        const dailySettleRewards = config.dailySettleRewards;
        this._noOwnerItems = ItemUtils.parseKvArrayToItemArray(dailySettleRewards);
        this._noOwnerItems.forEach((value) => {
            value.count += PrivilegeAdditionController.ins().getArenaReward(value.itemId, value.count)
        })
        this.view.labelTitle.text = "日结算奖励";
        this.view.itemList.numItems = this._noOwnerItems.length;
    }

    // @LogBusiness("[JJC 每周奖励 tips Panel] reset")
    resetByWeekly(config: table.arena.ArenaRankConfig) {
        this._config = config;

        const dailySettleRewards = config.weeklySettleRewards;
        this._noOwnerItems = ItemUtils.parseKvArrayToItemArray(dailySettleRewards);
        this._noOwnerItems.forEach((value) => {
            value.count += PrivilegeAdditionController.ins().getArenaReward(value.itemId, value.count)
        })
        this.view.labelTitle.text = "周结算奖励";
        this.view.itemList.numItems = this._noOwnerItems.length;
    }


    itemRenderForStar(index: number, comp: ui.pvp.list.PVPItemComp) {
        const noOwnerItem = this._noOwnerItems[index];
        if (!noOwnerItem) {
            return;
        }
        comp.imageItem.icon = noOwnerItem.getItemSmallIconPath();
        comp.labelCount.text = noOwnerItem.count.toString();
    }

}