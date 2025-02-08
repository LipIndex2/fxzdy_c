import { game } from "cc";
import { DEBUG } from "cc/env";

import type { LeagueBargainManager } from "db://assets/scripts/game/modules/leagueBargain/LeagueBargainManager";
import type { ActivityModel } from "./comm/activity/model/ActivityModel";
import type { BattleDebugManager } from "./comm/battle/BattleDebugManager";
import type { BattleLogicManager } from "./comm/battle/BattleLogicManager";
import type { BattleManager } from "./comm/battle/BattleManager";
import type { BattleRecordManager } from "./comm/battle/BattleRecordManager";
import type { BattleExpandManager } from "./comm/battleEx/BattleExpandManager";
import type { WorldLocationManager } from "./comm/battleEx/WorldLocationManager";
import type { AudioManager } from "./comm/mgr/AudioManager";
import type { WorldManager } from "./comm/world/WorldManager";
import type { AccountModel } from "./modules/account/model/AccountModel";
import type { ReconnectMgr } from "./modules/account/ReconnectMgr";
import type { DiamondBankController } from "./modules/activity/diamondBank/DiamondBankController";
import type { AdModel } from "./modules/ad/model/AdModel";
import type { AttrManager } from "./modules/attr/AttrManager";
import type { BackpackManager } from "./modules/backpack/BackpackManager";
import type { BattleModel } from "./modules/battle/model/BattleModel";
import type { CaptainSkillManager } from "./modules/captainSkill/CaptainSkillManager";
import type { CaptainSkillModel } from "./modules/captainSkill/model/CaptainSkillModel";
import type { ChatModel } from "./modules/chat/model/ChatModel";
import type { RedDotManager } from "./modules/common/redDot/RedDotManager";
import type { ConditionManager } from "./modules/condition/ConditionManager";
import type { DailyBossModel } from "./modules/dailyBoss/model/DailyBossModel";
import type { DailySaleModel } from "./modules/dailySale/model/DailySaleModel";
import type { DrawCardManager } from "./modules/drawcard/DrawCardManager";
import type { DrawCardModel } from "./modules/drawcard/model/DrawCardModel";
import type { EmailModel } from "./modules/email/model/EmailModel";
import type { EquipManager } from "./modules/equip/EquipManager";
import type { EquipModel } from "./modules/equip/EquipModel";
import type { FactoryManager } from "./modules/factory/FactoryManager";
import type { FactoryModel } from "./modules/factory/model/FactoryModel";
import type { FightManager } from "./modules/fight/FightManager";
import type { FloatingTextManager } from "./modules/floatingText/FloatingTextManager";
import type { FormationConfigManager } from "./modules/formation/FormationConfigManager";
import type { FormationManager } from "./modules/formation/FormationManager";
import type { FormationModel } from "./modules/formation/model/FormationModel";
import type { FriendModel } from "./modules/friend/model/FriendModel";
import type { GodSequenceModel } from "./modules/godsequence/model/GodSequenceModel";
import type { GuardShipManager } from "./modules/guardShip/GuardShipManager";
import type { GuardShipModel } from "./modules/guardShip/model/GuardShipModel";
import type { GuideManager } from "./modules/guide/GuideManager";
import type { GuideModel } from "./modules/guide/model/GuideModel";
import type { GVGModel } from "./modules/gvg/GVGModel";
import type { HangUpModel } from "./modules/hangup/model/HangUpModel";
import type { HeroManager } from "./modules/hero/HeroManager";
import type { HeroModel } from "./modules/hero/model/HeroModule";
import type { IllustrationsModel } from "./modules/illustrations/model/IllustrationsModel";
import type { ItemModel } from "./modules/item/model/ItemModel";
import type { JumpManager } from "./modules/jump/JumpManager";
import type { LeagueManager } from "./modules/league/leagueManager";
import type { LeagueModel } from "./modules/league/LeagueModel";
import type { LeagueExploreManager } from "./modules/leagueExplore/LeagueExploreManager";
import type { LeagueExploreModel } from "./modules/leagueExplore/model/LeagueExploreModel";
import type { MagicCubeManager } from "./modules/magicCube/MagicCubeManager";
import type { MagicCubeModel } from "./modules/magicCube/MagicCubeModule";
import type { MallModel } from "./modules/mall/model/MallModel";
import type { MapInstanceManager } from "./modules/mapInstance/MapInstanceManager";
import type { MiniMapManager } from "./modules/miniMap/MiniMapManager";
import type { MiniMapModule } from "./modules/miniMap/MiniMapModule";
import type { ModuleOpenManager } from "./modules/moduleopen/ModuleOpenManager";
import type { MonthCardModel } from "./modules/monthCard/model/MonthCardModel";
import type { OrderModel } from "./modules/order/OrderModule";
import type { PetConfigManager } from "./modules/pet/PetConfigManager";
import type { PetModel } from "./modules/pet/PetModel";
import type { PlayerModel } from "./modules/player/model/PlayerModel";
import type { PredictionManager } from "./modules/prediction/PredictionManager";
import type { PredictionModel } from "./modules/prediction/PredictionModel";
import type { PVPModel } from "./modules/pvp/model/PVPModel";
import type { PVPManager } from "./modules/pvp/PVPManager";
import type { RankModel } from "./modules/rank/model/RankModel";
import type { RewardModel } from "./modules/reward/model/RewardModel";
import type { SecretAreaController } from "./modules/secretArea/SecretAreaController";
import type { SecretAreaManager } from "./modules/secretArea/SecretAreaManager";
import type { SecretAreaModule } from "./modules/secretArea/SecretAreaModule";
import type { SettingsModel } from "./modules/settings/model/SettingsModel";
import type { SettingsManager } from "./modules/settings/SettingsManager";
import type { ShopModel } from "./modules/shop/model/ShopModel";
import type { ShopManager } from "./modules/shop/shopManager";
import type { StimulationModel } from "./modules/stimulation/model/StimulationModel";
import type { StimulationManager } from "./modules/stimulation/StimulationManager";
import type { SystemModel } from "./modules/system/model/SystemModule";
import type { TalentModel } from "./modules/talent/model/TalentModel";
import type { TalentManager } from "./modules/talent/TalentManager";
import type { AchievementModel } from "./modules/task/model/AchievementModel";
import type { DailyTaskModel } from "./modules/task/model/DailyTaskModel";
import type { TaskModel } from "./modules/task/model/TaskModel";
import type { TrunkTaskModel } from "./modules/task/model/TrunkTaskModel";
import type { TeamChallengeModel } from "./modules/teamChallenge/model/TeamChallengeModel";
import type { VipModel } from "./modules/vip/model/VipModel";
import type { WeaponModel } from "./modules/weapon/model/WeaponModel";
import type { WeaponManager } from "./modules/weapon/WeaponManager";
import type { WorldBossModel } from "./modules/worldBoss/model/WorldBossModel";
import type { WorldBossManager } from "./modules/worldBoss/WorldBossManager";
import type { CameraAnimUtils } from "./tiledMap/CameraAnimUtils";
import type { MapManager } from "./tiledMap/MapManager";
import type { MapModel } from "./tiledMap/model/MapModule";
import type AreaTriggersManager from "./tiledMap/trigger/AreaTriggersManager";
import type MapVisibleManager from "./tiledMap/visible/MapVisibleManager";
import type { CollectionsModel } from "./modules/collections/CollectionsModel";
import type { CollectionsConfigMgr } from "./modules/collections/config/CollectionsConfigMgr";
import type { CollectionsController } from "./modules/collections/CollectionsController";
import type { ResurgenceManager } from "./ui/resurgence/ResurgenceManager";
import type { UICommonMgr } from "./modules/common/UICommonMgr";
import type { PetDungeonModel } from "./modules/petDungeon/model/PetDungeonModel";
import type { PetDungeonManager } from "./modules/petDungeon/PetDungeonManager";
import { SeasonModel } from "./modules/season/SeasonModel";
import { SeasonManager } from "./modules/season/SeasonManager";
import { SecretSeasonManager } from "./modules/season/seasonSecret/SecretSeasonManager";
import { SecretSeasonController } from "./modules/season/seasonSecret/SecretSeasonController";
import type { CollectiblesDungeonManager } from "./modules/collectiblesDungeon/CollectiblesDungeonManager";
import type { CollectiblesDungeonModel } from "./modules/collectiblesDungeon/model/CollectiblesDungeonModel";
import { CareerTrialModel } from "./modules/careerTrial/CareerTrialModel";
import type { ActivityAutoPopManager } from "./modules/activityAutoPop/ActivityAutoPopManager";
/**
 * 所有业务层的静态实例
 * 跨模块的管理器都需要注入
 * 非跨模块可不注入
 */
export default class GIns {
    /**************************************** 战斗 *******************************************/
    /**战斗管理器 */
    static battleMgr: BattleManager;

    /**战斗逻辑管理器 */
    static battleLogicMgr: BattleLogicManager;

    /**战斗DEBUG管理器 */
    static battleDebugMgr: BattleDebugManager;

    /**战斗记录管理器 */
    static battleRecordMgr: BattleRecordManager;

    /**战斗扩展管理器 */
    static battleExpandMgr: BattleExpandManager;

    /**************************************** 地图 *******************************************/
    /**世界层级管理 */
    static worldMgr: WorldManager;

    /**世界位置记录管理 */
    static WorldLocationMgr: WorldLocationManager;

    /**地图管理器 */
    static mapMgr: MapManager;

    /**地图触发器管理器 */
    static areaTriggersMgr: AreaTriggersManager;

    /**地图可视化管理器 */
    static mapVisibleMgr: MapVisibleManager;

    /**地图数据模块 */
    static mapModel: MapModel;

    /**地图镜头动画工具 */
    static cameraAnimUtils: typeof CameraAnimUtils;

    /**************************************** 工具 ************************************************/

    /**飘字管理器 */
    static floatingTextMgr: FloatingTextManager;

    /**音频管理器 */
    static audioMgr: AudioManager;

    /**断线重连管理器 */
    static reconnectMgr: ReconnectMgr;

    /**条件管理器 */
    static conditionMgr: ConditionManager;

    /**模块开启管理器 */
    static moduleOpenMgr: ModuleOpenManager;

    /**跳转管理器 */
    static jumpManager: JumpManager;

    /************************************** 系统业务 ********************************************/
    /**红点管理器 */
    static redDotMgr: RedDotManager;

    /**属性管理器 */
    static attrMgr: AttrManager;

    /**战力管理器 */
    static fightMgr: FightManager;

    /**布阵配置管理器 */
    static formationCfgMgr: FormationConfigManager;
    /**布阵管理器 */
    static formationMgr: FormationManager;
    /**布阵数据模块 */
    static formationModel: FormationModel;

    /**背包管理器 */
    static backpackMgr: BackpackManager;
    /**道具数据模块 */
    static itemModel: ItemModel;

    /**小地图管理器 */
    static miniMapMgr: MiniMapManager;
    /**小地图数据模块 */
    static miniMapModel: MiniMapModule;

    /**复活管理器 */
    static resurgenceMgr: ResurgenceManager;

    /**账号数据模块 */
    static accountModel: AccountModel;

    /**玩家数据模块 */
    static playerModel: PlayerModel;

    /**系统数据模块 */
    static systemModel: SystemModel;

    /**VIP数据模块 */
    static vipModel: VipModel;

    /**引导管理器 */
    static guideMgr: GuideManager;
    /**引导数据模块 */
    static guideModel: GuideModel;

    /**奖励数据模块 */
    static rewardModel: RewardModel;

    /**战斗数据模块 */
    static battleModel: BattleModel;

    /**聊天数据模块 */
    static chatModel: ChatModel;

    /**充值订单数据模块 */
    static orderModel: OrderModel;

    /**设置管理器 */
    static settingsMgr: SettingsManager;

    /**设置数据模块 */
    static settingsModel: SettingsModel;

    /**公共ui管理器*/
    static uiCommonMgr: UICommonMgr;

    /**************************************** 功能业务 ********************************************/

    /**队长技能管理器 */
    static captainSkillMgr: CaptainSkillManager;
    /**队长技能数据模块 */
    static captainSkillModel: CaptainSkillModel;

    /**装备管理器 */
    static equipMgr: EquipManager;
    /**装备数据模块 */
    static equipModel: EquipModel;

    /**专武管理器 */
    static weaponMgr: WeaponManager;
    /**专武数据模块 */
    static weaponModel: WeaponModel;

    /**英雄管理器 */
    static heroMgr: HeroManager;
    /**英雄数据模块 */
    static heroModel: HeroModel;

    /**天赋管理器 */
    static talentMgr: TalentManager;
    /**天赋数据模块 */
    static talentModel: TalentModel;

    /**抽卡管理器 */
    static drawCardMgr: DrawCardManager;
    /**抽卡数据模块 */
    static drawCardModel: DrawCardModel;

    /**联盟管理器 */
    static LeagueManager: LeagueManager;
    /**联盟数据模块 */
    static LeagueModel: LeagueModel;

    /**邮件数据模块 */
    static emailModel: EmailModel;

    /**好友数据模块 */
    static friendModel: FriendModel;

    /**排行榜数据模块 */
    static rankModel: RankModel;

    /**商店管理器 */
    static shopMgr: ShopManager;
    /**商店数据模块 */
    static shopModel: ShopModel;

    /**商城数据模块 */
    static mallModel: MallModel;

    /** 魔方管理器 */
    static magicCubeMgr: MagicCubeManager;
    /** 魔方数据模块 */
    static magicCubeModel: MagicCubeModel;

    /** 星灵 */
    static petModel: PetModel;
    /** 星灵 数据 */
    static petCfgMgr: PetConfigManager;

    /**广告*/
    static adModel: AdModel;

    /** 经营 */
    static stimulationModel: StimulationModel;
    /** 经营 数据 */
    static stimulationMgr: StimulationManager;

    /** 功能预告 */
    static predictionModel: PredictionModel;
    /** 功能预告 数据 */
    static predictionMgr: PredictionManager;

    /**************************************** 任务类业务 ********************************************/

    /**任务数据模块 */
    static taskModel: TaskModel;

    /**成就数据模块 */
    static achievementModel: AchievementModel;

    /**每日任务数据模块 */
    static dailyTaskModel: DailyTaskModel;

    /**主线任务数据模块 */
    static trunkTaskModel: TrunkTaskModel;

    /**图鉴数据模块 */
    static illustrationsModel: IllustrationsModel;

    /**************************************** 玩法 ********************************************/


    static secretAreaModule: SecretAreaModule;
    static secretAreaCtrl: SecretAreaController;
    static secretAreaMgr: SecretAreaManager;

    static secretSeasonCtrl: SecretSeasonController;
    static secretSeasonMgr: SecretSeasonManager;

    static collectionsModel: CollectionsModel;
    static collectionsCfgMgr: CollectionsConfigMgr;
    static collectionsCtr: CollectionsController;

    static mapInstanceMgr: MapInstanceManager;

    static pvpMgr: PVPManager;

    static pvpModel: PVPModel;

    static worldBossMgr: WorldBossManager;

    static worldBossModel: WorldBossModel;

    static dailyBossModel: DailyBossModel;

    static godSequenceModel: GodSequenceModel;

    static hangUpModel: HangUpModel;

    static guardShipModel: GuardShipModel;

    static guardShipMgr: GuardShipManager;

    static GVGModel: GVGModel;

    static LeagueBargainManager: LeagueBargainManager;

    static factoryModel: FactoryModel;

    static factoryMgr: FactoryManager;

    static teamChallengeModel: TeamChallengeModel;

    static leagueExploreModel: LeagueExploreModel;

    static leagueExploreMgr: LeagueExploreManager;

    static petDungeonModel: PetDungeonModel;

    static petDungeonMgr: PetDungeonManager;

    static seasonModel: SeasonModel;

    static seasonManager: SeasonManager;

    static collectiblesDungeonModel: CollectiblesDungeonModel;

    static collectiblesDungeonMgr: CollectiblesDungeonManager;

    static careerTrialModel: CareerTrialModel;

    /**************************************** 活动 ********************************************/

    static monthCardModel: MonthCardModel;

    static activityModel: ActivityModel;

    static diamondBankCtr: DiamondBankController;

    /**每日特惠数据模块 */
    static dailySaleModel: DailySaleModel;

    /**活动自动弹框管理器*/
    static activityAutoPopMgr:ActivityAutoPopManager;

    /**************************************** 检测 ************************************************/
    /**检查未注入的实例 */
    static checkNotInjectIns() {
        if (!DEBUG) return;

        /** 定时器是为了能看到打印  */
        setTimeout(() => {
            let hasEmpty = false;
            let keys = Object.keys(this);
            for (let index = 0; index < keys.length; index++) {
                let k = keys[index];
                if (!this[k]) {
                    console.error(` >>>>>>>>>>>>>>>>>>>>>> GIns.${k} 未注入 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< `);
                    hasEmpty = true;
                }
            }
            if (hasEmpty) {
                game.pause();
                throw new Error("实例未注入!!!!");
            }
        }, 3000);
    }
}
