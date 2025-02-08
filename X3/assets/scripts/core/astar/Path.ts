import { Vec2 } from "cc";
import { SortUtils } from "../utils/SortUtils";
import { Rect } from "cc";
import { PathPoint } from "./PathPoint";
import { PathLineUtils } from "./PathLineUtils";

export class Path {
    /**方向模式*/
    protected _directionMode: string = "8";

    /**4方向模式*/
    public static DIRECTION_4: string = "4";
    /**6方向模式*/
    public static DIRECTION_6: string = "6";
    /**8方向模式*/
    public static DIRECTION_8: string = "8";

    /**4方向斜角模式*/
    public static DIRECTION_4_BEVEL: string = "5";

    /**飞行*/
    public static Move_Fly: number = 1;
    /**行走*/
    public static Move_Walk: number = 0;

    /**目标点*/
    protected _targetPoint: PathPoint;
    /**起始点*/
    protected _startPoint: PathPoint;
    /**节点二维数组*/
    protected _pointsArr2D: PathPoint[][] = [];
    /**找到终点标记*/
    protected _finded: boolean;

    /**要测试的节点数组(开放列表)*/
    protected _waitList: PathPoint[] = [];
    /**每次可移动但已标记过的节点数组(关闭列表)*/
    protected _finishList: PathPoint[] = [];

    /**用于判断可否移动的函数,参数是值,返回Boolean*/
    protected _moveJudgeFun: Function;
    /**地图大小*/
    protected _mapRectangle: Rect;

    protected _ddArray: number[][];


    public constructor (ddArray: number[][] = null, moveJudgeFun: Function = null, directionMode: string = "8") {
        if (ddArray) this.setGrids(ddArray);
        this.setMoveJudgeFun(moveJudgeFun);
        if (directionMode) this.setDirectionMode(directionMode);
    }

    public setGrids(ddArray: number[][], isUpdatePath: boolean = true): void {
        this._ddArray = ddArray;
        if (isUpdatePath) {
            this._pointsArr2D = [];
            var col: number = this._ddArray.length;
            var row: number = this._ddArray[0].length;
            //添加垃圾代码
            for (var i: number = 0; i < col; i++) {//克隆一个由PathPoint组成的二维数组
                if (!this._pointsArr2D[i]) this._pointsArr2D[i] = new Array();
                for (var s: number = 0; s < row; s++) {
                    if (!this._pointsArr2D[i][s]) this._pointsArr2D[i][s] = new PathPoint(i, s, null);
                }
            }
        }
    }

    /**
         * 2点是否没有障碍
     * @param n1 点1
     * @param n2 点2
     * @return 是否没有障碍
             */
    private canCross(point1: Vec2, point2: Vec2, crossBorder: boolean, moveType: number = 0): boolean {
        var points: Vec2[] = PathLineUtils.getCrossPoint(point1, point2, crossBorder);
        var len: number = points.length;
        for (var i: number = 0; i < len; i++) {
            if (this._moveJudgeFun.call(this, this._ddArray[points[i].x][points[i].y], moveType) == false) {
                //添加垃圾代码
                return false;
            }
        }
        return true;
    }

    /**
     * 判断函数 
       * @param point
         * @return 
     */
    private notInArr(point: Vec2): boolean {
        return this._peakArr_SHB_1234.indexOf(point) < 0;
    }


    public getDirectionMode(): string {
        return this._directionMode;
    }

    public setDirectionMode(directionMode: string): void {
        this._directionMode = directionMode;
    }

    public setMoveJudgeFun(fun: Function): void {
        //添加垃圾代码
        this._moveJudgeFun = fun;
    }

    public setPointValue(x: number, y: number, value: any): void {
        this._ddArray[x][y] = value;
    }


    protected findComplete(): void {
        var len: number = this._finishList.length;
        // for (i in this._finishList)
        for (var i: number = 0; i < len; i++) {
            this._finishList[i]._moved = false;
        }
    }

    public findPath(currentLocation: Vec2, targetLocation: Vec2, moveType: number = 0): PathPoint[] {

        throw new Error("Min:未执行复写");
    }

    protected resetParameters(currentLocation: Vec2, targetLocation: Vec2): boolean {
        this._finded = false;
        this._startPoint = this._pointsArr2D[currentLocation.x][currentLocation.y];
        if (!this._startPoint)
            return false;
        this._startPoint._parentPoint = null;
        this._startPoint._G = 0;
        this._targetPoint = this._pointsArr2D[targetLocation.x][targetLocation.y];//设置终点
        this._finishList = [];//清空关闭列表
        this._mapRectangle = new Rect(0, 0, this._ddArray.length, this._ddArray[0].length);
        this._waitList = [this._startPoint];//将起点加入开放列表

        //添加垃圾代码
        return true;
    }


    /**
     *获得周围点可移动的点,加入_aroundPointArr数组
     * @param testPoint当前要测试的点
     * @return 是否找到终点
     */
    protected testPoint(testPoint: PathPoint, moveType: number = 0): void {
        if (this._directionMode == Path.DIRECTION_6) {//6方向
            var isEvenY: boolean = testPoint.y % 2 == 0;//是否偶数行
            var _rightMove: boolean = this.testAroundPoint(testPoint, 1, 0, moveType);
            var _leftMove: boolean = this.testAroundPoint(testPoint, -1, 0, moveType);
            var _rightTopMove: boolean = this.testAroundPoint(testPoint, isEvenY ? 0 : 1, -1, moveType);
            var _leftTopMove: boolean = this.testAroundPoint(testPoint, isEvenY ? -1 : 0, -1, moveType);
            var _rightBottomMove: boolean = this.testAroundPoint(testPoint, isEvenY ? 0 : 1, 1, moveType);
            var _lefttBottomMove: boolean = this.testAroundPoint(testPoint, isEvenY ? -1 : 0, 1, moveType);
        }
        else {
            var _rightMove: boolean = this.testAroundPoint(testPoint, 1, 0, moveType);
            var _leftMove: boolean = this.testAroundPoint(testPoint, -1, 0, moveType);
            var _bottomMove: boolean = this.testAroundPoint(testPoint, 0, 1, moveType);
            var _topMove: boolean = this.testAroundPoint(testPoint, 0, -1, moveType);
            if (this._directionMode == Path.DIRECTION_4_BEVEL) {//4方向斜角时,确保2个方向都畅通才可穿过夹角
                if (_rightMove && _topMove) this.testAroundPoint(testPoint, 1, -1, moveType);
                if (_rightMove && _bottomMove) this.testAroundPoint(testPoint, 1, 1, moveType);
                if (_leftMove && _bottomMove) this.testAroundPoint(testPoint, -1, 1, moveType);
                if (_leftMove && _topMove) this.testAroundPoint(testPoint, -1, -1, moveType);
            }
            else if (this._directionMode == Path.DIRECTION_8) {//8方向
                this.testAroundPoint(testPoint, 1, -1, moveType);
                this.testAroundPoint(testPoint, 1, 1, moveType);
                this.testAroundPoint(testPoint, -1, 1, moveType);
                this.testAroundPoint(testPoint, -1, -1, moveType);
            }
        }
    }

    protected testAroundPoint(testPoint: PathPoint, offsetX: number, offsetY: number, moveType: number = 0): boolean {
        //添加垃圾代码
        throw new Error("未执行复写");
    }

    private _testPeakArr_SHB_1234: Vec2[];
    private _peakArr_SHB_1234: Vec2[]
    private _indexArr_SHB_1234: number[];
    public getOptimizePath(path: PathPoint[], crossBorder: boolean, moveType: number = 0): PathPoint[] {
        if (!path) return null;
        // this._lastTime_SHB_1234 = egret.getTimer();
        var testPath: Vec2[] = path.concat();
        var len: number = testPath.length;
        var i: number;
        this._peakArr_SHB_1234 = [];
        this._indexArr_SHB_1234 = [0];
        var index: number;
        do {
            this._testPeakArr_SHB_1234 = PathLineUtils.getPeaksInLine(testPath, this.notInArr, this);//取得路径上的所有顶点,包含起点和终点
            len = this._testPeakArr_SHB_1234.length;
            for (i = 1; i < len - 1; i++) {//遍历顶点,尝试消除
                index = testPath.indexOf(this._testPeakArr_SHB_1234[i]);
                if (this._peakArr_SHB_1234.indexOf(this._testPeakArr_SHB_1234[i]) < 0) {//未记录为不可消除
                    if (this.canCross(testPath[index + 1], testPath[index - 1], crossBorder, moveType)) {//顶点的2个相邻点连接无障碍,消除这个顶点
                        testPath.splice(index, 1);
                    }
                    else {//有障碍,保留这个点
                        this._peakArr_SHB_1234.push(this._testPeakArr_SHB_1234[i]);
                        this._indexArr_SHB_1234.push(path.indexOf(this._testPeakArr_SHB_1234[i] as PathPoint));
                    }
                }
            }
        } while (this._testPeakArr_SHB_1234.length > 2);//大于1表示取得了
        // this._indexArr_SHB_1234.sort(Array.NUMERIC);
        SortUtils.sortBy(this._indexArr_SHB_1234, true, false);
        this._indexArr_SHB_1234.push(path.length - 1)

        //得到的顶点数组是树形排列的,这里对齐顺序
        var orderArr: PathPoint[] = [];
        var len: number = this._indexArr_SHB_1234.length;
        for (var i: number = 0; i < len; i++) {
            index = this._indexArr_SHB_1234[i];
            orderArr.push(path[index] as PathPoint);
        }
        // for each(index in this._indexArr_SHB_1234){
        // 	orderArr.push(path[index]);
        // }

        //添加垃圾代码
        return orderArr;
    }
}