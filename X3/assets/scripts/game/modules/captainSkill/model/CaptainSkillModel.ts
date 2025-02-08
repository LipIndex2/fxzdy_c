import G from "db://assets/scripts/core/comm/G";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { BaseModel } from "db://assets/scripts/core/mvc/model/BaseModel";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { CaptainSkillContext } from "db://assets/scripts/game/modules/captainSkill/context/CaptainSkillContext";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

/**
 * 战队科技协议定义
 * @author GameCreator
 */
export class CaptainSkillModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 32;

    // 上下文
    private _context: CaptainSkillContext = new CaptainSkillContext();

    constructor() {
        super();
        this.regist();
    }

    public static getModule(): number {
        return this.ins().MODULE;
    }

    /**
     * 注册所有从服务端收到的回调。
     */
    private regist(): void {
        // 注册所有的指令
        let moduleId = this.MODULE;
        this.registerMsg(moduleId, 1, this.recCaptainUpLevel);
        this.registerMsg(moduleId, 2, this.recCaptainReset);
        this.registerMsg(moduleId, 3, this.recCaptainCoreUpLevel);
    }

    /*********************************协议发送*********************************/
    /**
     * 战队科技升级
     * 模块号：32	指令号：2
     */
    @LogBusiness("战队科技升级 req")
    public sendCaptainUpLevel(c2s: Vo.captain.CaptainUpLevelC2S): void {
        this.send(this.MODULE, 1, c2s);
    }

    /**
     * 科技重置
     * 模块号：32	指令号：2
     */
    public sendCaptainReset(): void {
        this.send(this.MODULE, 2);
    }

    /**
     * 科技核心升级
     * 模块号：32	指令号：3
     */
    public sendCaptainCoreUpLevel(): void {
        this.send(this.MODULE, 3);
    }

    /*********************************协议监听*********************************/
    /**
     * 战队科技升级
     * 模块号：32	指令号：2
     */
    @LogBusiness("战队科技升级 resp")
    public recCaptainUpLevel(data: Vo.captain.CaptainUpLevelS2C): void {
        if (data.code < 0) {
            return;
        }

        const content = data.content;

        const costItemResults = content.costItemResults;
        if (content.costItemResults?.length > 0) {
            this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, costItemResults as Vo.cost.CostItemResult[])
        }

        const captainId = content.captainId;
        const lv = content.level;

        this._context.lvUp(captainId, lv);
    }

    /**
     * 科技重置
     * 模块号：32	指令号：2
     */
    public recCaptainReset(data: Vo.captain.CaptainResetS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
            if (data.content?.costItemResults?.length > 0) {
                this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content?.costItemResults)
            }
            if (data.content?.rewardResults?.length > 0) {
                this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data.content?.rewardResults);
            }
            this._context.resetAllLv(data.content);
        }
    }

    /**
     * 科技核心升级
     * 模块号：32	指令号：3
     */
    public recCaptainCoreUpLevel(data: Vo.captain.CaptainCoreUpLevelS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
            if (data.content?.costItemResults?.length > 0) {
                this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content?.costItemResults)
            }
            if (data.content) {
                this._context.setCoreLv(data.content.captainCoreLevel);
            }
        }
    }

    /*********************************协议推送*********************************/


    // ----------------- my code -----------------

    public initData(data: Vo.captain.CaptainLoginVo) {
        this._context.initLocalRedDotLvMap();
        this._context.reset(data);
    }

    public get context(): CaptainSkillContext {
        return this._context;
    }

    isUnlock(skillId: number) {
        return this._context.isUnlock(skillId);
    }

    getLvBySkillId(skillId: number) {
        return this._context.getLvBySkillId(skillId);
    }
    
    // 解锁任意技能
    isHaveUnlockAnySkill() {
        return this._context.isHaveAnyUnlockSkill()
    }

    getDefaultCaptainSkillId(): number {
        return this._context.getDefaultCaptainSkillId();
    }

    getShowLv(fightType: ServerEnums.FightType) {
        //没有队长技能了
        const captainId = 0;//FormationManager.ins().getFormationVoByType(fightType)?.captainId || 0;
        if (captainId == 0) {
            return ""
        }
        const lv = this._context.getLvBySkillId(captainId);
        return `+${Math.max(0, lv)}`;
    }

    getAllCaptainSkillId(): number[] {
        return this._context.getAllCaptainSkillId();
    }

    getCaptainIdToLvMap(): Map<number, number> {
        return this._context.getCaptainIdToLvMap();
    }

    refreshRedDot() {
        this._context.refreshRedDot();
    }
    
}
