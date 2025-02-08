import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import GIns from "../../../GIns";
import { AttrConfigEffect } from "../../attr/structs/AttrConfigEffect";
import { UIPetKey } from "../const/UIPetConfig";


interface IListExtAttr {
    attName: string;
    curValue: number;
    nextValue: number;
}
interface IListAttr {
    //当前等级属性
    curAttr: AttrConfigEffect;
    //下一等级属性
    nextAttr: AttrConfigEffect;
}

/** 升阶成功界面 */
@bindScript(UIPetKey.PET_UP_STAGE_SUCCESS_VIEW)
export class PetUpStarSuccessView extends UICommWin {
    static pkgName: string = "pet";
    static viewName: string = "PetUpStageSuccessView";

    private _attListData: (IListExtAttr | IListAttr)[] = [];

    private get view(): ui.pet.view.PetUpStageSuccessView {
        return this._view as any;
    }

    protected onInit() {
        let view = this.view;
        view.close.onClick(this.closeSelf, this);
        view.attUpList.itemRenderer = this.attListRender.bind(this);
        view.bg.onClick(this.closeSelf, this);
    }

    protected onOpen(args: any, isReopen?: boolean) {
        let view = this.view,
            { TableManager } = G;
        let { shareStage: nextStage, shareLevel } = GIns.petModel.petContext;
        let curStage = nextStage - 1;

        let stageInfo: IListExtAttr = {
            attName: "品阶:",
            curValue: curStage,
            nextValue: nextStage,
        };
        let lvLimitInfo: IListExtAttr = {
            attName: "等级上限:",
            curValue: 0,
            nextValue: 0,
        };

        let nextCfg = TableManager.getDataById(table.pet.PetStageConfig, nextStage);

        //等级上限提升
        lvLimitInfo.curValue = nextCfg.levelCondition;
        let nextLVLimitCfg = TableManager.getDataById(table.pet.PetStageConfig, nextStage + 1);
        if (nextLVLimitCfg) {
            lvLimitInfo.nextValue = nextLVLimitCfg.levelCondition;
        } else {
            lvLimitInfo.nextValue = GIns.petCfgMgr.maxShareLV;
        }

        view.curLV.text = String(shareLevel - 1);
        view.nextLV.text = String(shareLevel);

        this._attListData = [stageInfo, lvLimitInfo];

        let curLVAttr = GIns.petCfgMgr.getLVAttr([], shareLevel - 1, curStage);
        let nextLVAttr = GIns.petCfgMgr.getLVAttr();
        curLVAttr.forEach((curV, idx)=>{
            let nextV = nextLVAttr[idx];
            this._attListData.push({
                curAttr: AttrConfigEffect.create(curV.id, curV.num),
                nextAttr: AttrConfigEffect.create(nextV.id, nextV.num)
            })
        });

        view.attUpList.numItems = this._attListData.length;
    }

    private attListRender(index: number, item: ui.pet.com.PetUpSuccessCell) {
        let data = this._attListData[index];
        if ("attName" in data) {
            //等级上限/品阶
            item.txName.text = data.attName;
            item.txCurNum.text = String(data.curValue);
            item.txLastNum.text = String(data.nextValue);
        } else {
            // 属性
            item.txName.text = "队伍" + data.curAttr.config.attrName;
            item.txCurNum.text = data.curAttr.getValueStringForUIShow();
            item.txLastNum.text = data.nextAttr.getValueStringForUIShow();
        }
    }
}
