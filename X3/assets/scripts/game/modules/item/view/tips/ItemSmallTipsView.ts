import G from "db://assets/scripts/core/comm/G";
import { EventTouch, Input, UITransform, v3 } from "cc";
import * as fgui from "fairygui-cc";
import { EnumTouchSide } from "db://assets/scripts/core/utils/TouchSideUtils";
import { UIView } from "db://assets/scripts/core/mvc/view/UIView";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import UIScriptManager from "../../../../../core/comm/UIScriptManager";
import { UIItemKeys2 } from "../../UIItemKeys";
import { NodeUtils } from "db://assets/scripts/core/utils/NodeUtils";
import { ItemUtils } from "../../utils/ItemUtils";


const {GObject} = fgui;

/**
 * 道具的小弹窗
 * - 因一开始是只在背包中做, 后面复用到了通用道具
 */
export enum BackPackItemDetailViewSideEnum {
    NULL = 0,
    LEFT_TOP = 1,
    RIGHT_TOP = 2,
    LEFT_BOTTOM = 3,
    RIGHT_BOTTOM = 4,
}

/**
 * 打开 UI args
 */
export class ItemSmallTipsViewOpenArgs {
    // 道具配置 id
    itemId: number;
    // 触摸方位
    touchSideEnum: EnumTouchSide;
    // 点击的道具自身的 UI 大小
    itemUITransform: UITransform;

    static create(itemId: number,
                  touchSideEnum: EnumTouchSide,
                  itemUITransform: UITransform
    ): ItemSmallTipsViewOpenArgs {
        const args = new ItemSmallTipsViewOpenArgs();
        args.itemId = itemId;
        args.touchSideEnum = touchSideEnum;
        args.itemUITransform = itemUITransform;
        return args;
    }
}


/**
 * 背包道具详情
 */
export class ItemSmallTipsView extends UIView {

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
    public onOpen(args: ItemSmallTipsViewOpenArgs): void {
        // 触摸任意位置
        this.view.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);

        G.Logger.debug(" onOpen ")

        const itemId = args.itemId;
        if (itemId == null) {
            G.Logger.error("ItemSmallTipsView onOpen args.itemId is null")
            return
        }

        const itemConfig = G.TableManager.getDataById(table.item.ItemConfig, itemId)
        if (!itemConfig) {
            G.Logger.error(`ItemSmallTipsView onOpen 没找到配置 itemId = ${itemId}`)
            return;
        }
        this.showFlag = true

        const touchSideEnum1 = args.touchSideEnum;

        G.Logger.debug(`点击了背包物品 id = ${itemId} 位置方向 = ${touchSideEnum1}`)
        this.updateViewWhenChoose(itemConfig, args.itemUITransform, touchSideEnum1)
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
    updateViewWhenChoose(config: table.item.ItemConfig,
                         itemUITransform: UITransform,
                         touchSideEnum: EnumTouchSide
    ): void {
        if (NodeUtils.isNotValidNode(itemUITransform?.node)) {
            return;
        }

        const itemWidth = itemUITransform.width;
        const itemHeight = itemUITransform.height;

        const offsetItemCenterX = itemWidth * Math.max(0, (1 - itemUITransform.anchorX));
        const offsetItemCenterY = itemHeight * Math.max(0, (1 - itemUITransform.anchorY));

        const itemWorldPos = itemUITransform.node.worldPosition;

        G.Logger.debug(touchSideEnum, "触摸方向")

        // 默认左边
        const fguiSideController = this.view.tips.getController("side");
        // 默认没有箭头
        fguiSideController.selectedIndex = BackPackItemDetailViewSideEnum.NULL;

        // 左上角的位置
        const worldPosForLeftTop = v3(itemWorldPos.x, itemWorldPos.y, 0);
        this.view.tips.node.setWorldPosition(worldPosForLeftTop);

        this.view.tips.labelTitle.color = ItemUtils.getTextColor(config.quality)
        this.view.tips.labelTitle.text = G.I18nManager.translate(config.name)
        this.view.tips.labelDescription.text = G.I18nManager.translate(config.desc)
        this.view.tips.labelComeFrom.text = G.I18nManager.translate(config.comeFromText)


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

UIScriptManager.bindScript(UIItemKeys2.ItemSmallTipsView, ItemSmallTipsView);