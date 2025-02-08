import BaseSingleton from "../../../core/base/BaseSingleton";
import { TableManager } from "../../../core/table/TableManager";
import GIns from "../../GIns";
import { GuideConditions } from "./GuideConditions";
import { GuideVerifyType } from "./const/GuideEnum";
import { GuideManager } from "./GuideManager";
import { IGuideVerifyArgs } from "./const/IGuideVerifyArgs";
import { GuideModel } from "./model/GuideModel";
import GuideGroupStarter from "./starter/GuideGroupStarter";
import GuideRunner from "./starter/GuideRunner";
import GuideGroupEnder from "./starter/GuideGroupEnder";

/**引导组别管理器 */
export class GuideGroupManager extends BaseSingleton {
    private _groupStarters: { [key: number]: GuideGroupStarter } = {};
    private _groupEnders: { [key: number]: GuideGroupEnder } = {};
    private _guideRunners: { [key: number]: GuideRunner } = {};

    init() {
        let guideMap = GuideModel.ins().guideMap;
        let groups = TableManager.getAllData(table.guide.GuideGroupConfig);
        for (let i = 0; i < groups.length; i++) {
            let gcfg = groups[i];
            let curFinishGuideId = guideMap[gcfg.groupId];

            if (curFinishGuideId && curFinishGuideId >= gcfg.endGuideId) {
                //改组别已完结
                continue;
            }

            if (gcfg.closeVerify && GIns.conditionMgr.checkCondition(gcfg.closeVerify)) {
                //已关闭
                GuideModel.ins().sendUpdateGuide(gcfg.groupId, gcfg.endGuideId); //保存记录
                continue;
            }

            if (!curFinishGuideId && !GIns.conditionMgr.checkCondition(gcfg.openVerify)) {
                //未开启
                this._groupStarters[gcfg.groupId] = GuideGroupStarter.create(gcfg.groupId);
            } else {
                this._guideRunners[gcfg.groupId] = new GuideRunner(gcfg.groupId);
                let ender = GuideGroupEnder.create(gcfg.groupId);
                if (ender) {
                    this._groupEnders[gcfg.groupId] = ender;
                }
            }
        }
    }

    /**启动引导组 */
    startGroup(groupId: number) {
        if (this._groupStarters[groupId]) {
            delete this._groupStarters[groupId];
        }

        if (this._guideRunners[groupId]) return; //防止多次触发, 保证唯一
        this._guideRunners[groupId] = new GuideRunner(groupId);

        let ender = GuideGroupEnder.create(groupId);
        if (ender) {
            this._groupEnders[groupId] = ender;
        }

        if (!GuideManager.ins().isGuiding) {
            if (this._guideRunners[groupId].initiativeCheck()) {
                GuideManager.ins().curRunner = this._guideRunners[groupId];
            }
        }
    }

    /**关闭引导组 */
    closeGroup(groupId: number) {
        if (!GuideManager.ins().isGuiding) {
            if (GuideManager.ins().curGroup == groupId) {
                GuideManager.ins().curRunner = null;
            }
        }

        if (this._guideRunners[groupId]) {
            this._guideRunners[groupId].saveGroup();
            delete this._guideRunners[groupId];
        }

        if (this._groupEnders[groupId]) {
            this._groupEnders[groupId].destroy();
            delete this._groupEnders[groupId];
        }
    }

    /**主动触发 */
    checkGroupRunVirefy() {
        for (let key in this._guideRunners) {
            let runner = this._guideRunners[key];
            if (runner.initiativeCheck()) {
                GuideManager.ins().curRunner = runner;
                return true;
            }
        }
        return false;
    }


    /**检测执行条件 */
    checkGroupRunCondition(verifys: IGuideVerifyArgs[]) {
        for (let key in this._guideRunners) {
            let runner = this._guideRunners[key];
            let triggerCondition = runner.triggerCondition;
            if (triggerCondition) {
                for (let i = 0; i < verifys.length; i++) {
                    if (runner.tryRun(verifys[i])) {
                        //满足条件
                        GuideManager.ins().curRunner = runner;
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**引导组完成 */
    finishGroup(groupId: number) {
        if (GuideManager.ins().curGroup == groupId) {
            GuideManager.ins().curRunner = null;
        }
        if (this._guideRunners[groupId]) {
            delete this._guideRunners[groupId];
        }

        if (this._groupEnders[groupId]) {
            this._groupEnders[groupId].destroy();
            delete this._groupEnders[groupId];
        }
    }
}
