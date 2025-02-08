import { UITransform } from "cc";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { EnumTouchSide, TouchSideUtils } from "db://assets/scripts/core/utils/TouchSideUtils";
import { EnumItemClickOpenType } from "db://assets/scripts/game/modules/backpack/const/EnumItemClickOpenType";
import { BackpackView } from "db://assets/scripts/game/modules/backpack/view/BackpackView";
import { BackpackItemDataVo } from "db://assets/scripts/game/modules/backpack/vo/BackpackItemDataVo";
import { EnumRedDotShowType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotShowType";
import { RedDotCom } from "db://assets/scripts/game/modules/common/redDot/redDotCom";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { RedDotManager } from "db://assets/scripts/game/modules/common/redDot/RedDotManager";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { ItemI18nKeys } from "db://assets/scripts/game/modules/item/const/ItemI18nKeys";
import { UIItemKeys, UIItemKeys2 } from "db://assets/scripts/game/modules/item/UIItemKeys";
import { ItemRedDotUtils } from "db://assets/scripts/game/modules/item/utils/ItemRedDotUtils";
import {
    BoxItemBaseRewardViewOpenArgs
} from "db://assets/scripts/game/modules/item/view/boxItemBase/BoxItemBaseRewardView";
import {
    BoxItemChooseRewardViewOpenArgs
} from "db://assets/scripts/game/modules/item/view/boxItemChoose/BoxItemChooseRewardView";
import { ItemComeFromViewOpenArgs } from "db://assets/scripts/game/modules/item/view/comeFrom/ItemComeFromView";
import { ItemSmallTipsViewOpenArgs } from "db://assets/scripts/game/modules/item/view/tips/ItemSmallTipsView";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import NotificationKey from "../../../event/NotificationKey";
import { EventClickItem } from "../../item/event/EventClickItem";
import { BoxItemPreviewRewardView } from "../../item/view/boxItemPreview/BoxItemPreviewRewardView";
import ItemSecondsType = ServerEnums.ItemSecondsType;
import GIns from "../../../GIns";

/**
 * 背包物品 icon 组件
 */
export class BackpackItemComp extends fgui.GComponent {

    // 玩家的背包数据
    private _data: BackpackItemDataVo;
    // 道具配置
    private _itemConfig: table.item.ItemConfig | null;

    // 是否选中
    private _chooseFlag: boolean = false
    // 背包视图
    private _backpackView: BackpackView = null
    private _isCareRedDot: boolean = false;
    // 道具二级分类
    private _type2nd: ServerEnums.ItemSecondsType;


    private get view(): ui.backpack.components.BackpackItemComp {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onConstruct(): void {
        // click
        this.view.on(fgui.Event.CLICK, this.onClick0, this);


    }


    public reset(item: BackpackItemDataVo) {
        if (!item) {
            console.error("背包道具丢失");
            return;
        }
        this._data = item;
        const itemId = item.itemId;

        const itemConfig = TableManager.getDataById(table.item.ItemConfig, itemId);
        this._itemConfig = itemConfig;
        if (!this._itemConfig) {
            Logger.error(`没有这个物品配置. itemId = ${this._data.itemId}`)
            return
        }

        const type2nd = ServerEnums.ItemSecondsType[this._itemConfig.secondsType];

        // [红点]
        const redDotCom = FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom);
        
        // dropBox 是一直都有红点
        if (type2nd == ServerEnums.ItemSecondsType.DROP_BOX) {
            // 常驻红点 | 特殊的存在, 不应该监听
            redDotCom.showByType(EnumRedDotShowType.NORMAL);
        } else {
            // 一次性红点
            if (ItemRedDotUtils.isCareRedDot(itemId)) {
                this._isCareRedDot = true;
                // 普通红点
                redDotCom.reset(RedDotKeys.backpackItem, [itemId]);
            } else {
                // 不关心的
                redDotCom.reset(RedDotKeys.Null);
            }
        }

        // 物品配置
        if (itemConfig) {
            // 物品图标
            this.view.itemIcon.icon = itemConfig.iconPath;
        }

        // 品质
        const qualityConfig = TableManager.getDataById(table.quality.QualityConfig, this._itemConfig.quality);
        if (qualityConfig) {
            // 品质背景
            this.view.bg.icon = qualityConfig.itemQualityBgPath
        }

        // 物品数量
        this.view.itemCount.text = "" + item.count;

        // 是否使用中
        if (this._data.useFlag) {
            // in use
            this.view.itemChooseMask.visible = true
            this.view.itemChooseForeground.visible = true
        } else {
            this.view.itemChooseMask.visible = false
            this.view.itemChooseForeground.visible = false
        }
    }


    // region 点击道具的打开方式

    public onClick0(event: fgui.Event) {
        Logger.debug(`点击了背包的物品 id = ${this._data.itemId}`)
        const config = this._itemConfig;
        if (!config) {
            Logger.error(`没有这个物品配置. itemId = ${this._data.itemId}`)
            return
        }
        const itemId = config.id;

        // 红点
        const isCareRedDot = ItemRedDotUtils.isCanMarkReadForever(itemId);
        if (isCareRedDot) {
            // RedDotManager.ins().markRedDotForeverRead(RedDotKeys.backpackItem, [itemId]);
        }

        G.FacadeManager.emit(NotificationKey.CLICK_ITEM, EventClickItem.create(
            event,
            config,
            this.view.node.getComponent(UITransform),
            this._data.count,
            EnumItemClickOpenType.InBag
        ));


        // 道具2级类型
        // const secondsType = ItemSecondsType[config.secondsType];

        // 随机箱子
        // if (secondsType == ItemSecondsType.DROP_BOX
        //     || secondsType == ItemSecondsType.DROP_DISPLAY_RATES_BOX) {

        //     UIManager.ins().open(UIItemKeys.BoxItemBaseRewardView, {
        //         itemConfig: this._itemConfig,
        //     } as BoxItemBaseRewardViewOpenArgs);

        //     return;
        // }
        // else {
        //     switch (config.itemType) {
        //         case ItemType.HERO_CARD:
        //             break
        //         default:
        //             UIManager.ins().open(UIViewItemDetailsKey.ItemDetails, {
        //                 itemConfig: this._itemConfig,
        //             } as ItemTipsViewOpenArgs);
        //             break
        //     }
        // }

        // 点开方式
        // switch (config.clickOpenTypeInBag) {
        //     case EnumItemClickOpenType.SMALL_TIPS: {
        //         this._openItemTips(event);
        //         break;
        //     }
        //     case EnumItemClickOpenType.COME_FROM_PANEL: {
        //         this._openItemComeFromView()
        //         break;
        //     }
        //     case EnumItemClickOpenType.FIXED_BOX_PANEL: {
        //         this.openFixedBoxPanel();
        //         break;
        //     }
        //     case EnumItemClickOpenType.CHOOSE_BOX_PANEL: {
        //         this.openChooseBoxPanel()
        //         break;
        //     }
        //     case EnumItemClickOpenType.PREVIEW_BOX_PANEL: {
        //         this.openPreviewBoxPanel()
        //         break;
        //     }
        //     case EnumItemClickOpenType.NONE: {
        //         break;
        //     }
        //     default: {
        //         // nothing
        //         break;
        //     }
        // }
    }

    /**
     * 打开物品提示框
     * @param event
     * @private
     */
    private _openItemTips(event: fgui.Event) {
        // 详情弹框
        const keyForItemDetails = UIItemKeys2.ItemSmallTipsView;

        // 触摸位置
        const touchLocation = event.pos;
        const touchSideEnum: EnumTouchSide = TouchSideUtils.getTouchSideByUILocation(this._backpackView.getUITransform(), touchLocation);

        Logger.debug(`点击了背包物品 id = ${this._data.itemId}`)

        // toggle choose 
        this._chooseFlag = !this._chooseFlag;

        const itemUITransform = this.view.bg.node.getComponent(UITransform);

        // 弹出面板
        UIManager.ins().open(keyForItemDetails, {
            itemId: this._itemConfig.id || 0,
            touchSideEnum: touchSideEnum,
            itemUITransform: itemUITransform,
        } as ItemSmallTipsViewOpenArgs)
    }


    /**
     * 打开获取方式
     * @private
     */
    private _openItemComeFromView() {

        const itemComeFromConfigArray = TableManager.getAllData(table.item.ItemComeFromConfig)
            .toDataStream()
            .filter(itemComeFromConfig => itemComeFromConfig.itemId === this._itemConfig.id)
            .toArray();
        if (itemComeFromConfigArray.length === 0) {
            // tips
            GIns.floatingTextMgr.showTips(ItemI18nKeys.NO_COME_FROM_TIPS)
            return
        }

        UIManager.ins().open(UIItemKeys.ItemComeFromView, {
            itemConfig: this._itemConfig,
        } as ItemComeFromViewOpenArgs)
    }


    bindBackpackView(view: BackpackView) {
        this._backpackView = view
    }


    // 固定奖励箱子
    private openFixedBoxPanel() {
        const configArray = TableManager.getAllData(table.item.ItemBoxConfig)
            .toDataStream()
            .filter(itemComeFromConfig => itemComeFromConfig.itemId === this._itemConfig.id)
            .toArray();
        if (configArray.length === 0) {
            // tips
            GIns.floatingTextMgr.showTips(ItemI18nKeys.NO_FIXED_REWARD_IN_BOX)
            return
        }

        UIManager.ins().open(UIItemKeys.BoxItemBaseRewardView, {
            itemConfig: this._itemConfig,
        } as BoxItemBaseRewardViewOpenArgs);
    }

    // 选择奖励箱子
    private openChooseBoxPanel() {
        const configArray = TableManager.getAllData(table.item.ItemBoxConfig)
            .toDataStream()
            .filter(itemComeFromConfig => itemComeFromConfig.itemId === this._itemConfig.id)
            .toArray();
        if (configArray.length === 0) {
            // tips
            GIns.floatingTextMgr.showTips(ItemI18nKeys.NO_CHOOSE_REWARD_IN_BOX)
            return
        }

        UIManager.ins().open(UIItemKeys.BoxItemChooseRewardView, {
            itemConfig: this._itemConfig,
        } as BoxItemChooseRewardViewOpenArgs);
    }

    private openPreviewBoxPanel() {
        const configArray = TableManager.getAllData(table.item.ItemBoxConfig)
            .toDataStream()
            .filter(itemComeFromConfig => itemComeFromConfig.itemId === this._itemConfig.id)
            .toArray();
        if (configArray.length === 0) {
            // tips
            GIns.floatingTextMgr.showTips(ItemI18nKeys.NO_PREVIEW_REWARD_IN_BOX)
            return
        }

        // 预览宝箱
        UIManager.ins().open<BoxItemPreviewRewardView>(
            UIItemKeys.BoxItemPreviewRewardView,
            (uiView) => {
                uiView.reset(this._itemConfig)
            })

    }
}