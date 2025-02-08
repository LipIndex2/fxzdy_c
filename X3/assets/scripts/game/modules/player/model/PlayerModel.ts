import G from "db://assets/scripts/core/comm/G";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { PlayerInfoConfigManager } from "db://assets/scripts/game/modules/player/config/PlayerInfoConfigManager";
import { PlayerTempData } from "db://assets/scripts/game/modules/player/temp/PlayerTempData";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { ActivityModel } from "../../../comm/activity/model/ActivityModel";
import { GuideModel } from "../../guide/model/GuideModel";
import { SecretAreaManager } from "../../secretArea/SecretAreaManager";

/**
 * 角色模块定义信息
 * @author GameCreator
 */
export class PlayerModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 11;

    private _vo: Vo.player.PlayerVo;

    /***登录时间 */
    public loginTime: number = 0

    constructor () {
        super();
        this.regist();
    }

    public static getModule(): number {
        return this.ins().MODULE;
    }

    /**
     * 注册所有从服务端收到的回调。
     */
    private regist(): void {
        // TODO 注册所有的指令
        let moduleId = this.MODULE;
        this.registerMsg(moduleId, 1, this.recVisitPlayerPersonInfo);
        this.registerMsg(moduleId, 2, this.recSelectOnline);
        this.registerMsg(moduleId, 3, this.recUpdateGuide);
        this.registerMsg(moduleId, 4, this.recGetSchedulePlayStageInfo);
        this.registerMsg(moduleId, 5, this.recUpdateSysOpen);
        this.registerMsg(moduleId, 6, this.recLoadPlayerServerInfo);
        this.registerMsg(moduleId, -1, this.pushTalkBlockStateChanged);
        this.registerMsg(moduleId, -2, this.pushRecallReward);
    }

    /**玩家Id */
    public get playerId() {
        return this._vo?.id;
    }

    /**玩家Id */
    public get playerName() {
        return this._vo?.name;
    }


    /**玩家vo */
    public get Vo(): Vo.player.PlayerVo {
        return this._vo;
    }

    /**初始化帐数据 */
    public initData(vo: Vo.player.PlayerVo): void {
        PlayerInfoConfigManager.init();

        this._vo = vo;
        PlayerTempData.playerId = vo?.id || 0;
        GuideModel.ins().initData(vo);


        // 开局就要玩法数据
        this.sendGetSchedulePlayStageInfo();

        // 获取活动信息
        ActivityModel.ins().init();
        ActivityModel.ins().sendCurrentActivities();

        //功能开启
        // FuncOpenController.ins().doInit();
    }

    /*********************************协议发送*********************************/

    /**
     * 查看玩家个人信息
     * 模块号：11	指令号：1
     */
    public sendVisitPlayerPersonInfo(c2s: Vo.player.VisitPlayerPersonInfoC2S): void {
        this.send(this.MODULE, 1, c2s);
    }

    /**
     * 查询玩家是否在线
     * 模块号：11	指令号：2
     */
    public sendSelectOnline(): void {
        let c2s = {} as Vo.player.SelectOnlineC2S;
        this.send(this.MODULE, 2, c2s);
    }

    /**
     * 更新玩家新手引导信息
     * 模块号：11	指令号：3
     */
    public sendUpdateGuide(group: number, step: number): void {
        let c2s = {} as Vo.player.UpdateGuideC2S;
        c2s.group = group;
        c2s.step = step;
        this.send(this.MODULE, 3, c2s);
    }

    /**
     * 获取定时玩法当前状态信息
     * 模块号：11	指令号：4
     */
    public sendGetSchedulePlayStageInfo(): void {
        this.send(this.MODULE, 4);
    }

    /**
     * 更新玩家系统开放信息
     * 模块号：11	指令号：5
     */
    public sendUpdateSysOpen(sysType: number, sysValue: number): void {
        let c2s = {} as Vo.player.UpdateSysOpenC2S;
        c2s.sysType = sysType;
        c2s.sysValue = sysValue;
        this.send(this.MODULE, 5, c2s, c2s);
    }

    /**
     * 请求玩家服务端信息
     * 模块号：11	指令号：6
     */
    public sendLoadPlayerServerInfo(): void {
        this.send(this.MODULE, 6);
    }

    /*********************************协议监听*********************************/

    /**
     * 查看玩家个人信息
     * 模块号：11	指令号：1
     */
    public recVisitPlayerPersonInfo(data: Vo.player.VisitPlayerPersonInfoS2C): void {
        if (data.code < 0) {
            return;
        }
        const content = data.content;

        FacadeManager.ins().emit(NotificationKey.PLAYER_INFO_REQ_DONE, content)
    }

    /**
     * 查询玩家是否在线
     * 模块号：11	指令号：2
     */
    public recSelectOnline(data: Vo.player.SelectOnlineS2C): void {
        if (data.code < 0) {
            return;
        }
    }

    /**
     * 更新玩家新手引导信息
     * 模块号：11	指令号：3
     */
    public recUpdateGuide(data: Vo.player.UpdateGuideS2C): void {
        if (data.code < 0) {
            return;
            //this.emit(NotificationKey.GUIDE_END);
        }
    }

    /**
     * 获取定时玩法当前状态信息
     * 模块号：11	指令号：4
     */
    @LogBusiness("[所有玩法数据] ")
    public recGetSchedulePlayStageInfo(data: Vo.player.GetSchedulePlayStageInfoS2C): void {
        if (data.code < 0) {
            return
        }

        const content = data.content;

        // TODO 玩法数据
        if (content) {
            for (let gameModeInfo of content) {
                const data = gameModeInfo?.playInfo;
                if (gameModeInfo?.type == ServerEnums.SchedulePlayType.ARENA) {
                    G.FacadeManager.emit(NotificationKey.PVP_GAME_MODE_BASE_DATA_UPDATE, data as Vo.arena.ArenaPlayInfo)
                    continue;
                }
                if (gameModeInfo?.type == ServerEnums.SchedulePlayType.SECRET_INSTANCE) {
                    SecretAreaManager.ins().initData(data as Vo.secretinstance.SecretInstancePlayInfo);
                    continue;
                }

            }

        }

    }

    /**
     * 更新玩家系统开放信息
     * 模块号：11	指令号：5
     */
    public recUpdateSysOpen(data: Vo.player.UpdateSysOpenS2C, clientData: Vo.player.UpdateSysOpenC2S): void {
        if (data.code >= 0) {
            this.Vo.sysOpenMap[clientData.sysType] = clientData.sysValue;

        }
    }

    /**
     * 请求玩家服务端信息
     * 模块号：11	指令号：6
     */
    public recLoadPlayerServerInfo(data: Vo.player.LoadPlayerServerInfoS2C): void {
        if (data.code < 0) {
            return;
        }
    }

    /*********************************协议推送*********************************/

    /**
     * 禁言状态改变
     * 模块号：11	指令号：-1
     */
    public pushTalkBlockStateChanged(): void {
        //TODO 推送消息-在这里处理服务端返回的数据
    }

    /**
     * 大R召回奖励
     * 模块号：11	指令号：-2
     */
    public pushRecallReward(): void {
        //TODO 推送消息-在这里处理服务端返回的数据
    }

}
