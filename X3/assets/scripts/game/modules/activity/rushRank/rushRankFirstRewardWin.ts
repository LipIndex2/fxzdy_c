import * as fgui from "fairygui-cc";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { UIActivityKey } from "../const/UIActivityConfig";
import { ActivityRushRankVo } from "../model/ActivityRushRankVo";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { ActivitySyncData } from "../../../comm/activity/model/ActivityModel";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { ItemUtils } from "../../item/utils/ItemUtils";

/**
 * 开服冲榜
 * 全服首通弹窗
 */
@bindScript(UIActivityKey.rushRankFirstRewardWin)
export class rushRankFirstRewardWin extends UICommWin {
    static pkgName: string = "rushRank";
    static viewName: string = "rushRankFirstRewardWin";
    private get view(): ui.rushRank.rushRankFirstRewardWin {
        return this._view as any;
    }

    /** 活动VO */
    private _vo: ActivityRushRankVo;

    private _tabId: number = 0;

    //排行榜类型
    private _rushRankType;
    //列表map
    private _firstPassCfgMap: { [career: string]: table.activity.RushRank.RushRankFirstPassLadderConfig[] } = {};
    //职业列表
    private _careerList: string[] = [];

    listenNotifications(): string[] {
        return [NotificationKey.ACTIVITY_UPDATE, NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ACTIVITY_UPDATE:
                if (args == this._vo.activityId) {
                    GIns.activityModel.sendActivity(this._vo.activityId);
                }
                break;
            case NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK:
                if (args == this._vo.activityId) {
                    this._vo = GIns.activityModel.getActivityVoById(args);
                    this.updateUI();
                }
                break;
        }
    }

    protected onInit(): void {
        this.view.list_reward.setVirtual();
        this.view.list_reward.itemRenderer = this.rewardItemRenderer.bind(this);
        this.view.listTab.setVirtual();
        this.view.listTab.itemRenderer = this.tabItemRenderer.bind(this);
    }

    protected onOpen(vo: ActivityRushRankVo, isReopen?: boolean): void {
        if (!vo) {
            this.closeSelf();
            return;
        }
        this._vo = vo;

        //获取最新的首通玩家头像数据
        GIns.activityModel.sendActivity(this._vo.activityId);

        this._rushRankType = ServerEnums.RushRankType[this._vo.rushRankConfig.type];
        this._firstPassCfgMap = this._vo.firstPassCfgMap;
        this._careerList = Object.keys(this._firstPassCfgMap);
        this.view.listTab.numItems = this._careerList.length;
        this.updateUI();
    }

    private updateUI() {
        if (this._rushRankType == ServerEnums.RushRankType.RUSH_LADDER) {
            this.view.getController("c1").selectedIndex = 1;
            this.view.list_reward.numItems = this._firstPassCfgMap[this._careerList[this._tabId]].length;
        } else {
            this.view.getController("c1").selectedIndex = 0;
            this.view.list_reward.numItems = this._vo.firstPassCfgs.length;
        }
    }

    private tabItemRenderer(index: number, item: ui.rushRank.component.tabBtn): void {
        let key = this._careerList[index];
        const careerType = ServerEnums.Career[key];
        item.title = ItemUtils.getCareerName(careerType);

        if (index == this._tabId) {
            this.view.listTab.selectedIndex = index;
        }

        item.clearClick();
        item.onClick(() => {
            if (index != this._tabId) {
                this._tabId = index;
                this.view.listTab.selectedIndex = index;
                this.updateUI();
            }
        });

        FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.RankActivity_tab, [this._vo.activityId, key]);
    }

    private rewardItemRenderer(index: number, item: ui.rushRank.item.firstAwardItem): void {
        let cfg;
        let data;
        if (this._rushRankType == ServerEnums.RushRankType.RUSH_LADDER) {
            let keys = Object.keys(this._vo.firstPassCfgMap);
            cfg = this._vo.firstPassCfgMap[keys[this._tabId]][index];
            data = this._vo.firstPassInfoList2(cfg.ladderId);
        } else {
            cfg = this._vo.firstPassCfgs[index];
            data = this._vo.firstPassInfoList(cfg.instanceId);
        }

        //@ts-ignore
        let itemFrameBtn = item.item as ItemFrameBtn;
        //@ts-ignore
        let itemFrameBtn2 = item.item2 as ItemFrameBtn;
        itemFrameBtn.reset(cfg.rewards[0].k, cfg.rewards[0].v);

        itemFrameBtn.clearAnim();
        if (cfg.rewards[1]) {
            itemFrameBtn2.clearAnim();
        }

        if (cfg.rewards[1]) {
            itemFrameBtn2.reset(cfg.rewards[1].k, cfg.rewards[1].v);
            item.item2.visible = true;
        } else {
            item.item2.visible = false;
        }

        item.getController("c1").selectedIndex = 0;

        //@ts-ignore
        item.avatar.reset(0, 1, 0, 0);

        if (data) {
            //已有首通
            item.T_name.text = data.playerBaseVo.name;
            item.T_time.text = TimeUtils.getTimeForYear(data.firstPassTime);
            item.getController("c1").selectedIndex = 1;
            itemFrameBtn.playEffect();
            //@ts-ignore
            item.avatar.reset(data.playerBaseVo.id, data.playerBaseVo.headIcon, data.playerBaseVo.headFrame, data.playerBaseVo.imageId);

            if (cfg.rewards[1]) {
                itemFrameBtn2.playEffect();
            }
        }

        //是否已领取
        let isGet = false;
        if (this._rushRankType == ServerEnums.RushRankType.RUSH_LADDER && this._vo.isHadGetFirstPassReward2(cfg.id)) {
            isGet = true;
        } else if (this._vo.isHadGetFirstPassReward(cfg.id)) {
            isGet = true;
        }
        if (isGet) {
            item.getController("c1").selectedIndex = 2;
            itemFrameBtn.clearAnim();
            if (cfg.rewards[1]) {
                itemFrameBtn2.clearAnim();
            }
        }
        item.T_title.text = cfg.desc;

        item.btn_get.clearClick();
        item.btn_get.onClick(() => {
            let itemId = "";
            if (this._rushRankType == ServerEnums.RushRankType.RUSH_LADDER) {
                itemId = "LADDER_FIRST_PASS:" + cfg.id;
            } else {
                itemId = "FIRST_PASS:" + cfg.id;
            }
            let syncData = {
                activityId: this._vo.activityId,
                itemId: itemId,
                hidePopWin: 2,
            } as ActivitySyncData;
            GIns.activityModel.sendDrawItemReward(syncData);
        }, this);

        FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.RankActivity_reward_item, [cfg.activityId, cfg.id]);
    }
}
