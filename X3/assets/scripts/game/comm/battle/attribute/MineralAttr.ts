
export class MineralAttr {
    protected _hp: number;
    protected _cfg: table.map.MapMineralConfig

    init(cfg: table.map.MapMineralConfig) {
        this._cfg = cfg;
        this._hp = cfg.hp;
    }

    isAlive() {
        return this._hp > 0;
    }

    isDeath() {
        return this._hp <= 0;
    }

    rebirth() {
        this._hp = this._cfg.hp;
    }

    hurt(value: number) {
        this._hp -= value;
        if (this._hp <= 0) {
            this._hp = 0;
        }
    }

    public get hp(): number {
        return this._hp
    }
}
