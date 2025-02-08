import * as fgui from "fairygui-cc";
import { ActivityBattlePassVo } from "../../model/ActivityBattlePassVo";
import { ItemUtils } from "../../../item/utils/ItemUtils";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { ActivityModel, ActivitySyncData } from "../../../../comm/activity/model/ActivityModel";
import { UITransform } from "cc";
import { EventClickItem } from "../../../item/event/EventClickItem";
import NotificationKey from "../../../../event/NotificationKey";
import G from "../../../../../core/comm/G";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";
import { RedDotManager } from "../../../common/redDot/RedDotManager";
import { RedDotKeys } from "../../../common/redDot/RedDotKeys";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../../common/redDot/redDotCom";






/** 通行证 奖励item */
@bindFguiExtension("ui://activityBattlePass/BattlePassAwardItem3")
export class BattlePassAwardItem3 extends fgui.GComponent {

    private _cfg: table.activity.BattlePass.BattlePassRewardConfig;
    /**  通行证vo */
    private _data: ActivityBattlePassVo;

    static pkgName: string = "activityBattlePass";
    static viewName: string = "BattlePassAwardItem3";

    private get view(): ui.activityBattlePass.item.BattlePassAwardItem3 {
        return this as any;
    }

    protected onConstruct(): void {
        this.onInit();
    }

    public onInit() {
        this.view.list_award1.itemRenderer = this.itemAward1Renderer.bind(this);
        this.view.list_award2.itemRenderer = this.itemAward2Renderer.bind(this);
    }

    public updateData(data:table.activity.BattlePass.BattlePassRewardConfig, Vo:ActivityBattlePassVo){
        if(!data) return;
        this._cfg = data;
        this._data = Vo;

        this.updateUI();
    }

    private updateUI(){
        this.view.list_award1.numItems = this._cfg.rewards.length;
        this.view.list_award2.numItems = this._cfg.chargeRewards.length;

        for(let i = 0; i < this.view.list_award1.numItems; i++){
            let item = this.view.list_award1.getChildAt(i);
            //@ts-ignore
            FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.StarPass_item, [this._cfg.id])
        }
        for(let i = 0; i < this.view.list_award2.numItems; i++){
            let item = this.view.list_award2.getChildAt(i);
            //@ts-ignore
            FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.StarPass_pay, [this._cfg.id])
        }
        
        this.view.T_level.text = this._cfg.level.toString();
    }

    private itemAward1Renderer(index:number, item:ItemFrameBtn){
        let data = this._cfg.rewards[index];
        item.reset(data.k, data.v)
        item.setHaveGain(false);
        item.isCanClick(true);
        //@ts-ignore
        item.item.clearClick();
        
        if(this._data.isRewardCanGet(this._cfg.id)){
            //可领取
            item.playAnim();
            item.isCanClick(false);

            let self = this;
            //@ts-ignore
            item.item.onClick(()=>{
                    self.getArawd();
            }, self)
        }else{
            item.clearAnim();
        }
        if(this._data.isRewardGet(this._cfg.id)){
            //已领取
            item.setHaveGain(true);
        }

    }
    private itemAward2Renderer(index:number, item:ItemFrameBtn){
        let data = this._cfg.chargeRewards[index];
        item.reset(data.k, data.v)
        item.setHaveGain(false);
        item.isShowLock(false);
        item.isCanClick(true);
        //@ts-ignore
        item.item.clearClick();

        let hasRed = false;
        if(this._data.isRewardCanGetByHigh(this._cfg.id)){
            //可领取
            item.playAnim();
            item.isCanClick(false);
            
            let self = this;
            //@ts-ignore
            item.item.onClick(()=>{
                self.getArawd();
            }, self)
            hasRed = true;
        }else{
            item.clearAnim();
        }
        if(this._data.isRewardGetByHigh(this._cfg.id)){
            //已领取
            item.setHaveGain(true);
        }
        if(!this._data.activityVo.boughtPass && !this._data.activityVo.boughtSuperPass){
            //未解锁
            item.isShowLock(true);
        }

    }

    //领取奖励
    private getArawd() {
        let syncData = {
            activityId:this._data.activityId, 
            itemId: "PASS", 
            hidePopWin:2,
        } as ActivitySyncData;
        ActivityModel.ins().sendDrawItemReward(syncData);
    }

}