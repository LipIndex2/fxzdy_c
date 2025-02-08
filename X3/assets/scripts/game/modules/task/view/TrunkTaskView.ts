import { UIView } from "../../../../core/mvc/view/UIView";
import G from "db://assets/scripts/core/comm/G";
import * as fgui from "fairygui-cc";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { TaskI18nKeys } from "db://assets/scripts/game/modules/task/const/TaskI18nKeys";
import { TrunkTaskModel } from "db://assets/scripts/game/modules/task/model/TrunkTaskModel";
import { v3 } from "cc";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import MapResourceController from "db://assets/scripts/game/tiledMap/resource/MapResourceController";
import { CommonI18nKeys } from "db://assets/scripts/game/modules/common/i18n/CommonI18nKeys";
import { BtnConfirmViewOpenArgs } from "db://assets/scripts/game/modules/common/confirm/BtnConfirmView";
import { TargetDownArrowComponentOpenArgs } from "db://assets/scripts/game/ui/guide/view/TargetDownArrowComponent";
import { MapManager } from "db://assets/scripts/game/tiledMap/MapManager";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { LocalMemoryData } from "db://assets/scripts/game/comm/cache/LocalMemoryData";
import { ModelUtils } from "db://assets/scripts/game/modules/common/model/ModelUtils";
import { TrunkTaskUtils } from "db://assets/scripts/game/modules/task/utils/TrunkTaskUtils";
import { CameraAnimUtils } from "../../../tiledMap/CameraAnimUtils";
import { CameraAnimBackType, ICameraAnim } from "../../common/enum/AnimType";
import { UICommonKey } from "db://assets/scripts/game/modules/common/const/UICommonConfig";
import { CdUtils } from "db://assets/scripts/game/comm/utils/CdUtils";
import { EnumCDKeys } from "db://assets/scripts/core/const/EnumCDKeys";
import GIns from "../../../GIns";
import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { UITaskKeys } from "db://assets/scripts/game/modules/task/UITaskKeys";


const {GObject} = fgui;

enum FGUIControllerTaskState {
    NO = 0,
    OK = 1
}

enum TrunkTaskGuideType {

    BUILDING = "building",

    RESOURCE_POINT = "resourcePoint",
}

/**
 * 地图中的任务
 */
@bindScript(UITaskKeys.TrunkTaskView)
export class TrunkTaskView extends UIView {

    // 当前任务id
    private _oldTaskId: number = 0;

    private _trunkTaskConfig: table.trunktask.TrunkTaskConfig;

    static pkgName: string = "task";

    static viewName: string = "TrunkTaskView";

    private _firstFlag: boolean = true;

    private get view(): ui.task.TrunkTaskView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_TRUNK_TASK_CHANGE
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_TRUNK_TASK_CHANGE: {
                this.reset();
                break;
            }
        }
    }

    public onInit(): void {
        G.Logger.debug(" onInit ")
    }

    public onOpen(): void {
        G.Logger.debug(" onOpen ")

        this.view.taskTips.onClick(this.onClickTask, this);

        if (this._firstFlag) {
            this._firstFlag = false;
            this.reset()
        }
    }

    public onClose(): void {
        this.view.taskTips.offClick(this.onClickTask, this);
        G.Logger.debug(" onClose ")
    }

    protected onPreDispose(): void {
        G.GameTimer.clearAll(this);
    }

    private reset() {
        // 主线任务
        const taskId = TrunkTaskModel.ins().getCurrentTaskId()
        const currentTask = TrunkTaskModel.ins().getCurrentTask()

        // config
        const trunkTaskConfig = G.TableManager.getDataById(table.trunktask.TrunkTaskConfig, taskId);
        if (!trunkTaskConfig) {
            if (taskId !== 0) {
                G.Logger.error(`没找到主线任务配置 taskId = ${taskId}`)
            } else {
                G.Logger.debug(`all trunk task done. 主线任务做完啦. taskId = ${taskId}`)
            }
            this.view.taskTips.getController("taskState").selectedIndex = 0;

            // 没找到主线任务, 视为已完成
            this.view.getController("finishFlag").selectedIndex = 1;
            return;
        }

        // 任务已完成, 没有跳转到下一个任务视为所有都做完了
        if (currentTask.isFinish()) {
            this.view.getController("finishFlag").selectedIndex = 1;
            return;
        }

        // 任务状态
        G.Logger.debug(`reset trunk task. taskId = ${taskId}, progress = ${currentTask?.currentProgress}`)
        this.view.getController("finishFlag").selectedIndex = 0;


        if (!currentTask) {
            // 任务做完
            this.view.getController("finishFlag").selectedIndex = 1
            this._oldTaskId = 0;
            return
        }
        this._trunkTaskConfig = trunkTaskConfig


        // 进度
        this.view.taskTips.labelTaskProgress
            .setVar("currentCount", currentTask.currentProgress.toString())
            .setVar("maxCount", trunkTaskConfig.totalProgress.toString())
            .flushVars()
        // 任务目标
        this.view.taskTips.labelTaskTitle.text = trunkTaskConfig.desc;
        this.view.taskTips.imageTaskTarget.icon = trunkTaskConfig.targetSmallIcon;

        // 奖励
        const rewardItem = ItemUtils.parseStringToNoOwnerItemArray(trunkTaskConfig.rewards)[0];
        if (rewardItem) {
            const itemConfig = G.TableManager.getDataById(table.item.ItemConfig, rewardItem.itemId);
            if (itemConfig) {
                this.view.taskTips.imageReward.icon = itemConfig.iconPath;
            }
            this.view.taskTips.labelRewardCount.text = rewardItem.count.toString()
        }
        this.view.taskTips.labelRewardTitle.text = TaskI18nKeys.MAIN_TASK_REWARD_TIPS;

        // 进度 | 特殊需求: 下一个任务如果直接完成, 需要延迟 1s 显示
        const isSameTaskWithPre = this._oldTaskId == taskId;
        // 可完成
        if (currentTask.isCanComplete()) {

            if (isSameTaskWithPre) {
  
                this.playTaskFinishAnimAndMarkTaskDone();
            } else {
                // 先弄为未完成
                this.view.taskTips.getController("taskState").selectedIndex = FGUIControllerTaskState.NO;
                // 延迟 1s 切换
                G.GameTimer.once(1000, this, () => {

                    this.playTaskFinishAnimAndMarkTaskDone();

                })
            }
        } else {
            // 未完成
            this.view.taskTips.getController("taskState").selectedIndex = FGUIControllerTaskState.NO;
        }

        this._oldTaskId = taskId
    }


    private playTaskFinishAnimAndMarkTaskDone() {
        // spine anim
        ModelUtils.createSpineNodeByAssetPath(TrunkTaskUtils.getTrunkTaskCompleteSpineAssetPath(), this.view.taskTips.doneSpineRoot.node)
            .then((it) => {
                // 当前任务, 可以完成
                this.view.taskTips.getController("taskState").selectedIndex = FGUIControllerTaskState.OK;
                
                
                it.setAnimation(0, "idle", true)

                // offset
                const vec3 = it.node.position.clone();
                const offset = TrunkTaskUtils.getSpineRootOffsetVec3();
                it.node.position = v3(vec3.x + offset.x, vec3.y + offset.y, vec3.z)
            })
    }

    /**
     * 点击任务提示框
     * @private
     */
    @CdUtils.ExecuteInCDTimeMs(100)
    private onClickTask() {
        // 引导中 ?
        if (LocalMemoryData.ins().isInGuide) {
            return;
        }

        //按钮事件（新手引导使用）
       //G.FacadeManager.emit(NotificationKey.GUIDE_CLICK_BTN, 1);

        const currentTask = TrunkTaskModel.ins().getCurrentTask();
        if (!currentTask) {
            G.Logger.warn("当前主线任务不存在")
            return;
        }

        const state = this.view.taskTips.getController("taskState").selectedIndex;
        // 已完成
        if (state == FGUIControllerTaskState.OK) {
            // 领取奖励
            TrunkTaskModel.ins().sendDrawTaskReward();
            this.clearSpineAnim();
            return
        }

        const taskId = currentTask.taskId;
        const trunkTaskConfig = G.TableManager.getDataById(table.trunktask.TrunkTaskConfig, taskId);
        if (!trunkTaskConfig) {
            G.Logger.error(`没找到主线任务配置 taskId = ${taskId}`)
            return;
        }

        const guideType = trunkTaskConfig.guideType;
        if (!guideType) {
            return
        }


        // 是否同一个底图
        const guideConfigId = trunkTaskConfig.guideConfigId;
        let isSameMap: boolean = this.isSameMapCheckByType(guideType, guideConfigId)

        // 同一张地图, 才是引导
        if (isSameMap) {
            G.FacadeManager.emit(NotificationKey.TASK_GUIDE_START);
        }

        switch (guideType) {
            case TrunkTaskGuideType.BUILDING: {
                const buildingId = guideConfigId;
                if (isSameMap) {
                    this.guidePlayerToBuilding0(buildingId)
                    return;
                }

                G.UIManager.open(UICommonKey.BtnConfirmView, {
                    title: CommonI18nKeys.tipsForConfirm,
                    content: trunkTaskConfig.guideDesc,
                    titleConfirm: CommonI18nKeys.confirm,
                    titleCancel: CommonI18nKeys.cancel,
                    onBtnYes: () => {
                        this.guidePlayerToBuilding0(buildingId)
                    }
                } as BtnConfirmViewOpenArgs)
                break;
            }
            case TrunkTaskGuideType.RESOURCE_POINT: {
                const resourcePointId = trunkTaskConfig.guideConfigId;

                // 同一个地图, 指引
                if (isSameMap) {
                    this.guidePlayerToResourcePoint0(resourcePointId)
                    return;
                }

                // 跳转
                G.UIManager.open(UICommonKey.BtnConfirmView, {
                    title: CommonI18nKeys.tipsForConfirm,
                    content: trunkTaskConfig.guideDesc,
                    titleConfirm: CommonI18nKeys.confirm,
                    titleCancel: CommonI18nKeys.cancel,
                    onBtnYes: () => {

                        this.guidePlayerToResourcePoint0(resourcePointId)
                    }
                } as BtnConfirmViewOpenArgs)
                break;
            }
            default: {
                G.Logger.error(`未知的指引类型 taskId = ${taskId}, guideType = ${guideType}`)
                break;
            }
        }


    }

    private clearSpineAnim() {
        this.view.taskTips.doneSpineRoot.node.removeAllChildren();
    }

    /**
     * 是否同一张地图
     * @param guideType
     * @param guideConfigId
     */
    isSameMapCheckByType(guideType: string, guideConfigId: number): boolean {
        if (guideType == TrunkTaskGuideType.BUILDING) {
            const buildingId = guideConfigId;
            const buildingConfig = G.TableManager.getDataById(table.map.MapBuildingConfig, buildingId);
            if (!buildingConfig) {
                return false;
            }

            // 当前地图查找这个建筑
            const building = MapManager.ins().getObjectsByIDInBuilding(buildingId);
            return building != null;

        }
        if (guideType == TrunkTaskGuideType.RESOURCE_POINT) {
            const resourcePointId = guideConfigId;
            const resourcePoint = MapResourceController.ins().getResourcePointByResourceId(resourcePointId);
            return resourcePoint != null;


        }

        return true;
    }

    /**
     * 建筑
     * @param buildingId
     * @private
     */
    @LogBusiness("引导玩家视角到建筑")
    private guidePlayerToBuilding0(buildingId: number) {
        const buildingConfig = G.TableManager.getDataById(table.map.MapBuildingConfig, buildingId);
        if (!buildingConfig) {
            return
        }

        // 当前地图查找这个建筑
        const buildingObject = MapManager.ins().getObjectsByIDInBuilding(buildingId);
        if (!buildingObject) {
            // 建筑不存在
            const posArray = buildingConfig.transferPos;
            if (posArray) {
                G.Logger.debug(`主线任务指引. 建筑不在当前地图. buildingId = ${buildingId}. 传送建筑id = ${buildingId}`)

                G.FacadeManager.emit(NotificationKey.MAP_AREA_TRANSFER_START, {
                    portalID: buildingId,
                })
            } else {
                const currentTaskId = TrunkTaskModel.ins().getCurrentTask()?.taskId || 0;
                G.Logger.error(`主线任务指引. 建筑不在当前地图. 同时没有传送点, 但是主线任务却配置了他. trunkTaskConfigId = ${currentTaskId}, buildingId = ${buildingId}`)
            }
            return
        }

        // 建筑地图坐标
        const buildingMapPos = {x: buildingObject.x, y: buildingObject.y};


        let animParam: ICameraAnim = {
            targetPos: { x: buildingMapPos.x, y: buildingMapPos.y }
            , timeMs: 800
            , backType: CameraAnimBackType.TouchBack
        }
        // 镜头移动
        GIns.cameraAnimUtils.cameraMoveAnim(animParam);

        // event 指引箭头
        G.FacadeManager.emit(NotificationKey.TASK_GUIDE_TO_TARGET_DOWN_ARROW, {
            mapPosition: buildingMapPos,
            delaySecond: 1
        } as TargetDownArrowComponentOpenArgs)

    }

    /**
     * 资源点
     * @param resourcePointId
     * @private
     */
    @LogBusiness("[主线任务-引导] 到资源点")
    private guidePlayerToResourcePoint0(resourcePointId: number) {
        let mapResourceConfig = G.TableManager.getDataById(table.map.MapResourceConfig, resourcePointId);

        // mapResourceConfig.

        const resourcePoint = MapResourceController.ins().getResourcePointByResourceId(resourcePointId);
        if (!resourcePoint) {
            // 不在当前地图
            let jumpBuildingId = this._trunkTaskConfig.jumpBuildingId;
            G.Logger.debug(`主线任务引导. 资源点不在当前地图. trunkTaskId = ${this._trunkTaskConfig.id}, resourcePointId = ${resourcePointId}, jumpBuildingId = ${jumpBuildingId}`)

            G.FacadeManager.emit(NotificationKey.MAP_AREA_TRANSFER_START, {
                portalID: jumpBuildingId,
            })

            return
        }

        // 在当前地图
        const posInMap = resourcePoint.pos;
        if (!posInMap) {
            const currentTaskId = TrunkTaskModel.ins().getCurrentTaskId();
            G.Logger.error(`主线任务指引. error config. taskId=${currentTaskId}, targetPos = ${posInMap}`)
            return
        }

        let animParam: ICameraAnim = {
            targetPos: { x: posInMap.x, y: posInMap.y }
            , timeMs: 800
            , backType: CameraAnimBackType.TouchBack
        }
        // 镜头移动
        GIns.cameraAnimUtils.cameraMoveAnim(animParam);

        // event 指引箭头
        G.FacadeManager.emit(NotificationKey.TASK_GUIDE_TO_TARGET_DOWN_ARROW, {
            mapPosition: {x: posInMap.x, y: posInMap.y},
            delaySecond: 1
        } as TargetDownArrowComponentOpenArgs)
    }
}