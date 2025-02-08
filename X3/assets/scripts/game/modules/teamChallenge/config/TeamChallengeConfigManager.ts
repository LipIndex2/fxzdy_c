/** 组队副本  配表管理器 */

import { TableManager } from "../../../../core/table/TableManager";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { TeamChallengeModel } from "../model/TeamChallengeModel";
import { BattleConfigManager } from "../../../comm/battle/config/BattleConfigManager";
import  ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";

export class TeamChallengeConfigManager {
 
    /**倒计时配置 */
    static _channelMap:any;

    static init() {

    }

    /**获取某关数据 */
    static getConfigByInstancId(instanceId: number): table.teaminstance.TeamInstanceConfig | null {
        return TableManager.getDataById(table.teaminstance.TeamInstanceConfig, instanceId);
    }
    

    
    /**获取某一关的奖励 */
    static getInstanceRewards(id:number):{
        k: any;
        v: any;
    }[]{
        const config = this.getConfigByInstancId(id);
        return config.firstRewards;
    }

    /**获取当前关卡 forceMe为true时，不考虑组队情况*/
    static getCurInstanceConfig(forceMe:boolean = false):table.teaminstance.TeamInstanceConfig{
        const id = TeamChallengeModel.ins().getChallengeInstanceConfigId(forceMe);
        if(!id){
            return null;
        }
        return TableManager.getDataById(table.teaminstance.TeamInstanceConfig, id);
    }


    /**当前挑战章节具体情况 */
    static getCurChapterCfg(forceMe:boolean = false):table.teaminstance.TeamInstanceChapterConfig{
        const id = this.getCurInstanceConfig(forceMe)?.id;
        if(!id){
            return null;
        }
        let cfg = TableManager.getAllData(table.teaminstance.TeamInstanceChapterConfig)
        .find(v=> { return v.teamInstanceConfigIds.indexOf(id) != -1} );
        return cfg;
    }


    /**获取配置相关 */
    static getConstValue(key:string){
        return TableManager.getDataById(table.teaminstance.TeamInstanceConstantConfig, key)?.content;
    }

    /**获取第几关 */
    static getStageNum(id:number){
        const index = TableManager.getAllData(table.teaminstance.TeamInstanceConfig).findIndex(v=>{
            return v.id == id;
        })
        if(index == -1){
            return 0;
        }
        return index + 1;
    }

    /**通过关卡id获得章节配置*/
    static getChapterCfg(id){
        let cfg = TableManager.getAllData(table.teaminstance.TeamInstanceChapterConfig)
        .find(v=> { return v.teamInstanceConfigIds.indexOf(id) != -1} );
        return cfg;
    }


    /**通过章节id获取章节配置 */
    static getChapterCfgById(cid){
        return TableManager.getDataById(table.teaminstance.TeamInstanceChapterConfig, cid);
    }

    /**是不是章节第一关 */
    static isFirstInstance(id){
        //后续优化
        return id%100 == 1;
    }

    /**获取频道分享冷却时间 */
    static getChannelCD(cid:number){
        const t = this;
        if(!t._channelMap){
            const cdlist = this.getConstValue('TEAM_INSTANCE:SHARE_CHANNEL_TYPE_MAP') || '';
            t._channelMap = JSON.parse(cdlist);
        }
        return t._channelMap[ServerEnums.ChannelType[cid]];
    }

    /**获取解锁头像框对于物品列表 */
    static getFrameItems(){
        const t = this;
        const val = t.getConstValue('TEAM_INSTANCE:INTEGRAL_UNLOCK_ITEM_REWARD');
        const obj = StringUtils.toObject1Arr(val);
        let list:number[] = [];
        obj.forEach(v=>{
            list.push(v.v);
        })
        return list;
    }

    /**获取当前章节BOSS信息 */
    static getChapterBossInfo(){
        const chapterInfo = this.getCurInstanceConfig();
        if (!chapterInfo) {
            return null;
        }
        let battleConfig = TableManager.getDataById(table.battle.BattleConfig, chapterInfo.battleConfigId);
        let monsterResourceIds = battleConfig.monsterResourceIds as number[];
        if (ArrayUtils.isEmpty(monsterResourceIds)) {
            return null;
        }
        let monsterResourceId = monsterResourceIds[monsterResourceIds.length-2]; // 倒数第二项怪物配置
        if (!monsterResourceId) {
            return null;
        }
        let monsterRC = TableManager.getDataById(table.battle.MonsterResourceConfig, monsterResourceId);

        if (!monsterRC) {
            return null;
        }
        let monsterId = monsterRC.monsterId;
        if (!monsterId) {
            return null;
        }
        return TableManager.getDataById(table.monster.MonsterAttributeConfig, monsterId);
    }

    /**获取对应关卡的战力列表 */
    static getPowList(id:number):number[]{
        const config = this.getConfigByInstancId(id);
        return config?.powerList || [];
    }

    /**是否是玩法首个关卡 */
    static isFirstStage(id:number):boolean{
        const config = TableManager.getDataById(table.teaminstance.TeamInstanceConfig, id);
        return config && !config.preInstanceId;
    }

}