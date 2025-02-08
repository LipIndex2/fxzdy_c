import G from "db://assets/scripts/core/comm/G";
import { MyDecorator } from "db://assets/scripts/core/decorator/MyDecorator";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { Logger } from "db://assets/scripts/core/log/Logger";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { EnumUtils } from "db://assets/scripts/core/utils/EnumUtils";
import { MapEntry } from "db://assets/scripts/core/utils/MapUtils";
import { TimeUnit } from "db://assets/scripts/core/utils/TimeUnit";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { RedDotManager } from "db://assets/scripts/game/modules/common/redDot/RedDotManager";
import { HangUpConfigManager } from "db://assets/scripts/game/modules/hangup/config/HangUpConfigManager";
import { HangUpHistoryData, HangUpOneLevelData } from "db://assets/scripts/game/modules/hangup/structs/HangUpHistoryData";
import { HangUpInBgCache } from "db://assets/scripts/game/modules/hangup/structs/HangUpInBgCache";
import { HangUpSpeedUpResult } from "db://assets/scripts/game/modules/hangup/structs/HangUpSpeedUpResult";
import { HangUpUtils } from "db://assets/scripts/game/modules/hangup/utils/HangUpUtils";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { ModuleOpenManager } from "db://assets/scripts/game/modules/moduleopen/ModuleOpenManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import GIns from "../../../GIns";
import FightType = ServerEnums.FightType;
import HangUpState = ServerEnums.HangUpState;
import SystemType = ServerEnums.SystemType;
import { PrivilegeAdditionController } from "../../vip/PrivilegeAdditionController";

/**
 * n 关后的奖励提示
 */
export class HangUpNextLevelRewardTips {
    // 是否已经可以领取奖励了
    canGainRewardFlag: boolean = false;

    // 是否有奖励
    haveRewardFlag: boolean = false;

    // 多少关后获得奖励
    levelCount: number = 0;

    // 奖励关卡id
    rewardLevelId: number = 0;

    // 关卡奖励
    rewardItem: NoOwnerItem = null;
}

/**
 * 挂机奖励类型
 */
export enum EnumHangUpType {
    GOLD = 1,
    EXP = 2,
    LV_UP_ITEM = 3,
    EQUIP = 4,
    Magic = 5,
    // BOX = 1,
}

/**
 * 挂机
 */
export class HangUpContext implements INotification {
    // 后台
    private _inBgCache = new HangUpInBgCache();

    // 第一个关卡ID
    private _firstLevelId: number = -1;

    /**
     * 最大已通关关卡ID,-1表示未通关
     */
    private _maxPassLevelId: number = -1;

    // 最后一个领奖的 关卡 id
    private _gainRewardLevelId: number = -1;

    /**
     * 当前挑战的挂机关卡ID,-1表示没有挂机关卡
     */
    private _curChallengeLevelId: number = -1;

    // <挂机类型, 开始时间戳 timeMs>
    private _typeToStartTimeMsMap: Map<EnumHangUpType, number> = new Map();

    // <挂机类型, 不同关卡的挂机start-end时间戳数组>
    private _typeToHistoryLevelDataMap: Map<EnumHangUpType, HangUpHistoryData> = new Map();

    // 挂机奖励提示次数
    private __rewardAnimCount = 0;
    // 最大关卡ID
    private __maxLevelId: number = -1;

    // 今日挂机加速次数
    private _speedUpCount = 0;
    // 今日广告获得免费快速挂机次数
    private _todayAdvertGetFastHangUpFreeTimes: number = 0;

    /**
     * 动画飘道具 index
     * @private
     */
    private _animPopUpIndex = 0;
    // 老的获得奖励数量
    private _oldGainItemIdToCountMap: Map<number, number>;

    // <关卡ID, 下一关卡ID>
    private levelIdToNextLevelIdMap: Map<number, number> = new Map();

    listenNotifications(): string[] {
        return [NotificationKey.SYSTEM_NEW_DAY];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.SYSTEM_NEW_DAY: {
                this.refreshRedDot();
                break;
            }
        }
    }

    @LogBusiness("[挂机] init data")
    reset(initData: Vo.trunkinstance.TrunkInstanceLoginVo): HangUpContext {
        FacadeManager.ins().removeNotification(this);
        FacadeManager.ins().registerNotification(this);

        let initVo = initData.trunkInstanceVo;
        if (!initVo) {
            return this;
        }
        this.resetState(initVo);
        return this;
    }

    /**
     * 气泡
     */
    isShowRewardDialog(): boolean {
        // 到某一关卡
        return this._curChallengeLevelId >= HangUpConfigManager.showBoxDialogLevelId;
    }

    @MyDecorator.AntiShakeCallFunc(300)
    refreshRedDot() {
        // no open module
        if (!ModuleOpenManager.ins().isCanOpenModuleWithoutTips(SystemType.TRUNK_INSTANCE)) {
            return;
        }

        const isCanGain = this.isCanGainAnyRoadReward();
        RedDotManager.ins().setRedDot(RedDotKeys.hangUp_roadReward, isCanGain);
        const isNoSpeedUp = this._speedUpCount == 0;
        RedDotManager.ins().setRedDot(RedDotKeys.hangUp_quickGain, isNoSpeedUp);
    }

    get curChallengeLevelId(): number {
        return this._curChallengeLevelId;
    }

    /**
     * 处理挑战结果
     * @param vo
     */
    handleChallengeResult(vo: Vo.trunkinstance.TrunkInstanceChallengeVo) {
        let newState = vo.trunkInstanceVo;

        // next level
        this.resetState(newState);

        const isWin = vo.win;

        // 后台挂机
        const isInBg = this.isInBgState();
        if (isInBg) {
            const waitTimeMs = this._inBgCache.getNextChallengeWaitTimeMs(isWin);
            Logger.game(`[挂机关卡] 挑战成功. 等待 ${waitTimeMs} ms 后再次挑战`);

            if (isWin) {
                // 记录通关
                this._inBgCache.endLevelId = this._curChallengeLevelId;

                // event
                FacadeManager.ins().emit(NotificationKey.HANG_UP_IN_BG_PASS_NEW_LEVEL_ID);

                // n 秒后进行下一场战斗 | 先直接打
                GameTimer.ins().clear(this, this.challengeNextInBgBattle);
                GameTimer.ins().once(waitTimeMs, this, this.challengeNextInBgBattle);

                return;
            } else {
                // 失败次数
                const newFailCount = this._inBgCache.addFailCount();
                Logger.game(`[挂机/后台] 失败了. 当前失败次数 = ${newFailCount}`);

                // 还在后台
                if (this._inBgCache.isInBgState()) {
                    // 失败也要等待了
                    GameTimer.ins().clear(this, this.challengeNextInBgBattle);
                    GameTimer.ins().once(waitTimeMs, this, this.challengeNextInBgBattle);
                } else {
                    Logger.game("[挂机战斗] 失败次数过多. 已退出后台进入挂机结算");
                }

                return;
            }
        }
    }

    // 后台挑战下一关
    challengeNextInBgBattle() {
        Logger.game("---------------------- 后台挂机 --------------------------  ");
        GIns.battleMgr.nextHideBattle(FightType.TRUNK_INSTANCE);
        Logger.game("---------------------- /后台挂机 -------------------------  ");
    }

    /**
     * 重置挂机数据
     * @param vo
     */
    @LogBusiness("[挂机] reset state")
    resetState(vo: Vo.trunkinstance.TrunkInstanceVo) {
        if (!vo) {
            Logger.error("[挂机] 后端返回的 TrunkInstanceVo 为空");

            return;
        }
        this._gainRewardLevelId = vo.drawRewardInstanceId || -1;

        // level
        const newLevelId = vo.hangUpInstanceId;

        // set
        this._speedUpCount = vo.fastHangUpTimes;
        this._todayAdvertGetFastHangUpFreeTimes = vo.todayAdvertGetFastHangUpFreeTimes
        this._maxPassLevelId = vo.instanceId;
        this._curChallengeLevelId = newLevelId;

        // 当前关卡
        this._typeToStartTimeMsMap = new Map([
            [EnumHangUpType.GOLD, vo.hourHangUpStartTime],
            [EnumHangUpType.EXP, vo.hourHangUpStartTime],
            [EnumHangUpType.LV_UP_ITEM, vo.fixedHangUpStartTime],
            [EnumHangUpType.EQUIP, vo.equipHangUpStartTime],
        ]);

        // 历史关卡
        this._typeToHistoryLevelDataMap = [
            HangUpHistoryData.from(EnumHangUpType.GOLD, vo.hourHangUpNodes),
            HangUpHistoryData.from(EnumHangUpType.EXP, vo.hourHangUpNodes),
            HangUpHistoryData.from(EnumHangUpType.LV_UP_ITEM, vo.fixedHangUpNodes),
            HangUpHistoryData.from(EnumHangUpType.EQUIP, vo.equipHangUpNodes),
        ]
            .toDataStream()
            .toMap(
                (it) => it.type,
                (it) => it
            );

        if (vo.startHangUpInstanceId) {
            this._inBgCache.startLevelId = vo.startHangUpInstanceId;
            this._inBgCache.lastStartTimeMs = vo.lastHangUpBattleStartTime;
        }

        let allData = TableManager.getAllData(table.trunkinstance.TrunkInstanceConfig);

        allData.forEach((config) => {
            let levelId = config.id;

            let parentLevelId = config.parentLevelId;
            if (parentLevelId <= 0) {
                this._firstLevelId = levelId;
            }
            this.levelIdToNextLevelIdMap.set(parentLevelId, levelId);
            if (this.__maxLevelId < levelId) {
                this.__maxLevelId = levelId;
            }
        });

        // 挂机状态
        this._inBgCache.reset(vo);

        // event
        FacadeManager.ins().emit(NotificationKey.HANG_UP_MAX_PASS_LEVEL_ID_CHANGE);
        FacadeManager.ins().emit(NotificationKey.HANG_UP_MAX_PASS_LEVEL_ID_CHANGE2, this._maxPassLevelId);
        // 红点
        this.refreshRedDot();
    }

    /**
     * 计算获得的 item Array
     */
    calcHangUpItemArray(): Array<NoOwnerItem> {
        let serverNowMs = TimeManager.serverNow;

        // 临时最大挂机时间 | 先扣去历史
        let tempMaxHangUpTimeMs = HangUpUtils.getMaxHangUpTimeMs();

        const allGainItemIdToCountMap = new Map<number, number>();

        // 之前的关卡挂机奖励
        const oldItemIdToCountMap = new Map<number, number>();
        this._typeToHistoryLevelDataMap.forEach((historyLevelData: HangUpHistoryData, hangUpType) => {
            let levelDataArray = historyLevelData.levelDataArray;
            if (!levelDataArray) {
                return;
            }
            // 历史关卡数据
            levelDataArray
                .toDataStream()
                .map((levelData: HangUpOneLevelData) => {
                    if (tempMaxHangUpTimeMs <= 0) {
                        return null;
                    }

                    if (!levelData) {
                        return null;
                    }
                    let diffTimeMs = levelData.getDiffTimeMs();

                    const oldTempHangUpTimeMs = tempMaxHangUpTimeMs;
                    tempMaxHangUpTimeMs = Math.max(0, tempMaxHangUpTimeMs - diffTimeMs);

                    // 可用的计算时间
                    let realDiffTimeMs = oldTempHangUpTimeMs - tempMaxHangUpTimeMs;
                    if (realDiffTimeMs <= 0) {
                        return null;
                    }

                    return levelData.calculateGainItemIdToCountMap(realDiffTimeMs);
                })
                .filterNotNull()
                .forEach((it) => {
                    it.forEach((count, itemId) => {
                        oldItemIdToCountMap.merge(itemId, count, (v1, v2) => v1 + v2);
                    });
                });
        });
        // 旧的挂机时间
        oldItemIdToCountMap.forEach((count, itemId) => {
            // 合并数量
            allGainItemIdToCountMap.merge(itemId, count, (oldValue, newValue) => oldValue + newValue);
        });

        // 当前关卡挂机奖励
        const curLevelIdHangUpMap = this.getCurrentLevelHangUpItemIdToCountMap(serverNowMs, tempMaxHangUpTimeMs);
        curLevelIdHangUpMap.forEach((count, itemId) => {
            allGainItemIdToCountMap.merge(itemId, count, (oldValue, newValue) => oldValue + newValue);
        });

        // 取整
        return allGainItemIdToCountMap
            .toDataStream()
            .map((it) => NoOwnerItem.create(it.key, Math.floor(it.value)))
            .toArray();
    }

    /**
     * 获取当前关卡挂机奖励
     * @param serverNowMs
     * @param maxHangUpTimeMs 最大挂机时长
     * @private
     */
    private getCurrentLevelHangUpItemIdToCountMap(serverNowMs: number, maxHangUpTimeMs: number): Map<number, number> {
        if (maxHangUpTimeMs <= 0) {
            return new Map();
        }
        const gainItemIdToCountMap = new Map<number, number>();
        // 当前挂机关卡
        this._typeToStartTimeMsMap.forEach((startTimeMs, hangUpType) => {
            // 当前关卡
            let config = TableManager.getDataById(table.trunkinstance.TrunkInstanceConfig, this._curChallengeLevelId);
            if (!config) {
                return;
            }
            let tempDiffTimeMs = serverNowMs - startTimeMs;
            if (tempDiffTimeMs <= 0) {
                return 0;
            }

            // 有效的挂机时间 = 最大时间 - 历史挂机占用时间
            let diffTimeMs = Math.min(tempDiffTimeMs, maxHangUpTimeMs);

            let countPerSecond = HangUpUtils.getHangUpCountPerSecondByType(config, hangUpType);
            if (countPerSecond <= 0) {
                return;
            }

            const countPerMs = countPerSecond / 1000;
            // 道具数量
            let count = Math.floor(diffTimeMs * countPerMs);
            const itemId = HangUpUtils.getGainItemIdByHangUpType(config, hangUpType);

            if (count <= 0) {
                return;
            }
            if (!itemId) {
                return;
            }

            gainItemIdToCountMap.merge(itemId, count, (oldValue, newValue) => oldValue + newValue);
        });
        return gainItemIdToCountMap;
    }

    /**
     * 是否通关
     * @param levelId
     */
    isPass(levelId: number): boolean {
        return this._maxPassLevelId >= levelId;
    }

    /**
     * 是否通关下一关
     * @param levelId
     */
    isPassNextLevel(levelId: number): boolean {
        return this._maxPassLevelId > levelId;
    }

    /**
     * 获取挂机总时长
     */
    getTotalHangUpTimeMs(): number {
        if (!this.isPassAnyLevel()) {
            return 0;
        }
        // 历史关卡挂机总时长
        let maxHistoryHangUpTimeMs = this._typeToHistoryLevelDataMap
            .toDataStream()
            .map((it) => it.value.getHistoryHangUpTimeMs())
            .maxByWeightNumber((it) => it, 0);

        // 当前关卡挂机 | 选最近领取的一次时间开始正计时
        let minStartTimeMs = this._typeToStartTimeMsMap
            .toDataStream()
            .map((it) => it.value)
            .maxByWeightNumber((it) => it);
        let diffTimeMs = TimeManager.serverNow - minStartTimeMs;

        let hangUpTimeMs = diffTimeMs + maxHistoryHangUpTimeMs;
        let hangUpMaxTimeMs = HangUpUtils.getMaxHangUpTimeMs();
        return Math.min(hangUpTimeMs, hangUpMaxTimeMs);
    }

    /**
     * 可以获得部分奖励了 | 1h 是策划定的
     */
    isCanGainSomeReward(): boolean {
        const hangUpTimeMs = this.getTotalHangUpTimeMs();

        return hangUpTimeMs > TimeUnit.HOURS.toMilliseconds(1);
    }

    getMaxPassLevelId(): number {
        return this._maxPassLevelId;
    }

    /**
     * 是否有挂机关卡
     */
    isPassAnyLevel(): boolean {
        return this._maxPassLevelId > 0;
    }

    /**
     * 获得当前动画获得的道具
     */
    getCurrentAnimGainItem(): NoOwnerItem | null {
        let serverNowMs = TimeManager.serverNow;
        let maxHangUpTimeMs = HangUpUtils.getMaxHangUpTimeMs();

        let itemIdToCountMap = this.getCurrentLevelHangUpItemIdToCountMap(serverNowMs, maxHangUpTimeMs);
        if (!this._oldGainItemIdToCountMap) {
            this._oldGainItemIdToCountMap = itemIdToCountMap;

            let itemKv = itemIdToCountMap.toDataStream().first(null);
            if (!itemKv) {
                return null;
            }
            return NoOwnerItem.create(itemKv.key, itemKv.value);
        }

        let dataStream = itemIdToCountMap.toDataStream().toArray();
        let newItemKv: MapEntry<number, number> = null; // 存储找到的 itemKv

        // 从上次位置开始查找
        for (let i = this._animPopUpIndex; i < dataStream.length; i++) {
            newItemKv = dataStream[i];
            if (newItemKv) {
                // 更新索引，循环遍历
                this._animPopUpIndex = (i + 1) % dataStream.length;
                break;
            }
        }

        // 如果没有找到，重置索引
        if (!newItemKv) {
            this._animPopUpIndex = 0;
            return null;
        }

        let showItemId = newItemKv.key;
        let newCount = newItemKv.value;
        let changeCount = newCount - this._oldGainItemIdToCountMap.get(showItemId) || 0;

        // 更新旧的获得奖励数量
        this._oldGainItemIdToCountMap.set(showItemId, newCount);

        if (changeCount <= 0) {
            return null;
        }

        // 第一轮初始化不显示
        this.__rewardAnimCount++;
        if (this.__rewardAnimCount <= itemIdToCountMap.size) {
            return null;
        }
        return NoOwnerItem.create(newItemKv.key, changeCount);
    }

    /**
     * 获取下一关卡ID
     */
    getNextLevelId(): number {
        // 最后一关
        if (this._curChallengeLevelId == this.__maxLevelId) {
            return this._curChallengeLevelId;
        }
        return this.levelIdToNextLevelIdMap.get(this._curChallengeLevelId) || this._firstLevelId;
    }

    setPassLevelId(levelId: number) {
        if (levelId <= this._maxPassLevelId) {
            console.debug(`[挂机] 已经通关了，不能重复通关 levelId = ${levelId}`);
            return;
        }
        this._curChallengeLevelId = levelId;
        this._maxPassLevelId = levelId;

        FacadeManager.ins().emit(NotificationKey.HANG_UP_MAX_PASS_LEVEL_ID_CHANGE);
        FacadeManager.ins().emit(NotificationKey.HANG_UP_MAX_PASS_LEVEL_ID_CHANGE2, this._maxPassLevelId);
    }

    /**
     * 获取 N 关后的奖励提示
     */
    getBattleNextLevelRewardTips(): HangUpNextLevelRewardTips {
        let tempLevelId = this._curChallengeLevelId;
        if (tempLevelId <= 0) {
            tempLevelId = this._firstLevelId;
        }

        let count = 0;
        let rewardItem: NoOwnerItem = null;
        for (let i = 0; i < 9999; i++) {
            let nextLevelId = this.levelIdToNextLevelIdMap.get(tempLevelId);
            if (nextLevelId == null) {
                break;
            }

            tempLevelId = nextLevelId;
            count++;

            let nextLevelConfig = TableManager.getDataById(table.trunkinstance.TrunkInstanceConfig, tempLevelId);
            if (!nextLevelConfig) {
                break;
            }
            let itemKvArray = nextLevelConfig.rewards;
            let noOwnerItem = ItemUtils.parseKvArrayToOnlyOneItem(itemKvArray);
            if (!noOwnerItem) {
                continue;
            }
            rewardItem = noOwnerItem;
            break;
        }

        let rewardTips = new HangUpNextLevelRewardTips();
        rewardTips.haveRewardFlag = !!rewardItem;
        rewardTips.levelCount = count;
        rewardTips.rewardItem = rewardItem;

        return rewardTips;
    }

    /**
     * 是否可以获取任何路径奖励
     */
    isCanGainAnyRoadReward(): boolean {
        return this.getNextLevelCountRewardTips(false).canGainRewardFlag;
    }

    /**
     * N 关后的奖励提示
     * @param isOnlySeeNextLevel 只查看之后的关卡
     */
    @LogBusiness("[挂机] 获取 N 关后的奖励提示 / 之前未领取的奖励")
    getNextLevelCountRewardTips(isOnlySeeNextLevel: boolean): HangUpNextLevelRewardTips {
        // 领奖关卡
        let tempLevelId = this._curChallengeLevelId;
        if (tempLevelId <= 0) {
            tempLevelId = this._firstLevelId;
        }

        let nextRewardNeedChallengeCount = 0;

        let seeReward: NoOwnerItem = null;
        // 往右的未来
        for (let i = 0; i < 9999; i++) {
            let nextLevelId = tempLevelId;

            // 如果是第一次，则直接获取当前关卡 | TODO 又 -1 了
            // 下一关
            nextLevelId = this.levelIdToNextLevelIdMap.get(tempLevelId);
            if (nextLevelId == null) {
                break;
            }

            tempLevelId = nextLevelId;
            nextRewardNeedChallengeCount++;

            let nextLevelConfig = TableManager.getDataById(table.trunkinstance.TrunkInstanceConfig, tempLevelId);
            if (!nextLevelConfig) {
                break;
            }
            let itemKvArray = nextLevelConfig.rewards;
            let noOwnerItem = ItemUtils.parseKvArrayToOnlyOneItem(itemKvArray);
            if (!noOwnerItem) {
                continue;
            }

            seeReward = noOwnerItem;
            break;
        }

        // 是否可领取
        let isCanGainHistoryReward = false;
        let rewardLevelId = 0;
        // 左侧 | 可以拿的奖励
        if (!isOnlySeeNextLevel) {
            // 往前查找一个自己能领取奖励的关卡
            let tempLevelId = 0;
            for (let i = 0; i < 9999; i++) {
                // 从 +1 关卡开始往左
                if (i == 0) {
                    tempLevelId = HangUpConfigManager.getNextLevelId(this._curChallengeLevelId);
                }
                // 前一关 | 可能为空
                const tempConfig = TableManager.getDataById(table.trunkinstance.TrunkInstanceConfig, tempLevelId);
                if (tempConfig == null) {
                    break;
                }

                // 往左移
                tempLevelId = tempConfig.parentLevelId;
                if (tempLevelId == null) {
                    break;
                }
                const rewards = tempConfig.rewards;
                if (rewards == null) {
                    continue;
                }
                if (tempLevelId > 0) {
                    // 是否领过 ?
                    if (this._gainRewardLevelId >= tempLevelId) {
                        continue;
                    }
                }

                // 前置关卡可领取
                const curLevelId = tempConfig.id;
                isCanGainHistoryReward = this.isPass(curLevelId);
                rewardLevelId = tempLevelId;
                // 前面关卡的奖励未领取
                let noOwnerItem = ItemUtils.parseKvArrayToOnlyOneItem(rewards);
                if (!noOwnerItem) {
                    continue;
                }
                seeReward = noOwnerItem;
            }
        }

        let rewardTips = new HangUpNextLevelRewardTips();
        rewardTips.canGainRewardFlag = isCanGainHistoryReward;
        rewardTips.haveRewardFlag = !!seeReward;
        rewardTips.rewardLevelId = rewardLevelId;
        rewardTips.levelCount = nextRewardNeedChallengeCount;
        rewardTips.rewardItem = seeReward;

        return rewardTips;
    }

    // 今日挂机加速次数
    getSpeedUpCount(): number {
        return this._speedUpCount;
    }

    public addFreeTimesByAd(value: number): void {
        this._todayAdvertGetFastHangUpFreeTimes += value;
    }

    /**今日广告增加免费挂机次数*/
    public get todayAdvertGetFastHangUpFreeTimes(): number {
        return this._todayAdvertGetFastHangUpFreeTimes;
    }

    // 增加今日挂机加速次数
    addSpeedUpCount(times: number) {
        this._speedUpCount += times;

        this.refreshRedDot();
    }

    // 设置今日挂机加速次数
    setSpeedUpCount(times: number) {
        this._speedUpCount = times;

        this.refreshRedDot();
    }

    /**
     * 是否可以加速
     */
    isCanSpeedUp(): HangUpSpeedUpResult {
        const additionFreeCount = HangUpUtils.additionFreeCount;
        const maxSpeedUpHangUpCount = HangUpUtils.getMaxSpeedUpHangUpCount();
        const nextSpeedUpCount = this._speedUpCount + 1;
        let nextId = 1; //默认免费加成用第一条配置
        if (nextSpeedUpCount > additionFreeCount) {
            //代表加成免费次数用完了 开始使用配置数据
            nextId = nextSpeedUpCount - additionFreeCount;
            let allDatas = TableManager.getAllData(table.trunkinstance.TrunkInstanceFastHangUpConfig);
            let maxId = allDatas[allDatas.length - 1].id;
            nextId = Math.min(maxId, nextId);
        }
        if (nextSpeedUpCount > maxSpeedUpHangUpCount) {
            return HangUpSpeedUpResult.fail();
        }
        let config = TableManager.getDataById(table.trunkinstance.TrunkInstanceFastHangUpConfig, nextId);
        if (!config) {
            return HangUpSpeedUpResult.fail();
        }
        let costItem = ItemUtils.parseKvArrayToOnlyOneItem(config.costItems);
        let isCanSpeedUp = BackpackManager.ins().isCanPayItem(costItem);
        let errorReason = isCanSpeedUp ? "" : `加速需要消耗 ${costItem.getItemName()} x ${costItem.count}`;
        return HangUpSpeedUpResult.create(isCanSpeedUp, false, config.speedUpTimeSecond * 1000, costItem, errorReason);
    }

    /**
     * 获取当前关卡配置
     * @private
     */
    getCurrentLevelConfig(): table.trunkinstance.TrunkInstanceConfig {
        // 之前说是用下一关作为当前关卡
        // const levelId = this.getNextLevelId();

        // 当前关卡
        const levelId = this._curChallengeLevelId;
        return TableManager.getDataById(table.trunkinstance.TrunkInstanceConfig, levelId);
    }

    /**
     * 是否到达最大的关卡
     */
    isReachMaxLevel(): boolean {
        return this.__maxLevelId == this._curChallengeLevelId;
    }

    /**
     * 是否当前挑战关卡
     * @param levelId
     */
    isCurrentChallengeLevel(levelId: number): boolean {
        if (this.isReachMaxLevel()) {
            return false;
        }
        return this.getNextLevelId() == levelId;
    }

    isHaveBigReward(levelId: number): boolean {
        let config = TableManager.getDataById(table.trunkinstance.TrunkInstanceConfig, levelId);
        if (!config) {
            return false;
        }
        let rewards = config.rewards;
        return rewards != null && rewards.length > 0;
    }

    /**
     * 获取下一个获得奖励的关卡ID
     */
    getNextGainRewardLevelId(): number | null {
        let configs = TableManager.getAllData(table.trunkinstance.TrunkInstanceConfig);
        let levelId: number | null = null;
        for (let i = 0; i < configs.length; i++) {
            let config = configs[i];
            if (config.id > this._curChallengeLevelId) {
                break;
            }
            levelId = config.id;
            if (config.rewards == null) {
                continue;
            }

            // 领取过
            if (this._gainRewardLevelId >= levelId) {
                continue;
            }
            // 没达到该关卡
            if (this._curChallengeLevelId < levelId) {
                return null;
            }
            // 可以领取
            break;
        }
        // 领取过了
        if (this._gainRewardLevelId >= levelId) {
            return null;
        }
        if (levelId == HangUpConfigManager.firstLevelId) {
            return null;
        }
        return levelId;
    }

    /**
     * 设置获奖的关卡 id
     * @param levelId
     */
    setGainRewardLevelId(levelId: number) {
        this._gainRewardLevelId = levelId;
    }

    // in bg
    setInBg(isInBg: boolean) {
        if (isInBg) {
            // cache
            this._inBgCache.setInBgFirstLevel(this._curChallengeLevelId);
        } else {
            this._inBgCache.setState(HangUpState.NO_HANG_UP);
        }

        FacadeManager.ins().emit(NotificationKey.HANG_UP_IN_BG_UPDATE, isInBg);
    }

    // 是否在挂机
    isInBgState(): boolean {
        return this._inBgCache.isInBgState();
    }

    // clear 后台
    clearInBgCache() {
        this._inBgCache.clear();

        FacadeManager.ins().emit(NotificationKey.HANG_UP_IN_BG_UPDATE, false);
    }

    getInBgCache(): HangUpInBgCache {
        return this._inBgCache;
    }

    // 停止挂机战斗
    stopInBg() {
        GameTimer.ins().clear(this, this.challengeNextInBgBattle);
    }

    /**
     * 是否可以挂机后台
     */
    isCanAutoHangUpInBg(): boolean {
        return this._curChallengeLevelId >= HangUpConfigManager.canAutoChallengeLevelId;
    }

    /**
     * 是否可以自动挑战下一关
     */
    isCanAutoChallengeNextLevel(): boolean {
        return this._curChallengeLevelId >= HangUpConfigManager.autoChallengeNextOpenOnLevelId;
    }

    // 是否当前停留的关卡（通关后）
    isCurrentStayLevel(levelId: number): boolean {
        return this._curChallengeLevelId == levelId;
    }

    /**
     * 获取当前挂机每小时数量
     * @param type
     * @param hour
     */
    getCurrentHangUpCountWithHourByType(type: EnumHangUpType, hour: number): number {
        const config = this.getCurrentLevelConfig();
        return HangUpUtils.getItemCountPerHourByHangUpType(config, type, hour);
    }

    /**获取当前固定时间的挂机奖励列表*/
    public getHangUpRewards(diffTimeMs: number): { k: number, v: number }[] {
        let rewards: { k: number, v: number }[] = [];
        let cfg = G.TableManager.getDataById(table.trunkinstance.TrunkInstanceConfig, this._maxPassLevelId);
        if (cfg) {
            let allEnums: EnumHangUpType[] = EnumUtils.getAllEnumValues(EnumHangUpType);
            const gainItemIdToCountMap = new Map<number, number>();
            // 当前挂机关卡
            allEnums.forEach((hangUpType: EnumHangUpType, index: number) => {
                // 挂机类型 -> 多少秒结算一次
                let countPerSecond = HangUpUtils.getHangUpCountPerSecondByType(cfg, hangUpType);
                if (countPerSecond <= 0) {
                    return;
                }
                // 道具数量
                let count = Math.floor(diffTimeMs * countPerSecond / 1000);

                // 获得的道具 id
                const itemId = HangUpUtils.getGainItemIdByHangUpType(cfg, hangUpType)
                if (count <= 0) {
                    return;
                }
                if (!itemId) {
                    return;
                }
                gainItemIdToCountMap.merge(itemId, count, (oldValue, newValue) => oldValue + newValue)
            });
            gainItemIdToCountMap.forEach((cnt, itemId) => {
                let realCnt:number = cnt + PrivilegeAdditionController.ins().getHangUpReward(itemId, cnt);
                rewards.push({ k: itemId, v: realCnt });
            })
        }
        return rewards;
    }
}
