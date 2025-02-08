import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { BtnConfirmViewOpenArgs } from "../../common/confirm/BtnConfirmView";
import { UICommonKey } from "../../common/const/UICommonConfig";
import { HeaderItem } from "../../common/header/HeaderItem";
import { CommonI18nKeys } from "../../common/i18n/CommonI18nKeys";
import { RankUIKeys } from "../../rank/RankUIKeys";
import { RankMainViewOpenArgs } from "../../rank/view/RankMainView";
import { ShopType } from "../../shop/const/UIShopConst";
import { UIPetDungeonConfig } from "../const/UIPetDungeonConfig";
import { PetDungeonTitleComp } from "./component/PetDungeonTitleComp";

@bindScript(UIPetDungeonConfig.PetDungeonMainView)
export class PetDungeonMainView extends UIPage {
    static pkgName: string = "petDungeon";
    static viewName: string = "PetDungeonMainView";

    protected _isSweep: boolean = false;

    private get view(): ui.petDungeon.view.PetDungeonMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.PET_DUNGEON_INFO_CHANGE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.PET_DUNGEON_INFO_CHANGE:
                this.updateUI();
                break;
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.btnEnter.onClick(this.onClickEnter, this);
        this.view.btnRank.onClick(this.onClickRank, this);
        this.view.btnShop.onClick(this.onClickShop, this);
        this.view.btnBack.onClick(this.closeSelf, this);

        this.initHeaderItems();
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

    protected onClickEnter(): void {
        let myInfo = GIns.petDungeonModel.activityInfo?.playerInfoVo;
        if (!myInfo) {
            return;
        }
        if (this._isSweep) {
            let sweepFloor = GIns.petDungeonModel.getSweepFloorId();
            let cfg = G.TableManager.getDataById(table.petdungeon.PetDungeonConfig, sweepFloor + 1);
            let cfgName: string = cfg ? cfg.name : '';
            G.UIManager.open(UICommonKey.BtnConfirmView, {
                title: null,
                titleConfirm: CommonI18nKeys.confirm,
                titleCancel: '直接进入',
                content: `是否进行扫荡？<br/>扫荡后会到达${cfgName}。`,
                onBtnYes: () => {
                    GIns.petDungeonModel.sendSweep();
                },
                closeCb: (isClickYes: boolean) => {
                    if (isClickYes == false) {
                        GIns.petDungeonMgr.enterPetDungeon();
                    }
                }
            } as BtnConfirmViewOpenArgs);
        } else {
            GIns.petDungeonMgr.enterPetDungeon();
        }
    }

    protected onClickRank(): void {
        G.UIManager.open(RankUIKeys.RankMainView, RankMainViewOpenArgs.create(ServerEnums.RankingType.PET_DUNGEON));
    }

    protected onClickShop(): void {
        GIns.shopModel.openShopMain(ShopType.PET_DUNGEON);
    }

    protected updateUI(): void {
        let myInfo = GIns.petDungeonModel.activityInfo?.playerInfoVo;
        if (!myInfo) {
            return;
        }
        this._isSweep = GIns.petDungeonModel.isCanSweep();
        if (this._isSweep) {
            this.view.btnEnter.title = '扫荡';
        } else {
            this.view.btnEnter.title = '冒险';
        }
        let maxFloorId: number = myInfo.seasonMaxFloor;
        let cfg = G.TableManager.getDataById(table.petdungeon.PetDungeonConfig, maxFloorId);
        let chapterName: string = cfg ? cfg.name : '无';
        this.view.lbChapter.text = `赛季最高：<color=#50FFF9>${chapterName}</color>`;
        if (GIns.petDungeonModel.isFloorMax) {
            //已通关
            this.view.lbNextChapter.text = `当前探索：<color=#50FFF9>已完成</color>`;
        } else {
            let nextCfg = GIns.petDungeonModel.nextFloorCfg;
            let nextChapterName: string = nextCfg ? nextCfg.name : '无';
            this.view.lbNextChapter.text = `当前探索：<color=#50FFF9>${nextChapterName}</color>`
        }
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this.updateUI();
        FguiScriptUtils.toMyScriptClass(this.view.tilteComp, PetDungeonTitleComp).updateUI();

        this.view.getTransition('enter').play();
    }

    protected onClose(dontDispose?: boolean): void {

    }
}