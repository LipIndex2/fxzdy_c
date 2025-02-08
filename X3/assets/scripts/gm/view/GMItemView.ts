import * as fgui from "fairygui-cc";
import { GmModel } from "db://assets/scripts/gm/model/GMModel";
import G from "db://assets/scripts/core/comm/G";
import { GMIconItemView } from "db://assets/scripts/gm/view/GMIconItemView";
import { EnumI18nLanguageType } from "db://assets/scripts/core/i18n/ConstantI18n";
import { ItemModel } from "db://assets/scripts/game/modules/item/model/ItemModel";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import GIns from "../../game/GIns";

/**
 * GM 道具操作 View
 */
export class GMItemView extends fgui.GComponent {

    // 图标大小
    private _bigIconFlag: boolean = true;
    private _filterItemConfigArray: table.item.ItemConfig[] = [];


    // region 静态属性 for FGUI
    static pkgName: string = "gm";

    static viewName: string = "GMItemView";

    // endregion


    private get view(): ui.gm.GMItemView {
        return this as any;
    }

    constructor () {
        super();
    }

    onConstruct() {
        this.onInit()
    }

    public onInit() {

        this.view.gotoFight.title = "去战斗"
        // btn 添加道具
        this.view.buttonAddItem.onClick(this.onClickButtonAddItem, this)
        // btn 且大小
        this.view.btnSwitchItemIconSize.onClick(this.onClickBtnSwitchItemIconSize, this)
        this.view.gotoFight.onClick(this.onClickFight, this)
        this.view.gotoBianQiang.onClick(this.onClickBianQiang, this)

        this.view.inputItemName.on(fgui.Event.TEXT_CHANGE, this.updateItemList, this)
        this.view.inputItemId.on(fgui.Event.TEXT_CHANGE, this.updateItemList, this)


        // gm 类型
        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = this.listRendererForItem.bind(this);


        this.reset();
    }

    private reset() {
        this.view.btnSwitchItemIconSize.title = this._bigIconFlag ? "切小图标" : "切大图标"
        this.updateItemList();
    }

    private onClickFight(): void {
        this.view.parent.getController("innerView").selectedPage = "fight";
    }

    private onClickBianQiang(): void {
        this.view.parent.getController("innerView").selectedPage = "oneClick";
    }

    onClickBtnSwitchItemIconSize() {
        this._bigIconFlag = !this._bigIconFlag

        G.Logger.debug(`GM 道具大小 big = ${this._bigIconFlag}`)
        this.reset()
    }

    updateItemList() {
        const allDataArray = G.TableManager.getAllData(table.item.ItemConfig);
        this._filterItemConfigArray = allDataArray
            .toDataStream()
            .filter(itemConfig => {
                // 过滤输入ID
                const trimInputItemId = this.view.inputItemId.text.trim();
                const itemIdStr = itemConfig.id.toString().trim();
                const inputItemIdFlag = trimInputItemId != "";
                if (inputItemIdFlag && itemIdStr.startsWith(trimInputItemId)) {
                    return true
                }

                // 过滤输入名
                const cnName = G.I18nManager.translate(itemConfig.name, null, EnumI18nLanguageType.CN);
                const trimInputName = this.view.inputItemName.text.trim();
                // 输入了 itemId 则 itemName 为空不走所有匹配
                const catchItemNameFlag = cnName.indexOf(trimInputName) >= 0 && trimInputName != "";
                if (inputItemIdFlag) {
                    return catchItemNameFlag;
                }
                return trimInputName == "" || catchItemNameFlag;
            })
            .toArray()
        this.view.itemList.numItems = this._filterItemConfigArray.length
    }

    private listRendererForItem(index: number, view: GMIconItemView) {

        const itemConfig = this._filterItemConfigArray[index];
        if (!itemConfig) {
            return
        }

        view.updateData(this, itemConfig, this._bigIconFlag)

    }


    private onClickButtonAddItem() {
        console.log("点击添加物品")

        const itemId = Number.parseInt(this.view.inputItemId.text);
        const itemCount = Number.parseInt(this.view.inputItemCount.text);

        // no input 
        if (!itemId || !itemCount) {
            GIns.floatingTextMgr.showTips("GM 请输入物品ID和数量")
            return
        }

        // 扣减清空所有道具
        if (itemId == -999 && itemCount == -999) {
            const itemIdToCountMap = ItemModel.ins().getItemIdToCountMap();
            itemIdToCountMap.forEach((count, itemId) => {
                GmModel.ins().sendGmSendReward({
                    code: itemId,
                    num: -Math.abs(count)
                });
                console.log("GM 扣减物品 end", itemId, count)
            });
            GIns.floatingTextMgr.showTips("GM 一键清空道具成功!")
            return
        }

        console.log("添加物品 start", itemId, itemCount)

        GmModel.ins().sendGmSendReward({
            code: itemId,
            num: itemCount
        })

        if (itemCount > 0) {
            console.log("GM 添加物品 end", itemId, itemCount)
            GIns.floatingTextMgr.showTips("GM 添加物品成功!")
        } else {
            console.log("GM 扣减物品 end", itemId, itemCount)
            GIns.floatingTextMgr.showTips("GM 删减物品成功!")
        }

    }

    setChooseItem(_itemConfig: table.item.ItemConfig) {
        this.view.inputItemId.text = _itemConfig.id.toString()
        // 必须是中文
        this.view.inputItemName.text = G.I18nManager.translate(_itemConfig.name, null, EnumI18nLanguageType.CN)
        this.view.inputItemCount.text = "1"
    }

}