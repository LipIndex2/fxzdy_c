import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { TimeUtils } from "../../../../comm/utils/TimeUtils";
import GIns from "../../../../GIns";
import { PlayerInfoConfigManager } from "../../../player/config/PlayerInfoConfigManager";
import { LeagueExploreManager } from "../../LeagueExploreManager";
import { ILeagueExploreStarVo } from "../../model/vo/ILeagueExploreStarVo";

/**
 * 勘探星球item
 */
@bindFguiExtension('ui://leagueExplore/LeagueExplorePlanetItem')
export class LeagueExplorePlanetItem extends fgui.GComponent {

    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExplorePlanetItem";

    protected _starVo: ILeagueExploreStarVo = null;
    protected _isUnlock: boolean = false;
    protected _endTime: number = 0;
    protected _timerKey: string = null;

    private get view(): ui.leagueExplore.item.LeagueExplorePlanetItem {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.btnPlanet.onClick(this.onClickItem, this);
    }

    protected onPreDispose(): void {
        this.removeTimer();
    }

    protected onClickItem(): void {
        if (this._starVo.vo) {
            let nowTime: number = G.TimeManager.serverNow;
            let remainTime: number = this._endTime - nowTime;
            if (remainTime > 0) {
                GIns.floatingTextMgr.showTips(TimeUtils.formatTimeMsToDayHourMinuteSecond(remainTime) + '后开启');
                return;
            }
            if (GIns.conditionMgr.checkCondition(this._starVo.cfg.unlockConditions, true, true) == false) {
                return;
            }
            LeagueExploreManager.ins().enterPlanet(this._starVo.cfg.id);
        }
    }

    /**添加计时器*/
    protected addTimer(): void {
        if (!this._timerKey) {
            this._timerKey = G.GameTimer.loop(500, this, this.onTimer)
        }
        this.onTimer();
    }

    /**移除计时器*/
    protected removeTimer(): void {
        if (this._timerKey) {
            G.GameTimer.clearByKey(this._timerKey)
            this._timerKey = null
        }
    }

    protected onTimer(): void {
        let nowTime: number = G.TimeManager.serverNow;
        let remainTime: number = this._endTime - nowTime;
        if (remainTime <= 0) {
            remainTime = 0;
            this.view.btnPlanet.lbUnlock.text = '';
            //倒计时到了 就刷新当前item
            this.setData(this._starVo);
            return;
        }
        this.view.btnPlanet.lbUnlock.text = '解锁时间：' + TimeUtils.formatTimeMsToDayHourMinuteText(remainTime) + '后';
    }

    /**结束时间*/
    public get endTime(): number {
        return this._endTime;
    }

    public setData(data: ILeagueExploreStarVo): void {
        this._starVo = data;
        this.view.btnPlanet.iconLoader.icon = data.cfg.icon;
        if (GIns.conditionMgr.checkCondition(data.cfg.unlockConditions) == false) {
            //未解锁展示解锁提示
            this._endTime = GIns.leagueExploreMgr.getStarUnlockTime(data.cfg.id);
            if (this._endTime > 0) {
                this.addTimer();
            } else {
                this.view.btnPlanet.lbUnlock.text = GIns.conditionMgr.getOpenConditionTips(data.cfg.unlockConditions)
                this.removeTimer();
            }
            this.view.btnPlanet.getController('state').selectedIndex = 1;
            return;
        }
        this._endTime = 0;
        this.removeTimer();
        this._isUnlock = true;
        this.view.btnPlanet.getController('state').selectedIndex = 0;
        this.view.btnPlanet.lbName.text = data.cfg.name;
        if (data.vo) {
            this.view.btnPlanet.gProgress.visible = true;
            this.view.btnPlanet.lbProgress.text = `${data.vo.occupiedBuildingCount}/${data.vo.buildingCount}`;
        } else {
            this.view.btnPlanet.gProgress.visible = false;
        }
        let myOccupyBuildingId = GIns.leagueExploreModel.activityinfo.playerInfoVo.occupyBuildingConfigId;
        if (myOccupyBuildingId > 0) {
            let myOccupyBuildingVo = GIns.leagueExploreModel.getBuildingVo(myOccupyBuildingId);
            if (myOccupyBuildingVo && myOccupyBuildingVo.cfg.starConfigId == data.cfg.id) {
                this.view.btnPlanet.iconMyLeague.visible = false;
                this.view.btnPlanet.iconMine.visible = true;
                const headIconId = GIns.settingsModel.context.getHeadIconId();
                const headIconConfig = PlayerInfoConfigManager.getHeadIconConfigById(+headIconId);
                if (headIconConfig) {
                    this.view.btnPlanet.iconMine.imagePlayerAvatar.icon = headIconConfig.assetPath;
                }
                return;
            }
        }
        this.view.btnPlanet.iconMine.visible = false;
        this.view.btnPlanet.iconMyLeague.visible = data.vo?.selfLeagueOccupyCount > 0;
    }

    /**0唯一星球 1单数 2双数*/
    public setStyle(style: number): void {
        this.getController('state').selectedIndex = style;
    }
}