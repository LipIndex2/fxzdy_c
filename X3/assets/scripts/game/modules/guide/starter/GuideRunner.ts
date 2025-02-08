import { Logger, LogType } from "db://assets/scripts/core/log/Logger";
import { GuideConfigDatas } from "../../../table/guide/GuideConfigDatas";
import { ConditionUtils } from "../../condition/ConditionUtils";
import { GuideModel } from "../model/GuideModel";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { GuideVerifyType } from "../const/GuideEnum";
import { GuideConditions } from "../GuideConditions";
import G from "db://assets/scripts/core/comm/G";
import NotificationKey from "../../../event/NotificationKey";
import { IGuideVerifyArgs } from "../const/IGuideVerifyArgs";
import GIns from "../../../GIns";

/**引导运行器 */
export default class GuideRunner {
    public isRunning = false;
    private _groupId: number;
    private _curCfg: table.guide.GuideConfig;
    private _guideCfgs: table.guide.GuideConfig[];
    constructor(groupId: number) {
        this._groupId = groupId;
        this._guideCfgs = GuideConfigDatas.ins().getConfigsByGroup(groupId);

        let finishGuideId = GuideModel.ins().guideMap[groupId];
        if (finishGuideId) {
            let cur = GuideConfigDatas.ins().getNextPartConfigById(finishGuideId);
            if (cur) {
                this.activeGuideId(cur.id);
            }
        } else {
            let cur = this._guideCfgs[0];
            if (cur) {
                this.activeGuideId(cur.id);
            }
        }
    }

    get groupId() {
        return this._groupId;
    }

    get cfg(): table.guide.GuideConfig {
        return this._curCfg;
    }

    /**本组是否完成 */
    isFinishGroup() {
        return !this._curCfg;
    }

    /**主动检测是否满足条件 */
    initiativeCheck() {
        if (this.isFinishGroup()) return false;
        let cfg = this._curCfg;

        if (GuideConditions.selfVerify(cfg.id)) {
            this.run();
            return true;
        }
    }

    /** 获取对应触发条件的引导配置组 */
    public tryRun(verify: IGuideVerifyArgs) {
        if (this.isFinishGroup()) return false;
        if (this.isRunning) return true;
        if (!this.isRunning) {
            let cfg = this._curCfg;
            if (!cfg.triggerCondition || (verify && cfg.triggerCondition[0] == verify.type && GuideConditions.checkGuideCondition(cfg.triggerCondition, verify, cfg))) {
                this.run();
            }
        }
        return this.isRunning;
    }

    /**运行 */
    run() {
        this.isRunning = true;
        G.FacadeManager.emit(NotificationKey.GUIDE_START, this._curCfg.id);
    }

    /**停止 */
    stop() {
        Logger.green(LogType.MODEL, "=>>>>>>>>>>>>>>>>>>>>>>>>>>> STOP " + this.groupId + " id >> " + this._curCfg?.id);

        this.isRunning = false;
        GIns.guideMgr.endGuide(this.groupId);
        G.FacadeManager.emit(NotificationKey.GUIDE_END, this.groupId);

        if (!this._curCfg) {
            G.FacadeManager.emit(NotificationKey.GUIDE_FINISH, this.groupId);
        }
    }

    /**激活引导Id */
    public activeGuideId(guideId: number) {
        Logger.green(LogType.MODEL, "=>>>>>>>>>>>>>>>>>>>>>>>>>>> ACTIVE " + guideId);
        this._curCfg = TableManager.getDataById(table.guide.GuideConfig, guideId);
    }

    public save(cfg: table.guide.GuideConfig) {
        //小段结束
        GuideModel.ins().sendUpdateGuide(cfg.group, cfg.id); //保存到后端
    }

    /**保存整组完成 */
    public saveGroup() {
        let lastCfg = this._guideCfgs[this._guideCfgs.length - 1];
        GuideModel.ins().sendUpdateGuide(this.groupId, lastCfg.id); //保存到后端
    }

    /** 当前引导完成条件 */
    get finishCondition() {
        return this._curCfg?.finishCondition;
    }

    /**检测触发条件 */
    get triggerCondition() {
        return this._curCfg?.triggerCondition;
    }

    /**下一步引导
     * @returns 是否满足完成条件
     */
    public nextGuide() {
        if (this.isFinishGroup()) return false;

        let cfg = this._curCfg;

        if (cfg.savePoint) {
            this.save(cfg);
        }

        if (cfg.script) {
            //完成后事件
            Logger.green(LogType.MODEL, cfg.script + " : " + cfg.scriptParam?.toString());
            if (cfg.script == NotificationKey.MAP_ACTIVE_BUILDING) {
                G.FacadeManager.emit(cfg.script, cfg.scriptParam[0]);
            } else {
                G.FacadeManager.emit(cfg.script, cfg.scriptParam);
            }
        }

        if (cfg.nextId) {
            let nextCfg = TableManager.getDataById(table.guide.GuideConfig, cfg.nextId);
            this.activeGuideId(nextCfg.id);

            //是否满足下一阶段条件
            if (!nextCfg.triggerCondition || GuideConditions.selfVerify(nextCfg.id)) {
                this.isRunning = true;
                G.FacadeManager.emit(NotificationKey.GUIDE_NEXT, this.groupId);
                return true;
            }
        } else {
            this._curCfg = null;
        }
        this.stop();
        return false;
    }

    /**检测当前步骤条件 */
    public checkFinishCondition(verify: IGuideVerifyArgs) {
        let isTrue = GuideConditions.checkGuideCondition(this.finishCondition, verify, this._curCfg);
        if (isTrue) {
            //完成当前步骤引导
            this.nextGuide();
            return true;
        }
        return false;
    }

    /**是否可以跳过 */
    public isCanPass() {
        let cfg = this._curCfg;
        let isCanPass = true;
        let cfgs = this._guideCfgs;
        for (let i = 0; i < cfgs.length; i++) {
            var c = cfgs[i];
            if (c.id < cfg.id) {
                continue;
            }

            if (c.script) {
                isCanPass = false;
                break;
            }

            if (cfg.passEnd) {
                break;
            }
        }

        return isCanPass;
    }

    /**跳过当前段 */
    public passCurStage() {
        if (this.isFinishGroup()) return;

        let cfg = this._curCfg;
        let cfgs = this._guideCfgs;
        let nextCfg: table.guide.GuideConfig = null;
        for (let i = 0; i < cfgs.length; i++) {
            var c = cfgs[i];
            if (c.id < cfg.id) {
                continue;
            }

            if (c.savePoint) {
                this.save(c);
            }

            if (c.passEnd) {
                nextCfg = TableManager.getDataById(table.guide.GuideConfig, c.nextId);
                break;
            }
        }

        if (nextCfg) {
            this.activeGuideId(nextCfg.id);
            //是否满足下一阶段条件
            if (!nextCfg.triggerCondition || GuideConditions.selfVerify(nextCfg.id)) {
                this.isRunning = true;
                G.FacadeManager.emit(NotificationKey.GUIDE_NEXT, cfg.group);
                return;
            }
        } else {
            this._curCfg = null;
        }

        this.stop();
    }
}