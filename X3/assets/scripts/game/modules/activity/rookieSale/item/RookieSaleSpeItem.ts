import { ActivityMallBuyConfigData } from "db://assets/scripts/game/modules/activity/model/ActivityMallModelVo";
import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { UIManager } from "../../../../../core/mvc/UIManager";
import { GameTimer } from "../../../../../core/timer/GameTimer";
import { ActivityModel, ActivitySyncData } from "../../../../comm/activity/model/ActivityModel";
import { ChargeController } from "../../../charge/ChargeController";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";
import { ModelNode } from "../../../common/node/ModelNode";
import { HeroManager } from "../../../hero/HeroManager";
import { BoxFixedRewardItemConfigVo } from "../../../item/structs/BoxFixedRewardItemConfigVo";
import { ItemUtils } from "../../../item/utils/ItemUtils";
import { HeroItemTipsViewOpenArgs } from "../../../itemDetails/HeroItemTipsView";
import { UIViewItemDetailsKey } from "../../../itemDetails/UIViewItemDetailsKey";
import { OrderModel } from "../../../order/OrderModule";
import { ActivityMallModelVo } from "../../model/ActivityMallModelVo";

/** 新手特殊特惠item */
export class RookieSaleSpeItem extends fgui.GComponent {
    static pkgName: string = "activityRookieSale";
    static viewName: string = "RookieSaleSpeItem";

    protected _cfgData: ActivityMallBuyConfigData = null
    protected _vo: ActivityMallModelVo = null
    protected _rewards: { k: any, v: any }[] = null
    private _modelNode: ModelNode;
    private _showList = [];
    private isBuyMax = false;

    private get view(): ui.activityRookieSale.item.RookieSaleSpeItem {
        return this as any;
    }

    protected onConstruct(): void {
        this.view.listReward.setVirtual()
        this.view.listReward.itemRenderer = this.itemRendererForReward.bind(this)
        for (let i = 0; i < 5; i++) {
            this.view[`item_${i}`].onClick(this.onClickShow.bind(this, i), this)
        }
        this.view.btn_buy.onClick(this.onClickDraw, this)
        this.view.modelNode.onClick(this.onClickDemo, this)
    }

    protected onPreDispose() {
        GameTimer.ins().clear(this, this.showHeroModel); //清除定时器
    }

    protected itemRendererForReward(index: number, item: ItemFrameBtn): void {
        item.reset(this._rewards[index].k, this._rewards[index].v)
        if (this._cfgData.orderCfg?.effects && !this.isBuyMax) {
            item.playOtherEffect(this._cfgData.orderCfg.effects[index])
        }
        else
            item.clearAnim()
    }

    protected onClickDraw(): void {
        if (this._vo.isBuyMax(this._cfgData.cfg.id)) {
            return;
        }
        if (this._cfgData.orderCfg) {
            OrderModel.ins().sendCreateOrder(this._cfgData.orderCfg.id)
        } else {
            let data = {
                activityId: this._cfgData.cfg.activityId,
                itemId: this._cfgData.cfg.id + '',
                hidePopWin: 2,
            } as ActivitySyncData;
            ActivityModel.ins().sendDrawItemReward(data)
        }
    }

    protected onClickGoto(): void {
        ChargeController.ins().openChargeMainView()
    }

    public setData(cfgData: ActivityMallBuyConfigData, vo: ActivityMallModelVo): void {
        this._cfgData = cfgData;
        this._vo = vo;
        if (!cfgData) {
            return;
        }

        if (cfgData.orderCfg) {
            this.view.lb_red.text = this.view.lb_red2.text = this.view.lb_yellew.text = cfgData.orderCfg.goodsName
        } else if (cfgData.costCfg) {
            this.view.lb_red.text = this.view.lb_red2.text = this.view.lb_yellew.text = cfgData.costCfg.name
        }
        if (cfgData.cfg.quality == 7) {
            //红彩
            this.view.getController('quality').selectedIndex = 2
        } else if (cfgData.cfg.quality == 6) {
            //红色
            this.view.getController('quality').selectedIndex = 1
        } else {
            this.view.getController('quality').selectedIndex = 0
        }

        this.isBuyMax = vo.isBuyMax(cfgData.cfg.id);
        let buyNum = vo.getBuyCount(cfgData.cfg.id)
        let buyLimit = cfgData.cfg.buyLimit;
        this.view.lb_limit.text = `限购：${buyLimit - buyNum}/${buyLimit}`;

        if (this.isBuyMax) {
            this.view.getController('costStyle').selectedIndex = 0;
            this._rewards = cfgData.orderCfg.rewards
            this.view.lb_price.text = '售罄';
            this.view.lb_sym.visible = false;
            this.view.img_gray.visible = true;
            this.view.img_gray.sortingOrder = 6;
            // this.view.lb_limit.text = "限购：0/1";
        } else {
            this._rewards = cfgData.orderCfg.rewards
            if (cfgData.orderCfg) {
                //是充值商品
                this.view.getController('costStyle').selectedIndex = 0;
                this.view.lb_price.text = cfgData.orderCfg.price / 100 + "";
                this.view.lb_sym.text = "元";
                this.view.lb_sym.visible = true;
            } else {
                if (cfgData.costCfg.costs == null) {
                    this.view.getController('costStyle').selectedIndex = 1;
                } else {
                    this.view.getController('costStyle').selectedIndex = 2;
                    let cfg = ItemUtils.getItemConfigByItemId(cfgData.costCfg.costs[0].k);
                    this.view.iconCost.icon = cfg ? cfg.smallIconPath : '';
                    this.view.lbCost.text = cfgData.costCfg.costs[0].v;
                }
            }
            // this.view.lb_limit.text = "限购：1/1";
            this.view.img_gray.visible = false;
        }

        this.view.lb_dis.text = cfgData.cfg.discountShow + "%";
        this.view.listReward.numItems = this._rewards.length;
        let itemId = this._rewards[0].k;

        this._modelNode = this.view.modelNode as ModelNode;
        this._modelNode.setScale(2.5, 2.5);
        this._showList = this.getShowList(itemId);

        this.initShowListPos();
        this.showHeroModel();

        if (this.isBuyMax) {
            // this.view.grayed = true;
            // this._modelNode.spineNode.setColor(Color.GRAY);
            this._modelNode.setLoadCompleteListener(() => {
                this._modelNode.gotoAndStop(1);
            })
            // FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).resetListCell(EnumRedDotShowType.REWARD, false)
        } else {
            // this.view.grayed = false;
            // FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).resetListCell(EnumRedDotShowType.REWARD, remainNum > 0 && cfgData.freeCfg != null)
        }
    }

    public red_pos_list = [26, 78, 130, 182, 234];

    /**初始化显示界面的英雄图标 */
    public initShowListPos() {
        for (let i in this._showList) {
            let item: ui.activityRookieSale.item.RookieSaleShowItem = this.view[`item_${i}`];
            if (item) {
                let showData = this._showList[i];
                const itemConfig = G.TableManager.getDataById(table.item.ItemConfig, showData.itemId);
                if (!itemConfig) {
                    break;
                }

                item.img_item.icon = itemConfig.iconPath;
                // 品质
                const qualityConfig = G.TableManager.getDataById(table.quality.QualityConfig, itemConfig.quality);
                if (qualityConfig) {
                    item.img_frame.icon = qualityConfig.itemQualityBgPath;
                }
            }
        }
    }

    /**更新界面轮播显示 */
    public showTween() {
        let idx = this.showIdx % this._showList.length;
        for (let i = 0; i < 5; i++) {
            this.view[`item_${i}`].visible = false;
        }
        if (this._showList.length <= 0) {
            return;
        }

        if (this._showList.length == 4) {
            let getYellowPos = (showIdx) => {
                return 20 + 70 * showIdx + (showIdx == idx ? 0 : showIdx > idx ? 8 : -8);
            }
            for (let i in this._showList) {
                let item: ui.activityRookieSale.item.RookieSaleShowItem = this.view[`item_${i}`];
                if (item) {
                    item.visible = true;
                    item.x = getYellowPos(Number(i));
                    item.scaleX = item.scaleY = Number(i) == idx ? 1 : 0.75;
                    item.btn_show.visible = Number(i) == idx;
                    item.sortingOrder = 4 - Math.abs(idx - Number(i));
                }
            }
        } else {
            for (let i in this.red_pos_list) {
                let item: ui.activityRookieSale.item.RookieSaleShowItem = this.view[`item_${i}`];
                if (item) {
                    item.visible = true;
                    item.x = this.red_pos_list[i];
                    item.scaleX = item.scaleY = Number(i) == idx ? 1 : 0.75;
                    item.btn_show.visible = Number(i) == idx;
                    item.sortingOrder = 5 - Math.abs(idx - Number(i));
                }
            }
        }
    }

    public showIdx = -1;

    public showHeroModel() {
        if (this._showList.length > 0) {
            let heroId = this._showList[(++this.showIdx % this._showList.length)].itemId;
            let heroVo = HeroManager.ins().getHeroVoByID(heroId);
            this._modelNode.loadByModelId(heroVo.heroCfg.showModelId);
            this.showTween();
            GameTimer.ins().once(5000, this, this.showHeroModel); //定时器会自动覆盖
        } else {
            this.showTween();
        }
    }

    public onClickShow(idx) {
        this.showIdx = idx - 1;
        this.showHeroModel();
        this.onClickDemo();
    }


    protected onClickDemo(): void {
        if (this._showList.length > 0) {
            let heroId = this._showList[(this.showIdx % this._showList.length)].itemId;
            // G.UIManager.open(UIActivityKey.FirstChargeDemoWin, heroId)
            let itemConfig = G.TableManager.getDataById(table.item.ItemConfig, heroId);
            UIManager.ins().open(UIViewItemDetailsKey.HeroCardDetails, {
                itemConfig: itemConfig,
            } as HeroItemTipsViewOpenArgs);
        }
    }

    private getShowList(id) {
        // 固定奖励宝箱
        const boxFixedRewardConfig = G.TableManager.getAllData(table.item.ItemBoxConfig)
            .toDataStream()
            .filter((it) => it.itemId == id)
            .first()

        if (!boxFixedRewardConfig) {
            return []
        }

        if (!boxFixedRewardConfig.rewards) {
            G.Logger.warn(`道具id 的箱子奖励为空! itemId = ${id}`)
            return []
        }
        return boxFixedRewardConfig.rewards.toDataStream()
            .map((it) => {
                const itemId = it.k as number;
                const amount = it.v as number;
                return BoxFixedRewardItemConfigVo.create(itemId, amount)
            })
            .toArray()
    }
}