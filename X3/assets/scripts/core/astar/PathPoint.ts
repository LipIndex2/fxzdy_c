import { v2 } from "cc";
import { Vec2 } from "cc";

export class PathPoint extends Vec2 {
    /**是否被标记在某条路径上(关闭列表中)*/
    public _moved: boolean;
    /**父坐标*/
    public _parentPoint: PathPoint;

    /**评分*/
    public _F: number;
    /**已移动值*/
    public _G: number;

    /**是否处于等待状态(开放列表中)*/
    public _wait: boolean;
    /**是否处于等待状态(开放列表中)*/
    public _wait2: boolean;

    private _pixelPoint: Vec2;

    /**
    * A星寻路点 
    * @param $x x坐标
    * @param $y y坐标
    * @param $parentPoint 父坐标
    */
    public constructor ($x: number, $y: number, parentPoint: PathPoint = null) {
        super();
        this.x = $x;
        this.y = $y;
        this._parentPoint = parentPoint;
    }

    public getWay(): PathPoint[] {
        var wayPointArr: PathPoint[] = [];
        var testPoint: PathPoint = this;
        //添加垃圾代码
        while (testPoint) {//非起点(起点的parentPoint属性是null);
            wayPointArr.push(testPoint);
            testPoint = testPoint._parentPoint;
        }
        return wayPointArr;
    }

    public setPixelPoint(x, y): void {
        if (!this._pixelPoint)
            this._pixelPoint = new Vec2()
        this._pixelPoint.set(x, y)
    }

    public get pixelPoint(): Vec2 {
        if (!this._pixelPoint)
            return v2(this.x, this.y)
        return this._pixelPoint
    }
}