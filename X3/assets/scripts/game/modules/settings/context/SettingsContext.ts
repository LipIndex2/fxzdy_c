import { SettingsConfigManager } from "db://assets/scripts/game/modules/settings/config/SettingsConfigManager";
import { SettingsChooseCache } from "db://assets/scripts/game/modules/settings/context/SettingsChooseCache";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import { TimeUtils } from "db://assets/scripts/game/comm/utils/TimeUtils";
import { PlayerInfoConfigManager } from "db://assets/scripts/game/modules/player/config/PlayerInfoConfigManager";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { ConditionManager } from "db://assets/scripts/game/modules/condition/ConditionManager";
import { RedDotManager } from "../../common/redDot/RedDotManager";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import { HeroManager } from "db://assets/scripts/game/modules/hero/HeroManager";
import { AttrData } from "db://assets/scripts/game/modules/attr/AttrManager";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { HeroVo } from "../../hero/HeroVo";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";
import GIns from "../../../GIns";


export class SettingsContext implements INotification {

    private _data: Vo.set.PlayerSetVo;
    // 拥有的
    private _haveIdSet: Set<number> = new Set();
    private _idToExpireAtTimeMsMap = new Map<number, number>();

    // 选中缓存
    private _chooseCache = new SettingsChooseCache();

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_CHANGE_ITEMS2,
        ]
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_CHANGE_ITEMS2: {
                this.tryAddNewSettingId(args);
                break;
            }
        }
    }

    init() {
        FacadeManager.ins().removeNotification(this);
        FacadeManager.ins().registerNotification(this);

        GameTimer.ins().loop(60 * 1000, this, this.refreshExpire)
    }

    refreshExpire() {
        let isChange = false;
        for (let [settingsId, expireAtTimeMs] of this._idToExpireAtTimeMsMap) {
            if (expireAtTimeMs <= 0) {
                this._idToExpireAtTimeMsMap.delete(settingsId);
                continue
            }
            // no expire
            if (TimeManager.serverNow < expireAtTimeMs) {
                continue
            }
            this._idToExpireAtTimeMsMap.delete(settingsId);
            this._haveIdSet.delete(settingsId);
            this.checkShowConfigRedDot(settingsId, false);
            isChange = true;
        }

        if (!isChange) {
            return;
        }

        FacadeManager.ins().emit(NotificationKey.FIGHT_UPDATE_ALL_HERO);
    }

    get chooseCache(): SettingsChooseCache {
        return this._chooseCache;
    }

    reset(data: Vo.set.PlayerSetVo) {
        this._data = data;

        this._haveIdSet = new Set(data?.permanentShowIds || []);

        this._idToExpireAtTimeMsMap.clear();
        const obj = data?.showIdExpireTimeMap || {};
        for (let key of Object.keys(obj)) {
            const settingsId = key.toInt();
            const expireAtTimeMs = obj[key];

            // 0 = 永久
            if (expireAtTimeMs > 0) {
                this._idToExpireAtTimeMsMap.set(settingsId, expireAtTimeMs);
            }

            this._haveIdSet.add(settingsId);
        }

        // 默认
        this._haveIdSet.add(SettingsConfigManager.defaultChatColorId);
        this._haveIdSet.add(SettingsConfigManager.defaultChatBoxId);

        // 选中
        this._chooseCache.headFrameId = data?.usingHeadFrame || SettingsConfigManager.defaultHeadFrameId;
        this._chooseCache.headIconId = data?.usingHeadIcon || SettingsConfigManager.defaultHeadIconId;
        this._chooseCache.titleId = data?.usingTitleId || SettingsConfigManager.defaultTitleId;
        this._chooseCache.imageId = data?.usingImageId || SettingsConfigManager.defaultShowHeroId;
        this._chooseCache.chatBoxId = data?.usingChatBoxId || SettingsConfigManager.defaultChatBoxId;
        this._chooseCache.chatFontId = data?.usingChatWordColorId || SettingsConfigManager.defaultChatColorId;

        this.refreshRedDot();
    }

    isCanFreeChangeName() {
        return (this._data?.changeNameTimes || 0) < SettingsConfigManager.freeCnt;
    }

    addChangeNameCount() {
        this._data.changeNameTimes = (this._data.changeNameTimes || 0) + 1;
        this.refreshRedDot()
    }

    // 称号
    getTitleId(): number {
        return this._data?.usingTitleId || 0;
    }

    // 头像
    getHeadIconId(): number {
        return this._data?.usingHeadIcon || SettingsConfigManager.defaultHeadIconId;
    }

    // 头像框
    getHeadFrameId(): number {
        return this._data?.usingHeadFrame || SettingsConfigManager.defaultHeadFrameId;
    }

    // 形象
    getImageId(): number {
        return this._data?.usingImageId || SettingsConfigManager.defaultShowHeroId;
    }

    // 聊天字体
    getChatFontId(): number {
        return this._data?.usingChatWordColorId || SettingsConfigManager.defaultChatColorId;
    }

    // 聊天背景
    getChatBoxId(): number {
        return this._data?.usingChatBoxId || SettingsConfigManager.defaultChatBoxId;
    }

    // 头像
    getHeadIconAssetPath(): string {
        return PlayerInfoConfigManager.getHeadIconConfigById(this.getHeadIconId())?.assetPath;
    }

    // 头像框
    getHeadFrameAssetPath(): string {
        return PlayerInfoConfigManager.getHeadFrameConfigById(this.getHeadFrameId())?.assetPath;
    }

    // 形象
    getImageAssetPath(): string {
        return PlayerInfoConfigManager.getHeroShowConfigById(this.getImageId())?.assetPath;
    }

    getTitleAssetPath(): string {
        return PlayerInfoConfigManager.getTitleConfigById(this.getTitleId())?.assetPath;
    }

    /**
     * 是否含有这个装饰id
     * @param settingsId
     */
    isHaveGot(settingsId: number): boolean {
        return this._haveIdSet.has(settingsId);
    }

    /**
     * 是否过期
     * @param settingsId
     */
    isExpire(settingsId: number): boolean {
        if (!this.isHaveGot(settingsId)) {
            const unlockCondition = PlayerInfoConfigManager.getConfigById(settingsId)?.unlockCondition;
            if (ArrayUtils.isEmpty(unlockCondition)) {
                return true;
            }
            // 未解锁
            return !ConditionManager.ins().checkCondition(unlockCondition, false)
        }

        const curTimeMs = TimeManager.serverNow;
        const expireAtTimeMs = this._idToExpireAtTimeMsMap.get(settingsId);
        if (expireAtTimeMs == 0) {
            return false;
        }
        if (expireAtTimeMs == null) {
            return false;
        }
        return expireAtTimeMs < curTimeMs;
    }

    /**
     * 0 = 过期
     * -1 = 永久
     * @param settingId
     */
    getRestTimeMs(settingId: number): number | null {
        const curTimeMs = TimeManager.serverNow;
        const atTimeMs = this._idToExpireAtTimeMsMap.get(settingId);
        if (atTimeMs == null) {
            if (this._haveIdSet.has(settingId)) {
                return 0;
            }
            return null;
        }
        return atTimeMs - curTimeMs;
    }

    /**
     * 剩余时间文本
     * @param settingId
     * @return null 永久
     */
    getRestTimeText(settingId: number): string | null {
        const restTimeMs = this.getRestTimeMs(settingId);
        if (restTimeMs === null) {
            return "";
        }
        // 已过期
        if (restTimeMs < 0) {
            return "";
        }
        // 永久
        if (restTimeMs === 0) {
            return "";
        }
        return TimeUtils.formatRestTimeMsForExpirePlayerInfo(restTimeMs);
    }

    setHeadIconId(headIconId: number) {
        this._data.usingHeadIcon = headIconId;

        this.onChange();
    }

    setHeadFrameId(settingId: number) {
        this._data.usingHeadFrame = settingId;

        this.onChange();
    }

    setImageId(settingId: number) {
        this._data.usingImageId = settingId;

        this.onChange();
    }

    setTitleId(settingId: number) {
        this._data.usingTitleId = settingId;

        this.onChange();
    }

    setChatBoxId(settingId: number) {
        this._data.usingChatBoxId = settingId;

        this.onChange();
    }

    setChatFontId(settingId: number) {
        this._data.usingChatWordColorId = settingId;

        this.onChange();
    }

    /**
     * 前端自己判断有没有这个道具自己添加, 后端无推送
     * @param items
     * @private
     */
    private tryAddNewSettingId(items: Vo.reward.RewardResult[]) {
        if (!items) {
            return;
        }

        for (let item of items) {
            const itemId = item.baseId;

            const itemType = ItemUtils.getItemTypeById(itemId);
            // 显示
            if (itemType != ServerEnums.ItemType.SET_SHOW) {
                continue;
            }

            const setShowVo = item.contents as Vo.set.SetShowRewardVo;
            if (!setShowVo) {
                console.error("[玩家信息装饰] 后端发了过来却没有附带数据", item);
                continue
            }

            const showConfigId = setShowVo.showConfigId;
            const expireAtTimeMs = setShowVo.expireTime || 0;

            this.addNew(showConfigId, expireAtTimeMs);

        }

    }

    @LogBusiness("[玩家信息装饰] 获得新饰品")
    private addNew(showConfigId: number, expireAtTimeMs: number) {
        this._haveIdSet.add(showConfigId);

        if (expireAtTimeMs != null && expireAtTimeMs > 0) {
            this._idToExpireAtTimeMsMap.set(showConfigId, expireAtTimeMs);
        }


        FacadeManager.ins().emit(NotificationKey.SETTINGS_CHOOSE_REFRESH);
        FacadeManager.ins().emit(NotificationKey.FIGHT_UPDATE_ALL_HERO);

        this.checkShowConfigRedDot(showConfigId, true)
    }

    public checkShowConfigRedDot(showConfigId: number, isShow: boolean) {
        if (!this.isShowRedDot()) {
            return;
        }
        let showCfg = PlayerInfoConfigManager.getShowInfoConfigById(showConfigId)
        if (showCfg) {
            if (ServerEnums.ShowInfoType[showCfg.type] == ServerEnums.ShowInfoType.TITLE) {
                RedDotManager.ins().setRedDot(RedDotKeys.Set_skin_title_item, isShow, [showConfigId]);
            }
            else if (ServerEnums.ShowInfoType[showCfg.type] == ServerEnums.ShowInfoType.HEAD_FRAME) {
                RedDotManager.ins().setRedDot(RedDotKeys.Set_skin_head_frame_item, isShow, [showConfigId]);
            }
        }
    }

    /***是否显示红点 */
    isShowRedDot(): boolean {
        let cond = TableManager.getDataById(table.set.SetConstantConfig, "SET:SHOW_RED_DOT");
        let arr = StringUtils.strToArr(cond.content)
        return GIns.conditionMgr.checkCondition(arr);
    }

    public checkShowRedDotByHero(heroVo: HeroVo): void {
        if (!this.isShowRedDot()) {
            return;
        }

        let headIconShowCfgs = PlayerInfoConfigManager.getConfigByHeroShowOnlyActive(ServerEnums.ShowInfoType.HEAD_ICON)
        let imageShowCfgs = PlayerInfoConfigManager.getConfigByHeroShowOnlyActive(ServerEnums.ShowInfoType.IMAGE)

        for (let i = 0; i < headIconShowCfgs.length; i++) {
            if (headIconShowCfgs[i].heroId == heroVo.baseId && HeroManager.ins().isHaveHero(heroVo.baseId) && !this.isExpire(headIconShowCfgs[i].id)) {
                RedDotManager.ins().setRedDot(RedDotKeys.Set_skin_head_item, true, [headIconShowCfgs[i].id]);
            }
        }

        for (let j = 0; j < imageShowCfgs.length; j++) {
            if (imageShowCfgs[j].heroId == heroVo.baseId && !ConditionManager.ins().isLock(imageShowCfgs[j].unlockCondition, true, false)) {
                RedDotManager.ins().setRedDot(RedDotKeys.Set_skin_image_item, true, [imageShowCfgs[j].id]);
            }
        }
    }

    private onChange() {
        FacadeManager.ins().emit(NotificationKey.PLAYER_INFO_CHANGE);
    }

    /**
     * 是否在使用中
     * @param settingId
     */
    isInUse(settingId: number): boolean {
        return settingId == this.getTitleId()
            || settingId == this.getHeadIconId()
            || settingId == this.getHeadFrameId()
            || settingId == this.getImageId()
            || settingId == this.getChatBoxId()
            || settingId == this.getChatFontId()
            ;

    }

    protected refreshRedDot(): void {
        // 免费改名
        let isFree = this.isCanFreeChangeName()
        RedDotManager.ins().setRedDot(RedDotKeys.Set_changename_free, isFree);


        // 装饰品

    }

    /**
     * 是否解锁
     * @param settingId
     */
    isUnlock(settingId: number) {
        if (this.isHaveGot(settingId)) {
            return true;
        }
        const config = SettingsConfigManager.getShowConfigById(settingId);
        if (!config) {
            return false;
        }
        const unlockCondition = config?.unlockCondition || [];
        if (ArrayUtils.isNotEmpty(unlockCondition)) {
            return ConditionManager.ins().checkCondition(unlockCondition, true);
        }
        const heroId = config.heroId;
        if (heroId > 0) {
            return HeroManager.ins().isHaveHero(heroId);
        }
        return false;
    }

    // attr
    getAllAddAttrDataArray(): AttrData[] {
        let ma: AttrData[] = [];
        for (let settingId of this._haveIdSet) {
            const config = SettingsConfigManager.getShowConfigById(settingId);
            if (!config) {
                continue;
            }
            const kvArray = config.addAttrs;
            if (ArrayUtils.isEmpty(kvArray)) {
                continue;
            }
            const a = AttrData.fromTableConfig(kvArray);
            ma.push(...a);
        }
        return ma;
    }
}