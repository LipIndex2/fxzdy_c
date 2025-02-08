import { Vec2 } from "cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { FightType } from "../../../comm/battle/enum/FightType";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { ITransfer } from "../../../tiledMap/interface/ITransfer";
import { HeaderItem } from "../../common/header/HeaderItem";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { UIFormationKey } from "../../formation/const/UIFormationConfig";
import { RankUIKeys } from "../../rank/RankUIKeys";
import { RankMainViewOpenArgs } from "../../rank/view/RankMainView";
import { ShopType } from "../../shop/const/UIShopConst";
import { IPetDungeonToyOpenArgs, IPetDungeonTransOpenArgs, UIPetDungeonConfig } from "../const/UIPetDungeonConfig";
import { PetDungeonTitleComp } from "./component/PetDungeonTitleComp";
import { PetDungeonHeroItem } from "./item/PetDungeonHeroItem";

@bindScript(UIPetDungeonConfig.PetDungeonMapView)
export class PetDungeonMapView extends UIPage {
    static pkgName: string = "petDungeon";
    static viewName: string = "PetDungeonMapView";

    protected _upHeroIds: number[] = [];

    protected _isWaitAutoOpenToy: boolean = false;
    /**传送动画数据 暂时记录*/
    protected _transOpenArgs: IPetDungeonTransOpenArgs = null;
    private get view(): ui.petDungeon.view.PetDungeonMapView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.PET_DUNGEON_INFO_CHANGE,
            NotificationKey.ENTER_WORLD,
            NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION,
            NotificationKey.CLOSE_ViEW,
            NotificationKey.LOADING_VIEW_COMPLETE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.PET_DUNGEON_INFO_CHANGE:
                this.updateUI();
                break;
            case NotificationKey.ENTER_WORLD:
                this.onEnterWorldHandler(args[0], args[1]);
                break;
            case NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION:
                if (args == FightType.PET_DUNGEON) {
                    this.updateUI();
                }
                break;
            case NotificationKey.CLOSE_ViEW:
                if (args == UIPetDungeonConfig.PetDungeonToyWin) {
                    //关闭玩具界面继续播放传送动画
                    if (this._transOpenArgs) {
                        G.UIManager.open(UIPetDungeonConfig.PetDungeonTransferAnimWin, this._transOpenArgs);
                    }
                    this._transOpenArgs = null;
                }
                break;
            case NotificationKey.LOADING_VIEW_COMPLETE:
                if (this._isWaitAutoOpenToy) {
                    let openArgs: IPetDungeonToyOpenArgs = { isAutoOpen: true };
                    G.UIManager.open(UIPetDungeonConfig.PetDungeonToyWin, openArgs);
                }
                this._isWaitAutoOpenToy = false;
                break;

        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.listHero.setVirtual();
        this.view.listHero.itemRenderer = this.itemRendererForHero.bind(this);
        this.view.btnGo.onClick(this.onClickGo, this);
        this.view.btnRank.onClick(this.onClickRank, this);
        this.view.btnShop.onClick(this.onClickShop, this);
        this.view.btnBack.onClick(this.onClickBack, this);
        this.view.btnEdit.onClick(this.onClickEdit, this);
        this.view.btnReset.onClick(this.onClickReset, this);
        this.view.btnBox.onClick(this.onClickBox, this);

        this.initHeaderItems();
        this.view.btnBox.icon = GIns.petDungeonModel.constCfg.toyBoxIcon;

        FguiScriptUtils.toMyScriptClass(this.view.btnBox.redDot, RedDotCom).reset(RedDotKeys.PetDungeon_newToy);
    }

    protected onPreDispose(): void {

    }

    protected initHeaderItems(): void {
        let headerItems: HeaderItem[] = [
            FguiScriptUtils.toMyScriptClass(this.view.headerItem1, HeaderItem),
            FguiScriptUtils.toMyScriptClass(this.view.headerItem2, HeaderItem),
            FguiScriptUtils.toMyScriptClass(this.view.headerItem3, HeaderItem),
            FguiScriptUtils.toMyScriptClass(this.view.headerItem4, HeaderItem),
        ]

        headerItems.forEach((ui, index) => {
            let cfg = G.TableManager.getDataById(table.petdungeon.PetDungeonHeaderItemConfig, index + 1);
            if (!cfg) {
                ui.visible = false;
                return;
            }
            ui.visible = true;
            ui.reset(cfg.itemId, cfg.canBuyFlag, false);
        });
    }

    protected itemRendererForHero(index: number, item: PetDungeonHeroItem): void {
        item.setDataById(this._upHeroIds[index]);
    }

    protected onEnterWorldHandler(pos: { x: number; y: number }, data: ITransfer): void {
        if (data?.mapId == GIns.petDungeonModel.constCfg.mapId) {
            //是宠物副本地图
            let curFloorId = GIns.petDungeonModel.curMaxFloorId;
            let lastFloorId = GIns.petDungeonMgr.curMapViewFloorId;
            if (lastFloorId < curFloorId && GIns.petDungeonModel.isFloorMax == false) {
                //代表是在前进需要显示前进动画
                let nextFloorCfg = GIns.petDungeonMgr.getNextFloorBuildingCfg();
                if (nextFloorCfg) {
                    let transOpenArgs: IPetDungeonTransOpenArgs = {
                        endPos: GIns.petDungeonMgr.getEndPos(),
                        transTargetPos: null,
                        transPointPos: null,
                    }
                    if (data.isExitBattle) {
                        //从战斗中返回 播放返回动画
                        if (nextFloorCfg.backTransIds?.length >= 2) {
                            let pointCfg = G.TableManager.getDataById(table.map.MapBuildingConfig, nextFloorCfg.backTransIds[1]);
                            if (pointCfg && pointCfg.transferPos && pointCfg.transferPos.length >= 2) {
                                //传送点的坐标
                                transOpenArgs.transPointPos = new Vec2(pointCfg.transferPos[0], pointCfg.transferPos[1]);
                            }
                            if (nextFloorCfg.startTransId > 0) {
                                let pointCfg = G.TableManager.getDataById(table.map.MapBuildingConfig, nextFloorCfg.startTransId);
                                if (pointCfg && pointCfg.transferPos && pointCfg.transferPos.length >= 2) {
                                    //传送点的坐标
                                    transOpenArgs.transTargetPos = new Vec2(pointCfg.transferPos[0], pointCfg.transferPos[1]);
                                }
                            } else {
                                //代表是出生点
                                let mapCfg = G.TableManager.getDataById(table.map.MapidConfig, GIns.petDungeonModel.constCfg.mapId);
                                if (mapCfg && mapCfg.transferPos && mapCfg.transferPos.length >= 2) {
                                    transOpenArgs.transTargetPos = new Vec2(mapCfg.transferPos[0], mapCfg.transferPos[1]);
                                }
                            }
                        }
                    } else {
                        //进入播放进入动画
                    }
                    if (data.isExitBattle && GIns.petDungeonModel.isBattleGetToy) {
                        //获得玩具优先显示玩具界面
                        this._isWaitAutoOpenToy = true;
                        this._transOpenArgs = transOpenArgs;
                    } else {
                        if (transOpenArgs.endPos) {
                            G.UIManager.open(UIPetDungeonConfig.PetDungeonTransferAnimWin, transOpenArgs);
                        }
                    }
                }
            }
            GIns.petDungeonMgr.curMapViewFloorId = curFloorId;
        }
    }

    protected onClickGo(): void {
        if (GIns.petDungeonModel.isFloorMax) {
            //已通关
            GIns.floatingTextMgr.showTips('已完成本轮探索，请重置~');
            return;
        }
        let floorId = GIns.petDungeonModel.nextFloorCfg?.id;
        if (floorId > 0) {
            G.UIManager.open(UIPetDungeonConfig.PetDungeonChallengeWin, floorId);
        }
    }

    protected onClickRank(): void {
        G.UIManager.open(RankUIKeys.RankMainView, RankMainViewOpenArgs.create(ServerEnums.RankingType.PET_DUNGEON));
    }

    protected onClickShop(): void {
        GIns.shopModel.openShopMain(ShopType.PET_DUNGEON);
    }

    protected onClickBack(): void {
        this.closeSelf();
        this.emit(NotificationKey.MAP_EXIT_OTHER);
    }

    protected onClickEdit(): void {
        G.UIManager.open(UIFormationKey.FORMATION_MAIN_VIEW, { type: FightType.PET_DUNGEON });
    }

    protected onClickReset(): void {
        GIns.petDungeonMgr.resetFloor();
    }

    protected onClickBox(): void {
        G.UIManager.open(UIPetDungeonConfig.PetDungeonToyWin);
    }

    protected updateUI(): void {
        let myInfo = GIns.petDungeonModel.activityInfo?.playerInfoVo;
        if (!myInfo) {
            return;
        }
        if (GIns.petDungeonModel.isFloorMax) {
            //已通关
            this.view.getController('state').selectedIndex = 1;
            return
        }

        this.view.getController('state').selectedIndex = 0;

        this._upHeroIds.length = 0;
        let formationVo = GIns.formationMgr.getFormationVoByType(FightType.PET_DUNGEON);
        formationVo?.allPosData?.forEach((value) => {
            if (value.heroId > 0) {
                this._upHeroIds.push(value.heroId);
            }
        })
        this.view.listHero.numItems = this._upHeroIds.length;
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        if (!isReopen) {
            //初始化重置id记录
            GIns.petDungeonMgr.curMapViewFloorId = -1;
        }
        this.updateUI();
        FguiScriptUtils.toMyScriptClass(this.view.tilteComp, PetDungeonTitleComp).updateUI();
    }

    protected onClose(dontDispose?: boolean): void {
        //关闭时记录最新的关卡记录
        GIns.petDungeonMgr.curMapViewFloorId = GIns.petDungeonModel.curMaxFloorId;
    }
}