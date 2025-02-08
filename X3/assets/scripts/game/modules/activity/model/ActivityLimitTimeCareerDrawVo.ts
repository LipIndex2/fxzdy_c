import { TableManager } from "../../../../core/table/TableManager";
import { BaseActivityVo } from "../../../comm/activity/model/BaseActivityVo";
import GIns from "../../../GIns";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";

/**
 * 限时职业招募vo
 */
export class ActivityLimitTimeCareerDrawVo extends BaseActivityVo {
    /**活动对应的vo数据  */
    public get activityVo(): Vo.activity.CareerRecruitVo {
        return this.content as Vo.activity.CareerRecruitVo;
    }

    /** 所有职业招募配置表 */
    private _cfgs: table.activity.CareerRecruit.CareerRecruitConfig[];
    /** 当前选择的职业对应的招募配置表 */
    private _cfg: table.activity.CareerRecruit.CareerRecruitConfig;
    /** 当前选中的 */
    private _selId: number;
    /** 招募消耗表 */
    private _recruitCfg: table.recruit.RecruitConfig;

    /** 是否可以跳过动画 */
    private _isSkip: boolean = false;

    /** 保底次数 */
    private _miniCount: number;

    onInitDone() {
        this.isShowRed();
    }

    public get cfgs(): table.activity.CareerRecruit.CareerRecruitConfig[] {
        if (!this._cfgs) {
            this._cfgs = [];
            let allCfgs = TableManager.getAllData(table.activity.CareerRecruit.CareerRecruitConfig);
            for (let cfg of allCfgs) {
                if (cfg.activityId == this.activityId) {
                    this._cfgs.push(cfg);
                }
            }
        }
        return this._cfgs;
    }
    /** 当前选择的职业对应的招募配置表 */
    public get cfg(): table.activity.CareerRecruit.CareerRecruitConfig {
        if (this.activityVo.recruitId) {
            this._cfg = TableManager.getDataById(table.activity.CareerRecruit.CareerRecruitConfig, this.activityVo.recruitId);
        } else {
            this._cfg = TableManager.getDataById(table.activity.CareerRecruit.CareerRecruitConfig, this.selId);
        }
        return this._cfg;
    }
    /** 招募消耗表 */
    public get recruitCfg(): table.recruit.RecruitConfig {
        if (!this._recruitCfg) {
            this._recruitCfg = TableManager.getDataById(table.recruit.RecruitConfig, this.cfgs[0].recruitId);
        }
        return this._recruitCfg;
    }

    /** 当前选中的 */
    public set selId(id: number) {
        this._selId = id;
    }
    public get selId(): number {
        if (this.activityVo.recruitId) return this.activityVo.recruitId;
        return this._selId;
    }

    /** 是否可以跳过动画 */
    public set isSkip(value: boolean) {
        this._isSkip = value;
    }
    public get isSkip(): boolean {
        return this._isSkip;
    }

    /** 保底次数 */
    public get miniCount(): number {
        if (!this._miniCount) {
            this._miniCount = +TableManager.getDataById(table.activity.ActivityConstant.ActivityConstantConfig, "ACTIVITY:CAREER_RECRUIT_ASSIGN_QUALITY_TIMES").content;
        }
        return this._miniCount;
    }

    /** 已招募次数 */
    public get recruitCount(): number {
        return this.activityVo.assignQualityTimes;
    }

    /** 剩余保底次数 */
    public get remainMiniCount(): number {
        return this.miniCount - this.recruitCount;
    }

    /** 当前选中的职业配置表 */
    public get careerCfg(): table.hero.HeroClassConfig {
        if (!this.cfg) return;
        return TableManager.getDataById(table.hero.HeroClassConfig, this.cfg.career);
    }

    public isShowRed() {
        let itemCount = GIns.backpackMgr.getItemCountByItemId(this.recruitCfg.costItems[0].k);
        GIns.redDotMgr.setRedDot(RedDotKeys.CareerRecruit_single, itemCount >= 1);
        GIns.redDotMgr.setRedDot(RedDotKeys.CareerRecruit_ten, itemCount >= 10);
        if (itemCount >= 1) {
            return true;
        }
        return false;
    }
}
