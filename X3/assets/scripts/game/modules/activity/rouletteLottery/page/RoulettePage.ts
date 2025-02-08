import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { ActivityRouletteLotteryVo } from "../../model/ActivityRouletteLotteryVo";
import GIns from "../../../../GIns";
import { ActivitySyncData } from "../../../../comm/activity/model/ActivityModel";
import { ItemUtils } from "../../../item/utils/ItemUtils";
import { ColorUtils } from "../../../../../core/utils/ColorUtils";
import { UIManager } from "../../../../../core/mvc/UIManager";
import { UIActivityKey } from "../../const/UIActivityConfig";
import { CommonI18nKeys } from "../../../common/i18n/CommonI18nKeys";
import { BtnConfirmViewOpenArgs } from "../../../common/confirm/BtnConfirmView";
import G from "../../../../../core/comm/G";
import { UICommonKey } from "../../../common/const/UICommonConfig";
import NotificationKey from "../../../../event/NotificationKey";
import FacadeManager from "../../../../../core/mvc/FacadeManager";
import { LotteryPoolConfigDatas } from "../../../../table/activity/rouletteLottery/LotteryPoolConfigDatas";
import { tween } from "cc";
import { TableManager } from "../../../../../core/table/TableManager";
import { EventClickItem } from "../../../item/event/EventClickItem";
import { UITransform } from "cc";
import { Tween } from "cc";

/**
 * 轮盘抽奖
 * 轮盘page
 */
@bindFguiExtension("ui://activityRouletteLottery/RoulettePage")
export class RoulettePage extends fgui.GComponent {
    static pkgName: string = "activityRouletteLottery";
    static viewName: string = "RoulettePage";
    private get view(): ui.activityRouletteLottery.RoulettePage {
        return this as any;
    }

    private _vo: ActivityRouletteLotteryVo;

    //奖励itemMap
    private _itemMap: { [key: number]: fgui.GComponent } = {};
    //选中图Map
    private _selectMap: { [key: number]: fgui.GComponent } = {};
    //奖励剩余数量TableMap
    private _leftCountMap: { [key: number]: number } = {};

    // 当前组的奖励列表
    private _bigRewardList: table.activity.Lottery.LotteryPoolConfig[];

    // 当前轮次
    private _round;

    onInit() {
        for (let i = 0; i < 9; i++) {
            let item = this.view["item" + i];
            let select = this.view["img_sel" + i];
            let leftCount = this.view["T_count" + i];
            this._itemMap[i] = item;
            this._selectMap[i] = select;
            if (leftCount) {
                this._leftCountMap[i] = leftCount;
            }
        }

        this.view.item0.on(fgui.Event.CLICK, this.openBigRewardSelect, this);
        this.view.item3.on(fgui.Event.CLICK, this.onClickItem.bind(this, 3), this);
        this.view.item6.on(fgui.Event.CLICK, this.onClickItem.bind(this, 6), this);
    }

    public setData(vo: ActivityRouletteLotteryVo) {
        this._vo = vo;
        this.updateUI();

        if (Object.keys(vo._poolGetCountMap).length <= 0) {
            this.hideBg();
        }
    }

    private updateUI() {
        if (this._vo.bigRewardIndex == null) {
            //当前选择的大奖
            this.onBigRewardClick(this._vo.roundCfg.defaultBigAwardIndex);
        }

        if (!this._bigRewardList || this._round != this._vo.round) {
            let allCfgs = this._vo.getPoolCfg(this._vo.roundCfg.poolId);
            this._bigRewardList = [];
            for (let cfg of allCfgs) {
                this._bigRewardList.push(cfg);
            }
            this._bigRewardList.sort((a, b) => {
                return a.rouletteSort - b.rouletteSort;
            });

            this._round = this._vo.round;
        }

        this._vo.bigRewardChooseCount = 0;
        for (let i = 0; i < 9; i++) {
            let item = this._itemMap[i] as any;
            let leftCount = this._leftCountMap[i] as any;

            let awardCfg = this._bigRewardList[i];
            if (!awardCfg) return;
            if (awardCfg.rewardType == "JACKPOT") {
                let bigAwardItem = this._vo.roundCfg.bigRewardArray[this._vo.bigRewardIndex];
                let itemCfg = ItemUtils.getItemConfigByItemId(bigAwardItem.k);
                item.img_item.icon = itemCfg.iconPath;
                item.T_count.text = bigAwardItem.v.toString();
            } else if (awardCfg.rewardType == "MIDDLE") {
                let itemCfg = ItemUtils.getItemConfigByItemId(awardCfg.rewards[0].k);
                item.img_item.icon = itemCfg.iconPath;
                item.T_count.text = awardCfg.rewards[0].v.toString();
            } else {
                item.item.reset(awardCfg.rewards[0].k, awardCfg.rewards[0].v);
            }
            let count = this._vo.getPoolLeftGetCount(awardCfg.id);
            //大奖计数
            if (count <= 0 && (awardCfg.rewardType == "MIDDLE" || awardCfg.rewardType == "JACKPOT")) {
                this._vo.bigRewardChooseCount++;
            }
            //奖项状态
            item.getController("c2").selectedIndex = count > 0 ? 0 : 1;
            if (leftCount) {
                leftCount.color = count > 0 ? ColorUtils.createColor("#FFF688") : ColorUtils.createColor("#FF4848");
                leftCount.text = count.toString();
            }
        }

        this.view.T_count1.color;
    }

    //选择大奖
    private onBigRewardClick(index: number) {
        //判断预选是否还有选择次数
        let count = this._vo.getBigRewardLeftChooseCount(index);
        //没有就遍历大奖，选第一个有次数的大奖
        if (count == 0) {
            let indexs = this._vo.getBigRewards();
            for (let idx of indexs) {
                if (this._vo.getBigRewardLeftChooseCount(idx) != 0) {
                    index = idx;
                }
            }
        }

        this._vo.bigRewardIndex = index;
        let syncData = {
            activityId: this._vo.activityId,
            itemId: "JACKPOT",
            hidePopWin: 1,
            otherParams: this._vo.bigRewardIndex.toString(),
        } as ActivitySyncData;
        GIns.activityModel.sendBuyGoods(syncData);
    }

    //打开选择大奖界面
    private openBigRewardSelect() {
        let awardCfg = this._bigRewardList[0];
        let count = this._vo.getPoolLeftGetCount(awardCfg.id);
        if (count <= 0) {
            GIns.floatingTextMgr.showTips("大奖已获得, 请等待下一轮");
            return;
        }

        UIManager.ins().open(UIActivityKey.RouletteLotteryChooseBigRewardWin, this._vo);
    }

    //查看道具信息
    private onClickItem(index: number, event: any) {
        let awardCfg = this._bigRewardList[index];
        const itemConfig = TableManager.getDataById(table.item.ItemConfig, awardCfg.rewards[0].k);
        if (!itemConfig) {
            console.error("ItemFrameBtn.onFguiClick0: itemConfig is null");
            return;
        }
        console.debug(`点击了道具图标button. itemId = ${itemConfig.id}`);
        if (!itemConfig) {
            return;
        }

        const itemUI = this.view.item3.node.getComponent(UITransform);

        // event 点击道具
        FacadeManager.ins().emit(NotificationKey.CLICK_ITEM, EventClickItem.create(event, itemConfig, itemUI, awardCfg.rewards[0].v));
    }

    //隐藏背景
    public hideBg() {
        let keys = Object.keys(this._selectMap);
        for (let key of keys) {
            this._selectMap[key].visible = false;
        }
    }

    //播放抽奖动画
    public onPlayDrawAnim(vo: any) {
        if (vo.activityId != this._vo.activityId) return;
        let data = vo.addition as Vo.activity.RouletteLotteryResultVo;

        this.hideBg();

        //最后一个抽到的奖励配置
        let cfg = LotteryPoolConfigDatas.ins().getConfigById(data.rewardIds[data.rewardIds.length - 1]);
        let selItem = this._selectMap[cfg.rouletteSort - 1];

        //跳过动画
        if (this._vo.skipAnimation) {
            this.onShowReward(vo);
            selItem.visible = true;
            return;
        }

        //播放动画
        //禁止点击
        G.UIManager.open(UICommonKey.TouchMaskWin);

        //选中框播放次数
        let count = 9 - cfg.rouletteSort + 18;
        Tween.stopAllByTarget(this.view);
        tween(this.view)
            .to(2, { rotation: 360 * 3 }, { easing: "circOut" })
            .call(() => {
                this.view.rotation = 0;
                // this.onShowReward(vo);
                // selItem.visible = true;
            })
            .start();

        this.animCount = 0;
        G.GameTimer.once(50, this, () => {
            this.onHighLightBg(count, vo);
        });
    }

    private animCount = 0;
    //高光背景动画
    private onHighLightBg(count: number, vo: any) {
        if (count < 0) {
            this.onShowReward(vo);
            G.UIManager.close(UICommonKey.TouchMaskWin);
            return;
        }
        let index = count - 1;

        if (this.animCount > 0) {
            let lastItem = this._selectMap[8 - ((this.animCount - 1) % 9)];
            lastItem.visible = false;
        }
        let selItem = this._selectMap[8 - (this.animCount % 9)];
        selItem.visible = true;

        this.animCount++;
        G.GameTimer.once(50 + this.animCount * 7, this, () => {
            this.onHighLightBg(index, vo);
        });
    }

    //奖励展示
    private onShowReward(vo: any) {
        //数据更新
        let data = vo.addition as Vo.activity.RouletteLotteryResultVo;
        for (let id of data.rewardIds) {
            this._vo.addPoolGetCount(id);
        }

        let rewards = [];
        if (data.takeAll) {
            G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, data.extraRewardResults);
            GIns.activityModel.sendActivity(this._vo.activityId);

            //合并两组奖励
            rewards = rewards.concat(data.extraRewardResults, vo.rewards);
        } else {
            rewards = vo.rewards;
        }
        // 这个是纯弹出
        let items = ItemUtils.convertToNoOwnerItemArrayByServerRewards(rewards);
        FacadeManager.ins().emit(NotificationKey.EVENT_GAIN_ITEM_POP_UP, items);

        //加积分
        G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, data.scoreRewardResults);

        this.updateUI();
    }

    protected onPreDispose() {
        G.GameTimer.clearAll(this);
        Tween.stopAllByTarget(this.view);
        super.onPreDispose();
    }
}
