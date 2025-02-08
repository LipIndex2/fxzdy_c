import { Color, Graphics, Node, Vec2, v2 } from "cc";
import * as fgui from "fairygui-cc";
import { PathPoint } from "../../../../core/astar/PathPoint";
import { TimeManager } from "../../../../core/time/TimeManager";
import { Handler } from "../../../../core/utils/Handler";
import { MathUtils } from "../../../../core/utils/MathUtils";
import { SortUtils } from "../../../../core/utils/SortUtils";
import { CollisionUtils } from "../../math/CollisionUtils";
import { WorldManager } from "../../world/WorldManager";
import { BattleDebugManager } from "../BattleDebugManager";
import TeamFormation from "../TeamFormation";
import { DirctionType, UnitType, WorldUnitTeam } from "../enum/BattleEnum";
import { BaseUnitNode } from "../node/BaseUnitNode";
import { FormationType } from "../skill/SkillEnum";
import { BaseUnit } from "./BaseUnit";
import { BattleUnit } from "./battle/BattleUnit";
import { HeroUnit } from "./battle/HeroUnit";

export class TeamUnit extends BaseUnit {
    protected _type: UnitType = UnitType.Team;
    protected _heros: HeroUnit[];

    private _direction: number = null;
    private _oldR: number = null;
    private _dircTime: number = 0;

    private _ctrlVec = v2(1, 1);
    public isCtrlMove: boolean = false;
    public teamId: number

    private _node: BaseUnitNode;
    private _graphics: Node[];

    private _curPoints = [];
    /***位置对应的英雄 */
    private posHeroMap: { [pos: number]: HeroUnit }
    private frontArr: HeroUnit[]
    private middleArr: HeroUnit[]
    private afterArr: HeroUnit[]
    private formationTempArr: number[]

    private debugPoint: Node
    /***是否禁止移动 */
    public forbiddenMove: boolean = false;

    //横2
    private _points = [];
    // private _points = [[70, 0], [40, 80], [40, -80],
    // [-30, 0], [-60, 80], [-60, -80]];

    // private _points = [[90, 0], [60, 100], [60, -100],
    // [-50, 0], [-80, 100], [-80, -100]];
    //[-80, 80], [-80, 0], [-80, -80]];

    //横3
    //private _points = [[80, 80], [80, 0], [80, -80],
    //[0, 80], [0, 0], [0, -80],
    //[-80, 80], [-80, 0], [-80, -80]];

    //纵2
    //private _points = [[80, 40], [80, -40],
    //[0, 40], [0, -40],
    //[-80, 40], [-80, -40]];

    //private _color = [Color.RED, Color.RED, Color.RED,
    //Color.BLUE, Color.BLACK, Color.BLUE,
    // Color.YELLOW, Color.YELLOW, Color.YELLOW];

    private _color = [Color.RED, Color.RED, Color.RED,
    Color.BLUE, Color.BLUE, Color.BLUE];

    //private _color = [Color.RED, Color.BLUE, Color.RED,
    //    Color.BLUE, Color.RED, Color.BLUE];

    // public setNode(node: BaseUnitNode) {
    //     this._node = node;
    // }

    private testLabs: fgui.GTextField[] = []

    public setHeroList(heroes: HeroUnit[]) {
        this._heros = heroes;

        let mapCfg = this.battleLogic.mapCfg;
        if (mapCfg.formation == 2) {
            this._points = [[90, 0], [60, -100], [60, 100],
            [-30, 0], [-60, -100], [-60, 100],
            [-150, 0], [-180, -100], [-180, 100]];
        }
        else {
            this._points = [[80, 0], [50, -70], [50, 70],
            [0, 0], [-30, -70], [-30, 70],
            [-80, 0], [-110, -70], [-110, 70]];
        }

        this.debugGraphics()
        this.initHeroFormation(heroes);
    }

    protected debugGraphics(): void {
        return
        if (BattleDebugManager.ins().isDebug) {
            if (!this.debugPoint) {
                this.debugPoint = new Node()
                this.debugPoint.addComponent(Graphics)
            }

            let point = this._curPoints || this._points;

            let g = this.debugPoint.getComponent(Graphics)
            g.clear()
            g.lineWidth = 5;
            g.strokeColor.fromHEX('#ff0000')
            g.circle(0, 0, 20)
            g.stroke();
            g.fill();

            // if (this.testLabs.length == 0) {
            //     for (let i = 0; i < point.length; i++) {
            //         let lab = new fgui.GTextField()
            //         lab.text = (i + 1) + ""
            //         lab.fontSize = 20;
            //         lab.width = 100;
            //         lab.color = Color.BLACK;
            //         lab.align = HorizontalTextAlignment.CENTER
            //         this.testLabs.push(lab)
            //         this.debugPoint.addChild(lab.node);
            //     }
            // }

            for (let i = 0; i < point.length; i++) {
                g.lineWidth = 5;
                g.strokeColor.fromHEX('#ff0000')
                g.circle(point[i][0], point[i][1], 10)
                g.stroke();
                g.fill();
                // this.testLabs[i].setPosition(point[i][0] - 5, point[i][1] - 14)
            }
            WorldManager.ins().effectTopLayer.addChild(this.debugPoint);
        }
    }

    /***初始化英雄阵位 */
    protected initHeroFormation(heros: HeroUnit[]): void {

        this.formationTempArr = [0, 3, 6];
        this.frontArr = [];
        this.middleArr = [];
        this.afterArr = [];
        this.posHeroMap = {}

        if (heros.length == 1) {
            //特殊处理1个人的时候永远在4号位
            this.middleArr.push(heros[0])
        }
        else {
            //分类前中后排
            for (let i = heros.length - 1; i >= 0; i--) {
                //从后向前排
                if (heros[i].formationType == FormationType.Front) {
                    //前排
                    this.frontArr.push(heros[i])
                }
                else if (heros[i].formationType == FormationType.Middle) {
                    //中排
                    this.middleArr.push(heros[i])
                }
                else if (heros[i].formationType == FormationType.After) {
                    //后排
                    this.afterArr.push(heros[i])
                }
            }

            SortUtils.sortBy2(this.frontArr, ["formationSort"], [false], false);
            SortUtils.sortBy2(this.middleArr, ["formationSort"], [false], false);
            SortUtils.sortBy2(this.afterArr, ["formationSort"], [false], false);
        }

        this.pushHeroToAfterArr(this.afterArr)
        this.pushHeroToFrontArr(this.frontArr)
        this.pushHeroToMiddleArr(this.middleArr)
        if (this.formationTempArr[0] == 2) {
            //前排只有2个人
            this._points[1][1] += 30;
            this._points[2][1] -= 30;
            this.posHeroMap[1].formationPosition = 3
            this.posHeroMap[3] = this.posHeroMap[1]
            delete this.posHeroMap[1]
        }
        if (this.formationTempArr[1] == 5) {
            //中排只有2个人
            this._points[4][1] += 30;
            this._points[5][1] -= 30;
            this.posHeroMap[4].formationPosition = 6
            this.posHeroMap[6] = this.posHeroMap[4]
            delete this.posHeroMap[4]
        }
        if (this.formationTempArr[2] == 8) {
            //后排只有2个人
            this._points[7][1] += 30;
            this._points[8][1] -= 30;
            this.posHeroMap[7].formationPosition = 9
            this.posHeroMap[9] = this.posHeroMap[7]
            delete this.posHeroMap[7]
        }
        this.calFormationPos(this.formationRadians)
    }

    /***往后排添加 */
    private pushHeroToAfterArr(heros: HeroUnit[]): void {
        for (var i = 0; i < heros.length; i++) {
            if (this.formationTempArr[2] == 9) {
                //后排多出来的人塞去中排
                this.middleArr.push(heros[i])
            }
            else {
                heros[i].formationPosition = this.formationTempArr[2];
                this.posHeroMap[heros[i].formationPosition + 1] = heros[i]
                this.formationTempArr[2]++;
            }
        }
    }

    /***往前排添加 */
    private pushHeroToFrontArr(heros: HeroUnit[]): void {
        for (var i = 0; i < heros.length; i++) {
            if (this.formationTempArr[0] == 3) {
                //前排多出来的人塞去中排
                this.middleArr.push(this.frontArr[i])
            }
            else {
                heros[i].formationPosition = this.formationTempArr[0];
                this.posHeroMap[heros[i].formationPosition + 1] = heros[i]
                this.formationTempArr[0]++;
            }
        }
    }

    /***往中排添加 */
    private pushHeroToMiddleArr(heros: HeroUnit[]): void {
        for (var i = 0; i < heros.length; i++) {
            if (this.formationTempArr[1] <= 5) {
                heros[i].formationPosition = this.formationTempArr[1];
                this.posHeroMap[heros[i].formationPosition + 1] = heros[i]
                this.formationTempArr[1]++;
            }
            else {
                //优先去后排
                if (this.formationTempArr[2] < 9) {
                    this.pushHeroToAfterArr([this.middleArr[i]])
                }
                else {
                    this.pushHeroToFrontArr([this.middleArr[i]])
                }
            }
        }
    }

    public updateFormation(force: boolean = false) {
        let points = this._curPoints;
        if (this._curPoints.length) {

            TeamFormation.setNearFormationPos(this.posHeroMap[1], null, points[0], null, this._pos, false, force);
            TeamFormation.setNearFormationPos(this.posHeroMap[4], null, points[3], null, this._pos, false, force);
            TeamFormation.setNearFormationPos(this.posHeroMap[7], null, points[6], null, this._pos, false, force);
            TeamFormation.setNearFormationPos(this.posHeroMap[2], this.posHeroMap[3], points[1], points[2], this._pos, true, force);
            TeamFormation.setNearFormationPos(this.posHeroMap[5], this.posHeroMap[6], points[4], points[5], this._pos, true, force);
            TeamFormation.setNearFormationPos(this.posHeroMap[8], this.posHeroMap[9], points[7], points[8], this._pos, true, force);
        }
    }

    private formationRadians: number
    public calFormationPos(radians: number) {
        this.formationRadians = radians;
        let points = this._curPoints = [];
        for (let i = 0; i < 9; i++) {
            let fx = this._points[i][0] * Math.cos(radians) - this._points[i][1] * Math.sin(radians);
            let fy = this._points[i][0] * Math.sin(radians) + this._points[i][1] * Math.cos(radians);
            points.push([fx, fy]);

            // let fx = this._points[i][0]
            // let fy = this._points[i][1]
            // points.push([fx, fy]);
        }
        for (let i = 0; i < this._heros.length; i++) {
            if (this._heros[i].teamId == WorldUnitTeam.Self)
                this._heros[i].setDirction(DirctionType.Left)
            else
                this._heros[i].setDirction(DirctionType.Rigth)
        }
        this.debugGraphics();
    }

    public get moveDistance() {
        let minSpeed: number = 9999
        for (let i = 0; i < this._heros.length; i++) {
            minSpeed = Math.min(minSpeed, this._heros[i].moveDistance)
        }
        return minSpeed;
    }

    public setDirection(angle: number) {
        if (this.forbiddenMove)
            return
        /*
        if(angle == null){
            //取消控制
            this._oldR = null;
            this.updateFormation(this._direction);
        }*/
        this.stopMove();
        this._direction = angle;
        // this._dircTime = TimeManager.battleNow + 1000;
        if (this._direction == null) {
            this.isCtrlMove = false;
            this.formationTargetAngle = null;
            this._oldR = null;
        }
        else
            this.isCtrlMove = true;
    }

    /***目标移动位置 */
    public targetMovePoint: Vec2;
    public setMoveVec(x: number, y: number) {
        this.isCtrlMove = false;
        if (!this.targetMovePoint)
            this.targetMovePoint = new Vec2(x, y)
        this.targetMovePoint.set(x, y)
        let vec = CollisionUtils.calVecTemp(this.pos, new Vec2(this.targetMovePoint.x, this.targetMovePoint.y), this.moveDistance);
        this._ctrlVec.set(vec);
    }

    get isMoving() {
        return this._direction != null || this.isPathMove;
    }

    get isAutoMoving() {
        return this.targetMovePoint != null;
    }

    public stopMove(): void {
        this.targetMovePoint = null;
    }

    /***变阵的目标角度 */
    private formationTargetAngle: number = null;
    /***开始变阵的当前角度 */
    private formationNowAngle: number = null;
    public update(): boolean {
        if (this.isCtrlMove) {
            this.clearPathMove();
            if (this.isMoving) {
                if (!this._heros?.length) return false;
                let radians = MathUtils.angle2Radians(this._direction);

                let moveDistance = this.moveDistance;

                this._ctrlVec.set(moveDistance * Math.cos(radians), moveDistance * Math.sin(radians));

                this.battleLogic.unitCollisionsManager.tryMove(this.pos, this._ctrlVec);

                //this._node.setPosition(Math.floor(this._pos.x), Math.floor(this._pos.y));

                for (let i = 0; i < this._heros.length; i++) {
                    this._heros[i].setCtrlVec(this._ctrlVec);
                }

                let now = TimeManager.battleNow;

                if (this._oldR === null || (Math.abs(Math.abs(radians) - Math.abs(this._oldR)) > 0.40)) {
                    this._dircTime = now + 1000;
                    this._oldR = radians;
                }

                // if (this._dircTime <= now && this.formationTargetAngle == null) 
                {
                    if (this._heros.length > 3) {
                        let targetAngle = MathUtils.adjustmentAngle(MathUtils.radians2Angle(this._oldR))
                        let nowAngle = MathUtils.adjustmentAngle(MathUtils.radians2Angle(this.formationRadians))
                        let value = Math.abs(targetAngle - nowAngle)
                        if (value <= 120) {
                            this.formationNowAngle = nowAngle;
                            this.formationTargetAngle = targetAngle;
                        }
                        else {
                            this.formationTargetAngle = null;
                            this.calFormationPos(this._oldR);
                        }
                    }
                }

                if (this.formationTargetAngle != null) {
                    if (Math.abs(this.formationTargetAngle - this.formationNowAngle) <= 2) {
                        this.formationTargetAngle = null;
                    }
                    else if (this.formationTargetAngle > this.formationNowAngle) {
                        this.formationNowAngle += 2;
                        this.calFormationPos(MathUtils.angle2Radians(this.formationNowAngle));
                    }
                    else if (this.formationTargetAngle < this.formationNowAngle) {
                        this.formationNowAngle -= 2;
                        this.calFormationPos(MathUtils.angle2Radians(this.formationNowAngle));
                    }
                }

                // if (this._dircTime <= now) {
                //     this._dircTime = now + 1000
                //     console.log(radians)
                // this.calFormationPos(radians);
                // }

                this.updateFormation();
            }
        } else {
            if (this.targetMovePoint) {
                if (!this._heros?.length) return false;
                if (Vec2.distance(this.targetMovePoint, this.pos) > 10) {
                    this.moveTargetPointHandler();
                }
                else {
                    if (this.movePaths?.length) {
                        this.moveTargetPointHandler();
                    }
                    else
                        this.stopMove();
                    this.checkPathMove();
                }
            }
        }

        if (this.debugPoint && this.debugPoint.isValid) {
            this.debugPoint.setPosition(this.pos.x, this.pos.y)
        }

        return true
    }

    protected moveTargetPointHandler(): void {
        this.battleLogic.unitCollisionsManager.tryMove(this.pos, this._ctrlVec, this.isPathMove);
        for (let i = 0; i < this._heros.length; i++) {
            this._heros[i].setMoveVec(this._ctrlVec);
        }
        this.updateFormation();
    }

    /***队伍的最大索敌范围 */
    public get teamMaxSearchRange(): number {
        let n = 0
        for (let i = 0; i < this._heros.length; i++) {
            n = Math.max(n, this._heros[i].searchRange())
        }
        return n;
    }

    /***队伍是否战斗中 */
    public get isTeamFighting(): boolean {
        for (let i = 0; i < this._heros.length; i++) {
            if (this._heros[i].isBeginToFight)
                return true;
        }

        return false
    }

    /***获取队伍中1个被选择的非友方目标 */
    public getTeamSelectMainTarget(): BattleUnit {
        for (let i = 0; i < this._heros.length; i++) {
            if (this._heros[i].selectMainTarget && this._heros[i].selectMainTarget.unit && this._heros[i].selectMainTarget.unit.teamId != this.teamId)
                return this._heros[i].selectMainTarget.unit;
        }

        return null
    }

    public get heros(): HeroUnit[] {
        return this._heros;
    }

    public get afterHero(): HeroUnit {
        for (let i = 0; i < this.afterArr.length; i++) {
            return this.afterArr[i]
        }

        for (let i = 0; i < this.middleArr.length; i++) {
            return this.middleArr[i]
        }

        for (let i = 0; i < this.frontArr.length; i++) {
            return this.frontArr[i]
        }
        return null
    }

    /****重新更新目标位置的时间 */
    /***当前路径移动点 */
    protected nowMovePoint: PathPoint;
    /***是否路径移动中 */
    protected isPathMove: boolean = false;
    /***当前的移动路径 */
    private movePaths: PathPoint[]
    private setMoveTargetComplete: Handler;
    public setMoveTarget(targetPoint: Vec2, setMoveTargetComplete?: Handler): number {
        if (this.battleLogic.unitCollisionsManager.isInBlock(this.pos))
            return 0;
        let paths: PathPoint[] = this.battleLogic.aStar.findPaths(this.pos, targetPoint, false)
        if (paths && paths.length > 0) {
            BattleDebugManager.ins().debugShowPaths(paths)
            this.runPaths(this.battleLogic.aStar.getOptimizePath(paths))
            this.setMoveTargetComplete = setMoveTargetComplete;
            return 1
        }
        return 0
    }

    /**按一组路线移动 */
    public runPaths(paths: PathPoint[]): void {
        if (paths && paths.length == 0)
            return

        this.isPathMove = true;
        this.movePaths = paths;
        this.moveNextPath()
    }

    protected moveNextPath(): boolean {
        if (this.movePaths.length == 0) {
            if (this.setMoveTargetComplete) {
                this.setMoveTargetComplete.runWith([this])
            }
            return false;
        }
        let targetPoint = this.movePaths.shift();
        this.setMoveVec(targetPoint.pixelPoint.x, targetPoint.pixelPoint.y);
        return true;
    }

    protected clearPathMove(): void {
        if (this.isPathMove) {
            this.isPathMove = false;
            this.movePaths.length = 0;
            this.targetMovePoint = null;
        }
    }

    /***判断路径位移 */
    protected checkPathMove(): void {
        if (this.isPathMove) {
            if (!this.moveNextPath()) {
                this.isPathMove = false;
            }
        }
    }
}