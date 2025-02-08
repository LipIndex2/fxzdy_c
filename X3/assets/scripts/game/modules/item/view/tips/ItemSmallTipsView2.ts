import * as fgui from "fairygui-cc";
import { v3 } from "cc";
import { EnumTouchSide } from "../../../../../core/utils/TouchSideUtils";
import { BackPackItemDetailViewSideEnum } from "./ItemSmallTipsView";
import G from "../../../../../core/comm/G";
import { UITransform } from "cc";
import { UIView } from "../../../../../core/mvc/view/UIView";
import { LogBusiness } from "../../../../../core/log/LogBusiness";
import { Input } from "cc";
import { EventTouch } from "cc";
import { UIBindingKey } from "../../../../../core/mvc/ui/UIBindingKey";
import UIScriptManager from "../../../../../core/comm/UIScriptManager";
import { UIItemKeys, UIItemKeys2 } from "../../UIItemKeys";

/**
 * 打开 UI args
 */
export class ItemSmallTipsViewOpenArgs2 {
    /** 描述 */ 
    desc: string;
    /**  触摸方位*/
    touchSideEnum: EnumTouchSide;
    /** 点击的道具自身的 UI 大小*/
    itemUITransform: UITransform;
    
    static create(desc: string, touchSideEnum: EnumTouchSide, itemUITransform: UITransform): ItemSmallTipsViewOpenArgs2 {
        const args = new ItemSmallTipsViewOpenArgs2();
        args.desc = desc;
        args.touchSideEnum = touchSideEnum;
        args.itemUITransform = itemUITransform;
        return args;
    }
}

/**
 * 背包道具详情2
 * 自定义描述
 */
export class ItemSmallTipsView2 extends UIView {

    showFlag: boolean = false

    static pkgName: string = "item";

    static viewName: string = "ItemSmallTipsView";


    private get view(): ui.item.ItemSmallTipsView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return null;
    }

    notificationHandler(eventName: string, args?: any): void {

    }

    public onInit(): void {
        G.Logger.debug(" onInit ");

    }

    @LogBusiness("[道具] 小提示框打开")
    public onOpen(args: ItemSmallTipsViewOpenArgs2): void {
        // 触摸任意位置
        this.view.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        
        G.Logger.debug(" onOpen ")

        const descs = args.desc;

        this.showFlag = true

        const touchSideEnum1 = args.touchSideEnum;

        G.Logger.debug(`点击了物品  位置方向 = ${touchSideEnum1}`)
        this.updateViewWhenChoose(descs, args.itemUITransform, touchSideEnum1)
    }

    public onClose(): void {
        G.Logger.debug(" onClose ")

        this.showFlag = false

    }


    private onTouchEnd(event: EventTouch) {
        G.Logger.debug(event, " ItemSmallTipsView onTouchEnd ")

        // 点击就关闭
        this.closeSelf()
    }


    // ExcelTableName, content key="途径:xxxx" , languageKey = "CN"
    updateViewWhenChoose(descs: string,
                         itemUITransform: UITransform,
                         touchSideEnum: EnumTouchSide
    ): void {

        const itemWidth = itemUITransform.width;
        const itemHeight = itemUITransform.height;

        const offsetItemCenterX = itemWidth * Math.max(0, (1 - itemUITransform.anchorX));
        const offsetItemCenterY = itemHeight* Math.max(0, (1 - itemUITransform.anchorY));
        
        const itemWorldPos = itemUITransform.node.worldPosition;

        G.Logger.debug(touchSideEnum, "触摸方向")

        // 默认左边
        const fguiSideController = this.view.tips.getController("side");
        // 默认没有箭头
        fguiSideController.selectedIndex = BackPackItemDetailViewSideEnum.NULL;

        // 左上角的位置
        const worldPosForLeftTop = v3(itemWorldPos.x, itemWorldPos.y, 0);
        this.view.tips.node.setWorldPosition(worldPosForLeftTop);

        let descArr = descs.split(";");
        this.view.tips.labelTitle.text = descArr[0] || "";
        this.view.tips.labelDescription.text = descArr[1] || "";
        this.view.tips.labelComeFrom.text = descArr[2] || "";


        // 几个箭头的位置 | 需求删减了
        const posForLeftTop = this.view.tips.iconTipsArrowLeftTop.node.position;
        // const posForRightTop = this.view.tips.iconTipsArrowRightTop.node.position;
        const posForLeftBottom = this.view.tips.iconTipsArrowLeftBottom.node.position;

        // 上下反转用 | 需求删减了
        // const offsetForX = posForRightTop.x - posForLeftTop.x;
        const offsetForY = posForLeftTop.y - posForLeftBottom.y;
        
        // 世界坐标参差

        // // 点击上下左右不同位置打开方式有所区别 | 有点麻烦后面再写
        switch (touchSideEnum) {
            case EnumTouchSide.NULL:
            case EnumTouchSide.LEFT_BOTTOM:
            case EnumTouchSide.LEFT_TOP: {
                fguiSideController.selectedIndex = BackPackItemDetailViewSideEnum.LEFT_BOTTOM;

                const vec3 = this.view.tips.iconTipsArrowLeftTop.node.worldPosition.clone();
                const diffVec3 = vec3.subtract(itemWorldPos)
                    .add3f(0, -offsetItemCenterY - offsetForY, 0);

                const finalVec3 = worldPosForLeftTop.subtract(diffVec3);
                this.view.tips.node.setWorldPosition(finalVec3);
                return
            }
            case EnumTouchSide.RIGHT_BOTTOM:
            case EnumTouchSide.RIGHT_TOP: {
                fguiSideController.selectedIndex = BackPackItemDetailViewSideEnum.RIGHT_BOTTOM;

                const vec3 = this.view.tips.iconTipsArrowRightTop.node.worldPosition.clone();
                const diffVec3 = vec3.subtract(itemWorldPos)
                    .add3f(0, -offsetItemCenterY - offsetForY, 0);


                const finalVec3 = worldPosForLeftTop.subtract(diffVec3);
                this.view.tips.node.setWorldPosition(finalVec3);
                return
            }
        }
    }
} 
UIScriptManager.bindScript(UIItemKeys2.ItemSmallTipsView2, ItemSmallTipsView2);