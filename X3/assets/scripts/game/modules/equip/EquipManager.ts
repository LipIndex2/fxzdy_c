import BaseSingleton from "../../../core/base/BaseSingleton";
import G from "../../../core/comm/G";
import { TableManager } from "../../../core/table/TableManager";
import { StringUtils } from "../../../core/utils/StringUtils";
import NotificationKey from "../../event/NotificationKey";
import { Attribute, AttributeType } from "../attr/AttrEnum";
import { AttrData, AttrManager } from "../attr/AttrManager";
import { EquipModel } from "./EquipModel";
import { EquipPlanType } from "./enum/EquipEnum";
import { EquipSchemeVo } from "./vo/EquipSchemeVo";
import { EquipAttrData, EquipVo, EquipVoData } from "./vo/EquipVo";

/** 装备 */
export class EquipManager extends BaseSingleton {
    /**所有装备方案的数据 */
    private _schemeMap: { [key: number]: EquipSchemeVo } = {};
    /** 装备列表数据 */
    private _equipMap: { [id: number]: EquipVo } = {};
    private _equipVos: EquipVo[] = [];

    /** 装备位置data */
    private _posDataMap: { [id: number]: equipData } = {};
    private _posDatas: equipData[] = [];

    /** 当前使用的装备方案id */
    private _usePlanId: number = EquipPlanType.SCHEME_ONE;

    private _allSuitCfg: table.equip.EquipSuitConfig[];

    private _recycleQuliatys = [];

    constructor () {
        super();
        this.initPosition();
    }

    private initPosition() {
        let posCfg = TableManager.getAllData(table.equip.EquipPositionConfig);
        for (let cfg of posCfg) {
            let data: equipData = {
                id: cfg.id,
                isUnlock: false,
                equipId: null,
            };
            this._posDataMap[cfg.id] = data;
            this._posDatas.push(data);
        }
    }

    /** 登录下发 */
    public updateLoginVo(vo: Vo.equip.EquipLoginVo) {
        this._equipVos.length = 0;
        this._usePlanId = vo.usePlanId;
        this.updateEquipPositionData(vo.unlockPositionIds);

        for (let data of vo.equipVos) {
            if (data) {
                let equipVo = new EquipVo();
                let equipVoData: EquipVoData = {
                    severId: data.id,
                    id: data.baseId,
                    initSecondAttrMap: data.initSecondAttrMap,
                    secondAttrRandomIdMap: data.secondAttrRandomIdMap,
                    washedSecondAttrMap: data.washedSecondAttrMap,
                    planId: data.planId || 0,
                    data: data,
                };
                equipVo.setEquipVoData(equipVoData);
                this._equipMap[equipVoData.severId] = equipVo;
                this._equipVos.push(equipVo);

                if (equipVo.planId > 0 && equipVo.posId) {
                    this.updatePosData(equipVo.posId, equipVo.severId);
                }
            }
        }

        // console.log("装备");
        // console.log(vo);
    }

    /** 获得新装备 */
    public addEquip(data: any) {
        let equipVo = new EquipVo();
        let equipVoData: EquipVoData = {
            severId: data.id,
            id: data.baseId,
            initSecondAttrMap: data.initSecondAttrMap,
            secondAttrRandomIdMap: data.secondAttrRandomIdMap,
            washedSecondAttrMap: data.washedSecondAttrMap,
            planId: data.planId || 0,
            data: data,
        };
        equipVo.setEquipVoData(equipVoData);

        this._equipMap[equipVoData.severId] = equipVo;
        this._equipVos.push(equipVo);
    }

    /** 删除装备 */
    public deleteEquip(costItemResults: Array<Vo.cost.CostItemResult>) {
        for (let data of costItemResults) {
            let equipVo = this._equipMap[+data.contents];
            if (equipVo) {
                delete this._equipMap[+data.contents];
                this._equipVos.splice(this._equipVos.indexOf(equipVo), 1);
            }
        }
    }

    /** 激活装备位置 */
    public updateEquipPositionData(ids: Array<number>) {
        if (!ids) return;
        for (let id of ids) {
            this._posDataMap[id].isUnlock = true;
        }
    }

    /** 获取对应id的装备Vo */
    public getEquipVoById(id: number) {
        return this._equipMap[id];
    }

    /** 当前装备方案id */
    get userPlanId() {
        return this._usePlanId;
    }

    /**
     *
     * 获取 对应方案id的 装备Vos （已穿戴的）
     * @param planId    方案id
     * @param posId     部位id（不填则获取当前方案的所有部位装备）
     * @returns
     */
    public getEquipVosByPlanId(planId: number | EquipPlanType, posId?: number) {
        let equipVos: EquipVo[] = [];
        for (let vo of this._equipVos) {
            if (vo && vo.planId == planId) {
                if (posId) {
                    if (posId == vo.posId) {
                        equipVos.push(vo);
                    }
                } else {
                    equipVos.push(vo);
                }
            }
        }
        return equipVos;
    }

    /** 获取装备槽位datas[] */
    get allPosData(): equipData[] {
        return this._posDatas;
    }

    /** 分解筛选数组 */
    set recycleQuliatys(arr: number[]) {
        this._recycleQuliatys = arr;
    }
    get recycleQuliatys() {
        return this._recycleQuliatys;
    }

    /** 获取对应装备槽位id 的 data */
    public posDataById(id: number): equipData {
        return this._posDataMap[id];
    }

    /** 更新装备槽位的装备id */
    public updatePosData(posId: number, equipId: number) {
        let posVo = this.posDataById(posId);
        posVo.equipId = equipId;
    }

    /**
     * 获取对应posId的所有的装备 （不论是否穿戴）
     * @param posId 装备位置id
     */
    public getEquipVosByPosId(posId: number) {
        let equipVos: EquipVo[] = [];
        for (let vo of this._equipVos) {
            if (vo && vo.posId == posId) {
                equipVos.push(vo);
            }
        }

        //排序  正在装备最前》等级高》品质高
        equipVos.sort((a: EquipVo, b: EquipVo) => {
            if (a.planId != b.planId) {
                return b.planId - a.planId;
            }

            if (a.equipCfg.equipLevel !== b.equipCfg.equipLevel) {
                return b.equipCfg.equipLevel - a.equipCfg.equipLevel;
            }

            if (a.equipCfg.quality !== b.equipCfg.quality) {
                return b.equipCfg.quality - a.equipCfg.quality;
            }
        });

        return equipVos;
    }

    /** 获取当前方案的穿戴装备套装属性 */
    get suitAttrs() {
        let attrs = [];
        if (!this._allSuitCfg) this._allSuitCfg = TableManager.getAllData(table.equip.EquipSuitConfig);
        let suitMap = this.suitIds;
        let keys = Object.keys(suitMap);
        for (let k = 0; k < keys.length; k++) {
            let suitId = Number(keys[k]);
            for (let cfg of this._allSuitCfg) {
                if (cfg && cfg.suitId == suitId && suitMap[suitId] >= cfg.activeCount) {
                    let str = cfg.suitAttrs.split(";")[0].split(":");
                    let data = AttrManager.ins().convertDataFormat(str[0] as Attribute, Number(str[1]));
                    attrs.push(data);
                }
            }
        }
        return attrs;
    }

    /**当前方案的所有套装计数*/
    get suitIds() {
        let suitMap: { [suitId: number]: number } = {};
        for (let equipVo of this.getEquipVosByPlanId(this._usePlanId)) {
            if (equipVo && equipVo.equipSuitId) {
                if (suitMap[equipVo.equipSuitId]) {
                    suitMap[equipVo.equipSuitId] += 1;
                } else {
                    suitMap[equipVo.equipSuitId] = 1;
                }
            }
        }
        return suitMap;
    }

    /** 获取当前使用方案的总装备属性 */
    get allEquipAttrs() {
        let attrs: AttrData[] = [];
        let userEquipVo = this.getEquipVosByPlanId(this._usePlanId);
        for (let equipVo of userEquipVo) {
            if (equipVo) {
                for (let attr of equipVo.allAttrs) {
                    attrs.push(attr);
                }
            }
        }

        //套装属性
        for (let attr of this.suitAttrs) {
            if (attr) {
                attrs.push(attr);
            }
        }

        return attrs;
    }

    /** 单个装备槽位红点 */
    public posRedPoint(posId: number) {
        let userEquipVo = this.getEquipVosByPlanId(this.userPlanId, posId);
        let equipVos = this.getEquipVosByPosId(posId);
        if (userEquipVo.length == 0 && equipVos.length > 0) {
            return true;
        }

        for (let equipVo of equipVos) {
            if (equipVo && equipVo !== userEquipVo[0] && equipVo.score > userEquipVo[0].score) {
                return true;
            }
        }

        return false;
    }

    /** 判断某个装备是否比当前装备的装备评分高, 显示红点用 */
    public isEquipBetter(equipId: number) {
        let equipVo = this.getEquipVoById(equipId);
        let userEquipVo = this.getEquipVosByPlanId(this.userPlanId, equipVo.posId);
        if (userEquipVo.length == 0) {
            return true;
        }

        if (equipVo && equipVo !== userEquipVo[0] && equipVo.score > userEquipVo[0].score) {
            return true;
        }

        return false;
    }

    /** 获取所有装备，给背包显示用 */
    get getAllEquip() {
        return this._equipVos;
    }

    /** 获取所有可分解的装备 */
    get canRecycleEquip() {
        let equipVos = [];

        for (let vo of this.getAllEquip) {
            if (vo && vo.planId == 0) {
                equipVos.push(vo);
            }
        }

        equipVos.sort((a: EquipVo, b: EquipVo) => {
            if (a.equipCfg.quality != b.equipCfg.quality) {
                return b.equipCfg.quality - a.equipCfg.quality;
            }
            return b.equipCfg.id - a.equipCfg.id;
        });

        return equipVos;
    }

    /** 获取固定属性装备的属性和品质 */
    public getEquipFixedAttrs(id: number) {
        let cfg = TableManager.getDataById(table.equip.EquipConfig, id);
        let secondAttrs: EquipAttrData[] = [];
        if (cfg && cfg.fixedSecondAttrs) {
            //固定属性
            let fixStr = StringUtils.strToArr(cfg.fixedSecondAttrs, ";", ":");
            for (let i = 0; i < fixStr.length; i++) {
                let fixAttrs = { type: fixStr[i][0], num: Number(fixStr[i][1]) };
                if (fixAttrs.type) {
                    let data: EquipAttrData = {
                        type: fixAttrs.type,
                        num: fixAttrs.num,
                        quality: cfg.fixedSecondQuality[i],
                    };
                    secondAttrs.push(data);
                }
            }
        }
        return secondAttrs;
    }

    /** 根据套装id获取套装数据 */
    public SuitCfgsBySuitId(suitId: number) {
        let suitCfgs: table.equip.EquipSuitConfig[] = [];
        if (!this._allSuitCfg) this._allSuitCfg = TableManager.getAllData(table.equip.EquipSuitConfig);
        for (let cfg of this._allSuitCfg) {
            if (cfg && cfg.suitId == suitId) {
                suitCfgs.push(cfg);
            }
        }
        return suitCfgs;
    }

    /** ====================处理穿戴、卸下协议======================= */

    //临时数据 记录将要穿戴的装备id
    private _wearEquipId: number;
    /** 穿戴装备 */
    public wearEquip(equipId: number) {
        this._wearEquipId = equipId;
        EquipModel.ins().sendWearEquip({
            planId: this._usePlanId,
            equipId: this._wearEquipId,
        });
    }
    /** 穿戴成功 */
    public wearEquipSucceed(equipVos: Array<Vo.equip.EquipVo>) {
        for (let vo of equipVos) {
            if (vo) {
                let equipVo = this.getEquipVoById(vo.id);
                equipVo.planId = vo.planId;
                if (vo.planId > 0) this.updatePosData(equipVo.posId, equipVo.severId);
            }
        }
        // let equipVo = this.getEquipVoById(this._wearEquipId);
        // let oldEquipVo = this.getEquipVosByPlanId(this._usePlanId, equipVo.posId);
        // if(oldEquipVo && oldEquipVo[0]) oldEquipVo[0].planId = 0;
        // equipVo.planId = this._usePlanId;

        G.FacadeManager.emitNow(NotificationKey.FIGHT_UPDATE_ALL_HERO);
        G.FacadeManager.emit(NotificationKey.EQUIP_WEAR_EQUIP);
    }

    /** 一键穿戴 */
    public wearAllEquip() {
        for (let posData of this.allPosData) {
            if (posData.isUnlock) {
                let equipId;
                let score = 0;
                let equipVos = this.getEquipVosByPosId(posData.id);
                for (let equipVo of equipVos) {
                    if (equipVo.score > score && (equipVo.planId == this._usePlanId || !equipVo.planId)) {
                        score = equipVo.score;
                        equipId = equipVo.severId;
                    }
                }
                if (equipId && posData.equipId !== equipId) {
                    this.wearEquip(equipId);
                }
            }
        }
    }

    //当前使用装备的技能组
    public getEquipSkills() {
        let skillIds = [];
        if (!this._allSuitCfg) this._allSuitCfg = TableManager.getAllData(table.equip.EquipSuitConfig);
        let suitMap = this.suitIds;
        let keys = Object.keys(suitMap);
        for (let k = 0; k < keys.length; k++) {
            let suitId = Number(keys[k]);
            for (let cfg of this._allSuitCfg) {
                if (cfg && cfg.suitId == suitId && suitMap[suitId] >= cfg.activeCount) {
                    skillIds.push(cfg.skillId);
                }
            }
        }
        return skillIds;
    }
}

/** 装备Item的 data */
export interface equipData {
    /** 部位id */
    id: number;
    /** 装备槽位是否解锁, 显示装备时设置为true */
    isUnlock?: boolean;
    /** 装备唯一id */
    equipId?: number;
    /** 装备配置表一id */
    cfgId?: number;
}
