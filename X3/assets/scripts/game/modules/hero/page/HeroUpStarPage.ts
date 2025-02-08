import * as fgui from "fairygui-cc";
import { HeroVo } from "../HeroVo";
import { HeroFragmentBarItem } from "../item/HeroFragmentBarItem";
import { HeroModel } from "../model/HeroModule";
import { AttrManager } from "../../attr/AttrManager";
import { HeroManager } from "../HeroManager";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import GIns from "../../../GIns";
import { Logger } from "db://assets/scripts/core/log/Logger";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { EventClickItem } from "db://assets/scripts/game/modules/item/event/EventClickItem";
import { HeroConfigManager } from "db://assets/scripts/game/modules/hero/config/HeroConfigManager";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";

/** 英雄升星页 */
export class HeroUpStarPage extends fgui.GComponent {
    static pkgName: string = "hero";
    static viewName: string = "HeroUpStar";

    private _baseId: number = 0;
    private _heroVo: HeroVo;
    private _starCfg: table.hero.HeroStarConfig;
    private _starNextCfg: table.hero.HeroStarConfig;
    private _fragmentItemConfig: table.item.ItemConfig;

    private get view(): ui.hero.page.HeroUpStar {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onConstruct(): void {
        this.onInit();
    }

    protected onInit() {
        this.view.btn_Up.on(fgui.Event.CLICK, this.onUpBtnClick, this);
        this.view.list_attr.itemRenderer = this.attrItem.bind(this);
        this.view.HeroStarItem.list_star1.itemRenderer = this.starItem.bind(this);
        this.view.HeroStarItem.list_star2.itemRenderer = this.starItem2.bind(this);
    }

    /**
     * 更新信息
     * @param baseId 英雄id
     */
    public updateInfo(baseId: number) {
        if (!baseId) {
            return;
        }
        this._baseId = baseId;
        this._heroVo = HeroManager.ins().getHeroVoByID(this._baseId);
        this._starCfg = this._heroVo.getHeroStarCfg();
        this._starNextCfg = this._heroVo.getHeroStarCfg(this._heroVo.star + 1);
        this._fragmentItemConfig = HeroConfigManager.getHeroFragmentItemConfigByHeroId(baseId);

        this.view.list_attr.numItems = 3;
        this.updateUI();

        this.view.btn_Up.getController("c1").selectedIndex = 0;

        // [红点]
        FguiScriptUtils.toMyScriptClass(this.view.btn_Up.redDot1, RedDotCom).reset(RedDotKeys.Hero_item_star, [this._heroVo.heroCfg.id]);
    }

    private updateUI() {
        let self = this.view;
        self.getController("c1").selectedIndex = 1;
        self.HeroStarItem.getController("c1").selectedIndex = 1;
        if (this._starNextCfg) {
            self.getController("c1").selectedIndex = 0;
            self.HeroStarItem.getController("c1").selectedIndex = 0;
            let nextNum = this._starNextCfg.star % 5;
            self.HeroStarItem.list_star2.numItems = nextNum == 0 ? 5 : nextNum;
            self.btn_Up.T_num.text = this._starNextCfg.cost + "";
            let smallIconPath = ItemUtils.getItemConfigByItemId(this._heroVo.heroCfg.fragmentItemId).smallIconPath;
            self.btn_Up.item_icon.icon = smallIconPath;
        }
        let num = this._heroVo.star % 5;
        self.HeroStarItem.list_star1.numItems = num == 0 ? 5 : num;

        //@ts-ignore
        let HeroBar = self.HeroBar as HeroFragmentBarItem;
        HeroBar.updateInfo(this._baseId);
    }

    //属性item
    private attrItem(index: number, item: ui.hero.item.HeroAttrItem) {
        item.getController("c1").selectedIndex = 0;
        if (this._starNextCfg) {
            item.getController("c1").selectedIndex = 1;
            item.T_nextNum.text = Math.round((1 + this._starNextCfg.attrModifier / 10000) * 100) + "%";
        }

        item.T_num.text = this._starCfg ? Math.round((1 + this._starCfg.attrModifier / 10000) * 100) + "%" : "100%";
        item.T_name.text = AttrManager.ins().getAttrName(index + 1);

        item.img_icon.icon = AttrManager.ins().getAttrIcon(index + 1);
    }

    private onUpBtnClick(event: FGUI.Event) {
        if (!this._starNextCfg) {
            return;
        }

        Logger.game("点击了升星");

        const costCount = this._starNextCfg.cost;
        const haveFragmentCount = this._heroVo.fragment;
        const isCanLvUp = haveFragmentCount >= costCount;
        if (isCanLvUp) {
            HeroModel.ins().sendUpStar(this._heroVo.baseId);
        } else {
            //道具不足
            // GIns.floatingTextMgr.showTips(`道具不足`);
            const arg = EventClickItem.create(
                event,
                this._fragmentItemConfig,
                this.view.btn_Up._uiTrans
            );
            FacadeManager.ins().emit(NotificationKey.CLICK_ITEM, arg);
        }

    }

    private starItem(index: number, item: ui.comm.item.StarIconItem) {
        item.starIcon.icon = ItemUtils.getStarIcon(this._heroVo.star);
    }

    private starItem2(index: number, item: ui.comm.item.StarIconItem) {
        item.starIcon.icon = ItemUtils.getStarIcon(this._starNextCfg.star);
    }
}
