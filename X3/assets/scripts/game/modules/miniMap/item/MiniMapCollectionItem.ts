import * as fgui from "fairygui-cc";
import { MiniMapManager } from "../MiniMapManager";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { MiniMapModule } from "../MiniMapModule";
import GIns from "../../../GIns";

/**
 * 小地图
 * 星球收集进度Item
 */
export class MiniMapCollectionItem extends fgui.GComponent {
    static pkgName: string = "miniMap";
    static viewName: string = "MiniMapCollectionItem";

    /** 星球id */
    private _starId: number = 0;
    /** 星球资源限制列表 */
    private _starResourceList: {};
    // /** 进度条最大宽度 */
    private _maxProgress: number = 507;
    // /** 累计进度 */
    private _widthInterval: number = 100;

    private get view(): ui.miniMap.item.MiniMapCollectionItem {
        return this as any;
    }

    protected onConstruct(): void {
        this.onInit();
    }

    public onInit() {
        this.view.list_count2.itemRenderer = this.onRenderCount2.bind(this);
    }

    public setData(starId: number) {
        if (!starId) return;
        this._starId = starId;
        this._starResourceList = MiniMapManager.ins().getStarResourceMap(this._starId);
        this.view.btn_tips.visible = GIns.miniMapMgr.getUnLockAreaCfgs(this._starId).length > 2;
        this.view.btn_tips2.visible = GIns.miniMapMgr.getUnLockAreaCfgs(this._starId).length > 1;
        this.view.btn_tips3.visible = GIns.miniMapMgr.getUnLockAreaCfgs(this._starId).length > 0;
        this.view.btn_tips.x = 693 - this._widthInterval * 2;
        this.view.btn_tips2.x = 693 - this._widthInterval * 1;
        this.view.btn_tips3.x = 693;
        this.updateUI();
    }

    private updateUI() {
        let keys = Object.keys(this._starResourceList);
        this.view.list_count2.numItems = keys.length;
    }

    //星球资源 总数列表
    private onRenderCount2(index: number, item: ui.miniMap.bar.UpperLimitValueBar2) {
        let key = Object.keys(this._starResourceList)[index];
        let data = this._starResourceList[key];

        //图标
        let itemData = ItemUtils.getItemConfigByItemId(Number.parseInt(key.trim()));
        item.img_item.icon = itemData.smallIconPath;

        let mapInfoVo = MiniMapManager.ins().MapInfoVoByStarId(this._starId);
        let value = mapInfoVo?.drawResourceMap[key] || 0;
        //进度
        item.bar1.max = data;
        item.bar1.value = value;

        //进度条长度
        let width = this._widthInterval * GIns.miniMapMgr.getUnLockAreaCfgs(this._starId).length;
        item.bar1.width = this._maxProgress - width;
        if (width > 0) {
            item.img_jdt.width = item.bar1.width + this._widthInterval;
        } else {
            item.img_jdt.width = item.bar1.width + 1;
        }
    }
}
