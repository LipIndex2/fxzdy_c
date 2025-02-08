import { PlayerModel } from "db://assets/scripts/game/modules/player/model/PlayerModel";

export class PlayerInfoMainViewOpenArgs {
    playerId: number;


    static create(playerId: number): PlayerInfoMainViewOpenArgs {
        const args = new PlayerInfoMainViewOpenArgs();
        args.playerId = playerId;
        return args;
    }

    static createForMe() {
        const myPlayerId = PlayerModel.ins().Vo.id;
        return PlayerInfoMainViewOpenArgs.create(myPlayerId);
    }
}