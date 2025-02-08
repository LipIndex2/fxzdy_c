import * as fgui from "fairygui-cc";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { PlayerAvatar } from "../../common/playerInfo/PlayerAvatar";
import G from "../../../../core/comm/G";
import { TeamChallengeUIKeys } from "../TeamChallengeUIKeys";
import { TeamChallengeModel } from "../model/TeamChallengeModel";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UICommonKey } from "../../common/const/UICommonConfig";
import { JumpManager } from "../../jump/JumpManager";
import { HangUpConfigManager } from "../../hangup/config/HangUpConfigManager";
import { BtnConfirmViewOpenArgs } from "../../common/confirm/BtnConfirmView";
import { EnumCTState } from "../enum/EnumTeamChallengeChapterState";
import GIns from "../../../GIns";

/**组队副本 成员管理Item*/
export class TeamChallengeTMgrItem2 extends fgui.GComponent {

    private _vo:Vo.teaminstance.TeamMemberVo;


    private get view(): ui.teamChallenge.components.TeamChallengeTMgrItem2 {
        return this as any;
    }

    private get model(): TeamChallengeModel {
        return TeamChallengeModel.ins();
    }

    constructor() {
        super();
    }


    onConstruct() {
        this.onInit();
    }

    public onInit() {
        const t = this;
        const view = t.view;
        view.onClick(t.onAdd, t);
        view.btnGive.onClick(t.onGive, t);
        view.btnOff.onClick(t.onOff, t);
        view.btnLeft.onClick(t.onLeft, t);
    }


    onAdd(){
        //添加队员
        if(this.view.imgAdd.visible){
            const state = TeamChallengeModel.ins().getCurState();
            if(state == EnumCTState.LOCK){
                GIns.floatingTextMgr.showTips(`队伍未解锁下一章节`);
                return;
            }else if(state == EnumCTState.FINISH){
                GIns.floatingTextMgr.showTips(`已全部通关`);
                return;
            }

            G.UIManager.open(TeamChallengeUIKeys.TeamChallengeInviteView);
        }
    }

    /**转让队长 */
    onGive(){
        if(this._vo?.teamRobot || !this._vo?.baseVo){
            return;
        }
        UIManager.ins().open(UICommonKey.BtnConfirmView, {
            title: "提示",
            titleCancel: "取消",
            titleConfirm: "确定",
            content: "确认转让队长？",
            onBtnYes: () => {
                TeamChallengeModel.ins().sendTransferLeader({targetId:this._vo.baseVo.id});
            },
        } as BtnConfirmViewOpenArgs);
    }

    /**踢出队员 */
    onOff(){
        const id = this._vo?.baseVo?.id || this._vo?.teamRobot?.id;
        UIManager.ins().open(UICommonKey.BtnConfirmView, {
            title: "提示",
            titleCancel: "取消",
            titleConfirm: "确定",
            content: "确认将该玩家移出队伍？",
            onBtnYes: () => {
                TeamChallengeModel.ins().sendKickMember({targetId:id});
            },
        } as BtnConfirmViewOpenArgs);
    }

    /**离开队伍 */
    onLeft(){
        UIManager.ins().open(UICommonKey.BtnConfirmView, {
            title: "提示",
            titleCancel: "取消",
            titleConfirm: "确定",
            content: "确认退出小队？",
            onBtnYes: () => {
                TeamChallengeModel.ins().sendLeaveTeam();
            },
        } as BtnConfirmViewOpenArgs);
    }


    /**tid队伍id s战力 stage关卡 n名字*/
    reset(args:Vo.teaminstance.TeamMemberVo) {
        const t = this;
        t._vo = args;
        if(args){
            t.view.lbName.text = args.baseVo?.name || args.teamRobot.name;
            //不为空
            t.view.groupMember.visible = true;
            t.view.imgAdd.visible = false;
            if(t.model.isCaptain()){
                //我是队长的状态，我自己的item只有离开按钮，其他人都有踢出和队长转让
                if(t.model.isMe(args.baseVo?.id)){
                    //自己
                    t.view.btnGive.visible = false;
                    t.view.btnOff.visible = false;
                    t.view.btnLeft.visible = true;
                }else{
                    t.view.btnGive.visible = true;
                    t.view.btnOff.visible = true;
                    t.view.btnLeft.visible = false;
                }
            }else{
                //不是队长，只有自己身上有离开按钮，其他人都没有按钮
                if(t.model.isMe(args.baseVo?.id)){
                    //自己
                    t.view.btnGive.visible = false;
                    t.view.btnOff.visible = false;
                    t.view.btnLeft.visible = true;
                }else{
                    t.view.btnGive.visible = false;
                    t.view.btnOff.visible = false;
                    t.view.btnLeft.visible = false;
                }
            }
        }else{
            //为空
            t.view.groupMember.visible = false;
            t.view.imgAdd.visible = true;
        }

        if(args?.baseVo){
            //镜像也走这里
            t.setAvatar(args?.baseVo);
            if(args?.teamRobot){
                t.view.btnGive.touchable = false;
            }else{
                t.view.btnGive.touchable = true;
            }
        } else if(args?.teamRobot){
            t.setAvatar(args?.teamRobot, true);
            t.view.btnGive.touchable = false;
        }
    }

    /**设置角色显示 */
    setAvatar(vo:Vo.player.PlayerBaseVo | Vo.teaminstance.TeamRobotVo , isRobot:boolean = false){
        const t = this;
        const item = t.view.avatarCom;
        if(vo){
            //存在队员
            const avatar = FguiScriptUtils.toMyScriptClass(item.avatar, PlayerAvatar);
            avatar.setCanShowMe(true);
            const id = isRobot?-1:vo.id;
            avatar.reset(
                id,
                vo['headIcon'] || 1000,
                vo['headFrame'] || 2000,
                0
            );
            item.bgImg.visible = false;
            item.avatar.visible = true;
            if(vo['level']){
                item.lbLv.text = `lv.${vo['level']}`;
            }else if(vo['levels'] && vo['levels'][0]){
                item.lbLv.text = `lv.${vo['levels'][0]}`;
            }else{
                item.lbLv.text = ``;
            }
        
            if(t.model.isCaptain(vo.id)){
                //是队长
                item.imgCaptain.visible = true;
            }else{
                item.imgCaptain.visible = false;
            }
        }else{
            item.bgImg.visible = true;
            item.avatar.visible = false;
            item.lbLv.visible = false;
            item.imgCaptain.visible = false;
        }
    }
}