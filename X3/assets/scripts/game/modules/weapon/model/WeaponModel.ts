import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { WeaponManager } from "../WeaponManager";
import { WeaponVo } from "../vo/WeaponVo";

/**
 * 赋能武器模块定义信息
 * @author GameCreator
 */
export class WeaponModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 40;

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
        this.registerMsg(moduleId, 1, this.recUpStar);
        this.registerMsg(moduleId, 2, this.recWear);
        this.registerMsg(moduleId, 3, this.recTakeOff);
        this.registerMsg(moduleId, 4, this.recLock);
    }

    /**初始化帐数据 */
    public initData(vo: Vo.awakeweapon.AwakeWeaponLoginVo): void {
        WeaponManager.ins().setWeaponData(vo)
    }

    /*********************************协议发送*********************************/

    /**
     * 武器升星
     * 模块号：40	指令号：1
     */
    public sendUpStar(c2s: Vo.awakeweapon.UpStarC2S): void {
        this.send(this.MODULE, 1, c2s);
    }

    /**
     * 武器穿戴
     * 模块号：40	指令号：2
     */
    public sendWear(c2s: Vo.awakeweapon.WearC2S): void {
        this.send(this.MODULE, 2, c2s);
    }

    /**
     * 武器卸下
     * 模块号：40	指令号：3
     */
    public sendTakeOff(c2s: Vo.awakeweapon.TakeOffC2S): void {
        this.send(this.MODULE, 3, c2s);
    }

    /**
      * 武器锁定
      * 模块号：40	指令号：4
      */
    public sendLock(c2s: Vo.awakeweapon.LockC2S): void {
        this.send(this.MODULE, 4, c2s, c2s);
    }

    /*********************************协议监听*********************************/

    /**
     * 武器升星返回
     * 模块号：40	指令号：1
     */
    public recUpStar(data: Vo.awakeweapon.UpStarS2C): void {
        if (data.code < 0) {
            return;
        }
        this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content.costItemResults)
        let vo: WeaponVo = WeaponManager.ins().updateWeaponDatas([data.content.weaponVo])
        if (vo != null) {
            this.emit(NotificationKey.WEAPON_UP_STAR_COMPLETE, data)
            if (vo.base.heroBaseId > 0) {
                this.emit(NotificationKey.FIGHT_UPDATE_ONE_HERO, vo.base.heroBaseId);
            }
        }
    }

    /**
     * 武器穿戴返回
     * 模块号：40	指令号：2
     */
    public recWear(data: Vo.awakeweapon.WearS2C): void {
        if (data.code < 0) {
            return;
        }
        WeaponManager.ins().updateWeaponDatas(data.content)
        this.emit(NotificationKey.WEAPON_WEAR_COMPLETE)
        data.content.forEach((vo) => {
            if (vo.heroBaseId > 0) {
                this.emit(NotificationKey.FIGHT_UPDATE_ONE_HERO, vo.heroBaseId);
            }
        })
        
    }

    /**
      * 武器卸下返回
      * 模块号：40	指令号：3
      */
    public recTakeOff(data: Vo.awakeweapon.TakeOffS2C): void {
        if (data.code < 0) {
            return;
        }
        let lastHeroId:number = WeaponManager.ins().getWeaponVo(data.content.id)?.base.heroBaseId
        let vo: WeaponVo = WeaponManager.ins().updateWeaponDatas([data.content])
        if (vo != null) {
            this.emit(NotificationKey.WEAPON_TAKE_OFF_COMPLETE, vo)
            if (lastHeroId > 0) {
                this.emit(NotificationKey.FIGHT_UPDATE_ONE_HERO, lastHeroId);
            }
        }
    }

    /**
     * 武器锁定返回
     * 模块号：40	指令号：1
     */
    public recLock(data: Vo.awakeweapon.LockS2C, c2s:Vo.awakeweapon.LockC2S): void {
        if (data.code < 0) {
            return;
        }
        let vo: WeaponVo = WeaponManager.ins().updateWeaponLockState(c2s.weaponUniqueId)
        if (vo != null) {
            this.emit(NotificationKey.WEAPON_LOCK_COMPLETE, vo)
        }
    }

}
