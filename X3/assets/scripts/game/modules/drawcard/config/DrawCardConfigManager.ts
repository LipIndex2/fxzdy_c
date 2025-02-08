import { TableManager } from "db://assets/scripts/core/table/TableManager";
import G from "db://assets/scripts/core/comm/G";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { ConditionManager } from "db://assets/scripts/game/modules/condition/ConditionManager";

export class DrawCardConfigManager {

    //  weapon score
    private static _weaponScoreBoxConfig: table.recruit.AwakeWeaponRecruitScoreConfig;
    // weapon
    private static _spineForWeaponArmLeft: string = "";
    private static _spineForWeaponArmRight: string = "";
    private static _jumpIdForWeaponRightTab1: number = 0;
    private static _weaponSkipAnimNeedDrawCount: number = 0;
    private static _weaponDrawFirstGainLogoAssetPath: string = "";
    private static _ensureNeedDrawCount: number = 0;

    // 是否初始化过
    private static _isInit: boolean = false;
    private static _normalShopJumpId: number = 0;
    private static _normalShopNeedHeroStarCount: number = 0;
    private static _maxProgressCount: number = 0;

    static init() {
        if (this._isInit) {
            return;
        }
        this._isInit = true;


        this._weaponScoreBoxConfig = TableManager.getDataById(table.recruit.AwakeWeaponRecruitScoreConfig, 1);
        this._spineForWeaponArmLeft = TableManager.getDataById(table.recruit.RecruitConstantConfig, "RECRUIT:client:weaponArmLeft").content;
        this._spineForWeaponArmRight = TableManager.getDataById(table.recruit.RecruitConstantConfig, "RECRUIT:client:weaponArmRight").content;
        this._jumpIdForWeaponRightTab1 = TableManager.getDataById(table.recruit.RecruitConstantConfig, "RECRUIT:client:jumpIdForWeaponRightTab1")?.content?.toInt() || 0;
        this._weaponSkipAnimNeedDrawCount = TableManager.getDataById(table.recruit.RecruitConstantConfig, "RECRUIT:client:weaponSkipAnimNeedDrawCount")?.content?.toInt() || 0;
        this._weaponDrawFirstGainLogoAssetPath = TableManager.getDataById(table.recruit.RecruitConstantConfig, "RECRUIT:client:weaponDrawFirstGainLogoAssetPath")?.content || "";
        this._ensureNeedDrawCount = TableManager.getDataById(table.recruit.RecruitConstantConfig, "RECRUIT:GUARANTEE_TIMES")?.content?.toInt() || 0;
        this._normalShopJumpId = TableManager.getDataById(table.recruit.RecruitConstantConfig, "RECRUIT:NORMAL_SHOP_JUMP_ID")?.content?.toInt() || 0;
        this._normalShopNeedHeroStarCount = TableManager.getDataById(table.recruit.RecruitConstantConfig, "RECRUIT:NORMAL_SHOP_OPEN_NEED_ONE_HERO_STAR_COUNT")?.content?.toInt() || 0;

        for (let c of this.getNormalProgressConfigArray()) {
            this._maxProgressCount = Math.max(c.id, this._maxProgressCount);
        }
    }


    static get isInit(): boolean {
        return this._isInit;
    }

    static get maxProgressCount(): number {
        return this._maxProgressCount;
    }

    static get normalShopNeedHeroStarCount(): number {
        return this._normalShopNeedHeroStarCount;
    }

    static get normalShopJumpId(): number {
        return this._normalShopJumpId;
    }

    static get ensureNeedDrawCount(): number {
        return this._ensureNeedDrawCount;
    }

    static get weaponDrawFirstGainLogoAssetPath(): string {
        return this._weaponDrawFirstGainLogoAssetPath;
    }

    static get weaponSkipAnimNeedDrawCount(): number {
        return this._weaponSkipAnimNeedDrawCount;
    }

    static get jumpIdForWeaponRightTab1(): number {
        return this._jumpIdForWeaponRightTab1;
    }

    static get spineForWeaponArmLeft(): string {
        return this._spineForWeaponArmLeft;
    }

    static get spineForWeaponArmRight(): string {
        return this._spineForWeaponArmRight;
    }

    static get weaponScoreBoxConfig(): table.recruit.AwakeWeaponRecruitScoreConfig {
        return this._weaponScoreBoxConfig;
    }

    /**
     * 获取卡池消耗配置
     */
    static getDrawCardConfigById(id: ServerEnums.RecruitType): table.recruit.RecruitConfig {
        return TableManager.getDataById(table.recruit.RecruitConfig, id)
    }

    /**
     * 抽卡结果，【恭喜获得的标题】 spine 动画路径
     */
    static getDrawCardGainItemTitleSpineAssetPath(): string {
        return G.TableManager.getDataById(table.recruit.RecruitConstantConfig, "RECRUIT:gainItemTitleSpineAssetPath").content;
    }


    static getHeadIcon1ItemId(): number {
        return G.TableManager.getDataById(table.recruit.RecruitConstantConfig, "RECRUIT:headIcon1").content.toInt()
    }

    /**
     * 头顶图标2的item id
     */
    static getHeadIcon2ItemId(): number {
        return G.TableManager.getDataById(table.recruit.RecruitConstantConfig, "RECRUIT:headIcon2").content.toInt()
    }


    /**
     * 获取所有进度配置, 普通卡池
     */
    static getNormalProgressConfigArray(): table.recruit.NormalRecruitProgressConfig[] {
        return G.TableManager.getAllData(table.recruit.NormalRecruitProgressConfig)
    }

    // 获取抽卡消耗的道具id
    static getDrawCardCostItemIdByType(type: ServerEnums.RecruitType): number {
        return this.getDrawCardConfigById(type)?.costItems[0]?.k as number || 0;
    }

    // 获取抽卡消耗的道具id
    static getDrawCardCostItemByType(type: ServerEnums.RecruitType): NoOwnerItem {
        const costItem = this.getDrawCardConfigById(type)?.costItems[0];

        const itemId = costItem?.k as number;
        const count = costItem?.v as number;

        return NoOwnerItem.create(
            itemId,
            count
        );
    }

    /**
     * 是否可以开启这个界面
     * @param type
     */
    static isCanOpen(type: ServerEnums.RecruitType): boolean {
        const config = this.getDrawCardConfigById(type);
        return ConditionManager.ins().checkCondition(config?.openCondition, true, false);
    }


}