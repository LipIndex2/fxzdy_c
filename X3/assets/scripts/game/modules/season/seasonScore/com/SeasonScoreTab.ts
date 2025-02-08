import * as fgui from "fairygui-cc";
import FacadeManager from "../../../../../core/mvc/FacadeManager";
import { ServerEnums } from "../../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../../event/NotificationKey";
import { SeasonReachScoreType } from "../../EnumSeason";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../../common/redDot/redDotCom";
import { RedDotKeys } from "../../../common/redDot/RedDotKeys";

export class SeasonScoreTab extends fgui.GComponent {
    private _type: number = 1;
    private _actId;

    get view(): ui.seasonScore.com.SeasonScoreTab {
        return this as any;
    }


    protected onConstruct() {
        super.onConstruct();

        this.view.onClick(this.onClickDay, this);
    }

    onClickDay() {
        FacadeManager.ins().emit(NotificationKey.SEASON_SCORE_TYPE_CHANGE, this._type);
    }

    public reset(index:number,chooseIndex:number,actId:number) {
        const t = this;
        t._type =index;
        t._actId = actId;
        
        if(t._type ==  SeasonReachScoreType.HERO_UP_STAR){
            //英雄星级
            t.view.lb.text = '英雄星级';
        }else if(t._type ==  SeasonReachScoreType.PET_UP_STAR){
            //星灵星级
            t.view.lb.text = '星灵星级';
        }else if(t._type ==  SeasonReachScoreType.AWAKE_WEAPON_UP_STAR){
            //星灵星级
            t.view.lb.text = '超武星级';
        }

        if(t._type == chooseIndex){
            t.view.imgSel.visible = true;
        }else{
            t.view.imgSel.visible = false;
        }    
        
        FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.Season_entrance_Rewards, [t._actId || 0, SeasonReachScoreType[t._type] || "0"]);
    }

}