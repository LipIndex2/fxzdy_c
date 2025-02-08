import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { GVGUIKeys } from "db://assets/scripts/game/modules/gvg/GVGUIKeys";
import {
    FormationMainViewOpenArgs,
    UIFormationKey
} from "db://assets/scripts/game/modules/formation/const/UIFormationConfig";
import { FightType } from "db://assets/scripts/game/comm/battle/enum/FightType";
import { GVGConfigManager } from "db://assets/scripts/game/modules/gvg/config/GVGConfigManager";

@bindFguiExtension("ui://gvg/GVGTabItemBtn")
export class GVGTabItemBtn extends FGUI.GButton {
    private _index: number = 0;

    get view(): ui.gvg.btn.GVGTabItemBtn {
        return this as any;
    }


    protected onConstruct() {
        super.onConstruct();


        this.view.onClick(this.onClick0, this);
    }

    onClick0() {
        switch (this._index) {
            case 0: {
                // 贡献
                UIManager.ins().open(GVGUIKeys.GVGRankWin);
                break;
            }
            case 1: {
                // 奖励
                UIManager.ins().open(GVGUIKeys.GVGRewardPreviewWin);

                break;
            }
            case 2: {
                // 记录
                UIManager.ins().open(GVGUIKeys.GVGRecordWin);
                break;
            }
            case 3: {
                // 防守布阵
                UIManager.ins().open(UIFormationKey.FORMATION_MAIN_VIEW, FormationMainViewOpenArgs.create(
                    FightType.LEAGUE_WAR,
                ));
                break;
            }
        }
    }

    reset(index: number) {
        this._index = index;


        // TODO 按钮 logo
        switch (index) {
            case 0: {
                this.view.labelTitle.text = "贡献";
                this.view.imageLogo.icon = GVGConfigManager.tabLogo1;

                break;
            }
            case 1: {
                this.view.labelTitle.text = "奖励";
                this.view.imageLogo.icon = GVGConfigManager.tabLogo2;

                break;
            }
            case 2: {
                this.view.labelTitle.text = "记录";
                this.view.imageLogo.icon = GVGConfigManager.tabLogo3;

                break;
            }
            case 3: {
                this.view.labelTitle.text = "防守布阵";
                this.view.imageLogo.icon = GVGConfigManager.tabLogo4;

                break;
            }
        }

    }
}