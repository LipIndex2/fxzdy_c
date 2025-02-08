import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { BaseModel } from "db://assets/scripts/core/mvc/model/BaseModel";
import { SocketManager } from "db://assets/scripts/core/net/SocketManager";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { DrawCardConfigManager } from "db://assets/scripts/game/modules/drawcard/config/DrawCardConfigManager";
import { DrawCardContext } from "db://assets/scripts/game/modules/drawcard/context/DrawCardContext";
import { EnumGainNewHeroType } from "db://assets/scripts/game/modules/drawcard/enums/EnumGainNewHeroType";
import { EventDrawCardNetResult } from "db://assets/scripts/game/modules/drawcard/event/EventDrawCardNetResult";
import { DrawCardUtils } from "db://assets/scripts/game/modules/drawcard/utils/DrawCardUtils";
import { DrawCardResultViewOpenArgs } from "db://assets/scripts/game/modules/drawcard/view/DrawCardResultView";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { DrawCardManager } from "../DrawCardManager";

/**
 * 招募模块协议
 * @author GameCreator
 */
export class DrawCardModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 28;

    // 抽卡模块上下文
    private _context: DrawCardContext = new DrawCardContext();

    constructor() {
        super();
        this.regist();
    }

    public static getModule(): number {
        return this.ins().MODULE;
    }

    /**
     * 注册所有从服务端收到的回调。
     */
    private regist(): void {
        //  注册所有的指令
        let moduleId = this.MODULE;
        this.registerMsg(moduleId, 1, this.recNormalRecruit);
        this.registerMsg(moduleId, 2, this.recSpecialRecruitSetUpHero);
        this.registerMsg(moduleId, 3, this.recSpecialRecruit);
        this.registerMsg(moduleId, 4, this.recDrawNormalRecruitProgressReward);
        this.registerMsg(moduleId, 5, this.recAwakeWeaponNormalRecruit);
        this.registerMsg(moduleId, 6, this.recAwakeWeaponSpecialRecruit);
        this.registerMsg(moduleId, 7, this.recDrawAwakeWeaponRecruitScoreReward);
        this.registerMsg(moduleId, 8, this.recGetRecruitInfo);
        this.registerMsg(moduleId, 9, this.recBuyAwakeWeaponRecruitCostItems);
        this.registerMsg(moduleId, 10, this.recAddAwakeWeaponNormalAdvertTimes);

        SocketManager.ins().setDelaySendModule(this.MODULE, 1);
        SocketManager.ins().setDelaySendModule(this.MODULE, 3);
        SocketManager.ins().setDelaySendModule(this.MODULE, 5);
        SocketManager.ins().setDelaySendModule(this.MODULE, 6);
    }

    /*********************************协议发送*********************************/

    public sendDrawByPoolAndCount(poolId: number, count: number): void {
        let isOneKey = false;
        if (count == 10) {
            isOneKey = true;
        }

        DrawCardManager.ins()._isAwardWin = true;
        // 普通卡池
        if (poolId == DrawCardUtils.NORMAL_DRAW_CARD_POOL_ID) {

            this.sendNormalRecruit({
                oneKey: isOneKey,
                advert: false,
            })
            return;
        } else if (poolId == ServerEnums.RecruitType.SPECIAL) {
            this.sendSpecialRecruit({
                oneKey: isOneKey,
            })
            return;
        }
    }

    /**
     * 普通招募
     * 模块号：28	指令号：1
     */
    public sendNormalRecruit(c2s: Vo.recruit.NormalRecruitC2S): void {
        this.send(this.MODULE, 1, c2s, c2s);
    }

    /**
     * 高级招募设置心愿英雄
     * 模块号：28	指令号：2
     */
    public sendSpecialRecruitSetUpHero(upHeroId: number): void {
        let c2s = {
            heroBaseId: upHeroId
        } as Vo.recruit.SpecialRecruitSetUpHeroC2S;
        this.send(this.MODULE, 2, c2s, c2s);
    }

    /**
     * 高级招募
     * 模块号：28	指令号：3
     */
    public sendSpecialRecruit(c2s: Vo.recruit.SpecialRecruitC2S): void {
        this.send(this.MODULE, 3, c2s, c2s);
    }

    /**
     * 领取普通招募进度奖励
     * 模块号：28	指令号：4
     */
    public sendDrawNormalRecruitProgressReward(gainProgressValue: number[]): void {
        const roundCount = this._context.getProgressRoundCount();

        // value = id
        for (let progressValue of gainProgressValue) {
            // send
            const c2s = {
                drawNormalRound: roundCount,
                drawNormalProgressId: progressValue,
            } as Vo.recruit.DrawNormalRecruitProgressRewardC2S;
            this.send(this.MODULE, 4, c2s, c2s);
        }
    }


    /**
     * 专属武器普通招募
     * 模块号：28	指令号：5
     */
    public sendAwakeWeaponNormalRecruit(c2s: Vo.recruit.AwakeWeaponNormalRecruitC2S): void {
        this.send(this.MODULE, 5, c2s, c2s);
    }

    /**
     * 专属武器高级招募
     * 模块号：28	指令号：6
     */
    public sendAwakeWeaponSpecialRecruit(c2s: Vo.recruit.AwakeWeaponSpecialRecruitC2S): void {
        this.send(this.MODULE, 6, c2s, c2s);
    }

    /**
     * 领取专属武器招募积分奖励
     * 模块号：28	指令号：7
     */
    public sendDrawAwakeWeaponRecruitScoreReward(): void {
        const c = DrawCardConfigManager.weaponScoreBoxConfig;
        const c2s = {
            rewardId: c.id,
        } as Vo.recruit.DrawAwakeWeaponRecruitScoreRewardC2S;
        this.send(this.MODULE, 7, c2s, c2s);
    }


    /**
     * 获取招募信息
     * 模块号：28	指令号：8
     */
    public sendGetRecruitInfo(): void {
        this.send(this.MODULE, 8);
    }

    /**
     * 购买专属武器招募消耗道具
     * 模块号：28	指令号：9
     */
    public sendBuyAwakeWeaponRecruitCostItems(c2s: Vo.recruit.BuyAwakeWeaponRecruitCostItemsC2S): void {
        this.send(this.MODULE, 9, c2s, c2s);
    }

    /**
     * 增加专属武器普通招募广告次数,返回成功则增加专武普通招募广告次数和免费次数各一次
     * 模块号：28	指令号：10
     */
    public sendAddAwakeWeaponNormalAdvertTimes(): void {
        this.send(this.MODULE, 10);
    }

    /*********************************协议监听*********************************/

    /**
     * 普通招募
     * 模块号：28	指令号：1
     */
    @LogBusiness("recNormalRecruit")
    public recNormalRecruit(data: Vo.recruit.NormalRecruitS2C, c2s: Vo.recruit.NormalRecruitC2S): void {
        if (data.code < 0) {
            return;
        }
        DrawCardManager.ins().isDrawCardIng = true;
        FacadeManager.ins().emit(NotificationKey.DRAW_CARD_PLAY_GET_ANIM, { data: data, c2s: c2s });
        // // 抽多少次
        // const drawCount = c2s.oneKey ? 10 : 1;

        // 扣款
        const result: Vo.recruit.NormalRecruitVo = data.content;
        const costItemResults = result.costItemResults;
        if (ArrayUtils.isNotEmpty(costItemResults)) {
            FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, costItemResults as Vo.cost.CostItemResult[]);
        }
        this._context.setNormalAdTimes(data.content.todayNormalAdvertTimes);
        this._context.refreshRedDot();
        if (c2s.advert) {
            this._context.refreshAdRedDot();
        }

    }

    /**
     * 高级招募设置心愿英雄
     * 模块号：28	指令号：2
     */
    @LogBusiness("recSpecialRecruitSetUpHero")
    public recSpecialRecruitSetUpHero(data: Vo.recruit.SpecialRecruitSetUpHeroS2C,
        c2s: Vo.recruit.SpecialRecruitSetUpHeroC2S
    ): void {
        if (data.code >= 0) {
            DrawCardManager.ins().upHeroId = c2s.heroBaseId;
            FacadeManager.ins().emit(NotificationKey.DRAW_CARD_UPDATE_HERO_INFO);
            return;
        }
    }

    /**
     * 高级招募
     * 模块号：28	指令号：3
     */
    @LogBusiness("recSpecialRecruit")
    public recSpecialRecruit(data: Vo.recruit.SpecialRecruitS2C, c2s: Vo.recruit.SpecialRecruitC2S): void {
        if (data.code < 0) {
            return;
        }
        DrawCardManager.ins().isDrawCardIng = true;
        // TODO
        // 抽多少次
        const drawCount = c2s.oneKey ? 10 : 1;

        // 扣款
        let result: Vo.recruit.SpecialRecruitVo = data.content;
        const costItemResults = result.costItemResults;
        if (ArrayUtils.isNotEmpty(costItemResults)) {
            FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, costItemResults as Vo.cost.CostItemResult[]);
        }

        // set count
        const totalSpecialRecruitTimes = result.totalSpecialRecruitTimes;
        this._context.setTotalDrawCardTimes(ServerEnums.RecruitType.SPECIAL, totalSpecialRecruitTimes);

        DrawCardManager.ins().specialTotalGuarantee = result.specialTotalGuaranteeTimes;

        // 抽取结果要接入【抽卡结果展示】
        const rewardResults = result.rewardResults;
        // 后端会一发抽多个道具, 但实际配置中不会
        const finalRewards = rewardResults.toDataStream()
            .flatMap(it => it)
            .toArray();

        if (ArrayUtils.isNotEmpty(finalRewards)) {
            // 获得道具, 不弹出
            FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, finalRewards as Vo.reward.RewardResult[]);

            // 抽卡获得结果展示 UI
            const openArgs = DrawCardResultViewOpenArgs.create(ServerEnums.RecruitType.SPECIAL, finalRewards, drawCount);
            FacadeManager.ins().emit(NotificationKey.DRAW_CARD_GAIN_ITEMS, openArgs);
        }
        this._context.refreshRedDot();
    }

    /**
     * 领取普通招募进度奖励
     * 模块号：28	指令号：4
     */
    @LogBusiness("[抽卡-进度奖励] recDrawNormalRecruitProgressReward")
    public recDrawNormalRecruitProgressReward(data: Vo.recruit.DrawNormalRecruitProgressRewardS2C,
        c2s: Vo.recruit.DrawNormalRecruitProgressRewardC2S
    ): void {
        if (data.code < 0) {
            return;
        }

        const progressId = c2s.drawNormalProgressId;
        this._context.addGainNormalProgressValue(progressId);


        const result = data.content;

        // 奖励
        const rewardResults = result.rewardResults;
        if (ArrayUtils.isNotEmpty(rewardResults)) {
            FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS, rewardResults as Vo.reward.RewardResult[]);
        }

    }


    /**
     * 专属武器普通招募
     * 模块号：28	指令号：5
     */
    public recAwakeWeaponNormalRecruit(data: Vo.recruit.AwakeWeaponNormalRecruitS2C,
        c2s: Vo.recruit.AwakeWeaponNormalRecruitC2S
    ): void {
        const drawCount = c2s.times;
        if (data.code < 0) {
            return;
        }
        const content = data.content;
        // cost
        const costItemResults = content.costItemResults;
        FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, costItemResults);

        // score
        this.context.onServerPushNormalWeaponDrawResult(content);

        // rewards
        const finalRewards = content.rewardResults?.toDataStream()
            .flatMap(it => it)
            .toArray();
        if (ArrayUtils.isEmpty(finalRewards)) {
            return;
        }

        // 获得道具, 不弹出
        FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, finalRewards as Vo.reward.RewardResult[]);
        this.emit(NotificationKey.DRAW_CARD_STATE_CHANGE);

        // 结果
        const event = new EventDrawCardNetResult();
        event.type = ServerEnums.RecruitType.AWAKE_WEAPON_NORMAL;
        event.is10 = false;
        event.drawCount = drawCount;
        event.rewards = finalRewards;

        this.emit(NotificationKey.DRAW_CARD_RESULT_ANIM, event);

        this._context.refreshRedDot();
    }

    /**
     * 专属武器高级招募
     * 模块号：28	指令号：6
     */
    public recAwakeWeaponSpecialRecruit(data: Vo.recruit.AwakeWeaponSpecialRecruitS2C,
        c2s: Vo.recruit.AwakeWeaponSpecialRecruitC2S
    ): void {
        const drawCount = c2s.times;
        if (data.code < 0) {
            return;
        }
        const content = data.content;
        // cost
        const costItemResults = content.costItemResults;
        FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, costItemResults);

        // score
        this.context.onServerPushNewWeaponDrawResult(content);

        // rewards
        const finalRewards = content.rewardResults?.toDataStream()
            .flatMap(it => it)
            .toArray();
        if (ArrayUtils.isEmpty(finalRewards)) {
            return;
        }

        // 获得道具, 不弹出
        FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, finalRewards as Vo.reward.RewardResult[]);

        this.emit(NotificationKey.DRAW_CARD_STATE_CHANGE);

        // 结果
        const event = new EventDrawCardNetResult();
        event.type = ServerEnums.RecruitType.AWAKE_WEAPON_SPECIAL;
        event.is10 = false;
        event.drawCount = drawCount;
        event.rewards = finalRewards;

        this.emit(NotificationKey.DRAW_CARD_RESULT_ANIM, event);

        this._context.refreshRedDot();
    }

    /**
     * 领取专属武器招募积分奖励
     * 模块号：28	指令号：7
     */
    public recDrawAwakeWeaponRecruitScoreReward(data: Vo.recruit.DrawAwakeWeaponRecruitScoreRewardS2C): void {
        if (data.code < 0) {
            return;
        }

        const content = data.content;


        // rewards
        const rewardResults = content.rewardResults;
        FacadeManager.ins().emit(
            NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP,
            rewardResults as Vo.reward.RewardResult[]
        );

        // 这个是纯弹出
        const items = ItemUtils.convertToNoOwnerItemArrayByServerRewards(rewardResults);
        FacadeManager.ins().emit(NotificationKey.EVENT_GAIN_ITEM_POP_UP, items);


        // score
        this.context.onWeaponScoreChange(content);


        this.emit(NotificationKey.DRAW_CARD_WEAPON_BOX_SCORE_CHANGE);

    }

    /**
     * 获取招募信息
     * 模块号：28	指令号：8
     */
    public recGetRecruitInfo(data: Vo.recruit.GetRecruitInfoS2C): void {
        if (data.code < 0) {
            return;
        }

        const info = data.content;
        this._context.reset(info);
    }

    /**
     * 购买专属武器招募消耗道具
     * 模块号：28	指令号：9
     */
    public recBuyAwakeWeaponRecruitCostItems(data: Vo.recruit.BuyAwakeWeaponRecruitCostItemsS2C): void {
        if (data.code < 0) {
            return;
        }

        const costs = data.content.costs;
        this.emitNow(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, costs);

        const rewards = data.content.rewards;
        this.emitNow(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS, rewards);


    }

    /**
     * 增加专属武器普通招募广告次数,返回成功则增加专武普通招募广告次数和免费次数各一次
     * 模块号：28	指令号：10
     */
    public recAddAwakeWeaponNormalAdvertTimes(data: Vo.recruit.AddAwakeWeaponNormalAdvertTimesS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
            this.context.addFreeTimesByAd()
            this.emit(NotificationKey.AD_GET_REWARD_COMPLETE, ServerEnums.AdvertType.WEAPON_RECRUIT);

            //广告看完了 马上自动招募
            this.sendAwakeWeaponNormalRecruit({
                times: 1,
            });
            this.context.refreshAdRedDot();
        }
    }


    /*********************************协议推送*********************************/

    @LogBusiness("[抽卡] init data")
    initData(contentElement: Vo.recruit.RecruitLoginVo) {
        this._context.init();
        this._context.reset(contentElement);

        //心愿英雄id
        DrawCardManager.ins().upHeroId = contentElement.specialGuaranteeHeroBaseId;
        DrawCardManager.ins().specialTotalGuarantee = contentElement.specialTotalGuaranteeTimes;
    }


    get context(): DrawCardContext {
        return this._context;
    }

    getDrawCardCount(type: ServerEnums.RecruitType): number {
        return this._context.getDrawCardCount(type)
    }

    /**
     * 首次获得的道具 id
     * @param itemIdArray
     */
    addFirstGainItemIdToQueue(itemIdArray: number[]) {
        if (!itemIdArray) {
            return;
        }
        this._context.addFirstGainItemIdToQueue(itemIdArray);
    }

    /**
     * 尝试展示新获得的稀有道具(英雄/武器) for 抽卡
     */
    tryShowFirstGainSpecialItem(): boolean {
        return this._context.tryShowFirstGainSpecialItem(EnumGainNewHeroType.DRAW_CARD)
    }

    /**
     * 奖励中获得了英雄
     */
    tryShowNewGainHeroByType(type: EnumGainNewHeroType): boolean {
        return this._context.tryShowFirstGainSpecialItem(type)
    }


    get skipAnimFlag(): boolean {
        return this._context.skipAnimFlag
    }

    set skipAnimFlag(flag: boolean) {
        this._context.skipAnimFlag = flag
    }

    refreshRedDot() {
        this._context.refreshRedDot();
    }
}
