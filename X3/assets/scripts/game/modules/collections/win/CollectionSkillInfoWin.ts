import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import {bindScript} from "../../../../core/comm/UIScriptManager";
import {UIWin} from "../../../../core/mvc/view/UIWin";
import {TimeUtils} from "../../../comm/utils/TimeUtils";
import GIns from "../../../GIns";
import { FeatureType } from "../../hero/view/SkillInfoWin";
import { ECollectiblesSkillTargetType, UICollectionsKey } from "../const/UICollectionsConfig";
import { color } from "cc";

declare global {
    namespace XJ {
        namespace collections {
            interface ISkillInfoWinParam {
                /** collectibles.CollectiblesSkillEffectConfig */
                id: string,
                fiy?: number,
            }
        }
    }
}

/**
 * 收藏品信息界面
 */
@bindScript(UICollectionsKey.SKILL_INFO_WIN)
export class CollectionSkillInfoWin extends UIWin {
    public static pkgName = "collectibles"
    public static viewName = "CommonCollectionSkillInfoWin"

    private _featureArr: { type: FeatureType, desc: string }[];

    private _featrueRangeTextMainKey = "i18n:heroSkillRange:"; //i18n:heroSkillRange:S
    private _featrueImg = ["ui://comm/cooldown_icon", "ui://comm/cooldown_icon", "ui://comm/range_icon",]
    private _featrueImgColor = ["#7efcfb", "#a7c7ff", "#a7c7ff"];

    private infoHeight: number
    private bgHeight: number

    private get view(): ui.collectibles.ui.win.skill.CommonCollectionSkillInfoWin {
        return this._view as any;
    }

    onInit() {
        let view = this.view;
        view.img_bg.on(fgui.Event.CLICK, this.closeSelf, this);
        view.closeBtn.on(fgui.Event.CLICK, this.closeSelf, this);
        view.featureList.on(fgui.Event.CLICK_ITEM, this.onClickFeatrue, this);
        view.featureList.itemRenderer = this.featrueRender.bind(this);
        view.T_info.on(fgui.Event.SIZE_CHANGED, this.onInfoChg, this);

        this.infoHeight = view.T_info.height;
        this.bgHeight = view.bg.height;
    }

    protected onOpen(args: XJ.collections.ISkillInfoWinParam, isReopen?: boolean) {
        let view = this.view;
        let seCfg = G.TableManager.getDataById(table.collectibles.CollectiblesSkillEffectConfig, args.id);
        if (seCfg.targetType == ECollectiblesSkillTargetType.COLLECTIBLES) {
            let collSkillCfg = G.TableManager.getDataById(table.battle.CollectionSkillConfig, seCfg.skillId);
            view.T_name.text = collSkillCfg.name;
            view.T_info.text = collSkillCfg.desc;
            this.updateFeatrue(collSkillCfg);
        } else if (seCfg.targetType == ECollectiblesSkillTargetType.HERO) {
            let skillCfg = G.TableManager.getDataById(table.battle.SkillConfig, seCfg.skillId);
            this.updateFeatrue(skillCfg);
            view.T_name.text = skillCfg.name;
            view.T_info.text = skillCfg.desc;
            this.updateFeatrue(skillCfg);
        }

        if (args.fiy) {
            this.view.titleGrop.y += args.fiy;
        }
    }

    private onInfoChg() {
        let view = this.view;
        view.bg.height = this.bgHeight + (view.T_info.height - this.infoHeight);
    }

    /**更新特效 */
    private updateFeatrue(cfg: table.battle.SkillConfig | table.battle.CollectionSkillConfig) {
        this._featureArr = [];

        let showCd = "showCd" in cfg ? cfg.showCd : null;

        this._featureArr.push({
            type: FeatureType.PreCD,
            desc: showCd ? TimeUtils.msToSecondStr(showCd[0], 1) : TimeUtils.msToSecondStr(cfg.precd, 1)
        });
        this._featureArr.push({
            type: FeatureType.CD,
            desc: showCd ? TimeUtils.msToSecondStr(showCd[1], 1) : TimeUtils.msToSecondStr(cfg.cd, 1)
        });

        if (cfg['rangeDescType']) {
            let textKey = this._featrueRangeTextMainKey + cfg['rangeDescType'];
            this._featureArr.push({ type: FeatureType.Range, desc: textKey });
        }

        this.view.featureList.numItems = this._featureArr.length;
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
}