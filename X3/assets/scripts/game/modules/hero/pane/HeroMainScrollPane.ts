import * as fgui from "fairygui-cc";
import { HeroScrollPane } from "./HeroScrollPane";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UIHeroKey } from "../const/UIHeroConfig";
import { UIFormationKey } from "../../formation/const/UIFormationConfig";
import { FormationManager } from "../../formation/FormationManager";
import { HeroVo } from "../HeroVo";
import { RuleController } from "../../rule/RuleController";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import GIns from "../../../GIns";

export class HeroMainScrollPane extends fgui.GScrollBar {
    static pkgName: string = "hero";
    static viewName: string = "HeroMainScrollPane";

    private sel = 0;

    private get view(): ui.hero.pane.HeroMainScrollPane {
        return this as any;
    }

    constructor () {
        super();
    }

    protected onConstruct(): void {
        this.onInit();
    }

    onInit() {
        let self = this.view;

        self.btn_camp.on(fgui.Event.CLICK, this.onBtnClick, this);
        // self.heroListItem.on(fgui.Event.SCROLL, this.scroll, this);
        self.heroListItem.on(fgui.Event.TOUCH_END, this.scrollEnd, this);
        self.btn_tips2.onClick(this.onClickRule, this);
    }

    public setData(heroVos: HeroVo[]) {
        //@ts-ignore
        this.view.heroListItem.setData(heroVos);
        this.updateUI();
    }

    updateUI() {
        let self = this.view;

        //共鸣等级
        self.T_gmLevel.text = "" + FormationManager.ins().getCommonLevel();
    }

    private onBtnClick(evt: any) {
        let btn = evt.currentTarget;

        switch (btn.name) {
            case "btn_camp":
                if (GIns.battleMgr.battleLogic.canOpenFormation()) {
                    UIManager.ins().open(UIFormationKey.FORMATION_MAIN_VIEW);
                } else {
                    GIns.floatingTextMgr.showTips("返回母舰或安全区可以布阵");
                }
                break;
        }
    }

    protected onClickRule(): void {
        RuleController.ins().openRule(EnumRuleKeys.COMMON_LEVEL, this.view.btn_tips2);
    }

    private scroll(evt: any) {
        // console.log(this.view.heroListItem.scrollPane.percY);
        // console.log("scrollingPosY = " + this.view.heroListItem.scrollPane.scrollingPosY);
    }

    private scrollEnd(evt: any) {
        // if(this.view.heroListItem.scrollPane.percY <= 0){
        //     this.view.heroListItem.scrollPane.touchEffect = false;
        // }
        // if(this.view.heroListItem.scrollPane.percY >= 1){
        //     this.view.heroListItem.scrollPane.setPercY(1,true)
        // }else if(this.view.heroListItem.scrollPane.percY <= 0){
        //     this.view.heroListItem.scrollPane.setPercY(0,true)
        // }
    }
}
