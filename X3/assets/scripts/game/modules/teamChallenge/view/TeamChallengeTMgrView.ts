/** 组队副本  队伍管理界面 */

import { ForbiddenManager } from "../../../../core/comm/ForbiddenManager";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { LogBusiness } from "../../../../core/log/LogBusiness";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { LongForNetwork } from "../../../../core/prototypes/LongForNetwork";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { FloatingTextManager } from "../../floatingText/FloatingTextManager";
import { TeamChallengePageBtn } from "../component/TeamChallengePageBtn";
import TeamChallengeScoreCom from "../component/TeamChallengeScoreCom";
import { TeamChallengeTMgrItem1 } from "../component/TeamChallengeTMgrItem1";
import { TeamChallengeTMgrItem2 } from "../component/TeamChallengeTMgrItem2";
import { TeamChallengeConfigManager } from "../config/TeamChallengeConfigManager";
import { TeamChallengeModel } from "../model/TeamChallengeModel";
import { TeamChallengeUIKeys, TeamChallengeMgrSubUIKeys } from "../TeamChallengeUIKeys";

export class TeamChallengeTMgrView extends UICommWin {
    
    static pkgName: string = "teamChallenge";
    static viewName: string = "TeamChallengeTMgrView";

    private _index:number;
    private _powersList:number[];

    private _subViews:number[] = [
        TeamChallengeMgrSubUIKeys.TeamChallengeMgrSetSubView,
        TeamChallengeMgrSubUIKeys.TeamChallengeMgrJoinSubView,
    ]

    private get view(): ui.teamChallenge.TeamChallengeTMgrView {
        return this._view as any;
    }

    private get model():TeamChallengeModel{
        return TeamChallengeModel.ins();
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_TEAM_MGR_VIEW_CHANGE,
            NotificationKey.EVENT_TEAM_APPLYLIST_CHANGE,
            NotificationKey.EVENT_TEAM_MEMBER_CHANGE,
            NotificationKey.EVENT_TEAM_LEFT_UPDATE,
            NotificationKey.EVENT_TEAM_BASEINFO_UPDATE,
            NotificationKey.EVENT_TEAM_SHARE_SUCESS,
            NotificationKey.EVENT_TEAM_LEADER_CHANGE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_TEAM_MGR_VIEW_CHANGE:
                this.updateSubView(args);
                break;
            case NotificationKey.EVENT_TEAM_APPLYLIST_CHANGE:
                //申请列表更新
                this.updateApplyList();
                break;
            case NotificationKey.EVENT_TEAM_MEMBER_CHANGE:
                this.updateMemberInfo();
                break;
            case NotificationKey.EVENT_TEAM_LEFT_UPDATE:
                this.closeSelf();
                break;
            case NotificationKey.EVENT_TEAM_BASEINFO_UPDATE:
                this.updateBaseInfo();
                break;
            case NotificationKey.EVENT_TEAM_SHARE_SUCESS:
                this.updateBaseInfo();
                break
            case NotificationKey.EVENT_TEAM_LEADER_CHANGE:
                this.leaderUpdate();
                break;  
        }
    }

    @LogBusiness("关闭界面")
    protected onClose() {
        GameTimer.ins().clearAll(this);
        super.onClose();
    }

    protected onInit() {
        const t = this;
        t.view.listTab.itemRenderer = t.addTab.bind(t);

        t.view.listApply.setVirtual();
        t.view.listApply.itemRenderer = t.addApplyItem.bind(t);
        t.view.listMyMember.itemRenderer = t.addMemberItem.bind(t);

        t.view.btnInput1.onClick(t.onInput1, t);
        t.view.btnInput2.onClick(t.onVisibleSwith, t);
        t.view.imgClick.onClick(t.onVisibleSwith, t);
        

        t.view.btnGouXuan.onClick(this.onClickGou, this);

        /**列表刷新按钮 */
        t.view.btnListRe.onClick(t.onListRe, t);
        /**队伍信息刷新 */
        t.view.btnMgrRe.onClick(t.onMgrRe,t);

        t.view.inputName._editBox.node.on('editing-did-ended', this.onNameDidEnded, this);
        // t.view.inputScore._editBox.node.on('editing-did-ended', this.onScoreDidEnded, this);

        t.view.inputScore._editBox.node.on('editing-did-began', this.onScoreDidBegan, this);
    }

    onNameDidEnded(){
        const t = this;
        const text = this.view.inputName.text;
        const maxLen = +TeamChallengeConfigManager.getConstValue('TEAM_INSTANCE:MAX_TEAM_NAME_LEN');
        const tn = t.model.getTeamName();
        if(text.length == 0){
            //不能为空，弹出提示，重新设置原来名字
            GIns.floatingTextMgr.showTips("不能为空");
            t.view.inputName.text = tn;
            return;
        }else if(text.length > maxLen){
            GIns.floatingTextMgr.showTips(`不能大于${maxLen}个字`);
            t.view.inputName.text = tn;
            return;
        }

        if (ForbiddenManager.isForbidden(text)) {
            FloatingTextManager.ins().showTips("含有敏感词汇，修改名称失败")
            t.view.inputName.text = tn;
            return;
        }

        if(text != tn){
            t.model.sendChangeTeamName({teamName:text});
        }
    }

    onClickGou(){
        const t = this;
        t.model.sendChangeApproval({autoApproval:t.view.btnGouXuan.selected})
    }

    onScoreDidBegan(){
        const t = this;
        const vo = t.model.getMyTeamInfo();
        const num = vo.fightLimit;
        t.view.inputScore.text = Math.floor(num/10000) +'';
    }

    // onScoreDidEnded(){
    //     //暂时
    //     const max = 99999999;
    //     const t = this;
    //     const changeScore =  t.view.inputScore.text.toInt();
    //     if (changeScore == null || Number.isNaN(changeScore) ) {
    //         t.view.inputScore.text = '无限制';
    //         GIns.floatingTextMgr.showTips("请输入数字");
    //         return;
    //     }
    //     if(changeScore > max){
    //         t.view.inputScore.text = max+'';
    //     }else if(changeScore == 0){
    //         t.view.inputScore.text = '无限制';
    //     }else{
    //         t.view.inputScore.text = changeScore+'万';
    //     }
    //     const s = t.model.getFightScore();
    //     if(changeScore != s){
    //         t.model.sendChangeFightLimit({fightLimit:LongForNetwork.fromNumber(changeScore*10000) });
    //     }
      
    // }


    private onClickScore(index: number) {
        const t = this;
        if(t._powersList){
            const s = t.model.getFightScore();
            const changeScore = t._powersList[index];
            if(t._powersList[index] != s){
                t.model.sendChangeFightLimit({fightLimit:LongForNetwork.fromNumber(changeScore) });
            }
        }
        t.onVisibleSwith();
    }

    private onVisibleSwith() {
        const t = this;
        t.view.btnInput2.selected = t.view.scoreCom.visible = !t.view.scoreCom.visible;
        if(t.view.scoreCom.visible){
            const s = t.model.getFightScore();
            const index = t._powersList.findIndex(v=>{
                return Math.floor(v/10000)  == Math.floor(s/10000);
            })

            if(index > 0){
                let sIdx = index - 3 >= 0? index - 3 : 0;
                t.view.scoreCom.list_score.scrollToView(sIdx, false , true);
            }
        }
    }

    //获取名字焦点
    onInput1():void{
        this.view.inputName._editBox.setFocus()
    }



    onListRe(){
        //申请列表刷新协议
    }

    onMgrRe(){
        //提交队伍更新信息
    }

    /**更新列表 */
    updateApplyList(){
        const t = this;
        const list = t.model.getApplyList();
        t.view.listApply.numItems = list.length;
        t.view.lbEmpty.visible = !list.length;
    }

    /**更新队伍信息 */
    updateMemberInfo(){
        const t = this;
        /**更新队员列表 */
        t.view.listMyMember.numItems = 3;
    }

    updateBaseInfo(){
        const t = this;
        const vo = t.model.getMyTeamInfo();
        if(!vo){
            return;
        }
        /**设置名字 */
        t.view.inputName.text = vo.name;
        /**战力设置 */
        if(vo.fightLimit == 0){
            t.view.inputScore.text = '无限制';
        }else{
            t.view.inputScore.text = (Math.floor(vo.fightLimit/10000))+'万';
        }
        
        const scoreCom = FguiScriptUtils.toMyScriptClass(t.view.scoreCom, TeamChallengeScoreCom);        
        scoreCom.resetItems();

        /**是否自动通过 */
        t.view.btnGouXuan.selected = !!vo.autoApproval;
    }

    leaderUpdate(){
        if(!this.model.isCaptain()){
            this.closeSelf();
        }
    }

    @LogBusiness("打开界面")
    public onOpen(args: any): void {
        const t = this;

        t.view.scoreCom.visible = false;
        t.view.btnInput2.selected = false;
        t.view.btnListRe.title = '刷新';
        t.view.btnMgrRe.title = '刷新';
        t.updateSubView(t._subViews[0]);
        t.updateMemberInfo();
        t.updateBaseInfo();
        t.initScoreList();
    }

    private initScoreList(){
        const t = this;
        const id = TeamChallengeModel.ins().getChallengeInstanceConfigId();
        t._powersList = TeamChallengeConfigManager.getPowList(id);
        const scoreCom = FguiScriptUtils.toMyScriptClass(t.view.scoreCom, TeamChallengeScoreCom);        
        scoreCom.initData(t._powersList, t.onClickScore.bind(t));
    }
 
    /**更新页面 */
    private updateSubView(index: number){
        const t = this;
        if(t._index == index){
            return false;
        }
        t._index = index;
        if(t._index == TeamChallengeMgrSubUIKeys.TeamChallengeMgrSetSubView){
            //打开设置界面
            t.view.groupMember.visible = true;
            t.view.groupApply.visible = false;
        }else if(t._index == TeamChallengeMgrSubUIKeys.TeamChallengeMgrJoinSubView){
            //打开设置界面
            t.view.groupMember.visible = false;
            t.view.groupApply.visible = true;
            t.model.sendLoadTeamApplyList();
        }

        t.view.listTab.numItems = this._subViews.length;
    }

    private addTab(index: number, item: TeamChallengePageBtn){
        const t = this;
        const cfg = t._subViews[index];
        item.reset(cfg, t._index);
    }

    private addApplyItem(index:number, item:TeamChallengeTMgrItem1){
        const t = this;
        const list = t.model.getApplyList();
        item.reset(list[index]);
    }

    private addMemberItem(index:number, item:TeamChallengeTMgrItem2){
        const t = this;
        const vo = t.model.getMyTeamInfo();
        const avatars = vo.memberVos;
        item.reset(avatars[index]);
    }

}

UIScriptManager.bindScript(TeamChallengeUIKeys.TeamChallengeTMgrView, TeamChallengeTMgrView);