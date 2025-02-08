import { Tween, tween } from "cc";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UIView } from "../../../../core/mvc/view/UIView";
import { TableManager } from "../../../../core/table/TableManager";
import BattleTimer from "../../../../core/timer/BattleTimer";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { WorldUnitTeam } from "../../../comm/battle/enum/BattleEnum";
import { IBattleUnitDeadEventData } from "../../../comm/battle/interface/BattleInterface";
import { SkillData } from "../../../comm/battle/skill/SkillData";
import { BattleExpandManager } from "../../../comm/battleEx/BattleExpandManager";
import { AudioManager, SoundType } from "../../../comm/mgr/AudioManager";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { MapObjectType } from "../../../tiledMap/MapEnum";
import { MapManager } from "../../../tiledMap/MapManager";
import { IBattleEnterData } from "../../battle/vo/IBattleEnterData";
import { BtnConfirmViewOpenArgs } from "../../common/confirm/BtnConfirmView";
import { UICommonKey } from "../../common/const/UICommonConfig";
import { CommonI18nKeys } from "../../common/i18n/CommonI18nKeys";
import { BattleResultData } from "../../common/view/BattleResultWin";
import { UIGuideConfig } from "../../guide/const/UIGuideConfig";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { MiniMapItem } from "../../miniMap/item/MiniMapItem";
import { UIMapInstanceKey } from "../const/UIMapInstanceConfig";
import { MapInstanceManager } from "../MapInstanceManager";

/**
 * 副本boss
 * 主界面
 */
@bindScript(UIMapInstanceKey.MapInstanceView)
export class MapInstanceView extends UIView {
    static pkgName: string = "mapInstance";
    static viewName: string = "MapInstanceView";
    private isInit: boolean = false;
    private get view(): ui.mapInstance.view.MapInstanceView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.BATTLE_UNIT_DEAD_INFO,
            NotificationKey.MAP_ACTIVE_BUILDING,
            NotificationKey.BATTLE_USE_SKILL,
            NotificationKey.MAP_CANCEL_ACTIVE_BUILDING,
            NotificationKey.MAP_AREA_TRANSFER_END,
            NotificationKey.MAP_TEAN_POS_UPDATE,
            NotificationKey.BATTLE_USE_SKILL_COMPLETE,
            NotificationKey.BATTLE_START_STATE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.BATTLE_UNIT_DEAD_INFO:
                this.showScoreJdt(args);
                break;
            case NotificationKey.MAP_ACTIVE_BUILDING:
                this.activeBuilding(args, true);
                break;
            case NotificationKey.MAP_CANCEL_ACTIVE_BUILDING:
                this.activeBuilding(args, false);
                break;
            case NotificationKey.BATTLE_USE_SKILL:
                // 刷新技能 CD
                this.onUseSkill(args as SkillData);
                break;
            case NotificationKey.MAP_AREA_TRANSFER_END:
                //小地图
                G.GameTimer.once(300, this, () => {
                    this.updateMiniMap();
                    this.setMiniMapPos(args);
                });
                break;
            case NotificationKey.MAP_TEAN_POS_UPDATE:
                //小地图
                this.setMiniMapPos(args);
                break;
            case NotificationKey.BATTLE_USE_SKILL_COMPLETE:
                // 技能使用完毕
                this.onUseSkillComplete(args as SkillData);
                break;
            case NotificationKey.BATTLE_START_STATE:
                this.setBattleStartState(args as IBattleEnterData);
                break;
        }
    }

    protected onInit(): void {
        this.view.btnBack.on(fgui.Event.CLICK, this.backHome, this);
        this.view.buildingBtn.onClick(this.onClickBuilding, this);
    }

    protected onOpen(args: any): void {
        this._starX = this.view.img_jd.x;
        this.view.img_jdt1.fillAmount = 0;
        this.view.img_anim1.fillAmount = 0;

        // this.showHelpHero()
        this.view.MiniMap.redDot.visible = false;
    }

    private setBattleStartState(args1: IBattleEnterData) {
        this.updateHeroSkillItem();
        this.view.T_name.text = MapInstanceManager.ins().mapInstanceCfg.name;
        //小地图
        G.GameTimer.once(300, this, () => {
            this.updateMiniMap();
        });
    }

    /** 是否显示小地图 */
    private updateMiniMap() {
        if (this.isInit) return;
        this.isInit = true;
        let cfg = TableManager.getDataById(table.map.MapidConfig, MapManager.ins().getMapID());
        if (cfg.mapPath.length > 1) {
            this.view.MiniMap.visible = true;
            // @ts-ignore
            let miniMapItem = this.view.MiniMap as MiniMapItem;
            miniMapItem.setMiniMapIcon();
        } else {
            this.view.MiniMap.visible = false;
        }
    }
    /** 设置小地图位置 */
    private setMiniMapPos(pos: { x: number; y: number }) {
        if (!this.view.MiniMap.visible) return;
        //@ts-ignore
        let miniMapItem = this.view.MiniMap as MiniMapItem;
        miniMapItem.setMiniMapPosition(pos);
    }

    private updateHeroSkillItem() {
        let heroes = GIns.battleMgr.curUnitProcessor.heroes;
        for (let i = 0; i < heroes.length; i++) {
            if (heroes[i].isHelpHero) {
                heroes[i].setIsGhost(true);
            }
        }
    }

    private _starX: number = 0;
    private _score: number = 0;
    private _allScore: number;
    //进度
    private showScoreJdt(datas: IBattleUnitDeadEventData[]) {
        if (!datas) return;

        if (!this._allScore) {
            this._allScore = MapInstanceManager.ins().mapInstanceCfg.summonBossNeedKillMonsterCount;
        }

        this._score += datas.length;
        let w = 241 * (this._score / this._allScore);
        w = w >= 241 ? 241 : w;
        this.view.img_jd.x = this._starX + w;

        let scoreFillAmount = w / 241;
        this.view.img_jdt1.fillAmount = scoreFillAmount;
        //闪光动画
        Tween.stopAllByTarget(this.view.img_anim1);
        this.view.img_anim1.fillAmount = scoreFillAmount;
        this.view.img_anim1.alpha = 0;
        tween(this.view.img_anim1).to(0.2, { alpha: 0.9 }).to(0.2, { alpha: 0 }).start();
    }

    //援助英雄动画
    private showHelpHero(): void {
        let self = this.view;
        self.group_help.visible = false;
        let cfg = MapInstanceManager.ins().mapInstanceCfg;
        self.group_help.visible = true;
        this.view.getTransition("t0").play();
        let helpConfig = TableManager.getDataById(table.map.InstanceHelpConfig, cfg.helpConfigId);
        let heroCfg = TableManager.getDataById(table.hero.HeroConfig, helpConfig.heroBaseId);
        //@ts-ignore
        self.modelNode.loadByModelId(helpConfig.modelId, true);
        self.modelNode.scaleX = -3;
        self.modelNode.scaleY = 3;
        self.text_heroName.text = heroCfg.name;
        self.text_heroName.color = ItemUtils.getTextColor(heroCfg.quality);

        G.GameTimer.once(1000, this, () => {
            self.group_help.visible = false;
            let helpHero = GIns.battleMgr.getHelpHero();
            if (helpHero) {
                BattleExpandManager.ins().showHeroByTransferEffect(helpHero);
                helpHero.setIsGhost(false);
            }
            // G.GameTimer.once(800, this, () => {
            //     G.FacadeManager.emit(NotificationKey.BATTLE_START)
            // })
            G.FacadeManager.emit(NotificationKey.BATTLE_VIEW_SHOW_HELP_HERO);
        });
    }

    /** 退出副本，进入的地图 */
    private backHome() {
        G.UIManager.open(UICommonKey.BtnConfirmView, {
            // 标题
            title: "确认退出关卡",
            // 取消
            titleCancel: CommonI18nKeys.cancel,
            // 确认
            titleConfirm: CommonI18nKeys.confirm,
            // 内容
            content: "是否退出当前副本关卡?",
            // 点击确认回调
            onBtnYes: () => {
                this.showBattleResult();
            },
        } as BtnConfirmViewOpenArgs);
    }

    private showBattleResult() {
        BattleTimer.ins().clearAll(this);
        GIns.battleMgr.stopFightAi();
        G.FacadeManager.emit(NotificationKey.BATTLE_CANCEL);
        let str = TableManager.getDataById(table.map.MapConstantConfig, "MAP:INSTANCE_DEFEAT").content;
        let list = [];
        for (let id of str.split(";")) {
            if (id) {
                list.push(Number(id));
            }
        }

        let data: BattleResultData = {
            fightType: ServerEnums.FightType.MAP_INSTANCE,
            labelTitle: "变强途径",
            jumpList: list,
            closeCllBack: this.back,
        };
        G.UIManager.open(UICommonKey.BattleResultWin, data);
    }

    /** 关闭结算界面回调 */
    private back() {
        G.FacadeManager.emit(NotificationKey.LOADING_VIEW_SHOW);
        G.FacadeManager.emit(NotificationKey.CLOSE_BATTLE_VIEW);
        G.UIManager.close(UIMapInstanceKey.MapInstanceView);
        MapInstanceManager.ins().mapInstanceId = null;
    }

    /***援助英雄首次大招 */
    private isFirstHelpHeroSkill = true;
    private onUseSkill(skillData: SkillData) {
        if (skillData.skillIndex == 2 && skillData.owner.teamId == WorldUnitTeam.Self) {
            if (this.isFirstHelpHeroSkill && this.isYeYingStory && MapInstanceManager.ins().helpHeroId == skillData.owner.attr.getHeroConfigId()) {
                //援助英雄放大招的时候要说话和聚焦镜头
                GIns.cameraAnimUtils.focusPositison(300, skillData.owner?.pos, 0.8);
                UIManager.ins().open(UIGuideConfig.GuideDialogSmallView, { groupId: 2902 });
            }
        }
    }

    private onUseSkillComplete(skillData: SkillData): void {
        if (this.isFirstHelpHeroSkill && this.isYeYingStory && skillData.skillIndex == 2 && MapInstanceManager.ins().helpHeroId == skillData.owner.attr.getHeroConfigId()) {
            //援助英雄放大招的时候要说话和聚焦镜头
            this.isFirstHelpHeroSkill = false;
            GIns.cameraAnimUtils.resetFocusPositison(600);
            let teamUnit = GIns.battleMgr.battleLogic.getTeamByTeamId(WorldUnitTeam.Self);
            if (teamUnit) teamUnit.forbiddenMove = false;
        }
    }

    /**当前建筑Id */
    private _curBuildingId: number;
    public activeBuilding(buildingId: number, isActive: boolean) {
        let cfg = TableManager.getDataById(table.map.MapBuildingConfig, buildingId);
        if (!cfg) return;

        if (isActive) {
            this._curBuildingId = buildingId;
            let isUnlock = MapManager.ins().getBuildingUnlockById(buildingId);
            this.view.buildingBtn.icon = isUnlock ? cfg.funcIcon : cfg.unlockIcon;
            this.view.buildingBtn.title = isUnlock ? cfg.funcName : cfg.unlockName;
        }

        if (!this.view.buildingBtn.visible && isActive) AudioManager.ins().playSound(SoundType.jiaohu);
        if (isActive) {
            this.showBuildingBtn();
        } else this.view.buildingBtn.visible = false;
    }

    private showBuildingBtn(): void {
        this.view.buildingBtn.visible = true;
        this.view.buildingBtn.scaleY = 0;
        tween()
            .target(this.view.buildingBtn)
            .to(0.3, { scaleY: 1 }, { easing: "cubicInOut" })
            .call(() => { })
            .start();
    }

    /***是否夜莺剧情 */
    private isYeYingStory: boolean = false;
    private onClickBuilding() {
        if (this._curBuildingId) {
            let cfg = TableManager.getDataById(table.map.MapBuildingConfig, this._curBuildingId);
            if (!cfg || cfg.building_type != MapObjectType.MIST_UNLOCKED) return;
            this.emit(NotificationKey.MAP_MIST_UNLOCKED, cfg.id);

            let yeYingBuildingId = Number(TableManager.getDataById(table.map.MapConstantConfig, "MAP:INSTANCE_BUILDING").content);
            if (yeYingBuildingId == this._curBuildingId) {
                let self = this.view;
                this.isYeYingStory = true;
                self.group_help.visible = false;
                let mapCfg = MapInstanceManager.ins().mapInstanceCfg;
                if (mapCfg.helpConfigId) {
                    fgui.GRoot.inst.inputProcessor.cancelAllTouches();
                    let teamUnit = GIns.battleMgr.battleLogic.getTeamByTeamId(WorldUnitTeam.Self);
                    if (teamUnit) teamUnit.forbiddenMove = true;
                    G.GameTimer.once(1000, this, () => {
                        let yeYingMonsters = TableManager.getDataById(table.map.MapConstantConfig, "MAP:INSTANCE_MONSTER_CREATE").content.split(";");
                        this.emit(NotificationKey.TRIGGER_CREATE_MONSTER, yeYingMonsters);
                    });
                    G.GameTimer.once(2500, this, this.showHelpHero);
                }
            }
        }
    }

    protected onClose(): void {
        G.GameTimer.clearAll(this);
    }
}
