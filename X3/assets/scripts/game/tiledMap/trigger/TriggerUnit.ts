import { math } from "cc";
import { AreaUnit } from "../../comm/battle/unit/AreaUnit";

export class TriggerUnit extends AreaUnit {
    /**表Id */
    public triggerId: number;

    /**触发表 */
    public cfg: table.map.TriggerConfig;

    /**已触发次数 */
    public triggeredCount = 0;

    /**触发进入事件 */
    public get triggerInEvent() {
        return this.cfg?.inEvent;
    }

    /**触发进入事件参数 */
    public get eventInParam() {
        return this.cfg?.inParam;
    }

    /**触发进入事件 */
    public get triggerOutEvent() {
        return this.cfg?.outEvent;
    }

    /**触发进入事件参数 */
    public get eventOutParam() {
        return this.cfg?.outParam;
    }

    /**是否可以触发事件 */
    public get isCanTrigger() {
        return this.cfg && (!this.triggeredCount || !this.cfg?.once);
    }

    onRecovery() {
        super.onRecovery();
        this.triggerId = undefined;
        this.cfg = undefined;
        this.triggeredCount = 0;
    }
}