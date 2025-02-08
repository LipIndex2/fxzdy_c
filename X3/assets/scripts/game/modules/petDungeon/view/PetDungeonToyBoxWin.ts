import { Rect } from "cc";
import G from "db://assets/scripts/core/comm/G";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { IAdPlayVo } from "../../ad/model/vo/IAdPlayVo";
import { EnumRedDotReadType } from "../../common/redDot/enums/EnumRedDotReadType";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { IPetDungeonToyDragContainer } from "../const/IPetDungeonToyDragContainer";
import { PetDungeonToyDragFrom, UIPetDungeonConfig } from "../const/UIPetDungeonConfig";
import { PetDungeonToyDelBtn } from "./component/PetDungeonToyDelBtn";
import { IPetDungeonToyDragTarget, PetDungeonToyDragComp } from "./component/PetDungeonToyDragComp";
import { PetDungeonToyBoxItem } from "./item/PetDungeonToyBoxItem";
import { ViewEffectComp2 } from "db://assets/scripts/core/mvc/view/comp/ViewEffectComp2";
import { ViewBlackBgComp } from "db://assets/scripts/core/mvc/view/comp/ViewBlackBgComp";

@bindScript(UIPetDungeonConfig.PetDungeonToyBoxWin)
export class PetDungeonToyBoxWin extends UICommWin implements IPetDungeonToyDragContainer {
    static pkgName: string = "petDungeon";
    static viewName: string = "PetDungeonToyBoxWin";

    /**初始缩放比例*/
    protected _initScale: number = 0.9;
    /**缩放特效开始放大比例*/
    protected _startScale: number = 1.15;
    /**缩放特效时间*/
    protected _scaleInterval: number = 0.15;

    protected _toyBoxVo: Vo.petdungeon.PetDungeonToyBox = null;
    protected _toyVos: Vo.petdungeon.PetDungeonToy[] = [];

    protected _costName: string = '';
    protected _boxCnt:number = 0;
    public get view(): ui.petDungeon.view.PetDungeonToyBoxWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.PET_DUNGEON_TOY_UPDATE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.PET_DUNGEON_TOY_UPDATE:
                this.updateUI();
                break;
        }
    }

    protected initEffectComp(): void {
        //自定义弹框特效
        this.addComp(new ViewEffectComp2(this.view, (this.getComp(ViewBlackBgComp) as ViewBlackBgComp).bg));
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.btnBox.visible = false;
        this.view.btnDel.visible = false;
        this.view.btnBox.touchable = false;
        this.view.btnBox.icon = GIns.petDungeonModel.constCfg.toyBoxIcon;

        this.view.listToy.setVirtual();
        this.view.listToy.itemRenderer = this.itemRendererForToy.bind(this);

        this.view.btnAd.onClick(this.onClickAd, this);
        this.view.btnRefresh.onClick(this.onClickRefresh, this);
        this.view.btnDel.onClick(this.onClickDel, this);

        this._costName = '道具';
        if (GIns.petDungeonModel.constCfg.refreshToyBoxCosts?.length > 0) {
            let cost = GIns.petDungeonModel.constCfg.refreshToyBoxCosts[0];
            let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, cost.k);
            let itemName: string = itemCfg ? G.I18nManager.lang(itemCfg.name) : ''
            this.view.btnRefresh.title = `${cost.v}${itemName}刷新`;
            this._costName = itemName;
        } else {
            this.view.btnRefresh.title = '刷新'
        }

        //初始化拖动
        let delRect = new Rect(this.view.btnDel.x, this.view.btnDel.y, this.view.btnDel.width, this.view.btnDel.height);
        let dragComp = FguiScriptUtils.toMyScriptClass(this.view.dragComp, PetDungeonToyDragComp);
        let dragTarget: IPetDungeonToyDragTarget = {
            contaier: this,
            froms: [PetDungeonToyDragFrom.Box],
            cellRect: null,
            boxRect: null,
            delRect: delRect,
            cellW: 72,
            cellGap: 3,
        }
        dragComp?.setTarget(dragTarget);
        dragComp.onDragComplete = this.onDragComplete.bind(this);
    }

    protected onPreDispose(): void {
        G.GameTimer.clearAll(this);
    }

    protected onDragComplete(): void {
        let dragComp = FguiScriptUtils.toMyScriptClass(this.view.dragComp, PetDungeonToyDragComp);
        if (dragComp.isCollideDel) {
            //删除玩具
            GIns.petDungeonMgr.deleteToy(dragComp.args.id, dragComp.args.toyConfigId);
            return;
        }
    }

    protected itemRendererForToy(index: number, item: PetDungeonToyBoxItem): void {
        item.setData(this._toyVos[index], PetDungeonToyDragFrom.Box);
    }

    protected onClickAd(): void {
        if (this.isCanRefreshBox(true)) {
            let args: IAdPlayVo = {
                type: ServerEnums.AdvertType.REFRESH_PET_DUNGEON_TOY_BOX
            }
            this.emit(NotificationKey.AD_START_PLAY, args);
        }

    }

    protected onClickRefresh(): void {
        if (this.isCanRefreshBox()) {
            if (GIns.backpackMgr.isCanPayTheseItemArrayByConfig(GIns.petDungeonModel.constCfg.refreshToyBoxCosts, true) == false) {
                GIns.floatingTextMgr.showTips(`${this._costName}不足`);
                return;
            }
            GIns.petDungeonModel.sendRefreshToyBox({ advert: false });
        }
    }

    public isCanRefreshBox(isAd: boolean = false): boolean {
        if (this._toyBoxVo.count > this._toyBoxVo.toyBoxList.length) {
            GIns.floatingTextMgr.showTips('已选择过宝箱内玩具，不可再刷新！');
            return false;
        }
        if (this._toyBoxVo.count > this._toyBoxVo.toyBoxList.length) {
            GIns.floatingTextMgr.showTips('刷新次数不足！');
            return false;
        }
        if (isAd) {
            //广告需要判断广告总次数
            let remainTimes = GIns.adModel.getRemainAdTimes(GIns.petDungeonModel.activityInfo.playerInfoVo.alreadyAdvertRefreshCount, ServerEnums.AdvertType.REFRESH_PET_DUNGEON_TOY_BOX);
            if (remainTimes <= 0) {
                GIns.floatingTextMgr.showTips('广告次数不足！');
                return false;
            }
        }
        return true;
    }

    protected onClickDel(): void {
        GIns.floatingTextMgr.showTips('拖至此处可丢弃');
    }

    public updateTempBoxCell(dragValues: number[], boxValues: number[], isCanAdd: boolean): void {
        //没有格子
    }

    public setDelOpen(value: boolean): void {
        FguiScriptUtils.toMyScriptClass(this.view.btnDel, PetDungeonToyDelBtn).isOpen(value);
    }

    public updateBoxCell(values: number[]): void {

    }

    protected updateUI(): void {
        let myInfo = GIns.petDungeonModel.activityInfo.playerInfoVo;
        let boxCnt: number = 0;
        if (myInfo.toyBoxList) {
            boxCnt = myInfo.toyBoxList.length;
        }
        let isShowAni:boolean = false;
        if (this._boxCnt != boxCnt) {
            if (this._boxCnt != 0) {
                //代表变化
                isShowAni = true;
            }
            this._boxCnt = boxCnt;
        }
        if (myInfo.toyBoxList?.length > 0) {
            this._toyBoxVo = myInfo.toyBoxList[0];
            this._toyVos = this._toyBoxVo.toyBoxList;
        } else {
            this._toyVos = [];
            this.closeSelf();
            return;
        }
        if (isShowAni) {
            //有切换动画
            this.view.listToy.numItems = 0;
            this.view.touchable = false;
            this.view.getTransition('t0').play();
            G.GameTimer.once(500, this, () => {
                this.view.touchable = true;
                GIns.floatingTextMgr.showTips('当前玩具宝箱已领完');
                this.updateUIAfterAni();
            });
        } else {
            this.updateUIAfterAni();
        }
    }

    protected updateUIAfterAni():void {
        this.view.listToy.numItems = this._toyVos.length;
        let remainCnt = Math.max(0, GIns.petDungeonModel.constCfg.toyBoxRefreshCount - this._toyBoxVo.refreshCount);
        this.view.lbTimes.text = `剩余刷新次数：${remainCnt}`;
        this.view.btnBox.title = `暂存宝箱:${this._boxCnt}`;
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this.updateUI();
        if (args?.isAutoOpen && !isReopen) {
            GIns.floatingTextMgr.showTips('恭喜获得玩具宝箱！');
        }
        GIns.redDotMgr.markRead(EnumRedDotReadType.ONCE, RedDotKeys.PetDungeon_newToy);

        G.GameTimer.once(130, this, () => {
            this.view.btnBox.visible = true;
            this.view.btnDel.visible = true;
        });
    }

    protected onClose(dontDispose?: boolean): void {

    }
}