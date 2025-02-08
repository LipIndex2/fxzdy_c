import { BaseModel } from "../../../core/mvc/model/BaseModel";
import { IPayOrder } from "../../../core/sdk/SdkBase";
import { SdkManager } from "../../../core/sdk/SdkManager";
import { TableManager } from "../../../core/table/TableManager";
import { TimeManager } from "../../../core/time/TimeManager";
import { ChooseServerModel } from "../../../main/modules/login/model/ChooseServerModel";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { FormationManager } from "../formation/FormationManager";
import { PlayerModel } from "../player/model/PlayerModel";

/**
 * 充值订单模块定义
 * @author GameCreator
 */
export class OrderModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 4;

    /**月充值记录时间 */
    public year = 2024;
    /**月充值记录时间 */
    public month = 8;
    /**当月充值金额 */
    public monthTotalMoney = 0;

    /** 商品充值记录 */
    public chargeIds: Array<string>;

    /**
     * 商品Id-充值数量 (注：不包含优惠券购买)
     */
    public realChargeMap: Object;

    /**
     * 商品Id-充值数量 (注：包含优惠券购买)
     */
    public chargeMap: Object;

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
        this.registerMsg(moduleId, 1, this.recCreateOrder);
        // this.registerMsg(moduleId, 2, this.recDrawVipCardRewards);
        this.registerMsg(moduleId, 3, this.recChargeUseCoupon);
        this.registerMsg(moduleId, 4, this.recChargeRecord);
        this.registerMsg(moduleId, -1, this.pushChargeComplete);
        this.registerMsg(moduleId, -2, this.pushAddCurrency);
        this.registerMsg(moduleId, -3, this.pushRefundInfo);
    }

    /**初始化帐数据 */
    public initData(obj: Vo.order.ChargeRecordVo): void {
        if (!obj) return;
        this.chargeIds = obj.charges;
        this.monthTotalMoney = obj.monthTotalMoney;
        this.year = obj.year;
        this.month = obj.month;
        this.realChargeMap = obj.realChargeMap;
        this.chargeMap = obj.chargeMap;
    }

    /**获取当月累计消费 */
    public getMonthTotalMoney(): number {
        let date = new Date(TimeManager.serverNow);
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        if (month === this.month && year === this.year) {
            return this.monthTotalMoney;
        }
        return 0;
    }

    /*********************************协议发送*********************************/

    /**
     * 创建订单
     * 模块号：4	指令号：1
     */
    public sendCreateOrder(configId: string): void {
        let c2s = {} as Vo.order.CreateOrderC2S;
        c2s.goodsId = configId.toString();
        this.send(this.MODULE, 1, c2s, c2s);
    }

    // /**
    //  * 领取月卡奖励
    //  * 模块号：4	指令号：2
    //  */
    // public sendDrawVipCardRewards(): void {
    //     let c2s = {} as Vo.order.DrawVipCardRewardsC2S;
    //     this.send(this.MODULE, 2, c2s);
    // }

    /**
     * 使用宝券充值
     * 模块号：4	指令号：3
     */
    public sendChargeUseCoupon(): void {
        let c2s = {} as Vo.order.ChargeUseCouponC2S;
        this.send(this.MODULE, 3, c2s);
    }

    /**
     * 获取充值信息
     * 模块号：4	指令号：4
     */
    public sendChargeRecord(): void {
        this.send(this.MODULE, 4);
    }

    /*********************************协议监听*********************************/

    /**
     * 创建订单
     * 模块号：4	指令号：1
     */
    public recCreateOrder(data: Vo.order.CreateOrderS2C, c2s: Vo.order.CreateOrderC2S): void {
        if (data.code >= 0) {
            let content = data.content;

            if (SdkManager.ins().isEnable()) {
                let cfg: table.order.ChargeGoodsConfig = TableManager.getDataById(table.order.ChargeGoodsConfig, c2s.goodsId);
                let orderInfo: IPayOrder = {
                    goodsId: cfg.goodsId,
                    goodsName: cfg.goodsName,
                    amount: cfg.price,
                    currency: cfg.currencyCode,
                    orderId: content.serial.toString(),
                    serverId: ChooseServerModel.ins().serverVo.id.toString(),
                    serverName: ChooseServerModel.ins().serverVo.name,
                    roleId: GIns.playerModel.playerId.toString(),
                    roleName: GIns.playerModel.playerName,
                    roleLevel: GIns.formationMgr.getCommonLevel(),

                    extra: content.addition,
                };
                SdkManager.ins().pay(orderInfo);
            } else {
                this.emit(NotificationKey.GM_ORDER_CHARGE, c2s.goodsId);
            }
        }
    }

    // /**
    //  * 领取月卡奖励
    //  * 模块号：4	指令号：2
    //  */
    // public recDrawVipCardRewards(data: Vo.order.DrawVipCardRewardsS2C): void {
    //     if (data.code >= 0) {
    //         this.emit(NotificationKey.EVENT_GAIN_ITEM_POP_UP, data.content);
    //     }
    // }

    /**
     * 使用宝券充值
     * 模块号：4	指令号：3
     */
    public recChargeUseCoupon(data: Vo.order.ChargeUseCouponS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
        }
    }

    /**
     * 获取充值信息
     * 模块号：4	指令号：4
     */
    public recChargeRecord(data: Vo.order.ChargeRecordS2C): void {
        if (data.code >= 0) {
            this.initData(data.content);
        }
    }

    /*********************************协议推送*********************************/

    /**
     * 充值完成推送
     * 模块号：4	指令号：-1
     */
    public pushChargeComplete(s2c: Vo.order.ChargePushVo): void {
        //TODO 推送消息-在这里处理服务端返回的数据

        if (s2c.chargeIds) {
            this.chargeIds = s2c.chargeIds;
        }

        if (this.realChargeMap[s2c.chargeGoodsId]) {
            this.realChargeMap[s2c.chargeGoodsId] += 1;
        } else {
            this.realChargeMap[s2c.chargeGoodsId] = 1;
        }

        if (this.chargeMap[s2c.chargeGoodsId]) {
            this.chargeMap[s2c.chargeGoodsId] += 1;
        } else {
            this.chargeMap[s2c.chargeGoodsId] = 1;
        }

        let showItems = [];
        if (s2c.rewardResults?.length > 0) {
            showItems = showItems.concat(s2c.rewardResults);
        }
        if (s2c.additionalRewards?.length > 0) {
            showItems = showItems.concat(s2c.additionalRewards);
        }
        if (showItems.length > 0) {
            this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, showItems);
        }

        this.monthTotalMoney = s2c.monthTotalMoney;
        this.year = s2c.year;
        this.month = s2c.month;
        this.emit(NotificationKey.CHARGE_COMPLETE, s2c.chargeGoodsId);
    }

    /**
     * 推送货币增加
     * 模块号：4	指令号：-2
     */
    public pushAddCurrency(rewardVos: Array<Vo.reward.RewardResult>): void {
        this.emit(NotificationKey.EVENT_GAIN_ITEM_POP_UP, rewardVos);
    }

    /**
     * 推送退款扣费
     * 模块号：4	指令号：-3
     */
    public pushRefundInfo(costVos: Array<Vo.cost.CostItemResult>): void {
        this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, costVos);
    }
}
