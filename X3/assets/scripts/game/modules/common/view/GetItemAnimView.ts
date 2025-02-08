import * as fgui from "fairygui-cc";
import { tween } from "cc";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import NotificationKey from "../../../event/NotificationKey";
import { IconItem } from "../item/IconItem";
import { Tween } from "cc";
import { TableManager } from "../../../../core/table/TableManager";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { MapManager } from "../../../tiledMap/MapManager";
import { ViewAdaptType } from "db://assets/scripts/core/mvc/view/UIView";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { UIMainKey } from "../../../ui/main/const/UIMainConfig";
import FguiUtils from "db://assets/scripts/core/utils/FguiUtils";
import { IMainPageAddItemAniArgs } from "../../../ui/main/components/MainPageAniPoint";
import G from "db://assets/scripts/core/comm/G";

/** 道具获得动画 */
export class GetItemAnimView extends UIWin {
    static pkgName: string = "comm";
    static viewName: string = "GetItemAnimView";

    public _layer = EnumUIViewLayer.TIPS;

    private pos: { x: number; y: number } = { x: 0, y: 0 };

    //普通飘字队列
    private _itemMap: IconItem[] = [];
    // private _index = 0;

    /**适配类型 */
    protected adaptType = ViewAdaptType.TOP;

    private get view(): ui.comm.view.GetItemAnimView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.EVENT_GET_ITEM_ANIM];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.EVENT_GET_ITEM_ANIM:
                // this.playGetItemAnim(args[0], args[1]);
                break;
        }
    }

    protected onInit(): void {
        this.pos.x = this.view.width / 2;
        this.pos.y = this.view.height / 2;
    }

    protected onOpen(args: any): void {
        this.playGetItemAnim(args);
    }

    private playGetItemAnim(param: { items: Vo.reward.RewardResult[], buildingId?: number, isShowItemNumEffect?: boolean }) {
        if (!param.items) {
            return;
        }

        for (let data of param.items) {
            if (data) {
                let cfg = TableManager.getDataById(table.item.ItemGetAnimConfig, data.baseId);
                if (!cfg) break;

                let num = data.amount > cfg.maxCount ? cfg.maxCount : data.amount;
                for (let i = 0; i < num; i++) {
                    // this._index += 1;
                    // let item = this._itemMap[this._index];
                    let iconItem: IconItem = fgui.UIPackage.createObject("comm", "IconItem") as IconItem;
                    this._itemMap.push(iconItem)
                    // if (item) {
                    //     iconItem = item;
                    // } else {
                    //     iconItem = fgui.UIPackage.createObject("comm", "IconItem") as IconItem;
                    //     this._itemMap[this._index] = iconItem;
                    // }
                    this.view.addChild(iconItem);
                    iconItem.alpha = 0;
                    iconItem.x = this.pos.x;
                    iconItem.y = this.pos.y;

                    if (param.buildingId) {
                        let buildingObject = MapManager.ins().getObjectsByIDInBuilding(param.buildingId);
                        if (buildingObject) {
                            let mapPos = MapManager.ins().getMapPos();
                            iconItem.x += buildingObject.x - mapPos.x;
                            iconItem.y += buildingObject.y - mapPos.y;
                        }
                    }

                    iconItem.setIcon(cfg.smallIconPath);

                    let randomX = Math.random() >= 0.5 ? 1 : -1;
                    let randomY = Math.random() >= 0.5 ? 1 : -1;

                    let randomTime = Math.random() * cfg.random;

                    let starPos = { x: iconItem.x + Math.random() * cfg.radius * randomX, y: iconItem.y + Math.random() * cfg.radius * randomY };
                    let endPos = { x: cfg.endPos[0], y: cfg.endPos[1] };
                    let compItem: fgui.GComponent;
                    //有组建用组件的坐标
                    if (cfg.uiKey && cfg.compPaths) {
                        let uiView = UIManager.ins().getUIByKey(cfg.uiKey)
                        if (uiView?._view) {
                            compItem = this.getCompByName(uiView._view, cfg.compPaths.concat())
                            if (compItem) {
                                let p = FguiUtils.changeCoorTo(compItem, this.view);
                                endPos.x = p.x + ((cfg.fixPos && cfg.fixPos[0]) || 0);
                                endPos.y = p.y + ((cfg.fixPos && cfg.fixPos[1]) || 0);

                                if (param.isShowItemNumEffect) {
                                    // let args: IMainPageAddItemAniArgs = {
                                    //     rewards: param.items,
                                    //     fromComp: this.view.item,
                                    //     isMapUI: false
                                    // }
                                    // G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_WITH_MAIN_ANI, args);
                                    if (compItem && cfg.callBegin) {
                                        (compItem[cfg.callBegin] as Function).call(compItem)
                                    }
                                }
                            }
                        }
                    }

                    tween(iconItem)
                        .to(0.2, { alpha: 1 })
                        .to(0.3, { x: starPos.x, y: starPos.y }, { easing: "quadOut" })
                        .delay(randomTime)
                        .to(0.6, { x: endPos.x, y: endPos.y }, { easing: "quadIn" })
                        .to(0.1, { scaleX: 1.3, scaleY: 1.3 }, { easing: "quadOut" })
                        .call(() => {
                            Tween.stopAllByTarget(iconItem);
                            iconItem.dispose();
                            this._itemMap.shift()
                            // delete this._itemMap[this._index];
                            if (compItem && cfg.callback && param.isShowItemNumEffect) {
                                (compItem[cfg.callback] as Function).call(compItem, Math.ceil(data.amount / num), this._itemMap.length == 0);
                            }
                        })
                        .start();
                }
            }
        }
    }

    private getCompByName(view: fgui.GComponent, compPaths: string[]): fgui.GComponent {
        if (!view)
            return null;


        if (compPaths?.length) {
            let newView = view.getChild(compPaths.shift()) as fgui.GComponent
            return this.getCompByName(newView, compPaths)
        }
        else
            return view
    }

    private setPos(buildingId: number) {
        if (!buildingId) {
            this.view.item.x = this.pos.x;
            this.view.item.y = this.pos.y;
            return;
        }

        let buildingObject = MapManager.ins().getObjectsByIDInBuilding(buildingId);
        let mapPos = MapManager.ins().getMapPos();

        this.view.item.x = buildingObject.x - mapPos.x;
        this.view.item.y = buildingObject.y - mapPos.y;
    }
}
