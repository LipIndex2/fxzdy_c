import { _decorator } from "cc";
import G from "db://assets/scripts/core/comm/G";
import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import { ItemOneGetWayView } from "db://assets/scripts/game/modules/item/view/comeFrom/ItemOneGetWayView";
import { ItemComeFromIconView } from "db://assets/scripts/game/modules/item/view/comeFrom/ItemComeFromIconView";
import { UIGainKeys } from "db://assets/scripts/game/modules/gain/const/UIGainKeys";
import { GainItemPopUpViewOpenArgs } from "db://assets/scripts/game/modules/gain/view/GainItemPopUpView";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { UIItemKeys, UIItemKeys2 } from "db://assets/scripts/game/modules/item/UIItemKeys";
import { ItemSmallTipsViewOpenArgs } from "db://assets/scripts/game/modules/item/view/tips/ItemSmallTipsView";
import { TableManager } from "../../../core/table/TableManager";
import { ItemComeFromViewOpenArgs } from "./view/comeFrom/ItemComeFromView";
import { EventClickItem } from "db://assets/scripts/game/modules/item/event/EventClickItem";
import { EnumItemClickOpenType } from "db://assets/scripts/game/modules/backpack/const/EnumItemClickOpenType";
import { EnumTouchSide, TouchSideUtils } from "db://assets/scripts/core/utils/TouchSideUtils";
import { BoxItemPreviewRewardView, BoxItemPreviewRewardViewOpenArgs } from "db://assets/scripts/game/modules/item/view/boxItemPreview/BoxItemPreviewRewardView";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { ItemSyntheticWinOpenArgs } from "db://assets/scripts/game/modules/item/view/synthetic/ItemSyntheticWin";
import { EnumClientItemType } from "../backpack/EnumClientItemType";
import { UIManager } from "../../../core/mvc/UIManager";
import { BoxItemBaseRewardViewOpenArgs } from "./view/boxItemBase/BoxItemBaseRewardView";
import { UIViewItemDetailsKey } from "../itemDetails/UIViewItemDetailsKey";
import { ItemTipsViewItem, ItemTipsViewOpenArgs } from "../itemDetails/ItemTipsView";
import { HeroItemTipsViewOpenArgs } from "../itemDetails/HeroItemTipsView";
import { WeaponAttrPanel } from "../weapon/panel/WeaponAttrPanel";
import { WeaponAttrItem } from "../weapon/item/WeaponAttrItem";
import { EquipAttrItem } from "../equip/item/EquipAttrItem";
import { EquipTipsViewOpenArgs } from "../itemDetails/EquipTipsView";
import { EquipManager } from "../equip/EquipManager";
import { ItemNotEnoughViewOpenArgs } from "../itemDetails/ItemNotEnoughView";
import { EquipTipsAttrComp } from "../itemDetails/EquipTipsAttrComp";
import { BoxTipsRewardViewOpenArgs } from "../itemDetails/BoxTipsRewardView";
import { BoxItemChooseRewardViewOpenArgs } from "db://assets/scripts/game/modules/item/view/boxItemChoose/BoxItemChooseRewardView";
import { ItemFrameItem } from "../itemDetails/ItemFrameTipsView";
import { ItemUtils } from "./utils/ItemUtils";
import { WeaponSkillListItem } from "../weapon/item/WeaponSkillListItem";
import { UICollectionsKey } from "../collections/const/UICollectionsConfig";

const { ccclass, property } = _decorator;

/**
 * 道具
 */
export class ItemController extends BaseController {
    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_GAIN_ITEM_POP_UP,
            NotificationKey.EVENT_GAIN_ITEM_POP_UP_WITH_PARAM,
            NotificationKey.EVENT_ITEM_CLICK_OPEN_SMALL_TIPS,
            NotificationKey.EVENT_ITEM_GET_WAY_POP_UP,
            NotificationKey.EVENT_ITEM_GET_WAY_POP_UP_2,
            NotificationKey.CLICK_ITEM,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            // 恭喜获得物品
            case NotificationKey.EVENT_GAIN_ITEM_POP_UP: {
                const items = args as NoOwnerItem[];
                if (items == null || items.length === 0) {
                    return;
                }
                // 显示获得物品弹窗
                G.UIManager.open(UIGainKeys.GainItemPopUpView, GainItemPopUpViewOpenArgs.create(items));
                return;
            }
            // 恭喜获得物品 附带参数
            case NotificationKey.EVENT_GAIN_ITEM_POP_UP_WITH_PARAM: {
                const items = args.items as NoOwnerItem[];
                if (items == null || items.length === 0) {
                    return;
                }
                // 显示获得物品弹窗
                G.UIManager.open(UIGainKeys.GainItemPopUpView, GainItemPopUpViewOpenArgs.create(items, args.param));
                return;
            }
            // 物品点击小弹窗
            case NotificationKey.EVENT_ITEM_CLICK_OPEN_SMALL_TIPS: {
                const openArgs = args as ItemSmallTipsViewOpenArgs;
                // 显示获得物品弹窗
                G.UIManager.open(UIItemKeys2.ItemSmallTipsView, openArgs);
                return;
            }
            case NotificationKey.EVENT_ITEM_GET_WAY_POP_UP: {
                const itemId = args as number;
                // 显示物品产出来源
                let cfg = TableManager.getDataById(table.item.ItemConfig, itemId);
                if (!cfg) {
                    return;
                }
                G.UIManager.open(UIItemKeys.ItemComeFromView, { itemConfig: cfg } as ItemComeFromViewOpenArgs);
                return;
            }
            case NotificationKey.EVENT_ITEM_GET_WAY_POP_UP_2: {
                const itemId = args[0] as number;
                const count = args[1] as number;
                // 显示物品产出来源
                let cfg = TableManager.getDataById(table.item.ItemConfig, itemId);
                if (!cfg) return;
                G.UIManager.open(UIViewItemDetailsKey.ItemNotEnoughView, {
                    itemConfig: cfg,
                    count: count,
                } as ItemNotEnoughViewOpenArgs);
                return;
            }
            case NotificationKey.CLICK_ITEM: {
                this.handleItemClick(args as EventClickItem);
                return;
            }
        }
    }

    onInit(): void {
        // 通用道具 icon

        // 物品来源
        G.FGUIManager.bindScript("ui://item/ItemComeFromIconView", ItemComeFromIconView);
        G.FGUIManager.bindScript("ui://item/ItemOneGetWayView", ItemOneGetWayView);
        G.FGUIManager.bindScript("ui://itemDetails/ItemTipsViewItem", ItemTipsViewItem);
        G.FGUIManager.bindScript("ui://itemDetails/WeaponTipsAttrPanel", WeaponAttrPanel);
        G.FGUIManager.bindScript("ui://itemDetails/WeaponTipsAttrItem", WeaponAttrItem);
        G.FGUIManager.bindScript("ui://itemDetails/WeaponTipsSkillItem", WeaponSkillListItem);
        G.FGUIManager.bindScript("ui://itemDetails/EquipAttrItem", EquipAttrItem);
        G.FGUIManager.bindScript("ui://itemDetails/EquipAttrPage", EquipTipsAttrComp);
        G.FGUIManager.bindScript("ui://itemDetails/ItemNotEnoughViewItem", ItemTipsViewItem);
        G.FGUIManager.bindScript("ui://itemDetails/ItemFrameItem", ItemFrameItem);
        // 固定奖励箱子
    }

    @LogBusiness("[点击道具] 处理点击效果 ")
    private handleItemClick(args1: EventClickItem) {
        const itemConfig = args1.itemConfig;
        const itemId = itemConfig.id;

        if (args1.showType === EnumItemClickOpenType.InBag) {
            //在背包使用
            switch (itemConfig.itemType) {
                case EnumClientItemType.HANG_UP_AUTO_BOX:
                case EnumClientItemType.RANDOM_BOX:
                case EnumClientItemType.BOX: {
                    UIManager.ins().open(UIItemKeys.BoxItemBaseRewardView, {
                        itemConfig: itemConfig,
                    } as BoxItemBaseRewardViewOpenArgs);
                    break;
                }

                case EnumClientItemType.CHOOSE_BOX: {
                    UIManager.ins().open(UIItemKeys.BoxItemChooseRewardView, {
                        itemConfig: itemConfig,
                    } as BoxItemChooseRewardViewOpenArgs);
                    break;
                }

                case EnumClientItemType.COMPOSE_FRAGMENT: {
                    UIManager.ins().open(UIItemKeys.ItemSyntheticWin, {
                        itemId: itemId,
                    } as ItemSyntheticWinOpenArgs);
                    break;
                }
                default:
                    this.showNormalTips(itemConfig, args1);
                    break;
            }
            return;
        }

        //显示
        switch (args1.showType) {
            case EnumItemClickOpenType.Normal_TIPS: {
                this.showNormalTips(itemConfig, args1);
                break;
            }
            case EnumItemClickOpenType.SMALL_TIPS: {
                this._openItemTips(args1);
                break;
            }
            case EnumItemClickOpenType.COME_FROM_PANEL: {
                G.UIManager.open(UIItemKeys.ItemComeFromView, {
                    itemConfig: itemConfig,
                } as ItemComeFromViewOpenArgs);
                break;
            }
            case EnumItemClickOpenType.NONE: {
                break;
            }
        }

        // 点击打开方式
        // switch (itemConfig.clickOpenType) {
        //     case EnumItemClickOpenType.SMALL_TIPS: {
        //         this._openItemTips(args1);
        //         break;
        //     }
        //     case EnumItemClickOpenType.COME_FROM_PANEL: {
        //         G.UIManager.open(UIItemKeys.ItemComeFromView, {
        //             itemConfig: itemConfig,
        //         } as ItemComeFromViewOpenArgs)
        //         break;
        //     }
        //     case EnumItemClickOpenType.PREVIEW_BOX_PANEL: {
        //         this.openPreviewBoxPanel(args1)
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

    private showNormalTips(itemConfig: table.item.ItemConfig, clickItem?: EventClickItem): void {
        switch (itemConfig.itemType) {
            case EnumClientItemType.HERO_CARD: {
                UIManager.ins().open(UIViewItemDetailsKey.HeroCardDetails, {
                    itemConfig: itemConfig,
                } as HeroItemTipsViewOpenArgs);
                break;
            }
            case EnumClientItemType.EQUIP: {
                let equipInfo = EquipManager.ins().getEquipVoById(clickItem.count);
                UIManager.ins().open(UIViewItemDetailsKey.EquipTipsView, {
                    itemConfig: itemConfig,
                    equipVo: equipInfo,
                } as EquipTipsViewOpenArgs);
                break;
            }
            case EnumClientItemType.AWAKE_WEAPON: {
                UIManager.ins().open(UIViewItemDetailsKey.WeaponTipsView, {
                    itemConfig: itemConfig,
                } as HeroItemTipsViewOpenArgs);
                break;
            }
            case EnumClientItemType.HANG_UP_AUTO_BOX:
            case EnumClientItemType.RANDOM_BOX:
            case EnumClientItemType.CHOOSE_BOX:
            case EnumClientItemType.BOX: {
                UIManager.ins().open(UIViewItemDetailsKey.BoxTipsRewardView, {
                    itemConfig: itemConfig,
                } as BoxTipsRewardViewOpenArgs);
                break;
            }
            case EnumClientItemType.PET_CARD:
                UIManager.ins().open(UIViewItemDetailsKey.PetTipsView, {
                    itemConfig: itemConfig,
                } as ItemTipsViewOpenArgs);
                break;
            case EnumClientItemType.HERO_SKIN:
                UIManager.ins().open(UIViewItemDetailsKey.SkinTipsView, {
                    itemConfig: itemConfig,
                } as ItemTipsViewOpenArgs);
                break;
            case EnumClientItemType.COLLECTIBLES_CARD:
                let param: XJ.collections.ICollectionsInfoViewParam = {
                    collectionId: itemConfig.id,
                };
                G.UIManager.open(UICollectionsKey.COLLECTION_INFO, param);
                break;
            default:
                //助战值
                if (ItemUtils.isTeamValue(itemConfig.id)) {
                    UIManager.ins().open(UIViewItemDetailsKey.ItemFrameTipsView, {
                        itemConfig: itemConfig,
                    } as ItemTipsViewOpenArgs);
                    return;
                }

                UIManager.ins().open(UIViewItemDetailsKey.ItemDetails, {
                    itemConfig: itemConfig,
                } as ItemTipsViewOpenArgs);
                break;
        }
    }

    /**
     * 打开物品提示框
     * @private
     * @param args1 点击
     */
    private _openItemTips(args1: EventClickItem) {
        const clickPos = args1.event.pos;
        const itemUITransform = args1.itemUITransform;
        const itemConfig = args1.itemConfig;

        // 触摸位置
        const touchSideEnum: EnumTouchSide = TouchSideUtils.getTouchSideByPosInCanvas(clickPos);

        G.Logger.debug(`点击了物品 id = ${itemConfig.id}`);

        // TODO 弹出面板
        G.UIManager.open(UIItemKeys2.ItemSmallTipsView, {
            itemId: itemConfig.id,
            touchSideEnum: touchSideEnum,
            itemUITransform: itemUITransform,
        } as ItemSmallTipsViewOpenArgs);
    }

    private openPreviewBoxPanel(itemConfig: table.item.ItemConfig) {
        G.UIManager.open<BoxItemPreviewRewardView>(UIItemKeys.BoxItemPreviewRewardView, {
            itemConfig: itemConfig,
            count: 1,
        } as BoxItemPreviewRewardViewOpenArgs);
    }
}

ItemController.ins().doInit();
