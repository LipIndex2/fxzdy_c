import { BaseModel } from "db://assets/scripts/core/mvc/model/BaseModel";
import G from "db://assets/scripts/core/comm/G";
import { ItemModel } from "db://assets/scripts/game/modules/item/model/ItemModel";
import { EventGMKeys } from "db://assets/scripts/gm/event/EventGMKeys";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { DailyTaskModel } from "db://assets/scripts/game/modules/task/model/DailyTaskModel";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { EventTaskAddProgressArgs } from "db://assets/scripts/game/modules/task/structs/EventTaskArgs";
import { AchievementModel } from "db://assets/scripts/game/modules/task/model/AchievementModel";
import { TrunkTaskModel } from "db://assets/scripts/game/modules/task/model/TrunkTaskModel";
import { HangUpModel } from "db://assets/scripts/game/modules/hangup/model/HangUpModel";
import { FloatingTextManager } from "../../game/modules/floatingText/FloatingTextManager";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { UIGmKeys } from "../const/UIGmKeys";
import { SystemModel } from "db://assets/scripts/game/modules/system/model/SystemModule";
import { PVPModel } from "db://assets/scripts/game/modules/pvp/model/PVPModel";
import { BattleDebugManager } from "../../game/comm/battle/BattleDebugManager";
import { GuideModel } from "../../game/modules/guide/model/GuideModel";
import { BattleManager } from "../../game/comm/battle/BattleManager";
import { MapManager } from "../../game/tiledMap/MapManager";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { HeroConfigManager } from "db://assets/scripts/game/modules/hero/config/HeroConfigManager";
import GIns from "../../game/GIns";
import { TrunkTaskBtn } from "../../game/ui/main/components/TrunkTaskBtn";
import { FightType } from "../../game/comm/battle/enum/FightType";
import { IBattleEnterData } from "../../game/modules/battle/vo/IBattleEnterData";
import { WorldUnitTeam } from "../../game/comm/battle/enum/BattleEnum";
import { TableManager } from "../../core/table/TableManager";

/**
 * Gm 模块号及指令定义
 * @author GameCreator
 */
export class GmModel extends BaseModel {

    /**
     * 模块标识
     */
    private MODULE = -999;

    constructor () {
        super();
        this.regist();
    }

    public static getModule(): number {
        return this.ins().MODULE;
    }


    listenNotifications(): string[] {
        return [
            EventGMKeys.GM_SEND_EMAIL_DIY,
            NotificationKey.EVENT_TRUNK_TASK_GM_AUTO_FINISH,
            NotificationKey.GM_ORDER_CHARGE,
            NotificationKey.GM_SHOW_HERO_ATTR,
        ]
    }


    notificationHandler(event: string, args?: any) {
        switch (event) {
            case EventGMKeys.GM_SEND_EMAIL_DIY: {
                this.sendSendEmail(args)
                break
            }
            case NotificationKey.EVENT_TRUNK_TASK_GM_AUTO_FINISH: {
                this.finishCurrentTrunkTask();
                break;
            }
            case NotificationKey.GM_ORDER_CHARGE: {
                this.sendCharge(args);
                break;
            }
            case NotificationKey.GM_SHOW_HERO_ATTR: {
                this.sendLoadHeroAttribute(args);
                break;
            }
        }
    }

    /**
     * 注册所有从服务端收到的回调。
     */
    private regist(): void {
        // TODO 注册所有的指令
        let moduleId = this.MODULE;
        this.addNotification()
        this.registerMsg(moduleId, 1, this.recGmSendReward);
        this.registerMsg(moduleId, 2, this.recChangeTrunkTask);
        this.registerMsg(moduleId, 3, this.recGetOnlineCount);
        this.registerMsg(moduleId, 4, this.recCopyAccount);
        this.registerMsg(moduleId, 5, this.recSendServerEmail);
        this.registerMsg(moduleId, 6, this.recSendTemplateEmail);
        this.registerMsg(moduleId, 7, this.recSendEmail);
        this.registerMsg(moduleId, 8, this.recSendRewardStr);
        this.registerMsg(moduleId, 9, this.recAddWindowsSystemMinutes);
        this.registerMsg(moduleId, 10, this.recSendRewardConfig);
        this.registerMsg(moduleId, 11, this.recSendGmPost);
        this.registerMsg(moduleId, 12, this.recReloadExcel);
        this.registerMsg(moduleId, 13, this.recCharge);
        this.registerMsg(moduleId, 14, this.recUpdateAndReloadResource);
        this.registerMsg(moduleId, 15, this.recGmSendRewards);
        this.registerMsg(moduleId, 16, this.recDropReward);
        this.registerMsg(moduleId, 17, this.recConvertShortPlayerId);
        this.registerMsg(moduleId, 18, this.recListAllHideCmd);
        this.registerMsg(moduleId, 19, this.recDoHideCmd);
        this.registerMsg(moduleId, 20, this.recUpdateGuide);
        this.registerMsg(moduleId, 21, this.recFakeTaskProgress);
        this.registerMsg(moduleId, 22, this.recLoadHeroAttribute);
        this.registerMsg(moduleId, 23, this.recPassTrunkInstance);
        this.registerMsg(moduleId, 24, this.recTestFightInstance);
        this.registerMsg(moduleId, 25, this.recArenaScoreChange);
        this.registerMsg(moduleId, 27, this.recJumpTrunkTaskAndReward);
        this.registerMsg(moduleId, 28, this.recRefreshMapResource);
        this.registerMsg(moduleId, 29, this.recSetUpAccountTpl);
        this.registerMsg(moduleId, 30, this.recAddCollectiblesDungeonCount);
    }

    /*********************************协议发送*********************************/

    /**
     * 发送奖励
     * 模块号：-999	指令号：1
     */
    public sendGmSendReward(c2s: Vo.gm.GmSendRewardOrCostC2S): void {
        this.send(this.MODULE, 1, c2s);
    }

    /**
     * 完成主线任务 （任意跳转）
     * 模块号：-999	指令号：2
     */
    public sendChangeTrunkTask(c2s: Vo.gm.FinishTrunkTaskC2S): void {
        this.send(this.MODULE, 2, c2s, c2s);
    }

    /**
     * 获取在线人数
     * 模块号：-999	指令号：3
     */
    public sendGetOnlineCount(): void {
        this.send(this.MODULE, 3);
    }

    /**
     * copy账号
     * 模块号：-999	指令号：4
     */
    public sendCopyAccount(): void {
        let c2s = {} as Vo.gm.CopyAccountC2S;
        this.send(this.MODULE, 4, c2s);
    }

    /**
     * 发送全服邮件
     * 模块号：-999	指令号：5
     */
    public sendSendServerEmail(): void {
        let c2s = {} as Vo.gm.SendServerEmailC2S;
        this.send(this.MODULE, 5, c2s);
    }

    /**
     * 发送个人模板邮件
     * 模块号：-999	指令号：6
     */
    public sendSendTemplateEmail(c2s: Vo.gm.SendTemplateEmailC2S): void {
        this.send(this.MODULE, 6, c2s, c2s);
    }

    /**
     * 发送个人邮件
     * 模块号：-999	指令号：7
     */
    public sendSendEmail(c2s: Vo.gm.SendEmailC2S): void {
        this.send(this.MODULE, 7, c2s);
    }

    /**
     * 用字符串发送奖励
     * 模块号：-999	指令号：8
     */
    public sendSendRewardStr(): void {
        let c2s = {} as Vo.gm.SendRewardStrC2S;
        this.send(this.MODULE, 8, c2s);
    }

    /**
     * 增加windows系统时间（分钟）
     * 模块号：-999	指令号：9
     */
    public sendAddWindowsSystemMinutes(c2s: Vo.gm.AddWindowsSystemMinutesC2S): void {
        this.send(this.MODULE, 9, c2s, c2s);
    }

    /**
     * 发送奖励配置
     * 模块号：-999	指令号：10
     */
    public sendSendRewardConfig(): void {
        let c2s = {} as Vo.gm.SendRewardConfigC2S;
        this.send(this.MODULE, 10, c2s);
    }

    /**
     * 发送测试公告
     * 模块号：-999	指令号：11
     */
    public sendSendGmPost(): void {
        let c2s = {} as Vo.gm.SendGmPostC2S;
        this.send(this.MODULE, 11, c2s);
    }

    /**
     * 重新加载excel配置文件
     * 模块号：-999	指令号：12
     */
    public sendReloadExcel(): void {
        let c2s = {} as Vo.gm.ReloadExcelC2S;
        this.send(this.MODULE, 12, c2s);
    }

    /**
     * 充值
     * 模块号：-999	指令号：13
     */
    public sendCharge(goodsId: string): void {
        let c2s = {} as Vo.gm.ChargeC2S;
        c2s.goodsId = goodsId;
        this.send(this.MODULE, 13, c2s);
    }

    /**
     * 更新并重新加载资源
     * 模块号：-999	指令号：14
     */
    public sendUpdateAndReloadResource(): void {
        this.send(this.MODULE, 14);

        GIns.floatingTextMgr.showTips("请求了刷新后端 Server")
    }

    /**
     * 发送配置表奖励格式的奖励
     * 模块号：-999	指令号：15
     */
    public sendGmSendRewards(c2s: Vo.gm.GmSendRewardsC2S): void {
        this.send(this.MODULE, 15, c2s, c2s);
    }

    /**
     * 掉落奖励
     * 模块号：-999	指令号：16
     */
    public sendDropReward(): void {
        let c2s = {} as Vo.gm.DropRewardC2S;
        this.send(this.MODULE, 16, c2s);
    }

    /**
     * 短id转玩家id
     * 模块号：-999	指令号：17
     */
    public sendConvertShortPlayerId(): void {
        let c2s = {} as Vo.gm.ConvertShortPlayerIdC2S;
        this.send(this.MODULE, 17, c2s);
    }

    /**
     * 列出所有隐藏指令
     * 模块号：-999	指令号：18
     */
    public sendListAllHideCmd(): void {
        this.send(this.MODULE, 18);
    }

    /**
     * 执行隐藏gm指令
     * 模块号：-999	指令号：19
     */
    public sendDoHideCmd(): void {
        let c2s = {} as Vo.gm.DoHideCmdC2S;
        this.send(this.MODULE, 19, c2s);
    }

    /**
     * 更新玩家新手引导信息
     * 模块号：-999	指令号：20
     */
    public sendUpdateGuide(group?: number): void {
        let map = {};
        if (!group) {
            //全部
            let cfgs = TableManager.getAllData(table.guide.GuideGroupConfig);
            for (let i = 0; i < cfgs.length; i++) {
                map[cfgs[i].groupId] = cfgs[i].endGuideId;
            }
        } else {
            //指定
            let cfg = TableManager.getDataById(table.guide.GuideGroupConfig, group);
            if (!cfg) return;
            map[group] = cfg.endGuideId;
        }

        let c2s = {} as Vo.gm.UpdateGuideC2S;
        c2s.map = map;
        this.send(this.MODULE, 20, c2s, c2s);
    }


    /**
     * 模拟任务进度
     * 模块号：-999	指令号：21
     */
    public sendFakeTaskProgress(c2s: Vo.gm.FakeTaskProgressC2S): void {
        this.send(this.MODULE, 21, c2s, c2s);
    }

    /**
     * 获取英雄属性
     * 模块号：-999	指令号：22
     */
    public sendLoadHeroAttribute(heroID: number): void {
        let c2s = {} as Vo.gm.LoadHeroAttributeC2S;
        c2s.heroBaseId = heroID;
        this.send(this.MODULE, 22, c2s);
    }

    /**
     * 通关主线关卡
     * 模块号：-999	指令号：23
     */
    public sendPassTrunkInstance(c2s: Vo.gm.PassTrunkInstanceC2S): void {
        this.send(this.MODULE, 23, c2s, c2s);
    }


    /**
     * 进入测试场景
     * 模块号：-999	指令号：24
     */
    public sendTestFightInstance(attackerUnitVos: Vo.gm.CustomFightUnitVo[],
        defenderUnitVos: Vo.gm.CustomFightUnitVo[],
        skill1?: { [pos: number]: string[] },
        skill2?: { [pos: number]: string[] }
    ): void {
        let teamSkills: { [teamId: number]: string[] } = {};
        // teamSkills[WorldUnitTeam.Self] = ["MJG_p103", "MJG_p104"]
        if (GIns.battleModel.setEnterData({ fightType: FightType.TEST, teamSkillListMap: teamSkills } as IBattleEnterData)) {
            let c2s = {} as Vo.gm.CustomTestBattleC2S;
            c2s.attackerUnitVos = attackerUnitVos
            c2s.defenderUnitVos = defenderUnitVos
            this.send(this.MODULE, 24, c2s, { attack: skill1, defend: skill2 });
        }
    }


    /**
     * 竞技场积分变更
     * 模块号：-999	指令号：25
     */
    public sendArenaScoreChange(c2s: Vo.gm.ArenaScoreChangeC2S): void {
        this.send(this.MODULE, 25, c2s, c2s);
    }

    //屏蔽服务的功能检测
    delFuncCheck(): void {
        this.send(this.MODULE, 26);
    }

    private battleSpeed: number = 1

    public setBattleSpeed(): void {
        this.battleSpeed++;
        if (this.battleSpeed == 6) {
            this.battleSpeed = 1;
        }
        GIns.floatingTextMgr.showTips(`战斗速度：${this.battleSpeed}`)
        GIns.battleMgr.setBattleSpeed(this.battleSpeed)
    }

    /**
     * 跳到指定主线任务并领取之前的任务奖励,不能往前跳
     * 模块号：-999	指令号：27
     */
    public sendJumpTrunkTaskAndReward(c2s: Vo.gm.JumpTrunkTaskAndRewardC2S): void {
        this.send(this.MODULE, 27, c2s, c2s);
    }

    /**
     * 刷新地图资源点
     * 模块号：-999	指令号：28
     */
    public sendRefreshMapResource(): void {
        let c2s = {} as Vo.gm.RefreshMapResourceC2S;
        c2s.mapId = MapManager.ins().getMapID();
        this.send(this.MODULE, 28, c2s);
    }

    /**
     * 设置账号模板
     * 模块号：-999	指令号：29
     */
    public sendSetUpAccountTpl(accountTplVo: any): void {
        let c2s = {} as Vo.gm.SetUpAccountTplC2S;
        c2s.accountTplVo = accountTplVo;
        this.send(this.MODULE, 29, c2s);
    }

    /**
     * 添加收藏品玩法的次数
     * 模块号：-999	指令号：30
     */
    public sendAddCollectiblesDungeonCount(c2s: Vo.gm.AddCollectiblesDungeonCountC2S): void {
        this.send(this.MODULE, 30, c2s);
    }

    /*********************************协议监听*********************************/

    /**
     * 发送奖励
     * 模块号：-999	指令号：1
     */
    public recGmSendReward(data: Vo.gm.GmSendRewardOrCostS2C): void {
        if (data.code < 0) {
            G.Logger.net(data, "GM 操作道具 error ")
            return
        }

        ItemModel.ins().rewardClassify(data.content.rewards)
        ItemModel.ins().minusItemsByServer(data.content.costs)

        G.FacadeManager.emit(NotificationKey.EVENT_GET_ITEM_ANIM, { items: data.content.rewards, isShowItemNumEffect: true })

        G.Logger.net(data, "GM 操作道具 ok ")
    }

    /**
     * 立即完成 {}中的任务
     * 模块号：-999	指令号：2
     */
    @LogBusiness("GM 跳主线任务")
    public recChangeTrunkTask(data: Vo.gm.FinishTrunkTaskS2C, c2s: Vo.gm.FinishTrunkTaskC2S): void {
        if (data.code < 0) {
            return;
        }

        let taskId = c2s.taskId;

        TrunkTaskModel.ins().onServerPushTrunkTaskChange({
            type: ServerEnums.TaskType.TRUNK_TASK,
            taskId: taskId,
            progress: 0,
            state: ServerEnums.TaskState.IN_PROGRESS,
        } as any);
    }

    /**
     * 获取在线人数
     * 模块号：-999	指令号：3
     */
    public recGetOnlineCount(data: Vo.gm.GetOnlineCountS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
        }
    }

    /**
     * copy账号
     * 模块号：-999	指令号：4
     */
    public recCopyAccount(data: Vo.gm.CopyAccountS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
        }
    }

    /**
     * 发送全服邮件
     * 模块号：-999	指令号：5
     */
    public recSendServerEmail(data: Vo.gm.SendServerEmailS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
        }
    }

    /**
     * 发送个人模板邮件
     * 模块号：-999	指令号：6
     */
    public recSendTemplateEmail(data: Vo.gm.SendTemplateEmailS2C): void {
        if (data.code < 0) {
            G.Logger.error("GM 发送模板邮件失败：", data)
            return
        }
        GIns.floatingTextMgr.showTips("[GM] 发送模板邮件成功!")
    }

    /**
     * 发送个人邮件
     * 模块号：-999	指令号：7
     */
    public recSendEmail(data: Vo.gm.SendEmailS2C): void {
        if (data.code < 0) {
            GIns.floatingTextMgr.showTips(`[GM] 发送邮件失败 error code = ${data.code}`)
            return
        }
        GIns.floatingTextMgr.showTips("[GM] 发送邮件成功")
    }

    /**
     * 用字符串发送奖励
     * 模块号：-999	指令号：8
     */
    public recSendRewardStr(data: Vo.gm.SendRewardStrS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
        }
    }

    /**
     * 增加windows系统时间（分钟）
     * 模块号：-999	指令号：9
     */
    public recAddWindowsSystemMinutes(data: Vo.gm.AddWindowsSystemMinutesS2C): void {
        if (data.code < 0) {
            GIns.floatingTextMgr.showTips(`[GM] 增加服务器时间 error code = ${data.code}`)
            return
        }

        SystemModel.ins().sendSystemTime();

        GIns.floatingTextMgr.showTips(`[GM] 增加服务器时间成功 = ${data.code}`)

    }

    /**
     * 发送奖励配置
     * 模块号：-999	指令号：10
     */
    public recSendRewardConfig(data: Vo.gm.SendRewardConfigS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
        }
    }

    /**
     * 发送测试公告
     * 模块号：-999	指令号：11
     */
    public recSendGmPost(data: Vo.gm.SendGmPostS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
        }
    }

    /**
     * 重新加载excel配置文件
     * 模块号：-999	指令号：12
     */
    public recReloadExcel(data: Vo.gm.ReloadExcelS2C): void {
        if (data.code < 0) {
            GIns.floatingTextMgr.showTips(`[GM-刷新后端Excel] error. code = ${data.code}`)
            return
        }

        GIns.floatingTextMgr.showTips("[GM-刷新后端Excel] ok")
    }

    /**
     * 充值
     * 模块号：-999	指令号：13
     */
    public recCharge(data: Vo.gm.ChargeS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
        }
    }

    /**
     * 更新并重新加载资源
     * 模块号：-999	指令号：14
     */
    public recUpdateAndReloadResource(data: Vo.gm.UpdateAndReloadResourceS2C): void {
        if (data.code < 0) {
            GIns.floatingTextMgr.showTips(`[GM-刷新后端] error. code = ${data.code}`)
            return
        }

        GIns.floatingTextMgr.showTips("[GM-刷新后端] 更新并重新加载资源成功")
    }

    /**
     * 发送配置表奖励格式的奖励
     * 模块号：-999	指令号：15
     */
    public recGmSendRewards(data: Vo.gm.GmSendRewardsS2C): void {
        if (data.code < 0) {
            return;
        }

        let content = data.content;

        FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS, content);
    }

    /**
     * 掉落奖励
     * 模块号：-999	指令号：16
     */
    public recDropReward(data: Vo.gm.DropRewardS2C): void {
        if (data.code < 0) {
            G.Logger.printError(data, "GM 掉落奖励失败：")
            return
        }

        ItemModel.ins().addItemsByServer(data.content)
        G.Logger.net(data, "GM 掉落奖励成功 ")
    }

    /**
     * 短id转玩家id
     * 模块号：-999	指令号：17
     */
    public recConvertShortPlayerId(data: Vo.gm.ConvertShortPlayerIdS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
        }
    }

    /**
     * 列出所有隐藏指令
     * 模块号：-999	指令号：18
     */
    public recListAllHideCmd(data: Vo.gm.ListAllHideCmdS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
        }
    }

    /**
     * 执行隐藏gm指令
     * 模块号：-999	指令号：19
     */
    public recDoHideCmd(data: Vo.gm.DoHideCmdS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
        }
    }

    /**
     * 更新玩家新手引导信息
     * 模块号：-999	指令号：20
     */
    @LogBusiness("[GM 引导] ")
    public recUpdateGuide(data: Vo.gm.UpdateGuideS2C, c2s: { [guideId: number]: number }): void {
        if (data.code >= 0) {
            let keys = Object.keys(c2s);
            for (let key of keys) {
                GuideModel.ins().updateGuideMap(+key, c2s[key])
            }
            this.emit(NotificationKey.GUIDE_GM_END);
            //多发一个，防止其他模块监听的是正常的结束引导
            this.emit(NotificationKey.GUIDE_END);
        }
    }

    /**
     * 模拟任务进度
     * 模块号：-999	指令号：21
     */
    public recFakeTaskProgress(data: Vo.gm.FakeTaskProgressS2C,
        c2s: Vo.gm.FakeTaskProgressC2S
    ): void {
        if (data.code < 0) {
            G.Logger.error(`GM 添加任务进度报错. dataCode=  ${data.code}`)
            return
        }

        G.Logger.debug(data, "[GM] 模拟任务进度成功 ")

        GIns.floatingTextMgr.showTips(`[GM] 任务+进度成功! taskId = ${c2s.taskId}`)
        G.FacadeManager.emit(NotificationKey.EVENT_TASK_ADD_PROGRESS, {
            taskType: c2s.taskType,
            taskId: c2s.taskId,
            addProgress: c2s.addProgress,
        } as EventTaskAddProgressArgs)


        TrunkTaskModel.ins().sendDrawTaskReward();

    }

    /**
     * 获取英雄属性
     * 模块号：-999	指令号：22
     */
    public recLoadHeroAttribute(data: Vo.gm.LoadHeroAttributeS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
            console.log(data.content);
        }
    }


    public recTestFightInstance(data: Vo.gm.CustomTestBattleS2C,
        clientData: { attack: { [pos: number]: string[] }, defend: { [pos: number]: string[] } }
    ): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
            console.log(data);
            G.UIManager.close(UIGmKeys.GMView)
            G.UIManager.open(UIGmKeys.BattleTestView)
            BattleDebugManager.ins().isTestBattle = true;
            BattleDebugManager.ins().debugIgnoreSkill(clientData.attack, clientData.defend)
        }
    }

    /**
     * 通关主线关卡
     * 模块号：-999	指令号：23
     */
    public recPassTrunkInstance(data: Vo.gm.PassTrunkInstanceS2C, c2s: Vo.gm.PassTrunkInstanceC2S): void {
        if (data.code < 0) {
            return;
        }
        let levelId = c2s.instanceId;

        GIns.floatingTextMgr.showTips(`[GM] 通关关卡成功! levelId = ${levelId}`)
        HangUpModel.ins().setPassLevelId(levelId);


    }

    /**
     * 竞技场积分变更
     * 模块号：-999	指令号：25
     */
    @LogBusiness("竞技场积分变更")
    public recArenaScoreChange(data: Vo.gm.ArenaScoreChangeS2C, c2s: Vo.gm.ArenaScoreChangeC2S): void {
        if (data.code < 0) {
            return;
        }
        const scoreChange = c2s.scoreChange;

        PVPModel.ins().changeScore(scoreChange);
        G.Logger.debug(data, "竞技场积分变更成功 ")

    }

    /**
     * 跳到指定主线任务并领取之前的任务奖励,不能往前跳
     * 模块号：-999	指令号：27
     */
    public recJumpTrunkTaskAndReward(data: Vo.gm.JumpTrunkTaskAndRewardS2C,
        c2s: Vo.gm.JumpTrunkTaskAndRewardC2S
    ): void {
        if (data.code < 0) {
            return;
        }
        let trunkTaskId = c2s.trunkTaskId;
        GIns.floatingTextMgr.showTips(`推进主线任务成功! curTaskId = ${trunkTaskId}`);
        let rewardResults = data.content;
        if (rewardResults) {

            FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS, rewardResults);
        }


        TrunkTaskModel.ins().onServerPushTrunkTaskChange({
            taskVoType: ServerEnums.TaskVoType.NORMAL,
            type: ServerEnums.TaskType.TRUNK_TASK,
            taskId: trunkTaskId,
            progress: 0,
            state: ServerEnums.TaskState.IN_PROGRESS,
        });


    }

    /**
     * 刷新地图资源点
     * 模块号：-999	指令号：28
     */
    public recRefreshMapResource(data: Vo.gm.RefreshMapResourceS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
            if (data.content?.length) {
                this.emit(NotificationKey.MAP_RESOURCE_REFRESH_UPDATE, data.content);
            }
            GIns.floatingTextMgr.showTips("刷新地图资源点成功!");
        }
    }

    /**
     * 设置账号模板
     * 模块号：-999	指令号：29
     */
    public recSetUpAccountTpl(data: Vo.gm.SetUpAccountTplS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
        }
    }

    /**
     * 添加收藏品玩法的次数
     * 模块号：-999	指令号：30
     */
    public recAddCollectiblesDungeonCount(data: Vo.gm.AddCollectiblesDungeonCountS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
            this.emit(NotificationKey.COLLECTIBLES_DUNGEON_UPDATE_FROM_GM, data.content);
        }
    }

    /*********************************协议推送*********************************/

    clearPlayerBackpack() {
        const itemIdToCountMap = ItemModel.ins().getItemIdToCountMap();
        itemIdToCountMap.forEach((count, itemId) => {
            GmModel.ins().sendGmSendReward({
                code: itemId,
                num: -count
            });
            console.log("GM 扣减物品 end", itemId, count)
        });
        GIns.floatingTextMgr.showTips("GM 一键清空道具成功!")
        return
    }

    initData(contentElement: any) {
        // nothing
    }

    // 一键完成所有每日任务
    oneKeyFinishAllDailyTask() {
        const doingTaskIdArray = DailyTaskModel.ins().getDoingTaskIdArray();
        if (doingTaskIdArray) {
            doingTaskIdArray.forEach(taskId => {
                GmModel.ins().sendFakeTaskProgress({
                    taskId: taskId,
                    addProgress: 99999999,
                    taskType: ServerEnums.TaskType.DAILY_TASK
                } as Vo.gm.FakeTaskProgressC2S)
            });
        }
    }

    // 一键完成所有成就任务
    oneKeyFinishAllAchieveTask() {
        const doingTaskIdArray = AchievementModel.ins().getDoingTaskIdArray();
        if (doingTaskIdArray) {
            doingTaskIdArray.forEach(taskId => {
                GmModel.ins().sendFakeTaskProgress({
                    taskId: taskId,
                    addProgress: 99999999,
                    taskType: ServerEnums.TaskType.ACHIEVEMENT
                } as Vo.gm.FakeTaskProgressC2S)
            });
        }
    }

    /**
     * 随机完成一个每日任务
     */
    completeRandomOneDailyTask() {
        const doingTaskIdArray = DailyTaskModel.ins().getDoingTaskIdArray();
        const taskId = doingTaskIdArray.toDataStream()
            .first();
        if (taskId) {
            GmModel.ins().sendFakeTaskProgress({
                taskId: taskId,
                addProgress: 99999999,
                taskType: ServerEnums.TaskType.DAILY_TASK
            } as Vo.gm.FakeTaskProgressC2S)
        }
    }

    /**
     * 成就任务, 随机完成 1 个
     */
    completeRandomOneAchieveTask() {
        const doingTaskIdArray = AchievementModel.ins().getDoingTaskIdArray();
        const taskId = doingTaskIdArray.toDataStream()
            .first();
        if (taskId) {
            GmModel.ins().sendFakeTaskProgress({
                taskId: taskId,
                addProgress: 99999999,
                taskType: ServerEnums.TaskType.ACHIEVEMENT
            } as Vo.gm.FakeTaskProgressC2S)
        }
    }

    /**
     * 主线任务进度 +1
     */
    add1ForCurrentTrunkTaskProgress() {
        const taskId = TrunkTaskModel.ins().getCurrentTaskId();
        if (taskId) {
            GmModel.ins().sendFakeTaskProgress({
                taskId: taskId,
                addProgress: 1,
                taskType: ServerEnums.TaskType.TRUNK_TASK
            } as Vo.gm.FakeTaskProgressC2S)
        }
    }

    /**
     * 一键完成主线任务
     */
    finishCurrentTrunkTask() {
        const taskId = TrunkTaskModel.ins().getCurrentTaskId();
        if (taskId) {
            GmModel.ins().sendFakeTaskProgress({
                taskId: taskId,
                addProgress: 99999999,
                taskType: ServerEnums.TaskType.TRUNK_TASK
            } as Vo.gm.FakeTaskProgressC2S);
        }
    }

    public setAutoTurnkTask() {
        TrunkTaskBtn.autoTurnkTask = !TrunkTaskBtn.autoTurnkTask;
    }


    passNextHangUpLevel() {
        const levelId = HangUpModel.ins().getMyNextLevelId();
        G.FacadeManager.emit(NotificationKey.EVENT_FLOATING_TEXT_DEBUG, `GM 发起通关挂机关卡. levelId = ${levelId}`)

        this.sendPassTrunkInstance({
            instanceId: levelId
        })
    }


    gainAllHero() {
        const heroItemIdArray = HeroConfigManager.getAllHeroItemIdArray();

        for (let heroItemId of heroItemIdArray) {
            GmModel.ins().sendGmSendReward({
                code: heroItemId,
                num: 1
            });
        }
    }
}
