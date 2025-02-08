import { PoolManager } from "../../../../core/pool/PoolManager";
import { TableManager } from "../../../../core/table/TableManager";
import { BattleLogicManager } from "../BattleLogicManager";
import { FightType } from "../enum/FightType";
import { PetShowUnit } from "../show/PetShowUnit";
import { JieFu, JieFuShow } from "../skill/pet/JieFu";
import { KaPiBaLa } from "../skill/pet/KaPiBaLa";
import { PetUnit } from "../unit/battle/PetUnit";

export class PetFactory {
    static create(petId: string, fightType: FightType): [PetUnit, PetShowUnit] {
        let cfg = TableManager.getDataById(table.pet.PetConfig, petId);
        let unit: PetUnit;
        let showUnit: PetShowUnit;
        switch (petId) {
            case "602"://杰夫
                unit = PoolManager.getItem(JieFu)
                showUnit = PoolManager.getItem(JieFuShow)
                break
            case "502"://皮卡巴拉
                unit = PoolManager.getItem(KaPiBaLa)
                // showUnit = PoolManager.getItem(KaPiBaLaShow)
                break
        }
        if (!unit)
            unit = PoolManager.getItem(PetUnit); //创建Boss或怪物

        if (!showUnit) {
            showUnit = PoolManager.getItem(PetShowUnit);
        }
        unit.setBattleLogic(BattleLogicManager.ins().get(fightType))
        return [unit, showUnit]
    }
}