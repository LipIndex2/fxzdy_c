import G from "../../../../core/comm/G";
import * as fgui from "fairygui-cc";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { TeamChallengeModel } from "../model/TeamChallengeModel";
import { ChatConfigManager } from "../../chat/config/ChatConfigManager";
import GIns from "../../../GIns";
import { LeagueManager } from "../../league/leagueManager";
import { TeamChallengeConfigManager } from "../config/TeamChallengeConfigManager";

export class TeamChallengeShareBtn extends fgui.GButton {
    private _type:number;
    /**限制点击秒数 */
    private _limitTime:number = 10;

    private get view(): ui.teamChallenge.btn.TeamChallengeShareBtn {
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
        t.onClick(t.onInvite, t);
        t.onTimer();
        G.GameTimer.loop(200, t, t.onTimer);
    }

    onTimer(){
        const t = this;
        const time = t.getLeftTime();
        if(t._type == ServerEnums.ChannelType.LEAGUE && !LeagueManager.ins().isInLeague()){
            t.view.imgMask.visible = true;
            return;
        }
        if(time > 0){
            //倒计时中
            t.view.imgMask.visible = true;
            t.view.lbCd.text = `${time}秒`;
        }else{
            if(t._type ==  ServerEnums.ChannelType.LEAGUE && !LeagueManager.ins().isInLeague()){
                t.view.imgMask.visible = true;
            }else{
                t.view.imgMask.visible = false;
            }
            t.view.lbCd.text = '';
        }
    }

    getMask(){
        return this.view.imgMask;
    }

    /**tid队伍id s战力 stage关卡 n名字*/
    reset(type:ServerEnums.ChannelType) {
        const t = this;
        t._type = type;
        t._limitTime = TeamChallengeConfigManager.getChannelCD(type);
        t.view.lbName.text = this.getName();

        const cfg = ChatConfigManager.getChannelConfigById(type);
        t.view.img.icon = cfg.upImagePath;
    }

    public onInvite(){
        const t = this;
        if(t._type == ServerEnums.ChannelType.LEAGUE && !LeagueManager.ins().isInLeague()){
            GIns.floatingTextMgr.showTips(`当前没有联盟!`);
            return;
        }
        //邀请
        if(t.view.imgMask.visible){
            const str = t.view.lbName.text;
            GIns.floatingTextMgr.showTips(`${str}分享冷却中。`);
            return;
        }
        
        //分享
        const model = TeamChallengeModel.ins();
        model.sendShareTeam({channelType:t._type ,targetId:null});
    }
 
    public onPreDispose(): void {
        G.GameTimer.clearAll(this)
    }

    private getLeftTime():number{
        const t = this;
        const model = TeamChallengeModel.ins();
        const time = model.getShareTime(t._type);
        const dur = Math.floor((G.TimeManager.serverNow - time)/1000);
        const left = t._limitTime - dur;
        if(left <= 0){
            return 0
        }
        return left;
    }

    private getName():string{
        const channelId = this._type;
        const channelConfig = ChatConfigManager.getChannelConfigById(channelId);
        return channelConfig.name;
    }

}