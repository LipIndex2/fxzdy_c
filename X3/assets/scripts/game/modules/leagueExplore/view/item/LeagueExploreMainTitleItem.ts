import { RichText } from "cc";
import G from "db://assets/scripts/core/comm/G";
import { RichTextUtils } from "db://assets/scripts/core/utils/RichTextUtils";
import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { TimeUtils } from "../../../../comm/utils/TimeUtils";
import GIns from "../../../../GIns";
import { ILeagueExploreStarLevelVo } from "../../model/vo/ILeagueExploreStarLevelVo";
import NotificationKey from "../../../../event/NotificationKey";

/**
 * 勘探星球item
 */
@bindFguiExtension('ui://leagueExplore/LeagueExploreMainTitleItem')
export class LeagueExploreMainTitleItem extends fgui.GComponent {

    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExploreMainTitleItem";

    protected _endTime: number = 0;
    protected _timerKey: string = null;

    private get view(): ui.leagueExplore.item.LeagueExploreMainTitleItem {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {

    }

    protected onPreDispose(): void {
        this.removeTimer();
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
            //倒计时到了 就刷新当前列表
            this.removeTimer();
            G.FacadeManager.emit(NotificationKey.LEAGUE_EXPLORE_STAR_INFO_CHANGE);
            return;
        }
        this.view.lbTip.text = '解锁时间：' + TimeUtils.formatTimeMsToDayHourMinuteText(remainTime) + '后';
    }


    public setData(data: ILeagueExploreStarLevelVo, isLock: boolean): void {
        if (data.cfg) {
            this.view.lbName.text = data.cfg.name;
            if (isLock) {
                this._endTime = GIns.leagueExploreMgr.getStarUnlockTime(data.stars[0].cfg.id);
                if (this._endTime > 0) {
                    this.addTimer();
                } else {
                    this.removeTimer();
                    this.view.lbTip.text = GIns.conditionMgr.getOpenConditionTips(data.stars[0].cfg.unlockConditions);
                }
            } else {
                this.removeTimer();
                this.view.lbTip.text = data.cfg.desc;
                if (data.cfg.descAtlas) {
                    RichTextUtils.setTextWithImg(data.cfg.desc, this.view.lbTip.node.getComponent(RichText), data.cfg.descAtlas);
                }
            }
        }
    }
}