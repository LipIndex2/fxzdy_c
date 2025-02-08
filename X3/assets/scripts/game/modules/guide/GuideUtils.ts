import { Rect } from "cc";
import FacadeManager from "../../../core/mvc/FacadeManager";
import { UIManager } from "../../../core/mvc/UIManager";
import NotificationKey from "../../event/NotificationKey";
import { CameraAnimUtils } from "../../tiledMap/CameraAnimUtils";
import { MapLayerKey } from "../../tiledMap/MapEnum";
import { MapManager } from "../../tiledMap/MapManager";
import { MapModel } from "../../tiledMap/model/MapModule";
import { TargetDownArrowComponentOpenArgs } from "../../ui/guide/view/TargetDownArrowComponent";
import { CameraAnimBackType, ICameraAnim } from "../common/enum/AnimType";
import * as fgui from "fairygui-cc";
import GIns from "../../GIns";
import { DebugUtils } from "../../../core/utils/DebugUtils";

export class GuideUtils {

    static getItem(viewKey: string, itemName: string) {
        let view = UIManager.ins().getViewInstance(viewKey)?._view;
        if (!view) {
            DebugUtils.isDebugMode() && console.log("获取不到名字为：" + viewKey + "的UI界面");
            return null;
        }

        let itemObj = view as fgui.GComponent;
        let strArray = itemName.split(".");

        for (let i = 0; i < strArray.length; i++) {
            let key = strArray[i];
            let num = parseInt(key);
            if (!isNaN(num)) {
                //数字
                if (itemObj instanceof fgui.GList) {
                    if (num < 0) {
                        //负数为倒序
                        num = itemObj.numItems + num;
                    }
                    let childIndex = itemObj.itemIndexToChildIndex(num);
                    itemObj = (childIndex >= 0 && itemObj.numChildren > childIndex) ? itemObj.getChildAt(childIndex) : null;
                } else {
                    itemObj = null;
                }
            } else {
                itemObj = itemObj.getChild(key);
            }

            if (!itemObj) {
                DebugUtils.isDebugMode() &&  console.log("获取控件：" + itemName + " i =>" + i);
                return null;
            }
        }

        return itemObj;
    }

    /**取控件位置信息 */
    static getUIClickItem(viewKey: string, itemName: string, touchType?: number) {
        let item = this.getItem(viewKey, itemName);
        if (item && touchType) {
            /**点击完成发送事件 */
            item.onceClick(() => {
                FacadeManager.ins().emitNow(NotificationKey.GUIDE_CLICK_BTN, touchType); //先于其他条件完成
            });
        }
        return item;
    }

    /**获取item范围 */
    static getUIRect(item: fgui.GComponent): Rect {
        if (item) {
            let x = 0;
            let y = 0;
            if (item.pivotAsAnchor) {
                x -= item.pivotX * item.width;
                y -= item.pivotY * item.height;
            }

            let rect = item.localToGlobalRect(x, y, item.width, item.height);
            // if (rect.width < item.width * 0.7 || rect.height < item.height * 0.7) {
            //     //动画状态下按钮会大小会出错
            //     rect.x -= (item.width - rect.width) / 2;
            //     rect.y -= (item.height - rect.height) / 2;

            //     rect.width = item.width;
            //     rect.height = item.height;
            // }
            return rect;
        }
        return null
    }


    /** 聚焦
     * @param typeParam @see table.guide.GuideConfig.typeParam
     * @param isMoveCamera 是否移动镜头
     * @param isForceArrow 是否一定有箭头
     */
    static focusPos(typeParam: number[], isMoveCamera: boolean, isForceArrow: boolean = false, endNotification?: string) {
        let isShowGuideLayer = typeParam[0] == 1;
        let isShowArrow = isForceArrow || typeParam[3] == 1;
        let targetMapX = typeParam[1];
        let targetMapY = typeParam[2];
        let arrowOffsetX = typeParam[4] || 0;
        let arrowOffsetY = typeParam[5] || 0;

        let layer = MapManager.ins().getLayerByType(MapLayerKey.GUIDE_LAYER);
        if (layer) layer.node.active = isShowGuideLayer;
        // this.onClickMask();

        //是否显示指引箭头
        if (isShowArrow) {
            // event 指引箭头
            let pos = { x: targetMapX + arrowOffsetX, y: targetMapY + arrowOffsetY }
            FacadeManager.ins().emit(NotificationKey.TASK_GUIDE_TO_TARGET_DOWN_ARROW, {
                mapPosition: pos,
                delaySecond: 1
            } as TargetDownArrowComponentOpenArgs)
        }

        if (isMoveCamera) {
            let animParam: ICameraAnim = {
                targetPos: { x: targetMapX, y: targetMapY }
                , timeMs: 800
                , holdTimeMs: 500
                , backType: CameraAnimBackType.AutoBack
                , onAnimEndNotification: endNotification
            }
            // 镜头移动
            GIns.cameraAnimUtils.cameraMoveAnim(animParam);
        }
    }

    /**刷新引导小怪 */
    static createMonsters(resourceIds: number[]) {
        MapModel.ins().sendLoadMapResources(resourceIds);
    }

}

window["GuideUtils"] = GuideUtils;