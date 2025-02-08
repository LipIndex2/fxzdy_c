import * as fgui from "fairygui-cc";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { FormationManager } from "../../formation/FormationManager";
import { HeroUtils } from "db://assets/scripts/game/modules/hero/utils/HeroUtils";
import { QualityUtils } from "db://assets/scripts/game/modules/common/quality/QualityUtils";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UIViewItemDetailsKey } from "../../itemDetails/UIViewItemDetailsKey";
import { HeroItemTipsViewOpenArgs } from "../../itemDetails/HeroItemTipsView";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";

/**
 * 英雄item
 * - 纯展示用 | 非养成
 */
export class CommonHeroItemComp extends fgui.GComponent {
    static pkgName: string = "comm";
    static viewName: string = "CommonHeroItemComp";

    //槽位vo
    private _heroId: number;
    private _lv: number;
    private _starCount: number;
    private _skinId: number;
    private _config: table.hero.HeroConfig;

    private _isCanClick = false;

    private get view(): ui.comm.hero.components.CommonHeroItemComp {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onConstruct(): void {
        this.view.list_star.itemRenderer = this.starItem.bind(this);

        this.view.on(fgui.Event.CLICK, this.onClickItem, this);
    }

    reset(heroId: number, lv: number, starCount: number, skinId: number = 0) {
        this._heroId = heroId;
        this._lv = lv || 1;
        this._starCount = starCount;
        this._skinId = skinId;
        this._config = HeroUtils.getHeroConfigById(heroId);

        this.updateUI();
    }

    private updateUI() {
        const self = this.view;

        const heroConfig = this._config;
        if (!heroConfig) {
            console.error(`heroConfig is null. heroId = ${this._heroId} `);
            return;
        }
        let headPath: string = HeroUtils.getShowTypeById(this._heroId, this._skinId, "headPath") as string;
        self.img_hero.icon = ItemUtils.getHalfHeroHead(headPath);

        self.img_camp.icon = ItemUtils.getCampIcon(heroConfig.camp);
        this.view.img_camp.setScale(1, 1);

        //已激活

        let num = this._starCount % 5;
        self.list_star.numItems = num == 0 ? 5 : num;

        self.T_level.text = this._lv + "";
        self.T_name.text = heroConfig.name;
        QualityUtils.setFGUIFontColorByQuality(self.T_name, heroConfig.quality);

        self.T_name.strokeColor = ItemUtils.getTextOutlineColor(heroConfig.quality);
        self.img_quality.icon = ItemUtils.getHeroItem2Bg(heroConfig.quality);
    }

    private starItem(index: number, item: ui.comm.item.StarIconItem) {
        item.starIcon.icon = ItemUtils.getStarIcon(this._starCount);
    }

    private onClickItem() {
        if (!this._isCanClick) return;
        let itemConfig = ItemUtils.getItemConfigByItemId(this._heroId);
        UIManager.ins().open(UIViewItemDetailsKey.HeroCardDetails, {
            itemConfig: itemConfig,
        } as HeroItemTipsViewOpenArgs);
    }

    /** 是否显示名字 */
    public isShowName(isShow: boolean) {
        this.view.T_name.visible = isShow;
    }

    /** 是否显示核心标签 */
    public isShowCore(isShow: boolean) {
        this.view.getController("isCore").selectedIndex = isShow ? 1 : 0;
    }

    /** 是否可以点击 */
    public isCanClick(isCan: boolean) {
        this._isCanClick = isCan;
    }

    /** 显示职业(默认是阵营) */
    public showCareer() {
        this.view.img_camp.icon = ItemUtils.getCareerIcon(ServerEnums.Career[this._config.career]);
        this.view.img_camp.setScale(0.7, 0.7);
    }

    /** 是否显示星级 */
    public isShowStar(isShow: boolean) {
        this.view.G_star.visible = isShow;
    }

    /** 是否显示等级 */
    public isShowLevel(isShow: boolean) {
        this.view.G_Level.visible = isShow;
    }
}
