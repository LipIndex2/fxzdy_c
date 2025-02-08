import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { WorldBossUiKey } from "../const/WorldBossConst";
import { WorldBossModel } from "../model/WorldBossModel";


@bindScript(WorldBossUiKey.WORLD_BOSS_REWARD_VIEW)
export class worlBossGetRewardView extends UICommWin {
    static pkgName: string = "worldBoss";

    static viewName: string = "worldBossRewardView";

    private get view(): ui.worldBoss.worldBossRewardView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {

        }
    }
    private rewardItems: NoOwnerItem[];
    private type: number;
    private bossId: number;
    /**
     * 
     * @param value 
     * type 0 = 排名奖励 1 = 全服奖励
     */
    protected onOpen(value: { bossId: number, type: number, rewards: any[] }): void {
        this.bossId = value.bossId;
        this.type = value.type;
        this.rewardItems = ItemUtils.parseKvArrayToItemArray(value.rewards);
        let ctrl = this.view.getController("title");
        ctrl.selectedIndex = value.type;
        this.view.rewardList.itemRenderer = this.rewardListRender.bind(this);
        this.view.rewardList.numItems = value.rewards.length;

        if (this.type == 0) {
            WorldBossModel.ins().sendDrawRankReward(this.bossId);

        }
        else {
            WorldBossModel.ins().sendDrawServerReward(this.bossId);
        }


    }

    private rewardListRender(index: number, obj: ui.comm.item.ItemFrame): void {

        let item = this.rewardItems[index];
        obj.img_item.icon = item.getIconPath();
        obj.img_frame.icon = item.getQualityIconPath();
        obj.T_num.text = `X${item.count?.toString() || "0"}`;


    }




    protected onClose(): void {
        this.rewardItems = null;
        if(this.type == 0){
            WorldBossModel.ins().openServerRewardView(this.bossId);
        }

    }




}