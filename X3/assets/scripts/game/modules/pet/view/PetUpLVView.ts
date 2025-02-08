import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import GIns from "../../../GIns";
import { AttrConfigEffect } from "../../attr/structs/AttrConfigEffect";
import { AttrUtils } from "../../attr/utils/AttrUtils";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { UIPetKey } from "../const/UIPetConfig";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { Attribute } from "../../attr/AttrEnum";
import NotificationKey from "../../../event/NotificationKey";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { RuleController } from "../../rule/RuleController";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { HeaderItem } from "../../common/header/HeaderItem";
import { BtnChangGui1WithItemList1 } from "../../common/btn/BtnChangGui1WithItemList1";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { AttrData } from "../../attr/AttrManager";
import { TableManager } from "../../../../core/table/TableManager";
import { ModelNode } from "../../common/node/ModelNode";
import { systemFight } from "../../fight/FightManager";
import FguiUtils from "db://assets/scripts/core/utils/FguiUtils";

enum EUIState {
    upLV = 1, //升级
    upStage = 2, //升阶
    maxLV = 3, //满级
}

interface IAttListData {
    //当前等级属性
    curAttr: AttrConfigEffect[];
    //下一等级属性
    nextAttr?: Partial<Record<Attribute, AttrConfigEffect>>;
}

/** 升级界面 */
@bindScript(UIPetKey.PET_UP_LV_VIEW)
export class PetUpLVView extends UICommWin {
    static pkgName: string = "pet";
    static viewName: string = "PetUpLVView";

    //升星消耗的物品
    private _costItems: NoOwnerItem[];

    //属性列表数据
    // private _attListData: IAttListData = {} as any;

    private _stateController: fgui.Controller;

    private _costList: Readonly<Array<Readonly<NoOwnerItem>>>;

    //当前属性
    private _curAttr: AttrData[] = [];
    //下一级属性
    private _nextAttr: AttrData[] = [];

    private _longTouchCtrl: ReturnType<typeof FguiUtils.AddLongTouchEvent>

    private get view(): ui.pet.view.PetUpLVView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.PET_UP_STAGE_LV, NotificationKey.PET_UP_SHARE_LV];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.PET_UP_STAGE_LV:
            case NotificationKey.PET_UP_SHARE_LV:
                this.onLvup();
                break;
        }
    }

    protected onInit() {
        let view = this.view;
        // view.upLVBtn.onClick(this.onUpBtn, this);
        this._longTouchCtrl = FguiUtils.AddLongTouchEvent(view.upLVBtn, this.onUpBtn.bind(this), this.onUpBtn.bind(this), -1, 0.25);

        view.helpBtn.onClick(() => {
            RuleController.ins().openRule(EnumRuleKeys.PET_UP_LEVEL, view.helpBtn);
        });
        view.infoCom.attList.itemRenderer = this.renderAttCell.bind(this);
        view.costList.itemRenderer = this.renderCostCell.bind(this);
        this._stateController = view.getController("state");

        view.btnRule.on(fgui.Event.CLICK, this.onClickRule, this);
    }

    protected onOpen(args: any, isReopen?: boolean) {
        //右上角的升阶升级消耗
        this._costList = GIns.petCfgMgr.getUpStageCost(1);
        this.view.costList.numItems = this._costList.length;

        let red: RedDotCom = this.view.upLVBtn.redDot as any;
        red.reset(RedDotKeys.Pet_upLVStage);
        this.updateView();
    }

    private onLvup(): void {
        this.updateView();
        this.playLvUpAni();
    }

    private updateView() {
        let view = this.view,
            petContext = GIns.petModel.petContext;
        let uiState: EUIState,
            style = 1;
        let { shareLevel } = petContext;
        let { shareStage } = petContext;
        let { TableManager } = G;
        let { petCfgMgr } = GIns;
        if (petCfgMgr.isMaxLV()) {
            uiState = EUIState.maxLV;
            this._costItems = [];
        } else if (petCfgMgr.isCanUpStageWithOutCost()) {
            uiState = EUIState.upStage;
        } else {
            uiState = EUIState.upLV;
        }
        view.infoCom.curLV.text = String(shareLevel);

        let posVos = GIns.formationMgr.getAllPosData();
        let addFight = GIns.fightMgr.getSystemFight(posVos, systemFight.PET);
        view.txPower.text = StringUtils.getFightStr(addFight);

        //获取当前等级的属性
        let curCfg = TableManager.getDataById(table.pet.PetLevelConfig, shareLevel);
        //获取当前等阶的属性
        let stageCfg = G.TableManager.getDataById(table.pet.PetStageConfig, shareStage);
        this._curAttr = [];
        curCfg.heroAttrAdditions?.forEach((attrKV) => {
            if (attrKV) {
                let attrdat = GIns.attrMgr.convertDataFormat(attrKV.k, attrKV.v);
                this._curAttr.push(attrdat);
            }
        });
        stageCfg.heroAttrAdditions?.forEach((attrKV) => {
            if (attrKV) {
                let attrdat = GIns.attrMgr.convertDataFormat(attrKV.k, attrKV.v);
                this._curAttr.push(attrdat);
            }
        });

        if (uiState != EUIState.maxLV) {
            //获取下一等级的属性
            let nextLVCfg = TableManager.getDataById(table.pet.PetLevelConfig, shareLevel + 1);

            this._nextAttr = [];
            nextLVCfg.heroAttrAdditions.forEach((attrKV) => {
                if (attrKV) {
                    let attrdat = GIns.attrMgr.convertDataFormat(attrKV.k, attrKV.v);
                    this._nextAttr.push(attrdat);
                }
            });

            view.infoCom.nextLV.text = String(shareLevel + 1);

            if (uiState == EUIState.upLV) {
                this._costItems = ItemUtils.parseKvArrayToItemArray(nextLVCfg.costItems);
                stageCfg.heroAttrAdditions.forEach((attrKV) => {
                    if (attrKV) {
                        let attrdat = GIns.attrMgr.convertDataFormat(attrKV.k, attrKV.v);
                        this._nextAttr.push(attrdat);
                    }
                });
            } else if (uiState == EUIState.upStage) {
                this._costItems = GIns.petCfgMgr.getUpStageCost(petContext.shareStage, true);
                let nestStageCfg = TableManager.getDataById(table.pet.PetStageConfig, petContext.shareStage + 1);
                nestStageCfg.heroAttrAdditions.forEach((attrKV) => {
                    if (attrKV) {
                        let attrdat = GIns.attrMgr.convertDataFormat(attrKV.k, attrKV.v);
                        this._nextAttr.push(attrdat);
                    }
                });
                ItemUtils.parseKvArrayToItemArray(nestStageCfg.costItems);
                style = 0;
            }

            //合并属性
            this._nextAttr = GIns.attrMgr.mergeAttrDataArray(this._nextAttr);
        }

        this._curAttr = GIns.attrMgr.mergeAttrDataArray(this._curAttr);
        this._stateController.selectedIndex = uiState;

        let upBtn = view.upLVBtn as unknown as BtnChangGui1WithItemList1;
        upBtn.reset(this._costItems);
        upBtn.setStyle(style);

        upBtn.grayed = uiState == EUIState.maxLV;
        upBtn.touchable = uiState != EUIState.maxLV;

        if (this._curAttr.length > 0) {
            // let keys = Object.keys(this._curAttr);
            view.infoCom.attList.numItems = this._curAttr.length;
        } else {
            // let keys = Object.keys(this._nextAttr);
            view.infoCom.attList.numItems = this._nextAttr.length;
        }
    }

    private renderAttCell(index: number, item: ui.pet.com.PetAttCell): void {
        let maxState = item.getController("maxState");
        let state: EUIState = this._stateController.selectedIndex;

        let keys;
        if (this._curAttr.length > 0) {
            keys = Object.keys(this._curAttr);
        } else {
            keys = Object.keys(this._nextAttr);
        }
        let attr1 = this._curAttr[keys[index]];
        let attr2 = this._nextAttr[keys[index]];

        let attrCfg: table.battle.AttributeConfig;
        if (attr1) {
            attrCfg = TableManager.getDataById(table.battle.AttributeConfig, attr1.id);
        } else {
            attrCfg = TableManager.getDataById(table.battle.AttributeConfig, attr2.id);
        }
        item.attIcon.icon = attrCfg.icon;
        item.attName.text = "队伍" + attrCfg.attrName;
        item.curValue.text = attr1 ? attr1.num.toString() : `0`;

        if (state != EUIState.maxLV) {
            item.nextValue.text = attr2?.num.toString() || "";
            maxState.selectedIndex = 0;
        } else {
            maxState.selectedIndex = 1;
        }
    }

    private renderCostCell(index: number, item: HeaderItem): void {
        let data = this._costList[index];
        item.reset(data.itemId, true);
    }

    private onUpBtn() {
        const isCanPay = GIns.backpackMgr.isCanPayTheseItemArray(this._costItems);
        if (!isCanPay) {
            // 弹出首个不足的道具来源
            GIns.backpackMgr.tryPopUpNoEnoughItem(this._costItems, true);
            this._longTouchCtrl.touch_cancel();
            return;
        }

        let state: EUIState = this._stateController.selectedIndex;
        switch (state) {
            case EUIState.upLV: {
                GIns.petModel.sendUpLV();
                break;
            }
            case EUIState.upStage: {
                G.UIManager.open(UIPetKey.PET_UP_STAGE_VIEW);
                this._longTouchCtrl.touch_cancel();
                break;
            }
        }
    }

    private onClickRule() {
        RuleController.ins().openRule(EnumRuleKeys.PET_UP_LEVEL2, this.view.btnRule);
    }

    protected playLvUpAni(): void {
        let aniNode = this.view.modelNode as ModelNode;
        aniNode.loadByPath("spine/ui/shengjibiaoxian/shengjibiaoxian1_upper");
        aniNode.playOrders([
            {
                name: "enter",
                isLoop: false,
            },
        ]);
    }
}
