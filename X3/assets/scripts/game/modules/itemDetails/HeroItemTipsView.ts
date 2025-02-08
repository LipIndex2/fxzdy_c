import G from "../../../core/comm/G";
import UIScriptManager, { bindScript } from "../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../core/mvc/view/UICommWin";
import { TableManager } from "../../../core/table/TableManager";
import { FguiScriptUtils } from "../../../core/utils/FguiScriptUtils";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import GIns from "../../GIns";
import { HeroDetailsAvatar } from "../common/hero/HeroDetailsAvatar";
import { FightManager } from "../fight/FightManager";
import { UIHeroKey } from "../hero/const/UIHeroConfig";
import { HeroSkillData } from "../hero/HeroVo";
import { HeroSkillItem } from "../hero/item/HeroSkillItem";
import { IHeroInfoPreviewWinOpenArgs } from "../hero/view/HeroInfoPreviewWin";
import { ItemUtils } from "../item/utils/ItemUtils";
import { PlayerModel } from "../player/model/PlayerModel";
import { UIViewItemDetailsKey } from "./UIViewItemDetailsKey";

export interface HeroItemTipsViewOpenArgs {
    itemConfig: table.item.ItemConfig;
    lv?: number;
    star?: number;
    stage?: number;
    /***玩家数据 */
    playerData?: Vo.player.PlayerBaseVo;
    /***一系列的数据 */
    list?: HeroItemTipsViewOpenArgs[]
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
    /***英雄皮肤 */
    heroSkin?: number;
    attr?: { [key: number]: number };
    fight?: number;
}

/**
 * 道具详情
 */
@bindScript(UIViewItemDetailsKey.HeroCardDetails)
export class HeroItemTipsView extends UICommWin {
    static pkgName: string = "itemDetails";
    static viewName: string = "HeroItemTipsView";
    private heroCfg: table.hero.HeroConfig;
    protected _showSkillDatas: HeroSkillData[] = [];
    private playerData: Vo.player.PlayerBaseVo;
    private playerName: string
    private data: HeroItemTipsViewOpenArgs

    private get view(): ui.itemDetails.HeroItemTipsView {
        return this._view as any;
    }

    public onInit(): void {
        this.view.goBtn.onClick(this.onClickJump, this);
        this.view.list_skill.itemRenderer = this.itemRendererForSkill.bind(this);
    }

    public onClose(): void { }

    public onOpen(args: HeroItemTipsViewOpenArgs, isReopen?: boolean): void {
        this.data = args;
        if (!args || !args.itemConfig || !args.itemConfig.id) {
            return;
        }
        let heroCfg = TableManager.getDataById(table.hero.HeroConfig, args.itemConfig.id);
        if (heroCfg) {
            this.heroCfg = heroCfg;
            FguiScriptUtils.toMyScriptClass(this.view.head, HeroDetailsAvatar).reset(heroCfg.id, args.star || heroCfg.initStar, 0, args.heroSkin);
            this.view.nameLab.text = heroCfg.name;
            this.view.nameLab.color = ItemUtils.getTextColor(this.heroCfg.quality);

            //阵营&&职业
            this.view.jobNameLab.text = ItemUtils.getCareerName(ServerEnums.Career[this.heroCfg.career]);
            this.view.jobIcon.icon = ItemUtils.getCareerIcon(ServerEnums.Career[this.heroCfg.career]);

            let cfg = TableManager.getDataById(table.hero.HeroRaceConfig, this.heroCfg.camp);
            this.view.raceNameLab.text = cfg.name;
            this.view.raceIcon.icon = ItemUtils.getCampIcon(this.heroCfg.camp);

            this.view.desLab.text = this.heroCfg.desc;

            let stageCfgs = G.TableManager.getAllData(table.hero.HeroStageConfig);
            let levelCfgs = G.TableManager.getAllData(table.hero.HeroLevelConfig);
            //获取最大星级 等级和品阶
            let lv = args.lv || levelCfgs[levelCfgs.length - 1].id;
            let stage = args.stage || stageCfgs[stageCfgs.length - 1].id;
            let star = args.star || GIns.heroMgr.getHeroMaxStar(args.itemConfig.id);

            let isPlayerData = args.star ? true : false;
            this.playerData = args.playerData;
            if (isPlayerData) {
                if (this.playerData)
                    this.playerName = this.playerData.name;
                else
                    this.playerName = PlayerModel.ins().playerName;
            }

            let skillDatas = FightManager.ins().getPureSkillDatasByParams(this.heroCfg.id, lv, star, stage, args.star == 0);
            this._showSkillDatas = skillDatas
                .filter((value) => value.slotId != 0)
                .sort((a, b) => {
                    if (a.isUltimateSkill != b.isUltimateSkill) {
                        return a.isUltimateSkill ? -1 : 1;
                    }
                });
            //技能list
            let scale = this._showSkillDatas.length > 4 ? 0.85 : 1;
            this.view.list_skill.setScale(scale, scale);
            this.view.list_skill.numItems = this._showSkillDatas.length;
        }
    }

    private onClickJump() {
        // HeroInfoPreview
        if (this.data.list?.length) {
            let items: IHeroInfoPreviewWinOpenArgs[] = []
            for (let i = 0; i < this.data.list.length; i++) {
                if (this.data.list[i].itemConfig) {
                    let item = {
                        heroId: this.data.list[i].itemConfig.id, playerName: this.playerName, playerData: this.data.list[i].playerData,
                        lv: this.data.list[i].lv, stage: this.data.list[i].stage, star: this.data.list[i].star, magicCubeId: this.data.list[i].magicCubeId
                        , magicCubeLv: this.data.list[i].magicCubeLv, awakeWeaponId: this.data.list[i].awakeWeaponId, awakeWeaponStar: this.data.list[i].awakeWeaponStar,
                        heroSkin: this.data.list[i].heroSkin, attr: this.data.list[i].attr, fight: this.data.list[i].fight
                    } as IHeroInfoPreviewWinOpenArgs;
                    items.push(item)
                }
            }
            G.UIManager.open(UIHeroKey.HERO_INFO_PREVIEW_WIN, items);
        }
        else
            G.UIManager.open(UIHeroKey.HERO_INFO_PREVIEW_WIN, [{
                heroId: this.heroCfg.id, playerName: this.playerName, playerData: this.playerData, lv: this.data.lv, stage: this.data.stage, star: this.data.star
                , magicCubeId: this.data.magicCubeId, magicCubeLv: this.data.magicCubeLv, awakeWeaponId: this.data.awakeWeaponId, awakeWeaponStar: this.data.awakeWeaponStar
                , heroSkin: this.data.heroSkin, attr: this.data.attr, fight: this.data.fight
            } as IHeroInfoPreviewWinOpenArgs]);
    }

    //技能item
    private itemRendererForSkill(index: number, item: HeroSkillItem) {
        let skillData = this._showSkillDatas[index];

        item.updateInfo(skillData, this.heroCfg.id);
    }
}
