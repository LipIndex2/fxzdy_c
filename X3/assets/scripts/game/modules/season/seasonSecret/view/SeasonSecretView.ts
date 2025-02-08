 
 
import G from "../../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../../core/comm/LayerManager";
import UIScriptManager from "../../../../../core/comm/UIScriptManager";
import { LogBusiness } from "../../../../../core/log/LogBusiness";
import { UIManager } from "../../../../../core/mvc/UIManager";
import { UIPage } from "../../../../../core/mvc/view/UIPage";
import { TableManager } from "../../../../../core/table/TableManager";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { TimeUtils } from "../../../../comm/utils/TimeUtils";
import { ServerEnums } from "../../../../../libs/extras/ServerEnums";
import { FightType } from "../../../../comm/battle/enum/FightType";
import NotificationKey from "../../../../event/NotificationKey";
import GIns from "../../../../GIns";
import { RedDotCom } from "../../../common/redDot/redDotCom";
import { RedDotKeys } from "../../../common/redDot/RedDotKeys";
import { FormationMainViewOpenArgs, UIFormationKey } from "../../../formation/const/UIFormationConfig";
import { FormationManager } from "../../../formation/FormationManager";
import { UIItemKeys } from "../../../item/UIItemKeys";
import { ItemCostConfirmViewOpenArgs } from "../../../item/view/confirm/ItemCostConfirmView";
import { EnumRuleKeys } from "../../../rule/enums/EnumRuleKeys";
import { RuleController } from "../../../rule/RuleController";
import { PassType } from "../../EnumSeason";
import { SeasonConfigManager } from "../../SeasonConfigManager";
import { SeasonManager, SeasonPageData } from "../../SeasonManager";
import { SeasonModel } from "../../SeasonModel";
import { SeasonUIKeys } from "../../SeasonUIKeys";
import { SeasonSecretVo } from "../../vo/SeasonSecretVo";
import { SeasonSecretItem } from "../com/SeasonSecretItem";
import { SecretSeasonManager } from "../SecretSeasonManager";

export class SeasonSecretView extends UIPage {
    static pkgName: string = "seasonSecret";
    static viewName: string = "SeasonSecretView";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;

    /**当前选中的 id*/
    private _id:number;
    private _subActivityId:number;
 
    private _cfgs:table.seasonactivity.SeasonSecret.SeasonSecretConfig[];

    private get view(): ui.seasonSecret.SeasonSecretView {
      return this._view as any;
    }
  
    listenNotifications(): string[] {
      return [
        NotificationKey.SEASON_SECRET_SELECT,
        NotificationKey.SEASON_SECRET_UPDATE,
        NotificationKey.SEASON_SECRET_TIMES_UPDATE,
        NotificationKey.HERO_UP_LEVEL,
      ];
    }
  
    notificationHandler(eventName: string, args?: any): void {
      switch (eventName) {
        case NotificationKey.SEASON_SECRET_SELECT:
        case NotificationKey.SEASON_SECRET_UPDATE:
        case NotificationKey.HERO_UP_LEVEL:
          //更新任务列表
          this.updateUI(args);
          break;
        case NotificationKey.SEASON_SECRET_TIMES_UPDATE:
          this.updateTimes();
          break;
        
      }
    }
  
    protected onInit() {
      const t = this;
      t.view.btnRule.onClick(t.onRule, t);
      t.view.btnFormation1.onClick(t.onFormation, t);
      t.view.btnChallenge.onClick(t.onChallenge, t);
      t.view.btnAdd.onClick(t.onTimes, t);
      t.view.imgAdd.onClick(t.onTimes, t);

      t.view.listCom.setVirtual();
      t.view.listCom.itemRenderer = t.itemRenderer.bind(t);
      t.view.listCom.itemProvider = t.irProvider.bind(t);
    }

    private onFormation(){
      const t = this;
      const cfg = TableManager.getDataById(table.seasonactivity.SeasonSecret.SeasonSecretConfig,t._id);
      FormationManager.ins().addAutoFightParam(FightType.SEASON_SECRET, cfg.id);
      G.UIManager.open(UIFormationKey.FORMATION_MAIN_VIEW, FormationMainViewOpenArgs.create(
        FightType.SEASON_SECRET,
        cfg.subActivityId+'',
      ));
    }

  /**
	 * 挑战秘境
	 * @author GameCreator
	 */	
    private onChallenge(){
        const t = this;
        const cfg = TableManager.getDataById(table.seasonactivity.SeasonSecret.SeasonSecretConfig,t._id);
        SeasonModel.ins().sendChallengeSecret({subActivityId:cfg.subActivityId, floor:cfg.floor})
    }

    private onTimes(){
      const t = this;
      const svo = SeasonManager.ins().getSubActityVo(t._subActivityId) as SeasonSecretVo;
      if(svo){
        if(svo.challengeTimesLeft >= svo.Mgr.dailyChallengeTimesLimit){
          GIns.floatingTextMgr.showTips(`当前挑战次数已达最大值!`);
          return;
        }
      }

      const costItem = SeasonConfigManager.getCostItem();
    
      const mgr = svo.Mgr;
      const limit = mgr.dailyBuyChallengeTimesLimit;
      const left = limit - mgr.dailyBuyChallengeTimes;
      UIManager.ins().open(UIItemKeys.ItemCostConfirmView,
          ItemCostConfirmViewOpenArgs.create(
              true,
              costItem,
              "确认花费",
              "购买一次挑战次数?",
              `今日可购${left}/${limit}`,
              () => {
                  SeasonModel.ins().sendHandleStuff({subActivityId:this._subActivityId, stuff:null,times:0, otherParams:null});
              },
              -36,
          ));
    }
  
    itemRenderer(index: number, comp: SeasonSecretItem) {
        const t = this;
        const cfgs =  t._cfgs; 
        comp.reset(cfgs[index], t._id);
    }

    irProvider(index: number){
      const t = this;
      const cfgs =  t._cfgs; 
      const cfg = cfgs[index];
      if(cfg.id == -1){
          return 'ui://seasonSecret/SeasonSecretEnd';
      }
      return 'ui://seasonSecret/SeasonSecretItem';
    }


    //刷新
    updateUI(id:number , index?:number){
        const t = this;
        if(id){
          t._id = id;
        }
        if(!t._id){
          return;
        }

        const vo = SeasonManager.ins().getSubActityVo(t._subActivityId) as SeasonSecretVo;
        if(!vo){
          return;
        }
        const state = vo.getSate();
        const selTime = vo.getSettleTime();
        if(state == 3 || selTime < 0){
          //已经结束
          t.view.closeG.visible = true;
          t.view.tipsG.visible = false;
          t.view.btnChallenge.visible = false;
          t.view.btnFormation1.visible = false;
        }else{
          t.view.closeG.visible = false;
          t.view.tipsG.visible = true;
          t.view.btnChallenge.visible = true;
          t.view.btnFormation1.visible = true;
        }

        this._cfgs = vo.getSecretLists();
        t.view.listCom.numItems =  this._cfgs.length;
        if(index && index > 0){
          t.view.listCom.scrollToView(index-1, false, true);
        }

        const cfg = TableManager.getDataById(table.seasonactivity.SeasonSecret.SeasonSecretConfig,t._id);
        //当前选中层级
        const fState = vo.getSecretState(cfg.floor);
        if(fState == PassType.Ing){
          t.view.timeG.visible = false;
          t.view.lbTips.visible = true;
        }else{
          t.view.timeG.visible = true;
          t.view.lbTips.visible = false;
        }

        const actS = vo.getSubActivityState();
        if(actS == ServerEnums.SeasonActivityState.STOP){
          t.view.closeG.visible = true;
          t.view.btnFormation1.visible = false;
          t.view.btnChallenge.visible = false;
        }else{
          t.view.closeG.visible = false;
          t.view.btnFormation1.visible = true;
          t.view.btnChallenge.visible = true;
        }
        
        this.updateTimes();
        FguiScriptUtils.toMyScriptClass(this.view.btnChallenge.redDot, RedDotCom).reset(RedDotKeys.Season_sub_entrance, [vo.activityId]);
    }

    private updateTimes(){
      const t = this;
      const vo = SeasonManager.ins().getSubActityVo(t._subActivityId) as SeasonSecretVo;
      if(vo){
        t.view.lbTimes.text = vo.challengeTimesLeft+'/'+ vo.Mgr.dailyChallengeTimesLimit;
      }

    }

    private onTimer(){
      const t = this;
      const vo = SeasonManager.ins().getSubActityVo(t._subActivityId) as SeasonSecretVo;
      if(!vo){
        t.view.lbCd.text = '已结束';
      }
      
      const selTime = vo.getSettleTime();
      if(selTime > 0){
        t.view.lbCd.text = `<color=#3CFE37>${TimeUtils.formatTimeMsToDayHourMinuteSecondText(selTime)}</color>后结算`;
      }else{
        const leftTimeMs = vo.getLeftTime();
        if(leftTimeMs > 0){
          t.view.lbCd.text = '已结算'//`<color=#3CFE37>${TimeUtils.formatTimeMsToDayHourMinuteSecondText(leftTimeMs)}</color>后结束`;
          t.updateUI(t._id)
        }else{
          t.view.lbCd.text = '';
          G.GameTimer.clearAll(this)
        }
      }

    }

    @LogBusiness("打开界面")
    public onOpen(args: SeasonPageData): void {
      const t = this;
      t._subActivityId = args.subActId;
      G.GameTimer.loop(500, t, t.onTimer)
      

      this.initUI();
    }
    
    
    private initUI(){
      const t = this;
      const vo = SeasonManager.ins().getSubActityVo(t._subActivityId) as SeasonSecretVo;  
      if(!vo){
        return;
      }
      /**初始化选中 */
      const cfgs = vo.getSecretLists(); //TableManager.getAllData(table.seasonactivity.SeasonSecret.SeasonSecretConfig);
      let id = cfgs[0].id;
      let sIndex = 0;
      cfgs.forEach((v, index)=>{
        const state = vo.getSecretState(v.id);
        if(state != PassType.Lock && v.id > id){
          id = v.id
          sIndex = index;
        }
      })

      t.updateUI(id, sIndex);
    }

    
    @LogBusiness("关闭界面")
    protected onClose() {
      super.onClose();
      G.GameTimer.clearAll(this);
    }
  
    //规则
    private onRule() {
      RuleController.ins().openRule(
          EnumRuleKeys.SEASON_SECRET,
          this.view.btnRule
      );
    }
  }

UIScriptManager.bindScript(SeasonUIKeys.SeasonSecretView, SeasonSecretView);