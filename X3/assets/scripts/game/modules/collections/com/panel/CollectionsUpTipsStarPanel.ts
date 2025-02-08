import * as fgui from "fairygui-cc"
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { ItemUtils } from "../../../item/utils/ItemUtils";
import GIns from "../../../../GIns";
import { HeroUtils } from "../../../hero/utils/HeroUtils";
import G from "../../../../../core/comm/G"
import { CommonCollectionSkillItem } from "../../../hero/item/CommonCollectionSkillItem";
import { AttrConfigEffect } from "../../../attr/structs/AttrConfigEffect";
import { AttrUtils } from "../../../attr/utils/AttrUtils";
import { Attribute } from "../../../attr/AttrEnum";

@bindFguiExtension("ui://collectibles/CollectionsUpTipsStarPanel")
export class CollectionsUpTipsStarPanel extends fgui.GComponent {
    static pkgName: string = "collectibles";
    static viewName: string = "CollectionsUpTipsStarPanel";

    private starsL: number
    private starsR: number

    private _collectionCfgId: number

    private _attrListData: {
        attrName: string    //属性名字
        attrValueL: string       //升星前的属性值
        attrValueR: string       //升星后的属性值
    }[]

    private get view(): ui.collectibles.ui.win.UpTipsWin.CollectionsUpTipsStarPanel {
        return this as any;
    }

    protected onInit() {
        let view = this.view;
        view.listStarL.itemRenderer = (_, item: ui.comm.item.StarIconItem) => {
            item.starIcon.icon = ItemUtils.getStarIcon(this.starsL);
        }
        view.listStarR.itemRenderer = (_, item: ui.comm.item.StarIconItem) => {
            item.starIcon.icon = ItemUtils.getStarIcon(this.starsR);
        }

        view.attrList.itemRenderer = this.starAttrRenderer.bind(this);
        view.attrList.setVirtual()
    }

    resetData(collectionCfgId: number) {
        this._collectionCfgId = collectionCfgId
        this.udpateView();
    }

    playTransition() {
        let view = this.view;
        view.getTransition("t0").play();
        if (view.getController("c2").selectedIndex != 0) {
            view.getTransition("t1").play();
        }
    }

    protected udpateView() {
        let view = this.view;
        let collectionsCfgMgr = GIns.collectionsCfgMgr;
        let collectionCfgId = this._collectionCfgId;
        let collectionVo = GIns.collectionsModel.context.getCollectionById(collectionCfgId);
        let collCfg = G.TableManager.getDataById(table.collectibles.CollectiblesConfig, collectionCfgId);
        this.starsR = collectionVo.star;
        view.listStarR.numItems = HeroUtils.getShowStarCount(this.starsR);
        this.starsL = this.starsR - 1;
        view.listStarL.numItems = HeroUtils.getShowStarCount(this.starsL);

        //额外属性
        let curStar = GIns.collectionsModel.context.getCollectionStar(collectionCfgId);
        let outAccuEffCur: XJ.collections.IAccuEff = {
            one: null
        };
        collectionsCfgMgr.getCollAccuEff(collCfg.taskAttrId, curStar, outAccuEffCur);
        let outAccuEffLast: XJ.collections.IAccuEff = {
            one: null
        };
        collectionsCfgMgr.getCollAccuEff(collCfg.taskAttrId, curStar - 1, outAccuEffLast);

        let effIndex: number
        if (outAccuEffCur.one) {
            effIndex = 1;
            //任务属性
            let effDesc = `${outAccuEffCur.one.config.attrName}:`;
            let collTaskCfg = G.TableManager.getDataById(table.collectibles.CollectiblesTaskAttrConfig, collCfg.taskAttrId);
            let desc = G.I18nManager.lang(collTaskCfg.desc, effDesc, collTaskCfg.progress);
            view.lbExtraAttrDesc.text = desc;
        } else {
            //星级属性
            effIndex = 2
            this._attrListData = [];

            //升级前属性
            let lastAttr_attrId2Value: Map<Attribute, string> = new Map();
            AttrUtils.parseKvArrayToAttrArray(collectionsCfgMgr.getExtraEff(collectionCfgId, this.starsL)).forEach(v=>{
                lastAttr_attrId2Value.set(v.attrId, v.getShowValueTextWithSymbol());
            });
            //升级后属性
            AttrUtils.parseKvArrayToAttrArray(collectionsCfgMgr.getExtraEff(collectionCfgId, this.starsR)).forEach(v=>{
                this._attrListData.push({
                    attrName: v.getAttrName(),
                    attrValueL: lastAttr_attrId2Value.get(v.attrId),
                    attrValueR: v.getShowValueTextWithSymbol(),
                })
            })
            view.attrList.numItems = this._attrListData.length;

        }
        view.getController("eff").selectedIndex = effIndex;

        if (outAccuEffLast.one) {
            view.lbExtraAttrL.text = outAccuEffLast.one.getShowValueTextWithSymbol();
            view.lbExtraAttrR.text = outAccuEffCur.one.getShowValueTextWithSymbol();
        }

        //技能解锁
        let curStarUnlockSkill = GIns.collectionsCfgMgr.getCollUnlockSkill(collectionCfgId, curStar);
        if (curStarUnlockSkill) {
            view.getController("c2").selectedIndex = 1;

            let collSkillItem = view.skill as unknown as CommonCollectionSkillItem;
            let param: XJ.collections.ICollectionSkill = {
                id: curStarUnlockSkill
            }
            collSkillItem.updateInfo(param)
        } else {
            view.getController("c2").selectedIndex = 0;
        }
    }

    private starAttrRenderer(index: number, item: ui.collectibles.ui.win.UpTipsWin.CollectionBaseEffUpTipListItem) {
        let data = this._attrListData[index];
        item.lbBaseAtt.text = data.attrName;
        item.lbAttrL.text = data.attrValueL;
        item.lbAttrR.text = data.attrValueR;
    }
}