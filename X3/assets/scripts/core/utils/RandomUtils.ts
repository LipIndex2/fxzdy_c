/**
 * 随机数工具类
 */
export default class RandomUtils {
    /**
     * 返回一个
     * @param minNum
     * @param maxNum
     * @returns {number}
     */
    static random(minNum: number, maxNum: number): number {
        return minNum + Math.random() * (maxNum - minNum);
    }

    /**
     * 随机布尔值 
     * @return 
     * 
     */
    static randomBoolean(): boolean {
        return this.randomInt(1, 2) == 1;
    }

    /**
     * 取得随机正负波动值(1 / -1) 
     * @return 
     * 
     */
    static randomWave(): number {
        return this.randomBoolean() ? 1 : -1;
    }

    /**
     * 随机获得int整数 
     * @param minNum:最小范围(0开始)
     * @param maxNum:最大范围
     * @param stepLen:增加范围（整数，默认为1）
     * @return 
     */
    static randomInt(minNum: number, maxNum: number = 0, stepLen: number = 1): number {
        if (minNum > maxNum) {
            var nTemp: number = minNum;
            minNum = maxNum;
            maxNum = nTemp;
        }
        var nDeltaRange: number = (maxNum - minNum) + (1 * stepLen);
        var nRandomNumber: number = Math.random() * nDeltaRange;
        nRandomNumber += minNum;
        return Math.floor(nRandomNumber / stepLen) * stepLen;
    }

    /**
     * 传入多个概率，返回中奖的下标
     */
    static randomProbability(ary: number[]): number {
        var sum: number = 0;
        var temp: number[] = [];
        for (var i: number = 0; i < ary.length; i++) {
            sum += ary[i];
            temp.push(sum);
        }
        if (sum == 0)
            return 0;
        var a: number;
        do { a = this.random(0, sum); } while (a == 0)
        for (var j: number = 0; j < temp.length; j++) {
            if (a > temp[j])
                continue;
            return j;
        }
    }

    /**
       * 判断值是否小于0-10000
       */
    static isRandTrue(rate: number): boolean {
        var rand: number = this.randomInt(0, 10000);
        return rand <= rate;
    }
}
