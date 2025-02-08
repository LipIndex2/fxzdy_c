import { Color } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import FGUINotificationComponent from "../../../../core/fgui/com/FGUINotificationComponent";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { QualityUtils } from "../../common/quality/QualityUtils";
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

export enum CType2 {
    normal = 0,     //普通收藏品
    timeLimit = 1,  //限时收藏品
}

@bindFguiExtension("ui://collectibles/CollectionItem")
export class CollectionItem extends FGUINotificationComponent {
    static pkgName: string = "collectibles";
    static viewName: string = "CollectionItem";

    private _qualityCtrl: fgui.Controller;
    private _CTypeCtrl: fgui.Controller;
    private _CType2Ctrl: fgui.Controller;

    private _collectionCfgId: number;
    private _star: number;

    private get view(): ui.collectibles.ui.cmp.item.CollectionItem {
        return this as any;
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
        // this.view.onClick(this.onClickCollection, this);
        view.list_star1.itemRenderer = this.itemRendererForStar.bind(this);
        this._qualityCtrl = this.getController("quality");
        this._CTypeCtrl = this.getController("CType");
        this._CType2Ctrl = this.getController("CType2");

        view.bar.titleType = fgui.ProgressTitleType.ValueAndMax;

    }

    protected itemRendererForStar(index: number, item: ui.comm.item.StarIconItem) {
        item.starIcon.icon = ItemUtils.getStarIcon(this._star);
    }

    public setData(collectionCfgId: number) {
        this._collectionCfgId = collectionCfgId;
        this.updateView();
        let red = this.view.redDot as unknown as RedDotCom;
        red.reset(RedDotKeys.Collections_item, [collectionCfgId]);
    }

    public updateView() {
        let collectionCfgId = this._collectionCfgId;
        let view = this.view;
        let cfg = G.TableManager.getDataById(table.collectibles.CollectiblesConfig, collectionCfgId);
        this._qualityCtrl.selectedIndex = quality2DiCol[cfg.quality];
        let ctype: CType, ctype2: CType2;
        let context = GIns.collectionsModel.context;
        let collection = context.getCollectionById(collectionCfgId);
        //限时道具
        let isTimeLimitColl = GIns.collectionsCfgMgr.isTimeLimitColl(collectionCfgId);
        if (isTimeLimitColl == false) {
            view.lv.text = collection ? `+${collection.level}` : "";
            this._star = collection ? collection.star : 0;
            let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, cfg.fragmentItemId);
            view.bar.itemIcon.icon = itemCfg.iconPath;
            view.bar.max = cfg.activeCostFragment;
            view.bar.value = GIns.backpackMgr.getItemCountByItemId(cfg.fragmentItemId);
            view.list_star1.numItems = HeroUtils.getShowStarCount(this._star);
            ctype2 = CType2.normal;
        } else {
            ctype2 = CType2.timeLimit;
        }

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
        this._CType2Ctrl.selectedIndex = ctype2

        let collItemCfg = G.TableManager.getDataById(table.item.ItemConfig, collectionCfgId);
        view.lbName.text = collItemCfg.name;
        QualityUtils.setFGUIFontColorByQuality(view.lbName, cfg.quality);

        view.itemIcon.icon = collItemCfg.bigIconPath;
        view.itemIcon.color = iconColor;
    }

    // private onClickCollection() {
    //     console.warn("点击收藏品", this._collectionCfgId)
    // }
}