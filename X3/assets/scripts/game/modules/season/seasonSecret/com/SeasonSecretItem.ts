import * as fgui from "fairygui-cc";
import NotificationKey from "../../../../event/NotificationKey";
import FacadeManager from "../../../../../core/mvc/FacadeManager";
import { SeasonManager } from "../../SeasonManager";
import { SeasonSecretVo } from "../../vo/SeasonSecretVo";
import { PassType, TaskState } from "../../EnumSeason";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";
import GIns from "../../../../GIns";
import { PlayerModel } from "../../../player/model/PlayerModel";
import { TimeUtils } from "../../../../comm/utils/TimeUtils";
import { ItemFrameStateBtn } from "../../../common/item/ItemFrameStateBtn";
import { BattleUIUtils } from "../../../battle/utils/BattleUIUtils";
 

export class SeasonSecretItem extends fgui.GComponent {

    private _cgf:table.seasonactivity.SeasonSecret.SeasonSecretConfig;

    private get view(): ui.seasonSecret.com.SeasonSecretItem {
      return this as any;
    }
  
    onConstruct() {
      this.onInit();
    }
  
    public onInit() {
      const t = this;

      t.view.listItems.itemRenderer = t.addItems.bind(t);
      t.onClick(t.clickCB, t);
    }

    private addItems(index:number, item:ItemFrameStateBtn):void{
      const t = this;
      const firstRewards = t._cgf?.firstRewards;
      const vo = SeasonManager.ins().getSubActityVo(t._cgf.subActivityId) as SeasonSecretVo;  
      if(firstRewards && vo){
        const reward = firstRewards[index];
        const state = vo.getSecretState(t._cgf.id);
        if(state == PassType.Pass){
          item.reset(reward, TaskState.FINISH);
        }else{
          item.reset(reward, TaskState.ING);
        }
       
      }
    }
  
    private clickCB(){
        const t = this;
        const id = t._cgf.id;
        const actid = t._cgf.subActivityId;
        const vo = SeasonManager.ins().getSubActityVo(actid) as SeasonSecretVo;  
        if(!vo){
          return;
        }
        t.view.lbN.text = this._cgf.name;
        const state = vo.getSecretState(id);
        if(state == PassType.Lock){
          if(PlayerModel.ins().Vo.level < t._cgf.level){
            GIns.floatingTextMgr.showTips(`共鸣等级不足`);
            return;
          }
          GIns.floatingTextMgr.showTips(`通关上一难度解锁`);
          return;
        }
        FacadeManager.ins().emit(NotificationKey.SEASON_SECRET_SELECT, id);
    }

  
    reset(cfg:table.seasonactivity.SeasonSecret.SeasonSecretConfig , chooseIndex:number) {
      const t = this;
      t._cgf = cfg;
      const actid = cfg.subActivityId;
      const vo = SeasonManager.ins().getSubActityVo(actid) as SeasonSecretVo;  
      if(!vo){
        return;
      }
      t.view.lbN.text = this._cgf.name;
      const state = vo.getSecretState(cfg.id);
      if(state == PassType.Ing){
        //当前关卡
        t.view.imgPass.visible = false;
        t.view.lockG.visible = false;
        if(t._cgf.id == chooseIndex){
          t.view.imgSel.visible = true;
        }else{
          t.view.imgSel.visible = false;
        }
      }else if(state == PassType.Lock){
        //上锁
        t.view.imgPass.visible = false;
        t.view.lockG.visible = true;
        t.view.imgSel.visible = false;
      }else if(state == PassType.Pass){
        //过关
        t.view.imgPass.visible = true;
        t.view.lockG.visible = false;
        if(t._cgf.id == chooseIndex){
          t.view.imgSel.visible = true;
        }else{
          t.view.imgSel.visible = false;
        }
      }

      const mgr = vo.Mgr;
      const time = mgr.getSecondsByFloor(t._cgf.floor);
      if(time){
        t.view.lbTime.text = '耗时: '+ TimeUtils.formatTimeMsToLevelTimeText(time*1000);
      }else{
        t.view.lbTime.text = '耗时: --:--'
      }

      let monsterCfgs = BattleUIUtils.getMonsterAttributeConfigArrayByBattleConfigId(t._cgf.battleConfigId);
      let monsterCfg = monsterCfgs[0];
      t.view.headIcon.icon = monsterCfg.headPath;

      t.view.listItems.numItems = t._cgf?.firstRewards?.length || 0;
    }
  }