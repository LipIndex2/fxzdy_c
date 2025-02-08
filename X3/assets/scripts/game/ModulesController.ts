import {
    CaptainSkillConfigManager
} from "db://assets/scripts/game/modules/captainSkill/config/CaptainSkillConfigManager";
import { CaptainSkillModel } from "db://assets/scripts/game/modules/captainSkill/model/CaptainSkillModel";
import { ChatConfigManager } from "db://assets/scripts/game/modules/chat/config/ChatConfigManager";
import { ChatModel } from "db://assets/scripts/game/modules/chat/model/ChatModel";
import { RedDotManager } from "db://assets/scripts/game/modules/common/redDot/RedDotManager";
import { ConditionManager } from "db://assets/scripts/game/modules/condition/ConditionManager";
import { DailyBossModel } from "db://assets/scripts/game/modules/dailyBoss/model/DailyBossModel";
import { DrawCardConfigManager } from "db://assets/scripts/game/modules/drawcard/config/DrawCardConfigManager";
import { DrawCardModel } from "db://assets/scripts/game/modules/drawcard/model/DrawCardModel";
import { EmailModel } from "db://assets/scripts/game/modules/email/model/EmailModel";
import { GodSequenceConfigManager } from "db://assets/scripts/game/modules/godsequence/config/GodSequenceConfigManager";
import { GodSequenceModel } from "db://assets/scripts/game/modules/godsequence/model/GodSequenceModel";
import { GrowthPathConfigManager } from "db://assets/scripts/game/modules/growthpath/config/GrowthPathConfigManager";
import { HangUpConfigManager } from "db://assets/scripts/game/modules/hangup/config/HangUpConfigManager";
import { HangUpModel } from "db://assets/scripts/game/modules/hangup/model/HangUpModel";
import { IntegralModel } from "db://assets/scripts/game/modules/integral/IntegralModel";
import { ItemConfigManager } from "db://assets/scripts/game/modules/item/config/ItemConfigManager";
import { PVPModel } from "db://assets/scripts/game/modules/pvp/model/PVPModel";
import { RankConfigManager } from "db://assets/scripts/game/modules/rank/config/RankConfigManager";
import { RankModel } from "db://assets/scripts/game/modules/rank/model/RankModel";
import { SettingsModel } from "db://assets/scripts/game/modules/settings/model/SettingsModel";
import { TalentConfigManager } from "db://assets/scripts/game/modules/talent/config/TalentConfigManager";
import { TalentModel } from "db://assets/scripts/game/modules/talent/model/TalentModel";
import { AchievementModel } from "db://assets/scripts/game/modules/task/model/AchievementModel";
import { DailyTaskModel } from "db://assets/scripts/game/modules/task/model/DailyTaskModel";
import { TaskModel } from "db://assets/scripts/game/modules/task/model/TaskModel";
import { TrunkTaskModel } from "db://assets/scripts/game/modules/task/model/TrunkTaskModel";
import { BaseController } from "../core/mvc/controller/BaseController";
import { IReportData, ReportDataType } from "../core/sdk/SdkBase";
import { SdkManager } from "../core/sdk/SdkManager";
import { TableManager } from "../core/table/TableManager";
import { TimeManager } from "../core/time/TimeManager";
import LoginNotificationKey from "../main/modules/LoginNotificationKey";
import { ChooseServerModel } from "../main/modules/login/model/ChooseServerModel";
import { CheckAccountTask } from "../main/procedure/connectTask/CheckAccountTask";
import LocalStorage from "./comm/cache/LocalStorage";
import { ReconnectMgr } from "./modules/account/ReconnectMgr";
import { AccountModel } from "./modules/account/model/AccountModel";
import { BattleModel } from "./modules/battle/model/BattleModel";
import { DailySaleModel } from "./modules/dailySale/model/DailySaleModel";
import { EquipController } from "./modules/equip/EquipController";
import { EquipModel } from "./modules/equip/EquipModel";
import { FormationManager } from "./modules/formation/FormationManager";
import { FormationModel } from "./modules/formation/model/FormationModel";
import { FriendModel } from "./modules/friend/model/FriendModel";
import { HeroController } from "./modules/hero/HeroController";
import { HeroManager } from "./modules/hero/HeroManager";
import { HeroModel } from "./modules/hero/model/HeroModule";
import { IllustrationsModel } from "./modules/illustrations/model/IllustrationsModel";
import { LeagueModel } from "./modules/league/LeagueModel";
import { MallModel } from "./modules/mall/model/MallModel";
import { MonthCardModel } from "./modules/monthCard/model/MonthCardModel";
import { OrderModel } from "./modules/order/OrderModule";
import { PlayerModel } from "./modules/player/model/PlayerModel";
import { RewardModel } from "./modules/reward/model/RewardModel";
import { ShopModel } from "./modules/shop/model/ShopModel";
import { SystemModel } from "./modules/system/model/SystemModule";
import { VipModel } from "./modules/vip/model/VipModel";
import { WeaponModel } from "./modules/weapon/model/WeaponModel";
import { WorldBossModel } from "./modules/worldBoss/model/WorldBossModel";
import { MapModel } from "./tiledMap/model/MapModule";

import { ActivityConfigManager } from "db://assets/scripts/game/comm/activity/config/ActivityConfigManager";
import { BattleConfigManager } from "db://assets/scripts/game/comm/battle/config/BattleConfigManager";
import {
    ActivityFlipCardConfigManager
} from "db://assets/scripts/game/modules/activity/activityFlipCard/config/ActivityFlipCardConfigManager";
import {
    HeroSupplyConfigManager
} from "db://assets/scripts/game/modules/activity/heroSupply/config/HeroSupplyConfigManager";
import { SevenDayConfigManager } from "db://assets/scripts/game/modules/activity/sevenDay/config/SevenDayConfigManager";
import { SignInConfigManager } from "db://assets/scripts/game/modules/activity/signIn/config/SignInConfigManager";
import { CollectionsController } from "db://assets/scripts/game/modules/collections/CollectionsController";
import { CollectionsModel } from "db://assets/scripts/game/modules/collections/CollectionsModel";
import { CollectionsConfigMgr } from "db://assets/scripts/game/modules/collections/config/CollectionsConfigMgr";
import { GVGModel } from "db://assets/scripts/game/modules/gvg/GVGModel";
import { GVGConfigManager } from "db://assets/scripts/game/modules/gvg/config/GVGConfigManager";
import { ItemModel } from "db://assets/scripts/game/modules/item/model/ItemModel";
import { LeagueBargainManager } from "db://assets/scripts/game/modules/leagueBargain/LeagueBargainManager";
import {
    LeagueBargainConfigManager
} from "db://assets/scripts/game/modules/leagueBargain/config/LeagueBargainConfigManager";
import GIns from "./GIns";
import { ActivityModel } from "./comm/activity/model/ActivityModel";
import { BattleDebugManager } from "./comm/battle/BattleDebugManager";
import { BattleLogicManager } from "./comm/battle/BattleLogicManager";
import { BattleManager } from "./comm/battle/BattleManager";
import { BattleRecordManager } from "./comm/battle/BattleRecordManager";
import { BattleExpandManager } from "./comm/battleEx/BattleExpandManager";
import { WorldLocationManager } from "./comm/battleEx/WorldLocationManager";
import { AudioManager } from "./comm/mgr/AudioManager";
import { WorldManager } from "./comm/world/WorldManager";
import { DiamondBankController } from "./modules/activity/diamondBank/DiamondBankController";
import { ActivityAutoPopManager } from "./modules/activityAutoPop/ActivityAutoPopManager";
import { AdModel } from "./modules/ad/model/AdModel";
import { AttrManager } from "./modules/attr/AttrManager";
import { BackpackManager } from "./modules/backpack/BackpackManager";
import { CaptainSkillManager } from "./modules/captainSkill/CaptainSkillManager";
import { CareerTrialModel } from "./modules/careerTrial/CareerTrialModel";
import { CollectiblesDungeonManager } from "./modules/collectiblesDungeon/CollectiblesDungeonManager";
import { CollectiblesDungeonModel } from "./modules/collectiblesDungeon/model/CollectiblesDungeonModel";
import { UICommonMgr } from "./modules/common/UICommonMgr";
import { DrawCardManager } from "./modules/drawcard/DrawCardManager";
import { EquipManager } from "./modules/equip/EquipManager";
import { FactoryManager } from "./modules/factory/FactoryManager";
import { FactoryModel } from "./modules/factory/model/FactoryModel";
import { FightManager } from "./modules/fight/FightManager";
import { FloatingTextManager } from "./modules/floatingText/FloatingTextManager";
import { FormationConfigManager } from "./modules/formation/FormationConfigManager";
import { GuardShipManager } from "./modules/guardShip/GuardShipManager";
import { GuardShipModel } from "./modules/guardShip/model/GuardShipModel";
import { GuideManager } from "./modules/guide/GuideManager";
import { GuideModel } from "./modules/guide/model/GuideModel";
import { JumpManager } from "./modules/jump/JumpManager";
import { LeagueManager } from "./modules/league/leagueManager";
import { LeagueExploreManager } from "./modules/leagueExplore/LeagueExploreManager";
import { LeagueExploreModel } from "./modules/leagueExplore/model/LeagueExploreModel";
import { MagicCubeManager } from "./modules/magicCube/MagicCubeManager";
import { MagicCubeModel } from "./modules/magicCube/MagicCubeModule";
import { MapInstanceManager } from "./modules/mapInstance/MapInstanceManager";
import { MiniMapManager } from "./modules/miniMap/MiniMapManager";
import { MiniMapModule } from "./modules/miniMap/MiniMapModule";
import { ModuleOpenManager } from "./modules/moduleopen/ModuleOpenManager";
import { PetConfigManager } from "./modules/pet/PetConfigManager";
import { PetModel } from "./modules/pet/PetModel";
import { PetDungeonManager } from "./modules/petDungeon/PetDungeonManager";
import { PetDungeonModel } from "./modules/petDungeon/model/PetDungeonModel";
import { PredictionManager } from "./modules/prediction/PredictionManager";
import { PredictionModel } from "./modules/prediction/PredictionModel";
import { PVPManager } from "./modules/pvp/PVPManager";
import { SeasonManager } from "./modules/season/SeasonManager";
import { SeasonModel } from "./modules/season/SeasonModel";
import { SecretSeasonController } from "./modules/season/seasonSecret/SecretSeasonController";
import { SecretSeasonManager } from "./modules/season/seasonSecret/SecretSeasonManager";
import { SecretAreaController } from "./modules/secretArea/SecretAreaController";
import { SecretAreaManager } from "./modules/secretArea/SecretAreaManager";
import { SecretAreaModule } from "./modules/secretArea/SecretAreaModule";
import { SettingsManager } from "./modules/settings/SettingsManager";
import { ShopManager } from "./modules/shop/shopManager";
import { StimulationManager } from "./modules/stimulation/StimulationManager";
import { StimulationModel } from "./modules/stimulation/model/StimulationModel";
import { TalentManager } from "./modules/talent/TalentManager";
import { TeamChallengeModel } from "./modules/teamChallenge/model/TeamChallengeModel";
import { WeaponManager } from "./modules/weapon/WeaponManager";
import { WorldBossManager } from "./modules/worldBoss/WorldBossManager";
import { CameraAnimUtils } from "./tiledMap/CameraAnimUtils";
import { MapManager } from "./tiledMap/MapManager";
import AreaTriggersManager from "./tiledMap/trigger/AreaTriggersManager";
import MapVisibleManager from "./tiledMap/visible/MapVisibleManager";
import { ResurgenceManager } from "./ui/resurgence/ResurgenceManager";

/**所有模块数据总控制器 */
export default class ModulesController extends BaseController {
    listenNotifications(): string[] {
        return [LoginNotificationKey.INIT_PLAYER_INFO, LoginNotificationKey.REPORT_DATA_TO_SDK];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.INIT_PLAYER_INFO:
                this.initLoginInfo(args);
                break;
            case LoginNotificationKey.REPORT_DATA_TO_SDK:
                this.reportRoleDataToSdk(args as ReportDataType);
                break;
        }
    }

    /**初始化时间 */
    private initTime(infoVo: Vo.account.LoginInfoVo) {
        //记录开服时间
        TimeManager.setOpenServerTime(infoVo.openServer);
        //系统时间
        TimeManager.setCurServerTime(infoVo.systemTime);
        /** 当前时区*/
        TimeManager.serverTimeZone = infoVo.timeZone;
        /** 每天刷新时间点数*/
        TimeManager.refreshClock = Number(TableManager.getDataById(table.common.ConfigValue, "SYSTEM:START_HOUR_OF_DAY").content);
        //TimerMgr.initTime(content.systemTime.toNumber());
    }

    public initLoginInfo(infoVo: Vo.account.LoginInfoVo) {
        if (infoVo) {
            this.initTime(infoVo);

            //货币
            //CurrencyModel.ins.initData(content.wallet);

            this.initConfigManager();

            // 单例
            this.initSingleton();

            // server 协议比较奇怪 | 货币数据是登录完成下发的
            ItemModel.ins().addInitDataByServerWallet(infoVo);

            //初始化模块数据
            this.initModuleData(infoVo.content);

            AccountModel.ins().reLoginSign = infoVo.reLoginSign;
            AccountModel.ins().isOnline = true;
            AccountModel.ins().inServerName = infoVo.serverName;
            AccountModel.ins().serverId = infoVo.serverId;

            // 红点
            this.initLoginRedDot();

            LocalStorage.playerKey = AccountModel.ins().vo.id.toString();

            this.reportRoleDataToSdk(ReportDataType.enterServer);
            if (CheckAccountTask.isNewRole) {
                CheckAccountTask.isNewRole = false;
                this.reportRoleDataToSdk(ReportDataType.createRole);
            }
        } else {
            throw new Error("Vo.account.LoginInfoS2C initLoginInfo content is empty");
        }
    }

    initConfigManager() {
        ActivityConfigManager.init();
        ActivityFlipCardConfigManager.init();
        LeagueBargainConfigManager.init();
        TalentConfigManager.init();
        BattleConfigManager.init();
        GrowthPathConfigManager.init();

        GodSequenceConfigManager.init();

        ItemConfigManager.init();

        RankConfigManager.init();
        DrawCardConfigManager.init();
        ChatConfigManager.init();
        HangUpConfigManager.init();
        CaptainSkillConfigManager.init();
        GVGConfigManager.init();
        SevenDayConfigManager.init();
        HeroSupplyConfigManager.init();
        SignInConfigManager.init();
    }

    /**初始模块数据 各模块数据初始化入口*/
    public initModuleData(content: any): void {
        if (content) {
            /**帐号数据 */
            GIns.accountModel = AccountModel.ins();
            AccountModel.ins().initData(content[AccountModel.getModule()]);

            GIns.guideModel = GuideModel.ins();

            GIns.playerModel = PlayerModel.ins();
            PlayerModel.ins().initData(content[PlayerModel.getModule()]);

            // 道具
            GIns.itemModel = ItemModel.ins();
            ItemModel.ins().initData(content[ItemModel.getModule()]);

            //广告 需要提前实例化
            GIns.adModel = AdModel.ins();
            AdModel.ins().initData();

            // vip 需要提前实例化
            GIns.vipModel = VipModel.ins();
            VipModel.ins().initData(content[VipModel.getModule()]);

            // 特权卡 需要提前实例化
            GIns.monthCardModel = MonthCardModel.ins();
            MonthCardModel.ins().initData(content[MonthCardModel.getModule()]);

            GIns.mapModel = MapModel.ins();
            MapModel.ins().initData(content[MapModel.getModule()]);

            GIns.predictionModel = PredictionModel.ins();
            PredictionModel.ins().initData(content[PredictionModel.getModule()]);

            // email
            GIns.emailModel = EmailModel.ins();
            EmailModel.ins().initData(content[EmailModel.getModule()]);

            // 抽卡
            GIns.drawCardModel = DrawCardModel.ins();
            DrawCardModel.ins().initData(content[DrawCardModel.getModule()]);

            //hero 必须在阵位前初始化
            GIns.heroModel = HeroModel.ins();
            HeroModel.ins().initData(content[HeroModel.getModule()]);

            //魔方
            GIns.magicCubeModel = MagicCubeModel.ins();
            MagicCubeModel.ins().initData(content[MagicCubeModel.getModule()]);

            GIns.formationModel = FormationModel.ins();
            FormationModel.ins().initData(content[FormationModel.getModule()]);

            // 任务
            GIns.taskModel = TaskModel.ins();
            TaskModel.ins().initData(content[TaskModel.getModule()]);

            // 主线任务
            GIns.trunkTaskModel = TrunkTaskModel.ins();
            TrunkTaskModel.ins().initData(content[TrunkTaskModel.getModule()]);

            // 每日任务
            GIns.dailyTaskModel = DailyTaskModel.ins();
            DailyTaskModel.ins().initData(content[DailyTaskModel.getModule()]);

            // 成就
            GIns.achievementModel = AchievementModel.ins();
            AchievementModel.ins().initData(content[AchievementModel.getModule()]);

            // 货币数据 | 塞入到背包
            GIns.itemModel = ItemModel.ins();
            ItemModel.ins().addIntegralLoginData(content[IntegralModel.getModule()] as Vo.integral.IntegralLoginVo);
            ItemModel.ins().addHeroInitData(content[HeroModel.getModule()] as Vo.hero.HeroLoginVo);

            // 天赋
            GIns.talentModel = TalentModel.ins();
            TalentModel.ins().initData(content[TalentModel.getModule()]);

            // GM
            //GmModel.ins().initData(content[GmModel.getModule()]);

            //设置
            GIns.settingsModel = SettingsModel.ins();
            SettingsModel.ins().initData(content[SettingsModel.getModule()]);

            /**序列 */
            GIns.godSequenceModel = GodSequenceModel.ins();
            GodSequenceModel.ins().initData(content[GodSequenceModel.getModule()]);

            // 挂机
            GIns.hangUpModel = HangUpModel.ins();
            HangUpModel.ins().initData(content[HangUpModel.getModule()]);

            //装备
            GIns.equipModel = EquipModel.ins();
            EquipModel.ins().initData(content[EquipModel.getModule()]);

            // 战队科技
            GIns.captainSkillModel = CaptainSkillModel.ins();
            CaptainSkillModel.ins().initData(content[CaptainSkillModel.getModule()]);

            // 排行榜
            GIns.rankModel = RankModel.ins();
            RankModel.ins().initData(content[RankModel.getModule()]);

            // 每日boss
            GIns.dailyBossModel = DailyBossModel.ins();
            DailyBossModel.ins().initData(content[DailyBossModel.getModule()]);

            //商店
            GIns.shopModel = ShopModel.ins();
            ShopModel.ins().initData(content[ShopModel.getModule()]);

            //联盟
            GIns.LeagueModel = LeagueModel.ins();
            LeagueModel.ins().initData(content[LeagueModel.getModule()]);

            // JJC
            GIns.pvpModel = PVPModel.ins();
            PVPModel.ins().initData(content[PVPModel.getModule()]);

            //赋能武器
            GIns.weaponModel = WeaponModel.ins();
            WeaponModel.ins().initData(content[WeaponModel.getModule()]);

            //好友
            GIns.friendModel = FriendModel.ins();
            FriendModel.ins().initData(content[FriendModel.getModule()]);

            // 聊天
            GIns.chatModel = ChatModel.ins();
            ChatModel.ins().initData(content[ChatModel.getModule()]);

            //星灵， 必须要在道具的 ItemModel.ins().initData(content[ItemModel.getModule()]);
            //方法之后，因为 ItemModel 的 initData 调用了 this._backpackContext.init();
            GIns.petModel = PetModel.ins();
            GIns.petModel.initData(content[PetModel.getModule()]);

            //图鉴
            GIns.illustrationsModel = IllustrationsModel.ins();
            IllustrationsModel.ins().initData(content[IllustrationsModel.getModule()]);

            //充值订单
            GIns.orderModel = OrderModel.ins();
            OrderModel.ins().initData(content[OrderModel.getModule()]);

            //商城
            GIns.mallModel = MallModel.ins();
            MallModel.ins().initData(content[MallModel.getModule()]);

            //每日特惠
            GIns.dailySaleModel = DailySaleModel.ins();
            DailySaleModel.ins().initData(content[DailySaleModel.getModule()]);

            //世界boss
            GIns.worldBossModel = WorldBossModel.ins();
            WorldBossModel.ins().initData(null);

            GIns.activityModel = ActivityModel.ins();

            GIns.miniMapModel = MiniMapModule.ins();

            //守卫母舰
            GIns.guardShipModel = GuardShipModel.ins();
            GuardShipModel.ins().initData();

            //星际工厂
            GIns.factoryModel = FactoryModel.ins();
            FactoryModel.ins().initData();

            //经营
            GIns.stimulationModel = StimulationModel.ins();
            StimulationModel.ins().initData(content[StimulationModel.getModule()]);

            //组队副本
            GIns.teamChallengeModel = TeamChallengeModel.ins();
            TeamChallengeModel.ins().initData(content[TeamChallengeModel.getModule()]);

            //收藏品
            GIns.collectionsModel = CollectionsModel.ins();
            GIns.collectionsModel.initData(content[CollectionsModel.getModule()]);

            //资源勘探
            GIns.leagueExploreModel = LeagueExploreModel.ins();
            LeagueExploreModel.ins().initData();

            //次元裂缝
            GIns.petDungeonModel = PetDungeonModel.ins();
            PetDungeonModel.ins().initData();

            //赛季活动
            GIns.seasonModel = SeasonModel.ins();
            SeasonModel.ins().initData();

            //收藏品副本
            GIns.collectiblesDungeonModel = CollectiblesDungeonModel.ins();
            CollectiblesDungeonModel.ins().initData();

            // 职业试玩
            GIns.careerTrialModel = CareerTrialModel.ins();
            CareerTrialModel.ins().initData();

            // 背包, debug 打印数据日志 | 方便排查问题
            ItemModel.ins().printDebugLog();
        } else {
            throw new Error("12, 7 Vo.account.LoginInfoS2C initModuleData content is empty");
        }

        //星钻
        GIns.diamondBankCtr = DiamondBankController.ins();

        //系统
        GIns.systemModel = SystemModel.ins();
        GIns.systemModel.initData();

        //战斗模块
        GIns.battleModel = BattleModel.ins();

        //秘境
        GIns.secretAreaModule = SecretAreaModule.ins();

        //奖励模块
        GIns.rewardModel = RewardModel.ins();

        this.emit(LoginNotificationKey.INIT_PLAYER_INFO_COMPLETE);
    }

    initSingleton() {
        //红点
        GIns.redDotMgr = RedDotManager.ins();
        GIns.audioMgr = AudioManager.ins();

        // 条件系统
        GIns.conditionMgr = ConditionManager.ins();

        //红点
        GIns.reconnectMgr = ReconnectMgr.ins();
        GIns.reconnectMgr.init(); //开启重连管理

        GIns.battleMgr = BattleManager.ins();

        GIns.battleLogicMgr = BattleLogicManager.ins();

        GIns.battleDebugMgr = BattleDebugManager.ins();

        GIns.battleRecordMgr = BattleRecordManager.ins();

        GIns.battleExpandMgr = BattleExpandManager.ins();

        GIns.worldMgr = WorldManager.ins();

        GIns.WorldLocationMgr = WorldLocationManager.ins();

        GIns.mapMgr = MapManager.ins();

        GIns.areaTriggersMgr = AreaTriggersManager.ins();

        GIns.mapVisibleMgr = MapVisibleManager.ins();

        GIns.cameraAnimUtils = CameraAnimUtils;

        GIns.floatingTextMgr = FloatingTextManager.ins();

        GIns.moduleOpenMgr = ModuleOpenManager.ins();

        GIns.jumpManager = JumpManager.ins();

        GIns.attrMgr = AttrManager.ins();

        GIns.fightMgr = FightManager.ins();

        GIns.formationMgr = FormationManager.ins();

        GIns.formationCfgMgr = FormationConfigManager.ins();

        GIns.backpackMgr = BackpackManager.ins();

        GIns.miniMapMgr = MiniMapManager.ins();

        GIns.guideMgr = GuideManager.ins();

        GIns.resurgenceMgr = ResurgenceManager.ins();

        GIns.captainSkillMgr = CaptainSkillManager.ins();

        GIns.equipMgr = EquipManager.ins();

        GIns.weaponMgr = WeaponManager.ins();

        GIns.heroMgr = HeroManager.ins();

        GIns.talentMgr = TalentManager.ins();

        GIns.drawCardMgr = DrawCardManager.ins();

        GIns.LeagueManager = LeagueManager.ins();

        GIns.shopMgr = ShopManager.ins();

        GIns.secretAreaCtrl = SecretAreaController.ins();
        GIns.secretAreaMgr = SecretAreaManager.ins();

        GIns.secretSeasonCtrl = SecretSeasonController.ins();
        GIns.secretSeasonMgr = SecretSeasonManager.ins();

        GIns.mapInstanceMgr = MapInstanceManager.ins();

        GIns.pvpMgr = PVPManager.ins();

        GIns.worldBossMgr = WorldBossManager.ins();

        GIns.worldBossMgr = WorldBossManager.ins();

        GIns.magicCubeMgr = MagicCubeManager.ins();

        GIns.GVGModel = GVGModel.ins();
        GIns.LeagueBargainManager = LeagueBargainManager.ins();

        GIns.guardShipMgr = GuardShipManager.ins();

        GIns.petCfgMgr = PetConfigManager.ins();

        GIns.factoryMgr = FactoryManager.ins();

        GIns.stimulationMgr = StimulationManager.ins();

        GIns.predictionMgr = PredictionManager.ins();

        GIns.teamChallengeModel = TeamChallengeModel.ins();

        GIns.settingsMgr = SettingsManager.ins();

        GIns.leagueExploreMgr = LeagueExploreManager.ins();

        //收藏品
        GIns.collectionsCfgMgr = CollectionsConfigMgr.ins();
        GIns.collectionsCtr = CollectionsController.ins();
        GIns.uiCommonMgr = UICommonMgr.ins();

        GIns.petDungeonMgr = PetDungeonManager.ins();

        GIns.seasonManager = SeasonManager.ins();

        GIns.collectiblesDungeonMgr = CollectiblesDungeonManager.ins();

        GIns.activityAutoPopMgr = ActivityAutoPopManager.ins();

        GIns.checkNotInjectIns();
    }

    private _oidViplevel = 0;

    /**上报数据到sdk */
    public reportRoleDataToSdk(event: ReportDataType) {
        if (!SdkManager.ins().isEnable()) return;
        let oidServerId = AccountModel.ins().serverId;
        if (!oidServerId) return;

        let serverVo = ChooseServerModel.ins().getServerVoByGameServerId(oidServerId); //获取服务器信息
        let serverId = serverVo.id;
        let serverName = serverVo.name;
        let roleId = PlayerModel.ins().playerId;
        let roleName = PlayerModel.ins().playerName;
        let roleLevel = FormationManager.ins().getCommonLevel();
        let trunkId = HangUpModel.ins().getMaxPassLevelId();
        let trunkCfg = TableManager.getDataById(table.trunkinstance.TrunkInstanceConfig, trunkId);
        let trunkName = trunkCfg?.title || trunkId.toString();

        let vipLevel = VipModel.ins().vipLv;
        let oldVipLevel = this._oidViplevel;
        this._oidViplevel = vipLevel; //vip升级才会更新

        let data: IReportData = {
            reportDataType: event,
            roleId: roleId.toString(),
            roleName: roleName,
            serverId: serverId.toString(),
            serverName: serverName,
            roleLevel: roleLevel,
            vipLevel: vipLevel,
            oldVipLevel: oldVipLevel,
            trunkId: trunkId.toString(),
            trunkName: trunkName,
        };

        SdkManager.ins().reportDataToSdk(data);
    }

    /**
     * 初始化首次登录红点
     * @private
     */
    private initLoginRedDot() {
        GIns.redDotMgr.init();

        // 添加你的模块 | 初始化红点
        ItemModel.ins().refreshRedDot();
        DrawCardModel.ins().refreshRedDot();

        // 竞技场要后端调整
        PVPModel.ins().getContext().refreshRedDot();

        CaptainSkillModel.ins().refreshRedDot();
        DailyTaskModel.ins().refreshRedDot();
        EmailModel.ins().refreshRedDot();
        TalentModel.ins().refreshRedDot();

        HeroController.ins().refreshRedDot();
        EquipController.ins().checkAllEquipRedDot();
    }
}

ModulesController.ins().doInit();
