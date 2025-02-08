import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import GIns from "../../../GIns";
import NotificationKey from "../../../event/NotificationKey";

/**
 * 英雄拥有皮肤
 */
export class ConditionAssignHeroActiveSkin extends ICondition {

    private _heroId: number = 0;
    private _skinId: number = 0;

    public listenNotifications: string[] = [NotificationKey.BATTLE_SKIN_CHANGED];

    type(): EnumConditionType {
        return EnumConditionType.ASSIGN_HERO_ACTIVE_SKIN;
    }

    param(): string {
        return this._heroId + ''
    }

    value(): number {
        return this._skinId
    }

    initParams(params: string, targetCount: number): void {
        this._heroId = params.toInt();
        this._skinId = targetCount
    }

    check(): boolean {
        let heroVo = GIns.heroMgr.getHeroVoByID(this._heroId)
        return heroVo && heroVo.heroVoData.heroSkinIds.indexOf(this._skinId) != -1
    }

    getErrorTipsArgs(): (string | number)[] {
        return [];
    }

}