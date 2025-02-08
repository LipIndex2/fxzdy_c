import { TableManager } from "../../../core/table/TableManager";
import { StringUtils } from "../../../core/utils/StringUtils";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import { NoOwnerItem } from "../backpack/vo/NoOwnerItem";
import { SeasonManager } from "./SeasonManager";

export class SeasonConfigManager {
  /**倒计时配置 */
  static _channelMap: any;

  static init() {}

  // 我的排名获取奖励
  static getRankRewardConfigByRankNum(
    myRankNum: number, aid:number
  ): table.seasonactivity.SeasonRushRank.SeasonRushRankRewardConfig | null {
    let rankConfigs = this.getRankRewardConfigs(aid);
    for (let i = 0; i < rankConfigs.length; i++) {
        let rankConfig = rankConfigs[i];
        if (rankConfig.minRank >= myRankNum && myRankNum >= rankConfig.maxRank) {
            return rankConfig;
        }
    }
    return null;
  }

  static getTopRewards(aid:number){
    let rankConfigs = this.getRankRewardConfigs(aid);
    return rankConfigs[0]?.rewards;
  }

  /**获取对应排行榜信息 */
  static getRankConfig(aid:number):table.seasonactivity.SeasonRushRank.SeasonRushRankConfig{
    const cfgs = TableManager.getAllData(table.seasonactivity.SeasonRushRank.SeasonRushRankConfig);
    for(const cfg of cfgs){
      if(cfg.subActivityId == aid){
        return cfg;
      }
    }
    return null;
  }


  /**获取对应的排行奖励 */
  static _rankRewardsMap:Map<number, table.seasonactivity.SeasonRushRank.SeasonRushRankRewardConfig[]>;
  static getRankRewardConfigs(actid:number){
    if(!this._rankRewardsMap){
      this._rankRewardsMap = TableManager.getAllData(table.seasonactivity.SeasonRushRank.SeasonRushRankRewardConfig)
      .toDataStream()
      .groupBy(it => it.rushRankId)
    }
    return this._rankRewardsMap.get(actid);
  }

  static getSubConfigById(id:number){
    return TableManager.getDataById(table.seasonactivity.Constant.SubSeasonActivityConfig, id);
  }

  /**获取对应的报名奖励 */
  static _signUpMap:Map<number, table.seasonactivity.SignUp.SignUpConfig[]>;
  static getSignReward(actid:number):table.seasonactivity.SignUp.SignUpConfig[]{
    if(!this._signUpMap){
      this._signUpMap = TableManager.getAllData(table.seasonactivity.SignUp.SignUpConfig)
      .toDataStream()
      .groupBy(it => it.subActivityId)
    }

    return this._signUpMap.get(actid);
  }


  /**获取常量配置相关 */
  static getConstValue(key:string){
        return TableManager.getDataById(table.seasonactivity.Constant.SeasonActivityConstantConfig, key)?.content || '';
  }

  /**根据活动id获取对应的任务列表 */
  static _mapTask: Map<number, table.seasonactivity.Task.SeasonActivityTaskConfig[]>;
  static getTasks(actid:number){
    if(!this._mapTask){
      this._mapTask = new Map();
      this._mapTask = TableManager.getAllData(table.seasonactivity.Task.SeasonActivityTaskConfig)
      .toDataStream()
      .groupBy(it => it.subActivityId)
    }
    return this._mapTask.get(actid);
  }

  /**获取boss奖励列表 */
  static _bossRewards:{hp:number, rewards:Array<{k:any,v:any}>,id:number}[];
  static getBossRewards():{hp:number, rewards:Array<{k:any,v:any}>,id:number}[]{
    if(!this._bossRewards){
      this._bossRewards = [];
      const rewards = TableManager.getAllData(table.seasonactivity.SeasonBoss.SeasonBossProgressRewardConfig);
      let hp = 0;
      for(let i = 0; i<rewards.length; i++){
        const reward = rewards[i];
        hp += reward.lifeBarHp;
        if(reward.rewards){
          this._bossRewards.push({hp:hp, rewards:reward.rewards , id:reward.id});
        }
      }
      this._bossRewards.sort((a,b)=>{
        return a.id - b.id;
      })
    }

    return this._bossRewards;
  }

  static getReward(id:number):{hp:number, rewards:Array<{k:any,v:any}>,id:number}{
    const rewards = this.getBossRewards();
    for(const reward of rewards){
      if(reward.id == id){
        return reward;
      }
    }
    return null;
  }


  /**获取秘境关卡信息 */
  static getSecretConfig(id:number){
    return TableManager.getDataById(table.seasonactivity.SeasonSecret.SeasonSecretConfig, id);
  }

  /**获取对应活动id关卡信息 */
  static _mapSecrets;
  static getSecretCfgs(actid:number):table.seasonactivity.SeasonSecret.SeasonSecretConfig[]{
    if(!this._mapSecrets){
      this._mapSecrets = new Map();
      this._mapSecrets = TableManager.getAllData(table.seasonactivity.SeasonSecret.SeasonSecretConfig)
      .toDataStream()
      .groupBy(it => it.subActivityId)
    }
    return this._mapSecrets.get(actid);
  }

  /**获取赛季boss配置 */
  static getBossCfgById(id){
    return TableManager.getDataById(table.seasonactivity.SeasonBoss.SeasonBossConfig, id);
  }

  /**获取菜单入口配置 */
  static getMeunEnterInfo(id:string){
    return TableManager.getDataById(table.seasonactivity.Constant.SeasonClientEnterConfig, id);
  }

  static getCostItem() {
    const itemstr = this.getConstValue('SEASON_ACTIVITY:SECRET_BUY_CHALLENGE_COSTS');
    const items = StringUtils.toObject1Arr(itemstr)
    return NoOwnerItem.create(items[0].k, items[0].v);
  }

  static getSeasonBossProgress(){
    return TableManager.getAllData(table.seasonactivity.SeasonBoss.SeasonBossProgressRewardConfig);
  }

  /**获取赛季boss血条配置 */
  static getHpBars():number[]{
    const id = SeasonManager.ins().getBossActId();
    const subCfg = this.getSubConfigById(id);
    const cfg = TableManager.getAllData(table.seasonactivity.SeasonBoss.SeasonBossConfig).find((v)=>{
          return v.subActivityId == subCfg.id;
    });
    if(cfg){
      let hps = [];
      const rewards = this.getBossHps(cfg.id);
      if(rewards){
        for(let i = 0; i<rewards.length; i++){
          const reward = rewards[i];
          hps.push(reward.lifeBarHp);
        }
        return hps;
      }

    }
    return [];
  }

    /**根据活动id获取对应的任务列表 */
  static _mapBossHp: Map<number, table.seasonactivity.SeasonBoss.SeasonBossProgressRewardConfig[]>;
  static getBossHps(bossConfigId:number){
      if(!this._mapBossHp){
        this._mapBossHp = new Map();
        this._mapBossHp = TableManager.getAllData(table.seasonactivity.SeasonBoss.SeasonBossProgressRewardConfig)
        .toDataStream()
        .groupBy(it => it.bossConfigId)
      }
      return this._mapBossHp.get(bossConfigId);
  }

  /**根据活动id获取排行榜积分描述 */
  static getValueStr(id:number){
    const cfg = this.getSubConfigById(id);
    const type = cfg.type;
    if(ServerEnums.SubSeasonActivityType[ServerEnums.SubSeasonActivityType.SEASON_BOSS] == type){
      return '伤害';
    }
    return '积分';
  }

  static getRankTitle(id:number){
    const cfg = this.getSubConfigById(id);
    const type = cfg.type;
    if(ServerEnums.SubSeasonActivityType[ServerEnums.SubSeasonActivityType.SEASON_BOSS] == type){
      return '伤害排行';
    }
    return '积分排行';
  }

  static getRewardId(progressRewardId){
    const rewards = this.getBossRewards();
    let id = -1;
    for(let i = 0; i<rewards.length; i++){
      const v = rewards[i];
      if(v.id <= progressRewardId ){
        id =  v.id;
      }
    }
    return id;
  }

}
