import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { HeaderItem } from "../../common/header/HeaderItem";
import { ModelNode } from "../../common/node/ModelNode";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { RuleController } from "../../rule/RuleController";
import { UILeagueExploreConfig } from "../const/UILeagueExploreConfig";
import { ILeagueExploreStarLevelVo } from "../model/vo/ILeagueExploreStarLevelVo";
import { LeagueExploreMainItem } from "./item/LeagueExploreMainItem";

@bindScript(UILeagueExploreConfig.LeagueExploreMainView)
export class LeagueExploreMainView extends UIPage {
    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExploreMainView";

    protected adaptType = ViewAdaptType.FULL;

    protected _maxBgPosY: number = 0;
    protected _starPosY: Map<number, number> = new Map();
    protected _dataList: ILeagueExploreStarLevelVo[] = [];
    protected _myLeagueStarPosYs: number[] = [];
    protected _curMyIdx: number = -1;
    protected _timerKey: string = null;
    protected _timerKey2: string = null;
    protected _endTime: number = 0;

    protected _lockLevelMap: Map<number, boolean> = new Map();
    protected _levelFristIndex: Map<number, number> = new Map();

    private get view(): ui.leagueExplore.view.LeagueExploreMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.LEAGUE_EXPLORE_MY_INFO_CHANGE,
            NotificationKey.LEAGUE_EXPLORE_STAR_INFO_CHANGE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.LEAGUE_EXPLORE_MY_INFO_CHANGE:
                this._endTime = GIns.leagueExploreModel.activityinfo.endTime;
                this.addTimer();
            case NotificationKey.LEAGUE_EXPLORE_STAR_INFO_CHANGE:
                this.updateUI();
                break;
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.listMain.setVirtual();
        this.view.listMain.itemRenderer = this.itemRendererForMain.bind(this);

        this.view.btnIncome.onClick(this.onClickIncome, this);
        this.view.btnMine.onClick(this.onClickMine, this);
        this.view.btnRule.onClick(this.onClickRule, this);
        this.view.btnBack.onClick(this.closeSelf, this);
        this.view.listMain.on(fgui.Event.SCROLL, this.onScroll, this);

        this._maxBgPosY = this.view.bg.bg2.y + this.view.bg.bg2.height - this.view.bg.height
        this.initHeaderItems();

        FguiScriptUtils.toMyScriptClass(this.view.btnIncome.redDot, RedDotCom).reset(RedDotKeys.LeagueExplore_Income);
    }

    protected onPreDispose(): void {
        G.GameTimer.clearAll(this);
    }

    protected initHeaderItems(): void {
        let headerItems: HeaderItem[] = [
            FguiScriptUtils.toMyScriptClass(this.view.headerItem1, HeaderItem),
            FguiScriptUtils.toMyScriptClass(this.view.headerItem2, HeaderItem),
            FguiScriptUtils.toMyScriptClass(this.view.headerItem3, HeaderItem),
            FguiScriptUtils.toMyScriptClass(this.view.headerItem4, HeaderItem),
        ]

        headerItems.forEach((ui, index) => {
            let cfg = G.TableManager.getDataById(table.leagueexplore.LeagueExploreHeaderItemConfig, index + 1);
            if (!cfg) {
                ui.visible = false;
                return;
            }
            ui.visible = true;
            ui.reset(cfg.itemId, cfg.canBuyFlag);
        });
    }

    protected onScroll(): void {
        let posY: number = Math.min(this._maxBgPosY, this.view.listMain.scrollPane.posY);
        this.view.bg.scrollPane.setPosY(posY);
    }

    protected itemRendererForMain(index: number, item: LeagueExploreMainItem): void {
        item.setData(this._dataList[index], this._lockLevelMap.get(this._dataList[index].cfg.id));
    }

    protected onClickIncome(): void {
        G.UIManager.open(UILeagueExploreConfig.LeagueExploreIncomeWin);
    }

    protected onClickMine(): void {
        if (this._myLeagueStarPosYs.length <= 0) {
            GIns.floatingTextMgr.showTips('当前无联盟领地');
            return
        }
        this._curMyIdx++;
        if (this._curMyIdx >= this._myLeagueStarPosYs.length) {
            this._curMyIdx = 0;
        }
        let posY = this._myLeagueStarPosYs[this._curMyIdx];
        this.view.listMain.scrollPane.setPosY(posY, true);
    }

    protected onClickRule(): void {
        RuleController.ins().openRule(EnumRuleKeys.LEAGUE_EXPLORE, this.view.btnRule);
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
        let remainTime = this._endTime - nowTime;
        if (remainTime < 0) {
            this.removeTimer();
            remainTime = 0;
        }
        this.view.lbTime.text = TimeUtils.formatTimeMsToDayHourMinuteSecondText(remainTime) + '后结算';
    }


    protected onTimer2():void {
        this._timerKey2 = null;
        GIns.leagueExploreModel.sendLoadStarList();
        this.checkNextRefreshTime();
    }

    /**检测下一次刷新时间*/
    protected checkNextRefreshTime():void {
        let todayZero = G.TimeManager.todayZero;
        let nowTime:number = G.TimeManager.serverNow
        let nextRefreshTime:number = todayZero + GIns.leagueExploreModel.constCfg.dailySettleHangUpHour * 3600000;
        if (nextRefreshTime <= nowTime) {
            //下一天
            nextRefreshTime += 24 * 3600000;
        }
        if (this._timerKey2) {
            G.GameTimer.clearByKey(this._timerKey2);
            this._timerKey2 = null;
        }
        this._timerKey2 = G.GameTimer.once(nextRefreshTime - nowTime, this, this.onTimer2);
    }

    protected updateUI(): void {
        let levelIds = GIns.leagueExploreModel.showLevelIds;
        this._myLeagueStarPosYs.length = 0;
        this._dataList.length = 0;
        this._lockLevelMap.clear();
        let startY: number = 0;
        for (let i = 0; i < levelIds.length; i++) {
            let levelVo = GIns.leagueExploreModel.getStarLevelVo(levelIds[i]);
            let isLock: boolean = true;
            startY += 150;//标题栏高度
            levelVo.stars?.forEach((starVo) => {
                let isOpen: boolean = GIns.conditionMgr.checkCondition(starVo.cfg.unlockConditions);
                if (isOpen) {
                    isLock = false;
                    if (starVo.vo.selfLeagueOccupyCount > 0) {
                        this._myLeagueStarPosYs.push(startY);
                    }
                }
                startY += 320;//星球高度
            });
            this._lockLevelMap.set(levelVo.cfg.id, isLock);
            this._dataList.push(levelVo);
            if (isLock) {
                //如果未解锁 就不展示后面的了
                break;
            }
        }
        this.view.listMain.numItems = this._dataList.length;
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this.updateUI();
        this.view.listMain.scrollToView(0, false, true);
        GIns.leagueExploreModel.sendLoadStarList();
        this._endTime = GIns.leagueExploreModel.activityinfo.endTime;
        this.addTimer();
        //背景动画
        const modelNode2 = this.view.anim0 as ModelNode;
        modelNode2.loadByModelId(10010046);

        this.checkNextRefreshTime();
    }

    protected onClose(dontDispose?: boolean): void {

    }
}