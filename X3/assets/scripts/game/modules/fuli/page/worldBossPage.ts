import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { MapModel } from "../../../tiledMap/model/MapModule";
import { HeaderItem } from "../../common/header/HeaderItem";
import { ItemListComp } from "../../common/item/ItemListComp";
import { ModelNode } from "../../common/node/ModelNode";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { RuleController } from "../../rule/RuleController";
import { WorldBossModel } from "../../worldBoss/model/WorldBossModel";
import { FuliController } from "../fuliController";
import { FuliModel } from "../fuliModel";


export class WorldBossPage extends UIView {
    static pkgName: string = "fuli";

    static viewName: string = "worldBossActiveView";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;


    private mActivityClientConfig: table.activity.ActivityConstant.ActivityClientConfig;
    private mActivityWorldbossConfig: table.activity.WorldBoss.ActivityWorldbossConfig;
    private mWorldBossConfig: table.worldboss.WorldBossConfig;

    private mActivityConfig: table.activity.ActivityConstant.ActivityConfig;

    private get view(): ui.fuli.worldBossActiveView {
        return this._view as any;
    }


    listenNotifications(): string[] {
        return [

            NotificationKey.SYSTEM_NEW_DAY,
            NotificationKey.EVENT_CHANGE_ITEMS,
            NotificationKey.EVENT_WORLD_BOSS_INFO_RESP
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {

            case NotificationKey.SYSTEM_NEW_DAY:
                //跨天处理
                this.getWorldBossInfo();
                break;
            case NotificationKey.EVENT_CHANGE_ITEMS:
                this.showCost();
                break;

            case NotificationKey.EVENT_WORLD_BOSS_INFO_RESP:

                this.showUpdate(args);
                break;

        }
    }

    public onInit(): void {

        // this.view.goodsList.setVirtual();
        this.view.challengeBtn.onClick(this.onChallengeBtnClick, this);
        //计时器
        //  GameTimer.ins().loop(1000, this, this.endTick);
        this.view.btnRule.onClick(() => {
            RuleController.ins().openRule(EnumRuleKeys.WORLD_BOSS, this.view.btnRule);
        });

        this.view.headerItem.visible = false

    }

    public onClose(): void {
        GameTimer.ins().clearAll(this);
    }

    //boss存活时间
    private startTime: number = 0;

    //boss击杀的时间
    private killTime: number = 0;

    private endTick() {
        if (this.startTime > 0) {
            let leftTime = G.TimeManager.serverNow - this.startTime;
            if (leftTime > 0) {
                let timeStr = TimeUtils.formatTimeMsToDayHourMinuteSecond2(leftTime)
                this.view.activeTime.text = timeStr;
                this.view.timeCom.visible = true;
            }
            else {
                this.view.timeCom.visible = false;
                GameTimer.ins().clear(this, this.endTick);
            }

        }
        else {
            this.view.timeCom.visible = false;
            GameTimer.ins().clear(this, this.endTick);
            this.getWorldBossInfo();
        }




    }

    private startTick() {
        if (this.startTime) {
            let leftTime = G.TimeManager.serverNow - this.startTime;

            if (leftTime < 0) {
                let timeStr = TimeUtils.formatTimeMsToDayHourMinuteSecond2(-leftTime)
                this.view.challengeBtn.title = `${timeStr}后开启`;

            }
            else {
                GameTimer.ins().clear(this, this.startTick);
                this.getWorldBossInfo();
            }

        }
    }

    private onChallengeBtnClick() {
        FuliController.ins().challenge(this.mWorldBossConfig.id);
    }
    private spineModelId: number;
    public onOpen(arg: table.activity.ActivityConstant.ActivityClientConfig): void {
        this.mActivityClientConfig = arg;
        this.mActivityWorldbossConfig = FuliModel.ins().getWorldBossConfigById(arg.typeParam);
        this.mActivityConfig = FuliModel.ins().getActiveConfigById(arg.typeParam)

        let cfgs = WorldBossModel.ins().getWorldBossAllCfg();
        this.mWorldBossConfig = cfgs.find((cfg) => {
            return cfg.id == this.mActivityWorldbossConfig.bossId;
        }
        );

        this.spineModelId = WorldBossModel.ins().getWorldBossCfg(this.mWorldBossConfig.battleConfigId)?.spineModelId;

        //奖励预览
        const items = ItemUtils.parseKvArrayToItemArray(this.mActivityWorldbossConfig.rewards);
        FguiScriptUtils.toMyScriptClass(this.view.reward, ItemListComp)
            .reset(items);

        this.view.tips.text = this.mActivityWorldbossConfig.tips;


        this.showCost();
        let isOpen: boolean = GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.WORLD_BOSS);
        if (isOpen == false) {
            //未开启请求不到数据 直接刷新ui
            this.view.challengeBtn.grayed = true;
            this.view.challengeBtn.enabled = false;
            let redDot = FguiScriptUtils.toMyScriptClass(this.view.challengeBtn.redDot, RedDotCom);
            let openTips = FuliModel.ins().canChallenge(this.mActivityWorldbossConfig.id);
            if (openTips) {
                //未解锁
                this.view.challengeBtn.title = openTips;
                redDot.reset(RedDotKeys.Null);
            }
            this.showStartTime();
            this.updateModel();
            return
        }
        this.getWorldBossInfo();
    }


    /**获取世界boss信息 */
    private getWorldBossInfo() {
        WorldBossModel.ins().sendWorldBossInfo(this.mActivityWorldbossConfig.bossId);

    }

    private showUpdate(vo: Vo.worldboss.WorldBossVo) {
        this.startTime = vo.startTime;
        this.killTime = vo.killTime;
        this.showBtn(vo);
        this.showStartTime();
        this.updateModel();
    }

    protected updateModel(): void {
        let modelNode = this.view.modelNode as ModelNode;
        modelNode.loadByModelId(this.spineModelId);

        if (this.killTime <= 0) {
            modelNode.playOrders([{ name: "skill04" }, { name: "idle", isLoop: true }]);
        } else {
            modelNode.play("die", false);
        }
    }


    /**按钮状态 */
    private showBtn(vo: Vo.worldboss.WorldBossVo) {
        this.view.challengeBtn.grayed = true;
        this.view.challengeBtn.enabled = false;

        let redDot = FguiScriptUtils.toMyScriptClass(this.view.challengeBtn.redDot, RedDotCom);
        //功能解锁
        let openTips = FuliModel.ins().canChallenge(vo.bossConfigId);
        if (openTips) {
            //未解锁
            this.view.challengeBtn.title = openTips;
            redDot.reset(RedDotKeys.Null)
            return
        }

        //传送阵解锁
        let unLockBuild = MapModel.ins().getBuildingUnlockById(this.mWorldBossConfig.portalID);
        if (!unLockBuild) {
            this.view.challengeBtn.title = this.mActivityWorldbossConfig.areaLock; //"建筑未解锁" //MapModel.ins().getBuildingUnlockCondition(this.mWorldBossConfig.portalID);
            redDot.reset(RedDotKeys.Null)
            return;
        }
        //活动开启但是boss还没出现,要开服xx天出现   openDay转换成毫秒

        let leftTime = G.TimeManager.serverNow - this.startTime;
        if (leftTime > 0) {

            if (vo.killTime > 0) {
                //已经击杀
                if (vo.playerWorldBossVo.drawServerRewardMap[vo.bossConfigId]) {
                    this.view.challengeBtn.title = "领奖已领取";
                }
                else if (vo.playerWorldBossVo.bossHurtMap[vo.bossConfigId]) {
                    this.view.challengeBtn.title = "前往领奖";
                    this.view.challengeBtn.grayed = false;
                    this.view.challengeBtn.enabled = true;
                }
                else {
                    this.view.challengeBtn.title = "已击杀";
                }
                redDot.reset(RedDotKeys.Activity_worldBoss_reward, [vo.bossConfigId])
            }
            else {
                this.view.challengeBtn.title = "前往挑战";
                //boss存活时间
                this.view.challengeBtn.grayed = false;
                this.view.challengeBtn.enabled = true;
                redDot.reset(RedDotKeys.Activity_worldBoss_challenge, [vo.bossConfigId])
            }

        }
        else {
            this.view.challengeBtn.grayed = true;
            this.view.challengeBtn.enabled = false;
            GameTimer.ins().loop(1000, this, this.startTick);
            this.startTick();
            //this.view.challengeBtn.title = `${TimeUtils.formatTimeMsToDayHourMinuteSecond2(openLeftTime)}后开启`;
            redDot.reset(RedDotKeys.Null)
        }

    }

    private showStartTime(): void {

        let leftTime = G.TimeManager.serverNow - this.startTime;
        if (this.startTime > 0 && leftTime > 0 && this.killTime <= 0) {
            GameTimer.ins().loop(1000, this, this.endTick);
            this.endTick();
        }

        else {
            this.view.timeCom.visible = false;
            GameTimer.ins().clear(this, this.endTick);
        }
    }


    private showCost() {

        let itemId = 1;
        const header1 = FguiScriptUtils.toMyScriptClass(this.view.headerItem, HeaderItem);
        header1.reset(itemId, true);

    }








}
