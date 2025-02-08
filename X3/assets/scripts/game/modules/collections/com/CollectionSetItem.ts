import { Color } from "cc";
import { QualityUtils } from "db://assets/scripts/game/modules/common/quality/QualityUtils";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { HeroUtils } from "../../hero/utils/HeroUtils";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { quality2DiCol } from "../const/UICollectionsConfig";

export enum CType {
    compound = 1,   //合成收藏品
    has = 2,        //拥有收藏品
    noHave,    //未拥有收藏品
}

@bindFguiExtension("ui://collectibles/CollectionSetItem")
export class CollectionSetItem extends fgui.GComponent {
    static pkgName: string = "collectibles";
    static viewName: string = "CollectionSetItem";

    private _qualityCtrl: fgui.Controller;
    private _CTypeCtrl: fgui.Controller;

    private _star: number;
    private _collectionCfgId;

    private get view(): ui.collectibles.ui.cmp.item.CollectionSetItem {
        return this as any;
    }

    get collectionCfgId() {
        return this._collectionCfgId;
    }

    listenNotifications(): string[] | null {
        return [
            NotificationKey.COLLECTIONS_ACTIVE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.COLLECTIONS_ACTIVE: {
                if (this._collectionCfgId == args) {
                    this.updateView();
                }
                break;
            }
        }
    }

    protected onInit() {
        let view = this.view;
        view.list_star1.itemRenderer = this.itemRendererForStar.bind(this);
        this._qualityCtrl = this.getController("quality");
        this._CTypeCtrl = this.getController("CType");

        view.bar.titleType = fgui.ProgressTitleType.ValueAndMax;
    }

    protected itemRendererForStar(index: number, item: ui.comm.item.StarIconItem) {
        item.starIcon.icon = ItemUtils.getStarIcon(this._star);
    }

    setData(collectionCfgId: number) {
        this._collectionCfgId = collectionCfgId;
        this.updateView();
        let red = this.view.redDot as unknown as RedDotCom;
        red.reset(RedDotKeys.Collections_item, [collectionCfgId]);
    }

    public updateView() {
        let view = this.view;
        let collectionCfgId = this._collectionCfgId;
        let cfg = G.TableManager.getDataById(table.collectibles.CollectiblesConfig, collectionCfgId);
        this._qualityCtrl.selectedIndex = quality2DiCol[cfg.quality];

        let context = GIns.collectionsModel.context;
        let collection = context.getCollectionById(collectionCfgId);

        view.lbLV.text = collection ? `+${collection.level}` : "";

        this._star = collection ? collection.star : 0;
        view.list_star1.numItems = HeroUtils.getShowStarCount(this._star);

        view.bar.max = cfg.activeCostFragment;
        view.bar.value = GIns.backpackMgr.getItemCountByItemId(cfg.fragmentItemId);
        let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, cfg.fragmentItemId);
        view.itemIcon.icon = itemCfg.iconPath;

        let ctype: CType
        let iconColor: Readonly<Color> = Color.GRAY;
        if (context.isHaveCollection(collectionCfgId)) {
            ctype = CType.has;
            iconColor = Color.WHITE;
        } else if (context.isCanCompound(collectionCfgId)) {
            ctype = CType.compound;
        } else {
            ctype = CType.noHave;
        }
        this._CTypeCtrl.selectedIndex = ctype;

        let collItemCfg = G.TableManager.getDataById(table.item.ItemConfig, collectionCfgId);
        view.lbName.text = collItemCfg.name;
        view.lbName.color = QualityUtils.getQualityColor(cfg.quality);
        view.itemIcon.icon = collItemCfg.bigIconPath;
        view.itemIcon.color = iconColor;
    }
}