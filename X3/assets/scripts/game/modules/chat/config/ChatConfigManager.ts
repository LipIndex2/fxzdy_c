import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

/**
 * 聊天
 */
export class ChatConfigManager {
    // 最大提示消息数量
    static readonly maxTipsMessageCount: number = 99;

    // <emoji类型, emojiConfig[]>
    private static _typeToEmojiConfigArrayMap: Map<number, table.chat.EmojiConfig[]> = new Map();
    // <emoji资源路径, emojiConfig>
    private static _emojiPathToConfigMap: Map<string, table.chat.EmojiConfig> = new Map();
    // <emoji名字, emojiConfig>
    private static _emojiNameToConfigMap: Map<string, table.chat.EmojiConfig> = new Map();
    // 默认聊天盒子id
    private static _defaultChatBoxId: number = 0;
    // 最大消息内容长度
    private static _maxMessageContentSize: number = 0;
    // 保留消息 n 天
    private static _keepMessageDays: number = 0;
    // 跑马灯滚动时间
    private static _postPlayTimeSecond: number = 10;

    // 是否初始化过
    private static _isInit: boolean = false;

    static init() {
        if (this._isInit) {
            return;
        }
        this._isInit = true;

        this._typeToEmojiConfigArrayMap = this.getAllEmojiConfigArray()
            .toDataStream()
            .groupBy((it) => it.type);

        this._emojiPathToConfigMap = this.getAllEmojiConfigArray()
            .toDataStream()
            .toMap(
                (it) => it.icon,
                (it) => it,
                (v1, v2) => {
                    console.error(`【聊天】 emoji 配置重复. icon path = ${v1.icon} | config id = ${v1.id}, ${v2.id}`);
                    return v1;
                }
            );
        this._emojiNameToConfigMap = this.getAllEmojiConfigArray()
            .toDataStream()
            .toMap(
                (it) => it.name,
                (it) => it,
                (v1, v2) => {
                    console.error(`【聊天】 emoji 名字重复. name = ${v1.name} | config id = ${v1.id}, ${v2.id}`);
                    return v1;
                }
            );

        // kv
        this._defaultChatBoxId = TableManager.getDataById(table.chat.ChatConstantConfig, "CHAT:DEFAULT_CHAT_BOX_ID")?.content?.toInt() || 0;
        this._maxMessageContentSize = TableManager.getDataById(table.chat.ChatConstantConfig, "CHAT:TEXT_LENGTH")?.content?.toInt() || 0;
        this._keepMessageDays = TableManager.getDataById(table.chat.ChatConstantConfig, "CHAT:MSG_VALID_DAYS")?.content?.toInt() || 0;
        this._postPlayTimeSecond = TableManager.getDataById(table.chat.ChatConstantConfig, "CHAT:POST_PLAY_TIME")?.content?.toInt() || 10;
    }

    static getTemplateConfigById(templateId: number): table.chat.ChatTemplateConfig {
        return TableManager.getDataById(table.chat.ChatTemplateConfig, ServerEnums.ChatTemplateType[templateId]);
    }

    static get keepMessageDays(): number {
        return this._keepMessageDays;
    }

    static get defaultChatBoxId(): number {
        return this._defaultChatBoxId;
    }

    static get maxMessageContentSize(): number {
        return this._maxMessageContentSize;
    }

    /**跑马灯播放时间*/
    static get postPlayTimeSecond(): number {
        return this._postPlayTimeSecond;
    }

    // 频道
    static getAllChannelConfigArray(): table.chat.ChatChannelConfig[] {
        return TableManager.getAllData(table.chat.ChatChannelConfig).filter((it) => ServerEnums.ChannelType[it.id] != ServerEnums.ChannelType.PRIVATE);
    }

    // 频道
    static getChannelConfigById(channelId: ServerEnums.ChannelType): table.chat.ChatChannelConfig {
        const channelIdStr = ServerEnums.ChannelType[channelId];
        return TableManager.getDataById(table.chat.ChatChannelConfig, channelIdStr);
    }

    // 弹幕
    static getBarrageConfigById(id: number): table.chat.ChatBarrageConfig {
        return TableManager.getDataById(table.chat.ChatBarrageConfig, id);
    }

    // emoji
    static getEmojiConfigById(id: number): table.chat.EmojiConfig {
        return TableManager.getDataById(table.chat.EmojiConfig, id);
    }

    // emoji[]
    static getEmojiConfigArrayByType(type: number): table.chat.EmojiConfig[] {
        return this._typeToEmojiConfigArrayMap.get(type) || [];
    }

    // emoji
    static getAllEmojiConfigArray(): table.chat.EmojiConfig[] {
        return TableManager.getAllData(table.chat.EmojiConfig);
    }

    // emoji type
    static getAllEmojiTypeConfigArray(): table.chat.EmojiTypeConfig[] {
        return TableManager.getAllData(table.chat.EmojiTypeConfig);
    }

    // 公告
    static getPostConfig(id: number): table.chat.PostConfig {
        return TableManager.getDataById(table.chat.PostConfig, id);
    }

    // 前端公告
    private static _selfPostConfig: table.chat.PostConfig[];
    /** 前端登录发送的公告 */
    static getSelfPostConfig(): table.chat.PostConfig[] {
        if (!this._selfPostConfig) {
            this._selfPostConfig = [];
            let allCfg = TableManager.getAllData(table.chat.PostConfig);
            for (let cfg of allCfg) {
                if (cfg.type == "SELF_LOGIN") {
                    this._selfPostConfig.push(cfg);
                }
            }
        }
        return this._selfPostConfig;
    }

    //前端循环公告
    private static _selfLoopPostConfig: table.chat.PostConfig[];
    /** 前端循环发送的公告 */
    static getSelfLoopPostConfig(): table.chat.PostConfig[] {
        if (!this._selfLoopPostConfig) {
            this._selfLoopPostConfig = [];
            let allCfg = TableManager.getAllData(table.chat.PostConfig);
            for (let cfg of allCfg) {
                if (cfg.type == "SELF_LOOP") {
                    this._selfLoopPostConfig.push(cfg);
                }
            }
        }
        return this._selfLoopPostConfig;
    }

    // emoji 图片 -> config
    static getEmojiConfigByIconPath(iconPath: string): table.chat.EmojiConfig {
        return this._emojiPathToConfigMap.get(iconPath);
    }

    // emoji 图片 -> config
    static getEmojiConfigByName(name: string): table.chat.EmojiConfig {
        return this._emojiNameToConfigMap.get(name);
    }
}
