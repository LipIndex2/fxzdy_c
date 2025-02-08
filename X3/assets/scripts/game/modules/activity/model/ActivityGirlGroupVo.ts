import { TableManager } from "../../../../core/table/TableManager";
import { BaseActivityVo } from "../../../comm/activity/model/BaseActivityVo";
import GIns from "../../../GIns";

/**
 * 女团vo
 */
export class ActivityGirlGroupVo extends BaseActivityVo {
    /**活动对应的vo数据  */
    public get activityVo(): Vo.activity.GirlGroupVo {
        return this.content as Vo.activity.GirlGroupVo;
    }

    /** 玩家信息 */
    private _playerVo: Vo.activity.GirlGroupPlayerVo;

    /** 女团配置 */
    private _cfg: table.activity.GirlGroup.GirlGroupConfig;
    /** 女团礼包配置 */
    private _goodsCfgs: table.activity.GirlGroup.GirlGroupGoodsConfig[];
    /** 女团加赠配置 */
    private _rewardCfgs: table.activity.GirlGroup.GirlGroupRewardConfig[];
    /** 女团展示模型配置 */
    private _showModelCfgs: table.activity.GirlGroup.GirlGroupModelConfig[];

    /** 总购买次数 */
    private _totalBuyNum: number;
    /** 已购买商品id列表 */
    private _buyGoodsIds: number[];
    /** 已领取奖励id列表 */
    private _rewardIds: number[];

    /** 女团配置 */
    public get cfgs(): table.activity.GirlGroup.GirlGroupConfig {
        if (!this._cfg) {
            this._cfg = TableManager.getDataById(table.activity.GirlGroup.GirlGroupConfig, this.activityId);
        }
        return this._cfg;
    }

    /** 女团礼包配置 */
    public get goodsCfgs(): table.activity.GirlGroup.GirlGroupGoodsConfig[] {
        if (!this._goodsCfgs) {
            this._goodsCfgs = [];
            let cfgs = TableManager.getAllData(table.activity.GirlGroup.GirlGroupGoodsConfig);
            for (let cfg of cfgs) {
                if (cfg && cfg.activityId == this.activityId) {
                    this._goodsCfgs.push(cfg);
                }
            }
        }
        return this._goodsCfgs;
    }

    /** 女团加赠配置 */
    public get rewardCfgs(): table.activity.GirlGroup.GirlGroupRewardConfig[] {
        if (!this._rewardCfgs) {
            this._rewardCfgs = [];
            let cfgs = TableManager.getAllData(table.activity.GirlGroup.GirlGroupRewardConfig);
            for (let cfg of cfgs) {
                if (cfg && cfg.activityId == this.activityId) {
                    this._rewardCfgs.push(cfg);
                }
            }
        }
        return this._rewardCfgs;
    }

    /** 女团展示模型配置 */
    public get showModelCfgs(): table.activity.GirlGroup.GirlGroupModelConfig[] {
        if (!this._showModelCfgs) {
            this._showModelCfgs = [];
            let cfgs = TableManager.getAllData(table.activity.GirlGroup.GirlGroupModelConfig);
            for (let cfg of cfgs) {
                if (cfg && cfg.activityId == this.activityId) {
                    this._showModelCfgs.push(cfg);
                }
            }
        }
        return this._showModelCfgs;
    }

    /** 获取普通奖励 */
    public get getNormalRewardCfgs(): table.activity.GirlGroup.GirlGroupRewardConfig[] {
        let cfgs: table.activity.GirlGroup.GirlGroupRewardConfig[] = [];
        for (let cfg of this.rewardCfgs) {
            if (cfg && !cfg.isAllRewards) {
                cfgs.push(cfg);
            }
        }
        return cfgs;
    }

    /** 获取全服奖励配置 */
    public get allPeopleRewardCfg(): table.activity.GirlGroup.GirlGroupRewardConfig {
        for (let cfg of this.rewardCfgs) {
            if (cfg && cfg.isAllRewards) {
                return cfg;
            }
        }
        return null;
    }

    public updatePlayerVo(playerVo: Vo.activity.GirlGroupPlayerVo) {
        this.playerVo = playerVo;
        this.buyGoodsIds = playerVo.goodsIds;
        this.rewardIds = playerVo.rewardIds;
    }

    /** 玩家信息 */
    public set playerVo(playerVo: Vo.activity.GirlGroupPlayerVo) {
        this._playerVo = playerVo;
    }
    public get playerVo(): Vo.activity.GirlGroupPlayerVo {
        if (!this._playerVo) this._playerVo = this.activityVo.playerVo;
        return this._playerVo;
    }

    /** 当前活动开启天数 */
    public get openDay(): number {
        return this.getPassDays();
    }

    /** 礼包map：{day:[cfgs]} */
    public get goodsMap(): { [day: number]: table.activity.GirlGroup.GirlGroupGoodsConfig[] } {
        let map: { [day: number]: table.activity.GirlGroup.GirlGroupGoodsConfig[] } = {};
        for (let i = 0; i < this.goodsCfgs.length; i++) {
            let cfg = this.goodsCfgs[i];
            if (!map[cfg.conditionId]) {
                map[cfg.conditionId] = [];
            }
            map[cfg.conditionId].push(cfg);
        }
        return map;
    }

    /** 总购买次数 */
    public set totalBuyNum(value: number) {
        this._totalBuyNum = value;
    }
    public get totalBuyNum(): number {
        if (!this._totalBuyNum) {
            this._totalBuyNum = this.activityVo.totalBuyNum;
        }
        return this._totalBuyNum;
    }

    /** 已购买商品id列表 */
    public set buyGoodsIds(value: number[]) {
        this._buyGoodsIds = value;
    }
    public get buyGoodsIds(): number[] {
        if (!this._buyGoodsIds) {
            this._buyGoodsIds = this.activityVo.playerVo.goodsIds;
        }
        return this._buyGoodsIds;
    }

    /** 判断是否已购买礼包 */
    public isBuyGoods(goodsId: number): boolean {
        if (this.buyGoodsIds.indexOf(goodsId) >= 0) {
            return true;
        }
        return false;
    }

    /** 判断是否已购买某天的礼包 */
    public isBuyGoodsByDay(day: number) {
        let cfgs = this.goodsMap[day];
        for (let cfg of cfgs) {
            if (cfg && this.isBuyGoods(+cfg.id)) {
                return true;
            }
        }

        return false;
    }

    /** 已领取奖励id列表 */
    private set rewardIds(value: number[]) {
        this._rewardIds = value;
    }
    public get rewardIds(): number[] {
        if (!this._rewardIds) {
            this._rewardIds = this.activityVo.playerVo.rewardIds;
        }
        return this._rewardIds;
    }

    public addRewardId(id: number) {
        this._rewardIds.push(id);
    }

    /** 获取全服奖励礼包状态 0:不可领取，1：可领取，2：已领取 */
    public getAwardStatus(cfg: table.activity.GirlGroup.GirlGroupRewardConfig): number {
        if (!cfg) return 0;
        let data = cfg;
        let state = 0;
        if (this.totalBuyNum >= data.buyGoodsNumLimit) {
            if (!cfg.needBuyAnyGoods) {
                state = 1;
            } else {
                if (this.buyGoodsIds.length >= 1) {
                    state = 1;
                }
            }
        }
        if (this.rewardIds.indexOf(data.id) >= 0) state = 2;
        return state;
    }

    /** 红点 */
    public isShowRed(): boolean {
        if (!this.playerVo.gainDailyReward) return true;

        let cfgs = this.rewardCfgs;
        for (let cfg of cfgs) {
            let isShow = this.getAwardStatus(cfg) == 1;
            if (isShow) {
                return true;
            }
        }

        return false;
    }
}
