/**
 * 一次性方法事件绑定器 （用于匿名函数回调）
 */
export class FunctionOnceBinder {

    private funcMap: Map<String, Function[]>;

    constructor() {
        this.funcMap = new Map<String, Function[]>();
    }

    public addFunction(funcName: String, f: Function): boolean {
        let arr = this.funcMap.get(funcName);

        if (!arr) {
            arr = [];
            this.funcMap.set(funcName, arr);
        } else {
            arr.push(f);
        }

        return false;
    }

    public applyFunction(funcName: String, arg?: any): boolean {
        let arr = this.funcMap.get(funcName);
        if (!arr) {
            console.error("FunctionOnceBinder: function not exist");
            return false;
        }

        for (let i = 0, len = arr.length; i < len; i++) {
            let f = arr[i];
            try {
                f?.call(null, arg);
            } catch (e) {
                console.error("FunctionOnceBinder Function trigger error: " + e);
            }
        }

        this.funcMap.delete(funcName);
    }

    public removeFunction(funcName: String): any {
        return this.funcMap.delete(funcName);
    }
}