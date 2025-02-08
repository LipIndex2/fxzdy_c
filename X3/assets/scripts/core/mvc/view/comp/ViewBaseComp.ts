export class ViewBaseComp<C> {
    /**子类必须重写 */
    public static className = "ViewBaseComp";

    /**
     * 获取当前组件的类名。
     * @returns {string} 当前组件的类名。
     */
    public get className(): string {
        //@ts-ignore
        return this.constructor.className;
    }

    public constructor (...arg) {

    }

    /**来源 */
    owner: C;

    /**是否销毁 */
    isDestroy: boolean;

    /***初始化完毕 */
    public onInit(): void {
    }

    /***界面打开完毕，已经addchild到容器上 */
    public onOpen(): void {

    }

    /***界面关闭前 */
    protected onCloseBefore(): void {

    }

    /***界面关闭完毕 */
    protected onClose(): void {

    }

    /***销毁前 */
    protected doDispose(): void {

    }

    /***适配后 */
    public onResize(): void {

    }

    public update(): void {

    }

    /***调用对应的触发函数 */
    execute(name: string): void {
        var thisObj: any = this;
        if (thisObj[name])
            thisObj[name]();
    }

    destroy(o?: any): void {

    }
}