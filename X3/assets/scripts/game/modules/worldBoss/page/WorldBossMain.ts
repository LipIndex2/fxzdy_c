import { Node, sp } from "cc";
import G from "../../../../core/comm/G";
import { I18nManager } from "../../../../core/i18n/I18nManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import NotificationKey from "../../../event/NotificationKey";
import { MapManager } from "../../../tiledMap/MapManager";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { HeroUtils } from "../../hero/utils/HeroUtils";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { RuleController } from "../../rule/RuleController";
import { I18WorldBossKey, WorldBossUiKey } from "../const/WorldBossConst";
import { WorldBossModel } from "../model/WorldBossModel";
import { WorldBossManager } from "../WorldBossManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";

@bindScript(WorldBossUiKey.WORLD_BOSS_MAIN_VIEW)
export class WorldBossMain extends UIPage {

    static pkgName: string = "worldBoss";
    static viewName: string = "worldBossMain";

    private cfg: table.worldboss.WorldBossConfig;
    private worldBossInfo: Vo.worldboss.WorldBossVo;
    private monsterSkills: table.battle.SkillConfig[] = [];


    listenNotifications(): string[] {
        return [NotificationKey.ENTER_WORLD_COMPLETE, NotificationKey.EVENT_WORLD_BOSS_RANK_RESP, NotificationKey.SYSTEM_NEW_DAY];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.ENTER_WORLD_COMPLETE:

                // WorldBossModel.ins().openWorldBossMain(this.cfg.buildId);
                if (MapManager.ins().isInMainCity()) {
                    this.updateView();
                }
                break
            case NotificationKey.EVENT_WORLD_BOSS_RANK_RESP:
                this.updateRank();
                break;
            case NotificationKey.SYSTEM_NEW_DAY:
                //跨天处理
                WorldBossModel.ins().openWorldBossMain(this.cfg.buildId);
                break;
        }
    }


    private get view(): ui.worldBoss.worldBossMain {
        return this._view as any;
    }


    public onInit(): void {
        let view = this.view;
        view.challengeBtn.onClick(this.onChallenge, this);
        //  view.skillList.itemRenderer = this.skillListRender.bind(this);
        view.backBtn.onClick(() => {
            this.closeSelf();
        }, this);

        view.hotHero.hotHeros.itemRenderer = this.hotHerosRender.bind(this);
        view.buzhenBtn.onClick(() => {
            WorldBossModel.ins().openBuzhen(this.cfg);
        });
        //查看奖励
        view.godPick.onClick(() => {
            WorldBossModel.ins().openBeatWin(this.cfg);
        });
        //排行榜
        view.rankBtn.onClick(() => {
            WorldBossModel.ins().openRank(this.cfg);
        });
        //奖励
        view.rewardBtn.onClick(() => {
            WorldBossModel.ins().openSettlement(this.cfg, 0);
        });
        view.damageReward.onClick(() => {
            WorldBossModel.ins().openSettlement(this.cfg, 1);
        });
        view.btn_Tips.onClick(() => {
            RuleController.ins().openRule(EnumRuleKeys.WORLD_BOSS, view.btn_Tips);
        });

        view.danmuBtn.visible = false

    }

    protected onOpen(args: table.worldboss.WorldBossConfig): void {
        this.cfg = args;
        //   WorldBossModel.ins().sendWorldBossInfo(args.id);

        //找到对应的怪物配置
        let monstCfg = WorldBossModel.ins().getWorldBossCfg(args.battleConfigId);
        this.view.bossName.text = monstCfg?.cfg?.name;
        //spine加载
        if (!this.view.bossSpine.node.parent.getChildByName("spineNode")) {
            WorldBossModel.ins().showMonsterSpineNode(monstCfg.spineModelId, this.view.bossSpine.node, this.bossPlay.bind(this));
        }
        this.monsterSkills = monstCfg.skills;

        for (let i = 0; i < monstCfg.skills.length; i++) {
            // let icon = this.view.skill0;
            let icon = this.view[`skill${i}`];
            this.skillListRender(i, icon);
            icon.visible = true;
        }
        //隐藏多余的技能
        for (let i = monstCfg.skills.length; i < 3; i++) {
            this.view[`skill${i}`].visible = false;
        }

        //   this.view.skillList.numItems = monstCfg.skills.length;
        //推荐阵容 最多显示3个
        let recommendFormation = args.RecommendHero.slice(0, 3);
        this.view.hotHero.hotHeros.numItems = recommendFormation.length;

        this.view.buzhenBtn.redDot.visible = WorldBossModel.ins().isNeedFormation(args.id);
        this.updateView();

        FguiScriptUtils.toMyScriptClass(this.view.challengeBtn.redDot, RedDotCom).reset(RedDotKeys.WorldBoss_challenge, [args.id])
        FguiScriptUtils.toMyScriptClass(this.view.buzhenBtn.redDot, RedDotCom).reset(RedDotKeys.WorldBoss_setup, [args.id])
    }

    /**
     * 点击播放boss动画
     */
    private bossPlay(spine: sp.Skeleton): void {
        //点击播放动画
        // spine.node.on(Node.EventType.MOUSE_DOWN, () => {
        //     spine.setCompleteListener(() => {
        //         spine.setAnimation(0, "idle", true)
        //     });
        //     spine.setAnimation(0, "attack", false)
        // })
        spine.node.on(Node.EventType.TOUCH_START, () => {
            spine.setCompleteListener(() => {
                spine.setAnimation(0, "idle", true)
            });
            spine.setAnimation(0, "attack", false)
        })
    }

    /**是否已击杀 */
    private hadKill: boolean;
    private openOnce: boolean = false;

    private updateView(): void {
        let view = this.view;
        let vo = this.worldBossInfo = WorldBossManager.ins().getWorldBossInfo(this.cfg.id);
        //是否已击杀
        this.hadKill = vo.killTime > 0;
        view.challengeBtn.grayed = this.hadKill || vo.startTime <= 0;
        view.bossHp.max = vo.bossTotalHp;
        let currentHp = vo.bossTotalHp - vo.bossTotalBeHurt;
        view.bossHp.value = currentHp > 0 ? currentHp : 0;
        const diffTimeMs = G.TimeManager.serverNow - vo.startTime;
        let timeStr = TimeUtils.formatTimeMsToDayHourMinuteText(diffTimeMs);
        view.actTime.text = I18nManager.ins().lang(I18WorldBossKey.i18n_worldBoss_startTime, timeStr);

        //BOSS挑战次数
        let bossChallengeTime = vo.playerWorldBossVo.bossChallengeTimesMap[this.cfg.id] || 0;
        view.challengeBtn.time.text = `${this.cfg.dailyChallengeTimes - bossChallengeTime}/${this.cfg.dailyChallengeTimes}`;

        if (this.hadKill && !this.openOnce) {
            this.openOnce = true;
            this.closeSelf();
            WorldBossModel.ins().openRank(this.cfg);
            WorldBossModel.ins().openBeatWin(this.cfg);
        }

        // //世界BOSS单次挑战最高伤害MAP,boss配置ID-伤害值
        // let hurt = vo.playerWorldBossVo.bossHurtMap[this.cfg.id];
        // //BOSS排名奖励领取MAP, boss配置ID-是否已领奖
        // let drawRankReward = vo.playerWorldBossVo.drawRankRewardMap[this.cfg.id];
        // //BOSS服务器奖励领取MAP, boss配置ID-是否已领奖
        // let drawServerReward = vo.playerWorldBossVo.drawServerRewardMap[this.cfg.id];
        if (vo.startTime > 0)
            WorldBossModel.ins().sendRankList(this.cfg.id, 1);
        else
            this.updateRank();


    }

    /**技能 */
    private skillListRender(index: number, item: ui.worldBoss.component.skillIcon): void {


        let skillCfg = this.monsterSkills[index];
        item.skillCom.img_skill.url = skillCfg.icon;
        item.onClick(() => {
            WorldBossModel.ins().openSkillDetail(skillCfg.id);
        });

    }

    /**热门英雄 */
    private hotHerosRender(index: number, item: ui.worldBoss.component.heroHead): void {
        let heroId = this.cfg.RecommendHero[index];
        let heroCfg = WorldBossModel.ins().getHeroCfg(heroId);
        item.head.url = ItemUtils.getNormalHeroHead(heroCfg.headPath);
        //品质
        item.quality.url = HeroUtils.getQualityConfigByHeroId(heroId).itemQualityBgPath;

    }

    /**挑战 */
    private onChallenge(): void {
        WorldBossModel.ins().sendChallenge(this.cfg.id);

    }

    private updateRank(): void {
        let vo = WorldBossManager.ins().getWorldBossRankVo(this.cfg.id);
        //         有数据	第一栏	【本服排名】【第n名】【查看奖励】			
        // 	第二栏	【最高伤害】【伤害值m】			
        // 无数据	第一栏	【本服排名】【未上榜】			
        // 	第二栏	请先参加挑战	
        let view = this.view;
        if (vo && vo.rank && vo.rank > 0) {
            view.serverRank.text = I18nManager.ins().lang(I18WorldBossKey.i18n_worldBoss_rank, vo.rank);
            view.highestDamage.text = `${vo.hurt}`;
            view.damageReward.visible = true;
            view.zgsh.visible = true;
            view.qxchbs.visible = false;
        } else {
            //未上榜
            view.serverRank.text = I18nManager.ins().translate(I18WorldBossKey.i18n_worldBoss_noRank);
            view.highestDamage.text = "";
            // view.damageReward.visible = false;
            view.zgsh.visible = false;
            view.qxchbs.visible = true;
        }
        let info = WorldBossManager.ins().getWorldBossInfo(this.cfg.id);
        if (info && info.killTime) {
            // WorldBossModel.ins().openWorldBossMain(this.cfg.buildId);
        }


    }


}