import { Layers, Node, sp } from "cc";
import G from "../../../../core/comm/G";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { UIManager } from "../../../../core/mvc/UIManager";
import { AssetBundleKeys } from "../../../../core/res/AssetBundleKeys";
import { Res } from "../../../../core/res/Res";
import { ResRef } from "../../../../core/res/ResRef";
import { TableManager } from "../../../../core/table/TableManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { BattleConfigManager } from "../../../comm/battle/config/BattleConfigManager";
import { FightType } from "../../../comm/battle/enum/FightType";
import { SpineAnimationKeys } from "../../../comm/const/SpineAnimationKeys";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { MapManager } from "../../../tiledMap/MapManager";
import { UIMainKey } from "../../../ui/main/const/UIMainConfig";
import { BattleUIUtils } from "../../battle/utils/BattleUIUtils";
import { IBattleResultWinData } from "../../battle/vo/IBattleResultWinData";
import { FormationMainViewOpenArgs, UIFormationKey } from "../../formation/const/UIFormationConfig";
import { FormationManager } from "../../formation/FormationManager";
import { FormationVo } from "../../formation/vo/FormationVo";
import { UIHeroKey } from "../../hero/const/UIHeroConfig";
import { ModuleOpenManager } from "../../moduleopen/ModuleOpenManager";
import { WorldBossUiKey } from "../const/WorldBossConst";
import { WorldBossManager } from "../WorldBossManager";


/**
 * 世界boss模块
 */
export class WorldBossModel extends BaseModel {
    /**
      * 模块标识
      */
    private MODULE = 36;
    private cmds = {
        LOAD_WORLD_BOSS_INFO: 1,
        CHALLENGE: 2,
        DRAW_RANK_REWARD: 3,
        DRAW_SERVER_REWARD: 4,
        LOAD_RANK_LIST: 5,
        Load_all_boss: 6,
        PUSH_CHALLENGE_RESULT: -1,
        PUSH_WORLD_BOSS_KILLED: -2,
    }

    /**是否已请求了活动boss信息*/
    protected _hasReqActivityBossIds: number[] = []

    constructor() {
        super();
        this.regist();
    }

    public static getModule(): number {
        return this.ins().MODULE;
    }

    public initData(data: any) {
        WorldBossManager.ins().clearAllBossInfo()
        //每次登录获取全部boss的概要信息
        this.sendAllBossInfo()
        //重置开关
        this._hasReqActivityBossIds.length = 0
    }

    /**尝试第一次请求boss信息*/
    public tryToSendByFirstTime(bossId: number): void {
        if (this._hasReqActivityBossIds.indexOf(bossId) == -1) {
            this._hasReqActivityBossIds.push(bossId)
            this.sendWorldBossInfo(bossId)
        }
    }

    /**
     * 注册所有从服务端收到的回调。
     */
    private regist(): void {
        // TODO 注册所有的指令
        let moduleId = this.MODULE;
        // this.registerMsg(moduleId, this.cmds.LOAD_SHOP_INFO, this.recShopInfo);
        // this.registerMsg(moduleId, this.cmds.BUY_GOODS, this.recBuyGoods);
        // //刷新
        // this.registerMsg(moduleId, this.cmds.REFRESH_SHOP, this.reFreshShop);
        //获取世界BOSS信息
        this.registerMsg(moduleId, this.cmds.LOAD_WORLD_BOSS_INFO, this.recWorldBossInfo);
        //挑战BOSS
        this.registerMsg(moduleId, this.cmds.CHALLENGE, this.recChallenge);
        //领取排名奖励
        this.registerMsg(moduleId, this.cmds.DRAW_RANK_REWARD, this.recDrawRankReward);
        //领取服务器奖励
        this.registerMsg(moduleId, this.cmds.DRAW_SERVER_REWARD, this.recDrawServerReward);
        //获取排行榜信息
        this.registerMsg(moduleId, this.cmds.LOAD_RANK_LIST, this.recRankList);
        //推送个人挑战结果
        this.registerMsg(moduleId, this.cmds.PUSH_CHALLENGE_RESULT, this.recChallengeResult);
        //推送BOSS被击杀
        this.registerMsg(moduleId, this.cmds.PUSH_WORLD_BOSS_KILLED, this.recKillResult);

        //获取所有boss的信息
        this.registerMsg(moduleId, this.cmds.Load_all_boss, this.recAllBoss);



    }

    /**
     * 获取所有BOSS信息
     */
    public sendAllBossInfo(): void {
        let moduleId = this.MODULE;
        this.send(moduleId, this.cmds.Load_all_boss);
    }

    private recAllBoss(data: Vo.worldboss.LoadAllBossInfoS2C): void {

        // console.log("获取所有BOSS信息：", data);

        let vo = data.content;
        if (vo) {
            vo.forEach((element) => {
                let vo = {} as Vo.worldboss.WorldBossVo;
                vo.bossConfigId = element.bossConfigId;
                vo.bossTotalHp = element.bossTotalHp;
                vo.startTime = element.startTime;
                vo.killTime = element.killTime;
                let pVo = {} as Vo.worldboss.PlayerWorldBossVo;
                //全部object初始化
                pVo.bossChallengeTimesMap = {};
                pVo.bossHurtMap = {};
                pVo.drawRankRewardMap = {};
                pVo.drawServerRewardMap = {};
                pVo.bossMaxRankMap = {};

                vo.playerWorldBossVo = pVo;
                WorldBossManager.ins().setWorldBossInfo(vo);
            });
            this.emit(NotificationKey.EVENT_WORLD_BOSS_ALL_INFO_RESP)
        }
    }

    /**
     * 获取世界BOSS信息
     */
    public sendWorldBossInfo(bossConfigId: number, type: number = 0): void {
        let c2s = {} as Vo.worldboss.LoadWorldBossInfoC2S;
        let moduleId = this.MODULE;
        c2s.bossConfigId = bossConfigId;

        this.send(moduleId, this.cmds.LOAD_WORLD_BOSS_INFO, c2s, type);
    }

    /**
     * 返回世界BOSS信息
     */
    public recWorldBossInfo(data: Vo.worldboss.LoadWorldBossInfoS2C, type: number): void {
        if (data.code < 0) {
            return;
        }

        let vo = data.content;
        WorldBossManager.ins().setWorldBossInfo(vo);
        this.emit(NotificationKey.EVENT_WORLD_BOSS_INFO_RESP, vo);
        if (type == 1) {
            let cfgs = this.getWorldBossAllCfg();
            let cfg = cfgs.find((cfg) => {
                return cfg.id == vo.bossConfigId;
            }
            );
            UIManager.ins().close(WorldBossUiKey.WORLD_BOSS_MAIN_VIEW);
            if (vo.killTime > 0) {
                //被击杀了，打开击杀界面
                this.openRank(cfg);
                this.openBeatWin(cfg);

            }
            else {
                //主界面
                UIManager.ins().open(WorldBossUiKey.WORLD_BOSS_MAIN_VIEW, cfg);
            }
        }


    }


    /**
     * 挑战BOSS
     */

    public sendChallenge(bossConfigId: number): boolean {
        let c2s = {} as Vo.worldboss.ChallengeC2S;
        let moduleId = this.MODULE;
        c2s.bossConfigId = bossConfigId;

        let vo = WorldBossManager.ins().getWorldBossInfo(bossConfigId);
        if (vo.killTime > 0) {
            //已经击杀

            GIns.floatingTextMgr.showTips("已经击杀");
            return false;
        }
        else if (vo.startTime <= 0) {
            //未开启
            GIns.floatingTextMgr.showTips("未开启");
            return false;
        }
        else {

            //判断是否已经布阵
            let need = this.isNeedFormation(bossConfigId);
            if (need) {
                GIns.floatingTextMgr.showTips("请先前往布阵");
                return;
            }
            //判断挑战次数
            let challengeCount = vo.playerWorldBossVo.bossChallengeTimesMap[bossConfigId] || 0;
            let cfg = TableManager.getDataById(table.worldboss.WorldBossConfig, bossConfigId);
            if (challengeCount >= cfg.dailyChallengeTimes) {
                //挑战次数不足
                GIns.floatingTextMgr.showTips("挑战次数不足");
                return false;
            }
            this.setMaxDamageAndRank(bossConfigId);
            this.send(moduleId, this.cmds.CHALLENGE, c2s, cfg);

        }

        return true;

    }

    public recChallenge(data: Vo.worldboss.ChallengeS2C, customData: table.worldboss.WorldBossConfig): void {
        if (data.code < 0) {

            return;
        }

        //关闭界面
        //  UIManager.ins().close(WorldBossUiKey.WORLD_BOSS_MAIN_VIEW);

        // let cfg = this.getWorldBossCfg(customData.battleConfigId);
        // setTimeout(() => {
        //     // 打开战斗界面
        //     G.UIManager.open(UICommonKey.CommonBattleView, CommonBattleViewOpenArgs.create(
        //         ServerEnums.FightType.WORLD_BOSS,
        //         customData.battleConfigId,
        //         cfg.cfg.name
        //     ));

        //     //打开战斗ui
        //     this.openWorldBossBattleUi(customData.id);

        // }, 1500);



    }

    /**
     * 领取排名奖励
     */
    public sendDrawRankReward(bossConfigId: number): void {
        let c2s = {} as Vo.worldboss.DrawRankRewardC2S;
        let moduleId = this.MODULE;
        c2s.bossConfigId = bossConfigId;
        this.send(moduleId, this.cmds.DRAW_RANK_REWARD, c2s, c2s);

    }

    public recDrawRankReward(data: Vo.worldboss.DrawRankRewardS2C, clientData: Vo.worldboss.DrawRankRewardC2S): void {

        if (data.code >= 0) {
            if (data.content && data.content.rewardResults && data.content.rewardResults.length > 0)
                G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, data.content.rewardResults as Vo.reward.RewardResult[]);

            let vo = WorldBossManager.ins().getWorldBossInfo(clientData.bossConfigId);
            if (vo) {
                vo.playerWorldBossVo.drawRankRewardMap[clientData.bossConfigId] = true;
            }

        }




    }

    public openServerRewardView(bossId: number) {
        //检查领奖状态
        //0=不可领 1=是可领取 2是已经领取
        let state = WorldBossModel.ins().getServerRewardState(bossId);
        if (state.state == 1 && state.rewards && state.rewards.length > 0) {

            setTimeout(() => {
                WorldBossModel.ins().openWorldBossReward(bossId, 1, state.rewards);
            }, 250);


        }
    }

    /**
     * 领取服务器奖励
     */
    public sendDrawServerReward(bossConfigId: number): void {

        //检查奖励配置
        let state = WorldBossModel.ins().getServerRewardState(bossConfigId);
        if (state.state == 1) {
            let c2s = {} as Vo.worldboss.DrawServerRewardC2S;
            let moduleId = this.MODULE;
            c2s.bossConfigId = bossConfigId;
            this.send(moduleId, this.cmds.DRAW_SERVER_REWARD, c2s, c2s);
        }
    }

    public recDrawServerReward(data: Vo.worldboss.DrawServerRewardS2C, clientData: Vo.worldboss.DrawServerRewardC2S): void {
        if (data.code >= 0) {
            if (data.content && data.content.rewardResults && data.content.rewardResults.length > 0)
                G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS, data.content.rewardResults as Vo.reward.RewardResult[]);
            let vo = WorldBossManager.ins().getWorldBossInfo(clientData.bossConfigId);
            if (vo) {
                vo.playerWorldBossVo.drawServerRewardMap[clientData.bossConfigId] = true;
                this.emit(NotificationKey.EVENT_WORLD_BOSS_DRAWSERVERREWARD_COMPLETE, vo)
            }
        }
    }

    /**
     * 获取排行榜信息
     */
    public sendRankList(bossConfigId: number, pageId: number): void {
        let c2s = {} as Vo.worldboss.LoadRankListC2S;
        let moduleId = this.MODULE;

        c2s.bossConfigId = bossConfigId;
        c2s.page = pageId;
        this.send(moduleId, this.cmds.LOAD_RANK_LIST, c2s, c2s);
    }

    /**
     * 返回排行榜信息
     * @param data 
     */
    public recRankList(data: Vo.worldboss.LoadRankListS2C, customData: Vo.worldboss.LoadRankListC2S): void {

        let vo = data.content;

        WorldBossManager.ins().setWorldBossRankVo(customData.bossConfigId, customData.page, vo);

        this.emit(NotificationKey.EVENT_WORLD_BOSS_RANK_RESP, vo);

    }

    recChallengeResult(data: Vo.worldboss.WorldBossChallengeVo): void {

        GIns.battleMgr.endFight();

        this.openSuccesWin(data);

    }

    recKillResult(data: Vo.worldboss.WorldBossKilledVo): void {
        this.openServerSuccess(data);

        //更新boss建筑状态
        let buildingNode = MapManager.ins().getBuildingNode(data.bossConfigId)
        if (buildingNode) {
            buildingNode.worldBossAnim();
        }
        this.sendWorldBossInfo(data.bossConfigId);

    }

    /**打开全服击杀推送界面 */
    public openServerSuccess(data: Vo.worldboss.WorldBossKilledVo): void {
        //更新个人信息
        let vo = WorldBossManager.ins().getWorldBossInfo(data.bossConfigId);
        if (!vo) {
            vo = new Vo.worldboss.WorldBossVo();
            vo.bossConfigId = data.bossConfigId;

        }
        vo.killTime = data.killTime;
        WorldBossManager.ins().setWorldBossInfo(vo);
        //有挑战过的才弹窗
        let hurt = (vo.playerWorldBossVo && vo.playerWorldBossVo.bossHurtMap[data.bossConfigId]) || 0;
        //在主城
        if (MapManager.ins().isInMainCity()) {
            //是否没有其他玩法界面打开
            let openView = UIManager.ins().isOpened(WorldBossUiKey.WORLD_BOSS_MAIN_VIEW);
            let cnOpen = UIManager.ins().isOpened(UIMainKey.MAIN_PAGE) || openView;
            if (cnOpen && hurt > 0)
                //屏蔽成功击杀世界boss弹框
                // UIManager.ins().open(WorldBossUiKey.WORLD_BOSS_BEAT_SERVER, data.bossConfigId);
            if (openView) {
                let cfgs = TableManager.getAllData(table.worldboss.WorldBossConfig);
                let cfg = cfgs.find((cfg) => {
                    return cfg.id == vo.bossConfigId;
                });
                this.openWorldBossMain(cfg.buildId);
            }

        }

    }

    public getWorldBossAllCfg() {
        let cfgs = TableManager.getAllData(table.worldboss.WorldBossConfig);
        return cfgs;
    }

    /**打开世界boss战斗ui */
    public openWorldBossBattleUi(battleConfigId: number): void {
        let cfgs = this.getWorldBossAllCfg();
        let bossId = 0;
        cfgs.forEach((cfg) => {
            if (cfg.battleConfigId == battleConfigId) {
                bossId = cfg.id;
            }
        });
        if (bossId)
            UIManager.ins().open(WorldBossUiKey.WORLD_BOSS_BATTLE_UI, bossId);
    }

    /**打开世界boss主界面 */
    public openWorldBossMain(buildId: number): void {


        //功能是否开启
        let unLock = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.WORLD_BOSS);
        if (!unLock)
            return;
        let cfgs = this.getWorldBossAllCfg();
        let cfg = cfgs.find((cfg) => {
            return cfg.buildId == buildId;
        }
        );
        WorldBossModel.ins().sendWorldBossInfo(cfg.id, 1);


    }

    /**打开领奖界面 */
    public openWorldBossReward(bossId: number, type: number, rewards: any[]): void {
        UIManager.ins().open(WorldBossUiKey.WORLD_BOSS_REWARD_VIEW, { bossId: bossId, type: type, rewards: rewards });
    }

    /**获取战斗配置 */
    public getWorldBossCfg(battleConfigId: number) {
        let cfgs = BattleUIUtils.getMonsterAttributeConfigArrayByBattleConfigId(battleConfigId);
        let cfg = cfgs[0];
        //怪物模型
        let spineModelId = cfg ? cfg.showModelId : 0;

        //获取怪物技能
        let skillIds = [];
        if (cfg) {
            if (cfg.skillIds)
                skillIds.push(cfg.skillIds[0]);
            if (cfg.skillIds[1])
                skillIds.push(cfg.skillIds[1]);
            if (cfg.skillIds[2] && cfg.skillIds[2] != "0")
                skillIds.push(cfg.skillIds[2]);
        }
        let skills = skillIds.map((skillId) => {
            if (skillId)
                return TableManager.getDataById(table.battle.SkillConfig, skillId);
        }
        );
        return { cfg, spineModelId, skills };
    }

    /**获取英雄配置 */
    public getHeroCfg(heroId: number) {
        let cfg = TableManager.getDataById(table.hero.HeroConfig, heroId);
        return cfg;
    }

    showMonsterSpineNode(spineModelId: number, nodeForSpine: Node, handler?: (spine: sp.Skeleton) => void) {

        let monsterCfg = TableManager.getDataById(table.model.ModelConfig, spineModelId);
        Res.getResRef({ bundle: AssetBundleKeys.SPINE, url: monsterCfg.modelPath, type: sp.SkeletonData }, null,
            (res: ResRef) => {
                if (!res) {
                    G.Logger.error("加载 spine 失败")
                    return
                }
                if (!nodeForSpine) return;
                // 加载 spine
                const spineNode = new Node();
                let scale = 1;
                if (monsterCfg.scale)
                    scale = monsterCfg.scale.scaleX;
                spineNode.setScale(scale, scale);
                spineNode.position = nodeForSpine.position;
                spineNode.layer = Layers.Enum.ALL;
                spineNode.name = "spineNode";
                // spine anim
                const spineSkeleton = spineNode.addComponent(sp.Skeleton);
                spineSkeleton.skeletonData = res.content;

                // skeleton.addRef();
                // spineNode.once(NodeEventType.NODE_DESTROYED, () => {
                //     skeleton.decRef();
                // })

                // parent
                nodeForSpine.parent.addChild(spineNode);
                spineNode.setSiblingIndex(nodeForSpine.getSiblingIndex());

                // play idle anim
                spineSkeleton.setAnimation(0, SpineAnimationKeys.idle, true);

                G.Logger.debug("加载 spine 完成")
                if (handler) {

                    handler(spineSkeleton);

                }


            })

    }


    /**打开布阵 */
    public openBuzhen(cfg: table.worldboss.WorldBossConfig): void {
        const subType = cfg.id;
        G.UIManager.open(UIFormationKey.FORMATION_MAIN_VIEW,
            FormationMainViewOpenArgs.create(
                FightType.WORLD_BOSS,
                subType.toString()
            ));
    }




    /**打开排行榜 */
    public openRank(cfg: table.worldboss.WorldBossConfig): void {
        //UIManager.ins().open(WorldBossUiKey.WORLD_BOSS_RANK);
        UIManager.ins().open(WorldBossUiKey.WORLD_BOSS_RANK_VIEW, cfg);
    }



    /**打开结算奖励 */
    public openSettlement(cfg: table.worldboss.WorldBossConfig, pageIndex: number): void {
        //UIManager.ins().open(WorldBossUiKey.WORLD_BOSS_SETTLEMENT);
        UIManager.ins().open(WorldBossUiKey.WORLD_BOSS_SETTLEMENT_VIEW, { cfg: cfg, pageIndex: pageIndex });
    }

    /**打开击败弹窗 */
    public openBeatWin(cfg: table.worldboss.WorldBossConfig): void {
        //boss是否已开始
        let vo = WorldBossManager.ins().getWorldBossInfo(cfg.id);
        if (vo.startTime <= 0) {
            GIns.floatingTextMgr.showTips("未开启");
            return;
        }

        UIManager.ins().open(WorldBossUiKey.WORLD_BOSS_BEAT_WIN, cfg);
    }

    /**打开单次参加成功结算弹窗 */
    public openSuccesWin(data: Vo.worldboss.WorldBossChallengeVo): void {
        let cfgs = this.getWorldBossAllCfg();
        let cfg: table.worldboss.WorldBossConfig;
        for (let i = 0; i < cfgs.length; i++) {
            if (cfgs[i].id == data.bossConfigId) {
                cfg = cfgs[i];
                break;
            }
        }


        let vo = WorldBossManager.ins().getWorldBossInfo(data.bossConfigId);
        vo.bossTotalBeHurt = data.bossTotalBeHurt;

        let hurt = vo.playerWorldBossVo.bossHurtMap[data.bossConfigId] || 0;
        //更新最高值
        vo.playerWorldBossVo.bossHurtMap[data.bossConfigId] = Math.max(hurt, data.hurt);
        //更新次数
        vo.playerWorldBossVo.bossChallengeTimesMap[data.bossConfigId] = data.todayChallengeTimes;
        //更新排名
        let rank = vo.playerWorldBossVo.bossMaxRankMap[data.bossConfigId] || 0;
        vo.playerWorldBossVo.bossMaxRankMap[data.bossConfigId] = Math.max(rank, data.rank);

        G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, data.rewardResults as Vo.reward.RewardResult[]);
        this.emit(NotificationKey.BATTLE_RESULT_WIN, { fightType: FightType.WORLD_BOSS, exData: data } as IBattleResultWinData)

        this.emit(NotificationKey.EVENT_WORLD_BOSS_INFO_RESP, vo);

        //UIManager.ins().open(WorldBossUiKey.WORLD_BOSS_SINGLE_WIN);
    }

    /**打开技能详情 */
    public openSkillDetail(skillId: string): void {
        //UIManager.ins().open(WorldBossUiKey.WORLD_BOSS_SKILL_DETAIL);
        G.UIManager.open(UIHeroKey.SkillInfoWin, { skillId: skillId, heroId: 0 });
    }

    /**是否需要布阵 */
    public isNeedFormation(bossConfigId: number): boolean {
        //判断是否已经布阵
        const formationVo: FormationVo = FormationManager.ins().getTempFormationVoByType(ServerEnums.FightType.WORLD_BOSS, 0, bossConfigId.toString());
        if (!formationVo) {

            return true;
        }
        let isNeedFull = BattleConfigManager.getBattleSettingConfig(FightType.WORLD_BOSS)?.forceFullPosition;
        //是否阵容上够武将
        if (isNeedFull) {
            //判断阵容是否已满
            let notPos = FormationManager.ins().getVacantPosIds(formationVo.allPosData);
            if (notPos && notPos.length > 0) {
                return true;
            }
        } else if (formationVo.isEmptyFormation()) {
            //判断是否是空阵容
            return true;
        }
        return false;
    }

    /**
     * 根据伤害计算是否能领奖
     * @param id  boss配置ID
     * @param hpIdx  当前血条序号
     * @param damage 计算宝箱的伤害值
     * @returns 
     */
    public getBoxCfgByDamage(id: number, hpIdx: number, damage: number): table.worldboss.WorldBossProgressRewardConfig {
        // let cfgs = TableManager.getAllData(table.worldboss.WorldBossProgressRewardConfig);
        // cfgs = cfgs.filter((cfg) => {
        //     return cfg.bossConfigId == id;
        // });
        //根据血量区间的奖励

        let cfg = this.getWorldBossProgressRewardConfig(id, hpIdx);

        if (cfg && damage >= cfg.lifeBarHp) {
            return cfg;
        }


        return null;
    }

    /**利用递归根据一次伤害判断能领多少个宝箱 */
    public getBoxCfgByDamageRecursion(id: number, hpIdx: number, damage: number, boxList: table.worldboss.WorldBossProgressRewardConfig[]): table.worldboss.WorldBossProgressRewardConfig[] {

        let cfg = this.getBoxCfgByDamage(id, hpIdx, damage);
        if (cfg) {
            boxList.push(cfg);
            damage = damage - cfg.lifeBarHp;
            if (damage > 0) {
                this.getBoxCfgByDamageRecursion(id, hpIdx + 1, damage, boxList);
            }
        }
        return boxList;
    }



    /**宝箱配置 */
    getWorldBossProgressRewardConfig(id: number, hpBarIdx: number): table.worldboss.WorldBossProgressRewardConfig {
        let cfgs = TableManager.getAllData(table.worldboss.WorldBossProgressRewardConfig);
        let cfg = cfgs.find((cfg) => {
            return cfg.bossConfigId == id && cfg.lifeBarNo == hpBarIdx;
        });
        return cfg;
    }


    /**获取对应boss的全服击杀奖励配置 */
    public getServerRewardCfg(id: number) {
        let cfgs = TableManager.getAllData(table.worldboss.WorldBossServerProgressConfig);
        let filterCfg = cfgs.filter((cfg) => {
            return cfg.hasKillReward && cfg.bossConfigId == id;
        });
        return filterCfg;
    }

    /**获取对应boss的全服排名奖励配置 */
    public getRankRewardCfg(bossConfigId: number) {
        let cfgs = TableManager.getAllData(table.worldboss.WorldBossRankRewardConfig);
        let cfg = cfgs.filter((cfg) => {
            return cfg.bossConfigId == bossConfigId;
        });
        return cfg;
    }

    /**去领奖
     * ◆	BOSS击杀后，推送给不在战斗流程的玩家		
◆	点击前往按钮，传送至对应传送点		
    →传送阵未解锁：飘字该传送点未解锁		

     */

    public goGetServerReward(id: number): void {
        // GIns.floatingTextMgr.showTips("传送点未解锁");
        // let cfgs = TableManager.getAllData(table.worldboss.WorldBossConfig);
        // let cfg = cfgs.find((cfg) => {
        //     return cfg.id == id;
        // });
        // UIManager.ins().open(UICommonKey.TransferAnimWin, { curBuildingId: -1, transferBuildingId: cfg.buildId });

        //  this.openWorldBossMain(cfg.buildId);

    }

    /**获取全服奖励领奖状态 0=不可领 1=是可领取 2是已经领取*/
    public getServerRewardState(id: number): { state: number, rewards: any[] } {
        let cfgs = this.getServerRewardCfg(id);

        let vo = WorldBossManager.ins().getWorldBossInfo(id);

        if (!vo.playerWorldBossVo.bossHurtMap[id]) {
            return { state: 0, rewards: [] };
        }
        //BOSS服务器奖励领取MAP, boss配置ID-是否已领奖
        let drawServerReward = vo.playerWorldBossVo.drawServerRewardMap[id];

        let killTime = vo.killTime;
        let state = 0;
        let rewards = [];
        if (drawServerReward) {
            state = 2;
        }
        else if (killTime > 0) {
            //第几天击杀
            let killDay = Math.ceil((killTime - vo.startTime) / 86400 / 1000);
            for (let i = 0; i < cfgs.length; i++) {
                let cfg = cfgs[i];

                if (cfg.day == -1) {
                    //没有对应的天数就发最后一档也有奖励
                    if (killDay > cfgs[i - 1].day) {
                        state = 1;
                        return { state: state, rewards: cfg.rewards };
                    }

                }
                else if (cfg.day == killDay) {
                    //对应天数的
                    state = 1;
                    rewards = cfg.rewards;
                    break;

                }


            }
        }
        return { state: state, rewards: rewards };

    }

    //获取个人奖励状态 0=不可领 1=是可领取 2是已经领取
    public getRankRewardState(id: number): { state: number, rewards: any[] } {
        let cfgs = this.getRankRewardCfg(id);

        let rankVo = WorldBossManager.ins().getWorldBossRankVo(id);
        let vo = WorldBossManager.ins().getWorldBossInfo(id);

        //BOSS排名奖励领取MAP, boss配置ID-是否已领奖
        let drawRankReward = vo.playerWorldBossVo.drawRankRewardMap[id];

        let rank = rankVo.rank;
        let state = 0;
        let rewards = [];
        if (drawRankReward) {
            //是否已经领取了
            state = 2;
        }
        else if (vo.killTime > 0) {
            for (let i = 0; i < cfgs.length; i++) {
                let cfg = cfgs[i];
                if (rank >= cfg.minRank && rank <= cfg.maxRank) {
                    //排名奖励
                    state = 1;
                    rewards = cfg.settleRewards;

                }
            }
        }
        return { state: state, rewards: rewards };

    }

    /**获取boss开始世界 */
    public getWorldBossStartTimeByBuildId(buildId: number): number {
        let cfgs = this.getWorldBossAllCfg();
        let cfg = cfgs.find((cfg) => {
            return cfg.buildId == buildId;
        });
        let vo = WorldBossManager.ins().getWorldBossInfo(cfg?.id);

        return vo ? vo.startTime : 0;
    }

    /**boss是否被击杀 */
    public isBossKilled(buildId: number): boolean {
        let cfgs = this.getWorldBossAllCfg();
        let cfg = cfgs.find((cfg) => {
            return cfg.buildId == buildId;
        });
        let vo = WorldBossManager.ins().getWorldBossInfo(cfg?.id);
        return vo?.killTime > 0;
    }


    //战斗前记下历史最高伤害和历史最高排名
    public setMaxDamageAndRank(id: number): void {
        let vo = WorldBossManager.ins().getWorldBossInfo(id);
        WorldBossManager.ins().historyData[0] = vo.playerWorldBossVo.bossHurtMap[id] || 0;
        let rankVo = WorldBossManager.ins().getWorldBossRankVo(id);
        WorldBossManager.ins().historyData[1] = vo.playerWorldBossVo.bossMaxRankMap[id] || rankVo.rank || 0;
    }

    public getMaxDamageAndRank(): number[] {
        return WorldBossManager.ins().historyData;
    }

}
