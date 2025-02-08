import { Vec2 } from "cc";
import { SortUtils } from "../utils/SortUtils";
import { BinaryHeap } from "./BinaryHeap";
import { Path } from "./Path";
import { PathPoint } from "./PathPoint";

export class AStar extends Path {
    private _binaryHeap: BinaryHeap;
    private _bmh: boolean = true;

    public constructor (ddArray: number[][] = null, moveJudgeFun: Function = null, directionMode: string = "5") {
        super(ddArray, moveJudgeFun, directionMode);
        this._binaryHeap = new BinaryHeap("_F");
    }

    /**寻找最近的可走点 */
    protected getNearPassPoint(x: number, y: number, moveType: number): Vec2 {
        var k: number = 1;
        flg: while (true) {
            for (var i: number = -1; i <= 1; i++) {
                for (var j: number = -1; j <= 1; j++) {
                    if (i != 0 || j != 0) {
                        if (!this._ddArray[x + i * k]) {
                            break flg;
                        }
                        else if (this._moveJudgeFun(this._ddArray[x + i * k][y + j * k], moveType)) {
                            x = x + i * k;
                            y = y + j * k;
                            break flg;
                        }
                    }
                }
            }

            k++;
        }
        return new Vec2(x, y);
    }

    /**根据出发点跟结束的寻找结束点附近最近的可走点 */
    protected getNearTargetPassPoint(currentPoint: Vec2, targetLocation: Vec2, moveType: number): boolean {
        while (!this._moveJudgeFun(this._ddArray[targetLocation.x][targetLocation.y], moveType)) {
            if (targetLocation.x > currentPoint.x) {
                targetLocation.x--;
            }
            else if (targetLocation.x < currentPoint.x) {
                targetLocation.x++;
            }
            if (targetLocation.y > currentPoint.y) {
                targetLocation.y--;
            }
            else if (targetLocation.y < currentPoint.y) {
                targetLocation.y++;
            }
            if (targetLocation.x == currentPoint.x && currentPoint.y == targetLocation.y) {
                return false;
            }
        }
        return true;
    }

    /***
     * moveType 移动方式 0行走 1飞行
     */
    public findPath(currentLocation: Vec2, targetLocation: Vec2, moveType: number = 0, isNearby: boolean = true): PathPoint[] {
        var currentPoint: Vec2 = new Vec2(currentLocation.x, currentLocation.y);
        if (!this._ddArray[currentPoint.x]) {

            return [];
        }

        if (this._moveJudgeFun == null) throw new Error("Min:未设置移动判断函数");
        if (!this._moveJudgeFun(this._ddArray[currentPoint.x][currentPoint.y], moveType)) {
            if (!isNearby) {
                return []
            }
            //起始点处于不可走的话，将这个点移动到最近的可走点
            var d: Vec2 = this.getNearPassPoint(currentLocation.x, currentLocation.y, moveType);
            currentPoint.x = d.x;
            currentPoint.y = d.y;
        }

        if (!this._ddArray[targetLocation.x]) {

            return [];
        }

        if (!this._moveJudgeFun(this._ddArray[targetLocation.x][targetLocation.y], moveType)) {
            //结束点处于不可走的话，将这个点已移动到最近的可走点
            if (!isNearby) {
                return []
            }
            var b: boolean = this.getNearTargetPassPoint(currentPoint, targetLocation, moveType);
            if (!b)
                return [];
        }

        var b: boolean = this.resetParameters(currentPoint, targetLocation);
        if (!b) return [];
        while (true) {//循环,开放列表存在节点时
            if (this._bmh) {
                this.testPoint(this._binaryHeap.getTop() as PathPoint, moveType);
            } else {
                SortUtils.sortBy2(this._waitList, ["_F"], [false], false);
                this.testPoint(this._waitList[0], moveType);
            }
            if (this._finded) {
                this.findComplete();
                return this._targetPoint.getWay().reverse();
            }
            if (this._bmh) {
                if (this._binaryHeap.getTop() == null)
                    break;
            } else {
                if (this._waitList.length == 0)
                    break;
            }
        }
        //找不到了
        this.findComplete();
        return isNearby ? [this._pointsArr2D[currentPoint.x][currentPoint.y]] : [];
    }

    protected testPoint(testPoint: PathPoint, moveType: number = 0): void {
        if (this._bmh) {
            this._binaryHeap.removeFromBMHByIndex(0);
        } else {

            this._waitList.splice(0, 1);
        }
        testPoint._wait = false;
        testPoint._moved = true;
        this._finishList.push(testPoint);
        super.testPoint(testPoint, moveType);
    }

    protected testAroundPoint(testPoint: PathPoint, offsetX: number, offsetY: number, moveType: number = 0): boolean {
        var x: number = testPoint.x + offsetX;
        var y: number = testPoint.y + offsetY;
        if (x < this._mapRectangle.x || x > (this._mapRectangle.x + this._mapRectangle.width - 1) || y < this._mapRectangle.y || y > (this._mapRectangle.y + this._mapRectangle.height - 1)) {

            return false;
        }
        var pFPoint: PathPoint = this._pointsArr2D[x][y];
        var G: number = this.getG(offsetX, offsetY);
        if (!pFPoint._moved) {//不在关闭列表中
            if (!pFPoint._wait) {//不在开放列表中
                if (this._moveJudgeFun(this._ddArray[pFPoint.x][pFPoint.y], moveType)) {//该点可移动
                    pFPoint._parentPoint = testPoint;//标记父坐标
                    pFPoint._G = testPoint._G + G;
                    pFPoint._F = pFPoint._G + (Math.abs(this._targetPoint.x - pFPoint.x) + Math.abs(this._targetPoint.y - pFPoint.y)) * 10;
                    //pFPoint._F=pFPoint._G+Math.floor(Point.distance(_targetPoint,pFPoint)*10);
                    if (pFPoint == this._targetPoint) {
                        this._finded = true;
                    } else {
                        pFPoint._wait = true;
                        if (this._bmh) {
                            this._binaryHeap.addToBMH(pFPoint);//该点若不是终点,加入待测试数组
                        } else {
                            this._waitList.push(pFPoint);
                        }
                    }
                    return true;
                }
            } else {//在开放列表中
                if (pFPoint._G > (testPoint._G + G)) {//如果该点移动代价小
                    pFPoint._parentPoint = testPoint;
                    pFPoint._G = testPoint._G + G;
                    //pFPoint._F=pFPoint._G+Math.floor(Point.distance(_targetPoint,pFPoint)*10);
                    pFPoint._F = pFPoint._G + (Math.abs(this._targetPoint.x - pFPoint.x) + Math.abs(this._targetPoint.y - pFPoint.y)) * 10;
                    if (this._bmh) this._binaryHeap.changeFromBMH(pFPoint);
                }
                return true;
            }
        }
        return false;
    }

    protected getG(offsetX: number, offsetY: number): number {

        return (offsetX != 0 && offsetY != 0) ? 14 : 10;
    }

    protected findComplete(): void {
        var arr: PathPoint[] = this._bmh ? this._binaryHeap.getArr() : this._waitList;
        var len: number = arr.length;
        for (var i: number = 0; i < arr.length; i++) {

            arr[i]._wait = false;
        }
        // for each(var point: PathPoint in arr){
        // 	point._wait = false;
        // }
        super.findComplete();
    }

    /**二叉堆优化*/
    public getBMH(): boolean {
        return this._bmh;
    }
    public setBMH(enable: boolean): void {

        this._bmh = enable;
    }

    protected resetParameters(currentLocation: Vec2, targetLocation: Vec2): boolean {
        var b: boolean = super.resetParameters(currentLocation, targetLocation);
        if (!b) return false;
        if (this._bmh) {
            this._binaryHeap.clear();

            this._binaryHeap.addToBMH(this._startPoint);
        } else {
            this._waitList = [this._startPoint];//将起点加入开放列表
        }
        return true
    }
}