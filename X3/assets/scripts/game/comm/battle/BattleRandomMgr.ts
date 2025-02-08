import { Vec2 } from "cc";
import { MathUtils } from "../../../core/utils/MathUtils";
import { v2 } from "cc";
import UrlUtils from "../../../core/utils/UrlUtils";
import { DEBUG } from "cc/env";

export class BattleRandomMgr {
    /**种子(任意默认值5)*/
    private seed: number = 5;
    private initSeed: number = 5;
    public setRandomSeed(seed: number): void {
        if (UrlUtils.hasUrlParam(UrlUtils.RandomSeed)) {
            seed = +UrlUtils.getURLQuery(UrlUtils.RandomSeed)
        }

        this.initSeed = seed;
        if (DEBUG) {
            console.log("============================")
            console.log("当前战斗的随机种子：" + seed)
            console.log("============================")
        }
    }

    public resRandomSeed(): void {
        this.seed = this.initSeed;
    }

    /**种子随机数*/
    public seedRandom(): number {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        var r: number = this.seed / 233280.0;
        return r
    }

    /**
    * 随机获得int整数 
    * @param minNum:最小范围(0开始)
    * @param maxNum:最大范围
    * @param stepLen:增加范围（整数，默认为1）
    * @return 
    */
    public randomInt(minNum: number, maxNum: number = 0, stepLen: number = 1): number {
        if (minNum > maxNum) {
            var nTemp: number = minNum;
            minNum = maxNum;
            maxNum = nTemp;
        }
        var nDeltaRange: number = (maxNum - minNum) + (1 * stepLen);
        var nRandomNumber: number = this.seedRandom() * nDeltaRange;
        nRandomNumber += minNum;
        return Math.floor(nRandomNumber / stepLen) * stepLen;
    }

    /**
 * 随机获得double
 * @param minNum:最小范围(0开始)
 * @param maxNum:最大范围
 * @param stepLen:增加范围（整数，默认为1）
 * @return 
 */
    public randomDouble(minNum: number, maxNum: number = 0, stepLen: number = 1): number {
        if (minNum > maxNum) {
            var nTemp: number = minNum;
            minNum = maxNum;
            maxNum = nTemp;
        }
        var nDeltaRange: number = (maxNum - minNum) + (1 * stepLen);
        var nRandomNumber: number = this.seedRandom() * nDeltaRange;
        nRandomNumber += minNum;
        return nRandomNumber / stepLen * stepLen;
    }


    /**
     * 传入多个概率，返回中奖的下标
     */
    public randomProbability(ary: number[]): number {
        var sum: number = 0;
        var temp: number[] = [];
        for (var i: number = 0; i < ary.length; i++) {
            sum += ary[i];
            temp.push(sum);
        }
        if (sum == 0)
            return 0;
        var a: number;
        do { a = this.randomInt(0, sum); } while (a == 0)
        for (var j: number = 0; j < temp.length; j++) {
            if (a > temp[j])
                continue;
            return j;
        }
    }

    /**
   * 随机布尔值 
   * @return 
   * 
   */
    public randomBoolean(): boolean {
        return this.randomInt(1, 2) == 1;
    }


    /**
       * 判断值是否小于0-10000
       */
    public isRandTrue(rate: number): boolean {
        var rand: number = this.randomInt(0, 10000);
        return rand <= rate;
    }

    /**新随机数组*/
    public randomAry<T>(arr: T[]): T[] {
        var cloneArr: any[] = arr.concat()
        var len: number = cloneArr.length;
        for (var i: number = 0; i < len; i++) {
            var index: number = Math.floor(this.seedRandom() * cloneArr.length)
            var temp: any = cloneArr[index];
            cloneArr[index] = cloneArr[i]
            cloneArr[i] = temp;
        }

        return cloneArr;
    }

    /***随机1个可旋转范矩形范围内的一个点 */
    public createRandomCoordinate(centerPos: Vec2, width: number, height: number, angle: number): Vec2 {
        // 生成矩形内的随机点
        const randomX = this.seedRandom() * width - (width * 0.5); // 随机X坐标在[-半宽度, 半宽度]
        const randomY = this.seedRandom() * height - (height * 0.5); // 随机Y坐标在[-半高度, 半高度]

        // 旋转随机点
        const vectorRadian2: number = -MathUtils.angle2Radians(angle);
        const rotatedPoint: Vec2 = new Vec2(
            randomX * Math.cos(vectorRadian2) - randomY * Math.sin(vectorRadian2) + centerPos.x,
            randomX * Math.sin(vectorRadian2) + randomY * Math.cos(vectorRadian2) + centerPos.y
        );

        return rotatedPoint
    }

    /****随机在1个矩形范围外的1圈位置得到1个点 */
    public getRandomPointOnRectEdge(centerPos: Vec2, width: number, height: number, bh: number): Vec2 {
        // 计算矩形的实际边界
        const left = centerPos.x - width / 2;
        const right = centerPos.x + width / 2;
        const top = centerPos.y - height / 2;
        const bottom = centerPos.y + height / 2;

        // 计算内边界的坐标
        const innerLeft = left + bh;
        const innerRight = right - bh;
        const innerTop = top + bh;
        const innerBottom = bottom - bh;

        // 随机选择一个边界
        let edge = this.randomInt(0, 3); // 0: 上边, 1: 右边, 2: 下边, 3: 左边

        let point: Vec2 = centerPos;

        switch (edge) {
            case 0: // 上边
                point = v2(this.randomInt(left, right), this.randomInt(top, innerTop))
                break;
            case 1: // 右边
                point = v2(this.randomInt(innerRight, right), this.randomInt(top, bottom))
                break;
            case 2: // 下边
                point = v2(this.randomInt(left, right), this.randomInt(innerBottom, bottom))
                break;
            case 3: // 左边
                point = v2(this.randomInt(left, innerLeft), this.randomInt(top, bottom))
                break;
        }

        return point;
    }

    /****随机在1个矩形范围外的1圈位置得到1个点 */
    public getRandomValueOnRectEdge(centerPos: Vec2, width: number, height: number, bh: number): [number, number, number] {
        // 计算矩形的实际边界
        const left = centerPos.x - width / 2;
        const right = centerPos.x + width / 2;
        const top = centerPos.y - height / 2;
        const bottom = centerPos.y + height / 2;

        // 计算内边界的坐标
        const innerLeft = left + bh;
        const innerRight = right - bh;
        const innerTop = top + bh;
        const innerBottom = bottom - bh;


        let arr: [number, number, number] = [0, 0, 0];
        // 随机选择一个边界
        const edge = this.randomInt(0, 3); // 0: 上边, 1: 右边, 2: 下边, 3: 左边
        arr[0] = edge

        let point: Vec2 = centerPos;

        switch (edge) {
            case 0: // 上边
                arr[1] = this.randomInt(left, right)
                arr[2] = this.randomInt(top, innerTop)
                break;
            case 1: // 右边
                arr[1] = this.randomInt(innerRight, right)
                arr[2] = this.randomInt(top, bottom)
                break;
            case 2: // 下边
                arr[1] = this.randomInt(left, right)
                arr[2] = this.randomInt(innerBottom, bottom)
                break;
            case 3: // 左边
                arr[1] = this.randomInt(left, innerLeft)
                arr[2] = this.randomInt(top, bottom)
                break;
        }

        return arr;
    }
}

