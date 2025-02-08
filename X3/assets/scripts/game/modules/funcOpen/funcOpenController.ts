import { tween } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../core/comm/G";
import UIScriptManager from "../../../core/comm/UIScriptManager";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { UIManager } from "../../../core/mvc/UIManager";
import { UICommWin } from "../../../core/mvc/view/UICommWin";
import { TableManager } from "../../../core/table/TableManager";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import NotificationKey from "../../event/NotificationKey";
import { MapManager } from "../../tiledMap/MapManager";
import { UIMainKey } from "../../ui/main/const/UIMainConfig";
import { ModelNode } from "../common/node/ModelNode";
import { ConditionManager } from "../condition/ConditionManager";
import { ConditionUtils } from "../condition/ConditionUtils";
import { GuideUtils } from "../guide/GuideUtils";
import { PlayerModel } from "../player/model/PlayerModel";
import { Tween } from "cc";
import FacadeManager from "../../../core/mvc/FacadeManager";
import { ViewBlackBgComp } from "../../../core/mvc/view/comp/ViewBlackBgComp";
import { Handler } from "../../../core/utils/Handler";

// /**功能开启 */
// export class FuncOpenController extends BaseController {
//     //已经开启过的功能列表
//     private hasShowList: number[] = [];
//     //弹窗显示队列
//     private _showQueue: Array<table.verify.PlayerSystemOpenConfig> = [];

//     listenNotifications(): string[] {
//         return [
//             NotificationKey.FIGHT_UPDATE_ONE_HERO,
//             NotificationKey.FIGHT_UPDATE_ALL_HERO,
//             NotificationKey.CLOSE_ViEW,

//             // 解锁
//             ...ConditionUtils.getUnlockEventNameArray(),
//         ];
//     }

//     notificationHandler(event: string, args?: any): void {
//         switch (event) {
//             case NotificationKey.FIGHT_UPDATE_ONE_HERO:
//             case NotificationKey.FIGHT_UPDATE_ALL_HERO:

//             case NotificationKey.HERO_UP_LEVEL:
//                 this.checkShowQueue();
//             case NotificationKey.CLOSE_ViEW:
//                 this.showNext();
//             default:
//                 break;
//         }

//         const ok = ConditionUtils.isNeedHandleForUnlock(event);
//         if (ok) {
//             this.checkShowQueue();
//         }
//     }

//     private funcConfigs: table.verify.PlayerSystemOpenConfig[] = [];
//     onInit(): void {
//         //获取服务端的功能开启列表
//         let vo = PlayerModel.ins().Vo.sysOpenMap;

//         this.hasShowList = Object.keys(vo).map((key) => {
//             return Number(key);
//         });

//         let cfgs = TableManager.getAllData(table.verify.PlayerSystemOpenConfig);
//         this.funcConfigs = [];
//         cfgs.forEach((cfg) => {
//             if (cfg.showOpen) {
//                 this.funcConfigs.push(cfg);
//             }
//         });
//     }

//     //加入队列
//     public addShowQueue(cfg: table.verify.PlayerSystemOpenConfig) {
//         //是否在队列中
//         if (this._showQueue.indexOf(cfg) == -1) {
//             this._showQueue.push(cfg);
//         }
//         this.showNext();

//         G.FacadeManager.emit(NotificationKey.SYSTEM_OPEN_FUNCTION);
//     }
//     public checkShowQueue() {
//         let cfgs = this.funcConfigs;
//         cfgs.forEach((cfg) => {
//             let systemId = ServerEnums.SystemType[cfg.id];
//             //是否开放过
//             if (this.hasShowList.indexOf(systemId) == -1) {
//                 let unLock = ConditionManager.ins().checkCondition(cfg.conditions) && cfg.serverOpenDays <= G.TimeManager.serverHaveOpenDay;
//                 if (unLock) {
//                     this.addShowQueue(cfg);
//                 }
//             }
//         });
//     }

//     public showNext() {
//         if (this._showQueue.length == 0 || UIManager.ins().isOpened(UIFuncOpenKey.FUNCOPEN_VIEW) || !MapManager.ins().isInMainCity()) {
//             return;
//         }

//         //只打开主界面
//         if (UIManager.ins().isUiTop(UIMainKey.MAIN_PAGE)) {
//             let cfg = this._showQueue.shift();
//             let systemId = ServerEnums.SystemType[cfg.id];
//             this.hasShowList.push(systemId);
//             PlayerModel.ins().sendUpdateSysOpen(systemId, 1);
//             UIManager.ins().open(UIFuncOpenKey.FUNCOPEN_VIEW, cfg);
//         }
//     }
// }

export enum UIFuncOpenKey {
    FUNCOPEN_VIEW = "FUNCOPEN_VIEW",
}

export class FuncOpenView extends UICommWin {
    static pkgName: string = "funcOpen";

    static viewName: string = "funcOpenView";

    protected _showTime: number = 1.5;
    protected _moveTime: number = 0.5;
    protected _endTime: number = 0.5;

    private _cfg;
    public get view(): ui.funcOpen.funcOpenView {
        return this._view as any;
    }

    constructor () {
        super();
    }

    protected onOpen(arg: table.verify.PlayerSystemOpenConfig): void {

        let blackBgComp = this.getComp(ViewBlackBgComp) as ViewBlackBgComp;
        if (blackBgComp) {
            blackBgComp.clickCallBack = new Handler(this, this.onClickClose)
        }

        this.view.openItem.nameLab.text = arg.showName;
        this.view.openItem.iconLoader.url = arg.icon_path;
        this._cfg = arg;

        let modelNode1 = this.view.modelNode1 as ModelNode;
        modelNode1.loadByPath("spine/ui/gongxihuode/ui_biaotidianzui_tongyong");
        modelNode1.playOrders([
            {
                name: "animation",
                isLoop: true,
            },
        ]);

        let modelNode2 = this.view.openItem.modelNode2 as ModelNode;
        modelNode2.loadByPath("spine/ui/G_gongnengjiesuo/G_gnjiesuo_xunhuan");
        modelNode2.playOrders([
            {
                name: "idle",
                isLoop: true,
            },
        ]);

        let modelNode3 = this.view.openItem.modelNode3 as ModelNode;
        modelNode3.loadByPath("spine/ui/G_gongnengjiesuo/G_gnjiesuo_chuxian");
        modelNode3.playOrders([
            {
                name: "enter",
                isLoop: false,
            },
        ]);
        this.view.getTransition("t0").play();

        let delayTime = this._showTime;
        let entranceConfig = G.TableManager.getDataById(table.verify.ModuleEntranceConfig, arg.id);
        if (entranceConfig && entranceConfig.uiName && entranceConfig.itemPath) {
            let targetObj: fgui.GComponent = GuideUtils.getItem(entranceConfig.uiName, entranceConfig.itemPath);
            if (targetObj) {
                let centerX = targetObj.width * 0.5;
                let centerY = targetObj.height * 0.5;
                if (targetObj.pivotAsAnchor) {
                    centerX -= targetObj.pivotX * targetObj.width;
                    centerY -= targetObj.pivotY * targetObj.height;
                }
                let endPos = targetObj.localToGlobal(centerX, centerY);
                endPos = this.view.openItem.parent.globalToLocal(endPos.x, endPos.y);
                delayTime += this._moveTime + this._endTime;
                tween(this.view.openItem).delay(this._showTime).to(this._moveTime, { x: endPos.x, y: endPos.y }).call(() => {
                    if (this.view?.node?.isValid) {
                        this.closeSelf();
                    }
                }).start();
                tween(this)
                    .delay(this._showTime)
                    .call(() => {
                        if (this.view?.node?.isValid) {
                            this.view.openItem.getTransition("t0").play();
                        }
                    })
                    .delay(this._moveTime)
                    .call(() => {
                        if (this.view?.node?.isValid) {
                            let modelNode3 = this.view.openItem.modelNode3 as ModelNode;
                            modelNode3.loadByPath("spine/ui/G_gongnengjiesuo/G_gnjiesuo_guiweichuxian");
                            modelNode3.playOrders([
                                {
                                    name: "enter",
                                    isLoop: false,
                                },
                            ]);
                        }
                    })
                    .start();
            }
        }
        else {
            tween(this)
                .delay(delayTime)
                .call(() => {
                    if (this.view?.node?.isValid) {
                        this.closeSelf();
                    }
                })
                .start();
        }
    }

    private onClickClose(): void {

    }

    protected onClose(): void {
        Tween.stopAllByTarget(this);
        Tween.stopAllByTarget(this.view?.openItem);
        FacadeManager.ins().emit(NotificationKey.SYSTEM_OPEN_FUNCTION1, this._cfg);
        // FuncOpenController.ins().showNext();
    }
}

UIScriptManager.bindScript(UIFuncOpenKey.FUNCOPEN_VIEW, FuncOpenView);
