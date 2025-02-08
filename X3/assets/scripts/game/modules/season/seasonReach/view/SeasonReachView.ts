import G from "../../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../../core/comm/LayerManager";
import UIScriptManager from "../../../../../core/comm/UIScriptManager";
import { LogBusiness } from "../../../../../core/log/LogBusiness";
import { UIPage } from "../../../../../core/mvc/view/UIPage";
import { TimeUtils } from "../../../../comm/utils/TimeUtils";
import NotificationKey from "../../../../event/NotificationKey";
import { ItemModel } from "../../../item/model/ItemModel";
import { EnumRuleKeys } from "../../../rule/enums/EnumRuleKeys";
import { RuleController } from "../../../rule/RuleController";
import { SeasonReachScoreType, TaskState } from "../../EnumSeason";
import { SeasonManager } from "../../SeasonManager";
import { SeasonUIKeys } from "../../SeasonUIKeys";
import { SeasonBossVo } from "../../vo/SeasonBossVo";
import { SeasonReachVo } from "../../vo/SeasonReachVo";
import { SeasonReachScoreItem } from "../com/SeasonReachScoreItem";
import { SeasonReachTab } from "../com/SeasonReachTab";

export class SeasonReachView extends UIPage {
    static pkgName: string = "seasonReach";
    static viewName: string = "SeasonReachView";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;

    private _actId:number;
    private _type:number;


    //可以抽出来做
    private _tabs:SeasonReachScoreType[] = [
      SeasonReachScoreType.ARENA,
      SeasonReachScoreType.EXPLORE
    ]

    private get view(): ui.seasonReach.SeasonReachView {
      return this._view as any;
    }
  
    get vo():SeasonReachVo{
      return SeasonManager.ins().getSubActityVo(this._actId) as SeasonReachVo;
    }

    listenNotifications(): string[] {
      return [
        NotificationKey.SEASON_COMPETITION_TYPE_CHANGE,
        NotificationKey.SEASON_TASK_UPDATE,
      ];
    }
    
  
    notificationHandler(eventName: string, args?: any): void {
      switch (eventName) {
        case NotificationKey.SEASON_COMPETITION_TYPE_CHANGE:
          //更新任务列表
          this.pageUpdate(args);
          break;
        case NotificationKey.SEASON_TASK_UPDATE:
          this.updateUI();
          break;
      }
    }
  
    protected onInit() {
      const t = this;
  
      t.view.btnRule.onClick(t.onRule, t);
      t.view.btnScoRule.onClick(t.onScoRlue, t);

      t.view.listTabs.itemRenderer = t.itemRenderer.bind(t);
      t.view.listTabs.numItems = t._tabs.length;

      t.view.listItems.setVirtual();
      t.view.listItems.itemRenderer = t.addItem.bind(t);
    }

    itemRenderer(index: number, comp: SeasonReachTab) {
      comp.reset(this._tabs[index], this._type, this._actId);
    }
    
    addItem(index: number, comp: SeasonReachScoreItem){
        const t = this;
        const cfgs = this.vo.getTaskCfgs(t._type)
        let cfg =  cfgs[index];
        comp.reset(cfg);
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

    updateUI(){
      const t = this;
     
      const cfgs = this.vo.getTaskCfgs(t._type)
      t.view.listItems.numItems = cfgs.length;
      t.view.listTabs.numItems = this._tabs.length;

      const cfg =  cfgs[0];
      const content = cfg.content;
      const progress = ItemModel.ins().getItemCountById(content[0]?.itemId);

      if(t._type == SeasonReachScoreType.ARENA){
          t.view.lvTS.text = `我的竞技积分：${progress}`;
      }else if(t._type == SeasonReachScoreType.EXPLORE){
          t.view.lvTS.text = `我的勘探积分: ${progress}`;
      }
      t.view.lbScore.text = SeasonManager.ins().getScore(t._actId)+'';
    }

    @LogBusiness("打开界面")
    public onOpen(args: any): void {
      const t = this;
      this._actId = args.subActId;
      t._type = t._tabs[0];
      t.view.listTabs.numItems = this._tabs.length;
      G.GameTimer.loop(500, this, this.onTimer);
      t.onTimer()
      G.GameTimer.once(200, this, ()=>{
        t.updateUI();
        if(t.view.listItems){
            t.view.listItems.scrollToView(t.getScrollerIndex(), false, true)
        }
      })
    }
  
    getScrollerIndex(){
      const t = this;
      const vo = t.vo;
      if(!vo){
        return 0;
      }
      const cfgs =  this.vo.getTaskCfgs(t._type);
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

    @LogBusiness("关闭界面")
    protected onClose() {
      super.onClose();
      G.GameTimer.clearAll(this);
    }
  
    private onTimer(){
      const t = this;
      const vo = SeasonManager.ins().getSubActityVo(t._actId) as SeasonBossVo;
      if(!vo){
        t.view.lbCd.text = '已结束';
      }

      const selTime = vo.getSettleTime();
      if(selTime > 0){
        t.view.lbCd.text = `<color=#3CFE37>${TimeUtils.formatTimeMsToDayHourMinuteSecondText(selTime)}</color>后结算`;
      }else{
        const leftTimeMs = vo.getLeftTime();
        if(leftTimeMs > 0){
          t.view.lbCd.text = '已结算'//`<color=#3CFE37>${TimeUtils.formatTimeMsToDayHourMinuteSecondText(selTime)}</color>后结束`;
        }else{
          t.view.lbCd.text = '已结束';
          G.GameTimer.clearAll(this)
        }
      }

    }

    //规则
    private onRule() {
      RuleController.ins().openRule(
          EnumRuleKeys.SEASON_REACH,
          this.view.btnRule
      );
    }
  
    private onScoRlue(){
      const t = this;
      let type;
      if(t._type == SeasonReachScoreType.ARENA){
        type = EnumRuleKeys.SEASON_SCORE_PVP;
      }else if(t._type == SeasonReachScoreType.EXPLORE){
        type = EnumRuleKeys.SEASON_SCORE_EXPLORE;
      }
      RuleController.ins().openRule(
        type,
        this.view.btnRule
      );
    }
    
}

UIScriptManager.bindScript(SeasonUIKeys.SeasonReachView, SeasonReachView);