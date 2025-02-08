import { v2, Vec2 } from "cc";
import { Handler } from "../../../../../core/utils/Handler";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import UnitSearchUtils from "../../collisions/UnitSearchUtils";
import { FightTimeCheck } from "../../FightTimeCheck";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { TargetFaction } from "../SkillEnum";
import { SkillUtils } from "../SkillUtils";
import { BoSaiDongZhuanHuanWu } from "./BoSaiDongZhuanHuanWu";
import { DirctionType } from "../../enum/BattleEnum";

export class BoSaiDongZhuanHuanWuSkill1 extends FightSkillInfo {
    private moveTimeCheck: FightTimeCheck
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);
        let param: { targetType: number, radius: number, time: number, behaviro: string, boom: number, die: number } = behavior.cfg.param;
        if (param?.targetType) {
            (owner as BoSaiDongZhuanHuanWu).summonIsCtrlMove = false;
            let targetTeamId = SkillUtils.getTeamIdByFaction(owner.teamId, TargetFaction.EnemySide);
            let targets = UnitSearchUtils.getUnitsByCircle(owner, targetTeamId, param.radius);
            if (targets?.length > 0) {
                let p = UnitSearchUtils.getMostDenseArea(targets, param.radius || 150);

                let dis = MathUtils.distance(p, owner.pos)
                let speed = dis / (param.time / 16);
                let radians = MathUtils.radian(this.skill.owner.pos, p);
                let moveVec = v2(speed * Math.cos(radians), speed * Math.sin(radians))
                let angle = MathUtils.radians2Angle(radians);
                if (this.skill.owner.pos.x < p.x) {
                    (owner as BoSaiDongZhuanHuanWu).setDirction(DirctionType.Left)
                    owner.battleLogic.showMgr.setStatue(owner.casterUid, { angle: angle });
                }
                else {
                    (owner as BoSaiDongZhuanHuanWu).setDirction(DirctionType.Rigth)
                    owner.battleLogic.showMgr.setStatue(owner.casterUid, { angle: angle + 180 });
                }

                this.moveTimeCheck = this.skill.battleLogic.createTimeCheck(16, new Handler(this, this.onMoveHandler, [moveVec]), Math.ceil(param.time / 16), true, false,
                    new Handler(this, this.onMoveCompleteHandler, [behavior, owner]))
            }
            else {
                (owner as BoSaiDongZhuanHuanWu).summonIsCtrlMove = true;
            }
        }
        else if (param?.boom) {
            let unit = owner.battleLogic.getBatteUintByUid((owner as BoSaiDongZhuanHuanWu).summon.byUid)
            let summonExData: { amount: number, buff: string[] } = (owner as BoSaiDongZhuanHuanWu).summon.exData;
            if (summonExData.buff) {
                if (unit?.isActive) {
                    for (let i = 0; i < summonExData.buff.length; i++) {
                        owner.battleLogic.buffMgr.buffControlByGroup(summonExData.buff[i], owner, unit, behavior)
                    }
                }
            }
            if (behavior.selectUnits?.length) {
                behavior.changeDamageValue = summonExData.amount;
                this.hurt(behavior, { amount: summonExData.amount }, unit, behavior.selectUnits)
            }
        }
        else if (param?.die) {
            (owner as BoSaiDongZhuanHuanWu).toDie()
        }
    }

    private onMoveHandler(moveVec: Vec2): void {
        this.skill.owner.forceMove(moveVec)
    }

    private onMoveCompleteHandler(behavior: SkillBehavior, owner: ICaster): void {
        let param: { behaviro: string } = behavior.cfg.param;
        if (param?.behaviro) {
            this.onNewBehaviorHandler(param.behaviro, behavior, owner, this.skill)
        }
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        if (this.moveTimeCheck)
            this.moveTimeCheck.isReadyToRemove = true;
    }

}