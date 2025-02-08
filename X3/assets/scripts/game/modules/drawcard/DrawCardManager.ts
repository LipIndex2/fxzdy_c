import BaseSingleton from "../../../core/base/BaseSingleton";
import G from "../../../core/comm/G";
import ArrayUtils from "../../../core/utils/ArrayUtils";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { NoOwnerItem } from "../backpack/vo/NoOwnerItem";
import { UIItemKeys } from "../item/UIItemKeys";
import {
    IItemExchangeParam,
    ItemExchangeConfirmViewOpenArgs,
    ItemExchangeType
} from "../item/view/confirm/ItemExchangeConfirmView";
import { GoodsVo } from "../shop/vo/goodsVo";
import { DrawCardConfigManager } from "./config/DrawCardConfigManager";
import { DrawCardModel } from "./model/DrawCardModel";
import { DrawCardUtils } from "./utils/DrawCardUtils";
import { DrawCardResultViewOpenArgs } from "./view/DrawCardResultView";


/** 抽卡 */
export class DrawCardManager extends BaseSingleton {

    /** 心愿英雄id */
    private _upHeroId: number = 0;

    /** 高级招募心愿保底累计次数，达到配置次数则必定出发心愿英雄 */
    private _specialTotalGuarantee: number = 0;

    /** 是否再奖励界面点击抽奖（奖励界面点击抽奖不用再播抽奖动画） */
    public _isAwardWin: boolean = false;

    /** 是否在展示招募奖励 */
    private _isDrawCardIng: boolean;


    public set isDrawCardIng(v: boolean) {
        this._isDrawCardIng = v;
    }

    public get isDrawCardIng() {
        return this._isDrawCardIng
    }


    /** 心愿英雄id */
    public set upHeroId(v: number) {
        this._upHeroId = v;
    }

    public get upHeroId(): number {
        return this._upHeroId;
    }

    /** 高级招募累计次数 */
    public set specialTotalGuarantee(v: number) {
        this._specialTotalGuarantee = v;
    }

    public get specialTotalGuarantee() {
        return this._specialTotalGuarantee;
    }

    /** 获取对应品质的 */
    public getSpineModelId(quality: number) {
        let modelId: number = 0;
        switch (quality) {
            case 3:
                modelId = 10010042;
                break;
            case 4:
                modelId = 10010043;
                break;
            case 5:
                modelId = 10010044;
                break;
            case 6:
                modelId = 10010045;
                break;
            default:
                modelId = 10010047;
                break;
        }
        return modelId;
    }


    //抽卡展示动画
    public recNormalRecruit(data: Vo.recruit.NormalRecruitS2C, c2s: Vo.recruit.NormalRecruitC2S): void {

        // 抽多少次
        const drawCount = c2s.oneKey ? 10 : 1;

        // 扣款
        const result: Vo.recruit.NormalRecruitVo = data.content;

        // set count
        const totalNormalRecruitTimes = result.totalNormalRecruitTimes;
        let context = DrawCardModel.ins().context;

        context.setTotalDrawCardTimes(ServerEnums.RecruitType.NORMAL, totalNormalRecruitTimes);

        // 抽取结果要接入【抽卡结果展示】
        const rewardResults = result.rewardResults;
        // 后端会一发抽多个道具, 但实际配置中不会
        const finalRewards = rewardResults.toDataStream()
            .flatMap(it => it)
            .toArray();

        if (ArrayUtils.isNotEmpty(rewardResults)) {
            // 获得道具, 不弹出
            G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, finalRewards as Vo.reward.RewardResult[]);

            // 抽卡获得结果展示 UI
            const openArgs = DrawCardResultViewOpenArgs.create(DrawCardUtils.NORMAL_DRAW_CARD_POOL_ID, finalRewards, drawCount);
            G.FacadeManager.emit(NotificationKey.DRAW_CARD_GAIN_ITEMS, openArgs);
        }
    }

    /**抽卡补充道具处理*/
    public showExchangeConfirmView(type: ServerEnums.RecruitType, needItem: NoOwnerItem, okCallback: () => void): void {
        let tipContent: string = '今日不可继续购买招募券';
        const cfg = DrawCardConfigManager.getDrawCardConfigById(type);
        if (cfg == null) {
            GIns.floatingTextMgr.showTips(tipContent)
            return
        }
        if (cfg.costShopId) {
            //有配置指定的商品道具
            let goodsVo: GoodsVo = GIns.shopMgr.getGoodsById(cfg.costShopId)
            if (goodsVo) {
                let rewardItem: NoOwnerItem = NoOwnerItem.create(needItem.itemId, 0)
                let rewards: { k: any, v: any }[] = goodsVo._config.rewards
                if (rewards) {
                    for (let i = 0; i < rewards.length; i++) {
                        if (rewards[i].k == needItem.itemId) {
                            rewardItem.count += rewards[i].v
                        }
                    }
                    if (rewardItem.count > 0) {
                        let needBuyCnt: number = Math.ceil(needItem.count / rewardItem.count)
                        let costItems: NoOwnerItem[] = []
                        goodsVo._config.costItems?.forEach((value) => {
                            costItems.push(NoOwnerItem.createByConfigKv(value).multiply(needBuyCnt))
                        })
                        if (goodsVo._config.buyTimesLimit > 0) {
                            if (needBuyCnt < goodsVo._config.buyTimesLimit - goodsVo.buyTimes) {
                                //足够购买
                                this.openExchangeConfirmView(ItemExchangeType.Shop, costItems, needItem, {
                                    goodsId: goodsVo.goodsId,
                                    goodsCnt: needBuyCnt
                                }, okCallback)
                                return
                            }
                        } else {
                            //不限购
                            this.openExchangeConfirmView(ItemExchangeType.Shop, costItems, needItem, {
                                goodsId: goodsVo.goodsId,
                                goodsCnt: needBuyCnt
                            }, okCallback)
                            return
                        }
                    }
                }
            }
            //都不满足 弹出提示
            GIns.floatingTextMgr.showTips(tipContent)
            return
        }

        if (cfg.costItems2) {
            //有配置直接兑换
            let costItems: NoOwnerItem[] = []
            cfg.costItems2?.forEach((value) => {
                costItems.push(NoOwnerItem.createByConfigKv(value).multiply(needItem.count))
            })
            this.openExchangeConfirmView(ItemExchangeType.Cost, costItems, needItem, null, okCallback)
            return
        }

        //什么都没 弹出道具不足
        GIns.floatingTextMgr.showTips("道具不足");
        GIns.backpackMgr.isCanPayItem(needItem, true)
        return;
    }

    protected openExchangeConfirmView(type: ItemExchangeType,
                                      fromItem: NoOwnerItem[],
                                      toItem: NoOwnerItem,
                                      param: IItemExchangeParam = null,
                                      okCallback: () => void = null
    ): void {
        // 兑换确认
        G.UIManager.open(
            UIItemKeys.ItemExchangeConfirmView,
            ItemExchangeConfirmViewOpenArgs.create(fromItem, toItem, () => {
                if (okCallback) {
                    okCallback()
                }
            }, type, param)
        );
    }
}