import G from "db://assets/scripts/core/comm/G";
import { Logger } from "db://assets/scripts/core/log/Logger";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";
import GIns from "db://assets/scripts/game/GIns";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { RedDotManager } from "db://assets/scripts/game/modules/common/redDot/RedDotManager";
import { ConditionManager } from "db://assets/scripts/game/modules/condition/ConditionManager";
import { DrawCardUIKeys } from "db://assets/scripts/game/modules/drawcard/DrawCardUIKeys";
import { DrawCardConfigManager } from "db://assets/scripts/game/modules/drawcard/config/DrawCardConfigManager";
import { EnumDrawCardTabType } from "db://assets/scripts/game/modules/drawcard/enums/EnumDrawCardTabType";
import { EnumGainNewHeroType } from "db://assets/scripts/game/modules/drawcard/enums/EnumGainNewHeroType";
import { DrawCardUtils } from "db://assets/scripts/game/modules/drawcard/utils/DrawCardUtils";
import { DrawCardFirstGetItemViewOpenArgs } from "db://assets/scripts/game/modules/drawcard/view/DrawCardFirstGetItemView";
import { HeroUtils } from "db://assets/scripts/game/modules/hero/utils/HeroUtils";
import { ItemConfigManager } from "db://assets/scripts/game/modules/item/config/ItemConfigManager";
import { ModuleOpenManager } from "db://assets/scripts/game/modules/moduleopen/ModuleOpenManager";
import { WeaponManager } from "db://assets/scripts/game/modules/weapon/WeaponManager";
import { WeaponConfigManager } from "db://assets/scripts/game/modules/weapon/config/WeaponConfigManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { ConditionUtils } from "../../condition/ConditionUtils";
import { UIHeroKey } from "../../hero/const/UIHeroConfig";
import RecruitType = ServerEnums.RecruitType;

/**抽卡相关系统开启枚举*/
export enum DrawCardAdType {
    /**
   * 普通招募广告
   */
    AD_NORMAL = 6,
    /**
    * 超武招募广告
    */
    AD_WEAPON = 7,
}

export interface IDrawCardAdUnlockData {
    /**类型*/
    type: DrawCardAdType;
    /**是否解锁*/
    isUnlock: boolean;
    /**解锁条件*/
    conditions: any[][];
}

export class DrawCardContext implements INotification {
    // <卡池类型, 抽取次数>
    private _typeToDrawCountMap = new Map<ServerEnums.RecruitType, number>();

    // 普通抽卡, 进度奖励轮次
    private _normalProgressRewardRoundCount: number = 0;
    // 当前轮次, 已经拿了的奖励 []
    private _normalHaveGainProgressIdArray: number[] = [];

    // 新获得的英雄ID数组
    private _firstGainItemIdArray: number[] = [];
    // 是否跳过动画
    skipAnimFlag: boolean = false;
    // 武器免费次数
    private _weaponFreeTimes: number = 0;
    // 武器广告次数
    private _weaponAdTimes: number = 0;
    // score
    private _weaponBoxScore: number = 0;
    // 普通招募广告次数
    private _normalAdTimes: number = 0;

    /**首充等待自动上阵的英雄id*/
    public firstChargeWaitSetUpHeroId: number = 0;

    protected _isUnlockAllAd: boolean = false;
    /**广告解锁*/
    protected _adNotificationKeys: string[] = null;
    /**广告模块开启状态*/
    protected _unlockAdMap: Map<DrawCardAdType, IDrawCardAdUnlockData> = new Map();

    init() {
        FacadeManager.ins().removeNotification(this);
        FacadeManager.ins().registerNotification(this);
        if (this._unlockAdMap.size <= 0) {
            //初始化解锁条件
            this._adNotificationKeys = [];
            for (let i: number = DrawCardAdType.AD_NORMAL; i <= DrawCardAdType.AD_WEAPON; i++) {
                let conditions: any[][] = null;
                if (i == DrawCardAdType.AD_NORMAL) {
                    //招募广告
                    conditions = this.getAdUnlockCondition('RECRUIT:NORMAL_UNLOCK_ADVERT');
                } else if (i == DrawCardAdType.AD_WEAPON) {
                    //武器广告
                    conditions = this.getAdUnlockCondition('RECRUIT:AWAKE_WEAPON_UNLOCK_ADVERT');
                }
                if (conditions?.length > 0) {
                    let notificationKeys = ConditionUtils.getConditionsNotificationKeys(conditions);
                    notificationKeys?.forEach((key) => {
                        if (this._adNotificationKeys.indexOf(key) == -1) {
                            this._adNotificationKeys.push(key);
                        }
                    })
                }
                this._unlockAdMap.set(i, {
                    type: i,
                    isUnlock: false,
                    conditions: conditions
                })
            }
        }
        if (this._adNotificationKeys?.length > 0) {
            FacadeManager.ins().registerByNames(this._adNotificationKeys, this);
        }
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.MAP_BUILDING_UNLOCK,
            NotificationKey.EVENT_CHANGE_ITEMS,
            NotificationKey.DRAW_CARD_STATE_CHANGE,
            NotificationKey.SYSTEM_NEW_DAY,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        let needRefreshRedDot: boolean = false;
        //刷新解锁数据
        if (this._isUnlockAllAd == false && this._adNotificationKeys.indexOf(eventName) != -1) {
            needRefreshRedDot = this.checkAllADUnlock();
        }

        switch (eventName) {
            case NotificationKey.DRAW_CARD_STATE_CHANGE:
            case NotificationKey.MAP_BUILDING_UNLOCK: {
                this.refreshRedDot();
                break;
            }
            case NotificationKey.EVENT_CHANGE_ITEMS: {
                this.tryRefreshRedDotByItems(args);
                break;
            }
            case NotificationKey.SYSTEM_NEW_DAY: {
                //跨天手动刷新广告次数
                this._normalAdTimes = 0;
                this._weaponAdTimes = 0;
                G.FacadeManager.emit(NotificationKey.DRAW_CARD_AD_TIMES_RESET);
                needRefreshRedDot = true;
                break;
            }
        }

        if (needRefreshRedDot) {
            this.refreshAdRedDot();
        }
    }

    protected getAdUnlockCondition(key: string): any[][] {
        let conditionCfg = G.TableManager.getDataById(table.recruit.RecruitConstantConfig, key);
        if (conditionCfg && conditionCfg.content) {
            return StringUtils.strToArr(conditionCfg.content);
        }
        return [];
    }

    protected getRecruitUnlockCondition(type: number): any[][] {
        let cfg = G.TableManager.getDataById(table.recruit.RecruitConfig, type);
        if (cfg && cfg.openCondition) {
            return cfg.openCondition.concat();
        }
        return [];
    }

    /**检测所有的开启状态 如果有改变就返回true*/
    protected checkAllADUnlock(): boolean {
        let hasChange: boolean = false;
        this._isUnlockAllAd = true;
        this._unlockAdMap.forEach((data) => {
            if (data.isUnlock == false) {
                data.isUnlock = GIns.conditionMgr.checkCondition(data.conditions);
                if (data.isUnlock) {
                    hasChange = true;
                }
            }
            if (data.isUnlock == false) {
                this._isUnlockAllAd = false;
            }
        });
        return hasChange;
    }

    public get isUnlockAdNormal(): boolean {
        return this.isUnlockAd(DrawCardAdType.AD_NORMAL);
    }

    public get isUnlockAdWeapon(): boolean {
        return this.isUnlockAd(DrawCardAdType.AD_WEAPON);
    }

    /**是否解锁*/
    public isUnlockAd(type: DrawCardAdType): boolean {
        if (this._unlockAdMap.has(type)) {
            return this._unlockAdMap.get(type).isUnlock;
        }
        return false;
    }

    // 红点
    refreshRedDot(
        careArray: ServerEnums.RecruitType[] = [
            ServerEnums.RecruitType.NORMAL,
            ServerEnums.RecruitType.SPECIAL,
            ServerEnums.RecruitType.AWAKE_WEAPON_NORMAL,
            ServerEnums.RecruitType.AWAKE_WEAPON_SPECIAL,
        ]
    ) {
        if (ArrayUtils.isEmpty(careArray)) {
            return;
        }

        if (!ModuleOpenManager.ins().isCanOpenModuleWithoutTips(ServerEnums.SystemType.RECRUIT)) {
            return;
        }

        // 清空已读
        RedDotManager.ins().removeMarkRead(RedDotKeys.drawCard_draw);

        const isCare1 = careArray.indexOf(ServerEnums.RecruitType.NORMAL) >= 0;
        if (isCare1) {
            // normal
            const isCanOpen1 = DrawCardConfigManager.isCanOpen(RecruitType.NORMAL);
            if (isCanOpen1) {
                // 次数
                const item1 = DrawCardConfigManager.getDrawCardCostItemByType(RecruitType.NORMAL);
                const cost1 = item1.multiply(10);
                const isCanPay1 = BackpackManager.ins().isCanPayItem(cost1);
                RedDotManager.ins().setRedDot(RedDotKeys.drawCard_normalHero_draw10, isCanPay1);

                // 进度奖励 | 无论月卡是否激活都红点
                const canGainScoreArray = this.getNormalProgressCanGainIdArray(false);
                const configs = DrawCardConfigManager.getNormalProgressConfigArray();
                // 进度奖励
                for (let config of configs) {
                    const needScore = config.id;
                    const isShow = canGainScoreArray.indexOf(needScore) >= 0;

                    // month card
                    if (GIns.monthCardModel.isAciveByType(ServerEnums.MonthCardType.MONTH)) {
                        RedDotManager.ins().removeMarkRead(RedDotKeys.drawCard_normalHero_progress, [needScore]);
                    }

                    // 红点
                    RedDotManager.ins().setRedDot(RedDotKeys.drawCard_normalHero_progress, isShow, [needScore]);
                }
            }
        }

        // choose hero
        const isCare2 = careArray.indexOf(ServerEnums.RecruitType.SPECIAL) >= 0;
        if (isCare2) {
            const isCanOpen2 = DrawCardConfigManager.isCanOpen(RecruitType.SPECIAL);
            if (isCanOpen2) {
                const item2 = DrawCardConfigManager.getDrawCardCostItemByType(RecruitType.SPECIAL);
                const isCanPay2 = BackpackManager.ins().isCanPayItem(item2.multiply(10));
                RedDotManager.ins().setRedDot(RedDotKeys.drawCard_chooseHero_draw10, isCanPay2);
            }
        }

        // weapon
        const isCare3 = careArray.indexOf(ServerEnums.RecruitType.AWAKE_WEAPON_NORMAL) >= 0;
        const isCare4 = careArray.indexOf(ServerEnums.RecruitType.AWAKE_WEAPON_SPECIAL) >= 0;
        if (isCare3 || isCare4) {
            const isCanOpen3 = DrawCardConfigManager.isCanOpen(RecruitType.AWAKE_WEAPON_NORMAL);
            const isCanOpen4 = DrawCardConfigManager.isCanOpen(RecruitType.AWAKE_WEAPON_SPECIAL);
            if (isCanOpen3 && isCanOpen4) {
                // weapon free
                const isFreeDrawWeapon = this._weaponFreeTimes > 0;
                RedDotManager.ins().setRedDot(RedDotKeys.drawCard_equip_free, isFreeDrawWeapon);
                // weapon high
                const itemW2 = DrawCardConfigManager.getDrawCardCostItemByType(RecruitType.AWAKE_WEAPON_SPECIAL);
                const isCanPayW2 = BackpackManager.ins().isCanPayItem(itemW2.multiply(10));
                RedDotManager.ins().setRedDot(RedDotKeys.drawCard_equip_draw10, isCanPayW2);

                // weapon box
                const isCanGainOnceWeaponBox = this.isCanGainOnceWeaponBoxReward();
                RedDotManager.ins().setRedDot(RedDotKeys.drawCard_equip_rewardBox, isCanGainOnceWeaponBox);
            }
        }
    }

    // 广告红点
    refreshAdRedDot() {
        //广告红点
        if (this.isUnlockAdNormal && DrawCardConfigManager.isCanOpen(RecruitType.NORMAL)) {
            let remainTimes = GIns.adModel.getRemainAdTimes(this._normalAdTimes, ServerEnums.AdvertType.NORMAL_RECRUIT);
            RedDotManager.ins().setRedDot(RedDotKeys.drawCard_normalHero_ad, remainTimes > 0);
        } else {
            RedDotManager.ins().setRedDot(RedDotKeys.drawCard_normalHero_ad, false);
        }

        if (this.isUnlockAdWeapon && DrawCardConfigManager.isCanOpen(RecruitType.AWAKE_WEAPON_NORMAL)) {
            let remainTimes = GIns.adModel.getRemainAdTimes(this._weaponAdTimes, ServerEnums.AdvertType.WEAPON_RECRUIT);
            RedDotManager.ins().setRedDot(RedDotKeys.drawCard_equip_ad, remainTimes > 0);
        } else {
            RedDotManager.ins().setRedDot(RedDotKeys.drawCard_equip_ad, false);
        }
    }

    reset(data: Vo.recruit.RecruitLoginVo) {
        this._typeToDrawCountMap = new Map<ServerEnums.RecruitType, number>([
            [ServerEnums.RecruitType.NORMAL, data.totalNormalRecruitTimes],
            [ServerEnums.RecruitType.SPECIAL, data.specialTotalGuaranteeTimes],
        ]);

        this._normalProgressRewardRoundCount = data.normalProgressCurrentRound || 1;
        this._normalHaveGainProgressIdArray = data.normalCurrentRoundProgressIds || [];
        this._normalAdTimes = data.todayNormalAdvertTimes;

        // 武器
        this._weaponFreeTimes = data.awakeWeaponNormalRecruitFreeTimes;
        this._weaponAdTimes = data.todayGetAwakeWeaponNormalAdvertTimes;
        this._weaponBoxScore = data.awakeWeaponRecruitScore;

        this.tryRefreshNormalProgressRewards();

        this.checkAllADUnlock();
    }

    /**广告增加免费次数*/
    addFreeTimesByAd(times: number = 1): void {
        this._weaponFreeTimes++;
        this._weaponAdTimes++;
    }

    getDrawCardCount(type: ServerEnums.RecruitType): number {
        return this._typeToDrawCountMap.get(type) || 0;
    }

    setTotalDrawCardTimes(type: ServerEnums.RecruitType, totalNormalRecruitTimes: number) {
        this._typeToDrawCountMap.set(type, totalNormalRecruitTimes);

        // red
        this.refreshRedDot([type]);
    }

    /**
     * 记录抽到的新英雄id
     * @param newFirstGainItemIdArray
     */
    addFirstGainItemIdToQueue(newFirstGainItemIdArray: number[]) {
        if (!newFirstGainItemIdArray) {
            return;
        }

        // TODO 英雄碎片要特殊处理, 转为英雄

        // first
        let ItemType = ServerEnums.ItemType;
        this._firstGainItemIdArray = [...this._firstGainItemIdArray, ...newFirstGainItemIdArray].filter((it) => {
            const itemConfig = ItemConfigManager.getItemConfigByItemId(it);
            if (!itemConfig) {
                return false;
            }
            const itemType = ItemType[itemConfig.type];

            // hero 一定是新获取的
            // weapon
            if (itemType == ItemType.AWAKE_WEAPON) {
                return !WeaponManager.ins().isHaveWeaponByItemId(it);
            }
            if (itemType == ItemType.HERO_SKIN) {
                return true;
            }
            if (itemType == ItemType.PET_CARD) {
                return true;
            }
            if (itemType == ItemType.COLLECTIBLES_CARD) {
                return true;
            }
            return itemType == ItemType.HERO_CARD;
        });

        if (ArrayUtils.isNotEmpty(this._firstGainItemIdArray)) {
            console.info("首次获得的特殊道具. array = ", this._firstGainItemIdArray);
        }
    }

    /**
     * 尝试显示新获得的英雄界面
     */
    tryShowFirstGainSpecialItem(type: EnumGainNewHeroType): boolean {
        if (this._firstGainItemIdArray.length <= 0) {
            return false;
        }

        const itemId = this._firstGainItemIdArray.shift();

        if (type == EnumGainNewHeroType.DRAW_CARD) {
            // 如果跳过抽卡动画, 不会有任何弹出
            // if (this.skipAnimFlag) {
            //     this._firstGainItemIdArray = [];
            //     return false;
            // }
        }

        // hero
        const config = HeroUtils.getHeroConfigById(itemId);
        if (config) {
            GameTimer.ins().once(1, this, () => {
                G.UIManager.open(DrawCardUIKeys.DrawCardFirstGetItemView, DrawCardFirstGetItemViewOpenArgs.create(itemId, type));
            });
        }

        // weapon
        const configW = WeaponConfigManager.getConfigById(itemId);
        if (configW) {
            GameTimer.ins().once(1, this, () => {
                G.UIManager.open(DrawCardUIKeys.DrawCardFirstGetItemView, DrawCardFirstGetItemViewOpenArgs.create(itemId, type));
            });
        }

        // 星灵
        const petCfg = G.TableManager.getDataById(table.pet.PetConfig, itemId);
        if (petCfg) {
            GameTimer.ins().once(1, this, () => {
                G.UIManager.open(DrawCardUIKeys.DrawCardFirstGetItemView, DrawCardFirstGetItemViewOpenArgs.create(itemId, type));
            });
        }

        //收藏品
        const collectionCfg = G.TableManager.getDataById(table.collectibles.CollectiblesConfig, itemId);
        if (collectionCfg) {
            GameTimer.ins().once(1, this, () => {
                G.UIManager.open(DrawCardUIKeys.DrawCardFirstGetItemView, DrawCardFirstGetItemViewOpenArgs.create(itemId, type));
            });
        }

        // skin
        const configSkin = HeroUtils.getHeroSkinConfigById(itemId);
        if (configSkin) {
            GameTimer.ins().once(1, this, () => {
                G.UIManager.open(UIHeroKey.HERO_SKIN_FIRST_GET_VIEW, itemId);
                GIns.heroMgr.setSkinAttrsMap(itemId);
            });
        }

        return true;
    }

    /**
     * 普通进度可领取的 id
     */
    getNormalProgressCanGainIdArray(isCheckMonthCard: boolean): number[] {
        if (isCheckMonthCard) {
            if (!GIns.monthCardModel.isAciveByType(ServerEnums.MonthCardType.MONTH)) {
                return [];
            }
        }

        // 这个类型的进度奖励
        const typeNormal = ServerEnums.RecruitType.NORMAL;
        const configs: table.recruit.NormalRecruitProgressConfig[] = DrawCardConfigManager.getNormalProgressConfigArray();
        if (!configs) {
            return [];
        }

        // 一轮最大积分
        const maxCount = DrawCardUtils.getProgressMaxCount(typeNormal);
        const haveDrawCount = this._typeToDrawCountMap.get(typeNormal) || 0;

        const isReachMaxRound = this._normalProgressRewardRoundCount * maxCount <= haveDrawCount;

        // 进度值的抽奖次数
        const canGainProgressIdArray = [];
        for (let config of configs) {
            const progressValue = config.id;

            if (haveDrawCount <= 0) {
                continue;
            }

            // 这一轮内的积分
            let innerScore = haveDrawCount % maxCount;
            // 如果积分已经超过了这一轮
            if (isReachMaxRound) {
                innerScore = maxCount;
            }

            // 进度值不够
            if (progressValue > innerScore) {
                break;
            }

            // 已经领取过
            if (this._normalHaveGainProgressIdArray.contains(progressValue)) {
                continue;
            }

            // 可领取的进度
            canGainProgressIdArray.push(progressValue);
        }

        // 领取奖励
        return canGainProgressIdArray;
    }

    /**
     * 设置已经获得的进度值
     * @param type
     * @param progressId
     */
    addGainNormalProgressValue(progressId: number) {
        Logger.debug(`抽卡进度, 后端 add new progressId=${progressId}`);

        // 添加新进度
        if (!this._normalHaveGainProgressIdArray.contains(progressId)) {
            this._normalHaveGainProgressIdArray.push(progressId);
            Logger.game(`领取成功进度奖励. progressId = ${progressId}`);
        }

        this.tryRefreshNormalProgressRewards();

        // red
        this.refreshRedDot([ServerEnums.RecruitType.NORMAL]);
    }

    private tryRefreshNormalProgressRewards() {
        if (this._normalHaveGainProgressIdArray.length >= 4) {
            this._normalHaveGainProgressIdArray = [];
            this._normalProgressRewardRoundCount += 1;

            Logger.game(`[抽卡] 所有奖励领取完, 进入下一个轮次. round = ${this._normalProgressRewardRoundCount}`);
        }
    }

    // normal lv
    onServerPushNormalWeaponDrawResult(vo: Vo.recruit.AwakeWeaponNormalRecruitVo) {
        this._typeToDrawCountMap.set(ServerEnums.RecruitType.AWAKE_WEAPON_NORMAL, vo.totalAwakeWeaponNormalRecruitTimes);

        // free
        this._weaponFreeTimes = vo.awakeWeaponNormalRecruitFreeTimes || 0;
        // score
        this._weaponBoxScore = vo.awakeWeaponRecruitScore || 0;
    }

    // high lv
    onServerPushNewWeaponDrawResult(vo: Vo.recruit.AwakeWeaponSpecialRecruitVo) {
        this._typeToDrawCountMap.set(ServerEnums.RecruitType.AWAKE_WEAPON_SPECIAL, vo.totalAwakeWeaponSpecialRecruitTimes);

        // score
        this._weaponBoxScore = vo.awakeWeaponRecruitScore || 0;
    }

    // score
    onWeaponScoreChange(vo: Vo.recruit.AwakeWeaponRecruitScoreRewardVo) {
        // score
        this._weaponBoxScore = vo.awakeWeaponRecruitScore || 0;

        console.info(`武器箱子积分 = ${this._weaponBoxScore}`);

        this.refreshRedDot();
    }

    /**
     * 武器有免费次数
     */
    isHaveWeaponFreeDrawCount(): boolean {
        return this._weaponFreeTimes >= 1;
    }

    /**武器广告播放次数*/
    get weaponAdDrawCount(): number {
        return this._weaponAdTimes;
    }

    /**普通招募广告次数*/
    get normalAdTimes(): number {
        return this._normalAdTimes;
    }

    setNormalAdTimes(value: number): void {
        this._normalAdTimes = value;
    }

    /**
     * 是否可以领取一次奖励
     */
    isCanGainOnceWeaponBoxReward(): boolean {
        const weaponScoreConfig = DrawCardConfigManager.weaponScoreBoxConfig;
        return this._weaponBoxScore >= weaponScoreConfig.score;
    }

    // 武器积分
    getWeaponBoxScore(): number {
        return this._weaponBoxScore;
    }

    // 是否只有1抽 ? 单发特殊的逻辑
    isJustHave1DrawItem(type: ServerEnums.RecruitType) {
        const itemId = DrawCardConfigManager.getDrawCardCostItemIdByType(type);
        return BackpackManager.ins().getItemCountByItemId(itemId) == 1;
    }

    // 是否能10连抽
    isCanDraw10(type: ServerEnums.RecruitType): boolean {
        const itemId = DrawCardConfigManager.getDrawCardCostItemIdByType(type);
        return BackpackManager.ins().getItemCountByItemId(itemId) >= 10;
    }

    // 是否能10连抽
    isCanDraw(type: ServerEnums.RecruitType, cnt: number = 1): boolean {
        const itemId = DrawCardConfigManager.getDrawCardCostItemIdByType(type);
        return BackpackManager.ins().getItemCountByItemId(itemId) >= cnt;
    }

    isCanSkipAnim(tabType: EnumDrawCardTabType) {
        if (tabType == EnumDrawCardTabType.WEAPON) {
            const count1 = this._typeToDrawCountMap.getOrDefault(RecruitType.AWAKE_WEAPON_NORMAL, 0);
            const count2 = this._typeToDrawCountMap.getOrDefault(RecruitType.AWAKE_WEAPON_SPECIAL, 0);
            const totalCount = count1 + count2;
            return totalCount >= DrawCardConfigManager.weaponSkipAnimNeedDrawCount;
        }
        return true;
    }

    // 设置是否可以跳过
    setIsSkipAnim(isCanSkip: boolean) {
        this.skipAnimFlag = isCanSkip;
    }

    // 剩余多少抽保底
    getRestEnsureTimes(type: ServerEnums.RecruitType): number {
        const curDrawCount = this._typeToDrawCountMap.getOrDefault(type, 0);
        const maxCount = DrawCardConfigManager.ensureNeedDrawCount;
        if (curDrawCount > 0) {
            // 差多少抽
            return maxCount - (curDrawCount % maxCount);
        }
        return maxCount;
    }

    // 刷新红点
    tryRefreshRedDotByItems(itemIdToCountMap: Map<number, number>) {
        const item1 = DrawCardConfigManager.getDrawCardCostItemByType(RecruitType.NORMAL);
        const item2 = DrawCardConfigManager.getDrawCardCostItemByType(RecruitType.SPECIAL);
        const item3 = DrawCardConfigManager.getDrawCardCostItemByType(RecruitType.AWAKE_WEAPON_NORMAL);
        const item4 = DrawCardConfigManager.getDrawCardCostItemByType(RecruitType.AWAKE_WEAPON_SPECIAL);

        const isIn1 = item1.isInChangeMapAndIsAdd(itemIdToCountMap);
        const isIn2 = item2.isInChangeMapAndIsAdd(itemIdToCountMap);
        const isIn3 = item3.isInChangeMapAndIsAdd(itemIdToCountMap);
        const isIn4 = item4.isInChangeMapAndIsAdd(itemIdToCountMap);

        const changeArray: ServerEnums.RecruitType[] = [];
        if (isIn1) {
            changeArray.push(ServerEnums.RecruitType.NORMAL);
        }
        if (isIn2) {
            changeArray.push(ServerEnums.RecruitType.SPECIAL);
        }
        if (isIn3) {
            changeArray.push(ServerEnums.RecruitType.AWAKE_WEAPON_NORMAL);
        }
        if (isIn4) {
            changeArray.push(ServerEnums.RecruitType.AWAKE_WEAPON_SPECIAL);
        }

        if (ArrayUtils.isEmpty(changeArray)) {
            return;
        }

        this.refreshRedDot(changeArray);
    }

    /**
     * 可以看到的 tab
     */
    getCanSeeTabArray(): EnumDrawCardTabType[] {
        const array = [];

        const isOk1 = ConditionManager.ins().checkCondition(DrawCardConfigManager.getDrawCardConfigById(ServerEnums.RecruitType.NORMAL)?.openCondition);
        if (isOk1) {
            array.push(EnumDrawCardTabType.NORMAL);
        }

        const isOk2 = ConditionManager.ins().checkCondition(DrawCardConfigManager.getDrawCardConfigById(ServerEnums.RecruitType.SPECIAL)?.openCondition);
        if (isOk2) {
            array.push(EnumDrawCardTabType.SPECIAL_HERO);
        }

        const isOk3 = ConditionManager.ins().checkCondition(DrawCardConfigManager.getDrawCardConfigById(ServerEnums.RecruitType.AWAKE_WEAPON_NORMAL)?.openCondition);
        const isOk4 = ConditionManager.ins().checkCondition(DrawCardConfigManager.getDrawCardConfigById(ServerEnums.RecruitType.AWAKE_WEAPON_SPECIAL)?.openCondition);
        if (isOk3 && isOk4) {
            array.push(EnumDrawCardTabType.WEAPON);
        }

        return array;
    }

    /**
     * 是否可以领取普通进度奖励
     * @param needScore
     * @param isNeedPay
     */
    isCanGainNormalProgress(needScore: number, isNeedPay: boolean): boolean {
        const array = this.getNormalProgressCanGainIdArray(isNeedPay);
        if (ArrayUtils.isEmpty(array)) {
            return false;
        }

        return array.indexOf(needScore) >= 0;
    }

    // 已使用的普通进度积分
    getHaveUseNormalProgressScore(): number {
        // 一轮最大积分
        const maxCount = DrawCardUtils.getProgressMaxCount(ServerEnums.RecruitType.NORMAL);

        const minRoundCount = Math.max(0, this._normalProgressRewardRoundCount - 1);
        const useRoundScore = minRoundCount * maxCount;
        // 已使用了轮次的积分
        return useRoundScore;
    }

    // 未使用的普通抽进度积分
    getNoUseNormalProgressCount(): number {
        const drawCardCount = this.getDrawCardCount(ServerEnums.RecruitType.NORMAL);
        const haveUseScore = this.getHaveUseNormalProgressScore();

        // 未使用的积分
        return Math.max(0, drawCardCount - haveUseScore);
    }

    /**
     * 对外展示的使用的积分
     */
    getShowUseNormalProgressScore(): number {
        // 一轮最大积分
        const maxCount = DrawCardUtils.getProgressMaxCount(ServerEnums.RecruitType.NORMAL);

        const minRoundCount = Math.max(0, this._normalProgressRewardRoundCount - 1);
        const useRoundScore = minRoundCount * maxCount;
        const curRoundUseScore = this._normalHaveGainProgressIdArray.toDataStream().maxByWeightNumber((it) => it, 0);
        // 已使用了轮次的积分
        return useRoundScore + curRoundUseScore;
    }

    // 显示用, 未使用的普通抽进度积分
    getShowNoUseNormalProgressCount(): number {
        const drawCardCount = this.getDrawCardCount(ServerEnums.RecruitType.NORMAL);
        const haveUseScore = this.getShowUseNormalProgressScore();

        // 未使用的积分
        return Math.max(0, drawCardCount - haveUseScore);
    }

    getProgressRoundCount(): number {
        return this._normalProgressRewardRoundCount;
    }
}
