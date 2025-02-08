import { TableManager } from "../../../core/table/TableManager";
import GIns from "../../GIns";
import { AttrData } from "../attr/AttrManager";
import { NoOwnerItem } from "../backpack/vo/NoOwnerItem";

/**
 * 魔方Vo
 */
export class MagicCubeVo {
    /** 魔方id */
    id: number;
    /** 英雄id */
    heroId: number;
    /** 转换魔方id */
    convertCubeId: number;
    /** 魔方等级 */
    level: number;
    /** 魔方品质 */
    quality: number;

    /** 魔方配置表 */
    cubeCfg: table.magiccube.MagicCubeConfig;
    /** 魔方当前等级配置表 */
    levelCfg: table.magiccube.MagicCubeLevelConfig;
    /** 魔方当前品质配置表 */
    qualityCfg: table.magiccube.MagicCubeQualityConfig;

    /** 魔方图标 */
    icon: string;

    private _allLevelCfg: table.magiccube.MagicCubeLevelConfig[];

    /** 设置魔方Vo */
    public setData(vo: Vo.magiccube.MagicCubeVo) {
        if (!vo) return;
        this.heroId = vo.id;
        this.id = vo.cubeId;
        this.convertCubeId = vo.convertCubeId;
        this.level = vo.level;

        this.cubeCfg = TableManager.getDataById(table.magiccube.MagicCubeConfig, this.id);
        this.quality = this.cubeCfg.quality;
        this.qualityCfg = TableManager.getDataById(table.magiccube.MagicCubeQualityConfig, this.quality);
        this.updateLevelCfg();
    }

    //更新魔方等级配置表
    private updateLevelCfg() {
        if (!this._allLevelCfg) {
            this._allLevelCfg = TableManager.getAllData(table.magiccube.MagicCubeLevelConfig);
        }
        for (let cfg of this._allLevelCfg) {
            if (cfg.level == this.level && cfg.quality == this.quality) {
                this.levelCfg = cfg;
            }
        }
    }

    //判断当前品质魔方是否有下一级
    public isHaveNextLevel() {
        if (!this._allLevelCfg) {
            this._allLevelCfg = TableManager.getAllData(table.magiccube.MagicCubeLevelConfig);
        }
        for (let cfg of this._allLevelCfg) {
            if (cfg.level == this.level + 1 && cfg.quality == this.quality) {
                return true;
            }
        }
        return false;
    }

    /** 判断魔方是否满级 */
    public isMaxLevel() {
        if (this.isHaveNextLevel()) return false;

        if (!this._allLevelCfg) {
            this._allLevelCfg = TableManager.getAllData(table.magiccube.MagicCubeLevelConfig);
        }
        for (let cfg of this._allLevelCfg) {
            if (cfg.quality == this.quality + 1) {
                return false;
            }
        }

        return true;
    }

    /** 获取当前属性 */
    public getAttr() {
        let attrs: AttrData[] = [];
        for (let attr1 of this.cubeCfg.baseAttrs) {
            let attrdat = GIns.attrMgr.convertDataFormat(attr1.k, attr1.v);
            attrs.push(attrdat);
        }
        for (let attr2 of this.cubeCfg.growUpAttrs) {
            let attrdat = GIns.attrMgr.convertDataFormat(attr2.k, attr2.v * this.level);
            if (attrdat.num > 0) {
                attrs.push(attrdat);
            }
        }
        attrs = this.mergeAttr(attrs);
        // console.log(`${this.heroId}的魔方属性：`);
        // console.log(attrs);
        return attrs;
    }

    /** 获取下一级属性(锁定情况) */
    public getNextLevelAttr() {
        let attrs: AttrData[] = [];
        if (this.isHaveNextLevel()) {
            for (let attr1 of this.cubeCfg.baseAttrs) {
                let attrdat = GIns.attrMgr.convertDataFormat(attr1.k, attr1.v);
                attrs.push(attrdat);
            }
            for (let attr2 of this.cubeCfg.growUpAttrs) {
                let attrdat = GIns.attrMgr.convertDataFormat(attr2.k, attr2.v * (this.level + 1));
                if (attrdat.num > 0) {
                    attrs.push(attrdat);
                }
            }
        } else if (this.cubeCfg.advancedCubeId) {
            let cfg = TableManager.getDataById(table.magiccube.MagicCubeConfig, this.cubeCfg.advancedCubeId);
            for (let attr1 of cfg.baseAttrs) {
                let attrdat = GIns.attrMgr.convertDataFormat(attr1.k, attr1.v);
                attrs.push(attrdat);
            }
        }
        attrs = this.mergeAttr(attrs);
        return attrs;
    }

    /** 转换属性 */
    public getConvertAttr(): AttrData[] {
        if (!this.convertCubeId) return [];
        let attrs: AttrData[] = [];
        let cfg = TableManager.getDataById(table.magiccube.MagicCubeConfig, this.convertCubeId);
        for (let attr1 of cfg.baseAttrs) {
            let attrdat = GIns.attrMgr.convertDataFormat(attr1.k, attr1.v);
            attrs.push(attrdat);
        }
        for (let attr2 of cfg.growUpAttrs) {
            let attrdat = GIns.attrMgr.convertDataFormat(attr2.k, attr2.v * this.level);
            if (attrdat.num > 0) {
                attrs.push(attrdat);
            }
        }
        attrs = this.mergeAttr(attrs);
        return attrs;
    }

    //合并属性
    private mergeAttr(attrs: AttrData[]) {
        let newAttrs: AttrData[] = [];
        for (let attr of attrs) {
            let isHave = false;
            for (let newAttr of newAttrs) {
                if (attr.id == newAttr.id) {
                    isHave = true;
                    newAttr.num += attr.num;
                }
            }
            if (!isHave) {
                newAttrs.push(attr);
            }
        }
        return newAttrs;
    }

    /** 当前魔方名字 */
    public get name() {
        return this.cubeCfg ? this.cubeCfg.name : "";
    }

    /** 当前魔方图片 */
    public get cubeIcon() {
        return this.cubeCfg ? this.cubeCfg.icon : this.unknowCubeIcon;
    }

    /** 获取转换后的魔方的图片 */
    public get convertCubeIcon() {
        if (this.convertCubeId) {
            let cfg = TableManager.getDataById(table.magiccube.MagicCubeConfig, this.convertCubeId);
            return cfg.icon;
        } else {
            return this.unknowCubeIcon;
        }
    }

    /** 获取下一级的魔方图片 */
    public get nextCubeIcon() {
        if (this.isHaveNextLevel()) {
            return this.cubeIcon;
        } else {
            let cfg = TableManager.getDataById(table.magiccube.MagicCubeConfig, this.cubeCfg.advancedCubeId);
            if (cfg) {
                return cfg.icon;
            }
        }

        return null;
    }

    /** 获取未知魔方图片 */
    public get unknowCubeIcon() {
        return "image/item/MF_999";
    }

    /**
     * 升级消耗
     * @param isLock 是否锁定
     */
    public getUpCost(isLock: boolean) {
        if (!this.levelCfg) {
            console.error("魔方配置表错误,找不到魔方当前等级配置表!!!!");
            return [];
        }
        if (!this.levelCfg.upLevelCosts) {
            console.error("魔方配置表错误,找不到魔方当前等级配置表!!!!");
            return [];
        }
        let items = [];
        for (let item of this.levelCfg.upLevelCosts) {
            items.push(item);
        }
        if (isLock) {
            for (let item2 of this.levelCfg.lockedCosts) {
                items.push(item2);
            }
        }
        return items;
    }

    /** 是否可以升级 */
    public isCanUp(isLock: boolean) {
        if (this.isMaxLevel()) return false;
        for (let item of this.getUpCost(isLock)) {
            let itemData = NoOwnerItem.create(item.k, item.v);
            if (!itemData.isCanPay()) return false;
        }
        return true;
    }

    /**
     * 转换消耗
     */
    public getConvertCost() {
        let items = [];
        for (let item of this.levelCfg.convertCosts) {
            items.push(item);
        }
        return items;
    }

    /** 是否可以转换 */
    public isCanConvert() {
        for (let item of this.getConvertCost()) {
            let itemData = NoOwnerItem.create(item.k, item.v);
            if (!itemData.isCanPay()) return false;
        }
        return true;
    }
}
