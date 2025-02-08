import { TableManager } from "../../../../core/table/TableManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import GIns from "../../../GIns";
import { Attribute, AttributeType } from "../../attr/AttrEnum";
import { AttrData, AttrManager } from "../../attr/AttrManager";
import { EquipManager } from "../EquipManager";

/** 单个装备数据Vo */
export class EquipVo {
    /** 装备Vo  equipVoData */
    private _equipVoData: EquipVoData;
    private _cfg: table.equip.EquipConfig;

    private _equipSuitCfgs: table.equip.EquipSuitConfig[];

    private _score = 0;

    setEquipVoData(data: EquipVoData) {
        this._equipVoData = data;
        this._cfg = TableManager.getDataById(table.equip.EquipConfig, this._equipVoData.id);
    }

    /** 装备唯一id（后端id） */
    get severId() {
        if (!this._equipVoData) return null;
        return this._equipVoData.severId;
    }

    /** 装备id */
    get id() {
        if (!this._cfg) return null;
        return this._cfg.id;
    }

    /** 装备方案id， 0为未装备 */
    set planId(id: number) {
        this._equipVoData.planId = id;
    }
    get planId() {
        if (!this._equipVoData) return null;
        return this._equipVoData.planId;
    }

    /** 部位id */
    get posId() {
        if (!this._cfg) return null;
        return this._cfg.position;
    }

    /** 装备配置表 */
    get equipCfg() {
        if (!this._cfg) return null;
        return this._cfg;
    }

    /** 套装配置表，无套装则返回null */
    get equipSuitId() {
        if (!this._cfg) return null;
        return this._cfg.suitId;
    }

    /** 初始固定属性（一级属性） */
    get getBaseAttrs() {
        if (!this._cfg) return { type: 0, num: 0 };
        let str = this._cfg.baseAttrs.split(";")[0].split(":");

        let attrs = { type: str[0], num: Number(str[1]) };
        return attrs;
    }

    /**
     * 初始二级属性MAP,EquipAttrPoolConfig#id-属性值
     */
    get initSecondAttrMap(): EquipAttrData[] {
        let dataArr: EquipAttrData[] = [];

        if (this._equipVoData.data) {
            let keys = Object.keys(this._equipVoData.initSecondAttrMap);
            for (let key of keys) {
                let cfg = TableManager.getDataById(table.equip.EquipAttrPoolConfig, key);
                let qualityCfg;
                if (this.secondAttrRandomIdMap[key]) {
                    qualityCfg = TableManager.getDataById(table.equip.EquipAttrRandomConfig, this.secondAttrRandomIdMap[key]);
                }

                //兼容旧账号，找不到表就用最低品质
                let quality = qualityCfg && qualityCfg.quality ? qualityCfg.quality : 2;

                let data: EquipAttrData = {
                    type: cfg.attributeType as Attribute,
                    num: this._equipVoData.initSecondAttrMap[key],
                    quality: quality,
                };

                dataArr.push(data);
            }
        }

        //固定属性
        let equipFixedAttrs = GIns.equipMgr.getEquipFixedAttrs(this.id);
        if (equipFixedAttrs) {
            for (let attr of equipFixedAttrs) dataArr.push(attr);
        }

        return dataArr;
    }

    /**
     * 洗练增加的二级属性MAP,EquipAttrPoolConfig#id-洗练增加值
     */
    get washedSecondAttrMap() {
        return this._equipVoData.washedSecondAttrMap;
    }

    /**
     * 二级属性品质MAP,EquipAttrPoolConfig#id-EquipAttrRandomConfig#id,没有则使用最低品质,兼容旧数据
     */
    get secondAttrRandomIdMap() {
        return this._equipVoData.data.secondAttrRandomIdMap;
    }

    /** 获取当前套装 */
    public getSuitStr() {
        let suitId = this.equipSuitId;
        let num = EquipManager.ins().suitIds[suitId] || 0;
        let allNum = 0;
        let name = "";

        if (!this._equipSuitCfgs) this._equipSuitCfgs = TableManager.getAllData(table.equip.EquipSuitConfig);

        for (let cfg of this._equipSuitCfgs) {
            if (cfg.suitId == suitId) {
                name = cfg.suitName;
                allNum = cfg.activeCount;
            }
        }

        let str = name + "(" + num + "/" + allNum + ")";
        return str;
    }

    /** 装备评分 */
    get score() {
        if (this._score) return this._score;
        //装备评分X=∑（词条数值m*权重评分n)=m1*n1+m2*n2+……
        let attrs = this.allAttrs;
        for (let data of attrs) {
            if (data) {
                let cfg = TableManager.getDataById(table.battle.AttributeConfig, data.id);
                this._score += data.num * cfg.equipScore;
            }
        }
        return this._score;
    }

    /** 所有属性 */
    get allAttrs(): AttrData[] {
        let attrs: AttrData[] = [];

        //一级属性
        let attr1 = {
            id: this.getBaseAttrs.type as Attribute,
            num: this.getBaseAttrs.num,
        };
        let data = AttrManager.ins().convertDataFormat(attr1.id, attr1.num);
        attrs.push(data);

        //二级属性
        let attrMap: EquipAttrData[];
        // if (this.equipCfg.fixedSecondAttrs) {
        //     attrMap = EquipManager.ins().getEquipFixedAttrs(this.equipCfg.id);
        // } else {
        attrMap = this.initSecondAttrMap;
        // }
        for (let attr of attrMap) {
            let attr2 = {
                id: attr.type,
                num: attr.num,
            };
            data = AttrManager.ins().convertDataFormat(attr2.id, attr2.num);
            attrs.push(data);
        }

        return attrs;
    }
}

/**
 * 装备信息Vo
 * @author GameCreator
 */
export class EquipVoData {
    /**
     * 唯一ID
     */
    severId: number;

    /**
     * 配置ID
     */
    id: number;

    /**
     * 初始二级属性MAP,EquipAttrPoolConfig#id-属性值
     */
    initSecondAttrMap: Object;

    /**
     * 二级属性品质MAP,EquipAttrPoolConfig#id-EquipAttrRandomConfig#id,没有则使用最低品质,兼容旧数据
     */
    secondAttrRandomIdMap: Object;

    /**
     * 洗练增加的二级属性MAP,EquipAttrPoolConfig#id-洗练增加值
     */
    washedSecondAttrMap: Object;

    /**
     * 所属方案ID,没有装备则默认为0
     */
    planId: number;

    /**
     * 服务端EquipVo
     */
    data: Vo.equip.EquipVo;
}

export interface EquipAttrData {
    type: Attribute;
    num: number;
    quality?: number;
}
