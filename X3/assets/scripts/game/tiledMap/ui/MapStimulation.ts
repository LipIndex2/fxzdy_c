import { Tween, tween } from "cc";
import G from "../../../core/comm/G";
import { bindFguiExtension } from "../../../core/comm/UIScriptManager";
import { TimeUtils } from "../../comm/utils/TimeUtils";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { UIStimulationConfig } from "../../modules/stimulation/const/UIStimulationConfig";
import { IStimulationData } from "../../modules/stimulation/model/vo/IStimulationData";
import { IStimulationRewards } from "../../modules/stimulation/model/vo/IStimulationRewards";
import { IMainPageAddItemAniArgs } from "../../ui/main/components/MainPageAniPoint";
import { MapBuildingUI } from "./MapBuildingUI";

/** 经营建筑信息展示 */
@bindFguiExtension("ui://map/MapStimulation")
export class MapStimulation extends MapBuildingUI {
    static pkgName: string = "map";
    static viewName: string = "MapStimulation";

    /**经营数据*/
    protected _data: IStimulationData = null;
    /**是否正在播放动画*/
    protected _isPlayAni: boolean = false;

    protected _playAniTime: number = 0;

    protected _isAddCheck: boolean = false;
    protected _timerKey: string = null;

    private get view(): ui.map.item.MapStimulation {
        return this as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.MAP_ACTIVE_BUILDING,
            NotificationKey.STIMULATION_DEVICE_UPDATE,
            NotificationKey.STIMULATION_DRAW_REWARD_COMPLETE,
            NotificationKey.OPEN_ViEW,
            NotificationKey.CLOSE_ViEW,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.MAP_ACTIVE_BUILDING:
                if (args == this.buildingId) {
                    this.checkStimulationUnlock();
                    this.tryAutoDrawReward();
                }
                break;
            case NotificationKey.STIMULATION_DEVICE_UPDATE:
                this.updateUI();
                break;
            case NotificationKey.STIMULATION_DRAW_REWARD_COMPLETE:
                if (args.deviceId == this._data?.cfg?.cfg?.id) {
                    this.handleDrawReward(args);
                }
                break;
            case NotificationKey.OPEN_ViEW:
            case NotificationKey.CLOSE_ViEW:
                if (args == UIStimulationConfig.StimulationMainView) {
                    this.updateUI();
                }
                break;
        }
    }

    protected onInit() {
        super.onInit();
    }

    protected onPreDispose() {
        this.removeCheck();
        G.GameTimer.clearAll(this);
        Tween.stopAllByTarget(this.view.prgressBar);
        super.onPreDispose();
    }

    protected addCheck(): void {
        if (this._data) {
            if (this._isAddCheck == false) {
                this._isAddCheck = true;
                GIns.stimulationModel.addCapacityUpdateListener(this._data, this.onUpdateCapacity, this);
            }
        }
    }

    protected removeCheck(): void {
        if (this._data) {
            if (this._isAddCheck) {
                this._isAddCheck = false;
                GIns.stimulationModel.removeCapacityUpdateListener(this._data, this.onUpdateCapacity, this);
            }
        }
    }

    protected onUpdateCapacity(): void {
        this.updateCapacity();
    }

    /**添加计时器*/
    protected addTimer(): void {
        if (!this._timerKey) {
            this._timerKey = G.GameTimer.loop(1000, this, this.onTimer)
        }
        this.onTimer();
    }

    /**移除计时器*/
    protected removeTimer(): void {
        if (this._timerKey) {
            G.GameTimer.clearByKey(this._timerKey)
            this._timerKey = null
        }
        this.view.lbTime.text = '';
    }

    protected onTimer(): void {
        let remainTime = Math.max(0, this._data.vo.nextLevelTime - G.TimeManager.serverNow);
        if (remainTime <= 0) {
            this.removeTimer();
        }
        this.view.lbTime.text = `升级中：` + TimeUtils.formatTimeMsToPositiveTimeText(remainTime);
    }


    /**检测并解锁经营*/
    protected checkStimulationUnlock(): void {
        if (GIns.mapModel.isUnlockBuildingById(this.buildingId)) {
            //建筑解锁了
            if (this._data && this._data?.vo == null) {
                //经营未解锁
                GIns.stimulationModel.sendActivate({ deviceId: this._data.cfg.cfg.id })
            }
        }
    }

    /**尝试自动领取奖励*/
    protected tryAutoDrawReward(): void {
        if (this._data.vo?.storeNum > 0) {
            GIns.stimulationModel.sendDrawDeviceRewards({ deviceId: this._data.cfg.cfg.id })
        }
    }

    protected handleDrawReward(data: IStimulationRewards): void {
        if (data?.rewards?.length <= 0) {
            return
        }
        let args: IMainPageAddItemAniArgs = {
            rewards: data.rewards,
            fromComp: this.view.iconLoader,
            isMapUI: true
        }
        //主界面动画
        G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_WITH_MAIN_ANI, args);
        this.playAni(data.rewards);
    }

    protected playAni(rewards: Vo.reward.RewardResult[]): void {
        if (this._isPlayAni) {
            return
        }
        this._isPlayAni = true
        this._playAniTime = 0;
        rewards?.forEach((reward) => {
            let time = reward.amount * 0.1;
            if (time > 1) {
                time = 1;
            }
            if (this._playAniTime < time) {
                this._playAniTime = time;
            }
        })
        G.GameTimer.once(500, this, this.onPlayAniProgress);
    }

    protected onPlayAniProgress(): void {
        if (this.view.node?.isValid) {
            tween(this.view.prgressBar).to(this._playAniTime, { value: 0 }).call(() => {
                this._isPlayAni = false;
                if (this.view.node?.isValid) {
                    this.updateUI();
                }
            }).start();
        }
    }

    protected initUI(): void {
        //坐标偏移
        let pos = this._buildingCfg.namePos || [0, 0];
        this.view.gAll.x = -this.view.gAll.width * 0.5 + pos[0];
        //fgui和node的y坐标不一致
        this.view.gAll.y = 26 - pos[1];
        this._data = GIns.stimulationModel.getDeviceDataByBuilding(this.buildingId);
        if (this._data) {
            let itemId = this._data.cfg.cfg.itemId;
            let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, itemId);
            if (itemCfg) {
                this.view.iconLoader.icon = itemCfg.smallIconPath;
            }
        }
    }

    protected refreshTimeUI(): void {
        if (this._data?.vo?.nextLevel > 0) {
            //当前正在升级
            this.addTimer();
        } else {
            this.removeTimer();
        }
    }

    protected updateCapacity(): void {
        this.view.prgressBar.min = 0;
        this.view.prgressBar.max = this._data.vo.capacity;
        this.view.prgressBar.value = this._data.vo.storeNum;
    }

    protected updateUI(): void {
        if (G.UIManager.isOpened(UIStimulationConfig.StimulationMainView)) {
            this.view.gAll.visible = false;
            return;
        }
        if (this._isPlayAni) {
            //播放动画时不刷新ui
            return
        }
        if (this._data == null || this._data.vo == null) {
            //数据不存在或者未解锁 隐藏
            this.view.gAll.visible = false;
            this.removeTimer();
            return
        }
        this.view.gAll.visible = true;
        this.updateCapacity();

        if (this._isActive) {
            this.refreshTimeUI();
            this.addCheck();
        }
    }

    public setAcive(isActive: boolean): void {
        super.setAcive(isActive);
        if (isActive) {
            this.addCheck();
            this.refreshTimeUI();
        } else {
            this.removeCheck();
            this.removeTimer();
        }
    }
}
