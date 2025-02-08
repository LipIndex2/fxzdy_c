import * as fgui from "fairygui-cc";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { FightType } from "../../../comm/battle/enum/FightType";
import { AudioManager, SoundType } from "../../../comm/mgr/AudioManager";
import { UiTweenMgr } from "../../../../core/comm/UiTweenMgr";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { HeroItem } from "../../common/item/HeroItem";
import { HeroItemWithHp } from "../../common/item/HeroItemWithHp";
import { HeroCampType } from "../../hero/HeroEnum";
import { HeroManager } from "../../hero/HeroManager";
import { HeroSelectData, HeroVo, HeroVoDate } from "../../hero/HeroVo";
import { FormationMainViewOpenArgsExcludeParam } from "../const/UIFormationConfig";
import { FormationManager } from "../FormationManager";
import { PositionVo, PositionVoData } from "../vo/PositionVo";
import G from "../../../../core/comm/G";
import { UIPetDungeonConfig } from "../../petDungeon/const/UIPetDungeonConfig";

/** 布阵英雄展示页 */
export class FormationHeroListPage extends fgui.GComponent {
    static pkgName: string = "formation";
    static viewName: string = "FormationHeroListPage";

    /** 筛选过的英雄列表 */
    private _heroVoArray: HeroVo[];

    // 过滤的阵营
    private _filterCampType: HeroCampType;
    // 过滤的职业
    private _careerType: ServerEnums.Career;

    private tempPosVo: PositionVo[];

    protected _excludes: Map<number, FormationMainViewOpenArgsExcludeParam> = null;

    private _isFirst = true;

    private _fightType;

    protected _petTempHeroArr:HeroVo[] = [];

    private get view(): ui.formation.page.FormationHeroListPage {
        return this as any;
    }

    constructor() {
        super();
    }

    //更新item
    public updateData(arge: HeroSelectData, tempPosVo: PositionVo[], excludes: Map<number, FormationMainViewOpenArgsExcludeParam> = null, fightType: FightType) {
        if (arge) {
            this._filterCampType = arge.campType;
            this._careerType = arge.careerType;
        }
        this._fightType = fightType;
        this.tempPosVo = tempPosVo;
        this._excludes = excludes;
        this.updateUI();
    }

    onInit() {
        let self = this.view;
        // hero
        self.list_hero.setVirtual();
        self.list_hero.itemRenderer = UiTweenMgr.ins().listItemRendererEffect(this.view.list_hero.node.uuid, this.irHero, this);
        self.listHeroWithHp.setVirtual();
        self.listHeroWithHp.itemRenderer = UiTweenMgr.ins().listItemRendererEffect(this.view.listHeroWithHp.node.uuid, this.itemRendererForHpHero, this);
        self.listHeroWithHp.visible = false;
        //@ts-ignore
        let selectItem = self.item_select as HeroSelectItem;
        selectItem.setType("formation");
        // this.updateUI();
    }

    onClose() {
        UiTweenMgr.ins().removeListItemRendererEffect(this.view.list_hero.node.uuid);
        UiTweenMgr.ins().removeListItemRendererEffect(this.view.listHeroWithHp.node.uuid);
    }

    protected getAllHeroVo(): HeroVo[] {
        let heroVoArr:HeroVo[] = []
        if (this._fightType == FightType.PET_DUNGEON) {
            //宠物副本要用备战英雄
            let map = GIns.petDungeonModel.prepareHeroMap;
            map.forEach((value) => {
                let data = GIns.heroMgr.getHeroVoByID(value.heroId);
                if (data) {
                    if (!this._careerType || ServerEnums.Career[data.heroCfg.career] == this._careerType) {
                        let heroVo = new HeroVo();

                        let heroVoData: HeroVoDate = {
                            id: data.heroVoData.id,
                            baseId: data.heroVoData.baseId,
                            fragment: data.fragment,
                            star: data.star,
                            isActivate: true,
                            useSkinId: data.heroVoData.useSkinId,
                            heroSkinIds: data.heroVoData.heroSkinIds,
                        };
                        heroVo.setHeroVoData(heroVoData);
                        heroVoData.isCanUse = true;
                        heroVoArr.push(heroVo);
                    }
                }
            })
            if (this._petTempHeroArr.length != heroVoArr.length + 1) {
                //当英雄数量变更时 才排序
                heroVoArr.sort((a, b) => {
                    let hasA:boolean = this.tempPosVo.find((value) => value.heroId == a.heroCfg.id) != null;
                    let hasB:boolean = this.tempPosVo.find((value) => value.heroId == b.heroCfg.id) != null;
                    if (hasA != hasB) {
                        return hasA ? -1: 1;
                    }
                    if (a.Level != b.Level) {
                        return b.Level - a.Level;
                    }
                    if (a.star != b.star) {
                        return b.star - a.star;
                    }
                    return b.heroCfg.id - a.heroCfg.id;
                });
                //添加一个跳转加号
                heroVoArr.unshift(null);
                this._petTempHeroArr = heroVoArr;
            }
            this._petTempHeroArr.forEach((value) => {
                if (value) {
                    //重置位置
                    value.posId = 0;
                }
            })
            
            return this._petTempHeroArr;
        }
        //其他情况
        let filterHeroVoArr = HeroManager.ins().getHeroVoArrByCampType(null, this._careerType, false);
        let excludeHeroVoArr = []
        for (let data of filterHeroVoArr) {
            let heroVo = new HeroVo();

            let heroVoData: HeroVoDate = {
                id: data.heroVoData.id,
                baseId: data.heroVoData.baseId,
                fragment: data.fragment,
                star: data.star,
                isActivate: true,
                useSkinId: data.heroVoData.useSkinId,
                heroSkinIds: data.heroVoData.heroSkinIds,
            };
            heroVo.setHeroVoData(heroVoData);

            if (this._filterCampType) {
                heroVoData.isCanUse = heroVo.campType == this._filterCampType;
            } else {
                heroVoData.isCanUse = true;
            }
            if (this._excludes && this._excludes.has(heroVoData.baseId)) {
                heroVoData.isActivate = false
                excludeHeroVoArr.push(heroVo)
                continue
            }
            heroVoArr.push(heroVo);
        }

        if (this._isFirst) {
            heroVoArr.sort(HeroVo.ComparatorByFilter);
            if (excludeHeroVoArr) {
                excludeHeroVoArr.sort(HeroVo.ComparatorByFilter);
            }
            this._isFirst = false;
        }
        return heroVoArr.concat(excludeHeroVoArr)
    }

    private updateUI() {
        let self = this.view;
        //克隆英雄数据
        this._heroVoArray = this.getAllHeroVo();

        //设置阵位
        for (let vo of this.tempPosVo) {
            if (vo.heroId) {
                for (let hero of this._heroVoArray) {
                    if (hero) {
                        if (this._fightType == FightType.TEAM_INSTANCE) {
                            const poses = FormationManager.ins().getPoses();
                            if (hero.baseId == vo.heroId && poses.indexOf(vo.BaseId) != -1) {
                                hero.posId = vo.BaseId;
                                break
                            }
                        } else {
                            if (hero.baseId == vo.heroId) {
                                hero.posId = vo.BaseId;
                                break
                            }
                        }
                    }
                }
            }
        }
        if (this._fightType == FightType.PET_DUNGEON) {
            //显示有生命的item
            self.list_hero.visible = false;
            self.listHeroWithHp.visible = true;
            self.listHeroWithHp.numItems = this._heroVoArray.length;
        } else {
            self.list_hero.visible = true;
            self.listHeroWithHp.visible = false;
            self.list_hero.numItems = this._heroVoArray.length;
        }
    }

    private irHero(index: number, item: HeroItem) {
        const heroVo = this._heroVoArray[index];
        let excludeParam: FormationMainViewOpenArgsExcludeParam = null;
        if (this._excludes != null && this._excludes.has(heroVo.baseId)) {
            excludeParam = this._excludes.get(heroVo.baseId);
        }
        item.setHeroVo(heroVo, null, this._fightType);
        item.isShowCamp(false);
        item.isShowGou(heroVo.posId ? true : false);
        if (excludeParam) {
            item.setLockTip(excludeParam.tip, excludeParam.tipColor);
        }

        //点击回调
        item.setClickFun(() => {
            if (excludeParam != null) {
                //排除的不可选中
                return;
            }
            if (heroVo.isLock) {
                GIns.floatingTextMgr.showTips("该英雄当前不可上阵");
                return;
            }
            if (heroVo.posId) {
                //下阵英雄
                let vo = FormationManager.ins().getPosVoById(heroVo.posId);
                let posVo = new PositionVo(vo.BaseId);
                let posVoDate: PositionVoData = {
                    positionId: vo.BaseId,
                    heroBaseId: null,
                };
                posVo.setPosVoData(posVoDate);
                FacadeManager.ins().emitNow(NotificationKey.FORMATION_TEMP_IN_BATTLE_HERO, posVo);
                AudioManager.ins().playSound(SoundType.xiazhen);
            } else {
                //判断是否还有空阵位,有则上阵，无则点击无反馈
                let posIds = FormationManager.ins().getVacantPosIds(this.tempPosVo, this._fightType);
                if (posIds[0]) {
                    let posVo = new PositionVo(posIds[0].BaseId);
                    let posVoDate: PositionVoData = {
                        positionId: posIds[0].BaseId,
                        heroBaseId: heroVo.baseId,
                    };
                    posVo.setPosVoData(posVoDate);
                    FacadeManager.ins().emitNow(NotificationKey.FORMATION_TEMP_IN_BATTLE_HERO, posVo);
                }
            }
        });
    }

    protected itemRendererForHpHero(index: number, item: HeroItemWithHp): void {
        const heroVo = this._heroVoArray[index];
        item.setHeroVo(heroVo);
        item.heroBaseComp.isShowCamp(false);
        if (heroVo) {
            item.isShowGou(heroVo.posId ? true : false);
            item.setHp(GIns.petDungeonModel.getPrepareHeroHpRatio(heroVo.baseId), 10000)
        }
        //点击回调
        item.onClickItemFunc = this.onClickHpItem.bind(this);
    }

    protected onClickHpItem(item: HeroItemWithHp, heroVo: HeroVo): void {
        if(heroVo == null) {
            //打开选择备战界面
            G.UIManager.open(UIPetDungeonConfig.PetDungeonSelectHeroWin);
            return;
        }
        if (item.curHp <= 0) {
            GIns.floatingTextMgr.showTips("该英雄已阵亡，无法上阵！");
            return;
        }
        if (heroVo.posId) {
            //下阵英雄
            let vo = FormationManager.ins().getPosVoById(heroVo.posId);
            let posVo = new PositionVo(vo.BaseId);
            let posVoDate: PositionVoData = {
                positionId: vo.BaseId,
                heroBaseId: null,
            };
            posVo.setPosVoData(posVoDate);
            FacadeManager.ins().emitNow(NotificationKey.FORMATION_TEMP_IN_BATTLE_HERO, posVo);
            AudioManager.ins().playSound(SoundType.xiazhen);
        } else {
            //判断是否还有空阵位,有则上阵，无则点击无反馈
            let posIds = FormationManager.ins().getVacantPosIds(this.tempPosVo, this._fightType);
            if (posIds[0]) {
                let posVo = new PositionVo(posIds[0].BaseId);
                let posVoDate: PositionVoData = {
                    positionId: posIds[0].BaseId,
                    heroBaseId: heroVo.baseId,
                };
                posVo.setPosVoData(posVoDate);
                FacadeManager.ins().emitNow(NotificationKey.FORMATION_TEMP_IN_BATTLE_HERO, posVo);
            }
        }
    }
}
