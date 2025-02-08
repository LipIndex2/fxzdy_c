import * as fgui from "fairygui-cc";
import { ModelNode } from "../../common/node/ModelNode";
import { PlayerInfoConfigManager } from "../../player/config/PlayerInfoConfigManager";
import { UIManager } from "../../../../core/mvc/UIManager";
import { PlayerUIKeys } from "../../player/PlayerUIKeys";
import { PlayerInfoMainViewOpenArgs } from "../../player/structs/PlayerInfoMainViewOpenArgs";
import { TeamChallengeModel } from "../model/TeamChallengeModel";
import G from "../../../../core/comm/G";
import { TeamChallengeUIKeys } from "../TeamChallengeUIKeys";
import GIns from "../../../GIns";
import { SettingsConfigManager } from "../../settings/config/SettingsConfigManager";
import { EnumCTState } from "../enum/EnumTeamChallengeChapterState";

/**组队副本主界面， 模型展示模块 */
export class TeamChallengePosItem extends fgui.GComponent {

    private _modelId:number;
    private _modelNode:ModelNode;

    private _pid:number;

    private get view(): ui.teamChallenge.components.TeamChallengePosItem {
        return this as any;
    }

    constructor() {
        super();
    }


    onConstruct() {
        this.onInit()
    }

    public onInit() {
        this.view.onClick(this.onClickPanel, this)
    }


    onClickPanel(){
        if(this._pid){
            UIManager.ins().open(PlayerUIKeys.PlayerInfoMainView, PlayerInfoMainViewOpenArgs.create(
                this._pid
            ));
        }else{
            //没id，但有模型就是机器人
            if(this.view.shadow.visible){
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

            if(!TeamChallengeModel.ins().inTeam()){
                G.UIManager.open(TeamChallengeUIKeys.TeamChallengeMallView);
            }else{
                G.UIManager.open(TeamChallengeUIKeys.TeamChallengeInviteView);
            }
           
        }
    }


    reset(config: Vo.teaminstance.TeamMemberVo) {
        const t = this;
        t._pid = config?.baseVo?.id;
        if(!this._modelNode){
            this._modelNode = this.view.modelNode as ModelNode;
        }

        if(!config){
            this.showInvite();
        }else{
            const setCfg = SettingsConfigManager.getShowConfigById(config?.baseVo?.imageId || 4000);
            const id = setCfg.heroModelId;
            if (this._modelId != id) {
                this._modelId = id;
                this._modelNode.loadByModelId(id);
                this._modelNode.setScale(-1.5, 1.5);
                this._modelNode.playOrders([
                    {
                        name: 'idle',
                        isLoop: true
                    }
                ])
            }
            if(config?.baseVo?.title){
                t.view.imgTitle.visible = true;
                t.view.imgTitle.icon = PlayerInfoConfigManager.getTitleConfigById(config.baseVo.title)?.assetPath;
            }else{
                t.view.imgTitle.visible = false;
            }
            t.view.imgAdd.visible = false;
            t.view.shadow.visible = true;
            t.view.lbCondition.text = '';
            t.view.lbName.text = config?.baseVo?.name || config?.teamRobot?.name;
            t.view.roleG.visible = true;
            const pid = config?.baseVo?.id || config?.teamRobot?.id;
            t.view.imgCaptain.visible = TeamChallengeModel.ins().isCaptain(pid);
        }
        const w = t.view.lbName.width;
        this.view.lbName.x = (100-w)/2;
    }

    /** 无模型节点的显示 */
    showInvite(){
        const t = this;
        t.view.imgAdd.visible = true;
        t.view.shadow.visible = false;
        if(TeamChallengeModel.ins().inTeam()){
            t.view.lbCondition.text = '邀请玩家';
        }else{
            t.view.lbCondition.text = '加入队伍';
        }
        t.view.roleG.visible = false;
        this._modelNode && this._modelNode.clear();
        this._modelNode = null;
        this._modelId = null;
        t.view.lbName.text = '';
    }

    /** 改变人物模型动作 */
    changeModelAct(act: string) {
        if (!this._modelNode) {
            this.handleNoModelNode(act);
            return;
        }

        this._modelNode.playOrders([
            {
                name: act,
                isLoop: true,
            },
        ]);
    }

    /** 处理人物移动时无模型节点的逻辑 */
    private handleNoModelNode(act: string) {
        const view = this.view;

        if (act === 'move') {
            view.imgAdd.visible = false;
            view.shadow.visible = false;
            view.lbCondition.text = '';
            view.roleG.visible = false;
            view.lbName.text = '';
        } else {
            this.showInvite();
        }
    }

    public dispose(): void {
        super.dispose()
        this._modelNode && this._modelNode.clear();
        this._modelNode = null;
        this._modelId = null;
    }

 
}