/**
 * 可变大小的数组，解决由于频繁删除和添加数据元素而带来的消耗
 */
export default class GrowableStack{
    private m_count: number = 0;
    private m_stack: Array<any>;
    private static cache: GrowableStack;

    constructor(N = 0) {
        this.m_stack = new Array(N)
    }

    public reset() {
        for (var i: number = 0; i <= this.m_count; ++i) {
            this.m_stack[i] = null;
        }
        this.m_count = 0;
    }

    public push(element: any): void {
        this.m_stack[this.m_count] = element;
        ++this.m_count;
    }

    public pop(): any {
        if (this.m_count > 0) {
            --this.m_count;
            var element = this.m_stack[this.m_count];
            this.m_stack[this.m_count] = null;
            return element;
        }
        return null;
    }

    public shift(needCapacity = true): any {
        if (this.m_count > 0) {
            --this.m_count;
            var element = this.m_stack[0];
            for (var i: number = 0; i <= this.m_count; ++i) {
                this.m_stack[i] = this.m_stack[i + 1];
            }
            return element;
        }
        return null;
    }

    public remove(element: any,needCapacity = true): number {
        let index = this.m_stack.indexOf(element);
        if (index !== -1) {
            if(needCapacity){
                //后面的往前挪
                for (var i: number = index; i <= this.m_count; ++i) {
                    if (!this.m_stack[i]) {
                        //将最后一个置空
                        if (this.m_stack[i - 1] !== undefined) {
                            this.m_stack[i - 1] = null;
                        }
                        break;
                    }
                    this.m_stack[i] = this.m_stack[i + 1];
                }
                --this.m_count;
            }else{
                this.m_stack[index] = null;
            }
        }
        return index;
    }

    public removeBuildVoidSlot(){
        let nullIndex = this.m_stack.indexOf(null);
        if(nullIndex === -1){
            return;
        }
        let count = this.m_count;
        this.m_count = 0;
        for (var i: number = 0; i < count; ++i) {
            if (this.m_stack[i]) {
                if(i > nullIndex){
                    this.m_stack[nullIndex] = this.m_stack[i];
                    this.m_stack[i] = null;
                    nullIndex = this.m_stack.indexOf(null,nullIndex + 1);
                }
                ++this.m_count;
            }
        }
    }

    public has(element: any): boolean {
        return this.m_stack.indexOf(element) !== -1;
    }

    public get(index): any {
        if (this.m_count === 0 || index > this.m_count || index < 0) {
            return null;
        }
        return this.m_stack[index];
    }

    public getCount(): number {
        return this.m_count;
    }

    public toArray() {
        let result = [];
        let count: number = this.getCount();
        for (let i: number = 0; i < count; ++i) {
            result.push(this.get(i));
        }
        return result;
    }

    public static create(): GrowableStack {
        if (!GrowableStack.cache) {
            GrowableStack.cache = new GrowableStack();
        }
        let s = GrowableStack.cache.pop();
        if (!s) {
            s = new GrowableStack();
        }
        return s;
    }

    public static recovery(s: GrowableStack): void {
        s.reset();
        if (!GrowableStack.cache) {
            GrowableStack.cache = new GrowableStack();
        }
        if (GrowableStack.cache.getCount() < 50 && !GrowableStack.cache.has(s)) {
            GrowableStack.cache.push(s);
        }
    }
}