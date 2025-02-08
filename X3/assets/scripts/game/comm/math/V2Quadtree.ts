import { Vec2 } from "cc";
import { Rect } from "cc";
import { IPosition } from "./ICollision";
import { MathUtils } from "../../../core/utils/MathUtils";

/*
export class Vec2Seat extends Vec2 {
  public tree: V2Quadtree;
  public node: Role;
}*/


// 点位四叉树
export class V2Quadtree<T extends IPosition> {
  private _quadrant: V2Quadtree<T>[] = [];
  /**箱体 */
  private _boundary: Rect;
  private _capacity = 4;
  /**层级 */
  public hierarchy = 0;
  private _points: T[] = [];
  private _divided = false;
  private _parent: V2Quadtree<T>;

  constructor (boundary: Rect, parent?: V2Quadtree<T>, minHierarchy: number = 2) {
    this._boundary = boundary;
    this._parent = parent;
    this.hierarchy = parent ? parent.hierarchy + 1 : 1;
    this._capacity = this.hierarchy > minHierarchy ? 4 : 0; //大于minHierarchy才开始存放
  }

  //是否是空的
  public isEmpty() {
    return this._points.length == 0 && !this._divided;
  }

  // 插入点
  public insert(point: T) {
    //是否在箱体内
    if (!this._boundary.contains(point.pos)) return false;

    // 如果点数量小于容量，则插入点 
    if (this._points.length < this._capacity) {
      this._points.push(point);
      return true;
    }
    // 如果尚未划分，则划分
    if (!this._divided) { this.subdivide(); }
    // 插入到子节点

    for (let i = 0; i < 4; i++) {
      if (this._quadrant[i].insert(point)) return true;
    }
  }

  // 划分
  private subdivide() {
    if (!this._quadrant.length) {
      let x = this._boundary.x;
      let y = this._boundary.y;
      let w = this._boundary.width / 2;
      let h = this._boundary.height / 2;

      /**
       *     |     \
       *  0  |  1  \
       * ----+---- \
       *  2  |  3  \
       *     |     \
       */
      this._quadrant[0] = new V2Quadtree(new Rect(x, y, w, h), this);
      this._quadrant[1] = new V2Quadtree(new Rect(x + w, y, w, h), this);
      this._quadrant[2] = new V2Quadtree(new Rect(x, y + h, w, h), this);
      this._quadrant[3] = new V2Quadtree(new Rect(x + w, y + h, w, h), this);
    }
    this._divided = true;
  }

  /** 重置 */
  public reset() {
    this._points.length = 0;
    this._quadrant = [];
    this._divided = false;
  }


  /** 清理空树 */
  public cleanEmptyTree() {
    if (this._points.length == 0) {
      if (this._divided) {
        if (this._quadrant[0].isEmpty()
          && this._quadrant[1].isEmpty()
          && this._quadrant[2].isEmpty()
          && this._quadrant[3].isEmpty()
        ) {
          this._divided = false;
        }
      }

      if (!this._divided && this._parent) {
        this._parent.cleanEmptyTree();
      }
    }
  }

  /**移除节点 */
  public remove(point: T) {
    // 检查点是否在范围内
    for (var i = 0, len = this._points.length; i < len; i++) {
      if (this._points[i] === point) {
        this._points.splice(i, 1);
        this.cleanEmptyTree();
        return true;
      }
    }

    // 如果已划分，则查找子节点
    if (this._divided) {
      for (let i = 0; i < 4; i++) {
        if (this._quadrant[i].remove(point)) return true;
      }
    }
    return false;
  }

  /**是否在树内*/
  public isInside(point: Vec2) {
    return this._boundary.contains(point);
  }

  /**范围内是否有目标 */
  public check(range: Rect, target: T) {
    // 如果范围不在边界内，则返回
    if (!this._boundary.intersects(range)) return false;
    // 检查点是否在范围内
    for (let p of this._points) {
      if (range.contains(p.pos) && p != target) {
        return true;
      }
    }

    // 如果已划分，则查找子节点
    if (this._divided) {
      if (this._quadrant[0].check(range, target)) return true;
      if (this._quadrant[1].check(range, target)) return true;
      if (this._quadrant[2].check(range, target)) return true;
      if (this._quadrant[3].check(range, target)) return true;
    }

    return false;
  }

  // 查找范围内单位
  public query(range: Rect, found: T[], self?: T) {
    // 如果范围不在边界内，则返回
    if (!this._boundary.intersects(range)) return;
    // 检查点是否在范围内
    for (let p of this._points) {
      if (range.contains(p.pos) && p != self) {
        found.push(p);
      }
    }
    // 如果已划分，则查找子节点
    if (this._divided) {
      this._quadrant[0].query(range, found, self);
      this._quadrant[1].query(range, found, self);
      this._quadrant[2].query(range, found, self);
      this._quadrant[3].query(range, found, self);
    }
  }

  /**范围内是否有单位 */
  public hasUnit(range: Rect) {
    // 如果范围不在边界内，则返回
    if (!this._boundary.intersects(range)) return false;
    // 检查点是否在范围内
    for (let p of this._points) {
      if (range.contains(p.pos)) {
        return true;
      }
    }
    // 如果已划分，则查找子节点
    if (this._divided) {
      if (this._quadrant[0].hasUnit(range)) return true;
      if (this._quadrant[1].hasUnit(range)) return true;
      if (this._quadrant[2].hasUnit(range)) return true;
      if (this._quadrant[3].hasUnit(range)) return true;
    }
    return false;
  }

  /**
   * 查找最近的单位
   * @param range 搜索范围
   */
  public queryNearest(range: Rect, self?: T) {
    let found: T[] = [];
    this.query(range, found, self);
    if (found.length > 0) {
      let centerX = range.x + range.width * 0.5;
      let centerY = range.y + range.height * 0.5;
      let minDis = range.w * 0.5;
      let nearTarget: T;
      for (let i = found.length - 1; i >= 0; i--) {
        // if (found[i].canSelect()) {
        let dis = MathUtils.getDistance(centerX, centerY, found[i].pos.x, found[i].pos.y);
        if (dis < minDis) {
          nearTarget = found[i];
          minDis = dis;
        }
        // }
      }

      return nearTarget;
    }
  }

  /**
   * 查找最远的单位
   * @param range 搜索范围
   */
  public queryFarthest(range: Rect, self?: T) {
    let found: T[] = [];
    this.query(range, found, self);
    if (found.length > 0) {
      let centerX = range.x + range.width * 0.5;
      let centerY = range.y + range.height * 0.5;
      let maxDis = 0;
      let rangeW = range.w * 0.5;
      let nearTarget: T;
      for (let i = found.length - 1; i >= 0; i--) {
        // if (found[i].canSelect()) {
        let dis = MathUtils.getDistance(centerX, centerY, found[i].pos.x, found[i].pos.y);
        if (dis <= rangeW && dis > maxDis) {
          nearTarget = found[i];
          maxDis = dis;
        }
        // }
      }

      return nearTarget;
    }
  }

  /**
   * 查找圆形范围内的所有单位
   * @param range 搜索范围
   */
  public queryByRadius(range: Rect) {
    let found: T[] = [];
    this.query(range, found);
    if (found.length > 0) {
      let needs: T[] = [];
      let radius = range.width * 0.5;
      let centerX = range.x + radius;
      let centerY = range.y + radius;
      for (let i = found.length - 1; i >= 0; i--) {
        // if (found[i].canSelect()) {
        if (radius >= MathUtils.getDistance(centerX, centerY, found[i].pos.x, found[i].pos.y)) {
          needs.push(found[i]);
        }
        // }
      }
      return needs;
    }
    return found;
  }

  /**
   * 查找扇形距离范围内的所有单位
   * @param range 搜索范围
   * @param minAngle 最小角度
   * @param maxAngle 最大角度
   */
  public queryByArc(range: Rect, minAngle: number, maxAngle: number) {
    let found: T[] = [];
    this.query(range, found);
    if (found.length > 0) {
      let needs: T[] = [];
      let radius = range.width * 0.5;
      let centerX = range.x + radius;
      let centerY = range.y + radius;
      for (let i = found.length - 1; i >= 0; i--) {
        // if (found[i].canSelect()) {
        if (radius >= MathUtils.getDistance(centerX, centerY, found[i].pos.x, found[i].pos.y)) {
          let angle = MathUtils.angleXY(centerX, centerY, found[i].pos.x, found[i].pos.y);
          if (MathUtils.isContainAngle(minAngle, maxAngle, angle)) {
            needs.push(found[i]);
          }
        }
        // }
      }
      return needs;
    }
    return found;
  }
}

