import G from "../../../core/comm/G"
import { LogBusiness } from "../../../core/log/LogBusiness"
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import type { AttrData } from "../attr/AttrManager";
import { RedDotKeys } from "../common/redDot/RedDotKeys";
import { PetGroupVo } from "./vo/PetGroupVo";

declare global {
    namespace XJ {
        namespace Pet {
            interface IGroupInfo {
                stage: TStage
                activeStar: number //激活所需星数
                allActiveAttr: Readonly<Array<Readonly<{ k: any, v: any }>>> //当前星级累计所有的生效属性
                curStageAttr: Readonly<Array<{ k: any, v: any }>> //当前星级生效的属性
            }
        }
    }
}

export type TStage = number;

export enum EGroupState {
    cantActive,     //状态1：羁绊不满足激活条件
    waitActive,     //状态2：羁绊待激活
    cantUp,         //状态3：羁绊已激活，不能升级
    waitUp,         //状态4：羁绊已激活，能升级
    max,            //状态5：羁绊已满级

}
export class PetGroupContext {
    private _groupId2GroupVo: Record<number | string, PetGroupVo> = {}

    //星灵id对应星灵羁绊id
    private _petCfgId2PetGroupIds: Record<number, number[]>

    private _hasCallDelayGroupRed: boolean

    private _cacheFightAttrs: AttrData[] = []

    @LogBusiness("重置星灵羁绊数据")
    initData(petLoginVo: Vo.pet.PetLoginVo) {
        this._groupId2GroupVo = {};
        for (let vo of petLoginVo.petGroupVos) {
            this._groupId2GroupVo[vo.groupId] = PetGroupVo.create(vo.groupId, vo);
        }
        this.refreshFightAttrs();

        this.RedRefreshGroup();
    }

    /**
     * 羁绊激活/升星
     * @param vo 
     */
    recActiveGroup(vo: Vo.pet.PetGroupVo) {
        let pgv = this._groupId2GroupVo[vo.groupId];
        if (pgv) {
            pgv.resetVo(vo)
        } else {
            this._groupId2GroupVo[vo.groupId] = PetGroupVo.create(vo.groupId, vo);
        }

        this.refreshFightAttrs();

        //飘战力
        G.FacadeManager.emit(NotificationKey.FIGHT_UPDATE_ALL_HERO);
        G.FacadeManager.emit(NotificationKey.FIGHT_RECALCULATE_ALL_HERO);

        this.RedRefreshGroup();
    }

    /**
     * 星灵升星
     * @param petCfgId
     */
    recPetUpStar(petCfgId: number) {
        this.petCfgId2PetGroupIds[petCfgId].forEach(petGroupId => {
        });
        this.RedRefreshGroup();

        //飘战力
        G.FacadeManager.emit(NotificationKey.FIGHT_UPDATE_ALL_HERO);
        G.FacadeManager.emit(NotificationKey.FIGHT_RECALCULATE_ALL_HERO);
    }

    //region 状态判断 ============================================================================
    /**
     * 指定羁绊是否激活
     * @param petGroupId 
     */
    isGroupActived(petGroupId: number) {

    }

    /**
     * 指定羁绊是否满级
     * @param petGroupId 
     */
    isGroupMax(petGroupId: number) {

    }

    //region 数据获取 ============================================================================

    /**
     * 获取羁绊激活进度
     * @param petGroupId 
     */
    getGroupVo(petGroupId: number) {
        let vo = this._groupId2GroupVo[petGroupId];
        if (!vo) {
            vo = PetGroupVo.create(petGroupId);
            this._groupId2GroupVo[petGroupId] = vo;
        }

        return vo;
    }

    get petCfgId2PetGroupIds() {
        if (!this._petCfgId2PetGroupIds) {
            this._petCfgId2PetGroupIds = {};
            G.TableManager.getAllData(table.pet.PetGroupConfig).forEach(cfg => {
                cfg.petBaseIds.forEach(petCfgId => {
                    if (!this._petCfgId2PetGroupIds[petCfgId]) {
                        this._petCfgId2PetGroupIds[petCfgId] = [];
                    }
                    this._petCfgId2PetGroupIds[petCfgId].push(cfg.id);
                });
            });
        }

        return this._petCfgId2PetGroupIds;
    }

    //region 战力
    /**
     * 获取星灵当前等级跟阶级的加成属性
     */
    getGroupAttr(out_attrDatas: AttrData[]) {
        out_attrDatas.push(...this._cacheFightAttrs);
    }

    private refreshFightAttrs() {
        this._cacheFightAttrs = [];
        Object.keys(this._groupId2GroupVo).forEach(groupId => {
            let vo: PetGroupVo = this._groupId2GroupVo[groupId];
            this._cacheFightAttrs.push(...vo.getActiveFightAttrs());
        })
    }

    //region 红点

    /**
     * 刷新羁绊红点
     * @param petGroupId
     */
    RedRefreshGroup() {
        if (!this._hasCallDelayGroupRed) {
            this._hasCallDelayGroupRed = true;

            G.GameTimer.once(1000, this, () => {
                let red = false;
                for(let groupCfg of G.TableManager.getAllData(table.pet.PetGroupConfig)){
                    let vo = this.getGroupVo(groupCfg.id);
                    red = vo.isCanActive() || vo.isCanUpLV();
                    if (red) {
                        break
                    }
                }
                GIns.redDotMgr.setRedDot(RedDotKeys.Pet_group_active_up, red);
                this._hasCallDelayGroupRed = false;
            });
        }

    }
}