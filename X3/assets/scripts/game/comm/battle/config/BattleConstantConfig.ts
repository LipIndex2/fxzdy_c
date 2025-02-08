import { TableManager } from "../../../../core/table/TableManager";
import { BattleUtils } from "../BattleUtils";

enum BattleConstantKey {
    /**英雄移动速度 每秒 */
    HERO_MOVE_SPEED = "BATTLE:HERO_MOVE_SPEED",
    /**怪物移动速度 每秒 */
    MONSTER_MOVE_SPEED = "BATTLE:MONSTER_MOVE_SPEED",
    /**怪物随机范围 */
    MONSTER_REFRESH_RANGE = "BATTLE:MONSTER_REFRESH_RANGE",
    /**怪物仇恨最大半径 */
    MONSTER_HATE_MAX_RADIUS = "BATTLE:MONSTER_HATE_MAX_RADIUS",
    /**英雄仇恨最大半径 */
    HERO_HATE_MAX_RADIUS = "BATTLE:HERO_HATE_MAX_RADIUS",
    /**安全区回血速度 */
    SAFE_AREA_HEAL = "BATTLE:SAFE_AREA_HEAL",
    /**重生时距离大约多少需要重置英雄位置 */
    REBIRTH_GREATER_DISTANCE_RESET_POSITION = "BATTLE:REBIRTH_GREATER_DISTANCE_RESET_POSITION",


    /**攻击系数 */
    HERO_ATTACK_VALUE = "BATTLE:HERO_ATTACK_VALUE",
    /**基础格挡伤害 */
    HERO_BLOCK_VALUE = "BATTLE:HERO_BLOCK_VALUE",
    /**基础暴击伤害 */
    HERO_CRIT_VALUE = "BATTLE:HERO_CRIT_VALUE",
    /**基础闪避伤害系数 */
    HERO_MISS_VALUE = "BATTLE:HERO_MISS_VALUE",
}

export default class BattleConstantConfig {
    private static _isInit;

    /**队伍移动速度 每毫秒*/
    public static heroMoveSpeed = 0.2;
    /**怪物移动速度 每毫秒*/
    public static monsterMoveSpeed = 0.12;
    /**召唤物移动速度 每毫秒*/
    public static summonMoveSpeed = 0.2
    /**队伍移动到阵位的速度 每毫秒*/
    public static heroMoveFormationSpeed = 0.2;
    /**队伍移动到阵位的距离限制*/
    public static heroMoveFormationDis = 300;
    /**怪物随机刷新范围 */
    public static monsterRefreshRange = { w: 200, h: 200, a: 0 };

    /**怪物仇恨最大距离 */
    public static monsterHateMaxRadius = 600;

    /**英雄仇恨最大距离 */
    public static heroHateMaxRadius = 600;

    /**英雄采矿仇恨最大距离 */
    public static heroCollectHateMaxRadius = 200;

    /**安全区治愈万分比 */
    public static safeAreaHeal = 1000;

    /**英雄复活时是否传送判定半径  像素 */
    public static greaterDistResetPos = 1000;

    /**复活等待时间  毫秒 */
    public static rebirthWaitTime = 20000;

    /** 随机的基础值*/
    public static getRandBase: number = 10000;

    /****随机移动最小时间 */
    public static monsterRandomMoveMinTime: number = 0;
    /****随机移动最大时间 */
    public static monsterRandomMoveMaxTime: number = 0;
    /**怪物随机移动范围 */
    public static monsterRandomMoveRange = { w: 200, h: 200, a: 0 };


    /****伤害类型：普攻 */
    public static Normal: number = 0;
    /****伤害类型：闪避 */
    public static Miss: number = 1;
    /****伤害类型：暴击 */
    public static Crit: number = 2;
    /****伤害类型：格挡 */
    public static Block: number = 3;
    /****伤害类型：治疗 */
    public static Heal: number = 4;
    /****伤害类型：反伤 */
    public static CounterAttack: number = 5;
    /****伤害类型：特殊扣血，不触发其他 */
    public static SpecialHurt: number = 6;
    /****伤害类型：守护的均摊伤害 */
    public static Guard: number = 7;
    /****伤害类型：吸血 */
    public static LifeSteal: number = 8;
    /****伤害类型：队长技能补血 */
    public static LeaderSkillHeal: number = 49;
    /****伤害类型：队长技能 */
    public static LeaderSkillHurt: number = 50;
    /****伤害类型：安全区治疗 */
    public static SafeAreaHeal: number = 51;
    /****强制普攻伤害类型 */
    public static ForceNormal: number = 52;
    /****强制技能伤害类型 */
    public static ForceSkill: number = 53;
    /****秒杀 */
    public static Kill: number = 99;


    /****伤害子类型：攻击时的反伤 */
    public static SubType_AtkByHurt: number = 1;

    /***攻击系数 */
    public static baseAttackValue: number;
    /***基础格挡伤害 */
    public static baseBlockValue: number;
    /***基础暴击伤害 */
    public static baseCritValue: number;
    /***基础闪避伤害系数 */
    public static baseMissValue: number;

    /***暴击第3档飘字的系数 */
    public static crit3TextValue: number;
    /***暴击第2档飘字的系数 */
    public static crit2TextValue: number;

    /***近战距离判断值 */
    public static distanceValue: number;

    public static battleModelScale: number = 1

    /***四叉树最大的检索范围 */
    public static checkRangeWidth: number;
    /***四叉树最大的检索范围 */
    public static checkRangeHeight: number;

    /***采矿喊话 */
    public static talkKuangData: { talkProbability: number, str: string[], pro: number[] }
    /***采气喊话 */
    public static talkQiData: { talkProbability: number, str: string[], pro: number[] }

    /***异常分组 */
    public static abnormalTypeMap: { [id: string]: string[] } = {}
    /***单位的销毁时间 */
    public static disposeMaxTime: number = 3000

    /***单位碰撞宽度 */
    public static unitCollisionWidth: number = 60;
    /***单位碰撞高度 */
    public static unitCollisionHeight: number = 60;
    /***脱离仇恨范围判断的时间间隔 */
    public static heroHateMaxRadiusTime: number = 200;
    /***属性字典,通过id获取字符串名字 */
    public static attrNameMap: { [id: number]: table.battle.AttributeConfig } = {}

    /***极限值额外系数(万分比),反作弊使用 */
    public static extremeRate: number;
    /***不处理极限伤害严重的技能所属 */
    public static notSkillBelongIdExtremeRate: string[] = [];

    /***助攻的时间 */
    public static assistKillTime: number = 1000

    static init() {
        if (this._isInit) {
            return;
        }

        this.rebirthWaitTime = Number(TableManager.getDataById(table.map.MapConstantConfig, "MAP:REBIRTH_TEAM_WAIT_TIME").content) * 1000; //这参数在 table.map.MapConstantConfig (秒)


        let tableName = table.battle.BattleConstantConfig;
        this.distanceValue = Number(TableManager.getDataById(tableName, "BATTLE:DISTANCE").content);
        let monsterRandomMoveTimeParm = TableManager.getDataById(tableName, "BATTLE:MONSTER_RANDOM_MOVE_TIME").content.split(";");
        this.monsterRandomMoveMinTime = +monsterRandomMoveTimeParm[0];
        this.monsterRandomMoveMaxTime = +monsterRandomMoveTimeParm[1];

        let checkRangeHeightParm = TableManager.getDataById(tableName, "BATTLE:CHECK_RANGE").content.split(",");
        this.checkRangeWidth = +checkRangeHeightParm[0];
        this.checkRangeHeight = +checkRangeHeightParm[1];


        this.crit3TextValue = Number(TableManager.getDataById(tableName, "BATTLE:CRIT_TEXT_3").content) / 10000;
        this.crit2TextValue = Number(TableManager.getDataById(tableName, "BATTLE:CRIT_TEXT_3").content) / 10000;
        this.heroMoveSpeed = Number(TableManager.getDataById(tableName, BattleConstantKey.HERO_MOVE_SPEED).content) / 1000;
        this.heroMoveFormationSpeed = Number(TableManager.getDataById(tableName, "BATTLE:HERO_MOVE_FORMATION_SPEED").content) / 1000;
        this.heroMoveFormationDis = Number(TableManager.getDataById(tableName, "BATTLE:HERO_MOVE_FORMATION_DIS").content);
        this.heroCollectHateMaxRadius = Number(TableManager.getDataById(tableName, "BATTLE:HERO_HATE_COLLECT_MAX_RADIUS").content);
        this.monsterMoveSpeed = Number(TableManager.getDataById(tableName, BattleConstantKey.MONSTER_MOVE_SPEED).content) / 1000;
        this.summonMoveSpeed = Number(TableManager.getDataById(tableName, "BATTLE:SUMMON_MOVE_SPEED").content) / 1000;
        this.monsterRefreshRange = JSON.parse(TableManager.getDataById(tableName, BattleConstantKey.MONSTER_REFRESH_RANGE).content);
        this.monsterRandomMoveRange = JSON.parse(TableManager.getDataById(tableName, "BATTLE:MONSTER_RANDOM_MOVE_RANGE").content);
        this.monsterHateMaxRadius = Number(TableManager.getDataById(tableName, BattleConstantKey.MONSTER_HATE_MAX_RADIUS).content);
        this.heroHateMaxRadius = Number(TableManager.getDataById(tableName, BattleConstantKey.HERO_HATE_MAX_RADIUS).content);
        this.safeAreaHeal = Number(TableManager.getDataById(tableName, BattleConstantKey.SAFE_AREA_HEAL).content);
        this.greaterDistResetPos = Number(TableManager.getDataById(tableName, BattleConstantKey.REBIRTH_GREATER_DISTANCE_RESET_POSITION).content);

        this.baseAttackValue = Number(TableManager.getDataById(tableName, BattleConstantKey.HERO_ATTACK_VALUE).content) / BattleConstantConfig.getRandBase;
        this.baseBlockValue = Number(TableManager.getDataById(tableName, BattleConstantKey.HERO_BLOCK_VALUE).content);
        this.baseCritValue = Number(TableManager.getDataById(tableName, BattleConstantKey.HERO_CRIT_VALUE).content);
        this.baseMissValue = Number(TableManager.getDataById(tableName, BattleConstantKey.HERO_MISS_VALUE).content);

        this.extremeRate = Number(TableManager.getDataById(tableName, "BATTLE:EXTREME_RATE").content);
        this.notSkillBelongIdExtremeRate = TableManager.getDataById(tableName, "BATTLE:WHITELIST_SKILL").content.split(",") || [];

        this.assistKillTime = Number(TableManager.getDataById(tableName, "BATTLE:assist_Kill_Time").content);

        this.heroHateMaxRadiusTime = BattleUtils.getFrameByTime(Number(TableManager.getDataById(tableName, "BATTLE:HERO_HATE_MAX_RADIUS_TIME").content));

        this.talkKuangData = JSON.parse(TableManager.getDataById(tableName, "BATTLE:TALK_KUANG").content);
        this.talkQiData = JSON.parse(TableManager.getDataById(tableName, "BATTLE:TALK_QI").content);

        let unitCollisionParm = TableManager.getDataById(tableName, "BATTLE:UNIT_COLLISION").content.split(",");
        this.unitCollisionWidth = +unitCollisionParm[0]
        this.unitCollisionHeight = + unitCollisionParm[1]

        for (let i = 1; i < 99999; i++) {
            let abnormalDatas = TableManager.getDataById(tableName, "BATTLE:Abnormal_" + i)?.content
            if (abnormalDatas) {
                this.abnormalTypeMap[i] = abnormalDatas.split(",")
            } else break
        }

        let cfgs: table.battle.AttributeConfig[] = TableManager.getAllData(table.battle.AttributeConfig)
        this.attrNameMap = {}
        for (let i = 0; i < cfgs.length; i++) {
            this.attrNameMap[cfgs[i].tid] = cfgs[i]
        }
    }

    /***判断分组是否存在对应的异常类型 */
    static checkAbnormalType(group: string, type: string): boolean {
        group += "";
        if (this.abnormalTypeMap[group] && this.abnormalTypeMap[group].indexOf(type) != -1) {
            return true;
        }
        return false;
    }

    static getAttrCfgById(id: number): table.battle.AttributeConfig {
        return this.attrNameMap[id]
    }
}