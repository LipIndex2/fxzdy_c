import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { I18nManager } from "../../../../core/i18n/I18nManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import NotificationKey from "../../../event/NotificationKey";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { ShopModel } from "../../shop/model/ShopModel";
import { I18WorldBossKey, WorldBossUiKey } from "../const/WorldBossConst";
import { WorldBossModel } from "../model/WorldBossModel";
import { WorldBossManager } from "../WorldBossManager";


@bindScript(WorldBossUiKey.WORLD_BOSS_ALL_SERVER_REWARD_VIEW)
export class WorldBossServerRewardPage extends UIView {
    static pkgName: string = "worldBoss";

    static viewName: string = "worldBossServerReward";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;
    private mWorldBossConfig: table.worldboss.WorldBossConfig;
    private killCfgs: table.worldboss.WorldBossServerProgressConfig[];
    private get view(): ui.worldBoss.worldBossServerReward {
        return this._view as any;
    }
    listenNotifications(): string[] {
        return [NotificationKey.EVENT_WORLD_BOSS_INFO_RESP];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_WORLD_BOSS_INFO_RESP:
                this.updateView();
                break

        }
    }
    private monsterCfg: table.monster.MonsterAttributeConfig;
    public onInit(): void {
        this.view.rankList.itemRenderer = this.rankListRender.bind(this);
        this.view.rewardList.itemRenderer = this.currentRewardRender.bind(this);
    }

    public onOpen(args: table.worldboss.WorldBossConfig): void {
        this.view.visible = false;
        this.mWorldBossConfig = args;
        this.killCfgs = WorldBossModel.ins().getServerRewardCfg(this.mWorldBossConfig.id);
        WorldBossModel.ins().sendWorldBossInfo(args.id);

        this.view.rewardList.alpha = 0;
        this.monsterCfg = WorldBossModel.ins().getWorldBossCfg(this.mWorldBossConfig.battleConfigId).cfg;
    }

    public onClose(): void {

        this.clearTick();
    }

    private clearTick(): void {
        GameTimer.ins().clear(this, this.killTick);
        clearTimeout(this.alphaTick);
    }
    private alphaTick: number;
    private mWorldBossVo: Vo.worldboss.WorldBossVo;
    private currentKillItems: NoOwnerItem[];
    private currentKillCfg: table.worldboss.WorldBossServerProgressConfig;
    private updateView(): void {
        let view = this.view;
        let currentKillCfg = this.killCfgs[0];
        let worldBossInfo = this.mWorldBossVo = WorldBossManager.ins().getWorldBossInfo(this.mWorldBossConfig.id);
        //自动滚动到对应的奖励
        let scrollIndex = 0;
        let isAllTimeOut: boolean = true;
        this.clearTick();
        if (worldBossInfo.startTime > 0) {
            //killCfgs
            let startTime = worldBossInfo.startTime;
            let diffTimeMs = G.TimeManager.serverNow - startTime;
            //看看已经开始了多少天
            let day = Math.floor(diffTimeMs / 86400000);
            //如果没有对应奖励，就用最后一档
            currentKillCfg = this.killCfgs[this.killCfgs.length - 1];

            for (let i = 0; i < this.killCfgs.length; i++) {
                let cfg = this.killCfgs[i];
                if (day < cfg.day) {
                    //展示还没超时的奖励
                    currentKillCfg = cfg;
                    scrollIndex = i;
                    isAllTimeOut = false;
                    break;
                }
            }
            this.currentKillCfg = currentKillCfg;

            if (currentKillCfg.day > 0) {
                GameTimer.ins().loop(1000, this, this.killTick);
            }
            else {
                //-1 =永久奖励 什么时候击杀都可以领取
            }
            this.killTick();

        }
        else {
            view.killTime.text = I18nManager.ins().lang(I18WorldBossKey.i18n_worldBoss_reward1, currentKillCfg.day);
        }
        this.currentKillItems = ItemUtils.parseKvArrayToItemArray(currentKillCfg.rewards);
        this.view.rewardList.numItems = this.currentKillItems.length;
        this.view.rankList.numItems = this.killCfgs.length;
        this.view.rankList.scrollToView(scrollIndex, false, true);
       
       this.alphaTick =  setTimeout(() => {
            if (this.view && this.view.rewardList)
                this.view.rewardList.alpha = 1;
        }, 100);

        this.view.visible = true;


    }
    /**开始了多少天 */
    private startDay: number = 0;
    //击杀倒计时
    private killTick(): void {
        let worldBossInfo = this.mWorldBossVo;
        let startTime = worldBossInfo.startTime;
        let diffTimeMs = G.TimeManager.serverNow - startTime;
        this.startDay = Math.floor(diffTimeMs / 86400000);

        //根据currentKillCfg.day以及开始天数来判断是否超时
        let currentKillCfg = this.currentKillCfg;
        if (currentKillCfg.day == -1) {
            //永久奖励
            this.view.killTime.text = I18nManager.ins().lang(I18WorldBossKey.i18n_worldBoss_reward1);

        }
        else {
            //计算开始了多少天


            //判断距离currentKillCfg的目标天数还有多久
            let targetTime = startTime + currentKillCfg.day * 86400000;
            let diffTime = targetTime - G.TimeManager.serverNow;
            if (diffTime > 0) {
                let timeStr = TimeUtils.formatTimeMsToDayHourMinuteText(diffTime);
                this.view.killTime.text = I18nManager.ins().lang(I18WorldBossKey.i18n_worldBoss_reward2, timeStr, this.monsterCfg?.name);
            }
            else {
                // this.updateView();

            }
        }
    }
    /**所有击杀天数 */
    private rankListRender(index: number, obj: ui.worldBoss.component.worldBossServerRewardCell): void {
        let cfg = this.killCfgs[index];
        if (cfg.day == -1) {
            //永久奖励
            obj.title.text = `超过${this.killCfgs[index - 1].day}日击杀`;
            obj.getController("state").selectedIndex = 0;
        }
        else {
            obj.title.text = I18nManager.ins().lang(I18WorldBossKey.i18n_worldBoss_skill, cfg.day);
            obj.getController("state").selectedIndex = (this.startDay >= cfg.day) ? 1 : 0;
        }

        //击杀奖励
        let rewardItems = ItemUtils.parseKvArrayToItemArray(cfg.rewards);
        obj.rewardList.itemRenderer = this.skillRewardListRender.bind(this, rewardItems);

        obj.rewardList.numItems = rewardItems.length;

    }
    /**天数对应击杀奖励 */
    private skillRewardListRender(rewardItems: NoOwnerItem[], index: number, obj: ItemFrameBtn): void {

        let item = rewardItems[index];
        // obj.img_item.icon = item.getIconPath();
        // obj.img_frame.icon = item.getQualityIconPath();
        // obj.T_num.text = `X${item.count?.toString() || "0"}`;
        obj.reset(item.itemId, item.count);
        // obj.onClick(this.onShowItemTips.bind(this, index, rewardItems));

    }


    private onShowItemTips(idx: number, rewardItems: NoOwnerItem[], e: fgui.Event) {
        let item = rewardItems[idx];
        //显示物品tips
        ShopModel.ins().showItemDetail(e.target, item.itemId, e);
    }
    /**当前挡位 */
    private currentRewardRender(index: number, obj: ItemFrameBtn): void {
        let item = this.currentKillItems[index];
        // obj.img_item.icon = item.getIconPath();
        // obj.img_frame.icon = item.getQualityIconPath();
        // obj.T_num.text = `X${item.count?.toString() || "0"}`;
        // obj.onClick(this.onShowItemTips.bind(this, index, this.currentKillItems));
        obj.reset(item.itemId, item.count);

    }

    protected onDestroy(): void {
        super.onDestroy();
        this.clearTick();
    }



}
