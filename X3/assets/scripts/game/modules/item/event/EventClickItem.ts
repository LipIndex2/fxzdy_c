import { UITransform } from "cc";
import * as fgui from "fairygui-cc";
import { EnumItemClickOpenType } from "../../backpack/const/EnumItemClickOpenType";

export class EventClickItem {

    // 点击 event
    event: fgui.Event;
    // 道具配置
    itemConfig: table.item.ItemConfig;
    // 道具 UI
    itemUITransform: UITransform;
    // 道具数量
    count: number;
    //显示类型
    showType: EnumItemClickOpenType


    constructor (event: fgui.Event, itemConfig: table.item.ItemConfig,
        itemUITransform: UITransform,
        count: number = 0,
        showType: EnumItemClickOpenType = EnumItemClickOpenType.Normal_TIPS
    ) {
        this.event = event;
        this.itemConfig = itemConfig;
        this.itemUITransform = itemUITransform;
        this.count = count;
        this.showType = showType;
    }

    static create(event: fgui.Event,
        itemConfig: table.item.ItemConfig,
        itemUITransform: UITransform,
        count: number = 0,
        showType: EnumItemClickOpenType = EnumItemClickOpenType.Normal_TIPS
    ): EventClickItem {
        if (event == null || itemConfig == null || itemUITransform == null) {
            return null;
        }
        return new EventClickItem(event, itemConfig, itemUITransform, count, showType);
    }
}