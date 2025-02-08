import { WorldManager } from "../../../world/WorldManager";
import { ActorUnitNode } from "../../node/ActorUnitNode";
import { BossShowUnit } from "../../show/BossShowUnit";

export class ChongHouShow extends BossShowUnit {

    setSpineNode(node: ActorUnitNode) {
        super.setSpineNode(node);
        if (WorldManager.ins().underLayer) {
            let node2 = this.createOtherSpineNode(950102, WorldManager.ins().underLayer)
            node2.setPosition(this.pos.x, this.pos.y);
        }
    }

    protected updateHpBar(): void {
    }

    protected updateHpBarPos(): void {
        //this._hpBar.setPosition(this.pos.x, this.pos.y - 400);
        if (this._hpBar)
            this._hpBar.onHide(); //策划要求虫后不显示血条
    }
}