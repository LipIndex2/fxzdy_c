import { UICaptainSkillKeys } from "db://assets/scripts/game/modules/captainSkill/UICaptainSkillKeys";
import { ModuleOpenManager } from "db://assets/scripts/game/modules/moduleopen/ModuleOpenManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { AudioManager, SoundType } from "../../../comm/mgr/AudioManager";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { MapManager } from "../../../tiledMap/MapManager";
import { HeroSelectItem } from "../../common/item/HeroSelectItem";
import { SoltItem } from "../../common/item/SoltItem";
import { ModelNode } from "../../common/node/ModelNode";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { UIEquipKey } from "../../equip/const/UIEquipConfig";
import { FightManager } from "../../fight/FightManager";
import { FormationManager } from "../../formation/FormationManager";
import { PositionVo } from "../../formation/vo/PositionVo";
import { UIIllustrationsKey } from "../../illustrations/const/UIIllustrationsConfig";
import { UIPetKey } from "../../pet/const/UIPetConfig";
import { UITalentKeys } from "../../talent/UITalentKeys";
import { UIHeroKey } from "../const/UIHeroConfig";
import { HeroCampType, HeroSelectKey } from "../HeroEnum";
import { HeroManager } from "../HeroManager";
import { HeroSelectData, HeroVo } from "../HeroVo";
import { UICollectionsKey } from "../../collections/const/UICollectionsConfig";

/**
 * 卡牌培养
 * 主界面
 */
@bindScript(UIHeroKey.HERO_MAIN_VIEW)
export class HeroMainView extends UIView {
    static pkgName: string = "hero";
    static viewName: string = "HeroMainView";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    private _campType: HeroCampType;
    private _careerType: ServerEnums.Career;

    private _btnTalent: fgui.GButton;
    private _btnEquip: fgui.GButton;
    private _btnCaptain: fgui.GButton;
    private _btnPet: fgui.GButton;
    private _btnCollection: fgui.GButton;

    /** 筛选过的英雄列表 */
    private _heroVos: HeroVo[] = [];

    private get view(): ui.hero.view.HeroMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.HERO_ACTIVATE,
            NotificationKey.HERO_UP_LEVEL,
            NotificationKey.HERO_UP_STAR,
            NotificationKey.HERO_UP_STAGE,
            NotificationKey.HERO_SELECT_HERO,
            NotificationKey.FORMATION_SET_UP_FORMATION,
            NotificationKey.EVENT_CHANGE_ITEMS,
            NotificationKey.EVENT_CHANGE_ITEMS2,
            NotificationKey.FIGHT_UPDATE_ONE_HERO,
            NotificationKey.FIGHT_UPDATE_ALL_HERO,
            NotificationKey.HERO_SKIN_WEAR,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.HERO_ACTIVATE:
            case NotificationKey.HERO_UP_LEVEL:
            case NotificationKey.HERO_UP_STAR:
            case NotificationKey.HERO_UP_STAGE:
            case NotificationKey.FORMATION_SET_UP_FORMATION:
            case NotificationKey.EVENT_CHANGE_ITEMS:
            case NotificationKey.EVENT_CHANGE_ITEMS2:
            case NotificationKey.FIGHT_UPDATE_ONE_HERO:
            case NotificationKey.FIGHT_UPDATE_ALL_HERO:
            case NotificationKey.HERO_SKIN_WEAR:
                this.updateInfo();
                break;
            case NotificationKey.HERO_SELECT_HERO:
                let data = args as HeroSelectData;
                if (data.key == HeroSelectKey.HERO) {
                    this._campType = data.campType;
                    this._careerType = data.careerType;
                    this.updateInfo();
                }
                break;
        }
    }

    protected onInit(): void {
        let self = this.view;

        this._btnTalent = self.bottomTab._children[0] as fgui.GButton;
        this._btnTalent.getController("type").selectedIndex = 0;
        this._btnEquip = self.bottomTab._children[1] as fgui.GButton;
        this._btnEquip.getController("type").selectedIndex = 1;
        this._btnCaptain = self.bottomTab._children[3] as fgui.GButton;
        this._btnCaptain.getController("type").selectedIndex = 2;
        this._btnPet = self.bottomTab._children[2] as fgui.GButton;
        this._btnPet.getController("type").selectedIndex = 3;
        this._btnCollection = self.bottomTab._children[4] as fgui.GButton;
        this._btnCollection.getController("type").selectedIndex = 4;

        this._btnTalent.onClick(this.openTalent, this);
        this._btnEquip.onClick(this.openEquip, this);
        this._btnCaptain.onClick(this.openCaptain, this);
        this._btnPet.onClick(this.openPet, this);
        this._btnCollection.onClick(this.openCollections, this);
        self.btn_manual.onClick(this.openManual, this);
        // self.btn_team.onClick(this.openTeam, this);

        self.pane.on(fgui.Event.SCROLL, this.scroll, this);
        self.pane.on(fgui.Event.TOUCH_END, this.scrollEnd, this);

        FguiScriptUtils.toMyScriptClass(self.btn_manual.redDot, RedDotCom).reset(RedDotKeys.Illustrations_Main);
        // FguiScriptUtils.toMyScriptClass(self.btn_team.redDot, RedDotCom).reset(RedDotKeys.captainSkill);
        FguiScriptUtils.toMyScriptClass((this._btnTalent as any).redDot, RedDotCom).reset(RedDotKeys.talent);
        FguiScriptUtils.toMyScriptClass((this._btnEquip as any).redDot, RedDotCom).reset(RedDotKeys.Equip_enter);
        FguiScriptUtils.toMyScriptClass((this._btnCaptain as any).redDot, RedDotCom).reset(RedDotKeys.captainSkill);
        FguiScriptUtils.toMyScriptClass((this._btnPet as any).redDot, RedDotCom).reset(RedDotKeys.Pet_enter);
        FguiScriptUtils.toMyScriptClass((this._btnCollection as any).redDot, RedDotCom).reset(RedDotKeys.Collections_enter);

        self.btn_team.visible = false;
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        let self = this.view;

        self.getController("c1").selectedIndex = 0;
        //@ts-ignore
        let selectItem = self.item_select as HeroSelectItem;
        selectItem.setType(HeroSelectKey.HERO);
        self.pane.heroListItem.scrollPane.touchEffect = false;
        this.updateInfo();

        if (!isReopen) this.view.getTransition("t0").play();

        this.resetTabButtonCanSee();
    }

    //更新UI信息
    private updateInfo() {
        let self = this.view;
        this._heroVos = [];
        let heroArr = HeroManager.ins().getHeroVoArrByCampType(this._campType, this._careerType);
        for (let heroVo of heroArr) {
            if (!heroVo.posId && (heroVo.isCanActive || heroVo.heroVoData.isActivate)) {
                this._heroVos.push(heroVo);
            }
        }
        //@ts-ignore
        self.pane.setData(this._heroVos);

        //上阵
        let PosVos = FormationManager.ins().getAllPosData();
        let index = 0;
        let item = self.getChild("item" + index) as SoltItem;
        for (let posVo of PosVos) {
            item = self.getChild("item" + index) as SoltItem;
            if (!item) return;
            item.updateData(posVo);
            this.setHeroSipne(index, posVo);
            index += 1;
        }

        self.T_pow.text = StringUtils.getFightStr(FightManager.ins().getFightByDefault());

        // this.view.btn_team.visible = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.CAPTAIN, false) && MapManager.ins().getBuildingUnlockById(1005);
    }

    //设置英雄spine
    private setHeroSipne(index: number, posVo: PositionVo) {
        let model = this.view.getChild("anim" + index) as ModelNode;
        if (posVo.heroId) {
            let heroVo = HeroManager.ins().getHeroVoByID(posVo.heroId);
            // model.loadByModelId(heroVo.heroCfg.showModelId, true);
            model.loadByModelId(heroVo.showModelId, true);
            model.setScale(-1.6, 1.6);
        } else {
            model.clear();
        }
    }

    //打开天赋界面
    private openTalent() {
        let isCanOpen = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.TALENT);
        if (!isCanOpen) {
            return;
        }
        G.UIManager.open(UITalentKeys.TalentMainView);
    }

    //打开装备界面
    private openEquip() {
        let isCanOpen = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.EQUIP);
        if (isCanOpen) UIManager.ins().open(UIEquipKey.EQUIP_MAIN_VIEW);
    }

    //打开战队科技
    private openCaptain() {
        let isCanOpen = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.CAPTAIN_CORE);
        if (isCanOpen) UIManager.ins().open(UICaptainSkillKeys.CaptionSkillMainView);
    }

    private openPet() {
        let isCanOpen = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.PET);
        if (isCanOpen) UIManager.ins().open(UIPetKey.PET_MAIN_VIEW);
    }

    private openCollections() {
        let isCanOpen = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.COLLECTIBLES);
        if (isCanOpen) UIManager.ins().open(UICollectionsKey.MAIN_VIEW);
    }

    private openManual() {
        let unLock = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.ILLUSTRATIONS, false);
        if (!unLock) {
            //未解锁
            let lockDesc = ModuleOpenManager.ins().getModuleLockTips(ServerEnums.SystemType.ILLUSTRATIONS);
            if (lockDesc) {
                GIns.floatingTextMgr.showTips(lockDesc);
            }
            return;
        }
        UIManager.ins().open(UIIllustrationsKey.ILLUSTRATIONS_MAIN_VIEW);
    }

    private openTeam() {
        G.UIManager.open(UICaptainSkillKeys.CaptionSkillLvUpView);
    }

    private istrue: boolean = false;

    private _percY;
    private scroll(evt: any) {
        // if(!evt) return;
        if (this.view.pane.scrollPane.percY <= 0.9 && !this.istrue) {
            this.view.getController("c1").selectedIndex = 0;
            this.istrue = true;
        } else if (this.view.pane.scrollPane.percY > 0.9 && this.istrue) {
            this.view.getController("c1").selectedIndex = 1;
            this.istrue = false;
        }

        this._isMove = true;
    }

    private _isMove = false;
    private scrollEnd(evt: any) {
        if (this.view.pane.scrollPane.percY >= 0.5) {
            this.view.pane.scrollPane.setPercY(1, true);
        } else {
            this.view.pane.scrollPane.setPercY(0, true);
        }
        if (this.view.pane.scrollPane.percY >= 1 && this.view.pane.heroListItem.scrollPane.contentHeight > this.view.pane.heroListItem.scrollPane.viewHeight) {
            if (this.view.pane.heroListItem.scrollPane.percY <= 0 && !this._isMove) {
                this.view.pane.heroListItem.scrollPane.touchEffect = false;
            } else {
                this.view.pane.heroListItem.scrollPane.touchEffect = true;
            }
        } else {
            this.view.pane.heroListItem.scrollPane.touchEffect = false;
        }
        this._isMove = false;
    }

    onClickBack() {
        AudioManager.ins().playSound(SoundType.winBack);
        this.closeSelf();
    }

    protected onClose(): void {
        for (let i = 0; i < 6; i++) {
            let model = this.view.getChild("anim" + i) as ModelNode;
            model.clear();
        }

        this._heroVos = [];
    }

    private resetTabButtonCanSee() {
        this._btnTalent.visible = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.TALENT, false);
        this._btnEquip.visible = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.EQUIP, false);
        this._btnCaptain.visible = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.CAPTAIN_CORE, false);
        this._btnCollection.visible = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.COLLECTIBLES, false);
        let guideId = GIns.heroMgr.petShowCondition;
        if (guideId) {
            this._btnPet.visible = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.PET, false) && GIns.guideModel.isCompleted(guideId);
        } else {
            this._btnPet.visible = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.PET, false);
        }
    }
}
