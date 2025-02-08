import { HeroUtils } from "db://assets/scripts/game/modules/hero/utils/HeroUtils";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import G from "db://assets/scripts/core/comm/G";
import { ModelUtils } from "db://assets/scripts/game/modules/common/model/ModelUtils";
import { QualityUtils } from "db://assets/scripts/game/modules/common/quality/QualityUtils";
import { tween, v3 } from "cc";
import { DrawCardUtils } from "db://assets/scripts/game/modules/drawcard/utils/DrawCardUtils";
import { UIView } from "db://assets/scripts/core/mvc/view/UIView";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { ModelNode } from "db://assets/scripts/game/modules/common/node/ModelNode";
import { EnumGainNewHeroType } from "db://assets/scripts/game/modules/drawcard/enums/EnumGainNewHeroType";
import { DrawCardModel } from "db://assets/scripts/game/modules/drawcard/model/DrawCardModel";
import { ItemConfigManager } from "db://assets/scripts/game/modules/item/config/ItemConfigManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { WeaponConfigManager } from "db://assets/scripts/game/modules/weapon/config/WeaponConfigManager";
import { WeaponManager } from "db://assets/scripts/game/modules/weapon/WeaponManager";
import { AttrData } from "db://assets/scripts/game/modules/attr/AttrManager";
import { DrawCardWeaponWordItem } from "db://assets/scripts/game/modules/drawcard/components/DrawCardWeaponWordItem";
import { DrawCardConfigManager } from "db://assets/scripts/game/modules/drawcard/config/DrawCardConfigManager";
import { FormationVo } from "../../formation/vo/FormationVo";
import { FormationManager } from "../../formation/FormationManager";
import { FightType } from "../../../comm/battle/enum/FightType";
import { PositionVoData } from "../../formation/vo/PositionVo";
import { FormationModel } from "../../formation/model/FormationModel";
import { HeroManager } from "../../hero/HeroManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { DrawCardUIKeys } from "../DrawCardUIKeys";
import GIns from "../../../GIns";
import { HeroConfigManager } from "db://assets/scripts/game/modules/hero/config/HeroConfigManager";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import ItemType = ServerEnums.ItemType;


// open args
export class DrawCardFirstGetItemViewOpenArgs {
    // heroId / weaponId
    itemId: number;
    type: EnumGainNewHeroType
    // 转成碎片数量
    toFragmentCount: number = 0;

    static create(itemId: number,
        type: EnumGainNewHeroType,
        toFragmentCount: number = 0,
    ): DrawCardFirstGetItemViewOpenArgs {
        let args = new DrawCardFirstGetItemViewOpenArgs();
        args.itemId = itemId;
        args.type = type;
        args.toFragmentCount = toFragmentCount;
        return args;
    }
}

/**
 * 抽卡得到新英雄的界面
 */
@bindScript(DrawCardUIKeys.DrawCardFirstGetItemView)
export class DrawCardFirstGetItemView extends UIView {


    static pkgName: string = "drawCard";

    static viewName: string = "DrawCardFirstGetItemView";

    private _count = 0
    private _type: EnumGainNewHeroType = EnumGainNewHeroType.DRAW_CARD;
    private _attrArray: AttrData[] = [];
    protected _heroId: number = 0
    private _toFragmentCount: number;

    private get view(): ui.drawCard.DrawCardFirstGetItemView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
        }

    }


    protected onInit() {

        super.onInit();

        this.view.getTransition("enter").play(() => {

            // 按钮
            this.view.btnOkGain.onClick(this.onBtnOkClick, this);
        });

        this.view.starList.setVirtual();
        this.view.starList.itemRenderer = this.itemRendererForStar.bind(this);


        this.view.listAttr.setVirtual();
        this.view.listAttr.itemRenderer = this.irAttr.bind(this);


    }

    private itemRendererForStar(index: number, item: ui.drawCard.components.DrawCardHeroStarComp): void {
        const num = index + 1;

        // 星星
        item.fg.visible = num <= this._count;
    }

    private irAttr(index: number, item: DrawCardWeaponWordItem): void {
        item.reset(this._attrArray[index]);

    }


    protected onOpen(args: DrawCardFirstGetItemViewOpenArgs) {
        super.onOpen(args);

        this._type = args.type;
        this._toFragmentCount = args.toFragmentCount || 0;

        this.reset(args.itemId)
    }

    protected onClose() {
        super.onClose();

        if (this._heroId > 0 && this._heroId == DrawCardModel.ins().context.firstChargeWaitSetUpHeroId) {
            //自动上阵
            this.autoSetUpHero(this._heroId)
            DrawCardModel.ins().context.firstChargeWaitSetUpHeroId = 0
        }

    }

    protected autoSetUpHero(heroId: number): void {
        let formationVo: FormationVo = FormationManager.ins().getTempFormationVoByType(FightType.TRUNK_MAP);
        let tempFormationVo = formationVo;
        let tempPosVo = tempFormationVo.allPosData;
        // 阵容的队长技id
        // let captainSkillId = formationVo.captainId || 0;
        let emptyPosVo = tempPosVo.find((value) => value.isUnlock && !value.heroId)
        if (emptyPosVo) {
            //存在空位
            let posVoDate: PositionVoData = {
                positionId: heroId,
                heroBaseId: heroId,
            }
            emptyPosVo.setPosVoData(posVoDate);

            let reqVo: Vo.formation.SetupFormationReqVo = {
                // TODO 布阵
                // captainId: captainSkillId,
                collectiblesId: 0,
                petBaseId: 0,
                positionVos: []
            };
            for (let data of tempPosVo) {
                if (data.isUnlock) {
                    let vo: Vo.formation.PositionVo = {
                        position: data.BaseId,
                        heroBaseId: data.heroId,
                    }
                    reqVo.positionVos.push(vo);
                }
            }
            FormationModel.ins().setUpFormation(FightType.TRUNK_MAP, reqVo)
            let heroVo = HeroManager.ins().getHeroVoByID(heroId)
            if (heroVo) {
                GIns.floatingTextMgr.showTips(`${heroVo.heroCfg.name}已加入队伍`)
            }
        }
    }

    private onBtnOkClick() {
        // 连续弹出
        if (this._type === EnumGainNewHeroType.REWARD) {
            const isHaveNew = DrawCardModel.ins().tryShowNewGainHeroByType(this._type);
            if (isHaveNew) {
                return;
            }
        }

        // 仅限一次
        this.closeSelf();
        G.FacadeManager.emit(NotificationKey.CLOSE_GET_NEW_HERO_VIEW);
    }

    @LogBusiness("展示抽卡结果")
    private reset(itemId: number) {
        // fragment
        if (this._type == EnumGainNewHeroType.HERO_DUPLICATE_TO_FRAGMENT) {
            // no title
            this.view.G_headTitle.visible = false;
        }


        // item
        const itemConfig = ItemConfigManager.getItemConfigByItemId(itemId);
        if (itemConfig == null) {
            console.error(`没找到道具配置. itemId = ${itemId}`);
            return;
        }

        const type = ItemConfigManager.getItemTypeByItemId(itemId);


        // config 
        let quality = itemConfig.quality;
        let qualityConfig: table.quality.QualityConfig = QualityUtils.getQualityConfigById(quality);
        let modelConfig: table.model.ModelConfig;
        let raceConfig: table.hero.HeroRaceConfig;

        let isShowStar = true;

        // type 
        let star = 5
        this._heroId = 0
        if (type == ItemType.HERO_CARD) {
            this._heroId = itemId

            // 转为碎片
            const isToHeroFragment = this._toFragmentCount > 0;
            // 是否显示
            this.view.fragmentComp.visible = isToHeroFragment;
            if (isToHeroFragment) {
                const heroConfig1 = HeroConfigManager.getConfigById(itemId);
                this.view.fragmentComp.imgSmallItem.icon = ItemUtils.getItemConfigByItemId(heroConfig1?.fragmentItemId)
                    ?.iconPath;
                this.view.fragmentComp.labelItemCount.text = `x${this._toFragmentCount}`;
            }

            this.view.getController("type").selectedIndex = 0;

            // hero
            const heroConfig: table.hero.HeroConfig = HeroUtils.getHeroConfigById(itemId);
            if (!heroConfig) {
                G.Logger.error(`配置有误. 不存在 heroId=${itemId}`)
                return;
            }

            // quality
            quality = heroConfig.quality;
            qualityConfig = QualityUtils.getQualityConfigById(quality);
            if (!qualityConfig) {
                G.Logger.error(`配置有误. 不存在 qualityId=${quality}`)
                return;
            }

            this._count = heroConfig.initStar || 1;
            this.view.labelHeroName.text = heroConfig.name;

            // 种族
            let careerCfg = HeroUtils.getCareerByHeroId(itemId)
            if (careerCfg) {
                this.view.imageCareerLogo.grayed = true;
                this.view.imageCareerLogo.icon = careerCfg.bigAssetPath;
            }
            raceConfig = HeroUtils.getRaceByHeroId(itemId)
            if (raceConfig) {
                this.view.imageJob.icon = raceConfig.assetPath;
            }

            // 展示用的模型id
            const showModelId = heroConfig.showModelId;

            // 种族

            // hero 字体颜色
            QualityUtils.setFGUIFontColorByQuality(this.view.labelHeroName, quality);
            // this.view.labelHeroName.color = QualityUtils.getQualityColor(quality);

            // model
            modelConfig = ModelUtils.getModelConfigById(showModelId);
            if (!modelConfig) {
                return;
            }


            // spine 英雄
            const spineRootNode = this.view.spineHero.node;
            spineRootNode.removeAllChildren();
            ModelUtils.createSpineByModelConfig(modelConfig, spineRootNode)
                .then(it => {
                    //console.log("spine done", it)
                    // 缩放
                    const showHeroScale = DrawCardUtils.getShowHeroScale();
                    G.Logger.debug(`英雄大小 spine 缩放 = ${showHeroScale}`)

                    it.node.scale = v3(0, 0, 1);
                    tween(it.node)
                        .to(0.5, { scale: v3(showHeroScale, showHeroScale, 1) })
                        .start();
                });

        } else if (type == ItemType.AWAKE_WEAPON) {

            // weapon
            this.view.getController("type").selectedIndex = 1;


            const config: table.awakeweapon.AwakeWeaponConfig = WeaponConfigManager.getConfigById(itemId);
            if (!config) {
                G.Logger.error(`配置有误. 不存在 weaponId=${itemId}`)
                return;
            }

            // attr
            const attrData = WeaponManager.ins().converWeaponAttr(config, 0);
            this._attrArray = attrData || [];
            this.view.listAttr.numItems = this._attrArray.length;

            this.view.imageWeapon.icon = itemConfig.iconPath;

            this.view.labelWeaponName.text = itemConfig.name;
            this.view.labelWeaponName.color = QualityUtils.getQualityColor(quality);

            this.view.imageJobLogo.icon = DrawCardConfigManager.weaponDrawFirstGainLogoAssetPath;
        } else if (type == ItemType.PET_CARD) {
            //星灵
            this.view.getController("type").selectedIndex = 2

            let petCfg = G.TableManager.getDataById(table.pet.PetConfig, itemId)
            let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, itemId)
            this.view.labelPetName.text = itemCfg.name;
            QualityUtils.setFGUIFontColorByQuality(this.view.labelPetName, quality);

            let model = this.view.spinePet as ModelNode
            model.loadByModelId(petCfg.showModelId)
            star = petCfg.initStar
        } else if (type == ItemType.COLLECTIBLES_CARD) {
            //收藏品
            this.view.getController("type").selectedIndex = 3;
            let collectionCfg = G.TableManager.getDataById(table.collectibles.CollectiblesConfig, itemId);
            let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, itemId)
            this.view.labelCollName.text = itemCfg.name;
            QualityUtils.setFGUIFontColorByQuality(this.view.labelCollName, quality);
            star = 0;
            isShowStar = collectionCfg.validHours <= 0;
            this.view.collectionIcon.icon = itemCfg.bigIconPath;
        }

        if (type == ItemType.PET_CARD || type == ItemType.HERO_CARD || type == ItemType.COLLECTIBLES_CARD) {
            // spine 背景
            const modelBg = this.view.spineBg as ModelNode;
            modelBg.loadByPath(qualityConfig.newHeroBgSpinePath);
            setTimeout(() => {
                modelBg.playOrders([
                    {
                        name: "enter",
                    }
                ]);
            }, 250);
            // spine 标题
            const modelTitle = this.view.spineTitle as ModelNode;
            modelTitle.loadByPath(DrawCardUtils.getNewHeroTitleSpinePath());
            modelTitle.playOrders([
                {
                    name: "enter",
                }
            ]);
            // spine 光
            const modelGuang = this.view.spineGuang as ModelNode;
            modelGuang.loadByPath(qualityConfig.newHeroFootLightSpinePath);
            modelGuang.playOrders([
                {
                    name: "idle",
                    isLoop: false,
                }
            ]);


            // spine 光
            const spineStage = this.view.spineStage as ModelNode;
            spineStage.loadByPath(qualityConfig.newHeroFootLightLoopSpinePath);
            spineStage.playOrders([
                {
                    name: "idle",
                    isLoop: true,
                }
            ]);
        }


        // 通用部分

        // 底座
        this.view.imageChassis.icon = qualityConfig.drawCardDiZuo;
        // 光
        this.view.imageGuang.icon = qualityConfig.drawCardGuang;


        // hero quality
        this.view.imageQuality.icon = qualityConfig.qualityTitleIconPath;

        // 星星
        this.view.starList.numItems = isShowStar ? HeroUtils.getShowStarCount(star) : 0;
    }
}