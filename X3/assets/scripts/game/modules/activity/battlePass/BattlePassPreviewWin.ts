import * as fgui from "fairygui-cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { ActivityModel } from "../../../comm/activity/model/ActivityModel";
import NotificationKey from "../../../event/NotificationKey";
import { UIActivityKey } from "../const/UIActivityConfig";
import { ActivityBattlePassVo } from "../model/ActivityBattlePassVo";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { FloatingTextManager } from "../../floatingText/FloatingTextManager";
import { OrderModel } from "../../order/OrderModule";
import GIns from "../../../GIns";




/**
 * 通行证奖励预览弹窗
 */
@bindScript(UIActivityKey.BattlePassPreviewWin)
export class BattlePassPreviewWin extends UICommWin{

    static pkgName: string = "activityBattlePass";
    static viewName: string = "BattlePassPreviewWin";

    //当前选择的tab
    private _taskTab: number = 0;

    /**  通行证vo */
    private _data: ActivityBattlePassVo;
    
    private get view(): ui.activityBattlePass.BattlePassPreviewWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.ACTIVITY_END_REFRESH,
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.ACTIVITY_REQUEST_BACK,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ACTIVITY_UPDATE:
                if (args === this._data.activityId) {
                    ActivityModel.ins().sendActivity(this._data.activityId);
                }
                break;
            case NotificationKey.ACTIVITY_END_REFRESH:
                if (args === this._data.activityId) {
                    this.closeSelf();
                }
                break;
            case NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK:
                if (args === this._data.activityId) {
                    this._data = ActivityModel.ins().getActivityVoById(args);
                    this.updateView();
                }
                break;
            case NotificationKey.ACTIVITY_REQUEST_BACK:
                this.updateView()
                break;
        }
    }

    protected onInit(): void {
        this.view.list_award.itemRenderer = this.awardItemRenderer.bind(this);
        this.view.list_desc1.itemRenderer = this.desc1ItemRenderer.bind(this);
        this.view.list_desc2.itemRenderer = this.desc2ItemRenderer.bind(this);

        this.view.btn_get1.on(fgui.Event.CLICK, this.onGet1Click, this)
        this.view.btn_get2.on(fgui.Event.CLICK, this.onGet2Click, this)
    }

    protected onClose(): void {
    }


    protected onOpen(activityId: number, isReopen?: boolean): void {
        if(!activityId){
            this.closeSelf();
            return;
        }
        this._data = ActivityModel.ins().getActivityVoById(activityId);
        this.updateView();
        this.view.list_desc1.numItems = this._data.passCfg.baseDesc.length;
        this.view.list_desc2.numItems = this._data.passCfg.luxuryDesc.length;
    }

    private updateView(){
        if(!this._data){
            this.closeSelf();
            return;
        }

        this.view.list_award.numItems = this._data.awardPreviewList.length;

        if(this._data.activityVo.boughtPass || this._data.activityVo.boughtSuperPass){
            this.view.btn_get1.text = `已购买`;
        }else{
            this.view.btn_get1.text = `${this._data.chargeGoodsText/100}元`;
        }

        if(this._data.activityVo.boughtSuperPass){
            this.view.btn_get2.text = `已购买`;
        }else{
            if(this._data.activityVo.boughtPass){
                this.view.btn_get2.text = `${this._data.replaceChargeGoodsText/100}元`;
            }else{
                this.view.btn_get2.text = `${this._data.superChargeGoodsText/100}元`;
            }
        }
    }

    private awardItemRenderer(index: number, item: ItemFrameBtn): void {
        let data = this._data.awardPreviewList[index];
        item.reset(data.k, data.v);
    }
    
    private desc1ItemRenderer(index: number, item: ui.activityBattlePass.item.BattlePassTextItem): void {
        let data = this._data.passCfg.baseDesc[index];
        item.getController("c1").selectedIndex = 0;
        item.T_desc.text = data;
    }
    private desc2ItemRenderer(index: number, item: ui.activityBattlePass.item.BattlePassTextItem): void {
        let data = this._data.passCfg.luxuryDesc[index];
        item.getController("c1").selectedIndex = 1;
        item.T_desc.text = data;
    }

    private onGet1Click(){
        if(this._data.activityVo.boughtPass){
            GIns.floatingTextMgr.showTips("已购买");
            return;
        }

        OrderModel.ins().sendCreateOrder(this._data.passCfg.chargeGoodsId);
    }

    private onGet2Click(){
        if(this._data.activityVo.boughtSuperPass){
            GIns.floatingTextMgr.showTips("已购买");
            return;
        }

        if(this._data.activityVo.boughtPass){
            OrderModel.ins().sendCreateOrder(this._data.passCfg.replaceChargeGoodsId);
        }else{
            OrderModel.ins().sendCreateOrder(this._data.passCfg.superChargeGoodsId);
        }
    }
}