import * as fgui from "fairygui-cc";
import { HeroSkillData, HeroVo } from "../HeroVo";
import { HeroManager } from "../HeroManager";
import { TableManager } from "../../../../core/table/TableManager";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { SkillConfigDatas } from "../../../table/battle/SkillConfigDatas";
import { color, Color, v3, Vec3 } from "cc";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { FloatingTextManager } from "../../floatingText/FloatingTextManager";
import { SkillConfigManager } from "db://assets/scripts/game/comm/battle/skill/config/SkillConfigManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIHeroKey } from "../const/UIHeroConfig";
import GIns from "../../../GIns";
import { HeroStarConfigDatas } from "../../../table/hero/HeroStarConfigDatas";


export enum FeatureType {
    PreCD = 0,
    CD = 1,
    Range = 2,
}

export type SkillInfoWinOpenArgs = {
    // SkillConfig.id
    skillId: string,
    groupId?: string,
    heroId?: number,
    isTop?: boolean,
    data?: HeroSkillData
    // 显示等级 default true
    isNeedLv?: boolean

    petCfgId?: number
    collectionCfgId?: number
};

/**
 * 英雄信息界面
 */
@bindScript(UIHeroKey.SkillInfoWin)
export class SkillInfoWin extends UIWin {

    static pkgName: string = "hero";
    static viewName: string = "SkillInfoWin";

    //技能组id
    private _groupId: string = "";
    private _skillId: string = "";
    private _heroVo: HeroVo;

    private _petVo: Vo.pet.PetVo
    private _collectionVo: XJ.collections.collectionsVo
    //技能data
    private _skillData: HeroSkillData;
    //技能组cfg
    private _skillCfgs: table.battle.SkillConfig[] = [];

    /**范围文本前缀 */
    private _featrueRangeTextMainKey = "i18n:heroSkillRange:"; //i18n:heroSkillRange:S
    private _featrueImg = ["ui://comm/cooldown_icon", "ui://comm/cooldown_icon", "ui://comm/range_icon",]
    private _featrueImgColor = ["#7efcfb", "#a7c7ff", "#a7c7ff"];
    private _featureArr: { type: FeatureType, desc: string }[];
    private _isTop: boolean = false;
    private _oldPos: Vec3 = v3();
    private _isNeedLv: boolean = true;

    private get view(): ui.hero.view.SkillInfoWin {
        return this._view as any;
    }

    onInit() {
        this.view.img_bg.on(fgui.Event.CLICK, this.closeSelf, this);
        this.view.featureList.on(fgui.Event.CLICK_ITEM, this.onClickFeatrue, this);
        this.view.list.itemRenderer = this.skillItem.bind(this);
        this.view.featureList.itemRenderer = this.featrueRender.bind(this);

        this._oldPos = this.view.node.position.clone();
    }

    /**
     *
     * @param data groupId是技能组   skillId是技能Id（怪物使用）
     */
    protected onOpen(data: SkillInfoWinOpenArgs): void {
        const skillId = data.skillId;
        this._isTop = data.isTop || false;
        this._isNeedLv = data.isNeedLv == null ? true : data.isNeedLv;
        this._skillId = skillId;

        const skillConfigById = SkillConfigManager.getSkillConfigById(skillId);
        if (skillConfigById) {
            this._groupId = skillConfigById.group;
        } else {
            this._groupId = data.groupId;

        }

        if (!this._skillId && !this._groupId) {
            console.error("skillId == null && groupId == null !!!");
            return;
        }

        if (data.heroId) {
            this._heroVo = HeroManager.ins().getHeroVoByID(data.heroId);
            this._skillData = this._heroVo.getSkillDataById(data.groupId).data;
        } else if (data.petCfgId) {
            this._petVo = GIns.petModel.petContext.getDataByCfgId(data.petCfgId) as Vo.pet.PetVo;
            this._skillData = data.data
        } else if (data.collectionCfgId) {

            this._skillData = data.data
        } else {
            this._skillData = data.data
        }
        this.updateUI();

        if (this._isTop) {

            this.view.node.setPosition(this._oldPos.clone().add3f(
                0,
                this.view.bg.height / 2 + 70,
                0
            ));
        }
    }

    protected onClose(dontDispose?: boolean): void {
        GameTimer.ins().clearAll(this);
    }

    /**更新特效 */
    private updateFeatrue(cfg: table.battle.SkillConfig) {
        this._featureArr = [];

        this._featureArr.push({
            type: FeatureType.PreCD,
            desc: cfg.showCd ? TimeUtils.msToSecondStr(cfg.showCd[0], 1) : TimeUtils.msToSecondStr(cfg.precd, 1)
        })
        this._featureArr.push({
            type: FeatureType.CD,
            desc: cfg.showCd ? TimeUtils.msToSecondStr(cfg.showCd[1], 1) : TimeUtils.msToSecondStr(cfg.cd, 1)
        })

        if (cfg.rangeDescType) {
            let textKey = this._featrueRangeTextMainKey + cfg.rangeDescType;
            this._featureArr.push({ type: FeatureType.Range, desc: textKey });
        }

        this.view.featureList.numItems = this._featureArr.length;
    }

    private updateUI() {
        let curLevel = this._skillData ? this._skillData.level : 1;
        let self = this.view;
        let showCfg: table.battle.SkillConfig;

        this._skillCfgs = [];
        if (this._groupId) {
            this._skillCfgs = SkillConfigDatas.ins().getConfigsByGroup(this._groupId);
        } else if (this._skillId) {
            this._skillCfgs = [SkillConfigDatas.ins().findById(this._skillId)];
        }

        if (this._skillData?.cfg) {
            showCfg = this._skillData.cfg;
        } else {
            showCfg = this._skillCfgs[0];
        }

        //技能名
        if (this._isNeedLv) {
            self.T_name.text = showCfg.name + "Lv." + curLevel;
        } else {
            self.T_name.text = showCfg.name;
        }

        const isUnlock = this._skillData?.unlock || false;
        self.T_info.color = isUnlock ? new Color("#E9ECEE") : new Color("#9D9E9F");
        //技能描述
        self.T_info.text = StringUtils.repleaceDescToAtkImage(showCfg.desc);

        this.updateFeatrue(showCfg);

        this.view.list.visible = false;
        if (!this._skillCfgs.length) return;

        let len = this._skillCfgs.length - 1;
        //技能等级列表
        self.list.numItems = len > 0 ? len : 0;

        this.updateController(showCfg);
    }

    private updateController(cfg: table.battle.SkillConfig) {
        let c1 = this.view.getController('c1');
        let isNoUpgrade = this.view.list.numItems <= 0;

        let baseHeight = this.view.bg.height = 198 + this.view.T_info.height;
        if (isNoUpgrade) {
            c1.selectedIndex = 0;
            this.view.bg.height = baseHeight;
        } else {
            c1.selectedIndex = 1;
            let maxContentHeight = 1020 - baseHeight;

            // let height = 0;
            // let len = this.view.list.numChildren;
            // for (let i = 0; i < len; i++) {
            //     let item = this.view.list.getChildAt(i) as ui.hero.item.TextItem;
            //     height += item.T_text.height;
            // }

            let listContentHeight = this.view.list.scrollPane.contentHeight; //height; //内容高度 //高度不对 需要延迟 但是延迟后 又会闪 
            this.view.list.height = Math.min(maxContentHeight, listContentHeight - 40);

            this.view.bg.height = baseHeight + this.view.list.height + 30;//20为间隔

            if (this._skillData && this._skillData.level > 2) {
                this.view.list.scrollToView(this._skillData.level - 2, false, true);
            }

            GameTimer.ins().frameOnce(2, this, () => {
                this.view.list.visible = true;
            });
        }
    }

    private skillItem(index: number, item: ui.hero.item.TextItem) {
        let cfg = this._skillCfgs[index + 1];

        let str = "Lv." + cfg.level + ":" + StringUtils.repleaceDescToAtkImage(cfg.desc);

        if (!this._skillData || this._skillData.level >= cfg.level) {
            item.getController("c1").selectedIndex = 1;
        } else {
            item.getController("c1").selectedIndex = 0;
            str += "(" + this.getUnlockStar(this._skillData.slotId, cfg.level) + "星解锁)";
        }

        item.T_text.text = str;
        //item.height = item.T_text.height;
    }

    private featrueRender(index: number, item: ui.hero.item.SkillFeatureItem) {
        let data = this._featureArr[index];
        item.featureIcon.icon = this._featrueImg[data.type];
        item.featureIcon.color = color(this._featrueImgColor[data.type]);
        item.txt.text = data.desc;
    }


    private onClickFeatrue(item: ui.hero.item.SkillFeatureItem) {
        let index = this.view.featureList.childIndexToItemIndex(this.view.featureList.getChildIndex(item));
        let data = this._featureArr[index];
        let strKey = "i18n:heroSkillFeatrueDesc:" + FeatureType[data.type];
        GIns.floatingTextMgr.showTips(strKey);
    }

    //计算解锁星级 (弃用)
    private getUnlockStar(pos: number, level: number) {
        let star = 0;
        if (this._heroVo) {
            // let allStarCfg = TableManager.getAllData(table.hero.HeroStarConfig);
            // for (let cfg of allStarCfg) {
            //     if (cfg && cfg.quality == this._heroVo.heroCfg.quality && cfg.skillPos && cfg.skillPos == pos && cfg.skillLevel == level) {
            //         star = cfg.star;
            //         break
            //     }
            // }
            star = HeroStarConfigDatas.ins().getSkillNeedStarByLvAndPos(this._heroVo.heroCfg.quality, level, pos)
        } else if (this._petVo) {
            let petCfg = TableManager.getDataById(table.pet.PetConfig, this._petVo.petBaseId);
            star = GIns.petCfgMgr.getSkillNeedStarByLvAndPos(petCfg.quality, level, pos);
        }
        return star;
    }
}