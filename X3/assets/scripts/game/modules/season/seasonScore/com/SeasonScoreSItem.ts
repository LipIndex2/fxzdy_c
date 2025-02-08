import { INotification } from "../../../../../core/mvc/interface/INotification";
import NotificationKey from "../../../../event/NotificationKey";
import GIns from "../../../../GIns";
import { ItemFrameStateBtn } from "../../../common/item/ItemFrameStateBtn";
import { EnumRedDotShowType } from "../../../common/redDot/enums/EnumRedDotShowType";
import { RedDotUtils } from "../../../common/redDot/utils/RedDotUtils";
import { TaskState } from "../../EnumSeason";
import { SeasonManager } from "../../SeasonManager";
import { SeasonModel } from "../../SeasonModel";
import { SeasonReachVo } from "../../vo/SeasonReachVo";
import * as fgui from "fairygui-cc";

export class SeasonScoreSItem extends fgui.GComponent{
    private _cfg: table.seasonactivity.Task.SeasonActivityTaskConfig;
  
    private get view(): ui.seasonScore.com.SeasonScoreSItem {
      return this as any;
    }
    // NotificationKey.SEASON_TASK_UPDATE
    onConstruct() {
      this.onInit();
    }


    public onInit() {
      const t = this;
      t.view.btnGet.onClick(t.onGet, t);
      t.view.btnGo.onClick(t.onGoTo, t);

      t.view.listItems.itemRenderer = t.awardItemRenderer.bind(t);

      const redDotCom = RedDotUtils.castComp(this.view.btnGet.redDot);
      redDotCom.showByType(EnumRedDotShowType.REWARD);
    }
    
  
    public reset(cfg:table.seasonactivity.Task.SeasonActivityTaskConfig) {
      const t = this;
      t._cfg = cfg;
      const vo = SeasonManager.ins().getSubActityVo(t._cfg.subActivityId) as SeasonReachVo;
      const taskVo = vo.getTaskVo(t._cfg.id);
      if (!taskVo) {
        this.view.lbPro.text = `${this._cfg.totalProgress}/${this._cfg.totalProgress}`;
    } else {
        let count = taskVo.progress > this._cfg.totalProgress ? this._cfg.totalProgress : taskVo.progress;
        this.view.lbPro.text = `${count}/${this._cfg.totalProgress}`;
    }

      t.view.lbTask.text = `目标积分：${cfg.totalProgress}`;

      const state = vo.getTaskState(t._cfg.id);
      if(state == TaskState.ING){
        t.view.btnGet.visible = false;
        t.view.btnGo.visible = true;
        t.view.imgGet.visible = false;
      }else if(state == TaskState.FINISH){
        t.view.btnGet.visible = false;
        t.view.btnGo.visible = false;
        t.view.imgGet.visible = true;
      }else if(state == TaskState.CAN_GET){
        t.view.btnGet.visible = true;
        t.view.btnGo.visible = false;
        t.view.imgGet.visible = false;
      }

      t.view.listItems.numItems =  this._cfg.rewards.length;
    }

    //奖励
    private awardItemRenderer(index: number, item: ItemFrameStateBtn) {
      let data = this._cfg.rewards[index];
      const vo = SeasonManager.ins().getSubActityVo(this._cfg.subActivityId) as SeasonReachVo;
      const state = vo.getTaskState(this._cfg.id);
      item.reset({k:data.k, v:data.v},  state);

  }
  //领奖
    private onGet() {
      SeasonModel.ins().sendGetRewards(this._cfg); 
    }

    private onGoTo() {
        const jumpId = this._cfg?.jumpId || 0;
  
        if (jumpId) {
            GIns.jumpManager.jumpById(jumpId);
        } else {
            console.error(`ActivityTaskConfig 未配置跳转 | id = ${this._cfg?.id}`);
        }
    }

  }
  