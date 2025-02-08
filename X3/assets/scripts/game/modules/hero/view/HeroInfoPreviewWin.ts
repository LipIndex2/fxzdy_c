import { QualityUtils } from "db://assets/scripts/game/modules/common/quality/QualityUtils";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { Attribute, AttrType } from "../../attr/AttrEnum";
import { FightManager } from "../../fight/FightManager";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { UIHeroKey } from "../const/UIHeroConfig";
import { HeroSkillData } from "../HeroVo";
import { HeroSkillItem } from "../item/HeroSkillItem";
import { HeroSwitchPage } from "../page/HeroSwitchPage";
import { HeroManager } from "../HeroManager";
import { TableManager } from "../../../../core/table/TableManager";
import { TouchUtils } from "../../../../core/utils/TouchUtils";
import { Input } from "cc";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { PlayerAvatar } from "../../common/playerInfo/PlayerAvatar";
import { AudioManager, SoundType } from "../../../comm/mgr/AudioManager";
import { WeaponBaseItem } from "../../weapon/item/WeaponBaseItem";
import { HeroUtils } from "../utils/HeroUtils";
import GIns from "../../../GIns";
import { AttrManager } from "../../attr/AttrManager";
import { AttrEnum } from "../../../comm/battle/attribute/AttrEnum";

export interface IHeroInfoPreviewWinOpenArgs {
    heroId: number;
    lv?: number;
    star?: number;
    stage?: number,
    /***是否玩家数据 */
    playerName?: string,
    playerData?: Vo.player.PlayerBaseVo;
    /***魔方 */
    magicCubeId?: number
    magicCubeLv?: number;

    /**
             * 专属武器配置Id
             */
    awakeWeaponId?: number;

    /**
     * 专属武器星级
     */
    awakeWeaponStar?: number;
    heroSkin?: number;
    attr?: { [key: number]: number };
    fight?: number;
}

/**
 * 英雄预览界面
 */
@bindScript(UIHeroKey.HERO_INFO_PREVIEW_WIN)
export class HeroInfoPreviewWin extends UICommWin {
    static pkgName: string = "hero";
    static viewName: string = "HeroInfoPreviewWin";

    /** 英雄配置id */
    private _heroId = 101;
    private datas: IHeroInfoPreviewWinOpenArgs[]
    private nowData: IHeroInfoPreviewWinOpenArgs
    protected _star: number = 0;
    protected _showSkillDatas: HeroSkillData[] = [];
    private nowHeroPage: number = 0;

    private get view(): ui.hero.view.HeroInfoPreviewWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(event: string, args?: any): void { }

    /***组件初始化 */
    protected onInit(): void {
        //界面初始化
        this.view.HeroSwitch.btn_left.visible = false;
        this.view.HeroSwitch.btn_right.visible = false;
        this.view.HeroSwitch.img_isUp.visible = false;
        this.view.HeroSwitch.HeroStarItem.list_star1.itemRenderer = this.itemRendererForStar.bind(this);

        this.view.btn_left.on(fgui.Event.CLICK, this.onBtnClick, this);
        this.view.btn_right.on(fgui.Event.CLICK, this.onBtnClick, this);

        this.view.HeroUpLevel.btn_upLevel.visible = false;
        this.view.HeroUpLevel.btn_upStage.visible = false;
        this.view.HeroUpLevel.list_skill.itemRenderer = this.itemRendererForSkill.bind(this);

        this.view.HeroSwitch.img_camp.on(fgui.Event.CLICK, this.onShow1Tips.bind(this, "camp"), this);
        // 触摸外部
        this.view.on(Input.EventType.TOUCH_END, this.onShowTips, this);
        this.view.HeroUpLevel.btnPlayerAvatar.touchable = false
    }

    private onBtnClick(evt: any) {
        let btn = evt.currentTarget;
        switch (btn.name) {
            case "btn_left":
                this.getNextHeroId(-1);
                break;
            case "btn_right":
                this.getNextHeroId(1);
                break;
        }
        AudioManager.ins().playSound(SoundType.change);
    }

    private getNextHeroId(addPage: number): void {
        this.nowHeroPage += addPage;
        if (this.nowHeroPage < 0)
            this.nowHeroPage = this.datas.length - 1;
        if (this.nowHeroPage >= this.datas.length) {
            this.nowHeroPage = 0;
        }

        this.nowData = this.datas[this.nowHeroPage]
        this._heroId = this.nowData.heroId;
        this.updateUI();
    }

    protected itemRendererForStar(index: number, item: ui.comm.item.StarIconItem) {
        item.starIcon.icon = ItemUtils.getStarIcon(this._star);
    }

    //技能item
    private itemRendererForSkill(index: number, item: HeroSkillItem) {
        let skillData = this._showSkillDatas[index];

        item.updateInfo(skillData, this._heroId);
    }

    public onOpen(data: IHeroInfoPreviewWinOpenArgs[]): void {
        this.datas = data;
        this.view.btn_left.visible = false;
        this.view.btn_right.visible = false;
        if (this.datas.length > 1) {
            this.view.btn_left.visible = true;
            this.view.btn_right.visible = true;
        }
        this.nowData = data[0]
        this._heroId = this.nowData.heroId;
        this.updateUI();
    }

    private updateUI() {
        let heroCfg = G.TableManager.getDataById(table.hero.HeroConfig, this._heroId);
        let starCfgs = G.TableManager.getAllData(table.hero.HeroStarConfig);
        let stageCfgs = G.TableManager.getAllData(table.hero.HeroStageConfig);
        let levelCfgs = G.TableManager.getAllData(table.hero.HeroLevelConfig);

        this.view.magicCubeItem.visible = false;
        this.view.btnWearWeapon.visible = false;

        if (this.nowData.awakeWeaponId) {
            this.view.btnWearWeapon.visible = true;
            this.view.btnWearWeapon.curView.visible = true
            this.view.btnWearWeapon.noneView.visible = false;
            let weaponCfg = G.TableManager.getDataById(table.awakeweapon.AwakeWeaponConfig, this.nowData.awakeWeaponId)
            let weaponItemCfg = G.TableManager.getDataById(table.item.ItemConfig, weaponCfg.id)
            this.view.btnWearWeapon.lbName.color = ItemUtils.getTextColor(weaponItemCfg.quality)
            this.view.btnWearWeapon.lbName.text = weaponItemCfg.name;

            let comp: WeaponBaseItem = this.view.btnWearWeapon.iconItem as any;
            comp.setDataByItemCfg(weaponItemCfg, this.nowData.awakeWeaponStar)
        }

        if (this.nowData.magicCubeId) {
            this.view.magicCubeItem.visible = true;
            this.view.magicCubeItem.img_suo.visible = false;
            let cubeCfg = TableManager.getDataById(table.magiccube.MagicCubeConfig, this.nowData.magicCubeId);
            this.view.magicCubeItem.img_item.icon = cubeCfg.icon;
            this.view.magicCubeItem.img_frame.icon = ItemUtils.getQualityIconResourcePath(cubeCfg.quality);
            let magicCubeConstantConfig = TableManager.getDataById(table.magiccube.MagicCubeConstantConfig, "MAGICCUBE_NAME");
            this.view.magicCubeItem.T_name.text = magicCubeConstantConfig.content;
            this.view.magicCubeItem.T_level.text = this.nowData.magicCubeLv > 0 ? `+${this.nowData.magicCubeLv}` : "";
        }


        //获取最大星级 等级和品阶
        let lv = this.nowData.lv || levelCfgs[levelCfgs.length - 1].id;
        let stage = this.nowData.stage || stageCfgs[stageCfgs.length - 1].id;
        let star = this.nowData.star || heroCfg.initStar;
        if (!this.nowData.star) {
            for (let i = starCfgs.length - 1; i >= 0; i--) {
                if (starCfgs[i].quality == heroCfg.quality) {
                    star = starCfgs[i].star;
                    break;
                }
            }
        }
        this._star = star;

        //技能
        let skillDatas = FightManager.ins().getPureSkillDatasByParams(this._heroId, lv, star, stage, this.nowData.star ? false : true);
        this._showSkillDatas = skillDatas
            .filter((value) => value.slotId != 0)
            .sort((a, b) => {
                if (a.isUltimateSkill != b.isUltimateSkill) {
                    return a.isUltimateSkill ? -1 : 1;
                }
            });

        //更新界面展示
        //名字
        this.view.HeroSwitch.T_name.text = heroCfg.name;
        QualityUtils.setFGUIFontColorByQuality(this.view.HeroSwitch.T_name, heroCfg.quality);

        //星级
        let num = star % 5;
        this.view.HeroSwitch.HeroStarItem.list_star1.numItems = num == 0 ? 5 : num;

        if (this.nowData.playerName) {
            if (!this.nowData.playerData) {
                const heroVo = HeroManager.ins().getHeroVoByID(this._heroId);
                let fight = StringUtils.getFightStr(heroVo.getHeroFight + Math.floor((heroVo.getHeroFight * GIns.fightMgr.getFightMod()) / 10000));
                this.view.HeroSwitch.T_power.text = fight;
                let atk = AttrManager.ins().getPanelAttrByHeroId(heroVo.baseId, AttrType.Attack);
                let hp = AttrManager.ins().getPanelAttrByHeroId(heroVo.baseId, AttrType.Blood);
                let def = AttrManager.ins().getPanelAttrByHeroId(heroVo.baseId, AttrType.Defense);
                this.view.HeroUpLevel.T_attack.text = "" + atk;
                this.view.HeroUpLevel.T_blood.text = "" + hp;
                this.view.HeroUpLevel.T_defense.text = "" + def;
            }
            else {
                this.view.HeroUpLevel.T_attack.text = "" + this.nowData.attr[AttrEnum.ATK]
                this.view.HeroUpLevel.T_blood.text = "" + this.nowData.attr[AttrEnum.HP];
                this.view.HeroUpLevel.T_defense.text = "" + this.nowData.attr[AttrEnum.DEF];
                this.view.HeroSwitch.T_power.text = StringUtils.getFightStr(this.nowData.fight);
            }
        }
        else {
            //属性
            let attrs = FightManager.ins().getPureAttrByParams(this._heroId, lv, star, stage);

            //当前属性
            let atk = attrs.find((value) => value.id == Attribute.ATK)?.num;
            let hp = attrs.find((value) => value.id == Attribute.HP)?.num;
            let def = attrs.find((value) => value.id == Attribute.DEF)?.num;
            this.view.HeroUpLevel.T_attack.text = "" + atk;
            this.view.HeroUpLevel.T_blood.text = "" + hp;
            this.view.HeroUpLevel.T_defense.text = "" + def;

            //战力
            let fight = FightManager.ins().getPureFightByAttrAndSkills(this._heroId, attrs, skillDatas);
            this.view.HeroSwitch.T_power.text = StringUtils.getFightStr(fight);
        }

        this.view.HeroSwitch.img_camp.icon = ItemUtils.getCampIcon(heroCfg.camp);

        //@ts-ignore
        let heroSwitch = this.view.HeroSwitch as HeroSwitchPage;
        heroSwitch.updateHeroVoById(this._heroId);


        //阵营&&职业
        this.view.HeroUpLevel.T_zy.text = ItemUtils.getCareerName(ServerEnums.Career[heroCfg.career]);
        this.view.HeroUpLevel.img_zy.icon = ItemUtils.getCareerIcon(ServerEnums.Career[heroCfg.career]);

        //技能list
        let scale = this._showSkillDatas.length > 4 ? 0.9 : 1;
        this.view.HeroUpLevel.list_skill.setScale(scale, scale);
        this.view.HeroUpLevel.list_skill.numItems = this._showSkillDatas.length;

        if (this.nowData.playerName) {
            this.view.HeroUpLevel.getController("c1").selectedIndex = 6;
            this.view.HeroUpLevel.labelPlayerName.text = this.nowData.playerName;
            let playerAvatar = FguiScriptUtils.toMyScriptClass(this.view.HeroUpLevel.btnPlayerAvatar, PlayerAvatar)
            if (!this.nowData.playerData) {
                playerAvatar.resetMe()
                if (this.nowData.heroSkin) {
                    let modelId = HeroUtils.getShowTypeById(this._heroId, this.nowData.heroSkin, "showModelId") as number;
                    heroSwitch.setAnimByModelId(modelId);
                }
                else {
                    heroSwitch.setAnimByModelId(heroCfg.showModelId);
                }
            }
            else {
                playerAvatar.resetByPlayerInfo(this.nowData.playerData);
                if (this.nowData.heroSkin) {
                    let modelId = HeroUtils.getHeroSkinConfigById(this.nowData.heroSkin)["showModelId"]
                    heroSwitch.setAnimByModelId(modelId);
                }
                else {
                    heroSwitch.setAnimByModelId(heroCfg.showModelId);
                }
            }
        }
        else {
            this.view.HeroUpLevel.getController("c1").selectedIndex = 5;
            heroSwitch.setAnimByModelId(heroCfg.showModelId);
        }

        //等级
        this.view.HeroUpLevel.T_level.text = "Lv." + lv;
        this.view.HeroUpLevel.btn_tips.visible = false;

    }

    private onShow1Tips(str: string, event: any) {
        let pos = event.pos;
        this.view.attrTips.visible = true;
        this.view.attrTips.setPosition(pos.x, pos.y);
        let heroVo = HeroManager.ins().getHeroVoByID(this._heroId);

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

        // const isIn3 = TouchUtils.isTouchInUi(event, this.view.magicCubeItem.img_frame._uiTrans);
        // if (!isIn3) {
        //     this.view.magicCubeInfo.visible = false;
        // }
    }

    public onClose(): void { }
}
