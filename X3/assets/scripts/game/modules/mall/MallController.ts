import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import G from "../../../core/comm/G";
import { BackpackManager } from "../backpack/BackpackManager";
import { OrderModel } from "../order/OrderModule";
import { MallModel } from "./model/MallModel";
import GIns from "../../GIns";

/**商城控制器 处理购买商品逻辑*/
export class MallController extends BaseController {

    listenNotifications(): string[] {
        return [
        ];
    }


    notificationHandler(event: string, args?: any): void {

    }

    onInit(): void {

    }

    /**购买商品*/
    public buyMallById(mallId: number, advert:boolean = false): void {
        let cfg = G.TableManager.getDataById(table.mall.MallGoodsConfig, mallId)
        if (cfg) {
            this.buyMall(cfg, advert)
        } else {
            console.error(`[mall] 购买商品id对应配置不存在 id = ${mallId}`);
        }
    }

    /**根据配置购买商品*/
    public buyMall(cfg: table.mall.MallGoodsConfig, advert:boolean = false): void {
        if (cfg.chargeGoodsId) {
            //直充商品
            OrderModel.ins().sendCreateOrder(cfg.chargeGoodsId)
        } else {
            let mallData = MallModel.ins().getMallData(cfg.id)
            if (mallData) {
                if (!mallData.costCfg.costItems)
                    MallModel.ins().sendBuy({ goodsId: cfg.id, advert:advert })
                else {
                    if (GIns.backpackMgr.isCanPayTheseItemArrayByConfig(mallData.costCfg.costItems, true)) {
                        MallModel.ins().sendBuy({ goodsId: cfg.id, advert:advert })
                    }
                }
            }
        }
    }
}
MallController.ins().doInit();