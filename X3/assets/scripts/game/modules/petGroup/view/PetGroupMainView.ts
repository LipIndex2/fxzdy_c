import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIPetGroupKey } from "../const/UIPetGroupConfig";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import NotificationKey from "../../../event/NotificationKey";
import { PetGroupListItem } from "../com/PetGroupListItem";
import GIns from "../../../GIns";
import { RuleController } from "../../rule/RuleController";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";


/** 宠物主界面 */
@bindScript(UIPetGroupKey.PET_GROUP_VIEW)
export class PetMainView extends UICommWin {
    static pkgName: string = "petGroup";
    static viewName: string = "PetGroupView";

    private allPetGroupCfgIds: number[]
    private redEvtGroupActiveUp: string

    private get view(): ui.petGroup.view.mainView.PetGroupView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        this.redEvtGroupActiveUp = RedDotKeys.Pet_group_active_up.toEventName();
        return [
            NotificationKey.PET_GROUP_ACTIVE_UP,
            this.redEvtGroupActiveUp,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.PET_GROUP_ACTIVE_UP:
                this.view.GroupList.refreshVirtualList();
                break;
            case this.redEvtGroupActiveUp:
                this.reflashList();
                break;
        }
    }

    protected onInit() {
        let view = this.view;

        view.GroupList.itemRenderer = this.groupListRenderer.bind(this);
        view.GroupList.setVirtual();

        view.helpBtn.onClick(() => {
            RuleController.ins().openRule(EnumRuleKeys.PET_GROUP, view.helpBtn);
        });
    }

    protected onOpen(args: any, isReopen?: boolean) {
        let view = this.view;

        this.allPetGroupCfgIds = G.TableManager.getAllData(table.pet.PetGroupConfig).map(v => { return v.id; });
        this.reflashList();
    }

    private groupListRenderer(index: number, item: PetGroupListItem) {
        item.setData(this.allPetGroupCfgIds[index]);
    }

    private reflashList() {
        this.allPetGroupCfgIds.sort(this.sortPetGroup);
        this.view.GroupList.numItems = this.allPetGroupCfgIds.length;
    }

    private sortPetGroup(petGroupIdA: number, petGroupIdB: number) {
        // 排序：激活状态（待激活＞待升级>已激活＞未激活）>羁绊等级（从大到小）＞羁绊组合id

        let petGroupContext = GIns.petModel.petGroupContext;
        let voA = petGroupContext.getGroupVo(petGroupIdA);
        let voB = petGroupContext.getGroupVo(petGroupIdB);

        //待激活
        let canActiveA = voA.isCanActive();
        let canActiveB = voB.isCanActive();
        if (canActiveA != canActiveB) {
            if (canActiveA) {
                return -1;
            } else {
                return 1;
            }
        }

        //待升级
        let canUpLVA = voA.isCanUpLV();
        let canUpLVB = voB.isCanUpLV();
        if (canUpLVA != canUpLVB) {
            if (canUpLVA) {
                return -1;
            } else {
                return 1;
            }
        }

        //已激活＞未激活
        if (voA.activated != voB.activated) {
            if (voA.activated) {
                return -1;
            } else {
                return 1;
            }
        }

        //羁绊等级
        let curStageA = voA.getCurStage();
        let curStageB = voB.getCurStage();
        if (curStageA != curStageB) {
            return curStageB - curStageA;
        }

        return petGroupIdA - petGroupIdB;
    }
}
