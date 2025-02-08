import { Rect, Vec2 } from "cc";
import { V2Quadtree } from "../../math/V2Quadtree";
import { BaseUnit } from "../unit/BaseUnit";
import { BattleUnit } from "../unit/battle/BattleUnit";
import { CollisionUtils } from "../../math/CollisionUtils";
import { MineralUnit } from "../unit/MineralUnit";
import { AreaUnit } from "../unit/AreaUnit";
import { RectQuadtree } from "../../math/RectQuadtree";
import { MathUtils } from "../../../../core/utils/MathUtils";
import { BattleDebugManager } from "../BattleDebugManager";
import BattleConstantConfig from "../config/BattleConstantConfig";
import { TargetFaction } from "../skill/SkillEnum";
import { BattleLogic } from "../BattleLogic";
import { v2 } from "cc";
import { DropUnit } from "../unit/DropUnit";

export default class UnitCollisionsManager {
    /**战斗实体四叉树 */
    private _battleTreeMap: { [key: number]: V2Quadtree<BaseUnit> } = {};
    private _mineralTree: V2Quadtree<BaseUnit>;
    private _dropsTree: V2Quadtree<DropUnit>;
    /**安全区四叉树 */
    private _safeAreaTree: RectQuadtree<AreaUnit>;
    /**障碍四叉树 */
    private _blockTree: RectQuadtree<AreaUnit>;
    /** 区域四叉树 */
    private _areaTree: RectQuadtree<AreaUnit>;

    /**地图像素宽 (astar用)*/
    public mapW: number;
    /**地图像素高 (astar用)*/
    public mapH: number;

    private _width: number;
    private _height: number;
    private _screenRect: Rect;

    private _tempRect: Rect = new Rect();
    private _tempVec2: Vec2 = new Vec2();
    private _tempFounds: BaseUnit[] = [];
    private _tempAreaFounds: AreaUnit[] = [];

    private _emenyTeamMap = { 1: 2, 2: 1 };
    private _teamCollisionMap = { 1: [1], 2: [1, 2] };

    public mapCfg: table.map.MapidConfig;
    public battleLogic: BattleLogic;

    public initMapData(mapCfg: table.map.MapidConfig, mapW: number, mapH: number): void {
        this.mapCfg = mapCfg
        this.mapW = mapW
        this.mapH = mapH
        let mapScale = (this.mapCfg.mapScale || 100) * 0.01;
        this._width = Math.min(this.mapW, BattleConstantConfig.checkRangeWidth) / mapScale;
        this._height = Math.min(this.mapH, BattleConstantConfig.checkRangeHeight) / mapScale;
    }

    reset() {
        this._battleTreeMap = {};
        this._mineralTree = null;
        this._dropsTree = null;
        this._safeAreaTree = null;
        this._blockTree = null;
        this._areaTree = null;
    }

    public updateRect(centerPoint: Vec2) {
        this._screenRect = new Rect(centerPoint.x - this._width / 2, centerPoint.y - this._height / 2, this._width, this._height);
    }

    /**更新角色单元 */
    public updateUnits(teamId: number, units: BattleUnit[]) {
        this._battleTreeMap[teamId] = new V2Quadtree(this._screenRect);
        for (let i = units.length - 1; i >= 0; i--) {
            if (units[i].isActive && units[i].canSelect()) {
                this._battleTreeMap[teamId].insert(units[i]);
            }
        }
    }

    public initTreeTeam(teamId): void {
        this._battleTreeMap[teamId] = new V2Quadtree(this._screenRect);
    }

    /**更新角色单元 */
    public updateUnit(unit: BattleUnit) {
        if (unit.isActive && unit.canSelect()) {
            this._battleTreeMap[unit.teamId].insert(unit);
        }
    }

    /**更新矿单元 */
    public updateMineralUnits(units: MineralUnit[]) {
        this._mineralTree = new V2Quadtree(this._screenRect);
        for (let i = units.length - 1; i >= 0; i--) {
            if (units[i].isActive) {
                this._mineralTree.insert(units[i]);
            }
        }
    }

    /**更新掉落 */
    public updateDropUnits(units: DropUnit[]) {
        this._dropsTree = new V2Quadtree(this._screenRect);
        for (let i = units.length - 1; i >= 0; i--) {
            if (units[i].isActive) {
                this._dropsTree.insert(units[i]);
            }
        }
    }

    /**
     * 更新安全区单元
     */
    public updateSafeAreaUnits(units: AreaUnit[]) {
        this._safeAreaTree = new RectQuadtree(new Rect(0, 0, this.mapW, this.mapH));
        for (let i = units.length - 1; i >= 0; i--) {
            if (units[i]) {
                this._safeAreaTree.insert(units[i]);
            }
        }
    }

    /**是否在安全区 */
    public isInSafeArea(point: Vec2) {
        return this._safeAreaTree?.isInsidePolygonByPoint(point);
    }

    /**
     * 更新区域单元
     */
    public updateAreaUnits(units: AreaUnit[]) {
        this._areaTree = new RectQuadtree(new Rect(0, 0, this.mapW, this.mapH));
        for (let i = units.length - 1; i >= 0; i--) {
            if (units[i]) {
                this._areaTree.insert(units[i]);
            }
        }
    }

    /**获取所在的区域 */
    public getInArea(point: Vec2): AreaUnit {
        return this._areaTree?.findInsidePolygonByPoint(point);
    }

    /**
     * 更新障碍单元
     */
    public updateBlockUnits(units: AreaUnit[]) {
        this._blockTree = new RectQuadtree(new Rect(0, 0, this.mapW, this.mapH));
        for (let i = units.length - 1; i >= 0; i--) {
            if (units[i]) {
                this._blockTree.insert(units[i]);
            }
        }
    }

    /**是否在可解锁障碍范围
     * （为了让怪刷新在可解锁障碍内）
    */
    public isInCanUnlockBlock(point: Vec2): boolean {
        if (!this._blockTree) return null;
        this._tempAreaFounds.length = 0;
        this._blockTree.queryByPoint(point, this._tempAreaFounds);
        if (this._tempAreaFounds.length) {
            for (let i = this._tempAreaFounds.length - 1; i >= 0; i--) {
                if (!this._tempAreaFounds[i].isFixed && this._tempAreaFounds[i].isInside(point)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**清理障碍 */
    public removeBlock(unit: AreaUnit) {
        if (!this._blockTree) return;
        this._blockTree.remove(unit);
    }

    /**是否在障碍 */
    public isInBlock(point: Vec2) {
        return this._blockTree?.isInsidePolygonByPoint(point);
    }

    /**是否在尝试移动 */
    public tryMove(start: Vec2, moveVec: Vec2, isIgnoreBlock: boolean = false) {
        this._tempVec2.set(start.x + moveVec.x, start.y + moveVec.y);
        /**是否进入障碍 */
        let unit = !isIgnoreBlock && this._blockTree?.findInsidePolygonByPoint(this._tempVec2);
        if (unit) {
            let tempVec = CollisionUtils.getPloyParallelVec(start, this._tempVec2, unit.points);
            /**是否有移动建议 || 是否再次进入障碍 */
            if (!tempVec || this.isInBlock(tempVec)) {
                return false;
            }
            start.set(tempVec);
        } else {
            start.set(this._tempVec2);
        }
        return true;
    }

    /***按当前速度碰撞后，获取1条延碰撞多边形平衡的速度 */
    public getBlockNewVec(start: Vec2, moveVec: Vec2): Vec2 {
        this._tempVec2.set(start.x + moveVec.x, start.y + moveVec.y);
        /**是否进入障碍 */
        let unit = this._blockTree?.findInsidePolygonByPoint(this._tempVec2);
        if (unit) {
            let tempVec = CollisionUtils.getPloyParallelMoveVec(start, this._tempVec2, unit.points);
            if (tempVec)
                return v2(tempVec.x, tempVec.y);
        }

        return null;
    }

    /**是否存在单位 */
    public hasUnit(teamId: number, pos: Vec2, radius: number) {
        this._tempRect.set(pos.x - radius, pos.y - radius, radius * 2, radius * 2);
        return this._battleTreeMap[teamId]?.hasUnit(this._tempRect);
    }

    /**计算单位环境向量 */
    public calUnitEnvVec(unit: BattleUnit) {
        if (!unit.envActive) return;
        this._tempFounds.length = 0;
        this._tempRect.set(unit.pos.x - (unit.width / 2), unit.pos.y - (unit.height / 2), unit.width, unit.height);
        let teams = this._teamCollisionMap[unit.teamId];

        for (let i = 0; i < teams.length; i++) {
            let teamId = teams[i];
            this._battleTreeMap[teamId]?.query(this._tempRect, this._tempFounds, unit);
        }

        if (this._tempFounds.length) {
            this.calCollisionVec(unit as BattleUnit, this._tempFounds as BattleUnit[]);
        }
    }

    /**计算碰撞向量 */
    private calCollisionVec(unit: BattleUnit, collisions: BattleUnit[]) {
        for (let i = 0; i < collisions.length; i++) {
            const collision = collisions[i];
            if (!collision.envActive)
                continue
            let r = 0;
            if (collision.pos.x == unit.pos.x && collision.pos.y == unit.pos.y) {
                //坐标完全相等，随机1下角度
                r = this.battleLogic.randomMgr.randomDouble(-1, 1)
            }
            let tempVec2 = CollisionUtils.calVecTemp(collision.pos, unit.pos, 2, r);
            unit.addEnvVec(tempVec2);
        }
    }

    /**获取范围内最近矿产
     * @param dis 半径
     * @param unit 自身单位
     */
    public getNearestMineralUnit(dis: number, pos: Vec2) {
        let d = dis * 2;
        this._tempRect.set(pos.x - dis, pos.y - dis, d, d);
        return this._mineralTree.queryNearest(this._tempRect);
    }

    /**获取范围内最近掉落物
    * @param dis 半径
    * @param unit 自身单位
    */
    public getNearestDropUnit(dis: number, pos: Vec2) {
        let d = dis * 2;
        this._tempRect.set(pos.x - dis, pos.y - dis, d, d);
        return this._dropsTree.queryNearest(this._tempRect);
    }

    /**获取圆形内目标队伍的所有单位
     * @param teamId 目标队伍
     * @param centerPos 中心坐标
     * @param dis 半径
     */
    public getCircleDropUnits(centerPos: Vec2, radius: number) {
        let d = radius * 2;
        this._tempRect.set(centerPos.x - radius, centerPos.y - radius, d, d);
        return this._dropsTree.queryByRadius(this._tempRect);
    }

    /**获取范围内目标队伍的最近单位
     * @param teamId 目标队伍
     * @param centerPos 中心坐标
     * @param dis 半径
     * @param self 当前行动单位
     */
    public getNearestBattleUnit(teamId: number, centerPos: Vec2, dis: number, self?: BattleUnit) {
        let d = dis * 2;
        this._tempRect.set(centerPos.x - dis, centerPos.y - dis, d, d);
        return this._battleTreeMap[teamId].queryNearest(this._tempRect, self);
    }

    /**获取范围内目标队伍的最远单位
     * @param teamId 目标队伍
     * @param centerPos 中心坐标
     * @param dis 半径
     * @param self 当前行动单位
     */
    public getFarthestBattleUnit(teamId: number, centerPos: Vec2, dis: number, self?: BattleUnit) {
        let d = dis * 2;
        this._tempRect.set(centerPos.x - dis, centerPos.y - dis, d, d);
        return this._battleTreeMap[teamId].queryFarthest(this._tempRect, self);
    }

    /**获取圆形内目标队伍的所有单位
     * @param teamId 目标队伍
     * @param centerPos 中心坐标
     * @param dis 半径
     */
    public getCircleUnits(teamId: number, centerPos: Vec2, radius: number) {
        let d = radius * 2;
        this._tempRect.set(centerPos.x - radius, centerPos.y - radius, d, d);
        if (teamId != TargetFaction.Both) {
            return this._battleTreeMap[teamId].queryByRadius(this._tempRect);
        }
        else {
            let units: BaseUnit[] = []
            for (let key in this._battleTreeMap) {
                units = units.concat(this._battleTreeMap[key].queryByRadius(this._tempRect));
            }
            return units
        }
    }


    /**获取扇形目标队伍的所有单位
     * @param teamId 目标队伍
     * @param centerPos 中心坐标
     * @param targetAngle 目标方向
     * @param angleRange 角度范围
     * @param radius 半径
     */
    public getArcUnits(teamId: number, centerPos: Vec2, targetAngle: number, angleRange: number, radius: number) {
        let found = this.getCircleUnits(teamId, centerPos, radius);
        if (!found.length) return found;

        let needs: BaseUnit[] = [];
        let minAngle = targetAngle - angleRange / 2;
        let maxAngle = targetAngle + angleRange / 2;

        for (let i = 0; i < found.length; i++) {
            let angle = MathUtils.angleXY(centerPos.x, centerPos.y, found[i].pos.x, found[i].pos.y);
            if (angle < 0) {
                angle += 360
            }
            if (MathUtils.isContainAngle(minAngle, maxAngle, angle)) {
                needs.push(found[i]);
            }
        }
        return needs;
    }


    /**
     * 获取矩形范围内的所有单位
    * @param teamId 目标队伍
    * @param centerPos 中心坐标
    * @param targetAngle 目标方向
    * @param width 宽
    * @param height 高
    */
    public getRectUnits(teamId: number, centerPos: Vec2, targetAngle: number, width: number, height: number) {

        var vectorRadian: number = -MathUtils.angle2Radians(targetAngle);

        var rectWidth: number = width * 0.5
        var rectHeight: number = height

        let p1: Vec2 = new Vec2(Math.sin(vectorRadian) * rectWidth + centerPos.x, Math.cos(vectorRadian) * rectWidth + centerPos.y);
        let p4: Vec2 = new Vec2(Math.sin(vectorRadian) * -rectWidth + centerPos.x, Math.cos(vectorRadian) * -rectWidth + centerPos.y);
        let p2: Vec2 = new Vec2(p1.x + Math.cos(-vectorRadian) * rectHeight, p1.y + Math.sin(-vectorRadian) * rectHeight);
        let p3: Vec2 = new Vec2(p4.x + Math.cos(-vectorRadian) * rectHeight, p4.y + Math.sin(-vectorRadian) * rectHeight);

        let found = this.getCircleUnits(teamId, centerPos, 999);
        if (!found.length) return found;

        let needs: BaseUnit[] = [];
        BattleDebugManager.ins().showRange(p1, p2, p3, p4)

        let ranges = [p1, p2, p3, p4]
        for (let i = 0; i < found.length; i++) {
            if (MathUtils.isPointinPolygon(found[i].pos, ranges, 4)) {
                needs.push(found[i]);
            }
        }
        return needs;
    }

    /**
     * 获取矩形范围内的所有单位
    * @param teamId 目标队伍
    * @param centerPos 中心坐标
    * @param targetAngle 目标方向
    * @param width 宽
    * @param height 高
    */
    public getRectUnits2(teamId: number, centerPos: Vec2, targetAngle: number, width: number, height: number, isLeft: boolean) {

        var vectorRadian: number = -MathUtils.angle2Radians(targetAngle);

        var rectWidth: number = width
        var rectHeight: number = height

        let p = MathUtils.getCoordinates(targetAngle + (isLeft ? -90 : 90), rectWidth) as Vec2
        p.x += centerPos.x
        p.y += centerPos.y

        let p1: Vec2 = new Vec2(Math.sin(vectorRadian) * rectWidth + p.x, Math.cos(vectorRadian) * rectWidth + p.y);
        let p4: Vec2 = new Vec2(Math.sin(vectorRadian) * -rectWidth + p.x, Math.cos(vectorRadian) * -rectWidth + p.y);
        let p2: Vec2 = new Vec2(p1.x + Math.cos(-vectorRadian) * rectHeight, p1.y + Math.sin(-vectorRadian) * rectHeight);
        let p3: Vec2 = new Vec2(p4.x + Math.cos(-vectorRadian) * rectHeight, p4.y + Math.sin(-vectorRadian) * rectHeight);

        let found = this.getCircleUnits(teamId, centerPos, 9999);
        if (!found.length) return found;

        let needs: BaseUnit[] = [];
        BattleDebugManager.ins().showRange(p1, p2, p3, p4)

        let ranges = [p1, p2, p3, p4]
        for (let i = 0; i < found.length; i++) {
            if (MathUtils.isPointinPolygon(found[i].pos, ranges, 4)) {
                needs.push(found[i]);
            }
        }
        return needs;
    }

    /**
    * 获取矩形范围内的相交矩形的单位
   * @param teamId 目标队伍
   * @param centerPos 中心坐标
   * @param targetAngle 目标方向
   * @param width 宽
   * @param height 高
   */
    public getRectUnits3(teamId: number, centerPos: Vec2, targetAngle: number, width: number, height: number) {

        var vectorRadian: number = -MathUtils.angle2Radians(targetAngle);

        var rectWidth: number = width * 0.5
        var rectHeight: number = height

        let p1: Vec2 = new Vec2(Math.sin(vectorRadian) * rectWidth + centerPos.x, Math.cos(vectorRadian) * rectWidth + centerPos.y);
        let p4: Vec2 = new Vec2(Math.sin(vectorRadian) * -rectWidth + centerPos.x, Math.cos(vectorRadian) * -rectWidth + centerPos.y);
        let p2: Vec2 = new Vec2(p1.x + Math.cos(-vectorRadian) * rectHeight, p1.y + Math.sin(-vectorRadian) * rectHeight);
        let p3: Vec2 = new Vec2(p4.x + Math.cos(-vectorRadian) * rectHeight, p4.y + Math.sin(-vectorRadian) * rectHeight);

        let found = this.getCircleUnits(teamId, centerPos, 999);
        if (!found.length) return found;

        let needs: BaseUnit[] = [];
        BattleDebugManager.ins().showRange(p1, p2, p3, p4)

        let ranges = [p1, p2, p3, p4];
        let vv1: Vec2 = v2(0, 0)
        let vv2: Vec2 = v2(0, 0)
        let vv3: Vec2 = v2(0, 0)
        let vv4: Vec2 = v2(0, 0)
        for (let i = 0; i < found.length; i++) {
            let foundRanges = [vv1, vv2, vv3, vv4]
            if (found[i] instanceof BattleUnit) {
                let unit = found[i] as BattleUnit;
                let unitSize = unit.attr.getSize()
                vv1.set(unit.pos.x - unitSize * 0.5, unit.pos.y + unitSize)
                vv2.set(unit.pos.x + unitSize * 0.5, unit.pos.y + unitSize)
                vv3.set(unit.pos.x + unitSize * 0.5, unit.pos.y)
                vv4.set(unit.pos.x - unitSize * 0.5, unit.pos.y)
                // BattleDebugManager.ins().showRange(vv1, vv2, vv3, vv4)
                if (MathUtils.isRectanglesIntersecting(ranges, foundRanges)) {
                    needs.push(found[i]);
                }
            }
        }
        return needs;
    }


    /**找到范围内最近的敌人
     * @param dis 半径
     * @param unit 自身单位
     */
    public getNearestEmenyUnit(unit: BattleUnit, dis: number) {
        let emenyTeamId = this._emenyTeamMap[unit.teamId];
        return this.getNearestBattleUnit(emenyTeamId, unit.pos, dis);
    }


    /**获取圆形内的所有己方单位
     * @param radius 半径
     * @param unit 自身单位
     * @param target
     */
    public getCircleOurUnit(unit: BattleUnit, dis: number) {
        return this.getCircleUnits(unit.teamId, unit.pos, dis);
    }

}
