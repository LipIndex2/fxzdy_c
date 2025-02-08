import G from "../../../core/comm/G";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import LoginNotificationKey from "../../../main/modules/LoginNotificationKey";
import { FightType } from "../../comm/battle/enum/FightType";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { RedDotKeys } from "../common/redDot/RedDotKeys";
import { ConditionUtils } from "../condition/ConditionUtils";
import { FormationMainViewOpenArgs, UIFormationKey } from "../formation/const/UIFormationConfig";

export class CollectiblesDungeonManager extends BaseController {
    protected _isOpen: boolean = false;
    protected _isInit: boolean = false;
    protected _timerKey: string = null;

    protected _curFormationLevelId: number = 0;
    public isSelectAutoNext: boolean = false;

    listenNotifications(): string[] {
        return [
            // 解锁 tabItem 用
            ...ConditionUtils.getUnlockEventNameArray(),
            LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE,
            NotificationKey.COLLECTIBLES_DUNGEON_INFO_CHANGE,
            NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION,
        ]
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE:
                this._isInit = true;
                this.loadCollectiblesDungeonInfo();
                break;
            case NotificationKey.COLLECTIBLES_DUNGEON_INFO_CHANGE:
                this.onInfoChange();
                this.updateRedDot();
                break;
            case NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION:
                if (args == FightType.COLLECTIBLES_DUNGEON) {
                    //保存完阵容直接进入挑战
                    let levelId = GIns.formationMgr.getAutoFightParam(FightType.COLLECTIBLES_DUNGEON)
                    if (levelId > 0) {
                        this.challenge(levelId);
                        GIns.formationMgr.deleteAutoFightParam(FightType.COLLECTIBLES_DUNGEON)
                    }
                }
                break;
        }
        const ok = ConditionUtils.isNeedHandleForUnlock(event)
        if (ok) {
            if (this._isOpen == false && this._isInit) {
                //实时检测是否开启了
                this.loadCollectiblesDungeonInfo()
            }
        }
    }

    protected loadCollectiblesDungeonInfo(): void {
        this._isOpen = GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.COLLECTIBLES_DUNGEON);
        if (this._isOpen) {
            GIns.collectiblesDungeonModel.sendCollectiblesDungeonInfo();
        }
    }

    protected onInfoChange(): void {
        let refreshTime: number = GIns.collectiblesDungeonModel.vo.nextDailyResetTime;
        let nowTime: number = G.TimeManager.serverNow;
        if (this._timerKey) {
            G.GameTimer.clearByKey(this._timerKey);
            this._timerKey = null;
        }
        let remainTime: number = Math.max(0, refreshTime - nowTime);
        this._timerKey = G.GameTimer.once(remainTime, this, this.loadCollectiblesDungeonInfo);
    }

    protected updateRedDot():void {
        let chapterMap = GIns.collectiblesDungeonModel.chapterVoMap;
        chapterMap.forEach((vo) => {
            vo.rewardStateMap?.forEach((value, star) => {
                if (value == false && star <= vo.curStar) {
                    GIns.redDotMgr.setRedDot(RedDotKeys.CollectiblesDungeon_chapter_item_reward, true, [vo.chapterId, star]);
                } else {
                    GIns.redDotMgr.setRedDot(RedDotKeys.CollectiblesDungeon_chapter_item_reward, false, [vo.chapterId, star]);
                }
            })
        });
        let model = GIns.collectiblesDungeonModel;
        GIns.redDotMgr.setRedDot(RedDotKeys.CollectiblesDungeon_sweep, model.maxPassLevelId > 0 && model.vo?.sweepCount > 0);
    }

    /**打开布阵界面*/
    public openFormationView(levelId: number): void {
        this._curFormationLevelId = levelId;
        GIns.formationMgr.addAutoFightParam(FightType.COLLECTIBLES_DUNGEON, levelId);
        let openArgs = FormationMainViewOpenArgs.create(FightType.COLLECTIBLES_DUNGEON);
        openArgs.param = levelId;
        G.UIManager.open(UIFormationKey.FORMATION_MAIN_VIEW, openArgs);
    }

    /**挑战*/
    public challenge(levelId: number): boolean {
        let formationVo = GIns.formationMgr.getFormationVoByType(ServerEnums.FightType.COLLECTIBLES_DUNGEON);
        if (!formationVo || formationVo.isEmptyFormation()) {
            GIns.floatingTextMgr.showTips('请先布置阵容');
            this.openFormationView(levelId);
            return false;
        }
        if (GIns.collectiblesDungeonModel.vo.challengeCount <= 0) {
            GIns.floatingTextMgr.showTips('今日剩余挑战次数不足');
            return false;
        }
        GIns.collectiblesDungeonModel.sendChallenge({ collectiblesDungeonConfigId: levelId });
        return true;
    }

    /**扫荡*/
    public sweep(): boolean {
        let model = GIns.collectiblesDungeonModel;
        if (model.vo?.sweepCount <= 0) {
            GIns.floatingTextMgr.showTips('扫荡次数不足');
            return false;
        }
        if (model.maxPassLevelId <= 0) {
            GIns.floatingTextMgr.showTips('尚未通关任意关卡，无法扫荡');
            return false;
        }
        model.sendSweep();
        return true;
    }

    /** 获取一键布阵的data */
    public getFormationDatas(levelId: number): Vo.formation.PositionVo[] {
        let posCfg = G.TableManager.getAllData(table.formation.FormationPositionConfig);
        let heroVoArr = [];
        let allHeros = GIns.heroMgr.getHeroListByFight();

        let needCareerMap:Map<string, number> = new Map();
        let needCampMap:Map<string, number> = new Map();
        let levelVo = GIns.collectiblesDungeonModel.getLevelVo(levelId);
        if (levelVo) {
            levelVo.conditions.forEach((cond) => {
                if (cond.type == ServerEnums.CollectiblesDungeonConditionType.UP_SET_CAREER) {
                    if (needCareerMap.has(cond.value1) == false || needCareerMap.get(cond.value1) < cond.value2) {
                        //刷新需要的职业条件
                        needCareerMap.set(cond.value1, cond.value2);
                    }
                } else if (cond.type == ServerEnums.CollectiblesDungeonConditionType.UP_SET_CAMP) {
                    if (needCampMap.has(cond.value1) == false || needCampMap.get(cond.value1) < cond.value2) {
                        //刷新需要的种族条件
                        needCampMap.set(cond.value1, cond.value2);
                    }
                }
            });
        }
        if (needCareerMap.size > 0) {
            //职业筛选
            for (let i = 0; i < allHeros.length; i++) {
                let career:string = allHeros[i].heroCfg.career;
                if (needCareerMap.has(career)) {
                    //满足筛选
                    heroVoArr.push(allHeros[i]);
                    let cnt = needCareerMap.get(career);
                    cnt--;
                    if (cnt <= 0) {
                        needCareerMap.delete(career);
                        if (needCareerMap.size <= 0) {
                            //代表找齐了
                            break;
                        }
                    } else {
                        needCareerMap.set(career, cnt);
                    }
                }
            }
        }
        if (needCareerMap.size > 0) {
            //种族筛选
            for (let i = 0; i < allHeros.length; i++) {
                let camp:string = allHeros[i].heroCfg.camp + '';
                if (needCampMap.has(camp)) {
                    //满足筛选
                    heroVoArr.push(allHeros[i]);
                    let cnt = needCampMap.get(camp);
                    cnt--;
                    if (cnt <= 0) {
                        needCampMap.delete(camp);
                        if (needCampMap.size <= 0) {
                            //代表找齐了
                            break;
                        }
                    } else {
                        needCampMap.set(camp, cnt);
                    }
                }
            }
        }
        if (heroVoArr.length < posCfg.length) {
            //代表还没补齐阵容
            for (let i = 0; i < allHeros.length; i++) {
                if (heroVoArr.indexOf(allHeros[i]) == -1) {
                    heroVoArr.push(allHeros[i]);
                    if (heroVoArr.length >= posCfg.length) {
                        //补齐了
                        break;
                    }
                }
            }
        }


        let positionVos: Vo.formation.PositionVo[] = [];
        posCfg?.forEach((cfg, index) => {
            let heroBaseId: number = 0;
            if (index < heroVoArr.length) {
                heroBaseId = heroVoArr[index].baseId;
            }
            let vo: Vo.formation.PositionVo = {
                position: cfg.id,
                heroBaseId: heroBaseId,
            }
            positionVos.push(vo);
        })

        return positionVos;
    }

    onInit(): void {

    }
}
CollectiblesDungeonManager.ins().doInit()