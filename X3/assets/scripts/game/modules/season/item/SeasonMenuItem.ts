import * as fgui from "fairygui-cc";
import { SeasonManager, SeasonPageData } from "../SeasonManager";
import { SeasonBaseVo } from "../vo/SeasonBaseVo";
import G from "../../../../core/comm/G";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ItemListComp } from "../../common/item/ItemListComp";
import { SeasonUIKeys } from "../SeasonUIKeys";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import NotificationKey from "../../../event/NotificationKey";
import { INotification } from "../../../../core/mvc/interface/INotification";
import { SeasonConfigManager } from "../SeasonConfigManager";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import GIns from "../../../GIns";
import { Color } from "cc";
import { ActivityState } from "../EnumSeason";
import { SeasonModel } from "../SeasonModel";

export class SeasonMenuItem extends fgui.GComponent implements INotification  {
    _data:{
        eType: string;
        mainActId: number;
        pages: SeasonPageData[];
    }


    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_TEAM_APPLY_SUCESS,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_TEAM_APPLY_SUCESS:
                // 更新申请状态
                this.onTimer();
                break;
        }
    }

    private get view(): ui.season.com.SeasonMenuItem {
        return this as any;
    }

    constructor() {
        super();
    }

    onConstruct() {
        this.onInit();
    }

    public onInit() {
        const t = this;
        t.view.btnGo.onClick(t.onGo, t);
    } 

    private onGo(){
        // SeasonModel.ins().pushSeasonBossChallengeResult({subActivityId:91050, bossConfigId:900001,win:true, cancel:false,rank:1,hurt:1,progressRewardId:300,rewardResults:[], simulated:false, dailyChallengeTimes:1})
        G.UIManager.open(SeasonUIKeys.SeasonSubContainerView, this._data.pages);
        FacadeManager.ins().emit(NotificationKey.SEASON_MENU_VIEW_CLOSE);
    }

    protected onPreDispose() {
        GameTimer.ins().clearAll(this);
        super.onPreDispose();
    }

    protected onTimer(): void {
        const t = this;
        if(!this._data){
            return;
        }
        const vo = SeasonManager.ins().getSubActityVo(this._data.mainActId);
        const state = vo.getSate();
        if(state == ActivityState.LOCK){
            //未开启
            t.view.btnGo.visible = false;
            t.view.lbState.text = TimeUtils.formatTimeMsToDayHourMinuteSecondText(vo.getStartLeft())+'后开启';
            t.view.lbState.color = new Color('#9ED9FF');
            t.view.bgIcon.grayed = false;
        }else if(state == ActivityState.ING){
            //开启中
            t.view.btnGo.visible = true;
            t.view.btnGo.title = '进入';
            t.view.lbState.text = '进行中';
            t.view.lbState.color = new Color('#19DF51');
            t.view.bgIcon.grayed = false;
        }else{
            //结束
            t.view.btnGo.visible = true;
            t.view.btnGo.title = '查看';
            t.view.lbState.text = '已结束';
            t.view.lbState.color = new Color('#9ED9FF');
            t.view.bgIcon.grayed = true;
        }
      }

    reset(vo:{
        eType: string;
        mainActId: number;
        pages: SeasonPageData[];
    },index:number, isLast:boolean = false) {
        const t = this;
        t._data = vo;
        t.view.lbS.text = '赛程'+index;

        const svo = SeasonManager.ins().getSubActityVo(this._data.mainActId);
        if(!svo){
            //代表没有开,或者已经结束
            t.view.bar.value = 0;
            GIns.redDotMgr.setRedDot(RedDotKeys.Season_sub_entrance, false, [this._data.mainActId]);
            return
        }

        FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.Season_sub_entrance, [this._data.mainActId]);

        const pro = svo.getProgress();
        t.view.bar.value = pro ;
        
        GameTimer.ins().clearAll(this);
        G.GameTimer.loop(1000, this, this.onTimer)

         t.view.bar.visible = !isLast;
         t.view.imgTag.visible = false
        t.onTimer();

        const cfg = SeasonConfigManager.getMeunEnterInfo(vo.eType);
        if(cfg){
            t.view.lbTitle.text = cfg.name;
            t.view.lbDes.text = cfg.des;
            t.view.bgIcon.icon = cfg.bgIcon;

            const noOwnerItems = ItemUtils.parseKvArrayToItemArray(cfg.rewards);
            const itemListComp = FguiScriptUtils.toMyScriptClass(this.view.lisitem, ItemListComp)
            itemListComp.reset(noOwnerItems, false);
        }

        t.view.imgTitle.width = 227 + t.view.lbState.width - 90;
    }
}