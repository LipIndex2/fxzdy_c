import * as fgui from "fairygui-cc";
import { HeroVo } from "../HeroVo";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { Color } from "cc";
import { PositionVo, SoltVoData } from "../../formation/vo/PositionVo";
import { FormationManager } from "../../formation/FormationManager";
import { HeroModel } from "../model/HeroModule";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UIHeroKey } from "../const/UIHeroConfig";
import G from "../../../../core/comm/G";
import NotificationKey from "../../../event/NotificationKey";
import { ItemI18nKeys } from "../../item/const/ItemI18nKeys";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { EnumRedDotShowType } from "../../common/redDot/enums/EnumRedDotShowType";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { RedDotUtils } from "../../common/redDot/utils/RedDotUtils";
import { RedDotManager } from "../../common/redDot/RedDotManager";
import { EnumRedDotReadType } from "../../common/redDot/enums/EnumRedDotReadType";
import { QualityUtils } from "db://assets/scripts/game/modules/common/quality/QualityUtils";
import { Tween } from "cc";

/** 英雄item */
export class HeroItem2 extends fgui.GComponent {
    static pkgName: string = "hero";
    static viewName: string = "HeroItem2";

    //英雄vo
    private _heroVo: HeroVo;
    //槽位vo
    private _soltVo: PositionVo;

    public mc: fgui.GGroup;

    private get view(): ui.hero.item.HeroItem2 {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onConstruct(): void {
        this.onInit();
        this.mc = this.view.mc;
    }

    protected onPreDispose(): void {
        Tween.stopAllByTarget(this.view)
    }
    protected onInit() {
        this.view.on(fgui.Event.CLICK, this.onBtnClick, this);

    }

    public setHeroVo(heroVo: HeroVo) {
        if (!heroVo) return;
        this._heroVo = heroVo;
        if (this._heroVo.posId) {
            this._soltVo = FormationManager.ins().getPosVoById(this._heroVo.posId);
        }

        this.updateUI();
    }

    private updateUI() {
        let self = this.view;
        let heroVoData = this._heroVo.heroVoData;
        let heroCfg = this._heroVo.heroCfg;

        self.G_activate.visible = !heroVoData.isActivate && this._heroVo.fragment >= heroCfg.activeCostFragment;
        self.G_star.visible = heroVoData.isActivate;
        // self.img_hero.icon = ItemUtils.getHalfHeroHead(heroCfg.headPath);
        self.img_hero.icon = ItemUtils.getHalfHeroHead(this._heroVo.headPath);

        //策划要改成显示职业
        self.img_camp.icon = ItemUtils.getCareerIcon(ServerEnums.Career[heroCfg.career]);

        if (heroVoData.isActivate) {
            //已激活
            // self.T_level.color = new Color("#ffffff")

            let num = (this._heroVo.star - 1) % 5 + 1;
            self.stars.icon = ItemUtils.getStarIcon(this._heroVo.star);
            self.stars.width = 44 * num;
            self.stars.height = 39;

            if (this._soltVo) {
                self.T_level.text = this._soltVo.level + "";
            } else {
                self.T_level.text = FormationManager.ins().getCommonLevel() + "";
            }
        } else {
            //未激活
            // self.T_level.color = new Color("#7ffa82");
            self.T_level.text = this._heroVo.fragment + "/" + heroCfg.activeCostFragment;
        }

        self.T_name.text = heroCfg.name;
        QualityUtils.setFGUIFontColorByQuality(self.T_name, heroCfg.quality);
        
        self.T_name.strokeColor = ItemUtils.getTextOutlineColor(heroCfg.quality);
        self.img_quality.icon = ItemUtils.getHeroItem2Bg(heroCfg.quality);

        
        // 红点  升星》升级
        if (this._heroVo.isCanUpStar()) {
            FguiScriptUtils.toMyScriptClass(this.view.redDot1, RedDotCom).reset(RedDotKeys.Hero_item_star, [heroCfg.id]);
        } else if (this._heroVo.isCanUpgrade()) {
            FguiScriptUtils.toMyScriptClass(this.view.redDot1, RedDotCom).reset(RedDotKeys.Hero_item_train, [heroCfg.id]);
            if (this._heroVo.isCanUpStage()) {
                FguiScriptUtils.toMyScriptClass(this.view.redDot2, RedDotCom).reset(RedDotKeys.Hero_item_train, [heroCfg.id]);
            }
        } else if (!this._heroVo.heroVoData.isActivate) {
            FguiScriptUtils.toMyScriptClass(this.view.redDot1, RedDotCom).reset(RedDotKeys.Hero_item_activate, [heroCfg.id]);
        } else {
            FguiScriptUtils.toMyScriptClass(this.view.redDot1, RedDotCom).reset(RedDotKeys.Hero_item, [heroCfg.id]);
        }

        // DNA/英雄潜能显示
        const dnaInfo = this._heroVo.getDNAInfo()
        if (dnaInfo.awaken && Object.keys(dnaInfo.awaken).length > 0){
            const stages = Object.keys(dnaInfo.awaken);
            self.dnaShow.rotation = 270;
            stages.forEach(stage => {
                self.dnaShow.getChild(`stage${stage}`).visible = true;
            });     
        } else {
            self.dnaShow.visible = false;
        }
    }

    private onBtnClick() {
        let heroVoData = this._heroVo.heroVoData;
        let heroCfg = this._heroVo.heroCfg;
        if (!heroVoData.isActivate) {
            if (heroVoData.fragment >= heroCfg.activeCostFragment) {
                HeroModel.ins().sendActive(heroVoData.baseId);
            } else {
                // GIns.floatingTextMgr.showTips(ItemI18nKeys.HERO_INSUFFICIENT_FRAGMENTATION)
            }
        } else {
            UIManager.ins().open(UIHeroKey.HERO_INFO_WIN, heroVoData.baseId);
        }
    }

}
