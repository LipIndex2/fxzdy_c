import * as fgui from "fairygui-cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import GIns from "../../../GIns";
import { UIMiniMapKey } from "../const/UIMiniMapConfig";
import { BossAwardItem } from "../item/BossAwardItem";
import { Color } from "cc";
import { Input } from "cc";
import { TouchUtils } from "../../../../core/utils/TouchUtils";
import { TableManager } from "../../../../core/table/TableManager";
import NotificationKey from "../../../event/NotificationKey";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { MapTransConfigManager } from "../../map/config/MapTransConfigManager";
import { MapModel } from "../../../tiledMap/model/MapModule";

/**
 * 小地图boss奖励界面
 */
@bindScript(UIMiniMapKey.MiniMapBossAwardWin)
export class MiniMapBossAwardWin extends UICommWin {
    static pkgName: string = "miniMap";
    static viewName: string = "MiniMapBossAwardWin";

    private get view(): ui.miniMap.MiniMapBossAwardWin {
        return this._view as any;
    }

    //星球id
    private _starId: number;
    //星球cfg
    private _starCfg: table.map.TrunkMapStarConfig;

    private _item: ui.miniMap.item.NameTextItem;

    private _mapId: number;

    private _taskCfgs: table.map.TrunkMapTaskConfig[] = [];

    //星球列表
    private _tabs = [];

    listenNotifications(): string[] {
        return [NotificationKey.MAP_TASK_REWARD];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.MAP_TASK_REWARD:
                this.updateData();
                break;
        }
    }

    protected onInit(): void {
        this.view.list_award.itemRenderer = this.awardItemRenderer.bind(this);
        this.view.selItem.list_star.itemRenderer = this.starItemRenderer.bind(this);
        // 触摸外部
        this.view.on(Input.EventType.TOUCH_END, this.onShowTips, this);
    }

    protected onOpen(): void {
        this._starId = GIns.miniMapMgr.MapStarId;
        this._mapId = GIns.mapMgr.getMapID();

        let allMapStars = MapTransConfigManager.getMapStars();
        let map = MapTransConfigManager.getTransMap();
        allMapStars.forEach((starData) => {
            let transCfgs = map?.get(starData.id);
            if (transCfgs) {
                for (let i = transCfgs.length - 1; i >= 0; i--) {
                    if (MapModel.ins().getBuildingUnlockById(transCfgs[i].building_id)) {
                        //只显示已解锁的星球
                        this._tabs.push(starData);
                        break;
                    }
                }
            }
        });

        this.view.selItem.list_star.numItems = this._tabs.length;
        this.updateData();
    }

    private updateData() {
        this._taskCfgs = GIns.miniMapMgr.MapStarTaskCfgById(this._starId);
        this.view.list_award.numItems = this._taskCfgs.length;
        this._starCfg = TableManager.getDataById(table.map.TrunkMapStarConfig, this._starId);

        this.view.selItem.T_name.text = this._starCfg.name;
    }

    //奖励item
    private awardItemRenderer(index: number, item: BossAwardItem) {
        let cfg = this._taskCfgs[index];
        item.setData(cfg);
    }

    //星球列表item
    private starItemRenderer(index: number, item: ui.miniMap.item.NameTextItem) {
        let cfg = this._tabs[index];
        item.T_name.text = cfg.name;

        if (this._starId == cfg.id) {
            item.T_name.color = new Color("#f5df34");
            this._item = item;
        } else {
            item.T_name.color = new Color("#FFFFFF");
        }

        item.width = item.T_name.width + 10;

        item.clearClick();
        item.onClick(() => {
            this._starId = cfg.id;
            this.updateData();
            this.view.selItem.getController("c1").selectedIndex = 0;
            this._item.T_name.color = new Color("#FFFFFF");
            this._item = item;
            this._item.T_name.color = new Color("#f5df34");
        }, this);

        //红点
        FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.Map_star, [cfg.id]);
    }

    private onShowTips(event: any) {
        const isIn = TouchUtils.isTouchInUi(event, this.view.list_award._uiTrans);
        if (isIn) {
            this.view.selItem.getController("c1").selectedIndex = 0;
        }
    }
}
