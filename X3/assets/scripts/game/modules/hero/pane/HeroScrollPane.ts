import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { GListEffectType } from "../../../../core/prototypes/FguiGListEffect";
import { FormationManager } from "../../formation/FormationManager";
import { PositionVo } from "../../formation/vo/PositionVo";
import { HeroManager } from "../HeroManager";
import { HeroVo } from "../HeroVo";
import { HeroItem2 } from "../item/HeroItem2";




export class HeroScrollPane extends fgui.GScrollBar {
    static pkgName: string = "hero";
    static viewName: string = "HeroScrollPane";

    /** 筛选过的英雄列表 */
    private _heroVos: HeroVo[] = [];

    private _upHeros = [];

    private _isFirstUpdate: boolean = true

    private get view(): ui.hero.pane.HeroScrollPane {
        return this as any;
    }


    constructor() {
        super();
    }

    protected onConstruct(): void {
        this.onInit();
    }

    public setData(heroVos: HeroVo[]) {
        this._heroVos = heroVos;
        this.updateInfo();
    }

    onInit() {
        let self = this.view;
        self.list_upHero.setVirtual();
        self.list_hero.setVirtual();
        self.list_upHero.isLoadInFrames = true;
        self.list_hero.isLoadInFrames = true;
        self.list_upHero.effectType = GListEffectType.FADE_IN
        self.list_hero.effectType = GListEffectType.FADE_IN
        self.list_upHero.effectParams = { delay: 0.3, interval: 0.1 }
        self.list_hero.effectParams = { interval: 0.1, endIndex:5 }
        self.list_upHero.itemRenderer = this.heroFormationRenderer.bind(this)
        self.list_hero.itemRenderer = this.heroListRenderer.bind(this)
    }

    onPreDispose() {
        G.GameTimer.clearAll(this);
    }

    //更新UI信息
    private updateInfo() {
        let self = this.view;
        this._upHeros = FormationManager.ins().getHeroInPosVos();
        this._upHeros.sort((a: PositionVo, b: PositionVo) => {
            let heroVoA = HeroManager.ins().getHeroVoByID(a.heroId);
            let heroVoB = HeroManager.ins().getHeroVoByID(b.heroId);
            if (heroVoA.Level != heroVoB.Level) {
                return heroVoB.Level - heroVoA.Level;
            }
        })
        self.list_upHero.numItems = this._upHeros.length;

        if (this._isFirstUpdate) {
            this._isFirstUpdate = false
            G.GameTimer.once(450, this, () => {
                //其他角色延迟加载需要等待屏幕适配完成才行
                if (this.view.node?.isValid) {
                    self.list_hero.refreshTimes = 0
                    self.list_hero.numItems = this._heroVos.length;
                    self.list_hero.resizeToFit();
                }
            })
        } else {
            self.list_hero.numItems = this._heroVos.length;
            self.list_hero.resizeToFit();
        }
    }

    /** 上阵英雄 */
    private heroFormationRenderer(index: number, item: HeroItem2) {
        let posVo = this._upHeros[index];
        let heroVo = HeroManager.ins().getHeroVoByID(posVo.heroId);
        item.setHeroVo(heroVo);
    }

    /** 共鸣英雄列表 */
    private heroListRenderer(index: number, item: HeroItem2) {
        let heroVo = this._heroVos[index];
        item.setHeroVo(heroVo);
    }
}