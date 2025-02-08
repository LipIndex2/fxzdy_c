import * as fgui from "fairygui-cc";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { ItemListComp } from "../../../common/item/ItemListComp";
import { ItemUtils } from "../../../item/utils/ItemUtils";
import { ItemFrameStateBtn } from "../../../common/item/ItemFrameStateBtn";
import { TaskState } from "../../EnumSeason";
import { StringUtils } from "../../../../../core/utils/StringUtils";
import { Vec3 } from "cc";
import { Vec2 } from "cc";

export class SeasonBossProCom extends fgui.GComponent {
    _rewards:Array<{k:any,v:any}>;
    _state:TaskState;

    private get view(): ui.seasonBoss.com.SeasonBossProCom {
      return this as any;
    }
  
    onConstruct() {
      this.onInit();
    }
  
    public onInit() {
      const t = this;
      t.view.listItems.setVirtual();
      t.view.listItems.itemRenderer = t.addItem.bind(t);
    }
  
    addItem(index:number, item:ItemFrameStateBtn){
      const t = this;
      if(t._rewards){
        const reward = t._rewards[index];
        item.reset(reward, t._state || TaskState.ING);
      }
    }

 
    reset(cfg:{hp:number, rewards:Array<{k:any,v:any}>, id:number},  state: TaskState) {
      const t = this;
      t.view.lb.text = StringUtils.getFightStr(cfg.hp);
      t._state = state;
      t._rewards = cfg.rewards;
      t.view.listItems.numItems = cfg.rewards.length;
    }

        // 获取奖励的世界坐标
    getRewardWorldPos(): Vec2 {
      return this.view.listItems.localToGlobal();
     }
  }
  