import { UITransform } from "cc";
import G from "db://assets/scripts/core/comm/G";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import { DataStream } from "db://assets/scripts/core/utils/DataStream";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { BackpackItemTypeButtonView } from "db://assets/scripts/game/modules/backpack/view/BackpackItemTypeButtonView";
import { BackpackItemComp } from "db://assets/scripts/game/modules/backpack/components/BackpackItemComp";
import { BackpackItemDataVo } from "db://assets/scripts/game/modules/backpack/vo/BackpackItemDataVo";
import { ItemModel } from "db://assets/scripts/game/modules/item/model/ItemModel";
import * as fgui from "fairygui-cc";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { EquipItem } from "../../common/item/EquipItem";
import { equipData, EquipManager } from "../../equip/EquipManager";
import { EquipVo } from "../../equip/vo/EquipVo";
import { WeaponManager } from "../../weapon/WeaponManager";
import { WeaponBagItem } from "../../weapon/item/WeaponBagItem";
import { WeaponVo } from "../../weapon/vo/WeaponVo";
import { ModuleOpenManager } from "../../moduleopen/ModuleOpenManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { UIWeaponConfig, UIWeaponInfoFrom, UIWeaponInfoOpenData } from "../../weapon/const/UIWeaponConfig";
import { Logger } from "../../../../core/log/Logger";
import { RedDotManager } from "db://assets/scripts/game/modules/common/redDot/RedDotManager";
import { EnumRedDotReadType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotReadType";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { UIEquipKey } from "../../equip/const/UIEquipConfig";
import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { UIBackpackKeys } from "db://assets/scripts/game/modules/backpack/const/UIBackpackKeys";

const {GObject} = fgui;

/**
 * 背包
 */
@bindScript(UIBackpackKeys.BACKPACK_VIEW)
export class BackpackView extends UICommWin {
    // 当前选择的过滤类型
    private _filterItemTypeArray: Array<string> = [];
    // 过滤后的 items
    private _filterItemVoArray: BackpackItemDataVo[] = [];

    // 所有道具类型
    static readonly ALL_ITEM_TYPE_ARRAY: string[] = [];

    static pkgName: string = "backpack";

    static viewName: string = "BackpackView";

    protected curShowCfgs: table.bag.BagConfig[] = [];

    private get view(): ui.backpack.BackpackView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.EVENT_CHANGE_ITEMS, NotificationKey.WEAPON_ITEM_CHANGE];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_CHANGE_ITEMS:
            case NotificationKey.WEAPON_ITEM_CHANGE: {
                // 重置面板
                this.resetView();
                return;
            }
        }
    }

    public onInit(): void {
        G.Logger.debug(" onInit ");

        // 打开背包就算已读
        RedDotManager.ins().markRead(EnumRedDotReadType.LOGIN_ONCE, RedDotKeys.backpack);

        // bg mask
        // FGUIMaskUtils.createBackgroundMask(this.view)

        // 道具列表
        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = this.irItem.bind(this);

        // 装备列表
        this.view.equipList.itemRenderer = this.equipItem.bind(this);
        this.view.btn_recycle.on(fgui.Event.CLICK, this.OpenEquipRecycle, this);

        // 专武列表
        this.view.weaponList.setVirtual();
        this.view.weaponList.itemRenderer = this.weaponItem.bind(this);
        this.view.weaponList.on(fgui.Event.CLICK_ITEM, this.onClickWeapon, this);

        // 道具类型 tab
        this.view.itemTypeList.setVirtual();
        this.view.itemTypeList.itemRenderer = this.itemTypeListRenderer.bind(this);
    }

    protected checkBagTabShowState(bagConfigs: table.bag.BagConfig[],
                                   systemType: ServerEnums.SystemType,
                                   typeName: string
    ): boolean {
        if (ModuleOpenManager.ins().isCanOpenModule(systemType, false) == false) {
            //功能未开启需要屏蔽
            let index = bagConfigs.findIndex((value) => value.typeNumberArray[0] == typeName);
            if (index != -1) {
                bagConfigs.splice(index, 1);
            }
            return false;
        }
        return true;
    }

    public onOpen(): void {
        G.Logger.debug(" onOpen ");
        G.Logger.debug(" saf ");

        // 触摸外部
        // this.view.onClick(this.onClick0, this);

        // 道具列表
        this.filterItemType(BackpackView.ALL_ITEM_TYPE_ARRAY);

        // 背包类型 tab
        this.curShowCfgs = TableManager.getAllData(table.bag.BagConfig).concat();

        this.checkBagTabShowState(this.curShowCfgs, ServerEnums.SystemType.AWAKE_WEAPON, "AWAKE_WEAPON");

        this.renderBackpackItemTypeScrollView(this.curShowCfgs);
    }

    public get viewPageController(): fgui.Controller {
        return this.view.getController("c1");
    }

    private renderBackpackItemTypeScrollView(bagConfigs: table.bag.BagConfig[]) {
        this.view.itemTypeList.numItems = bagConfigs.length;
    }

    /**
     * 渲染背包物品列表
     * @param filterItemVoArray 需要渲染的背包数据
     * @private
     */
    private renderBackpackItemScrollView(filterItemVoArray: BackpackItemDataVo[]) {
        this._filterItemVoArray = filterItemVoArray;

        this.view.itemList.numItems = filterItemVoArray.length;
    }

    private _equipVos: EquipVo[];

    /**
     * 渲染装备列表  （临时处理）
     */
    private equipList() {
        if (!this._equipVos) {
            this._equipVos = EquipManager.ins().getAllEquip;
            this._equipVos.sort((a: EquipVo, b: EquipVo) => {
                if (a.planId != b.planId) {
                    return b.planId - a.planId;
                }
                if (a.equipCfg.quality != b.equipCfg.quality) {
                    return b.equipCfg.quality - a.equipCfg.quality;
                }
                if (a.equipCfg.equipLevel != b.equipCfg.equipLevel) {
                    return b.equipCfg.equipLevel - a.equipCfg.equipLevel;
                }
                if (a.id != b.id) {
                    return a.id - b.id;
                }
                return b.id - a.id;
            });
        }
        this.view.equipList.numItems = this._equipVos.length;
    }

    private equipItem(index: number, item: EquipItem) {
        let equipVo = this._equipVos[index];
        let data: equipData = {
            id: equipVo.posId,
            isUnlock: true,
            equipId: this._equipVos[index].severId,
        };
        item.setData(data);

        item.isShowGou(equipVo.planId > 0);
    }

    private _weaponVos: WeaponVo[];

    private weaponList() {
        this._weaponVos = WeaponManager.ins().getBagWeapons();
        this.view.weaponList.numItems = this._weaponVos.length;
    }

    protected weaponItem(index: number, item: WeaponBagItem) {
        let data = this._weaponVos[index];
        item.setData(data);
    }

    protected onClickWeapon(item: WeaponBagItem) {
        let openData: UIWeaponInfoOpenData = {data: item.weaponVo, from: UIWeaponInfoFrom.Bag};
        G.UIManager.open(UIWeaponConfig.WEAPON_INFO_VIEW, openData);
        item.makeReadRedDot()
    }

    public onClose(): void {
        this.view.offClick(this.onClick0, this);

        G.Logger.debug(" onClose ");
    }

    private onClick0(event: fgui.Event) {
        G.Logger.debug(event, " onTouchEnd ");

        // 点击空白处退出背包面板
        // let uiPos = event.getUILocation(v2(0, 0));
        const uiPos = event.pos;
        let boundingBox = this.view.background._uiTrans.getBoundingBoxToWorld();
        let isIn = boundingBox.contains(uiPos);
        if (isIn) {
            return;
        }
        this.closeSelf();
    }

    private irItem(index: number, backpackItem: BackpackItemComp) {
        backpackItem.bindBackpackView(this);

        // 获取道具
        const item = this._filterItemVoArray[index];
        backpackItem.reset(item);
    }

    /**
     * 物品类型
     * @private
     */
    private itemTypeListRenderer(index: number, backpackItemTypeButton: BackpackItemTypeButtonView) {
        backpackItemTypeButton.bindBackpackView(this);

        // 更新数据
        backpackItemTypeButton.updateData(index, this.curShowCfgs[index]);

        // 默认选择全部
        if (index == 0) {
            backpackItemTypeButton.setChooseState(true);
        }
    }

    updateItemTypeChoose(chooseIndex: number) {
        // 遍历所有
        this.view.itemTypeList._children.forEach((item, index) => {
            const button = item as BackpackItemTypeButtonView;
            if (chooseIndex == index) {
                button.setChooseState(true);
            } else {
                button.setChooseState(false);
            }
        });
    }

    getUITransform(): UITransform {
        return this.view.node.getComponent(UITransform);
    }

    filterItemType(typeNumberArray: Array<string>) {
        this._filterItemTypeArray = typeNumberArray;

        this.resetView();
    }

    private resetView() {
        // 背包中的道具
        const itemArray = ItemModel.ins().backpackContext.itemArray;

        //装备 (临时处理)
        if (this._filterItemTypeArray && this._filterItemTypeArray[0] == "EQUIP") {
            this.view.itemList.visible = false;
            this.view.weaponList.visible = false;
            this.view.equipList.visible = true;
            this.view.btn_recycle.visible = true;
            this.equipList();
            return;
        }

        //武器 (临时处理)
        if (this._filterItemTypeArray && this._filterItemTypeArray[0] == "AWAKE_WEAPON") {
            this.view.itemList.visible = false;
            this.view.weaponList.visible = true;
            this.view.equipList.visible = false;
            this.view.btn_recycle.visible = false;
            this.weaponList();
            return;
        }

        this.view.weaponList.visible = false;
        this.view.equipList.visible = false;
        this.view.btn_recycle.visible = false;
        this.view.itemList.visible = true;

        // 所有道具类型
        const isNeedAllItemType = this._filterItemTypeArray.length == 0;

        // 过滤类型后的数据
        const filterItemConfigArray = DataStream.from(itemArray)
            .filter((it) => {
                const itemConfig = G.TableManager.getDataById(table.item.ItemConfig, it.itemId);
                if (itemConfig == null) {
                    return false;
                }
                // 不在背包中显示
                if (!itemConfig.showBackpackFlag) {
                    return false;
                }
                // 是否含有这个类型
                return isNeedAllItemType || ArrayUtils.contains(this._filterItemTypeArray, itemConfig.type);
            })
            .flatMap((it) => {
                const itemConfig = G.TableManager.getDataById(table.item.ItemConfig, it.itemId);
                const maxStackCount = itemConfig.stackLimit;

                if (maxStackCount <= 0) {
                    Logger.error(`道具${itemConfig?.id}未配置堆叠上限`);
                    return [it];
                }

                // 没有超过最大堆叠数量
                if (it.count <= maxStackCount) {
                    return [it];
                }

                // 超过最大堆叠数量，分割
                const haveCount = it.count;
                const array: BackpackItemDataVo[] = [];

                // 计算堆叠
                const maxStackId = Math.ceil(haveCount / maxStackCount);
                for (let stackId = 0; stackId < maxStackId; stackId++) {
                    const newFakeBackpackDataVo = BackpackItemDataVo.createNewOne();
                    newFakeBackpackDataVo.itemId = it.itemId;
                    newFakeBackpackDataVo.count = Math.max(0, Math.min(maxStackCount, haveCount - stackId * maxStackCount));
                    newFakeBackpackDataVo.useFlag = it.useFlag;
                    newFakeBackpackDataVo.stackId = stackId;

                    array.push(newFakeBackpackDataVo);
                }

                return array;
            })
            .filter((it) => {
                // 过滤掉没有数量的
                return it.count > 0;
            })
            .sortByComparator((it1, it2) => {
                // 排序规则 = 物品类型>物品状态>物品品质>物品id
                const itemConfig1 = G.TableManager.getDataById(table.item.ItemConfig, it1.itemId);
                const itemConfig2 = G.TableManager.getDataById(table.item.ItemConfig, it2.itemId);

                if (itemConfig1 == null || itemConfig2 == null) {
                    return 0;
                }
                // 物品类型越小越靠前
                if (itemConfig1.type < itemConfig2.type) {
                    return -1;
                }
                if (it1.useFlag > it2.useFlag) {
                    return -1;
                }
                if (itemConfig1.quality > itemConfig2.quality) {
                    return -1;
                }

                if (itemConfig1.sortId > itemConfig2.sortId) {
                    return -1;
                }
                return 0;
            })
            .toArray();

        // 渲染
        this.renderBackpackItemScrollView(filterItemConfigArray);
    }

    private OpenEquipRecycle() {
        G.UIManager.open(UIEquipKey.EquipRecycleWin);
    }
}
