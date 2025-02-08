import { Color, tween, Tween } from "cc";
import G from "../../../../../core/comm/G";
import { bindScript } from "../../../../../core/comm/UIScriptManager";
import { Logger } from "../../../../../core/log/Logger";
import { UIView } from "../../../../../core/mvc/view/UIView";
import { TableManager } from "../../../../../core/table/TableManager";
import { GameTimer } from "../../../../../core/timer/GameTimer";
import GIns from "../../../../GIns";
import { BattleManager } from "../../../../comm/battle/BattleManager";
import { WorldUnitTeam } from "../../../../comm/battle/enum/BattleEnum";
import { FightType } from "../../../../comm/battle/enum/FightType";
import { IBattleUnitDeadEventData } from "../../../../comm/battle/interface/BattleInterface";
import { AudioManager, SoundType } from "../../../../comm/mgr/AudioManager";
import { TimeUtils } from "../../../../comm/utils/TimeUtils";
import NotificationKey from "../../../../event/NotificationKey";
import { MapManager } from "../../../../tiledMap/MapManager";
import { ITransfer } from "../../../../tiledMap/interface/ITransfer";
import { IBattleEnterData } from "../../../battle/vo/IBattleEnterData";
import { IBattleResultVo } from "../../../common/battle/structs/IBattleResultVo";
import { MiniMapItem } from "../../../miniMap/item/MiniMapItem";
import { UISecretAreaKey } from "../../../secretArea/const/UISecretAreaConfig";
import { SeasonUIKeys } from "../../SeasonUIKeys";
import { SecretSeasonManager } from "../SecretSeasonManager";

/**
 * 秘境
 * 战斗主界面
 */
@bindScript(SeasonUIKeys.SeasonSecretBattleView)
export class SeasonSecretBattleView extends UIView {
    static pkgName: string = "secretArea";
    static viewName: string = "SecretAreaBattleView";
    //进度条图标初始x
    private _starX = 0;
    //总时间
    private _time = 0;
    //剩余时间
    private _remainingTime: number = 0;
    //当前积分
    private _score = 0;
    //总积分
    private _allScore = 0;

    //时间进度
    private _timeW = 0;
    //积分进度
    private _scoreW = 0;

    //是否结束战斗
    private _isEndFight = false;

    //死亡扣除时间
    private _dieTime: number;

    //下一层传送点
    private _curBuildingId: number;

    private _playTransferNext = false;

    private _canUpdateJdt = false

    private _disableTransport = false;

    private get view(): ui.secretArea.battleView.SecretAreaBattleView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.BATTLE_UNIT_DEAD_INFO,
            NotificationKey.SECRET_AREA_BATTLE_WIN,
            NotificationKey.BATTLE_START,
            NotificationKey.MAP_AREA_TRANSFER_END,
            NotificationKey.MAP_TEAN_POS_UPDATE,
            NotificationKey.BATTLE_START_STATE,
            NotificationKey.MAP_ACTIVE_BUILDING,
            NotificationKey.MAP_CANCEL_ACTIVE_BUILDING,
            NotificationKey.SECRET_AREA_TRANSFER,
            NotificationKey.TEAM_DIE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.BATTLE_UNIT_DEAD_INFO:
                this.getScore(args);
                break;
            case NotificationKey.SECRET_AREA_BATTLE_WIN:
                this.battleWin();
                break;
            case NotificationKey.BATTLE_START:
                this.beginTime();
                break;
            case NotificationKey.MAP_AREA_TRANSFER_END:
                //小地图
                G.GameTimer.once(200, this, () => {
                    this.updateMiniMap();
                    this.setMiniMapPos(args);
                });

                if (this._playTransferNext) {
                    this._playTransferNext = false;
                    this.view.getTransition("t1").play();
                }
                this._disableTransport = false;
                break;
            case NotificationKey.MAP_TEAN_POS_UPDATE:
                //小地图
                this.setMiniMapPos(args);
                break;
            case NotificationKey.BATTLE_START_STATE:
                this.setBattleStartState(args as IBattleEnterData);
                break;
            case NotificationKey.MAP_ACTIVE_BUILDING:
                this.activeBuilding(args, true);
                break;
            case NotificationKey.MAP_CANCEL_ACTIVE_BUILDING:
                this.activeBuilding(args, false);
                break;
            case NotificationKey.SECRET_AREA_TRANSFER:
                this._playTransferNext = true;
                this.view.getTransition("t0").play(() => {
                    let modulePlayInfo = GIns.battleMgr.mainScene.battleData.modulePlayInfo as Vo.seasonactivity.SeasonSecretBattleInfo;
                    let mapIds = GIns.secretSeasonCtrl.getMapIds(modulePlayInfo);
                    let transferData: ITransfer = {
                        mapIds: mapIds,
                        useStartObj: true,
                        emitBattleStar: true,
                        isNextLevel: true,
                    };
                    this.emit(NotificationKey.MAP_AREA_TRANSFER_START, transferData);
                });
                break;
            case NotificationKey.TEAM_DIE:
                this.teamDie();
                break;
        }
    }

    public onInit(): void {
        this.view.btnBack.onClick(this.backHome, this);
        this.view.buildingBtn.onClick(this.onClickBuilding, this);
    }

    protected onOpen(args: any): void {
        GIns.secretAreaMgr.bossAppear = false;
        this._starX = this.view.img_time.x;
        // this.updateJdt();

        this._canUpdateJdt = true;
        this.view.MiniMap.redDot.visible = false;
    }

    /** 是否显示小地图 */
    private updateMiniMap() {
        let cfg = TableManager.getDataById(table.map.MapidConfig, MapManager.ins().getMapID());
        if (cfg.mapPath.length > 1) {
            this.view.MiniMap.visible = true;
            let miniMapItem = this.view.MiniMap as any as MiniMapItem;
            miniMapItem.setMiniMapIcon();
        } else {
            this.view.MiniMap.visible = false;
        }
    }

    private setBattleStartState(args1: IBattleEnterData) {
        this._allScore = SecretSeasonManager.ins().getAllMonsterScore();
        let cfg = TableManager.getDataById(table.seasonactivity.SeasonSecret.SeasonSecretConfig, SecretSeasonManager.ins().challengeFloor);
        this.view.T_name.text = cfg.name;
        if (this._canUpdateJdt) {
            this._canUpdateJdt = false;
            this.updateJdt();
        }
    }

    /** 设置小地图位置 */
    private setMiniMapPos(pos: { x: number; y: number }) {
        if (!this.view.MiniMap.visible) return;
        //@ts-ignore
        let miniMapItem = this.view.MiniMap as MiniMapItem;
        miniMapItem.setMiniMapPosition(pos);
    }

    //时间进度条 && 副本进度条
    private updateJdt() {
        let battleId = GIns.battleMgr.battleConfigId;
        let cfg = TableManager.getDataById(table.battle.BattleConfig, battleId);
        //秒
        this._time = cfg.fightMaxSecond;
        this._remainingTime = GIns.battleMgr.battleLogic.battleCfg.fightMaxSecond;
        this.showTimeJdt(this._remainingTime);
    }

    private beginTime(): void {
        G.GameTimer.loop(1000, this, this.onTimeHandler);
    }

    private onTimeHandler(): void {
        if (this._remainingTime > 0 && !this._isEndFight) {
            this._remainingTime -= 1;
            this.showTimeJdt(this._remainingTime);
        }
    }

    //时间
    private showTimeJdt(time: number) {
        if (time <= 0) time = 0;
        let w = 241 * (1 - time / this._time);
        w = w >= 241 ? 241 : w;
        this.view.img_time.x = this._starX + w;
        this.view.T_time1.x = this._starX + w;
        this.view.T_time1.text = TimeUtils.formatTimeMsToLevelTimeText(time * 1000);
        this._timeW = w;

        this.sortJdt(false);
    }

    //进度
    private showScoreJdt() {
        let w = 241 * (this._score / this._allScore);
        w = w >= 241 ? 241 : w;
        this.view.img_jd.x = this._starX + w;
        this._scoreW = w;
        this.sortJdt(true);
    }

    //排序
    private sortJdt(isShow: boolean) {
        let scoreFillAmount = this._scoreW / 241;
        let timeFillAmount = this._timeW / 241;

        //闪光动画
        Tween.stopAllByTarget(this.view.img_anim1);
        Tween.stopAllByTarget(this.view.img_anim2);
        this.view.img_anim1.fillAmount = scoreFillAmount;
        this.view.img_anim2.fillAmount = scoreFillAmount;
        this.view.img_anim1.alpha = 0;
        this.view.img_anim2.alpha = 0;
        // let tween1 =
        // let tween2 =

        //大的在下层  jdt1是下层
        if (this._scoreW > this._timeW) {
            if (isShow) {
                tween(this.view.img_anim1).to(0.2, { alpha: 0.9 }).to(0.2, { alpha: 0 }).start();
            }
            this.view.img_jdt1.fillAmount = scoreFillAmount;
            this.view.img_jdt1.color = new Color("#00D2FF");
            this.view.img_jdt2.fillAmount = timeFillAmount;
            this.view.img_jdt2.color = new Color("#FCD039");
        } else {
            if (isShow) {
                tween(this.view.img_anim2).to(0.2, { alpha: 0.9 }).to(0.2, { alpha: 0 }).start();
            }
            this.view.img_jdt2.fillAmount = scoreFillAmount;
            this.view.img_jdt2.color = new Color("#00D2FF");
            this.view.img_jdt1.fillAmount = timeFillAmount;
            this.view.img_jdt1.color = new Color("#FCD039");
        }
    }

    /** 退出副本，进入的地图 */
    private backHome() {
        if (this._isEndFight) return;
        G.UIManager.open(UISecretAreaKey.SecretAreaTipsWin, {
            type: 0,
            closeCllBack: () => {
                this._isEndFight = true;
                GIns.battleMgr.stopFightAi();
                SecretSeasonManager.ins().isEnter = false;
                this.showBattleResult();
            },
        });
    }

    //主动取消战斗
    private showBattleResult() {
        G.FacadeManager.emit(NotificationKey.BATTLE_CANCEL);
        GameTimer.ins().clear(this, this.onTimeHandler);

    }

    private teamDie() {
        this._isEndFight = true;
        GIns.battleMgr.stopFightAi();
        SecretSeasonManager.ins().isEnter = false;
        let resultVo: IBattleResultVo = { isWin: false, fightType: FightType.SEASON_SECRET };
        this.emit(NotificationKey.BATTLE_RESULT, resultVo);
        this.showBattleResult();
    }

    //杀死怪物获得积分
    private getScore(datas: IBattleUnitDeadEventData[]) {
        for (let i = 0; i < datas.length; i++) {
            const data = datas[i];
            //怪物死亡，加进度积分
            if (data.teamId == WorldUnitTeam.Enemy && data.monsterId) {
                let add = SecretSeasonManager.ins().getScoreByMonsterId(data.monsterId);
                this._score += add;
            }

            //英雄阵亡，扣时间
            if (data.teamId == WorldUnitTeam.Self && data.heroId) {
                if (!this._dieTime) {
                    this._dieTime = +TableManager.getDataById(table.secretinstance.SecretInstanceConstantConfig, "SECRET_INSTANCE:UNIT_DEAD_DEDUCT_SECONDS").content;
                }
                this._remainingTime -= this._dieTime;
                this.showTimeJdt(this._remainingTime);
                let time = G.TimeManager.serverNow + this._remainingTime * 1000;
                G.FacadeManager.emit(NotificationKey.BATTLE_SET_PLAY_ENDTIME, time);
                //记录死亡次数
                SecretSeasonManager.ins().dieCount = SecretSeasonManager.ins().dieCount + 1;
            }
        }
        this.showScoreJdt();
    }

    protected onClose(): void {
        G.GameTimer.clearAll(this);
        SecretSeasonManager.ins().quitSecret();
        Tween.stopAllByTarget(this.view.img_anim1);
        Tween.stopAllByTarget(this.view.img_anim2);
    }

    private battleWin() {
        this._isEndFight = true;
        G.GameTimer.clear(this, this.onTimeHandler);
    }

    public activeBuilding(buildingId: number, isActive: boolean) {
        let cfg = TableManager.getDataById(table.map.MapBuildingConfig, buildingId);
        let modulePlayInfo = BattleManager.ins().mainScene?.battleData?.modulePlayInfo as Vo.seasonactivity.SeasonSecretBattleInfo;
        let maxFloow = false; //是否已达最底层
        if (modulePlayInfo) {
            let nextFloor = modulePlayInfo.currentFloor + 1;
            maxFloow = !modulePlayInfo.floorMap[nextFloor];
        }

        if (isActive) {
            this._curBuildingId = buildingId;
            this.view.buildingBtn.icon = cfg.funcIcon;

            if (maxFloow) {
                this.view.buildingBtn.title = "返回第一层"
            } else {
                this.view.buildingBtn.title = cfg.funcName;
            }
        }

        if (!this.view.buildingBtn.visible && isActive) AudioManager.ins().playSound(SoundType.jiaohu);

        if (isActive) {
            this.showBuildingBtn();
        } else this.view.buildingBtn.visible = false;
    }

    private onClickBuilding() {
        if(GIns.secretAreaMgr.bossAppear) {
            GIns.floatingTextMgr.showTips("请击杀BOSS");
            return
        }
        if (this._disableTransport) {
            return
        }
        this._disableTransport = true;
        let battleData = BattleManager.ins().mainScene.battleData;
        let modulePlayInfo = battleData.modulePlayInfo as Vo.seasonactivity.SeasonSecretBattleInfo;
        let nextFloor = modulePlayInfo.currentFloor + 1;
        if (modulePlayInfo.floorMap[nextFloor]) {
            nextFloor = 1;
        }
        Logger.game(`传送到秘境 ${nextFloor} 层`, modulePlayInfo.floorMap[nextFloor]);
        GIns.battleModel.sendNextFloor(battleData.battleConfigId);
    }

    private showBuildingBtn(): void {
        this.view.buildingBtn.visible = true;
        this.view.buildingBtn.scaleY = 0;
        tween()
            .target(this.view.buildingBtn)
            .to(0.3, { scaleY: 1 }, { easing: "cubicInOut" })
            .start();
    }
}
