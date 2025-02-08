import GIns from "db://assets/scripts/game/GIns";
import G from "../../../../core/comm/G";
import {Logger} from "db://assets/scripts/core/log/Logger";
import {AttrUtils} from "db://assets/scripts/game/modules/attr/utils/AttrUtils";
import {AttrConfigEffect} from "../../attr/structs/AttrConfigEffect";

/**
 * 收藏品阶段累加属性
 * table.collectibles.CollectiblesConfig 里面 taskEffectType 跟 taskAttrId 任务特性相关的数据处理
 */
export class CollectionsTaskAttrCfg {
    /**
     *
     * @param collectionCfgId
     * @param star 指定星级，不指定的话旧获取当前收藏品的星级
     */
    static create(collectionCfgId: number, star?: number) {
        if (star == undefined) {
            let collVo = GIns.collectionsModel.context.getCollectionById(collectionCfgId);
            star = collVo?.star || 0
        }
        return new CollectionsTaskAttrCfg(collectionCfgId, star);
    }

    private _collectionCfgId: number
    private _star: number
    private _collCfg: table.collectibles.CollectiblesConfig
    private _collTaskCfg: table.collectibles.CollectiblesTaskAttrConfig

    private _attr: AttrConfigEffect
    get attr() {
        if (this._attr !== undefined) {
            this._attr = AttrUtils.parseKvArrayToOneAttr(this._collTaskCfg.baseAttrs);
        }
        return this._attr;
    }

    constructor(collectionCfgId: number, star: number) {
        this._collectionCfgId = collectionCfgId;
        this._star = star;

        this._collCfg = G.TableManager.getDataById(table.collectibles.CollectiblesConfig, collectionCfgId);
        if (this._collCfg.taskAttrId) {
            let taskEffCfg = G.TableManager.getDataById(table.collectibles.CollectiblesTaskAttrConfig, this._collCfg.taskAttrId)
            if (taskEffCfg) {
                this._collTaskCfg = taskEffCfg
            } else {
                Logger.error(`collectibles.CollectiblesTaskAttrConfig 找不到数据 id：${this._collCfg.taskAttrId}`);
            }
        }
    }

    //==================================================================================================================================
    //region 条件判断
    /**
     * 当前收藏品是否有任务特性
     */
    isHasTaskAttr() {
        return !!this._collTaskCfg;
    }

    //==================================================================================================================================
    //region 数据获取
    /**
     * 获取属性名
     */
    getAttrName() {
        if (this.attr) {
            return this.attr.config.attrName;
        }
        return "";
    }

    /**
     * 获取现在阶段的属性值
     */
    getCurValue() {
        if (!this.attr) {
            return 0;
        }

        let curProgress = GIns.collectionsModel.context.getTaskProgress(this._collTaskCfg.id);
        return this.attr.value * Math.min(curProgress, this._collTaskCfg.validLimit);
    }

    /**
     * 获取单阶段属性值
     */
    getOneValue() {
        if (!this.attr) {
            return 0;
        }

        return this.attr.value;
    }

    /**
     * 获取满阶段属性值
     */
    getMaxValue() {
        if (!this.attr) {
            return 0;
        }

        return this.attr.value * this._collTaskCfg.validLimit;
    }
}

// one?: AttrConfigEffect  //单阶段属性
//                 max?: AttrConfigEffect  //
//                 cur?: AttrConfigEffect  //当前阶段属性