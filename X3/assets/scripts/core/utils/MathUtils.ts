import { IVec2Like } from 'cc';
import { v2, Vec2 } from 'cc';
/**
 * 数学接口
 */
export class MathUtils {

    /**
    * 判断是否是整数
    * @static
    * @param {number} v
    * @returns {boolean}
    *
    * @memberOf Maths
    */
    public static isInteger(v: number): boolean {
        return v % 1 === 0;
    }

    /**
     * 角度转弧度
     */
    public static deg2Rad: number = 0.01745329252;
    /**
      * 弧度转角度
      */
    public static rad2Deg: number = 57.29577951;

    private static _tempV2 = v2();

    /**获取弧度 */
    static radian(a: Vec2, b: Vec2) {
        return Math.atan2(b.y - a.y, b.x - a.x);
    }

    /**获取角度 */
    static angle(a: Vec2, b: Vec2) {
        let radian = Math.atan2(b.y - a.y, b.x - a.x);
        return radian * this.rad2Deg;
    }

    /**获取角度 */
    static angleXY(ax: number, ay: number, bx: number, by: number) {
        let radian = Math.atan2(by - ay, bx - ax);
        return radian * this.rad2Deg;
    }

    /**角度转弧度 */
    static angle2Radians(angle) {
        return angle * this.deg2Rad;
    }

    /**弧度转角度*/
    static radians2Angle(radian) {
        return radian * this.rad2Deg;
    }

    /**设置临时向量 （不可持有） */
    static tempVec2(x: number, y: number) {
        return this._tempV2.set(x, y);
    }

    /***调整角度为正数 */
    static adjustmentAngle(a: number): number {
        if (a < 0) {
            let v = Math.ceil(Math.abs(a / 360));
            a += v * 360;
        }
        return a;
    }

    /***标准化角度 */
    static normalizeAngle(angle: number): number {
        let normalizedAngle = angle % 360; // 取模运算
        if (normalizedAngle < 0) {
            normalizedAngle += 360; // 如果角度为负，则加上360得到等效正角度
        }
        return normalizedAngle;
    }

    /**
     * 获取弧度
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     */
    static getRadians(x1: number, y1: number, x2: number, y2: number): number {
        return Math.atan2(y2 - y1, x2 - x1);;
    }

    /**
     * 获取角度
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     */
    static getAngle(x1: number, y1: number, x2: number, y2: number): number {
        var angle = Math.atan2(y2 - y1, x2 - x1);
        return angle * MathUtils.rad2Deg;
    }

    /**
    * 旋转坐标
    * @param	x
    * @param	y
    */
    static rotateCoordinates(x: number, y: number, angle: number): Vec2 {
        // 将角度转换为弧度
        const radians = angle * (Math.PI / 180);

        // 计算旋转后的坐标
        const newX = x * Math.cos(radians) - y * Math.sin(radians);
        const newY = x * Math.sin(radians) + y * Math.cos(radians);

        return new Vec2(newX, newY);
    }

    /***对应角度和长度上的x,y坐标 */
    static getCoordinates(angle: number, length: number): { x: number, y: number } {
        // 将角度转换为弧度
        const radians = angle * (Math.PI / 180);

        // 计算 x 和 y 坐标
        const x = length * Math.cos(radians);
        const y = length * Math.sin(radians);

        return { x, y };
    }
    /**
      * 获得随机方向
      */
    public static sign(x: number) {
        if (x > 0) {
            return 1;
        }
        if (x < 0) {
            return -1;
        }
        return 0;
    }

    /**四舍五入保留小数点几多位*/
    static toFiexd(num: number, decimalPlaces: number = 0): number {
        const factor = 10 ** decimalPlaces;
        return Math.round(num * factor) / factor;
    }

    /**四舍五入保留小数点几多位（百分比）*/
    static toFiexdPercent(num: number, decimalPlaces: number = 0): string {
        return this.toFiexd(num * 100, decimalPlaces) + "%";
    }

    /**向下取整保留小数点几多位（返回string）*/
    static toFixedNoStr(value: string | number, n: number = 0, isNeedZero: boolean = false): string {
        //统一转成字符串
        var str: string = value + "";
        var index: number = str.indexOf(".");
        if (index == -1) return str;
        let sss: string = str.substring(0, index + n + 1);
        if (isNeedZero) {
            let start: number = sss.length - 1 - index;
            for (let i: number = start; i < n; i++)
                sss += "0";
        }
        return sss;
    }

    /**获取两点之间的某一点 */
    static getTwoPointCenter(x1: number, y1: number, x2: number, y2: number, t: number = 0.5): Vec2 {
        let dx = x2 - x1;
        let dy = y2 - y1;
        let d = dx * dx + dy * dy;
        if (d <= 0.00001) {
            return this._tempPoint.set(x2, y2);
        } else {
            if (t >= 1) {
                return this._tempPoint.set(x2, y2);
            } else {
                let x = x1 + dx * t;
                let y = y1 + dy * t;
                return this._tempPoint.set(x, y);
            }
        }
    }

    /**
     * 获取两点间距离
     * @param p1 
     * @param p2 
     * @returns 
     */
    static distance(p1: IVec2Like, p2: IVec2Like): number {
        return this.getDistance(p1.x, p1.y, p2.x, p2.y);
    }

    /**
     * 获取两点间距离
     * @param x1 
     * @param y1 
     * @param x2 
     * @param y2 
     * @returns 
     */
    static getDistance(x1: number, y1: number, x2: number, y2: number): number {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }

    /** 随时间变化进度值 */
    public static progress(start: number, end: number, t: number) {
        return start + (end - start) * t;
    }

    /**
      * 插值
      * @param numStart 
      * @param numEnd 
      * @param t 
      */
    public static lerp(numStart: number, numEnd: number, t: number): number {
        if (t > 1) {
            t = 1;
        } else if (t < 0) {
            t = 0
        }

        return numStart * (1 - t) + (numEnd * t);
    }

    /**
      * 角度插值
      * @param angle1
      * @param angle2 
      * @param t 
      */
    public static lerpAngle(current: number, target: number, t: number): number {
        current %= 360;
        target %= 360;

        var dAngle: number = target - current;

        if (dAngle > 180) {
            target = current - (360 - dAngle);
        } else if (dAngle < -180) {
            target = current + (360 + dAngle);
        }

        return (MathUtils.lerp(current, target, t) % 360 + 360) % 360;
    }

    /**
      * 按一定的速度从一个角度转向另一个角度
      * @param current 
      * @param target 
      * @param speed 
      */
    public static angleTowards(current: number, target: number, speed: number): number {
        current %= 360;
        target %= 360;

        var dAngle: number = target - current;

        if (dAngle > 180) {
            target = current - (360 - dAngle);
        } else if (dAngle < -180) {
            target = current + (360 + dAngle);
        }

        var dir = target - current;

        if (speed > Math.abs(dir)) {
            return target;
        }

        return ((current + speed * Math.sign(dir)) % 360 + 360) % 360;
    }

    /**
     * 判断角度是否在区间内
     * @param minAngle [-360,360)
     * @param maxAngle [0,720)
     * @param angle [0,360]
     */
    public static isContainAngle(minAngle: number, maxAngle: number, angle: number) {
        if (angle >= minAngle && angle <= maxAngle) {
            return true;
        } else if (minAngle < 0 && angle >= (minAngle + 360) && angle <= (maxAngle + 360)) {
            return true;
        } else if (maxAngle > 360 && angle >= (minAngle - 360) && angle <= (maxAngle - 360)) {
            return true;
        }

        return false;
    }

    public static checkAngleInRange(minAngle: number, maxAngle: number, inputAngle: number): boolean {
        // 将负数的角度转换为对应的正数角度
        if (inputAngle < 0) {
            inputAngle += 180;
            maxAngle += 180;
            minAngle += 180;
        }

        // 判断输入角度是否在范围内
        if (minAngle <= inputAngle && inputAngle <= maxAngle) {
            return true;
        } else {
            return false;
        }
    }

    /**返回范围内的值 */
    public static clamp(value: number, minLimit: number, maxLimit: number) {
        if (value < minLimit) {
            return minLimit;
        }

        if (value > maxLimit) {
            return maxLimit;
        }

        return value;
    }

    /**
     * 由小到大排序
     * @param a 
     * @param b 
     * @returns 
     */
    static sortAsc(a: number, b: number): number {
        return a - b;
    }


    /**
     * 二分查找
     * @param tab 要检索的表
     * @param item 要搜索的玩意儿
     * @param binFunc 用于比较的函数，当纯数字tab时该参数可以为空，默认检索到的位置是最后的插入位置
     * @returns 
     */
    static binarySearch(tab: any[], item: any, binFunc: Function = null): number {
        if (!tab || tab.length == 0)
            return 0;


        if (!binFunc)
            binFunc = this.sortAsc;

        let low = 0;
        let high = tab.length - 1;

        while (low <= high) {
            let mid = (high + low) >> 1;
            let val: any = tab[mid];
            if (binFunc(val, item) <= 0) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return low;
    }

    /**
     * 二维平面 计算多边形的中心点
     * @param points 格式为 [x1,y1,x2,y2,x3,y3……]
     */
    static centerPolygon(points: Array<number>, result?: Vec2) {
        result = result || new Vec2();
        let count: number = points.length;
        if (count < 3) {
            result.set(points[0], points[1]);
            return result;
        }
        let x: number = 0;
        let y: number = 0;
        for (let i = 0; i < count; i += 2) {
            x += points[i];
            y += points[i + 1];
        }
        count *= 0.5;
        x /= count;
        y /= count;
        result.set(x, y);
        return result;
    }

    /**
     * 一维 计算多点的中心 
     * @param points 格式为 [x1,x2,x3...]
     * @returns x
     */
    static centerPolygonX(points: Array<number>): number {
        let count: number = points.length;
        if (count < 2) {
            return points[0];
        }
        let a: number = 0;
        for (let i = 0; i < count; i += 2) {
            a += points[i];
        }
        a /= count;
        return a;
    }

    /**
     * 获取指定范围内的随机数
     * @param	min
     * @param	max
     */
    static getRandom(min, max) {
        var area = max - min;
        var num = Math.round(Math.random() * area) + min;
        return num;
    }

    static pointInRect(_x, _y, _x1, _y1, _w, _h) {
        if (_x > _x1 && _x < _x1 + _w && _y > _y1 && _y < _y1 + _h) return true;
        return false;
    }

    /**
     * 点和多边形碰撞
     * @param pos
     * @param posPolygon
     * @param count
     * @returns {boolean}
     * @constructor
     */
    static pointInPolygon(pos: IVec2Like, posPolygon: IVec2Like[], count: number): boolean {
        let x = pos.x,
            y = pos.y;

        let inside = false;
        for (let i = 0, j = posPolygon.length - 1; i < posPolygon.length; j = i++) {
            let xi = posPolygon[i].x,
                yi = posPolygon[i].y;
            let xj = posPolygon[j].x,
                yj = posPolygon[j].y;

            // 检查射线是否与多边形的边相交
            let intersect = ((yi > y) != (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

            // 检查射线是否恰好经过多边形的顶点
            // if (yi === y && yj === y && x <= Math.max(xi, xj)) {
            //     if (xi === x || xj === x) {
            //         // 如果射线经过多边形的顶点，并且这个顶点是边的起点或终点，则不计为交叉点
            //         intersect = false;
            //     }
            // }

            if (intersect) inside = !inside;
        }

        return inside;
    }

    /**数值转换,用于非战斗中 */
    static transNumInNormal(num: number, fixed: number = 0, startLen: number = 5): string {
        let val: string = Math.floor(num).toString();
        let len: number = val.length;
        if (len >= startLen && len <= 7) {
            if (fixed > 0) {
                val = (num / 1000).toFixed(fixed) + "K"
            } else {
                val = Math.floor(num / 1000) + "K";
            }
        } else if (len >= 8 && len <= 10) {
            if (fixed > 0) {
                val = (num / 1000000).toFixed(fixed) + "M"
            } else {
                val = Math.floor(num / 1000000) + "M";
            }
        } else if (len >= 11 && len <= 15) {
            if (fixed > 0) {
                val = (num / 1000000000).toFixed(fixed) + "B"
            } else {
                val = Math.floor(num / 1000000000) + "B";
            }
        }
        return val;
    }

    private static _tempPoint: Vec2 = v2();

    /**计算线段夹角 */
    static calAngleBetweenSegments(a: { x: number, y: number }, b: { x: number, y: number }, c: { x: number, y: number }, d: { x: number, y: number }) {
        // 计算线段AB和CD的方向向量
        let ab_dx = b.x - a.x;
        let ab_dy = b.y - a.y;
        let cd_dx = d.x - c.x;
        let cd_dy = d.y - c.y;

        // 计算向量的点积
        let dotProduct = ab_dx * cd_dx + ab_dy * cd_dy;

        // 计算向量的模长（长度）
        let magnitudeAB = Math.sqrt(ab_dx ** 2 + ab_dy ** 2);
        let magnitudeCD = Math.sqrt(cd_dx ** 2 + cd_dy ** 2);

        // 使用点积和模长计算夹角的余弦值
        let cosTheta = dotProduct / (magnitudeAB * magnitudeCD);

        // 由于cos值可能超出-1到1的范围，这里进行限制，避免数学域错误
        cosTheta = Math.max(Math.min(cosTheta, 1), -1);

        // 使用反余弦函数求得角度，结果为弧度
        let angleInRadians = Math.acos(cosTheta);

        // 将弧度转换为度
        let angleInDegrees = angleInRadians * (180 / Math.PI);

        return angleInDegrees;
    }


    /**快速判断线段是否相交 */
    static segmentsIntersectFast(a: { x: number, y: number }, b: { x: number, y: number }, c: { x: number, y: number }, d: { x: number, y: number }) {
        // 计算系数矩阵的行列式
        let det = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);

        // 如果行列式为0，说明线段AB和CD共线，需要进一步检查是否重叠
        if (det === 0) {
            // 这里仅做简化的重叠检查，实际应用中需要更全面的处理
            return false;
        }

        // 根据克莱默法则计算t和u（参数形式解）
        let t = ((c.x - a.x) * (d.y - c.y) - (c.y - a.y) * (d.x - c.x)) / det; //ab与交点的位置关系
        // 判断t是否在线段AB内部
        if ((t >= 0 && t <= 1)) {
            let u = -((a.x - c.x) * (b.y - a.y) - (a.y - c.y) * (b.x - a.x)) / det; //cd与交点的位置关系
            // 判断u是否在线段CD内部
            return (u >= 0 && u <= 1);
        }

        return false;
    }

    /**快速判断线段是否相交 */
    static segmentsIntersectPoint(a: { x: number, y: number }, b: { x: number, y: number }, c: { x: number, y: number }, d: { x: number, y: number }): Vec2 {
        // 计算系数矩阵的行列式
        let det = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);

        // 如果行列式为0，说明线段AB和CD共线，需要进一步检查是否重叠
        if (det === 0) {
            // 这里仅做简化的重叠检查，实际应用中需要更全面的处理
            return null;
        }

        // 根据克莱默法则计算t和u（参数形式解）
        let t = ((c.x - a.x) * (d.y - c.y) - (c.y - a.y) * (d.x - c.x)) / det; //ab与交点的位置关系
        // 判断t是否在线段AB内部
        if ((t >= 0 && t <= 1)) {
            let u = -((a.x - c.x) * (b.y - a.y) - (a.y - c.y) * (b.x - a.x)) / det; //cd与交点的位置关系
            // 判断u是否在线段CD内部
            if ((u >= 0 && u <= 1)) {
                // 计算交点坐标
                let intersectionX = a.x + t * (b.x - a.x);
                let intersectionY = a.y + t * (b.y - a.y);
                return this.tempVec2(intersectionX, intersectionY);
            }
        }
        return null;
    }

    /***随机1个可旋转范矩形范围内的一个点 */
    public static createRandomCoordinate(centerPos: Vec2, width: number, height: number, angle: number): Vec2 {
        // 生成矩形内的随机点
        const randomX = Math.random() * width - (width * 0.5); // 随机X坐标在[-半宽度, 半宽度]
        const randomY = Math.random() * height - (height * 0.5); // 随机Y坐标在[-半高度, 半高度]

        // 旋转随机点
        const vectorRadian2: number = -MathUtils.angle2Radians(angle);
        const rotatedPoint: Vec2 = new Vec2(
            randomX * Math.cos(vectorRadian2) - randomY * Math.sin(vectorRadian2) + centerPos.x,
            randomX * Math.sin(vectorRadian2) + randomY * Math.cos(vectorRadian2) + centerPos.y
        );

        return rotatedPoint
    }

    /**
     * 获取圆弧上得坐标
     * @param angle 角度
     * @param a 横轴半径
     * @param b 纵轴半径
     * @param center 中心点
     * @returns 
     */
    static getEllipsePoint(angle: number, a: number, b: number, centerX: number, centerY: number): Vec2 {
        const radians = angle * (Math.PI / 180); // 将角度转换为弧度
        const x = centerX + (a * Math.cos(radians)); // 计算x坐标
        const y = centerY + (b * Math.sin(radians)); // 计算y坐标
        return new Vec2(x, y)
    }

    /**
     * 判断两个矩形是否相交或重合
     * @param p1 矩形A的左上角坐标
     * @param p2 矩形A的右下角坐标
     * @param p3 矩形B的左上角坐标
     * @param p4 矩形B的右下角坐标
     * @returns 
     */
    static rectIntrBool(p1: Vec2, p2: Vec2, p3: Vec2, p4: Vec2): boolean {
        let boolIntr1 = p3.x >= p2.x || p4.x <= p1.x;
        let boolIntr2 = p4.y <= p1.y || p2.y <= p3.y;
        if (boolIntr1 || boolIntr2) {
            return false;
        }
        return true;
    }

    private static _mask = (1 << 31) - 1;
    /**
     * 产生一个为正数的伪随机数
     * @param value 
     * @returns 
     */
    static random(value: number = 1): number {
        value += (value << 15) ^ 0xffffcd7d;
        value ^= (value >>> 10);
        value += (value << 3);
        value ^= (value >>> 6);
        value += (value << 2) + (value << 14);
        value ^= (value >>> 16);
        return value & this._mask;
    }

    /***根据2点的方向以最大距离的长度，获取实际坐标点 */
    static getPointByDisAndAngle(x1: number, y1: number, x2: number, y2: number, dis: number, angle: number): Vec2 {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const unitX = dx / length;
        const unitY = dy / length;
        const radian = Math.atan2(dy, dx); // 计算两点的方向角度
        const offsetX = dis * Math.cos(radian + angle * Math.PI / 180); // 根据角度计算偏移量
        const offsetY = dis * Math.sin(radian + angle * Math.PI / 180);
        const x = x1 + unitX * dis + offsetX;
        const y = y1 + unitY * dis + offsetY;
        return v2(x, y);
    }

    // 功能：判断点是否在多边形内
    // 方法：求解通过该点的水平线与多边形各边的交点
    // 结论：单边交点为奇数，成立!
    //参数：
    // POINT p 指定的某个点
    // LPPOINT ptPolygon 多边形的各个顶点坐标（首末点可以不一致）
    // number nCount 多边形定点的个数
    static isPointinPolygon(p: Vec2, ptPolygon: Vec2[], nCount: number): boolean {
        var nCross: number = 0;
        for (var i: number = 0; i < nCount; i++) {
            var p1: Vec2 = ptPolygon[i];
            var j: number = i + 1
            if (i == nCount - 1) {
                j = 0
            }
            var p2: Vec2 = ptPolygon[j];
            // 求解 y=p.y 与 p1p2 的交点
            if (p1.y == p2.y) // p1p2 与 y=p0.y平行
                continue;
            if (p.y < Math.min(p1.y, p2.y)) // 交点在p1p2延长线上
                continue;
            if (p.y > Math.max(p1.y, p2.y)) // 交点在p1p2延长线上
                continue;
            // 求交点的 X 坐标 --------------------------------------------------------------
            var x: number = Number(p.y - p1.y) * Number(p2.x - p1.x) / Number(p2.y - p1.y) + p1.x;
            if (x == p.x) {
                //等于的话，就是在边上了
                return true;
            }

            if (x > p.x) {
                nCross++; // 只统计单边交点
            }

        }
        // 单边交点为偶数，点在多边形之外 ---
        return (nCross % 2 == 1);
    }


    /***
     * 判断2矩形是否相交或者包含，支持角度旋转
     * 数组是 [左上角点，右上角点，右下角点，左下角点]
     *  */
    public static isRectanglesIntersecting(rect1: Vec2[], rect2: Vec2[]): boolean {
        const axes: Vector[] = [];

        // 获取矩形的所有边的法向量作为分离轴
        for (let i = 0; i < rect1.length; i++) {
            const p1 = rect1[i];
            const p2 = rect1[(i + 1) % rect1.length];
            axes.push(new Vector(p1.y - p2.y, p2.x - p1.x).normalize());
        }

        for (let i = 0; i < rect2.length; i++) {
            const p1 = rect2[i];
            const p2 = rect2[(i + 1) % rect2.length];
            axes.push(new Vector(p1.y - p2.y, p2.x - p1.x).normalize());
        }

        // 对每个分离轴进行投影
        for (const axis of axes) {
            let min1 = Number.MAX_VALUE;
            let max1 = -Number.MAX_VALUE;
            let min2 = Number.MAX_VALUE;
            let max2 = -Number.MAX_VALUE;

            for (const point of rect1) {
                const projected = point.x * axis.x + point.y * axis.y;
                min1 = Math.min(min1, projected);
                max1 = Math.max(max1, projected);
            }

            for (const point of rect2) {
                const projected = point.x * axis.x + point.y * axis.y;
                min2 = Math.min(min2, projected);
                max2 = Math.max(max2, projected);
            }

            // 如果投影不重叠，则两个矩形不相交
            if (max1 < min2 || max2 < min1) {
                return false;
            }
        }

        return true;
    }

    /***随机圆内1个坐标 */
    public static getRandomPointInCircle(radius: number, centerX: number, centerY: number, minDistance: number = 0, random: number = null): Vec2 {
        // 检查 minDistance 是否小于 radius
        if (minDistance >= radius) {
            throw new Error('minDistance must be less than radius');
        }

        // 随机生成一个角度（0到2π）
        const theta = (random == null ? Math.random() : random) * 2 * Math.PI;

        // 随机生成一个从 minDistance 到 radius 之间的距离
        const r = Math.sqrt((random == null ? Math.random() : random) * (radius ** 2 - minDistance ** 2) + minDistance ** 2);

        // 将极坐标转换为直角坐标
        const x = centerX + r * Math.cos(theta);
        const y = centerY + r * Math.sin(theta);

        return v2(x, y);
    }

    /***随机椭圆内1个坐标 */
    public static getRandomPointInEllipse(radiusX: number, radiusY: number, centerX: number, centerY: number, random: number = null): Vec2 {
        // 随机生成一个角度（0到2π）
        const theta = (random == null ? Math.random() : random) * 2 * Math.PI;
        // 随机生成一个从0到1之间的值，用于确定点在椭圆内的位置
        const r = Math.sqrt((random == null ? Math.random() : random));

        // 计算椭圆上的点
        const x = centerX + r * radiusX * Math.cos(theta);
        const y = centerY + r * radiusY * Math.sin(theta);

        return v2(x, y)
    }

    /**判断圆心是否和多边形相交*/
    public static isCircleIntersectingPolygon(center: Vec2, radius: number, vertices: Vec2[]): boolean {
        // 检查圆是否与多边形相交
        let distance = this.distanceToPolygon(center, vertices);
        if (distance <= radius)
            return true;
    }

    private static distanceToPolygon(point: Vec2, vertices: Vec2[]): number {
        let minDistance = Number.MAX_VALUE;
        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            const p1 = vertices[i];
            const p2 = vertices[j];
            const distance = this.distanceToSegment(point, p1, p2);
            minDistance = Math.min(minDistance, distance);
        }
        return minDistance;
    }

    static isInRange(value: number, min: number, max: number, includeMin: boolean = true, includeMax: boolean = true): boolean {
        if (includeMin && includeMax) {
            return value >= min && value <= max;
        }

        if (includeMin) {
            return value >= min && value < max;
        }

        if (includeMax) {
            return value > min && value <= max;
        }

        if (value < min) {
            return false;
        } else {
            return value <= max;
        }
    }
    private static distanceToSegment(point: Vec2, p1: Vec2, p2: Vec2): number {
        const x1 = p1.x;
        const y1 = p1.y;
        const x2 = p2.x;
        const y2 = p2.y;
        const x = point.x;
        const y = point.y;
        // const { x: x1, y: y1 } = p1;
        // const { x: x2, y: y2 } = p2;
        // const { x, y } = point;

        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) // in case of 0 length line
            param = dot / lenSq;

        let xx, yy;
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = x - xx;
        const dy = y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

export class Vector {
    x: number;
    y: number;

    constructor (x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    // 计算向量的长度
    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    // 计算向量的点积
    dotProduct(other: Vector): number {
        return this.x * other.x + this.y * other.y;
    }

    // 计算向量的叉积
    crossProduct(other: Vector): number {
        return this.x * other.y - this.y * other.x;
    }

    // 计算向量的垂直向量
    perpendicular(): Vector {
        return new Vector(-this.y, this.x);
    }

    normalize(): Vector {
        const length = Math.sqrt(this.x * this.x + this.y * this.y);
        return new Vector(this.x / length, this.y / length);
    }
}