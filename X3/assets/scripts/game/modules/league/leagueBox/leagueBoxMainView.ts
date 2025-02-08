import { Tween } from "cc";
import { EnumRuleKeys } from "db://assets/scripts/game/modules/rule/enums/EnumRuleKeys";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { TableManager } from "../../../../core/table/TableManager";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { UiTweenMgr } from "../../../../core/comm/UiTweenMgr";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { RuleController } from "../../rule/RuleController";
import { ShopModel } from "../../shop/model/ShopModel";
import { UILeagueKey } from "../const/UILeagueConst";
import { LeagueControler } from "../leagueControler";
import { LeagueManager } from "../leagueManager";
import { LeagueModel } from "../LeagueModel";
/**
 * 联盟宝箱主界面
 */
@bindScript(UILeagueKey.LeagueBoxMainView)
export class LeagueBoxMainView extends UIPage {
    static pkgName: string = "leagueBox";
    static viewName: string = "leagueBoxMainView";

    protected _rewards:{k:any, v:any}[] = []
    private get view(): ui.leagueBox.leagueBoxMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [

            NotificationKey.SYSTEM_NEW_DAY,
            NotificationKey.EVENT_EXIT_LEAGUE,
            NotificationKey.EVENT_LEAGUE_WEEKLY_TASK_REWARD_CHANGE,
            NotificationKey.EVENT_LEAGUE_GIFT_CHANGE,
            NotificationKey.EVENT_LEAGUE_BOX_PROGRESS_CHANGE,
            NotificationKey.MONTHCARD_BUY_COMPLETE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {

            case NotificationKey.SYSTEM_NEW_DAY:
                break;
            case NotificationKey.EVENT_EXIT_LEAGUE:
                this.closeSelf();
                break;
            case NotificationKey.EVENT_LEAGUE_WEEKLY_TASK_REWARD_CHANGE:
                this.onSelected();
                break;
            case NotificationKey.EVENT_LEAGUE_GIFT_CHANGE:
                this.onSelected();
                break;
            case NotificationKey.EVENT_LEAGUE_BOX_PROGRESS_CHANGE:
                //  this.onSelected();
                this.updateBox();
                break;
            case NotificationKey.MONTHCARD_BUY_COMPLETE:
                this.updateGiftTip()
        }

    }

    protected onInit(): void {

        let view = this.view.page;
        view.tabList.on(fgui.Event.CLICK_ITEM, this.onSelected, this);
        view.taskList.setVirtual()
        view.giftList.setVirtual()
        view.listReward.setVirtual()
        view.taskList.itemRenderer = UiTweenMgr.ins().listItemRendererEffect(view.taskList.node.uuid, this.taskCellRender.bind(this), this, { delay2: 80 });
        // view.taskList.itemRenderer = this.taskCellRender.bind(this);
        view.giftList.itemRenderer = this.giftCellRender.bind(this);
        view.listReward.itemRenderer = this.itemRendererForReward.bind(this);

        this.view.giftListBtn.onClick(this.onClickGift, this);
        view.levelBoxIcon.onClick(this.openLeagueBoxReward, this);
        this.view.footer.btnBack.onClick(this.closeSelf, this);

        view.boxIcon.icon = LeagueManager.ins().boxIconPath;
        view.tweenItem.icon = LeagueManager.ins().boxIconPath;

        view.ruleBtn.onClick(() => {
            RuleController.ins().openRule(EnumRuleKeys.LEAGUE_BOX, view.ruleBtn);
        });

        view.btnRule.onClick(() => {
            RuleController.ins().openRule(EnumRuleKeys.LEAGUE_BOX, view.btnRule);
        });

        GameTimer.ins().loop(1000, this, this.onTimeTick);
        this.updateBox();
        //绑定红点
        FguiScriptUtils.toMyScriptClass(view.tabList.getChildAt(0)["redDot"], RedDotCom).reset(RedDotKeys.League_box_TabTask);
        FguiScriptUtils.toMyScriptClass(view.tabList.getChildAt(1)["redDot"], RedDotCom).reset(RedDotKeys.League_Box_TabGift);
        FguiScriptUtils.toMyScriptClass(this.view.giftListBtn.redDot, RedDotCom).reset(RedDotKeys.League_Box_sendGiftBtn);

        view.pGiftTip.btnGoto.onClick(this.onClickGoto, this)
        this.updateGiftTip()
    }

    protected onClose(): void {
        GameTimer.ins().clearAll(this);
        Tween.stopAllByTarget(this);
        UiTweenMgr.ins().removeListItemRendererEffect(this.view.page.taskList.node.uuid)
    }

    private mWeeklyTaskInfo: Vo.task.TaskInfoVo;
    private mLeagueGiftVoMap: Vo.league.LeagueGiftVo[];
    // private giftMapKeys: number[] = [];
    protected onOpen(args: any, isReopen?: boolean): void {
        if (isReopen) {
            this.onSelected();
            return
        }
        let view = this.view.page;
        view.tabList.selectedIndex = 0;
        this.onSelected();
        view.getTransition('t0').play()
    }


    private taskCellRender(index: number, item: ui.leagueBox.com.leagueBoxTaskCell): void {
        let taskData = this.currentTasks[index];
        let finishedTaskIds = this.mWeeklyTaskInfo.finishedTaskIds;
        let cfg = TableManager.getDataById(table.league.LeagueWeeklyTaskConfig, taskData.taskId);
        //任务描述
        item.taskDec.text = cfg.dec;
        item.keyIcon.icon = LeagueManager.ins().boxIconPath;
        item.keyCount.text = `${cfg.addLeagueBoxProgress}`;
        //领奖状态
        let ctr = item.getController("state");
        item.jumpBtn.clearClick();
        item.getRewardBtn.clearClick();

        if (finishedTaskIds.indexOf(taskData.taskId) != -1) {
            ctr.selectedIndex = 2;
            //任务进度
            item.taskBar.value = cfg.totalProgress;
            item.taskBar.max = cfg.totalProgress;
        }
        else {
            //任务进度
            item.taskBar.value = taskData.progress;
            item.taskBar.max = cfg.totalProgress;
            if (taskData.state == ServerEnums.TaskState.IN_PROGRESS) {
                ctr.selectedIndex = 0;
                item.jumpBtn.onClick(this.onClickJump.bind(this, cfg, item.jumpBtn), this);
            }
            else if (taskData.state == ServerEnums.TaskState.COMPLETED) {
                ctr.selectedIndex = 1;
                item.getRewardBtn.onClick(this.onClickGetReward.bind(this, cfg), this);
            }
            else if (taskData.state == ServerEnums.TaskState.FINISHED) {
                ctr.selectedIndex = 2;

            }
        }
        //奖励
        const items = ItemUtils.parseKvArrayToOnlyOneItem(cfg.rewards);
        FguiScriptUtils.toMyScriptClass(item.reward, ItemFrameBtn)
            .resetByNoOwnerItem(items);
    }

    private giftCellRender(index: number, item: ui.leagueBox.com.leagueBoxGiftCell): void {

        let giftVo = this.mLeagueGiftVoMap[index];
        let giftCfg = TableManager.getDataById(table.league.LeagueGiftConfig, giftVo.leagueGiftConfigId);
        item.boxName.text = `${giftCfg.giftName}`;
        item.giftIcon.icon = giftCfg.iconPath;
        let defaultName = LeagueModel.ins().getLeagueBoxGiftDefaultName();
        if (giftVo.chargeGoodsId) {
            let shopCfg = ShopModel.ins().getGoodsConfig(giftVo.chargeGoodsId.toInt());
            if (shopCfg) {
                defaultName = shopCfg.name;
            }
        }
        item.buyTips.text = `${giftVo.sendPlayerName}买了[${defaultName}]`;
        item.keyCont.text = `${giftCfg.addLeagueBoxProgress}`;
        item.getRewardBtn.clearClick();

        item.getRewardBtn.onClick(this.onClickGetGift.bind(this, giftVo, item.getRewardBtn), this);
        this.addTimeTick(item.timeTxt, giftVo.expireTime, giftVo.id);
    }

    protected itemRendererForReward(index:number, item:ItemFrameBtn):void {
        item.resetByConfigKv(this._rewards[index])
    }

    private updateBox(): void {
        //顶部宝箱
        let view = this.view.page;
        let leagueBoxProgress = LeagueManager.ins().mLeagueVo.leagueBoxProgress;
        let level = LeagueModel.ins().getLeagueBoxLevel(leagueBoxProgress);
        let cfg = TableManager.getDataById(table.league.LeagueBoxLevelConfig, level);
        view.boxName.text = `${cfg.boxName}`;
        view.levelBoxIcon.icon = cfg.iconPath;
        let expObj = LeagueModel.ins().getLeagueBoxExp(leagueBoxProgress);
        view.expBar.value = expObj.exp;
        view.expBar.max = expObj.maxExp;
        let allCfgs = TableManager.getAllData(table.league.LeagueBoxLevelConfig);
        let maxlv = allCfgs[allCfgs.length - 1].id;
        if (level >= maxlv) {
            view.expBar.title.text = `${expObj.exp}`;
        }
        //距离周一的时间
        let diffTimeMs = TimeUtils.getTimeNextMonday(G.TimeManager.serverNow);
        this.addTimeTick(view.endTime, diffTimeMs);

        this._rewards = cfg?.rewards ? cfg.rewards : []
        view.listReward.numItems  = this._rewards.length
    }

    private timeTickList: { label: fgui.GTextField, endTime: number, type: number }[] = [];


    private addTimeTick(label: fgui.GTextField, endTime: number, type: number = 0) {
        //旧的去掉
        let index = this.timeTickList.findIndex(item => item.label == label);
        if (index >= 0) {
            this.timeTickList.splice(index, 1);

        }
        this.timeTickList.push({ label, endTime, type: type });
        this.onTimeTick();
    }

    private removeGift(): void {
        LeagueManager.ins().deleteExpiredLeagueBoxGift();
    }

    private onTimeTick(): void {
        for (let i = this.timeTickList.length - 1; i >= 0; i--) {
            const item = this.timeTickList[i];
            let time = item.endTime - G.TimeManager.serverNow;
            if (time <= 0) {
                //  item.label.text = `00:00:00`;
                this.timeTickList.splice(i, 1);
                if (item.type) {
                    this.removeGift();
                }
                continue;
            }
            let timeStr = TimeUtils.formatTimeMsToDayHourMinuteSecond(time);
            item.label.text = timeStr;
        }
    }

    private updateTodayGiftDrawDiamondAmount(tabIndex: number) {
        //底部钻石
        let view = this.view.page;

        let com = view;
        if (tabIndex == 1) {
            //钻石
            let noOwnerItem = NoOwnerItem.create(1, 0);
            com.leagueCoibIcon.icon = noOwnerItem.getIconPath();
            let value = LeagueManager.ins().mPlayerLeagueLoginVo.todayGiftDrawDiamondAmount;
            com.tips.text = "今日已获得:"
            let maxVlaue = LeagueModel.ins().getLeagueBoxDiamondMax();
            com.leagueCoibTxt.text = `${value}/${maxVlaue}`;
        }
        else {
            //联盟币
            let cion = LeagueModel.ins().getLeagueCoinIdAndMax();
            let noOwnerItem = NoOwnerItem.create(cion.id, 0);
            com.leagueCoibIcon.icon = noOwnerItem.getIconPath();
            let value = LeagueManager.ins().mPlayerLeagueLoginVo.weeklyDrawLeagueGoldAmount;

            com.tips.text = "每周联盟币获得上限:"
            com.leagueCoibTxt.text = `${value}/${cion.limit}`
        }
    }

    private onSelected(): void {
        let view = this.view.page;
        let index = view.tabList.selectedIndex;
        this.selectedView(index);
    }

    private selectedView(tabIndex: number): void {
        if (tabIndex == 0) {
            this.view.giftListBtn.visible = false;
            this.updateTask();
        }
        else {
            this.view.giftListBtn.visible = true;
            this.updateGift();
        }
        this.updateTodayGiftDrawDiamondAmount(tabIndex)

    }
    private currentTasks: Vo.task.TaskVo[] = [];

    private updateTask(): void {
        let view = this.view.page;
        this.mWeeklyTaskInfo = LeagueManager.ins().mPlayerLeagueLoginVo.weeklyTaskInfo;
        let taskList = LeagueManager.ins().getSortedLeagueWeeklyTaskList(true);
        this.currentTasks = taskList[0].concat(taskList[1]).concat(taskList[2]);
        view.taskList.numItems = this.currentTasks.length;
        view.gTaskTip.visible = this.currentTasks.length == 0;
    }

    private updateGift(): void {
        let view = this.view.page;
        this.mLeagueGiftVoMap = LeagueModel.ins().getLeagueGiftList();
        view.giftList.numItems = this.mLeagueGiftVoMap.length;
        view.gGiftTip.visible = this.mLeagueGiftVoMap.length == 0;
    }

    protected updateGiftTip(): void {
        if (GIns.monthCardModel.isAciveByType(ServerEnums.MonthCardType.MONTH)) {
            //激活了月卡
            this.view.page.pGiftTip.lbTip.text = '购买含有盟友赠礼的礼包可为所有成员提供一份盟友赠礼'
        } else {
            this.view.page.pGiftTip.lbTip.text = '购买月卡可每日为全部成员提供一份盟友赠礼'
        }
    }

    protected onClickGoto(): void {
        if (GIns.monthCardModel.isAciveByType(ServerEnums.MonthCardType.MONTH)) {
            //激活了月卡 跳转限购商城
            GIns.jumpManager.jumpById(39)
        } else {
            //跳转月卡
            GIns.jumpManager.jumpById(41)
        }
    }

    //任务跳转
    private onClickJump(cfg: table.league.LeagueWeeklyTaskConfig, btn: fgui.GButton): void {
        let jumpId = cfg.jumpId;
        G.FacadeManager.emit(NotificationKey.EVENT_JUMP_TO_OTHER_FEATURE, jumpId);
    }

    //领取奖励
    private onClickGetReward(cfg: table.league.LeagueWeeklyTaskConfig, btn: fgui.GButton): void {
        LeagueModel.ins().drawWeeklyTaskReward(cfg.id);
    }

    /**获取礼物 */
    private onClickGetGift(vo: Vo.league.LeagueGiftVo, btn: fgui.GButton): void {
        LeagueModel.ins().sendGetLeagueGift(vo.id);
    }
    /**打开赠礼列表 */
    private onClickGift(): void {
        LeagueControler.ins().openLeagueGiftList();
    }

    private openLeagueBoxReward(): void {
        LeagueControler.ins().openLeagueBoxReward();
    }
}