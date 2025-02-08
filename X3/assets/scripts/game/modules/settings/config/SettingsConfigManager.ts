import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { ConditionManager } from "../../condition/ConditionManager";
import GIns from "../../../GIns";
import { EnumConditionType } from "../../condition/enum/EnumConditionType";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { PlayerInfoConfigManager } from "../../player/config/PlayerInfoConfigManager";
import { EnumClientItemType } from "../../backpack/EnumClientItemType";
import { TeamChallengeConfigManager } from "../../teamChallenge/config/TeamChallengeConfigManager";
import G from "../../../../core/comm/G";

/**
 * 设置 / 玩家信息
 */
export class SettingsConfigManager {

    private static _costItemForChangeName: NoOwnerItem;
    private static _freeCnt: number = 0;
    private static _heroSkinImageMap: Map<string, number> = new Map();
    private static _skinImageIds:number[] = []

    /**
     * 是否允许震动
     */
    public static canShake: boolean = true;


    // 默认头像id
    private static _defaultHeadIconId: number = 1;
    // 默认头像框id
    private static _defaultHeadFrameId: number = 1;
    // 默认形象id
    private static _defaultShowHeroId: number = 1;
    // 默认称号id
    private static _defaultTitleId: number = 1;
    // 默认聊天字体id
    private static _defaultChatColorId: number = 1;
    // 默认聊天背景id
    private static _defaultChatBoxId: number = 1;

    static init() {

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
        this._defaultChatBoxId = TableManager.getDataById(table.set.SetConstantConfig, "SET:DEFAULT_CHAT_BOX_ID")
            .content
            .toInt();
        this._defaultChatColorId = TableManager.getDataById(table.set.SetConstantConfig, "SET:DEFAULT_CHAT_COLOR_ID")
            .content
            .toInt();

        this._freeCnt = TableManager.getDataById(table.set.SetConstantConfig, "SET:FREE_CHANGE_NAME_TIMES").content.toInt();
        const costItemStr = TableManager.getDataById(table.set.SetConstantConfig, "SET:CHANGE_NAME_COSTS").content;
        this._costItemForChangeName = ItemUtils.parseStringToOnlyOneItem(costItemStr);

        if (this._heroSkinImageMap.size <= 0) {
            let allCfgs = TableManager.getAllData(table.set.SetShowConfig)
            allCfgs.forEach((cfg) => {
                let condition = ConditionManager.ins().getCondition(cfg.unlockCondition, EnumConditionType.ASSIGN_HERO_ACTIVE_SKIN)
                if (condition) {
                    this._heroSkinImageMap.set(condition.param() + '_' + condition.value(), cfg.id)
                    this._skinImageIds.push(cfg.id)
                }
            })
        }

    }

    static get defaultHeadIconId(): number {
        return this._defaultHeadIconId;
    }

    static get defaultHeadFrameId(): number {
        return this._defaultHeadFrameId;
    }

    static get defaultShowHeroId(): number {
        return this._defaultShowHeroId;
    }

    static get defaultTitleId(): number {
        return this._defaultTitleId;
    }

    static get defaultChatColorId(): number {
        return this._defaultChatColorId;
    }

    static get defaultChatBoxId(): number {
        return this._defaultChatBoxId;
    }

    static get costItemForChangeName(): NoOwnerItem {
        return this._costItemForChangeName;
    }

    static get freeCnt(): number {
        return this._freeCnt;
    }

    /**
     * 获取显示配置
     * @param settingId
     */
    static getShowConfigById(settingId: number) {
        return TableManager.getDataById(table.set.SetShowConfig, settingId);
    }

    /**获取皮肤对应形象id*/
    static getSkinImageId(heroId:number, skinId:number):number {
        let key:string = heroId + '_' + skinId
        if (this._heroSkinImageMap.has(key)) {
            return this._heroSkinImageMap.get(key)
        }
        return 0
    }

    /**是否是皮肤形象id*/
    static isSkinImageId(id:number):boolean {
        return this._skinImageIds.indexOf(id) != -1
    }

    static getHeroIdByImageId(imageId: number) : number{
        return this.getShowConfigById(imageId)?.heroId || 0;
    }

    /**获取模型id*/
    static getModelIdByImageId(imageId:number):number {
        let cfg = this.getShowConfigById(imageId);
        if (cfg) {
            if (cfg.heroModelId) {
                return cfg.heroModelId;
            }
            if (cfg.heroId) {
                let heroCfg = G.TableManager.getDataById(table.hero.HeroConfig, cfg.heroId);
                if (heroCfg) {
                    return heroCfg.modelId;
                }
            }
        }
        return 0;
    }

    static  _tclist:table.set.SetShowConfig[];
    /**获取助战值获取的头像框 */
    static getFrameByTC():table.set.SetShowConfig[]{
        if(this._tclist){
            return this._tclist;
        }
        this._tclist = [];
        const frames = PlayerInfoConfigManager.getConfigArrayInSortByType(ServerEnums.ShowInfoType.HEAD_FRAME);
        const items = TeamChallengeConfigManager.getFrameItems();
        for(let frame of frames){
            if(items.indexOf(frame.itemId) != -1){
                this._tclist.push(frame);
            }
        }
        return this._tclist;
    }


    /**是否是助战激活的头像框 */
    static isTcFrame(id:number){
        const tclist = this.getFrameByTC();
        const index = tclist.findIndex(v=>{
            return v.id == id;
        })
        return index !== -1;
    }

}