import { Color } from "cc";
import G from "../../../../core/comm/G";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { FightType } from "../../../comm/battle/enum/FightType";
import GIns from "../../../GIns";
import { HeroDetailsAvatar } from "../../common/hero/HeroDetailsAvatar";
import { FormationMainViewOpenArgs, UIFormationKey } from "../../formation/const/UIFormationConfig";
import { TeamChallengeModel } from "../model/TeamChallengeModel";
import { TeamChallengeUIKeys } from "../TeamChallengeUIKeys";
import * as fgui from "fairygui-cc";
import { TeamChallengeController } from "../TeamChallengeController";
import { EnumCTState } from "../enum/EnumTeamChallengeChapterState";

/**组队副本主界面， 模型展示模块 */
export class TeamChallengeMemberInfo extends fgui.GComponent {

    private _avatar1:HeroDetailsAvatar;
    private _avatar2:HeroDetailsAvatar;
    private _config:Vo.teaminstance.TeamMemberVo;


    private get view(): ui.teamChallenge.components.TeamChallengeMemberInfo {
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
        t.view.onClick(this.onClickPanel, this);
        t._avatar1 = FguiScriptUtils.toMyScriptClass(this.view.avatar1, HeroDetailsAvatar);
        t._avatar2 = FguiScriptUtils.toMyScriptClass(this.view.avatar2, HeroDetailsAvatar);
    }


    onClickPanel(){
        const t = this;
        if(!t._config){
            const state = TeamChallengeModel.ins().getCurState();
            if(state == EnumCTState.LOCK){
                GIns.floatingTextMgr.showTips(`队伍未解锁下一章节`);
                return;
            }else if(state == EnumCTState.FINISH){
                GIns.floatingTextMgr.showTips(`已全部通关`);
                return;
            }

            //不存在,打开邀请玩家界面
            if(!TeamChallengeModel.ins().inTeam()){
                G.UIManager.open(TeamChallengeUIKeys.TeamChallengeMallView);
            }else{
                G.UIManager.open(TeamChallengeUIKeys.TeamChallengeInviteView);
            }
        }else{
            if(TeamChallengeModel.ins().isMe(t._config?.baseVo?.id)){
                //打开布阵
                TeamChallengeController.ins().openFormation();
            }else{
                GIns.floatingTextMgr.showTips("只能更换自己的角色");
            }
        }
    }

    setData(config:Vo.teaminstance.TeamMemberVo ) {
        const t = this;
        t._config = config;
        if(!config){
            /**不存在的情况下，只显示加号 */
            t.view.imgAdd.visible = true;
            t.view.groupInfo.visible = false;
        }else {
            t.view.imgAdd.visible = false;
            t.view.groupInfo.visible = true;
            
            const heros = config.positionVisitVo;
            if(heros){
                const vo_1 = heros[0]
                if(vo_1){
                    t._avatar1.visible = true;
                    t._avatar1.reset(vo_1?.heroBaseId, vo_1?.star, vo_1?.heroLevel, vo_1.useSkinId);
                }else{
                    t._avatar1.visible = false;
                }
                
                const vo_2 = heros[1]
                if(vo_2){
                    t._avatar2.visible = true;
                    t._avatar2.reset(vo_2?.heroBaseId, vo_2?.star, vo_2?.heroLevel, vo_2.useSkinId);
                }else{
                    t._avatar2.visible = false;
                }
              
            }else{
                t._avatar1.visible = false;
                t._avatar2.visible = false;
            }
            
            t.view.lbName.text = config.baseVo?.name || config.teamRobot?.name;
            t.view.lbName.color = GIns.teamChallengeModel.isMe(config.baseVo?.id) ?  new Color("#19df51") :  new Color("#AAE2FF");
        }
    }

    protected onEnable(): void {
        super.onEnable();
    }

    protected onDisable(): void {
        super.onDisable();
        this._config = null;
    }

 
}