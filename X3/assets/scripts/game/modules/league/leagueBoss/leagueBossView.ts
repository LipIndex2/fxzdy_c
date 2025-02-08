import { tween, Tween } from "cc";
import { EnumRuleKeys } from "db://assets/scripts/game/modules/rule/enums/EnumRuleKeys";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { MathUtils } from "../../../../core/utils/MathUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { IAdPlayVo } from "../../ad/model/vo/IAdPlayVo";
import { CommonI18nKeys } from "../../common/i18n/CommonI18nKeys";
import { ModelNode } from "../../common/node/ModelNode";
import { PlayerAvatar } from "../../common/playerInfo/PlayerAvatar";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { PlayerInfoConfigManager } from "../../player/config/PlayerInfoConfigManager";
import { RuleController } from "../../rule/RuleController";
import { UILeagueKey } from "../const/UILeagueConst";
import { LeagueControler } from "../leagueControler";
import { LeagueManager } from "../leagueManager";
import { LeagueModel } from "../LeagueModel";
import { EnumRedDotReadType } from "../../common/redDot/enums/EnumRedDotReadType";
import { EnumRedDotShowType } from "../../common/redDot/enums/EnumRedDotShowType";

@bindScript(UILeagueKey.LeagueBossView)
export class LeagueBossView extends UIPage {
    static pkgName: string = "leagueBoss";
    static viewName: string = "leagueBossMainView";

    private get view(): ui.leagueBoss.leagueBossMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_LEAGUE_BOSS_CHALLENGE_COUNT_CHANGE,
            NotificationKey.EVENT_LEAGUE_BOSS_STAGE_INFO_CHANGE,
            NotificationKey.EVENT_LEAGUE_BOSS_INFO_CHANGE,
            NotificationKey.EVENT_LEAGUE_BOSS_STAGE_CHANGE,
            NotificationKey.SYSTEM_NEW_DAY,
            NotificationKey.EVENT_LEAGUE_BOSS_KILL
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_LEAGUE_BOSS_CHALLENGE_COUNT_CHANGE:
                this.updateCount();
                break;
            case NotificationKey.EVENT_LEAGUE_BOSS_STAGE_INFO_CHANGE:
                this.updateAllBossInfo();
                break;
            case NotificationKey.EVENT_LEAGUE_BOSS_INFO_CHANGE:
                this.updateBossInfo();
                break;
            case NotificationKey.EVENT_LEAGUE_BOSS_STAGE_CHANGE:
                LeagueModel.ins().loadStageLeagueBoss();
                break;
            case NotificationKey.SYSTEM_NEW_DAY:
                LeagueModel.ins().loadStageLeagueBoss();
                break;
            case NotificationKey.EVENT_LEAGUE_BOSS_KILL:
                LeagueModel.ins().loadStageLeagueBoss();
                break;

        }

    }

    private bossId: number = -1;

    protected _hasPlayAniIndexMap: Map<number, boolean> = new Map()

    protected onInit() {
        let view = this.view;
        view.challengeBtn.onClick(this.onChallenge, this);
        view.bossList.itemRenderer = this.bossTabRender.bind(this);
        view.bossList.onClick(this.onBossCellClick, this);
        view.closeBtn.onClick(this.closeSelf, this);

        view.rankBtn.onClick(this.onOpenRankView, this);
        view.rawardBtn.onClick(this.onOpenAwardView, this);
        view.buzhen.onClick(this.onOpenBuzhen, this);
        view.ruleBtn.onClick(() => {
            RuleController.ins().openRule(EnumRuleKeys.LEAGUE_BOSS, view.ruleBtn);
        });

        FguiScriptUtils.toMyScriptClass(view.challengeBtn.redDot, RedDotCom).reset(RedDotKeys.leagueBoss_challenge);

        this.updateCount();

        view.btnAd.visible = false;
        view.btnAd.onClick(this.onClickAd, this);

        GIns.redDotMgr.markRead(EnumRedDotReadType.TODAY_ONCE, RedDotKeys.leagueBoss_ad);
    }

    onOpenRankView(): void {
        let cfg = this.allCfg[this.bossId];

        LeagueModel.ins().openLeagueBossRankView(cfg);
    }

    private onOpenAwardView(): void {
        let cfg = this.allCfg[this.bossId];

        LeagueModel.ins().openLeagueBossRewardView(cfg);
    }

    private onOpenBuzhen(): void {
        let cfg = this.allCfg[this.bossId];
        let battleConfigId = cfg.id;
        LeagueModel.ins().openBuzhen(battleConfigId);
    }

    protected onClickAd(): void {
        let args: IAdPlayVo = {
            type: ServerEnums.AdvertType.LEAGUE_BOSS,
        };
        this.emit(NotificationKey.AD_START_PLAY, args);
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        LeagueModel.ins().loadStageLeagueBoss();
        this.view.getTransition('t0').play();

        this.view.bossSpineNode.setPosition(this.view.bossBg.x + 400, this.view.bossBg.y - 300)
        tween(this.view.bossSpineNode).to(0.5, { x: this.view.bossBg.x, y: this.view.bossBg.y }, { easing: 'circOut' }).start()
    }

    protected onClose(): void {
        Tween.stopAllByTarget(this.view.bossSpineNode)
    }

    private onChallenge(): void {
        let cfg = this.allCfg[this.bossId];
        let battleConfigId = cfg.id;

        LeagueModel.ins().challengeLeagueBoss(battleConfigId);
    }

    private bossTabRender(index: number, item: ui.leagueBoss.component.bossCell): void {
        let stageVo = LeagueManager.ins().leagueBossStageInfo;
        let cfg = this.allCfg[index];
        let battleConfigId = cfg.id;
        let bossVo = stageVo.bossVos.find((vo) => { return vo.bossConfigId == battleConfigId });
        let state = LeagueModel.ins().getLeagueBossState(battleConfigId);
        //配置
        let bossCfg = LeagueModel.ins().getMonsterCfgAndModel(cfg.battleConfigId);
        let ctr = item.getController("state");
        if (state == 1) {
            //存活的
            if (this.bossId == -1 && this.view.bossList.selectedIndex == -1) {
                this.view.bossList.selectedIndex = index;
                this.onBossCellClick();
            }
            ctr.selectedIndex = 0;
        }
        else {
            ctr.selectedIndex = 1;
            //伤害最高的

            const avatar = FguiScriptUtils.toMyScriptClass(item.playerAvatar, PlayerAvatar);
            if (bossVo.topRankItemVos[0]) {
                avatar.resetByPlayerInfo(bossVo.topRankItemVos[0].baseVo);
                item.playerName.text = bossVo.topRankItemVos[0].baseVo.name;
            }
            else {

                item.playerName.text = "虚位以待";
            }
        }

        //boss cell的显示设置
        const modelNode = item.bossSpineNode as ModelNode;
        modelNode.setLoadCompleteListener(this.bossCellSpineCb.bind(this, modelNode));
        modelNode.loadByModelId(bossCfg.spineModelId);

        let career = ServerEnums.Career[cfg.career];
        item.career.icon = ItemUtils.getCareerIcon(career);
        item.hpBar.value = bossVo.bossTotalHp - bossVo.bossTotalBeHurt;
        item.hpBar.max = bossVo.bossTotalHp;
        item.hpBar.title.text = MathUtils.toFiexdPercent(item.hpBar.value / item.hpBar.max, 2);

        if (this._hasPlayAniIndexMap.has(index) == false) {
            this._hasPlayAniIndexMap.set(index, true)
            item.visible = false
            item.getTransition('t0').play(null, 1, index * 0.1)
        }
    }

    /**显示次数 */
    private updateCount(): void {
        let vo = LeagueManager.ins().mPlayerLeagueLoginVo;
        let cfgCount = LeagueModel.ins().getLeagueBossChallengeCount();
        let btn = this.view.challengeBtn;
        btn.labelCount.text = `次数：${cfgCount - vo.bossChallengeTimes}/${cfgCount}`;

        this.updateAdTimes();
    }

    private allCfg: table.league.LeagueBossConfig[];
    /**全部boss返回 */
    private updateAllBossInfo(): void {
        let stageVo = LeagueManager.ins().leagueBossStageInfo;
        let stage = stageVo.bossStage;
        let cfgs = this.allCfg = LeagueModel.ins().getLeagueBossConfigInStage(stage);

        this.view.bossList.numItems = cfgs.length;
        this.view.stageTxt.text = `${stage}阶`;
        if (this.view.bossList.selectedIndex == this.bossId) {
            // /强行刷新
            this.onBossCellClick();
        }
        else
            this.view.bossList.selectedIndex = this.bossId;

        //判断新阶段
        if (LeagueModel.ins().isNewStage(stage)) {
            LeagueControler.ins().openNewStageView(stage);
        }


    }


    /**单个boss的信息 */
    private updateBossInfo(): void {
        let index: number = this.bossId;
        let stageVo = LeagueManager.ins().leagueBossStageInfo;
        let cfg = this.allCfg[index];
        let bossConfigId = cfg.id;
        //数据
        let bossVo = stageVo.bossVos.find((vo) => { return vo.bossConfigId == bossConfigId });
        //配置
        let bossCfg = LeagueModel.ins().getMonsterCfgAndModel(cfg.battleConfigId);
        //羁绊配置
        let skillCfg = LeagueModel.ins().getPassivitySkillConfig(bossCfg.cfg.passivitySkils[0]);
        let view = this.view;
        view.bossName.text = bossCfg.cfg.name;
        view.bossHp.value = bossVo.bossTotalHp > bossVo.bossTotalBeHurt ? bossVo.bossTotalHp - bossVo.bossTotalBeHurt : 0;
        view.bossHp.max = bossVo.bossTotalHp;
        if (view.bossHp.value > 0)
            view.bossHp.title.text = MathUtils.toFiexdPercent(view.bossHp.value / view.bossHp.max, 2);
        else
            view.bossHp.title.text = G.I18nManager.lang(CommonI18nKeys.bossDie);;


        let career = ServerEnums.Career[cfg.career]
        view.bossCareerIcon.icon = ItemUtils.getCareerIcon(career);

        view.bossUpTips.text = `${skillCfg.desc}`;

        const modelNode = view.bossSpineNode as ModelNode;
        modelNode.setScale(2.6, 2.6);
        modelNode.loadByModelId(bossCfg.spineModelId);

        let topRankItemVos = bossVo.topRankItemVos;

        //前三名
        for (let i = 0; i < 3; i++) {
            let rankVo = topRankItemVos[i]
            // let rankItem = view.top1;
            let rankItem: ui.leagueBoss.component.leagueBossRankTop3 = view["top" + (i + 1)];
            let ctr = rankItem.getController("rank");
            const modelNode = FguiScriptUtils.toMyScriptClass(rankItem.spineNode, ModelNode);
            if (rankVo) {
                ctr.selectedIndex = i;
                rankItem.playerName.text = rankVo.baseVo.name;



                const modelId = PlayerInfoConfigManager.getModelIdByPlayerInfo(rankVo.baseVo)
                modelNode.loadByModelId(modelId);
                modelNode.play("idle", true);
                if (i == 1) {
                    //第二名特殊处理
                    modelNode.setScale(-1.8, 1.8);
                }
                else {
                    modelNode.setScale(1.8, 1.8);
                }
            }
            else {
                //无上榜
                ctr.selectedIndex = 3;
                modelNode.clear();
            }
        }

        this.updateAdTimes();
    }

    protected updateAdTimes():void {
        let remianTimes = GIns.adModel.getRemainAdTimes(GIns.LeagueManager.mPlayerLeagueLoginVo.bossAdvertChallengeTimes, ServerEnums.AdvertType.LEAGUE_BOSS);
        if (remianTimes > 0) {
            this.view.btnAd.visible = true;
            this.view.btnAd.title = `免费挑战次数${remianTimes}/${GIns.adModel.getTotalAdTimes(ServerEnums.AdvertType.LEAGUE_BOSS)}`
            FguiScriptUtils.toMyScriptClass(this.view.btnAd.redDot, RedDotCom).showByType(EnumRedDotShowType.REWARD);
        } else {
            this.view.btnAd.visible = false;
        }
    }

    private bossCellSpineCb(node: ModelNode): void {
        node.setScale(1.5, 1.5);
        node.gotoAndStop(1);
    }

    private onBossCellClick(): void {
        let index = this.view.bossList.selectedIndex;
        if (index == -1) {
            index = 0;
            this.view.bossList.selectedIndex = 0;
        }
        this.onBossSelcted(index);
    }


    private onBossSelcted(index: number): void {

        if (this.bossId != index) {

            let targetRotation = LeagueModel.ins().getBgRotateAngle(index);
            if (this.bossId == -1) {
                this.view.backGroud.rotation = targetRotation;
            }
            else {

                tween(this.view.backGroud).to(0.25, { rotation: targetRotation }).start();
            }
        }
        this.bossId = index;
        let cfg = this.allCfg[index];
        if (cfg) {
            let bossConfigId = cfg.id;
            LeagueModel.ins().loadLeagueBossInfo(bossConfigId);
        }

    }





}