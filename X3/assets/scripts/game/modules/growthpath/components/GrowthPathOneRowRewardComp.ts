import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";
import { ActivityModel } from "db://assets/scripts/game/comm/activity/model/ActivityModel";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { ActivityGrowthPathVo } from "db://assets/scripts/game/modules/activity/model/ActivityGrowUpVo";

/**
 * 一行奖励
 */
export class GrowthPathOneRowRewardComp extends FGUI.GComponent {
    private _rewards: NoOwnerItem[] = [];
    private _stageId: number = 0;
    private _isHaveGain: boolean = false;

    private get view(): ui.growthPath.components.GrowthPathOneRowRewardComp {
        return this as any;
    }

    protected onConstruct() {
        super.onConstruct();

        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = this.iRItem.bind(this);
    }

    iRItem(index: number, item: ItemFrameBtn) {
        const reward = this._rewards[index];
        if (!reward) {
            return;
        }
        item.resetByNoOwnerItem(reward);

        item.setHaveGain(this._isHaveGain);
    }

    reset(stageId: number, rewards: NoOwnerItem[]): void {
        this._rewards = rewards;
        this._stageId = stageId;
        const vo = ActivityModel.ins().getDefaultActivityVoByType<ActivityGrowthPathVo>(ServerEnums.ActivityType.GROW_UP);
 
        this._isHaveGain = vo.isHaveGainStage(this._stageId);

        this.view.labelNoNum.text = `${stageId}`;

        this.view.itemList.numItems = rewards.length;
    }

}