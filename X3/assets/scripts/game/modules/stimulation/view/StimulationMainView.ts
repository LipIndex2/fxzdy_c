import G from "db://assets/scripts/core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { CameraAnimUtils } from "../../../tiledMap/CameraAnimUtils";
import { ModelNode } from "../../common/node/ModelNode";
import { StimulationBattleLogic } from "../battle/StimulationBattleLogic";
import { UIStimulationConfig } from "../const/UIStimulationConfig";
import { IStimulationAddition } from "../model/vo/IStimulationAddition";
import { IStimulationData } from "../model/vo/IStimulationData";
import { IStimulationLastData } from "../model/vo/IStimulationLastData";
import { StimulationMainBottom } from "./component/StimulationMainBottom";
import { StimulationMainTop } from "./component/StimulationMainTop";

/**
 * 经营主界面
 */
@bindScript(UIStimulationConfig.StimulationMainView)
export class StimulationMainView extends UIPage {

    static pkgName: string = "stimulation";
    static viewName: string = "StimulationMainView";

    /**建筑id*/
    protected _buildingId: number = 0;
    /**经营数据*/
    protected _data: IStimulationData = null;
    protected _lastData: IStimulationLastData = null;
    protected _curAddition: IStimulationAddition = null;

    protected _battleLogic: StimulationBattleLogic = new StimulationBattleLogic();

    private get view(): ui.stimulation.view.StimulationMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.STIMULATION_DISPATCH_COMPLETE,
            NotificationKey.STIMULATION_DEVICE_UPDATE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.STIMULATION_DISPATCH_COMPLETE:
                let heroIds = this.getDispatchHeroIds();
                this._battleLogic.updateHeroIds(heroIds);
                break;
            case NotificationKey.STIMULATION_DEVICE_UPDATE:
                if (args == 0 || args == this._data.cfg.cfg.id) {
                    this.updateUI();
                    this.checkAndPlayLvUpAni();
                }
                break;
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.footer.btnBack.onClick(this.onClickBack, this);
    }

    protected onPreDispose(): void {

    }

    protected onClickBack(): void {
        this.closeSelf();
    }

    protected get topPanel(): StimulationMainTop {
        return FguiScriptUtils.toMyScriptClass(this.view.pTop, StimulationMainTop);
    }

    protected get bottomPanel(): StimulationMainBottom {
        return FguiScriptUtils.toMyScriptClass(this.view.pBottom, StimulationMainBottom);
    }

    protected checkAndPlayLvUpAni(): void {
        if (this._lastData && this._lastData.lv != 0 && this._data?.vo?.level > this._lastData.lv && this._curAddition) {
            let curSpeed: number = this._curAddition.itemAmountPerHour;
            let changeSpeed: number = curSpeed - this._lastData.speed;
            let changeCapacity: number = this._data.vo.capacity - this._lastData.capacity;
            GIns.floatingTextMgr.showAttrItem('储量+' + changeCapacity, this.view.buildingPos);
            G.GameTimer.once(200, this, () => {
                GIns.floatingTextMgr.showAttrItem('效率+' + GIns.stimulationMgr.getSpeedShowStr(this._data, changeSpeed, false), this.view.buildingPos);
            })
            GIns.floatingTextMgr.showTips('设备升级完成');
            this.playLvUpAni();
        }
        GIns.stimulationModel.syncDataToLast(this._data, this._curAddition.itemAmountPerHour);
    }

    protected updateUI(): void {
        this._curAddition = GIns.stimulationMgr.getAdditionMap(this._data, this._data.vo.level);
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._buildingId = args;
        this._data = GIns.stimulationModel.getDeviceDataByBuilding(args);
        this._lastData = GIns.stimulationModel.getLastData(this._data.cfg.cfg.id);
        if (this._data == null || this._data.vo == null) {
            //数据不存在或者未激活
            this.closeSelf();
            return
        }
        if (!isReopen) {
            //入场动画
            let buildNode = GIns.mapMgr.getBuildingNode(args)
            if (buildNode) {
                //计算出需要聚焦的坐标
                let centerY: number = this.view.height * 0.5;
                let offsetY: number = this.view.buildingPos.y - centerY;

                let namePosY: number = buildNode.cfg.namePos?.length >= 2 ? buildNode.cfg.namePos[1] : 0
                //建筑一半的高度
                offsetY += namePosY * 0.5;
                CameraAnimUtils.focusPositison(250, { x: buildNode.mapObject.x, y: buildNode.mapObject.y + offsetY }, 1.2);
                GIns.mapMgr.curMap.cancelFocus();
            }
            this.view.pTop.getTransition('enter').play();
            this.view.pBottom.getTransition('enter').play();
            this.topPanel.setData(this._data);
            this.bottomPanel.setData(this._data);
        }

        GIns.mapVisibleMgr.hideAllBuildings([args]);
        GIns.battleExpandMgr.hideHeroes();
        this._battleLogic.init(this.getDispatchHeroIds(), args, GIns.worldMgr.roleLayer);
        this._battleLogic.start();

        this.updateUI();
        G.GameTimer.once(300, this, this.checkAndPlayLvUpAni);
    }

    protected getDispatchHeroIds(): number[] {
        let heroIds: number[] = []
        if (this._data?.vo?.dispatchIndex2HeroBaseId) {
            for (let key in this._data.vo.dispatchIndex2HeroBaseId) {
                heroIds.push(this._data.vo.dispatchIndex2HeroBaseId[key]);
            }
        }
        return heroIds;
    }

    protected playLvUpAni(): void {
        let aniNode = this.view.spineLvUp as ModelNode;
        aniNode.loadByPath("spine/ui/shengjibiaoxian/shengjibiaoxian1_upper");
        aniNode.playOrders([
            {
                name: "enter",
                isLoop: false,
            },
        ]);
    }

    protected onClose(dontDispose?: boolean): void {
        if (!dontDispose) {
            CameraAnimUtils.resetFocusPositison(50);
            GIns.mapMgr.curMap.refreshFocusBuilding();
        }
        GIns.mapVisibleMgr.showAllBuildings();
        GIns.battleExpandMgr.showHeroes();
        this._battleLogic.stop();

    }
}