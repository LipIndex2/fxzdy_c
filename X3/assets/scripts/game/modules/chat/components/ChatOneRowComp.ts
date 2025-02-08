import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { ChatRowVo } from "db://assets/scripts/game/modules/chat/vo/ChatRowVo";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { ChatOneRowCardComp } from "db://assets/scripts/game/modules/chat/components/ChatOneRowCardComp";
import { ChatOneRowContentComp } from "db://assets/scripts/game/modules/chat/components/ChatOneRowContentComp";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

@bindFguiExtension("ui://chat/ChatOneRowComp")
export class ChatOneRowComp extends FGUI.GComponent {

    private get view(): ui.chat.components.ChatOneRowComp {
        return this as any;
    }

    reset(rowVo: ChatRowVo) {
        const isTemplateCard = rowVo.isTemplateCard();
        //联盟被进攻用普通文本展示
        let isLeagueExploreBeOccupy:boolean = rowVo.templateVo?.templateId == ServerEnums.ChatTemplateType.LEAGUE_EXPLORE_BUILDING_BE_OCCUPY;
        this.view.getController("type").selectedIndex = isTemplateCard && !isLeagueExploreBeOccupy ? 1 : 0;


        if (isTemplateCard) {
            // 模板
            const comp = FguiScriptUtils.toMyScriptClass(this.view.partContent, ChatOneRowCardComp);
            comp.reset(rowVo);
            this.view.height = comp.height + 20;
            // GameTimer.ins().once(2, this, () => {
            //     if (!this.view.node.isValid) {
            //         return;
            //     }
            //     this.view.height = comp.height + 20;
            // });
        } else {
            // 聊天
            const comp = FguiScriptUtils.toMyScriptClass(this.view.partContent, ChatOneRowContentComp);
            comp.reset(rowVo);

            this.view.height = comp.height + 20;
            // GameTimer.ins().once(2, this, () => {
            //     if (!this.view.node.isValid) {
            //         return;
            //     }
            //     this.view.height = comp.height + 20;
            // });
        }

    }

}