import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { BattleConfigManager } from "../../../comm/battle/config/BattleConfigManager";
import { FightType } from "../../../comm/battle/enum/FightType";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { FormationRecViewOpenArgs, UIFormationKey } from "../const/UIFormationConfig";
import { FormationManager } from "../FormationManager";
import { FromationRecItem } from "../item/FromationRecItem";
import { FormationModel } from "../model/FormationModel";

class FormationRecListData {
    scrollY: number
    openIds: number[]
}

/*
* 推荐布阵
 */
@bindScript(UIFormationKey.FORMATION_REC_VIEW)
export class FormationRecView extends UICommWin {
    static pkgName: string = "formation";
    static viewName: string = "FormationRecView";
    //当前选择item
    private _careerSelItem: ui.formation.btn.FormationRecTab;
    //当前选中的下标
    private tab_idx = 0

    private allCfg: Array<table.formation.FormationDiscountConfig[]>;

    private formationDate: FormationRecViewOpenArgs = null;

    protected listDataMap: Map<number, FormationRecListData> = new Map()
    protected _curListData: FormationRecListData = null;

    private get view(): ui.formation.view.FormationRecView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.FORMATION_IN_BATTLE_HERO,
            NotificationKey.FORMATION_SET_UP_FORMATION,
            NotificationKey.FORMATION_DISCOUNT_SETECT,
        ]
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.FORMATION_IN_BATTLE_HERO:
            case NotificationKey.FORMATION_SET_UP_FORMATION:
                this.closeSelf();
                break;
            case NotificationKey.FORMATION_DISCOUNT_SETECT:
                this.discountSetectBack(args);
                break;
        }
    }

    protected onOpen(args: FormationRecViewOpenArgs): void {
        this.formationDate = args;
        this.updateUI();
    }

    protected onInit(): void {
        let self = this.view;
        this.allCfg = FormationManager.ins().getDefaultFormationVo().getAllFormationRecList();
        self.list_tab.itemRenderer = this.updateTab.bind(this);
        self.list_rec.itemRenderer = this.updateItem.bind(this);
        // self.bg.on(fgui.Event.CLICK, this.closeSelf, this);
        self.list_tab.numItems = this.allCfg.length;

        this.allCfg.forEach((cfg, index: number) => {
            let data = new FormationRecListData()
            data.scrollY = 0
            data.openIds = []
            this.listDataMap.set(index, data)
        })

        // this.updateUI();
    }

    private updateTab(index: number, item: ui.formation.btn.FormationRecTab) {
        let tabCfg = G.TableManager.getDataById(table.formation.FormationDiscountTabConfig, this.allCfg[index][0].tapIdx)
        item.lb_tab.text = item.lb_tab1.text = tabCfg ? tabCfg.tapName : ''
        if (index == this.tab_idx) {
            this._careerSelItem = item;
            this.setTabStats(item, true);
        } else {
            this.setTabStats(item, false);
        }
        item.clearClick();
        item.onClick(() => {
            if (!this._careerSelItem) {
                this._careerSelItem = item;
                this.setTabStats(this._careerSelItem, true);
            } else {
                if (this._careerSelItem != item) {
                    this.setTabStats(this._careerSelItem, false);
                    this._careerSelItem = item;
                    this.setTabStats(this._careerSelItem, true);
                } else {
                    this.setTabStats(this._careerSelItem, true);
                    return;
                }
            }
            let curListData = this.listDataMap.get(this.tab_idx)
            if (curListData) {
                //记录旧的
                curListData.scrollY = this.view.list_rec.scrollPane.posY
            }
            this.tab_idx = index;
            this.updateUI();
        }, this);
    }

    public setTabStats(item: ui.formation.btn.FormationRecTab, stats) {
        if (!item) {
            return;
        }
        item.grp_down.visible = stats;
        item.grp_up.visible = !stats;
    }

    private updateItem(index: number, item: FromationRecItem) {
        let showCfg = this.allCfg[this.tab_idx][index];
        item.setData(showCfg, this._curListData.openIds);
    }

    private updateUI() {
        this._curListData = this.listDataMap.get(this.tab_idx)
        let self = this.view;
        let showList = this.allCfg[this.tab_idx];
        self.list_rec.numItems = showList.length;
        if (this._curListData?.scrollY != 0) {
            self.list_rec.scrollPane.posY = this._curListData?.scrollY
        }
    }

    protected discountSetectBack(positionVos: any[]): void {
        if (this.formationDate.fightType == FightType.TRUNK_MAP && GIns.battleMgr.battleLogic.isInBattle()) {
            //大地图战斗中不能布阵
            GIns.floatingTextMgr.showTips("战斗中不能布阵");
            UIManager.ins().close(UIFormationKey.FORMATION_MAIN_VIEW);
            return
        }

        let isClose = true;
        // net 
        let reqVo: Vo.formation.SetupFormationReqVo = {
            // TODO 布阵
            collectiblesId: this.formationDate.collectionsId,
            petBaseId: this.formationDate.petId,
            positionVos: positionVos
        };

        //读表，是否需要上满
        let isNeedFull = BattleConfigManager.getBattleSettingConfig(this.formationDate.fightType).forceFullPosition;

        // // 有些阵型不限制满员
        // let isNeedFullFormation = this.isNeedFullFormation(isClose, isNeedFull);

        for (let data of positionVos) {
            if (!data.heroBaseId) {
                isClose = false;
            }
        }

        if (isNeedFull && !isClose) {
            GIns.floatingTextMgr.showTips("未上阵满英雄");
            return;
        }

        FormationModel.ins().setUpFormation(this.formationDate.fightType, reqVo, this.formationDate.subType);

        this.closeSelf();
    }

}