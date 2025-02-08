import { Vec2 } from "cc";
import { PoolManager } from "../../../core/pool/PoolManager";
import { TableManager } from "../../../core/table/TableManager";
import ArrayUtils from "../../../core/utils/ArrayUtils";
import { BattleLogic } from "./BattleLogic";
import { GunGroupInfo } from "./GunGroupInfo";
import { GunInfo } from "./GunInfo";
import { ICaster } from "./skill/ICaster";
import { SkillBehavior } from "./skill/SkillBehavior";

export class GunGroupMgr {
    public battleLogic: BattleLogic;
    private gunGroupInfoList: GunGroupInfo[] = [];
    private gunGroupMap: { [uid: number]: GunGroupInfo[] } = {}

    public clear(): void {
        this.gunGroupMap = {};
        for (let i = 0; i < this.gunGroupInfoList.length; i++) {
            this.gunGroupInfoList[i].clearAll()
        }
        this.gunGroupInfoList.length = 0;
    }

    public update(): void {
        for (let i = 0; i < this.gunGroupInfoList.length; i++) {
            let info = this.gunGroupInfoList[i]
            if (!info.update()) {
                ArrayUtils.removeItem(this.gunGroupMap[info.caster.casterUid], info)
                this.gunGroupInfoList.splice(i, 1)
                i--
            }
        }
    }

    /****因停止而移除的发射器 */
    public clearByCasterStop(caster: ICaster): void {
        let infos = this.gunGroupMap[caster.casterUid]
        if (infos) {
            for (let i = 0; i < infos.length; i++) {
                if (infos[i].cfg.atkPosType == 1)
                    infos[i].clearAll()
            }
            this.gunGroupMap[caster.casterUid].length = 0;
        }
    }

    public create(behavior: SkillBehavior, effectParam: { group: string }, caster: ICaster): void {
        let groupInfo: GunGroupInfo = new GunGroupInfo()
        groupInfo.init(effectParam, behavior, caster);
        this.gunGroupInfoList.push(groupInfo)
        if (!this.gunGroupMap[caster.casterUid])
            this.gunGroupMap[caster.casterUid] = []
        this.gunGroupMap[caster.casterUid].push(groupInfo)
    }

    public randomGunInfoMap: { [uid: string]: { x: number, y: number } } = {}
    /***获取这个子弹组的子弹射击范围 */
    public getChargeWidthAndHeight(group: string, behavior: SkillBehavior, caster: ICaster,
        effectParam?: { group: string, fix?: number, fiy?: number, notAtkPoint?: number, notHurtPoint?: number }): { w: number, h: number, a: number, r: number, fixAngle: number, pos?: Vec2 }[] {

        let groupInfo = new GunGroupInfo()
        groupInfo.initByGroupId(group)
        if (groupInfo.cfg?.gunArray?.length) {
            let arr = []
            for (let i = 0; i < groupInfo.cfg.gunArray.length; i++) {
                let info = PoolManager.getItem(GunInfo)
                info.groupInfo = groupInfo;
                info.init(groupInfo.cfg.gunArray[i], behavior, caster, effectParam)
                let missileCfg = TableManager.getDataById(table.battle.MissileConfig, info.missileId)
                let vo = null;
                if (!missileCfg.hitTips) {
                    vo = { w: 50, h: missileCfg.distance, fixAngle: info.cfg.rotation, atkPoint: effectParam.notAtkPoint ? 0 : 1 }
                }
                else if (missileCfg.hitTips.r) {
                    vo = { r: missileCfg.hitTips.r, fixAngle: info.cfg.rotation, atkPoint: effectParam.notAtkPoint ? 0 : 1, pos: info.getGunAnglePos().pos }
                    if (groupInfo.cfg.atkPosType == 3) {
                        //蓄力有随机的话，要存取这个坐标
                        this.randomGunInfoMap[caster.casterUid + "_" + groupInfo.cfg.id + "_" + i] = vo.pos;
                    }
                }
                else if (missileCfg.hitTips.w && missileCfg.hitTips.h) {
                    vo = { w: missileCfg.hitTips.w, h: missileCfg.hitTips.h, fixAngle: info.cfg.rotation, atkPoint: effectParam.notAtkPoint ? 0 : 1 }
                }
                arr.push(vo)
            }

            return arr;
        }

        return null;
    }
}