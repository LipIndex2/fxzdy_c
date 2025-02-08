import * as fgui from "fairygui-cc";
import { HeroVo } from "../HeroVo";
import { HeroManager } from "../HeroManager";
import G from "../../../../core/comm/G";
import { HeroSkinItem } from "../item/HeroSkinItem";
import { HeroModel } from "../model/HeroModule";
import { UIHeroKey } from "../const/UIHeroConfig";
import { FloatingTextManager } from "../../floatingText/FloatingTextManager";
import { ItemUtils } from "../../item/utils/ItemUtils";
import GIns from "../../../GIns";
import NotificationKey from "../../../event/NotificationKey";
import { UIManager } from "../../../../core/mvc/UIManager";

/** 英雄展示页 */
export class HeroSkinPage extends fgui.GComponent {
    static pkgName: string = "hero";
    static viewName: string = "HeroSkinPage";

    private _baseId: number = 0;
    private _heroVo: HeroVo;

    private _heroStor: HeroVo[];
    private _heroSkinList: Array<table.hero.HeroSkinConfig>;

    private _select_idx = 0;
    private get view(): ui.hero.page.HeroSkinPage {
        return this as any;
    }

    public onInit() {
        this.view.btn_waer.on(fgui.Event.CLICK, this.onBtnClick, this);
        this.view.list_attr.itemRenderer = this.updateListAttr.bind(this);
        this.view.list_skin.itemRenderer = this.updateListSkin.bind(this);

        this.view.btnRule.on(fgui.Event.CLICK, this.onAttrClick, this);
    }

    protected onDisable(): void {
        G.FacadeManager.emit(NotificationKey.HERO_SKIN_RESET);
    }

    /**
     * 更新信息
     * @param baseId 英雄id
     */
    public updateInfo(baseId: number) {
        if (!baseId) return;
        this._baseId = baseId;
        this._heroVo = HeroManager.ins().getHeroVoByID(this._baseId);
        this._heroSkinList = this.getHeroSkinShow();

        this._select_idx = 0;
        this.updateUI();
    }

    public updateUI() {
        this.view.list_skin.numItems = this._heroSkinList.length;
        let self = this.view;
        let showIdxDate = this._heroSkinList[this._select_idx];
        self.list_attr.numItems = showIdxDate.attrs.length;
        let heroSkinIds = this._heroVo.heroVoData.heroSkinIds || [];
        let useId = this._heroVo.heroVoData.useSkinId;
        if (useId == showIdxDate.id) {
            self.grp_use.visible = true;
            self.btn_waer.visible = false;
        } else {
            self.grp_use.visible = false;
            self.btn_waer.visible = true;
            if (showIdxDate.id == 0 || heroSkinIds.indexOf(showIdxDate.id) != -1) {
                self.btn_waer.text = "穿戴";
                self.btn_waer.grayed = false;
            } else {
                self.btn_waer.text = "未拥有";
                self.btn_waer.grayed = true;
            }
        }
    }

    private onBtnClick(evt: any) {
        let showIdxDate = this._heroSkinList[this._select_idx];
        let heroSkinIds = this._heroVo.heroVoData.heroSkinIds || [];
        if (showIdxDate.id == 0 || heroSkinIds.indexOf(showIdxDate.id) != -1) {
            HeroModel.ins().sendSkinWear(showIdxDate.heroBaseId, showIdxDate.id);
        } else {
            let itemCfg = ItemUtils.getItemConfigByItemId(showIdxDate.id);
            GIns.floatingTextMgr.showTips(itemCfg.comeFromText);
        }
    }

    private updateListAttr(index: number, item: ui.hero.item.HeroSkinAttrItem) {
        let data = this._heroSkinList[this._select_idx].attrs[index];
        let cfg = G.TableManager.getDataById(table.battle.AttributeConfig, data.k);
        item.T_name.text = cfg.attrName;
        item.img_attr.icon = cfg.icon;
        item.T_num.text = cfg.isPermyriad ? data.v / 100 + "%" : data.v;
    }

    private updateListSkin(index: number, item: HeroSkinItem) {
        let skinCfg = this._heroSkinList[index];
        item.updateView(skinCfg, index, this._heroVo.heroVoData.useSkinId, this._select_idx);
    }

    public onSelectSkin(index) {
        this._select_idx = index;
        this.updateUI();
    }

    public getHeroSkinShow() {
        let cfgList = HeroManager.ins().getHeroSkinListById(this._baseId);
        let showList: table.hero.HeroSkinConfig[] = [];
        cfgList.map((vo) => {
            showList.push(vo);
        });
        showList.push({
            id: 0,
            heroBaseId: this._baseId,
            attrs: [],
            priority: 0,
            headPath: this._heroVo.heroCfg.headPath,
            showModelId: this._heroVo.heroCfg.showModelId,
            modelId: this._heroVo.heroCfg.modelId,
        } as table.hero.HeroSkinConfig);

        let heroSkinIds = this._heroVo.heroVoData.heroSkinIds || [];
        let useId = this._heroVo.heroVoData.useSkinId;
        showList.sort((a, b) => {
            //排序：使用中 - 已激活 - 未激活
            if (a.id == useId || b.id == useId) {
                //使用中在最前面
                return a.id == useId ? -1 : 1;
            } else {
                let hasA = heroSkinIds.indexOf(a.id) != -1 || a.id == 0;
                let hasB = heroSkinIds.indexOf(b.id) != -1 || b.id == 0;
                if (hasA != hasB) {
                    //已拥有在前面
                    return hasA ? -1 : 1;
                } else {
                    let itemA = G.TableManager.getDataById(table.item.ItemConfig, a.id);
                    let itemB = G.TableManager.getDataById(table.item.ItemConfig, b.id);
                    if (itemA && itemB) {
                        //品质高的在前面
                        return itemB.quality - itemA.quality;
                    } else if (itemA == null || itemB == null) {
                        return itemA == null ? 1 : -1;
                    }
                }
            }
        });

        return showList;
    }

    //查看总属性
    private onAttrClick() {
        if (GIns.heroMgr.getSkinAttrs().length > 0) {
            UIManager.ins().open(UIHeroKey.SkinAttrPreviewWin);
        } else {
            GIns.floatingTextMgr.showTips("获得首个皮肤后解锁");
        }
    }
}
