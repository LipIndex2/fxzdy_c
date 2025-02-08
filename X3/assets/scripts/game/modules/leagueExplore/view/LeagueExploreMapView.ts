import { tween } from "cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { SoundType } from "../../../comm/mgr/AudioManager";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { BuildingUtils } from "../../../tiledMap/config/BuildingUtils";
import { ITransfer } from "../../../tiledMap/interface/ITransfer";
import { MapObjectType } from "../../../tiledMap/MapEnum";
import { UIMain18nKeys } from "../../../ui/main/const/UIMain18nKeys";
import { PlayerCom } from "../../../ui/main/item/PlayerCom";
import { UICommonKey } from "../../common/const/UICommonConfig";
import { HeaderItem } from "../../common/header/HeaderItem";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { UIMapKey } from "../../map/const/UIMapConfig";
import { MiniMapItem } from "../../miniMap/item/MiniMapItem";
import { RankUIKeys } from "../../rank/RankUIKeys";
import { RankMainViewOpenArgs } from "../../rank/view/RankMainView";
import { LeaugeExploreBuildingOccupyState } from "../const/LeagueExploreEnum";
import { ILeagueExploreBuildingOpenArgs, UILeagueExploreConfig } from "../const/UILeagueExploreConfig";
import { LeagueExploreNightTimeTip } from "./component/LeagueExploreNightTimeTip";

@bindScript(UILeagueExploreConfig.LeagueExploreMapView)
export class LeagueExploreMapView extends UIPage {
    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExploreMapView";

    protected adaptType = ViewAdaptType.FULL;
    protected _timerKey: string = null;
    protected _nextAttackTime: number = 0;
    protected _isInitMiniMap: boolean = false;
    protected _waitGotoBuildingId: number = 0;

    private get view(): ui.leagueExplore.view.LeagueExploreMapView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.MAP_AREA_TRANSFER_END,
            NotificationKey.MAP_TEAN_POS_UPDATE,
            NotificationKey.MAP_BUILDING_UNLOCK,
            NotificationKey.MAP_MIST_UNLOCKED,
            NotificationKey.MAP_ACTIVE_BUILDING,
            NotificationKey.MAP_CANCEL_ACTIVE_BUILDING,
            NotificationKey.LEAGUE_EXPLORE_BUILDING_INFO_CHANGE,
            NotificationKey.LEAGUE_EXPLORE_BUILDING_INFO_CHANGE_FOR_STAR,
            NotificationKey.ENTER_WORLD,
            NotificationKey.ENTER_WORLD_COMPLETE,
            NotificationKey.LEAGUE_EXPLORE_KICKED_OUT_STAR,
            NotificationKey.LOADING_VIEW_COMPLETE,
            NotificationKey.LEAGUE_EXPLORE_BUY_ATK_TIMES_COMPLETE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.MAP_AREA_TRANSFER_END:
                // 小地图   不加延迟位置可能会有偏移
                G.GameTimer.once(500, this, () => {
                    if (this.view.node?.isValid) {
                        this.updateMiniMap();
                    }
                });
                break;
            case NotificationKey.MAP_TEAN_POS_UPDATE:
                //小地图
                this.setMiniMapPos(args);
                break;
            case NotificationKey.MAP_BUILDING_UNLOCK:
            case NotificationKey.MAP_MIST_UNLOCKED:
                this.updateMiniMap(args);
                break;
            case NotificationKey.MAP_ACTIVE_BUILDING:
                this.activeBuilding(args, true);
                break;
            case NotificationKey.MAP_CANCEL_ACTIVE_BUILDING:
                this.activeBuilding(args, false);
                break;
            case NotificationKey.LEAGUE_EXPLORE_BUILDING_INFO_CHANGE:
                if (this.view.gbuilding.visible) {
                    this.refreshBuildingBtn();
                }
                if (this._isInitMiniMap) {
                    this.updateMiniMap(args);
                }
                break;
            case NotificationKey.LEAGUE_EXPLORE_BUILDING_INFO_CHANGE_FOR_STAR:
                if (this.view.gbuilding.visible) {
                    this.refreshBuildingBtn();
                }
                if (this._isInitMiniMap) {
                    this.updateMiniMap();
                }
                break;
            case NotificationKey.ENTER_WORLD:
                this.onEnterWorldHandler(args[0], args[1]);
                break;
            case NotificationKey.ENTER_WORLD_COMPLETE:
                this.updateMapName();
                break;
            case NotificationKey.LEAGUE_EXPLORE_KICKED_OUT_STAR:
                this.closeSelf();
                break;
            case NotificationKey.LOADING_VIEW_COMPLETE:
                this.loadingViewCompleteHandler();
                break;
            case NotificationKey.LEAGUE_EXPLORE_BUY_ATK_TIMES_COMPLETE:
                this.refreshBuildingBtn();
                break;
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.miniMap.mapItem.redDot.visible = false;

        this.view.btnIncome.onClick(this.onClickIncome, this);
        this.view.btnMain.onClick(this.onClickMain, this);
        this.view.btnRank.onClick(this.onClickRank, this);
        // this.view.btnShop.onClick(this.onClickShop, this);
        this.view.btnBack.onClick(this.onClickBack, this);
        this.view.miniMap.onClick(this.onClickMiniMap, this);
        this.view.buildingBtn.onClick(this.onClickBuilding, this);
        this.initHeaderItems();

        FguiScriptUtils.toMyScriptClass(this.view.btnIncome.redDot, RedDotCom).reset(RedDotKeys.LeagueExplore_Income);
    }

    protected initHeaderItems(): void {
        let headerItems: HeaderItem[] = [
            FguiScriptUtils.toMyScriptClass(this.view.headerItem1, HeaderItem),
            FguiScriptUtils.toMyScriptClass(this.view.headerItem2, HeaderItem),
            FguiScriptUtils.toMyScriptClass(this.view.headerItem3, HeaderItem),
            FguiScriptUtils.toMyScriptClass(this.view.headerItem4, HeaderItem),
        ]

        headerItems.forEach((ui, index) => {
            let cfg = G.TableManager.getDataById(table.leagueexplore.LeagueExploreHeaderItemConfig, index + 1);
            if (!cfg) {
                ui.visible = false;
                return;
            }
            ui.visible = true;
            ui.reset(cfg.itemId, cfg.canBuyFlag);
        });
    }

    protected onEnterWorldHandler(pos: { x: number; y: number }, data: ITransfer): void {
        if (!data.isExitBattle && data.buildingId) {
            //传送到建筑 需要寻路过去
            this._waitGotoBuildingId = data.buildingId;
        } else {
            this._waitGotoBuildingId = 0;
        }
    }

    protected loadingViewCompleteHandler(): void {
        if (this._waitGotoBuildingId > 0) {
            this._waitGotoBuildingId = 0;
            this.onClickBuilding();
        }
    }

    protected onGotoBuildingComplete(buildingId: number): void {
        this.onClickBuilding();
    }

    /**更新地图名称*/
    protected updateMapName(): void {
        let starCfg = G.TableManager.getDataById(table.leagueexplore.LeagueExploreStarConfig, GIns.leagueExploreModel.curStarId)
        this.view.miniMap.lbName.text = starCfg ? starCfg.name : '';
    }

    /** 是否显示小地图 */
    protected updateMiniMap(id?: number) {
        this._isInitMiniMap = true;
        let cfg = G.TableManager.getDataById(table.map.MapidConfig, GIns.mapMgr.getMapID());
        if (cfg.mapPath.length > 1) {
            this.view.miniMap.visible = true;
            let miniMapItem = FguiScriptUtils.toMyScriptClass(this.view.miniMap.mapItem, MiniMapItem);
            if (id) {
                miniMapItem.resetMiniMapData(id);
            } else {
                miniMapItem.setMiniMapIcon();
            }
        } else {
            this.view.miniMap.visible = false;
        }
    }

    /** 设置小地图位置 */
    protected setMiniMapPos(pos: { x: number; y: number }) {
        if (!this.view.miniMap.visible) return;

        let miniMapItem = FguiScriptUtils.toMyScriptClass(this.view.miniMap.mapItem, MiniMapItem);
        miniMapItem.setMiniMapPosition(pos);
    }

    protected onClickIncome(): void {
        G.UIManager.open(UILeagueExploreConfig.LeagueExploreIncomeWin);
    }

    protected onClickMain(): void {
        this.closeSelf();
        this.emit(NotificationKey.MAP_EXIT_OTHER);
        G.UIManager.open(UILeagueExploreConfig.LeagueExploreMainView);
    }

    protected onClickRank(): void {
        G.UIManager.open(RankUIKeys.RankMainView, RankMainViewOpenArgs.create(ServerEnums.RankingType.LEAGUE_EXPLORE_PERSON_SCORE));
    }

    // protected onClickShop(): void {
    //     GIns.shopModel.openShopMain(ShopType.LEAGUE_EXPLORE);
    // }

    protected onClickBack(): void {
        this.closeSelf();
        this.emit(NotificationKey.MAP_EXIT_OTHER);
    }

    protected onClickMiniMap(): void {
        G.UIManager.open(UILeagueExploreConfig.LeagueExploreMiniWin, GIns.leagueExploreModel.curStarId);
    }

    private _curBuildingId: number;

    public activeBuilding(buildingId: number, isActive: boolean) {
        let cfg = G.TableManager.getDataById(table.map.MapBuildingConfig, buildingId);
        //后端不加条件，所以无法通过配表实现隐藏入口
        if (isActive) {
            this._curBuildingId = buildingId;
            let isUnlock = GIns.mapMgr.getBuildingUnlockById(buildingId);
            this.view.buildingBtn.icon = isUnlock ? cfg.funcIcon : cfg.unlockIcon;
            this.view.buildingBtn.title = isUnlock ? cfg.funcName : cfg.unlockName;
        }

        let isShow = BuildingUtils.isShowBuildingBtn(buildingId);

        if (!this.view.gbuilding.visible && isActive && isShow) GIns.audioMgr.playSound(SoundType.jiaohu);

        if (isActive && isShow) {
            this.showBuildingBtn();
        } else {
            this.view.gbuilding.visible = false;
            this.removeTimer();
        }
    }

    private showBuildingBtn(): void {
        this.view.gbuilding.visible = true;
        this.view.buildingBtn.scaleY = 0;
        tween()
            .target(this.view.buildingBtn)
            .to(0.3, { scaleY: 1 }, { easing: "cubicInOut" })
            .call(() => { })
            .start();
        this.refreshBuildingBtn();
    }

    protected refreshBuildingBtn(): void {
        this.view.lbAttackTime.text = '';
        let nowTime: number = G.TimeManager.serverNow;
        let myInfo = GIns.leagueExploreModel.activityinfo.playerInfoVo;
        if (myInfo.attackLimitTime > nowTime) {
            this._nextAttackTime = myInfo.attackLimitTime;
            this.addTimer();
        } else {
            this._nextAttackTime = 0;
            this.removeTimer();
        }
        let buildingVo = GIns.leagueExploreModel.getBuildingVo(this._curBuildingId);
        if (buildingVo) {
            let state = GIns.leagueExploreModel.getBuildingOccupyState(buildingVo);
            switch (state) {
                case LeaugeExploreBuildingOccupyState.Idle:
                    this.view.buildingBtn.title = '占领';
                    break;
                case LeaugeExploreBuildingOccupyState.Me:
                    this.view.buildingBtn.title = '查看';
                    break;
                case LeaugeExploreBuildingOccupyState.MyLeagueNoFull:
                    this.view.buildingBtn.title = '驻守';
                    break;
                case LeaugeExploreBuildingOccupyState.MyLeagueCanExchange:
                    this.view.buildingBtn.title = '交换';
                    break;
                case LeaugeExploreBuildingOccupyState.MyLeagueNoExchange:
                case LeaugeExploreBuildingOccupyState.Enemy:
                    if (ServerEnums.LeagueExploreBuildingType[buildingVo.cfg.buildingType] == ServerEnums.LeagueExploreBuildingType.MINE) {
                        this.view.buildingBtn.title = '抢占';
                    } else {
                        this.view.buildingBtn.title = '攻击';
                    }
                    break;
            }
        }
    }

    /**添加计时器*/
    protected addTimer(): void {
        if (!this._timerKey) {
            this._timerKey = G.GameTimer.loop(500, this, this.onTimer)
        }
        this.onTimer();
    }

    /**移除计时器*/
    protected removeTimer(): void {
        if (this._timerKey) {
            G.GameTimer.clearByKey(this._timerKey)
            this._timerKey = null
        }
    }

    protected onTimer(): void {
        let nowTime: number = G.TimeManager.serverNow;
        let remianTime: number = this._nextAttackTime - nowTime;
        if (remianTime <= 0) {
            //没有占领
            this.removeTimer();
            this.view.lbAttackTime.text = '';
            return;
        }
        this.view.lbAttackTime.text = '建筑进攻冷却:' + TimeUtils.formatTimeMsToPositiveTimeText(remianTime);
    }

    private onClickBuilding() {
        if (!GIns.battleMgr.isNoEnemyInSearchRange()) {
            GIns.floatingTextMgr.showTips(UIMain18nKeys.ELIMINATE_ENEMY_TIPS);
            return;
        }

        if (this._curBuildingId) {
            let cfg: table.map.MapBuildingConfig = G.TableManager.getDataById(table.map.MapBuildingConfig, this._curBuildingId);
            {
                //其他建筑
                let isUnlock = GIns.mapMgr.getBuildingUnlockById(this._curBuildingId);
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
                        if (cfg.building_type == MapObjectType.factories) {
                            //工厂
                            let args: ILeagueExploreBuildingOpenArgs = { buildingId: this._curBuildingId };
                            G.UIManager.open(UILeagueExploreConfig.LeagueExploreFactoryWin, args);
                        } else if (cfg.building_type == MapObjectType.mine) {
                            //矿
                            let args: ILeagueExploreBuildingOpenArgs = { buildingId: this._curBuildingId };
                            G.UIManager.open(UILeagueExploreConfig.LeagueExploreMineWin, args);
                        }
                    }
                } else {
                    let unlock: boolean = GIns.conditionMgr.checkCondition(cfg.openVerify);
                    if (!unlock) {
                        G.UIManager.open(UIMapKey.MAP_CONDITIONALPOPUP, cfg);
                        return;
                    }

                    if (cfg.costItems) {
                        if (!GIns.backpackMgr.isCanPayTheseItemArrayByConfig(cfg.costItems, false)) {
                            //临时处理，道具不足弹窗可能卡引导
                            GIns.floatingTextMgr.showTips("道具不足！");
                            return;
                        }
                    }
                    //解锁
                    G.UIManager.open(UICommonKey.UnlockBuildingAnimWin, { curBuildingId: this._curBuildingId });
                }
            }
        }
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        if (!isReopen) {
            GIns.leagueExploreModel.isLoadMiniMap = false;
            G.GameTimer.once(2000, this, () => {
                if (this.view.node?.isValid) {
                    GIns.leagueExploreModel.isLoadMiniMap = true;
                }
            });
        }
        let playerComp = FguiScriptUtils.toMyScriptClass(this.view.headPlayer, PlayerCom);
        playerComp.resetForMe();

        // this.updateMiniMap();
        this.updateMapName();

        FguiScriptUtils.toMyScriptClass(this.view.nightTip, LeagueExploreNightTimeTip).updateUI();
    }

    protected onClose(dontDispose?: boolean): void {
        this.removeTimer();
    }
}