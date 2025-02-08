import { BaseModel } from "db://assets/scripts/core/mvc/model/BaseModel";
import { TalentContext } from "db://assets/scripts/game/modules/talent/context/TalentContext";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { AttrData } from "db://assets/scripts/game/modules/attr/AttrManager";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";


/**
 * 天赋模块协议
 * @author GameCreator
 */
export class TalentModel extends BaseModel {


    // 天赋状态
    private _context!: TalentContext;


    /**
     * 模块标识
     */
    private MODULE = 27;

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
        //  注册所有的指令
        let moduleId = this.MODULE;
        this.registerMsg(moduleId, 1, this.recActiveTalent);

    }

    /*********************************协议发送*********************************/

    get context(): TalentContext {
        return this._context;
    }

    /**
     * 激活天赋
     * 模块号：27	指令号：1
     */
    @LogBusiness("[天赋] client request 激活天赋 ")
    public sendActiveTalent(c2s: Vo.talent.ActiveTalentC2S): void {
        this.send(this.MODULE, 1, c2s, c2s);
    }

    /*********************************协议监听*********************************/

    /**
     * 激活天赋
     * 模块号：27	指令号：1
     */
    @LogBusiness("[天赋] server response 激活天赋 ")
    public recActiveTalent(data: Vo.talent.ActiveTalentS2C): void {
        if (data.code < 0) {
            return;
        }


        const activeTalentId = data.content.activeTalentId;
        const costItemResults = data.content.costItemResults;
        FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, costItemResults as Array<Vo.cost.CostItemResult>);

        // 新增天赋
        this._context.addTalentId(activeTalentId);
        FacadeManager.ins().emitNow(NotificationKey.TALENT_CHANGE, activeTalentId)


    }

    /*********************************协议推送*********************************/

    // region 我的天赋


    @LogBusiness("[天赋] login init")
    initData(initVo: Vo.talent.TalentLoginVo) {
        this._context = TalentContext.from(initVo)
    }


    /**
     * 是否升级过
     * @param talentId
     */
    isHaveLvUpTalent(talentId: number): boolean {
        if (!talentId) {
            return true;
        }
        if (talentId == 0) {
            return false;
        }
        return this._context.isHaveLvUpTalent(talentId)
    }

    /**
     * 最大激活的 rowId
     */
    getMaxActiveRowId(): number {
        return this._context.getMaxActiveRowId()
    }
    
    // 小天赋
    getMaxActiveSmallTalentRowId(): number {
        return this._context.getMaxActiveSmallTalentRowId()
    }

    /**
     * 最大可解锁的 rowId
     */
    getMaxCanUnlockRowId(): number {
        return this._context.getMaxCanUnlockRowId()
    }

    /**
     * 是否可以升级
     * @param talentId
     */
    isCanLvUpThisTalentId(talentId: number): boolean {
        return this._context.isUnlockTalent(talentId)
    }

    /**
     * get 合并后的天赋加成属性
     */
    getMergedAddAttrDataArray(): Array<AttrData> {
        return this._context.getMergedAddAttrDataArray();
    }


    // endregion
    getMaxRodId(): number {
        return this._context.getMaxRodId()
    }

    refreshRedDot() {
        this._context.refreshRedDot();
    }
}
