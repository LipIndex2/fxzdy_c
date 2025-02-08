import { PVPRankBigLogoComp } from "db://assets/scripts/game/modules/pvp/components/PVPRankBigLogoComp";
import { PVPModel } from "db://assets/scripts/game/modules/pvp/model/PVPModel";
import * as fgui from "fairygui-cc";

export class PVPRankBigLogoChooseComp extends fgui.GButton {

    private _config: table.arena.ArenaRankConfig;
    private _index: number = 0;

    private get view(): ui.pvp.logo.PVPRankBigLogoChooseComp {
        return this as any;
    }

    // onChangeXY() {
    //     const x = this.view.node.worldPosition.x;
    //     const diffX = Math.abs(x - this._xCenter);
    //     const maxX = 300;

    //     const ratio = math.clamp((diffX / maxX), 0, 1);
    //     const ratioR = 1 - ratio;
    //     // 缩放
    //     const scale = 0.5 + (0.8 * ratioR);
    //     //  y 坐标
    //     const y = this._oldY - 80 + (160 * ratio);

    //     this.view.logo.setScale(scale, scale);
    //     this.view.curComp.setScale(scale, scale);

    //     const oldPos = this.view.logo.node.position;
    //     this.view.logo.node.position = new Vec3(oldPos.x, y, 0);
    // }

    // @LogBusiness("reset logo")
    reset(index: number,
        config: table.arena.ArenaRankConfig,
    ) {
        const oldConfig = this._config;
        this._index = index;
        this._config = config;
        // config change
        if (oldConfig != config) {
            this.resetUIByConfig(config);
        }

        // this._isChoose = this.isInChooseRange();
        // if (this._isChoose) {
        //     const name = config.name;
        //     const rankName = I18nManager.ins().translate(name);
        //     console.info(`选中了段位 id = ${rankId}, 段位名 = ${rankName}, index = ${index}`);
        //     this._parentView.setChooseRankIndex(index);
        // }

        // this.onChangeXY();

    }


    private resetUIByConfig(config: table.arena.ArenaRankConfig) {
        const rankId = config.id;

        // @ts-ignore
        (this.view.logo as PVPRankBigLogoComp).reset(config);

        const isCurRank = PVPModel.ins().getContext().myConfigId === rankId;
        this.view.getController("isCurrent").selectedIndex = isCurRank ? 1 : 0;
    }

    // private isInChooseRange() {
    //     const x = this.view.x - this._scrollX + this.view.width / 2;
    //     const diffX = Math.abs(x - this._xCenter);
    //     return diffX < this.view.width;
    // }
}