import * as fgui from "fairygui-cc";
import { UIView } from "../../../../core/mvc/view/UIView";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import NotificationKey from "../../../event/NotificationKey";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { RuleController } from "../../rule/RuleController";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { LeagueManager } from "../leagueManager";
import { LeagueModel } from "../LeagueModel";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UILeagueKey } from "../const/UILeagueConst";

@bindScript(UILeagueKey.LeagueChallengeView)
export class LeagueChallengeView extends UIView {
    static pkgName: string = "league";

    static viewName: string = "leagueTaskView";

    private get view(): ui.league.leagueTaskView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.EVENT_LEAGUE_CHALLENGE_INFO_UPDATE];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_LEAGUE_CHALLENGE_INFO_UPDATE:

                this.updateView();
                break;
        }
    }

    protected onInit(): void {
        let view = this.view;
        view.closeBtn.onClick(this.closeSelf, this);
        view.list.itemRenderer = this.listRender.bind(this);
        view.bntRule.onClick(this.onClickRule, this)
    }

    protected onClickRule(): void {
        RuleController.ins().openRule(EnumRuleKeys.LEAGUE_CHALLENGE, this.view.bntRule)
    }

    private taskCfgs: table.league.LeagueChallengeTaskConfig[];
    public onOpen(): void {

        this.updateView();

    }

    private updateView(): void {
        let taskLists = LeagueModel.ins().getLeagueTaskCfg();
        this.taskCfgs = taskLists[0].concat(taskLists[1]).concat(taskLists[2]).concat(taskLists[3]);

        this.view.list.numItems = this.taskCfgs.length;
    }

    private listRender(index: number, obj: ui.league.com.leagueTaskCom): void {
        obj.clearClick();
        let data = this.taskCfgs;
        let vo = LeagueManager.ins().mLeagueVo;
        let loginVo = LeagueManager.ins().mPlayerLeagueLoginVo;
        let itemFrame = FguiScriptUtils.toMyScriptClass(obj.rewardCell, ItemFrameBtn)
        if (data) {
            let cfg = data[index];

            //显示奖励
            if (cfg.memberRewards) {
                let reward: Object = cfg.memberRewards[0];
                let rewardKv = {} as {
                    k: any;
                    v: any;
                }
                rewardKv.k = Object.keys(reward)[0];
                rewardKv.v = reward[rewardKv.k];
                
                obj.rewardCell.visible = true;
                itemFrame.reset(rewardKv.k, rewardKv.v)
                let itemCom = obj.rewardCell.item;
                itemCom.T_num.text = `X${StringUtils.numShortToKM(rewardKv.v)}`;
            }
            else {
                obj.rewardCell.visible = false;
            }
            obj.taskLab.text = cfg.taskContent;
            let taskVo = vo.challengeTaskVos.find((value) => {
                return value.taskId == cfg.id;
            });
            if (taskVo) {
                obj.completeNum.text = `${taskVo.progress}/${cfg.needMemberCount}`;
                obj.completeLab.text = `${taskVo.progress}/${cfg.needMemberCount}`;
                obj.completeBar.value = taskVo.progress;
                obj.completeBar.max = cfg.needMemberCount;

                obj.openTaskViewBtn.clearClick();
                obj.openTaskViewBtn.onClick((e: fgui.Event) => {
                    e.propagationStopped = true;
                    LeagueModel.ins().openLeagueCompletedList(cfg.id);
                }, this);

                let state = obj.getController("state");


                let hasGetReward = loginVo.drawChallengeTaskIds.indexOf(cfg.id) == -1 ? false : true;
                if (hasGetReward) {
                    state.selectedIndex = 2;

                }
                else if (taskVo.progress >= cfg.needMemberCount) {
                    //任务已完成
                    state.selectedIndex = 1;
                    //可领取，但是自己未完成
                    if (state.selectedIndex == 1 && loginVo.exitTime > 0 && loginVo.finishTaskIds && loginVo.finishTaskIds.indexOf(cfg.id) == -1) {
                        //联盟已完成个人任务未完成
                        state.selectedIndex = 3;
                    }


                }
                else {
                    //未完成
                    state.selectedIndex = 0;
                }
                if (state.selectedIndex == 1) {
                    FguiScriptUtils.toMyScriptClass(obj.rewardCell, ItemFrameBtn).playEffect()
                } else {
                    FguiScriptUtils.toMyScriptClass(obj.rewardCell, ItemFrameBtn).clearAnim()
                }
                obj.clearClick();
                obj.onClick(() => {
                    LeagueModel.ins().drawChallengeTask(cfg.id);
                }, this);


            }

        }
    }











}