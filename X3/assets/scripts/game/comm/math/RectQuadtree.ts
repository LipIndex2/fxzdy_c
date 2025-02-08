import { InstanceMaterialType, Rect, Vec2 } from "cc";
import { IRect } from "./ICollision";
import { MathUtils } from "../../../core/utils/MathUtils";


// 矩形四叉树
export class RectQuadtree<T extends IRect> {
  private static _tempV2 = new Vec2();

  private _quadrant: RectQuadtree<T>[] = [];

  /**箱体 */
  public _boundary: Rect;
  private _capacity = 4;
  /**层级 */
  public hierarchy = 0;

  private _items: T[] = [];

  private _divided = false;
  private _parent: RectQuadtree<T>;

  constructor(boundary: Rect, parent?: RectQuadtree<T>, minHierarchy: number = 1) {
    this._boundary = boundary;
    this._parent = parent;
    this.hierarchy = parent ? parent.hierarchy + 1 : 1;
    this._capacity = this.hierarchy > minHierarchy ? 4 : 0; //大于minHierarchy才开始存放
  }

  //是否是空的
  public isEmpty() {
    return this._items.length == 0 && !this._divided;
  }

  /**
   * 查找节点左上点坐标所属象限
   */
  findIndex(_box: T) {
    let isLeft = _box.rect.x < this._boundary.x + this._boundary.width / 2;
    let isTop = _box.rect.y < this._boundary.y + this._boundary.height / 2;
    /**
     *     |     \
     *  0  |  1  \
     * ----+---- \
     *  2  |  3  \
     *     |     \
     */
    if (isLeft && isTop) return 0; //左上
    if (!isLeft && isTop) return 1; //右上
    if (isLeft && !isTop) return 2; //左下
    return 3; //右下
  }

  public insertSub(item: T) {
    let index = this.findIndex(item);
    let quadrant = this._quadrant[index];
    /**把包含在子节点的obj,丢给子节点，横跨多个子节点的自己持有*/
    if (quadrant.isInside(item)) {
      quadrant.insert(item);
    } else {
      /**横跨多个子节点的大物件 */
      this._items.push(item);
    }
    return;
  }


  // 插入点
  public insert(item: T) {
    if (this._quadrant.length) {
      //已分割
      this.insertSub(item);
      return;
    }

    if (this._items.length < this._capacity) {
      this._items.push(item);
      return true;
    }

    //未分割进行分割
    if (!this._divided) { this.subdivide(); }
    this.insertSub(item);

    // 插入到子节点
    // for (let i = 0; i < 4; i++) {
    //   if (this._quadrant[i].insert(item)) return true;
    // }
  }


  /**
   * 分割
   */
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
      this._quadrant[0] = new RectQuadtree(new Rect(x, y, w, h), this);
      this._quadrant[1] = new RectQuadtree(new Rect(x + w, y, w, h), this);
      this._quadrant[2] = new RectQuadtree(new Rect(x, y + h, w, h), this);
      this._quadrant[3] = new RectQuadtree(new Rect(x + w, y + h, w, h), this);
    }
    this._divided = true;
  }

  /** 重置 */
  public reset() {
    this._items.length = 0;
    this._quadrant = [];
    this._divided = false;
  }


  /** 清理空树 */
  public cleanEmptyTree() {
    if (this._items.length == 0) {
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
  public remove(item: T, point?: Vec2) {
    if (!point) point = MathUtils.tempVec2(item.rect.x, item.rect.y);

    if (!this._boundary.contains(point)) return false;

    // 检查点是否在范围内
    for (var i = 0, len = this._items.length; i < len; i++) {
      if (this._items[i] === item) {
        this._items.splice(i, 1);
        this.cleanEmptyTree();
        return true;
      }
    }

    // 如果已划分，则查找子节点
    if (this._divided) {
      for (let i = 0; i < 4; i++) {
        if (this._quadrant[i].remove(item, point)) return true;
      }
    }
    return false;
  }

  /**是否在树内*/
  public isInside(item: T) {
    return this._boundary.containsRect(item.rect);
  }

  /**范围内是否有目标 */
  public check(range: Rect) {
    // 如果范围不在边界内，则返回
    if (!this._boundary.intersects(range)) return false;
    // 检查点是否在范围内
    for (let item of this._items) {
      if (item.rect.intersects(range)) {
        return true;
      }
    }

    // 如果已划分，则查找子节点
    if (this._divided) {
      if (this._quadrant[0].check(range)) return true;
      if (this._quadrant[1].check(range)) return true;
      if (this._quadrant[2].check(range)) return true;
      if (this._quadrant[3].check(range)) return true;
    }

    return false;
  }

  /**
   * 查找范围内的所有单元
   */
  public query(range: Rect, found: T[]) {
    // 如果范围不在边界内，则返回
    if (!this._boundary.intersects(range)) return;

    // 检查点是否在范围内
    for (let item of this._items) {
      if (item.rect.intersects(range)) {
        found.push(item);
      }
    }

    // 如果已划分，则查找子节点
    if (this._divided) {
      this._quadrant[0].query(range, found);
      this._quadrant[1].query(range, found);
      this._quadrant[2].query(range, found);
      this._quadrant[3].query(range, found);
    }
  }

  /**
   * 查找包含该点的所有单元
   */
  public queryByPoint(point: Vec2, found: T[]) {
    // 如果范围不在边界内，则返回
    if (!this._boundary.contains(point)) return;

    // 检查点是否在范围内
    for (let item of this._items) {
      if (item.rect.contains(point)) {
        found.push(item);
      }
    }

    // 如果已划分，则查找子节点
    if (this._divided) {
      this._quadrant[0].queryByPoint(point, found);
      this._quadrant[1].queryByPoint(point, found);
      this._quadrant[2].queryByPoint(point, found);
      this._quadrant[3].queryByPoint(point, found);
    }
  }


  /**
   * 是否在多边形内
   * 在任一多边形内则是返回 找到的第一个区域单位
   */
  public findInsidePolygonByPoint(point: Vec2): T {
    // 如果范围不在边界内，则返回
    if (!this._boundary.contains(point)) return;

    let item: T;
    // 检查点是否在范围内
    for (item of this._items) {
      if (item.isInside && item.rect.contains(point) && item.isInside(point)) {
        return item;
      }
    }

    // 如果已划分，则查找子节点
    if (this._divided) {
      for (let i = 0; i < 4; i++) {
        item = this._quadrant[i].findInsidePolygonByPoint(point);
        if (item) {
          return item;
        }
      }
    }
  }

  /**
  * 是否在多边形内
  * 在任一多边形内则是返回true
  */
  public isInsidePolygonByPoint(point: Vec2): boolean {
    return !!this.findInsidePolygonByPoint(point);
  }


}
