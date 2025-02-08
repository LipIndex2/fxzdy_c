import * as fgui from "fairygui-cc";
import FacadeManager from "../../../../../core/mvc/FacadeManager";
import NotificationKey from "../../../../event/NotificationKey";
import { SeasonReachScoreType } from "../../EnumSeason";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../../common/redDot/redDotCom";
import { RedDotKeys } from "../../../common/redDot/RedDotKeys";

export class SeasonReachTab extends fgui.GComponent {
    private _index: number = 1;
    private _actId: any;
    private _type: any;

    get view(): ui.seasonReach.com.SeasonReachTab {
        return this as any;
    }


    protected onConstruct() {
        super.onConstruct();

        this.view.onClick(this.onClickDay, this);
    }

    onClickDay() {
        FacadeManager.ins().emit(NotificationKey.SEASON_COMPETITION_TYPE_CHANGE, this._index);
    }

    reset(index:number,chooseIndex:number, actId:number) {
        const t = this;
        t._index =index;
        t._actId = actId;

        if(t._index ==  SeasonReachScoreType.ARENA){
            //英雄星级
            t.view.lb.text = '竞技场';
        }else if(t._index ==  SeasonReachScoreType.EXPLORE){
            //星灵星级
            t.view.lb.text = '星际勘探';
        } 

        if(t._index == chooseIndex){
            t.view.img.visible = true;
        }else{
            t.view.img.visible = false;
        }
    
        FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.Season_entrance_Rewards, [t._actId || 0, SeasonReachScoreType[t._type] || "0"]);   
    }

}