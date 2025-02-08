import { LeagueModel } from "db://assets/scripts/game/modules/league/LeagueModel";
import BaseSingleton from "db://assets/scripts/core/base/BaseSingleton";
import { LeagueManager } from "db://assets/scripts/game/modules/league/leagueManager";
import { Logger } from "db://assets/scripts/core/log/Logger";

export class LeagueBargainManager extends BaseSingleton {


    sendLoadInit() {
        if (!LeagueManager.ins().isInLeague()) {
            Logger.game("【联盟砍价】 未加入联盟")
            return;
        }

        LeagueModel.ins().sendLoadLeagueBargainInfo();
        LeagueModel.ins().sendLoadBargainMemberInfo();
    }
}