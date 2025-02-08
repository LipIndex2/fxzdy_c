import { _decorator } from "cc";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import G from "../../../core/comm/G";
import { TeamChallengeChapterItem } from "./component/TeamChallengeChapterItem";
import { TeamChallengeInviteItem } from "./component/TeamChallengeInviteItem";
import { TeamChallengeInviteTitle } from "./component/TeamChallengeInviteTitle";
import { TeamChallengeItem } from "./component/TeamChallengeItem";
import { TeamChallengeMallItem } from "./component/TeamChallengeMallItem";
import { TeamChallengeMemberInfo } from "./component/TeamChallengeMemberInfo";
import { TeamChallengePage2Btn } from "./component/TeamChallengePage2Btn";
import { TeamChallengePageBtn } from "./component/TeamChallengePageBtn";
import { TeamChallengePosItem } from "./component/TeamChallengePosItem";
import { TeamChallengeShareBtn } from "./component/TeamChallengeShareBtn";
import { TeamChallengeTMgrItem1 } from "./component/TeamChallengeTMgrItem1";
import { TeamChallengeTMgrItem2 } from "./component/TeamChallengeTMgrItem2";
import { TeamChallengeModel } from "./model/TeamChallengeModel";
import { ModuleOpenManager } from "../moduleopen/ModuleOpenManager";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import { RedDotManager } from "../common/redDot/RedDotManager";
import { RedDotKeys } from "../common/redDot/RedDotKeys";
import { TeamChallengeConfigManager } from "./config/TeamChallengeConfigManager";
import { TableManager } from "../../../core/table/TableManager";
import { EnumCTChapterState } from "./enum/EnumTeamChallengeChapterState";
import NotificationKey from "../../event/NotificationKey";
import { FormationMainViewOpenArgs, UIFormationKey } from "../formation/const/UIFormationConfig";
import { FightType } from "../../comm/battle/enum/FightType";
import { FormationManager } from "../formation/FormationManager";
import { FormationModel } from "../formation/model/FormationModel";
import { TeamChallengeGiftBox } from "./component/TeamChallengeGiftBox";
import { TeamChallengePostBoss } from "./component/TeamChallengePostBoss";
import TeamChallengeScoreCom from "./component/TeamChallengeScoreCom";
import { TeamChallengePage3Btn } from "./component/TeamChallengePage3Btn";
import { TeamChallengeInviteInfo } from "./component/TeamChallengeInviteInfo";

const { ccclass, property } = _decorator;

/**
 * 邮件控制器
 */
export class TeamChallengeController extends BaseController {

    // static readonly EVENT_TEAM_STAGE_UPDATE = "EVENT_TEAM_STAGE_UPDATE";
    // EVENT_TEAM_CHAPTER_REWARD_UPDATE

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_TEAM_STAGE_UPDATE,
            NotificationKey.EVENT_TEAM_CHAPTER_REWARD_UPDATE,
            NotificationKey.EVENT_TEAM_APPLYLIST_CHANGE,
            NotificationKey.EVENT_TEAM_LEFT_UPDATE,
            NotificationKey.EVENT_TEAM_LEADER_CHANGE,
            NotificationKey.HERO_UP_LEVEL,
            NotificationKey.HERO_UP_STAR,
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.EVENT_TEAM_STAGE_UPDATE:
            case NotificationKey.EVENT_TEAM_CHAPTER_REWARD_UPDATE:
                this.refreshRed();
                break;
            case NotificationKey.EVENT_TEAM_APPLYLIST_CHANGE:
            case NotificationKey.EVENT_TEAM_LEFT_UPDATE:
            case NotificationKey.EVENT_TEAM_LEADER_CHANGE:
                this.refreshJoinRed();
                break;
            case NotificationKey.HERO_UP_LEVEL:
                this.stageUpdate();
                break
            case NotificationKey.HERO_UP_STAR:
                this.starUpdate(args);
                break;
        }
    }

    onInit(): void {
        G.FGUIManager.bindScript("ui://teamChallenge/TeamChallengeChapterItem", TeamChallengeChapterItem);
        G.FGUIManager.bindScript("ui://teamChallenge/TeamChallengeInviteItem", TeamChallengeInviteItem);
        G.FGUIManager.bindScript("ui://teamChallenge/TeamChallengeInviteTitle", TeamChallengeInviteTitle);
        G.FGUIManager.bindScript("ui://teamChallenge/TeamChallengeInviteInfo", TeamChallengeInviteInfo);
        
        G.FGUIManager.bindScript("ui://teamChallenge/TeamChallengeItem", TeamChallengeItem);
        G.FGUIManager.bindScript("ui://teamChallenge/TeamChallengeMallItem", TeamChallengeMallItem);
        G.FGUIManager.bindScript("ui://teamChallenge/TeamChallengeMemberInfo", TeamChallengeMemberInfo);
        G.FGUIManager.bindScript("ui://teamChallenge/TeamChallengePage2Btn", TeamChallengePage2Btn);
        G.FGUIManager.bindScript("ui://teamChallenge/TeamChallengePage3Btn", TeamChallengePage3Btn);
        G.FGUIManager.bindScript("ui://teamChallenge/TeamChallengePageBtn", TeamChallengePageBtn);
        G.FGUIManager.bindScript("ui://teamChallenge/TeamChallengePosItem", TeamChallengePosItem);
        G.FGUIManager.bindScript("ui://teamChallenge/TeamChallengeShareBtn", TeamChallengeShareBtn);
        G.FGUIManager.bindScript("ui://teamChallenge/TeamChallengeTMgrItem1", TeamChallengeTMgrItem1);
        G.FGUIManager.bindScript("ui://teamChallenge/TeamChallengeTMgrItem2", TeamChallengeTMgrItem2);
        G.FGUIManager.bindScript("ui://teamChallenge/TeamChallengeGiftBox", TeamChallengeGiftBox);
        G.FGUIManager.bindScript("ui://teamChallenge/TeamChallengePostBoss", TeamChallengePostBoss);
        G.FGUIManager.bindScript("ui://teamChallenge/TeamChallengeScoreCom", TeamChallengeScoreCom);
    }

    refreshRed(){
        if (!ModuleOpenManager.ins().isCanOpenModuleWithoutTips(ServerEnums.SystemType.TEAM_INSTANCE)) {
            return;
        }
        RedDotManager.ins().clearAll(RedDotKeys.TeamChallenge_CRewards);
        const model = TeamChallengeModel.ins();
        const cfgs = TableManager.getAllData(table.teaminstance.TeamInstanceChapterConfig);
        let hasReward:boolean = false;
        for(let cfg of cfgs){
            const tid = cfg.id;
            const state = model.chapterRewardState(tid);
            if(state == EnumCTChapterState.CAN_GAIN){
                hasReward = true;
                RedDotManager.ins().setRedDot(RedDotKeys.TeamChallenge_CRewards, true, [tid]);
            }else{
                RedDotManager.ins().setRedDot(RedDotKeys.TeamChallenge_CRewards, false, [tid]);
            }
            
        }
        RedDotManager.ins().setRedDot(RedDotKeys.TeamChallenge_ALLCRewards, hasReward);
    }

    refreshJoinRed(){
        if (!ModuleOpenManager.ins().isCanOpenModuleWithoutTips(ServerEnums.SystemType.TEAM_INSTANCE)) {
            return;
        }
        const model = TeamChallengeModel.ins();
        RedDotManager.ins().setRedDot(RedDotKeys.TeamChallenge_join, model.haveJoin());
    }

    stageUpdate(){
        if (!ModuleOpenManager.ins().isCanOpenModuleWithoutTips(ServerEnums.SystemType.TEAM_INSTANCE)) {
            return;
        }
       const formationVo = FormationManager.ins().getFormationVoByType(ServerEnums.FightType.TEAM_INSTANCE);
       const reqVo =  formationVo.toSetUpReqVo();
       const tops = FormationManager.ins().getSoltTop();
       const heroids = [];
       reqVo.positionVos.forEach(v=>{
           if(v.heroBaseId){
               heroids.push(v.heroBaseId);
           }
           v.heroBaseId = undefined;
       })
       heroids.forEach((v,k)=>{
           const vo = reqVo.positionVos.find((v)=>{
               return v.position == tops[k]
           })
           vo.heroBaseId = v;
       })
       FormationModel.ins().sendSetUpCustomFormation(ServerEnums.FightType.TEAM_INSTANCE, reqVo);
    }

    
    starUpdate(hid:number){
        if (!ModuleOpenManager.ins().isCanOpenModuleWithoutTips(ServerEnums.SystemType.TEAM_INSTANCE)) {
            return;
        }
       const formationVo = FormationManager.ins().getFormationVoByType(ServerEnums.FightType.TEAM_INSTANCE);
       const reqVo =  formationVo.toSetUpReqVo();
       for(let vo of reqVo.positionVos){
            if(vo.heroBaseId == hid){
                FormationModel.ins().sendSetUpCustomFormation(ServerEnums.FightType.TEAM_INSTANCE, reqVo);
                break;
            }
       }
       
    }

    openFormation(){
        //打开布阵
        G.UIManager.open(UIFormationKey.FORMATION_MAIN_VIEW, FormationMainViewOpenArgs.create(
            FightType.TEAM_INSTANCE,
            null,
            null,
            null,
            null,
            null,
            '组队布阵',
        ));
    }

}

TeamChallengeController.ins().doInit();