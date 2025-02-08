import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import G from "db://assets/scripts/core/comm/G";
import { BackpackContext } from "db://assets/scripts/game/modules/backpack/vo/BackpackContext";
import { BackpackItemDataVo } from "db://assets/scripts/game/modules/backpack/vo/BackpackItemDataVo";
import { DataStream } from "db://assets/scripts/core/utils/DataStream";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { ItemI18nKeys } from "db://assets/scripts/game/modules/item/const/ItemI18nKeys";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { MapUtils } from "db://assets/scripts/core/utils/MapUtils";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { TableManager } from "../../../../core/table/TableManager";
import { HeroManager } from "../../hero/HeroManager";
import { DrawCardModel } from "db://assets/scripts/game/modules/drawcard/model/DrawCardModel";
import { EnumGainNewHeroType } from "db://assets/scripts/game/modules/drawcard/enums/EnumGainNewHeroType";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import { DrawCardManager } from "db://assets/scripts/game/modules/drawcard/DrawCardManager";
import { RedDotManager } from "db://assets/scripts/game/modules/common/redDot/RedDotManager";
import { ItemRedDotUtils } from "db://assets/scripts/game/modules/item/utils/ItemRedDotUtils";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { EnumClientItemType } from "../../backpack/EnumClientItemType";
import GIns from "../../../GIns";
import { IItemRewardParam } from "./vo/IItemRewardParam";

/**
 * Item 模块号及指令定义
 * @author GameCreator
 */
export class ItemModel extends BaseModel {


    /**
     * 模块标识
     */
    private MODULE = 17;

    // 背包
    private _backpackContext: BackpackContext = new BackpackContext();


    constructor() {
        super();
        this.regist();

        this.addNotification()
    }

    public static getModule(): number {
        return this.ins().MODULE;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_RECEIVE_SERVER_ITEM_CHANGE,
            NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS,
            NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP,
            NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_FLOATING_TEXT_UP,
            NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS,
            NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW,
            NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW_WITH_PARAM,
            NotificationKey.CLOSE_GET_NEW_HERO_VIEW,
        ]
    }


    notificationHandler(event: string, args?: any) {
        switch (event) {
            case NotificationKey.EVENT_RECEIVE_SERVER_ITEM_CHANGE: {
                this.handleServerItemResult(args as Vo.item.UseItemResultVo);
                break;
            }
            case NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS: {
                this.rewardClassify(args as Array<Vo.reward.RewardResult>);
                break;
            }
            case NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP: {
                this.addItemsByServer(args as Array<Vo.reward.RewardResult>, false);
                break;
            }
            case NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_FLOATING_TEXT_UP: {
                this.addItemsByServer(args as Array<Vo.reward.RewardResult>, false, true);
                break;
            }
            case NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW: {
                this.addItemsByServer(args as Array<Vo.reward.RewardResult>, true, false);
                break;
            }
            case NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW_WITH_PARAM: {
                let param: IItemRewardParam = args as IItemRewardParam
                this.addItemsByServer(param.rewards, true, false, param);
                break;
            }
            case NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS: {
                this.minusItemsByServer(args as Array<Vo.cost.CostItemResult>);
                break;
            }
            case NotificationKey.CLOSE_GET_NEW_HERO_VIEW:
                // this.showGetHeroAnim();
                break;
        }

    }

    /**
     * 注册所有从服务端收到的回调。
     */
    private regist(): void {
        // 注册所有的指令
        let moduleId = this.MODULE;
        this.registerMsg(moduleId, 1, this.recSelectMultipleBoxReward);
        this.registerMsg(moduleId, 2, this.recUseItemByBaseId);
        this.registerMsg(moduleId, 3, this.recSelectBoxReward);
        // this.registerMsg(moduleId, 4, this.recExchangeDiamonds);
        this.registerMsg(moduleId, 5, this.recSelectLimitedBoxReward);
        this.registerMsg(moduleId, 6, this.recCompound);
        this.registerMsg(moduleId, -1, this.pushItemRecover);
    }

    /*********************************协议发送*********************************/

    /**
     * 选择宝箱多个奖励
     * 模块号：17	指令号：1
     */
    public sendSelectMultipleBoxReward(c2s: Vo.item.SelectMultipleBoxRewardC2S): void {
        this.send(this.MODULE, 1, c2s);
    }

    /**
     * 根据配置使用道具 | 开固定奖励宝箱
     * 模块号：17	指令号：2
     */
    public sendUseItemByBaseId(c2s: Vo.item.UseItemByBaseIdC2S): void {
        G.Logger.net(c2s, "发起使用道具")

        this.send(this.MODULE, 2, c2s, c2s);
    }

    /**
     * 选择宝箱中的奖励
     * 模块号：17	指令号：3
     */
    public sendSelectBoxReward(c2s: Vo.item.SelectBoxRewardC2S): void {
        this.send(this.MODULE, 3, c2s);
    }

    // /**
    //  * 兑换源晶
    //  * 模块号：17	指令号：4
    //  */
    // public sendExchangeDiamonds(c2s: Vo.item.ExchangeDiamondsC2S): void {
    //     this.send(this.MODULE, 4, c2s);
    // }

    /**
     * 选择限制开放宝箱中的奖励
     * 模块号：17	指令号：5
     */
    public sendSelectLimitedBoxReward(c2s: Vo.item.SelectLimitedBoxRewardC2S): void {
        this.send(this.MODULE, 5, c2s);
    }

    /**
     * 道具碎片合成
     * 模块号：17	指令号：6
     */
    public sendCompound(c2s: Vo.item.CompoundC2S): void {
        this.send(this.MODULE, 6, c2s);
    }

    /*********************************协议监听*********************************/

    /**
     * 选择宝箱多个奖励
     * 模块号：17	指令号：1
     */
    public recSelectMultipleBoxReward(data: Vo.item.SelectMultipleBoxRewardS2C): void {
        if (data.code < 0) {
            G.Logger.printError(data, "[自选宝箱] 使用道具 error! ")
            GIns.floatingTextMgr.showTips(ItemI18nKeys.USE_ITEM_FAILURE)
            return
        }
        const resultVo = data.content;
        this.handleServerItemResult(resultVo)

        // event
        GIns.floatingTextMgr.showTips(ItemI18nKeys.USE_ITEM_SUCCESS)
    }

    /**
     * 根据配置使用道具
     * 模块号：17	指令号：2
     */
    public recUseItemByBaseId(data: Vo.item.UseItemByBaseIdS2C,
                              c2s: Vo.item.UseItemByBaseIdC2S
    ): void {
        if (data.code < 0) {
            G.Logger.printError(data, "[背包道具] 使用道具 error! ")
            GIns.floatingTextMgr.showTips(ItemI18nKeys.USE_ITEM_FAILURE)
            return
        }

        // // 扣款
        // const useItemResultVo = data.content;
        // this.handleServerItemResult(useItemResultVo);

        // G.Logger.net(useItemResultVo, "[背包道具] 使用道具成功! ")

        // const changeItemIdToCountMap = ItemUtils.getChangeItemIdsByServerResult(useItemResultVo);
        // G.FacadeManager.emit(NotificationKey.EVENT_CHANGE_ITEMS, changeItemIdToCountMap)

        if (data.content?.costItemResults?.length > 0) {
            this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content.costItemResults)
        }
        if (data.content?.rewardResults?.length > 0) {
            this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data.content?.rewardResults);
        }

        GIns.floatingTextMgr.showTips(ItemI18nKeys.USE_ITEM_SUCCESS)
    }

    /**
     * 处理服务端物品结果
     * @param useItemResultVo 使用物品结果
     * @private
     */
    private handleServerItemResult(useItemResultVo: Vo.item.UseItemResultVo) {
        // 扣
        const costItemResults = useItemResultVo.costItemResults;
        this.minusItemsByServer(costItemResults)

        // 加
        const rewardResults = useItemResultVo.rewardResults;
        this.rewardClassify(rewardResults)

        G.Logger.debug(useItemResultVo, "[背包道具] 处理服务端物品结果 ok! ")
    }

    /**
     * 选择宝箱中的奖励
     * 模块号：17	指令号：3
     */
    public recSelectBoxReward(data: Vo.item.SelectBoxRewardS2C): void {
        if (data.code < 0) {
            G.Logger.printError(data, "[背包道具] 选择宝箱中的奖励 error! ")
            return
        }

        const useItemResultVo = data.content;
        this.handleServerItemResult(useItemResultVo);

        G.Logger.net(useItemResultVo, "[背包道具] 选择宝箱中的奖励 ok! ")
    }

    // /**
    //  * 兑换源晶
    //  * 模块号：17	指令号：4
    //  */
    // public recExchangeDiamonds(data: Vo.item.ExchangeDiamondsS2C): void {
    //     if (data.code >= 0) {
    //         //TODO 在这里处理服务端返回的数据
    //     }
    // }

    /**
     * 选择限制开放宝箱中的奖励
     * 模块号：17	指令号：5
     */
    public recSelectLimitedBoxReward(data: Vo.item.SelectLimitedBoxRewardS2C): void {
        if (data.code < 0) {
            G.Logger.printError(data, "[背包道具] 选择限制开放宝箱中的奖励 error! ")
            return
        }

        const useItemResultVo = data.content;
        this.handleServerItemResult(useItemResultVo);

        G.Logger.net(useItemResultVo, "[背包道具] 选择限制开放宝箱中的奖励 ok! ")
    }

    /**
     * 道具碎片合成
     * 模块号：17	指令号：6
     */
    public recCompound(data: Vo.item.CompoundS2C): void {
        if (data.code < 0) {
            return;
        }

        const content = data.content;
        const costs = content.costs;
        FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, costs as Array<Vo.cost.CostItemResult>);
        const rewards = content.rewards;
        FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS, rewards as Array<Vo.reward.RewardResult>);

    }

    /*********************************协议推送*********************************/


    /*********************************协议推送*********************************/

    /**
     * 推送物品恢复,List<RewardResult>
     * 模块号：17	指令号：-1
     */
    public pushItemRecover(data: Array<Vo.reward.RewardResult>): void {
        // 服务端推送加道具
        this.addItemsByServer(data as Array<Vo.reward.RewardResult>, false, false);

    }


    // region 自己的方法 

    get backpackContext(): BackpackContext {
        return this._backpackContext;
    }

    refreshRedDot() {
        this._backpackContext.refreshRedDot();
    }

    addInitDataByServerWallet(loginInfoVo: Vo.account.LoginInfoVo,) {
        this._backpackContext.addInitWalletData(loginInfoVo.wallet)
    }

    addInitDataByPet(loginInfoVo: Vo.pet.PetLoginVo) {
        this._backpackContext.addInitPetData(loginInfoVo.petVos)
    }

    initData(itemInitVo: Vo.item.ItemLoginInfoVo,
    ) {
        G.Logger.net(itemInitVo, "[背包道具] 初始化玩家信息");

        this._backpackContext.init();
        this._backpackContext.addInitItemData(itemInitVo);
    }

    getItemById(itemId: number): BackpackItemDataVo | null {
        return this._backpackContext.itemArray.find(item => item.itemId === itemId);
    }

    // 获取道具数量
    getItemCountById(itemId: number): number {
        return this.getItemById(itemId)?.count || 0;
    }

    /**
     * 扣减道具 by server
     * @param costItemResults 扣除结果
     */
    minusItemsByServer(costItemResults: Array<Vo.cost.CostItemResult>) {
        if (!costItemResults) {
            return
        }
        // 合并扣减数量 (取正)
        const costItemIdToAmountMap = costItemResults.toDataStream()
            .toMap((item) => item.baseId, (item) => Math.abs(item.amount));

        // 扣减道具
        this._backpackContext.minusItems(costItemIdToAmountMap);

        // 刷新红点
        if (MapUtils.isNotEmpty(costItemIdToAmountMap)) {
            costItemIdToAmountMap.forEach((amount, itemId) => {
                const afterCount = this.getItemCountById(itemId);

                // 消耗后, 清空红点
                if (afterCount <= 0) {
                    RedDotManager.ins().setRedDot(RedDotKeys.backpackItem, false, [itemId]);
                }
            });
        }

        // event
        G.FacadeManager.emit(NotificationKey.EVENT_CHANGE_ITEMS, costItemIdToAmountMap)
    }

    /**
     * 新增物品 自动区分奖励方式
     * @ CURRENCY、INTEGRAL、RESOURCE 类型飘道具弹幕、其他的弹出恭喜获得
     */
    public rewardClassify(rewardResults: Array<Vo.reward.RewardResult>) {
        if (!rewardResults) return;
        let items: Array<Vo.reward.RewardResult> = [];
        let integrals: Array<Vo.reward.RewardResult> = [];
        for (let data of rewardResults) {
            if (data) {
                const itemId = data.baseId;
                let cfg = TableManager.getDataById(table.item.ItemConfig, itemId);
                if (cfg == null) {
                    G.Logger.error(`获得奖励, 道具id = ${itemId} 找不到配置`);
                    continue
                }
                if (cfg.type == "CURRENCY" || cfg.type == "INTEGRAL" || cfg.type == "RESOURCE") {
                    integrals.push(data);
                } else {
                    items.push(data);
                }
            }
        }
        if (items.length > 0) {
            this.addItemsByServer(items);
        }
        if (integrals.length > 0) {
            this.addItemsByServer(integrals, false, true);
        }
    }


    /**
     * 新增物品 by server
     * @param rewardResults 奖励结果
     * @param notifyFlag 是否通知弹窗 | default true
     * @param isShowFloatingText 是否显示飘字
     * @param param 来源参数
     * @private
     */
    addItemsByServer(rewardResults: Array<Vo.reward.RewardResult>,
                     notifyFlag: boolean = true,
                     isShowFloatingText: boolean = false,
                     param: IItemRewardParam = null
    ) {
        if (!rewardResults) {
            return
        }

        // 走了邮件部分的道具
        const mailPartMap = new Map<number, number>();
        // 增加道具的部分
        const addItemIdToAmountMap = new Map<number, number>();

        // 合并奖励数量 (取正)
        for (let item of rewardResults) {
            const count = item.amount;
            const itemId = item.baseId;
            if (item.mail) {
                MapUtils.merge(mailPartMap, itemId, count, (v1, v2) => v1 + v2)
            } else {
                MapUtils.merge(addItemIdToAmountMap, itemId, count, (v1, v2) => v1 + v2)
            }
        }

        if (mailPartMap.size > 0) {
            GIns.floatingTextMgr.showTips(ItemI18nKeys.GAIN_ITEMS_BUT_HAVE_MAIL)
        }


        this._backpackContext.addItems(addItemIdToAmountMap);

        // event
        G.FacadeManager.emit(NotificationKey.EVENT_CHANGE_ITEMS, addItemIdToAmountMap as Map<number, number>);

        //附带 奖励结果 列表
        G.FacadeManager.emit(NotificationKey.EVENT_CHANGE_ITEMS2, rewardResults);

        //飘字获得道具
        if (isShowFloatingText) {
            for (let item of rewardResults) {
                if (item) {
                    GIns.floatingTextMgr.showGetItem(item.baseId, item.amount);
                }
            }
        }

        // 添加道具提示
        if (addItemIdToAmountMap.size > 0) {
            if (notifyFlag) {
                const noOwnerItems = DataStream.fromMap(addItemIdToAmountMap)
                    .map((it) => NoOwnerItem.create(it.key, it.value))
                    .toArray();
                if (param) {
                    G.FacadeManager.emit(NotificationKey.EVENT_GAIN_ITEM_POP_UP_WITH_PARAM, {
                        items: noOwnerItems,
                        param: param
                    })
                } else {
                    G.FacadeManager.emit(NotificationKey.EVENT_GAIN_ITEM_POP_UP, noOwnerItems as Array<NoOwnerItem>)
                }
            }

            // 刷新红点
            addItemIdToAmountMap.forEach((amount, itemId) => {
                const isCare = ItemRedDotUtils.isCareRedDot(itemId);
                RedDotManager.ins().setRedDot(RedDotKeys.backpackItem, isCare, [itemId]);
            });
        }


        // 首次获得英雄
        const newHeroIds = [];
        for (let data of rewardResults) {
            let itemConfig = ItemUtils.getItemConfigByItemId(data.baseId);
            if (itemConfig.type == "HERO_CARD") {
                let heroVo = HeroManager.ins().getHeroVoByID(data.baseId);
                if (!heroVo.heroVoData.isActivate) {
                    newHeroIds.push(data.baseId);
                }
            }
        }

        // 首次获得英雄皮肤
        const newHeroSkinIds = [];
        for (let data of rewardResults) {
            let itemConfig = ItemUtils.getItemConfigByItemId(data.baseId);
            if (itemConfig.type == EnumClientItemType.HERO_SKIN) {
                newHeroIds.push(data.baseId);
            }
        }

        // 非抽卡下
        if (!DrawCardManager.ins().isDrawCardIng) {
            // 尝试显示获得的新英雄
            this.tryShowGainNewHero(newHeroIds);
        }

        // G.UIManager.open(UIHeroKey.HERO_SKIN_FIRST_GET_VIEW, newHeroSkinIds[0]);
    }

    //展示获得英雄动画
    public tryShowGainNewHero(newHeroIds: number[]) {
        if (ArrayUtils.isEmpty(newHeroIds)) {
            return;
        }

        // show gain hero
        DrawCardModel.ins().addFirstGainItemIdToQueue(newHeroIds);
        DrawCardModel.ins().tryShowNewGainHeroByType(EnumGainNewHeroType.REWARD);
    }


    // endregion
    getItemIdToCountMap(): Map<number, number> {
        return this._backpackContext.itemArray.toDataStream()
            .toMap((item) => item.itemId, (item) => item.count)
    }

    /**
     * 添加资源道具
     * @param arg0
     */
    @LogBusiness("[背包道具] 添加资源道具")
    addIntegralLoginData(arg0: Vo.integral.IntegralLoginVo) {
        const integralItemIdToCountMap = MapUtils.fromObject<number, number>(
            arg0.integralMap,
            (key) => Number.parseInt(key),
            (value) => Number.parseInt(value),
        );
        integralItemIdToCountMap.forEach((count, itemId) => {
            this.addItem(itemId, count)
        });
        const resourceItemIdToCountMap = MapUtils.fromObject<number, number>(
            arg0.resourceMap,
            (key) => Number.parseInt(key),
            (value) => Number.parseInt(value),
        );
        resourceItemIdToCountMap.forEach((count, itemId) => {
            this.addItem(itemId, count)
        });
    }

    // 减少道具
    public minusItems(itemBaseId: number, count: number) {
        this.minusItemsByServer([
            {
                baseId: itemBaseId,
                amount: Math.abs(count),
                contents: null
            }
        ])
    }

    // 减少道具
    public addItem(itemId: number, count: number) {
        this.addItemsByServer([
            {
                baseId: itemId,
                amount: count,
                contents: null,
                mail: false
            }
        ] as Array<Vo.reward.RewardResult>, false)
    }

    printDebugLog() {
        this._backpackContext.printDebugLog()
    }

    /**
     * 英雄碎片
     * @param loginVo
     */
    addHeroInitData(loginVo: Vo.hero.HeroLoginVo) {
        if (!loginVo) {
            return;
        }

        const array = loginVo.heroVos || [];
        this._backpackContext.addInitHeroFragmentData(array);


    }
}
