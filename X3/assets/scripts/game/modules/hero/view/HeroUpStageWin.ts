import * as fgui from "fairygui-cc";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { TableManager } from "../../../../core/table/TableManager";
import { HeroItem } from "../../common/item/HeroItem";
import { PositionVo } from "../../formation/vo/PositionVo";
import { HeroManager } from "../HeroManager";
import { UIHeroKey } from "../const/UIHeroConfig";
import { HeroAttrItem2 } from "../item/HeroAttrItem2";
import { HeroModel } from "../model/HeroModule";
import { ItemModel } from "../../item/model/ItemModel";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { Color } from "cc";
import { FormationManager } from "../../formation/FormationManager";
import { AttrManager } from "../../attr/AttrManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { bindScript } from "../../../../core/comm/UIScriptManager";

/** 英雄(槽位)进阶确认弹窗 */
@bindScript(UIHeroKey.HERO_UP_STAGE_WIN)
export class HeroUpStageWin extends UICommWin {

    static pkgName: string = "hero";
    static viewName: string = "HeroUpStageWin";

    //槽位Vo
    private _posVo: PositionVo;
    //当前等阶配置表
    private _cfg: table.hero.HeroStageConfig;
    //下一等阶配置表
    private _nextCfg: table.hero.HeroStageConfig;

    private get view(): ui.hero.view.HeroUpStageWin {
        return this._view as any;
    }

    // args[0] : 槽位Vo
    protected onOpen(args: any): void {
        if (!args) return;
        this._posVo = args[0];
        this._cfg = TableManager.getDataById(table.hero.HeroStageConfig, this._posVo.stage)
        this._nextCfg = TableManager.getDataById(table.hero.HeroStageConfig, this._posVo.stage + 1)

        this.updateUI();
    }

    protected onInit(): void {
        let self = this.view;
        // self.btn_bg.on(fgui.Event.CLICK, this.closeSelf, this)
        self.btn_qd.on(fgui.Event.CLICK, this.onBtnClick, this)
        self.list_attr.itemRenderer = this.itemRenderer.bind(this);
    }

    private updateUI() {
        let self = this.view;
        //属性
        self.list_attr.numItems = 4;
        //等级
        self.T_stageNum.text = `${this._posVo.level}`;
        self.T_stageNextNum.text = `${this._posVo.level + 1}`;
        //头像
        //@ts-ignore
        let item = self.item_hero as HeroItem;
        let heroVo = HeroManager.ins().getHeroVoByID(this._posVo.heroId);
        item.setHeroVo(heroVo);
        self.item_hero.T_name.visible = false;
        self.item_hero.img_camp.visible = false;
        self.item_hero.img_career.visible = false;
        //技能
        self.G_skill.visible = false;

        self.btn_qd.getController("c1").selectedIndex = 1;
        let items = this._nextCfg.costItems[0];
        let itemId = Number(Object.keys(items)[0]);
        let itemNum = items[itemId];
        let itemData = ItemModel.ins().getItemById(itemId);
        self.btn_qd.T_num.text = itemNum + "";
        if (itemData && itemData.count >= itemNum) {
            self.btn_qd.T_num.color = new Color("#FFFFFF")
        } else {
            self.btn_qd.T_num.color = new Color("#FF3300")
        }
        self.btn_qd.item_icon.icon = ItemUtils.getItemConfigByItemId(itemId).smallIconPath;

        let nextLevelCfg = TableManager.getDataById(table.hero.HeroLevelConfig, this._posVo.level + 1);
        let nextLevelItems = nextLevelCfg.costItems[0];
        let itemId2 = Number(Object.keys(nextLevelItems)[0]);
        let itemNum2 = nextLevelItems[itemId2];
        let item2 = ItemModel.ins().getItemById(itemId2);
        self.btn_qd.T_num2.text = itemNum2 + "";
        if (item2 && item2.count >= itemNum2) {
            self.btn_qd.T_num2.color = new Color("#FFFFFF")
        } else {
            self.btn_qd.T_num2.color = new Color("#FF3300")
        }
        self.btn_qd.item_icon2.icon = ItemUtils.getItemConfigByItemId(itemId2).smallIconPath;
    }

    //属性item
    private itemRenderer(index: number, item: ui.hero.item.HeroAttrItem2) {
        if (index == 0) {
            item.T_name.text = "等级上限";
            let cfg = TableManager.getDataById(table.hero.HeroStageConfig, this._posVo.stage + 2);
            if (cfg) {
                item.T_nextNum.text = cfg.levelCondition + "";
            } else {
                item.T_nextNum.text = this._nextCfg.levelCondition + "";
            }
            item.T_num.text = this._posVo.level + "";
        } else {
            item.T_name.text = AttrManager.ins().getAttrName(index);
            item.T_num.text = AttrManager.ins().getPanelAttrByHeroId(this._posVo.heroId, index, null, null, null) + "";
            item.T_nextNum.text = AttrManager.ins().getPanelAttrByHeroId(this._posVo.heroId, index, this._posVo.level + 1, this._posVo.stage + 1, null) + "";
        }
    }

    //确定进阶
    private onBtnClick() {
        HeroModel.ins().sendUpLevel(this._posVo.BaseId, true);
    }
}