import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { HangUpContext } from "db://assets/scripts/game/modules/hangup/context/HangUpContext";
import { HangUpSpeedUpResult } from "db://assets/scripts/game/modules/hangup/structs/HangUpSpeedUpResult";
import { HangUpUtils } from "db://assets/scripts/game/modules/hangup/utils/HangUpUtils";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { ReportDataType } from "../../../../core/sdk/SdkBase";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import LoginNotificationKey from "../../../../main/modules/LoginNotificationKey";
import { BattleLogicManager } from "../../../comm/battle/BattleLogicManager";
import { FightType } from "../../../comm/battle/enum/FightType";
import GIns from "../../../GIns";
import { BattleModel } from "../../battle/model/BattleModel";
import { IBattleEnterData } from "../../battle/vo/IBattleEnterData";
import { IBattleResultWinData } from "../../battle/vo/IBattleResultWinData";
import { IBattleResultVo } from "../../common/battle/structs/IBattleResultVo";
import { PrivilegeAdditionController } from "../../vip/PrivilegeAdditionController";
import { HangUpBattleResultWinV2ViewOpenArgs } from "../interface/IHangUpArgs";

/**
 * 主线关卡模块协议
 * @author GameCreator
 */
export class HangUpModel extends BaseModel {

    private _context: HangUpContext = new HangUpContext();

    /**
     * 模块标识
     */
    private MODULE = 29;

    constructor() {
        super();
        this.regist();
    }


    get context(): HangUpContext {
        return this._context;
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
        this.registerMsg(moduleId, 1, this.recLoadHangUpInfo);
        this.registerMsg(moduleId, 2, this.recDrawHangUpReward);
        this.registerMsg(moduleId, 3, this.recChallengeTrunkInstance);
        this.registerMsg(moduleId, 4, this.recDrawFastHangUpReward);
        this.registerMsg(moduleId, 5, this.recDrawInstanceReward);
        this.registerMsg(moduleId, 6, this.recStartHangUp);
        this.registerMsg(moduleId, 7, this.recFinishHangUp);
        this.registerMsg(moduleId, 8, this.recCloseHangUp);
        this.registerMsg(moduleId, 9, this.recLoadHangUpRewardInfo);
        this.registerMsg(moduleId, 10, this.recDrawHangUpAdvertReward);
        this.registerMsg(moduleId, 11, this.recDrawExtraFastHangUpReward);
        this.registerMsg(moduleId, -1, this.pushTrunkInstanceChallenge);


    }

    /*********************************协议发送*********************************/

    /**
     * 获取挂机信息
     * 模块号：29	指令号：1
     */
    public sendLoadHangUpInfo(): void {
        this.send(this.MODULE, 1);
    }

    /**
     * 领取挂机奖励
     * 模块号：29	指令号：2
     */
    public sendDrawHangUpReward(): void {
        this.send(this.MODULE, 2);
    }

    /**
     * 挑战主线关卡
     * 模块号：29	指令号：3
     */
    public sendChallengeTrunkInstance(c2s: Vo.trunkinstance.ChallengeTrunkInstanceC2S,
        isHideBattle: boolean = false
    ): void {
        // event challenge level
        if (BattleModel.ins().setEnterData({ fightType: FightType.TRUNK_INSTANCE } as IBattleEnterData)) {
            FacadeManager.ins().emit(NotificationKey.HANG_UP_CHALLENGE_LEVEL, c2s.instanceId as number)
            this.send(this.MODULE, 3, c2s, { c2s: c2s, isHideBattle: isHideBattle });
        }
    }


    /**
     * 领取快速挂机奖励
     * 模块号：29	指令号：4
     */
    public sendDrawFastHangUpReward(): void {
        this.send(this.MODULE, 4);
    }

    /**
     * 领取关卡奖励
     * 模块号：29	指令号：5
     */
    public sendDrawInstanceReward(levelId: number): boolean {
        let c2s = {
            instanceId: levelId
        } as Vo.trunkinstance.DrawInstanceRewardC2S;
        this.send(this.MODULE, 5, c2s, c2s);

        return true;
    }


    /**
     * 开始隐藏战斗
     * 模块号：29	指令号：6
     */
    public sendStartHangUp(): void {
        this.send(this.MODULE, 6);
    }

    /**
     * 结算, 后台战斗
     * 模块号：29	指令号：7
     */
    public sendFinishHangUp(): void {
        this._context.stopInBg();
        this.send(this.MODULE, 7);
    }

    /**
     * 关闭挂机托管,设置成功则挂机状态变为HangUpState.NO_HANG_UP
     * 模块号：29	指令号：8
     */
    public sendCloseHangUp(): void {
        this._context.stopInBg();
        this.send(this.MODULE, 8);
    }


    /**
     * 获取当前挂机奖励内容
     * 模块号：29	指令号：9
     */
    public sendLoadHangUpRewardInfo(): void {
        this.send(this.MODULE, 9);
    }

    /**
     * 领取快速挂机广告奖励
     * 模块号：29	指令号：10
     */
    public sendDrawHangUpAdvertReward(): void {
        this.send(this.MODULE, 10);
    }

    /**
     * 领取额外快速挂机奖励
     * 模块号：29	指令号：11
     */
    public sendDrawExtraFastHangUpReward(): void {
        this.send(this.MODULE, 11);
    }

    /*********************************协议监听*********************************/

    /**
     * 获取挂机信息
     * 模块号：29	指令号：1
     */
    @LogBusiness("获取挂机信息")
    public recLoadHangUpInfo(data: Vo.trunkinstance.LoadHangUpInfoS2C): void {
        if (data.code < 0) {
            return;
        }


    }

    /**
     * 领取挂机奖励
     * 模块号：29	指令号：2
     */
    @LogBusiness("领取挂机奖励")
    public recDrawHangUpReward(data: Vo.trunkinstance.DrawHangUpRewardS2C): void {
        if (data.code < 0) {
            return;
        }
        let content = data.content;
        if (!content) {
            console.error("后端返回内容为空")
            return;
        }
        const rewardResults = content.rewardResults;
        const trunkInstanceVo = content.trunkInstanceVo;

        this._context.resetState(trunkInstanceVo)


        // 处理奖励
        FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, rewardResults)
        FacadeManager.ins().emit(NotificationKey.HANG_UP_GAIN_IN_BG_REWARD);
    }


    /**
     * 挑战主线关卡
     * 模块号：29	指令号：3
     */
    @LogBusiness("挑战主线关卡")
    public recChallengeTrunkInstance(
        data: Vo.trunkinstance.ChallengeTrunkInstanceS2C,
        customData: {
            c2s: Vo.trunkinstance.ChallengeTrunkInstanceC2S,
            isHideBattle: boolean
        }
    ): void {
        if (data.code < 0) {
            if (customData.isHideBattle) {
                GIns.battleMgr.stopHideBattle(FightType.TRUNK_INSTANCE);
            }
            // 停止后台挂机
            this._context.getInBgCache().clear();
            return;
        }

        const levelId = customData.c2s.instanceId;
        console.debug(`挑战主线关卡成功. levelId=${levelId}`)
        // if (!customData.isHideBattle) {
        //     G.UIManager.open(HangUpUIKeys.HangUpBattleView, HangUpBattleViewOpenArgs.create(levelId));
        // }
    }

    /**
     * 领取快速挂机奖励
     * 模块号：29	指令号：4
     */
    public recDrawFastHangUpReward(data: Vo.trunkinstance.DrawFastHangUpRewardS2C): void {
        if (data.code < 0) {
            return;
        }

        let content = data.content;
        if (!content) {
            return;
        }


        this._context.addSpeedUpCount(1);

        // cost
        let costItemResults = content.costItemResults;
        if (costItemResults) {
            FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, costItemResults as Array<Vo.cost.CostItemResult>)
        }

        // rewards
        let rewardResults: Array<Vo.reward.RewardResult> = content.rewardResults;
        if (rewardResults) {
            // 弹窗
            FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, rewardResults as Array<Vo.reward.RewardResult>)
        }


        FacadeManager.ins().emit(NotificationKey.HANG_UP_SPEED_UP_COUNT_CHANGE)
    }


    /**
     * 领取关卡奖励
     * 模块号：29	指令号：5
     */
    public recDrawInstanceReward(data: Vo.trunkinstance.DrawInstanceRewardS2C,
        c2s: Vo.trunkinstance.DrawInstanceRewardC2S
    ): void {
        if (data.code < 0) {
            return;
        }

        this._context.setGainRewardLevelId(c2s.instanceId)

        // 处理奖励
        let rewards = data.content;
        FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_FLOATING_TEXT_UP, rewards as Array<Vo.reward.RewardResult>)

        FacadeManager.ins().emit(NotificationKey.HANG_UP_UPDATE_GAIN_LEVEL_ID);

        this._context.refreshRedDot();
    }

    /**
     * 开始挂机托管,设置成功则挂机状态变为HangUpState.HANG_UP_ING并更新挂机开始时间
     * 模块号：29	指令号：6
     */
    public recStartHangUp(data: Vo.trunkinstance.StartHangUpS2C): void {
        if (data.code < 0) {
            return;
        }

        console.info("[挂机] 开始后台战斗");

        const inBgCache = this._context.getInBgCache();
        const lastStartTimeMs = data.content;

        inBgCache.setState(ServerEnums.HangUpState.HANG_UP_ING);
        inBgCache.lastStartTimeMs = lastStartTimeMs;

    }

    /**
     * 【结算】完成挂机战斗,设置成功则挂机状态变为HangUpState.HANG_UP_FINISH
     * 模块号：29	指令号：7
     */
    public recFinishHangUp(data: Vo.trunkinstance.FinishHangUpS2C): void {
        if (data.code < 0) {
            return;
        }

        console.info("结算完成");
    }

    /**
     * 关闭挂机托管,设置成功则挂机状态变为HangUpState.NO_HANG_UP
     * 模块号：29	指令号：8
     */
    public recCloseHangUp(data: Vo.trunkinstance.CloseHangUpS2C): void {
        if (data.code < 0) {
            return;
        }

        console.info("关闭后台战斗");
    }

    /**
     * 获取当前挂机奖励内容
     * 模块号：29	指令号：9
     */
    public recLoadHangUpRewardInfo(data: Vo.trunkinstance.LoadHangUpRewardInfoS2C): void {
        if (data.code < 0) {
            return;
        }

        const content = data.content;

        const rewards = content.rewards;
        const dropRewardIds = content.dropRewardIds;


        const map = new Map<number, number>();
        for (let reward of rewards) {
            const itemId = reward.code;
            map.merge(itemId, reward.amount, (v1, v2) => v1 + v2);
        }
        // 0 = 随机掉落的道具
        const randomCount = dropRewardIds?.length || 0;
        const fakeItemId = HangUpUtils.getHangUpEquipDropFakeItemId();
        map.set(fakeItemId, randomCount);

        FacadeManager.ins().emit(NotificationKey.HANG_UP_GAIN_ITEM_RESULT, map);
    }

    /**
     * 领取快速挂机广告奖励
     * 模块号：29	指令号：10
     */
    public recDrawHangUpAdvertReward(data: Vo.trunkinstance.DrawHangUpAdvertRewardS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
            if (data?.content?.rewardResults) {
                FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data?.content?.rewardResults)
            }
            this.context.addFreeTimesByAd(1)
            this.emit(NotificationKey.AD_GET_REWARD_COMPLETE, ServerEnums.AdvertType.FAST_HANG_UP)
        }
    }

    /**
     * 领取额外快速挂机奖励
     * 模块号：29	指令号：11
     */
    public recDrawExtraFastHangUpReward(data: Vo.trunkinstance.DrawExtraFastHangUpRewardS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
            if (data?.content?.costItemResults) {
                FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data?.content?.costItemResults)
            }
            if (data?.content?.rewardResults) {
                FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data?.content?.rewardResults)
            }
        }
    }

    /*********************************协议推送*********************************/

    /**
     * 推送主线关卡挑战信息,TrunkInstanceChallengeVo
     * 模块号：29	指令号：-1
     */
    public pushTrunkInstanceChallenge(vo: Vo.trunkinstance.TrunkInstanceChallengeVo): void {

        this._context.handleChallengeResult(vo);


        // 通关没有奖励了
        // let rewardResults = vo.rewardResults;
        // if (rewardResults) {
        //     FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS, rewardResults as Vo.reward.RewardResult[])
        // }
        // G.FacadeManager.emit(NotificationKey.HANG_UP_LEVEL_BATTLE_RESULT, vo.win as boolean)

        let battleLogic = BattleLogicManager.ins().getNotCreate(FightType.TRUNK_INSTANCE)
        if (battleLogic && !battleLogic.isHideBattle) {
            let resultVo: IBattleResultVo = { isWin: vo.win, fightType: FightType.TEAM_INSTANCE };
            this.emit(NotificationKey.BATTLE_RESULT, resultVo);
            //非隐藏战斗才显示结算
            this.emit(NotificationKey.BATTLE_RESULT_WIN, {
                fightType: FightType.TRUNK_INSTANCE,
                exData: HangUpBattleResultWinV2ViewOpenArgs.create(
                    vo.trunkInstanceVo.hangUpInstanceId,
                    vo.win
                ),
                isWin: vo.win
            } as IBattleResultWinData);
        }

        if (vo.win) {
            this.emit(LoginNotificationKey.REPORT_DATA_TO_SDK, ReportDataType.upgradeTrunk);
        }
    }


    /********************************* Me *********************************/

    // region 我方法


    /**
     * 主线关卡登录下发信息
     * @author GameCreator
     */
    initData(initData: Vo.trunkinstance.TrunkInstanceLoginVo) {

        this._context.reset(initData);
    }

    // endregion

    isPass(levelId: number): boolean {
        return this._context.isPass(levelId);
    }

    /**
     * 获取总挂机 timeMs
     */
    getTotalHangUpTimeMs(): number {
        return this._context.getTotalHangUpTimeMs();
    }

    /**
     * 计算挂机奖励 <itemId, count>
     *     @deprecated
     */
    calcHangUpItemArray(): Array<NoOwnerItem> {
        let items: NoOwnerItem[] = this._context.calcHangUpItemArray();
        items.forEach((value) => {
            //vip加成
            let addCount = PrivilegeAdditionController.ins().getHangUpReward(value.itemId, value.count)
            value.count += addCount
        })
        return items
    }

    /**
     * 获取最大通关关卡ID
     */
    getMaxPassLevelId(): number {
        return this._context.getMaxPassLevelId();
    }

    /**
     * 是否通关任意关卡
     */
    isPassAnyLevel(): boolean {
        return this._context.isPassAnyLevel();
    }

    /**
     * 当前动画的道具
     * @returns {NoOwnerItem} 没有变化时 = null
     */
    getCurrentAnimGainItem(): NoOwnerItem | null {
        return this._context.getCurrentAnimGainItem();
    }

    /**
     * 下一关的ID
     */
    getMyNextLevelId(): number {
        return this._context.getNextLevelId();
    }

    /**
     * 下一关的ID
     */
    getCurrentLevelId(): number {
        return this._context.curChallengeLevelId;
    }

    /**
     * 是否到达最大的关卡
     */
    isReachMaxLevel(): boolean {
        return this._context.isReachMaxLevel();
    }

    /**
     * 通关某关卡
     * @param levelId
     */
    setPassLevelId(levelId: number) {
        this._context.setPassLevelId(levelId);
    }

    /**
     * 加速次数
     */
    getSpeedUpCount(): number {
        return this._context.getSpeedUpCount();
    }

    /**
     * 设置加速次数
     * @param count
     */
    setSpeedUpCount(count: number) {
        this._context.setSpeedUpCount(count);
    }

    /**
     * 是否可以加速
     */
    isCanSpeedUp(): HangUpSpeedUpResult {
        return this._context.isCanSpeedUp();
    }

    /**
     * 获取当前关卡 config
     */
    getCurrentLevelConfig(): table.trunkinstance.TrunkInstanceConfig {
        return this._context.getCurrentLevelConfig();
    }

    /**`
     * 获取当前关卡名称
     */
    getCurrentLevelIdString(): string {
        return this.getCurrentLevelConfig()?.showLevelId?.toString() || "";
    }

    /**
     * 是否当前挑战的关卡
     * @param levelId
     */
    isCurrentChallengeLevel(levelId: number) {
        return this._context.isCurrentChallengeLevel(levelId);
    }

    isHaveBigReward(levelId: number): boolean {
        return this._context.isHaveBigReward(levelId);
    }
}
