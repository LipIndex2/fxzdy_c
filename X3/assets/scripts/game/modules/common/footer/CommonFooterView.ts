import G from "db://assets/scripts/core/comm/G";
import * as fgui from "fairygui-cc";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { EnumTabSideType } from "db://assets/scripts/game/ui/main/const/EnumTabSideType";
import { ModuleOpenManager } from "db://assets/scripts/game/modules/moduleopen/ModuleOpenManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { UIMainKey } from "db://assets/scripts/game/ui/main/const/UIMainConfig";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { ConditionManager } from "db://assets/scripts/game/modules/condition/ConditionManager";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { MainPageManager } from "db://assets/scripts/game/ui/main/MainPageManager";
import { ConditionUtils } from "db://assets/scripts/game/modules/condition/ConditionUtils";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../redDot/redDotCom";
import { RedDotKeys } from "../redDot/RedDotKeys";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import SystemType = ServerEnums.SystemType;


const {GObject} = fgui;

/**
 * 打开的 tabItem
 */
export enum EnumOpenFootTabItem {
    None = 0,
    HERO = 1,
    DRAW_CARD = 2,
    GAME_MODE = 3,
    LEAGUE = 4,
}

/**
 * footer 左侧类型
 */
export enum EnumFooterLeftSideType {
    BACK = 0,
    HANG_UP = 1,
}

/**
 * footer
 */
export class CommonFooterView extends fgui.GComponent implements INotification {

    //培养按钮
    private heroBtn: ui.comm.footer.btn.PageBtn;
    // tab 项目
    private _tabItemConfigs: table.mainpage.MainPageTabItemConfig[];
    // 左下角
    private _configForBig: table.mainpage.MainPageTabItemConfig;

    // 选中的 tab
    private _chooseTabItem: EnumOpenFootTabItem;
    // tab 页
    private _tabNum: EnumOpenFootTabItem;


    public get view(): ui.comm.footer.CommonFooterView {
        return this as any;
    }

    listenNotifications(): string[] {
        return [
            // 解锁 tabItem 用
            ...ConditionUtils.getUnlockEventNameArray(),
            // 主线关卡 + 
            NotificationKey.HANG_UP_MAX_PASS_LEVEL_ID_CHANGE,
            NotificationKey.HERO_UP_LEVEL,
            
            // 红点
            NotificationKey.RED_DOT_CHANGE,

            //更新红点 hero
            NotificationKey.HERO_UP_STAR,
            NotificationKey.HERO_UP_STAGE,

            // hang up
            NotificationKey.HANG_UP_EXIT_MAIN_VIEW,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            //更新红点
            case NotificationKey.HERO_UP_LEVEL:
            case NotificationKey.HERO_UP_STAR:
            case NotificationKey.HERO_UP_STAGE:
                // this.updataHeroRedPoint();
                break;
        }

        const ok = ConditionUtils.isNeedHandleForUnlock(event)
        if (ok) {
            this.refreshUnlockState();
        }

    }

    public onInit(): void {
        this.getController("footerType").selectedIndex = 0;

        // event
        G.FacadeManager.registerNotification(this);

        // 更多-红点
        const redDotCom = RedDotUtils.castComp(this.view.moreBtn.redDot);
        redDotCom.listenRedDotByPathArray([
            RedDotKeys.email,
            RedDotKeys.Shop_enter,
            RedDotKeys.dailyTask,
            RedDotKeys.backpack,
            RedDotKeys.Friend,
        ]);

        // 更多
        this.view.moreBtn.onClick(this.openUIView, this);

        this.view.pageList.setVirtual();
        this.view.pageList.itemRenderer = this.irPageItem.bind(this);


        this._configForBig = G.TableManager.getAllData(table.mainpage.MainPageTabItemConfig)
            .toDataStream()
            .filter(it => it.sideType == EnumTabSideType.BOTTOM_BIG)
            .first(null)
        // tab item 配置
        this._tabItemConfigs = G.TableManager.getAllData(table.mainpage.MainPageTabItemConfig)
            .toDataStream()
            .filter(it => it.sideType == EnumTabSideType.BOTTOM)
            .toArray()
        this.view.pageList.numItems = 4;


        // 重置
        this.reset()


    }


    protected onPreDispose() {
        // cancel
        G.FacadeManager.removeNotification(this);

        GameTimer.ins().clearAll(this)

        super.onPreDispose();
    }


    /**
     * 左侧部分
     * @param type
     */
    resetFooterLeftSideType(type: EnumFooterLeftSideType): CommonFooterView {
        this.getController("footerType").selectedIndex = type;
        return this;
    }


    /**
     * 显示解锁状态
     */
    refreshUnlockState() {
        let okCount = 0;
        let isChange = false;
        for (let i = 0; i < this._tabItemConfigs.length; i++) {
            const config = this._tabItemConfigs[i];
            const isCanOpen = ConditionManager.ins().checkCondition(config.conditionText);
            const btn = this.view.pageList.getChildAt(i) as ui.comm.footer.btn.PageBtn;

            if (isCanOpen) {
                okCount++
                //判断功能解锁
                if (config.systemId) {
                    let id = ServerEnums.SystemType[config.systemId];
                    let unLock = ModuleOpenManager.ins().isCanOpenModule(id, false);
                    //显示锁
                    btn.lock.visible = !unLock;
                } else {
                    btn.lock.visible = false;
                }
            }
            btn.visible = isCanOpen;

            if (!isChange) {
                isChange = isCanOpen;
            }
        }

        const configForBig = this._configForBig;
        if (configForBig) {
            const isCanOpen = ConditionManager.ins().checkCondition(configForBig.conditionText);
            if (isCanOpen) {
                okCount++

            }
        }

        this.view.visible = okCount > 0;

        if (isChange) {
            this.view.pageList.refreshVirtualList();
        }
    }

    /**
     * 重置选项
     * @param chooseTabItem
     */
    reset(chooseTabItem: EnumOpenFootTabItem = EnumOpenFootTabItem.None): CommonFooterView {
        this._chooseTabItem = chooseTabItem;

        // 解锁状态
        this.refreshUnlockState();

        if (chooseTabItem == EnumOpenFootTabItem.None) {
            return;
        } else {
            const btnIndex = chooseTabItem - 1;
            const btn = this.view.pageList.getChildAt(btnIndex) as ui.comm.footer.btn.PageBtn;
            btn.touchable = false;

            // down
            btn.getController("button").selectedIndex = 1;

        }
        return this;
    }

    private openUIView() {
        G.UIManager.open(UIMainKey.MAIN_MORE_VIEW);
    }

    private irPageItem(index: number, item: ui.comm.footer.btn.PageBtn) {
        // item.onClick(() => {
        //     this.onItemClick(index);
        // }, this);

        const config = this._tabItemConfigs[index];
        item.title = config.showName;
        item.name = config.nameForClient;
        item.iconNormal.icon = config.iconNormalAssetPath;
        item.iconPress.icon = config.iconPressAssetPath;

        const tabNum = index + 1;
        this._tabNum = tabNum;
        const redDotCom = FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom);
        switch (tabNum) {
            case EnumOpenFootTabItem.HERO: {
                this.heroBtn = item;
                if (ModuleOpenManager.ins().isCanOpenModuleWithoutTips(SystemType.HERO)) {
                    redDotCom.listenRedDotByPathArray([
                        RedDotKeys.Hero_enter,
                        RedDotKeys.Equip_enter,
                        RedDotKeys.talent,
                        RedDotKeys.captainSkill,
                        RedDotKeys.Pet_enter,
                        RedDotKeys.Collections_enter,
                    ]);
                } else {
                    redDotCom.listenRedDotByPathArray([]);
                }
                break;
            }
            case EnumOpenFootTabItem.DRAW_CARD: {
                if (ModuleOpenManager.ins().isCanOpenModuleWithoutTips(SystemType.RECRUIT)) {
                    redDotCom.reset(RedDotKeys.drawCard);
                } else {
                    redDotCom.reset(RedDotKeys.Null);
                }
                break;

            }
            case EnumOpenFootTabItem.GAME_MODE: {
                redDotCom.listenRedDotByPathArray([
                    RedDotKeys.dailyBoss,
                    RedDotKeys.jjc,
                    RedDotKeys.Secret_enter,
                    RedDotKeys.Ladder_enter,
                    RedDotKeys.CollectiblesDungeon,
                ]);
                break;
            }
            case EnumOpenFootTabItem.LEAGUE: {
                redDotCom.reset(RedDotKeys.League);
                break;
            }

        }
    }

    private onItemClick(index: number) {
        const config = this._tabItemConfigs[index];
        if (!config) {
            return;
        }

        const nameForClient = config.nameForClient;
        MainPageManager.ins().clickTabItemByName(config)

    }

    // //更新培养红点
    // public updataHeroRedPoint() {
    //     this.heroBtn.redPoint.visible = HeroManager.ins().getRedPoint();
    // }


}