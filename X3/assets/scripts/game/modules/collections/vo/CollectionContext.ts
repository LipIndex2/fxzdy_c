import { DEBUG } from "cc/env"
import G from "../../../../core/comm/G";
import { LogBusiness } from "../../../../core/log/LogBusiness";
import { Logger } from "../../../../core/log/Logger";
import GIns from "../../../GIns";
import { CollectionTaskVo } from "./CollectionTaskVo";
import { CollectionsSuitVo } from "./CollectionsSuitVo";
import { CollectionsVo } from "./CollectionsVo";
import NotificationKey from "../../../event/NotificationKey";
import { ECollectiblesSkillTargetType } from "../const/UICollectionsConfig";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { AttrData } from "../../attr/AttrManager";
import { AttrEffectUtils } from "../../attr/utils/AttrEffectUtils";
import { Attribute } from "../../attr/AttrEnum";

export class CollectionContext {
    /** key CollectiblesConfig id 玩家拥有的收藏品信息*/
    protected collections: Map<number, Readonly<CollectionsVo>> = new Map();

    /** key CollectiblesSuitConfig id 玩家拥有的套装信息*/
    protected suits: Map<number, Readonly<CollectionsSuitVo>> = new Map();

    protected tasks: Map<number, CollectionTaskVo> = new Map();

    initData(collectionsInitVo: Vo.collectibles.CollectiblesLoginVo) {
        collectionsInitVo.collectiblesVoList.forEach(n => {
            this.collections.set(n.baseId, new CollectionsVo(n));
        });
        collectionsInitVo.suitVoList.forEach(n => {
            this._updateSuitVo(n);
        });

        this.tasks.clear();
        let collectiblesId2TaskVo = collectionsInitVo.collectiblesId2TaskVo;
        if (collectiblesId2TaskVo) {
            Object.keys(collectiblesId2TaskVo).forEach(v => {
                let collCfg = G.TableManager.getDataById(table.collectibles.CollectiblesConfig, v);
                this.tasks.set(collCfg.taskAttrId, new CollectionTaskVo(collectiblesId2TaskVo[v]));
            })
        }
    }


    //region判断====================================================================================================================

    /**
     * 收藏品=============================================
     */
    /**
     * 是否 拥有/激活 收藏品
     * @param collectionCfgId
     */
    isHaveCollection(collectionCfgId: number) {
        let vo = this.collections.get(collectionCfgId);
        if (!vo) {
            return false;
        }
        return vo.active;
    }

    /**
     * 是否可合成收藏品
     * @param collectionCfgId
     */
    isCanCompound(collectionCfgId: number) {
        let vo = this.collections.get(collectionCfgId);
        if (vo && vo.active) {
            //已合成
            return false;
        }

        let collectionCfg = G.TableManager.getDataById(table.collectibles.CollectiblesConfig, collectionCfgId);
        if (!collectionCfg) {
            Logger.error(`collectibles.CollectiblesConfig 表读取不到id ${collectionCfgId}`);
            return false
        }

        if (collectionCfg.validHours > 0) {
            //不可合成的限时道具
            return false;
        }
        let fragmentCount = GIns.backpackMgr.getItemCountByItemId(collectionCfg.fragmentItemId)
        return fragmentCount >= collectionCfg.activeCostFragment;
    }

    /**
     * 是否满星
     * @param collectionCfgId
     */
    isMaxStar(collectionCfgId: number) {
        let vo = this.collections.get(collectionCfgId);
        if (!vo) {
            return false;
        }
        return vo.isMaxStar();
    }

    /**
     * 是否满级
     * @param collectionCfgId
     */
    isMaxLV(collectionCfgId: number) {
        let vo = this.collections.get(collectionCfgId);
        if (!vo) {
            return false;
        }
        return vo.isMaxLV();
    }

    /**
     * 套装=============================================
     */
    /**
     * 是否集齐套装
     */
    isFullSet(suitCfgId: number) {
        let fullSet: boolean = GIns.collectionsCfgMgr.getSuit(suitCfgId).every(n => {
            let collectionVo = this.getCollectionById(n.id);
            if (!collectionVo) {
                return false
            }
            return collectionVo.active;
        })
        return fullSet;
    }

    /**
     * 是否激活套装
     */
    isActiveSet(suitCfgId: number) {
        let suitVo = this.getSuitById(suitCfgId);
        if (!suitVo) {
            return false;
        }
        return suitVo.activated;
    }

    /**
     * 指定套装指定的星级效果是否激活
     * @param suitCfgId
     * @param star 该套装效果需要的累计星数, 如果为0的话，就是返回是否激活套装，其他的话就是指定星级是否激活星级效果
     */
    isSetStarEffActive(suitCfgId: number, star: number) {
        let suitVo = this.getSuitById(suitCfgId);
        if (!suitVo) {
            return false;
        }
        return suitVo.isStarEffActived(star);
    }

    /**
     * 指定套装是否满星激活
     */
    isSetMaxStarEff(suitCfgId: number) {
        let suitVo = this.getSuitById(suitCfgId);
        if (!suitVo) {
            return false;
        }
        return suitVo.isSetMaxStarEff();
    }


    /**
     * 是否是在有效期内的限时道具
     */
    isValidTimeLimitCollection(collectionCfgId: number) {
        if (DEBUG) {
            if (GIns.collectionsCfgMgr.isTimeLimitColl(collectionCfgId) == false) {
                Logger.error(`收藏品判断显示道具 ${collectionCfgId} 不是有效的限时道具`);
                return true;
            }
        }

        let collVo = this.collections.get(collectionCfgId);
        return collVo && collVo.expiredTime > 0 && G.TimeManager.serverNow < collVo.expiredTime;
    }

    //region 数据获取=================================================================================================================

    /**
     * 收藏品=================================================
     */
    /**
     * 获取所有已激活的收藏品id
     */
    getAllActiveCollections() {
        return Array.from(this.collections.values()).filter(v => {
            return v.active;
        }).map(v => {
            return v.baseId;
        });
    }

    /** 获取收藏品数据 */
    getCollectionById(collectionCfgId: number): Readonly<CollectionsVo> | null {
        return this.collections.get(collectionCfgId);
    }

    getCollectionStar(collectionCfgId: number) {
        let collVo = this.collections.get(collectionCfgId);
        if (!collVo) {
            return 0;
        }
        return collVo.star;
    }

    getCollectionLV(collectionCfgId: number) {
        let collVo = this.collections.get(collectionCfgId);
        if (!collVo) {
            return 0;
        }
        return collVo.level;
    }

    /**
     * 给战斗用
     * 获取收藏品跟套装生效的所有技能
     */
    getBattleSkill(
        targetType: ECollectiblesSkillTargetType,
    ): Readonly<table.collectibles.CollectiblesSkillEffectConfig>[] {
        let skills: Readonly<table.collectibles.CollectiblesSkillEffectConfig>[] = [];

        let formationVo = GIns.formationMgr.getFormationVoByType(ServerEnums.FightType.TRUNK_MAP);
        let collectionsId = formationVo.collectionsId; //上阵的收藏品
        this.collections.forEach(collVo => {
            collVo.getAllUnLockSkill(collVo.baseId == collectionsId, targetType, skills);
        });

        this.suits.forEach((suitVo) => {
            suitVo.getAllActiveSkill(targetType, skills);
        });

        return skills;
    }

    /**
     * 套装===================================================
     */

    /** 获取套装数据 */
    getSuitById(SuitCfgId: number): Readonly<CollectionsSuitVo> | null {
        return this.suits.get(SuitCfgId);
    }

    /**
     * 获取激活的所有星级效果，
     * @return [0,...n] 按顺序返回，第一个0表示激活套装效果，其余的n表示由低到高，所有激活的星级效果的星数
     */
    getAllActiveSuitStar(suiCfgId: number) {
        let vo = this.getSuitById(suiCfgId);
        if (!vo) {
            return [];
        }
        return vo.getAllActiveSuitStar();
    }

    /**
     * 任务================================================
     */
    /**
     * 获取任务进度
     * @param taskId
     */
    getTaskProgress(taskId: number) {
        let vo = this.tasks.get(taskId);
        if (!vo) return 0;

        return vo.getTaskProgress();
    }

    /**
     * 战力================================================
     */

    private _mergedAddAttrDataArray: AttrData[] = []

    /**
     * 获取所有收藏品跟套装属性加成
     * @returns 合并后的属性
     */
    getMergedAddAttrDataArray(): Readonly<Array<AttrData>> {
        if (!this.isAttrDirty) {
            return this._mergedAddAttrDataArray;
        }

        let collAttrs: AttrData[] = [];
        // 收藏品属性
        this.collections.forEach(collVo => {
            if (collVo.active == false) return;
            this.getCollectionMergedAddAttrDataArray(collVo.baseId, collAttrs);
        });

        //套装属性
        this.suits.forEach(suitVo => {
            if (!suitVo.activated) return null;
            this.getSuitMergedAddAttrArray(suitVo.suitId, collAttrs);
        });

        this.isAttrDirty = false;
        this._mergedAddAttrDataArray = collAttrs;
        return collAttrs;
    }

    /**
     * 获取指定收藏品属性加成
     * @param out_attrs 
     * @returns 
     */
    getCollectionMergedAddAttrDataArray(collectionCfgId: number, out_attrs: AttrData[]) {
        let collCfg = G.TableManager.getDataById(table.collectibles.CollectiblesConfig, collectionCfgId);
        if (!collCfg) {
            return;
        }

        let collVo = this.getCollectionById(collectionCfgId);
        if (!collVo) {
            return;
        }

        if (collCfg.baseAttrs) {
            let unitEffectiveType = this.getEffectTypeByName(collCfg.effectType);
            //成长属性
            for (let iBA = 0, baseAttrs = collCfg.baseAttrs, lenBA = baseAttrs.length; iBA < lenBA; ++iBA) {
                out_attrs.push(AttrData.create2(baseAttrs[iBA].k, baseAttrs[iBA].v, unitEffectiveType));
            }

            if (collCfg.growAttrs) {
                //升级生长属性
                let LV = collVo.level;
                if (LV > 0) {
                    for (let iGA = 0, growAttrs = collCfg.growAttrs, lenGA = growAttrs.length;
                        iGA < lenGA; ++iGA
                    ) {
                        out_attrs.push(AttrData.create2(growAttrs[iGA].k, growAttrs[iGA].v * LV, unitEffectiveType));
                    }
                }
            }
        }

        //额外属性
        if (collCfg.extraEffectType && collCfg.extraAttrs) {
            let unitExtraEffect = this.getEffectTypeByName(collCfg.extraEffectType);
            for (let iEA = 0, extraAttrs = collCfg.extraAttrs, lenEA = extraAttrs.length;
                iEA < lenEA; ++iEA
            ) {
                out_attrs.push(AttrData.create2(extraAttrs[iEA].k, extraAttrs[iEA].v, unitExtraEffect));
            }
        }

        //星级属性
        if (collCfg.extraEffectType && collCfg.starAttrs && collVo.star > 0) {
            let unitExtraEffect = this.getEffectTypeByName(collCfg.extraEffectType);
            collCfg.starAttrs.forEach(v => {
                out_attrs.push(AttrData.create2(v.k, v.v * collVo.star, unitExtraEffect));
            });
        }

        //任务特性
        if (collCfg.taskEffectType && collCfg.taskAttrId) {
            let ae = GIns.collectionsCfgMgr.getCollAccuEff(collCfg.taskAttrId, collVo.star, { cur: null });
            if (ae.cur && ae.cur.value > 0) {
                out_attrs.push(AttrData.create2(ae.cur.config.id as Attribute, ae.cur.value, this.getEffectTypeByName(collCfg.taskEffectType)));
            }
        }
    }

    /**
     * 获取指定套装属性加成
     * @param suitCfgId 
     * @param out_attrs 
     */
    getSuitMergedAddAttrArray(suitCfgId: number, out_attrs: AttrData[]) {
        let suitCfg = G.TableManager.getDataById(table.collectibles.CollectiblesSuitConfig, suitCfgId);
        if (!suitCfg) return null;

        let suitVo = this.getSuitById(suitCfgId);

        AttrData.fromTableConfig(suitCfg.baseAttrs).forEach(v => {
            out_attrs.push(v);
        })

        GIns.collectionsCfgMgr.getSuitAllStarEffs(suitCfg.id).forEach(v => {
            if (suitVo.activateStarNum >= v.star && v.starAttrs) {
                AttrData.fromTableConfig(v.starAttrs).forEach(v => {
                    out_attrs.push(v);
                });
            }
        })
    }

    private getEffectTypeByName(effectType: string) {
        let type = AttrEffectUtils.getEffectTypeByName(effectType);
        if (type == ServerEnums.CollectiblesEffectType.ALL) {
            return null;
        }
        return type
    }

    /****属性是否需要更新 */
    private isAttrDirty: boolean = true;

    private updateCollection(id: number, data: Vo.collectibles.CollectiblesVo, isNew: boolean = false) {
        if (isNew)
            this.collections.set(id, new CollectionsVo(data));
        else {
            this.collections.get(id).updateVo(data);
        }
        this.isAttrDirty = true;
    }

    //region 服务器返回数据，更新本地数据=================================================================================================================

    _recActive(data: Vo.collectibles.ActiveS2C) {
        data.content.rewardResults.forEach(v => {
            if (G.TableManager.getDataById(table.collectibles.CollectiblesConfig, v.baseId)) {
                let content = v.contents as XJ.collections.collectionsVo
                // this.collections.set(v.baseId, new CollectionsVo(content));
                this.updateCollection(v.baseId, content, true)
            }
        })
    }

    @LogBusiness("获得收藏品物品，自动激活")
    _recItemActive(data: Vo.collectibles.CollectiblesVo) {
        // this.collections.set(data.baseId, new CollectionsVo(data));
        this.updateCollection(data.baseId, data, true)
        G.FacadeManager.emit(NotificationKey.COLLECTIONS_ACTIVE, data.baseId);
    }

    _recUpStar(data: Vo.collectibles.UpStarS2C) {
        this.updateCollection(data.content.collectiblesVo.baseId, data.content.collectiblesVo)
        // this.getCollectionById(data.content.collectiblesVo.baseId)
        //     .updateVo(data.content.collectiblesVo);
    }

    _recUpLevel(data: Vo.collectibles.UpLevelS2C) {
        this.updateCollection(data.content.collectiblesVo.baseId, data.content.collectiblesVo)
        // this.getCollectionById(data.content.collectiblesVo.baseId)
        //     .updateVo(data.content.collectiblesVo);
    }

    _recPushExpiredVoList(data: Array<Vo.collectibles.CollectiblesVo>) {
        data.forEach(vo => {
            this.collections.delete(vo.baseId);
        })
        this.isAttrDirty = true;
    }

    _taskChange(changedTasks: Vo.task.TaskVo) {
        let vo = this.tasks.get(changedTasks.taskId);
        if (!vo) {
            this.tasks.set(changedTasks.taskId, new CollectionTaskVo(changedTasks));
            this.isAttrDirty = true;
            return true;
        } else {
            let lastProgress = vo.getTaskProgress();
            vo.reset(changedTasks);
            let curProgress = vo.getTaskProgress();

            let isTaskChange = lastProgress != curProgress;
            if (isTaskChange) {
                this.isAttrDirty = true;
            }
            return isTaskChange;
        }
    }

    _updateSuitVo(vo: Vo.collectibles.CollectiblesSuitVo) {
        let localVo = this.getSuitById(vo.suitId);
        if (!localVo) {
            this.suits.set(vo.suitId, new CollectionsSuitVo(vo));
        } else {
            localVo._updateSuitVo(vo);
        }
        this.isAttrDirty = true;
    }
}


