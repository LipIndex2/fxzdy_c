import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { GVGUIKeys } from "db://assets/scripts/game/modules/gvg/GVGUIKeys";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { GVGConfigManager } from "db://assets/scripts/game/modules/gvg/config/GVGConfigManager";
import { GVGModel } from "db://assets/scripts/game/modules/gvg/GVGModel";
import { CommonHeroItemComp } from "db://assets/scripts/game/modules/common/hero/CommonHeroItemComp";
import { GVGUtils } from "db://assets/scripts/game/modules/gvg/utils/GVGUtils";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import {
    FormationMainViewOpenArgs,
    UIFormationKey
} from "db://assets/scripts/game/modules/formation/const/UIFormationConfig";
import { FightType } from "db://assets/scripts/game/comm/battle/enum/FightType";
import { Logger } from "db://assets/scripts/core/log/Logger";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { GVGRecordWinOpenArgs } from "db://assets/scripts/game/modules/gvg/structs/GVGRecordWinOpenArgs";
import { IHeroHeadData } from "db://assets/scripts/game/modules/dailyBoss/interface/IHeroHeadData";
import { GVGCaches } from "db://assets/scripts/game/modules/gvg/cache/GVGCaches";
import { PlayerAvatarData } from "db://assets/scripts/game/modules/common/playerInfo/structs/PlayerAvatarData";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { EnumGVGTeamType } from "db://assets/scripts/game/modules/gvg/enums/EnumGVGTeamType";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { PlayerAvatar } from "db://assets/scripts/game/modules/common/playerInfo/PlayerAvatar";

export interface GVGChallengeConfirmWinOpenArgs {
    isOppo: boolean;
    fighterData: Vo.leaguewar.LeagueWarDefenderVo;
}

/**
 * 联盟对决
 */
@bindScript(GVGUIKeys.GVGChallengeConfirmWin)
export class GVGChallengeConfirmWin extends UICommWin {

    static pkgName: string = "gvg";
    static viewName: string = "GVGChallengeConfirmWin";

    private _oppoData: Vo.leaguewar.LeagueWarDefenderVo;
    private _heroList: IHeroHeadData[];
    private _vo: Vo.leaguewar.LeagueWarDefenceVo;
    private _isOppo: boolean = true;

    private get view(): ui.gvg.GVGChallengeConfirmWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.GVG_LOAD_OUR_PLAYER_CHALLENGE_INFO,
            NotificationKey.GVG_LOAD_OPPO_PLAYER_CHALLENGE_INFO,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.GVG_LOAD_OPPO_PLAYER_CHALLENGE_INFO: {
                this.reset(this._isOppo, args)
                break;
            }
            case NotificationKey.GVG_LOAD_OUR_PLAYER_CHALLENGE_INFO: {
                this.reset(this._isOppo, args)
                break;
            }
        }

    }

    protected onInit() {
        this.view.btnTeamLike.onClick(this.onClickTeamLike, this);
        this.view.btnChallenge.onClick(this.onClickChallenge, this);
        this.view.btnRecord.onClick(this.onClickRecord, this);

        this.view.heroList.setVirtual();
        this.view.heroList.itemRenderer = this.irHero.bind(this);
    }

    @LogBusiness("打开界面")
    public onOpen(args: GVGChallengeConfirmWinOpenArgs): void {

        const oppoData = args.fighterData;
        this._oppoData = oppoData;
        this._isOppo = args.isOppo;

        this.showUI(false);

        const playerId = oppoData?.playerId || 0;

        const context = GVGModel.ins().context;
        const leagueType = context.isWhichLeagueType(playerId)

        const isOppo = leagueType == EnumGVGTeamType.OPPO;
        if (isOppo) {
            // 敌人 req
            GVGModel.ins().sendGetEnemyDefenceInfo({
                targetId: playerId
            } as Vo.leaguewar.GetEnemyDefenceInfoC2S);
        } else {
            // 我方 req
            GVGModel.ins().sendGetSelfDefenceInfo({
                targetId: playerId
            } as Vo.leaguewar.GetSelfDefenceInfoC2S);
        }

    }

    showUI(isShow: boolean) {
        this.view.barHp.visible = isShow;
        this.view.barHpCount.visible = isShow;


    }

    @LogBusiness("关闭界面")
    protected onClose() {
        super.onClose();


    }

    private reset(isOppo: boolean, vo: Vo.leaguewar.LeagueWarDefenceVo) {
        const oppoData = this._oppoData;
        if (!oppoData || !vo) {
            Logger.error("后端数据里面没有这个对手..");
            return;
        }

        this.showUI(true);

        this._vo = vo;

        // avatar
        const playerAvatar = FguiScriptUtils.toMyScriptClass(this.view.avatar, PlayerAvatar);
        playerAvatar.reset(
            vo.playerId,
            vo.headIcon,
            vo.headFrame,
            0
        );


        // TODO 一定是对手
        this.view.getController("isOppo").selectedIndex = isOppo ? 1 : 0;

        const context = GVGModel.ins().context;
        const isCanChallenge = context.isCanChallenge();

        // 挑战按钮
        this.view.btnChallenge.grayed = !isCanChallenge;

        const oppoChallengeData = context.getChallengeDataByPlayerId(oppoData.playerId)

        const playerName = oppoData.name;
        const fightNum = oppoData.fight;
        // 成功防御了多少次
        const labelSuccessDefendCount = vo.defendCount || 0;
        // 剩余血量
        const hp = oppoData.hps[0];

        const maxChallengeTimesPerDay = GVGConfigManager.maxChallengeTimesPerWar;

        // 次数
        const haveChallengeCount = context.getHaveChallengeCount();
        const restChallengeCount = Math.max(0, maxChallengeTimesPerDay - haveChallengeCount);
        // 剩余次数/最大次数
        this.view.labelChallengeCount.text = `${restChallengeCount}/${maxChallengeTimesPerDay}`;


        this.view.labelPlayerName.text = playerName;
        this.view.labelFightNum.text = `战力:${fightNum}`;
        this.view.labelSuccessDefendCount.text = `成功防御: ${labelSuccessDefendCount} 次`;

        // hp 血条
        const maxHpCount = GVGConfigManager.getInitMaxHpCount();
        const hpCount = GVGUtils.calcHpCount(hp);
        this.view.barHpCount.labelTitle.text = `x${hpCount}`;
        this.view.barHpCount.value = hpCount;
        this.view.barHpCount.max = maxHpCount;
        this.view.barHp.value = GVGUtils.calcHpPercent(hp);
        this.view.barHp.max = 10000;

        // team
        const teamVo = vo.teamVos[0];
        if (teamVo) {

            const robotVo = teamVo?.robotVo;
            if (robotVo) {
                // TODO 机器人阵容
                const robotFormationId = robotVo.robotFormationId;

                const robotTeamConfig = GVGConfigManager.getRobotTeamConfigById(robotFormationId);
                const robotConfig = GVGConfigManager.getRobotConfigById(robotVo.robotConfigId);

                const heroIds = robotTeamConfig?.heroIds as number[] || [];
                const heroLvArray = robotConfig?.robotHeroLevels as number[] || [];
                const starArray = robotConfig?.robotHeroStars as number[] || [];


                const robotHeroArray: IHeroHeadData[] = []
                for (let i = 0; i < 6; i++) {
                    const heroId = heroIds[i];
                    const heroLevel = heroLvArray[i];
                    const star = starArray[i];
                    if (!heroId) {
                        continue
                    }

                    const newVar = {
                        heroId: heroId,
                        lv: heroLevel,
                        star: star,
                        stage: 1
                    } as IHeroHeadData;
                    robotHeroArray.push(newVar)
                }

                this._heroList = robotHeroArray;

            } else {
                this._heroList = (teamVo?.formationVisitVo?.positionVisitVos || [])
                    .map(it => {
                        return {
                            heroId: it.heroBaseId,
                            lv: it.heroLevel,
                            star: it.star,
                            stage: it.heroStage
                        } as IHeroHeadData;
                    });
            }
            // 英雄数量
            this.view.heroList.numItems = this._heroList.length;
        }

    }

    onClickTeamLike() {
        const context = GVGModel.ins().context;
        const myTeamPosArray = context.getMyTeamPosArray();

// 布阵 | 主地图
        UIManager.ins().open(UIFormationKey.FORMATION_MAIN_VIEW, FormationMainViewOpenArgs.create(
            FightType.TRUNK_MAP,
            null,
            myTeamPosArray
        ));

    }

    onClickChallenge() {

        const context = GVGModel.ins().context;
        const isCan = context.isCanChallenge();
        if (!isCan) {
            FloatingTextManager.ins().showTips("本轮玩法挑战次数已耗尽");
            return;
        }

        GVGCaches.oppoAvatarData = PlayerAvatarData.create(
            this._vo?.playerId,
            this._vo?.name,
            this._vo?.headIcon,
            this._vo?.headFrame,
            0,
        );
//  挑战 net

        GVGModel.ins().sendChallenge({
            targetId: this._vo?.playerId,
            teamIndex: 0,
        } as Vo.leaguewar.ChallengeC2S);

        this.closeSelf();
    }

    onClickRecord() {
// 这个玩家的防守记录
        UIManager.ins().open(GVGUIKeys.GVGRecordWin, {
            playerId: this._vo?.playerId,
            isJustSeeDefence: true
        } as GVGRecordWinOpenArgs);

    }

    irHero(index: number, comp: CommonHeroItemComp) {
        const hero = this._heroList[index];

        if (!hero) {
            return;
        }
        const heroId = hero.heroId;
        const lv = hero.lv;
        const starCount = hero.star;

        comp.reset(heroId, lv, starCount);
    }
}