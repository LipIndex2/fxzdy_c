import G from "../../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../../core/comm/LayerManager";
import UIScriptManager from "../../../../../core/comm/UIScriptManager";
import { LogBusiness } from "../../../../../core/log/LogBusiness";
import { UICommWin } from "../../../../../core/mvc/view/UICommWin";
import { UIPage } from "../../../../../core/mvc/view/UIPage";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { TimeUtils } from "../../../../comm/utils/TimeUtils";
import { ServerEnums } from "../../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../../event/NotificationKey";
import { ItemModel } from "../../../item/model/ItemModel";
import { EnumRuleKeys } from "../../../rule/enums/EnumRuleKeys";
import { RuleController } from "../../../rule/RuleController";
import { SeasonReachScoreType, TaskState } from "../../EnumSeason";
import { SeasonManager, SeasonPageData } from "../../SeasonManager";
import { SeasonUIKeys } from "../../SeasonUIKeys";
import { SeasonBossVo } from "../../vo/SeasonBossVo";
import { SeasonReachVo } from "../../vo/SeasonReachVo";
import { SeasonScoreSItem } from "../com/SeasonScoreSItem";
import { SeasonScoreTab } from "../com/SeasonScoreTab";

 

export class SeasonScoreView extends UIPage {
    static pkgName: string = "seasonScore";
    static viewName: string = "SeasonScoreView";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;

    private _type:SeasonReachScoreType;
    private _actId:number;

    //没时间先这样，后续可以抽出来组合
    private _tabs:SeasonReachScoreType[] = [
        SeasonReachScoreType.HERO_UP_STAR,
        SeasonReachScoreType.PET_UP_STAR,
        SeasonReachScoreType.AWAKE_WEAPON_UP_STAR,
    ]

    private get view(): ui.seasonScore.SeasonScoreView {
      return this._view as any;
    }
  
    listenNotifications(): string[] {
      return [
        NotificationKey.SEASON_SCORE_TYPE_CHANGE,
        NotificationKey.SEASON_TASK_UPDATE,
      ];
    }
  
    notificationHandler(eventName: string, args?: any): void {
      switch (eventName) {
        case NotificationKey.SEASON_SCORE_TYPE_CHANGE:
          //更新任务列表
          this.pageUpdate(args);
          break;
        case NotificationKey.SEASON_TASK_UPDATE:
          this.updateUI();
          break;
      }
    }
    
    get vo():SeasonReachVo{
      return SeasonManager.ins().getSubActityVo(this._actId) as SeasonReachVo;
    }

    protected onInit() {
      const t = this;
      
      t.view.listTabs.itemRenderer = t.itemRenderer.bind(t);
      t.view.listItems.setVirtual();
      t.view.listItems.itemRenderer = t.addItem.bind(t);

      t.view.btnRule.onClick(t.onRule, t);
      t.view.btnScoRule.onClick(t.onScoRlue, t);
    }


    pageUpdate(type:number){
      const t = this;
      if(t._type !== type){
        t._type = type;
        t.updateUI();
        if(t.view.listItems){
          t.view.listItems.scrollToView(t.getScrollerIndex(), false, true)
        }
      }
    }

    getScrollerIndex(){
      const t = this;
      const cfgs = this.vo.getTaskCfgs(t._type);
      const vo = t.vo;
      let index = cfgs.findIndex(v=>{
        const id = v.id;
        const state = vo.getTaskState(id);
        if(state == TaskState.CAN_GET || state == TaskState.ING){
            return true
        }
        return false;
      })
      if(index == -1){
        index = 0;
      }
      return index;
    }

    updateUI(){
      const t = this;
      if(!this.vo){
        return;
      }
      const cfgs = this.vo.getTaskCfgs(t._type);
      t.view.listItems.numItems = cfgs.length;
      t.view.listTabs.numItems = this._tabs.length;

      const cfg = cfgs[0];
      const content = cfg.content;
      const progress = ItemModel.ins().getItemCountById(content[0]?.itemId);

      if(t._type == SeasonReachScoreType.HERO_UP_STAR){
          t.view.lvTS.text = `我的英雄积分：${progress}`;
      }else if(t._type == SeasonReachScoreType.PET_UP_STAR){
          t.view.lvTS.text = `我的星灵积分: ${progress}`;
      }else if(t._type == SeasonReachScoreType.AWAKE_WEAPON_UP_STAR){
          t.view.lvTS.text = `超武星级积分: ${progress}`;
      }

      t.view.lbScore.text = SeasonManager.ins().getScore(t._actId)+'';
    }

    itemRenderer(index: number, comp: SeasonScoreTab) {
      comp.reset(this._tabs[index], this._type, this._actId);
    }
    
    addItem(index: number, comp: SeasonScoreSItem){
      const t = this;
      let cfg = this.vo.getTaskCfgs(t._type)[index];
      comp.reset(cfg);
    }

    @LogBusiness("打开界面")
    public onOpen(args: SeasonPageData): void {
      const t = this;
      this._actId = args.subActId;
      t._type = t._tabs[0];

      t.view.listTabs.numItems = this._tabs.length;
      G.GameTimer.loop(500, t, t.onTimer)
      t.onTimer();
      G.GameTimer.once(200, this, ()=>{
        t.updateUI();
        if(t.view.listItems){
          t.view.listItems.scrollToView(t.getScrollerIndex(), false, true)
        }
      })

    }

    private onTimer(){
      const t = this;
      const vo = SeasonManager.ins().getSubActityVo(t._actId) as SeasonBossVo;
      if(!vo){
        t.view.lbCd.text = '已结束';
      }
      const selTime = vo.getSettleTime();
      if(selTime > 0){
        //优化
        t.view.lbCd.text = `<color=#3CFE37>${TimeUtils.formatTimeMsToDayHourMinuteSecondText(selTime)}</color>后结算`;
      }else{
        const leftTimeMs = vo.getLeftTime();
        if(leftTimeMs > 0){
          t.view.lbCd.text = '已结算'//`<color=#3CFE37>${TimeUtils.formatTimeMsToDayHourMinuteSecondText(selTime)}</color>后关闭`;
          G.GameTimer.clearAll(this)
        }else{
          t.view.lbCd.text = '已结束';
          G.GameTimer.clearAll(this)
        }
      }
    }
  
    @LogBusiness("关闭界面")
    protected onClose() {
      G.GameTimer.clearAll(this);
      super.onClose();
    }
  
    //规则
    private onRule() {
      RuleController.ins().openRule(
          EnumRuleKeys.SEASON_SCORE,
          this.view.btnRule
      );
    }

    //积分规则
    private onScoRlue() {
      const t = this;
      let type:EnumRuleKeys;
      if(t._type == SeasonReachScoreType.HERO_UP_STAR){
        type = EnumRuleKeys.SEASON_SCORE_HERO;
      }else if(t._type == SeasonReachScoreType.PET_UP_STAR){
        type = EnumRuleKeys.SEASON_SCORE_PET;
      }else if(t._type == SeasonReachScoreType.AWAKE_WEAPON_UP_STAR){
        type = EnumRuleKeys.SEASON_SCORE_WEAPON;
      }
      RuleController.ins().openRule(
          type,
          this.view.btnScoRule
      );
    }

  
  }

UIScriptManager.bindScript(SeasonUIKeys.SeasonScoreView, SeasonScoreView);