import * as fgui from "fairygui-cc";
import { HeroUtils } from "db://assets/scripts/game/modules/hero/utils/HeroUtils";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import G from "db://assets/scripts/core/comm/G";
import { ModelUtils } from "db://assets/scripts/game/modules/common/model/ModelUtils";
import { QualityUtils } from "db://assets/scripts/game/modules/common/quality/QualityUtils";
import { tween, v3 } from "cc";
import { DrawCardUtils } from "db://assets/scripts/game/modules/drawcard/utils/DrawCardUtils";
import { UIView } from "db://assets/scripts/core/mvc/view/UIView";
import { ItemConfigManager } from "db://assets/scripts/game/modules/item/config/ItemConfigManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { AttrData } from "db://assets/scripts/game/modules/attr/AttrManager";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { HeroModel } from "../model/HeroModule";
import NotificationKey from "../../../event/NotificationKey";
import { FloatingTextManager } from "../../floatingText/FloatingTextManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIHeroKey } from "../const/UIHeroConfig";
import GIns from "../../../GIns";

/**
 * 抽卡得到新英雄的界面
 */
@bindScript(UIHeroKey.HERO_SKIN_FIRST_GET_VIEW)
export class HeroSkinFirstGetView extends UIView {
    static pkgName: string = "hero";

    static viewName: string = "HeroSkinFirstGetView";

    private _attrArray: AttrData[] = [];
    protected _skinId: number = 0;

    private get view(): ui.hero.view.HeroSkinFirstGetView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.HERO_SKIN_WEAR];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.HERO_SKIN_WEAR:
                GIns.floatingTextMgr.showTips(`穿戴成功`);
                this.closeSelf();
                break;
        }
    }

    protected onInit() {
        super.onInit();
        this.view.bg.on(fgui.Event.CLICK, this.closeSelf, this);
        this.view.btn_wear.onClick(this.onBtnOkClick, this);
        this.view.list_attr.setVirtual();
        this.view.list_attr.itemRenderer = this.irAttr.bind(this);
    }

    private irAttr(index: number, item: ui.hero.item.HeroSkinFirstGetAttrItem): void {
        let skinCfg = G.TableManager.getDataById(table.hero.HeroSkinConfig, this._skinId);
        let data = skinCfg.attrs[index];
        let cfg = G.TableManager.getDataById(table.battle.AttributeConfig, data.k);
        item.lb_name.text = "全体" + cfg.attrName;
        item.lb_attr.text = cfg.isPermyriad ? data.v / 100 + "%" : data.v;
        item.lb_attr.x = 100;
    }

    protected onOpen(args: number) {
        super.onOpen(args);

        this.reset(args);
    }

    protected onClose() {
        super.onClose();
    }

    private onBtnOkClick() {
        let skinCfg = G.TableManager.getDataById(table.hero.HeroSkinConfig, this._skinId);
        HeroModel.ins().sendSkinWear(skinCfg.heroBaseId, skinCfg.id);
    }

    @LogBusiness("皮肤解锁")
    private reset(skinId: number) {
        // item
        const itemConfig = ItemConfigManager.getItemConfigByItemId(skinId);
        if (itemConfig == null) {
            console.error(`没找到道具配置. itemId = ${skinId}`);
            return;
        }

        // config
        let quality = itemConfig.quality;
        let qualityConfig: table.quality.QualityConfig = QualityUtils.getQualityConfigById(quality);
        let modelConfig: table.model.ModelConfig;

        this._skinId = skinId;

        let itemCfg = ItemUtils.getItemConfigByItemId(skinId);
        let skinCfg = G.TableManager.getDataById(table.hero.HeroSkinConfig, skinId);
        // hero
        const heroConfig: table.hero.HeroConfig = HeroUtils.getHeroConfigById(skinCfg.heroBaseId);
        if (!heroConfig) {
            G.Logger.error(`配置有误. 不存在 heroId=${skinId}`);
            return;
        }

        // quality
        quality = itemCfg.quality;
        qualityConfig = QualityUtils.getQualityConfigById(quality);
        if (!qualityConfig) {
            G.Logger.error(`配置有误. 不存在 qualityId=${quality}`);
            return;
        }

        this.view.lb_name.text = itemCfg.name;
        this.view.lb_name1.text = itemCfg.name;

        // 展示用的模型id
        const showModelId = skinCfg.showModelId;

        // hero 字体颜色
        this.view.lb_name.color = QualityUtils.getQualityColor(quality);

        // model
        modelConfig = ModelUtils.getModelConfigById(showModelId);
        if (!modelConfig) {
            return;
        }

        this.view.img_bg_qua.node.scale = v3(0, 0, 1);
        this.view.lb_name1.node.scale = v3(0, 0, 1);
        // spine 英雄
        const spineRootNode = this.view.spineHero.node;
        spineRootNode.removeAllChildren();
        ModelUtils.createSpineByModelConfig(modelConfig, spineRootNode).then((it) => {
            //console.log("spine done", it)
            // 缩放
            const showHeroScale = DrawCardUtils.getShowHeroScale();
            G.Logger.debug(`英雄大小 spine 缩放 = ${showHeroScale}`);

            it.node.scale = v3(0, 0, 1);
            tween(it.node)
                .to(0.5, { scale: v3(showHeroScale, showHeroScale, 1) })
                .start();
            tween(this.view.img_bg_qua.node)
                .to(0.5, { scale: v3(1, 1, 1) })
                .start();
            tween(this.view.lb_name1.node)
                .to(0.5, { scale: v3(1, 1, 1) })
                .start();
        });

        // hero quality
        this.view.list_attr.numItems = skinCfg.attrs.length;
        this.view.imageQuality.icon = qualityConfig.qualityTitleIconPath;
        this.view.img_bg_qua.icon = ItemUtils.getHeroSkinBg(quality);
    }
}
