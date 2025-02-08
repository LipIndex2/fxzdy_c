import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { IContainer } from "../../../../core/mvc/viewContainer/IContainer";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RuleController } from "../../rule/RuleController";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { UICollectionsKey } from "../const/UICollectionsConfig";


@bindScript(UICollectionsKey.MAIN_VIEW)
export class CollectionsMainView extends UIPage implements IContainer {

    static pkgName: string = "collectibles";
    static viewName: string = "CollectionsMainView";

    private tabCfg = [
        {
            uiKey: UICollectionsKey.ITEM_SUB_PAGE,
            name: "藏品",
            icon: "ui://collectibles/scp_sc1",
            selectIcon: "ui://collectibles/scp_sc2",
            red: RedDotKeys.Collections_item_all,
        },
        {
            uiKey: UICollectionsKey.SET_SUB_PAGE,
            name: "套装",
            icon: "ui://collectibles/scp_tz1",
            selectIcon: "ui://collectibles/scp_tz2",
            red: RedDotKeys.Collections_suit_all,
        },
    ];

    private get view(): ui.collectibles.ui.view.CollectionsMainView {
        return this._view as any;
    }

    protected onInit() {
        let view = this.view;
        view.btnRule.onClick(() => {
            RuleController.ins().openRule(EnumRuleKeys.COLLECTIONS, view.btnRule);
        });
        view.footer.btnBack.onClick(this.closeSelf, this);
        view.footerList.itemRenderer = this.tabRenderer.bind(this);
        view.footerList.numItems = this.tabCfg.length;
        let uiKeys = this.tabCfg.map(n => {
            return n.uiKey;
        });
        this.viewContainer.bindByGList(uiKeys, view.footerList);
    }

    protected onOpen(args: any, isReopen?: boolean) {
        let view = this.view;

        this.viewContainer.selectIndex = 0;
    }

    private tabRenderer(index: number, item: ui.collectibles.ui.cmp.item.FooterItem) {
        let data = this.tabCfg[index];
        item.title = data.name;
        item.icon = data.icon;
        item.selectedIcon = data.selectIcon;

        let red = item.redDot as RedDotCom;
        red.reset(data.red)
    }
}