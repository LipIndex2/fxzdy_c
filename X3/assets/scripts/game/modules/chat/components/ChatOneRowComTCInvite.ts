/**聊天 ，组队邀请 */

import { Color } from "cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import FGUI from "../../../../core/fgui/FGUI";
import { Vec3 } from "cc";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { ChatRowVo } from "../vo/ChatRowVo";
import { ChatConfigManager } from "../config/ChatConfigManager";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { PlayerAvatar } from "../../common/playerInfo/PlayerAvatar";
import { ChatUtils } from "../utils/ChatUtils";
import { EnumChatSendType } from "../enums/EnumChatSendType";
import { VipModel } from "../../vip/model/VipModel";
import GIns from "../../../GIns";
import { TeamChallengeModel } from "../../teamChallenge/model/TeamChallengeModel";
import { INotification } from "../../../../core/mvc/interface/INotification";
import NotificationKey from "../../../event/NotificationKey";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { TeamChallengeConfigManager } from "../../teamChallenge/config/TeamChallengeConfigManager";
import FacadeManager from "../../../../core/mvc/FacadeManager";

@bindFguiExtension("ui://chat/ChatOneRowComTCInvite")
export class ChatOneRowComTCInvite extends FGUI.GComponent implements INotification {

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_TEAM_APPLY_SUCESS,
            NotificationKey.EVENT_TEAM_JOIN,
            NotificationKey.EVENT_TEAM_LEFT_UPDATE,
            NotificationKey.EVENT_TEAM_CREATE_SUCCESS,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_TEAM_APPLY_SUCESS:
            case NotificationKey.EVENT_TEAM_JOIN:
            case NotificationKey.EVENT_TEAM_LEFT_UPDATE:
            case NotificationKey.EVENT_TEAM_CREATE_SUCCESS:
                // 更新申请状态
                this.updateApply();
                break;
        }

    }

    // 最大宽度
    private _maxWidth: number = 0;
    // 背景高度
    private _bgH: number = 0;
    private _bgW: number = 0;
    // 原始高度
    private _originalViewH: number = 0;

    protected _rowVo: ChatRowVo = null;

    protected _defaultColor: Color = new Color('#ADC8F8')
    protected _defaultOutlineColor: Color = null
    protected _defaultOutlineWidth: number = 0
    protected _vipColor: Color = new Color('#ADC8F8')
    protected _vipOutlineColor: Color = new Color('#FFFFFF')
    protected _vipOutlineWidth: number = 2

    private get view(): ui.chat.components.ChatOneRowComTCInvite {
        return this as any;
    }


    protected onConstruct() {
        super.onConstruct();

        FacadeManager.ins().registerNotification(this);

        this.view.btnJoinL.onClick(this.onInvite, this);
        this.view.btnJoinR.onClick(this.onInvite, this);
    }

    protected onInvite(){
        const t = this;
        //申请接口
        const vo = t._rowVo?.templateVo?.termVo?.teamBriefVo;
        if(!vo){
            GIns.floatingTextMgr.showTips(`队伍不存在`);
        }else{
            if(TeamChallengeModel.ins().isMyTeam(vo.id)){
                GIns.floatingTextMgr.showTips(`不能加入自己队伍`);
                return;
            }
            //申请
            if(TeamChallengeModel.ins().inTeam()){
                GIns.floatingTextMgr.showTips(`已在队伍中`);
                return;
            }
            TeamChallengeModel.ins().sendApplyJoinTeam({teamId:vo.id});
        }
    }

    

    protected onPreDispose() {
        FacadeManager.ins().removeNotification(this);
        GameTimer.ins().clearAll(this);
        super.onPreDispose();
    }

    reset(rowVo: ChatRowVo) {
        this._rowVo = rowVo;
        const showType = rowVo.type;

        this.view.getController("type").selectedIndex = showType;

        const avatar = FguiScriptUtils.toMyScriptClass(this.view.playerAvatar, PlayerAvatar);
        const playerName = rowVo.playerName;
        avatar.reset(
            rowVo.playerId,
            rowVo.headIconId,
            rowVo.headFrameId,
            0
        );

        // VIP name
        this.setVipPlayerName(rowVo);

        if(EnumChatSendType.OTHER == showType){
            //显示左边
        }else if (EnumChatSendType.ME == showType){
            //显示右边
        }

        this.view.textPlayerNameL.text = playerName;
        this.view.textPlayerNameR.text = playerName;

        const vo = this._rowVo?.templateVo?.termVo?.teamBriefVo;
        if(!vo){
            return;
        }
        this.view.textFloorL.text = vo.name;
        this.view.textFloorR.text = vo.name;

      
        if(vo.memberVos){
            let members = [];
            for(let i = 0; i<= 3; i++){
                if(vo.memberVos[i]){
                    members.push(vo.memberVos[i]);
                }
            }

            TeamChallengeModel.ins().membersSort(members, vo.leaderId);
            for(let i = 0; i<3; i++){
                const index = i+1;
                const m = members[i];
                const avatarL = FguiScriptUtils.toMyScriptClass(this.view.getChild('playerAvatarL'+index), PlayerAvatar);
                const avatarR = FguiScriptUtils.toMyScriptClass(this.view.getChild('playerAvatarR'+index), PlayerAvatar);
                if(m){
                    avatarL.visible = true;
                    avatarR.visible = true
                    if(m.baseVo){
                        avatarL.reset(m.baseVo?.id, m.baseVo?.headIcon, m.baseVo?.headFrame, m.baseVo?.imageId);
                        avatarR.reset(m.baseVo?.id, m.baseVo?.headIcon, m.baseVo?.headFrame, m.baseVo?.imageId);
                    }
    
                    if(m.robotBrief){
                        avatarL.reset(-1, 1000, 2000, null);
                        avatarR.reset(-1, 1000, 2000, null);
                    }
    
                }else{
                    avatarL.visible = false;
                    avatarR.visible = false;
                }
            }
        }


        if(vo.fightLimit){
            //有限制
            this.view.lbConditionL.text = this.view.lbConditionR.text = StringUtils.getFightStr(vo.fightLimit);
            this.view.imgFightL.visible = this.view.imgFightR.visible = true;
        }else{
            //无限制
            this.view.imgFightL.visible = this.view.imgFightR.visible = false;
            this.view.lbConditionL.text = this.view.lbConditionR.text = '无限制';
        }

        if(vo.teamInstanceConfigId){
            const cfg = TeamChallengeConfigManager.getChapterCfg(vo.teamInstanceConfigId);
            const cur = TeamChallengeModel.ins().getFloorInfo(vo.teamInstanceConfigId)
            this.view.textFloorL.text = this.view.textFloorR.text = cfg.chapterName+`第${cur?.cur}关`;
        }else{
            this.view.textFloorL.text = this.view.textFloorR.text = '';
        }


        if(vo.autoApproval){
            this.view.btnJoinL.title = this.view.btnJoinR.title = '加入';
        }else{
            this.view.btnJoinL.title = this.view.btnJoinR.title = '申请';
        }

        this.updateApply();
    }

    private updateApply(){
        const vo = this._rowVo?.templateVo?.termVo?.teamBriefVo;
        if(!vo){
            return;
        }
        
        if((TeamChallengeModel.ins().isApply(vo?.id) || TeamChallengeModel.ins().isMyTeam(vo?.id))){
            //已经申请过
            this.view.btnJoinL.visible = this.view.btnJoinR.visible = false;
            this.view.tipsL.visible = this.view.tipsR.visible = true;
            if(TeamChallengeModel.ins().isMyTeam(vo?.id)){
                this.view.tipsL.text = this.view.tipsR.text = '已加入';
            }else{
                this.view.tipsL.text = this.view.tipsR.text = '已申请';
            }

        }else{
            this.view.btnJoinL.visible = this.view.btnJoinR.visible = true;
            this.view.tipsL.visible = this.view.tipsR.visible = false;

        }
    }

    private setVipPlayerName(rowVo: ChatRowVo) {
        let vipColor = null;
        if (rowVo.vipLv > 0) {
            vipColor = VipModel.ins().getChatColors(rowVo.vipLv)
        }
        let outline: string = null
        if (vipColor) {
            this._vipColor.fromHEX(vipColor.colors[0].color)
            outline = vipColor.colors[0].outline
            if (outline) {
                this._vipOutlineColor.fromHEX(outline)
                this.setTextPlayerNameColor(this._vipColor, this._vipOutlineColor, this._vipOutlineWidth)
            } else {
                this.setTextPlayerNameColor(this._vipColor, null, 0)
            }
        } else {
            this.setTextPlayerNameColor(this._defaultColor, this._defaultOutlineColor, this._defaultOutlineWidth)
        }
    }

    protected setTextPlayerNameColor(color: Color, outline: Color, outlineWidth: number): void {
        this.view.textPlayerNameL.stroke = this.view.textPlayerNameR.stroke = outlineWidth
        if (outlineWidth > 0 && outline) {
            //没有描边
            this.view.textPlayerNameL.strokeColor = this.view.textPlayerNameR.strokeColor = outline
        }
        this.view.textPlayerNameL.color = this.view.textPlayerNameR.color = color
    }
}