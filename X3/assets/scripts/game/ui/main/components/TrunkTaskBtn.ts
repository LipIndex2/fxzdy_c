import G from "db://assets/scripts/core/comm/G";
import * as fgui from "fairygui-cc";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { TaskI18nKeys } from "db://assets/scripts/game/modules/task/const/TaskI18nKeys";
import { TrunkTaskModel } from "db://assets/scripts/game/modules/task/model/TrunkTaskModel";
import { tween, Tween, v3 } from "cc";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import MapResourceController from "db://assets/scripts/game/tiledMap/resource/MapResourceController";
import { UICommonKey } from "db://assets/scripts/game/modules/common/const/UICommonConfig";
import { CommonI18nKeys } from "db://assets/scripts/game/modules/common/i18n/CommonI18nKeys";
import { BtnConfirmViewOpenArgs } from "db://assets/scripts/game/modules/common/confirm/BtnConfirmView";
import { TargetDownArrowComponentOpenArgs } from "db://assets/scripts/game/ui/guide/view/TargetDownArrowComponent";
import { MapManager } from "db://assets/scripts/game/tiledMap/MapManager";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { LocalMemoryData } from "db://assets/scripts/game/comm/cache/LocalMemoryData";
import { ModelUtils } from "db://assets/scripts/game/modules/common/model/ModelUtils";
import { TrunkTaskUtils } from "db://assets/scripts/game/modules/task/utils/TrunkTaskUtils";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { MapModel } from "db://assets/scripts/game/tiledMap/model/MapModule";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { CameraAnimBackType, ICameraAnim } from "../../../modules/common/enum/AnimType";
import { CdUtils } from "db://assets/scripts/game/comm/utils/CdUtils";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UIMainKey } from "../const/UIMainConfig";
import { GuideWeakTouchArgs, UIGuideConfig } from "../../../modules/guide/const/UIGuideConfig";
import GIns from "../../../GIns";
import { MapUIController } from "db://assets/scripts/game/modules/map/MapUIController";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";

enum FGUIControllerTaskState {
    NO = 0,
    OK = 1,
}

enum TrunkTaskGuideType {
    JUMP = "jump",

    BUILDING = "building",

    RESOURCE_POINT = "resourcePoint",
}

/**
 * 主界面的任务 button
 */
export class TrunkTaskBtn extends fgui.GButton implements INotification {
    // 当前任务id
    private _oldTaskId: number = 0;

    private _trunkTaskConfig: table.trunktask.TrunkTaskConfig;

    static pkgName: string = "main";

    static viewName: string = "TrunkTaskBtn";

    /**用于自动领取 */
    static autoTurnkTask: boolean = false;

    private _firstFlag: boolean = true;
    // 是否点击过领奖
    // private _isHaveClickGainReward: boolean = false;

    private _taskShowTime: number = 2000;
    /**任务展示时间完成 */
    private _isShowFinishTaskID: number = -1;

    private get view(): ui.main.btn.TrunkTaskBtn {
        return this as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.EVENT_TRUNK_TASK_CHANGE, NotificationKey.EVENT_TRUNK_TASK_ID_NEXT];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_TRUNK_TASK_CHANGE: {
                this.reset();
                break;
            }
            case NotificationKey.EVENT_TRUNK_TASK_ID_NEXT: {
                this.showNewTaskEffect();
                break;
            }
            case NotificationKey.OPEN_ViEW: {
                GameTimer.ins().clear(this, this.checkTaskCompleted); // 清理展示计算
                break;
            }
            case NotificationKey.CLOSE_ViEW: {
                this.checkState();
                break;
            }
        }
    }

    protected onInit() {

        this.view.onClick(this.clickTask0, this);

        G.FacadeManager.registerNotification(this);

        this._taskShowTime = TrunkTaskUtils.getShowTaskMinTime();

        this.onOpen();
    }

    onPreDispose() {
        Tween.stopAllByTarget(this.view.done);
        G.FacadeManager.removeNotification(this);
    }

    public onOpen(): void {
        G.Logger.debug(" onOpen ");

        if (this._firstFlag) {
            this.reset();
            this._firstFlag = false;
        }
    }

    private taskTipsBtn: ui.comm.btn.LabelBtn;
    public setTipsBtn(btn: ui.comm.btn.LabelBtn): void {
        if (!this.taskTipsBtn) {
            btn.onClick(this.onClickTaskTips, this)
        }
        this.taskTipsBtn = btn;
        this.checkTipsBtnShow()
    }

    private onClickTaskTips(): void {
        if (!this._trunkTaskConfig.experienceSource)
            return

        FacadeManager.ins().emit(NotificationKey.EVENT_ITEM_GET_WAY_POP_UP_2,
            [this._trunkTaskConfig.experienceSource, 0]
        );
    }

    private checkTipsBtnShow(): void {
        if (!this.taskTipsBtn)
            return

        if (!this._trunkTaskConfig || !this._trunkTaskConfig.experienceSource ||
            this.view.getController("taskState").selectedIndex == FGUIControllerTaskState.OK || this.view.getController("finishFlag").selectedIndex == 1) {
            this.taskTipsBtn.visible = false;
        }
        else {
            this.taskTipsBtn.visible = true;
        }
    }

    private updateReward() {
        let trunkTaskConfig = this._trunkTaskConfig;

        // 奖励
        const rewardItem = ItemUtils.parseStringToNoOwnerItemArray(trunkTaskConfig.rewards)[0];
        if (rewardItem) {
            const itemConfig = G.TableManager.getDataById(table.item.ItemConfig, rewardItem.itemId);
            if (itemConfig) {
                this.view.imageReward.icon = itemConfig.iconPath;
            }
            this.view.labelRewardCount.text = rewardItem.count.toString();
        }
        this.view.labelRewardTitle.text = TaskI18nKeys.MAIN_TASK_REWARD_TIPS;
    }

    /**是否展示完成 */
    private isTaskShowfinish() {
        return this._isShowFinishTaskID === this._trunkTaskConfig?.id;
    }

    private reset() {
        // 主线任务
        const taskId = TrunkTaskModel.ins().getCurrentTaskId();
        const currentTask = TrunkTaskModel.ins().getCurrentTask();
        if (!currentTask) {
            // 任务做完
            this.view.getController("finishFlag").selectedIndex = 1;
            this._oldTaskId = 0;
            this.checkTipsBtnShow()
            return;
        }

        // 任务已完成, 没有跳转到下一个任务视为所有都做完了
        if (currentTask.isFinish()) {
            // 奖励领完 = 后端发下一个任务, 没有发 = 最后一个任务并且完成了
            this.view.getController("finishFlag").selectedIndex = 1;
            this.checkTipsBtnShow()
            return;
        }
        // config
        const trunkTaskConfig = G.TableManager.getDataById(table.trunktask.TrunkTaskConfig, taskId);
        if (!trunkTaskConfig) {
            // 没有配置 = 隐藏
            if (taskId !== 0) {
                G.Logger.error(`没找到主线任务配置 taskId = ${taskId}`);
            } else {
                G.Logger.debug(`all trunk task done. 主线任务做完啦. taskId = ${taskId}`);
            }
            this.view.getController("taskState").selectedIndex = 0;
            // 没找到主线任务, 视为已完成
            this.view.getController("finishFlag").selectedIndex = 1;
            this.checkTipsBtnShow()
            return;
        }

        // 任务状态
        G.Logger.debug(`reset trunk task. taskId = ${taskId}, progress = ${currentTask?.currentProgress}`);
        this.view.getController("finishFlag").selectedIndex = 0;

        this._trunkTaskConfig = trunkTaskConfig;

        // 进度
        this.view.labelTaskProgress.setVar("currentCount", currentTask.currentProgress.toString()).setVar("maxCount", trunkTaskConfig.totalProgress.toString()).flushVars();
        // 任务目标
        this.view.labelTaskTitle.text = trunkTaskConfig.desc;
        this.view.imageTaskTarget.icon = trunkTaskConfig.targetSmallIcon;

        if (this.view.getController("taskState").selectedIndex == 1) {
            this.updateReward();
        }

        if (this._firstFlag) {
            //刚上线完成 无需展示时间
            if (currentTask.isCanComplete()) {
                this._isShowFinishTaskID = taskId;
            }
        }

        /**是否满足展示时间 */
        if (this.isTaskShowfinish()) {
            this.checkTaskCompleted();
        } else {
            this.view.getController("taskState").selectedIndex = FGUIControllerTaskState.NO;
            GameTimer.ins().once(this._taskShowTime, this, this.checkTaskCompleted);
        }
        if (this.isTaskShowfinish()) {
            if (this.taskTipsBtn)
                this.taskTipsBtn.visible = false;
        }
        else
            this.checkTipsBtnShow()
    }

    /***因为先隐藏了，所以特殊处理第1个任务特效 */
    public showFirstNewTaskEffect() {
        this.view.getTransition("newTask").play();
    }

    public showNewTaskEffect() {
        this.view.getTransition("newTask").play();
    }

    private playTaskFinishAnimAndMarkTaskDone() {
        // spine anim
        ModelUtils.createSpineNodeByAssetPath(TrunkTaskUtils.getTrunkTaskCompleteSpineAssetPath(), this.view.doneSpineRoot.node).then((it) => {
            // 当前任务, 可以完成
            this.view.getController("taskState").selectedIndex = FGUIControllerTaskState.OK;
            this._oldTaskId = this._trunkTaskConfig.id;
            this.checkTipsBtnShow()
            it.setAnimation(0, "idle", true);

            // offset
            const vec3 = it.node.position.clone();
            const offset = TrunkTaskUtils.getSpineRootOffsetVec3();
            it.node.position = v3(vec3.x + offset.x, vec3.y + offset.y, vec3.z);
            tween(this.view)
                .to(0.25, { scaleX: 1.1, scaleY: 1.1 }, { easing: "quadOut" })
                .to(
                    0.25,
                    {
                        scaleX: 1,
                        scaleY: 1,
                    },
                    { easing: "quadOut" }
                )
                .to(0.25, { scaleX: 1.1, scaleY: 1.1 }, { easing: "quadOut" })
                .to(
                    0.25,
                    {
                        scaleX: 1,
                        scaleY: 1,
                    },
                    { easing: "quadOut" }
                )
                .start();
        });
    }

    /**检测状态 */
    checkState() {
        if (!UIManager.ins().isUILayerTop(UIMainKey.MAIN_PAGE)) {
            return;
        }

        if (this.view.getController("finishFlag").selectedIndex === 1 || this.view.getController("taskState").selectedIndex === FGUIControllerTaskState.OK) {
            //再完成状态返回
            return;
        }

        if (this.isTaskShowfinish()) {
            this.checkTaskCompleted();
        } else {
            this.view.getController("taskState").selectedIndex = FGUIControllerTaskState.NO;
            GameTimer.ins().once(this._taskShowTime, this, this.checkTaskCompleted);
        }
    }

    /**检测任务是否完成 */
    checkTaskCompleted() {
        const currentTask = TrunkTaskModel.ins().getCurrentTask();
        if (!currentTask) return;
        this._isShowFinishTaskID = this._trunkTaskConfig?.id;
        if (currentTask.isCanComplete()) {
            this.playTaskFinishAnimAndMarkTaskDone();
        }
    }

    /**
     * 点击任务提示框
     * @private
     */
    @CdUtils.ExecuteInCDTimeMs(500)
    private clickTask0() {
        // 引导中 ?
        if (LocalMemoryData.ins().isInGuide) {
            return;
        }

        //按钮事件（新手引导使用）
        //G.FacadeManager.emit(NotificationKey.GUIDE_CLICK_BTN, 1);

        const currentTask = TrunkTaskModel.ins().getCurrentTask();
        if (!currentTask) {
            G.Logger.warn("当前主线任务不存在");
            return;
        }

        const state = this.view.getController("taskState").selectedIndex;
        // 已完成, 领取奖励
        if (state == FGUIControllerTaskState.OK) {
            // if (this._isHaveClickGainReward) {
            //     console.info("已经点击过领取了. 等服务端响应")
            //     return;
            // }
            // this._isHaveClickGainReward = true;
            // 领取奖励
            TrunkTaskModel.ins().sendDrawTaskReward();
            this.clearSpineAnim();
            return;
        }

        //gm
        if (TrunkTaskBtn.autoTurnkTask) {
            G.FacadeManager.emit(NotificationKey.EVENT_TRUNK_TASK_GM_AUTO_FINISH);
            return;
        }

        const taskId = currentTask.taskId;
        const trunkTaskConfig = G.TableManager.getDataById(table.trunktask.TrunkTaskConfig, taskId);
        if (!trunkTaskConfig) {
            G.Logger.error(`没找到主线任务配置 taskId = ${taskId}`);
            return;
        }

        const guideType = trunkTaskConfig.guideType;
        if (!guideType) {
            return;
        }

        // 是否同一个底图
        const guideConfigId = trunkTaskConfig.guideConfigId;
        const jumpBuildingId: number | null = trunkTaskConfig.jumpBuildingId;
        let isSameMap: boolean = this.isSameMapCheckByType(guideType, guideConfigId);

        // 同一张地图, 才是引导
        if (isSameMap) {
            G.FacadeManager.emit(NotificationKey.TASK_GUIDE_START);
        }

        switch (guideType) {
            case TrunkTaskGuideType.JUMP:
                G.FacadeManager.emit(NotificationKey.EVENT_JUMP_TO_OTHER_FEATURE, guideConfigId);
                break;
            case TrunkTaskGuideType.BUILDING: {
                // 引导的建筑
                const guideBuildingId = guideConfigId;
                if (isSameMap) {
                    this.guidePlayerToBuilding0(guideBuildingId);
                    return;
                }

                // 跳转, 但是没有配置 jumpBuildingId
                if (!jumpBuildingId) {
                    //console.debug("没有配置 jumpBuildingId. 所以什么反应都没有");
                    return;
                }

                // 非同一张地图
                if (jumpBuildingId == 1002) {
                    //回城
                    let args: GuideWeakTouchArgs = { viewName: UIMainKey.MAIN_PAGE, itemName: "btn_backHome" };
                    G.UIManager.open(UIGuideConfig.GuideWeakTouchView, args);
                } else {
                    G.UIManager.open(UICommonKey.BtnConfirmView, {
                        title: CommonI18nKeys.tipsForConfirm,
                        content: trunkTaskConfig.guideDesc,
                        titleConfirm: CommonI18nKeys.confirm,
                        titleCancel: CommonI18nKeys.cancel,
                        onBtnYes: () => {
                            this.guidePlayerToBuilding0(jumpBuildingId);
                        },
                    } as BtnConfirmViewOpenArgs);
                }
                break;
            }
            case TrunkTaskGuideType.RESOURCE_POINT: {
                const resourcePointId = trunkTaskConfig.guideConfigId;

                // 同一个地图, 指引
                if (isSameMap) {
                    this.guidePlayerToResourcePoint0(resourcePointId);
                    return;
                }

                // 跳转, 但是没有配置 jumpBuildingId
                if (!jumpBuildingId) {
                    //console.debug("没有配置 jumpBuildingId. 所以什么反应都没有");
                    return;
                }

                // building
                const buildingConfig = G.TableManager.getDataById(table.map.MapBuildingConfig, jumpBuildingId);
                if (!buildingConfig) {
                    G.Logger.error(`【主线引导-资源】 找不到跳转的建筑配置 jumpBuildingId = ${jumpBuildingId}`);
                    return;
                }
                // 解锁?
                const isUnlock = MapModel.ins().isUnlockBuildingById(jumpBuildingId);
                if (!isUnlock) {
                    FloatingTextManager.ins().showTips("目标点暂未解锁");
                    return;
                }

                // 不在当前地图, 传送
                G.UIManager.open(UICommonKey.BtnConfirmView, {
                    title: CommonI18nKeys.tipsForConfirm,
                    content: trunkTaskConfig.guideDesc,
                    titleConfirm: CommonI18nKeys.confirm,
                    titleCancel: CommonI18nKeys.cancel,
                    onBtnYes: () => {
                        MapUIController.ins().transferToMap(null, jumpBuildingId);
                    },
                } as BtnConfirmViewOpenArgs);
                break;
            }
            default: {
                G.Logger.error(`未知的指引类型 taskId = ${taskId}, guideType = ${guideType}`);
                break;
            }
        }
    }

    private clearSpineAnim() {
        this.view.doneSpineRoot.node.removeAllChildren();
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
    @LogBusiness("引导玩家视角到建筑 | 跨地图跳转")
    private guidePlayerToBuilding0(buildingId: number) {
        const buildingConfig = G.TableManager.getDataById(table.map.MapBuildingConfig, buildingId);
        if (!buildingConfig) {
            return;
        }

        // 当前地图查找这个建筑
        const buildingObject = MapManager.ins().getObjectsByIDInBuilding(buildingId);
        if (!buildingObject) {
            const isUnlock = MapModel.ins().isUnlockBuildingById(buildingId);
            if (!isUnlock) {
                FloatingTextManager.ins().showTips("目标点暂未解锁");
                return;
            }

            // 建筑不存在
            const posArray = buildingConfig.transferPos;
            if (posArray) {
                G.Logger.debug(`主线任务指引. 建筑不在当前地图. buildingId = ${buildingId}. 传送建筑id = ${buildingId}`);

                // 传送
                MapManager.ins().transferToOtherMapPositionWithAnim(buildingConfig.map_id, {
                    x: posArray[0],
                    y: posArray[1],
                });
            } else {
                const currentTaskId = TrunkTaskModel.ins().getCurrentTask()?.taskId || 0;
                G.Logger.error(`【建筑】主线任务指引. 建筑不在当前地图. 同时没有传送点, 但是主线任务却配置了他. trunkTaskConfigId = ${currentTaskId}, buildingId = ${buildingId}`);
            }
            return;
        }

        // 建筑地图坐标
        const buildingMapPos = { x: buildingObject.x, y: buildingObject.y };

        let animParam: ICameraAnim = {
            targetPos: { x: buildingMapPos.x, y: buildingMapPos.y },
            timeMs: 800,
            backType: CameraAnimBackType.TouchBack,
        };
        // 镜头移动
        GIns.cameraAnimUtils.cameraMoveAnim(animParam);

        // event 指引箭头
        G.FacadeManager.emit(NotificationKey.TASK_GUIDE_TO_TARGET_DOWN_ARROW, {
            mapPosition: buildingMapPos,
            delaySecond: 1,
        } as TargetDownArrowComponentOpenArgs);
    }

    /**
     * 资源点
     * @param resourcePointId
     * @private
     */
    @LogBusiness("[主线任务-引导] 到资源点")
    private guidePlayerToResourcePoint0(resourcePointId: number) {
        const resourcePoint = MapResourceController.ins().getResourcePointByResourceId(resourcePointId);
        if (!resourcePoint) {
            // 不在当前地图
            let jumpBuildingId = this._trunkTaskConfig.jumpBuildingId;

            const buildingConfig = G.TableManager.getDataById(table.map.MapBuildingConfig, jumpBuildingId);
            if (!buildingConfig) {
                G.Logger.error(`【主线引导-资源】 找不到跳转的建筑配置 jumpBuildingId = ${jumpBuildingId}`);
                return;
            }

            // 解锁?
            const isUnlock = MapModel.ins().isUnlockBuildingById(jumpBuildingId);
            if (!isUnlock) {
                FloatingTextManager.ins().showTips("目标点暂未解锁");
                return;
            }

            const posArray = buildingConfig.transferPos;
            G.Logger.debug(`主线任务引导. 资源点不在当前地图. trunkTaskId = ${this._trunkTaskConfig.id}, resourcePointId = ${resourcePointId}, jumpBuildingId = ${jumpBuildingId}`);

            // 直接瞬移
            // G.FacadeManager.emit(NotificationKey.MAP_AREA_TRANSFER_START, {
            //     portalID: jumpBuildingId,
            // })

            // 传送?
            MapManager.ins().transferToOtherMapPositionWithAnim(buildingConfig.map_id, {
                x: posArray[0],
                y: posArray[1],
            });

            return;
        }

        /**聚焦最近的资源点同类单位 */
        GIns.cameraAnimUtils.taskFocusNearestResourceId(resourcePointId);
    }
}
