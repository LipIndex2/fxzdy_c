import * as fgui from "fairygui-cc";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UIMapKey } from "../const/UIMapConfig";
import { MapManager } from "../../../tiledMap/MapManager";
import { UICommonKey } from "../../common/const/UICommonConfig";
import { MapModel } from "../../../tiledMap/model/MapModule";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";

@bindFguiExtension("ui://map/TransferList_item")
export class TransferListItem extends fgui.GComponent {
    static pkgName: string = "map";
    static viewName: string = "TransferList_item";

    private _cfg: table.map.TeleportlistConfig;

    private _isUnlock;

    private _isSameBuilding: boolean;
    private _curBuildingId: number;

    private get view(): ui.map.item.TransferList_item {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onConstruct(): void {
        this.onInit();
    }

    public onInit() {
        this.view.on(fgui.Event.CLICK, this.onItemClick, this);
    }

    public setData(data: table.map.TeleportlistConfig, buildingId: number) {
        this._curBuildingId = buildingId;
        this._cfg = data;
        let self = this.view;

        //先不做，等后端做好条件校准之后再放开
        this._isUnlock = MapModel.ins().getBuildingUnlockById(this._cfg.building_id);

        this._isSameBuilding = buildingId == this._cfg.building_id;

        if (this._isSameBuilding) {
            //当前所在
            self.getController("c1").selectedIndex = 2;
        } else if (this._isUnlock) {
            self.getController("c1").selectedIndex = 1;
        } else {
            self.getController("c1").selectedIndex = 0;
        }

        self.bg.icon = this._cfg.place_portrait;
        self.img_icon.icon = this._cfg.BOSS_portrait;

        self.T_name.text = this._cfg.place_name;
        self.T_num.text = StringUtils.getFightStr(this._cfg.atk);

    }

    private onItemClick() {
        if (this._isSameBuilding || !this._isUnlock) return;

        UIManager.ins().open(UICommonKey.TransferAnimWin, { curBuildingId: this._curBuildingId, transferBuildingId: this._cfg.building_id });
        if (this._cfg.taskTeleport) MapManager.ins().targetTeleportId = this._cfg.id;
        //FacadeManager.ins().emit(NotificationKey.MAP_AREA_TRANSFER_START, {portalID:this._cfg.building_id} as ITransfer);
        //FacadeManager.ins().emit(NotificationKey.MAP_AREA_TRANSFER_START, {portalID:this._cfg.building_id} as ITransfer);
        console.log(this._cfg.building_id);
        UIManager.ins().close(UIMapKey.MAP_TRANSFER_POPUP);
    }
}