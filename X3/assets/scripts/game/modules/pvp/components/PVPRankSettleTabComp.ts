import * as fgui from "fairygui-cc";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { VipModel } from "../../vip/model/VipModel";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { PrivilegeAdditionController } from "../../vip/PrivilegeAdditionController";

/**
 * 结算 tab
 */
export class PVPRankSettleTabComp extends fgui.GComponent {
    private _config: table.arena.ArenaRankConfig;
    private _rewards: NoOwnerItem[] = [];


    private get view(): ui.pvp.components.PVPRankSettleTabComp {
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

    reset(title: string, rewards: NoOwnerItem[]) {
        this.view.labelTitle.text = title;
        this._rewards = rewards || [];
        this._rewards.forEach((value) => {
            value.count += PrivilegeAdditionController.ins().getArenaReward(value.itemId, value.count)
        })
        this.view.itemList.numItems = this._rewards.length;


    }

    itemRenderForStar(index: number, starComp: ui.comm.item.ItemFrameBtn) {
        const noOwnerItem = this._rewards[index];
        if (!noOwnerItem) {
            return
        }
        // @ts-ignore
        (starComp as ItemFrameBtn).resetByNoOwnerItem(noOwnerItem);


    }

}