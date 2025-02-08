import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { TableManager } from "../../../../core/table/TableManager";
import { EnumUtils } from "../../../../core/utils/EnumUtils";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { BattleConfigManager } from "../../../comm/battle/config/BattleConfigManager";
import { FightType } from "../../../comm/battle/enum/FightType";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { CollectionsVo } from "../../collections/vo/CollectionsVo";
import { BtnConfirmViewOpenArgs } from "../../common/confirm/BtnConfirmView";
import { UICommonKey } from "../../common/const/UICommonConfig";
import { CommonI18nKeys } from "../../common/i18n/CommonI18nKeys";
import { ConditionManager } from "../../condition/ConditionManager";
import { FightManager } from "../../fight/FightManager";
import { GroupType, HeroCampType, HeroCareerType, HeroSelectKey } from "../../hero/HeroEnum";
import { HeroSelectData } from "../../hero/HeroVo";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { UIPetDungeonConfig } from "../../petDungeon/const/UIPetDungeonConfig";
import { TeamChallengeModel } from "../../teamChallenge/model/TeamChallengeModel";
import { FormationSkillChooseComp } from "../components/FormationSkillChooseComp";
import { FormationSkillIcon } from "../components/FormationSkillIcon";
import { FormationStarComp } from "../components/FormationStarComp";
import { FormationSkillType } from "../const/FormationSkillType";
import { FormationMainViewOpenArgs, FormationRecViewOpenArgs, UIFormationKey } from "../const/UIFormationConfig";
import { FormationManager } from "../FormationManager";
import { FormationModel } from "../model/FormationModel";
import { FormationHeroListPage } from "../page/FormationHeroListPage";
import { FormationItemPage } from "../page/FormationItemPage";
import { FormationVo } from "../vo/FormationVo";
import { IFetterData } from "../vo/IFetterData";
import { PositionVo } from "../vo/PositionVo";
import { DebugUtils } from "db://assets/scripts/core/utils/DebugUtils";

/**
 * 布阵
 */
@bindScript(UIFormationKey.FORMATION_MAIN_VIEW)
export class FormationMainView extends UIPage {
    static pkgName: string = "formation";
    static viewName: string = "FormationMainView";

    private _heroSelectData: HeroSelectData = {
        key: HeroSelectKey.FORMATION,
    };

    private _fightType: FightType;

    private _tempFormationVo: FormationVo;
    // 收藏品id
    private _collectionsId: number;
    // 使用的petid
    private _petId: number;

    //临时布阵Vo
    private tempPosVo: PositionVo[] = [];
    // 限制某个阵营
    private _limitCampType: HeroCampType | null = null;

    protected _petStar: number = 0
    // 限制职业职业
    private _limitCareer: number;
    /**限制职业数量*/
    protected _limitCareerCnt: number
    protected _limitCareerName: string;
    protected _limitCareerIcon: string;

    private get view(): ui.formation.view.FormationMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.HERO_SELECT_HERO,
            NotificationKey.FORMATION_IN_BATTLE_HERO,
            NotificationKey.FORMATION_TEMP_IN_BATTLE_HERO,
            NotificationKey.FORMATION_SET_UP_FORMATION,
            NotificationKey.PET_DUNGEON_INFO_CHANGE,
            NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.FORMATION_IN_BATTLE_HERO:
            case NotificationKey.FORMATION_SET_UP_FORMATION:
            case NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION:
                this.setData();
                this.updateInfo();
                this.updateVislbleChooseComp();
                break;
            case NotificationKey.FORMATION_TEMP_IN_BATTLE_HERO:
                this.updateTempPosVo(args);
                break;
            case NotificationKey.HERO_SELECT_HERO:
                let data = args as HeroSelectData;
                if (data.key == HeroSelectKey.FORMATION) {
                    this._heroSelectData = data;
                    this.updateInfo();
                }
                break;
            case NotificationKey.PET_DUNGEON_INFO_CHANGE:
                if (this._fightType == FightType.PET_DUNGEON) {
                    this.updateInfo();
                }
                break;
        }
    }

    protected onInit(): void {
        let self = this.view;
        self.btnCollections.onClick(this.onClickCollections, this);
        self.btnPet.onClick(this.onClickPet, this);

        self.btn_close.on(fgui.Event.CLICK, this.onCloseClick, this);
        self.btn_formation.on(fgui.Event.CLICK, this.onBtnClick, this);
        self.campItem.on(fgui.Event.CLICK, this.onBtnClick, this);
        self.btn_rec.on(fgui.Event.CLICK, this.onBtnClick, this);
        self.list_career.itemRenderer = this.careerItem.bind(this);

        let chooseComp = FguiScriptUtils.toMyScriptClass(this.view.skillChooseComp, FormationSkillChooseComp);
        chooseComp.visible = false;
        chooseComp.changeIdCallback = this.onChangeSkillIdComplete.bind(this);
    }

    private mFormationMainViewOpenArgs: FormationMainViewOpenArgs;

    protected onOpen(args: FormationMainViewOpenArgs, isReopen?: boolean): void {
        this.mFormationMainViewOpenArgs = args;
        this._fightType = args?.type || FightType.TRUNK_MAP;
        this._limitCampType = this.getLimitCampType(args);
        this.getLimitJobType(args);

        if (args && args.title) {
            this.view.lbTitle.text = args.title;
        }

        this.initConfirm();
        this.setData();
        this.updateInfo();

        if (!isReopen && this._fightType == FightType.PET_DUNGEON) {
            //宠物副本布阵打开时 如果没有角色需要主动弹出备战角色界面
            if (this.view.heroListPage.listHeroWithHp.numItems <= 1) {
                G.UIManager.open(UIPetDungeonConfig.PetDungeonSelectHeroWin)
            }
        }
        //收藏品副本需要展示星级条件
        this.view.starComp.visible = this._fightType == FightType.COLLECTIBLES_DUNGEON;
    }

    //确认按钮的点击事件
    private initConfirm() {
        if (FormationManager.ins().isAutoFightType(this._fightType) && FormationManager.ins().getAutoFightParam(this._fightType)) {
            //修改确定为挑战按钮
            this.view.btn_confirm.title = "挑战";
        }
        this.view.btn_confirm.on(fgui.Event.CLICK, this.onClickConfirm, this);
    }

    protected onClickConfirm(): void {
        if (this._limitCareer > 0 && this._limitCareerCnt > 0) {
            const haveJobCount = this._tempFormationVo.getCountByCareerType(this._limitCareer);
            if (haveJobCount < this._limitCareerCnt) {
                //数量不满足
                GIns.floatingTextMgr.showTips(`需上阵${this._limitCareerCnt}个${this._limitCareerName}职业英雄`);
                return;
            }
        }
        this.handleClickBtn(true);
    }

    public setData() {
        if (this._fightType == FightType.TEAM_INSTANCE) {
            FormationManager.ins().setPoses(TeamChallengeModel.ins().getPositions());
        }
        //初始化临时数据
        const subType = this.mFormationMainViewOpenArgs?.subType;
        const formationVo: FormationVo = FormationManager.ins().getTempFormationVoByType(this._fightType, 0, subType);
        let posVos = this.mFormationMainViewOpenArgs?.posVos;
        this._tempFormationVo = formationVo;
        this.tempPosVo = this._tempFormationVo.allPosData;

        if (posVos) {
            for (let i = 0; i < this.tempPosVo.length; i++) {
                if (posVos[i] && posVos[i].heroBaseId && GIns.heroMgr.isHaveHero(posVos[i].heroBaseId)) this.tempPosVo[i].setHeroId(posVos[i].heroBaseId);
                else this.tempPosVo[i].setHeroId(0);
            }
        }

        // 阵容的队长技id
        this._collectionsId = formationVo.collectionsId || 0;
        this._petId = formationVo.petId || 0;

        if (this._fightType == FightType.DAILY_BOSS || this._fightType == FightType.LEAGUE_BOSS || this._fightType == FightType.SEASON_BOSS) {
            let formationVo: FormationVo = FormationManager.ins().getTempFormationVoByType(FightType.TRUNK_MAP);
            //没布阵时 使用主线阵容
            let heroCount = 0;
            this._tempFormationVo.allPosData?.forEach((value) => {
                if (value.heroId) {
                    heroCount++;
                }
            });
            if (heroCount <= 0) {
                //未上阵 默认上阵主线阵容

                this._tempFormationVo = formationVo;
                this.tempPosVo = this._tempFormationVo.allPosData;
            }
            // 没有战队科技 使用战队科技
            this._collectionsId = this._collectionsId || formationVo.collectionsId;
            this._petId = this._petId || formationVo.petId;
        } else if (this._fightType == FightType.FACTORY) {
            //星际工厂 如果没有被占用 就用主线阵容
            let formationVo: FormationVo = FormationManager.ins().getTempFormationVoByType(FightType.TRUNK_MAP);
            //是否可使用主线阵容
            let canUse: boolean = true;
            if (formationVo?.allPosData) {
                for (let i = 0; i < formationVo?.allPosData?.length; i++) {
                    let positionVo = formationVo.allPosData[i];
                    if (positionVo.heroId) {
                        if (this.mFormationMainViewOpenArgs && this.mFormationMainViewOpenArgs?.excludes.has(positionVo.heroId)) {
                            //有英雄被占用就不能使用主线
                            canUse = false;
                            break;
                        }
                    }
                }
            }

            if (canUse) {
                this._tempFormationVo = formationVo;
                this.tempPosVo = this._tempFormationVo.allPosData;
            }
            if (
                this.mFormationMainViewOpenArgs &&
                this.mFormationMainViewOpenArgs?.excludeCollectionsIds &&
                this.mFormationMainViewOpenArgs?.excludeCollectionsIds.indexOf(formationVo.collectionsId) != -1
            ) {
                //主线战队科技被占用
                this._collectionsId = 0;
            } else {
                this._collectionsId = formationVo.collectionsId;
            }
            if (this.mFormationMainViewOpenArgs && this.mFormationMainViewOpenArgs?.excludePetIds && this.mFormationMainViewOpenArgs?.excludePetIds.indexOf(formationVo.petId) != -1) {
                //主线战队科技被占用
                this._petId = 0;
            } else {
                this._petId = formationVo.petId;
            }
        }
    }

    /** 更新临时阵位信息 */
    private updateTempPosVo(arge: PositionVo) {
        if (!arge) return;

        let posVoDate = {
            position: arge.BaseId,
            heroBaseId: arge.heroId,
        };

        this._tempFormationVo.updatePosData(posVoDate);
        this.updateInfo();
    }

    private updateInfo() {
        let self = this.view;
        //@ts-ignore
        let formPage = self.formationPage as FormationItemPage;
        formPage.updateData(this.tempPosVo, this._fightType);
        //@ts-ignore
        let formationHeroPage = self.heroListPage as FormationHeroListPage;

        this._heroSelectData.campType = this._limitCampType;
        formationHeroPage.updateData(this._heroSelectData, this.tempPosVo, this.mFormationMainViewOpenArgs?.excludes, this._fightType);

        this._tempFormationVo.updateCampCount();

        let data = this._tempFormationVo.getLargestCamp();

        //阵营羁绊
        self.campItem.getController("camp").selectedIndex = data.type;
        self.campItem.getController("num").selectedIndex = data.num;

        //职业羁绊
        //策划需求， 双人羁绊解锁前，不显示该模块
        // let id = TableManager.getDataById(table.formation.FormationConstantConfig, "FORMATION:BOND_DISPLAY_CONDITION").content;
        this.view.list_career.visible = GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.FETTER);
        this.careerList();

        //战力
        self.T_power.text = StringUtils.getFightStr(FightManager.ins().getAllFight(this._tempFormationVo.allPosData, this._fightType, false));

        self.btn_rec.visible = this._fightType == FightType.TRUNK_MAP && this.getFormationOpen();

        this.view.getController("isLock").selectedIndex = 0;
        if (this._limitCareer > 0 && this._limitCareerCnt > 0) {
            const haveJobCount = this._tempFormationVo.getCountByCareerType(this._limitCareer);
            this.view.getController("isLock").selectedIndex = 1;
            this.view.iconCareer.icon = this._limitCareerIcon;
            this.view.T_lockTips2.text = `${this._limitCareerName}职业英雄`;
            if (haveJobCount < this._limitCareerCnt) {
                this.view.T_lockTips.text = `需上阵 [color=#ff0000]${haveJobCount}[/color]/${this._limitCareerCnt}个`;
                this.view.btn_confirm.grayed = true;
            } else {
                this.view.T_lockTips.text = `需上阵 [color=#00FF00]${haveJobCount}[/color]/${this._limitCareerCnt}个`;
                this.view.btn_confirm.grayed = false;
            }
            this.view.btn_formation.visible = false;
        } else {
            this.view.btn_formation.visible = true;
        }

        this.updateCollectionsComp();
        this.updatePetComp();
        this.updateStarComp();
    }

    public getFormationOpen() {
        //功能解锁表
        const moduleName: string = EnumUtils.getEnumKeyNameByValue(ServerEnums.SystemType, ServerEnums.SystemType.FORMATION_RECOMMEND);
        let cfg = TableManager.getDataById(table.verify.PlayerSystemOpenConfig, moduleName);
        let openTips = ConditionManager.ins().getOpenConditionTips(cfg.conditions);
        return !!!openTips;
    }

    private _careerList: IFetterData[] = [];
    private _careerMaxFetterMap:Map<number, number> = new Map();
    private careerList() {
        this._careerList.length = 0;
        this._careerMaxFetterMap.clear();
        let isOpen = GIns.moduleOpenMgr._isCanOpenModule(ServerEnums.SystemType.CAPTAIN, false);
        if (isOpen) {
            let careerList = this._tempFormationVo.getCareerCount(null);
            careerList.forEach((data) => {
                if (GIns.captainSkillMgr.isHaveUnlockAnyFetterForCareer(data.type, data.num)) {
                    this._careerList.push(data);
                    this._careerMaxFetterMap.set(data.type, GIns.captainSkillMgr.getMaxFetterCntFroCareer(data.type));
                }
            })
        }
        this.view.list_career.numItems = this._careerList.length;
    }

    private careerItem(index: number, item: ui.formation.btn.BtnItem1) {
        let data = this._careerList[index];
        let nextFetter = Math.min(data.num + 1, this._careerMaxFetterMap.get(data.type));
        item.T_num.text = data.num + "/" + nextFetter;
        item.img_icon.icon = ItemUtils.getCareerIcon(data.type);
        item.onClick(() => {
            UIManager.ins().open(UIFormationKey.CAREER_FETTER_WIN, {
                type: this._fightType,
                HeroCareerType: data.type,
                formationVo: this._tempFormationVo,
            });
        }, this);
    }

    private onBtnClick(evt: any) {
        let btn = evt.currentTarget;
        switch (btn.name) {
            case "btn_formation":
                //自动布阵
                let excludes: number[] = this.mFormationMainViewOpenArgs?.excludes ? Array.from(this.mFormationMainViewOpenArgs.excludes.keys()) : null;
                let posVos = null;
                if (this._fightType == FightType.PET_DUNGEON) {
                    posVos = GIns.petDungeonMgr.getFormationDatas();
                } else if (this._fightType == FightType.COLLECTIBLES_DUNGEON) {
                    posVos = GIns.collectiblesDungeonMgr.getFormationDatas(this.mFormationMainViewOpenArgs.param);
                } else {
                    posVos = FormationManager.ins().getFormationDatas(this._limitCampType, excludes, this._fightType);
                }
                //FormationModel.ins().setUpFormation(this._fightType, posVos)
                this._tempFormationVo.updatePosDatas(posVos);
                if (this._fightType == FightType.PET_DUNGEON) {
                    if (this._tempFormationVo.isEmptyFormation()) {
                        GIns.floatingTextMgr.showTips('当前暂无可上阵英雄');
                    }
                }
                this.updateInfo();
                // FacadeManager.ins().emit(NotificationKey.FORMATION_TEMP_IN_BATTLE_HERO, posVos);
                break;
            case "campItem":
                //阵营羁绊
                UIManager.ins().open(UIFormationKey.CAMP_FETTER_WIN, {
                    type: this._fightType,
                    formationVo: this._tempFormationVo,
                });
            case "btn_rec":
                //阵容推荐
                UIManager.ins().open(UIFormationKey.FORMATION_REC_VIEW, FormationRecViewOpenArgs.create(
                    this._fightType,
                    this.mFormationMainViewOpenArgs?.subType,
                    this._collectionsId,
                    this._petId
                ));
                break;
        }
    }

    /** 关闭布阵，未上满不给退出 */
    private onCloseClick() {
        this.handleClickBtn();
    }

    protected handleClickBtn(fromConfirm: boolean = false): void {
        // if (GIns.battleMgr.battleLogic.isInBattle()) {
        //     GIns.floatingTextMgr.showTips("战斗中，不可布阵");
        //     return;
        // }

        if (this._fightType == FightType.TRUNK_MAP && GIns.battleMgr.battleLogic.isInBattle()) {
            //大地图战斗中不能布阵
            GIns.floatingTextMgr.showTips("战斗中不能布阵");
            UIManager.ins().close(UIFormationKey.FORMATION_MAIN_VIEW);
            return;
        }


        let setupCount: number = 0;
        let isClose = true;
        let isSetUpAnyHero = false;
        // net
        let reqVo: Vo.formation.SetupFormationReqVo = {
            // TODO 布阵
            collectiblesId: this._collectionsId,
            petBaseId: this._petId,
            positionVos: [],
        };
        for (let data of this.tempPosVo) {
            if (!data.heroId && data.isUnlock) {
                isClose = false;
            }
            if (data.isUnlock) {
                isSetUpAnyHero = true;
                let vo: Vo.formation.PositionVo = {
                    position: data.BaseId,
                    heroBaseId: data.heroId,
                };
                reqVo.positionVos.push(vo);
                if (data.heroId > 0) {
                    setupCount++;
                }
            }
        }

        //读表，是否需要上满
        let isNeedFull = BattleConfigManager.getBattleSettingConfig(this._fightType)?.forceFullPosition;

        // // 有些阵型不限制满员
        // let isNeedFullFormation = this.isNeedFullFormation(isClose, isNeedFull);
        if (this._fightType == FightType.PET_DUNGEON) {
            if (setupCount < 1 && fromConfirm == false) {
                //宠物副本没选择角色也可以关闭 防止角色死亡了 卡死在这个界面
                this.closeSelf();
                return
            }
        }
        if (this.mFormationMainViewOpenArgs?.notSendToServer && fromConfirm == false) {
            //不用上传的阵容 关闭不用判断是否满
        } else {
            if (isNeedFull && !isClose) {
                GIns.floatingTextMgr.showTips("未上阵满英雄");
                return;
            } else if (setupCount < 1) {
                GIns.floatingTextMgr.showTips("至少上阵一个英雄");
                return;
            }
        }

        if (fromConfirm == false) {
            if (this._limitCareer > 0 && this._limitCareerCnt > 0) {
                const haveJobCount = this._tempFormationVo.getCountByCareerType(this._limitCareer);
                if (haveJobCount < this._limitCareerCnt) {
                    //数量不满足 直接关闭界面
                    UIManager.ins().close(UIFormationKey.FORMATION_MAIN_VIEW);
                    return;
                }
            }
        }

        if (isSetUpAnyHero) {
            // 不是点击挑战就清空记录id
            if (fromConfirm == false) {
                FormationManager.ins().deleteAutoFightParam(this._fightType);
            }
            if (this.mFormationMainViewOpenArgs?.notSendToServer) {
                //代表本次布阵不保存给服务器
            } else {
                FormationModel.ins().setUpFormation(this._fightType, reqVo, this.mFormationMainViewOpenArgs?.subType);
            }
        } else {
            console.info("没有设置任何英雄!");
        }
        if (fromConfirm) {
            if (this._fightType == FightType.FACTORY) {
                if (!isClose && this.hasIdleHero()) {
                    G.UIManager.open(UICommonKey.BtnConfirmView, {
                        title: null,
                        titleCancel: CommonI18nKeys.cancel,
                        titleConfirm: CommonI18nKeys.confirm,
                        content: "未上阵满英雄，是否确认布阵？",
                        onBtnYes: () => {
                            //确认回调
                            if (this.mFormationMainViewOpenArgs?.okFunc) {
                                this.mFormationMainViewOpenArgs?.okFunc(reqVo);
                            }
                            UIManager.ins().close(UIFormationKey.FORMATION_MAIN_VIEW);
                        },
                    } as BtnConfirmViewOpenArgs);
                    return;
                }
                // else if (this._captainSkillId == 0 && this.hasIdleCaptainSkill()) {
                //     G.UIManager.open(UICommonKey.BtnConfirmView, {
                //         title: null,
                //         titleCancel: CommonI18nKeys.cancel,
                //         titleConfirm: CommonI18nKeys.confirm,
                //         content: "未选择战队科技，是否确认布阵？",
                //         onBtnYes: () => {
                //             //确认回调
                //             if (this.mFormationMainViewOpenArgs?.okFunc) {
                //                 this.mFormationMainViewOpenArgs?.okFunc(reqVo);
                //             }
                //             UIManager.ins().close(UIFormationKey.FORMATION_MAIN_VIEW);
                //         },
                //     } as BtnConfirmViewOpenArgs);
                //     return;
                // }
            }
            //确认回调
            if (this.mFormationMainViewOpenArgs?.okFunc) {
                this.mFormationMainViewOpenArgs?.okFunc(reqVo);
            }
        }

        UIManager.ins().close(UIFormationKey.FORMATION_MAIN_VIEW);
    }

    /**是否有空闲英雄*/
    protected hasIdleHero(): boolean {
        let filterHeroVoArr = GIns.heroMgr.getHeroVoArrByCampType(null, this._heroSelectData?.careerType, false);
        let result: boolean = false;
        for (let i = 0; i < filterHeroVoArr?.length; i++) {
            let data = filterHeroVoArr[i];
            if (this.mFormationMainViewOpenArgs && this.mFormationMainViewOpenArgs.excludes?.has(data.heroVoData.baseId)) {
                //不可用
                continue;
            }
            if (this._heroSelectData?.campType && data.campType == this._heroSelectData?.campType) {
                //类型不对
                continue;
            }
            if (this.tempPosVo.findIndex((value) => value.heroId == data.heroVoData.baseId) != -1) {
                //已上阵
                continue;
            }
            result = true;
            break;
        }
        return result;
    }

    // protected hasIdleCaptainSkill(): boolean {
    //     // 技能类型
    //     let skillConfigs = (CaptainSkillUtils.getCaptainSkillConfigArray() || []).filter((it) => CaptainSkillModel.ins().isUnlock(it.id));
    //     let result: boolean = false;
    //     for (let i = 0; i < skillConfigs?.length; i++) {
    //         let data = skillConfigs[i];
    //         if (this.mFormationMainViewOpenArgs && this.mFormationMainViewOpenArgs.excludeCaptainSkills?.indexOf(data.id) != -1) {
    //             //不可用
    //             continue;
    //         }
    //         if (this._captainSkillId == data.id) {
    //             //已上阵
    //             continue;
    //         }
    //         result = true;
    //         break;
    //     }
    //     return result;
    // }

    protected onClose(): void {
        this.tempPosVo = null;
        if (this._fightType == FightType.TEAM_INSTANCE) {
            FormationManager.ins().setPoses(null)
        }
    }

    /**点击收藏品*/
    protected onClickCollections(): void {
        let chooseComp = FguiScriptUtils.toMyScriptClass(this.view.skillChooseComp, FormationSkillChooseComp);
        chooseComp.visible = true;
        chooseComp.reset(this._collectionsId, FormationSkillType.COLLECTIONS, this.mFormationMainViewOpenArgs?.excludeCollectionsIds);
    }

    /**点击宠物*/
    protected onClickPet() {
        let chooseComp = FguiScriptUtils.toMyScriptClass(this.view.skillChooseComp, FormationSkillChooseComp);
        chooseComp.visible = true;
        chooseComp.reset(this._petId, FormationSkillType.PET, this.mFormationMainViewOpenArgs?.excludePetIds);
    }

    /**技能选择回调处理*/
    protected onChangeSkillIdComplete(baseId: number): void {
        // this.view.skillChooseComp.visible = false;
        let chooseComp = FguiScriptUtils.toMyScriptClass(this.view.skillChooseComp, FormationSkillChooseComp);
        if (chooseComp.type == FormationSkillType.COLLECTIONS) {
            this._collectionsId = baseId;
            this.updateCollectionsComp();
            DebugUtils.isDebugMode() && console.log(`更新选中的收藏品id = ${baseId}`);
        } else if (chooseComp.type == FormationSkillType.PET) {
            this._petId = baseId;
            this.updatePetComp();
            DebugUtils.isDebugMode() && console.log(`更新选中的宠物id = ${baseId}`);
        }

        //没有更新数据 刷新没有意义
        // this.emitNow(NotificationKey.FIGHT_UPDATE_ALL_HERO);
        // G.FacadeManager.emit(NotificationKey.FIGHT_RECALCULATE_ALL_HERO);
    }

    /**阵容刷新是 如果还展示选择界面 也需要刷新*/
    protected updateVislbleChooseComp(): void {
        if (this.view.skillChooseComp.visible) {
            let chooseComp = FguiScriptUtils.toMyScriptClass(this.view.skillChooseComp, FormationSkillChooseComp);
            if (chooseComp.type == FormationSkillType.COLLECTIONS) {
                this.updateCollectionsComp();
            } else if (chooseComp.type == FormationSkillType.PET) {
                this.updatePetComp();
            }
        }
    }

    /**更新收藏品按钮显示*/
    protected updateCollectionsComp(): void {
        let context = GIns.collectionsModel.context;
        if (this._collectionsId > 0) {
            let collectionsVo = context.getCollectionById(this._collectionsId) as CollectionsVo;
            let collectionsCom = FguiScriptUtils.toMyScriptClass(this.view.btnCollections.pInfo, FormationSkillIcon);
            collectionsCom.type = FormationSkillType.COLLECTIONS;
            collectionsCom.updateByVo(collectionsVo);
        }
        let activeIds: number[] = context.getAllActiveCollections();
        let showIds: number[] = [];
        activeIds?.forEach((id) => {
            let vo = context.getCollectionById(id);
            if (vo && vo.getUnlockBattleSkill()?.length > 0) {
                //可上阵
                showIds.push(id);
            }
        })
        this.view.btnCollections.visible = showIds.length > 0 && this._fightType != FightType.TEAM_INSTANCE;
        // 如果为 0 = 没设置过, 中间空掉
        this.view.btnCollections.getController("setFlag").selectedIndex = this._collectionsId > 0 ? 1 : 0;

        let chooseComp = FguiScriptUtils.toMyScriptClass(this.view.skillChooseComp, FormationSkillChooseComp);
        if (chooseComp.type == FormationSkillType.COLLECTIONS && this.view.btnCollections.visible == false) {
            chooseComp.visible = false;
        }
    }

    /**更新宠物按钮显示*/
    protected updatePetComp(): void {
        if (this._petId > 0) {
            let petVo = GIns.petModel.petContext.getDataByCfgId(this._petId)
            let petCom = FguiScriptUtils.toMyScriptClass(this.view.btnPet.pInfo, FormationSkillIcon);
            petCom.type = FormationSkillType.PET;
            petCom.updateByVo(petVo);
        }
        // 如果为 0 = 没设置过, 中间空掉
        this.view.btnPet.getController("setFlag").selectedIndex = this._petId > 0 ? 1 : 0;
        this.view.btnPet.visible = GIns.petModel.petContext.getAllActivePetId().length > 0 && this._fightType != FightType.TEAM_INSTANCE;

        let chooseComp = FguiScriptUtils.toMyScriptClass(this.view.skillChooseComp, FormationSkillChooseComp);
        if (chooseComp.type == FormationSkillType.PET && this.view.btnPet.visible == false) {
            chooseComp.visible = false;
        }
    }

    /**更新星级条件显示*/
    protected updateStarComp(): void {
        if (this._fightType == FightType.COLLECTIBLES_DUNGEON) {
            let starComp = FguiScriptUtils.toMyScriptClass(this.view.starComp, FormationStarComp);
            starComp?.updateUI(this.mFormationMainViewOpenArgs?.param, this._tempFormationVo);
        }
    }

    /**
     * 限制的阵营
     * @param args
     * @private
     */
    private getLimitCampType(args: FormationMainViewOpenArgs): HeroCampType | null {
        if (args == null) {
            return null;
        }
        const fightType = args.type;
        const subTypeStr = args.subType;

        if (fightType == FightType.LADDER) {
            // 改成职业
            // const subType = subTypeStr.toInt();
            // const typeConfigByType = GodSequenceConfigManager.getTypeConfigByType(subType);
            // if (!typeConfigByType) {
            //     return null;
            // }
            // return subType as HeroCampType;
            return null;
        }

        return null;
    }

    /**
     * 限制的职业
     * @param args
     * @private
     */
    private getLimitJobType(args: FormationMainViewOpenArgs): HeroCareerType | null {
        this._limitCareer = 0;
        this._limitCareerCnt = 0;
        if (args == null) {
            return null;
        }
        const fightType = args.type;
        const subType = args.subType;

        if (fightType == FightType.LADDER) {
            const subTypeStr = ServerEnums.Career[subType];
            const typeConfigByType = G.TableManager.getDataById(table.ladder.LadderTypeConfig, subTypeStr);
            if (typeConfigByType) {
                this._limitCareer = subType.toInt();
                const context = GIns.godSequenceModel.context;
                this._limitCareerCnt = context.getCurrentLevelLimitJobCount(this._limitCareer);
                const enumJob = ServerEnums.Career[this._limitCareer];
                let classCfg = TableManager.getDataById(table.hero.HeroClassConfig, enumJob);
                this._limitCareerName = classCfg ? classCfg.name : "";
                this._limitCareerIcon = classCfg ? classCfg.assetPath : '';
            }
        }

        return null;
    }
}
