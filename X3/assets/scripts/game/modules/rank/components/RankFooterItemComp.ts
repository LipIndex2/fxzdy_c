import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { RankMainView } from "db://assets/scripts/game/modules/rank/view/RankMainView";


export class RankFooterItemComp extends FGUI.GComponent {
    private _rankType: ServerEnums.RankingType;
    private _tabIndex: number = 0;
    private _parentView: RankMainView;
    
    // rank tab
    private _rankConfig: table.rank.RankingConfig;
    // sub type tab
    private _subTypeConfig: table.rank.RankingSubTypeTabConfig;

    private get view(): ui.rank.components.RankFooterItemComp {
        return this as any;
    }


    protected onConstruct() {
        super.onConstruct();

        this.view.onClick(this.onClick0, this);

    }

    onClick0() {
        if (this._rankType == ServerEnums.RankingType.LADDER) {
            let subType = this._subTypeConfig?.subType || null;
            if (subType == null) {
                console.error("subType is null | 你忘记设置配置了吗？");
                return;
            }
            
            this._parentView?.onClickSubTypeTabButton(this._rankType, this._tabIndex, subType);

            return;
        }
        this._parentView?.onClickTabButton(this._rankType, this._tabIndex);
    }


    bindParent(parentView: RankMainView) {
        this._parentView = parentView;
    }


    resetBySubTypeConfig(subTypeTabConfig: table.rank.RankingSubTypeTabConfig,
                         index: number,
                         chooseSubType: number
    ) {
        if (!subTypeTabConfig) {
            return;
        }
        this._subTypeConfig = subTypeTabConfig;
        const subType1 = subTypeTabConfig.subType;
        
        this._rankType = ServerEnums.RankingType[subTypeTabConfig.rankType];
        this._tabIndex = index;

        this.view.bg.icon = subTypeTabConfig.bg;
        this.view.fg.icon = subTypeTabConfig.fg;
        this.view.labelTitle.text = subTypeTabConfig.name;

        // highlight ?
        this.view.fg.visible = subType1 == chooseSubType;


    }


    resetByRankingConfig(config: table.rank.RankingConfig, index: number, curChooseTabIndex: number) {
        if (!config) {
            return;
        }
        this._rankConfig = config;
        
        this._rankType = ServerEnums.RankingType[config.id];
        this._tabIndex = index;

        this.view.bg.icon = config.icon1;
        this.view.fg.icon = config.icon;
        this.view.labelTitle.text = config.tabName;

        this.view.fg.visible = index == curChooseTabIndex;

    }
}