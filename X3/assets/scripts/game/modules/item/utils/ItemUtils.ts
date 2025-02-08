import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import G from "db://assets/scripts/core/comm/G";
import { DataStream } from "db://assets/scripts/core/utils/DataStream";
import { Color } from "cc";
import { TableManager } from "../../../../core/table/TableManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { Logger } from "db://assets/scripts/core/log/Logger";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import { TeamChallengeConfigManager } from "../../teamChallenge/config/TeamChallengeConfigManager";

/**
 * 物品工具
 * 无主道具文本 = "itemId:count;itemId:count;..."
 *
 * @author LuoHaoJun
 */
export class ItemUtils {
    /**
     * 获取道具配置
     * @param itemId 物品id
     */
    static getItemConfigByItemId(itemId: number): table.item.ItemConfig | null {
        return G.TableManager.getDataById(table.item.ItemConfig, itemId);
    }

    /**
     * 解析只有一个道具的情况
     * @param itemStr 道具文本
     */
    static parseStringToOnlyOneItem(itemStr: string): NoOwnerItem | null {
        const noOwnerItems = this.parseStringToNoOwnerItemArray(itemStr);
        if (noOwnerItems && noOwnerItems.length >= 1) {
            return noOwnerItems[0];
        }
        return null;
    }

    /**
     * 解析 kv 数组 -> 只有一个道具
     * @param itemKvArray
     * @return NoOwnerItem 单个道具
     */
    static parseKvArrayToOnlyOneItem(itemKvArray: Array<{ k: any; v: any }>): NoOwnerItem | null {
        const noOwnerItems = this.parseKvArrayToItemArray(itemKvArray);
        if (noOwnerItems && noOwnerItems.length >= 1) {
            return noOwnerItems[0];
        }
        return null;
    }

    /**
     * 对无主物品进行特效赋值
    */
    static noOwnerItemEffect(items: NoOwnerItem[], effect: any): void {
        if (items?.length) {
            for (let i = 0; i < items.length; i++) {
                if (effect && effect[i])
                    items[i].effect = effect[i];
            }
        }
    }

    /**
     * 解析 kv 数组 -> 无主物品[]
     * @param itemKvArray
     */
    static parseKvArrayToItemArray(itemKvArray: Array<{ k: any; v: any }>): Array<NoOwnerItem> {
        if (ArrayUtils.isEmpty(itemKvArray)) {
            return [];
        }
        let itemArray: NoOwnerItem[] = []
        try {
            itemArray = itemKvArray
                .toDataStream()
                .map((kv) => {
                    if (!kv) {
                        return null;
                    }
                    const k = kv.k;
                    const v = kv.v;
                    if (k == null || v == null) {
                        return null;
                    }

                    const itemId = Number.parseInt(k.toString());
                    const count = Number.parseInt(v.toString());
                    if (isNaN(itemId) && isNaN(count)) {
                        return null;
                    }
                    return NoOwnerItem.create(itemId, count);
                })
                .filterNotNull()
                .toArray();

        } catch (e) {
            Logger.error("道具文本配置报错", itemKvArray)
            return [];
        }
        if (itemArray.length !== itemKvArray.length) {
            G.Logger.warn(`【物品工具】物品解析失败，解析结果长度与原始字符串长度不一致。原始字符串：${itemKvArray}，解析结果：${itemArray.toString()}`);
        }
        return itemArray;
    }

    /**
     * 解析文本 -> 无主物品[]
     * @param itemStr
     */
    static parseStringToNoOwnerItemArray(itemStr: string): Array<NoOwnerItem> {
        if (!itemStr) {
            return [];
        }
        const splitArray = itemStr
            .split(";")
            .toDataStream()
            .filter((it) => it.trim() !== "")
            .toArray();
        const itemArray = splitArray
            .toDataStream()
            .map((it) => {
                if (it.trim() === "") {
                    return null;
                }
                const itemIdToCountArray = it.split(":");
                if (itemIdToCountArray.length !== 2) {
                    return null;
                }
                const itemId = Number.parseInt(itemIdToCountArray[0].trim());
                const count = Number.parseInt(itemIdToCountArray[1].trim());
                if (isNaN(itemId) && isNaN(count)) {
                    return null;
                }
                return NoOwnerItem.create(itemId, count);
            })
            .filter((it) => it !== null)
            .toArray();
        if (itemArray.length !== splitArray.length) {
            G.Logger.warn(`【物品工具】物品解析失败，解析结果长度与原始字符串长度不一致。原始字符串：${itemStr}，解析结果：${itemArray.toString()}`);
        }
        return itemArray;
    }

    /**
     * 获取服务器相应变更的道具ID列表
     * @param useItemResultVo
     */
    static getChangeItemIdsByServerResult(useItemResultVo: Vo.item.UseItemResultVo): Map<number, number> {
        if (!useItemResultVo) {
            return new Map<number, number>();
        }

        const output = DataStream.createNew<Vo.cost.CostItemResult>();
        if (useItemResultVo.costItemResults) {
            const costItemIdDataStream = useItemResultVo.costItemResults.toDataStream();
            output.mergeStream(costItemIdDataStream);
        }
        if (useItemResultVo.rewardResults) {
            const costItemIdDataStream = useItemResultVo.rewardResults.toDataStream();
            output.mergeStream(costItemIdDataStream);
        }
        return output.toMap(
            (it) => it.baseId,
            (it) => it.amount,
            (v1, v2) => v1 + v2
        );
    }

    static parseStringToServerRewardItem(rewardText: string): Array<Vo.reward.Reward> {
        const noOwnerItems = ItemUtils.parseStringToNoOwnerItemArray(rewardText);
        if (noOwnerItems.length === 0) {
            return [];
        }
        return noOwnerItems.map((it) => {
            return {
                code: it.itemId,
                amount: it.count,
            } as Vo.reward.Reward;
        });
    }

    /**合并同k值道具奖励 -- Object1  */
    public static combineObject1s(tlObj: Array<any>): Array<any> {
        let newArr: Array<any> = [];
        let idMap: Object = {};
        let count: number = 0;
        for (let i = 0; i < tlObj.length; i++) {
            if (idMap[tlObj[i].k]) {
                let lo: table.item.ItemConfig = TableManager.getDataById(table.item.ItemConfig, tlObj[i].k);
                newArr[idMap[tlObj[i].k] - 1].v += tlObj[i].v;
                continue;
            }
            count++;
            newArr.push({ k: tlObj[i].k, v: tlObj[i].v });
            idMap[tlObj[i].k] = count;
        }
        return newArr;
    }

    /** 获取对应品质的卡牌背景图（长条大图） */
    static getHeroItem2Bg(quality: number) {
        return "image/quality/kapai" + quality + "_frame" || null;
    }

    /** 获取对应品质的阵位地图（六边形图） */
    static getFormationItemBg(quality: number) {
        return "image/quality/dizuo" + quality || null;
    }

    /** 获取对应品质的皮肤底图*/
    static getHeroSkinBg(quality: number) {
        return "image/quality/img_skin_quality" + quality || null;
    }

    /** 获取对应阵营icon */
    static getCampIcon(type: number) {
        let pash = "";
        switch (type) {
            case 1:
                pash = "image/icon/zyrz_icon";
                break;
            case 2:
                pash = "image/icon/zysm_icon";
                break;
            case 3:
                pash = "image/icon/zyzx_icon";
                break;
            case 4:
                pash = "image/icon/zyym_icon";
                break;
        }
        return pash;
    }

    /** 获取对应职业icon */
    static getCareerIcon(type: number) {
        let pash = "";
        switch (type) {
            case 1:
                pash = "image/icon/zysh_icon";
                break;
            case 2:
                pash = "image/icon/zygd_icon";
                break;
            case 3:
                pash = "image/icon/zyyn_icon";
                break;
            case 4:
                pash = "image/icon/zysj_icon";
                break;
            case 5:
                pash = "image/icon/zyzq_icon";
                break;
            case 6:
                pash = "image/icon/zyfz_icon";
                break;
        }
        return pash;
    }

    /** 获取对应职业icon */
    static getCareerIconNoBg(type: number) {
        let pash = "";
        switch (type) {
            case 1:
                pash = "image/icon/zysh01_icon";
                break;
            case 2:
                pash = "image/icon/zygd01_icon";
                break;
            case 3:
                pash = "image/icon/zyyn01_icon";
                break;
            case 4:
                pash = "image/icon/zysj01_icon";
                break;
            case 5:
                pash = "image/icon/zyzq01_icon";
                break;
            case 6:
                pash = "image/icon/zyfz01_icon";
                break;
        }
        return pash;
    }

    /** 获取对应职业名称 */
    static getCareerName(type: number) {
        let name = "";
        switch (type) {
            case 1:
                name = "守护";
                break;
            case 2:
                name = "格斗";
                break;
            case 3:
                name = "异能";
                break;
            case 4:
                name = "射击";
                break;
            case 5:
                name = "重骑";
                break;
            case 6:
                name = "辅助";
                break;
        }
        return name;
    }

    /**
     * 获取品质的资源
     * @param quality
     */
    static getQualityIconResourcePath(quality: number): string | null {
        return G.TableManager.getDataById(table.quality.QualityConfig, quality)?.itemQualityBgPath || null;
    }

    /**
     * 获取掉落资源
     * @param quality
     */
    static getDropModelByQuality(quality: number): number {
        if (quality > 6) quality = 6;
        return G.TableManager.getDataById(table.quality.QualityConfig, quality)?.dropModelId;
    }

    /** 获取通用字体品质色 */
    static getTextColor(quality: number) {
        let color = "";
        switch (quality) {
            case 1:
                color = "#d9e2ea";
                break;
            case 2:
                color = "#44ff5a";
                break;
            case 3:
                color = "#41a8ff";
                break;
            case 4:
                color = "#db83ff";
                break;
            case 5:
                color = "#fde963";
                break;
            case 6:
                color = "#ff5151";
                break;
            default:
                color = "#ff5151";
                break;
        }
        return new Color(color);
    }

    /** 获取通用字体品质色(返回的是颜色字符串，富文本用) */
    static getTextColorText(quality: number) {
        let color = "";
        switch (quality) {
            case 1:
                color = "#d9e2ea";
                break;
            case 2:
                color = "#44ff5a";
                break;
            case 3:
                color = "#41a8ff";
                break;
            case 4:
                color = "#db83ff";
                break;
            case 5:
                color = "#fde963";
                break;
            case 6:
                color = "#ff5151";
                break;
            default:
                color = "#ff5151";
                break;
        }
        return color;
    }

    /** 获取品质表字体品质色 */
    static getTextColorByQualityCfg(quality: number) {
        let color = G.TableManager.getDataById(table.quality.QualityConfig, quality)?.fontColor || "#FF5656";
        return new Color(color);
    }

    static getTextByQuality(quality: number) {
        let text = "";
        switch (quality) {
            case 1:
                text = "普通";
                break;
            case 2:
                text = "高级";
                break;
            case 3:
                text = "稀有";
                break;
            case 4:
                text = "史诗";
                break;
            case 5:
                text = "传说";
                break;
            case 6:
                text = "神话";
                break;
            default:
                text = "神话";
                break;
        }
        return text;
    }

    /** 获取通用字体描边品质色 */
    static getTextOutlineColor(quality: number) {
        let color = "";
        switch (quality) {
            case 1:
                color = "#000308";
                break;
            case 2:
                color = "#000801";
                break;
            case 3:
                color = "#010a1b";
                break;
            case 4:
                color = "#24002e";
                break;
            case 5:
                color = "#190d00";
                break;
            case 6:
                color = "#130000";
                break;
            default:
                color = "#130000";
                break;
        }
        return new Color(color);
    }

    /** 获取英雄半身像 */
    static getHalfHeroHead(name: string) {
        let pash = "image/heroHead/" + name;
        return pash;
    }

    /** 获取英雄头像像 */
    static getNormalHeroHead(name: string) {
        let pash = "image/heroNormalHead/" + name;
        return pash;
    }

    /** 根据路径获取头像 */
    static getNormaHeadByPath(path: string) {
        return path;
    }

    /** 获取当前星级图片 */
    static getStarIcon(num: number) {
        let id = Math.floor((num - 1) / 5) + 1; //1-5
        // return `image/star/xj${id}_icon`;
        return `ui://comm/xj${id}_icon`;
    }

    /**
     * 转换奖励道具
     * @param rewardItems
     */
    static convertToNoOwnerItemArrayByServerRewards(rewardItems: Vo.reward.RewardResult[]): NoOwnerItem[] {
        if (!rewardItems) {
            return [];
        }
        return rewardItems
            .toDataStream()
            .map((it) => {
                if (!it) {
                    return null;
                }
                const item = NoOwnerItem.create(it.baseId, it.amount);
                item.setExtraServerData(it);
                return item;
            })
            .filterNotNull()
            .toArray();
    }

    static parseServerRewardToItems(rewardResults: Array<Vo.reward.RewardResult>) {
        if (!rewardResults) {
            return [];
        }
        return rewardResults
            .map((it) => {
                if (!it) {
                    return null;
                }
                return NoOwnerItem.create(it.baseId, it.amount);
            })
            .filter((it) => it != null);
    }

    /**
     * 合并两个道具数组
     * @param v1
     * @param v2
     */
    static mergeItemArray(
        v1: Array<NoOwnerItem>,
        v2: Array<NoOwnerItem> | null = null
    ): NoOwnerItem[] {
        const map = new Map<number, number>();
        v1?.forEach((it) => {
            map.set(it.itemId, (map.get(it.itemId) || 0) + it.count);
        });
        v2?.forEach((it) => {
            map.set(it.itemId, (map.get(it.itemId) || 0) + it.count);
        });
        return Array.from(map.entries())
            .map(([itemId, count]) => NoOwnerItem.create(itemId, count))
            .filter((it) => it != null);
    }

    static getItemTypeById(itemId: number): ServerEnums.ItemType | null {
        const config = this.getItemConfigByItemId(itemId);

        return ServerEnums.ItemType[config?.type];
    }

    /**
     * 是否英雄
     * @param itemId
     */
    static isHero(itemId: number): boolean {
        return this.getItemTypeById(itemId) == ServerEnums.ItemType.HERO_CARD;
    }

    static isFragment(itemId: number): boolean {
        return this.getItemTypeById(itemId) == ServerEnums.ItemType.HERO_FRAGMENT;
    }

    /**是否是助战值 */
    static isTeamValue(itemId: number) {
        return +TeamChallengeConfigManager.getConstValue('TEAM_INSTANCE:INTEGRAL_ITEM_ID') == itemId;
    }
}
