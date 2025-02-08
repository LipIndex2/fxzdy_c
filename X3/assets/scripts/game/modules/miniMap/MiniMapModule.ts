import G from "../../../core/comm/G";
import { BaseModel } from "../../../core/mvc/model/BaseModel";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { MiniMapManager } from "./MiniMapManager";

/**
 * 地图接口协议号
 * @author GameCreator
 */
export class MiniMapModule extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 19;

    constructor() {
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
        this.registerMsg(moduleId, 8, this.recDrawTrunkMapTaskReward);
    }

    public initData(vo: Vo.map.MapLoginVo): void {
        if (!vo) return;
        MiniMapManager.ins().MapInfoVos = vo.trunkMapInfoVos;
        MiniMapManager.ins().MapTaskInfoVo = vo.mapTaskInfo;
        GIns.miniMapMgr.resourceLimitTipChapterIds = vo.resourceLimitTipChapterIds;
        GIns.miniMapMgr.refreshMiniMapRedPoint();
    }
    /*********************************协议发送*********************************/

    /**
     * 领取地图任务奖励
     * 模块号：19	指令号：8
     */
    public sendDrawTrunkMapTaskReward(trunkMapTaskId: number): void {
        let c2s = {} as Vo.map.DrawTrunkMapTaskRewardC2S;
        c2s.trunkMapTaskId = trunkMapTaskId;
        this.send(this.MODULE, 8, c2s);
    }

    /*********************************协议监听*********************************/

    /**
     * 领取地图章节奖励
     * 模块号：19	指令号：8
     */
    public recDrawTrunkMapTaskReward(data: Vo.map.DrawTrunkMapTaskRewardS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
            let taskVo = GIns.miniMapMgr.MapTaskInfoVo;
            taskVo.finishedTaskIds.push(data.content.taskId);
            this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data.content.rewardsResult);
            this.emit(NotificationKey.MAP_TASK_REWARD);
        }
    }
}
