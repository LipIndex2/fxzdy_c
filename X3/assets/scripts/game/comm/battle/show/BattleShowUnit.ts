import { Graphics, math, sp, tween, v2, Vec2, Vec3 } from "cc";
import * as fgui from "fairygui-cc";
import { ScreenAdaptManager } from "../../../../core/comm/ScreenAdaptManager";
import { Logger } from "../../../../core/log/Logger";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import { TableManager } from "../../../../core/table/TableManager";
import BattleTimer from "../../../../core/timer/BattleTimer";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { Handler } from "../../../../core/utils/Handler";
import { MathUtils } from "../../../../core/utils/MathUtils";
import RandomUtils from "../../../../core/utils/RandomUtils";
import NotificationKey from "../../../event/NotificationKey";
import { HeroCareerType } from "../../../modules/hero/HeroEnum";
import { HeroManager } from "../../../modules/hero/HeroManager";
import { WorldManager } from "../../world/WorldManager";
import { BattleCommandType } from "../BattleCommand";
import { BattleDebugManager } from "../BattleDebugManager";
import { BattleUtils } from "../BattleUtils";
import UnitSearchUtils from "../collisions/UnitSearchUtils";
import { InterpolationMoveComp } from "../comp/InterpolationMoveComp";
import BattleConstantConfig from "../config/BattleConstantConfig";
import BattleSetting from "../config/BattleSetting";
import { DamageVo } from "../DamageVo";
import { ActorState, DirctionType, HurtNumType } from "../enum/BattleEnum";
import { FightType } from "../enum/FightType";
import BattleShowFactory from "../factory/BattleShowFactory";
import { FightTimeLoop } from "../FightTimeLoop";
import { ActorUnitNode } from "../node/ActorUnitNode";
import { AnimBaseUnitNode } from "../node/AnimBaseUnitNode";
import { SkillBehavior } from "../skill/SkillBehavior";
import { SkillBuff } from "../skill/SkillBuff";
import { SkillData } from "../skill/SkillData";
import { AbnormalType, BuffEffectPos, BuffType, EffectLayer, PassivitySkillFlag, SkillEffectPos, SkillSubType, SkillType, TargetFaction } from "../skill/SkillEnum";
import { SkillUtils } from "../skill/SkillUtils";
import { HpBar } from "../ui/HpBar";
import { BattleUnit } from "../unit/battle/BattleUnit";
import { ShowUnit } from "./ShowUnit";
import UnitFactory from "../factory/UnitFactory";

export class BattleShowUnit extends ShowUnit {

    protected shadow: ui.commBattle.battleComp.BattleShadowBigComp;
    protected _hpBar: HpBar;

    public unitData: BattleUnit;
    protected debugGraphics: Graphics


    /***跟随移动的特效 */
    private skillMoveEffectArr: AnimBaseUnitNode[] = []
    /***会打断的特效 */
    private skillStopEffectArr: AnimBaseUnitNode[] = []
    /***在正常结束不会打断的特效 */
    private skillNormalNotStopEffectArr: AnimBaseUnitNode[] = []
    /***buff的特效列表 */
    protected buffEffs: { [url: number]: AnimBaseUnitNode } = {}
    /***buff的特效引用次数记录列表 */
    protected buffEffNameMap: { [url: number]: number } = {};

    /***初始化监听的战斗指令 */
    protected initCommand(): void {
        super.initCommand();
        this.unitData.battleLogic.command.reg(BattleCommandType.showTalk, this.uid, new Handler(this, this.showTalk))
        this.unitData.battleLogic.command.reg(BattleCommandType.updateHp, this.uid, new Handler(this, this.updateHpBar))
        this.unitData.battleLogic.command.reg(BattleCommandType.attack, this.uid, new Handler(this, this.attack))
        this.unitData.battleLogic.command.reg(BattleCommandType.changeMoveAttack, this.uid, new Handler(this, this.changeMoveAttackAction))
        this.unitData.battleLogic.command.reg(BattleCommandType.hurt, this.uid, new Handler(this, this.hurt))
        this.unitData.battleLogic.command.reg(BattleCommandType.onDie, this.uid, new Handler(this, this.onDie))
        this.unitData.battleLogic.command.reg(BattleCommandType.exitFight, this.uid, new Handler(this, this.onExitFight))


        this.unitData.battleLogic.command.reg(BattleCommandType.createFightEffect, this.uid, new Handler(this, this.createFightEffect))
        this.unitData.battleLogic.command.reg(BattleCommandType.addBuff, this.uid, new Handler(this, this.addBuff))
        this.unitData.battleLogic.command.reg(BattleCommandType.updateBuff, this.uid, new Handler(this, this.updateBuff))
        this.unitData.battleLogic.command.reg(BattleCommandType.removeBuff, this.uid, new Handler(this, this.removeBuff))
        this.unitData.battleLogic.command.reg(BattleCommandType.addBuffEff, this.uid, new Handler(this, this.addBuffEff))
        this.unitData.battleLogic.command.reg(BattleCommandType.clearBuffEff, this.uid, new Handler(this, this.clearBuffEff))

        this.unitData.battleLogic.command.reg(BattleCommandType.attackComplete, this.uid, new Handler(this, this.attackActionComplete))
        this.unitData.battleLogic.command.reg(BattleCommandType.beginCharge, this.uid, new Handler(this, this.beginCharge))
        this.unitData.battleLogic.command.reg(BattleCommandType.updateCharge, this.uid, new Handler(this, this.updateChargedHandler))
        this.unitData.battleLogic.command.reg(BattleCommandType.endCharge, this.uid, new Handler(this, this.endCharge))
    }

    public onInitData(): void {
        super.onInitData()
        this._hpBar = new HpBar(this);
        this.createShadow();
        this.initShowHpBar();
        if (this.unitData.summon)
            this.showSummonEffect()
    }

    private showSummonEffect(): void {
        if (!this.unitData.summon)
            return

        if (this.unitData.summon.effect) {
            let upModel: number[] = this.unitData.summon.effect.modelIds?.up;
            if (upModel)
                for (let i = 0; i < upModel.length; i++) {
                    this.createFightEffect(+upModel[i], this.unitData.summon.effect.animPosType, this.unitData, EffectLayer.RoleLayer, false, this.unitData.dirction)
                }

            let lowModel: number[] = this.unitData.summon.effect.modelIds?.low;
            if (lowModel)
                for (let i = 0; i < lowModel.length; i++) {
                    this.createFightEffect(+lowModel[i], this.unitData.summon.effect.animPosType, this.unitData, EffectLayer.BgLayer, false, this.unitData.dirction)
                }
        }
        else {
            this.createFightEffect(10010001, SkillEffectPos.Player_Move, this.unitData, EffectLayer.BgLayer, false, this.unitData.dirction)
            this.createFightEffect(10010002, SkillEffectPos.Player_Move, this.unitData, EffectLayer.RoleLayer, false, this.unitData.dirction)
        }

        if (this.unitData.summon.delay) {
            this.node.fadeIn(this.unitData.summon.delay)
        }
    }

    public setSpineNode(node: AnimBaseUnitNode) {
        super.setSpineNode(node);
        this.interpolationMoveComp = new InterpolationMoveComp(BattleTimer.battleTickFrame, new Handler(this, this.onInterpolationMove, null, false))
        // if (node instanceof ActorUnitNode)
        //     node.setCacheMode(sp.AnimationCacheMode.REALTIME)
        node.setCompleteListener((aniName: string) => {
            this.nodeActionComplete(aniName)
        });
        if (BattleDebugManager.ins().isDebug)
            this.debugGraphics = WorldManager.ins().roleLayer.addComponent(Graphics)
        this.update()
    }

    protected onSpineLoaded(): void {
        super.onSpineLoaded();
        this.updateShadowImgScale();
    }

    setState(state: ActorState, anim?: string, timeScale?: number, directionParm: number = 0, loopType: number = 0) {
        if (state == ActorState.Running && !this.unitData.attr.canMove()) {
            return
        }
        super.setState(state, anim, timeScale, directionParm, loopType)
    }

    public update(): void {
        super.update();
        this.checkPetrifaction()
        this.updateShadowPos();
        this.updateHpBarPos();
        this.updateSkillMovePos();
        this.updateBuffEffectPos();

        if (this.debugGraphics && this.unitData.skillInfo) {
            let g = this.debugGraphics
            g.clear()
            g.lineWidth = 5;
            g.strokeColor.fromHEX('#ff0000')
            g.circle(this.unitData.atkPoint.x, this.unitData.atkPoint.y, 10)
            g.stroke();
            g.fill();
        }
    }

    /***判断是否石化状态，石化要暂停逻辑并暂停动画，之后恢复 */
    private checkPetrifaction(): boolean {
        if (this.unitData.attr.isPetrifaction() || this.unitData.attr.isTimeStop() || this.unitData.attr.isFrost()) {
            this.node.pause()
            if (!this.unitData.attr.isFrost())
                this.node.setColor(math.color(100, 100, 100))
            else {
                this.node.setColor(math.color(0, 255, 224))
            }
            return true
        }
        else if (this.node.isPasue()) {
            this.node.resume()
            this.node.setColor(math.color(255, 255, 255))
        }
        return false
    }

    protected get moveAction(): string {
        if (this.unitData.career == HeroCareerType.HeavyCavalry && this.unitData.attr.getPassiveSkillFlag(PassivitySkillFlag.PRider_Collision_s01)) {
            let skill = this.unitData.attr.getSkillByIndex(0, true)
            if (skill && UnitSearchUtils.getNearestBattleUnit(this.unitData, SkillUtils.getTeamIdByFaction(this.unitData.teamId, TargetFaction.EnemySide), skill.castingRange)) {
                return "attack2";//特殊处理重骑，有冲锋被动的时候转换为冲锋动作
            }
        }
        return "move"
    }

    protected initShowHpBar(): void {
        if (BattleSetting.playingMethod != FightType.TRUNK_MAP
            && BattleSetting.playingMethod != FightType.SECRET_INSTANCE
            && BattleSetting.playingMethod != FightType.LEAGUE_EXPLORE_MAP
            && BattleSetting.playingMethod != FightType.PET_DUNGEON_MAP) {
            this.updateHpBar()
        }
    }

    protected updateHpBar(): void {
        if (this.isEdgeHide == 2)
            return

        if (this._hpBar) {
            if (!this.unitData.summon || !this.unitData.summon.possess) {
                this._hpBar.hpPercentage = this.unitData.attr.hpPercentage;
            }
        }
    }

    public showTalk(str: string, delay: number = 0): void {
        let spineNode = this._spineNode;
        if (spineNode && str) {
            GameTimer.ins().once(delay, this, () => {
                if (spineNode && spineNode instanceof ActorUnitNode && spineNode.isValid)
                    spineNode.showTalkComp(str, WorldManager.ins().uiLayer)
            })
        }
    }

    protected updateHpBarPos(): void {
        if (this._hpBar)
            this._hpBar.setPosition(this.nowPosVec.x, this.nowPosVec.y);
    }

    protected hurt(damageVo: DamageVo) {
        if (!this.unitData.attr.isPetrifaction() && !this.unitData.attr.isFrost() && !this.unitData.attr.isTimeStop())
            this._spineNode.colorDelay()
    }

    private isCharged: boolean = false
    protected attack(): void {
        let isShowEffect: boolean = true;
        let skill = this.unitData.skillInfo;
        if (!skill)
            return

        if (!this.unitData.selectMainTarget)
            return

        //方向
        let angle = MathUtils.getAngle(this.unitData.pos.x, this.unitData.pos.y, this.unitData.selectMainTarget.pos.x, this.unitData.selectMainTarget.pos.y);
        let animData = this.checkAnimAction();

        //旋转骨骼
        this.changeBoneRoatrion(skill, angle);

        let atkTimeScale = null;
        if (this.chargedBeginAction) {
            //释放蓄力前置动作
            this.setState(ActorState.Attack, this.chargedBeginAction.anim, null, this.unitData.isAttackBack ? 1 : 0, 1);
            this.showSkillEfect(this.chargedBeginAction, angle, null);
            isShowEffect = false;
        }
        else if (!this.isCharged && this.unitData.charged) {
            //释放蓄力动作
            this.setChargeAction();
            isShowEffect = false;
        }
        else {
            if (skill.castTime) {
                if (skill.type == SkillType.ATTACK) {
                    //普攻 计算攻速
                    atkTimeScale = this.unitData.getSkillAtkSpeed(this.unitData.atkTimeScale, skill)
                    this.setState(ActorState.Attack, animData.anim, atkTimeScale, this.unitData.isAttackBack ? 1 : 0);
                } else {
                    //技能
                    atkTimeScale = this.unitData.getSkillAtkSpeed(1, skill)
                    if (skill.cfg.isByAtkSpeed || this.unitData.battleLogic.buffMgr.isSkillBeAttackSpeed(skill.owner, skill.skillIndex)) {
                        atkTimeScale = this.unitData.getSkillAtkSpeed(this.unitData.atkTimeScale, skill)
                    }
                    this.setState(ActorState.Attack, animData.anim, atkTimeScale, this.unitData.isAttackBack ? 1 : 0, this.unitData.isCollison ? 1 : 0);
                }
            }
        }
        if (isShowEffect)
            this.showSkillEfect(animData, angle, atkTimeScale);
        if (SkillUtils.checkSkillSubType(SkillSubType.Loop, skill.getSubType()) && skill.cfg.subTypeParm) {
            let loopParm: { loop: number } = skill.cfg.subTypeParm;
            if (this.loopSkilTimer)
                this.loopSkilTimer.isReadyToRemove = true;
            this.loopSkilTimer = this.unitData.battleLogic.createTimeCheck(loopParm.loop, Handler.create(this, this.onLoopSkilAction, null, false))
        }

        let shakeParm: { times: number, offset: number, speed: number, mode: number; delay: number } = skill.cfg.shake
        if (shakeParm) {
            if (shakeParm.delay) {
                this.unitData.battleLogic.createTimeCheck(shakeParm.delay, Handler.create(this, () => {
                    this.unitData.battleLogic.effectMgr.shake(shakeParm.times, shakeParm.offset, shakeParm.speed, shakeParm.mode);
                }, [shakeParm]))
            }
            else
                this.unitData.battleLogic.effectMgr.shake(shakeParm.times, shakeParm.offset, shakeParm.speed, shakeParm.mode);
        }
        FacadeManager.ins().emit(NotificationKey.BATTLE_USE_SKILL, skill);
        // if (skill.skillIndex == 2) {
        //     GIns.cameraAnimUtils.focusPositison(300, this.pos, 0.8);
        //     GameTimer.ins().once(2000, this, () => {
        //         GIns.cameraAnimUtils.resetFocusPositison(600)
        //     })
        // }
    }

    /***增加持续释放技能的时间 */
    public addLoopSkillTime(time: number): void {
        if (this.loopSkilTimer) {
            this.loopSkilTimer.trigger += time
        }
    }

    /**旋转骨骼*/
    changeBoneRoatrion(skill: SkillData, angle: number): void {
        let spineNode = this._spineNode;
        if (spineNode instanceof ActorUnitNode) {

            spineNode.clearBoneRotation();

            if (skill.cfg.rotateBoneName) {
                let boneNames = skill.cfg.rotateBoneName;
                let _angle = this.unitData.dirction == -1 ? -angle : (angle - 180);
                //旋转骨骼
                spineNode.setCacheMode(sp.AnimationCacheMode.REALTIME);
                for (let i in boneNames) {
                    spineNode.setBoneRotation(i, _angle + +boneNames[i]);
                }
            }
        }
    }

    protected setChargeAction(): void {
        if (!this.chargedActionData)
            return

        this.isCharged = true
        if (this.chargedActionData.param.noChargedAmin) {
            this.setState(ActorState.Attack, this.chargedActionData.param.noChargedAmin, null, this.unitData.isAttackBack ? 1 : 0, 1);
        }
        else if (this.chargedActionData.param.loopAct) {
            let loopActData = TableManager.getDataById(table.battle.SkillEffectConfig, this.chargedActionData.param.loopAct);
            this.setState(ActorState.Attack, loopActData.anim, null, this.unitData.isAttackBack ? 1 : 0, 1);
            this.showSkillEfect(loopActData, 0, null, true);
        }
        else {
            this.setState(ActorState.Attack, this.chargedActionData.anim + "_charged", null, this.unitData.isAttackBack ? 1 : 0, 1);
        }
    }

    /***蓄力最大时间 */
    protected chargedMax: number = 0;
    /***蓄力的技能动作名 */
    protected chargedActionData: table.battle.SkillEffectConfig;
    /***蓄力前的前置动作 */
    protected chargedBeginAction: table.battle.SkillEffectConfig
    /***判断动作类型 */
    protected checkAnimAction(): table.battle.SkillEffectConfig {
        let skill = this.unitData.skillInfo;
        let animData = this.getActionEffectData();//正面动作

        if (!animData) {
            Logger.fight(`技能${skill.skillId}没找到动作`)
        }
        let animParam: { charged: number, begin: string } = animData.param
        if (this.unitData.isAttackBack) {
            let backAnimData = skill.getBackActionEffectData();
            if (backAnimData)
                animData = backAnimData
        }

        //蓄力前置动作判断
        if (!this.chargedBeginAction && animParam && animParam.begin) {
            this.chargedBeginAction = TableManager.getDataById(table.battle.SkillEffectConfig, animParam.begin);
        }

        if (animData.param && animParam.charged) {
            //有蓄力动作
            this.chargedActionData = animData;
            // this.chargedMax = this.charged = BattleUtils.getFrameByTime(+animParam.charged);
            let chargedParm: { time: number } = skill.cfg.subTypeParm;
            this.chargedMax = BattleUtils.getFrameByTime(+chargedParm.time);
        }
        return animData;
    }

    public beginCharge(behavior: SkillBehavior): void {
    }

    protected updateChargedHandler(): void {
    }

    public endCharge(): void {
        this.isCharged = false;
        this.stopSkillEffect()
        if (!this.chargedActionData)
            return

        this.setState(ActorState.Attack, this.chargedActionData.anim, null, this.unitData.isAttackBack ? 1 : 0, this.unitData.isCollison ? 1 : 0);
        this.showSkillEfect(this.chargedActionData, 0, null);
    }

    public addBuff(buff: SkillBuff): void {
        if (buff.effectType == BuffType.Attr) {
            if (!buff.isLastMax) {
                if (buff.cfg.stateType == 1)
                    BattleShowFactory.createAttrBuffNum(HurtNumType.AttrUp, this.nowPosVec, this.modelHeight, buff.effectParm1)
                else if (buff.cfg.stateType == 2)
                    BattleShowFactory.createAttrBuffNum(HurtNumType.AttrDown, this.nowPosVec, this.modelHeight, buff.effectParm1)
            }
        }
    }

    public updateBuff(buff: SkillBuff): void {
    }

    public removeBuff(buff: SkillBuff): void {
    }

    /***添加BUFF特效 */
    public addBuffEff(effModelIds: number[], upLow: string[], animPosType: number, fighter?: BattleUnit, exData?: any): void {
        this.addBuffHandler(effModelIds, upLow, animPosType, fighter, exData)
    }

    protected addBuffHandler(effModelIds: number[], upLow: string[], animPosType: number, fighter?: BattleUnit, exData?: any): void {
        for (let i = 0; i < effModelIds.length; i++) {
            var n: number = this.buffEffNameMap[effModelIds[i]];
            if (!n)
                n = 1;
            else if (animPosType == BuffEffectPos.Loop || animPosType == BuffEffectPos.Loop_Hurt_Point || animPosType == BuffEffectPos.SizePos || animPosType == BuffEffectPos.LoopScaleX || animPosType == BuffEffectPos.SizePos_Once)
                n++;
            this.buffEffNameMap[effModelIds[i]] = n;

            if (!this.buffEffs[effModelIds[i]]) {
                let targetPos = this.nowPosVec;
                let isBg: boolean = false;
                if (upLow && upLow[i] && upLow[i] == "low") {
                    isBg = true;
                }
                var buffEffectNode: AnimBaseUnitNode = BattleShowFactory.showEffectModel(effModelIds[i], targetPos, this._spineNode.getScale().x, isBg,
                    (animPosType == BuffEffectPos.Loop || animPosType == BuffEffectPos.Loop_Hurt_Point || animPosType == BuffEffectPos.SizePos || animPosType == BuffEffectPos.NotPosLoop
                        || animPosType == BuffEffectPos.Link_Fight_And_Target || animPosType == BuffEffectPos.SizePos_Once || animPosType == BuffEffectPos.LoopScaleX) ? true : false);

                buffEffectNode.modelScale *= Math.abs(this.unitData.attr.sizeScale);

                if (upLow && upLow[i] && upLow[i] == "top") {
                    WorldManager.ins().effectTopLayer.addChild(buffEffectNode);
                }

                buffEffectNode.exData = { pos: animPosType, fighter: fighter?.showUnit(), exData: exData };
                if (animPosType == BuffEffectPos.Once || animPosType == BuffEffectPos.OnceNotEnd || animPosType == BuffEffectPos.OnceForAct
                    || animPosType == BuffEffectPos.NotPos || animPosType == BuffEffectPos.NotPosLoop || animPosType == BuffEffectPos.SizePos_Once
                ) {
                    //不在结束时移除的BUFF，需要在动画播放完成后移除
                    buffEffectNode.setCompleteListener((aniName: string, spineNode?: ActorUnitNode) => {
                        if (animPosType == BuffEffectPos.NotPosLoop) {
                            spineNode.setPosition(this.nowPosVec.x, this.nowPosVec.y, 0);
                            return
                        }

                        for (let key in this.buffEffs) {
                            if (this.buffEffs[key] == spineNode) {
                                this.buffEffs[key].delayDestroy(0)
                                this.clearBuffEff([+key])
                                break;
                            }
                        }
                    });
                }

                this.buffEffs[effModelIds[i]] = buffEffectNode;
            }
        }
    }


    public clearBuffEff(effModelIds: number[]): void {
        for (let i = 0; i < effModelIds.length; i++) {
            var n: number = this.buffEffNameMap[effModelIds[i]]
            if (n != undefined) {
                n = Math.max(n - 1, 0)
                this.buffEffNameMap[effModelIds[i]] = n;
                if (n <= 0) {
                    var effs: AnimBaseUnitNode = this.buffEffs[effModelIds[i]];
                    if (effs)
                        effs.delayDestroy(0);
                    delete this.buffEffs[effModelIds[i]];
                }
            }
        }
    }

    public showOtherNum(str: string): void {
        BattleShowFactory.createNum(HurtNumType.Other, 0, this.nowPosVec, this.modelHeight, str)
    }

    /***动作播放完毕 */
    protected nodeActionComplete(aniName: string): void {
        if (this.chargedBeginAction && this.chargedBeginAction.anim == aniName) {
            this.setChargeAction();
        }
        else if (this._state == ActorState.RunAttack) {
            if (this.unitData.isMoveing)
                this.setState(ActorState.Running)
            else
                this.setState(ActorState.Idle)
        }
        else if (this._state == ActorState.Running) {
            if (this.unitData.isMoveing)
                this.checkRunningAction()
        }
        else if (this._state == ActorState.Attack || this._state == ActorState.SKilling) {
            if (!this.unitData.isCharged && !this.unitData.isCollison && !this.unitData.canMoveAttack())
                this.setState(ActorState.Idle)
        }
        else if (this._state == ActorState.Die) {
            this.onDieActionComplete()
        }
    }

    protected checkRunningAction(): void {
        if (this.unitData.career == HeroCareerType.HeavyCavalry && this.unitData.attr.getPassiveSkillFlag(PassivitySkillFlag.PRider_Collision_s01)) {
            this._state = ActorState.Idle;
            this.setState(ActorState.Running);//重骑的移动攻击光环动作要刷新
        }
    }

    /***显示受击特效 */
    public showHurtEfect(hurtEffect: number): void {
        BattleShowFactory.showEffectModel(hurtEffect, this.nowHurtPosVec, 1, false, false);
    }

    /***根据当前动作播放特效 */
    public showSkillEfect(animData: table.battle.SkillEffectConfig, angle: number, timeScale: number, isLoop: boolean = false): void {
        let fightEffect: AnimBaseUnitNode

        let modelIds = animData.modelId
        if (this.unitData.isAttackBack)
            modelIds = animData.modelUpId

        if (modelIds) {
            for (let i = 0; i < modelIds.length; i++) {
                fightEffect = this.createFightEffect(modelIds[i], animData.animPosType, this.unitData, EffectLayer.EffectTopLayer, isLoop, this._spineNode.getScale().x, timeScale);

                if (animData.param) {
                    if (fightEffect && (animData.param as { rotate: number, rotateIndex: number }).rotate && (animData.param as { rotate: number, rotateIndex: number }).rotateIndex == i)
                        fightEffect.angle = this.unitData.dirction == -1 ? (angle + (animData.param as { rotate: number }).rotate) : (angle - 180);
                }
            }
        }

        let bgModelId = animData.bgModelId
        if (this.unitData.isAttackBack)
            bgModelId = animData.bgModelUpId;

        if (bgModelId) {
            for (let i = 0; i < bgModelId.length; i++) {
                fightEffect = this.createFightEffect(bgModelId[i], animData.animPosType, this.unitData, EffectLayer.BgLayer, isLoop, this._spineNode.getScale().x, timeScale);

                if (animData.param) {
                    if (fightEffect && (animData.param as { rotate: number }).rotate)
                        fightEffect.angle = this.unitData.dirction == -1 ? (angle + (animData.param as { rotate: number }).rotate) : (angle - 180);
                }
            }
        }

        if (animData.sceneEffect) {
            let modelId = animData.sceneEffect
            let posType = SkillEffectPos.Screen_Top_Center;
            if (animData.param?.sceneEffect == 1)
                this.createFightEffect(modelId, SkillEffectPos.Screen_Center, this.unitData, EffectLayer.BgLayer, isLoop, this._spineNode.getScale().x, timeScale);
            else
                this.createFightEffect(modelId, posType, this.unitData, EffectLayer.EffectTopLayer, isLoop, this._spineNode.getScale().x, timeScale);
        }
    }

    private skillEffectPosRandomPosMap: { [uid: number]: number } = {}
    /***创建战斗特效 */
    public createFightEffect(modelId: number, posType: number, target: BattleUnit, layer: number, isLoop: boolean, fightDir: number, timeScale: number = null, fighter?: BattleUnit, exData?: any): AnimBaseUnitNode {
        var targetPos: Vec2 = target.pos;
        if (posType == SkillEffectPos.Random_Pos) {
            if (!this.skillEffectPosRandomPosMap[target.uid] || (Date.now() - this.skillEffectPosRandomPosMap[target.uid]) > 100) {
                this.skillEffectPosRandomPosMap[target.uid] = Date.now();
                targetPos = v2(target.hurtPoint.x + RandomUtils.randomInt(-30, 30), target.hurtPoint.y + RandomUtils.randomInt(-30, 30));
            }
            else
                return null;
        }
        else if (posType == SkillEffectPos.Hurt_Point || posType == SkillEffectPos.Hurt_Point_Fighter_Angle) {
            //受击点位置
            targetPos = target.hurtPoint as Vec2
        }
        else if (posType == SkillEffectPos.Atk_Point || posType == SkillEffectPos.Atk_Point_Move) {
            //攻击点位置
            targetPos = target.atkPoint as Vec2
        }
        let dir = this.unitData.dirction
        if (posType == SkillEffectPos.Player_Move_Fight_Dir)
            dir = fightDir;
        else if (posType == SkillEffectPos.Hurt_Point_Fighter_Angle) {
            dir = -fightDir;
        }

        let skinId = this.unitData.attr.skinId;
        if (!skinId && this.unitData.summon) {
            let summonParentUnit = this.unitData.getSummonParentUnit()
            if (summonParentUnit) {
                skinId = summonParentUnit.attr.skinId;
            }
        }
        modelId = BattleUtils.getSkinEffectModel(modelId, skinId)

        let isBg = layer == EffectLayer.BgLayer;
        let effect: AnimBaseUnitNode = BattleShowFactory.showEffectModel(modelId, targetPos, dir, isBg, isLoop);

        effect.modelScale *= Math.abs(this.unitData.attr.sizeScale);

        effect.exData = { pos: posType, fighter: fighter?.showUnit(), exData: exData };
        if (fighter && posType == SkillEffectPos.Hurt_Point_Fighter_Angle) {
            let angle = MathUtils.angle(fighter.pos, targetPos)
            effect.angle = angle
        }

        if (!isBg) {
            if (layer == EffectLayer.EffectTopLayer) {
                WorldManager.ins().effectTopLayer.addChild(effect);
            }
        }

        if (posType == SkillEffectPos.From_Player_Block || posType == SkillEffectPos.Atk_Point) {
            //跟随角色，角色被打断特效也打断
            this.skillStopEffectArr.push(effect)
        }
        else if (posType == SkillEffectPos.Player_Move || posType == SkillEffectPos.Player_Move_Fight_Dir
            || posType == SkillEffectPos.Atk_Point_Move || posType == SkillEffectPos.Link_Fight_And_Target || posType == SkillEffectPos.Player_Move_Dir) {
            //不会被打断，角色移动特效跟住移动
            effect.setCompleteListener((aniName: string) => {
                for (let i = 0; i < this.skillMoveEffectArr.length; i++) {
                    if (this.skillMoveEffectArr[i] == effect) {
                        this.skillMoveEffectArr[i].delayDestroy(0)
                        this.skillMoveEffectArr.splice(i, 1)
                        break;
                    }
                }
            });
            this.skillMoveEffectArr.push(effect)
        }
        else if (posType == SkillEffectPos.Normal_Not_Stop) {
            this.skillNormalNotStopEffectArr.push(effect)
            effect.setCompleteListener((aniName: string) => {
                for (let i = 0; i < this.skillNormalNotStopEffectArr.length; i++) {
                    if (this.skillNormalNotStopEffectArr[i] == effect) {
                        this.skillNormalNotStopEffectArr[i].delayDestroy(0)
                        this.skillNormalNotStopEffectArr.splice(i, 1)
                        break;
                    }
                }
            });
        }
        else if (posType == SkillEffectPos.Screen_Top_Center) {
            //跟随角色，角色被打断特效也打断
            this.skillStopEffectArr.push(effect)
            effect.setWorldPosition(ScreenAdaptManager.viewWidth * 0.5, ScreenAdaptManager.viewHeight, 0)
            WorldManager.ins().effectTopLayer.addChild(effect);
        }
        else if (posType == SkillEffectPos.Screen_Center) {
            //跟随角色，角色被打断特效也打断
            this.skillStopEffectArr.push(effect)
            effect.setWorldPosition(ScreenAdaptManager.viewWidth * 0.5, ScreenAdaptManager.viewHeight * 0.5, 0)
            WorldManager.ins().shadowLayer.addChild(effect);
        }

        if (timeScale) {
            effect.timeScale = timeScale;
        }

        return effect
    }

    protected updateSkillMovePos(): void {
        for (let i = 0; i < this.skillMoveEffectArr.length; i++) {
            let exData: { pos: number, fighter: BattleShowUnit, exData: any } = this.skillMoveEffectArr[i].exData
            if (exData.pos == SkillEffectPos.Atk_Point_Move) {
                this.skillMoveEffectArr[i].setPosition(this.unitData.atkPoint.x, this.unitData.atkPoint.y);
            }
            else if (exData.pos == SkillEffectPos.Player_Move_Dir) {
                this.skillMoveEffectArr[i].setDirction(this.unitData.dirction)
                this.skillMoveEffectArr[i].setPosition(this.nowPosVec.x, this.nowPosVec.y);
            }
            else if (exData.pos == SkillEffectPos.Link_Fight_And_Target) {
                this.skillMoveEffectArr[i].setPosition(exData.fighter.nowHurtPosVec.x, exData.fighter.nowHurtPosVec.y);
                let angle = MathUtils.angle(exData.fighter.nowHurtPosVec, this.nowHurtPosVec);
                let dis = MathUtils.distance(exData.fighter.nowHurtPosVec, this.nowHurtPosVec)
                this.skillMoveEffectArr[i].angle = angle + 180;
                let effectWidth = exData.exData;
                let scaleX = dis / effectWidth;
                this.skillMoveEffectArr[i].setScale(scaleX, 1);
            }
            else {
                this.skillMoveEffectArr[i].setPosition(this.nowPosVec.x, this.nowPosVec.y);
            }
        }

        for (let i = 0; i < this.skillNormalNotStopEffectArr.length; i++) {
            if (this.skillNormalNotStopEffectArr[i].isValid) {
                this.skillNormalNotStopEffectArr[i].setPosition(this.nowPosVec.x, this.nowPosVec.y);
            }
        }

        if (this.unitData.isMoveAttack) {
            //拥有移动攻击特性后，因移动打断的特效也要跟随移动
            for (let i = 0; i < this.skillStopEffectArr.length; i++) {
                if (this.skillStopEffectArr[i].isValid) {
                    this.skillStopEffectArr[i].setDirction(this.unitData.dirction)
                    this.skillStopEffectArr[i].setPosition(this.nowPosVec.x, this.nowPosVec.y);
                }
            }
        }
    }

    protected updateBuffEffectPos(): void {
        for (let key in this.buffEffs) {
            let exData: { pos: number, fighter: BattleShowUnit, exData: any } = this.buffEffs[key].exData;
            if (this.buffEffs[key].isValid && exData.pos != BuffEffectPos.NotPos && exData.pos != BuffEffectPos.NotPosLoop) {
                if (exData.pos == BuffEffectPos.SizePos || exData.pos == BuffEffectPos.SizePos_Once) {
                    this.buffEffs[key].setPosition(this.nowPosVec.x, this.nowPosVec.y + this.modelHeight, 0);
                }
                else if (exData.pos == BuffEffectPos.Loop_Hurt_Point) {
                    this.buffEffs[key].setPosition(this.unitData.hurtPoint.x, this.unitData.hurtPoint.y, 0);
                }
                else if (exData.pos == BuffEffectPos.Link_Fight_And_Target && exData.fighter) {
                    this.buffEffs[key].setPosition(exData.fighter.nowHurtPosVec.x, exData.fighter.nowHurtPosVec.y);
                    let angle = MathUtils.angle(exData.fighter.nowHurtPosVec, this.nowHurtPosVec);
                    let dis = MathUtils.distance(exData.fighter.nowHurtPosVec, this.nowHurtPosVec)
                    this.buffEffs[key].angle = angle + 180;
                    let effectWidth = exData.exData;
                    let scaleX = dis / effectWidth;
                    this.buffEffs[key].setScale(scaleX, 1);
                }
                else
                    this.buffEffs[key].setPosition(this.nowPosVec.x, this.nowPosVec.y, 0);

                if (exData.pos == BuffEffectPos.LoopScaleX) {
                    if (this.unitData.dirction == DirctionType.Rigth)
                        this.buffEffs[key].setScale(Math.abs(this.buffEffs[key].getScale().x), this.buffEffs[key].getScale().y)
                    else
                        this.buffEffs[key].setScale(-Math.abs(this.buffEffs[key].getScale().x), this.buffEffs[key].getScale().y)
                }
            }
        }
    }

    protected getActionEffectData(): table.battle.SkillEffectConfig {
        return this.unitData.skillInfo.getActionEffectData()
    }

    private loopSkilTimer: FightTimeLoop;
    /***持续技能结束 */
    private onLoopSkilAction(): void {
        this.spineGoToAndPlayByFrameName("loopEnd")
    }

    public spineGoToAndPlayByFrameName(name: string): void {
        let spineNode = this._spineNode;
        if (spineNode instanceof ActorUnitNode) {

            spineNode.skipLoop = true;
            let event = spineNode.getEventByName(name)
            if (event && event.intValue) {
                spineNode.gotoAndPlay(event.intValue)
            }

            //处理特效
            this.skillEffectGoToAndPlay(name)
        }
    }

    protected skillEffectGoToAndPlay(eventName: string): void {
        for (let i = 0; i < this.skillStopEffectArr.length; i++) {
            let node = this.skillStopEffectArr[i]
            if (node.isValid && node instanceof ActorUnitNode) {
                node.skipLoop = true;
                let event = node.getEventByName(eventName, true)
                if (event && event.intValue) {
                    node.gotoAndPlay(event.intValue)
                }
            }
        }

        for (let i = 0; i < this.skillMoveEffectArr.length; i++) {
            let node = this.skillMoveEffectArr[i]
            if (node.isValid && node instanceof ActorUnitNode) {
                node.skipLoop = true;
                let event = node.getEventByName(eventName, true)
                if (event && event.intValue) {
                    node.gotoAndPlay(event.intValue)
                }
            }
        }

    }

    /***切换骑乘战斗动作 */
    protected changeMoveAttackAction(): void {
        let spineNode = this._spineNode;
        if (spineNode?.isLoaded && spineNode instanceof ActorUnitNode) {
            let skill = this.unitData.skillInfo;
            if (!skill)
                return
            let trackTime = spineNode.spine.getState().getCurrent(0).trackTime
            let animData = this.checkAnimAction();

            if (skill.type == SkillType.ATTACK) {
                //普攻 计算攻速 
                this.setState(ActorState.RunAttack, this.unitData.moveAttackType == 1 ? animData.animHorse : animData.anim, this.unitData.getSkillAtkSpeed(this.unitData.atkTimeScale, skill), this.unitData.isAttackBack ? 1 : 0);
            } else {
                //技能
                let atkTimeScale = this.unitData.getSkillAtkSpeed(1, skill);
                if (skill.cfg.isByAtkSpeed || this.unitData.battleLogic.buffMgr.isSkillBeAttackSpeed(skill.owner, skill.skillIndex)) {
                    atkTimeScale = this.unitData.getSkillAtkSpeed(this.unitData.atkTimeScale, skill)
                }
                else
                    this.setState(ActorState.RunAttack, this.unitData.moveAttackType == 1 ? (animData.animHorse ? animData.animHorse : animData.anim) : animData.anim, atkTimeScale, this.unitData.isAttackBack ? 1 : 0, this.unitData.isCollison ? 1 : 0);
            }
            spineNode.spine.getState().getCurrent(0).animationStart = trackTime;
        }
    }


    /***攻击完成 */
    protected attackActionComplete(isForce: boolean, skillInfo: SkillData, isStopSkillEffect: boolean = true): void {
        if (skillInfo)
            FacadeManager.ins().emit(NotificationKey.BATTLE_USE_SKILL_COMPLETE, skillInfo);
        this.isCharged = false
        this.chargedBeginAction = null;
        if (this.loopSkilTimer)
            this.loopSkilTimer.isReadyToRemove = true;
        if (isStopSkillEffect)
            this.stopSkillEffect();
    }

    /***脱离战斗 */
    public onExitFight(): void {
        if (this._hpBar)
            this._hpBar.delayHide()
    }

    /**
        * 移除影子
        */
    protected removeShadow(): void {
        // if (this.shadow && this.shadow.node && this.shadow.node.parent)
        //     this.shadow.node.removeFromParent();
        this.shadow?.dispose();
        this.shadow = null;
    }

    /**
     * 创建影子
     */
    protected createShadow(): void {
        //所有游戏实体角色都具有阴影
        this.initShadowImg();
        this.updateShadowImgScale();
        WorldManager.ins().shadowLayer.addChild(this.shadow.node);
        this.updateShadowPos();
    }

    protected initShadowImg(): void {
        if (!this.shadow) {
            //添加影子
            this.shadow = fgui.UIPackage.createObject("commBattle", "BattleShadowSmallComp") as ui.commBattle.battleComp.BattleShadowBigComp;
        }
    }

    protected updateShadowImgScale(): void {
        if (this._spineNode && this.shadow)
            this.shadow.scaleX = this.shadow.scaleY = Math.max(90, this._spineNode.modelWidth) / this.shadow.img.width * this.unitData.attr.sizeScale;
    }

    public fadeScale(scale: number): void {
        super.fadeScale(scale)
        this.updateShadowImgScale();
    }

    /**
        * 更新影子坐标
        */
    protected updateShadowPos(): void {
        if (this.shadow) {
            this.shadow.x = this.nowPosVec.x;
            this.shadow.y = -this.nowPosVec.y
            if (this.statueData?.shadowVisible != null) {
                this.setShadowVisible(this.statueData.shadowVisible)
            }
        }
    }

    public setShadowVisible(v: boolean): void {
        if (this.shadow) {
            this.shadow.visible = v;
        }
    }

    public setOtherVisible(v: boolean): void {
        if (!this.unitData.isOtherVisible) {
            v = false;
        }

        this.setShadowVisible(v)
        if (!v && this._hpBar)
            this._hpBar.onHide()
        super.setOtherVisible(v);
    }

    public get nowPosVec(): Vec2 {
        return this.interpolationMoveComp.nowVec2
    }

    private hurtPosVec: Vec2 = v2(0, 0)
    public get nowHurtPosVec(): Vec2 {
        let modelFixX = this.unitData.modelFixX;
        let modelFixY = this.unitData.modelFixY;
        let modelHeight = this.unitData.modelHeight;
        this.hurtPosVec.set(this.nowPosVec.x + modelFixX * this.unitData.scaleX, this.nowPosVec.y + modelFixY * this.unitData.scaleY + modelHeight * 0.5)
        return this.hurtPosVec
    }

    /***中断角色身上的跟随特效 */
    public stopSkillMoveEffect(): void {
        for (let i = 0; i < this.skillMoveEffectArr.length; i++) {
            this.skillMoveEffectArr[i].delayDestroy(100)
        }
        this.skillMoveEffectArr.length = 0;
    }

    /***中断角色身上的特效 */
    private stopSkillEffect(): void {
        for (let i = 0; i < this.skillStopEffectArr.length; i++) {
            this.skillStopEffectArr[i].delayDestroy(100)
        }
        this.skillStopEffectArr.length = 0;
    }

    /***中断角色身上的特效 */
    private stopNormalSkillEffect(): void {
        for (let i = 0; i < this.skillNormalNotStopEffectArr.length; i++) {
            this.skillNormalNotStopEffectArr[i].delayDestroy(100)
        }
        this.skillNormalNotStopEffectArr.length = 0;
    }

    protected onDie(damageVo?: DamageVo) {
        if (damageVo && damageVo.status == BattleConstantConfig.Kill) {
            //秒杀BUFF的话死亡方式是另外的样子
            this.setState(ActorState.Idle);
            this.setShadowVisible(false)
            tween().target(this._spineNode).to(0.5 / BattleTimer.battleTickFrame, { tweenScale: 0, position: new Vec3(this._spineNode.position.x, this._spineNode.position.y + 100, 0) }).call(() => {
                if (this._spineNode) {
                    this._spineNode.active = false;
                    this.onDieActionComplete()
                }
            }).start();
        }
        else
            this.setState(ActorState.Die);
    }

    public showAbnormalStatus(type: AbnormalType): void {
        if (type == AbnormalType.Silent) {
            this.addBuffHandler([10010072], ["up"], BuffEffectPos.SizePos)
        }
        else if (type == AbnormalType.dizziness) {
            this.setState(ActorState.Vertigo);
            this.addBuffHandler([10010071], ["up"], BuffEffectPos.SizePos)
        }
        BattleShowFactory.createNum(HurtNumType.Abnormal, 0, this.nowPosVec, this.modelHeight, type)
    }

    public hideAbnormalStatus(type: AbnormalType): void {
        if (type == AbnormalType.Silent) {
            this.clearBuffEff([10010072])
        }
        else if (type == AbnormalType.dizziness) {
            this.clearBuffEff([10010071])
        }
    }

    private interpolationMoveComp: InterpolationMoveComp;
    public setSpinesPosXY(x: number, y: number): void {
        this.interpolationMoveComp.update(this.pos, 0, this.statueData?.forceMove);
    }

    private onInterpolationMove(x: number, y: number): void {
        super.setSpinesPosXY(x, y)
    }

    public removeAllEffect(): void {
        this.stopSkillEffect();
        this.stopNormalSkillEffect();
        for (let i = 0; i < this.skillMoveEffectArr.length; i++) {
            this.skillMoveEffectArr[i].delayDestroy(0)
        }
        this.skillMoveEffectArr.length = 0;
        for (let i = 0; i < this.skillStopEffectArr.length; i++) {
            this.skillStopEffectArr[i].delayDestroy(0)
        }
        this.skillStopEffectArr.length = 0;
        for (let i = 0; i < this.skillNormalNotStopEffectArr.length; i++) {
            this.skillNormalNotStopEffectArr[i].delayDestroy(0)
        }
        this.skillNormalNotStopEffectArr.length = 0;
        for (let key in this.buffEffs) {
            this.buffEffs[key].delayDestroy(0)
        }
        this.buffEffs = {}
    }

    /***暂停模型播放 */
    public pauseModel(): void {
        super.pauseModel()
        for (let i = 0; i < this.skillMoveEffectArr.length; i++) {
            if (this.skillMoveEffectArr[i].isValid)
                this.skillMoveEffectArr[i].pause()
        }
        for (let i = 0; i < this.skillStopEffectArr.length; i++) {
            if (this.skillStopEffectArr[i].isValid)
                this.skillStopEffectArr[i].pause()
        }
        for (let i = 0; i < this.skillNormalNotStopEffectArr.length; i++) {
            if (this.skillNormalNotStopEffectArr[i].isValid)
                this.skillNormalNotStopEffectArr[i].pause()
        }
        for (let key in this.buffEffs) {
            if (this.buffEffs[key].isValid)
                this.buffEffs[key].pause()
        }
    }

    /***恢复模型播放 */
    public resumeModel(): void {
        super.resumeModel()
        for (let i = 0; i < this.skillMoveEffectArr.length; i++) {
            if (this.skillMoveEffectArr[i].isValid)
                this.skillMoveEffectArr[i].resume()
        }
        for (let i = 0; i < this.skillStopEffectArr.length; i++) {
            if (this.skillStopEffectArr[i].isValid)
                this.skillStopEffectArr[i].resume()
        }
        for (let i = 0; i < this.skillNormalNotStopEffectArr.length; i++) {
            if (this.skillNormalNotStopEffectArr[i].isValid)
                this.skillNormalNotStopEffectArr[i].resume()
        }
        for (let key in this.buffEffs) {
            if (this.buffEffs[key].isValid)
                this.buffEffs[key].resume()
        }
    }

    /**销毁 */
    dispose() {
        if (this.loopSkilTimer)
            this.loopSkilTimer.isReadyToRemove = true;
        this.removeShadow();
        this.removeAllEffect()
        // if (this._spineNode?.isValid) {
        //     this._spineNode.destroy(); //先销毁
        // }
        if (this._hpBar)
            this._hpBar.dispose()
        super.dispose();
    }
}