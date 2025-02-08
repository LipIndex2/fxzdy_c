import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { VipModel } from "../../vip/model/VipModel";
import G from "../../../../core/comm/G";
import { HeroManager } from "../../hero/HeroManager";
import NotificationKey from "../../../event/NotificationKey";

/**
 * 英雄星级
 */
export class ConditionAssignHeroStarGe extends ICondition {

    private _heroId: number = 0;
    private _star: number = 0;


    public listenNotifications: string[] = [NotificationKey.HERO_UP_STAR];


    type(): EnumConditionType {
        return EnumConditionType.ASSIGN_HERO_STAR_GE;
    }

    param(): string {
        return this._heroId + ''
    }

    value(): number {
        return this._star
    }

    initParams(params: string, targetCount: number): void {
        this._heroId = Number(params)
        this._star = targetCount;
    }

    check(): boolean {
        // 共鸣等级
        let heroVo = HeroManager.ins().getHeroVoByID(this._heroId)
        return heroVo && heroVo.star >= this._star;
    }

    getErrorTipsArgs(): (string | number)[] {
        let heroName = G.TableManager.getDataById(table.hero.HeroConfig, this._heroId)?.name || ''
        return [
            heroName,
            this._star
        ];
    }

}