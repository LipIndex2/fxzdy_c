/**组队副本 邀请界面分页item */
import * as fgui from "fairygui-cc";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { PlayerAvatar } from "../../common/playerInfo/PlayerAvatar";
import { TeamChallengeModel } from "../model/TeamChallengeModel";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { EnumCTState } from "../enum/EnumTeamChallengeChapterState";
import GIns from "../../../GIns";
import { INotification } from "../../../../core/mvc/interface/INotification";
import NotificationKey from "../../../event/NotificationKey";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import { TeamChallengeInviteType } from "../view/TeamChallengeInviteView";
import { TeamChallengeConfigManager } from "../config/TeamChallengeConfigManager";

/**组队副本， 组队大厅item */
export class TeamChallengeInviteItem extends fgui.GComponent implements INotification {
    
    private _vo:Vo.teaminstance.TeamInstancePlayerVo;
    private _type:TeamChallengeInviteType;

    private get view(): ui.teamChallenge.components.TeamChallengeInviteItem {
        return this as any;
    }

    constructor() {
        super();
    }

    listenNotifications(): string[] {
        return [
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
        }
    }

    onConstruct() {
        FacadeManager.ins().registerNotification(this);
        this.onInit();
    }

    protected onPreDispose() {
        FacadeManager.ins().removeNotification(this);
        super.onPreDispose();
    }
    
    public onInit() {
        const t = this;
        t.view.btnShare.onClick(this.onShare.bind(t), t);
        t.view.btnShare.text = '分享';
    }
    
    onShare(){
        const state = TeamChallengeModel.ins().getCurState();
        if(state == EnumCTState.LOCK){
            GIns.floatingTextMgr.showTips(`队伍未解锁下一章节`);
            return;
        }else if(state == EnumCTState.FINISH){
            GIns.floatingTextMgr.showTips(`已全部通关`);
            return;
        }
        
        const t = this;
        const model = TeamChallengeModel.ins();
        const id = this._vo?.baseVo?.id;
        if(id && model.inMyTeam(id)){
            GIns.floatingTextMgr.showTips(`该玩家已在队伍中`);
            return;
        }

        if(t._type == TeamChallengeInviteType.FriendMirror){
            //镜像邀请
            if(model.isTeamFull()){
                //队伍已经满
                GIns.floatingTextMgr.showTips(`队伍已满员`);
                return;
            }

            if(model.mirrorInviteTimes() <= 0){
                //镜像剩余次数不足
                GIns.floatingTextMgr.showTips(`每日拉取镜像次数已耗尽`);
                return;
            }

            const limit = +TeamChallengeConfigManager.getConstValue('TEAM_INSTANCE:HELP_FRIEND_IMAGE_COUNT');
            const left = limit - t._vo.helpFriendImageCount
            if(left<=0){
                //该镜像剩余邀请次数不足
                GIns.floatingTextMgr.showTips(`TA今天已经被邀请了很多次镜像了，明天再来试试吧`);
                return;
            }
            model.sendAddFriendRobotToTeam({friendId:this._vo.baseVo.id})
        }else if(t._type == TeamChallengeInviteType.NormalRobot){
            if(model.isTeamFull()){
                //队伍已经满
                GIns.floatingTextMgr.showTips(`队伍已满员`);
                return;
            }
            TeamChallengeModel.ins().sendAddRobotToTeam();
        }else{
            //分享协议
            this._vo && model.sendShareTeam({channelType:ServerEnums.ChannelType.PRIVATE ,targetId:this._vo.baseVo.id});
        }

    }
    
    reset(vo:{
            type: number;
            vo: Vo.teaminstance.TeamInstancePlayerVo;
        }) {
        
        const t = this;
        t._vo = vo?.vo;
        t._type = vo.type;
        const ctrl = t.view.getController('state');
        if(t._vo){
            if(vo.type == TeamChallengeInviteType.FriendMirror){
                ctrl.selectedIndex = 1;
                t.view.btnShare.title = '邀请镜像';
                const limit = +TeamChallengeConfigManager.getConstValue('TEAM_INSTANCE:HELP_FRIEND_IMAGE_COUNT');
                const left = limit - t._vo.helpFriendImageCount;
                t.view.lbLeft.text = `剩余次数：${left}/${limit}`;
                t.view.lbState.visible = false;
            }else{
                ctrl.selectedIndex = 0;
                t.view.btnShare.title = '分享';
                t.view.lbState.visible = true;
            }

            t.view.groupInfo.visible = true;
            t.view.lbTips.visible = false;

            t.view.lbName.text =  t._vo.baseVo.name;
            t.view.lbScore.text =  '战力:' + StringUtils.getFightStr( t._vo.baseVo.fight);

            if( t._vo.shared && (vo.type == TeamChallengeInviteType.Friend || vo.type == TeamChallengeInviteType.Group)){
                t.view.btnShare.visible = false;
                t.view.lbShare.visible = true;
            }else{
                t.view.btnShare.visible = true;
                t.view.lbShare.visible = false;
            }

            const avatar = FguiScriptUtils.toMyScriptClass(t.view.avatar, PlayerAvatar);
            avatar.reset(
                t._vo.baseVo.id,
                t._vo.baseVo.headIcon,
                t._vo.baseVo.headFrame,
                t._vo.baseVo.imageId
            );


        }else{
            if(t._type == TeamChallengeInviteType.NormalRobot){
                ctrl.selectedIndex = 1;
                //普通机器人
                t.view.lbName.text =  '合击支援部队';
                t.view.btnShare.title = '请求支援';
                t.view.lbLeft.text = '无限邀请';
                t.view.lbState.visible = false;
                const avatar = FguiScriptUtils.toMyScriptClass(t.view.avatar, PlayerAvatar);
                avatar.reset(
                    -1,
                    1000,
                    2000,
                    0,
                );
                const cfg = TeamChallengeConfigManager.getCurInstanceConfig();
                t.view.lbScore.text =  '战力:' + StringUtils.getFightStr( cfg?.power || 0);
            }else{
                ctrl.selectedIndex = 0;
                //没有玩家在线
                t.view.groupInfo.visible = false;
                t.view.lbTips.visible = true;
                if(t._type == TeamChallengeInviteType.FriendMirror){
                    t.view.lbTips.text = '暂无好友镜像';
                }else{
                    t.view.lbTips.text = '暂无在线玩家';
                }
            }
        }
      
    }

    protected onEnable(): void {
        super.onEnable();
    }

    protected onDisable(): void {
        super.onDisable();

    }
}