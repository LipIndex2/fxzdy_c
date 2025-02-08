import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import GIns from "../../../GIns";
import { Attribute } from "../../attr/AttrEnum";
import { AttrConfigEffect } from "../../attr/structs/AttrConfigEffect";
import { AttrUtils } from "../../attr/utils/AttrUtils";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { BtnChangGui1WithItemList1 } from "../../common/btn/BtnChangGui1WithItemList1";
import { UIPetKey } from "../const/UIPetConfig";
import { AttrData } from "db://assets/scripts/game/modules/attr/AttrManager";

interface IListExtAttr {
    attName: string
    curValue: number
    nextValue: number
}
interface IListAttr {
    //当前等级属性
    curAttr: AttrConfigEffect
    //下一等级属性
    nextAttr: AttrConfigEffect
}


/** 升阶界面 */
@bindScript(UIPetKey.PET_UP_STAGE_VIEW)
export class PetUpStarSuccessView extends UICommWin {
    static pkgName: string = "pet";
    static viewName: string = "PetUpStageView";

    private _attListData: (IListExtAttr | IListAttr)[] = []

    //升星消耗的物品
    private _costItems: NoOwnerItem[]

    private get view(): ui.pet.view.PetUpStageView {
        return this._view as any;
    }

    protected onInit() {
        let view = this.view
        view.upBtn.onClick(this.onClickUpBtn, this)
        view.attUpList.itemRenderer = this.attListRender.bind(this)

    }

    protected onOpen(args: any, isReopen?: boolean) {
        let view = this.view, { TableManager } = G
        let { shareStage: curStage, shareLevel } = GIns.petModel.petContext
        let nextStage = curStage + 1

        let stageInfo: IListExtAttr = {
            attName: "品阶:",
            curValue: curStage,
            nextValue: nextStage
        }
        let lvLimitInfo: IListExtAttr = {
            attName: "等级上限:",
            curValue: 0,
            nextValue: 0
        }

        view.curLV.text = String(shareLevel)
        view.nextLV.text = String(shareLevel + 1)
        let nextCfg = TableManager.getDataById(table.pet.PetStageConfig, nextStage)

        this._costItems = GIns.petCfgMgr.getUpStageCost(curStage, true)

        //等级上限提升
        lvLimitInfo.curValue = nextCfg.levelCondition
        let nextLVLimitCfg = TableManager.getDataById(table.pet.PetStageConfig, nextStage + 1)
        if (nextLVLimitCfg) {
            lvLimitInfo.nextValue = nextLVLimitCfg.levelCondition
        } else {
            lvLimitInfo.nextValue = GIns.petCfgMgr.maxShareLV
        }

        this._attListData = [
            stageInfo,
            lvLimitInfo
        ]

        let curLVAttr = GIns.petCfgMgr.getLVAttr();
        let nextLVAttr = GIns.petCfgMgr.getLVAttr([], shareLevel + 1, nextStage);

        curLVAttr.forEach((curV, idx) => {
            let nextV = nextLVAttr[idx];
            this._attListData.push({
                curAttr: AttrConfigEffect.create(curV.id, curV.num),
                nextAttr: AttrConfigEffect.create(nextV.id, nextV.num)
            })
        });

        view.attUpList.numItems = this._attListData.length

        let upBtn = view.upBtn as unknown as BtnChangGui1WithItemList1
        upBtn.reset(this._costItems)
        upBtn.title = "进阶"
    }

    private onClickUpBtn() {
        const isCanPay = GIns.backpackMgr.isCanPayTheseItemArray(this._costItems);
        if (!isCanPay) {
            GIns.floatingTextMgr.showTips("道具不足!");
            // 弹出首个不足的道具来源
            GIns.backpackMgr.tryPopUpNoEnoughItem(this._costItems, true);
            return;
        }
        GIns.petModel.sendUpStage()
        this.closeSelf()
    }

    private attListRender(index: number, item: ui.pet.com.PetUpStageListCell) {
        let data = this._attListData[index]
        if ("attName" in data) {
            item.txName.text = data.attName
            item.txCurNum.text = String(data.curValue)
            item.txNestNum.text = String(data.nextValue)
        } else {
            item.txName.text = "队伍" + data.curAttr.getAttrName()
            item.txCurNum.text = data.curAttr.getValueStringForUIShow()
            item.txNestNum.text = data.nextAttr.getValueStringForUIShow()
        }

    }
}