import UIScriptManager from "../../../../../core/comm/UIScriptManager";
import { LogBusiness } from "../../../../../core/log/LogBusiness";
import { UICommWin } from "../../../../../core/mvc/view/UICommWin";
import { TaskState } from "../../EnumSeason";
import { SeasonConfigManager } from "../../SeasonConfigManager";
import { SeasonManager } from "../../SeasonManager";
import { SeasonUIKeys } from "../../SeasonUIKeys";
import { SeasonBossVo } from "../../vo/SeasonBossVo";
import { SeasonBossRewardItem } from "../com/SeasonBossRewardItem";

export class SeasonBossRewardView extends UICommWin {
    static pkgName: string = "seasonBoss";
    static viewName: string = "SeasonBossRewardView";
    private _activityId:number;

    private _bossRewards:{hp:number, rewards:Array<{k:any,v:any}>, id:number}[];
    private get view(): ui.seasonBoss.SeasonBossRewardView {
      return this._view as any;
    }
  
    protected onInit() {
      const t = this;
      t.view.listItems.setVirtual();
      t.view.listItems.itemRenderer = t.addItem.bind(t);
     
    }
 
    private addItem(index:number, item:SeasonBossRewardItem){
        const reward = this._bossRewards[index];
        const vo = SeasonManager.ins().getSubActityVo(this._activityId) as SeasonBossVo;
        if(vo){
          const info = vo.getRewardInfo();
          let state = TaskState.ING;
          if(info.state == TaskState.FINISH){
            state = TaskState.FINISH;
          }else{
            if(reward.id >= info.sid){
              state = TaskState.ING;
            }else{
              state = TaskState.FINISH;
            }
          }
          item.reset(reward, state);
        }

    }

    private getScrollIndex(){
      let index = 0;
      const vo = SeasonManager.ins().getSubActityVo(this._activityId) as SeasonBossVo;
      if(vo){
        const info = vo.getRewardInfo();
        const idx = this._bossRewards.findIndex(v=>{
          return v.id == info.sid
        })
        if(idx > 0){
          index = idx;
        }
      }
      return index;
    }

    private updateUI(){
        const t = this;
        t._bossRewards = SeasonConfigManager.getBossRewards();
        t.view.listItems.numItems = t._bossRewards.length;
        const index = t.getScrollIndex();
        t.view.listItems.scrollToView(index, false, true);
    }

    @LogBusiness("打开界面")
    public onOpen(aid: any): void {
       this._activityId = aid;
       this.updateUI();
    }
  
    @LogBusiness("关闭界面")
    protected onClose() {
      super.onClose();
    }
  
}

UIScriptManager.bindScript(
  SeasonUIKeys.SeasonBossRewardView, SeasonBossRewardView
);