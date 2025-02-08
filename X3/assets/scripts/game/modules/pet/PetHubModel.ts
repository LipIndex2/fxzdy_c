/**@format */
import { BaseModel } from "../../../core/mvc/model/BaseModel";
import { TableManager } from "../../../core/table/TableManager";
import NotificationKey from "../../event/NotificationKey";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

export class PetHubModel extends BaseModel {
    /**
     * 模块标识
     */
    private static readonly MODULE = 58;

    /**
     * 抽卡类型
     */
    private readonly drawCardType: number = ServerEnums.DrawCardType.PET;

    /** 抽卡基础信息 */
    private _baseInfo: Vo.drawcard.DrawCardLoginVo = null;

    /** 抽卡结果 */
    private _drawCardResult: Vo.drawcard.PetDrawCardVo = null;

    constructor() {
        super();
        this.regist();
    }

    /**
     * 注册所有从服务端收到的回调。
     */
    private regist(): void {
        this.registerMsg(PetHubModel.MODULE, 1, this.recDrawCard.bind(this));
        this.registerMsg(PetHubModel.MODULE, 2, this.recCardInfo.bind(this));
    }

    public static getModule(): number {
        return this.MODULE;
    }

    public isFreeRound(times: number): boolean {
        let data = this._drawCardResult ? this._drawCardResult : this._baseInfo;
        if (data.petTimesRate == times) {
            return data.drawCardPetRoundId !== 1;
        } else {
            return false;
        }
    }

    public get baseInfo(): Vo.drawcard.DrawCardLoginVo {
        return this._baseInfo;
    }

    public get drawCardResult(): Vo.drawcard.PetDrawCardVo {
        return this._drawCardResult;
    }

    public getDrawCardConfig(): any {
        let cfg = TableManager.getDataById(table.drawCard.DrawCardConfig, this.drawCardType);
        if (cfg) {
            return cfg;
        } else {
            console.error("DrawCardConfig表读取配置错误");
            return null;
        }
    }

    static getAllPoolCfg() {
        let cfg = TableManager.getAllData(table.drawCard.DrawCardPoolConfig);
        return cfg ? cfg : null;
    }

    public getDrawCardType() {}

    /**
     * 获取下一轮次的所需奖励数量
     */
    public getRoundMaxCount(id: number): number {
        const cfg = TableManager.getDataById(table.drawCard.DrawCardRoundConfig, id);
        return cfg?.nextNeedRewardNum || 0;
    }

    // region 发送协议===========================================================================

    /**
     * 发送抽卡请求
     * 模块号：58	指令号：1
     */
    public sendDrawCard(isTenTimes: boolean): void {
        let args = {
            times: isTenTimes ? 10 : 1,
        } as Vo.drawcard.PetDrawCardC2S;
        this.send(PetHubModel.MODULE, 1, args);
    }

    /**
     * 请求抽卡信息
     * 模块号：58	指令号：2
     */
    public sendCardInfo(): void {
        this.send(PetHubModel.MODULE, 2);
    }

    // endregion

    // region 收到协议===========================================================================

    /**
     * 点击抽卡
     * 模块号：58	指令号：1
     */
    private recDrawCard(data: Vo.drawcard.PetDrawCardS2C): void {
        if (data.code < 0) return;

        this._drawCardResult = data.content;
        const costItems = data.content.costItemResults;
        this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, costItems);
        this.emit(NotificationKey.COLLECTIONS_DRAW_CARD);
    }

    /**
     * 获取抽卡信息
     * 模块号：58	指令号：2
     */
    private recCardInfo(data: Vo.drawcard.DrawCardInfoS2C): void {
        if (data.code < 0) return;

        this._baseInfo = data.content;
        this.emit(NotificationKey.COLLECTIONS_CARD_INFO);
    }
}
