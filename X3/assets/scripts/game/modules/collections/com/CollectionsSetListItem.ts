import {sys} from "cc";
import * as fgui from "fairygui-cc";
import {bindFguiExtension} from "../../../../core/comm/UIScriptManager";
import GIns from "../../../GIns"
import {CollectionSetItem} from "./CollectionSetItem";
import G from "../../../../core/comm/G";
import {AttrUtils} from "../../attr/utils/AttrUtils";
import {AttrConfigEffect} from "../../attr/structs/AttrConfigEffect";
import {ECollectiblesSkillTargetType, UICollectionsKey} from "../const/UICollectionsConfig";
import {EnumRedDotShowType} from "../../common/redDot/enums/EnumRedDotShowType";
import { ECollectionInfoViewType } from "../win/CollectionInfoWin";

@bindFguiExtension("ui://collectibles/CollectionsSetListItem")
export class CollectionsSetListItem extends fgui.GComponent {
    static pkgName: string = "collectibles";
    static viewName: string = "CollectionsSetListItem";

    private _suitCfgId: number;
    private _collectionCfgIdList: number[];

    //套装所有的星级效果
    private _setStarEffs: Readonly<Readonly<XJ.collections.ISetStarEff>[]>;

    private get view(): ui.collectibles.ui.cmp.item.CollectionsSetListItem {
        return this as any;
    }

    protected onInit() {
        let view = this.view;
        view.list.itemRenderer = this.listICollectionRenderer.bind(this);
        view.list.on(fgui.Event.CLICK_ITEM, this.onClickColl, this);
        view.descList.itemRenderer = this.attrRenderer.bind(this);
        view.activeBtn.onClick(this.onActiveBtn, this);
        view.activeBtn.redDot.getController("type").selectedIndex = EnumRedDotShowType.HIGH;
    }

    private listICollectionRenderer(index: number, item: CollectionSetItem): void {
        let cfgId = this._collectionCfgIdList[index];
        if (cfgId) {
            item.visible = true;
            item.setData(cfgId);
        } else {
            item.visible = false;
        }
    }

    private onClickColl(item: CollectionSetItem) {
        let param: XJ.collections.ICollectionsInfoViewParam = {
            collectionId: item.collectionCfgId,
            viewFlag: ECollectionInfoViewType.active | ECollectionInfoViewType.UP,
        };
        G.UIManager.open(UICollectionsKey.COLLECTION_INFO, param);
    }

    private attrRenderer(index: number, item: ui.collectibles.ui.cmp.item.CollectionsSetAttrDesc) {
        let attr: AttrConfigEffect
        let isUnlock: boolean
        if (index == 0) {
            //是否激活套装效果
            let data = G.TableManager.getDataById(table.collectibles.CollectiblesSuitConfig, this._suitCfgId);
            attr = AttrUtils.parseKvArrayToOneAttr(data.baseAttrs);
            isUnlock = GIns.collectionsModel.context.isActiveSet(this._suitCfgId);
            if(isUnlock) {
                item.desc.text = `【套装】: 我方全体英雄${attr.config.attrName}${attr.getShowValueTextWithSymbol()}`;
            } else {
                item.desc.text = `【集齐套装解锁】: 我方全体英雄${attr.config.attrName}${attr.getShowValueTextWithSymbol()}`;
            }
        } else {
            //指定星级效果
            let data = this._setStarEffs[index - 1];
            let star = data.star;
            isUnlock = GIns.collectionsModel.context.isSetStarEffActive(this._suitCfgId, data.star);
            if (data.starAttrs) {
                attr = AttrUtils.parseKvArrayToOneAttr(data.starAttrs);
                if(isUnlock) {
                    item.desc.text = `【${star}星】:我方全体英雄${attr.config.attrName}${attr.getShowValueTextWithSymbol()}`;
                } else {
                    item.desc.text = `【总星级达到${star}星解锁】:我方全体英雄${attr.config.attrName}${attr.getShowValueTextWithSymbol()}`;
                }
            } else if (data.unlockSkills) {
                let skillDesc = data.unlockSkills.map(id => {
                    let skillEffCfg = G.TableManager.getDataById(table.collectibles.CollectiblesSkillEffectConfig, id);
                    if (skillEffCfg.targetType == ECollectiblesSkillTargetType.HERO) {
                        let heroSkill = G.TableManager.getDataById(table.battle.SkillConfig, skillEffCfg.skillId);
                        return heroSkill.desc;
                    } else if (skillEffCfg.targetType == ECollectiblesSkillTargetType.COLLECTIBLES) {
                        let collSkill = G.TableManager.getDataById(table.battle.CollectionSkillConfig, skillEffCfg.skillId);
                        return G.I18nManager.lang(collSkill.desc);
                    }
                }).join(",");
                if(isUnlock){
                    item.desc.text = `【${star}星】:${skillDesc}`;
                } else {
                    item.desc.text = `【总星级达到${star}星解锁】:${skillDesc}`;
                }
            }
        }

        item.getController("lock").selectedIndex = isUnlock? 1 : 0;
    }

    setData(suitCfgId: number): void {
        this._suitCfgId = suitCfgId;
        let view = this.view;
        let suitCfg = G.TableManager.getDataById(table.collectibles.CollectiblesSuitConfig, suitCfgId);
        view.setName.text = suitCfg.name;

        this._collectionCfgIdList = GIns.collectionsCfgMgr.getSuit(suitCfgId).map(a => {
            return a.id;
        });
        view.list.numItems = this._collectionCfgIdList.length;

        this._setStarEffs = GIns.collectionsCfgMgr.getSuitAllStarEffs(suitCfgId);
        view.descList.numItems = this._setStarEffs.length + 1;

        let context = GIns.collectionsModel.context;
        let showActiveBtn = false;
        if (context.isFullSet(suitCfgId) == false) {
            //未集齐
        } else if (context.isActiveSet(suitCfgId) == false) {
            //已集齐未激活
            showActiveBtn = true;
            // view.activeBtn.title = "套装效果";
        } else if (context.isSetMaxStarEff(suitCfgId)) {
            //已满级
        } else {
            let SuitAllStarEffs = GIns.collectionsCfgMgr.getSuitAllStarEffs(suitCfgId);
            let suitVo = GIns.collectionsModel.context.getSuitById(suitCfgId);
            let suitStar = suitVo.suitStar;
            let hasStarEff2Active = SuitAllStarEffs.some(v => {
                return suitStar >= v.star && GIns.collectionsModel.context.isSetStarEffActive(suitCfgId, v.star) == false
            });
            if (hasStarEff2Active) {
                //有星级效果待激活
                for (let i = 0; i < this._setStarEffs.length; i++) {
                    let starEff = this._setStarEffs[i];
                    if (context.isSetStarEffActive(suitCfgId, starEff.star) == false) {
                        showActiveBtn = true;
                        // view.activeBtn.title = `${starEff.star}星效果`;
                        break
                    }
                }
            }
        }
        view.activeBtn.visible = showActiveBtn;
    }

    private onActiveBtn() {
        GIns.collectionsModel.activeSuit(this._suitCfgId);
    }
}