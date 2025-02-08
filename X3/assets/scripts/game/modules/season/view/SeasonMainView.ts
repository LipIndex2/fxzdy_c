import G from "../../../../core/comm/G";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { LogBusiness } from "../../../../core/log/LogBusiness";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { UIView } from "../../../../core/mvc/view/UIView";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { TeamChallengeUIKeys } from "../../teamChallenge/TeamChallengeUIKeys";
import { SeasonRewardCom } from "../item/SeasonRewardCom";
import { SeasonConfigManager } from "../SeasonConfigManager";
import { SeasonManager } from "../SeasonManager";
import { SeasonModel } from "../SeasonModel";
import { SeasonUIKeys } from "../SeasonUIKeys";
import { SignUpVo } from "../vo/SignUpVo";

export class SeasonMainView extends UIPage {
    static pkgName: string = "season";
    static viewName: string = "SeasonMainView";
    //传入的活动id
    private _actId:number;

    private get view(): ui.season.SeasonMainView {
      return this._view as any;
    }
  
    private get model(): SeasonManager {
      return SeasonManager.ins();
    }
  
    private get vo():SignUpVo{
      const t = this;
      const signVo = t.model.getSubActityVo(t._actId) as SignUpVo;
      return signVo
    }

    listenNotifications(): string[] {
      return [
        NotificationKey.SEASON_SIGNUP_UPDATE,
        NotificationKey.SEASON_ACTIVITY_NEWSTATE,
      ];
    }
  
    notificationHandler(eventName: string, args?: any): void {
      switch (eventName) {
        case NotificationKey.SEASON_SIGNUP_UPDATE:
          this.updateUI();
          break;
        case NotificationKey.SEASON_ACTIVITY_NEWSTATE:
          this.updateState();
          break;
      }
    }

    protected onTimer(): void {
      const t = this;
      const vo = t.vo;
      if(!vo){
        //沒有就是結束了
        t.view.bar.value = 100;
        t.view.bar2.value = 100;
        t.view.lbCd.text = '已开启';
        return;
      }
      const cfgs = SeasonConfigManager.getSignReward(t._actId);
      if(cfgs[1]) {
        t.view.bar.value = vo.getPro(cfgs[1].id);
      }
      if(cfgs[2]) {
        t.view.bar2.value = vo.getPro(cfgs[2].id, cfgs[1]?.openDay);
      }
     
      const leftTimeMs = vo.getLeftTime();
      if(leftTimeMs > 0){
        t.view.lbCd.text = TimeUtils.formatTimeMsToDayHourMinuteSecondText(leftTimeMs)+'后开启';
      }else{
        t.view.lbCd.text = '已开启';
      }
    }
  
    @LogBusiness("关闭界面")
    protected onClose() {
      GameTimer.ins().clearAll(this);
      super.onClose();
    }
  
    protected onInit() {
      const t = this;
      t.view.btnBack.onClick(t.onBack.bind(t));
      t.view.btnGo.onClick(t.onGo.bind(t));
    }
    
    private onBack(){
        this.closeSelf();
    }

    private updateState(){
      const t = this;
      const signVo = t.vo;
      if(!signVo || signVo.state == ServerEnums.SeasonActivityState.STOP){
        t.closeSelf();
      }
    }

    private initUI(){
      const t = this;
      const cfg = SeasonManager.ins().getSeasonCfg();
      t.view.lbN.text = `赛季<color=#FFC556>${cfg.name}</color>即将开启，全新内容敬请期待！`
    }

    private updateUI(){
      const t = this;
      const signVo = t.vo;
      let state;
      if(!signVo){
        state = ServerEnums.SeasonActivityState.STOP;
      }else{
        state = signVo.getSubActivityState();
      }
      const signed = SeasonManager.ins().getSigned();
      if(state == ServerEnums.SeasonActivityState.STOP && !signed){
        //已结束
        t.view.rewardsG.visible = false;
        t.view.lbOpenTips.visible = true;
        t.view.btnGo.visible = true;
        t.view.tipsG.visible = false;
        t.view.btnGo.title = '进入赛季';
      }else{
        t.view.rewardsG.visible = true;
        t.view.lbOpenTips.visible = false;
        if(signed){
          //已经报名
          t.view.btnGo.visible = false;
          t.view.tipsG.visible = true;
        }else{
          t.view.btnGo.visible = true;
          t.view.tipsG.visible = false;
          t.view.btnGo.title = '报名';
        }
      }
      t.updateReward();
    }

    updateReward(){
      const t = this;
      const cfgs = SeasonConfigManager.getSignReward(t._actId);
      for(let i = 1; i<= 3; i++){
        const cfg = cfgs[i-1];
        //有时间优化，策划说就是这个规则
        const reward = this.view.getChild("reward" + i) as SeasonRewardCom;
        reward.reset(cfg);
        if(i == 1){
          reward.setText('报名后领取');
        }else{
          reward.startTick();
        }
      }
    }

    private onGo(){
      const t = this;
      const signVo = t.vo;
      let state;
      if(!signVo){
        state = ServerEnums.SeasonActivityState.STOP;
      }else{
        state = signVo.getSubActivityState();
      }
      
      if(state == ServerEnums.SeasonActivityState.STOP){
        t.closeSelf();
        G.UIManager.open(SeasonUIKeys.SeasonContainerView, SeasonManager.ins().getMenuList())
        SeasonManager.ins().localSigned()
        //已结束
      }else{
        if(!signVo?.signed){
          //没报名直接领取奖励
          SeasonModel.ins().sendHandleStuff({subActivityId:t._actId, stuff:null,times:0, otherParams:null});
        }
      }
    }
    

    @LogBusiness("打开界面")
    public onOpen(args: any): void {
      const t = this;
      t._actId = SeasonManager.ins().getSignUpActId();
      this.onTimer();
      G.GameTimer.loop(1000, t, t.onTimer);
      t.initUI();
      t.updateUI();
    
    }

  }
  UIScriptManager.bindScript(
    SeasonUIKeys.SeasonMainView, SeasonMainView
  );