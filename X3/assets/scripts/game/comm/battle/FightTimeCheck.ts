import { Handler } from "../../../core/utils/Handler";

/***
     * 战斗的时间管理对象
     * liwenlong
     */
export class FightTimeCheck {
    /***当前BUFF的帧数 */
    public time: number = 0;
    public maxTime: number = 0;
    public isCallLater: boolean = false;
    /***延迟时间 */
    public delay: number = 0;

    /***结束回调 */
    public endCallback: Handler;

    public exData: any
    public constructor () {
    }

    /***累计最大值 */
    protected maxIndex: number = 1;
    protected index: number = 0;
    /**下一帧时间 */
    public nextFrame(): void {
        if (this._isReadyToRemove)
            return;

        this.index++;
        if (this.index >= this.maxIndex) {
            this.index = 0;

            this.delay--;
            if (this.delay > 0) {
                return;
            }

            this.time++;
            this.triggerHandler()
            if (this.maxTime >= 0 && this.time >= this.maxTime) {
                this.completeHandler();
                //移除
                this._isReadyToRemove = true;
            }
        }
    }

    public activeTriggerHandler(): void {
        this.triggerHandler()
    }

    /**触发 */
    protected triggerHandler(): void {

    }

    /***结束后的回调 */
    protected completeHandler(): void {
        if (this.endCallback)
            this.endCallback.run();
        this.destoryTimeCheck();
    }

    /***是否会移除 */
    public _isReadyToRemove: boolean = false;
    public set isReadyToRemove(v: boolean) {
        this._isReadyToRemove = v;
    }

    public get isReadyToRemove(): boolean {
        return this._isReadyToRemove;
    }

    public destoryTimeCheck(): void {
        this.isReadyToRemove = true;
        this.endCallback = null;
    }

}