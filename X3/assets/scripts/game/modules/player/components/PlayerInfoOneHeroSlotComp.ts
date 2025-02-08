import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { ModelNode } from "db://assets/scripts/game/modules/common/node/ModelNode";
import { HeroUtils } from "db://assets/scripts/game/modules/hero/utils/HeroUtils";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { QualityUtils } from "db://assets/scripts/game/modules/common/quality/QualityUtils";
import * as fgui from "fairygui-cc"
import { math } from "cc";
import { PlayerInfoConfigManager } from "db://assets/scripts/game/modules/player/config/PlayerInfoConfigManager";
import { PositionVo } from "db://assets/scripts/game/modules/formation/vo/PositionVo";
import { HeroManager } from "db://assets/scripts/game/modules/hero/HeroManager";
import { ModelUtils } from "../../common/model/ModelUtils";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { UIViewItemDetailsKey } from "../../itemDetails/UIViewItemDetailsKey";
import { HeroItemTipsViewOpenArgs } from "../../itemDetails/HeroItemTipsView";
import { PlayerInfoMainView } from "../view/PlayerInfoMainView";
import GIns from "../../../GIns";

export class PlayerInfoOneHeroSlotComp extends fgui.GComponent {
    private _starIcon: string;

    private _heroId: number = 0;
    public get heroId(): number {
        return this._heroId;
    }
    private _starCount: number = 0;
    public get starCount(): number {
        return this._starCount;
    }
    private _lv: number = 0;
    public get lv(): number {
        return this._lv;
    }
    private _stage: number = 0;
    public get stage(): number {
        return this._stage;
    }

    /**
         * 魔方配置Id
         */
    private _magicCubeId: number;
    public get magicCubeId(): number {
        return this._magicCubeId;
    }

    /**
     * 魔方等级
     */
    private _magicCubeLevel: number;
    public get magicCubeLevel(): number {
        return this._magicCubeLevel;
    }

    /**
     * 专属武器配置Id
     */
    private _awakeWeaponId: number;
    public get awakeWeaponId(): number {
        return this._awakeWeaponId;
    }

    /**
     * 专属武器星级
     */
    private _awakeWeaponStar: number;
    public get awakeWeaponStar(): number {
        return this._awakeWeaponStar;
    }

    /***玩家数据 */
    private _playerData?: Vo.player.PlayerBaseVo;
    public get playerData(): Vo.player.PlayerBaseVo {
        return this._playerData;
    }

    /***英雄皮肤 */
    private _heroSkin: number;
    public get heroSkin(): number {
        return this._heroSkin;
    }

    /***战力 */
    private _fight: number;
    public get fight(): number {
        return this._fight;
    }

    /***属性 */
    private _attr: any;
    public get attr(): any {
        return this._attr;
    }

    private parentUi: PlayerInfoMainView

    private get view(): ui.playerInfo.components.PlayerInfoOneHeroSlotComp {
        return this as any;
    }

    protected onConstruct() {
        super.onConstruct();

        this.view.rootForSpine.onClick(this.onClickModel, this)
        this.view.starList.itemRenderer = this.reStar.bind(this);
    }

    private onClickModel(): void {
        this.parentUi.clickHeroSlotComp(this._heroId, this)
        // let itemConfig = ItemUtils.getItemConfigByItemId(this._heroId);
        // UIManager.ins().open(UIViewItemDetailsKey.HeroCardDetails, {
        //     itemConfig: itemConfig,
        //     star: this._starCount,
        //     lv: this._lv,
        //     stage: this._stage,
        //     playerData: this.playerData,
        // } as HeroItemTipsViewOpenArgs);
    }

    reset(posVo: Vo.formation.PositionVisitVo | null, playerBaseVo: Vo.player.PlayerBaseVo, parent: PlayerInfoMainView) {
        this.parentUi = parent;
        if (!posVo) {
            this.view.getController("isHave").selectedIndex = 0;
            this.view.dnaShow.visible = false;
            return;
        }
        const heroId = posVo.heroBaseId
        const starCount = posVo.star;

        this._heroId = heroId;
        this._starCount = starCount;
        this._lv = posVo.heroLevel;
        this._stage = posVo.heroStage
        this._playerData = playerBaseVo;
        this._magicCubeId = posVo.magicCubeId;
        this._magicCubeLevel = posVo.magicCubeLevel;
        this._awakeWeaponId = posVo.awakeWeaponId;
        this._awakeWeaponStar = posVo.awakeWeaponStar;
        this._heroSkin = posVo.useSkinId;
        this._fight = posVo.fight;
        this._attr = posVo.attrId2Value;

        const heroConfig = HeroUtils.getHeroConfigById(heroId);
        if (!heroConfig) {
            this.view.getController("isHave").selectedIndex = 0;
            this.view.dnaShow.visible = false;
            return;
        }
        this.view.getController("isHave").selectedIndex = 1;


        const diZuoPath = ItemUtils.getFormationItemBg(heroConfig.quality);


        let modelId = HeroUtils.getShowTypeById(heroId, posVo.useSkinId, "modelId") as number;
        const md = FguiScriptUtils.toMyScriptClass(this.view.rootForSpine, ModelNode);
        md.loadByModelId(modelId);
        md.spineNode.modelScale = PlayerInfoConfigManager.scaleForHero;
        md.play(ModelUtils.getUiModelActionById(modelId), true);

        // TODO
        const finalStarCount = HeroUtils.getShowStarCount(starCount);

        this._starIcon = ItemUtils.getStarIcon(starCount);


        this.view.labelHeroName.text = heroConfig.name;
        this.view.starList.numItems = finalStarCount;
        this.view.imageDi.icon = diZuoPath;
        this.view.labelHeroName.color = QualityUtils.getQualityColor(heroConfig.quality);

        // dna/英雄潜能信息
        const star = HeroManager.ins().getHeroConstantCfg("HERO:OPEN_DNA_STAR_LEVEL").content;
        const starEnough: boolean = starCount >= Number(star) ? true : false; // 是否开启潜能
        const dnaInfo = posVo.awakenKeys || null;
        if (starEnough && dnaInfo){
            for (let index = 0; index < dnaInfo.length; index++) {
                const stage = dnaInfo[index];
                this.view.dnaShow.getChild(`stage${stage}`).visible = true;
            }
            this.view.dnaShow.visible = true;
        } else {
            this.view.dnaShow.visible = false;
        }
    }

    reStar(index: number, item: ui.comm.item.StarIconItem) {
        item.starIcon.icon = this._starIcon;
    }

    resetMe(posVo: PositionVo, parent: PlayerInfoMainView) {
        this.parentUi = parent;
        if (!posVo) {
            this.view.getController("isHave").selectedIndex = 0;
            this.view.dnaShow.visible = false;
            return;
        }
        const heroId = posVo.heroId;
        const heroVo = HeroManager.ins().getHeroVoByID(heroId);
        const starCount = heroVo?.star || 1;

        this._heroId = heroId;
        this._starCount = starCount;
        this._lv = posVo.level;
        this._stage = posVo.stage
        this._playerData = null;


        let magicClubVo = GIns.magicCubeMgr.getMagicCubeVoByHeroId(heroId);
        if (magicClubVo) {
            this._magicCubeId = magicClubVo.id;
            this._magicCubeLevel = magicClubVo.level;
        }

        let weaponVo = GIns.weaponMgr.getWeaponForHero(heroId)
        if (weaponVo) {
            this._awakeWeaponId = weaponVo.cfg.id;
            this._awakeWeaponStar = weaponVo.base.star;
        }

        const heroConfig = HeroUtils.getHeroConfigById(heroId);
        if (!heroConfig) {
            this.view.getController("isHave").selectedIndex = 0;
            this.view.dnaShow.visible = false;
            return;
        }
        this.view.getController("isHave").selectedIndex = 1;


        const diZuoPath = ItemUtils.getFormationItemBg(heroConfig.quality);

        let modelId = HeroUtils.getShowTypeById(heroId, heroVo.heroVoData.useSkinId, "modelId") as number;
        const md = FguiScriptUtils.toMyScriptClass(this.view.rootForSpine, ModelNode);
        md.loadByModelId(modelId);
        md.spineNode.modelScale = PlayerInfoConfigManager.scaleForHero;
        md.play(ModelUtils.getUiModelActionById(modelId), true);

        this._heroSkin = heroVo.heroVoData.useSkinId;

        const finalStarCount = HeroUtils.getShowStarCount(starCount);

        this._starIcon = ItemUtils.getStarIcon(starCount);


        this.view.labelHeroName.text = heroConfig.name;
        this.view.starList.numItems = finalStarCount;
        this.view.imageDi.icon = diZuoPath;
        this.view.labelHeroName.color = QualityUtils.getQualityColor(heroConfig.quality);

        // DNA/英雄潜能显示
        const dnaInfo = heroVo?.getDNAInfo() || null;
        const star = HeroManager.ins().getHeroConstantCfg("HERO:OPEN_DNA_STAR_LEVEL").content;
        const starEnough: boolean = starCount >= Number(star) ? true : false; // 是否开启潜能
        if (starEnough && dnaInfo){
            const stages = Object.keys(dnaInfo.awaken);
            for (let index = 0; index < stages.length; index++) {
                const element = stages[index];
                let test = `stage${element}`
                let child = this.view.dnaShow.getChild(test);
                if (child) {
                    child.visible = true;
                }
            }
            this.view.dnaShow.visible = true;  
        } else {
            this.view.dnaShow.visible = false;
        }
    }

    changeCtrl(index){
        const switchCtrl = this.view.getController("isDna");
        switchCtrl.selectedIndex = index;
    }
}


