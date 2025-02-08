import { UIBindingKey } from "db://assets/scripts/core/mvc/ui/UIBindingKey";
import { ChatMainView } from "./view/ChatMainView";

/**
 * 聊天
 */
export class ChatUIKeys {

    static readonly ChatMainView = UIBindingKey.create("ChatMainView", ChatMainView);

}