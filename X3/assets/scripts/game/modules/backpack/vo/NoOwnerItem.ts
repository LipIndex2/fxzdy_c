import G from "../../../../core/comm/G";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { EnumUtils } from "db://assets/scripts/core/utils/EnumUtils";
import GIns from "../../../GIns";

/**
 * 无主人的物品
 */
export class NoOwnerItem {

    // 道具id
    itemId: number = 0;
    // 道具数量
    count: number = 0;
    /**特效 */
    effect: number = -1;

    // --------------------- 额外数据 --------------------------
    private _isWithExtraData: boolean = false;
    // 英雄碎片类型, 携带的额外数据
    private _extraHeroData: Vo.hero.HeroRewardVo | null = null;


    /**
     * 创建新的普通道具（非唯一物品）
     * @param itemId 物品id
     * @param count 数量
     */
    static create(itemId: number, count: number): NoOwnerItem {
        let vo = new NoOwnerItem();
        vo.itemId = itemId;
        vo.count = count == Infinity ? 0 : count;
        return vo
    }

    static createByConfigKv(kv: { k: any, v: any }): NoOwnerItem {
        let vo = new NoOwnerItem();
        vo.itemId = kv.k as number;
        vo.count = kv.v as number;

        return vo
    }

    // create by server reward
    static createByServerReward(rewardResults: Array<Vo.reward.RewardResult>): NoOwnerItem[] {
        return (rewardResults || []).map(it => {
            return NoOwnerItem.create(it.baseId, it.amount)
        })
    }

    getHeroFragmentExtraData(): Vo.hero.HeroRewardVo | null {
        return this._extraHeroData;
    }

    /**
     * 获取配置
     */
    getItemConfig(): table.item.ItemConfig | null {
        return G.TableManager.getDataById(table.item.ItemConfig, this.itemId)
    }

    /**
     * 品质背景 资源路径
     */
    getQualityIconPath(): string | null {
        let config = this.getItemConfig();
        if (!config) {
            return null;
        }
        let quality = config.quality;
        let qualityConfig = G.TableManager.getDataById(table.quality.QualityConfig, quality);

        if (!qualityConfig) {
            return null;
        }
        return qualityConfig.itemQualityBgPath
    }

    /**
     * 小图标路径
     */
    getItemSmallIconPath(): string | null {
        let itemConfig = this.getItemConfig();
        if (!itemConfig) {
            return null;
        }
        return itemConfig.smallIconPath;
    }

    /**
     * 大图标路径
     */
    getIconPath(): string | null {
        let itemConfig = this.getItemConfig();
        if (!itemConfig) {
            return null;
        }
        return itemConfig.iconPath;
    }

    /**
     * 道具名字 | 未翻译
     */
    getItemName(): string {
        let itemConfig = this.getItemConfig();
        if (!itemConfig) {
            return "";
        }
        return itemConfig.name;
    }

    /**
     * 翻译后的名字
     */
    getItemNameToI18n(): string {
        return G.I18nManager.translate(this.getItemName());
    }

    clone(): NoOwnerItem {
        return Object.assign(new NoOwnerItem(), this);
    }

    /**
     * 克隆并数量翻倍
     * @param num n 倍
     * @return 新对象
     */
    multiply(num: number): NoOwnerItem {
        const newObj = this.clone();
        newObj.count *= num;
        return newObj;
    }

    /**
     * 道具类型
     */
    getItemType(): ServerEnums.ItemType {
        let itemConfig = this.getItemConfig();
        if (!itemConfig) {
            // default 道具
            return ServerEnums.ItemType.ITEM;
        }
        // @ts-ignore
        const type = itemConfig.type;
        return ServerEnums.ItemType[type] as ServerEnums.ItemType;
    }

    /**
     * 是不是英雄
     */
    isHero(): boolean {
        const itemConfig = this.getItemConfig();
        if (!itemConfig) {
            return false;
        }
        const typeName = EnumUtils.getEnumKeyNameByValue(ServerEnums.ItemType, ServerEnums.ItemType.HERO_CARD);
        return itemConfig.type?.trim() === typeName;
    }

    // weapon
    isWeapon(): boolean {
        const itemConfig = this.getItemConfig();
        if (!itemConfig) {
            return false;
        }
        const typeName = EnumUtils.getEnumKeyNameByValue(ServerEnums.ItemType, ServerEnums.ItemType.AWAKE_WEAPON);
        return itemConfig.type?.trim() === typeName;
    }

    /**
     * 获取英雄 id
     */
    getHeroId(): number {
        if (!this.isHero()) {
            return 0;
        }
        return this.itemId;
    }

    /**
     * 品质配置
     */
    getQualityConfig(): table.quality.QualityConfig | null {
        const quality = this.getItemConfig()?.quality || 1;
        return G.TableManager.getDataById(table.quality.QualityConfig, quality)
    }

    /**
     * 是否可以支付这个道具
     */
    isCanPay(showComeFromFlag: boolean = false): boolean {
        return GIns.backpackMgr.isCanPayItem(this, showComeFromFlag);
    }

    /**
     * 获取玩家背包中该道具的数量
     */
    getPlayerBackpackItemCount() {
        return GIns.backpackMgr.getItemCountByItemId(this.itemId);
    }

    getQuality(): number {
        return this.getQualityConfig()?.id || 1;
    }

    /**
     * 是否在变更中
     * @param changeItemIdToCountMap
     */
    isInChangeMap(changeItemIdToCountMap: Map<number, number>): boolean {
        if (changeItemIdToCountMap == null) {
            return false;
        }
        return changeItemIdToCountMap.has(this.itemId);
    }

    /**
     * 是否变更道具中为添加的道具
     * @param changeItemIdToCountMap
     */
    isInChangeMapAndIsAdd(changeItemIdToCountMap: Map<number, number>): boolean {
        if (changeItemIdToCountMap == null) {
            return false;
        }
        return changeItemIdToCountMap.getOrDefault(this.itemId, 0) > 0;
    }

    /**
     * 设置额外服务器数据
     * @param result
     */
    setExtraServerData(result: Vo.reward.RewardResult) {
        // no extra data
        if (!result?.contents) {
            return;
        }

        const itemType = this.getItemType();

        // 英雄碎片
        if (itemType == ServerEnums.ItemType.HERO_FRAGMENT) {
            const heroRewardVo = result.contents as Vo.hero.HeroRewardVo;
            if (heroRewardVo) {
                this._isWithExtraData = true;
                this._extraHeroData = heroRewardVo;

            }
        }
    }

    /**
     * 是否有额外数据
     */
    isWithExtraData(): boolean {
        return this._isWithExtraData;
    }
}
