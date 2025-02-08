import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager"
import { UICommWin } from "../../../../core/mvc/view/UICommWin"
import { CollectionUpTipsLVPanel } from "../com/panel/CollectionUpTipsLVPanel";
import { CollectionsUpTipsStarPanel } from "../com/panel/CollectionsUpTipsStarPanel";
import { UICollectionsKey } from "../const/UICollectionsConfig"

declare global {
    namespace XJ {
        namespace collections {
            interface IUpTipsWinViewParam {
                collectionCfgId: number
            }
        }
    }
}


@bindScript(UICollectionsKey.UP_TIP_WIN)
export class CollectionsSetActiveWin extends UICommWin {
    public static pkgName = "collectibles"
    public static viewName = "CollectionsUpTipsWin"

    // private collectionId: number


    get view(): ui.collectibles.ui.win.CollectionsUpTipsWin {
        return this._view as any
    }

    protected onInit() {
        let view = this.view;
        view.closeBtn.onClick(this.closeSelf, this);
    }

    protected onOpen(args: XJ.collections.IUpTipsWinViewParam, isReopen?: boolean) {
        let view = this.view;
        let { collectionCfgId } = args;
        // let collCfg = G.TableManager.getDataById(table.collectibles.CollectiblesConfig, collectionCfgId);
        // this.collectionId = collectionCfgId;

        let collItemCfg = G.TableManager.getDataById(table.item.ItemConfig, collectionCfgId);
        view.collectionIcon.icon = collItemCfg.bigIconPath;

        let satrPanel = view.star as CollectionsUpTipsStarPanel;
        satrPanel.resetData(collectionCfgId);
        satrPanel.playTransition();

        view.getTransition("t0").play();
    }
}