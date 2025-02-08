/**聊天item 组队副本失败 */

import G from "../../../../core/comm/G";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import FGUI from "../../../../core/fgui/FGUI";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { TeamChallengeConfigManager } from "../../teamChallenge/config/TeamChallengeConfigManager";
import { TeamChallengeModel } from "../../teamChallenge/model/TeamChallengeModel";
import { ChatI18nKeys } from "../ChatI18nKeys";
import { ChatUtils } from "../utils/ChatUtils";
import { ChatRowVo } from "../vo/ChatRowVo";

@bindFguiExtension("ui://chat/ChatOneRowComTCFail")
export class ChatOneRowComTCFail extends FGUI.GComponent {

    // 最大宽度
    private _maxWidth: number = 0;
    // 背景高度
    private _bgH: number = 0;
    private _bgW: number = 0;
    // 原始高度
    private _originalViewH: number = 0;
    private _rowVo: ChatRowVo;


    private get view(): ui.chat.components.ChatOneRowComTCFail {
        return this as any;
    }


    protected onConstruct() {
        super.onConstruct();
    }

    protected onPreDispose() {
        super.onPreDispose();
    }

    reset(rowVo: ChatRowVo) {
        this._rowVo = rowVo;
        const templateId = rowVo?.templateVo?.templateId;
        const content = ChatUtils.getTemplateContent(templateId);
        if(templateId == ServerEnums.ChatTemplateType.TEAM_INSTANCE_JOIN ||
            templateId == ServerEnums.ChatTemplateType.TEAM_INSTANCE_LEAVE ||
            templateId == ServerEnums.ChatTemplateType.TEAM_INSTANCE_TRANSFER
        ){
            rowVo.content = G.I18nManager.lang(content,[rowVo.templateVo.termVo.playerName]);

        }else if(templateId == ServerEnums.ChatTemplateType.TEAM_INSTANCE_WIN){
            const teamInstanceConfigId = rowVo.templateVo?.termVo?.teamInstanceConfigId;
            if(teamInstanceConfigId){
                let info = TeamChallengeModel.ins().getFloorInfo(teamInstanceConfigId);
                const cfg = TeamChallengeConfigManager.getChapterCfg(teamInstanceConfigId)
                rowVo.content = G.I18nManager.lang(content,[cfg.chapterName+`第${info?.cur}关`]);
            }
          
           
        }

        this.view.tips.text = rowVo.content;
    }
}