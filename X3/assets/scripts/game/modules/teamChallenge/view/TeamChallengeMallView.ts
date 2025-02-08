/** 组队副本  组队大厅界面 */

import G from "../../../../core/comm/G";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { LogBusiness } from "../../../../core/log/LogBusiness";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { LongForNetwork } from "../../../../core/prototypes/LongForNetwork";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { StringUtils } from "../../../../core/utils/StringUtils";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { ItemListComp2 } from "../../common/item/ItemListComp2";
import { ListPageController } from "../../common/list/ListPageController";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { PlayerModel } from "../../player/model/PlayerModel";
import { TeamChallengeMallItem } from "../component/TeamChallengeMallItem";
import { TeamChallengeConfigManager } from "../config/TeamChallengeConfigManager";
import { EnumCTState } from "../enum/EnumTeamChallengeChapterState";
import { TeamChallengeModel } from "../model/TeamChallengeModel";
import { TeamChallengeUIKeys } from "../TeamChallengeUIKeys";

export class TeamChallengeMallView extends UICommWin {
    
    static pkgName: string = "teamChallenge";
    static viewName: string = "TeamChallengeMallView";

    protected _listCtrl: ListPageController = new ListPageController();

	/**上次刷新时间戳 */
	private _lastTime: number = 0;

    private get view(): ui.teamChallenge.TeamChallengeMallView {
        return this._view as any;
    }

    private get model():TeamChallengeModel{
        return TeamChallengeModel.ins();
}

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_MALL_TEAM_CHANGE,
            NotificationKey.EVENT_TEAM_CREATE_SUCCESS,
            NotificationKey.EVENT_TEAM_JOIN,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_MALL_TEAM_CHANGE:
                if(args){
                    let data = args.data ? args.data : [];
                    this._listCtrl.recRequstData(args.curPage, data, args.totalPage)
                }
                if(args?.curPage == 1){
                    this.updateList();
                }
                
                break;
            case NotificationKey.EVENT_TEAM_CREATE_SUCCESS:
                this.onCreateSuccess();
                break;
            case NotificationKey.EVENT_TEAM_JOIN:
                this.onjonSuccess();
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
        t.view.list.setVirtual();
        t.view.list.itemRenderer = t.addItem.bind(t);
        t.view.list.numItems = 0;
        t.view.btnCreate.onClick(t.onCreate, t);
        t.view.btnCreate.title = '创建小队';
        t.view.btnRefresh.onClick(t.onRefresh, t);
        t.view.btnRefresh.title = '刷新';

        t.view.imgClick.onClick(()=>{
            this.view.rewardsG.visible = false;
        }, t)

        t.view.btnRule.onClick(()=>{
            this.view.rewardsG.visible = true;
        }, t)

        t.view.btnJoin.onClick(t.onJoin, t);

        t._listCtrl.requestCallback = t.getRankDataByPage.bind(this);
        t._listCtrl.init(this.view.list, {moreRequestCnt:5});

        t.updateUI();
        t.updateHelp();
        t.initReward();
    }

    private updateUI(){
        const t = this;
        const state = t.model.getCurState();
        if(state == EnumCTState.FINISH || state == EnumCTState.LOCK){
            t.view.btnCreate.grayed = true;   
            // t.view.btnJoin.grayed = true;   
        }else{
            t.view.btnCreate.grayed = false; 
            // t.view.btnJoin.grayed = false;
        }
    }

    private updateHelp(){
        const t = this;
        const ctrl = t.view.getController('team');
        if(t.model.inTeam()){
            ctrl.selectedIndex = 0;
        }else{
            ctrl.selectedIndex = 1;
        }
    }
    
    private initReward(){
        const t = this;
        const hRewards = TeamChallengeConfigManager.getConstValue('TEAM_INSTANCE:HELP_REWARD');
        const items = ItemUtils.parseKvArrayToItemArray(StringUtils.toObject1Arr(hRewards));
        FguiScriptUtils.toMyScriptClass(t.view.itemList, ItemListComp2).reset(items);

        t.view.rewardsG.visible = false;

        const helpTimes = t.model.helpTimes()
        const total = +TeamChallengeConfigManager.getConstValue('TEAM_INSTANCE:DAILY_HELP_REWARD_COUNT');
        t.view.lbHelp.text = `今日助战奖励次数：${(helpTimes)}/${total}`

    }


    protected onPreDispose(): void {
        this._listCtrl.dispose()
    }

    protected updateList(){
        const t = this;
        const list = t.model.getMallTeamList();
        t.view.list.numItems = list.length;
        t.view.lbTips.visible = !list?.length;
    }

    protected onCreateSuccess(){
        this.closeSelf();
        GIns.floatingTextMgr.showTips('创建队伍成功！！');
        G.UIManager.open(TeamChallengeUIKeys.TeamChallengeTMgrView);
    }

    protected onjonSuccess(){
        this.closeSelf();
        GIns.floatingTextMgr.showTips('加入队伍成功!');

    }

    protected onJoin(){
        const t = this;
        if(t.view.btnJoin.grayed){
            const state = t.model.getCurState();
            if(state == EnumCTState.FINISH ){
                GIns.floatingTextMgr.showTips('已全部通关');
            }else if(state == EnumCTState.LOCK){
                GIns.floatingTextMgr.showTips('未解锁下一章节');
            }
            return;
        }
        t.model.sendQuicklyJoinTeam();
    }

    protected onCreate(){
        const t = this;
        if(t.view.btnCreate.grayed){
            const state = t.model.getCurState();
            if(state == EnumCTState.FINISH ){
                GIns.floatingTextMgr.showTips('已全部通关');
            }else if(state == EnumCTState.LOCK){
                GIns.floatingTextMgr.showTips('未解锁下一章节');
            }
            return;
        }

        /**创建队伍 */
        const curCfg = TeamChallengeConfigManager.getCurInstanceConfig()
        if(curCfg){
            const name = `${PlayerModel.ins().Vo.name.slice(0,3)}的队伍`;
            const id = curCfg.id;
            const power = curCfg.power;
            let powerList = curCfg.powerList;
            let setPower=0
            for(let i=0; i<powerList.length; i++){
                if(power > powerList[i]){
                    setPower = powerList[i];
                }else{
                    break;
                }
            }
            t.model.sendCreateTeam({teamName:name, teamInstanceConfigId:id, autoApproval:true, fightLimit:LongForNetwork.fromNumber(setPower)})
        }
        //全部通过逻辑
    }

    protected getRankDataByPage(page: number): void {
        let instanceId = TeamChallengeConfigManager.getCurInstanceConfig()?.id;
        if(!instanceId){
            instanceId = TeamChallengeModel.ins().getPassInstanceId();
        }
        if(instanceId){
            GIns.teamChallengeModel.sendLoadTeamList({ teamInstanceConfigId:instanceId, page:page });
        }
    }

    protected onRefresh(){
        const dur = G.TimeManager.serverNow - this._lastTime;
        if (dur >= 5000) {
			//刷新协议
			this._lastTime = G.TimeManager.serverNow;
            this.view.list.scrollToView(0);
            this.view.list.numItems = 0;
            this._listCtrl.init(this.view.list, {moreRequestCnt:1});
		} else {
			GIns.floatingTextMgr.showTips('刷新过于频繁，请稍后再试');
		}
    }


    @LogBusiness("打开界面")
    public onOpen(args: any): void {
        //请求队伍列表
    }

    private addItem(index: number, item: TeamChallengeMallItem){
        //刷新列表
        const t = this;
        const list = t.model.getMallTeamList();
        item.reset(list[index])
    }

}

UIScriptManager.bindScript(TeamChallengeUIKeys.TeamChallengeMallView, TeamChallengeMallView);