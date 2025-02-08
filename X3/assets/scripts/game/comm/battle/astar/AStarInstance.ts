import { Vec2 } from "cc";
import { AStar } from "../../../../core/astar/AStar";
import { Path } from "../../../../core/astar/Path";
import { PathPoint } from "../../../../core/astar/PathPoint";
import { AStarEnum } from "../../../tiledMap/MapEnum";
import { v2 } from "cc";
import { Rect } from "cc";
import UnitCollisionsManager from "../collisions/UnitCollisionsManager";
import { IVec2 } from "cc";

/**AStar实例 */
/**
 * AStarInstance 类用于处理 A* 寻路算法的相关逻辑。
 * 
 * 该类主要功能包括：
 * - 初始化 A* 算法所需的数据，如地图数据、格子大小等。
 * - 提供寻路功能，根据起点和终点坐标，返回一条可行的路径。
 * - 提供路径优化功能，去除路径中的冗余点。
 * - 提供检查点是否可通行的功能。
 * - 提供根据像素坐标和格子坐标相互转换的功能。
 * - 提供清理地图上障碍状态的功能。
 * 
 * 使用示例：
 * ```typescript
 * let astarInstance = new AStarInstance(collisionsManager);
 * let path = astarInstance.findPathsByTile(startPoint, endPoint);
 * ```
 */
export class AStarInstance {

    /***地图格子缓存 */
    private static mapGridStateMap: { [mapId: number]: { gridSize: number, xNum: number, yNum: number, mapArr: number[][], unresolved: { top: number, bottom: number, unresolvedMap: Map<number, boolean> } } } = {}

    private _tempV2 = new Vec2();

    /** 最小边界值（减少计算） */
    private _minBorder = 2;

    /**地图Id */
    private _mapId: number;

    /***格子宽高 */
    public tileSize: number;
    /** 行 **/
    public rows: number;
    /** 纵 **/
    public cols: number;
    /** A*对象 **/
    public astar: AStar;
    /** 二维的地图数据 **/
    protected maps: number[][];

    /**碰撞 */
    public collisions: UnitCollisionsManager;

    public constructor(collisions: UnitCollisionsManager) {
        this.collisions = collisions
        this._mapId = collisions.mapCfg.id;
        if (this.collisions.battleLogic.battleSetting.notCacheAStar) {
            AStarInstance.mapGridStateMap[this._mapId] = null;
        }
        this.astar = new AStar(null, null, Path.DIRECTION_8)
        this.astar.setMoveJudgeFun(canMove);
        function canMove(value: number, moveType: number): boolean {
            if (moveType == Path.Move_Fly) {
                return true;
            }
            return value >= AStarEnum.WALK_MIN_VALUE;
        }
        this.initData();
    }

    /***初始化A星相关的数据 */
    public initAStar(maps: number[][], tileSize: number, rows: number, cols: number): void {
        this.maps = maps;
        this.rows = rows;
        this.cols = cols;
        this.tileSize = tileSize
        // let newMaps = ArrayUtils.transposeArray(maps)
        this.astar.setGrids(maps);
    }

    /**
    * 格式化路径，去除非必要的点
    * @memberOf AStarScene_SHM_8616
    */
    public getOptimizePath(path: PathPoint[], moveType: number = 0): PathPoint[] {
        return this.astar.getOptimizePath(path, true, moveType);
    }

    /***
    * 获取一个移动路径
    * isOptimizePath 是否格式化点
    * isNearby 是否起点和终点不可走都往最近1个可走点偏移
    *  */
    public findPathsByTile(startPoint: Vec2, endPoint: Vec2, isOptimizePath: boolean = true, moveType: number = 0, isNearby: boolean = true): PathPoint[] {
        if (!this.checkPointPass(endPoint) && !isNearby) {
            return null
        }

        if (startPoint.x == endPoint.x && startPoint.y == endPoint.y) {
            //相同点不寻路
            return null;
        }

        let paths = this.findPath(startPoint, endPoint, moveType, isNearby)
        if (!paths)
            return null;

        if (isOptimizePath)
            paths = this.getOptimizePath(paths, moveType)
        //去除开始的坐标
        paths.shift();
        return paths;
    }

    /***
     * 获取一个移动路径
     * isOptimizePath 是否格式化点
     * isNearby 是否起点和终点不可走都往最近1个可走点偏移
     *  */
    public findPaths(startPoint: Vec2, endPoint: Vec2, isOptimizePath: boolean = true, moveType: number = 0, isNearby: boolean = true): PathPoint[] {

        endPoint = this.getTilePoint(endPoint.x, endPoint.y)
        if (!this.checkPointPass(endPoint) && !isNearby) {
            return null
        }
        startPoint = this.getTilePoint(startPoint.x, startPoint.y)

        if (startPoint.x == endPoint.x && startPoint.y == endPoint.y) {
            //相同点不寻路
            return null;
        }

        let paths = this.findPath(startPoint, endPoint, moveType, isNearby)
        if (!paths)
            return null;

        if (isOptimizePath)
            paths = this.getOptimizePath(paths, moveType)
        //去除开始的坐标
        if (paths.length > 1)
            paths.shift();
        return paths;
    }

    /***检查点是否可以通行 */
    public checkPointPass(p: Vec2): boolean {
        return this.isPass(p.x, p.y)
    }

    /**
         * 寻找Astar路径 （这里坐标是转换过的图的二维坐标，而不是像素坐标）
         * @param startX 起始点的x坐标
         * @param startY
         * @param endX
         * @param endY
         * @return
         *
         */
    private findPath(startPoint: Vec2, endPoint: Vec2, moveType: number = 0, isNearby: boolean = true): PathPoint[] {
        if (!this.isPass(endPoint.x, endPoint.y)) {
            // let newPoint: Vec2
            // //寻找上下左右可走的一格
            // b: for (let i = -1; i < 1; i++) {
            //     for (let j = -1; j < 1; j++) {
            //         if (this.isPass(endPoint.x + i, endPoint.y + j)) {
            //             newPoint = new Vec2(endPoint.x + i, endPoint.y + j)
            //             break b;
            //         }
            //     }
            // }
            // endPoint = newPoint;
            // if (!endPoint)
            return null
        }

        let paths = this.astar.findPath(startPoint, endPoint, moveType, isNearby);
        for (let i = 0; i < paths.length; i++) {
            paths[i].setPixelPoint(this.getPixelX(paths[i].x), this.getPixelX(paths[i].y))
        }
        return paths
    }

    /***通过像素检查点是否可以通行 */
    public checkPointPassByPix(p: Vec2): boolean {
        p = this.getTilePoint(p.x, p.y)
        return this.isPass(p.x, p.y)
    }

    /***是否相同格子 */
    public isSameTile(p1: Vec2, p2: Vec2): boolean {
        let p1x = Math.floor(p1.x / this.tileSize)
        let p1y = Math.floor(p1.y / this.tileSize)
        let p2x = Math.floor(p2.x / this.tileSize)
        let p2y = Math.floor(p2.y / this.tileSize)

        if (p1x == p2x && p1y == p2y) {
            return true
        }

        return false
    }


    /**
          * 是否可以通过
          * @param x 二维的x坐标
          * @param y 二维的y坐标
          * @return 返回是否可走
          *
          */
    public isPass(pointX: number, pointY: number): boolean {
        if (pointX < 0 || pointY < 0 || pointX >= this.rows || pointY >= this.cols) {
            return false;
        }
        return this.maps[pointX][pointY] >= AStarEnum.WALK_MIN_VALUE;
    }

    /**
         * 根据像素坐标获取格子坐标
         */
    public getTilePoint(x: number, y: number): Vec2 {
        let row = Math.floor(x / this.tileSize)
        let col = Math.floor(y / this.tileSize)
        return v2(row, col)
    }

    /**
         * 根据格子坐标获取像素坐标
         */
    public getPixelPoint(x: number, y: number): Vec2 {
        let row = Math.floor(x * this.tileSize + this.tileSize * 0.5);
        let col = Math.floor(y * this.tileSize + this.tileSize * 0.5);
        return v2(row, col)
    }

    public getPixelX(x: number,): number {
        let row = Math.floor(x * this.tileSize + this.tileSize * 0.5);
        return row
    }

    public getPixelY(y: number): number {
        let col = Math.floor(y * this.tileSize + this.tileSize * 0.5);
        return col
    }

    /**初始化 */
    public initData() {
        let mapObj = this.getMapGridsState();
        mapObj && this.initAStar(mapObj.mapArr, mapObj.gridSize, mapObj.xNum, mapObj.yNum)
    }

    // protected onMapLoadComplete(pos: IVec2Like, portalID: number | null, data: ITransfer): void {
    //     super.onMapLoadComplete(pos, portalID, data);
    //     let mapObj = MapManager.ins().getMapGridsState()
    //     this.initAStar(mapObj.mapArr, mapObj.gridSize, mapObj.xNum, mapObj.yNum)
    // }

    /**获取当前地图格子状态 （astar） */
    public getMapGridsState() {
        let mapId = this._mapId;
        if (!AStarInstance.mapGridStateMap[mapId]) {
            if (!this.collisions) return null;

            let gridSize = this.collisions.mapH > 10000 ? 128 : 100;
            let step = gridSize;
            let xNum = Math.ceil(this.collisions.mapW / step);
            let yNum = Math.ceil(this.collisions.mapH / step);

            let mapArr: number[][] = [];
            let yArr: number[];
            let unresolvedMap = new Map<number, boolean>();
            for (let i = 0; i < xNum; i++) {
                unresolvedMap.set(i, true);
                yArr = [];
                yArr.length = yNum;
                mapArr.push(yArr);
            }

            AStarInstance.mapGridStateMap[mapId] = { gridSize, xNum, yNum, mapArr, unresolved: { top: -1, bottom: -1, unresolvedMap } };
        }
        return AStarInstance.mapGridStateMap[mapId];
    }

    public isParseCompleted() {
        let gridMap = this.getMapGridsState();
        return gridMap?.unresolved?.unresolvedMap?.size == 0;
    }

    /**
     * 继续初始化网格状态，根据新的点或默认值更新未解决的网格。
     * @param newPoint - 可选的新坐标点，默认为null。
     * @param times - 初始化次数，默认为1。
     * @returns 如果没有碰撞检测则返回null。
     */
    private _count = 0;
    public continueInitGridsState(newPoint: IVec2 = null, times: number = 1) {
        if (!this.collisions) return null;
        let gridMap = this.getMapGridsState();
        if (!gridMap) return null;

        let unresolved = gridMap.unresolved;
        let unresolvedMap = unresolved.unresolvedMap;
        if (!unresolvedMap.size) return;

        let step = gridMap.gridSize;
        let xNum = gridMap.xNum - this._minBorder; //外框一定不能走
        let yNum = gridMap.yNum - this._minBorder; //外框一定不能走
        let mapArr = gridMap.mapArr;

        let topIndex = unresolved.top;
        let bottomIndex = unresolved.bottom;

        if (newPoint) {
            //移动的新坐标
            let curXNum = Math.floor(newPoint.x / step);
            topIndex = curXNum;
            bottomIndex = curXNum + 1;
            unresolved.top = this._initUpGridsState(unresolvedMap, topIndex, xNum, yNum, mapArr, step, times);
            unresolved.bottom = this._initDownGridsState(unresolvedMap, bottomIndex, xNum, yNum, mapArr, step, times);
        } else {
            if (this._count++ % 2) {
                if (unresolved.top != 0)
                    unresolved.top = this._initUpGridsState(unresolvedMap, topIndex, xNum, yNum, mapArr, step, times);
            } else if (unresolved.bottom < xNum) {
                unresolved.bottom = this._initDownGridsState(unresolvedMap, bottomIndex, xNum, yNum, mapArr, step, times);
            }
        }
    }

    /**
     * 初始化上方网格状态
     * @param unresolvedMap - 未解决的地图映射，键为行索引，值为布尔值
     * @param top - 当前行索引
     * @param xNum - 网格的列数
     * @param yNum - 网格的行数
     * @param mapArr - 地图数组
     * @param step - 网格步长
     * @param times - 循环次数
     * @returns 更新后的top值
     * 该方法用于根据未解决的地图映射和给定的参数，更新地图数组中网格的状态。
     * 通过遍历未解决的地图映射，计算每个网格的坐标，并检查是否在阻塞区域内。
     * 如果在阻塞区域内，则将该网格的状态设置为0，否则设置为1。
     * 最后返回更新后的top值。
     */
    private _initUpGridsState(unresolvedMap: Map<number, boolean>, top: number, xNum: number, yNum: number, mapArr: number[][], step: number, times: number) {
        let x: number;
        let y: number;
        let tempV2 = this._tempV2;
        for (let i = top; i >= this._minBorder; i--) {
            top = i;
            if (unresolvedMap.has(i)) {
                x = step * (i + 0.5);
                let yArr = mapArr[i];
                for (let j = this._minBorder; j < yNum; j++) {
                    y = step * (j + 0.5);
                    yArr[j] = this.collisions.isInBlock(tempV2.set(x, y)) ? 0 : 1;
                }
                unresolvedMap.delete(i);

                if (!--times) {
                    break;
                }
            }
        }
        return top;
    }

    /**
     * 初始化下方网格状态，根据碰撞检测更新地图数组中的值。
     * @param unresolvedMap 待解决的地图坐标集合。
     * @param bottom 当前处理的行索引。
     * @param xNum 地图的横向格子数。
     * @param yNum 地图的纵向格子数。
     * @param mapArr 地图数组，存储格子的状态。
     * @param step 格子的步长。
     * @param times 待处理的次数。
     * @returns 更新后的底部行索引。
     */
    private _initDownGridsState(unresolvedMap: Map<number, boolean>, bottom: number, xNum: number, yNum: number, mapArr: number[][], step: number, times: number) {
        let x: number;
        let y: number;
        let tempV2 = this._tempV2;
        for (let i = bottom; i < xNum; i++) {
            bottom = i;
            if (unresolvedMap.has(i)) {
                x = step * (i + 0.5);
                let yArr = mapArr[i];
                for (let j = this._minBorder; j < yNum; j++) {
                    y = step * (j + 0.5);
                    yArr[j] = this.collisions.isInBlock(tempV2.set(x, y)) ? 0 : 1;
                }
                unresolvedMap.delete(i);

                if (!--times) {
                    break;
                }
            }
        }
        return bottom;
    }


    /**清理地图上的障碍状态 */
    public cleanGridsBlockState(rect: Rect) {
        let mapId = this._mapId;
        if (AStarInstance.mapGridStateMap[mapId]) {
            let mapData = AStarInstance.mapGridStateMap[mapId];
            let gridSize = mapData.gridSize;
            let step = gridSize;
            let xMapNum = mapData.xNum;
            let yMapNum = mapData.yNum;
            let mapArr = mapData.mapArr;

            let xMinNum = Math.max(Math.floor(rect.xMin / step), 0);
            let xMaxNum = Math.min(Math.ceil(rect.xMax / step), xMapNum);
            let yMinNum = Math.max(Math.floor(rect.yMin / step), 0);
            let yMaxNum = Math.min(Math.ceil(rect.yMax / step), yMapNum);

            let x: number;
            let y: number;
            let tempV2 = new Vec2();
            for (let i = xMinNum; i < xMaxNum; i++) {
                x = step * (i + 0.5);
                for (let j = yMinNum; j < yMaxNum; j++) {
                    y = step * (j + 0.5);
                    mapArr[i][j] = this.collisions.isInBlock(tempV2.set(x, y)) ? 0 : 1;
                }
            }
        }
    }

}