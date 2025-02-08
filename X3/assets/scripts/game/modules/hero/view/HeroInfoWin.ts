import { Input } from "cc";
import * as fgui from "fairygui-cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { TableManager } from "../../../../core/table/TableManager";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { TouchUtils } from "../../../../core/utils/TouchUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { HeaderItem } from "../../common/header/HeaderItem";
import { ModelNode } from "../../common/node/ModelNode";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { ModuleOpenManager } from "../../moduleopen/ModuleOpenManager";
import { BtnWearWeapon } from "../../weapon/BtnWearWeapon";
import { UIHeroKey } from "../const/UIHeroConfig";
import { HeroManager } from "../HeroManager";
import { MagicCubeInfoItem } from "../item/MagicCubeInfoItem";
import { MagicCubeBtnItem } from "../item/MagicCubeItem";
import { HeroSkinPage } from "../page/HeroSkinPage";
import { HeroSwitchPage } from "../page/HeroSwitchPage";
import { HeroUpLevelPage } from "../page/HeroUpLevelPage";
import { HeroUpStarPage } from "../page/HeroUpStarPage";
import { PositionVo } from "../../formation/vo/PositionVo";
import { HeroVo } from "../HeroVo";
import { dnaAwakenInfo, HeroPotentialPage } from "../page/HeroPotentialPage";
import { TimeManager } from "../../../../core/time/TimeManager";
import G from "../../../../core/comm/G";
import { DEBUG } from "cc/env";
import { GmModel } from "db://assets/scripts/gm/model/GMModel";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";

/**
 * 英雄信息界面
 */
@bindScript(UIHeroKey.HERO_INFO_WIN)
export class HeroInfoWin extends UICommWin {
    static pkgName: string = "hero";
    static viewName: string = "HeroInfoWin";

    /** 英雄配置id */
    private _baseId = 101;

    protected _constHeroList: HeroVo[] = null;

    private get view(): ui.hero.view.HeroInfoWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.HERO_UP_LEVEL,
            NotificationKey.HERO_UP_STAR,
            NotificationKey.HERO_UP_STAGE,
            NotificationKey.HERO_SWITCH_HERO,
            NotificationKey.HERO_SKIN_SWITCH,
            NotificationKey.HERO_SKIN_RESET,
            NotificationKey.EVENT_CHANGE_ITEMS,
            NotificationKey.EVENT_CHANGE_ITEMS2,
            NotificationKey.FIGHT_UPDATE_ONE_HERO,
            NotificationKey.WEAPON_TAKE_OFF_COMPLETE,
            NotificationKey.WEAPON_WEAR_COMPLETE,
            NotificationKey.WEAPON_UP_STAR_COMPLETE,
            NotificationKey.WEAPON_ITEM_CHANGE,
            NotificationKey.HERO_SKIN_WEAR,
            NotificationKey.MAGICCUBE_REFRESH_DATA,
            NotificationKey.HERO_DNA_LEVEL_UP,
            NotificationKey.HERO_DNA_AWAKEN_FIRST,
            NotificationKey.HERO_DNA_AWAKEN_REFRESH,
            NotificationKey.HERO_DNA_REFRESH_CONFIRM,
            NotificationKey.HERO_DNA_REFRESH_CANCEL,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.HERO_SWITCH_HERO:
                this._baseId = args;
                this.updateInfo(this._baseId);
                break;
            case NotificationKey.HERO_UP_LEVEL:
            case NotificationKey.HERO_UP_STAGE:
            case NotificationKey.HERO_UP_STAR:
            case NotificationKey.EVENT_CHANGE_ITEMS:
            case NotificationKey.EVENT_CHANGE_ITEMS2:
            case NotificationKey.FIGHT_UPDATE_ONE_HERO:
                this.updateInfo(this._baseId);
                if (event == NotificationKey.HERO_UP_LEVEL) {
                    this.playLvUpAni();
                }
                break;
            case NotificationKey.WEAPON_TAKE_OFF_COMPLETE:
            case NotificationKey.WEAPON_WEAR_COMPLETE:
            case NotificationKey.WEAPON_UP_STAR_COMPLETE:
                let needShowTip: boolean = event == NotificationKey.WEAPON_TAKE_OFF_COMPLETE || event == NotificationKey.WEAPON_WEAR_COMPLETE;
                //穿戴或者卸下的时候需要强制弹提示
                this.updateInfo(this._baseId, needShowTip);
                FguiScriptUtils.toMyScriptClass(this.view.btnWearWeapon, BtnWearWeapon)?.updateUI();
                break;
            case NotificationKey.WEAPON_ITEM_CHANGE:
                FguiScriptUtils.toMyScriptClass(this.view.btnWearWeapon, BtnWearWeapon)?.updateWearTip();
                break;
            case NotificationKey.HERO_SKIN_SWITCH:
                //@ts-ignore
                let HeroSkin = this.view.heroSkin as HeroSkinPage;
                HeroSkin.onSelectSkin(args.index);
                //@ts-ignore
                let heroSwitch = this.view.HeroSwitch as HeroSwitchPage;
                heroSwitch.setAnimByModelId(args.showModelId);
                break;
            case NotificationKey.HERO_SKIN_RESET:
                FguiScriptUtils.toMyScriptClass(this.view.HeroSwitch, HeroSwitchPage).setAnim();
                break;
            case NotificationKey.HERO_SKIN_WEAR:
                //@ts-ignore
                let heroSwitch1 = this.view.HeroSwitch as HeroSwitchPage;
                heroSwitch1.setAnim();
                //@ts-ignore
                let HeroSkin1 = this.view.heroSkin as HeroSkinPage;
                HeroSkin1.updateUI();
                // GIns.floatingTextMgr.showTips(`穿戴成功`);
                break;
            case NotificationKey.MAGICCUBE_REFRESH_DATA:
                if (args == this._baseId) this.updateCube();
                break;
            case NotificationKey.HERO_DNA_LEVEL_UP:
                this.updateInfo(this._baseId);
                break;
            case NotificationKey.HERO_DNA_AWAKEN_FIRST:
            case NotificationKey.HERO_DNA_REFRESH_CONFIRM:
            case NotificationKey.HERO_DNA_AWAKEN_REFRESH: {
                let type = event === NotificationKey.HERO_DNA_AWAKEN_FIRST || event === NotificationKey.HERO_DNA_REFRESH_CONFIRM ? 1 : 2;
                let sendArgs = {
                    baseId: args?.baseId,
                    type,
                    stage: args?.stage,
                } as dnaAwakenInfo;
                G.UIManager.open(UIHeroKey.HERO_DNA_TIP_WIN, sendArgs);
                this.updateInfo(this._baseId);
                break;
            }
            case NotificationKey.HERO_DNA_REFRESH_CANCEL:
                break;
        }
    }

    public get viewPageController(): fgui.Controller {
        return this.view.getController("c1");
    }

    public onOpen(baseId: number): void {

        this._baseId = baseId;

        let heroVo = HeroManager.ins().getHeroVoByID(baseId);
        this.viewPageController.selectedIndex = heroVo.posId ? 0 : 1;
        if (heroVo.posId) {
            //如果是上阵英雄 需要固定左右切换顺序
            let upHeros = GIns.formationMgr.getHeroInPosVos();
            upHeros.sort((a: PositionVo, b: PositionVo) => {
                let heroVoA = HeroManager.ins().getHeroVoByID(a.heroId);
                let heroVoB = HeroManager.ins().getHeroVoByID(b.heroId);
                if (heroVoA.Level != heroVoB.Level) {
                    return heroVoB.Level - heroVoA.Level;
                }
            });
            this._constHeroList = [];
            upHeros.forEach((value) => {
                let heroVo = GIns.heroMgr.getHeroVoByID(value.heroId);
                if (heroVo) {
                    this._constHeroList.push(heroVo);
                }
            });
        } else {
            this._constHeroList = null;
        }

        this.updateInfo(this._baseId);

        //超能武器入口开关
        this.view.btnWearWeapon.visible = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.AWAKE_WEAPON, false);

        if (ModuleOpenManager.ins().isCanOpenModuleWithoutTips(ServerEnums.SystemType.HERO_SKIN) == false) {
            //皮肤未开启
            this.view.list_tab.removeChildToPoolAt(2);
        } else {
            //@ts-ignore
            FguiScriptUtils.toMyScriptClass(this.view.list_tab.getChildAt(2).redDot1, RedDotCom).reset(RedDotKeys.Hero_item_skin, [this._baseId]);
        }

        const star = HeroManager.ins().getHeroConstantCfg("HERO:OPEN_DNA_STAR_LEVEL").content;
        const starEnough: boolean = heroVo.heroVoData.star >= Number(star) ? true : false;
        if (!starEnough || ModuleOpenManager.ins().isCanOpenModuleWithoutTips(ServerEnums.SystemType.HERO_DNA) == false) {
            // 潜能未开启
            if (this.view.list_tab.numChildren > 3) {
                this.view.list_tab.removeChildToPoolAt(3);
            }
        } else {
            //@ts-ignore
            FguiScriptUtils.toMyScriptClass(this.view.list_tab.getChildAt(3).redDot1, RedDotCom).reset(RedDotKeys.Hero_item_dna, [this._baseId]);
        }
    }

    public onInit(): void {
        //@ts-ignore
        const headerItem1 = this.view.headerItem1 as HeaderItem;
        //@ts-ignore
        const headerItem2 = this.view.headerItem2 as HeaderItem;
        headerItem1.reset(6, false);
        headerItem2.reset(5, false);

        this.view.HeroUpLevel.img_zy.on(fgui.Event.CLICK, this.onShow1Tips.bind(this, "career"), this);
        this.view.HeroSwitch.img_camp.on(fgui.Event.CLICK, this.onShow1Tips.bind(this, "camp"), this);
        // 触摸外部
        this.view.on(Input.EventType.TOUCH_END, this.onShowTips, this);

        this.view.magicCubeItem.img_frame.on(fgui.Event.CLICK, this.onCubeItemClick, this);
        const tabChild = this.view.list_tab.getChildAt(3);
        if (tabChild) {
            tabChild.onClick(this.onTabListOnClick, this);
        }
    }

    private updateInfo(baseId: number, showDanmuTextForce: boolean = false) {
        let self = this.view;
        //@ts-ignore
        let heroSwitch = self.HeroSwitch as HeroSwitchPage;
        //@ts-ignore
        let heroUpStar = self.HeroUpStar as HeroUpStarPage;
        //@ts-ignore
        let HeroUpLevel = self.HeroUpLevel as HeroUpLevelPage;
        //@ts-ignore
        let HeroSkin = self.heroSkin as HeroSkinPage;
        heroSwitch.updateInfo(baseId, this._constHeroList);
        //@ts-ignore
        let HeroPotential = self.HeroPotential as HeroPotentialPage;
        heroSwitch.updateInfo(baseId);
        heroUpStar.updateInfo(baseId);
        HeroSkin.updateInfo(baseId);
        HeroUpLevel.updateInfo(baseId, showDanmuTextForce);
        HeroPotential.updateInfo(baseId);

        //@ts-ignore
        let btnWearWeapon = self.btnWearWeapon as BtnWearWeapon;
        btnWearWeapon.setHero(baseId);

        this.updateCube();
        this.updateList(baseId);

        this.view.magicCubeItem.visible = GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.MAGIC_CUBE);

        //红点
        //@ts-ignore
        FguiScriptUtils.toMyScriptClass(this.view.list_tab.getChildAt(0).redDot1, RedDotCom).reset(RedDotKeys.Hero_item_train, [this._baseId]);
        //@ts-ignore
        FguiScriptUtils.toMyScriptClass(this.view.list_tab.getChildAt(1).redDot1, RedDotCom).reset(RedDotKeys.Hero_item_star, [this._baseId]);
    }

    // 刷新列表
    private updateList(baseId: number) {
        const heroVo = HeroManager.ins().getHeroVoByID(baseId);
        const star = HeroManager.ins().getHeroConstantCfg("HERO:OPEN_DNA_STAR_LEVEL").content;
        const starEnough: boolean = heroVo.heroVoData.star >= Number(star) ? true : false;
        if (!starEnough || ModuleOpenManager.ins().isCanOpenModuleWithoutTips(ServerEnums.SystemType.HERO_DNA) == false) {
            // 潜能未开启
            if (this.view.list_tab.numChildren > 3) {
                this.view.list_tab.removeChildToPoolAt(3);
            }
            this.viewPageController.selectedIndex = this.viewPageController.selectedIndex === 3 ? 2 : this.viewPageController.selectedIndex;
        } else {
            const lastBtn = this.view.list_tab.getChild("potential");
            if (lastBtn) {
                return;
            }
            // 开启潜能
            const newButton = fgui.UIPackage.createObject("hero", "TabBtn");
            newButton.name = "potential";
            newButton.text = "潜能";
            newButton.onClick(this.onTabListOnClick, this);
            const lastIndex = this.view.list_tab.numChildren;
            this.view.list_tab.addChildAt(newButton, lastIndex);
            //@ts-ignore
            FguiScriptUtils.toMyScriptClass(this.view.list_tab.getChildAt(3).redDot1, RedDotCom).reset(RedDotKeys.Hero_item_dna, [this._baseId]);
        }
    }

    //刷新魔方数据
    private updateCube() {
        //@ts-ignore
        let magicCubeItem = this.view.magicCubeItem as MagicCubeBtnItem;
        magicCubeItem.setHeroId(this._baseId);

        //@ts-ignore
        let magicCubeInfo = this.view.magicCubeInfo as MagicCubeInfoItem;
        magicCubeInfo.setHeroId(this._baseId);
    }

    protected playLvUpAni(): void {
        let aniNode = this.view.HeroSwitch.aniNode as ModelNode;
        aniNode.loadByPath("spine/ui/shengjibiaoxian/shengjibiaoxian1_upper");
        aniNode.playOrders([
            {
                name: "enter",
                isLoop: false,
            },
        ]);
    }

    protected updateBtnWeapon() { }

    private onShow1Tips(str: string, event: any) {
        let pos = event.pos;
        this.view.attrTips.visible = true;
        this.view.attrTips.setPosition(pos.x, pos.y);
        let heroVo = HeroManager.ins().getHeroVoByID(this._baseId);

        if (str == "camp") {
            let cfg = TableManager.getDataById(table.hero.HeroRaceConfig, heroVo.heroCfg.camp);
            this.view.attrTips.T_career.text = `阵营:${cfg.name}`;
            this.view.attrTips.T_desc.text = cfg.desc;
        } else if (str == "career") {
            let cfg = TableManager.getDataById(table.hero.HeroClassConfig, heroVo.heroCfg.career);
            this.view.attrTips.T_career.text = `职业:${cfg.name}`;
            this.view.attrTips.T_desc.text = cfg.desc;
        }
    }

    private onShowTips(event: any) {
        const isIn1 = TouchUtils.isTouchInUi(event, this.view.HeroUpLevel.img_zy._uiTrans);
        const isIn2 = TouchUtils.isTouchInUi(event, this.view.HeroSwitch.img_camp._uiTrans);
        if (!isIn1 && !isIn2) {
            this.view.attrTips.visible = false;
        }

        const isIn3 = TouchUtils.isTouchInUi(event, this.view.magicCubeItem.img_frame._uiTrans);
        if (!isIn3) {
            this.view.magicCubeInfo.visible = false;
        }
    }

    private onCubeItemClick() {
        let vo = GIns.magicCubeMgr.getMagicCubeVoByHeroId(this._baseId);
        if (vo) {
            this.view.magicCubeInfo.visible = !this.view.magicCubeInfo.visible;
        }
    }

    private onTabListOnClick() {
        GIns.redDotMgr.markRedDotForeverRead(RedDotKeys.Hero_item_dna, [this._baseId]);
    }

    public onClose(): void {
    }
}
