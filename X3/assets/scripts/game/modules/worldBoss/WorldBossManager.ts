import BaseSingleton from "../../../core/base/BaseSingleton";
import { NoOwnerItem } from "../backpack/vo/NoOwnerItem";
import { WorldBossRankVo } from "./vo/worldBossRankVo";


export class WorldBossManager extends BaseSingleton {

    //战斗前记下历史最高伤害和历史最高排名
    public historyData: number[] = [];

    private _worldBossInfoList: Map<number, Vo.worldboss.WorldBossVo> = new Map();

    private worldBossRankVoMap: Map<number, WorldBossRankVo>;

    setWorldBossRankVo(id: number, pageIdx: number, vo: Vo.worldboss.WorldBossRankingVo) {
        if (!this.worldBossRankVoMap) {
            this.worldBossRankVoMap = new Map<number, WorldBossRankVo>();
        }
        let _vo = this.worldBossRankVoMap.get(id);
        if (!_vo) {
            _vo = new WorldBossRankVo();
            _vo.list = new Map<number, Array<Vo.worldboss.WorldBossRankItemVo>>();
        }
        _vo.rank = vo.rank;
        _vo.id = vo.id;
        _vo.hurt = vo.hurt;
        //保存每一页的数据
        _vo.list.set(pageIdx, vo.list);
        _vo.maxPage = vo.maxPage;

        this.worldBossRankVoMap.set(id, _vo);
    }

    /**整个排行榜 */
    getAllRankList(id: number): Vo.worldboss.WorldBossRankItemVo[] {
        let list: Vo.worldboss.WorldBossRankItemVo[] = [];
        if (this.worldBossRankVoMap) {
            let _vo = this.worldBossRankVoMap.get(id);

            for (let i = 1; i <= _vo.maxPage; i++) {
                let _list = _vo.list.get(i);
                if (_list && _list.length > 0) {
                    list = list.concat(_list);
                }
            }
        }
        return list;
    }

    getWorldBossRankVo(id: number): WorldBossRankVo {
        return this.worldBossRankVoMap && this.worldBossRankVoMap.get(id);
    }

    clearAllBossInfo():void {
        this._worldBossInfoList.clear()
    }

    setWorldBossInfo(vo: Vo.worldboss.WorldBossVo) {
        this._worldBossInfoList.set(vo.bossConfigId, vo);
    }

    getWorldBossInfo(bossConfigId: number): Vo.worldboss.WorldBossVo {
        return this._worldBossInfoList.get(bossConfigId);
    }

    get worldBossInfoList():Map<number, Vo.worldboss.WorldBossVo> {
        return this._worldBossInfoList
    }


}