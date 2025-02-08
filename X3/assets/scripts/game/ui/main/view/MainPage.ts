import { tween } from "cc";
import { I18nManager } from "db://assets/scripts/core/i18n/I18nManager";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import { HeaderItem } from "db://assets/scripts/game/modules/common/header/HeaderItem";
import { ConditionManager } from "db://assets/scripts/game/modules/condition/ConditionManager";
import { ConditionUtils } from "db://assets/scripts/game/modules/condition/ConditionUtils";
import { EnumTabSideType } from "db://assets/scripts/game/ui/main/const/EnumTabSideType";
import { MainPageUtils } from "db://assets/scripts/game/ui/main/utils/MainPageUtils";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { TableManager } from "../../../../core/table/TableManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { BattleManager } from "../../../comm/battle/BattleManager";
import { AudioManager, SoundType } from "../../../comm/mgr/AudioManager";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { ActivityController } from "../../../modules/activity/ActivityController";
import { PetGiftController } from "../../../modules/activity/petGift/PetGiftController";
import { AdController } from "../../../modules/ad/AdController";
import { ChargeController } from "../../../modules/charge/ChargeController";
import { BtnConfirmViewOpenArgs } from "../../../modules/common/confirm/BtnConfirmView";
import { UICommonKey } from "../../../modules/common/const/UICommonConfig";
import { CommonI18nKeys } from "../../../modules/common/i18n/CommonI18nKeys";
import { FloatingTextManager } from "../../../modules/floatingText/FloatingTextManager";
import { FuliModel } from "../../../modules/fuli/fuliModel";
import { MallModel } from "../../../modules/mall/model/MallModel";
import { UIMapKey } from "../../../modules/map/const/UIMapConfig";
import { MapInstanceManager } from "../../../modules/mapInstance/MapInstanceManager";
import { MiniMapItem } from "../../../modules/miniMap/item/MiniMapItem";
import { ModuleOpenManager } from "../../../modules/moduleopen/ModuleOpenManager";
import { UIStimulationConfig } from "../../../modules/stimulation/const/UIStimulationConfig";
import { WorldBossModel } from "../../../modules/worldBoss/model/WorldBossModel";
import { BuildingUtils } from "../../../tiledMap/config/BuildingUtils";
import { MapObjectType } from "../../../tiledMap/MapEnum";
import { MapManager } from "../../../tiledMap/MapManager";
import { MapModel } from "../../../tiledMap/model/MapModule";
import { MainPageAniPoint } from "../components/MainPageAniPoint";
import { MainPageTabList, MainPageTabListLayout } from "../components/MainPageTabList";
import { TrunkTaskBtn } from "../components/TrunkTaskBtn";
import { EnumTabItemNameForClient } from "../const/EnumTabItemNameForClient";
import { UIMain18nKeys } from "../const/UIMain18nKeys";
import { I18MainKey, UIMainKey } from "../const/UIMainConfig";
import { ActivityCom } from "../item/ActivityCom";
import { PlayerCom } from "../item/PlayerCom";
import { MainPageManager } from "../MainPageManager";

@bindScript(UIMainKey.MAIN_PAGE)
export class MainPage extends UIPage {
    static pkgName: string = "main";
    static viewName: string = "MainPage";

    // <头顶图标 configId, ui>
    private _headerConfigIdToUIMap: Map<number, HeaderItem>;

    // 住任务 tab
    private _tabConfigForTrunkTask: table.mainpage.MainPageTabItemConfig = null;
    // 聊天 tab
    private _tabConfigForChat: table.mainpage.MainPageTabItemConfig = null;
    // 回城
    private _tabConfigForBackHome: table.mainpage.MainPageTabItemConfig = null;
    // 左下角
    private _configForBig: table.mainpage.MainPageTabItemConfig;

    private get view(): ui.main.MainPage {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.MAP_AREA_TRANSFER_END,
            NotificationKey.MAP_TEAN_POS_UPDATE,

            NotificationKey.MAP_ACTIVE_BUILDING,
            NotificationKey.MAP_CANCEL_ACTIVE_BUILDING,
            NotificationKey.MAP_BUILDING_UNLOCK,
            NotificationKey.MAP_MIST_UNLOCKED,
            NotificationKey.MAP_RESOURCE_REACH_MAX,

            //更新红点
            NotificationKey.HERO_UP_LEVEL,
            NotificationKey.HERO_UP_STAR,
            NotificationKey.HERO_UP_STAGE,

            //活动入口
            NotificationKey.ACTIVITY_REQUEST_BACK,
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_REWARD_UPDATE,
            NotificationKey.ACTIVITY_END_REFRESH,

            //跨天
            NotificationKey.SYSTEM_NEW_DAY,
            //限时礼包变更
            NotificationKey.MALL_POPUP_CHANGE,
            //功能预告
            NotificationKey.FUNCTION_NOTICE_UPDATE,
            NotificationKey.MALL_DATA_CHANGE_BY_ID,
            // 解锁
            ...ConditionUtils.getUnlockEventNameArray(),
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.HERO_UP_LEVEL:
                this.updateTabLater(2);
                return;
            case NotificationKey.MAP_AREA_TRANSFER_END:
                this.refreshAllTabItemVisible();
                // 小地图   不加延迟位置可能会有偏移
                GameTimer.ins().once(500, this, () => {
                    this.updateMiniMap();
                    // this.setMiniMapPos(args);
                    GIns.miniMapMgr._isShowMaxResourceTip = false;
                    this.showResourceFull();
                });
                return;
            case NotificationKey.MAP_TEAN_POS_UPDATE:
                //小地图
                this.setMiniMapPos(args);
                return;
            case NotificationKey.MAP_RESOURCE_REACH_MAX:
                this.showResourceFull();
                break;
            case NotificationKey.MAP_BUILDING_UNLOCK:
            case NotificationKey.MAP_MIST_UNLOCKED:
                this.updateMiniMap(args);
                return;
            case NotificationKey.MAP_ACTIVE_BUILDING:
                this.activeBuilding(args, true);
                return;
            case NotificationKey.MAP_CANCEL_ACTIVE_BUILDING:
                this.activeBuilding(args, false);
                return;
            case NotificationKey.ACTIVITY_REQUEST_BACK:
            case NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK:
            case NotificationKey.ACTIVITY_UPDATE:
            case NotificationKey.ACTIVITY_REWARD_UPDATE:
            case NotificationKey.SYSTEM_NEW_DAY:
            case NotificationKey.ACTIVITY_END_REFRESH:
            case NotificationKey.FUNCTION_NOTICE_UPDATE:
            case NotificationKey.SEASON_ACTIVITY_NEWSTATE:
            case NotificationKey.MALL_DATA_CHANGE_BY_ID:
            case NotificationKey.MALL_POPUP_CHANGE:
                //刷新活动入口
                this.updateTabLater(2);
                return;
        }

        const ok = ConditionUtils.isNeedHandleForUnlock(event);
        if (ok) {
            this.updateTabLater(1);
        }
    }

    private _updateType = 0; //1 全部  2 tab
    private _updateTabTimeKey: string;

    /**
     * 更新选项卡的延迟方法。
     * @param type - 需要更新的选项卡类型。
     * 如果当前有正在进行的更新，则不会启动新的更新。
     * 500毫秒后执行更新操作，根据type值决定是刷新所有选项卡项的可见性还是重置所有选项卡列表和游戏广告选项卡。
     */
    public updateTabLater(type: number) {
        this._updateType = this._updateType == 0 ? type : Math.min(type, this._updateType);
        if (this._updateTabTimeKey) {
            return;
        }

        this._updateTabTimeKey = GameTimer.ins().once(500, this, () => {
            this._updateTabTimeKey = null;
            if (this._updateType == 1) {
                this.refreshAllTabItemVisible();
            } else {
                this.resetAllTabList();
                this.resetGameAdTab();
            }
            this._updateType = 0;
        });
    }

    public onInit(): void {
        this.view.btnHangUpLevel.visible = false;
        this._configForBig = G.TableManager.getAllData(table.mainpage.MainPageTabItemConfig)
            .toDataStream()
            .filter((it) => it.sideType == EnumTabSideType.BOTTOM_BIG)
            .first(null);

        this.view.footer.pageList.on(fgui.Event.CLICK_ITEM, this.onClickPageList, this);

        const backHomeConfig = MainPageUtils.getBackHomeConfig();
        if (backHomeConfig) {
            this.view.btn_backHome.title = backHomeConfig.showName;
            this.view.btn_backHome.icon = backHomeConfig.iconNormalAssetPath;
        }

        this.view.buildingBtn.onClick(this.onClickBuilding, this);
        // 回城
        this.view.btn_backHome.onClick(this.onBackHomeClick, this);

        this.renderHeaderItem();

        //初始化所有tab列表配置
        this.initTabList(EnumTabSideType.LEFT, FguiScriptUtils.toMyScriptClass(this.view.listLeftTab, MainPageTabList));
        this.initTabList(EnumTabSideType.RIGHT_TOP, FguiScriptUtils.toMyScriptClass(this.view.listRightTab, MainPageTabList));
        this.initTabList(EnumTabSideType.CENTER_TOP, FguiScriptUtils.toMyScriptClass(this.view.listCenterTab, MainPageTabList));
    }

    protected initTabList(type: EnumTabSideType, list: MainPageTabList): void {
        let maxRow: number = 5;
        let foldNeedCount: number = 5;
        let layout: number = MainPageTabListLayout.LEFT;
        let listCfg = G.TableManager.getDataById(table.mainpage.MainPageTabListConfig, type);
        if (listCfg) {
            maxRow = listCfg.maxRow;
            foldNeedCount = listCfg.showFoldCnt;
            layout = listCfg.layout;
        }
        if (type == EnumTabSideType.LEFT) {
            /**计算任务展示坐标 来动态设置左侧列表的最大行数*/
            let taskY: number = this.view.trunkTask.y;
            let leftY: number = this.view.listLeftTab.y;

            let canShowH: number = taskY - leftY;
            /**可显示数量 item高度120这里写死*/
            maxRow = Math.min(maxRow, Math.floor(canShowH / 110));
        }
        list.initUIConfig(layout, maxRow, foldNeedCount);
    }

    /**底部的显示 */
    private onShowFooter() {
        const configForBig = this._configForBig;
        if (configForBig) {
            const isCanOpen = ConditionManager.ins().checkCondition(configForBig.conditionText);
            if (isCanOpen) {
                this.view.btnHangUpLevel.visible = isCanOpen;
            }
        }

        let configs = MainPageUtils.getTabItemConfigArrayBySideType(EnumTabSideType.BOTTOM);

        let show = false;
        configs.forEach((cfg) => {
            let unShowLock = ConditionManager.ins().checkCondition(cfg.conditionText);
            if (unShowLock) {
                //有一个功能满足显示才显示
                show = true;
            }
        });
        if (!show) {
            configs = MainPageUtils.getTabItemConfigArrayBySideType(EnumTabSideType.BOTTOM_BIG);

            configs.forEach((cfg) => {
                let unShowLock = ConditionManager.ins().checkCondition(cfg.conditionText);
                if (unShowLock) {
                    //有一个功能满足显示才显示
                    show = true;
                }
            });
        }

        this.view.footer.visible = show;
    }

    private renderHeaderItem() {
        // 主界面 header item
        this._headerConfigIdToUIMap = new Map<number, HeaderItem>([
            [1, FguiScriptUtils.toMyScriptClass(this.view.headerItem1, HeaderItem)],
            [2, FguiScriptUtils.toMyScriptClass(this.view.headerItem2, HeaderItem)],
            [3, FguiScriptUtils.toMyScriptClass(this.view.headerItem3, HeaderItem)],
            [4, FguiScriptUtils.toMyScriptClass(this.view.headerItem4, HeaderItem)],
            [5, FguiScriptUtils.toMyScriptClass(this.view.headerItem5, HeaderItem)],
        ]);

        this._headerConfigIdToUIMap.forEach((ui, configId) => {
            const config = TableManager.getDataById(table.mainpage.MainPageHeaderItemConfig, configId);
            if (!config) {
                return;
            }

            this.resetHeaderItemOne(ui, config, configId);
            let aniPointComp = FguiScriptUtils.toMyScriptClass(this.view.aniPoint, MainPageAniPoint);
            aniPointComp.addHeaderItem(ui);
        });
    }

    public onOpen(): void {
        this.initTabConfig();
        FguiScriptUtils.toMyScriptClass(this.view.trunkTask, TrunkTaskBtn).setTipsBtn(this.view.trunkTaskTipsBtn);
        this.refreshAllTabItemVisible();

        let playerComp = FguiScriptUtils.toMyScriptClass(this.view.headPlayer, PlayerCom);
        playerComp.resetForMe();
    }

    initTabConfig() {
        // 主任务
        this._tabConfigForTrunkTask = MainPageUtils.getOnlyOneTabItemConfigBySideType(EnumTabSideType.TRUNK_TASK);
        // chat
        this._tabConfigForChat = MainPageUtils.getOnlyOneTabItemConfigBySideType(EnumTabSideType.CHAT);
        // 回城
        this._tabConfigForBackHome = MainPageUtils.getOnlyOneTabItemConfigBySideType(EnumTabSideType.BACK_HOME);
    }

    public onClose(): void {
        this._updateTabTimeKey = null;
        G.GameTimer.clearAll(this);
    }

    // 回城
    private onBackHomeClick() {
        const pos = MapManager.ins().getMapPos();
        const mapId = MapManager.ins().getMapID();

        const isFromAndToPosIsMainCity = MapManager.ins().isMainCityId(mapId) && MapManager.ins().isInMainCity();
        if (isFromAndToPosIsMainCity) {
            //FloatingTextManager.ins().showTips("飞船内无法使用");
            FloatingTextManager.ins().showTips(UIMain18nKeys.homeCantUseAirship);
            return;
        }

        let content = I18nManager.ins().lang(I18MainKey.i18n_mainPage_backTips);
        //二次确认
        UIManager.ins().open(UICommonKey.BtnConfirmView, {
            title: null,
            titleCancel: CommonI18nKeys.cancel,
            titleConfirm: CommonI18nKeys.confirm,
            content: content,
            onBtnYes: () => {
                MapManager.ins().transferToOtherMapPositionWithAnim(mapId, pos);
            },
        } as BtnConfirmViewOpenArgs);
    }

    private _curBuildingId: number;

    public activeBuilding(buildingId: number, isActive: boolean) {
        let cfg = TableManager.getDataById(table.map.MapBuildingConfig, buildingId);
        //后端不加条件，所以无法通过配表实现隐藏入口
        //隐藏副本boss入口
        if (MapInstanceManager.ins().isPass(buildingId)) {
            this.view.buildingBtn.visible = false;
            return;
        }
        //隐藏世界boss入口
        if (cfg && cfg.building_type == MapObjectType.world_boss && WorldBossModel.ins().getWorldBossStartTimeByBuildId(buildingId) > TimeManager.serverNow) {
            this.view.buildingBtn.visible = false;
            return;
        }
        //隐藏火箭浣熊入口
        if (cfg && cfg.building_type == MapObjectType.Raccoon && GIns.mapVisibleMgr.isAdvertBoxShow() == false) {
            this.view.buildingBtn.visible = false;
            return;
        }

        if (isActive) {
            this._curBuildingId = buildingId;
            let isUnlock = MapManager.ins().getBuildingUnlockById(buildingId);
            this.view.buildingBtn.icon = isUnlock ? cfg.funcIcon : cfg.unlockIcon;
            this.view.buildingBtn.title = isUnlock ? cfg.funcName : cfg.unlockName;
        }

        let isShow = BuildingUtils.isShowBuildingBtn(buildingId);

        if (!this.view.buildingBtn.visible && isActive && isShow) AudioManager.ins().playSound(SoundType.jiaohu);

        if (isActive && isShow) {
            this.showBuildingBtn();
        } else this.view.buildingBtn.visible = false;
        // this.view.buildingBtn.visible = isActive && isShow;
    }

    private showBuildingBtn(): void {
        this.view.buildingBtn.visible = true;
        this.view.buildingBtn.scaleY = 0;
        tween()
            .target(this.view.buildingBtn)
            .to(0.3, { scaleY: 1 }, { easing: "cubicInOut" })
            .call(() => {})
            .start();
    }

    /** 获取配置表控制显示 */
    private isShowBtn(buildingId: number) {
        let cfg = TableManager.getDataById(table.map.MapBuildingConfig, buildingId);
        if (cfg && cfg.btnOpenVerify) {
            let unlock1 = ConditionManager.ins().checkCondition(cfg.btnOpenVerify);
            return unlock1;
        }
        if (cfg && cfg.btnCloseVerify) {
            let unlock2 = ConditionManager.ins().checkCondition(cfg.btnCloseVerify);
            return !unlock2;
        }
        return true;
    }

    private onClickBuilding() {
        //FacadeManager.emit(NotificationKey.GUIDE_CLICK_BTN, 2);
        if (!BattleManager.ins().isNoEnemyInSearchRange()) {
            FloatingTextManager.ins().showTips(UIMain18nKeys.ELIMINATE_ENEMY_TIPS);
            return;
        }

        if (this._curBuildingId) {
            let cfg: table.map.MapBuildingConfig = TableManager.getDataById(table.map.MapBuildingConfig, this._curBuildingId);
            {
                //其他建筑
                let isUnlock = MapManager.ins().getBuildingUnlockById(this._curBuildingId);
                if (isUnlock) {
                    // 跳转id
                    if (cfg && cfg.funcJumpId) {
                        // 触发跳转
                        if (cfg.building_type === MapObjectType.TELEPORT) {
                            //传送需要带参数
                            this.emit(NotificationKey.EVENT_JUMP_TO_OTHER_FEATURE_ARGS, {
                                jumpId: cfg.funcJumpId,
                                arg: { buildingId: cfg.id },
                            });
                        } else {
                            this.emit(NotificationKey.EVENT_JUMP_TO_OTHER_FEATURE, cfg.funcJumpId);
                        }
                    }
                    if (cfg) {
                        //副本boss
                        if (cfg.building_type == MapObjectType.instance) {
                            let instanceCfg = TableManager.getDataById(table.map.MapInstanceConfig, cfg.id);
                            MapInstanceManager.ins().mapInstanceId = instanceCfg.id;
                            MapInstanceManager.ins().enterMapId = MapManager.ins().getMapID();
                            MapInstanceManager.ins().enterMapPos = MapManager.ins().getMapPos();
                            MapModel.ins().sendChallengeMapInstance(instanceCfg.id);
                        }
                        //世界boss
                        else if (cfg.building_type == MapObjectType.world_boss) {
                            WorldBossModel.ins().openWorldBossMain(cfg.id);
                        }
                        //火箭浣熊
                        else if (cfg.building_type == MapObjectType.Raccoon) {
                            AdController.ins().openDailyAdBox();
                        }
                        //简易经营
                        else if (cfg.building_type == MapObjectType.stimulation) {
                            G.UIManager.open(UIStimulationConfig.StimulationMainView, this._curBuildingId);
                        }
                    }
                } else {
                    let unlock: boolean = ConditionManager.ins().checkCondition(cfg.openVerify);
                    if (!unlock) {
                        UIManager.ins().open(UIMapKey.MAP_CONDITIONALPOPUP, cfg);
                        return;
                    }

                    if (cfg.costItems) {
                        if (!BackpackManager.ins().isCanPayTheseItemArrayByConfig(cfg.costItems, false)) {
                            //临时处理，道具不足弹窗可能卡引导
                            FloatingTextManager.ins().showTips("道具不足！");
                            return;
                        }
                    }

                    //解锁
                    UIManager.ins().open(UICommonKey.UnlockBuildingAnimWin, { curBuildingId: this._curBuildingId });
                }
            }
        }
    }

    protected resetAllTabList(): void {
        this.resetLeftSideTab();
        this.resetRightSideTab();
        this.resetCenterSideTab();
    }

    /**判断是否展示tab按钮*/
    protected getTabListItemVisibleResult(config: table.mainpage.MainPageTabItemConfig): boolean {
        let unlock: boolean = true;
        if (config.conditionText) {
            unlock = ConditionManager.ins().checkCondition(config.conditionText);
        }
        if (unlock == false) {
            //未解锁
            return false;
        }
        switch (config.nameForClient) {
            case EnumTabItemNameForClient.FULI:
                unlock = FuliModel.ins().getFuliConfigList().length > 0;
                break;
            case EnumTabItemNameForClient.OPENCHARGE:
                unlock = ActivityController.ins().getOpenAvtivityList(config.viewArge).length > 0;
                break;
            case EnumTabItemNameForClient.CHARGE:
                unlock = ChargeController.ins().getChargeTabNum() > 0;
                break;
            case EnumTabItemNameForClient.PASS:
                unlock = ActivityController.ins().getOpenAvtivityList(config.viewArge).length > 0 || ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.MONTH_CARD, false);
                break;
            case EnumTabItemNameForClient.LIMIT_PACK:
                unlock = MallModel.ins().popupDataMap.size > 0;
                break;
            case EnumTabItemNameForClient.PET_GIFT:
                unlock = PetGiftController.ins().isBtnUnlock();
                break;
            case EnumTabItemNameForClient.PREVIEW:
                //即将开启功能
                if (GIns.predictionMgr.isShowPreview()) {
                    unlock = false;
                }
                break;
            case EnumTabItemNameForClient.SEASON:
                //赛季活动是否开启了（包括签到）
                if (!GIns.seasonManager.isSeason()) {
                    unlock = false;
                }
                break;
            case EnumTabItemNameForClient.SEASON_SUB:
                //赛季是否有子活动是否开启了
                if (!GIns.seasonManager.isShowSubIcon()) {
                    unlock = false;
                }
                break;
        }
        return unlock;
    }

    // 左侧
    private resetLeftSideTab() {
        const configs = MainPageUtils.getTabItemConfigArrayBySideType(EnumTabSideType.LEFT);
        if (ArrayUtils.isEmpty(configs)) {
            this.view.listLeftTab.visible = false;
            return;
        }
        if (MapManager.ins().isNewPlayerId(MapManager.ins().getMapID())) {
            //在新手地图隐藏
            this.view.listLeftTab.visible = false;
            return;
        }
        this.view.listLeftTab.visible = true;
        let cfgs: table.mainpage.MainPageTabItemConfig[] = [];
        //判断是不是符合显示条件
        configs.forEach((config) => {
            if (this.getTabListItemVisibleResult(config)) {
                cfgs.push(config);
            }
        });

        let listComp = FguiScriptUtils.toMyScriptClass(this.view.listLeftTab, MainPageTabList);
        listComp.updateUIByCfgs(cfgs);
    }

    // 右侧
    private resetRightSideTab() {
        const configs = MainPageUtils.getTabItemConfigArrayBySideType(EnumTabSideType.RIGHT_TOP);
        if (ArrayUtils.isEmpty(configs)) {
            this.view.listRightTab.visible = false;
            return;
        }
        if (MapManager.ins().isNewPlayerId(MapManager.ins().getMapID())) {
            //在新手地图隐藏
            this.view.listRightTab.visible = false;
            return;
        }
        this.view.listRightTab.visible = true;
        let cfgs: table.mainpage.MainPageTabItemConfig[] = [];
        let autoPopCfg: table.activity.ActivityConstant.ActivityClientConfig = null;
        //判断是不是符合显示条件
        configs.forEach((config) => {
            if (this.getTabListItemVisibleResult(config)) {
                cfgs.push(config);
            }
        });

        let listComp = FguiScriptUtils.toMyScriptClass(this.view.listRightTab, MainPageTabList);
        listComp.updateUIByCfgs(cfgs);
    }

    // 中间
    private resetCenterSideTab() {
        const configs = MainPageUtils.getTabItemConfigArrayBySideType(EnumTabSideType.CENTER_TOP);
        if (ArrayUtils.isEmpty(configs)) {
            this.view.listCenterTab.visible = false;
            return;
        }
        if (MapManager.ins().isNewPlayerId(MapManager.ins().getMapID())) {
            //在新手地图隐藏
            this.view.listCenterTab.visible = false;
            return;
        }
        this.view.listCenterTab.visible = true;
        let cfgs: table.mainpage.MainPageTabItemConfig[] = [];
        //判断是不是符合显示条件
        configs.forEach((config) => {
            if (this.getTabListItemVisibleResult(config)) {
                cfgs.push(config);
            }
        });

        let listComp = FguiScriptUtils.toMyScriptClass(this.view.listCenterTab, MainPageTabList);
        listComp.updateUIByCfgs(cfgs, true);
    }

    /**
     * 刷新所有 tab | 是否可见
     * @private
     */
    private refreshAllTabItemVisible() {
        this.resetAllTabList();
        this.resetTrunkTaskTab();
        // 广告
        this.resetGameAdTab();
        // 回城
        this.resetTabBackHome();
        // 聊天
        this.resetTabChat();
        //底部
        this.onShowFooter();
    }

    /** 是否显示小地图 */
    private updateMiniMap(id?: number) {
        let cfg = TableManager.getDataById(table.map.MapidConfig, MapManager.ins().getMapID());
        if (cfg.mapPath.length > 1) {
            this.view.MiniMap.visible = true;
            //@ts-ignore
            let miniMapItem = this.view.MiniMap as MiniMapItem;
            if (id) {
                miniMapItem.resetMiniMapData(id);
            } else {
                miniMapItem.setMiniMapIcon();
            }
        } else {
            this.view.MiniMap.visible = false;
        }
    }

    //显示资源达到上限
    private showResourceFull() {
        //每30秒弹出一次
        G.GameTimer.once(30000, this, this.showResourceFull);
        if (!this.view.MiniMap.visible) return;

        let isShow1 = GIns.miniMapMgr.isResourceMax(5);
        if (isShow1) {
            this.view.gp_resource1.visible = isShow1;
            this.view.T_resource1.text = `当前区域资源已达获取上限\n上限值：[color=#f2520b]${GIns.miniMapMgr.getStarResourceNumById(5)}/${GIns.miniMapMgr.getStarResourceMaxNumById(5)}[/color]`;
        }
        let isShow2 = GIns.miniMapMgr.isResourceMax(7);
        if (isShow2) {
            this.view.gp_resource2.visible = isShow2;
            this.view.T_resource2.text = `当前区域资源已达获取上限\n上限值：[color=#f2520b]${GIns.miniMapMgr.getStarResourceNumById(7)}/${GIns.miniMapMgr.getStarResourceMaxNumById(7)}[/color]`;
        }

        if (this.view.gp_resource1.visible) {
            G.GameTimer.once(5000, this, () => {
                this.view.gp_resource1.visible = false;
            });
        }
        if (this.view.gp_resource2.visible) {
            G.GameTimer.once(5000, this, () => {
                this.view.gp_resource2.visible = false;
            });
        }
    }

    /** 设置小地图位置 */
    private setMiniMapPos(pos: { x: number; y: number }) {
        if (!this.view.MiniMap.visible) return;
        //@ts-ignore
        let miniMapItem = this.view.MiniMap as MiniMapItem;
        miniMapItem.setMiniMapPosition(pos);
    }

    private resetTrunkTaskTab() {
        const config = this._tabConfigForTrunkTask;
        if (!config) {
            return;
        }

        let b = this.view.trunkTask.visible;
        this.view.trunkTask.visible = ConditionManager.ins().checkCondition(config.conditionText);
        if (!b && this.view.trunkTask.visible) {
            FguiScriptUtils.toMyScriptClass(this.view.trunkTask, TrunkTaskBtn).showFirstNewTaskEffect();
        }
    }

    private resetTabBackHome() {
        const config = this._tabConfigForBackHome;
        if (!config) {
            return;
        }
        this.view.btn_backHome.visible = ConditionManager.ins().checkCondition(config.conditionText);
        //  this.view.btn_backHome.grayed = MapManager.ins().isInMainCity();
    }

    private resetTabChat() {
        const config = this._tabConfigForChat;
        if (!config) {
            return;
        }
        this.view.chat.visible = ConditionManager.ins().checkCondition(config.conditionText);
    }

    // 轮播图广告
    private resetGameAdTab() {
        //在主城 && 有活动开启的情况
        let cfgs = MainPageUtils.getOpenedBannerActivityGroup();
        let isOpen = GIns.mapMgr.getMapID() == 1 && cfgs.length > 0 && ModuleOpenManager.ins().isCanOpenModuleWithoutTips(ServerEnums.SystemType.ROLLING_SCREEN);
        this.view.sideShowAd.visible = isOpen;
        if (isOpen) {
            //@ts-ignore
            let sideShowItem = this.view.sideShowAd as ActivityCom;
            sideShowItem.setData(cfgs);
        }
    }

    /**点击页签 */
    private onClickPageList(item: fgui.GButton) {
        let index = this.view.footer.pageList.childIndexToItemIndex(this.view.footer.pageList.getChildIndex(item));
        let unLock = MainPageManager.ins().onClickTabAndCheck(index, true);
        if (unLock) UIManager.ins().open(UIMainKey.MainContainerPage, { page: index });
    }

    private resetHeaderItemOne(ui: HeaderItem, config: table.mainpage.MainPageHeaderItemConfig, configId: number) {
        if (configId <= 2) {
            // 前 2 个
            ui.resetByMainPage(config, true);
        } else {
            ui.resetByMainPage(config, false);
        }
    }
}
