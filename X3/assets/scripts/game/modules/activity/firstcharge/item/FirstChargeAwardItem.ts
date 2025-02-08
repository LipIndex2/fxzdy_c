import * as fgui from "fairygui-cc";
import { ActivityFirstChargeVo } from "../../model/ActivityFirstChargeVo";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";
import { ActivityModel, ActivitySyncData } from "../../../../comm/activity/model/ActivityModel";
import { FloatingTextManager } from "../../../floatingText/FloatingTextManager";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../../common/redDot/redDotCom";
import { RedDotKeys } from "../../../common/redDot/RedDotKeys";
import GIns from "../../../../GIns";


/** 装备属性页Item */
export class FirstChargeAwardItem extends fgui.GComponent{
    static pkgName: string = "activityFirstCharge";
    static viewName: string = "FirstChargeAwardItem";

    private _data: ActivityFirstChargeVo;

    private _cfg: table.activity.FirstCharge.FirstChargeConfig;

    private get view(): ui.activityFirstCharge.item.FirstChargeAwardItem {
        return this as any;
    }

    onInit(){
        this.view.list_award.itemRenderer = this.awardItem.bind(this);
        this.view.btn_get.on(fgui.Event.CLICK, this.getBtnClick, this);
    }

    public updateData(data: ActivityFirstChargeVo, cfg: table.activity.FirstCharge.FirstChargeConfig){
        this._data = data;
        this._cfg = cfg;
        this.view.T_day.text = `第${cfg.day}天`;
        this.view.T_tips.text = cfg.earlyTips;

        this.view.list_award.numItems = cfg.rewards.length;

        this.view.getController("c1").selectedIndex = data.isCanGetAwardById(cfg.id);

        FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.FirstCharge_item, [cfg.id])
    }

    private awardItem(index:number, item:ItemFrameBtn){
        let Object = this._cfg.rewards[index];
        item.reset(Object.k, Object.v);
    }

    private getBtnClick(){
        if(!this._data.isFirstChargeById(+this._cfg.chargeGoodsId)){
            GIns.floatingTextMgr.showTips("请先购买礼包");
            return;
        }
        
        ActivityModel.ins().sendDrawItemReward({activityId:this._data.activityId, itemId:this._cfg.id.toString(), hidePopWin:2} as ActivitySyncData);
    }

    public playEffect():void {
        this.view.getTransition('t0').play()
    }
}