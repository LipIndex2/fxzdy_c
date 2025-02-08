/** 组队副本  关卡信息界面 */

import { Layers, Node, sp } from "cc";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { LogBusiness } from "../../../../core/log/LogBusiness";
import { Logger } from "../../../../core/log/Logger";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { Res } from "../../../../core/res/Res";
import { TableManager } from "../../../../core/table/TableManager";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { AssetBundleKeys } from "../../../../core/res/AssetBundleKeys";
import { BattleUIUtils } from "../../battle/utils/BattleUIUtils";
import { TeamChallengeConfigManager } from "../config/TeamChallengeConfigManager";
import { TeamChallengeUIKeys } from "../TeamChallengeUIKeys";
import { ResRef } from "../../../../core/res/ResRef";
import { SpineAnimationKeys } from "../../../comm/const/SpineAnimationKeys";
import { TeamChallengeModel } from "../model/TeamChallengeModel";
import GIns from "../../../GIns";
import G from "../../../../core/comm/G";
import { FormationMainViewOpenArgs, UIFormationKey } from "../../formation/const/UIFormationConfig";
import { FightType } from "../../../comm/battle/enum/FightType";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ItemListComp2 } from "../../common/item/ItemListComp2";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { TeamChallengeController } from "../TeamChallengeController";
import { ModelNode } from "../../common/node/ModelNode";
import NotificationKey from "../../../event/NotificationKey";

export class TeamChallengeFloorView extends UICommWin {

    static pkgName: string = "teamChallenge";
    static viewName: string = "TeamChallengeFloorView";

    private _posToHeroNodeMap: Map<number, ModelNode> = new Map();
    private _iId:number;
    
    private get view(): ui.teamChallenge.TeamChallengeFloorView {
        return this._view as any;
    }

    private get model(): TeamChallengeModel {
        return TeamChallengeModel.ins();
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_TEAM_PERMISSION_CHANGE
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_TEAM_PERMISSION_CHANGE:
                this.permissionUpdate();
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
        t.view.btnChallenge.onClick(t.onChallenge, t);
        t.view.btnSetSchema.onClick(t.onSetSchema, t);
    }

    @LogBusiness("打开界面")
    public onOpen(args: any): void {
        const t = this;
        //设置关卡id
        t._iId = args;
        t.initView();
    }

    onChallenge(){
        //挑战
        const t = this;
        if(t.model.inTeam()){
            //队伍挑战
            if(t.model.isCaptain()){
                t.model.sendTeamChallenge();
            }else{
                const vo = t.model.getMyTeamInfo();
                if(vo?.teamMemberCanStart){
                    t.model.sendTeamChallenge();
                }else{
                    GIns.floatingTextMgr.showTips("请等待队长开始战斗");
                }
                return;
            }
        }else{
            const cfg = TeamChallengeConfigManager.getCurInstanceConfig();
            if(!cfg){
                GIns.floatingTextMgr.showTips("已全部通关，请去助战吧!");
                return;
            }
            //单人挑战
            t.model.sendSingleChallenge({teamInstanceConfigId:cfg.id});
        }

        t.closeSelf();
    }

    onSetSchema(){
        //布阵
        TeamChallengeController.ins().openFormation();
    }
    
    permissionUpdate(){
        const t = this;
        if(!t.model.inTeam() || t.model.isCaptain()){
            t.view.btnChallenge.grayed = false;
        }else{
            const vo = t.model.getMyTeamInfo();
            if(vo.teamMemberCanStart){
                t.view.btnChallenge.grayed = false;
            }else{
                t.view.btnChallenge.grayed = true;
            }
        }
    }

    initView(){
        // 挂机关卡配置
        const t = this;
        let cfg = TeamChallengeConfigManager.getConfigByInstancId(t._iId);
        if (!cfg) {
            Logger.error("config is null")
            return;
        }

        // 战斗配置
        let battleConfigId = cfg.battleConfigId;
        // 怪物配置
        const monsterAttributeConfigArray: table.monster.MonsterAttributeConfig[] = BattleUIUtils.getMonsterAttributeConfigArrayByBattleConfigId(battleConfigId);
        
        // clear old
        this._posToHeroNodeMap.forEach((modelNode) => {
            modelNode.clear();
        });
        this._posToHeroNodeMap.clear();
        
        // 敌方阵容
        [
            this.view.modelNode1,
            this.view.modelNode2,
            this.view.modelNode3,
            this.view.modelNode4,
            this.view.modelNode5,
            this.view.modelNode6,
        ].forEach((modelNode: ModelNode, index) => {
            if (monsterAttributeConfigArray.length < index) {
                return;
            }
            // 怪物资源
            let monsterResourceConfig = monsterAttributeConfigArray[index];
            if (!monsterResourceConfig) {
                return;
            }
            let spineModelId = monsterResourceConfig.modelId;
            modelNode.loadByModelId(spineModelId);
            this._posToHeroNodeMap.set(index, modelNode);
        })

        const info = TeamChallengeModel.ins().getFloorInfo();
        const chapterCfg = TeamChallengeConfigManager.getCurChapterCfg();
        t.view.labelTitle.text = `${chapterCfg.chapterName}第${info?.cur}关`;

        // 战斗力
        const power = BattleUIUtils.getPowerByBattleConfigId(battleConfigId);
        this.view.labelPower.text = power.toString();
        
        ///奖励提示
        if(t.model.isFirstTime(t._iId)){
            //首通
            t.view.itemList.visible = true;
            t.view.tips.visible = false;
            t.view.labelLevelTitle.text = '首通奖励';
            const items = ItemUtils.parseKvArrayToItemArray(cfg.firstRewards);
            FguiScriptUtils.toMyScriptClass(t.view.itemList, ItemListComp2).reset(items);
            t.view.lbTimes.visible = false;
        }else{
            t.view.labelLevelTitle.text = '助战奖励';
            if(t.model.helpTimes() > 0){
                t.view.itemList.visible = true;
                const hRewards = TeamChallengeConfigManager.getConstValue('TEAM_INSTANCE:HELP_REWARD');
                const items = ItemUtils.parseKvArrayToItemArray(StringUtils.toObject1Arr(hRewards));
                FguiScriptUtils.toMyScriptClass(t.view.itemList, ItemListComp2).reset(items);
               
                t.view.tips.visible = false;
                t.view.lbTimes.visible = true;
            }else{
                t.view.itemList.visible = false;
                t.view.tips.visible = true;
                t.view.lbTimes.visible = false;
            }

            const hCount = t.model.getTodayHelpRewardCount();
            const total = +TeamChallengeConfigManager.getConstValue('TEAM_INSTANCE:DAILY_HELP_REWARD_COUNT');
            t.view.lbTimes.text = `助战次数:${(total-hCount)}/${total}`
        }
        
        t.permissionUpdate();
    }

}
UIScriptManager.bindScript(TeamChallengeUIKeys.TeamChallengeFloorView, TeamChallengeFloorView);