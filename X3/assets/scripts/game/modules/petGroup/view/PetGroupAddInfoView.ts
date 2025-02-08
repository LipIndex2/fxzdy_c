import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIPetGroupKey } from "../const/UIPetGroupConfig";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { PetGroupAddDescLIstItem } from "../com/PetGroupAddDescLIstItem";


/** 星灵羁绊详情界面 */
@bindScript(UIPetGroupKey.PET_GROUP_ADD_INFO_VIEW)
export class PetGroupAddInfoView extends UICommWin {
    static pkgName: string = "petGroup";
    static viewName: string = "PetGroupAddInfoView";

    private petGroupId: number
    private listData: Readonly<Array<Readonly<XJ.Pet.IGroupInfo>>>

    private get view(): ui.petGroup.view.groupAddInfo.PetGroupAddInfoView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.PET_ACTIVER:
                break;
        }
    }

    protected onInit() {
        let view = this.view;

        view.list.itemRenderer = this.groupListRenderer.bind(this);
        view.list.setVirtual();

    }

    protected onOpen(petGroupId: number, isReopen?: boolean) {
        let view = this.view;
        this.petGroupId = petGroupId;
        let groupCfg = G.TableManager.getDataById(table.pet.PetGroupConfig, petGroupId);
        view.lblGroupName.text = groupCfg.groupName;
        
        let vo = GIns.petModel.petGroupContext.getGroupVo(petGroupId);
        this.listData = vo.getAllStarAttrs();
        view.list.numItems = this.listData.length;
    }

    private groupListRenderer(index: number, item: PetGroupAddDescLIstItem) {
        item.setData(this.petGroupId, this.listData[index]);
    }
}
