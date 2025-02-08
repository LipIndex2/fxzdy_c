import { UITransform } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import NotificationKey from "../../../event/NotificationKey";
import { EventClickItem } from "../../item/event/EventClickItem";
import { IllustrationsModel } from "../model/IllustrationsModel";
import { IllustrationsIconItem } from "./IllustrationsIconItem";


/** 图鉴奖励item */
export class IllustrationsRewardItem extends fgui.GComponent {
    static pkgName: string = "illustrations";
    static viewName: string = "IllustrationsRewardItem";

    protected _vo: table.illustrations.IllustrationsLevelConfig = null

    private get view(): ui.illustrations.item.IllustrationsRewardItem {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onInit() {
        this.view.listIcon.itemRenderer = this.itemRendererForIcon.bind(this)
        this.view.listIcon.on(fgui.Event.CLICK_ITEM, this.onClickItem, this)
    }

    protected itemRendererForIcon(index: number, item: ui.illustrations.item.IllustrationsIconItem): void {
        //@ts-ignore
        let comp = item as IllustrationsIconItem
        comp.setData(this._vo.rewards[index])
    }

    protected onClickItem(item: IllustrationsIconItem, event: fgui.Event): void {
        //@ts-ignore
        const itemUI = item.itemIcon.node.getComponent(UITransform);

        // event 点击道具
        G.FacadeManager.emit(NotificationKey.CLICK_ITEM, EventClickItem.create(
            event,
            item.itemCfg,
            itemUI,
            item.count,
        ));
    }

    public setData(data: table.illustrations.IllustrationsLevelConfig): void {
        this._vo = data
        this.view.lbScore.text = data.needScore + ''
        this.view.listIcon.numItems = data.rewards.length
        this.view.bgMask.visible = data.id > IllustrationsModel.ins().rewardLv
    }
}