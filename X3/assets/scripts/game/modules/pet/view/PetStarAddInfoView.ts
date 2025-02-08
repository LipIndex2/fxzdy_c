import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { UIPetKey } from "../const/UIPetConfig";
import { PetStarAddDescLIstItem } from "../com/PetStarAddDescLIstItem";


/** 星灵星级加成界面 */
@bindScript(UIPetKey.PET_STAR_ADD_INFO_VIEW)
export class PetStarAddInfoView extends UICommWin {
    static pkgName: string = "pet";
    static viewName: string = "PetStarAddInfoView";

    private petCfgId: number;
    private starts: number[];

    private get view(): ui.petGroup.view.groupAddInfo.PetGroupAddInfoView {
        return this._view as any;
    }

    protected onInit() {
        let view = this.view;

        view.list.itemRenderer = this.groupListRenderer.bind(this);
        view.list.setVirtual();

    }

    protected onOpen(petCfgId: number, isReopen?: boolean) {
        let view = this.view;
        this.petCfgId = petCfgId;

        let petCfg = G.TableManager.getDataById(table.pet.PetConfig, petCfgId);
        view.lblGroupName.text = petCfg.name;
        
        this.starts = GIns.petCfgMgr.getPetAllStar(petCfgId);
        
        view.list.numItems = this.starts.length;
    }

    private groupListRenderer(index: number, item: PetStarAddDescLIstItem) {
        item.setData(this.petCfgId, this.starts[index]);
    }
}
