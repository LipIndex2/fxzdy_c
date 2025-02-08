import G from "db://assets/scripts/core/comm/G";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { UICommWin, UIWinEffectType } from "db://assets/scripts/core/mvc/view/UICommWin";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { CommonHeroItemComp } from "db://assets/scripts/game/modules/common/hero/CommonHeroItemComp";
import { FormationMainViewOpenArgs, UIFormationKey } from "db://assets/scripts/game/modules/formation/const/UIFormationConfig";
import { FormationManager } from "db://assets/scripts/game/modules/formation/FormationManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { FightType } from "../../../comm/battle/enum/FightType";
import GIns from "../../../GIns";
import { CollectionsVo } from "../../collections/vo/CollectionsVo";
import { HeroManager } from "../../hero/HeroManager";
import { FormationSkillInfo } from "../components/FormationSkillInfo";
import { FormationSkillType } from "../const/FormationSkillType";

/**
 * 防守阵容
 */
@bindScript(UIFormationKey.FormationDefendView)
export class FormationDefendView extends UICommWin {

    static pkgName: string = "commFrame";
    static viewName: string = "FormationDefendView";

    /**不可以点击背景关闭 */
    protected _canCloseByBg = false;
    /**不需要弹窗动画 */
    protected _effectType: UIWinEffectType = UIWinEffectType.None;

    protected _fightType: ServerEnums.FightType;
    private _heroIdArray: Array<number> = [];
    private _heroLvArray: Array<number> = [];
    private _heroStarCountArray: Array<number> = [];

    private get view(): ui.commFrame.confirm.FormationDefendView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.FORMATION_SET_UP_FORMATION,
            NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION:
            case NotificationKey.FORMATION_SET_UP_FORMATION:
                this.reset();
                break;
        }
    }

    public onInit(): void {
        G.Logger.debug(" onInit ")

        // FGUIMaskUtils.createBackgroundMask(this.view);
        this.view.btnMaskBg.onClick(this.onExit, this);

        this.view.btnSetMySchema.onClick(this.onSetMySchema, this);

        this.view.heroList.setVirtual();
        this.view.heroList.itemRenderer = this.renderForHeroItem.bind(this);
    }

    onExit() {
        this.closeSelf();
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._fightType = args;
        this.reset();

        if (this._fightType == FightType.LEAGUE_EXPLORE) {
            this.view.labelTitle.text = '玩法阵容'
        }
    }

    protected onClose(dontDispose?: boolean): void {

    }

    onSetMySchema() {
        // JJC 阵容
        G.UIManager.open(UIFormationKey.FORMATION_MAIN_VIEW, FormationMainViewOpenArgs.create(this._fightType));

        this.closeSelf();
    }

    @LogBusiness("刷新界面")
    private reset() {

        // JJC 阵容
        const formationVo = FormationManager.ins().getFormationVoByType(this._fightType);

        // 英雄
        this._heroIdArray = [];
        for (let allPosDatum of (formationVo?.allPosData || [])) {
            const heroId = allPosDatum.heroId;
            if (heroId == null) {
                continue;
            }
            this._heroIdArray.push(heroId);
            this._heroLvArray.push(allPosDatum.level);
            let star = GIns.heroMgr.getHeroVoByID(heroId).star
            this._heroStarCountArray.push(star);
        }
        // robot
        this.view.heroList.numItems = this._heroIdArray.length || 0;

        //收藏品
        let collectionsVo = formationVo.collectionsId > 0 ? GIns.collectionsModel.context.getCollectionById(formationVo.collectionsId) : null
        let collectionsComp = FguiScriptUtils.toMyScriptClass(this.view.collectionsComp, FormationSkillInfo);
        collectionsComp.infoComp.type = FormationSkillType.COLLECTIONS;
        collectionsComp.updateByVo(collectionsVo as CollectionsVo);

        //宠物
        let petVo = formationVo.petId > 0 ? GIns.petModel.petContext.getDataByCfgId(formationVo.petId) : null
        let petComp = FguiScriptUtils.toMyScriptClass(this.view.petComp, FormationSkillInfo);
        petComp.infoComp.type = FormationSkillType.PET;
        petComp.updateByVo(petVo);
    }

    // 对手英雄信息
    renderForHeroItem(index: number, comp: ui.comm.hero.components.CommonHeroItemComp) {
        const heroId = this._heroIdArray[index];
        const lv = this._heroLvArray[index] || 1;
        const starCount = this._heroStarCountArray[index] || 1;
        const heroVo = HeroManager.ins().getHeroVoByID(heroId);

        // @ts-ignore
        (comp as CommonHeroItemComp).reset(
            heroId,
            lv,
            starCount,
            heroVo.heroVoData.useSkinId,
        );
    }
}