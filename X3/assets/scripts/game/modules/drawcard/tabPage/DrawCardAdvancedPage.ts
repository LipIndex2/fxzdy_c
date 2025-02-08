import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { DrawCardUIKeys } from "../DrawCardUIKeys";
import { DrawCardManager } from "../DrawCardManager";
import { HeroManager } from "../../hero/HeroManager";
import { HeroItem } from "../../common/item/HeroItem";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";


/**
 * 抽卡
 * 高级招募
 */
@bindFguiExtension("ui://drawCard/DrawCardAdvancedPage")
export class DrawCardAdvancedPage extends fgui.GComponent {
    static pkgName: string = "drawCard";
    static viewName: string = "DrawCardAdvancedPage";

    private get view(): ui.drawCard.tabPage.DrawCardAdvancedPage {
        return this as any;
    }

    onInit() {
        this.view.btn_addHero1.on(fgui.Event.CLICK, this.onClickAddHero, this);
        this.view.btn_addHero2.on(fgui.Event.CLICK, this.onClickAddHero, this);
        this.view.btn_selHero.on(fgui.Event.CLICK, this.onClickAddHero, this);
    }

    public updateUI() {
        this.view.anim.alpha = 1;
        this.updateHeroInfo()
    }

    public playDrawEffect(): void {
        this.view.getTransition("t0").play();
    }

    //心愿英雄
    private updateHeroInfo() {
        if (DrawCardManager.ins().upHeroId > 0) {
            this.view.heroItem.visible = true;
            //@ts-ignore
            let item = this.view.heroItem as HeroItem;
            item.isShowName(false);
            let heroVo = HeroManager.ins().getHeroVoByID(DrawCardManager.ins().upHeroId);
            item.setHeroVo(heroVo, true);
            item.isShowLevel(false);
            //名字
            item.isShowName(false);

            item.setClickFun(this.onClickAddHero);
            this.view.btn_addHero1.visible = false;
            this.view.btn_addHero2.visible = false;
            //@ts-ignore
            this.view.anim.loadByModelId(heroVo.heroCfg.showModelId, true);
            //@ts-ignore
            this.view.anim.play("idle", true);
            this.view.anim.setScale(-3, 3)
            this.view.anim.visible = true;
            this.view.btn_selHero.visible = true;
        } else {
            this.view.btn_addHero1.visible = true;
            this.view.btn_addHero2.visible = true;
            this.view.heroItem.visible = false;
            this.view.anim.visible = false;
            this.view.btn_selHero.visible = false;
        }
    }

    //选择心愿英雄(打开心愿英雄界面)
    private onClickAddHero() {
        G.UIManager.open(DrawCardUIKeys.DrawCardWishWin)
    }
}