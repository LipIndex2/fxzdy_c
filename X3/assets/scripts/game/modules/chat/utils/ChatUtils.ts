import { ChatConfigManager } from "db://assets/scripts/game/modules/chat/config/ChatConfigManager";
import { KvTemplate } from "db://assets/scripts/core/utils/KvTemplate";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import { DateUtils } from "db://assets/scripts/core/utils/DateUtils";
import { Res } from "db://assets/scripts/core/res/Res";
import { AssetBundleKeys } from "../../../../core/res/AssetBundleKeys";
import { NodeUtils } from "db://assets/scripts/core/utils/NodeUtils";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { RichText, SpriteAtlas } from "cc";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { LocalStorageUtils } from "db://assets/scripts/core/utils/LocalStorageUtils";
import { ForbiddenManager } from "db://assets/scripts/core/comm/ForbiddenManager";
import { EnumCDKeys } from "db://assets/scripts/core/const/EnumCDKeys";
import { PlayerModel } from "db://assets/scripts/game/modules/player/model/PlayerModel";
import { ChatRowVo } from "db://assets/scripts/game/modules/chat/vo/ChatRowVo";
import { RichTextUtils } from "../../../../core/utils/RichTextUtils";
import { ResRef } from "../../../../core/res/ResRef";
import ChannelType = ServerEnums.ChannelType;
import ChatTemplateType = ServerEnums.ChatTemplateType;

/**
 * 聊天
 */
export class ChatUtils {

    /**
     * 编码
     * @param content
     */
    static encodeChatMessage(content: string): string {
        // 正则表达式匹配 [img]${icon}[/img]
        const regex = /\[img\](.*?)\[\/img\]/g;


        // 使用 replace 方法，结合回调函数进行替换
        return content.replace(regex, (match: string, iconPath: string) => {
            // 调用自定义替换函数来处理 ${icon} 部分
            const config = ChatConfigManager.getEmojiConfigByIconPath(iconPath);
            if (!config) {
                return "";
            }
            return `\${config.name}`;
        });
    }

    static getTemplateContent(templateId: number): string {
        return ChatConfigManager.getTemplateConfigById(templateId)?.content;
    }

    /**
     * 解码
     * @param content
     * @param isUbb
     */
    static decodeChatMessage(content: string, isUbb: boolean = true): string {
        const outputContent = KvTemplate.create(content)
            .replaceKey(it => {
                const icon = ChatConfigManager.getEmojiConfigByName(it)?.icon;
                if (!icon) {
                    return "";
                }

                if (isUbb) {
                    return ` [img]${icon}[/img] `;
                }
                return ` <img src='${icon}' align=top offset=3 width=20 height=20/> `;
            })
            .render();
        return outputContent;
    }

    // emoji 占位符
    static getEmojiPlaceHolderById(emojiId: number): string {
        const name = ChatConfigManager.getEmojiConfigById(emojiId)?.name;
        if (!name) {
            return "";
        }
        return `\${${name}}`;
    }

    /**
     * 计算 UBB 实际显示长度 | 假设所有内容大小一致
     * @param content
     * @param toContent
     */
    static calcUBBContentLength(content: string, toContent: string = ""): number {
        if (!content) {
            return 0;
        }
        // 正则匹配所有的 [任意字符]...[/任意字符] 模式
        const ubbRegex = /\[[^\]]+\].*?\[\/[^\]]+\]/g;

        // 正则匹配所有的 <任意标签>...</任意标签> 和 <任意标签 ... /> 模式
        const xmlRegex = /<[^>]+>(.*?)<\/[^>]+>|<[^>]+\/>/g;

        // 链式替换：先替换 UBB 标签，再替换 XML 标签
        const replacedContent = content
            .replace(ubbRegex, toContent)
            .replace(xmlRegex, toContent);

        // 返回替换后的字符串长度
        return replacedContent.length;
    }

    /**
     * 提取 UBB 图片路径
     * @param msg
     */
    static extractUBBImagePath(msg: string): string {
        // 定义匹配 [img]demo[/img] 的正则表达式
        const regex = /\[img\](.*?)\[\/img\]/g;
        let matches;
        const results: string[] = [];

        // 使用正则表达式匹配并提取内容
        while ((matches = regex.exec(msg)) !== null) {
            // 将匹配到的内容 (demo) 添加到结果数组中
            results.push(matches[1]);
        }

        return results[0];
    }

    /**
     * 中间的时间提示
     * @param sendTimeMs
     */
    static getRowTimeTips(sendTimeMs: number): string {
        const curTimeMs = TimeManager.serverNow;

        const isSameDay = DateUtils.isSameDayByTimeMs(curTimeMs, sendTimeMs);
        if (isSameDay) {
            return DateUtils.dateTimeFormat(sendTimeMs, "hh:mm");
        }
        return DateUtils.dateTimeFormat(sendTimeMs, "MM-dd hh:mm");
    }


    static getEmojiConfigByMessage(msg: string): table.chat.EmojiConfig {
        const imgPath = this.extractUBBImagePath(msg);
        return ChatConfigManager.getEmojiConfigByIconPath(imgPath);

    }

    // 设置富文本
    static setUBBTextWithImg(textContent: FGUI.GRichTextField, msg: string, isShort: boolean = false) {
        let finalContent = msg;
        const emojiConfig = ChatUtils.getEmojiConfigByMessage(msg)
        if (emojiConfig) {
            Res.getResRef({ url: emojiConfig.atlasPath, type: SpriteAtlas }, null,
                (resRef: ResRef) => {
                    if (NodeUtils.isNotValidNode(textContent.node)) {
                        return;
                    }
                    const richText = textContent.node.getComponent(RichText);
                    if (!richText) {
                        return;
                    }
                    if (!resRef) {
                        return;
                    }
                    richText.imageAtlas = resRef.content;
                    finalContent = msg;
                });
        } else {
            finalContent = msg;
        }

        // 替换成 **
        ForbiddenManager.replace(finalContent, (content) => {
            if (textContent.isDisposed) {
                return;
            }

            if (!content) {
                textContent.text = "";
                return;
            }

            if (isShort) {
                // 没效果
                // textContent.width = 280;
                textContent.text = this.getShortContentWithEmoji(content, 38);
                return;
            }
            textContent.text = content;
        });
    }

    private static getDisplayLength(content: string, maxLength: number): number {
        let length = 0;
        let i = 0;

        while (i < content.length && length < maxLength) {
            if (content.substring(i, i + 5) === "[img]") {
                const endIdx = content.indexOf("[/img]", i);
                if (endIdx !== -1) {
                    length += 1;  // 将整个 [img]xxx[/img] 视为 1
                    i = endIdx + 6; // 跳过整个标签
                } else {
                    break; // 如果没有找到关闭标签，停止处理
                }
            } else {
                length += 1;  // 普通字符计数
                i += 1;
            }
        }

        return i; // 返回需要截取的字符串索引位置
    }

    private static getShortContentWithEmoji(content: string, maxLength: number): string {
        return RichTextUtils.substring(content, maxLength)
        const cutIndex = this.getDisplayLength(content, maxLength);
        let finalContent = content.substring(0, cutIndex);

        // 检查是否截断了 img 标签，如果是，补全标签
        const openImgIndex = finalContent.lastIndexOf("[img]");
        const closeImgIndex = finalContent.lastIndexOf("[/img]");
        if (openImgIndex > closeImgIndex) {
            const remainingContent = content.substring(cutIndex);
            const endOfImg = remainingContent.indexOf("[/img]");
            if (endOfImg !== -1) {
                finalContent += remainingContent.substring(0, endOfImg + 6);
            } else {
                // 如果找不到关闭标签，这说明内容不完整，可视需求处理。
                finalContent = finalContent.substring(0, openImgIndex);
            }
        }

        return finalContent;
    }

    // 获取历史消息
    static getLocalHistoryMessageByType(type: ServerEnums.ChannelType): Vo.chat.ChatContentVo[] {

        const key = ChatUtils.getLocalStorageKeyNameByType(type);

        return LocalStorageUtils.get(key, Array<Vo.chat.ChatContentVo>) || [];

    }

    // channelType 对应的存储 key
    static getLocalStorageKeyForIsCare(type: ChannelType): string {
        const playerId = PlayerModel.ins().playerId;
        return `${playerId}:chat:isCare:channel:${type}`;
    }

    // channelType 对应的存储 key
    static getLocalStorageKeyNameByType(type: ChannelType): string {
        const playerId = PlayerModel.ins().playerId;
        return `${playerId}:chat:histMsg:channel:${type}`;
    }

    // 获取所有历史消息
    static getAllPlayerHistoryMessage(): Vo.chat.ChatContentVo[] {
        const keys = LocalStorageUtils.getAllKeyPreLike("chat:histMsg:player:")

        return (keys || [])
            .toDataStream()
            .flatMap(it => {
                return LocalStorageUtils.get(it, Array<Vo.chat.ChatContentVo>)
            })
            .toArray();
    }

    static createChannelCDName(type: ChannelType): string {
        return EnumCDKeys.chatSendMessage + "/" + type;
    }

    /**
     * 是否新的关注消息
     * @param newMessage
     * @param lastNewMessage
     */
    static isNewCareMessage(newMessage: ChatRowVo, lastNewMessage: ChatRowVo): boolean {
        if (lastNewMessage == null) {
            return true;
        }
        // 模板消息 | 自己的也算
        if (newMessage.templateVo) {
            return true;
        }
        // 我的消息 / 空白消息
        if (newMessage.isMyPrivateMessage() || newMessage.isBlankContent()) {
            // 忽略
            return false;
        }
        const newMsgTimeMs = newMessage?.timeMs || 0;
        const lastNewMessageTimeMs = lastNewMessage?.timeMs || 0;
        return newMsgTimeMs >= lastNewMessageTimeMs;
    }

}