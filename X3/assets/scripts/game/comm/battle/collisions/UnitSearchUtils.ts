import { Vec2 } from "cc";
import { MathUtils } from "../../../../core/utils/MathUtils";
import { ICaster } from "../skill/ICaster";
import { MineralUnit } from "../unit/MineralUnit";
import { BattleUnit } from "../unit/battle/BattleUnit";
import UnitCollisionsManager from "./UnitCollisionsManager";
import { SortUtils } from "../../../../core/utils/SortUtils";
import { v2 } from "cc";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { BattleDebugManager } from "../BattleDebugManager";

export default class UnitSearchUtils {

    /**
     * 找到范围内最近的矿
     * @param self 自身单位
     * @param searchRange 搜索范围半径
     */
    static getNearestMineralUnit(self: ICaster, searchRange: number) {
        return self.battleLogic.unitCollisionsManager.getNearestMineralUnit(searchRange, self.pos) as MineralUnit;
    }

    /**找到范围内最近的单位
     * @param self 自身单位
     * @param radius 半径
     * @param unit 自身单位
     */
    static getNearestBattleUnit(self: ICaster, teamId: number, radius: number): BattleUnit {
        return self.battleLogic.unitCollisionsManager.getNearestBattleUnit(teamId, self.pos, radius) as BattleUnit;
    }

    /**找到范围内最远的单位
    * @param self 自身单位
    * @param radius 半径
    * @param unit 自身单位
    */
    static getFarthestBattleUnit(self: ICaster, teamId: number, radius: number): BattleUnit {
        return self.battleLogic.unitCollisionsManager.getFarthestBattleUnit(teamId, self.pos, radius) as BattleUnit;
    }

    /**找到范围内血量最低的单位
     * @param self 自身单位
     * @param teamId 检索队伍
     * @param radius 半径
     */
    static getLowestHpUnit(self: ICaster, teamId: number, radius: number): BattleUnit {
        let units = self.battleLogic.unitCollisionsManager.getCircleUnits(teamId, self.pos, radius) as BattleUnit[];
        if (units.length == 0)
            return null
        SortUtils.sortBy2(units, ["hpPercen"], [true], false)
        return units[0]
    }

    /**找到范围内血量最高的单位
     * @param self 自身单位
     * @param teamId 检索队伍
     * @param radius 半径
     */
    static getMostHpUnit(self: ICaster, teamId: number, radius: number): BattleUnit {
        let units = self.battleLogic.unitCollisionsManager.getCircleUnits(teamId, self.pos, radius) as BattleUnit[];
        if (units.length == 0)
            return null
        SortUtils.sortBy2(units, ["hpPercen"], [false], false)
        return units[0]
    }


    /**找到范围内最大生命值最高的单位
     * @param self 自身单位
     * @param teamId 检索队伍
     * @param radius 半径
     */
    static getMostHpMaxUnit(self: ICaster, teamId: number, radius: number): BattleUnit {
        let units = self.battleLogic.unitCollisionsManager.getCircleUnits(teamId, self.pos, radius) as BattleUnit[];
        if (units.length == 0)
            return null
        SortUtils.sortBy2(units, ["maxHp"], [false], false)
        return units[0]
    }


    /**找到范围内防御力最高的单位
   * @param self 自身单位
   * @param teamId 检索队伍
   * @param radius 半径
   */
    static getMostDefUnit(self: ICaster, teamId: number, radius: number): BattleUnit {
        let units = self.battleLogic.unitCollisionsManager.getCircleUnits(teamId, self.pos, radius) as BattleUnit[];
        if (units.length == 0)
            return null
        SortUtils.sortBy2(units, ["def"], [false], false)
        return units[0]
    }

    /**找到范围内攻击力最高的单位
  * @param self 自身单位
  * @param teamId 检索队伍
  * @param radius 半径
  */
    static getMostAtkUnit(self: ICaster, teamId: number, radius: number): BattleUnit {
        let units = self.battleLogic.unitCollisionsManager.getCircleUnits(teamId, self.pos, radius) as BattleUnit[];
        if (units.length == 0)
            return null
        SortUtils.sortBy2(units, ["atk"], [false], false)
        return units[0]
    }

    /**找到范围内初始攻击力最高的单位
 * @param self 自身单位
 * @param teamId 检索队伍
 * @param radius 半径
 */
    static getMostInitAtkUnit(self: ICaster, teamId: number, radius: number): BattleUnit {
        let units = self.battleLogic.unitCollisionsManager.getCircleUnits(teamId, self.pos, radius) as BattleUnit[];
        if (units.length == 0)
            return null
        SortUtils.sortBy2(units, ["atkInit"], [false], false)
        return units[0]
    }

    /**
     * 获取圆形内的所有召唤物单位
     * @param centerUnit 中心单位
     * @param teamId 检索队伍
     * @param param 参数 
     * @returns 范围内的所有对象
     */
    static getSummonUnitByCircle(centerUnit: ICaster, teamId: number, radius: number, configIds: number[]): BattleUnit {
        let units = centerUnit.battleLogic.unitCollisionsManager.getCircleUnits(teamId, centerUnit.pos, radius) as BattleUnit[];
        if (units.length == 0)
            return null
        for (let i = 0; i < units.length; i++) {
            if (units[i].summon && configIds?.indexOf(units[i].attr.getConfigId()) != -1) {
                return units[i]
            }
        }
        return null
    }

    /**
     * 获取圆形内的所有单位
     * @param centerUnit 中心单位
     * @param teamId 检索队伍
     * @param param 参数 
     * @returns 范围内的所有对象
     */
    static getUnitsByCircle(centerUnit: ICaster, teamId: number, radius: number): BattleUnit[] {
        return centerUnit.battleLogic.unitCollisionsManager.getCircleUnits(teamId, centerUnit.pos, radius) as BattleUnit[];
    }

    /**
     * 获取圆形内的所有单位
     * @param centerPos 中心单位
     * @param teamId 检索队伍
     * @param param 参数 
     * @returns 范围内的所有对象
     */
    static getUnitsByCircleParam(mgr: UnitCollisionsManager, centerPos: Vec2, teamId: number, param: { radius: number }): BattleUnit[] {
        if (!param || !param.radius) {
            throw "targetParam no radius";
        }
        return mgr.getCircleUnits(teamId, centerPos, param.radius) as BattleUnit[];
    }

    /**
     * 获取扇形内的所有单位
     * @param unit 中心单位
     * @param teamId 检索队伍
     * @param atkAngle 攻击方向
     * @param param 参数
     * @returns 范围内的所有对象
     */
    static getUnitsByArcParam(mgr: UnitCollisionsManager, centerPos: Vec2, teamId: number, atkAngle: number, param: { radius: number, angle: number }) {
        if (!param || !param.radius) {
            throw "targetParam no radius";
        }
        return mgr.getArcUnits(teamId, centerPos, atkAngle, param.angle, param.radius) as BattleUnit[];
    }

    /***
    * 获取矩形范围内的矩形相交的单位
    * @param atkAngle 攻击方向
    */
    static getUnitsByRectAndRectParam(mgr: UnitCollisionsManager, centerPos: Vec2, teamId: number, atkAngle: number, param: { width: number, height: number }) {
        if (!param || !param.width || !param.height) {
            throw "targetParam no width or height";
        }
        return mgr.getRectUnits3(teamId, centerPos, atkAngle, param.width, param.height) as BattleUnit[];
    }


    /***
     * 获取矩形范围内的所有单位
     * @param atkAngle 攻击方向
     */
    static getUnitsByRectParam(mgr: UnitCollisionsManager, centerPos: Vec2, teamId: number, atkAngle: number, param: { width: number, height: number }) {
        if (!param || !param.width || !param.height) {
            throw "targetParam no width or height";
        }
        return mgr.getRectUnits(teamId, centerPos, atkAngle, param.width, param.height) as BattleUnit[];
    }

    /***
   * 获取矩形范围内的所有单位(以顶角为目标中心点)
   * @param atkAngle 攻击方向
   */
    static getUnitsByRect2Param(mgr: UnitCollisionsManager, centerPos: Vec2, teamId: number, atkAngle: number, param: { width: number, height: number, isLeft: number }) {
        if (!param || !param.width || !param.height) {
            throw "targetParam no width or height";
        }
        return mgr.getRectUnits2(teamId, centerPos, atkAngle, param.width, param.height, param.isLeft == 1) as BattleUnit[];
    }

    /**
     * 筛选单位范围内目标最多 (目前实现遍历，寻找附近最多单位的目标)
     * @param targets 目标单位组
     * @param radius 半径
    */
    static getMostDenseTarget(targets: BattleUnit[], radius: number) {
        let curTarget: BattleUnit;
        let maxNum = 0;
        for (let i = 0; i < targets.length; i++) {
            const target = targets[i];
            let found = target.battleLogic.unitCollisionsManager.getCircleUnits(target.teamId, target.pos, radius);
            if (found.length > maxNum) {
                curTarget = target;
                maxNum = found.length;
            }
        }
        return curTarget;
    }

    /**
     * 筛选单位范围内目标最多的位置 (目前实现遍历，寻找附近最多单位的目标)
     * @param targets 目标单位组
     * @param radius 半径
    */
    static getMostDenseArea(targets: BattleUnit[], radius: number) {
        let x = 0
        let y = 0
        let count = 0
        let mps: Vec2[] = []
        for (let i = 0; i < targets.length; i++) {
            for (let j = i; j < targets.length; j++) {
                let role1 = targets[i]
                let role2 = targets[j]

                if (role2 != role1) {
                    let dis = MathUtils.getDistance(role1.pos.x, role1.pos.y, role2.pos.x, role2.pos.y) - (role1.attr.getSize() * 0.5) - (role2.attr.getSize() * 0.5) + 1//+1去掉刚刚好2边相切的情况
                    if (dis <= (2 * radius)) {   //小于直径才判断(攻击范围)
                        let mid = new Vec2((role1.pos.x + role2.pos.x) * 0.5, (role1.pos.y + role2.pos.y) * 0.5)
                        mps.push(mid)
                    }
                }
            }
        }

        for (let i = 0; i < mps.length; i++) {
            let mp = mps[i]
            let c = 0
            for (let j = 0; j < targets.length; j++) {
                let role = targets[j]
                let juli = MathUtils.getDistance(mp.x, mp.y, role.pos.x, role.pos.y) - (role.attr.getSize() * 0.5) + 1
                if (juli <= radius)
                    c++
            }
            if (c > count) {
                count = c
                x = mp.x
                y = mp.y
            }
        }

        if (mps.length == 0)
            return v2(targets[0].pos.x, targets[0].pos.y)
        return v2(x, y);
    }

    /**
     * 筛选单位范扇形围内目标最多的位置 (目前实现遍历，寻找附近最多单位的目标)
     * @param targets 目标单位组
     * @param radius 半径
     * @param angle 角度
     * @param searchAngleStep 搜索角度步长
    */
    static getMostDenseArcArea(mgr: UnitCollisionsManager, teamId: number, centerPos: Vec2, radius: number, angle: number, searchAngleStep: number = 5): Vec2 {
        let maxCount = 0;
        let bestAngle = 0;

        // 从0度开始，每次增加searchAngleStep，直到360度
        // let i = 0;
        for (let angleRange = 0; angleRange < 360; angleRange += searchAngleStep) {
            // 获取当前角度对应的扇形区域内的单位数量
            let units = mgr.getArcUnits(teamId, centerPos, angleRange, angle, radius);
            let count = units.length;
            if (count > maxCount) {
                maxCount = count;
                bestAngle = angleRange;
            }
            // GameTimer.ins().once(200 * i, this, (angleRange, radius, angle, units: BattleUnit[]) => {
            //     BattleDebugManager.ins().showRangeArc(null, centerPos.x, centerPos.y, angleRange, radius, angle)
            //     for (let kk = 0; kk < units.length; kk++) {
            //         units[kk].showUnit().node.colorDelay()
            //     }
            // }, [angleRange, radius, angle, units], false)
            // i++
        }

        // BattleDebugManager.ins().showRangeArc(null, centerPos.x, centerPos.y, bestAngle, radius, angle)
        // 将角度从度转换为弧度
        let bestAngleRad = bestAngle * Math.PI / 180;

        // 计算最佳角度对应的坐标点
        let newX = centerPos.x + Math.cos(bestAngleRad) * radius * 0.5; // 1 像素距离
        let newY = centerPos.y + Math.sin(bestAngleRad) * radius * 0.5;

        return new Vec2(newX, newY);
    }

    /**
    * 筛选单位范扇形围内目标最多的目标 (目前实现遍历，寻找附近最多单位的目标)
    * @param targets 目标单位组
    * @param radius 半径
    * @param angle 角度
   */
    static getMostDenseArcTarget(mgr: UnitCollisionsManager, teamId: number, caster: BattleUnit, radius: number, angle: number): Vec2 {
        let maxCount = 0;
        let bestUnit;

        let targets = mgr.getCircleUnits(teamId, caster.pos, radius);
        if (targets.length == 0) {
            return null
        }

        let baseCenterPos: Vec2
        for (let i = 0; i < targets.length; i++) {
            // 获取当前角度对应的扇形区域内的单位数量
            let centerPos: Vec2 = caster.getAtkPoint(false, targets[i].pos.x > caster.pos.x ? -1 : 1) as Vec2
            let units = mgr.getArcUnits(teamId, centerPos, MathUtils.angle(centerPos, targets[i].pos), angle, radius);
            let count = units.length;
            if (count > maxCount) {
                maxCount = count;
                bestUnit = targets[i];
                baseCenterPos = centerPos
            }

            // GameTimer.ins().once(1000 * i, this, (angleRange, radius, angle, units: BattleUnit[]) => {
            //     BattleDebugManager.ins().showRangeArc(null, centerPos.x, centerPos.y, angleRange, radius, angle)
            //     for (let kk = 0; kk < units.length; kk++) {
            //         units[kk].showUnit().node.colorDelay()
            //     }
            // }, [MathUtils.angle(centerPos, targets[i].pos), radius, angle, units], false)
        }

        // GameTimer.ins().once(1000 * (targets.length + 2), this, (angleRange, radius, angle, units: BattleUnit[]) => {
        //     BattleDebugManager.ins().showRangeArc(null, baseCenterPos.x, baseCenterPos.y, MathUtils.angle(baseCenterPos, bestUnit.pos), radius, angle)
        // })
        if (!bestUnit)
            return caster.pos;
        return bestUnit.pos
    }

    /**
     * 筛选单位范矩形围内目标最多的位置 (目前实现遍历，寻找附近最多单位的目标)
     * @param targets 目标单位组
     * @param width 
     * @param height 
     * @param searchAngleStep 搜索角度步长
    */
    static getMostDenseRectArea(mgr: UnitCollisionsManager, teamId: number, centerPos: Vec2, width: number, height: number, radius: number): { x: number, y: number, angle: number } {
        let targets = mgr.getCircleUnits(teamId, centerPos, radius) as BattleUnit[];
        if (targets.length === 0) {
            return { x: 0, y: 0, angle: 0 };
        }

        const angles = [0, 45, 90, 135, 180, 225, 270, 315];
        let bestCoverage = 0;
        let bestCenterX = 0;
        let bestCenterY = 0;
        let bestAngle = 0;

        const minX = Math.min(...targets.map(t => t.pos.x));
        const maxX = Math.max(...targets.map(t => t.pos.x));
        const minY = Math.min(...targets.map(t => t.pos.y));
        const maxY = Math.max(...targets.map(t => t.pos.y));

        const initialStep = width / 1;
        const finalStep = width / 20;

        let i = 0;
        for (const angle of angles) {
            let step = initialStep;
            while (step >= finalStep) {
                for (let centerX = minX; centerX <= maxX; centerX += step) {
                    for (let centerY = minY; centerY <= maxY; centerY += step) {
                        let units = mgr.getRectUnits(teamId, v2(centerX, centerY), angle, width, height)
                        if (units?.length > bestCoverage) {
                            bestCoverage = units.length;
                            bestCenterX = centerX;
                            bestCenterY = centerY;
                            bestAngle = angle;

                            // GameTimer.ins().once(1000 * i, this, (x, y, a, units: BattleUnit[]) => {
                            //     mgr.getRectUnits(teamId, v2(x, y), a, width, height)
                            // }, [centerX, centerY, angle], false)
                            // i++;
                        }
                    }
                }
                step /= 2; // 减小步长
            }
        }

        // mgr.getRectUnits(teamId, v2(bestCenterX, bestCenterY), bestAngle, width, height)
        let otheSideXyData = MathUtils.getCoordinates(bestAngle, height)
        let otheSidePoint = v2(otheSideXyData.x + bestCenterX, otheSideXyData.y + bestCenterY)
        if (MathUtils.getDistance(bestCenterX, bestCenterY, centerPos.x, centerPos.y) > MathUtils.getDistance(otheSidePoint.x, otheSidePoint.y, centerPos.x, centerPos.y)) {
            return { x: otheSidePoint.x, y: otheSidePoint.y, angle: bestAngle - 180 };
        }
        else
            return { x: bestCenterX, y: bestCenterY, angle: bestAngle };
    }

    /**
     * 筛选血量值最小的单位
     * @param targets 目标单位组
     */
    static getLowestHpTarget(targets: BattleUnit[]) {
        let target = targets[0];
        let minHp = target.attr.hp;
        for (let i = 1, len = targets.length - 1; i < len; i++) {
            let hp = targets[i].attr.hp;
            if (hp < minHp) {
                minHp = hp;
                target = targets[i];
            }
        }
        return target;
    }

    /**
     * 筛选血量百分比最小的单位
     * @param targets 目标单位组
     */
    static getLowestHpPercentageTarget(targets: BattleUnit[]) {
        let target = targets[0];
        let minHpPerc = target.attr.hpPercentage;

        for (let i = 1, len = targets.length - 1; i < len; i++) {
            let perc = targets[i].attr.hpPercentage;
            if (perc < minHpPerc) {
                minHpPerc = perc;
                target = targets[i];
            }
        }
        return target;
    }

    /**
     * 筛选血量百分比低于X的单位
     * @param targets 目标单位组
     * @param rate 血量百分比
    */
    static getLessThenHpPercentageTargets(targets: BattleUnit[], rate: number) {
        let arr: BattleUnit[] = [];
        for (let i = 0, len = targets.length; i < len; i++) {
            if (targets[i].attr.hpPercentage <= rate) {
                arr.push(targets[i]);
            }
        }
        return arr;
    }

}

