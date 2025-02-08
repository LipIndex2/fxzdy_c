import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";

export class GodSequenceDialog extends FGUI.GComponent {
    private _reward: NoOwnerItem;
    private _isLeft: boolean;


    private get view(): ui.godSequence.components.GodSequenceDialog {
        return this as any;
    }


    protected onConstruct(): void {
        this.view.onClick(this.onClick0, this)
    }

    onClick0() {
        // TODO 挑战


    }

    reset(
        isLeft: boolean,
        reward: NoOwnerItem
    ) {
        this._reward = reward;
        this._isLeft = isLeft;

        this.view.getController("isLeft").selectedIndex = isLeft ? 1 : 0;

        if (reward) {
            this.view.imageItem.icon = reward.getItemSmallIconPath();
            this.view.labelItemCount.text = `x${reward.count}`;
        }
    }
}