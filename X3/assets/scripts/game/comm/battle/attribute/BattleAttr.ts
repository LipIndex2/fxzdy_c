import { SkillData } from "../skill/SkillData";
import { AttrEnum } from "./AttrEnum";
import BattleConstantConfig from "../config/BattleConstantConfig";
import { BattleUnit } from "../unit/battle/BattleUnit";
import { SkillBuff } from "../skill/SkillBuff";
import { AbnormalType, LeaderSkillTriggerType, PassivitySkillType, SkillSubType, SkillType } from "../skill/SkillEnum";
import { SkillBehavior } from "../skill/SkillBehavior";
import { AbnormalStatus } from "./AbnormalStatus";
import { PassivitySkillData } from "../skill/PassivitySkillData";
import { PoolManager } from "../../../../core/pool/PoolManager";
import { IBattleUnitData } from "../../../modules/battle/vo/IBattleUnitData";
import { PassivitySkillUtils } from "../skill/PassivitySkillUtils";
import { ITarget } from "../skill/ITarget";
import { BattleUtils } from "../BattleUtils";
import { TableManager } from "../../../../core/table/TableManager";
import { FightSkillInfo } from "../skill/FightSkillInfo";
import { MathUtils } from "../../../../core/utils/MathUtils";
import { SkillFactory } from "../skill/SkillFactory";
import G from "../../../../core/comm/G";
import { SortUtils } from "../../../../core/utils/SortUtils";
import { BattleDebugManager } from "../BattleDebugManager";
import { SkillUtils } from "../skill/SkillUtils";
import { ActorState, WorldUnitTeam } from "../enum/BattleEnum";
import { BaseSkillData } from "../skill/BaseSkillData";
import { HeroUnit } from "../unit/battle/HeroUnit";
import { DamageVo } from "../DamageVo";
import { BattleManager } from "../BattleManager";

export class BattleAttr {

    /**创建属性 */
    static create(owner: BattleUnit) {
        let attr = new BattleAttr(owner);
        return attr;
    }
    public lv: number = 0;
    /**生命值 */
    protected _hp;
    /***是否死亡 */
    protected _isDeath: boolean = false;

    public name: string;

    protected _cfg: table.hero.HeroConfig | table.monster.MonsterAttributeConfig | table.pet.PetConfig;
    protected _searchRange;

    protected _rebirthTime: number;
    protected _rebirthMaxTime: number;
    /***复活时间，毫秒 */
    public rebirthMaxTime: number = 0

    /***原技能列表，通常是英雄初始化时的技能 */
    public originalSkillIds: string[] = [];
    /**主动技能 */
    protected _activeSkills: SkillData[] = [];
    /**扩展主动技能 */
    public exActiveSkills: { [skillId: string]: SkillData[] } = {};
    /**被动技能 */
    protected _passiveSkills: PassivitySkillData[] = [];
    /***关联的切换技能，如重骑选择技能后需要移动时触发的另外1个技能 */
    protected _horseSkillMap: { [skillId: string]: SkillData } = {}
    /***属性值 */
    protected _attrs: { [key: number]: number; };
    public get attrs(): { [key: number]: number; } {
        return this._attrs;
    }
    /***一级属性调整值 */
    protected _attrsMod: { [key: number]: number };
    /***二级属性调整值 */
    protected _secondAttrsMod: { [key: number]: number };
    // protected _buffAttrs: { [key: string]: number };
    protected _buffs: SkillBuff[];

    private _isCanRebirth = false;
    public setCanRebirth(value) {
        this._isCanRebirth = value;
    }
    protected _owner: BattleUnit;

    /***技能释放顺序，存在的话忽略CD，按这个技能顺序开始循环 */
    protected skillSortList: number[];

    /**待执行的行为队列 (主动)*/
    protected _waitActiveBehavoirs: SkillBehavior[] = [];

    /**异常状态 */
    protected _abnormalStatus: AbnormalStatus = new AbnormalStatus();
    /***buff的异常列表，存的是BUFF效果和该效果的次数 */
    protected buffStatue: { [type: string]: number } = {}
    protected buffMap: { [id: string]: SkillBuff } = {};

    /***攻速系数，默认是1000 */
    public atkTimeSpeed: number = 1000;
    /***初始移动速度 */
    public initMoveSpeed: number

    /**常规的最大血量 */
    public normalMaxHp: number;
    /**额外增加的最大血量 */
    protected _maxHp: number = 0;
    /***体型 */
    public size: number = 50;

    /***皮肤ID */
    public skinId: number = 0

    /***被动技能标记，用于行为为主动技能增强的标记， key是标记，值是被动的行为参数 */
    protected passSkillFlagMap: { [flag: string]: any }
    /***被动技能标记，用于行为为主动技能增强的标记， key是标记，值是被动的行为 */
    protected passSkillFlagSkillMap: { [flag: string]: SkillBehavior }

    /***极限伤害 */
    public maxHurt: number = -1;

    public constructor (owner: BattleUnit) {
        this._owner = owner
    }

    /**属性拥有者 */
    get owner() {
        return this._owner;
    }

    set owner(owner) {
        this._owner = owner;
    }

    /***获取没有普攻的主动技能列表 */
    get noNormalActiveSkills(): SkillData[] {
        let arr: SkillData[] = []
        for (let i = 0; i < this._activeSkills.length; i++) {
            if (this._activeSkills[i].skillIndex != 0)
                arr.push(this._activeSkills[i])
        }
        return arr
    }

    /***当前的被动技能列表 */
    get passSkills(): PassivitySkillData[] {
        return this._passiveSkills;
    }

    /**
     * 根据指定的组别获取被动技能数据。
     * @param group - 技能组别的字符串标识。
     * @returns 返回与指定组别匹配的被动技能数据。
     */
    getPassSkillByGroup(group: string): PassivitySkillData {
        for (let j = 0; j < this.passSkills.length; j++) {
            if (this.passSkills[j].cfg.group == group) {
                return this.passSkills[j]
            }
        }
        return null;
    }

    /**
     * 根据ID获取被动技能数据。
     * @param id 被动技能的唯一标识符。
     * @returns 如果找到匹配的被动技能，则返回该技能的数据；否则返回null。
     */
    getPassSkillById(id: string): PassivitySkillData {
        for (let j = 0; j < this.passSkills.length; j++) {
            if (this.passSkills[j].cfg.id == id) {
                return this.passSkills[j]
            }
        }
        return null;
    }

    initSkill(skills: string[]): void {
        // skills[skills.indexOf("4340_s306")] = "4340_s304"
        // skills.splice(skills.indexOf("2230_p106"), 1)
        this.originalSkillIds = skills;
        for (let i = 0; i < skills.length; i++) {
            let skillCfg = TableManager.getDataById(table.battle.SkillConfig, skills[i])
            if (!skillCfg) {
                G.Logger.error(`技能表找不到${skills[i]}`);
                continue
            }
            this.initSkillHandler(skillCfg, false)
        }
        //排序技能
        SortUtils.sortBy2(this._activeSkills, ["skillIndex"], [true], false)
        if (BattleDebugManager.ins().isDebug) {
            // this.addSkill("SCP_s50601")
            // if (this._cfg.id == 5330)
            // this.addSkill("Test_003")
            // this.addOtherPassiveSkill("Test_003")
        }
        this.initTeamSkills()
    }

    protected initTeamSkills(): void {
        let teamSkills = this.owner.battleLogic.getTeamSkillByTeamId(this.owner.teamId);
        if (teamSkills) {
            for (let i = 0; i < teamSkills.length; i++) {
                let skillCfg = TableManager.getDataById(table.battle.SkillConfig, teamSkills[i])
                if (skillCfg) {
                    this.initSkillHandler(skillCfg, false)
                }
                else {
                    this.addOtherPassiveSkill(teamSkills[i]);
                }
            }
        }
    }

    /***添加技能 */
    public addSkill(skillId: string): void {
        let cfg = TableManager.getDataById(table.battle.SkillConfig, skillId)
        if (!cfg)
            return

        if ((cfg.type != SkillType.PASSIVE_SKILL && cfg.type != SkillType.ATTR_SKILL)) {
            this.initSkillHandler(cfg, false)
        }
        else if (cfg.skills?.length > 0) {
            for (let i = 0; i < cfg.skills.length; i++)
                this.addOtherPassiveSkill(cfg.skills[i])
        }
    }

    protected initSkillHandler(skillCfg: table.battle.SkillConfig, isMonster: boolean): SkillData {
        if (BattleDebugManager.ins().isTestBattle) {
            if (BattleDebugManager.ins().checkSkillIgnore(this.owner.teamId, this.owner.formationPosition, skillCfg.belongType)) {
                return;
            }
        }

        let skill: SkillData = SkillFactory.create(skillCfg.belongType);
        skill.level = skillCfg.level;
        skill.init(this.owner, skillCfg.id)

        if (!isMonster) {
            this.initSkillIndex(skill)
        }

        if (skill.cfg.skills) {
            if (skill.cfg.type == SkillType.ACTIVE_SKILL || skill.cfg.type == SkillType.Guiding_Skills || skill.cfg.type == SkillType.ATTACK) {
                this.addActiveSkill(skill)
            }

            for (let j = 0; j < skill.cfg.skills.length; j++) {
                this.addPassiveSkill(skill.cfg.skills[j], skill.fightSkillInfo)
            }

        } else if (skill.cfg.type != SkillType.ATTR_SKILL && skill.cfg.type != SkillType.PASSIVE_SKILL) {
            this.addActiveSkill(skill)
        }
        return skill
    }

    protected initSkillIndex(skill: SkillData): void {
        for (let j = 0; j < 6; j++) {
            //计算技能槽位
            if (this._cfg["skill" + j] && this._cfg["skill" + j] == skill.cfg.belongType) {
                if (skill.cfg.type == SkillType.ATTACK) {
                    skill.skillIndex = 0;//普攻必定为0
                }
                else
                    skill.skillIndex = j;
                break;
            }
        }
    }

    /***更新技能 */
    updateSkills(skills: string[]): void {
        //当前的主动技能列表
        let nowActiveSkillList: string[] = []
        for (let i = 0; i < this._activeSkills.length; i++) {
            nowActiveSkillList.push(this._activeSkills[i].skillId)
            if (skills.indexOf(this._activeSkills[i].skillId) == -1) {
                //移除的主动技能
                this._activeSkills[i].removeAllBehaviorBuff();
                this._activeSkills.splice(i, 1);
                i--
            }
        }

        //移除被动技能
        for (let i = 0; i < this._passiveSkills.length; i++) {
            //其他技能不清除，因为这个技能是客户端添加的，列表不一定有
            if (!this._passiveSkills[i].isOhterSkill && skills.indexOf(this._passiveSkills[i].skillId) == -1) {
                this._passiveSkills[i].removeAllBehaviorBuff();
                this._passiveSkills.splice(i, 1);
                i--
            }
        }

        for (let i = 0; i < skills.length; i++) {
            let skillCfg = TableManager.getDataById(table.battle.SkillConfig, skills[i])
            if (!skillCfg) {
                G.Logger.error(`技能表找不到${skills[i]}`);
                continue
            }

            if (skillCfg.type == SkillType.ATTR_SKILL) {
                if (nowActiveSkillList.indexOf(skills[i]) == -1) {
                    //新增的主动技能
                    this.initSkillHandler(skillCfg, false)
                }
            }
            else if (skillCfg.type == SkillType.PASSIVE_SKILL) {
                //被动技能可以直接添加，因为会按分组替换
                this.initSkillHandler(skillCfg, false)
            }
        }
        // this.removeOtherPassiveSkillsByFlag(OtherPassivitySkillFlag.Camp)
    }

    /***添加主动技能 */
    addActiveSkill(skill: SkillData): void {
        this._activeSkills.push(skill);
        if (skill.cfg.horseSkill) {
            //有骑乘技能的话
            let horseSkill: SkillData = SkillFactory.create(skill.cfg.belongType);
            horseSkill.init(this.owner, skill.cfg.horseSkill);
            horseSkill.skillIndex = skill.skillIndex;
            this._horseSkillMap[skill.skillId] = horseSkill;
        }

        //主动技能扩展
        if (skill.cfg.activeSkill) {
            for (let i = 0; i < skill.cfg.activeSkill.length; i++) {
                let exSkillCfg = TableManager.getDataById(table.battle.SkillConfig, skill.cfg.activeSkill[i])
                let exSkillData = SkillFactory.create(exSkillCfg.belongType);
                exSkillData.init(this.owner, exSkillCfg.id)
                exSkillData.skillIndex = skill.skillIndex;
                exSkillData.ownerSkill = skill;

                if (!this.exActiveSkills[skill.skillId])
                    this.exActiveSkills[skill.skillId] = [];
                this.exActiveSkills[skill.skillId].push(exSkillData)
            }
        }
    }

    /***添加被动技能 */
    addPassiveSkill(skillId: string, fightSkillInfo: FightSkillInfo, isOhterSkill: boolean = false): void {
        let passSkillInfo = PoolManager.getItem(PassivitySkillData);
        passSkillInfo.init(this._owner, skillId)
        passSkillInfo.fightSkillInfo = fightSkillInfo;
        passSkillInfo.isOhterSkill = isOhterSkill
        if (fightSkillInfo) {
            passSkillInfo.ownerSkillData = fightSkillInfo.skill;
            passSkillInfo.skillIndex = fightSkillInfo.skill?.skillIndex;
            passSkillInfo.level = fightSkillInfo.skill?.level;
        }

        for (let i = 0; i < this._passiveSkills.length; i++) {
            if (passSkillInfo.cfg.group && this._passiveSkills[i].cfg.group == passSkillInfo.cfg.group) {
                this._passiveSkills[i].removeAllBehaviorBuff();
                this._passiveSkills.splice(i, 1)
                break;
            }
        }
        this._passiveSkills.push(passSkillInfo);
        if (passSkillInfo.cfg.conditionNow == 1) {
            PassivitySkillUtils.checkPassSkillConBySkillId(skillId, this.owner, this.owner);
        }
        else if (passSkillInfo.cfg.condition == PassivitySkillType.ConType_1)
            PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_1, this.owner, this.owner);
    }

    /***添加其他额外的动态变动被动技能，这部分的被动会更换，所以更换前要清除 */
    addOtherPassiveSkill(skillId: string | number): void {
        let cfg = TableManager.getDataById(table.battle.PassivitySkillConfig, skillId)
        if (!cfg) {
            console.error(`技能表找不到${skillId}`);
            return
        }
        if (cfg.belongType)
            this.addPassiveSkill(skillId + "", SkillFactory.create(cfg.belongType).fightSkillInfo, true)
        else
            this.addPassiveSkill(skillId + "", SkillFactory.create(skillId + "").fightSkillInfo, true)
    }

    /***添加其他额外的动态变动被动技能，而且使用1个固定的fightskill */
    addOtherPassiveSkillByFightSkill(skillId: string | number, fightSkillInfo: FightSkillInfo): void {
        this.addPassiveSkill(skillId + "", fightSkillInfo, true)
    }

    removePassiveSkill(skillId: string): void {
        for (let i = 0; i < this._passiveSkills.length; i++) {
            if (this._passiveSkills[i].skillId == skillId) {
                this._passiveSkills[i].removeAllBehaviorBuff();
                this._passiveSkills.splice(i, 1)
                break
            }
        }
    }

    /***添加被动的行为标记 */
    addPassiveSkillFlag(flag: string, param: SkillBehavior): void {
        if (!this.passSkillFlagMap)
            this.passSkillFlagMap = {};

        if (!this.passSkillFlagSkillMap)
            this.passSkillFlagSkillMap = {};

        this.passSkillFlagMap[flag] = param.cfg.param || true
        this.passSkillFlagSkillMap[flag] = param
    }

    public removePassiveSkillFlag(flag: string): void {
        if (this.passSkillFlagMap) {
            delete this.passSkillFlagMap[flag]
        }

        if (this.passSkillFlagSkillMap) {
            delete this.passSkillFlagSkillMap[flag]
        }
    }

    /***获取被动的行为标记 */
    getPassiveSkillFlag(flag: string): any {
        if (!this.passSkillFlagMap)
            return null

        return this.passSkillFlagMap[flag];
    }

    /***获取被动的行为标记 */
    getPassiveSkillFlagSkillBehavior(flag: string): SkillBehavior {
        if (!this.passSkillFlagSkillMap)
            return null

        return this.passSkillFlagSkillMap[flag];
    }

    /***通过普攻获取冲锋技能 */
    getHorseSkill(skillId: string): SkillData {
        return this._horseSkillMap[skillId]
    }

    init() {
        this._attrs = {};
        // this._buffAttrs = {}
        this._buffs = [];

        this._searchRange = this._cfg.searchRange;
        this._isCanRebirth = true;
        this._rebirthMaxTime = BattleUtils.getFrameByTime(BattleConstantConfig.rebirthWaitTime);
        this.size = this._cfg.size || 50;
    }

    initByHero(cfg: table.hero.HeroConfig, data: IBattleUnitData) {
        this._cfg = cfg;
        this.skinId = data.skinId;
        this.atkTimeSpeed = cfg.atkSpeed || 1000;
        this.init();

        this.name = cfg.name;
        this.initHeroAttr(data);
        this.initSkill(data.skillIds);
    }

    /**初始化英雄属性 */
    initHeroAttr(data: IBattleUnitData) {
        this.lv = data.level;
        this._attrs = {}
        for (const key in data.attrs) {
            this._attrs[key] = data.attrs[key];
        }

        if (!this._attrs[AttrEnum.DEF]) this._attrs[AttrEnum.DEF] = 0; //后端数据没有防御 临时处理

        // console.log(this._attrs);

        if (!data.surplusHp || data.surplusHp < 0)
            this._hp = this._attrs[AttrEnum.HP];
        else
            this._hp = data.surplusHp;
        this.initMoveSpeed = BattleConstantConfig.heroMoveSpeed;
        this.initMaxHp();
        if (this._isDeath && this.owner instanceof HeroUnit) {
            this.owner.showUnit()?.hideRebirthBar()
        }
        this._isDeath = false;
        this.initMaxHurt();
    }

    /***初始化极限伤害 */
    protected initMaxHurt(): void {
        //理论最高值 == 英雄攻击力*暴击伤害系数*【英雄技能最高伤害系数（按满级、满星计算 eg. 路西法大招最高伤害系数为700%）*玩法修正系数（eg. 联盟Boss玩法中，对应职业会有额外的修正系数）*极限值额外系数（尽可能规避因为组合搭配的容错系数）】【配置表】
        let atk = this._attrs[AttrEnum.ATK]
        let criDmg = (BattleConstantConfig.getRandBase + (this._attrs[AttrEnum.CRI_DMG] || 0)) / BattleConstantConfig.getRandBase;//爆伤系数
        let skillMaxHurtRate = ((this._cfg as table.hero.HeroConfig).skillMaxHurtRate || BattleConstantConfig.getRandBase) / BattleConstantConfig.getRandBase;
        if (this.owner.battleLogic.battleData?.verifyParam) {
            this.maxHurt = Math.floor(atk * criDmg * skillMaxHurtRate * (this.owner.battleLogic.battleData.verifyParam.playReviseRate / BattleConstantConfig.getRandBase) * (this.owner.battleLogic.battleData.verifyParam.extremeRate / BattleConstantConfig.getRandBase));
        }
    }

    updateHeroAttr(data: IBattleUnitData): void {
        if (this._attrs && Object.keys(this._attrs).length) {
            for (const key in data.attrs) {
                this._attrs[key] = data.attrs[key];
            }

            let hpPercentage = this.hpPercentage;
            this.normalMaxHp = this._attrs[AttrEnum.HP];
            this._hp = Math.ceil(this.maxHp * hpPercentage / 100);
        }
        else {
            this.initHeroAttr(data)
        }
    }

    /***处理属性修正值 */
    public setAttrMod(atk: number, def: number, hp: number, secondAttrAddition?: any): void {
        this._attrsMod = {};
        this._secondAttrsMod = {};
        if (atk)
            this._attrsMod[AttrEnum.ATK] = atk / BattleConstantConfig.getRandBase
        if (def)
            this._attrsMod[AttrEnum.DEF] = def / BattleConstantConfig.getRandBase
        if (hp) {
            this._attrsMod[AttrEnum.HP] = hp / BattleConstantConfig.getRandBase
        }

        if (secondAttrAddition) {
            for (let i = 0; i < secondAttrAddition.length; i++) {
                let attrTid = TableManager.getDataById(table.battle.AttributeConfig, secondAttrAddition[i].k).tid
                this._secondAttrsMod[attrTid] = +secondAttrAddition[i].v;
            }
        }
    }

    /**索敌范围 */
    get searchRange() {
        return this._searchRange;
    }

    get hp() {
        return this._hp;
    }

    set hp(hp: number) {
        this._hp = hp;
        PassivitySkillUtils.checkHpChangePassSkill(this.owner);
        PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_32, this.owner, this.owner);
        if (this._hp > 0) {
            if (this._isDeath && this.owner instanceof HeroUnit) {
                this.owner.showUnit()?.hideRebirthBar()
            }
            this._isDeath = false;
        }
        else {
            this._isDeath = true;
            this.setRebirthTime()
        }
    }

    /***只处理血量 */
    public setHpNotEvent(hp: number): void {
        this._hp = hp;
        if (this._hp > 0) {
            if (this._isDeath && this.owner instanceof HeroUnit) {
                this.owner.showUnit()?.hideRebirthBar()
            }
            this._isDeath = false;
        }
        else {
            this._isDeath = true;
            this.setRebirthTime()
        }
    }

    public initMaxHp(): void {
        this.normalMaxHp = this._attrs[AttrEnum.HP];
        this.maxHp = 0;
    }

    /***上限的血条 */
    public set maxHp(hp: number) {
        this._maxHp = hp;
    }

    public getAddMaxHp() {
        return this._maxHp
    }

    /**获取总血量，包括BUFF的 */
    public get maxHp(): number {
        return Math.max(this.normalMaxHp + this._maxHp, 1);
    }

    /***buff增加的最大HP百分比，isRemove=true 就是恢复的 */
    public addMaxHp(hp: number, isRemove: boolean): void {
        let addValueRate = Math.floor(this.normalMaxHp * hp / BattleConstantConfig.getRandBase);//增加的百分比
        if (isRemove && hp > 0) {
            //减益时的HP上限，在恢复时，当前HP保持不变
            this._maxHp -= addValueRate;
            this._maxHp = Math.max(1, this._maxHp)
        }
        else {
            //提升的时候按比例提升
            this._maxHp += addValueRate;//  50/100  100%  ( 50+100)/(100+100 ) 
            this.hp += addValueRate
            this.hp = Math.min(this.hp, this.maxHp)
        }
    }

    /**
     * 攻速系数 (每秒攻击次数)
     */
    get atkTimeScale() {
        return this.atkSpeed / 1000;
    }

    get atkSpeed() {
        return this.atkTimeSpeed * (1 + (this.getBuffValue(AttrEnum.ATK_SPD) / BattleConstantConfig.getRandBase));
    }

    // get maxHp() {
    //     return this._attrs[AttrEnum.HP] * (1 + (this.getBuffValue(AttrEnum.HP_INC) - this.getBuffValue(AttrEnum.HP_DEC)) / BattleConstantConfig.getRandBase);
    // }

    /**血量百分比 */
    get hpPercentage() {
        return this.hp / this.maxHp * 100;
    }

    /**移动速度 （每毫秒）*/
    get moveSpeed() {
        let value = MathUtils.toFiexd(this.initMoveSpeed * this.getMoveSpeedAdd(), 3)
        return Math.max(0, value);
    }

    /***获取速度加成 */
    getMoveSpeedAdd(): number {
        return (1 + (this.getBuffValue(AttrEnum.MOVE_SPD) + this.owner.battleLogic.buffMgr.getMoveSpeed(this.owner)) / BattleConstantConfig.getRandBase)
    }

    /***获取非BUFF的属性 */
    getAttrValue(key: AttrEnum): number {
        return this._attrs[key]
    }

    /**获取buff属性 */
    getBuffValue(key: AttrEnum) {
        if (!this._attrs[key])
            this._attrs[key] = 0
        var value: number = +this._attrs[key];
        var fighterAttrBuff: { [key: number]: { value: number, per: number } } = this.owner.battleLogic.buffMgr.getBuffAttrMap(this.owner);
        var fighterAttrHalo: { [key: number]: { value: number, per: number } } = this.owner.battleLogic.haloMgr.getHaloAttr(this.owner)

        var attrObj: { value: number, per: number } = { value: 0, per: 0 };
        if (fighterAttrBuff && fighterAttrBuff[key])
            attrObj = fighterAttrBuff[key];

        //--光环
        if (fighterAttrHalo && fighterAttrHalo[key]) {
            attrObj.value += fighterAttrHalo[key].value;
        }

        value = value + attrObj.value

        const config = BattleConstantConfig.getAttrCfgById(key)
        if (config.max)
            value = Math.min(config.max, value);

        if (config.min != undefined)
            value = Math.max(config.min, value);

        return value;
    }

    isFullHp() {
        return this.hp >= this.maxHp;
    }

    isAlive() {
        return !this._isDeath;
    }

    isDeath() {
        return this._isDeath;
    }

    isCanRebirth() {
        return this._isCanRebirth;
    }

    rebirth(isFull: boolean = true) {
        if (isFull) {
            this.hp = this.maxHp;
        }
        this._rebirthTime = 0;
        this._buffs = [];
    }

    public get rebirthTime(): number {
        return this._rebirthTime
    }

    hurt(damage: DamageVo, fighter: BattleUnit) {
        let value: number = damage.value;
        this.owner.battleLogic.checkMaxHurtHandler(damage, this.owner)

        let oldHp = this.hp;
        let curHp = this.hp;
        curHp -= value;

        if (fighter?.casterUid != this.owner.uid && !damage.ignoreLockingBlood) {
            let lockingBloodAmount = this.owner.battleLogic.haloMgr.getLockingBlood(this.owner)
            curHp = Math.max(lockingBloodAmount, curHp)
        }

        if (curHp <= 0) {
            curHp = 0;
        }
        // this.hp = curHp;
        this._hp = curHp;

        if (curHp == 0) {
            let b = PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_33, this.owner, this.owner, oldHp);
            if (b) {
                return
            }

            b = PassivitySkillUtils.checkLeaderSkillCon(LeaderSkillTriggerType.FatalWound, this.owner.teamId, this.owner, this.owner)
            if (b) {
                return
            }

            this.canReviveBySkill() && PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_14, this.owner, this.owner);
            if (this.hp <= 0) {
                this.hp = 0;
                this._isDeath = true;
                //被动14有可能会复活
                PassivitySkillUtils.checkDiePassSkill(this.owner)
                //复活的时间加成
                this.setRebirthTime()
                this.onDie();
            }
            else {
                this._isDeath = false;
            }
        }
        else {
            this.hp = curHp;
        }
    }

    private setRebirthTime() {
        //复活的时间加成
        let rebirtTimeAdd = 1 + this.owner.battleLogic.buffMgr.getReviveTimeBuff(this.owner) / BattleConstantConfig.getRandBase
        this._rebirthTime = Math.ceil(this._rebirthMaxTime / rebirtTimeAdd);
        this.rebirthMaxTime = BattleUtils.getTimeByFrame(this._rebirthTime);
    }

    heal(value: number) {
        let lockingBloodAmount = this.owner.battleLogic.haloMgr.getLockingBlood(this.owner)
        if (lockingBloodAmount != 0 && this.hp <= lockingBloodAmount) {
            return;
        }

        let curHp = this.hp;
        curHp += value;
        this.hp = Math.min(curHp, this.maxHp);
    }

    /***是否灭亡不能被复活 */
    public isPerish: boolean = false;
    onDie() {
        if (this.hasAbnormalStatus(AbnormalType.Perish)) {
            //死亡时存在灭亡，则保留该状态
            this.isPerish = true;
        }
        this.owner.battleLogic.buffMgr.checkElementRecursionBuffByDie(this.owner)
        this.resetBuff();
    }

    /**
     * 清理buff和行为
     * isExitFight是否脱战触发的重置BUFF
     *  */
    resetBuff(isExitFight: boolean = false) {
        // this._buffAttrs = {}
        this.removeAllBuffs(isExitFight);
        this._waitActiveBehavoirs = [];
        //this._waitPassiveBehavoirs = [];
    }

    /**清除技能所有CD */
    resetSkillAllCd(): void {
        for (let i = this._activeSkills.length - 1; i >= 0; i--) {
            let skill = this._activeSkills[i];
            skill.clearAllCd();
        }
    }

    /**重置前置技能CD */
    resetSkillPreCd(): void {
        for (let i = this._activeSkills.length - 1; i >= 0; i--) {
            let skill = this._activeSkills[i];
            skill.resPreCd()
        }
    }

    /**重置技能CD */
    resetSkillCd(): void {
        for (let i = this._passiveSkills.length - 1; i >= 0; i--) {
            let skill = this._passiveSkills[i];
            if (skill.cfg.exitClearCd)
                skill.clearAllCd()
        }
    }

    /**重置技能 */
    resetSkill(): void {
        for (let i = this._activeSkills.length - 1; i >= 0; i--) {
            let skill = this._activeSkills[i];
            skill?.fightSkillInfo?.resetSkill();
        }

        for (let i = this._passiveSkills.length - 1; i >= 0; i--) {
            let skill = this._passiveSkills[i];
            skill?.fightSkillInfo?.resetSkill();
        }
    }

    /***更新CD时间，参数1是技能格子(0代表普攻，1是技能1,2是技能2) 参数2是减少(-1是重置)， */
    public updateMaxPreCD(skillSlot: number, time: number): void {
        for (let i = 0; i < this._activeSkills.length; i++) {
            if (skillSlot == this._activeSkills[i].skillIndex) {
                this._activeSkills[i].updateMaxPreCd(time)
                break
            }
        }
    }

    /***减少当前前置CD，参数1是技能格子(0代表普攻，1是技能1,2是技能2) */
    public updatePreCD(skillSlot: number, time: number, isAddMax: boolean = false): void {
        for (let i = 0; i < this._activeSkills.length; i++) {
            if (skillSlot == this._activeSkills[i].skillIndex) {
                this._activeSkills[i].updatePreCd(time, isAddMax)
                break
            }
        }
    }

    /***减少当前前置CD，参数1是技能格子(0代表普攻，1是技能1,2是技能2) */
    public updatePreCDBySave(skillSlot: number, time: number): void {
        for (let i = 0; i < this._activeSkills.length; i++) {
            if (skillSlot == this._activeSkills[i].skillIndex) {
                this._activeSkills[i].updatePreCDBySave(time)
                break
            }
        }
    }

    /***更新CD时间，参数1是技能格子(0代表普攻，1是技能1,2是技能2) 参数2是减少(-1是重置)， */
    public updateMaxCD(skillSlot: number, time: number): void {
        for (let i = 0; i < this._activeSkills.length; i++) {
            if (skillSlot == this._activeSkills[i].skillIndex) {
                this._activeSkills[i].updateMaxCd(time)
                this.owner.battleLogic.effectMgr.showSkillCD(this.owner, this._activeSkills[i])
                break
            }
        }
    }

    /***减少当前CD，参数1是技能格子(0代表普攻，1是技能1,2是技能2)  */
    public updateCD(skillSlot: number, time: number): void {
        for (let i = 0; i < this._activeSkills.length; i++) {
            if (skillSlot == this._activeSkills[i].skillIndex) {
                this._activeSkills[i].updateCd(time)
                this.owner.battleLogic.effectMgr.showSkillCD(this.owner, this._activeSkills[i])
                break
            }
        }
    }

    /***更新CD时间，参数1是技能格子(0代表普攻，1是技能1,2是技能2) 参数2是减少(-1是重置)， */
    public updateMaxPreCDById(skillBelong: string, time: number): void {
        for (let i = 0; i < this._activeSkills.length; i++) {
            if (skillBelong == this._activeSkills[i].cfg.belongType) {
                this._activeSkills[i].updateMaxPreCd(time)
                break
            }
        }
    }

    /***减少当前前置CD，参数1是技能格子(0代表普攻，1是技能1,2是技能2) */
    public updatePreCDById(skillBelong: string, time: number, isAddMax: boolean = false): void {
        for (let i = 0; i < this._activeSkills.length; i++) {
            if (skillBelong == this._activeSkills[i].cfg.belongType) {
                this._activeSkills[i].updatePreCd(time, isAddMax)
                break
            }
        }
    }

    /***更新CD时间，参数1是技能格子(0代表普攻，1是技能1,2是技能2) 参数2是减少(-1是重置)， */
    public updateMaxCDById(skillBelong: string, time: number): void {
        for (let i = 0; i < this._activeSkills.length; i++) {
            if (skillBelong == this._activeSkills[i].cfg.belongType) {
                this._activeSkills[i].updateMaxCd(time)
                this.owner.battleLogic.effectMgr.showSkillCD(this.owner, this._activeSkills[i])
                break
            }
        }
    }

    /***减少当前CD，参数1是技能格子(0代表普攻，1是技能1,2是技能2)  */
    public updateCDById(skillBelong: string, time: number): void {
        for (let i = 0; i < this._activeSkills.length; i++) {
            if (skillBelong == this._activeSkills[i].cfg.belongType) {
                this._activeSkills[i].updateCd(time)
                this.owner.battleLogic.effectMgr.showSkillCD(this.owner, this._activeSkills[i])
                break
            }
        }
    }

    getSkillById(skillId: string): BaseSkillData {
        for (let i = this._activeSkills.length - 1; i >= 0; i--) {
            let skill = this._activeSkills[i];
            if (skillId == skill.cfg.id) {
                return skill;
            }
        }

        for (let i = this._passiveSkills.length - 1; i >= 0; i--) {
            let skill = this._passiveSkills[i];
            if (skillId == skill.cfg.id) {
                return skill;
            }
        }
    }

    getSkillByBeLongType(belongId: string): BaseSkillData {
        for (let i = this._activeSkills.length - 1; i >= 0; i--) {
            let skill = this._activeSkills[i];
            if (belongId == skill.cfg.belongType) {
                return skill;
            }
        }

        for (let i = this._passiveSkills.length - 1; i >= 0; i--) {
            let skill = this._passiveSkills[i];
            if (belongId == skill.cfg.group) {
                return skill;
            }
        }
    }

    /**获取活跃的技能 */
    getActiveSkill(skillId: string = "", ignoreCd: boolean = false, conditionChec?: Function) {
        let activeSkill: SkillData;

        //优先使用SkillId
        if (skillId != null && skillId != "") {
            for (let i = this._activeSkills.length - 1; i >= 0; i--) {
                let skill = this._activeSkills[i];
                if (skillId == skill.cfg.id) {
                    if (ignoreCd || skill.isActive()) {
                        activeSkill = skill;
                        return activeSkill;
                    }
                    break;
                }
            }
        }

        if (this.skillSortList) {
            //按技能顺序释放忽略CD
            let fallNum: number = 0;
            while (fallNum < this.skillSortList.length) {
                let skillId = this.skillSortList.shift();
                let skill = this.getActiveSkillByIndex(skillId, true)
                if (skill) {
                    this.skillSortList.push(skillId)
                    if ((this.canSkill() || SkillType.ATTACK == skill.type) && this.checkSkillHandler(skill) && (!conditionChec || conditionChec(skill))) {
                        //满足条件,塞回最后并且返回技能
                        return skill
                    }
                    else {
                        //不满足条件,塞回最后并且检查下1个技能释放能释放
                        fallNum++;
                    }
                }
                else {
                    break;
                }
            }
        }

        for (let i = this._activeSkills.length - 1; i >= 0; i--) {
            let skill = this._activeSkills[i];
            if (skill.isActive() && ((this.canSkill() && !BattleDebugManager.ins().isOnlyNormalAttack) || SkillType.ATTACK == skill.type) &&
                this.checkSkillHandler(skill) && (!conditionChec || conditionChec(skill))) {
                activeSkill = skill;
                break;
            }
        }
        return activeSkill;
    }

    /**获取扩展的技能 */
    getExSkill(skillId: string, exSkillOwneId: string) {
        let activeSkill: SkillData;
        if (this.exActiveSkills[exSkillOwneId]) {
            for (let i = this.exActiveSkills[exSkillOwneId].length - 1; i >= 0; i--) {
                let skill = this.exActiveSkills[exSkillOwneId][i];
                if (skillId == skill.cfg.id) {
                    activeSkill = skill;
                    return activeSkill;
                }
            }
        }
        return null;
    }

    protected getActiveSkillByIndex(index: number, ignoreCd: boolean = false): SkillData {
        for (let i = this._activeSkills.length - 1; i >= 0; i--) {
            let skill = this._activeSkills[i];
            if (index == skill.skillIndex) {
                if (ignoreCd || skill.isActive()) {
                    return skill;
                }
            }
        }

        return null;
    }

    /****判断技能的额外条件是否满足 */
    protected checkSkillHandler(skill: SkillData): boolean {
        if (this.owner.battleLogic.buffMgr.isProhibitSkills(this.owner, skill.skillIndex)) {
            return false
        }

        if (SkillUtils.checkSkillSubType(SkillSubType.Revive, skill.getSubType())) {
            //复活技能要判断当前目标是否满足复活条件
            if (!SkillUtils.searchTarget(skill, this.owner)) {
                return false;
            }
        }

        return true;
    }

    getSkillByIndex(index: number, ignoreCd: boolean = false) {
        for (let i = this._activeSkills.length - 1; i >= 0; i--) {
            let skill = this._activeSkills[i];
            if (index == skill.skillIndex) {
                if (ignoreCd || skill.isActive()) {
                    return skill;
                }
            }
        }
        return null;
    }

    /**执行技能 */
    public actionSkill(skill: SkillData, searchTarget: ITarget) {
        let behaviors = skill.actionSkill();
        if (!behaviors)
            return

        for (let i = 0; i < behaviors.length; i++) {
            let behavior = behaviors[i];
            behavior.setCaster(this._owner);
            behavior.skillTarget = searchTarget;
            if (searchTarget.unit)
                behavior.skillTargetUid = searchTarget.unit.uid;
            if (behavior.isOnTime) {
                behavior.actionEffect();
            }

            if (!behavior.isEnd) {
                this._waitActiveBehavoirs.push(behavior);
            }
        }
    }

    /***清除当前的技能行为 */
    public removeSkillBehavoirs(): void {
        this._waitActiveBehavoirs.length = 0;
    }

    /***添加技能行为 */
    public addSkillBehavoir(behavior: SkillBehavior): void {
        if (!behavior.isEnd) {
            this._waitActiveBehavoirs.push(behavior);
        }
    }

    /**更新技能CD */
    public updateSkillCD() {
        for (let i = this._activeSkills.length - 1; i >= 0; i--) {
            let skill: SkillData = this._activeSkills[i];
            skill.nextFrame();
        }

        for (let i = this._passiveSkills.length - 1; i >= 0; i--) {
            let skill = this._passiveSkills[i];
            skill.nextFrame();
        }
    }

    /**检测行为 */
    private checkBehavoirs() {

        if (this._waitActiveBehavoirs.length) {
            /**主动 */
            for (let i = 0; i < this._waitActiveBehavoirs.length; i++) {
                const behavior = this._waitActiveBehavoirs[i];
                if (behavior.isReadyToRemove) {
                    this._waitActiveBehavoirs.splice(i, 1); //删除已完成的
                    i--;
                }
                else
                    behavior.nextFrame();
            }
        }
    }

    /***触发所有行为 */
    public triggerAllBehavoirs(): void {
        if (this._waitActiveBehavoirs.length) {
            /**主动 */
            for (let i = 0; i < this._waitActiveBehavoirs.length; i++) {
                const behavior = this._waitActiveBehavoirs[i];
                behavior.actionEffect()
                behavior.isReadyToRemove = true
            }
            this._waitActiveBehavoirs.length = 0;
        }
    }

    /**增加buff */
    addBuff(buff: SkillBuff) {
        if (this.isDeath())
            return false;
        this._buffs.push(buff);

        this.buffMap[buff.id] = buff;
        var buffNum: number = this.buffStatue[buff.cfg.effectType]
        if (!buffNum)
            buffNum = 1
        else
            buffNum++;
        this.buffStatue[buff.cfg.effectType] = buffNum;//添加该异常的次数引用
        // this.setAbnormalStatus();
    }

    public get buffs(): SkillBuff[] {
        return this._buffs;
    }

    /***通过BUFFID获取Buff */
    public getBuffById(id: string): SkillBuff {
        return this.buffMap[id]
    }

    public removeAllBuffs(isExitFight: boolean = false): void {
        let delArr: SkillBuff[] = []
        for (let i = 0; i < this._buffs.length; i++) {
            if (!this._buffs[i].notExitBattleOutBuff || !isExitFight) {
                delArr.push(this._buffs[i])
                this._buffs.splice(i, 1)
                i--;
            }
        }
        while (delArr.length) {
            this.removeBuffById(delArr.shift().id)
        }
    }

    /***移除BUFF类型的数量 */
    public removeBuffStatueByEffectType(effectType: string): void {
        var buffNum: number = this.buffStatue[effectType]
        if (buffNum > 0) {
            buffNum--;
            this.buffStatue[effectType] = buffNum;//移除异常引用次数和添加对应的
        }
    }

    /***
     * 通过BUFFID移除Buff
     *  */
    public removeBuffById(buffId: string): void {
        var buff: SkillBuff = this.buffMap[buffId];
        this.owner.battleLogic.buffMgr.clearCacheAttrBuff(this.owner)
        delete this.buffMap[buffId];

        if (!buff)
            return

        buff.isReadyToRemove = true;
    }

    /***移除引用的数组列表 */
    public removeBuffListById(buffId: string): void {
        for (let i = 0; i < this._buffs.length; i++) {
            if (this._buffs[i].id == buffId) {
                delete this.buffMap[this._buffs[i].id];
                this._buffs.splice(i, 1)
                break
            }
        }
    }

    /**是否存在某个BUFF组 */
    public hasBuffGroup(group: string): boolean {
        for (var i in this.buffMap) {
            if (this.buffMap[i].skillBuffGroup.cfg.id == group) {
                return true
            }
        }
        return false
    }

    /**获取某个BUFF组下的BUFF*/
    public getBuffsByBuffGroup(group: string): SkillBuff[] {
        for (var i in this.buffMap) {
            if (this.buffMap[i].skillBuffGroup.cfg.id == group) {
                return this.buffMap[i].skillBuffGroup.buffs;
            }
        }
        return null;
    }

    /**是否存在某个同组BUFF */
    public hasGroupBuff(group: string): boolean {
        for (var i in this.buffMap) {
            if (this.buffMap[i].cfg.group == group) {
                return true
            }
        }
        return false
    }

    /**获取同组的BUFFs */
    public getGroupBuff(group: string): SkillBuff[] {
        var buffs: SkillBuff[] = [];
        for (var i in this.buffMap) {
            if (this.buffMap[i].cfg.group == group) {
                buffs.push(this.buffMap[i]);
            }
        }
        return buffs
    }


    /**移除同组的BUFFs */
    public removeGroupBuff(group: string): void {
        for (var i in this.buffMap) {
            if (this.buffMap[i].cfg.group == group) {
                this.removeBuffById(this.buffMap[i].id)
            }
        }
    }

    /**按BUFF组移除*/
    public removeBuffGroup(group: string): void {
        for (var i in this.buffMap) {
            let buffGroup = this.buffMap[i].skillBuffGroup
            if (buffGroup?.cfg.id == group) {
                buffGroup.removeAll()
            }
        }
    }

    /**设置异常状态 */
    public setAbnormalStatus(type: AbnormalType, param?: any) {
        this._abnormalStatus.setStatus(type, param);
    }

    /**清除1个异常状态 */
    public clearAbnormalStatus(type: AbnormalType) {
        this._abnormalStatus.cleanStatus(type);
        if (!this.isDizziness() && this.owner.state == ActorState.Vertigo) {
            this.owner.setState(ActorState.Idle)
        }
        if (type == AbnormalType.disappear && !this._abnormalStatus.hasStatus(AbnormalType.disappear)) {
            this.owner.showUnit()?.setVisible(true);
        }
        this.owner.showUnit()?.hideAbnormalStatus(type)
    }

    /**清除所有1个异常状态 */
    public clearAllAbnormalStatusByType(type: AbnormalType) {
        let num = this._abnormalStatus.clearAllAbnormalStatusByType(type);
        if (!this.isDizziness() && this.owner.state == ActorState.Vertigo) {
            this.owner.setState(ActorState.Idle)
        }

        if (type == AbnormalType.disappear && !this._abnormalStatus.hasStatus(AbnormalType.disappear)) {
            this.owner.showUnit()?.setVisible(true);
        }

        while (num) {
            num--;
            this.owner.showUnit()?.hideAbnormalStatus(type)
        }
    }

    public hasAbnormalStatus(type: AbnormalType) {
        return this._abnormalStatus.hasStatus(type)
    }

    /***角色是否存在某个异常 */
    public buffStatueByType(type: string): boolean {
        var buffNum: number = this.buffStatue[type];
        if (!buffNum)
            return false
        else
            return true;
    }

    /***是否静止 */
    public isTimeStop(): boolean {
        return this._abnormalStatus.hasStatus(AbnormalType.TimeStop)
    }

    /***是否石化 */
    public isPetrifaction(): boolean {
        return this._abnormalStatus.hasStatus(AbnormalType.petrifaction)
    }

    /***是否冰冻 */
    public isFrost(): boolean {
        return this._abnormalStatus.hasStatus(AbnormalType.frost)
    }

    /***是否霸体 */
    public isImmuneControl(): boolean {
        return this._abnormalStatus.hasStatus(AbnormalType.ImmuneControl)
    }

    /***是否可以选中 */
    public canSelect(): boolean {
        return !this._abnormalStatus.hasStatus(AbnormalType.notSelect)
    }

    /***是否眩晕 */
    public isDizziness(): boolean {
        return this._abnormalStatus.hasStatus(AbnormalType.dizziness)
    }

    /***是否最低仇恨，不给选中，但能收到伤害 */
    public isLowHatred(): boolean {
        return this._abnormalStatus.hasStatus(AbnormalType.lowHatred)
    }

    /***是否能被强制位移（牵引、击退） */
    public canForceMove(): boolean {
        return !this._abnormalStatus.hasStatus(AbnormalType.StopForceMove) && !this._abnormalStatus.hasStatus(AbnormalType.ImmuneControl)
    }

    /***是否跳跃移动 */
    public canJumpMove(): boolean {
        return !this._abnormalStatus.hasStatus(AbnormalType.StopForceMove)
    }

    /***是否能被技能复活 */
    public canReviveBySkill(): boolean {
        return !this._abnormalStatus.hasStatus(AbnormalType.Perish) && !this.isPerish;
    }

    /**是否可以移动 */
    canMove(): boolean {
        if (this.isDeath()) {
            return false
        }

        if (this._abnormalStatus.hasStatus(AbnormalType.disappear)) {
            return false
        }

        if (this._abnormalStatus.hasStatus(AbnormalType.NotMove) || this._abnormalStatus.hasStatus(AbnormalType.dizziness) || this._abnormalStatus.hasStatus(AbnormalType.petrifaction)) {
            return false
        }
        return true;
    }

    /**是否可以攻击 */
    canAttack(): boolean {
        if (this.isDeath()) {
            return false
        }

        if (this._abnormalStatus.hasStatus(AbnormalType.disappear)) {
            return false
        }

        if (this._abnormalStatus.hasStatus(AbnormalType.NotAttack) || this._abnormalStatus.hasStatus(AbnormalType.dizziness) || this._abnormalStatus.hasStatus(AbnormalType.petrifaction)) {
            return false
        }
        return true;
    }

    /***是否能释放除普工外的技能 */
    canSkill(): boolean {
        if (!this.owner.battleLogic.canSkill)
            return false

        if (this._abnormalStatus.hasStatus(AbnormalType.Silent)) {
            return false
        }
        return true;
    }

    /***是否处于无敌状态,不受伤害和控制 */
    isInvincible(): boolean {
        if (this.isDeath()) {
            return false
        }

        if (this._abnormalStatus.hasStatus(AbnormalType.Invincible)) {
            return true
        }
        return false;
    }

    /**更新逻辑 */
    update() {
        this.checkBehavoirs();

        // for (let i = 0; i < this._buffs.length; i++) {
        //     if (this._buffs[i].isReadyToRemove) {
        //         delete this.buffMap[this._buffs[i].id];
        //         this._buffs.splice(i, 1)
        //         i--;
        //     }
        // }
    }

    public sizeScale: number = 1
    public setSizeScale(v: number): void {
        this.sizeScale = v;
    }

    public getSize(): number {
        return Math.ceil(this.size * this.sizeScale);
    }

    /***更新复活时间 */
    public updateRebirthTime(): void {
        if (this._rebirthTime > 0)
            this._rebirthTime--;
    }

    /**
     * 获取英雄配置ID
     */
    getHeroConfigId(): number {
        return this._cfg.id as any;
    }

    /**获取配置Id
     * 需要根据单位类型自行判断 ！！
     */
    getConfigId(): number {
        return this._cfg.id as any;
    }
}
