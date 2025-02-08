
let kvMap: Map<any, any> = new Map();
/**
 * 数组工具
 */
export default class ArrayUtils {

    /**
     * 非空
     * @param array
     */
    static isNotEmpty<T>(array: T[]): boolean {
        return !this.isEmpty(array);
    }

    /**
     * 空的
     * @param array
     */
    static isEmpty<T>(array: T[]): boolean {
        if (array == null) {
            return true;
        }
        return array.length <= 0;
    }

    /**
     * 判断数组严格相等，对应下标的元素都相等
     * @param arr1 
     * @param arr2 
     * @param compareFun 相等返回true，不相等返回false
     */
    static equal<T extends number | string>(arr1: T[], arr2: T[]) {
        if (arr1?.length !== arr2?.length) {
            return false;
        }
        let len = arr1.length;
        for (let i = 0; i < len; ++i) {
            if (arr1[i] !== arr2[i]) {
                return false
            }
        }
        return true
    }

    /**
     * 判断两个数组元素是否相等，非严格
     * @param arr1 
     * @param arr2 
     * @returns 
     */
    static kvEqual<K,V,T extends {k: K, v:V}>(arr1: T[], arr2: T[]) {
        if (arr1?.length != arr2?.length) {
            return false;
        }
        let len = arr1.length;
        kvMap.clear();
        for(let i = 0; i < len; ++i) {
            kvMap.set(arr1[i].k, arr1[i].v);
        }

        for(let i = 0; i < len; ++i) {
            if(kvMap.get(arr2[i].k) !== arr2[i].v){
                return false
            }
        }

        return true;
    }

    /**
     * 是否含有元素
     * @param array 数组
     * @param item 目标对象
     */
    public static contains<T>(array: T[], item: T): boolean {
        if (!array) {
            return false;
        }
        return array.indexOf(item) > -1;
    }

    /** 去重 */
    public static noRepeated(arr: any[]) {
        var res = [arr[0]];
        for (var i = 1; i < arr.length; i++) {
            var repeat = false;
            for (var j = 0; j < res.length; j++) {
                if (arr[i] == res[j]) {
                    repeat = true;
                    break;
                }
            }

            if (!repeat) {
                res.push(arr[i]);
            }
        }
        return res;
    }

    /**
     * 复制二维数组
     * @param array 目标数组
     */
    public static copy2DArray(array: any[][]): any[][] {
        let newArray: any[][] = [];
        for (let i = 0; i < array.length; i++) {
            newArray.push(array[i].concat());
        }
        return newArray;
    }

    /**
     * Fisher-Yates Shuffle 随机置乱算法
     * @param array 目标数组
     */
    public static fisherYatesShuffle(array: any[]): any[] {
        let count = array.length;
        while (count) {
            let index = Math.floor(Math.random() * count--);
            let temp = array[count];
            array[count] = array[index];
            array[index] = temp;
        }
        return array;
    }

    /**
     * 混淆数组
     * @param array 目标数组
     */
    public static confound(array: []): any[] {
        let result = array.slice().sort(() => Math.random() - .5);
        return result;
    }

    /**
     * 数组扁平化
     * @param array 目标数组
     */
    public static flattening(array: any[]) {
        for (; array.some(v => Array.isArray(v));) {    // 判断 array 中是否有数组
            array = [].concat.apply([], array); // 压扁数组
        }
        return array;
    }

    /** 删除数组中指定项 */
    public static removeItem(array: any[], item: any) {
        var temp = array.concat();
        for (let i = 0; i < temp.length; i++) {
            const value = temp[i];
            if (item == value) {
                array.splice(i, 1);
                break;
            }
        }
    }

    /**
     * 合并数组 修改原数组
     * @param tarArr 目标数据(修改的是这个)
     * @param sourceArr 数据来源
     */
    static combineArrays(tarArr: any[], sourceArr: any[]) {
        if (sourceArr == null) {
            return;
        }
        tarArr.push(...sourceArr);

        /*
        for (var i = 0; i < sourceArr.length; i++) {
            tarArr.push(sourceArr[i]);
        }*/
    }

    /**
     * 去重合并数组 修改原数组(效率低)
     * @param tarArr 目标数据(修改的是这个)
     * @param sourceArr 数据来源
     */
    static combineArraysNoRepeated(tarArr: any[], sourceArr: any[]) {
        if (sourceArr == null) {
            return;
        }

        var item;
        for (var i = 0; i < sourceArr.length; i++) {
            item = sourceArr[i];
            if (tarArr.indexOf(item) == -1) {
                tarArr.push(item);
            }
        }
    }

    /**
     * 合并数组 返回新数组
     * @param array1 目标数组1
     * @param array2 目标数组2
     */
    public static combineArrays2(array1: any[], array2: any[]): any[] {
        let newArray = [...array1, ...array2];
        return newArray;
    }

    /**新随机数组*/
    public static randomAry<T>(arr: T[]): T[] {
        var outputArr: T[] = arr.slice();
        var i: number = outputArr.length;
        var temp: T;
        var indexA: number;
        var indexB: number;

        while (i) {
            indexA = i - 1;
            indexB = Math.floor(Math.random() * i);
            i--;

            if (indexA == indexB) continue;
            temp = outputArr[indexA];
            outputArr[indexA] = outputArr[indexB];
            outputArr[indexB] = temp;
        }

        return outputArr;
    }

    /**
     * 不重复才添加
     * @return 是否有添加
     */
    public static iPush(array: Array<any>, item: any): boolean {
        if (array.indexOf(item) == -1) {
            array.push(item);
            return true;
        }
        return false;
    }

    /***二维数组翻转 */
    public static transposeArray<T>(input: T[][]): T[][] {
        return input[0].map((_, colIndex) => input.map(row => row[colIndex]))
    }


    /**
     * 删除元素 by 条件 | 直接操作原来的数组!
     * @param array
     * @param isNeedDelete
     */
    static deleteByConditionReturnCount<T>(array: T[], isNeedDelete: (it: T) => boolean): number {
        return this.deleteByConditionReturnDelArray(array, isNeedDelete)?.length || 0;
    }

    /**
     * 删除元素 by 条件 | 直接操作原来的数组!
     * @param array
     * @param isNeedDelete
     * @return 删除的元素 []
     */
    static deleteByConditionReturnDelArray<T>(array: T[], isNeedDelete: (it: T) => boolean): T[] {
        let delArray = [];

        for (let i = array.length - 1; i >= 0; i--) {
            let item = array[i];
            if (isNeedDelete(item)) {
                const newDelArray = array.splice(i, 1);
                delArray = [...delArray, ...newDelArray];
            }
        }

        return delArray;
    }
}
