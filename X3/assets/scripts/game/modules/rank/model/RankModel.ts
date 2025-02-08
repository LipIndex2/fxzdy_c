import { BaseModel } from "db://assets/scripts/core/mvc/model/BaseModel";
import { RankContext } from "db://assets/scripts/game/modules/rank/context/RankContext";
import { EventRankDataResp } from "db://assets/scripts/game/modules/rank/event/EventRankData";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import G from "db://assets/scripts/core/comm/G";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";

/**
 * 排行榜模型
 */
export class RankModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 42;

    // 排行榜
    private _context: RankContext;

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
        // TODO 注册所有的指令
        let moduleId = this.MODULE;
        this.registerMsg(moduleId, 1, this.recRankList);
        this.registerMsg(moduleId, 2, this.recLoadFirstRank);


    }

    /*********************************协议发送*********************************/

    /**
     * 获取排行榜
     * 模块号：42	指令号：1
     */
    @LogBusiness("获取排行榜 42-1 ")
    public sendRankList(c2s: Vo.ranking.RankListC2S): void {
        this.send(this.MODULE, 1, c2s, c2s);
    }

    /**
     * 获取排行榜第一名信息
     * 模块号：42	指令号：2
     */
    public sendLoadFirstRank(c2s: Vo.ranking.LoadFirstRankC2S): void {
        this.send(this.MODULE, 2, c2s);
    }

    /*********************************协议监听*********************************/

    /**
     * 获取排行榜
     * 模块号：42	指令号：1
     */
    public recRankList(data: Vo.ranking.RankListS2C, c2s: Vo.ranking.RankListC2S): void {
        const rankType = c2s.type;
        let subRankParam = c2s.subRankParam;
        if (data.code < 0) {

            G.FacadeManager.emit(NotificationKey.RANK_ON_DATA_RESP, EventRankDataResp.createByCommon(rankType, subRankParam, null))

            return;
        }


        const content = data.content;
        const myRankNum = data.content.rank;

        const rankList = content.list as Array<Vo.ranking.RankItemVo>;

        G.FacadeManager.emit(NotificationKey.RANK_ON_DATA_RESP, EventRankDataResp.createByCommon(rankType, subRankParam, content))


        // TODO
    }

    /**
     * 获取排行榜第一名信息
     * 模块号：42	指令号：2
     */
    public recLoadFirstRank(data: Vo.ranking.LoadFirstRankS2C): void {
        if (data.code < 0) {
            return;
        }
        // TODO
    }

    /*********************************协议推送*********************************/

    /********************************* Me *********************************/


    public initData(data: any) {
        this._context = RankContext.create();
    }


}
