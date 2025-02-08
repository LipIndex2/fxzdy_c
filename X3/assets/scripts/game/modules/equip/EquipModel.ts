import G from "../../../core/comm/G";
import { BaseModel } from "../../../core/mvc/model/BaseModel";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { EquipManager } from "./EquipManager";

/**
 * 装备模块
 * @author GameCreator
 */
export class EquipModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 31;

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
        this.registerMsg(moduleId, 1, this.recWearEquip);
        this.registerMsg(moduleId, 2, this.recWashEquip);
        this.registerMsg(moduleId, 3, this.recDecomposeEquip);
        this.registerMsg(moduleId, 4, this.recChangePlan);
        this.registerMsg(moduleId, -1, this.pushEquipPositionUnlock);
    }

    public initData(vo: Vo.equip.EquipLoginVo) {
        EquipManager.ins().updateLoginVo(vo);
    }

    /*********************************协议发送*********************************/
    /**
     * 穿戴装备
     * 模块号：31	指令号：1
     */
    public sendWearEquip(c2s: Vo.equip.WearEquipC2S): void {
        this.send(this.MODULE, 1, c2s, c2s);
    }

    /**
     * 装备洗练
     * 模块号：31	指令号：2
     */
    public sendWashEquip(): void {
        let c2s = {} as Vo.equip.WashEquipC2S;
        this.send(this.MODULE, 2, c2s);
    }

    /**
     * 装备分解
     * 模块号：31	指令号：3
     * @ignore equipIds装备唯一ID集合
     */
    public sendDecomposeEquip(equipIds: Array<number>): void {
        let c2s = {} as Vo.equip.DecomposeEquipC2S;
        c2s.equipIds = equipIds;
        this.send(this.MODULE, 3, c2s);
    }

    /**
     * 修改装备方案
     * 模块号：31	指令号：4
     */
    public sendChangePlan(): void {
        let c2s = {} as Vo.equip.ChangePlanC2S;
        this.send(this.MODULE, 4, c2s);
    }

    /*********************************协议监听*********************************/

    /**
     * 穿戴装备
     * 模块号：31	指令号：1
     */
    public recWearEquip(data: Vo.equip.WearEquipS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
            EquipManager.ins().wearEquipSucceed(data.content);
        }
    }

    /**
     * 装备洗练
     * 模块号：31	指令号：2
     */
    public recWashEquip(data: Vo.equip.WashEquipS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
        }
    }

    /**
     * 装备分解
     * 模块号：31	指令号：3
     */
    public recDecomposeEquip(data: Vo.equip.DecomposeEquipS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
            // this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content.costItemResults);
            GIns.equipMgr.deleteEquip(data.content.costItemResults);
            this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data.content.rewardResults);
            this.emit(NotificationKey.EQUIP_RECYCLE_EQUIP);
        }
    }

    /**
     * 修改装备方案
     * 模块号：31	指令号：4
     */
    public recChangePlan(data: Vo.equip.ChangePlanS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
        }
    }

    /*********************************协议推送*********************************/

    /**
     * 推送装备位置解锁,int列表
     * 模块号：31	指令号：-1
     */
    public pushEquipPositionUnlock(data: any): void {
        //TODO 推送消息-在这里处理服务端返回的数据
        // console.log(data);
        EquipManager.ins().updateEquipPositionData(data);
    }
}
