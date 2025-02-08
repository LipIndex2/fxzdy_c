import { sp } from "cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import NotificationKey from "../../../event/NotificationKey";
import { ModelNode } from "../../common/node/ModelNode";
import { PlayerAvatar } from "../../common/playerInfo/PlayerAvatar";
import { PlayerTitleSmallComp } from "../../common/playerInfo/PlayerTitleSmallComp";
import { PlayerInfoConfigManager } from "../../player/config/PlayerInfoConfigManager";
import { PlayerModel } from "../../player/model/PlayerModel";
import { PlayerUIKeys } from "../../player/PlayerUIKeys";
import { PlayerInfoMainViewOpenArgs } from "../../player/structs/PlayerInfoMainViewOpenArgs";
import { WorldBossUiKey } from "../const/WorldBossConst";
import { WorldBossModel } from "../model/WorldBossModel";
import { WorldBossManager } from "../WorldBossManager";

@bindScript(WorldBossUiKey.WORLD_BOSS_BEAT_WIN)
export class WorldBossBeatView extends UICommWin {
    //worldBossBeat
    static pkgName: string = "worldBoss";

    static viewName: string = "worldBossBeat";

    private mWorldBossConfig: table.worldboss.WorldBossConfig;
    private mWorldBossVo: Vo.worldboss.WorldBossVo;
    listenNotifications(): string[] {
        return [NotificationKey.EVENT_WORLD_BOSS_INFO_RESP, NotificationKey.EVENT_WORLD_BOSS_RANK_RESP];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_WORLD_BOSS_INFO_RESP:
                this.updateView();
                break
            case NotificationKey.EVENT_WORLD_BOSS_RANK_RESP:
                this.updateRank();
                break;
        }
    }

    private get view(): ui.worldBoss.worldBossBeat {
        return this._view as any;
    }

    public onOpen(args: table.worldboss.WorldBossConfig): void {

        //  WorldBossModel.ins().sendWorldBossInfo(args.id);
        WorldBossModel.ins().sendRankList(args.id, 1);

        this.mWorldBossConfig = args;
        this.updateView();
        // this.updateRank();


    }
    private bossSpine: sp.Skeleton;
    /**
    * 点击播放boss动画
    */
    private bossPlay(spine: sp.Skeleton): void {

        //如果死亡了就播放死亡动作
        this.bossSpine = spine;
        if (this.mWorldBossVo.killTime) {
            this.bossSpine.setAnimation(0, "die", false);
        }
        else {
            this.bossSpine.setAnimation(0, "idle", true);
        }
    }

    public onInit(): void {
        this.view.playerList.itemRenderer = this.playerListRender.bind(this);
    }

    private updateView(): void {
        let view = this.view;
        let vo = this.mWorldBossVo = WorldBossManager.ins().getWorldBossInfo(this.mWorldBossConfig.id);
        let monstCfg = WorldBossModel.ins().getWorldBossCfg(this.mWorldBossConfig.battleConfigId);
        view.bossName.text = monstCfg?.cfg?.name;
        // if (!view.bossSpine.node.parent.getChildByName("spineNode")) {
        //    // WorldBossModel.ins().showMonsterSpineNode(monstCfg.spineModelId, view.bossSpine.node, this.bossPlay.bind(this));
        // }


        view.bossSpine.url = this.mWorldBossVo.killTime ? this.mWorldBossConfig.deathShow : this.mWorldBossConfig.liveShow;

        if (vo.killTime) {
            const diffTimeMs = vo.killTime - vo.startTime;
            view.killTimeStr.text = TimeUtils.formatTimeMsToDayHourMinuteText(diffTimeMs);

            view.killTime.visible = true;
        }
        else {
            view.killTime.visible = false;

        }
    }
    private rank_4_8: Vo.worldboss.WorldBossRankItemVo[]
    private updateRank(): void {
        let allRankList = WorldBossManager.ins().getAllRankList(this.mWorldBossConfig.id);
        let view = this.view;

        //展示前三名
        let rankList = allRankList.slice(0, 3);

        for (let i = 1; i <= 3; i++) {
            let rankItem = rankList[i - 1];

            let com: ui.worldBoss.btn.No1Com_1 = view[`no${i}Com`];
            if (rankItem) {

                com.damageCom.damage.text = `${rankItem.value}`

                let playerBaseVo = rankItem.baseVo;
                com.modelNode.clearClick();
                //view.No1Spine
                if (playerBaseVo) {

                    const modelId = PlayerInfoConfigManager.getModelIdByPlayerInfo(playerBaseVo)

                    const modelNode = FguiScriptUtils.toMyScriptClass(com.modelNode, ModelNode);
                    modelNode.setScale(1.5, 1.5);
                    modelNode.loadByModelId(modelId);

                    // text
                    com.nameLabel.text = playerBaseVo.name;

                    if (playerBaseVo.id != PlayerModel.ins().Vo.id) {
                        com.modelNode.onClick(() => {
                            UIManager.ins().open(PlayerUIKeys.PlayerInfoMainView, PlayerInfoMainViewOpenArgs.create(
                                playerBaseVo.id
                            ));
                        });
                    }

                }
                //  view[`rank${i}`].visible = true;
                // view.noRank1
                com.noRank.visible = false;
                com.damageCom.visible = true;
                com.titleComp.visible = true;
                FguiScriptUtils.toMyScriptClass(com.titleComp, PlayerTitleSmallComp).resetByTitleId(rankItem.baseVo.title);
            }
            else {

                com.noRank.visible = true;
                //隐藏头衔/置空名字和伤害
                //view.No1Title
                com.titleComp.visible = false;
                //view.No1Name
                com.nameLabel.text = "";
                //view.No1Fight
                com.damageCom.visible = false;
            }

        }

        //展示4-8名
        this.rank_4_8 = allRankList.slice(3, 8);
        this.view.playerList.numItems = 5;
    }


    private playerListRender(index: number, item: ui.worldBoss.component.playerHeadWithFight): void {

        let rankItem = this.rank_4_8[index];
        if (rankItem) {
            item.nameLab.text = rankItem.baseVo.name;
            item.powerLab.damage.text = `${rankItem.value}`;

            item.rankGr.visible = true;
            item.noRank.visible = false;

            const avatar = FguiScriptUtils.toMyScriptClass(item.headCom.head, PlayerAvatar);
            avatar.resetByPlayerInfo(rankItem.baseVo);

            FguiScriptUtils.toMyScriptClass(item.titleComp, PlayerTitleSmallComp).resetByTitleId(rankItem.baseVo.title);
        }
        else {
            item.rankGr.visible = false;
            item.noRank.visible = true;
        }


    }

    protected onClose(): void {
        //检查领奖状态
        //0=不可领 1=是可领取 2是已经领取
        let state = WorldBossModel.ins().getRankRewardState(this.mWorldBossConfig.id);
        if (state.state == 1) {
            WorldBossModel.ins().openWorldBossReward(this.mWorldBossConfig.id, 0, state.rewards);

        }


    }





}