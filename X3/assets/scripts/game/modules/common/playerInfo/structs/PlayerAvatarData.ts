// 玩家头像
export class PlayerAvatarData {

    private _playerId: number;
    private _playerName: string;
    private _headIconId: number;
    private _headFrameId: number;
    private _imageId: number;

    static create(playerId: number,
                  playerName: string,
                  headIconId: number,
                  headFrameId: number,
                  imageId: number,
    ): PlayerAvatarData {
        const playerAvatarData = new PlayerAvatarData();
        playerAvatarData._playerId = playerId || 0;
        playerAvatarData._playerName = playerName || "";
        playerAvatarData._headIconId = headIconId || 0;
        playerAvatarData._headFrameId = headFrameId || 0;
        playerAvatarData._imageId = imageId || 0;
        return playerAvatarData;
    }


    get playerId(): number {
        return this._playerId;
    }

    get headIconId(): number {
        return this._headIconId;
    }

    get headFrameId(): number {
        return this._headFrameId;
    }

    get imageId(): number {
        return this._imageId;
    }


    get playerName(): string {
        return this._playerName;
    }
}