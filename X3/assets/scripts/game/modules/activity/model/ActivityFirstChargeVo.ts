import G from "../../../../core/comm/G";
import { TableManager } from "../../../../core/table/TableManager";
import { BaseActivityVo } from "../../../comm/activity/model/BaseActivityVo";



/**首冲vo */
export class ActivityFirstChargeVo extends BaseActivityVo {

    /** 所有首充充值配置（tab） */
    private _chargeCfg: table.order.ChargeGoodsConfig[];

    /**当前首充的所有天数奖励*/
    private _chargeSceneCfg: table.activity.FirstCharge.FirstChargeConfig[];

    /**活动对应的vo数据  */
    public get activityVo(): Vo.activity.FirstChargeVo {
        return this.content as Vo.activity.FirstChargeVo;
    }

    /** 
     * 是购买首充 
     * @param id 充值商品id
     */
    public isFirstChargeById(id: number): boolean {
        // return this.activityVo.firstChargeType && this.activityVo.firstChargeType !== -1;
        for (let chargeId of this.activityVo.chargeIds) {
            if (id == +chargeId) {
                return true;
            }
        }
        return false;
    }

    /** 
     * 获取当前奖励的状态
     * 0：待领取
     * 1：可领取
     * 2：已领取
     * 3: 未购买
     */
    public isCanGetAwardById(id: number) {
        let state = 0;
        if (this.isCanDrawReward(id)) {
            state = 1;
        }
        if (this.isHadDrawReward(id)) {
            state = 2;
        }

        let cfg = TableManager.getDataById(table.activity.FirstCharge.FirstChargeConfig, id);
        if (!this.isFirstChargeById(+cfg.chargeGoodsId)) {
            state = 3;
        }

        return state;
    }

    /**更新奖励获取数据
     * @param rewardId 各个活动模块对应配置的奖励id
    */
    public updateRewardInfo(rewardId: number): void {
        this.activityVo.rewardIds.push(rewardId);
    }

    /**奖励是否可领取
     * @param rewardId 各个活动模块对应配置的奖励id
    */
    public isCanDrawReward(rewardId: string | number): boolean {
        let state = false;

        let cfg = TableManager.getDataById(table.activity.FirstCharge.FirstChargeConfig, rewardId);
        //累计登录天数
        let openDay = G.TimeManager.serverHaveOpenDay
        if (openDay >= cfg.day /**|| ConditionManager.ins().checkCondition(cfg.earlyVerifyModels)*/) {
            state = true;
        }

        return state;
    }

    /**奖励是否被领取
     * @param rewardId 各个活动模块对应配置的奖励id
    */
    public isHadDrawReward(rewardId: string | number): boolean {
        let state = false;
        //已领取的奖励Id列表
        for (let id of this.activityVo.rewardIds) {
            if (rewardId == id) {
                state = true;
            }
        }

        return state;
    }

    /**获取首充活动对应 chargeGoodsId 的界面展示配置 */
    public getSceneCfgByType(id: string): table.activity.FirstCharge.FirstChargeConfig[] {
        this._chargeSceneCfg = [];
        let tAll: table.activity.FirstCharge.FirstChargeConfig[] = TableManager.getAllData(table.activity.FirstCharge.FirstChargeConfig);
        for (let cfg of tAll) {
            if (cfg && cfg.chargeGoodsId == id)
                this._chargeSceneCfg.push(cfg);
        }
        return this._chargeSceneCfg;
    }

    /** 获取首充活动对应的所有充值配置 （tab页签数） */
    public get chargeCfgs(): table.order.ChargeGoodsConfig[] {
        if (!this._chargeCfg) {
            this._chargeCfg = [];
            let goodsIdMap: Map<string, boolean> = new Map();
            let allCfgs = G.TableManager.getAllData(table.activity.FirstCharge.FirstChargeConfig);
            allCfgs?.forEach((cfg) => {
                if (cfg.activityId == this.activityId) {
                    //只筛选当前活动的配置
                    if (goodsIdMap.has(cfg.chargeGoodsId) == false) {
                        goodsIdMap.set(cfg.chargeGoodsId, true);
                        let goodsCfg = G.TableManager.getDataById(table.order.ChargeGoodsConfig, cfg.chargeGoodsId);
                        if (goodsCfg) {
                            this._chargeCfg.push(goodsCfg);
                        }
                    }
                }
            });
        }
        return this._chargeCfg;
    }

    /** 获取当前tab展示的cfg */
    public get tabCfgs(): table.order.ChargeGoodsConfig[] {
        let allCfg = this.chargeCfgs;
        if (allCfg.length > 0) {
            if (this.isFirstChargeById(Number(allCfg[0].id))) {
                //第一个首充买了 那就都展示
                return allCfg
            } else {
                return [allCfg[0]]
            }
        }
        return []
        // for(let i=0; i<allCfg.length; i++){
        //     if(allCfg[i]){
        //         tabCfgs.push(allCfg[i]);
        //         if(!this.isFirstChargeById(Number(allCfg[i].id))){
        //             return tabCfgs;
        //         }
        //     }
        // }

        // return tabCfgs;
    }

    /**活动是否过期 */
    public isActivityOver(): boolean {

        if (!(this.endTime > G.TimeManager.serverNow)) {
            return true;
        }

        if (this.isDone()) {
            return true;
        }

        return false;
    }

    public isShowRed(): boolean {
        //写入对应活动的红点判断方法
        // if (this.isFirstCharge) {
        //     let cfgs: table.activity.FirstCharge.FirstChargeConfig[] = this.getSceneCfgByType(this.activityVo.firstChargeType);
        //     for (let i = 0; i < cfgs.length; i++) {
        //         let isCanDraw: boolean = this.isCanGetRewardByTypeAndDays(this.activityVo.firstChargeType, i + 1, cfgs[i].id);
        //         if (isCanDraw) return true;
        //     }
        // }
        return false;
    }

    public hasGoodsCanBuy(): boolean {
        let hasGoods: boolean = false;
        let allCfgs = this.chargeCfgs;
        for (let i = 0; i < allCfgs.length; i++) {
            if (!this.isFirstChargeById(Number(allCfgs[i].id))) {
                hasGoods = true;
                break;
            }
        }
        return hasGoods;
    }

}