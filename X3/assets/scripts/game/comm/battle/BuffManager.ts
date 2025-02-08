import G from "../../../core/comm/G";
import { PoolManager } from "../../../core/pool/PoolManager";
import { TableManager } from "../../../core/table/TableManager";
import { BattleUtils } from "./BattleUtils";
import { DamageVo } from "./DamageVo";
import { ShieldAtkBuff } from "./buff/ShieldAtkBuff";
import { SuddenDeathBuff } from "./buff/SuddenDeathBuff";
import BattleConstantConfig from "./config/BattleConstantConfig";
import { HurtNumType, UnitType } from "./enum/BattleEnum";
import BuffFactory from "./factory/BuffFactory";
import { ICaster } from "./skill/ICaster";
import { PassivitySkillUtils } from "./skill/PassivitySkillUtils";
import { SkillBehavior } from "./skill/SkillBehavior";
import { SkillBuff } from "./skill/SkillBuff";
import { SkillBuffGroup } from "./skill/SkillBuffGroup";
import { SkillData } from "./skill/SkillData";
import { BuffEffectPos, BuffType, PassivitySkillType, SkillSubType } from "./skill/SkillEnum";
import { SkillUtils } from "./skill/SkillUtils";
import { BattleUnit } from "./unit/battle/BattleUnit";
import { BulletUnit } from "./unit/bullet/BulletUnit";
import { MathUtils } from "../../../core/utils/MathUtils";
import { BattleLogic } from "./BattleLogic";
import { SortUtils } from "../../../core/utils/SortUtils";
import { BattleCommandType } from "./BattleCommand";
import { GuardBuff } from "./buff/GuardBuff";
import ArrayUtils from "../../../core/utils/ArrayUtils";
import { ShieldBuff } from "./buff/ShieldBuff";
import { AttrEnum } from "./attribute/AttrEnum";
import { FightFormula } from "./FightFormula";
import { Attribute } from "../../modules/attr/AttrEnum";
import { BattleDebugManager } from "./BattleDebugManager";
import ObjectUtils from "../../../core/utils/ObjectUtils";
import { AttrValueBuff } from "./buff/AttrValueBuff";
import { Handler } from "../../../core/utils/Handler";
import { DEBUG } from "cc/env";
import { DelayGuardBuff } from "./buff/DelayGuardBuff";
import { DispelAbnormalTypeBuff } from "./buff/DispelAbnormalTypeBuff";
import { MoveRemoveBuff } from "./buff/MoveRemoveBuff";
import { Vec2 } from "cc";
import UrlUtils from "../../../core/utils/UrlUtils";

export class BuffManager {

    private buffs: SkillBuff[] = [];
    private buffGroupMap: { [uid: number]: SkillBuffGroup } = {}
    public battleLogic: BattleLogic;

    protected onInit(): void {
    }

    /***重置当前的战斗BUFF */
    public clear(): void {
        for (var i: number = 0; i < this.buffs.length; i++) {
            this.buffs[i].isReadyToRemove = true;
        }
        this.buffs.length = 0;
        this.buffGroupMap = {};
    }

    /***随机BUFF */
    private checkRandomBuff(buffId: string, target: BattleUnit, caster: ICaster, behavior?: SkillBehavior): boolean {
        let cfg: table.battle.BuffConfig = TableManager.getDataById(table.battle.BuffConfig, buffId);
        if (cfg && cfg.effectType == BuffType.RandomBuff) {
            var effectParam: { buffs: string[] } = cfg.effectParam;
            if (effectParam?.buffs.length) {
                let randomIndex = this.battleLogic.randomMgr.randomInt(0, effectParam.buffs.length - 1)
                this.buffControlByGroup(effectParam.buffs[randomIndex], caster, target, behavior)
                return true
            }
        }
        return false
    }

    /***
     * 添加BUFF
     * buffId 
     * target 目标
     * caster 施法者数据
     */
    public addBuff(buffId: string, target: BattleUnit, caster: ICaster, buffGroupInfo: SkillBuffGroup, behavior?: SkillBehavior, ex?: { notHero?: boolean, includeDie?: boolean }, data?: any): SkillBuff {
        if (!target || (!target.isActive && (!ex || !ex.includeDie)))
            return null;

        //自己可以对自己释放BUFF不判断状态
        if (target.uid != caster.casterUid && !target.canBeHurt())
            return null;

        let cfg: table.battle.BuffConfig = TableManager.getDataById(table.battle.BuffConfig, buffId);
        if (cfg) {
            //检查是否随机生成BUFF
            if (this.checkRandomBuff(buffId, target, caster, behavior))
                return null;

            //添加BUFF时同样要检测对方是否存在对该BUFF的驱散
            if (cfg.stateType && this.isDispelById(target, buffId)) {
                return null
            }

            //添加BUFF时同样要检测对方是否存在对该BUFF的驱散
            if (cfg.stateType && (this.isDispelByAbnormalType(target, cfg.abnormalType) || this.isDispelByAbnormalType2(target, cfg.abnormalType))) {
                return null
            }

            if (!this.checkBuffCondition(target, cfg)) {
                return null
            }


            //是否存在改变层数的BUFF
            let changeLayer = this.getChangeBuffLayer(caster, cfg.group)
            let cfgLayer = changeLayer == -1 ? cfg.layer : changeLayer;

            //缓存对应已存在BUFF的帧数
            let timeCheckIndex: number = 0;
            let timeCheckMax: number = 0;
            let tempLayer: number = 0;
            let buff = target.attr.getBuffById(buffId);
            let oldBuffCloneData = null;

            if (buff && cfg.inheritTime) {
                timeCheckIndex = buff.timeLoop;
                timeCheckMax = buff.time
            }

            //获取同组的BUFF，同组的话新的顶掉旧的
            if (cfgLayer == 0 && cfg.group) {
                //无叠加次数才删除BUFF的
                var groupBuff: SkillBuff[] = target.attr.getGroupBuff(cfg.group);
                if (groupBuff.length > 0) {
                    oldBuffCloneData = buff?.getCloneData()
                    for (let i: number = 0; i < groupBuff.length; i++) {
                        groupBuff[i].skillBuffGroup.isAddToRemove = true;
                        target.attr.removeBuffById(groupBuff[i].id)
                    }
                    buffGroupInfo.isAddToRemove = true;
                    buff = target.attr.getBuffById(buffId);
                }
            }

            if (buff && cfg.layer != -1) {
                timeCheckIndex = buff.timeLoop;
                if (buff.id == buffId && cfgLayer && !buff.isReadyToRemove) {
                    tempLayer = buff.layer;//相同BUFF可以叠加的话，把层数存起来
                }
                if (buff.buffGroupUid && buff.buffGroupUid != buffGroupInfo.uid) {
                    //移除旧组别
                    target.attr.removeBuffById(buff.id)
                    oldBuffCloneData = buff.getCloneData()
                    buff = null;
                }
            }

            if (!buff) {
                buff = BuffFactory.createBuff(cfg, buffGroupInfo.cfg.timeLimit, this.battleLogic);
                this.buffs.push(buff);

                if (cfgLayer > 1 && tempLayer == cfgLayer) {
                    //之前就满层了
                    buff.isLastMax = true;
                }
            }

            let changeBuffData = this.getChangeBuff(caster, buff);
            if (changeBuffData) {
                //存在替换BUFF，把目标BUFF的效果更换
                if ((changeBuffData.effectParm1 as { notReplace: number }).notReplace) {
                    //不替换而是新增
                    let replaceData = {}
                    for (let key in buff.effectParm1) {
                        replaceData[key] = buff.effectParm1[key]
                    }

                    for (let key in changeBuffData.effectParm2) {
                        replaceData[key] = changeBuffData.effectParm2[key]
                    }
                    buff.effectParm1 = replaceData;
                }
                else
                    buff.effectParm1 = changeBuffData.effectParm2;
            }

            buff.resData()
            if (cfgLayer > 0) {
                //可以叠加的
                buff.layer = Math.min(tempLayer + 1, cfgLayer);
            }
            else
                buff.layer = 1;

            if (buff.cfg.isCtrlBuff && buff.maxTime > 0) {
                //控制技能要判断时间增加或减少
                let effAddTime = Math.ceil(buff.maxTime * (FightFormula.getValueByType(Attribute.EFF_INC, caster.caster) - FightFormula.getValueByType(Attribute.EFF_RES, target)) / BattleConstantConfig.getRandBase);
                buff.setAddTimeMax(effAddTime)
            }

            buff.notHero = ex?.notHero
            buff.includeDie = ex?.includeDie
            buff.cfgLayer = cfgLayer;
            buff.timeLoop = timeCheckIndex;
            buff.time = timeCheckMax;
            buff.skillBehavior = behavior
            // buff.buffGroupUid = buffGroupInfo.uid
            buff.setSkillBuffGroup(buffGroupInfo);
            buff.casterUid = caster.casterUid;
            buff.casterAtk = caster.atk;
            buff.setTarget(caster, target)
            if (buff instanceof GuardBuff) {
                buff.addCaster(caster as BattleUnit)
            }
            buff.setData(data)
            if (oldBuffCloneData)
                buff.setCloneData(oldBuffCloneData)
            target.addBuff(buff);
            PassivitySkillUtils.checkBuffAbnormalTypePassSkill(target, buff.cfg.abnormalType)

            this.checkAddBuff(caster, buff)

            if (buff.isReadyToRemove) {
                //上面的经过有可能导致BUFF失效，如某情况下触发的被动
                return null;
            }



            //添加的是驱散BUFF时，会移除正在被驱散的BUFF
            // if (caster instanceof BattleUnit && (buff.effectType == BuffType.DispelAbnormalType || buff.effectType == BuffType.DispelId)) {
            //     this.dispel(caster, buff);
            // }

            //更改BUFF时间
            this.getChangeBuffTime(caster, buff)



            target.updateBuff(buff);

            if (DEBUG && UrlUtils.getURLQuery(UrlUtils.ShowBattleLog))
                console.log(`[${target.attr.name}] 添加BUFF ${buff.cfg.name}(${buff.cfg.id})`)

            if (buff.effectType == BuffType.Attr || buff.effectType == BuffType.ResistAttr || buff.effectType == BuffType.ChangeAttr
                || buff.effectType == BuffType.AttrToAttr || buff.effectType == BuffType.AttrValue) {
                //ATTRBUFF有变更的时候清除ATTR缓存
                this.clearCacheAttrBuff(target);
            }

            // if (buff.conditionType === BuffConditionType.NOW) {
            //     //马上执行
            //     this.actionBuffEffect(buff, target);
            // }
            buff.onAddBuff()

            this.checkCopyBuff(caster, buff)
            return buff;
        }

        return null
    }

    /***判断BUFF的添加条件 */
    private checkBuffCondition(target: BattleUnit, buffCfg: table.battle.BuffConfig): boolean {
        if (buffCfg.effectType == BuffType.Kill && target.attr.buffStatueByType(BuffType.Kill)) {
            return false
        }
        else if (buffCfg.effectType == BuffType.Ridicule && target.attr.isImmuneControl()) {
            target.showUnit()?.showOtherNum("bati")
            return false
        }
        else if (buffCfg.effectType == BuffType.Charm && target.attr.isImmuneControl()) {
            target.showUnit()?.showOtherNum("bati")
            return false
        }
        return true;
    }

    /***清除ATTR类型的BUFF缓存列表 */
    public clearCacheAttrBuff(from: BattleUnit): void {
        if (from)
            delete this.cacheAttrBuffMap[from.uid];
    }

    /***缓存的BUFF列表，假如角色的ATTRBUFF无改变，则一直使用 */
    private cacheAttrBuffMap: { [uid: number]: { [attrId: number]: { value: number, per: number } } } = {};
    /**
    * 通过实体ID获取该对象的BUFF加成表
    */
    public getBuffAttrMap(from: BattleUnit): { [attrId: number]: { value: number, per: number } } {

        if (this.cacheAttrBuffMap[from.uid])
            return this.cacheAttrBuffMap[from.uid];

        var buffList: SkillBuff[] = from.attr.buffs;//获取buff列表
        if (buffList.length == 0)//并无BUFF
            return null;

        var returnMap: { [attrId: number]: { value: number, per: number } } = this.cacheAttrBuffMap[from.uid] = {};
        //寻找对应属性的加成
        for (let i: number = buffList.length - 1; i >= 0; i--) {
            var buff: SkillBuff = buffList[i];
            if (buff.isReadyToRemove)//已经进入删除队列的不触发
                continue;

            if (buff.effectType == BuffType.Attr) {
                //属性增益、减益
                for (let attrKey in buff.effectParm1) {
                    const config = G.TableManager.getDataById(table.battle.AttributeConfig, attrKey);
                    if (config) {

                        if (!returnMap[config.tid]) {
                            returnMap[config.tid] = { value: 0, per: 0 }
                        }
                        let attrData = returnMap[config.tid];

                        var value: number = returnMap[config.tid].value;//汇总属性
                        var per: number = returnMap[config.tid].per;

                        let randomValue: number = 1;
                        let random: number[] = buff.effectParm1.random;
                        if (random?.length == 2) {
                            //随机增加多N次
                            randomValue = this.battleLogic.randomMgr.randomInt(random[0], random[1])
                        }

                        value += +buff.effectParm1[attrKey] * buff.layer * randomValue;

                        attrData.value = value;
                        attrData.per = per;
                    }
                }
                buff.active();
            }
        }

        if (from.attr.buffStatueByType(BuffType.ResistAttr)) {
            //有抵抗属性加成的BUFF
            var resistAttrMap: { [attrId: number]: number } = this.getResistAttrMap(from)
            for (let attrId in returnMap) {
                if (returnMap[attrId].value < 0 && resistAttrMap[attrId]) {
                    returnMap[attrId].value = Math.min(0, returnMap[attrId].value + resistAttrMap[attrId])
                }
            }
        }

        if (from.attr.buffStatueByType(BuffType.AttrValue)) {
            let attrValueAttMap: { [attrId: number]: number } = this.getAttrValueBuff(from)
            for (let attrId in attrValueAttMap) {
                if (!returnMap[attrId])
                    returnMap[attrId] = { value: 0, per: 0 };
                returnMap[attrId].value += attrValueAttMap[attrId];
            }
        }

        if (from.attr.buffStatueByType(BuffType.AttrToAttr)) {
            //扣属性的转换BUFF
            let changeAttrMap: { from: table.battle.AttributeConfig, fromValue: number, to: table.battle.AttributeConfig, toValue: number }[] = this.getAttrToAttrMap(from)
            if (changeAttrMap) {
                let copyReturmMap = ObjectUtils.copy(returnMap)
                for (let attrIndex = 0; attrIndex < changeAttrMap.length; attrIndex++) {
                    let attrId = changeAttrMap[attrIndex].from.tid;
                    if (copyReturmMap[attrId]) {
                        let attrValue = copyReturmMap[attrId].value + from.attr.getAttrValue(attrId);
                        if (attrValue >= changeAttrMap[attrIndex].fromValue) {
                            returnMap[attrId].value -= changeAttrMap[attrIndex].fromValue;
                            let addAttrId = changeAttrMap[attrIndex].to.tid;
                            if (!returnMap[addAttrId])
                                returnMap[addAttrId] = { value: 0, per: 0 }
                            returnMap[addAttrId].value += changeAttrMap[attrIndex].toValue;

                            copyReturmMap[addAttrId] = returnMap[addAttrId].value;
                            copyReturmMap[attrId] = returnMap[attrId].value;
                        }
                    }
                }
            }
        }

        if (from.attr.buffStatueByType(BuffType.ChangeAttr)) {
            //有转化增加属性加成的BUFF
            var changeAttrMap: { from: table.battle.AttributeConfig, fromValue: number, to: table.battle.AttributeConfig, toValue: number }[] = this.getChangeAttrMap(from)
            if (changeAttrMap) {
                let copyReturmMap = ObjectUtils.copy(returnMap)
                for (let attrIndex = 0; attrIndex < changeAttrMap.length; attrIndex++) {
                    let attrId = changeAttrMap[attrIndex].from.tid;
                    if (copyReturmMap[attrId]) {
                        let attrValue = copyReturmMap[attrId].value;
                        if (attrValue > 0) {
                            let addValue = Math.floor(attrValue / changeAttrMap[attrIndex].fromValue)
                            addValue = Math.floor(addValue * changeAttrMap[attrIndex].toValue)
                            let addAttrId = changeAttrMap[attrIndex].to.tid;
                            if (!returnMap[addAttrId])
                                returnMap[addAttrId] = { value: 0, per: 0 }
                            returnMap[addAttrId].value += addValue;
                        }
                    }
                }
            }
        }
        return returnMap;
    }

    private getResistAttrMap(entity: BattleUnit): { [attrId: number]: number } {
        if (!entity.attr.buffStatueByType(BuffType.ResistAttr)) {
            //不存在直接返回
            return {}
        }

        var resistAttrMap: { [attrId: number]: number } = {};
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.ResistAttr)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                for (let attrKey in buffList[i].effectParm1) {
                    const config = G.TableManager.getDataById(table.battle.AttributeConfig, attrKey);
                    if (config) {
                        if (!resistAttrMap[config.tid])
                            resistAttrMap[config.tid] = 0;
                        resistAttrMap[config.tid] += + buffList[i].effectParm1[attrKey];
                    }
                }
            }
        }

        return resistAttrMap;
    }

    private getChangeAttrMap(entity: BattleUnit): { from: table.battle.AttributeConfig, fromValue: number, to: table.battle.AttributeConfig, toValue: number }[] {
        if (!entity.attr.buffStatueByType(BuffType.ChangeAttr)) {
            //不存在直接返回
            return null
        }

        var resistAttrMap: { from: table.battle.AttributeConfig, fromValue: number, to: table.battle.AttributeConfig, toValue: number }[] = [];
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.ChangeAttr)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                let effectParm: { type: string[], value: number[] } = buffList[i].effectParm1;
                const from = G.TableManager.getDataById(table.battle.AttributeConfig, effectParm.type[0]);
                const to = G.TableManager.getDataById(table.battle.AttributeConfig, effectParm.type[1]);
                resistAttrMap.push({ from: from, fromValue: +effectParm.value[0], to: to, toValue: +effectParm.value[1] })
            }
        }

        return resistAttrMap;
    }

    private getAttrToAttrMap(entity: BattleUnit): { from: table.battle.AttributeConfig, fromValue: number, to: table.battle.AttributeConfig, toValue: number }[] {
        if (!entity.attr.buffStatueByType(BuffType.AttrToAttr)) {
            //不存在直接返回
            return null
        }

        var resistAttrMap: { from: table.battle.AttributeConfig, fromValue: number, to: table.battle.AttributeConfig, toValue: number }[] = [];
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.AttrToAttr)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                let effectParm: { type: string[], value: number[] } = buffList[i].effectParm1;
                const from = G.TableManager.getDataById(table.battle.AttributeConfig, effectParm.type[0]);
                const to = G.TableManager.getDataById(table.battle.AttributeConfig, effectParm.type[1]);
                resistAttrMap.push({ from: from, fromValue: +effectParm.value[0], to: to, toValue: +effectParm.value[1] })
            }
        }

        return resistAttrMap;
    }

    private getAttrValueBuff(entity: BattleUnit): { [attrId: number]: number } {
        if (!entity.attr.buffStatueByType(BuffType.AttrValue)) {
            //不存在直接返回
            return null
        }

        var resistAttrMap: { [attrId: number]: number } = {};
        var buffList: AttrValueBuff[] = this.getBuffListByEffect(entity, BuffType.AttrValue) as AttrValueBuff[]
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                for (let attrKey in buffList[i].attr) {
                    if (!resistAttrMap[attrKey])
                        resistAttrMap[attrKey] = 0;
                    resistAttrMap[attrKey] += buffList[i].attr[attrKey]
                }
            }
        }

        return resistAttrMap;
    }

    /**
     * 这个ID是否被驱散的
     */
    private isDispelById(entity: BattleUnit, id: string): boolean {
        if (!entity.attr.buffStatueByType(BuffType.DispelId)) {
            //不存在直接返回
            return false
        }

        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.DispelId)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var targetBuff: SkillBuff = buffList[i];
                var effectParam: { ids: string[] } = targetBuff.effectParm1
                if (effectParam.ids.indexOf(id) != -1) {
                    return true;
                }
            }
        }

        return false;
    }

    /***按异常类型驱散 */
    private isDispelByAbnormalType(entity: BattleUnit, type: number): boolean {
        if (!entity.attr.buffStatueByType(BuffType.DispelAbnormalType)) {
            //不存在直接返回
            return false
        }

        var buffList: DispelAbnormalTypeBuff[] = this.getBuffListByEffect(entity, BuffType.DispelAbnormalType) as DispelAbnormalTypeBuff[];
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var targetBuff: DispelAbnormalTypeBuff = buffList[i];
                var effectParam: { type: number[], group: string, random: number, num: number } = targetBuff.effectParm1
                if ((targetBuff.num == -1 || targetBuff.num > 0) && effectParam.group && BattleConstantConfig.checkAbnormalType(effectParam.group, type + "")) {
                    if (targetBuff.num)
                        targetBuff.num--;
                    return true;
                }
                if ((targetBuff.num == -1 || targetBuff.num > 0) && effectParam.type && effectParam.type.indexOf(type) != -1) {
                    if (targetBuff.num)
                        targetBuff.num--
                    return true;
                }
            }
        }

        return false;
    }

    /***按异常类型驱散，只驱散添加不驱散原来的 */
    private isDispelByAbnormalType2(entity: BattleUnit, type: number): boolean {
        if (!entity.attr.buffStatueByType(BuffType.DispelAbnormalType2)) {
            //不存在直接返回
            return false
        }

        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.DispelAbnormalType2)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var targetBuff: SkillBuff = buffList[i];
                var effectParam: { type: number[], group: string, random: number } = targetBuff.effectParm1
                if (effectParam.group && BattleConstantConfig.checkAbnormalType(effectParam.group, type + "")) {
                    return true;
                }
                if (effectParam.type && effectParam.type.indexOf(type) != -1) {
                    return true;
                }
            }
        }

        return false;
    }

    public isProhibitSkills(entity: ICaster, skillIndex: number): boolean {
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.ProhibitSkills)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { skillIndex: number[] } = buff.effectParm1
                if (effectParam.skillIndex == null || effectParam.skillIndex.indexOf(skillIndex) != -1) {
                    return true;
                }
            }
        }
        return false;
    }

    /***根据某个技能释放后回血 */
    public getHurtToHeal(entity: ICaster, skillIndex: number): void {
        // let value = 0;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.HurtToHeal)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { amount: number, skillIndex: number } = buff.effectParm1
                if (effectParam.skillIndex == null || effectParam.skillIndex == skillIndex) {
                    // value += effectParam.amount;

                    if (effectParam.amount > 0 && entity.caster?.isActive) {
                        let lifeStealHpDamageVo = PoolManager.getItem(DamageVo)
                        lifeStealHpDamageVo.caster = buff.caster;
                        lifeStealHpDamageVo.target = entity.caster;
                        lifeStealHpDamageVo.status = BattleConstantConfig.Heal;
                        lifeStealHpDamageVo.value = Math.ceil(entity.caster.hpMax * effectParam.amount / BattleConstantConfig.getRandBase);
                        lifeStealHpDamageVo.skillInfo = buff.skillBehavior?.skill;
                        lifeStealHpDamageVo.buffInfo = buff;
                        this.battleLogic.heal(lifeStealHpDamageVo);
                    }
                }
            }
        }
    }

    /****获取攻击距离加成 */
    public getAttackDis(entity: ICaster, skillIndex: number): number {
        let dis = 0;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.AtkDis)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { dis: number, skillIndex: number } = buff.effectParm1
                if (!effectParam.skillIndex || effectParam.skillIndex == skillIndex) {
                    dis += effectParam.dis
                }
            }
        }
        return dis;
    }

    /****获取攻击距离加成 */
    public getSearchRange(entity: ICaster): number {
        let dis = 0;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.SearchRange)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { dis: number } = buff.effectParm1
                dis += effectParam.dis
            }
        }
        return dis;
    }

    public getMissileDis(entity: ICaster): number {
        let dis = 0;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.MissileDis)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { dis: number } = buff.effectParm1
                dis += effectParam.dis
            }
        }
        return dis;
    }

    /****获取对某技能的冷却缩减 */
    public getUpdateCdPercent(entity: ICaster, skillIndex: number): number {
        let cdr = 0;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.UpdateCdPercent)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { cd: number, skillIndex: number } = buff.effectParm1
                if (!effectParam.skillIndex || effectParam.skillIndex == skillIndex) {
                    cdr += effectParam.cd
                }
            }
        }
        return cdr;
    }

    /****获取对某技能的前置CD减少值 */
    public getUpdatePreCD(entity: ICaster, skillIndex: number): number {
        let cdr = 0;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.PreCd2)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { cd: number, skillIndex: number } = buff.effectParm1
                if (!effectParam.skillIndex || effectParam.skillIndex == skillIndex) {
                    cdr += effectParam.cd
                }
            }
        }
        return cdr;
    }

    /***判断攻击是否存在攻击时减血的BUFF */
    public checkAtkByHurt(entity: BattleUnit, skillIndex: number): void {
        if (entity && entity.isActive) {
            var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.AtkByHurt)
            if (buffList && buffList.length > 0) {
                for (var i: number = buffList.length - 1; i >= 0; i--) {
                    var buff: SkillBuff = buffList[i];
                    if (buff.caster?.caster?.isActive) {
                        var effectParam: { type: number, skillIndex: number, amount: number } = buff.effectParm1
                        if (!effectParam.skillIndex || effectParam.skillIndex == skillIndex) {
                            if (effectParam.type == 1) {
                                let hp = Math.ceil(buff.caster.caster.hpMax * effectParam.amount / BattleConstantConfig.getRandBase);
                                let damage: DamageVo = PoolManager.getItem(DamageVo)
                                damage.status = BattleConstantConfig.Normal;
                                damage.subType = BattleConstantConfig.SubType_AtkByHurt;
                                damage.value = hp;
                                damage.caster = buff.caster.caster;
                                damage.target = entity;
                                damage.buffInfo = buff;
                                damage.skillInfo = buff.skillBehavior?.skill;
                                this.battleLogic.hurt(damage)
                            }
                        }
                    }
                }
            }
        }
    }

    /****按攻击距离增伤 */
    public getAtkDisDamage(entity: ICaster, dis: number): number {
        let add = 0;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.AtkDisDamage)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { min: number, amount: number } = buff.effectParm1
                let tDis = dis - effectParam.min
                if (tDis > 0) {
                    add += tDis * effectParam.amount;
                }
            }
        }
        return 1 + add / BattleConstantConfig.getRandBase;
    }

    /****按移动速增伤 */
    public getMoveSpeedDamage(entity: ICaster): number {
        if (entity instanceof BulletUnit) {
            entity = entity.caster;
        }

        let add = 0;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.MoveSpeedDamage)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { amount: number } = buff.effectParm1
                let speed = (entity as BattleUnit).attr.getMoveSpeedAdd() - 1
                if (speed > 0) {
                    add += speed * effectParam.amount;
                }
            }
        }
        return add / 100;
    }

    /***是否允许治疗 */
    public checkCannotHeal(entity: BattleUnit, type: number): boolean {
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.CannotHeal)
        if (buffList?.length) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { type: number[] } = buff.effectParm1
                if (!effectParam || !effectParam.type || effectParam.type?.indexOf(type) != -1) {
                    return true
                }
            }
        }
        return false
    }

    /****按移动速增加伤害减免 */
    public getMoveSpeedDamageRes(entity: ICaster): number {
        if (entity instanceof BulletUnit) {
            entity = entity.caster;
        }

        let add = 0;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.MoveSpeedDamageRes)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { amount: number } = buff.effectParm1
                let speed = (entity as BattleUnit).attr.getMoveSpeedAdd() - 1
                if (speed > 0) {
                    add += speed * effectParam.amount;
                }
            }
        }
        return add / 100;
    }

    /****获取额外增伤 */
    public getOtherAddHurt(entity: ICaster): number {
        if (entity instanceof BulletUnit) {
            entity = entity.caster;
        }

        let add = 0;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.OtherAddHurt)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { amount: number } = buff.effectParm1
                add += effectParam.amount;
            }
        }
        return add / BattleConstantConfig.getRandBase
    }

    /***按按飞行单位增伤 */
    public getFlyAddHurt(entity: ICaster, target: BattleUnit): number {
        let value = 0;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.FlyAddHurt)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { amount: number, fly: number } = buff.effectParm1;
                if ((effectParam.fly && target.isFlyUnit) || (!effectParam.fly && !target.isFlyUnit))
                    value += effectParam.amount * buff.layer;
            }
        }
        return value / BattleConstantConfig.getRandBase;
    }

    /***按按单位类型增伤 */
    public getUnitTypeAddHurt(entity: ICaster, target: BattleUnit): number {
        let value = 0;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.UnitTypeAddHurt)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { amount: number, types: number[], subType: number[] } = buff.effectParm1;
                if (!effectParam.types || effectParam.types.indexOf(target.type) != -1) {
                    if (!effectParam.subType || effectParam.subType.indexOf(target.camp) != -1) {
                        value += effectParam.amount * buff.layer;
                    }
                }
            }
        }
        return value / BattleConstantConfig.getRandBase;
    }

    /***对相同职业增伤 */
    public getJobAddDamage(entity: ICaster, target: BattleUnit): number {
        let value = 0;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.JobAddDamage)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { amount: number, job: number[] } = buff.effectParm1;
                if (entity.caster.career == target.career && (!effectParam.job || effectParam.job.indexOf(target.career) != -1))
                    value += effectParam.amount * buff.layer;
            }
        }
        return value / BattleConstantConfig.getRandBase;
    }

    /***更新移动BUFF的距离数据 */
    public updateMoveRemoveBuff(entity: BattleUnit, pos: Vec2): void {
        var buffList: MoveRemoveBuff[] = this.getBuffListByEffect(entity, BuffType.MoveRemoveBuff) as MoveRemoveBuff[];
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: MoveRemoveBuff = buffList[i];
                buff.updatePos(pos)
            }
        }
    }

    /****是否存在反伤BUFF */
    public checkCounterAttack(attackUnit: BattleUnit, entity: BattleUnit, damage: number): void {
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.CounterAttack)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                if (!attackUnit.isActive) {
                    return
                }
                var buff: SkillBuff = buffList[i];
                var effectParam: { amount: number, isAtk: number, isReal: number, hurtEffect: number } = buff.effectParm1
                let value = effectParam.isAtk == 1 ? Math.floor(entity.atk * (effectParam.amount / BattleConstantConfig.getRandBase)) : Math.floor(damage * (effectParam.amount / BattleConstantConfig.getRandBase))
                if (value > 0) {
                    let counterAttackDamage: DamageVo = PoolManager.getItem(DamageVo)
                    counterAttackDamage.status = BattleConstantConfig.CounterAttack;
                    counterAttackDamage.value = effectParam.isReal == 1 ? value : FightFormula.hurtToDef(value, entity, attackUnit);
                    counterAttackDamage.caster = entity;
                    counterAttackDamage.target = attackUnit;
                    counterAttackDamage.buffInfo = buff;
                    counterAttackDamage.skillInfo = buff.skillBehavior?.skill;
                    counterAttackDamage.hurtEffect = effectParam.hurtEffect;
                    counterAttackDamage.isRealHurt = effectParam.isReal == 1;
                    this.battleLogic.hurt(counterAttackDamage)
                }
            }
        }
    }

    /***技能释放时附加一定的属性 */
    public getSkillAttr(entity: ICaster, skillBehavior: SkillBehavior): { [attrId: number]: { value: number, per: number } } {
        if (skillBehavior?.skill instanceof SkillData) {
            var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.SkillAttr)
            if (buffList && buffList.length > 0) {
                var returnMap: { [attrId: number]: { value: number, per: number } } = {};

                for (var i: number = buffList.length - 1; i >= 0; i--) {
                    var buff: SkillBuff = buffList[i];
                    var effectParam: { skillIndex: number } = buff.effectParm1
                    if (effectParam.skillIndex == skillBehavior.skill.skillIndex) {
                        for (let attrKey in buff.effectParm1) {
                            const config = G.TableManager.getDataById(table.battle.AttributeConfig, attrKey);
                            if (config) {

                                if (!returnMap[config.tid]) {
                                    returnMap[config.tid] = { value: 0, per: 0 }
                                }
                                let attrData = returnMap[config.tid];

                                var value: number = returnMap[config.tid].value;//汇总属性
                                var per: number = returnMap[config.tid].per;

                                value += buff.effectParm1[attrKey] * buff.layer;

                                attrData.value = value;
                                attrData.per = per;
                            }
                        }
                    }
                    buff.active();
                }

                return returnMap;
            }
        }
        return null
    }

    /***
    * 是否存在改变BUFF的状态
    */
    private getChangeBuff(entity: ICaster, oldBuff: SkillBuff): SkillBuff {
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.ChangeBuff)
        if (buffList && buffList.length > 0) {
            var oldBuffTempId = oldBuff.cfg.group ? oldBuff.cfg.group : oldBuff.id;
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { newBuff: string, oldBuff: string, notReplace: number } = buff.effectParm1
                if (effectParam.oldBuff == oldBuffTempId) {
                    return buff;
                }
            }
        }
        return null
    }

    /***
   * 是否存在改变BUFF的持续时间
   */
    private getChangeBuffTime(entity: ICaster, oldBuff: SkillBuff): void {
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.ChangeBuffTime)
        if (buffList && buffList.length > 0) {
            var oldBuffTempId = oldBuff.cfg.group ? oldBuff.cfg.group : oldBuff.id;
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { time: number, oldBuff: string } = buff.effectParm1
                if (effectParam.oldBuff == oldBuffTempId) {
                    oldBuff.maxTime = BattleUtils.getFrameByTime(effectParam.time)
                    return;
                }
            }
        }
    }

    /***
* 是否存在改变BUFF的层数
*/
    private getChangeBuffLayer(entity: ICaster, group: string): number {
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.ChangeBuffLayer)
        if (buffList && buffList.length > 0) {
            var oldBuffTempId = group;
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { layer: number, oldBuff: string } = buff.effectParm1
                if (effectParam.oldBuff == oldBuffTempId) {
                    return effectParam.layer
                }
            }
        }
        return -1
    }


    /***是否存在因添加某个BUFF时再额外添加其他BUFF的状态 */
    private checkAddBuff(entity: ICaster, oldBuff: SkillBuff): void {
        var oldBuffTempId = oldBuff.cfg.group ? oldBuff.cfg.group : oldBuff.id;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.AddBuff)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { buff: string, oldBuff: string } = buff.effectParm1
                if (effectParam.oldBuff == oldBuffTempId) {
                    buff.nestedTimes++;
                    this.buffControlByTarget(buff, entity, effectParam.buff, oldBuff.target, oldBuff.skillBehavior)
                }
            }
        }
    }

    /***是否存在因添加某个BUFF时再复制BUFF */
    private checkCopyBuff(entity: ICaster, oldBuff: SkillBuff): void {
        var oldBuffTempId = oldBuff.cfg.group ? oldBuff.cfg.group : oldBuff.id;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.CopyBuff)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { oldBuff: string[] } = buff.effectParm1
                if (buff.nestedTimes == 0 && effectParam.oldBuff.indexOf(oldBuffTempId) != -1) {
                    buff.nestedTimes++;
                    this.buffControlByTarget(buff, entity, oldBuff.skillBuffGroup.cfg.id, oldBuff.target, oldBuff.skillBehavior)
                }
            }
        }
    }

    /***是否存在对某技能位置必定暴击BUFF */
    public hasCirtBuffBySkillIndex(entity: ICaster, skillIndex: number): boolean {
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.CritSkill)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { skillIndex: number } = buff.effectParm1
                if (effectParam.skillIndex == skillIndex) {
                    return true;
                }
            }
        }

        return false;
    }

    /***是否存在免疫暴击BUFF */
    public hasImmuneCriticalBuff(entity: BattleUnit, fighter: ICaster): boolean {
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.ImmuneCritical)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { buff: string } = buff.effectParm1
                if (effectParam && effectParam.buff) {
                    let target: BattleUnit
                    if (fighter instanceof BulletUnit) {
                        target = fighter.caster;
                    }
                    else if (fighter instanceof BattleUnit) {
                        target = fighter;
                    }
                    let targets = SkillUtils.skillTarget(buff.cfg.targetType, buff.cfg.targetFaction, entity, target, buff.cfg.range, buff.cfg.num, buff.cfg.targetParam)
                    if (targets) {
                        for (let i = 0; i < targets.length; i++) {
                            this.buffControlByGroup(effectParam.buff, entity, targets[i], buff.skillBehavior)
                        }
                    }
                }
                return true;
            }
        }
        return false;
    }

    /***减少多少的复活时间百分比 */
    public getReviveTimeBuff(entity: ICaster): number {
        let time = 0;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.ReviveTime)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { time: number } = buff.effectParm1;
                time += effectParam.time;
            }
        }

        return time;
    }

    /***获取当前嘲讽的施法者 */
    public getRidiculeTarget(entity: BattleUnit): BattleUnit {
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.Ridicule)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                if (buff.caster instanceof BattleUnit) {
                    if (buff.caster.isActive)
                        return buff.caster
                    else {
                        buff.isReadyToRemove = true;
                    }
                }
            }
        }
        return null
    }

    /***获取被魅惑的技能是否能释放 */
    public checkCharmSkill(entity: BattleUnit, skill: SkillData): boolean {
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.Charm)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { skillIndex: number } = buff.effectParm1;
                if (effectParam && effectParam.skillIndex != skill.skillIndex) {
                    return false;
                }
            }
        }
        return true
    }

    /***获取目标是否魅惑中 */
    public checkIsCharm(entity: BattleUnit): boolean {
        if (entity)
            return entity.attr.buffStatueByType(BuffType.Charm)
        return false;
    }

    /***获取当前被束缚的目标，优先攻击这个目标 */
    public getTieTarget(teamId: number): BattleUnit {
        let units = this.battleLogic.getUnitsByTeamId(teamId)
        for (let i = 0; i < units.length; i++) {
            let entity = units[i];
            if (entity.attr.buffStatueByType(BuffType.Tie)) {
                return entity;
            }
        }
        return null
    }

    /***获取技能的伤害系数变更值 */
    public getSkillAmount(damageValue: number, entity: ICaster, skillIndex: number, skillId: string): number {
        let value = damageValue;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.SkillAmount)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { amount: number, skillIndex: number, skillId: string } = buff.effectParm1;
                if (effectParam.skillIndex == skillIndex || effectParam.skillId == skillId) {
                    buff.active()
                    return effectParam.amount * buff.layer;
                }
            }
        }
        return value;
    }

    /***是否存在改变为真实伤害的BUFF */
    public hasChangeRealBuff(entity: ICaster): boolean {
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.ChangeReal)
        if (buffList && buffList.length > 0) {
            return true
        }
        return false
    }

    /***获取移动速度递减BUFF */
    public getMoveSpeed(entity: ICaster): number {
        let value = 0;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.MoveSpeed)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { amount: number } = buff.effectParm1;
                value += Math.floor(effectParam.amount * (1 - buff.time / buff.totalMaxTime))
            }
        }
        return value;
    }

    /***获取技能的伤害系数的加值 */
    public getAddSkillAmount(entity: ICaster, skillIndex: number, skillId: string): number {
        let value = 0;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.AddSkillAmount)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { amount: number, skillIndex: number, skillId: string } = buff.effectParm1;
                if (!buff.isReadyToRemove && (effectParam.skillIndex == skillIndex || effectParam.skillId == skillId)) {
                    buff.active()
                    value += effectParam.amount * buff.layer;
                }
            }
        }
        return value;
    }

    /***获取该技能是否无效 */
    public getInvalidSkill(entity: ICaster, skillIndex: number, skillId: string): boolean {
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.InvalidSkill)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                if (buff.checkBuffCanActive()) {
                    var effectParam: { skillIndex: number, skillId: string } = buff.effectParm1;
                    if (!buff.isReadyToRemove && (effectParam.skillIndex == skillIndex || effectParam.skillId == skillId)) {
                        buff.active()
                        return true
                    }
                }
            }
        }
        return false;
    }

    /***获取施法者治疗对方时，判断对方血量小于等于hp万分比则提升amount */
    public getHealHpAmount(entity: ICaster, target: BattleUnit): number {
        let value = 0;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.HealHpAmount)
        if (target?.isActive && buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { amount: number, hp: number } = buff.effectParm1;
                if (!buff.isReadyToRemove) {
                    let hpmax = target.hpMax;
                    let hpRate = target.hp / hpmax;
                    if (hpRate <= (effectParam.hp / BattleConstantConfig.getRandBase)) {
                        buff.active()
                        value += effectParam.amount * buff.layer;
                    }
                }
            }
        }
        return value / BattleConstantConfig.getRandBase;
    }

    /***对伤害类型增伤 */
    public getAddHurtByType(entity: ICaster, type: number): number {
        let value = 0;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.AddHurtByType)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { amount: number, type: number } = buff.effectParm1;
                if (effectParam.type == 0 || effectParam.type == type) {
                    value += effectParam.amount * buff.layer;
                }
            }
        }

        return value / BattleConstantConfig.getRandBase;
    }

    /***治疗溢出转护盾 */
    public getHealToShield(entity: ICaster, target: BattleUnit, addHp: number, healType: number): void {
        let value = addHp - (target.hpMax - target.hp);
        if (value > 1) {
            var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.HealToShield)
            if (buffList && buffList.length > 0) {
                for (var i: number = buffList.length - 1; i >= 0; i--) {
                    var buff: SkillBuff = buffList[i];
                    var effectParam: { amount: number, buff: string, type: number[] } = buff.effectParm1;
                    if (effectParam.type && effectParam.type.indexOf(healType) == -1) {
                        continue;
                    }
                    value = Math.floor(value * effectParam.amount / BattleConstantConfig.getRandBase);
                    let buffGroup = this.buffControlByGroup(effectParam.buff, entity, target, buff.skillBehavior);
                    for (let buffGroupItem of buffGroup.buffs) {
                        if (buffGroupItem instanceof ShieldBuff) {
                            buffGroupItem.addShield(value)
                        }
                    }
                }
            }
        }
    }

    /***对治疗类型增伤 */
    public getAddHealByType(entity: ICaster, type: number): number {
        let value = 0;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.AddHealByType)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { amount: number, type: number } = buff.effectParm1;
                if (effectParam.type == 0 || effectParam.type == type) {
                    value += effectParam.amount * buff.layer;
                }
            }
        }
        return value / BattleConstantConfig.getRandBase;
    }

    /***对BUFF伤害增伤 */
    public getBuffAddDamage(entity: ICaster, buffGroup: string): number {
        let value = 0;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.BuffAddDamage)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { amount: number, buffGroup: string } = buff.effectParm1;
                if (!buff.isReadyToRemove && effectParam.buffGroup == buffGroup) {
                    buff.active()
                    value += effectParam.amount * buff.layer;
                }
            }
        }
        return value;
    }

    /***一定几率重复发射字段 */
    public getDoubleMissile(entity: ICaster, skillIndex: number): { interval: number, num: number }[] {
        let value: { interval: number, num: number }[]
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.DoubleMissile)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { rand: number, interval: number, num: number, skillIndex: number, } = buff.effectParm1;
                if (effectParam.skillIndex == null || effectParam.skillIndex == skillIndex) {
                    buff.active()
                    if (this.battleLogic.randomMgr.isRandTrue(effectParam.rand)) {
                        if (!value)
                            value = []
                        value.push({ num: effectParam.num, interval: effectParam.interval || 0 })
                    }
                }
            }
        }
        return value;
    }

    /***对远程或近战减伤 */
    public getRangedMeleeDamage(entity: ICaster, target: BattleUnit): number {
        let value = 0;
        if (!entity)
            return value;

        var buffList: SkillBuff[] = this.getBuffListByEffect(target, BuffType.RangedMeleeDamage)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { ranged: number, melee: number } = buff.effectParm1;
                let dis = MathUtils.distance(entity.pos, target.pos);
                if (dis > BattleConstantConfig.distanceValue) {
                    //远程防御
                    if (effectParam?.melee) {
                        value += effectParam.melee
                    }
                }
                else {
                    //近战防御
                    if (effectParam?.ranged) {
                        value += effectParam.melee
                    }
                }
            }
        }
        return value / BattleConstantConfig.getRandBase;
    }

    /***根据不同条件类型进行减伤，且的关系 */
    public getConditionAddDamage(entity: ICaster, target: BattleUnit): number {
        let value = 0;
        if (!entity)
            return value;

        var buffList: SkillBuff[] = this.getBuffListByEffect(target, BuffType.ConditionAddDamage)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { amount: number, career: number[], attackRange: string } = buff.effectParm1;
                if ((!effectParam.career || effectParam.career.indexOf(entity.caster?.caster?.career) != -1)
                    || (!effectParam.attackRange || entity.caster?.caster?.getAttackRange() == effectParam.attackRange)) {
                    value += effectParam.amount;
                }
            }
        }
        return value / BattleConstantConfig.getRandBase;
    }

    /***target拥有1个entity对target增伤的BUFF */
    public getToTargetAddHurt(entity: ICaster, target: BattleUnit): number {
        let value = 0;
        if (!entity)
            return value;

        var buffList: SkillBuff[] = this.getBuffListByEffect(target, BuffType.ToTargetAddHurt)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { amount: number } = buff.effectParm1;
                if (buff.caster == entity) {
                    value += effectParam.amount
                }
            }
        }
        return value / BattleConstantConfig.getRandBase;
    }

    /***target拥有1个entity减伤的BUFF */
    public getToTargetSubHurt(entity: ICaster, target: BattleUnit): number {
        let value = 0;
        if (!entity)
            return value;

        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.ToTargetSubHurt)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { amount: number } = buff.effectParm1;
                if (buff.caster == target) {
                    value += effectParam.amount
                }
            }
        }
        return value / BattleConstantConfig.getRandBase;
    }

    /***存在某个BUFF(buff)攻击BUFF携带者时减伤amount */
    public getToTargetSubHurtByBuff(entity: ICaster, target: BattleUnit): number {
        let value = 0;
        if (!entity)
            return value;

        var buffList: SkillBuff[] = this.getBuffListByEffect(target, BuffType.ToTargetSubHurtByBuff)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { amount: number, buff: string } = buff.effectParm1;
                if (entity.caster?.attr.hasGroupBuff(effectParam.buff)) {
                    value += effectParam.amount
                }
            }
        }
        return value / BattleConstantConfig.getRandBase;
    }

    /***对异常类型增伤 */
    public getAddHurtByAbnormal(entity: ICaster, target: BattleUnit, skillIndex: number = null): number {
        let value = 0;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.AddHurtByAbnormal)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { amount: number, type?: number[], group?: string; skillIndex?: number } = buff.effectParm1;
                var targetBuffList: SkillBuff[] = this.getBuffListByEffect(target)
                for (let j: number = 0; j < targetBuffList.length; j++) {
                    if (effectParam.skillIndex == null || effectParam.skillIndex == skillIndex) {
                        if (effectParam.group && BattleConstantConfig.checkAbnormalType(effectParam.group, targetBuffList[j].cfg.abnormalType + "")) {
                            value += effectParam.amount * buff.layer;
                        }

                        if (effectParam.type && targetBuffList[j].cfg.abnormalType && effectParam.type.indexOf(targetBuffList[j].cfg.abnormalType) != -1) {
                            value += effectParam.amount * buff.layer;
                        }
                    }
                }
            }
        }
        return value / BattleConstantConfig.getRandBase;
    }

    /***受到技能栏位增伤skillIndex;amount:1000 */
    public getAddHurtBySkill(entity: ICaster, skillIndex: number = null): number {
        let value = 0;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.AddHurtBySkill)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { amount: number, skillIndex: number } = buff.effectParm1;
                if (effectParam.skillIndex == null || effectParam.skillIndex == skillIndex) {
                    value += effectParam.amount * buff.layer;
                }
            }
        }
        return value / BattleConstantConfig.getRandBase;
    }

    /***判断技能是否受攻速影响 */
    public isSkillBeAttackSpeed(entity: ICaster, skillIndex: number): boolean {
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.SkillBeAtkSpeed)
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { skillIndex: number } = buff.effectParm1;
                if (effectParam.skillIndex == skillIndex) {
                    return true;
                }
            }
        }
        return false;
    }

    /***获取对应光环的amount增加值 */
    public getHaloAddAmount(entity: ICaster, halo: string): number {
        let value: number = 0;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.AddHaloAmount);
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { addAmount: number, halo: string } = buff.effectParm1;
                if (halo == effectParam.halo) {
                    value += effectParam.addAmount;
                }
            }
        }
        return value;
    }

    /***延迟守护BUFF */
    public getDelayGuardHurt(entity: ICaster, fighter: ICaster, damage: number): number {
        let value = damage;
        let selfUnits = this.battleLogic.getUnitsByTeamId(entity.teamId)
        for (let k = 0; k < selfUnits.length; k++) {
            if (selfUnits[k].isActive && selfUnits[k] != entity) {
                var buffList: SkillBuff[] = this.getBuffListByEffect(selfUnits[k], BuffType.DelayGuard);
                if (buffList && buffList.length > 0) {
                    for (var i: number = buffList.length - 1; i >= 0; i--) {
                        var buff: DelayGuardBuff = buffList[i] as DelayGuardBuff;
                        var effectParam: { amount: number, time: number } = buff.effectParm1;
                        if (effectParam?.amount) {
                            let entityHurt = Math.floor(value * (1 - effectParam.amount / BattleConstantConfig.getRandBase));//受击者的伤害
                            let guardHurt = value - entityHurt; //承伤者的伤害
                            value = entityHurt;//剩余的伤害
                            buff.addHurt(guardHurt)
                            if (value <= 0)
                                return value;
                        }
                    }
                }
            }
        }
        return value;
    }

    /***守护BUFF */
    public getGuardHurt(entity: ICaster, fighter: ICaster, damage: number): number {
        let value = damage;
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.Guard);
        if (buffList && buffList.length > 0) {
            SortUtils.sortBy3(buffList, [["effectParm1", "amount"]], [[true]], false);//取最大的
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: GuardBuff = buffList[i] as GuardBuff;
                var effectParam: { amount: number } = buff.effectParm1;
                if (effectParam?.amount && buff.caster.caster.isActive) {
                    let entityHurt = Math.floor(value * (1 - effectParam.amount / BattleConstantConfig.getRandBase));//受击者的伤害
                    let guardHurt = value - entityHurt; //承伤者的伤害
                    let counterAttackDamage: DamageVo = PoolManager.getItem(DamageVo)
                    counterAttackDamage.status = BattleConstantConfig.Guard;
                    counterAttackDamage.value = guardHurt;
                    counterAttackDamage.caster = fighter;
                    counterAttackDamage.target = buff.caster.caster;
                    counterAttackDamage.buffInfo = buff;
                    counterAttackDamage.skillInfo = buff.skillBehavior?.skill;
                    this.battleLogic.hurt(counterAttackDamage)

                    value = entityHurt;//剩余的伤害
                    if (value <= 0)
                        break;
                }
            }
        }
        return value;
    }

    /***
     * 是否在免疫技能子类型的范围内
     * damageType 1是伤害
     * damageType 2是buff
     *  */
    public getHasNotHurtBySkillSubType(target: BattleUnit, skillSubType: SkillSubType, damageType: number): boolean {
        var buffList: SkillBuff[] = this.getBuffListByEffect(target, BuffType.NotHurtBySkillSubType);
        if (buffList && buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { subType: number, rate: number, notBuff: number, notHurt: number } = buff.effectParm1;
                let rate = effectParam?.rate || 0;
                if (effectParam?.notBuff == 1 && damageType == 2) {
                    continue;
                }

                if (effectParam?.notHurt == 1 && damageType == 1) {
                    continue;
                }

                if (effectParam.subType == null || +effectParam.subType == -1 || SkillUtils.checkSkillSubType(effectParam.subType, skillSubType)) {
                    if (!rate || this.battleLogic.randomMgr.isRandTrue(rate)) {
                        //概率触发
                        buff.active()
                        return true
                    }
                }
            }
        }
        return false;
    }

    /***护盾加成 */
    public getShieldAddValue(value: number, entity: BattleUnit): number {
        let n = 0;
        if (entity) {
            var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.AddShield);
            if (buffList && buffList.length > 0) {
                for (var i: number = buffList.length - 1; i >= 0; i--) {
                    var buff: SkillBuff = buffList[i];
                    var effectParam: { amount: number } = buff.effectParm1;
                    if (effectParam?.amount) {
                        n += effectParam.amount;
                    }
                }
            }
        }
        return Math.floor(value * (1 + n / BattleConstantConfig.getRandBase));
    }

    /**
        * 是否有盾
        */
    public isHaveShield(entity: BattleUnit): boolean {
        return entity.attr.buffStatueByType(BuffType.ShieldAtk) || entity.attr.buffStatueByType(BuffType.ShieldMaxHp) || entity.attr.buffStatueByType(BuffType.ShieldTargetMaxHpBuff) || entity.attr.buffStatueByType(BuffType.Shield)
    }

    /**
            * 是否有治疗盾（阻碍治疗）
            */
    public isHaveHealShield(entity: BattleUnit): boolean {
        return entity.attr.buffStatueByType(BuffType.SuddenDeath)
    }

    /**
   * 更新治疗护盾的HP
   */
    public updateHealShieldHp(entity: BattleUnit, heal: number): number {
        if (!this.isHaveHealShield(entity)) {
            //不存在直接返回
            return heal
        }

        //累计扣除的护盾数值
        var shildHp: number = 0
        var buffList: SuddenDeathBuff[] = this.getBuffListByEffects(entity, [BuffType.SuddenDeath]) as SuddenDeathBuff[]
        if (!buffList)
            return

        for (var i: number = buffList.length - 1; i >= 0; i--) {
            var buff: SuddenDeathBuff = buffList[i];
            if (buff.hp > 0) {
                var old: number = heal
                heal -= buff.hp;//抵消伤害

                var oldBuffHp: number = buff.hp;
                buff.hp -= old;//护盾HP减少
                shildHp += Math.min(oldBuffHp, old);
                if (buff.hp <= 0) {
                    //护盾无血了
                    buff.hp = 0;
                    if (entity) {
                        //移除BUFF
                        entity.attr.removeBuffById(buff.id)
                    }
                }

                if (heal <= 0) {
                    //受伤的伤害都无了，直接break出去
                    heal = 0;
                    break;
                }
            }
        }
        return heal
    }

    /**
    * 更新护盾的HP
    */
    public updateShieldHp(entity: BattleUnit, damage: number): number {
        if (!this.isHaveShield(entity)) {
            //不存在直接返回
            return damage
        }

        //累计扣除的护盾数值
        var shildHp: number = 0
        var buffList: ShieldAtkBuff[] = this.getBuffListByEffects(entity, [BuffType.ShieldAtk, BuffType.ShieldMaxHp, BuffType.ShieldTargetMaxHpBuff, BuffType.Shield]) as ShieldAtkBuff[]
        if (!buffList)
            return

        for (var i: number = buffList.length - 1; i >= 0; i--) {
            var buff: ShieldAtkBuff = buffList[i];
            if (buff.hp > 0) {
                var old: number = damage
                damage -= buff.hp;//抵消伤害

                var oldBuffHp: number = buff.hp;
                buff.hp -= old;//护盾HP减少
                shildHp += Math.min(oldBuffHp, old);
                if (buff.hp <= 0) {
                    //护盾无血了
                    buff.hp = 0;
                    if (entity) {
                        //移除BUFF
                        entity.attr.removeBuffById(buff.id)
                    }
                }

                if (damage <= 0) {
                    //受伤的伤害都无了，直接break出去
                    damage = 0;
                    break;
                }
            }
        }

        if (shildHp > 0) {
            this.battleLogic.effectMgr.createNum(HurtNumType.ShieldNum, -shildHp, entity.pos, entity.modelHeight);
        }
        return damage
    }

    /***死亡时检查元素递归BUFF */
    public checkElementRecursionBuffByDie(entity: BattleUnit): void {
        var buffList: SkillBuff[] = this.getBuffListByEffect(entity, BuffType.ElementRecursion)
        if (buffList && buffList.length > 0) {
            let buffGroups: SkillBuff[] = [];
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                var buff: SkillBuff = buffList[i];
                var effectParam: { type: string, dieTransfer: number } = buff.effectParm1;
                if (effectParam?.type == "xingjue" && effectParam?.dieTransfer)
                    ArrayUtils.iPush(buffGroups, buff);
            }
            if (buffGroups.length > 0) {
                buffGroups = this.battleLogic.randomMgr.randomAry(buffGroups)
                //获取附近可传递的对象
                let randomUnits = SkillUtils.skillTarget(buffGroups[0].cfg.targetType, buffGroups[0].cfg.targetFaction, buffGroups[0].target, entity, buffGroups[0].cfg.range, buffGroups[0].cfg.num);
                for (let i = 0; i < buffGroups.length; i++) {
                    if (!buffGroups[i].isReadyToRemove) {
                        let buffParam: { type: string, value: number } = buffGroups[i].effectParm1;
                        if (buffParam?.type == "xingjue") {
                            buffGroups[i].isReadyToRemove = true;
                            while (randomUnits?.length) {
                                let newUnit = randomUnits.shift();
                                if (!newUnit.isActive || newUnit.uid == entity.uid) {
                                    continue
                                }
                                this.battleLogic.buffMgr.buffControlByGroup(buffGroups[i].skillBuffGroup.cfg.id, buffGroups[i].caster, newUnit, buffGroups[i].skillBehavior)
                                break
                            }
                        }
                    }
                }
            }
        }
    }

    /***根据BUFF类型获取BUFF列表 */
    public getBuffListByEffect(entity: ICaster, effect: string = ""): SkillBuff[] {
        if (entity instanceof BulletUnit) {
            entity = entity.caster;
        }

        if (entity instanceof BattleUnit) {
            if (effect != "" && (!entity.attr || !entity.attr.buffStatueByType(effect))) {
                return null;
            }

            var arr: SkillBuff[] = [];
            var buffList: SkillBuff[] = entity.attr.buffs;//获取buff列表
            if (buffList.length > 0) {
                for (var i: number = buffList.length - 1; i >= 0; i--) {
                    if (!buffList[i].isReadyToRemove && (effect == "" || buffList[i].effectType == effect)) {
                        arr.push(buffList[i])
                    }
                }
            }
            return arr;
        }
        return null;
    }

    /***根据一系列BUFF类型获取BUFF列表 */
    public getBuffListByEffects(fight: BattleUnit, effects: string[]): SkillBuff[] {
        let has = false;
        for (let i = 0; i < effects.length; i++) {
            if (fight.attr.buffStatueByType(effects[i])) {
                has = true;
                break
            }
        }

        if (!has)
            return null;

        var arr: SkillBuff[] = [];
        var buffList: SkillBuff[] = fight.attr.buffs;//获取buff列表
        if (buffList.length > 0) {
            for (var i: number = buffList.length - 1; i >= 0; i--) {
                if (!buffList[i].isReadyToRemove && effects.indexOf(buffList[i].effectType) != -1) {
                    arr.push(buffList[i])
                }
            }
        }
        return arr;
    }

    /***检查BUFF */
    public update(): void {
        let buffs = this.buffs;
        if (buffs.length) {
            for (var i: number = 0; i < buffs.length; i++) {
                let buffInfo: SkillBuff = buffs[i]
                if (buffInfo.isReadyToRemove) {
                    this.buffs.splice(i, 1);
                    i--;
                }
                else
                    buffInfo.nextFrame();
            }
        }

        for (let group in this.buffGroupMap) {
            this.buffGroupMap[group].checkBreak()
        }
    }

    /**组别的BUFF唯一ID */
    public buffGroupUidIndex: number = 0
    /***
     * 按组别添加BUFF
     * notHero 非英雄产生的BUFF
     *  */
    public buffControlByGroup(group: string, fighter: ICaster, targetEntity: BattleUnit, behavior?: SkillBehavior, ex?: { notHero?: boolean, includeDie?: boolean }, data?: any): SkillBuffGroup {
        if (!targetEntity.isActive && (!ex || !ex.includeDie))
            return;

        if (fighter.teamId != targetEntity.teamId && this.battleLogic.buffMgr.getHasNotHurtBySkillSubType(targetEntity, behavior?.skill?.getSubType(), 2)) {
            //判断是否免疫伤害
            targetEntity.showUnit()?.showOtherNum("zudang")
            return null
        }

        if (fighter.teamId != targetEntity.teamId && this.battleLogic.haloMgr.getHasNotHurtBySkillSubType(targetEntity, behavior?.skill?.getSubType())) {
            //判断是否免疫伤害
            targetEntity.showUnit()?.showOtherNum("zudang")
            return null
        }

        var buffCfgs = TableManager.getDataById(table.battle.BuffGroupConfig, group);
        if (buffCfgs && buffCfgs.buff && buffCfgs.buff.length > 0) {
            var buffGroupInfo = new SkillBuffGroup(buffCfgs)
            buffGroupInfo.uid = ++this.buffGroupUidIndex;
            buffGroupInfo.target = targetEntity;
            buffGroupInfo.from = fighter
            buffGroupInfo.behavior = behavior
            this.buffGroupMap[buffGroupInfo.uid] = buffGroupInfo;
            for (let i = 0; i < buffCfgs.buff.length; i++) {
                var buffId = buffCfgs.buff[i]
                this.buffControlByBuffId(buffGroupInfo, buffId, fighter, targetEntity, behavior, ex, data)
            }

            if (buffGroupInfo.isShowEffect()) {
                if (buffCfgs.param?.delay) {
                    this.battleLogic.createTimeCheck(buffCfgs.param.delay, new Handler(this, this.addBuffEffectHandler, [buffGroupInfo, targetEntity]))
                }
                else
                    this.addBuffEffectHandler(buffGroupInfo, targetEntity)

            }
            if (buffGroupInfo.hasBuff) { //触发BUFF
                buffGroupInfo.active()
                PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_8, fighter as BattleUnit, fighter as BattleUnit, group);

            }
            buffGroupInfo.isAddToRemove = false;

            return buffGroupInfo
        }
    }

    protected addBuffEffectHandler(buffGroupInfo: SkillBuffGroup, targetEntity: BattleUnit): void {
        if (buffGroupInfo.cfg.modelId && buffGroupInfo.cfg.animPosType != BuffEffectPos.OnceForAct) {
            this.battleLogic.command.send(BattleCommandType.addBuffEff, targetEntity.uid, buffGroupInfo.cfg.modelId, buffGroupInfo.cfg.upLow1, buffGroupInfo.cfg.animPosType)
        }
        if (buffGroupInfo.cfg.modelId2 && buffGroupInfo.cfg.animPosType2 != BuffEffectPos.OnceForAct) {
            this.battleLogic.command.send(BattleCommandType.addBuffEff, targetEntity.uid, buffGroupInfo.cfg.modelId2, buffGroupInfo.cfg.upLow1, buffGroupInfo.cfg.animPosType2)
        }
    }


    /***
     * 添加BUFF
     * targetFaction 目标阵营 TargetFaction
     * targetType 目标类型 SkillTargetType
     * targetParam 类型参数
     * num 作用数量
     * fighter 施法者
     * targetEntity 受击目标
     *  */
    private buffControlByBuffId(buffGroupInfo: SkillBuffGroup, buffId, fighter: ICaster, targetEntity: BattleUnit, behavior?: SkillBehavior, ex?: { notHero?: boolean, includeDie?: boolean }, data?: any): void {
        let buffCfg: table.battle.BuffConfig = TableManager.getDataById(table.battle.BuffConfig, buffId);
        if (!buffCfg)
            return

        let buff = this.addBuff(buffCfg.id, targetEntity, fighter, buffGroupInfo, behavior, ex, data);
        if (buff && buff.isAlive()) {
            this.buffGroupMap[buffGroupInfo.uid].addBuff(buff)
        }
        // if (skillTargets && skillTargets.length > 0) {
        //     for (var i: number = 0; i < skillTargets.length; i++) {
        //         if (!buffCfg.notSelf || fighter.casterUid != skillTargets[i].uid)

        //     }
        // }
    }

    /***
     * 根据选取条件添加BUFF
     * conditionBuff 根据这个BUFF的选取条件
     * fighter 触发者
     * 将要添加的BUFF组别
     */
    public buffControlByTarget(conditionBuff: SkillBuff, fighter: ICaster, buffGroup: string, target: BattleUnit, behavior?: SkillBehavior): void {
        let targetType = conditionBuff.cfg.targetType;
        let skillTargets = SkillUtils.skillTarget(targetType, conditionBuff.cfg.targetFaction, fighter, target, conditionBuff.cfg.range || 300, conditionBuff.cfg.num || 999, conditionBuff.cfg.targetParam);
        if (skillTargets && skillTargets.length > 0) {
            for (var i: number = 0; i < skillTargets.length; i++) {
                if (!conditionBuff.cfg.notSelf || fighter.casterUid != skillTargets[i].uid) {
                    this.buffControlByGroup(buffGroup, fighter, skillTargets[i], behavior)
                }
            }
        }
    }

    /***移除buff时判断组别是否需要清除 */
    public removeUpdateBuffGroup(buff: SkillBuff): void {
        var buffGroup = this.buffGroupMap[buff.buffGroupUid]
        if (buffGroup) {
            if (buffGroup.removeBuffById(buff.id) && buffGroup.buffIds.length == 0)
                delete this.buffGroupMap[buff.buffGroupUid];
        }
    }

    public getBuffGroupByGroup(group: string, uid: number): SkillBuffGroup[] {
        let arr: SkillBuffGroup[] = [];
        for (let key in this.buffGroupMap) {
            if (this.buffGroupMap[key].cfg.id == group && this.buffGroupMap[key].target.uid == uid) {
                arr.push(this.buffGroupMap[key])
            }
        }
        return arr
    }

    /***查找目标身上是否存在某个buffgroupId */
    public checkBuffGroupInTarget(group: string, target: BattleUnit): boolean {
        if (target) {
            for (let key in this.buffGroupMap) {
                if (this.buffGroupMap[key].cfg.id == group && this.buffGroupMap[key].target?.uid == target.uid) {
                    return true;
                }
            }
        }
        return false
    }

    public getBuffGroupByGroupUid(buffGroupUid: number): SkillBuffGroup {
        return this.buffGroupMap[buffGroupUid]
    }

    /***通过标记类型获取其中1个BUFF组别 */
    public getBuffGroupByFlag(flag: number, target: BattleUnit): SkillBuffGroup {
        for (let key in this.buffGroupMap) {
            if (this.buffGroupMap[key].cfg.flag == flag && this.buffGroupMap[key].target == target) {
                return this.buffGroupMap[key]
            }
        }
        return null;
    }

    /***通过标记类型获取全部BUFF组别 */
    public getAllBuffGroupByFlag(flag: number, target: BattleUnit): SkillBuffGroup[] {
        let arr = [];
        for (let key in this.buffGroupMap) {
            if (this.buffGroupMap[key].cfg.flag == flag && this.buffGroupMap[key].target == target) {
                arr.push(this.buffGroupMap[key])
            }
        }

        return arr;
    }
}