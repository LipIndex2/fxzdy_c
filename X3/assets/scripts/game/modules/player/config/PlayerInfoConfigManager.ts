import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { MapUtils } from "db://assets/scripts/core/utils/MapUtils";
import { ConditionManager } from "db://assets/scripts/game/modules/condition/ConditionManager";
import { SettingsModel } from "db://assets/scripts/game/modules/settings/model/SettingsModel";
import { ComparatorBuilder } from "db://assets/scripts/core/utils/ComparatorBuilder";
import { HeroManager } from "db://assets/scripts/game/modules/hero/HeroManager";
import GIns from "../../../GIns";

/**
 * 玩家信息
 */
export class PlayerInfoConfigManager {


    // 玩家名称最大长度
    private static _nameMaxLength: number = 1;
    // 玩家名称最小长度
    private static _nameMinLength: number = 1;
    // 默认头像id
    private static _defaultHeadIconId: number = 1;
    // 默认头像框id
    private static _defaultHeadFrameId: number = 1;
    // 默认形象id
    private static _defaultShowHeroId: number = 1;
    // 默认称号id
    private static _defaultTitleId: number = 1;
    // <玩家信息装饰类型, <装饰id, 装饰配置>>
    private static _typeToIdToConfigMap: Map<ServerEnums.ShowInfoType, Map<number, table.set.SetShowConfig>> = new Map();
    // 英雄缩放比例
    private static _scaleForHero: number = 1;

    static init() {
        this._nameMaxLength = TableManager.getDataById(table.player.PlayerBasicConfig, "PLAYER_NAME_MAX_LEN")
            .content
            .toInt();
        this._nameMinLength = TableManager.getDataById(table.player.PlayerBasicConfig, "PLAYER_NAME_MIN_LEN")
            .content
            .toInt();

        this._scaleForHero = TableManager.getDataById(table.set.SetConstantConfig, "SET:HERO_SCALE")
            .content
            .toInt();

        this._defaultHeadIconId = TableManager.getDataById(table.set.SetConstantConfig, "SET:DEFAULT_HEAD_ICON_ID")
            .content
            .toInt();
        this._defaultHeadFrameId = TableManager.getDataById(table.set.SetConstantConfig, "SET:DEFAULT_HEAD_FRAME_ID")
            .content
            .toInt();
        this._defaultShowHeroId = TableManager.getDataById(table.set.SetConstantConfig, "SET:DEFAULT_IMAGE_ID")
            .content
            .toInt();
        this._defaultTitleId = TableManager.getDataById(table.set.SetConstantConfig, "SET:DEFAULT_TITLE_ID")
            .content
            .toInt();

        this._typeToIdToConfigMap = MapUtils.toLevel2Map(
            TableManager.getAllData(table.set.SetShowConfig),
            it => ServerEnums.ShowInfoType[it.type],
            it => it.id,
            (v1, v2) => v2
        );
    }

    // 排序聊天盒子
    private static ComparatorForChatSkin = ComparatorBuilder.create<table.set.SetShowConfig>()
        .addComparator((a, b) => {
            // 正在使用, asc
            const isInUseA = SettingsModel.ins().context.isInUse(a.id)
            const isInUseB = SettingsModel.ins().context.isInUse(b.id)

            if (isInUseA) {
                return -1;
            } else if (isInUseB) {
                return 1;
            } else {
                return 0;
            }
        })
        .addComparator((a, b) => {
            // 拥有的放前面
            const isHaveA = SettingsModel.ins().context.isHaveGot(a.id);
            const isHaveB = SettingsModel.ins().context.isHaveGot(b.id);

            if (isHaveA) {
                return -1;
            } else if (isHaveB) {
                return 1;
            } else {
                return 0;
            }
        })
        .build();

    // 排序玩家基本饰品
    private static comparatorForSettingConfig = ComparatorBuilder.create<table.set.SetShowConfig>()
        .addComparator((a, b) => {
            const isALocked = ConditionManager.ins().isLock(a.unlockCondition);
            const isBLocked = ConditionManager.ins().isLock(b.unlockCondition);
            // 将未锁定的放在前面，锁定的放在后面
            if (isALocked) {
                return 1;
            } else if (isBLocked) {
                return -1;
            } else {
                return 0;
            }
        })
        .addComparator((a, b) => {
            // 正在使用, asc
            const isInUseA = SettingsModel.ins().context.isInUse(a.id)
            const isInUseB = SettingsModel.ins().context.isInUse(b.id)

            if (isInUseA) {
                return -1;
            } else if (isInUseB) {
                return 1;
            } else {
                return 0;
            }
        })
        .addComparator((a, b) => {
            // 角色形象, 没有拥有概念
            if (ServerEnums.ShowInfoType[a.type] == ServerEnums.ShowInfoType.IMAGE) {
                return 0;
            }

            const isHaveA = HeroManager.ins().isHaveHero(a.heroId);
            const isHaveB = HeroManager.ins().isHaveHero(b.heroId);

            // 拥有
            if (isHaveA) {
                return -1;
            } else if (isHaveB) {
                return 1;
            } else {
                return 0;
            }
        })

        .addComparator((a, b) => {
            const isHaveA = SettingsModel.ins().context.isHaveGot(a.id);
            const isHaveB = SettingsModel.ins().context.isHaveGot(b.id);
            // 拥有的放前面
            if (isHaveA) {
                return -1;
            } else if (isHaveB) {
                return 1;
            } else {
                return 0;
            }
        })
        .addComparator((a, b) => {
            // id 升序
            return a.id - b.id;
        })
        .build();


    // 获取装饰配置
    static getConfigArrayInSortByType(type: ServerEnums.ShowInfoType): table.set.SetShowConfig[] {
        const configsIter = this._typeToIdToConfigMap.get(type)?.values() || [];
        const setShowConfigs = Array.from(configsIter);

        // 聊天盒子
        if (type == ServerEnums.ShowInfoType.CHAT_BOX
            || type == ServerEnums.ShowInfoType.CHAT_WORD_COLOR
        ) {
            return setShowConfigs.sort(this.ComparatorForChatSkin)
        }
        if (type == ServerEnums.ShowInfoType.HEAD_FRAME
            || type == ServerEnums.ShowInfoType.HEAD_ICON
            || type == ServerEnums.ShowInfoType.IMAGE
        ) {
            return setShowConfigs.sort(this.comparatorForSettingConfig);
        } else {
            return setShowConfigs.sort(this.ComparatorForChatSkin)
        }
    }

    static getConfigByHeroShowOnlyActive(type: ServerEnums.ShowInfoType): table.set.SetShowConfig[] {
        let _configs = [];
        let cfgs = PlayerInfoConfigManager.getConfigArrayInSortByType(type)
        for (let i = 0; i < cfgs.length; i++) {
            if (GIns.illustrationsModel.isHeroShowOnlyActive(cfgs[i].heroId)) {
                let heroVo = GIns.heroMgr.getHeroVoByID(cfgs[i].heroId)
                if (heroVo.heroVoData.isActivate == false) {
                    continue
                }
            }
            _configs.push(cfgs[i])
        }
        return _configs
    }

    static get defaultTitleId(): number {
        return this._defaultTitleId;
    }

    static get defaultShowHeroId(): number {
        return this._defaultShowHeroId;
    }

    static get defaultHeadIconId(): number {
        return this._defaultHeadIconId;
    }

    static get defaultHeadFrameId(): number {
        return this._defaultHeadFrameId;
    }

    static get nameMaxLength(): number {
        return this._nameMaxLength;
    }


    static get nameMinLength(): number {
        return this._nameMinLength;
    }

    static get scaleForHero(): number {
        return this._scaleForHero;
    }

    // 称号
    static getDefaultTitleImagePath(): string {
        return TableManager.getDataById(table.set.SetShowConfig, this._defaultTitleId)?.assetPath;
    }

    // 获取某个装饰配置
    static getShowInfoConfigById(id: number): table.set.SetShowConfig | null {
        return TableManager.getDataById(table.set.SetShowConfig, id);
    }

    // 获取某个类型下所有装饰配置
    static getShowInfoConfigArrayByType(type: ServerEnums.ShowInfoType): table.set.SetShowConfig[] {
        const newVar = this._typeToIdToConfigMap.get(type)?.values() || [];
        return Array.from(newVar);
    }

    // 头像
    static getHeadIconConfigById(headImageId: number) {
        const config = this.getShowInfoConfigById(headImageId);
        if (!config) {
            return this.getShowInfoConfigById(this._defaultHeadIconId);
        }

        return config;
    }

    // 称号
    static getTitleConfigById(titleId: number) {
        const config = this.getShowInfoConfigById(titleId);
        if (!config) {
            return this.getShowInfoConfigById(this._defaultTitleId);
        }

        return config;
    }

    // 头像框
    static getHeadFrameConfigById(headFrameId: number) {
        const config = this.getShowInfoConfigById(headFrameId);
        if (!config) {
            return this.getShowInfoConfigById(this._defaultHeadFrameId);
        }

        return config;
    }

    // 形象
    static getHeroShowConfigById(heroShowId: number): table.set.SetShowConfig | null {
        const config = this.getShowInfoConfigById(heroShowId);
        if (!config) {
            return null;
        }

        return this.getShowInfoConfigById(this._defaultShowHeroId);
    }

    /**
     * 玩家模型
     * @param playerBaseVo
     */
    static getModelIdByPlayerInfo(playerBaseVo: Vo.player.PlayerBaseVo): number {
        let imageId = playerBaseVo.imageId;
        if (imageId == 0) {
            imageId = this._defaultShowHeroId;
        }

        return PlayerInfoConfigManager.getConfigById(imageId)?.heroModelId;
    }

    /**
     * 资源路径
     * @param type
     * @param settingId
     */
    static getAssetPathBySettingId(type: ServerEnums.ShowInfoType, settingId: number): string {
        if (type == ServerEnums.ShowInfoType.TITLE) {
            return this.getTitleConfigById(settingId)?.assetPath;
        }
        if (type == ServerEnums.ShowInfoType.HEAD_ICON) {
            return this.getHeadIconConfigById(settingId)?.assetPath;
        }
        if (type == ServerEnums.ShowInfoType.HEAD_FRAME) {
            return this.getHeadFrameConfigById(settingId)?.assetPath;
        }
        if (type == ServerEnums.ShowInfoType.IMAGE) {
            return this.getHeroShowConfigById(settingId)?.assetPath;
        }

        return "";
    }


    /**
     * 获取显示配置
     * @param settingId
     */
    static getConfigById(settingId: number) {
        return TableManager.getDataById(table.set.SetShowConfig, settingId);
    }
}