/**组队副本 申请加入Item*/

import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { StringUtils } from "../../../../core/utils/StringUtils";
import GIns from "../../../GIns";
import { PlayerAvatar } from "../../common/playerInfo/PlayerAvatar";
import { EnumCTState } from "../enum/EnumTeamChallengeChapterState";
import { TeamChallengeModel } from "../model/TeamChallengeModel";
import * as fgui from "fairygui-cc";

export class TeamChallengeTMgrItem1 extends fgui.GComponent {

    private _vo:Vo.teaminstance.TeamApplyVo;


    private get view(): ui.teamChallenge.components.TeamChallengeTMgrItem1 {
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
        view.btnYes.onClick(t.onYes, t);
        view.btnNo.onClick(t.onNo, t);
    }


    onYes(){
        if(!this._vo){
            return;
        }
        
        if(TeamChallengeModel.ins().inMyTeam(this._vo?.baseVo?.id)){
            GIns.floatingTextMgr.showTips(`该玩家已在队伍中`);
            return;
        }
        
        const state = TeamChallengeModel.ins().getCurState();
        if(state == EnumCTState.LOCK){
            GIns.floatingTextMgr.showTips(`队伍未解锁下一章节`);
            return;
        }else if(state == EnumCTState.FINISH){
            GIns.floatingTextMgr.showTips(`已全部通关`);
            return;
        }
        //同意
        TeamChallengeModel.ins().sendApproval({targetId:this._vo.baseVo.id, isAgree:true});
    }

    onNo(){
        if(!this._vo){
            return;
        }
        //拒绝
        TeamChallengeModel.ins().sendApproval({targetId:this._vo.baseVo.id, isAgree:false});
    }
 

    /**tid队伍id s战力 stage关卡 n名字*/
    reset(args:Vo.teaminstance.TeamApplyVo) {
        const t = this;
        t._vo = args;
        t.view.lbName.text = args.baseVo.name;
        t.view.lbScore.text = '战力:' + StringUtils.getFightStr(args.baseVo.fight);
        t.setAvatar(t._vo);
    }

    /**设置角色显示 */
    setAvatar(vo:Vo.teaminstance.TeamApplyVo){
        const t = this;
        const item = t.view.avatar
        if(vo){
            //存在队员
            const avatar = FguiScriptUtils.toMyScriptClass(item.avatar, PlayerAvatar);
            avatar.reset(
                vo.baseVo.id,
                vo.baseVo.headIcon,
                vo.baseVo.headFrame,
                0
            );
            item.avatar.visible = true;
            item.lbLv.text = `lv.${vo.baseVo.level}`;
        }else{
            item.avatar.visible = false;
            item.lbLv.visible = false;
        }
        item.imgCaptain.visible = false;
    }

    protected onEnable(): void {
        super.onEnable();
    }

    protected onDisable(): void {
        super.onDisable();

    }
}