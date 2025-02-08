import { sp } from "cc";
import NotificationKey from "../../../event/NotificationKey";
import { WorldBossModel } from "../model/WorldBossModel";
import { WorldBossManager } from "../WorldBossManager";
import { WorldBossUiKey } from "../const/WorldBossConst";
import { PlayerModel } from "../../player/model/PlayerModel";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { WorldBossRankVo } from "../vo/worldBossRankVo";
import { PlayerInfoConfigManager } from "../../player/config/PlayerInfoConfigManager";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ModelNode } from "../../common/node/ModelNode";
import { PlayerAvatar } from "../../common/playerInfo/PlayerAvatar";
import * as fgui from "fairygui-cc";
import { UIManager } from "../../../../core/mvc/UIManager";
import { PlayerUIKeys } from "../../player/PlayerUIKeys";
import { PlayerInfoMainViewOpenArgs } from "../../player/structs/PlayerInfoMainViewOpenArgs";
import { PlayerTitleSmallComp } from "../../common/playerInfo/PlayerTitleSmallComp";
import { SettingsModel } from "../../settings/model/SettingsModel";
import { bindScript } from "../../../../core/comm/UIScriptManager";

@bindScript(WorldBossUiKey.WORLD_BOSS_RANK_VIEW)
export class worldBossRankView extends UIWin {

    //worldBossBeat
    static pkgName: string = "worldBoss";


    static viewName: string = "worldBossRank";

    private mWorldBossConfig: table.worldboss.WorldBossConfig;
    private mWorldBossVo: Vo.worldboss.WorldBossVo;

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_WORLD_BOSS_INFO_RESP,
            NotificationKey.EVENT_WORLD_BOSS_RANK_RESP
        ];
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

    private get view(): ui.worldBoss.worldBossRank {
        return this._view as any;
    }

    private rankPage: number = 1;

    public onOpen(args: table.worldboss.WorldBossConfig): void {

        WorldBossModel.ins().sendWorldBossInfo(args.id);
        //  WorldBossModel.ins().sendRankList(args.id, 1);

        this.mWorldBossConfig = args;


    }

    private bossSpine: sp.Skeleton;


    public onInit(): void {
        this.view.rankList.setVirtual();
        this.view.rankList.itemRenderer = this.playerListRender.bind(this);
        this.view.bottom.btnBack.onClick(() => {
                this.closeSelf();
            }
        );

        this.view.rewardBtn.onClick(() => {
            WorldBossModel.ins().openSettlement(this.mWorldBossConfig, 1);
        });

        //监听滚动事件
        this.view.rankList.on(fgui.Event.SCROLL, this.onPullDownToRefresh, this);
    }

    private onPullDownToRefresh(): void {
        let view = this.view;
        let scrollView = view.rankList;
        let index = Math.round(scrollView.scrollPane.posY / 150);
        //滚到最后一个
        if (index % 4 == 0) {
            if (this.mRankVo && this.rankPage < this.mRankVo.maxPage) {
                this.rankPage++;
                WorldBossModel.ins().sendRankList(this.mWorldBossConfig.id, this.rankPage);
            }
        }
    }

    private updateView(): void {
        let view = this.view;
        let vo = this.mWorldBossVo = WorldBossManager.ins().getWorldBossInfo(this.mWorldBossConfig.id);
        if (vo.startTime > 0)
            WorldBossModel.ins().sendRankList(this.mWorldBossConfig.id, 1);
        else
            this.updateRank();


    }

    private rank_4_8: Vo.worldboss.WorldBossRankItemVo[];
    private mWorldBossRankVo: WorldBossRankVo;
    private mRankVo: WorldBossRankVo;

    private updateRank(): void {
        this.mWorldBossRankVo = WorldBossManager.ins().getWorldBossRankVo(this.mWorldBossConfig.id);
        this.mRankVo = WorldBossManager.ins().getWorldBossRankVo(this.mWorldBossConfig.id);
        let view = this.view;
        let allRankList = WorldBossManager.ins().getAllRankList(this.mWorldBossConfig.id);
        //展示前三名
        let rankList = allRankList.slice(0, 3);

        for (let i = 1; i <= 3; i++) {
            let rankItem = rankList[i - 1];

            let com: ui.worldBoss.btn.No1Com1 = view[`no${i}Com`];
            com.modelNode.clearClick();
            if (rankItem) {

                com.damageCom.damage.text = `${rankItem.value}`


                let playerBaseVo = rankItem.baseVo;
                //view.No1Spine
                if (playerBaseVo) {

                    const modelId = PlayerInfoConfigManager.getModelIdByPlayerInfo(playerBaseVo)

                    const modelNode = FguiScriptUtils.toMyScriptClass(com.modelNode, ModelNode);
                    modelNode.setScale(2, 2);
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
                const titleId = rankItem.baseVo.title;
                FguiScriptUtils.toMyScriptClass(com.titleComp, PlayerTitleSmallComp)
                    .resetByTitleId(titleId)
            } else {

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

        //展示剩余的或者虚位以待
        this.rank_4_8 = allRankList.slice(3);
        this.view.rankList.numItems = Math.max(5, this.rank_4_8.length);
        this.showMyRank();
    }


    private playerListRender(index: number, item: ui.worldBoss.component.rankCell): void {

        let rankItem = this.rank_4_8[index];
        let ctr = item.getController("state");

        if (rankItem) {
            item.playerName.text = rankItem.baseVo.name;
            item.rank.text = `${rankItem.rank}`;
            item.playerFight.damage.text = `${rankItem.value}`;
            ctr.selectedIndex = 0;
            const avatar = FguiScriptUtils.toMyScriptClass(item.playerAvatar, PlayerAvatar);
            avatar.resetByPlayerInfo(rankItem.baseVo);
            FguiScriptUtils.toMyScriptClass(item.titleComp, PlayerTitleSmallComp).resetByTitleId(rankItem.baseVo.title)
        } else {
            ctr.selectedIndex = 1;
        }
        item.rank.text = `${index + 4}`;


    }

    /**我的排行榜信息 */
    private showMyRank(): void {
        let vo = this.mWorldBossRankVo;
        let rank = vo ? vo.rank : 0;
        let ctr = this.view.myRank.getController("state");
        if (rank && rank > 0) {
            this.view.myRank.rank.text = `${rank}`;

            ctr.selectedIndex = 2;
            this.view.myRank.playerFight.damage.text = `${vo.hurt}`;
            this.view.myRank.playerFight.visible = true;
        } else {
            //i18n_worldBoss_noRank
            ctr.selectedIndex = 3;
            this.view.myRank.playerFight.visible = false;
        }
        const avatar = FguiScriptUtils.toMyScriptClass(this.view.myRank.playerAvatar, PlayerAvatar);
        avatar.resetMe();
        this.view.myRank.playerName.text = PlayerModel.ins().Vo.name;
        const titleId = SettingsModel.ins().context.getTitleId();
        FguiScriptUtils.toMyScriptClass(this.view.myRank.titleComp, PlayerTitleSmallComp)
            .resetByTitleId(titleId);
    }
}