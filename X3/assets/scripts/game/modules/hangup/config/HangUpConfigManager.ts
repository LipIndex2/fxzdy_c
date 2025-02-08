import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { HangUpModel } from "db://assets/scripts/game/modules/hangup/model/HangUpModel";
import { BattleUIUtils } from "db://assets/scripts/game/modules/battle/utils/BattleUIUtils";
import { NumberRange } from "db://assets/scripts/core/utils/NumberRange";


export class HangUpConfigManager {
    private static _spineAssetPath: string = "";
    private static _animNameForNoReward: string = "";
    private static _animNameForHaveReward: string = "";
    private static _animNameForIdle: string = "";
    private static _firstLevelId: number = 0;
    // 后台战斗动画
    private static _defaultAnimNameWhenInBg: string = "";
    // 后台结算完成dh名
    private static _inBgFinishAnimName: string = "";
    // 左下角小雷诺
    private static _leiNuoSpineAssetPath: string = "";
    // 后台战斗间隔 second | win
    private static _waitSecondPerInBgBattleWin: number = 0;
    // 后台战斗间隔 second | fail
    private static _waitSecondPerInBgBattleFail: number = 0;
    // <关卡id, 下一关id>
    private static _levelIdToNextLevelIdMap: Map<number, number> = new Map<number, number>();
    // <显示关卡id, 关卡配置>
    private static _showIdToConfigMap: Map<number, table.trunkinstance.TrunkInstanceConfig> = new Map();
    // <关卡id, 战力修正值01>
    private static _levelIdToCpModRangeMap: Map<number, Map<NumberRange, number>> = new Map();
    // 开启【挂机托管】的关卡
    private static _canAutoChallengeLevelId: number;
    // 开启【自动挑战下一关】的关卡
    private static _autoChallengeNextOpenOnLevelId: number;
    // 自动挑战的 CD sec
    private static _autoChallengeWaitSecond: number;
    // 跳转id for 自动挑战
    private static _jumpIdForUnlockAutoChallenge: number;
    // 打开气泡关卡id
    private static _showBoxDialogLevelId: number;

    // 是否初始化过
    private static _isInit: boolean = false;

    static init() {
        if (this._isInit) {
            return;
        }
        this._isInit = true;

        this._spineAssetPath = TableManager.getDataById(table.trunkinstance.TrunkInstanceConstantConfig, "TRUNK_INSTANCE:spine")
            ?.content || "";
        this._animNameForNoReward = TableManager.getDataById(table.trunkinstance.TrunkInstanceConstantConfig, "TRUNK_INSTANCE:clientAnimNameForNoReward")
            ?.content || "";
        this._animNameForHaveReward = TableManager.getDataById(table.trunkinstance.TrunkInstanceConstantConfig, "TRUNK_INSTANCE:clientAnimNameForHaveReward")
            ?.content || "";
        this._animNameForIdle = TableManager.getDataById(table.trunkinstance.TrunkInstanceConstantConfig, "TRUNK_INSTANCE:clientAnimNameForIdle")
            ?.content || "";
        this._defaultAnimNameWhenInBg = TableManager.getDataById(table.trunkinstance.TrunkInstanceConstantConfig, "TRUNK_INSTANCE:defaultAnimNameInBg")
            ?.content || "";
        this._inBgFinishAnimName = TableManager.getDataById(table.trunkinstance.TrunkInstanceConstantConfig, "TRUNK_INSTANCE:inBgFinishAnimName")
            ?.content || "";
        this._leiNuoSpineAssetPath = TableManager.getDataById(table.trunkinstance.TrunkInstanceConstantConfig, "TRUNK_INSTANCE:hangUpSpineAssetPath")
            ?.content || "";

        // num
        this._waitSecondPerInBgBattleWin = TableManager.getDataById(table.trunkinstance.TrunkInstanceConstantConfig, "TRUNK_INSTANCE:BACK_GROUND_BATTLE_INTERVAL")
            ?.content?.toInt() || 1;
        // num
        this._waitSecondPerInBgBattleFail = TableManager.getDataById(table.trunkinstance.TrunkInstanceConstantConfig, "TRUNK_INSTANCE:BACK_GROUND_BATTLE_FAIL_INTERVAL")
            ?.content?.toInt() || 1;
        this._canAutoChallengeLevelId = TableManager.getDataById(table.trunkinstance.TrunkInstanceConstantConfig, "TRUNK_INSTANCE:canAutoChallengeLevelId")
            ?.content?.toInt() || 0;
        this._autoChallengeNextOpenOnLevelId = TableManager.getDataById(table.trunkinstance.TrunkInstanceConstantConfig, "TRUNK_INSTANCE:autoChallengeNextOpenOnLevelId")
            ?.content?.toInt() || 0;
        this._autoChallengeWaitSecond = TableManager.getDataById(table.trunkinstance.TrunkInstanceConstantConfig, "TRUNK_INSTANCE:autoChallengeWaitSecond")
            ?.content?.toInt() || 0;
        this._jumpIdForUnlockAutoChallenge = TableManager.getDataById(table.trunkinstance.TrunkInstanceConstantConfig, "TRUNK_INSTANCE:jumpIdForUnlockAutoChallenge")
            ?.content?.toInt() || 0;
        this._showBoxDialogLevelId = TableManager.getDataById(table.trunkinstance.TrunkInstanceConstantConfig, "TRUNK_INSTANCE:showBoxDialogLevelId")
            ?.content?.toInt() || 0;

        const configs = TableManager.getAllData(table.trunkinstance.TrunkInstanceConfig);
        this._firstLevelId = configs
            .map(it => it.id)
            .sort((a, b) => a - b)[0];

        this._levelIdToNextLevelIdMap = configs.toDataStream()
            .toMap(it => it.parentLevelId, it => it.id, (v1, v2) => v2);

        // check config
        for (let i = 0; i < configs.length; i++) {
            const config = configs[i];
            const levelId = config.id;

            // 战斗力
            const battleConfig = TableManager.getDataById(table.battle.BattleConfig, config.battleConfigId);
            const rangeMap = BattleUIUtils.getCpModRangeMap(battleConfig?.cpDamageMod)
            this._levelIdToCpModRangeMap.set(levelId, rangeMap);

            const showLevelId = config.showLevelId;
            this._showIdToConfigMap.set(showLevelId, config);
            if (showLevelId == i) {
                continue
            }
            console.error(`[挂机] 关卡id 不连续. showLevelId = ${showLevelId}, levelId = ${levelId}`);
            break;
        }
    }


    static get showBoxDialogLevelId(): number {
        return this._showBoxDialogLevelId;
    }

    static get jumpIdForUnlockAutoChallenge(): number {
        return this._jumpIdForUnlockAutoChallenge;
    }

    static get autoChallengeNextOpenOnLevelId(): number {
        return this._autoChallengeNextOpenOnLevelId;
    }

    static get waitSecondPerInBgBattleFail(): number {
        return this._waitSecondPerInBgBattleFail;
    }

    static get autoChallengeWaitSecond(): number {
        return this._autoChallengeWaitSecond;
    }

    static get levelIdToNextLevelIdMap(): Map<number, number> {
        return this._levelIdToNextLevelIdMap;
    }

    static get canAutoChallengeLevelId(): number {
        return this._canAutoChallengeLevelId;
    }

    static get inBgFinishAnimName(): string {
        return this._inBgFinishAnimName;
    }

    static get waitSecondPerInBgBattleWin(): number {
        return this._waitSecondPerInBgBattleWin;
    }

    static get defaultAnimNameWhenInBg(): string {
        return this._defaultAnimNameWhenInBg;
    }

    static get leiNuoSpineAssetPath(): string {
        return this._leiNuoSpineAssetPath;
    }

    static get spineAssetPath(): string {
        return this._spineAssetPath;
    }

    static get animNameForNoReward(): string {
        return this._animNameForNoReward;
    }

    static get animNameForHaveReward(): string {
        return this._animNameForHaveReward;
    }


    static get animNameForIdle(): string {
        return this._animNameForIdle;
    }

    static get firstLevelId(): number {
        return this._firstLevelId;
    }

    /**
     * 挂机配置
     * @param levelId
     */
    static getHangUpConfigByLevelId(levelId: number): table.trunkinstance.TrunkInstanceConfig | null {
        return TableManager.getDataById(table.trunkinstance.TrunkInstanceConfig, levelId);
    }

    // 获取下一关
    static getNextLevelId(levelId: number): number {
        return this._levelIdToNextLevelIdMap.get(levelId) || this._firstLevelId;
    }

    static getConfigByShowId(showLevelId: number): table.trunkinstance.TrunkInstanceConfig | null {
        return this._showIdToConfigMap.get(showLevelId);
    }

    /**
     * 获取当前可以看到的范围
     * @param curLevelId
     */
    static getCanSeeConfigArrayByCurLevelId(
        curLevelId: number = HangUpModel.ins().getCurrentLevelId()
    ) {
        const config = this.getConfigById(curLevelId);
        const curShowLevelId = config.showLevelId;

        // [-20, 50]
        const minShowLevelId = Math.max(1, curShowLevelId - 20);
        const maxShowLevelId = curShowLevelId + 50;

        return TableManager.getAllData(table.trunkinstance.TrunkInstanceConfig)
            .toDataStream()
            .filter(it => it.showLevelId >= minShowLevelId && it.showLevelId <= maxShowLevelId)
            .toArray();
    }

    static getConfigById(curLevelId: number): table.trunkinstance.TrunkInstanceConfig {
        return TableManager.getDataById(table.trunkinstance.TrunkInstanceConfig, curLevelId);
    }

    /**
     * 战斗修正范围
     * @param levelId
     */
    static getCpModRangeMap(levelId: number): Map<NumberRange, number> | null {
        return this._levelIdToCpModRangeMap.get(levelId);
    }
    
}