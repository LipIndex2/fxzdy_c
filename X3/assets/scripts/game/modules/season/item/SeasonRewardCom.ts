import * as fgui from "fairygui-cc";
import { SeasonManager } from "../SeasonManager";
import { SignUpVo } from "../vo/SignUpVo";
import { ActivityState, TaskState } from "../EnumSeason";
import { SeasonModel } from "../SeasonModel";
import G from "../../../../core/comm/G";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { ItemFrameStateBtn } from "../../common/item/ItemFrameStateBtn";
import GIns from "../../../GIns";

export class SeasonRewardCom extends fgui.GComponent {
    private _cfg:table.seasonactivity.SignUp.SignUpConfig;

    private _state:TaskState;
    private get view(): ui.season.com.SeasonRewardCom {
        return this as any;
    }

    constructor() {
        super();
    }

    onConstruct() {
        this.onInit();
    }

    protected onPreDispose() {
        G.GameTimer.clearAll(this);
        super.onPreDispose();
    }

    public onInit() {
        const t = this;
        t.view.listItem1.itemRenderer = t.addItem.bind(t);
        
        t.view.bg.onClick(t.onGet,t)
        t.view.btn.onClick(t.onGet, t);
    } 

    private onGet(){
        const t = this;
        if(!t.view.btn.visible){
            return;
        }
        const signed = SeasonManager.ins().getSigned();
        if(!signed){
            GIns.floatingTextMgr.showTips(`请先报名`);
            return;
        }
        const vo = SeasonManager.ins().getSubActityVo(t._cfg.subActivityId) as SignUpVo;
        if(vo && vo.state == ActivityState.ING  && !vo.isRewardGet(t._cfg.id)){
            SeasonModel.ins().sendDrawItemReward({subActivityId:t._cfg.subActivityId, itemId:null})
        }
    }

    private addItem(index:number , item:ItemFrameStateBtn){
        const t = this;
        const cfg = t._cfg.rewards[index];
        item.reset(cfg, t._state);
    }

    reset(cfg:table.seasonactivity.SignUp.SignUpConfig ) :void{
        const t = this;
        t._cfg = cfg;
        const vo = SeasonManager.ins().getSubActityVo(this._cfg.subActivityId) as SignUpVo;
        if(!vo || vo.state == ActivityState.CLOSE || vo.isRewardGet(t._cfg.id)){
            //已领取
            t._state = TaskState.FINISH;
            t.view.lb.visible = false;
            t.view.img.visible = true;
            t.view.imgBox.visible = true;
            t.view.btn.visible = false;
            t.view.listItem1.touchable = true;
        }else{
            //没领取，判断是否可以领取
            t.view.lb.visible = true;
            t.view.img.visible = false;
            t.view.imgBox.visible = false;
            t.view.btn.visible = true;

            const leftTimeMs = vo.getDur(this._cfg.id);
            if(leftTimeMs > 0){
                //倒计时中
                t._state = TaskState.ING;
                t.view.listItem1.touchable = true;
            }else{
                t._state = TaskState.CAN_GET;
                t.view.listItem1.touchable = false;
            }
        }

        t.view.listItem1.numItems = t._cfg.rewards.length;
    }

    setText(str:string):void{
        this.view.lb.text = str;
    }

    onTimer(){
        const vo = SeasonManager.ins().getSubActityVo(this._cfg.subActivityId) as SignUpVo;
        const t = this;
        if(!vo){
            G.GameTimer.clearAll(this);
            t._state = TaskState.FINISH;
            t.view.lb.visible = false;
            t.view.img.visible = true;
            t.view.imgBox.visible = true;
            t.view.btn.visible = false;
            return;
        }
        const leftTimeMs = vo.getDur(this._cfg.id);
        if(leftTimeMs > 0){
            this.setText(TimeUtils.formatTimeMsToDayHourMinuteSecondText(leftTimeMs)+'后领取');
        }else{
            G.GameTimer.clearAll(this);
            t.setText('报名后领取');
            if(vo.state == ActivityState.CLOSE || vo.isRewardGet(t._cfg.id)){
                t._state = TaskState.FINISH;
            }else{
                t._state = TaskState.CAN_GET;
            }
          
            t.view.listItem1.numItems = t._cfg.rewards.length;
        }
        
    }

    startTick(){
        //开启定时器，用于显示倒计时
        const t = this;
        t.onTimer();
        G.GameTimer.loop(1000, t, t.onTimer)
    }
}