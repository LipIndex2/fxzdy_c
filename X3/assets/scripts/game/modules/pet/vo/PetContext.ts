import G from "../../../../core/comm/G"
import { LogBusiness } from "../../../../core/log/LogBusiness"
import GIns from "../../../GIns"


//先禁止掉使用 fragement ，要拿碎片数量去背包拿，不然有道具数量更新的时候还得记得同步fragement
export type C_PetVo = Omit<Vo.pet.PetVo, "fragment">

/**
 * 星灵数据
 */
export class PetContext {
    //共享等级
    private _shareLV = 0
    //共享阶级
    private _shareStage = 0

    //星灵服务器id对应的Vo
    private _id2PetVo: Map<number, C_PetVo> = new Map()
    //星灵配置表id对应的Vo
    private _cfgId2PetVo: Map<number, C_PetVo> = new Map()

    private _allPetCfgId: Set<number>

    @LogBusiness("重置星灵数据")
    initData(itemInitVo: Vo.pet.PetLoginVo) {
        this._shareLV = itemInitVo.shareLevel
        this._shareStage = itemInitVo.shareStage
        this._id2PetVo.clear()
        itemInitVo.petVos.forEach(v => {
            this._id2PetVo.set(v.id, v)
            this._cfgId2PetVo.set(v.petBaseId, v)
        })

        if (!this._allPetCfgId) {
            this._allPetCfgId = GIns.petCfgMgr.getAllPetCfgId()
        }

    }

    // region 数据更新
    /*********************************数据更新*********************************/
    //激活
    recActive(vo: Vo.pet.PetActiveVo) {
        vo.rewardResults.forEach(v => {
            let petVo = v.contents as Vo.pet.PetVo
            this._id2PetVo.set(petVo.id, petVo)
            this._cfgId2PetVo.set(petVo.petBaseId, petVo)
        })
    }

    //升星
    recUpStar(vo: Vo.pet.PetUpStarVo) {
        let petVo = vo.petVo
        this._id2PetVo.set(petVo.id, petVo)
        this._cfgId2PetVo.set(petVo.petBaseId, petVo)
    }

    //升级
    recUpLV(vo: Vo.pet.PetUpLevelVo) {
        this._shareLV = vo.shareLevel
    }

    //升阶
    recUpStage(vo: Vo.pet.PetUpStageVo) {
        this._shareStage = vo.shareStage
        this._shareLV = vo.shareLevel
    }

    /**
     * 处理获得的物品里面自动激活的宠物
     * @param rewards 
     * @returns 
     */
    handleAutoActivePet(rewards: Vo.reward.RewardResult[]): number[] | null {
        let newAutoActivePetCfgId: number[] = []
        rewards.forEach(n => {
            if (this._allPetCfgId.has(n.baseId)) {
                let petVo: Vo.pet.PetVo = n.contents as any
                this._id2PetVo.set(petVo.id, petVo)
                this._cfgId2PetVo.set(petVo.petBaseId, petVo)
                newAutoActivePetCfgId.push(petVo.petBaseId)
            }
        })

        return newAutoActivePetCfgId
    }

    // region 数据获取
    /*********************************数据获取*********************************/

    /**
     * 获取配置ID到宠物对象的映射关系。
     */
    get cfgId2PetVoMap() {
        return this._cfgId2PetVo;
    }

    //激活的星灵数量
    get petActiveNum() {
        return this._id2PetVo.size;
    }

    /**
     * 共享等级,星灵初始等级为1级
     */
    get shareLevel() {
        return this._shareLV
    }

    /**
     * 共享阶级
     */
    get shareStage() {
        return this._shareStage
    }

    // /**
    //  * 根据id获取Vo
    //  * @param id 
    //  * @returns 
    //  */
    // getDataById(id: number): C_PetVo | null {
    //     let data = this._id2PetVo.get(id)
    //     return data || null
    // }

    /**
     * 根据配置表id获取Vo
     * @param cfgId 
     * @returns 
     */
    getDataByCfgId(cfgId: number): C_PetVo {
        let data = this._cfgId2PetVo.get(cfgId)
        if (!data) {
            let petCfg = G.TableManager.getDataById(table.pet.PetConfig, cfgId)

            data = {
                id: 0,
                petBaseId: cfgId,
                active: false,
                star: petCfg.initStar,
            }
            this._cfgId2PetVo.set(cfgId, data)
        }
        return data
    }

    /**
     * 技能锁定状态
     * @param cfgId PetConfig.xlsx id
     * @param star
     * @returns
     */
    isSkillSlotUnlock(petCfgId: number, star?: number) {
        let vo = this.getDataByCfgId(petCfgId);
        return vo.active;
    }

    /**
     * 获取所有激活的宠物id
     * @returns PetConfig.xlsx id
     */
    getAllActivePetId() {
        let activePetCfgIds: number[] = []
        this._id2PetVo.forEach(n => {
            if (n.active) activePetCfgIds.push(n.petBaseId)
        })
        return activePetCfgIds
    }

}