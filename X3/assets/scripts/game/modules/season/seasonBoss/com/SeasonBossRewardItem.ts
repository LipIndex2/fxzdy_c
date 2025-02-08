import * as fgui from "fairygui-cc";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { ItemListComp } from "../../../common/item/ItemListComp";
import { ItemUtils } from "../../../item/utils/ItemUtils";
import { ItemFrameStateBtn } from "../../../common/item/ItemFrameStateBtn";
import { TaskState } from "../../EnumSeason";

export class SeasonBossRewardItem extends fgui.GComponent {
    _rewards:Array<{k:any,v:any}>;
    _state:TaskState;

    private get view(): ui.seasonBoss.com.SeasonBossRewardItem {
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
      t.view.richTitle.text = `最高伤害达到 <color=#3CFE37>${Math.floor(cfg.hp/10000)}万</color>可领取`;
      t._state = state;
      t._rewards = cfg.rewards;
      t.view.listItems.numItems = cfg.rewards.length;
    }
  }
  