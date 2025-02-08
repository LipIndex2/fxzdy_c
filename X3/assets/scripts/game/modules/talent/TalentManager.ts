import BaseSingleton from "db://assets/scripts/core/base/BaseSingleton";
import { AttrData } from "db://assets/scripts/game/modules/attr/AttrManager";
import { TalentModel } from "db://assets/scripts/game/modules/talent/model/TalentModel";
import G from "db://assets/scripts/core/comm/G";
import { IModuleAttrApi } from "db://assets/scripts/game/modules/attr/api/IModuleAttrApi";

/**
 * 天赋
 */
export class TalentManager extends BaseSingleton implements IModuleAttrApi {

    private _lastRowId: number = 0;

    isLastRow(talentId: number): boolean {
        const rowId = G.TableManager.getDataById(table.talent.TalentConfig, talentId)?.rowId || 0;
        if (this._lastRowId == 0) {
            this._lastRowId = G.TableManager.getAllData(table.talent.TalentConfig)
                .toDataStream()
                .map(it => it.rowId)
                .maxByWeightNumber(it => it)
        }

        return rowId == this._lastRowId;
    }


    /**
     * 获取合并后的【添加属性数组】
     */
    getMergedAllAddAttrDataArray(): Array<AttrData> {
        return TalentModel.ins().getMergedAddAttrDataArray()
    }

    /**
     * 是否已经解锁过某个天赋?
     * @param talentId
     */
    isHaveUnlockTalentById(talentId: number): boolean {
        return TalentModel.ins().context.isHaveLvUpTalent(talentId)
    }
}