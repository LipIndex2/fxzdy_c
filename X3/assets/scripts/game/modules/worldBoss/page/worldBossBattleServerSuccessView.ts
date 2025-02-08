import { sp } from "cc";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import NotificationKey from "../../../event/NotificationKey";
import { WorldBossModel } from "../model/WorldBossModel";
import { WorldBossManager } from "../WorldBossManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { WorldBossUiKey } from "../const/WorldBossConst";
/**
 * 击杀成功全服推送
 */
@bindScript(WorldBossUiKey.WORLD_BOSS_BEAT_SERVER)
export class WorldBossBattleServerSuccessView extends UICommWin {
    static pkgName: string = "worldBoss";

    static viewName: string = "worldBossBattleServerSuccess";

    private get view(): ui.worldBoss.worldBossBattleServerSuccess {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {

    }

    private id: number;

    protected onOpen(id: number): void {
        this.id = id;
        this.view.getReward.onClick(this.onGetReward, this);
        let vo = WorldBossManager.ins().getWorldBossInfo(id);
        let monstCfg = WorldBossModel.ins().getWorldBossCfg(vo.bossConfigId);
        if (!this.view.spineNode.node.parent.getChildByName("spineNode")) {
            WorldBossModel.ins().showMonsterSpineNode(monstCfg.spineModelId, this.view.spineNode.node, this.bossPlay.bind(this));
        }
    }

    /**
 * 点击播放boss动画
 */
    private bossPlay(spine: sp.Skeleton): void {

        //播放死亡动作

        spine.setAnimation(0, "die", false);


    }

    private onGetReward(): void {
        WorldBossModel.ins().goGetServerReward(this.id);
        this.closeSelf();
    }

}