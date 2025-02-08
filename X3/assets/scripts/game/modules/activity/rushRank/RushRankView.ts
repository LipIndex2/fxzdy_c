import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { TableManager } from "../../../../core/table/TableManager";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { ActivityModel } from "../../../comm/activity/model/ActivityModel";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { HeaderItem } from "../../common/header/HeaderItem";
import { ListPageController } from "../../common/list/ListPageController";
import { ModelNode } from "../../common/node/ModelNode";
import { PlayerAvatar } from "../../common/playerInfo/PlayerAvatar";
import { PlayerTitleSmallComp } from "../../common/playerInfo/PlayerTitleSmallComp";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { PlayerInfoConfigManager } from "../../player/config/PlayerInfoConfigManager";
import { PlayerModel } from "../../player/model/PlayerModel";
import { PlayerUIKeys } from "../../player/PlayerUIKeys";
import { PlayerInfoMainViewOpenArgs } from "../../player/structs/PlayerInfoMainViewOpenArgs";
import { RankUtils } from "../../rank/utils/RankUtils";
import { RuleController } from "../../rule/RuleController";
import { SettingsModel } from "../../settings/model/SettingsModel";
import { UIActivityKey } from "../const/UIActivityConfig";
import { ActivityRushRankVo } from "../model/ActivityRushRankVo";
import { rushRankRewardCell } from "./rushRankRewardCell";

/**开服冲榜 */
@bindScript(UIActivityKey.rushRankView)
export class RushRankView extends UIView {
    static pkgName: string = "rushRank";
    static viewName: string = "rushRankView";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    protected _listCtrl: ListPageController = new ListPageController();

    private get view(): ui.rushRank.rushRankView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.ACTIVITY_RANK_UPDATE, NotificationKey.ACTIVITY_END_REFRESH];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ACTIVITY_RANK_UPDATE:
                this.updateRankData(args);
                break;
            case NotificationKey.ACTIVITY_END_REFRESH:
                let activityId = this._vo.activityId;
                if (args === activityId) {
                    this.closeSelf();
                }
                break;
        }
    }

    //排行榜数据
    private mRankingVo: Vo.ranking.RankingVo | Vo.secretinstance.SecretInstanceRankingVo;
    //客户端请求数据
    private mGetRankListC2S: Vo.activity.GetRankListC2S;
    //排行榜数据
    // private mRankItemVo: Array<Vo.secretinstance.SecretInstanceRankItemVo> = [];
    //排行榜数据长度
    private rankLimit: number;
    /**展示时间 毫秒 */
    private showTime: number;
    /** 活动VO */
    private _vo: ActivityRushRankVo;

    protected onInit(): void {
        let view = this.view;

        view.tabList.onClick(this.onClickTab, this);
        view.rankList.setVirtual();
        view.rewardList.setVirtual();
        view.rankList.itemRenderer = this.irRow.bind(this);
        view.rewardList.itemRenderer = this.rewardListCellRander.bind(this);

        //自己的头像不可点击
        view.myRankCom.playerAvatar.touchable = false;

        view.top1.onClick(this.onClickTop1, this);
        view.top2.onClick(this.onClickTop2, this);
        view.top3.onClick(this.onClickTop3, this);
        view.btn_first.on(fgui.Event.CLICK, this.firstClick, this);
        this.view.ruleBtn.onClick(this.onClickRule, this);

        view.headerItem.visible = false;

        this._listCtrl.requestCallback = this.getRankDataByPage.bind(this);
    }

    protected onClickRule(): void {
        RuleController.ins().openRule(this._vo.rushRankConfig.ruleId, this.view.ruleBtn);
    }

    protected onOpen(arge: table.activity.ActivityConstant.ActivityClientConfig, isReopen?: boolean): void {
        this.view.tabList.selectedIndex = 1;
        this.tabIndex = 1;
        if (!arge) {
            this.closeSelf();
            return;
        }
        this._vo = ActivityModel.ins().getActivityVoById(arge.typeParam);
        if (!this._vo) {
            this.closeSelf();
            return;
        }

        FguiScriptUtils.toMyScriptClass(this.view.btn_first.redDot, RedDotCom).reset(RedDotKeys.RankActivity_reward, [this._vo.activityId]);
        this.view.btn_first.visible = this._vo.rushRankConfig.isShowBtn;
        this.view.T_title.text = this._vo.rushRankConfig.title;
        this.view.T_desc.text = this._vo.rushRankConfig.titleDesc;

        const config = RankUtils.getRankTypeConfigByRankType(ServerEnums.RankingType[this._vo.rushRankConfig.type]);
        this.rankLimit = config.limit;

        let btn = this.view.tabList.getChildAt(1) as ui.rushRank.btn.rushRankTab;
        btn.title1.text = btn.title2.text = "奖励";

        // this._vo = activityVo;
        this.endTime = this._vo.endTime;
        //小时转毫秒
        this.showTime = this._vo.rushRankConfig.roundSettleHours[this._vo.rushRankConfig.roundSettleHours.length - 1] * 60 * 60 * 1000;
        this.clearTick();
        G.GameTimer.loop(1000, this, this.onEndTimeTick);
        this.onEndTimeTick();
        //右上角道具
        const header1 = FguiScriptUtils.toMyScriptClass(this.view.headerItem, HeaderItem);
        header1.reset(1, true);

        this._listCtrl.init(
            this.view.rankList,
            {
                maxLimitCount: this.rankLimit,
                countOffset: 3,
            },
            this._vo.activityId + ""
        );
    }

    protected onClose(): void {
        this.clearTick();
        this._listCtrl.dispose();
    }

    private endTime: number;

    //清除倒计时
    private clearTick() {
        G.GameTimer.clearAll(this);
    }

    //活动倒计时
    private onEndTimeTick(): void {
        let leftTime = this.endTime - G.TimeManager.serverNow;
        if (leftTime <= 0) {
            this.clearTick();
            return;
        }

        //如果剩余时间小于显示时间，则显示倒计时
        let timeStr = TimeUtils.formatTimeMsToDayHourMinuteSecond(leftTime);

        let next = this._vo.getNextEndTime();
        if (next) {
            this.view.endTimeTxt.text = `活动倒计时：${timeStr}`;
            let time2 = this._vo.startTime + next - G.TimeManager.serverNow;
            let timeStr2 = TimeUtils.formatTimeMsToDayHourMinuteSecond(time2);
            this.view.endTimeTxt2.text = `榜单结算倒计时：${timeStr2}`;
            this.view.gp_time2.visible = true;
        } else {
            this.view.gp_time2.visible = false;
            this.view.endTimeTxt.text = `展示期：${timeStr}`;
        }
    }

    //排行榜数据刷新
    private updateRankData(args: any) {
        let clientData: Vo.activity.GetRankListC2S = args.clientData;
        if (clientData && clientData.activityId == this._vo.activityId) {
            this.mRankingVo = args.rankVo;
            this.mGetRankListC2S = args.clientData;
            this._listCtrl.recRequstData(this.mGetRankListC2S.page, this.mRankingVo.list, this.mRankingVo.maxPage);
            if (this.mGetRankListC2S.page == 1) {
                this.updateView();
            }
        }
    }

    private page: number = 1;

    /**根据页数获取排行榜数据 */
    private getRankDataByPage(page: number) {
        this.page = page;
        ActivityModel.ins().sendGetRankList(this._vo.activityId, page);
    }

    private onClickTab(): void {
        let index = this.view.tabList.selectedIndex;
        this.onSelectedChanged(index);
    }

    private tabIndex = 0;

    private onSelectedChanged(index: number) {
        this.tabIndex = index;
        this.updateView();
    }

    // 渲染每一行 top4~N
    private irRow(index: number, item: ui.rushRank.com.rushRankRankCell): void {
        let rankItem = this._listCtrl.datas[index + 3];
        let ctr = item.getController("state");
        if (rankItem) {
            item.nameTxt.text = rankItem.baseVo.name;

            item.getController("isOne").selectedIndex = 0;
            //是否挂机关卡
            const rushRankType = ServerEnums.RushRankType[this._vo.rushRankConfig.type];
            switch (rushRankType) {
                case ServerEnums.RushRankType.TRUNK_INSTANCE: //主线关卡
                    let trunkCfg = TableManager.getDataById(table.trunkinstance.TrunkInstanceConfig, rankItem.value);
                    item.rankContext1.text = this._vo.rushRankConfig.rankDesc;
                    item.rankContext2.text = `${trunkCfg.showLevelId}`;
                    break;
                case ServerEnums.RushRankType.SECRET_INSTANCE: //秘境关卡
                    //秘境关卡
                    let secretCfg = TableManager.getDataById(table.secretinstance.SecretInstanceConfig, rankItem.value);
                    item.rankContext1.text = `${secretCfg.name}`;
                    item.rankContext2.text = `${TimeUtils.formatTimeMsToDayHourMinuteSecond(rankItem.passSeconds * 1000)}`;
                    break;
                case ServerEnums.RushRankType.HERO_RECRUIT_SCORE: //英雄招募
                    item.rankContext1.text = this._vo.rushRankConfig.rankDesc;
                    item.rankContext2.text = `${rankItem.value}`;
                    break;
                case ServerEnums.RushRankType.SECRET_INSTANCE_WEEK_PASS_AMT: //秘境周通关次数
                    item.getController("isOne").selectedIndex = 1;
                    item.rankValueOne.text = `${rankItem.value} 次`;
                    break;
                case ServerEnums.RushRankType.RUSH_LADDER: //冲榜序列校验
                    //@ts-ignore
                    let name = ItemUtils.getCareerName(rankItem.addition) + "序列";
                    item.rankContext1.text = `${rankItem.value}层`;
                    item.rankContext2.text = `${name}`;
                    break;
                default:
                    break;
            }

            ctr.selectedIndex = 1;
            const avatar = FguiScriptUtils.toMyScriptClass(item.playerAvatar, PlayerAvatar);
            avatar.resetByPlayerInfo(rankItem.baseVo);

            FguiScriptUtils.toMyScriptClass(item.titleComp, PlayerTitleSmallComp).resetByTitleId(rankItem.baseVo.title);
        } else {
            ctr.selectedIndex = rankItem === undefined ? 5 : 0;
        }

        item.rankTxt.text = `${index + 4}`;
    }

    //排名奖励列表
    private rewardListCellRander(index: number, item: rushRankRewardCell): void {
        item.setData(this._vo, index, this.mRankingVo.rank);
    }

    private updateView(): void {
        let view = this.view;

        //前三名
        this.threeRender(1, this._listCtrl.datas[0]);
        this.threeRender(2, this._listCtrl.datas[1]);
        this.threeRender(3, this._listCtrl.datas[2]);

        if (this.tabIndex == 0) {
            //我的
            this.showMyRank();
        } else {
            view.rewardList.numItems = this._vo.rushRankRewardCfgs.length;
        }
    }

    //前三名渲染
    private threeRender(index: number, data: Vo.secretinstance.SecretInstanceRankItemVo): void {
        let view = this.view[`top${index}`] as ui.rushRank.com.RankTop3Comp;
        let havePerson = view.getController("havePersonFlag");
        let state = view.getController("top3");
        if (data) {
            havePerson.selectedIndex = 1;

            const playerBaseVo = data.baseVo;
            if (playerBaseVo) {
                const modelId = PlayerInfoConfigManager.getModelIdByPlayerInfo(playerBaseVo);

                const modelNode = FguiScriptUtils.toMyScriptClass(view.modelNode, ModelNode);
                modelNode.setScale(2, 2);
                modelNode.loadByModelId(modelId);

                // text
                view.labelPlayerName.text = playerBaseVo.name;
            }

            const rushRankType = ServerEnums.RushRankType[this._vo.rushRankConfig.type];
            switch (rushRankType) {
                case ServerEnums.RushRankType.TRUNK_INSTANCE:
                    //挂机关卡
                    let trunkCfg = TableManager.getDataById(table.trunkinstance.TrunkInstanceConfig, data.value);
                    view.labelRankValue.text = `${this._vo.rushRankConfig.rankDesc}${trunkCfg.showLevelId}`;
                    break;
                case ServerEnums.RushRankType.SECRET_INSTANCE:
                    //秘境关卡
                    let cfg = TableManager.getDataById(table.secretinstance.SecretInstanceConfig, data.value);
                    if (cfg) {
                        view.labelRankValue.text = `${cfg.name} ${TimeUtils.formatTimeMsToDayHourMinuteSecond(data.passSeconds * 1000)}`;
                    } else {
                        console.error("秘境关卡配置错误, SecretInstanceConfig表找不到id：" + data.value);
                    }
                    break;
                case ServerEnums.RushRankType.HERO_RECRUIT_SCORE:
                    //积分
                    view.labelRankValue.text = `${this._vo.rushRankConfig.rankDesc}${data.value}`;
                    break;
                case ServerEnums.RushRankType.SECRET_INSTANCE_WEEK_PASS_AMT:
                    //秘境周通关次数
                    view.labelRankValue.text = `${data.value} 次`;
                    break;
                case ServerEnums.RushRankType.RUSH_LADDER:
                    //冲榜序列校验
                    //@ts-ignore
                    let name = ItemUtils.getCareerName(data.addition) + "序列";
                    view.labelRankValue.text = `${data.value} 层 ${name}`;
                    break;
                default:
                    break;
            }

            FguiScriptUtils.toMyScriptClass(view.titleComp, PlayerTitleSmallComp).resetByTitleId(data.baseVo.title);
        } else {
            //虚位以待
            havePerson.selectedIndex = 0;
        }

        state.selectedIndex = index;
    }

    protected onClickTop1(): void {
        this.showPlayerInfo(this._listCtrl.datas[0]);
    }

    protected onClickTop2(): void {
        this.showPlayerInfo(this._listCtrl.datas[1]);
    }

    protected onClickTop3(): void {
        this.showPlayerInfo(this._listCtrl.datas[2]);
    }

    private firstClick() {
        G.UIManager.open(UIActivityKey.rushRankFirstRewardWin, this._vo);
    }

    protected showPlayerInfo(data: Vo.secretinstance.SecretInstanceRankItemVo): void {
        if (data && data.baseVo && data.baseVo.id != PlayerModel.ins().playerId) {
            G.UIManager.open(PlayerUIKeys.PlayerInfoMainView, PlayerInfoMainViewOpenArgs.create(data.baseVo.id));
        }
    }

    /**我的排行榜信息 */
    private showMyRank(): void {
        let vo = this.mRankingVo;
        let rank = vo ? vo.rank : 0;

        let ctr = this.view.myRankCom.getController("state");
        const avatar = FguiScriptUtils.toMyScriptClass(this.view.myRankCom.playerAvatar, PlayerAvatar);
        avatar.resetMe();

        const rushRankType = ServerEnums.RushRankType[this._vo.rushRankConfig.type];
        const isHaveRank = rank && rank > 0;
        if (isHaveRank) {
            //有排名
            this.view.myRankCom.myRank.text = `${rank}`;
            ctr.selectedIndex = 2;

            this.view.myRankCom.getController("isOne").selectedIndex = 0;
            this.view.myRankCom.myRank.fontSize = 54;

            switch (rushRankType) {
                case ServerEnums.RushRankType.TRUNK_INSTANCE:
                    //挂机关卡
                    let cfg1 = TableManager.getDataById(table.trunkinstance.TrunkInstanceConfig, vo.value);
                    this.view.myRankCom.rankContext1.text = this._vo.rushRankConfig.rankDesc;
                    this.view.myRankCom.rankContext2.text = `${cfg1.showLevelId}`;
                    break;
                case ServerEnums.RushRankType.SECRET_INSTANCE:
                    //秘境关卡
                    vo = vo as Vo.secretinstance.SecretInstanceRankingVo;
                    let cfg2 = TableManager.getDataById(table.secretinstance.SecretInstanceConfig, vo.value);
                    this.view.myRankCom.rankContext1.text = `${cfg2.name}`;
                    this.view.myRankCom.rankContext2.text = `${TimeUtils.formatTimeMsToDayHourMinuteSecond(vo.passSeconds * 1000)}`;
                    break;
                case ServerEnums.RushRankType.HERO_RECRUIT_SCORE:
                    //积分
                    this.view.myRankCom.rankContext1.text = this._vo.rushRankConfig.rankDesc;
                    this.view.myRankCom.rankContext2.text = `${vo.value}`;
                    break;
                case ServerEnums.RushRankType.SECRET_INSTANCE_WEEK_PASS_AMT:
                    //秘境周通关次数
                    this.view.myRankCom.getController("isOne").selectedIndex = 1;
                    this.view.myRankCom.rankValueOne.text = `${vo.value} 次`;
                    break;
                case ServerEnums.RushRankType.RUSH_LADDER:
                    //冲榜序列校验
                    this.view.myRankCom.rankContext1.text = `${vo.value} 层`;
                    //@ts-ignore
                    let name = ItemUtils.getCareerName(vo.addition) + "序列";
                    this.view.myRankCom.rankContext2.text = `${name}`;
                    break;
                default:
                    break;
            }
        } else {
            //无排名
            ctr.selectedIndex = 3;
            this.view.myRankCom.getController("isOne").selectedIndex = 0;

            this.view.myRankCom.myRank.text = `未上榜`;

            switch (rushRankType) {
                case ServerEnums.RushRankType.TRUNK_INSTANCE:
                    //挂机关卡
                    let trunkCfg = TableManager.getDataById(table.trunkinstance.TrunkInstanceConfig, this._vo.roundLimit);
                    if (GIns.hangUpModel.isPass(trunkCfg.id)) {
                        let cfg2 = TableManager.getDataById(table.trunkinstance.TrunkInstanceConfig, GIns.hangUpModel.getMaxPassLevelId());
                        this.view.myRankCom.rankContext1.text = this._vo.rushRankConfig.rankDesc;
                        this.view.myRankCom.rankContext2.text = `${cfg2.showLevelId}`;
                        ctr.selectedIndex = 2;
                        this.view.myRankCom.myRank.fontSize = 30;
                    } else {
                        this.view.myRankCom.rankContext3.text = this._vo.rushRankConfig.noRankDesc;
                    }
                    break;
                case ServerEnums.RushRankType.SECRET_INSTANCE:
                    //秘境关卡
                    vo = vo as Vo.secretinstance.SecretInstanceRankingVo;
                    // let cfg = TableManager.getDataById(table.secretinstance.SecretInstanceConfig, this._vo.roundLimit);
                    if (GIns.secretAreaMgr.level >= this._vo.roundLimit) {
                        let cfg2 = TableManager.getDataById(table.secretinstance.SecretInstanceConfig, GIns.secretAreaMgr.level);
                        this.view.myRankCom.rankContext1.text = `${cfg2.name}`;
                        this.view.myRankCom.rankContext2.text = ``;
                        ctr.selectedIndex = 2;
                        this.view.myRankCom.myRank.fontSize = 30;
                    } else {
                        this.view.myRankCom.rankContext3.text = this._vo.rushRankConfig.noRankDesc;
                    }
                    break;
                case ServerEnums.RushRankType.HERO_RECRUIT_SCORE:
                    //积分
                    if (vo.value >= this._vo.roundLimit) {
                        this.view.myRankCom.rankContext1.text = this._vo.rushRankConfig.rankDesc;
                        this.view.myRankCom.rankContext2.text = `${vo.value}`;
                        ctr.selectedIndex = 2;
                        this.view.myRankCom.myRank.fontSize = 30;
                    } else {
                        this.view.myRankCom.rankContext3.text = this._vo.rushRankConfig.noRankDesc;
                    }
                    break;
                case ServerEnums.RushRankType.SECRET_INSTANCE_WEEK_PASS_AMT:
                    //秘境周通关次数
                    ctr.selectedIndex = 3;
                    this.view.myRankCom.rankValueOne.text = `${vo.value} 次`;
                    // const limitCount = (this._vo.rushRankConfig?.limits || [])[0] || 1;
                    this.view.myRankCom.rankContext3.text = this._vo.rushRankConfig.noRankDesc;
                    break;
                case ServerEnums.RushRankType.RUSH_LADDER:
                    //冲榜序列校验
                    // this.view.myRankCom.getController("isOne").selectedIndex = 1;
                    if (vo.value >= this._vo.roundLimit) {
                        this.view.myRankCom.rankContext1.text = this._vo.rushRankConfig.rankDesc;
                        //@ts-ignore
                        let name = ItemUtils.getCareerName(vo.addition);
                        this.view.myRankCom.rankContext2.text = `${name}${vo.value}`;
                        ctr.selectedIndex = 2;
                        this.view.myRankCom.myRank.fontSize = 30;
                    } else {
                        this.view.myRankCom.rankContext3.text = this._vo.rushRankConfig.noRankDesc;
                    }
                    break;
                default:
                    break;
            }
        }

        this.view.myRankCom.nameTxt.text = PlayerModel.ins().Vo.name;
        FguiScriptUtils.toMyScriptClass(this.view.myRankCom.titleComp, PlayerTitleSmallComp).resetByTitleId(SettingsModel.ins().context.getTitleId());
    }
}
