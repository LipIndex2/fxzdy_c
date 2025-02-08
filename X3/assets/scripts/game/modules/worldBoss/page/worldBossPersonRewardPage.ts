import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { I18nManager } from "../../../../core/i18n/I18nManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import NotificationKey from "../../../event/NotificationKey";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { ShopModel } from "../../shop/model/ShopModel";
import { I18WorldBossKey, WorldBossUiKey } from "../const/WorldBossConst";
import { WorldBossModel } from "../model/WorldBossModel";
import { WorldBossRankVo } from "../vo/worldBossRankVo";
import { WorldBossManager } from "../WorldBossManager";


@bindScript(WorldBossUiKey.WORLD_BOSS_PERSON_RANK_REWARD_VIEW)
export class WorldBossPersonRewardPage extends UIView {
    static pkgName: string = "worldBoss";

    static viewName: string = "worldBossPersonReward1";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;
    private mWorldBossConfig: table.worldboss.WorldBossConfig;
    private get view(): ui.worldBoss.worldBossPersonReward1 {
        return this._view as any;
    }
    listenNotifications(): string[] {
        return [NotificationKey.EVENT_WORLD_BOSS_RANK_RESP];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_WORLD_BOSS_RANK_RESP:
                this.updateView();
                break

        }
    }

    protected onClose(): void {
        clearTimeout(this.alphaTick);
    }

    public onInit(): void {
        this.view.rankList.setVirtual();
        this.view.rankList.itemRenderer = this.rankListRender.bind(this);
        this.view.rewardList.itemRenderer = this.view.rewardList2.itemRenderer = this.currentRewardRender.bind(this);
    }
    private killCfgs: table.worldboss.WorldBossRankRewardConfig[];
    public onOpen(args: table.worldboss.WorldBossConfig): void {
        this.view.rankList.alpha = this.view.rewardList2.alpha = 0;
        this.mWorldBossConfig = args;
        this.killCfgs = WorldBossModel.ins().getRankRewardCfg(this.mWorldBossConfig.id);

        let vo = WorldBossManager.ins().getWorldBossInfo(this.mWorldBossConfig.id);
        if (vo.startTime)
            WorldBossModel.ins().sendRankList(args.id, 1);
        else
            this.updateView();

    }



    private mWorldBossVo: WorldBossRankVo;
    private currentKillItems: NoOwnerItem[];
    private updateView(): void {
        let view = this.view;

        let worldBossInfo = this.mWorldBossVo = WorldBossManager.ins().getWorldBossRankVo(this.mWorldBossConfig.id);
        //根据我的排名，显示当前奖励
        let rank = worldBossInfo ? worldBossInfo.rank : 0;
        let stateCtr = view.getController("rankType");
        if (rank && rank > 0) {
            view.rankNum.text = I18nManager.ins().lang(I18WorldBossKey.i18n_worldBoss_rank, rank);
            let cfg = this.killCfgs.find((cfg) => {
                return rank >= cfg.minRank && rank <= cfg.maxRank;
            });
            this.currentKillItems = ItemUtils.parseKvArrayToItemArray(cfg.settleRewards);
            view.rewardList.numItems = view.rewardList2.numItems = this.currentKillItems.length;
            stateCtr.selectedIndex = rank > 3 ? 1 : 0;
        }
        else {
            //未上榜
            view.rankNum.text = I18nManager.ins().translate(I18WorldBossKey.i18n_worldBoss_noRank);
            stateCtr.selectedIndex = 2;
        }


        view.rankList.numItems = this.killCfgs.length;
        this.alphaTick =  setTimeout(() => {
            if (this.view )
                this.view.rankList.alpha = this.view.rewardList2.alpha = 1;
        }, 250);
       
    }

    private alphaTick: number;


    /**所有击杀天数 */
    private rankListRender(index: number, obj: ui.worldBoss.component.worldBossPersonRewardCell): void {
        let cfg = this.killCfgs[index];
        let rankCtr = obj.getController("rank");
        //1-3名特殊处理
        if (cfg.minRank == 1 && cfg.maxRank == 1) {
            rankCtr.selectedIndex = 0;
        }
        else if (cfg.minRank == 2 && cfg.maxRank == 2) {
            rankCtr.selectedIndex = 1;
        }
        else if (cfg.minRank == 3 && cfg.maxRank == 3) {
            rankCtr.selectedIndex = 2;
        }
        else {
            rankCtr.selectedIndex = 3;
            obj.rank.text = `${cfg.minRank}-${cfg.maxRank}`;
        }

        //击杀奖励
        let rewardItems = ItemUtils.parseKvArrayToItemArray(cfg.settleRewards);
        obj.rewardList.itemRenderer = this.skillRewardListRender.bind(this, rewardItems);

        obj.rewardList.numItems = rewardItems.length;

    }
    /**天数对应击杀奖励 */
    private skillRewardListRender(rewardItems: NoOwnerItem[], index: number, obj: ItemFrameBtn): void {

        let item = rewardItems[index];
        //  obj.img_item.icon = item.getIconPath();
        //  obj.img_frame.icon = item.getQualityIconPath();
        //  obj.T_num.text = `X${item.count?.toString() || "0"}`;
        obj.reset(item.itemId, item.count);
       // obj.onClick(this.onShowItemTips.bind(this, index, rewardItems));

    }


    private onShowItemTips(idx: number, rewardItems: NoOwnerItem[], e: fgui.Event) {
        let item = rewardItems[idx];
        //显示物品tips
        ShopModel.ins().showItemDetail(e.target, item.itemId, e);
    }
    /**我的奖励 */
    private currentRewardRender(index: number, obj:ItemFrameBtn): void {
        let item = this.currentKillItems[index];
        obj.reset(item.itemId, item.count);
        // obj.img_item.icon = item.getIconPath();
        // obj.img_frame.icon = item.getQualityIconPath();
        // obj.T_num.text = `X${item.count?.toString() || "0"}`;
        // obj.onClick(this.onShowItemTips.bind(this, index, this.currentKillItems));
    }







}
