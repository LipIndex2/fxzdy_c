import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { I18nManager } from "../../../../core/i18n/I18nManager";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import NotificationKey from "../../../event/NotificationKey";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { ModelNode } from "../../common/node/ModelNode";
import { HangUpUtils } from "../../hangup/utils/HangUpUtils";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { ShopModel } from "../../shop/model/ShopModel";
import { I18WorldBossKey, WorldBossUiKey } from "../const/WorldBossConst";
import { WorldBossModel } from "../model/WorldBossModel";
import { BattleRecordManager } from "db://assets/scripts/game/comm/battle/BattleRecordManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

/**
 * 个人挑战成功推送
 */
@bindScript(WorldBossUiKey.WORLD_BOSS_BEAT_PERSON)
export class worldBossBattlePersonSuccessView extends UICommWin {
    static pkgName: string = "worldBoss";

    static viewName: string = "worldBossBattleSuccess";

    private get view(): ui.worldBoss.worldBossBattleSuccess {
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
        super.onInit();
        this.view.btnData.onClick(this.onClickBtnData, this);
    }

    onClickBtnData() {
        BattleRecordManager.ins().showRecordView(ServerEnums.FightType.WORLD_BOSS,true);
    }

    private rewardItems: NoOwnerItem[];
    private mWorldBossChallengeVo: Vo.worldboss.WorldBossChallengeVo;

    protected onOpen(data: Vo.worldboss.WorldBossChallengeVo): void {
        // WorldBossManager.ins().getWorldBossInfo(data.bossConfigId);
        // this.view.getReward.onClick(this.onGetReward, this);
        this.mWorldBossChallengeVo = data;
        if (data.rank > 0) {
            this.view.rank.text = `${data.rank}`;
        } else {
            this.view.rank.text = I18nManager.ins().translate(I18WorldBossKey.i18n_worldBoss_noRank);
        }
        let maxData = WorldBossModel.ins().getMaxDamageAndRank();
        //是否新的伤害记录
        this.view.newDamage.visible = data.hurt > maxData[0];

        //是否有新的排名
        this.view.newRank.visible = data.rank > maxData[1];

        this.view.totalDamage.text = `${data.hurt}`;
        let boxCfgs: table.worldboss.WorldBossProgressRewardConfig[] = [];
        let boxNum = WorldBossModel.ins().getBoxCfgByDamageRecursion(data.bossConfigId, 1, data.hurt, boxCfgs).length;
        this.view.boxNum.text = `X${boxNum}`;
        this.view.rewards.itemRenderer = this.rewardListRender.bind(this);
        this.rewardItems = ItemUtils.convertToNoOwnerItemArrayByServerRewards(data.rewardResults);
        this.view.rewards.numItems = this.rewardItems.length;

        const modelNode = this.view.modelNode as ModelNode;

        modelNode.loadByPath(HangUpUtils.getWinResultSpineAssetPath());
        modelNode.playOrders(
            [
                {
                    name: "unlocking1",
                    isLoop: false
                },
                {
                    name: "idle1",
                    isLoop: true
                },
            ]
        );
        this.view.touchable = false;
        this.view.getTransition("ani").play(() => {
            this.view.touchable = true;
        });

    }

    protected onClose(): void {
        //退出战斗
        UIManager.ins().close(WorldBossUiKey.WORLD_BOSS_BATTLE_UI);
        G.FacadeManager.emit(NotificationKey.CLOSE_BATTLE_VIEW);

        let cfgs = WorldBossModel.ins().getWorldBossAllCfg();
        let cfg: table.worldboss.WorldBossConfig;
        for (let i = 0; i < cfgs.length; i++) {
            if (cfgs[i].id == this.mWorldBossChallengeVo.bossConfigId) {
                cfg = cfgs[i];
                break;
            }
        }
        // setTimeout(() => {
        // WorldBossModel.ins().openWorldBossMain(cfg.buildId);
        // }, 100);

    }

    private rewardListRender(index: number, obj: ui.comm.item.ItemFrame): void {

        let item = this.rewardItems[index];
        obj.img_item.icon = item.getIconPath();
        obj.img_frame.icon = item.getQualityIconPath();
        obj.T_num.text = `X${item.count?.toString() || "0"}`;

        obj.onClick(this.onShowItemTips.bind(this, index));

    }


    private onShowItemTips(idx: number, e: fgui.Event) {
        let item = this.rewardItems[idx];
        //显示物品tips
        ShopModel.ins().showItemDetail(e.target, item.itemId, e);
    }

}