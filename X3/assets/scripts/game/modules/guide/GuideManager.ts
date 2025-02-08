import BaseSingleton from "../../../core/base/BaseSingleton";
import { IGuideVerifyArgs } from "./const/IGuideVerifyArgs";
import GuideRunner from "./starter/GuideRunner";

export class GuideManager extends BaseSingleton {
    /**执行中的引导 */
    public curRunner: GuideRunner;

    /** 是否在引导中 */
    get isGuiding() {
        return !!this.curRunner;
    }

    /**执行中的引导组 */
    get curGroup() {
        return this.curRunner?.groupId;
    }

    /** 当前引导配置 */
    get guideCfg() {
        return this.curRunner?.cfg;
    }

    /** 当前引导完成条件 */
    get finishCondition() {
        return this.curRunner?.finishCondition;
    }

    /**下一步引导
     * @returns 是否有下一步引导
     */
    public nextGuide() {
        return this.curRunner?.nextGuide();
    }

    /**检测当前步骤条件 */
    public checkFinishCondition(verifys: IGuideVerifyArgs[]) {
        if (!this.curRunner) return false;
        for (let i = 0; i < verifys.length; i++) {
            if (this.curRunner.checkFinishCondition(verifys[i])) {
                return true;
            }
        }
        return false;
    }

    /**是否可以跳过 */
    public isCanPass() {
        return this.curRunner?.isCanPass();
    }

    /**跳过 */
    public pass() {
        this.curRunner?.passCurStage();
    }

    /**
     * 结束引导组。
     * @param group - 组Id。
     */
    public endGuide(groupId: number) {
        if (GuideManager.ins().curGroup == groupId) {
            GuideManager.ins().curRunner = null;
        }
    }
}

window["GuideManager"] = GuideManager;
