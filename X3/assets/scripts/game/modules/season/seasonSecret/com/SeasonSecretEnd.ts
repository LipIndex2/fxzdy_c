import * as fgui from "fairygui-cc";
import GIns from "../../../../GIns";

export class SeasonSecretEnd extends fgui.GComponent {


    private get view(): ui.seasonSecret.com.SeasonSecretEnd {
      return this as any;
    }
  
    onConstruct() {
      this.onInit();
    }
  
    public onInit() {
      const t = this;
      t.onClick(t.clickCB, t);
    }
  
    private clickCB(){
      GIns.floatingTextMgr.showTips(`通关上一难度解锁`);
    }

    reset(cfg?:table.seasonactivity.SeasonSecret.SeasonSecretConfig , chooseIndex?:number) {
 
    }
}