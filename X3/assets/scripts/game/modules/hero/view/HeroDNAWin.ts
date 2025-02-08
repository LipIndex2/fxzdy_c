/**@format */
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { UIHeroKey } from "../const/UIHeroConfig";
import { AttrConfigManager } from "db://assets/scripts/game/modules/attr/config/AttrConfigManager";
import { AttrEnum } from "../../../comm/battle/attribute/AttrEnum";
import { DNAWinType } from "../page/HeroPotentialPage";
import { TableManager } from "db://assets/scripts/core/table/TableManager";

/**
 * 英雄潜能/DNA弹窗界面
 */
@bindScript(UIHeroKey.HERO_DNA_WIN)
export class HeroInfoPreviewWin extends UICommWin {
    static pkgName: string = "hero";
    static viewName: string = "HeroDNAWin";

    private _DNAData: any;
    private _winType: number;
    private _stage: number;

    private get view(): ui.hero.view.HeroDNAWin {
        return this._view as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        //界面初始化
        this.view.attr_list.itemRenderer = this.renderList.bind(this);
    }

    public onOpen(args): void {
        this._DNAData = args.data;
        this._winType = args.type;
        this._stage = args?.stage;
        this.setTitle();
        this.view.attr_list.numItems = this._DNAData ? Object.keys(this._DNAData).length : 0;
    }

    private setTitle() {
        if (this._winType == DNAWinType.SHOW_ALL) {
            this.view.title.text = "觉醒阶段总览";
        } else {
            this.view.title.text = `觉醒阶段：阶段${this._stage}`;
        }
    }

    private renderList(index: number, itemComp: ui.hero.item.HeroDnaAttrList) {
        const data = this._DNAData[index + 1];

        // 根据 _winType 设置 tipLabel1 文本
        switch (this._winType) {
            case DNAWinType.SHOW_ALL:
                itemComp.tipLabel1.text = `第${index + 1}阶段`;
                break;

            case DNAWinType.SHOW_CUR_STAGE:
                if (index === 0) {
                    itemComp.tipLabel1.text = "该阶段的满级强化效果：";
                } else {
                    itemComp.tipLabel1.text = `该阶段强化到满级时候可开启觉醒效果\n该阶段可随机到的觉醒效果：`;
                }
                break;

            case DNAWinType.SHOW_CUR_STAGE_ALL:
                itemComp.tipLabel1.text = "该阶段可随机到的觉醒效果：";
                break;

            default:
                itemComp.tipLabel1.text = "";
        }

        // 属性列表渲染
        itemComp.attrList1.itemRenderer = (idx: number, attr: ui.hero.item.HeroDNAAttr) => {
            const curData = data[idx];

            if (this._winType === DNAWinType.SHOW_CUR_STAGE && index === 0) {
                // 显示满级强化效果
                this.renderMaxEffect(curData, attr);
            } else {
                this.renderAwakenEffect(curData, attr);
            }
        };

        // 高度适配
        itemComp.attrList1.numItems = data.length;
        const baseHeight = this._winType === DNAWinType.SHOW_CUR_STAGE ? 50 : 30;
        itemComp.attrList1.height = data.length * 45;
        itemComp.height = baseHeight + data.length * 45;
    }

    // 渲染满级强化效果
    private renderMaxEffect(curData: any, attr: ui.hero.item.HeroDNAAttr) {
        const cfg = TableManager.getDataById(table.battle.AttributeConfig, curData.id);
        if (cfg) {
            const numText = cfg.isPermyriad ? `${curData.num / 100}%` : `${curData.num}`;
            attr.attrLabel.text = cfg.attrDesc + numText;
        }
    }

    // 渲染觉醒效果
    private renderAwakenEffect(attrData: any, attr: ui.hero.item.HeroDNAAttr) {
        const spAttr = attrData.item.attrType;
        const showAttr = spAttr ? AttrConfigManager.getConfigById(spAttr) : null;

        if (showAttr) {
            const str = attrData.rangeValue.split(",");
            let min = Number(str[0]);
            let max = Number(str[1]);
            const numText1 = showAttr.isPermyriad ? `${min / 100}%` : `${min}`;
            const numText2 = showAttr.isPermyriad ? `${max / 100}%` : `${max}`;
            attr.attrLabel.text = showAttr.attrDesc + "  " + numText1 + "-" + numText2;
        }
    }

    public onClose(): void {}
}
