import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { TableManager } from "../../../../core/table/TableManager";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import { IMapBossKillData } from "../../../tiledMap/model/vo/IMapBossKillData";
import { IAdPlayVo } from "../../ad/model/vo/IAdPlayVo";
import { ModelNode } from "../../common/node/ModelNode";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { UIMapKey } from "../const/UIMapConfig";
import { QualityUtils } from "../../common/quality/QualityUtils";

@bindScript(UIMapKey.MAP_BOSS_FIRST_KILL)
export class MapBossFirstKill extends UIWin {
    static pkgName: string = "map";
    static viewName: string = "MapBoosFirstKill";

    private _cfg: table.map.MapMonsterConfig;
    protected _resourceId: number = 0;
    protected _args: Map<number, IMapBossKillData> = null;
    private get view(): ui.map.view.MapBoosFirstKill {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return null;
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
        }
    }

    protected onInit(): void {
        this.view.img_bg.on(fgui.Event.CLICK, this.onClickBg, this);
        this.view.btnPlay.onClick(this.onClickPlay, this);
        this.view.btnDraw.onClick(this.closeSelf, this);
    }

    protected onClickPlay(): void {
        let args: IAdPlayVo = {
            type: ServerEnums.AdvertType.TRUNK_MAP_BOSS_EXTRA_REWARD,
            extra: this._resourceId,
        };
        this.emit(NotificationKey.AD_START_PLAY, args);
    }

    protected onClickBg(): void {
        if (this.view.gAd.visible) {
            return;
        }
        this.closeSelf();
    }

    protected onOpen(args: any): void {
        this._args = args;
        this.view.getTransition("t0").play();

        let modelNode = this.view.title.modelNode as ModelNode;
        modelNode.loadByPath("spine/ui/BOSS_shousha/UI_BOSSshousha_upper");
        modelNode.playOrders([
            {
                name: "enter",
                isLoop: false,
            },
            {
                name: "idle",
                isLoop: true,
            },
        ]);

        if (!args) return;
        this._args?.forEach((value, id) => {
            if (id) {
                this._cfg = TableManager.getDataById(table.map.MapMonsterConfig, id);
                this._resourceId = value.resourceId;
            }
        });
        this.updateUI();

        //非首个boss才有升级奖励
        let hasAdReward: boolean = false;
        let resourceCfg = G.TableManager.getDataById(table.map.MapResourceConfig, this._resourceId);
        if (resourceCfg) {
            let monsterCfg = G.TableManager.getDataById(table.map.MapMonsterConfig, resourceCfg.mapMonsterId);
            if (monsterCfg) {
                hasAdReward = monsterCfg.advertRewards != null;
            }
        }
        this.view.gAd.visible = hasAdReward;
    }

    private updateUI() {
        let self = this.view.title;
        let itemStr = this._cfg.bossRewards.split(";");
        let id = itemStr[0].split(":")[0];
        let num = itemStr[0].split(":")[1];

        let item = ItemUtils.getItemConfigByItemId(Number.parseInt(id.trim()));

        self.img_item.icon = item.iconPath;
        self.T_bossName.text = this._cfg.name;

        let color = ItemUtils.getTextColorText(item.quality);
        //直接使用item.name富文本不能转换 i18 ，所以只能先转换，在使用这富文本中
        self.T_itemName.text = item.name;
        self.T_itemNum.text = StringUtils.formatStr("获得$1个[color=$3]$2[/color]", num, self.T_itemName.text, color);

        this.view.title.img_bg.icon = QualityUtils.getQualityConfigById(item.quality).firstKillItemBG;
    }
}
