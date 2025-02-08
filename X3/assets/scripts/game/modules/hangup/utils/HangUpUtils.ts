import { Color } from "cc";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { MapUtils } from "db://assets/scripts/core/utils/MapUtils";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";
import GIns from "db://assets/scripts/game/GIns";
import { HangUpConfigManager } from "db://assets/scripts/game/modules/hangup/config/HangUpConfigManager";
import { EnumHangUpType } from "db://assets/scripts/game/modules/hangup/context/HangUpContext";
import { HangUpPerHourData } from "db://assets/scripts/game/modules/hangup/structs/HangUpPerHourData";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { PrivilegeAdditionController } from "../../vip/PrivilegeAdditionController";

/**
 * 挂机工具
 */
export class HangUpUtils {

    //免费次数
    private static _baseFreeCount: number = -1
    // 最大挂机加速时间
    private static _maxSpeedUpHangUpCount: number = 0;

    protected static _extraFasgHangUpCost: { k: number, v: number }[] = null;

    /**额外挂机消耗*/
    static getExtraFastHangUpCosts(): { k: number, v: number }[] {
        if (this._extraFasgHangUpCost == null) {
            this._extraFasgHangUpCost = [];
            let cfg = TableManager.getDataById(table.trunkinstance.TrunkInstanceConstantConfig, "TRUNK_INSTANCE:EXTRA_FAST_HANG_UP_COSTS");
            if (cfg && cfg.content) {
                this._extraFasgHangUpCost = StringUtils.toObject1Arr(cfg.content);
            }
        }
        return this._extraFasgHangUpCost;
    }

    /**额外挂机奖励时间*/
    static getExtraFastHangUpSeconds(): number {
        let config = TableManager.getDataById(table.trunkinstance.TrunkInstanceConstantConfig, "TRUNK_INSTANCE:EXTRA_FAST_HANG_UP_SECONDS");
        if (config == null) {
            return 0;
        }
        return config.content.toInt();
    }

    /**
     * 挂机魔方 itemId
     */
    static getHangUpMagicDropItemId(): number {
        let config = TableManager.getDataById(table.trunkinstance.TrunkInstanceConstantConfig, "TRUNK_INSTANCE:MAGIC_INTERVAL_SECOND_ITEM_ID");
        if (config == null) {
            return null;
        }
        return config.content.toInt();
    }

    /**
     * 挂机装备 itemId
     */
    static getHangUpEquipDropFakeItemId(): number {
        let config = TableManager.getDataById(table.trunkinstance.TrunkInstanceConstantConfig, "HANG_UP_EQUIP_FAKE_ITEM_ID");
        if (config == null) {
            return null;
        }
        return config.content.toInt();
    }

    /**
     * 挂机金币 itemId
     */
    static getHangUpGoldItemId(): number {
        let config = TableManager.getDataById(table.trunkinstance.TrunkInstanceConstantConfig, "TRUNK_INSTANCE:HANG_UP_GOLD_ITEM_ID");
        if (config == null) {
            return null;
        }
        return config.content.toInt();
    }

    /**
     * 挂机经验 itemId
     */
    static getHangUpExpItemId(): number {
        let config = TableManager.getDataById(table.trunkinstance.TrunkInstanceConstantConfig, "TRUNK_INSTANCE:HANG_UP_EXP_ITEM_ID");
        if (config == null) {
            return null;
        }
        return config.content.toInt();
    }

    /**
     * 挂机升级材料粉尘 itemId
     */
    static getHangUpLvUpMaterialItemId(): number {
        let config = TableManager.getDataById(table.trunkinstance.TrunkInstanceConstantConfig, "TRUNK_INSTANCE:FIXED_INTERVAL_SECOND_ITEM_ID");
        if (config == null) {
            return null;
        }
        return config.content.toInt();
    }


    /**
     * gold item config
     */
    static getItemConfigForGold(): table.item.ItemConfig {
        return TableManager.getDataById(table.item.ItemConfig, this.getHangUpGoldItemId());
    }

    /**
     * exp item config
     */
    static getItemConfigForExp(): table.item.ItemConfig {
        return TableManager.getDataById(table.item.ItemConfig, this.getHangUpExpItemId());
    }

    /**
     * 升级材料 item config
     */
    static getItemConfigForLvUpMaterial(): table.item.ItemConfig {
        return TableManager.getDataById(table.item.ItemConfig, this.getHangUpLvUpMaterialItemId());
    }

    /**
     * 最长挂机市场
     */
    static getMaxHangUpTimeMs(): number {
        let config = TableManager.getDataById(table.trunkinstance.TrunkInstanceConstantConfig, "TRUNK_INSTANCE:HANG_UP_MAX_SECONDS");
        if (config == null) {
            return null;
        }
        let totalTime = config.content.toInt() * 1000;
        //vip加成 单位小时
        let vipAddition = PrivilegeAdditionController.ins().getHangUpDurationLimit();
        return totalTime + vipAddition;
    }


    /**
     * 获取挂机类型 -> 每秒能拿多少个
     * @param config
     * @param hangUpType
     * @static
     */
    static getHangUpCountPerSecondByType(config: table.trunkinstance.TrunkInstanceConfig,
        hangUpType: EnumHangUpType
    ): number {
        switch (hangUpType) {
            case EnumHangUpType.GOLD:
                return config.goldCountPerHour / 3600;
            case EnumHangUpType.EXP:
                return config.expPerHour / 3600;
            case EnumHangUpType.LV_UP_ITEM:
                if (config?.secondPerLvUpItem == 0) {
                    return 0;
                }
                // 每多少秒获得 1 个
                return 1 / config.secondPerLvUpItem;
            case EnumHangUpType.EQUIP:
                if (config?.dropEquipIntervalSecond == 0) {
                    return 0;
                }
                return 1 / config.dropEquipIntervalSecond;
            case EnumHangUpType.Magic:
                if (config?.magicIntervalSecond == 0) {
                    return 0;
                }
                return 1 / config.magicIntervalSecond;
            default:
        }
        return null;
    }

    /**
     * 获取挂机类型 -> 获得道具ID
     * @param config
     * @param hangUpType
     * @static
     */
    static getGainItemIdByHangUpType(config: table.trunkinstance.TrunkInstanceConfig,
        hangUpType: EnumHangUpType
    ): number {
        let itemId: number | null;
        switch (hangUpType) {
            case EnumHangUpType.GOLD:
                itemId = HangUpUtils.getHangUpGoldItemId();
                break;
            case EnumHangUpType.EXP:
                itemId = HangUpUtils.getHangUpExpItemId();
                break;
            case EnumHangUpType.LV_UP_ITEM:
                itemId = HangUpUtils.getHangUpLvUpMaterialItemId();
                break;
            case EnumHangUpType.EQUIP:
                // 装备假的道具id, 显示用
                itemId = this.getHangUpEquipDropFakeItemId();
                break;
            case EnumHangUpType.Magic:
                // 魔方
                itemId = this.getHangUpMagicDropItemId();
                break;
            default:
                break;
        }
        if (!itemId) {
            console.error("获取挂机类型 -> 获得道具ID 失败, hangUpType: " + hangUpType);
        }
        return itemId;

    }

    /**
     * 挂机配置
     * @param levelId
     */
    static getHangUpConfigByLevelId(levelId: number): table.trunkinstance.TrunkInstanceConfig | null {
        return TableManager.getDataById(table.trunkinstance.TrunkInstanceConfig, levelId);
    }

    /**
     * 挂机每小时收益数据 by 挂机关卡配置
     * @param levelConfig
     */
    static createHangUpPerHourDataArrayByConfig(levelConfig: table.trunkinstance.TrunkInstanceConfig) {
        if (!levelConfig) {
            return []
        }

        let gold = HangUpPerHourData.create(EnumHangUpType.GOLD, levelConfig);
        let exp = HangUpPerHourData.create(EnumHangUpType.EXP, levelConfig);

        // 升级材料
        let secondPerLvUpItem = levelConfig.secondPerLvUpItem;
        if (secondPerLvUpItem == 0) {
            return [gold, exp]
        }
        let lvUpItem = HangUpPerHourData.create(EnumHangUpType.LV_UP_ITEM, levelConfig);
        return [
            gold,
            exp,
            lvUpItem,
        ];
    }

    /**基础免费次数*/
    static get baseFreeCount(): number {
        if (this._baseFreeCount == -1) {
            this._baseFreeCount = 0
            TableManager.getAllData(table.trunkinstance.TrunkInstanceFastHangUpConfig).forEach((cfg) => {
                if (cfg.costItems == null || cfg.costItems.length == 0) {
                    //没有消耗
                    this._baseFreeCount++
                }
            })
        }
        return this._baseFreeCount
    }

    /**其他加成免费次数*/
    static get additionFreeCount(): number {
        return PrivilegeAdditionController.ins().getFastHangUpTimes();
    }

    /**总共的免费次数*/
    static getMaxFreeSpeedUpHangUpCount(): number {
        return this.baseFreeCount + this.additionFreeCount;
    }

    /**
     * 快速挂机最大次数
     */
    static getMaxSpeedUpHangUpCount(): number {
        if (this._maxSpeedUpHangUpCount == 0) {
            this._maxSpeedUpHangUpCount = TableManager.getAllData(table.trunkinstance.TrunkInstanceFastHangUpConfig)
                .toDataStream()
                .map(it => it.id)
                .maxByWeightNumber(it => it, 0);
        }
        let vipAddition = PrivilegeAdditionController.ins().getTotalHangUpTimes()
        return this._maxSpeedUpHangUpCount + vipAddition;
    }

    static isLevelConfigHaveReward(levelConfig: table.trunkinstance.TrunkInstanceConfig) {
        if (!levelConfig) {
            return false;
        }
        let items = ItemUtils.parseKvArrayToItemArray(levelConfig.rewards);
        if (!items) {
            return false;
        }
        return items.length != 0;

    }

    /**
     * 挂机 UI
     * @param hangUpConfig
     * @param typeToUIMap
     */
    static handleHangUpUI(hangUpConfig: table.trunkinstance.TrunkInstanceConfig,
        typeToUIMap: Map<EnumHangUpType, ui.hangUp.components.HangUpPerHourIconComp>
    ) {

        let goldUI = typeToUIMap.get(EnumHangUpType.GOLD);
        if (goldUI) {
            goldUI.labelTitle.text = `+${hangUpConfig.goldCountPerHour}/h`
            goldUI.imageItem.icon = HangUpUtils.getItemConfigForGold().smallIconPath;
        }


        let expUI = typeToUIMap.get(EnumHangUpType.EXP);
        if (expUI) {
            expUI.labelTitle.text = `+${hangUpConfig.expPerHour}/h`
            expUI.imageItem.icon = HangUpUtils.getItemConfigForExp().smallIconPath;
        }

        let lvUpItemUI = typeToUIMap.get(EnumHangUpType.LV_UP_ITEM);
        if (lvUpItemUI) {
            // 升级材料, 特殊, /天 算 = /d
            let lvUpItemPerHour = Math.floor(1 / hangUpConfig.secondPerLvUpItem * 3600 * 24);
            lvUpItemUI.labelTitle.text = `+${lvUpItemPerHour}/d`;
            lvUpItemUI.imageItem.icon = HangUpUtils.getItemConfigForLvUpMaterial().smallIconPath;
        }
    }

    /**
     * 获取挂机类型 by 道具id
     * @param itemId
     */
    static getHangUpTypeByItemId(itemId: number): EnumHangUpType {
        if (itemId == HangUpUtils.getHangUpGoldItemId()) {
            return EnumHangUpType.GOLD;
        }
        if (itemId == HangUpUtils.getHangUpExpItemId()) {
            return EnumHangUpType.EXP;
        }
        if (itemId == HangUpUtils.getHangUpLvUpMaterialItemId()) {
            return EnumHangUpType.LV_UP_ITEM;
        }
        return EnumHangUpType.EQUIP;
    }

    /**
     * 获取挂机类型下, 挂机收益 = ? /h
     * @param curConfig
     * @param type
     * @param hour
     */
    static getItemCountPerHourByHangUpType(
        curConfig: table.trunkinstance.TrunkInstanceConfig,
        type: EnumHangUpType,
        hour: number = 1
    ): number {
        if (!curConfig) {
            return 0;
        }
        if (type == EnumHangUpType.GOLD) {
            return curConfig.goldCountPerHour * hour;
        } else if (type == EnumHangUpType.EXP) {
            return curConfig.expPerHour * hour;
        } else if (type == EnumHangUpType.LV_UP_ITEM) {
            // 这里显示要为 /d, 但是此处只返回 /h 数值 
            return Math.floor(1 / curConfig.secondPerLvUpItem * 3600 * hour);
        } else if (type == EnumHangUpType.EQUIP) {
            return 1 / curConfig.dropEquipIntervalSecond * 3600 * hour;
        } else {
            return 0;
        }
    }

    /**
     * 时间单位, 挂机类型
     * @param type
     */
    static getTimeUnitStrByHangUpType(type: EnumHangUpType) {
        if (type == EnumHangUpType.GOLD) {
            return "/h";
        } else if (type == EnumHangUpType.EXP) {
            return "/h";
        } else if (type == EnumHangUpType.LV_UP_ITEM) {
            return "/d";
        } else if (type == EnumHangUpType.EQUIP) {
            return "/h";
        } else {
            return "/h";
        }
    }

    // 失败 spine
    static getFailResultSpineAssetPath(): string {
        return TableManager.getDataById(table.trunkinstance.TrunkInstanceConstantConfig, "TRUNK:failResultSpineAssetPath").content || "";
    }

    // 胜利 spine
    static getWinResultSpineAssetPath(): string {
        return TableManager.getDataById(table.trunkinstance.TrunkInstanceConstantConfig, "TRUNK:winResultSpineAssetPath").content || "";
    }

    // 计算关卡差异数
    static calcDiffLevelCount(startLevelId: number, curLevelId: number) {
        const c1 = HangUpConfigManager.getHangUpConfigByLevelId(startLevelId);
        if (c1 == null) {
            return 0;
        }
        const c2 = HangUpConfigManager.getHangUpConfigByLevelId(curLevelId);
        if (c2 == null) {
            return 0;
        }
        return Math.abs(c1.showLevelId - c2.showLevelId);
    }

    /**
     * 挂机类型文本
     * @param type
     */
    static getHangUpTypeText(type: EnumHangUpType): string {
        if (type == EnumHangUpType.GOLD) {
            return "金币";
        } else if (type == EnumHangUpType.EXP) {
            return "DNA";
        } else if (type == EnumHangUpType.LV_UP_ITEM) {
            return "进阶";
        } else if (type == EnumHangUpType.EQUIP) {
            return "装备";
        } else {
            return "未知";
        }
    }

    /**
     * 关卡战斗力颜色
     * @param levelId
     * @param needPower
     */
    static getColorByPower(levelId: number, needPower: number): Color {
        const cpModRangeMap = HangUpConfigManager.getCpModRangeMap(levelId);
        if (MapUtils.isEmpty(cpModRangeMap)) {
            return Color.WHITE;
        }

        const myPower = GIns.fightMgr.getFightByDefault();
        if (myPower == null || myPower <= 0) {
            return Color.WHITE;
        }
        if (needPower <= 0) {
            return Color.WHITE;
        }
        const ratio = myPower / needPower;

        for (let [range, value] of cpModRangeMap.entries()) {
            const isIn = range.isIn(ratio);
            if (isIn) {
                if (value == 0) {
                    return Color.WHITE;
                }

                if (value > 0) {
                    return Color.GREEN;
                } else {
                    return Color.RED;
                }
            }
        }

        if (ratio > 1) {
            return Color.GREEN;
        }
        return Color.RED;
    }
}