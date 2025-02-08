import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { LogBusiness } from "../../../../core/log/LogBusiness";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { TableManager } from "../../../../core/table/TableManager";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import NotificationKey from "../../../event/NotificationKey";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { RuleController } from "../../rule/RuleController";
import { SeasonMenuItem } from "../item/SeasonMenuItem";
import { SeasonConfigManager } from "../SeasonConfigManager";
import { SeasonManager, SeasonPageData } from "../SeasonManager";
import { SeasonUIKeys } from "../SeasonUIKeys";

export class SeasonMenuView extends UIPage {
  static pkgName: string = "season";
  static viewName: string = "SeasonMenuView";
  protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;

  private _activityId:number;

  private get view(): ui.season.SeasonMenuView {
    return this._view as any;
  }

  listenNotifications(): string[] {
    return [NotificationKey.SEASON_ACTIVITY_NEWSTATE];
  }

  notificationHandler(eventName: string, args?: any): void {
    switch (eventName) {
      case NotificationKey.SEASON_ACTIVITY_NEWSTATE:
        this.reset()
        break;
    }
  }

  protected onInit() {
    const t = this;
    t.view.btnRule.onClick(t.onRule, t);

    t.view.listMenu.setVirtual();
    t.view.listMenu.itemRenderer = t.itemRenderer.bind(t);
  }

  itemRenderer(index: number, comp: SeasonMenuItem) {
    const menu = this._menus[index];
    comp.reset(menu, index+1, index+1 == this._menus.length)
  }

  @LogBusiness("打开界面")
  public onOpen(args: SeasonPageData): void {
    const t = this;
    t._activityId = args.subActId;

    G.GameTimer.loop(1000, this, this.onTimer)
    t.onTimer();
    this.reset();
  }


  protected onTimer(): void {
    const t = this;
    const leftTime = SeasonManager.ins().getLeftTimeBySeasonId();
    if(leftTime > 0){
      t.view.lbCd.text =  `<color=#3CFE37>${TimeUtils.formatTimeMsToDayHourMinuteSecondText(leftTime)}</color>后结束`;
    }else{
      t.view.lbCd.text = '已结束';
    }
  }

  @LogBusiness("关闭界面")
  protected onClose() {
    super.onClose();
    G.GameTimer.clearAll(this);
  }

  //规则
  private onRule() {
    RuleController.ins().openRule(
        EnumRuleKeys.SEASON_RULE,
        this.view.btnRule
    );
  }

  _menus:{eType:string, mainActId:number, pages:SeasonPageData[]}[];
  reset() {
    this._menus = SeasonManager.ins().getMenus();
    this.view.listMenu.numItems = this._menus.length;

    const rewards = SeasonConfigManager.getTopRewards(this._activityId);
    const item = FguiScriptUtils.toMyScriptClass(this.view.itemBtn, ItemFrameBtn);
    if(rewards && rewards[0]){
        item.reset(rewards[0].k, rewards[0].v);

        const itemConfig = TableManager.getDataById(table.item.ItemConfig, rewards[0].k);
        this.view.lbRe.text = itemConfig.name;
    } 
  }
}

UIScriptManager.bindScript(SeasonUIKeys.SeasonMenuView, SeasonMenuView);
