import { Handler } from "../../../core/utils/Handler";
import { FightTimeCheck } from "./FightTimeCheck";

export class FightTimeLoop extends FightTimeCheck {
    /***循环帧数 */
    public timeLoop: number = 0;
    /***每次触发的帧数 */
    public trigger: number = 0;
    /***完全结束回调 */
    public completeCallback: Handler;

    /**触发 */
    protected triggerHandler(): void {
        this.timeLoop++;
        if (this.trigger != 0 && this.timeLoop >= this.trigger) {
            //执行BUFF
            if (this.endCallback)
                this.endCallback.run();
            this.timeLoop = 0;
        }
    }

    /***结束后的回调 */
    protected completeHandler(): void {
        if (this.completeCallback) {
            this.completeCallback.run();
        }
        this.completeCallback = null;
        this.destoryTimeCheck();
    }
}