import * as fgui from "fairygui-cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import GIns from "../../../GIns";
import { ActivityGirlGroupVo } from "../../activity/model/ActivityGirlGroupVo";
import { UIGirlGroupKey } from "../const/UIGirlGroupKey";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { ActivitySyncData } from "../../../comm/activity/model/ActivityModel";
import NotificationKey from "../../../event/NotificationKey";
import G from "../../../../core/comm/G";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";

/**
 * 女团全服购买界面
 */
@bindScript(UIGirlGroupKey.GirlGroupAllBuyWin)
export class GirlGroupAllBuyWin extends UICommWin {
    static pkgName: string = "girlGroup";
    static viewName: string = "GirlGroupAllBuyWin";

    private get view(): ui.girlGroup.GirlGroupAllBuyWin {
        return this._view as any;
    }

    private _vo: ActivityGirlGroupVo;

    private _normalRewardCfgs: table.activity.GirlGroup.GirlGroupRewardConfig[] = [];

    listenNotifications(): string[] {
        return [
            NotificationKey.ACTIVITY_STUFF_UPDATE,
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_REQUEST_BACK,
            NotificationKey.ACTIVITY_END_REFRESH,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ACTIVITY_STUFF_UPDATE:
                if (args.activityId == this._vo.activityId) {
                    G.GameTimer.once(500, this, () => {
                        this.onReceiveData(args);
                    });
                }
                break;
            case NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK:
                if (args == this._vo.activityId) {
                    this._vo = GIns.activityModel.getActivityVoById(args);
                    this.updaateUI();
                }
                break;
            case NotificationKey.ACTIVITY_UPDATE:
            case NotificationKey.ACTIVITY_REQUEST_BACK:
                // GIns.activityModel.sendActivity(this._vo.activityId);
                break;
            case NotificationKey.ACTIVITY_END_REFRESH:
                if (args === this._vo.activityId) {
                    this.closeSelf();
                }
                break;
        }
    }

    protected onInit(): void {
        this.view.list_award.itemRenderer = this.awardItemRenderer.bind(this);

        this.view.item.on(fgui.Event.CLICK, this.onItemClick, this);
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._vo = GIns.activityModel.getActivityVoByType(ServerEnums.ActivityType.GIRL_GROUP) as ActivityGirlGroupVo;
        if (!this._vo) {
            this.closeSelf();
            return;
        }

        this.updaateUI();
    }

    private updaateUI() {
        this.view.T_num.text = this._vo.totalBuyNum.toString();

        this._normalRewardCfgs = this._vo.getNormalRewardCfgs;
        this.view.list_award.numItems = this._normalRewardCfgs.length;

        let cfg = this._vo.allPeopleRewardCfg;
        //@ts-ignore
        let item = this.view.item as ItemFrameBtn;
        item.reset(cfg.rewards[0].k, cfg.rewards[0].v);
        FguiScriptUtils.toMyScriptClass(this.view.item.redDot, RedDotCom).reset(RedDotKeys.GirlGroup_reward2_item, [cfg.id]);
        if (this._vo.getAwardStatus(cfg) == 1) {
            item.playEffect();
        } else {
            item.clearAnim();
        }
        item.setHaveGain(this._vo.getAwardStatus(cfg) == 2);
        this.view.T_name.text = cfg.name;
        let nextNum = cfg.buyGoodsNumLimit;
        this.view.T_tips1.text = `本服购买人次达${nextNum}，全服玩家可领（${this._vo.totalBuyNum}/${nextNum}）`;

        //@ts-ignore
        let itemFrameBtn = this.view.item as ItemFrameBtn;
        itemFrameBtn.isCanClick(this._vo.getAwardStatus(cfg) != 1);

        // this.view.item.clearClick();
        // this.view.item.onClick(() => {
        //     if (this._vo.getAwardStatus(cfg) == 1) {
        //         let data = {
        //             activityId: this._vo.activityId,
        //             itemId: "REWARD_" + cfg.id,
        //             hidePopWin: 2,
        //         } as ActivitySyncData;
        //         GIns.activityModel.sendDrawItemReward(data);
        //     }
        // }, this);
    }

    //礼包列表
    private awardItemRenderer(index: number, item: ui.girlGroup.item.GirlGroupBuyItem): void {
        let cfg = this._normalRewardCfgs[index];
        //@ts-ignore
        let itemFrameBtn1 = item.item as ItemFrameBtn;
        //@ts-ignore
        let itemFrameBtn2 = item.item2 as ItemFrameBtn;
        itemFrameBtn1.reset(cfg.rewards[0].k, cfg.rewards[0].v);
        itemFrameBtn2.reset(cfg.rewards[1].k, cfg.rewards[1].v);

        item.T_desc.text = cfg.name;
        item.bar.value = this._vo.totalBuyNum;
        item.bar.max = cfg.buyGoodsNumLimit;

        item.getController("c1").selectedIndex = this._vo.getAwardStatus(cfg);
        if (item.getController("c1").selectedIndex == 1) {
            itemFrameBtn1.playEffect();
            itemFrameBtn2.playEffect();
        } else {
            itemFrameBtn1.clearAnim();
            itemFrameBtn2.clearAnim();
        }

        item.btn_get.clearClick();
        item.btn_get.onClick(() => {
            let data = {
                activityId: this._vo.activityId,
                itemId: "REWARD_" + cfg.id,
                hidePopWin: 2,
            } as ActivitySyncData;
            GIns.activityModel.sendDrawItemReward(data);
            this._vo.addRewardId(cfg.id);
        }, this);
        FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.GirlGroup_reward2_item, [cfg.id]);
    }

    private onItemClick() {
        let cfg = this._vo.allPeopleRewardCfg;
        if (this._vo.getAwardStatus(cfg) == 1) {
            let data = {
                activityId: this._vo.activityId,
                itemId: "REWARD_" + cfg.id,
                hidePopWin: 2,
            } as ActivitySyncData;
            GIns.activityModel.sendDrawItemReward(data);
        }
    }

    //113 -8协议返回处理
    private onReceiveData(args: any): void {
        let vo: Vo.activity.GirlGroupPlayerVo | Vo.activity.GirlGroupBuyGoodsVo | Vo.activity.GirlGroupVisitorVo;
        switch (args.key) {
            case "PLAYER_CHARGE": //自己充值
                this.updaateUI();
                break;
            case "ENTER": //玩家进入
                break;
            case "CHARGE": //其他人充值
                this.updaateUI();
                break;
        }
    }

    protected onClose(dontDispose?: boolean): void {
        G.GameTimer.clearAll(this);
    }
}
