import * as fgui from "fairygui-cc";
import { ModelNode } from "../../common/node/ModelNode";
import { PlayerInfoConfigManager } from "../../player/config/PlayerInfoConfigManager";
import { UIManager } from "../../../../core/mvc/UIManager";
import { PlayerUIKeys } from "../../player/PlayerUIKeys";
import { PlayerInfoMainViewOpenArgs } from "../../player/structs/PlayerInfoMainViewOpenArgs";
import { TeamChallengeModel } from "../model/TeamChallengeModel";
import G from "../../../../core/comm/G";
import { TeamChallengeUIKeys } from "../TeamChallengeUIKeys";
import GIns from "../../../GIns";
import { SettingsConfigManager } from "../../settings/config/SettingsConfigManager";
import { EnumCTState } from "../enum/EnumTeamChallengeChapterState";

/**组队副本主界面， Boss展示模块 */
export class TeamChallengePostBoss extends fgui.GComponent {
    private _modelId: number;
    private _modelNode: ModelNode;

    private get view(): ui.teamChallenge.components.TeamChallengePostBoss {
        return this as any;
    }

    constructor() {
        super();
    }

    reset(modelId: number) {
        if (!this._modelNode) {
            this._modelNode = this.view.modelNode as ModelNode;
        }
        this._modelId = modelId;
        this._modelNode.loadByModelId(modelId);
    }

    public dispose(): void {
        super.dispose()
        this._modelNode && this._modelNode.clear();
        this._modelNode = null;
        this._modelId = null;
    }
}