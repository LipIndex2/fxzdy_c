import * as fgui from "fairygui-cc"
import {bindFguiExtension} from "../../../../../core/comm/UIScriptManager";
import GIns from "../../../../GIns";
import type {AttrConfigEffect} from "../../../attr/structs/AttrConfigEffect";
import G from "../../../../../core/comm/G";

@bindFguiExtension("ui://collectibles/CollectionUpTipsLVPanel")
export class CollectionUpTipsLVPanel extends fgui.GComponent {
    static pkgName: string = "collectibles";
    static viewName: string = "CollectionUpTipsLVPanel";

    private _collectionCfgId: number
    private lastBaseEff: AttrConfigEffect[]
    private curBaseEff: AttrConfigEffect[]

    private get view(): ui.collectibles.ui.win.UpTipsWin.CollectionUpTipsLVPanel {
        return this as any;
    }

    protected onInit() {
        let view = this.view;
        view.attrList.itemRenderer = this.listRender.bind(this);
    }

    resetData(collectionCfgId: number) {
        this._collectionCfgId = collectionCfgId;
        this.updateView()
    }

    playTransition() {
        let view = this.view;
        view.getTransition("t0").play();
    }

    private updateView() {
        let view = this.view;
        let collectionCfgId = this._collectionCfgId;
        let collectionVo = GIns.collectionsModel.context.getCollectionById(collectionCfgId);
        view.lbLVL.text = `+${collectionVo.level - 1}`;
        view.lbLVR.text = `+${collectionVo.level}`;

        //基础属性
        let curCollLV = GIns.collectionsModel.context.getCollectionLV(collectionCfgId);
        this.lastBaseEff = GIns.collectionsCfgMgr.getBaseEffs(collectionCfgId, curCollLV - 1);
        this.curBaseEff = GIns.collectionsCfgMgr.getBaseEffs(collectionCfgId, curCollLV);
        view.attrList.numItems = this.curBaseEff.length

    }

    private listRender(index: number, item: ui.collectibles.ui.win.UpTipsWin.CollectionBaseEffUpTipListItem) {
        let lastBaseEff = this.lastBaseEff[index];
        let curBaseEff = this.curBaseEff[index];
        let collCfg = G.TableManager.getDataById(table.collectibles.CollectiblesConfig, this._collectionCfgId);
        item.lbBaseAtt.text = GIns.collectionsCfgMgr.getEffTypeDesc(collCfg.effectType, curBaseEff.config.attrName);
        item.lbAttrL.text = lastBaseEff.getShowValueTextWithSymbol();
        item.lbAttrR.text = curBaseEff.getShowValueTextWithSymbol();
    }
}