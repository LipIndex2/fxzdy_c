import * as fgui from "fairygui-cc";
import { CommonRankSubTabBtn } from "db://assets/scripts/game/modules/common/item/CommonRankSubTabBtn";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";


/**
 * 排行帮 subType 列表组件 | 最多 4 个
 */
export class CommonSubTabListComp extends fgui.GComponent {

    static pkgName: string = "comm";
    static viewName: string = "CommonSubTabListComp";
    private _subTypes: number[] = [];
    private _chooseSubType: number;
    private _rankType: ServerEnums.RankingType;

    private get view(): ui.comm.rank.CommonSubTabListComp {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onConstruct(): void {
        this.view.btnList.itemRenderer = this.renderItem0.bind(this);
    }

    reset(rankType: ServerEnums.RankingType, subTypes: number[], chooseSubType: number) {
        this._rankType = rankType;
        this._subTypes = subTypes|| [];
        this._chooseSubType = chooseSubType;
        this.view.btnList.numItems = this._subTypes.length;
    }


    private renderItem0(index: number, item: CommonRankSubTabBtn): void {
        const subType = this._subTypes[index];
        if (!subType) {
            return;
        }

        const isChoose = subType == this._chooseSubType;
        const isLast = index + 1 == this._subTypes.length;
        item.reset(  this._rankType, subType, isLast, isChoose);
    }


}