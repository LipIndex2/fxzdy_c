import { UIView } from "../../core/mvc/view/UIView";
import G from "db://assets/scripts/core/comm/G";
import { EventTouch, Input, native, Node, sys, v2 } from "cc";
import * as fgui from "fairygui-cc";
import { FGUIMaskUtils } from "db://assets/scripts/game/ui/common/mask/FGUIMaskUtils";
import { ButtonGmTypeView } from "db://assets/scripts/gm/view/ButtonGmTypeView";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { PlayerModel } from "db://assets/scripts/game/modules/player/model/PlayerModel";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { DateUtils } from "db://assets/scripts/core/utils/DateUtils";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import { WeekDay } from "db://assets/scripts/core/time/WeekDay";
import { UIGmKeys } from "../const/UIGmKeys";
import UIScriptManager from "../../core/comm/UIScriptManager";
import { AccountModel } from "db://assets/scripts/game/modules/account/model/AccountModel";
import GIns from "../../game/GIns";
import { ClipboardUtils } from "../../core/utils/ClipboardUtils";
import { UICommWin } from "../../core/mvc/view/UICommWin";


const { GObject } = fgui;

/**
 * GM Tab 类型
 */
export enum EnumFGUIControllerInnerView {

    // 没有
    NONE = 0,
    // 道具
    ITEM = 1,
    // 一键按钮
    ONE_KEY_BUTTON = 2,
    // 图片资源检查
    ASSET_CHECKER = 3,
    // 图片资源检查
    SPINE_CHECKER = 4,
    // email GM
    EMAIL = 5,
    SERVER_TIME = 6,
    GM_TASK = 7,
    FIGHT = 8,
    MAP = 9,
}

/**
 * GM 界面
 */
export class GMView extends UICommWin {

    private _chooseTabIndex: number = 0

    // GM tab 类型 | 对应 GMView 的 FGUI Controller "innerView" index
    private readonly _gmTabArray = new Array<string>(
        "GM",
        "一键按钮",
        "服务器时间修改",
        "FGUI图片资源检查",
        "Spine检查器",
        "邮件GM",
        "Task",
        "获取英雄属性",
        "抽到新英雄",
        "引导",
        "关卡GM",
        "战斗",
        "传送地图",
        "竞技场",
        "主线任务",
        "解锁建筑",
        "道具批发",
        "一键变强",
    );

    static pkgName: string = "gm";

    static viewName: string = "GMView";
    private _playerId: number;

    private get view(): ui.gm.GMView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return null;
    }

    notificationHandler(eventName: string, args?: any): void {
        // switch(eventName){
        // }

    }

    public get viewPageController(): fgui.Controller {
        return this.view.getController("innerView");
    }

    public onInit(): void {
        G.Logger.debug(" onInit ")

        // 触摸外部
        this.view.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);

        const openTimeMs = TimeManager.openServerTime;
        this.view.labelServerOpenTime.text = `开服时间 = ${DateUtils.dateTimeFormat(openTimeMs)} | ${WeekDay.getWeekDayByTimeMs(openTimeMs)}`;

        this.view.labelPlayerId.node.on(Node.EventType.TOUCH_START, () => {
            const playerIdStr = this._playerId.toString();

            GIns.floatingTextMgr.showTips(`复制成功. playerId = ${this._playerId}`);

            ClipboardUtils.copy(playerIdStr);
        }, this);
    }

    public onOpen(): void {
        G.Logger.debug(" onOpen ")
        // let aaa = {}
        // aaa["b"]["c"] = 2
        // bg mask
        // FGUIMaskUtils.createBackgroundMask(this.view)

        // gm 类型
        this.view.gmTypeList.setVirtual();
        this.view.gmTypeList.itemRenderer = this.listRendererForGmType.bind(this);
        this.updateGmType();

        this.view.getController("innerView").selectedIndex = EnumFGUIControllerInnerView.ITEM;

        // server time tick
        this.updateServerTime();

        // playerId
        this._playerId = PlayerModel.ins().Vo.id;
        this.view.labelPlayerId
            .setVar("playerId", this._playerId.toString())
            .flushVars()
        const serverId = sys.localStorage.getItem('defaultServerId') as number;

        const serverIdStr = AccountModel.ins().serverId;
        this.view.labelServerId
            .setVar("serverId", serverIdStr + ` | 开服天数 = ${TimeManager.serverHaveOpenDay}`)
            .flushVars()

        GameTimer.ins().frameLoop(60, this, this.updateServerTime)
    }


    private updateServerTime() {
        this.view.labelServerTime.text = G.TimeManager.getServerTimeString() + " | " + G.TimeManager.getServerTimeWeekday()
    }

    public onClose(): void {
        GameTimer.ins().clear(this, this.updateServerTime)

        G.Logger.debug(" onClose ")
    }


    private onTouchEnd(event: EventTouch) {
        G.Logger.debug(event, " onTouchEnd ")

        // 点击空白处退出背包面板
        let uiPos = event.getUILocation(v2(0, 0));
        let boundingBox = this.view.background._uiTrans.getBoundingBoxToWorld();
        let isIn = boundingBox.contains(uiPos);
        if (isIn) {
            return
        }

        let boundingBox2 = this.view.labelPlayerId._uiTrans.getBoundingBoxToWorld();
        let isIn2 = boundingBox2.contains(uiPos);
        if (isIn2) {
            return
        }

        this.closeSelf()
    }

    /**
     * 物品类型
     * @private
     */
    private listRendererForGmType(index: number, view: ButtonGmTypeView) {
        view.bindGmView(this, index)
        view.onRenderCallback(this._gmTabArray[index])
        view.bindClickCallback(() => {
            // 0 = none
            const controllerIndex = index + 1;
            // GM 类型切换
            const maxControllerIndex = this._gmTabArray.length;
            if (controllerIndex > maxControllerIndex) {
                G.Logger.warn("GM Tab 页的 Controller FGUI 缺少配置, 超出最大范围了! 请检查!")
                this.view.getController("innerView").selectedIndex = EnumFGUIControllerInnerView.NONE;
                return;
            }
            this.view.getController("innerView").selectedIndex = controllerIndex;

            this.refreshTabChoose()
        });

        this.refreshTabChoose()
    }

    updateChooseTabIndex(index: number) {
        this._chooseTabIndex = index
        this.refreshTabChoose()
    }

    private updateGmType() {
        this.view.gmTypeList.numItems = this._gmTabArray.length
    }

    public refreshTabChoose() {
        this.view.gmTypeList._children.forEach((obj: fgui.GObject,
            index: number
        ) => {
            const view = obj as ButtonGmTypeView
            if (index == this._chooseTabIndex) {
                view.setChoose(true)
            } else {
                view.setChoose(false)
            }
        })
    }
}

UIScriptManager.bindScript(UIGmKeys.GMView, GMView);