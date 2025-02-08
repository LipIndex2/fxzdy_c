import * as fgui from "fairygui-cc";
import { HeroVo } from "../../hero/HeroVo";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { FormationManager } from "../../formation/FormationManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { Color } from "cc";
import { QualityUtils } from "db://assets/scripts/game/modules/common/quality/QualityUtils";
import { Tween } from "cc";
import { FightType } from "../../../comm/battle/enum/FightType";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UIViewItemDetailsKey } from "../../itemDetails/UIViewItemDetailsKey";
import { HeroItemTipsViewOpenArgs } from "../../itemDetails/HeroItemTipsView";

/** 英雄筛选列表item */
export class HeroItem extends fgui.GComponent {
    static pkgName: string = "comm";
    static viewName: string = "HeroItem";

    //英雄Vo
    private _heroVo: HeroVo;

    //点击事件
    private _fun: Function;

    //是否使用初始数据
    private _isNew: boolean = false;

    //设置星级
    private _star: number = 0;

    private _fightType;

    private get view(): ui.comm.item.HeroItem {
        return this as any;
    }

    /**
     * 设置英雄vo
     * @param heroVo 英雄Vo
     * @param isNew  是否使用初始数据
     */
    public setHeroVo(heroVo: HeroVo, isNew: boolean = false, fightType: number = null) {
        this._heroVo = heroVo;
        this._isNew = isNew;
        this._fightType = fightType;
        const isLock = heroVo.isLock;
        this.view.getController("isLock").selectedIndex = isLock ? 1 : 0;
        this.updateUI();
    }

    public setLockTip(str: string, color: Color): void {
        this.view.getController("isLock").selectedIndex = 2;
        this.view.lbLockTip.text = str;
        if (color) {
            this.view.lbLockTip.color = color;
        }
    }

    /** 设置点击事件 */
    public setClickFun(fun: Function) {
        this._fun = fun;
    }

    constructor() {
        super();
    }

    onInit() {
        this.view.on(fgui.Event.CLICK, this.onBtnClick, this);
        this.view.list_star.itemRenderer = this.starItem.bind(this);
    }

    protected onPreDispose(): void {
        Tween.stopAllByTarget(this.view);
    }

    private updateUI() {
        let self = this.view;
        const quality = this._heroVo.heroCfg.quality;
        self.img_frame.icon = ItemUtils.getQualityIconResourcePath(quality);
        // self.img_item.icon = ItemUtils.getNormalHeroHead(this._heroVo.heroCfg.headPath);
        self.img_item.icon = ItemUtils.getNormalHeroHead(this._heroVo.headPath);
        self.img_camp.icon = ItemUtils.getCampIcon(this._heroVo.heroCfg.camp);
        self.img_career.icon = ItemUtils.getCareerIcon(ServerEnums.Career[this._heroVo.heroCfg.career]);

        self.T_name.text = this._heroVo.heroCfg.name;
        QualityUtils.setFGUIFontColorByQuality(self.T_name, quality);

        let num = 0;
        if (this._isNew) {
            num = this._heroVo.heroCfg.initStar;
        } else {
            num = this._heroVo.star % 5;
        }
        self.list_star.numItems = num == 0 ? 5 : num;

        let level = 1;
        if (!this._isNew) {
            if (this._heroVo.posId) {
                if (this._fightType == FightType.TEAM_INSTANCE) {
                    const tPos = FormationManager.ins().getSoltTop();
                    const poses = FormationManager.ins().getPoses() || [];
                    const index = poses.indexOf(this._heroVo.posId);
                    if (index == -1) {
                        let soltVo = FormationManager.ins().getPosVoById(this._heroVo.posId);
                        level = soltVo.level;
                    } else {
                        let soltVo = FormationManager.ins().getPosVoById(tPos[index]);
                        level = soltVo.level;
                    }
                } else {
                    let soltVo = FormationManager.ins().getPosVoById(this._heroVo.posId);
                    level = soltVo.level;
                }
            } else {
                level = FormationManager.ins().getCommonLevel();
            }
        }
        self.T_level.text = level + "";

        // DNA/英雄潜能显示
        const dnaInfo = this._heroVo.getDNAInfo()
        if (dnaInfo && dnaInfo.awaken && Object.keys(dnaInfo.awaken).length > 0){
            const stages = Object.keys(dnaInfo.awaken);
            this.view.dnaShow.rotation = 270;
            stages.forEach(stage => {
                this.view.dnaShow.getChild(`stage${stage}`).visible = true;
            });     
        } else {
            this.view.dnaShow.visible = false;
        }
    }

    private onBtnClick() {
        if (this._fun) {
            this._fun();
        }
    }

    private starItem(index: number, item: ui.comm.item.StarIconItem) {
        let icon = "";
        if (this._star > 0) {
            icon = ItemUtils.getStarIcon(this._star);
        } else if (this._isNew) {
            icon = ItemUtils.getStarIcon(this._heroVo.heroCfg.initStar);
        } else {
            icon = ItemUtils.getStarIcon(this._heroVo.star);
        }
        item.starIcon.icon = icon;
    }

    /** 默认用的是主线的等级，其他玩法等级需要重新设置一下 */
    public setLevel(level: number) {
        this.view.T_level.text = level + "";
    }

    /** 是否显示选中框 */
    public isShowGou(isShow: boolean) {
        this.view.G_gou.visible = isShow;
    }

    /** 是否显示右上角选中框 */
    public isShowSmallGou(isShow: boolean) {
        this.view.G_smallCheck.visible = isShow;
    }

    /** 是否显示名字 */
    public isShowName(isShow: boolean) {
        this.view.T_name.visible = isShow;
    }

    /** 是否显示星级 */
    public isShowStar(isShow: boolean) {
        this.view.G_star.visible = isShow;
    }

    /** 是否显示等级 */
    public isShowLevel(isShow: boolean) {
        this.view.T_level.visible = isShow;
    }

    /** 是否显示职业 */
    public isShowCareer(isShow: boolean) {
        this.view.img_career.visible = isShow;
    }

    /** 是否显示阵营 */
    public isShowCamp(isShow: boolean) {
        this.view.img_camp.visible = isShow;
    }

    /** 设置星级 */
    public setStar(num: number) {
        this._star = num;
        num = num % 5;
        this.view.list_star.numItems = num == 0 ? 5 : num;
    }

    /** 是否显示锁 */
    public isShowLock(isShow: boolean) {
        this.view.getController("isLock").selectedIndex = isShow ? 1 : 0;
    }

    /** 设置点击显示详情界面 */
    public setClickShowDetail() {
        this.setClickFun(this.onBtnClickDetail);
    }

    //详情弹窗
    private onBtnClickDetail() {
        let itemConfig = ItemUtils.getItemConfigByItemId(this._heroVo.heroCfg.id);
        UIManager.ins().open(UIViewItemDetailsKey.HeroCardDetails, {
            itemConfig: itemConfig,
        } as HeroItemTipsViewOpenArgs);
    }
}
