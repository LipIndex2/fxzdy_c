import * as fgui from "fairygui-cc";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { UIMiniMapKey } from "../const/UIMiniMapConfig";
import G from "../../../../core/comm/G";
import { MiniMapManager } from "../MiniMapManager";
import { Vec2 } from "cc";
import { MiniMapCollectionItem } from "../item/MiniMapCollectionItem";
import NotificationKey from "../../../event/NotificationKey";
import { MiniMapShowBuildingItem } from "../item/MiniMapShowBuildingItem";
import { MapManager } from "../../../tiledMap/MapManager";
import { TableManager } from "../../../../core/table/TableManager";
import { LayoutUtils } from "../../../../core/utils/LayoutUtils";
import { UITransform } from "cc";
import { Input } from "cc";
import { TouchUtils } from "../../../../core/utils/TouchUtils";
import GIns from "../../../GIns";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";

/**
 * 小地图主页
 */
export class MiniMapMainView extends UIPage {
    static pkgName: string = "miniMap";
    static viewName: string = "MiniMapMainView";

    private _mapCfg: table.map.MapidConfig;

    private get view(): ui.miniMap.MiniMapMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.MAP_TEAN_POS_UPDATE];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.MAP_TEAN_POS_UPDATE:
                //@ts-ignore
                // let mapitem = this.view.mapItem as MiniMapIconItem;
                // mapitem.setMapPos(args)
                break;
        }
    }

    protected onInit(): void {
        this.view.btn_back.on(fgui.Event.CLICK, this.closeSelf, this);
        this.view.btn_boss.on(fgui.Event.CLICK, this.onBossClick, this);

        this.view.topItem.btn_tips.on(fgui.Event.CLICK, this.onTipsClick.bind(this, 2), this);
        this.view.topItem.btn_tips2.on(fgui.Event.CLICK, this.onTipsClick.bind(this, 1), this);
        this.view.topItem.btn_tips3.on(fgui.Event.CLICK, this.onTipsClick.bind(this, 0), this);

        this.view.gp_map.draggable = true;
        // this.view.mapItem.map.on(fgui.Event.TOUCH_BEGIN, this.onTouchBegin, this);
        // this.view.mapItem.map.on(fgui.Event.TOUCH_MOVE, this.onTouchMove, this);
        // this.view.mapItem.map.on(fgui.Event.TOUCH_END, this.onTouchEnd, this);

        this.view.gp_map.on(fgui.Event.TOUCH_MOVE, this.updateMiniMapBuildingPos, this);

        this.view.btn_add.on(fgui.Event.CLICK, this.onAddClick, this);
        this.view.btn_subtract.on(fgui.Event.CLICK, this.onSubtractClick, this);

        this.view.sliderItem.on(fgui.Event.STATUS_CHANGED, this.onSliderChange, this);

        // 触摸外部
        this.view.on(Input.EventType.TOUCH_END, this.onOutClick, this);

        LayoutUtils.setScreenCenter(this.view.mapBg);

        //红点
        FguiScriptUtils.toMyScriptClass(this.view.btn_boss.redDot, RedDotCom).reset(RedDotKeys.Map_enter);
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this.updateMiniMap();
        this.updateView();
    }

    protected onClose(): void {}

    private updateView(): void {
        if (MiniMapManager.ins().MapStarId) {
            this.view.topItem.visible = true;
            // @ts-ignore
            let item = this.view.topItem as MiniMapCollectionItem;
            item.setData(MiniMapManager.ins().MapStarId);
        } else {
            this.view.topItem.visible = false;
        }

        //暂时隐藏
        // this.view.topItem.visible = false;

        this._mapCfg = TableManager.getDataById(table.map.MapidConfig, GIns.mapMgr.getMapID());
        this.view.sliderItem.max = this._mapCfg.default_limit[0];
        this.view.sliderItem.min = this._mapCfg.default_limit[1];
        this.view.sliderItem.value = this._mapCfg.default_scale;

        this.view.gp_map.setScale(this.view.sliderItem.value, this.view.sliderItem.value);

        let starCfg = TableManager.getDataById(table.map.TrunkMapStarConfig, this._mapCfg.starId);
        if (starCfg) {
            this.view.T_name.text = `${starCfg.name}`;
        }

        //提示
        // let cfgs = GIns.miniMapMgr.getUnLockAreaCfgs(GIns.miniMapMgr.MapStarId);
        // if (cfgs.length > 0) {
        //     this.view.tipsItem.T_tips.text = `解锁${cfgs[0].chapter_name}增加上限`;
        //     this.view.tipsItem.width = Math.floor(this.view.tipsItem.T_tips.width) + 30;
        // } else {
        // }
        this.view.tipsItem.visible = false;
    }

    /**更新小地图*/
    public updateMiniMap(): void {
        //@ts-ignore
        let mapitem = this.view.gp_map.mapItem as MiniMapShowBuildingItem;
        mapitem.updateData(true);
        mapitem.setMiniMapPosition(MapManager.ins().getMapPos());
        // this.view.mapItem.map.icon = MiniMapManager.ins().getMiniMapPath();
        this.view.mapBg.icon = MiniMapManager.ins().getMiniMapBgPath();
    }

    private updateMiniMapBuildingPos(): void {
        //@ts-ignore
        // let mapitem = this.view.mapItem as MiniMapShowBuildingItem;
        // mapitem.setMiniMapIcon();
    }

    private onSliderChange(evt: any) {
        this.view.gp_map.setScale(this.view.sliderItem.value, this.view.sliderItem.value);

        //@ts-ignore
        this.view.gp_map.mapItem.iconScale(this.view.sliderItem.value);
    }

    private onAddClick() {
        let value = (this._mapCfg.default_limit[1] - this._mapCfg.default_limit[0]) / 4 + this.view.sliderItem.value;
        value = value > this._mapCfg.default_limit[1] ? this._mapCfg.default_limit[1] : value;
        value = value < this._mapCfg.default_limit[0] ? this._mapCfg.default_limit[0] : value;
        this.view.sliderItem.value = value;
        this.view.gp_map.setScale(value, value);

        //@ts-ignore
        this.view.gp_map.mapItem.iconScale(this.view.sliderItem.value);
    }

    private onSubtractClick() {
        let value = this.view.sliderItem.value - (this._mapCfg.default_limit[1] - this._mapCfg.default_limit[0]) / 4;
        value = value > this._mapCfg.default_limit[1] ? this._mapCfg.default_limit[1] : value;
        value = value < this._mapCfg.default_limit[0] ? this._mapCfg.default_limit[0] : value;
        this.view.sliderItem.value = value;
        this.view.gp_map.setScale(value, value);

        //@ts-ignore
        this.view.gp_map.mapItem.iconScale(this.view.sliderItem.value);
    }

    // private _touchId1: number;
    // private _touchId2: number;
    // private _startPos1: Vec2 = new Vec2();
    // private _startPos2: Vec2 = new Vec2();
    // private _isDoubleTouch: boolean = false;
    // private onTouchBegin(evt: any) {
    //     let touchId = evt.touchId + 1;
    //     if (!this._touchId1 || this._touchId1 == touchId) {
    //         this._touchId1 = touchId;
    //         this._startPos1 = evt.pos;
    //         this._movePos1 = evt.pos;
    //     } else if (touchId != this._touchId1 || this._touchId2 == touchId) {
    //         this._touchId2 = touchId;
    //         this._startPos2 = evt.pos;
    //         this._movePos2 = evt.pos;
    //     }

    //     if (this._touchId1 && this._touchId2 && this._touchId1 != this._touchId2) {
    //         this._isDoubleTouch = true;
    //         this.view.mapItem.map.draggable = false;
    //         this.view.mapItem.map.stopDrag();
    //         console.log("小地图停止拖拽");
    //     } else {
    //         this._isDoubleTouch = false;
    //         this.view.mapItem.map.draggable = true;
    //         this.view.mapItem.map.startDrag(evt.touchId);
    //         console.log("小地图开始拖拽");
    //     }

    //     // console.log("小地图触摸开始：" + evt.touchId);
    // }

    // private _movePos1: Vec2 = new Vec2();
    // private _movePos2: Vec2 = new Vec2();
    // private onTouchMove(evt: fgui.Event) {
    //     let touchId = evt.touchId + 1;
    //     console.log("小地图触摸移动touchId：" + touchId);
    //     console.log("小地图触摸移动Evt：");
    //     console.log(evt);

    //     if (touchId == this._touchId1) {
    //         this._movePos1 = evt.pos;
    //     }
    //     if (touchId == this._touchId2) {
    //         this._movePos2 = evt.pos;
    //     }

    //     if (!this._isDoubleTouch) return;
    //     // let v2 = new Vec2();
    //     // let temp = Vec2.subtract(v2, this.touchPos1, this.touchPos2)
    //     //初始间距
    //     let distance = this.calculateDistance(this._startPos1, this._startPos2);
    //     console.log(`双指初始间距：${distance}, _startPos1: ${this._startPos1}, _startPos2: ${this._startPos2}`);
    //     //当前间距
    //     let distance2 = this.calculateDistance(this._movePos1, this._movePos2);
    //     console.log(`双指当前间距：${distance2}, pos1: ${this._movePos1}, pos2: ${this._movePos2}`);

    //     // 双指当前间距 - 双指初始间距
    //     let diff = distance2 - distance;
    //     console.log("双指当前间距 - 双指初始间距：" + diff);
    //     //每一项量差缩放多少
    //     let diffScale = 0.001;

    //     //缩放值
    //     let scale = 1;

    //     scale = scale + (diff * diffScale);

    //     console.log("缩放值：" + scale);
    //     //小地图缩放
    //     if (scale) {
    //         this.view.mapItem.scaleX = scale;
    //         this.view.mapItem.scaleY = scale;
    //     }

    // }
    // private onTouchEnd(evt: any) {

    //     let touchId = evt.touchId + 1;
    //     console.log("小地图触摸结束：" + touchId);
    //     if (this._touchId1 == touchId) {
    //         this._touchId1 = null
    //         this._movePos1 = null
    //         this.view.mapItem.map.draggable = true;
    //         this._isDoubleTouch = false;
    //         if (this._touchId2) this.view.mapItem.map.startDrag(this._touchId2 - 1);
    //     }
    //     if (this._touchId2 == touchId) {
    //         this._touchId2 = null
    //         this._movePos2 = null
    //         this.view.mapItem.map.draggable = true;
    //         this._isDoubleTouch = false;
    //         if (this._touchId1) this.view.mapItem.map.startDrag(this._touchId1 - 1);
    //     }

    //     console.log()
    // }

    // /**计算两点之间的距离*/
    // private calculateDistance(pointA: Vec2, pointB: Vec2): number {
    //     return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
    // }

    // private onDragMove(evt:any): void {

    //     let touches = evt.target;

    //     //范围宽高
    //     let maxX = this.view.width/2;
    //     let maxY = this.view.height/2;
    //     let minX = maxX - this.view.map.width;
    //     let minY = maxY - this.view.map.height;

    //     let posX = this.view.map.x;
    //     let posY = this.view.map.y;

    //     if(posX < minX){
    //         this.view.map.x = minX;
    //         console.log("超出范围");
    //     }else if(posX > maxX){
    //         this.view.map.x = maxX;
    //         console.log("超出范围");
    //     }

    //     if(posY < minY){
    //         this.view.map.y = minY;
    //         console.log("超出范围");
    //     }else if(posY > maxY){
    //         this.view.map.y = maxY;
    //         console.log("超出范围");
    //     }
    // }

    private onBossClick(): void {
        G.UIManager.open(UIMiniMapKey.MiniMapBossAwardWin);
    }

    //资源提示
    private onTipsClick(index: number, evt: any) {
        this.view.tipsItem.visible = true;
        if (this.view.tipsItem.visible) {
            let showPoint = evt.pos;

            //提示
            let cfgs = GIns.miniMapMgr.getUnLockAreaCfgs(GIns.miniMapMgr.MapStarId);
            if (cfgs.length > 0) {
                this.view.tipsItem.T_tips.text = `解锁${cfgs[cfgs.length - index - 1].chapter_name}增加上限`;
                this.view.tipsItem.width = Math.floor(this.view.tipsItem.T_tips.width) + 30;
            } else {
                this.view.tipsItem.visible = false;
            }

            this.view.tipsItem.x = showPoint.x - (this.view.tipsItem.T_tips.width - 25);
            this.view.tipsItem.y = showPoint.y - 80;
        }
    }

    //点击外部
    private onOutClick(event: any) {
        const isIn1 = TouchUtils.isTouchInUi(event, this.view.topItem.btn_tips._uiTrans);
        const isIn2 = TouchUtils.isTouchInUi(event, this.view.topItem.btn_tips2._uiTrans);
        const isIn3 = TouchUtils.isTouchInUi(event, this.view.topItem.btn_tips3._uiTrans);
        if (!isIn1 && !isIn2 && !isIn3) {
            this.view.tipsItem.visible = false;
        }
    }
}
UIScriptManager.bindScript(UIMiniMapKey.MiniMapMainView, MiniMapMainView);
