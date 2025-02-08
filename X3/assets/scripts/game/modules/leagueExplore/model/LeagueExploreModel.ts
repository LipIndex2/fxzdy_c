import G from "../../../../core/comm/G";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { TableConstUtils } from "../../../../core/utils/TableConstUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { FightType } from "../../../comm/battle/enum/FightType";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { MapObjectType } from "../../../tiledMap/MapEnum";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { CommonBattleResultViewOpenArgs } from "../../battle/args/CommonBattleResultViewOpenArgs";
import { IBattleResultWinData } from "../../battle/vo/IBattleResultWinData";
import { IBattleResultVo } from "../../common/battle/structs/IBattleResultVo";
import { LeaugeExploreBuildingOccupyState } from "../const/LeagueExploreEnum";
import { ILeagueExploreBuildingFactoryVo } from "./vo/ILeagueExploreBuildingFactoryVo";
import { ILeagueExploreBuildingVo } from "./vo/ILeagueExploreBuildingVo";
import { ILeagueExploreConstCfg } from "./vo/ILeagueExploreConstCfg";
import { ILeagueExploreHangUpVo } from "./vo/ILeagueExploreHangUpVo";
import { ILeagueExploreIncomeVo } from "./vo/ILeagueExploreIncomeVo";
import { ILeagueExploreStarLevelVo } from "./vo/ILeagueExploreStarLevelVo";
import { ILeagueExploreStarVo } from "./vo/ILeagueExploreStarVo";

/**
 * 资源勘探模块协议
 * @author GameCreator
 */
export class LeagueExploreModel extends BaseModel {
	/**
	 * 模块标识
	 */
	private MODULE = 54;

	/**当前的星球id*/
	public curStarId: number = 0;
	/**是否已加载了当前小地图*/
	public isLoadMiniMap: boolean = false;

	protected _constCfg: ILeagueExploreConstCfg = null;
	/**活动信息*/
	protected _activityinfo: Vo.leagueexplore.LeagueExploreActivityInfoVo = null;
	/**星球等级信息*/
	protected _starLevelMap: Map<number, ILeagueExploreStarLevelVo> = new Map();
	/**星球信息*/
	protected _starMap: Map<number, ILeagueExploreStarVo> = new Map();
	/**工厂建筑信息*/
	protected _buildingFactoryMap: Map<number, ILeagueExploreBuildingFactoryVo> = new Map();
	/**工厂建筑信息*/
	protected _buildingFactoryForStarMap: Map<number, ILeagueExploreBuildingFactoryVo[]> = new Map();
	/**建筑信息*/
	protected _buildingMap: Map<number, ILeagueExploreBuildingVo> = new Map();
	/**我的日志*/
	protected _myRecords: Vo.leagueexplore.PlayerLeagueExploreRecord[] = [];
	/**联盟日志*/
	protected _leagueRecords: Vo.leagueexplore.LeagueExploreRecord[] = [];
	/**所有传送点的位置*/
	protected _allTeleportPointMap: Map<number, table.map.MapBuildingConfig[]> = null;
	/**展示的星球等级数据*/
	protected _showLevelIds: number[] = [];
	/**最多购买次数*/
	protected _maxBuyAtkTimes:number = 0;

	constructor() {
		super();
		this.regist();
	}

	public static getModule(): number {
		return this.ins().MODULE;
	}

	/**
   * 注册所有从服务端收到的回调。
   */
	private regist(): void {
		// TODO 注册所有的指令
		let moduleId = this.MODULE;
		this.registerMsg(moduleId, 1, this.recLoadLeagueExploreInfo);
		this.registerMsg(moduleId, 2, this.recLoadStarList);
		this.registerMsg(moduleId, 3, this.recEnterStar);
		this.registerMsg(moduleId, 4, this.recExitStar);
		this.registerMsg(moduleId, 5, this.recLoadStarBuildingList);
		this.registerMsg(moduleId, 6, this.recLoadBuildingInfo);
		this.registerMsg(moduleId, 7, this.recAttackBuilding);
		this.registerMsg(moduleId, 8, this.recDefendBuilding);
		this.registerMsg(moduleId, 9, this.recExchangeBuilding);
		this.registerMsg(moduleId, 10, this.recOccupyBuilding);
		this.registerMsg(moduleId, 11, this.recCancelOccupy);
		this.registerMsg(moduleId, 12, this.recTopBuildingOccupy);
		this.registerMsg(moduleId, 13, this.recFastExplore);
		this.registerMsg(moduleId, 14, this.recDrawHangUpReward);
		this.registerMsg(moduleId, 15, this.recLoadPlayerExploreRecord);
		this.registerMsg(moduleId, 17, this.recLoadLeagueExploreRecord);
		this.registerMsg(moduleId, 16, this.recShareBuilding);
		this.registerMsg(moduleId, 18, this.recResetAttackLimit);
		this.registerMsg(moduleId, -1, this.pushActivityStart);
		this.registerMsg(moduleId, -2, this.pushBuildingStateChange);
		this.registerMsg(moduleId, -3, this.pushOccupyBuildingResult);
		this.registerMsg(moduleId, -4, this.pushAttackBuildingResult);
		this.registerMsg(moduleId, -5, this.pushBeAttackBuildingResult);
		// this.registerMsg(moduleId, -6, this.pushCancelOccupy);
		this.registerMsg(moduleId, -7, this.pushSelfCancelOccupy);
		this.registerMsg(moduleId, -8, this.pushBuildingSeatUpdate);
		this.registerMsg(moduleId, -9, this.pushDefendBuildingResult);
		this.registerMsg(moduleId, -10, this.pushExchangeBuildingResult);
		this.registerMsg(moduleId, -11, this.pushBeExchangeBuildingResult);
		this.registerMsg(moduleId, -12, this.pushAutoOccupyBuilding);
		this.registerMsg(moduleId, -13, this.pushSelfBuildingChange);
		this.registerMsg(moduleId, -14, this.pushSelfLeaveStar);
	}

	/**初始化数据 */
	public initData(): void {
		if (this._constCfg == null) {
			//初始化静态配置
			let shareChannelTypeCfg = TableConstUtils.getConstConfigToJSON(table.leagueexplore.LeagueExploreConstantConfig, 'LEAGUE_EXPLORE:SHARE_CHANNEL_TYPE_MAP');
			let shareChannelTypeMap: Map<string, number> = new Map();
			for (let key in shareChannelTypeCfg) {
				let channel = ServerEnums.ChannelType[key];
				if (channel) {
					shareChannelTypeMap.set(key, Number(shareChannelTypeCfg[key]));
				}
			}
			//快速挂机
			let hangUpVos: ILeagueExploreHangUpVo[] = [];
			hangUpVos.push({
				costs: TableConstUtils.getConstConfigToKV(table.leagueexplore.LeagueExploreConstantConfig, 'LEAGUE_EXPLORE:NORMAL_FAST_HANG_UP_COSTS'),
				hangUpMinutes: TableConstUtils.getConstConfigToNumber(table.leagueexplore.LeagueExploreConstantConfig, 'LEAGUE_EXPLORE:NORMAL_FAST_HANG_UP_MINUTES'),
				isAdvanced: false
			});
			hangUpVos.push({
				costs: TableConstUtils.getConstConfigToKV(table.leagueexplore.LeagueExploreConstantConfig, 'LEAGUE_EXPLORE:ADVANCED_FAST_HANG_UP_COSTS'),
				hangUpMinutes: TableConstUtils.getConstConfigToNumber(table.leagueexplore.LeagueExploreConstantConfig, 'LEAGUE_EXPLORE:ADVANCED_FAST_HANG_UP_MINUTES'),
				isAdvanced: true
			});

			this._constCfg = {
				dailyOccupyRewardTimes: TableConstUtils.getConstConfigToNumber(table.leagueexplore.LeagueExploreConstantConfig, 'LEAGUE_EXPLORE:DAILY_OCCUPY_REWARD_TIMES'),
				continueMinuets: TableConstUtils.getConstConfigToNumber(table.leagueexplore.LeagueExploreConstantConfig, 'LEAGUE_EXPLORE:CONTINUE_MINUETS'),
				hangUpVos: hangUpVos,
				captureCdSeconds: TableConstUtils.getConstConfigToNumber(table.leagueexplore.LeagueExploreConstantConfig, 'LEAGUE_EXPLORE:CAPTURE_CD_SECONDS'),
				failReoccupyCdSeconds: TableConstUtils.getConstConfigToNumber(table.leagueexplore.LeagueExploreConstantConfig, 'LEAGUE_EXPLORE:FAIL_REOCCUPY_CD_SECONDS'),
				sameLeagueFightWaitSeconds: TableConstUtils.getConstConfigToNumber(table.leagueexplore.LeagueExploreConstantConfig, 'LEAGUE_EXPLORE:SAME_LEAGUE_FIGHT_WAIT_SECONDS'),
				otherLeagueFightWaitSeconds: TableConstUtils.getConstConfigToNumber(table.leagueexplore.LeagueExploreConstantConfig, 'LEAGUE_EXPLORE:OTHER_LEAGUE_FIGHT_WAIT_SECONDS'),
				exchangeBuildingLevelDiff: TableConstUtils.getConstConfigToNumber(table.leagueexplore.LeagueExploreConstantConfig, 'LEAGUE_EXPLORE:EXCHANGE_BUILDING_LEVEL_DIFF'),
				changeHandsContinueSeconds: TableConstUtils.getConstConfigToNumber(table.leagueexplore.LeagueExploreConstantConfig, 'LEAGUE_EXPLORE:CHANGE_HANDS_CONTINUE_SECONDS'),
				protectedContinueSeconds: TableConstUtils.getConstConfigToNumber(table.leagueexplore.LeagueExploreConstantConfig, 'LEAGUE_EXPLORE:PROTECTED_CONTINUE_SECONDS'),
				robotRebirthMinutes: TableConstUtils.getConstConfigToNumber(table.leagueexplore.LeagueExploreConstantConfig, 'LEAGUE_EXPLORE:ROBOT_REBIRTH_MINUTES'),
				failContinueFightCdSeconds: TableConstUtils.getConstConfigToNumber(table.leagueexplore.LeagueExploreConstantConfig, 'LEAGUE_EXPLORE:FAIL_CONTINUE_FIGHT_CD_SECONDS'),
				shareChannelTypeMap: shareChannelTypeMap,
				dailyWarStartHour: TableConstUtils.getConstConfigToNumber(table.leagueexplore.LeagueExploreConstantConfig, 'LEAGUE_EXPLORE:DAILY_WAR_START_HOUR'),
				dailyWarEndHour: TableConstUtils.getConstConfigToNumber(table.leagueexplore.LeagueExploreConstantConfig, 'LEAGUE_EXPLORE:DAILY_WAR_END_HOUR'),
				initStarConfigId: TableConstUtils.getConstConfigToNumber(table.leagueexplore.LeagueExploreConstantConfig, 'LEAGUE_EXPLORE:INIT_STAR_CONFIG_ID'),
				fightContinueMinutes: TableConstUtils.getConstConfigToNumber(table.leagueexplore.LeagueExploreConstantConfig, 'LEAGUE_EXPLORE:FIGHT_CONTINUE_MINUTES'),
				dailySettleHangUpHour: TableConstUtils.getConstConfigToNumber(table.leagueexplore.LeagueExploreConstantConfig, 'LEAGUE_EXPLORE:DAILY_SETTLE_HANG_UP_HOUR'),
			}
			this._maxBuyAtkTimes = G.TableManager.getAllData(table.leagueexplore.LeagueExploreResetAttackLimitConfig).length;
		}
		if (this._starMap.size <= 0) {
			let allCfgs = G.TableManager.getAllData(table.leagueexplore.LeagueExploreStarConfig);
			allCfgs?.forEach((value) => {
				let levelVo: ILeagueExploreStarLevelVo = null;
				if (this._starLevelMap.has(value.level)) {
					levelVo = this._starLevelMap.get(value.level);
				} else {
					let levelCfg = G.TableManager.getDataById(table.leagueexplore.LeagueExploreStarLevelConfig, value.level);
					if (!levelCfg) {
						console.warn(`勘探星球等级${value.level}对应的配置不存在`)
					} else {
						levelVo = {
							cfg: levelCfg,
							stars: []
						};
						this._starLevelMap.set(value.level, levelVo);
					}
				}

				let data: ILeagueExploreStarVo = {
					cfg: value,
					vo: null,
				}
				if (levelVo) {
					levelVo.stars.push(data);
				}
				this._starMap.set(value.id, data);
			})
		}
		this._showLevelIds.length = 0;
		this.initAllBuildingVo();
		this.initAllTeleportPoint();
	}

	/**初始化所有建筑VO*/
	protected initAllBuildingVo(): void {
		if (this._buildingMap.size <= 0) {
			let allCfgs = G.TableManager.getAllData(table.leagueexplore.LeagueExploreBuildingConfig);
			allCfgs?.forEach((cfg) => {
				let buildingCfg = G.TableManager.getDataById(table.map.MapBuildingConfig, cfg.id);
				let buildingVo: ILeagueExploreBuildingVo = {
					cfg: cfg,
					buildingCfg: buildingCfg,
					briefVo: null,
					vo: null
				};
				this._buildingMap.set(cfg.id, buildingVo);

				let newFactory: ILeagueExploreBuildingFactoryVo = null;
				let buildingType = ServerEnums.LeagueExploreBuildingType[buildingVo.cfg.buildingType];
				if (buildingType == ServerEnums.LeagueExploreBuildingType.MINE) {
					//是矿
					let factoryVo: ILeagueExploreBuildingFactoryVo = null;
					if (this._buildingFactoryMap.has(buildingVo.cfg.parentBuildingId)) {
						factoryVo = this._buildingFactoryMap.get(buildingVo.cfg.parentBuildingId);
					} else {
						factoryVo = {
							factory: null,
							mines: [],
						};
						this._buildingFactoryMap.set(buildingVo.cfg.parentBuildingId, factoryVo);
						newFactory = factoryVo;
					}
					factoryVo.mines.push(buildingVo);
				} else if (buildingType == ServerEnums.LeagueExploreBuildingType.FACTORY) {
					//是工厂
					let factoryVo: ILeagueExploreBuildingFactoryVo = null;
					if (this._buildingFactoryMap.has(buildingVo.cfg.id)) {
						factoryVo = this._buildingFactoryMap.get(buildingVo.cfg.id);
					} else {
						factoryVo = {
							factory: null,
							mines: [],
						};
						this._buildingFactoryMap.set(buildingVo.cfg.id, factoryVo);
						newFactory = factoryVo;
					}
					factoryVo.factory = buildingVo;
				}
				if (newFactory) {
					let factorys: ILeagueExploreBuildingFactoryVo[] = null;
					if (this._buildingFactoryForStarMap.has(buildingVo.cfg.starConfigId)) {
						factorys = this._buildingFactoryForStarMap.get(buildingVo.cfg.starConfigId);
					} else {
						factorys = [];
						this._buildingFactoryForStarMap.set(buildingVo.cfg.starConfigId, factorys)
					}
					factorys.push(newFactory);
				}
			})
		}
	}

	/**初始化所有随机出生点*/
	protected initAllTeleportPoint(): void {
		if (!this._allTeleportPointMap) {
			this._allTeleportPointMap = new Map();
			let allCfgs = G.TableManager.getAllData(table.map.MapBuildingConfig);
			allCfgs?.forEach((cfg) => {
				if (cfg.building_type == MapObjectType.teleportPoint) {
					//是当前星球的出生点
					let arr: table.map.MapBuildingConfig[] = null;
					if (this._allTeleportPointMap.has(cfg.map_id)) {
						arr = this._allTeleportPointMap.get(cfg.map_id);
					} else {
						arr = [];
						this._allTeleportPointMap.set(cfg.map_id, arr)
					}
					arr.push(cfg);
				}
			})
		}
	}

	/*********************************数据处理*********************************/
	/**静态配置数据*/
	public get constCfg(): ILeagueExploreConstCfg {
		return this._constCfg;
	}

	/**活动信息*/
	public get activityinfo(): Vo.leagueexplore.LeagueExploreActivityInfoVo {
		return this._activityinfo;
	}

	/**我的日志*/
	public get myRecords(): Vo.leagueexplore.PlayerLeagueExploreRecord[] {
		return this._myRecords;
	}

	/**联盟日志*/
	public get leagueRecords(): Vo.leagueexplore.LeagueExploreRecord[] {
		return this._leagueRecords;
	}

	/**当前展示的星球等级列表*/
	public get showLevelIds(): number[] {
		return this._showLevelIds;
	}

	/**最多购买进攻次数*/
	public get maxBuyAtkTimes():number {
		return this._maxBuyAtkTimes;
	}

	/**获取星球等级信息*/
	public getStarLevelVo(level: number): ILeagueExploreStarLevelVo {
		if (this._starLevelMap.has(level)) {
			return this._starLevelMap.get(level);
		}
		return null;
	}

	/**获取星球信息*/
	public getStarVo(starId: number): ILeagueExploreStarVo {
		if (this._starMap.has(starId)) {
			return this._starMap.get(starId);
		}
		return null;
	}

	/**获取星球所有出生点*/
	public getTeleportPoints(starId: number): table.map.MapBuildingConfig[] {
		if (this._allTeleportPointMap.has(starId)) {
			return this._allTeleportPointMap.get(starId);
		}
		return [];
	}

	/**获取建筑信息*/
	public getBuildingVo(configId: number): ILeagueExploreBuildingVo {
		if (this._buildingMap.has(configId)) {
			return this._buildingMap.get(configId);
		}
		return null;
	}

	/**获取工厂列表*/
	public getFactorys(starId: number): ILeagueExploreBuildingFactoryVo[] {
		if (this._buildingFactoryForStarMap.has(starId)) {
			return this._buildingFactoryForStarMap.get(starId);
		}
		return [];
	}

	/**获取矿场协助驻守的对象*/
	public getAssistDefendTargetForMine(buildingVo: ILeagueExploreBuildingVo): Vo.leagueexplore.LeagueExploreMemberBriefVo | table.leagueexplore.LeagueExploreRobotConfig {
		let isMine: boolean = ServerEnums.LeagueExploreBuildingType[buildingVo.cfg.buildingType] == ServerEnums.LeagueExploreBuildingType.MINE
		if (isMine) {
			let state = this.getBuildingOccupyState(buildingVo);
			if (state != LeaugeExploreBuildingOccupyState.Me) {
				//矿场需要先击败工厂守卫
				let factoryVo = GIns.leagueExploreModel.getBuildingVo(buildingVo.cfg.parentBuildingId);
				if (factoryVo) {
					let factoryState = GIns.leagueExploreModel.getBuildingOccupyState(factoryVo);
					if (factoryState == LeaugeExploreBuildingOccupyState.Enemy || factoryState == LeaugeExploreBuildingOccupyState.Idle) {
						//工厂是敌方占领
						let myInfo = this.activityinfo.playerInfoVo;
						let enemy: Vo.leagueexplore.LeagueExploreMemberBriefVo | table.leagueexplore.LeagueExploreRobotConfig
						if (buildingVo.vo.parentMemberVos?.length > 0) {
							//有玩家占领就打玩家
							let memberVos = buildingVo.vo.parentMemberVos.concat().sort((a, b) => {
								return a.occupyIndex - b.occupyIndex;
							})
							if (myInfo.attackBuildingConfigId == buildingVo.cfg.id) {
								//有攻击记录就代表
								for (let i = 0; i < memberVos.length; i++) {
									if (myInfo?.defeatPlayerIds?.indexOf(memberVos[i].playerId) == -1) {
										enemy = memberVos[i];
										break;
									}
								}
							} else {
								//没有记录就代表要从第一个开始打
								enemy = memberVos[0]
							}
						}
						if (!enemy) {
							let isRobotDead: boolean = buildingVo.vo.robotVo == null || buildingVo.vo.robotVo.rebirthTime > G.TimeManager.serverNow;
							if (!isRobotDead) {
								//没有玩家打机器人
								if (myInfo.attackBuildingConfigId == buildingVo.cfg.id) {
									//有攻击记录就代表
									if (myInfo.defeatRobot) {
										enemy = null;
									} else {
										enemy = G.TableManager.getDataById(table.leagueexplore.LeagueExploreRobotConfig, factoryVo.cfg.robotConfigId);
									}

								} else {
									//没有记录就代表要从第一个开始打
									enemy = G.TableManager.getDataById(table.leagueexplore.LeagueExploreRobotConfig, factoryVo.cfg.robotConfigId);
								}
							}
						}
						return enemy;
					}
				}
			}
		}
		return null;
	}

	/**获取建筑所属联盟id*/
	public getBuildingOccupyLeagueId(vo: ILeagueExploreBuildingVo): number {
		if (vo?.briefVo?.defendLeagueId > 0) {
			//优先使用防守联盟id字段
			return vo.briefVo.defendLeagueId;
		}
		if (vo?.briefVo?.occupyPlayerBaseVos?.length > 0) {
			let member = vo.briefVo.occupyPlayerBaseVos.find((value) => value != null && value != undefined);
			if (member) {
				return member.leagueId;
			}
		}
		return 0;
	}

	/**获取建筑所属联盟昵称*/
	public getBuildingOccupyLeagueName(vo: ILeagueExploreBuildingVo): string {
		if (vo?.briefVo?.defendLeagueName) {
			//优先使用防守联盟昵称字段
			return vo.briefVo.defendLeagueName;
		}
		if (vo?.briefVo?.occupyPlayerBaseVos?.length > 0) {
			let member = vo.briefVo.occupyPlayerBaseVos.find((value) => value != null && value != undefined);
			if (member) {
				return member.leagueName;
			}
		}
		return '';
	}

	/**获取建筑所属联盟昵称*/
	public getBuildingOccupyPlayerName(vo: ILeagueExploreBuildingVo): string {
		if (vo?.briefVo?.occupyPlayerBaseVos?.length > 0) {
			let member = vo.briefVo.occupyPlayerBaseVos.find((value) => value != null && value != undefined);
			if (member) {
				return member.name;
			}
		}
		return '';
	}

	/**获取建筑已占领状态*/
	public getBuildingOccupyCntForList(vos: ILeagueExploreBuildingVo[]): number {
		let cnt = 0;
		vos?.forEach((vo) => {
			if (this.getBuildingOccupyLeagueId(vo) > 0) {
				cnt++;
			}
		})
		return cnt;
	}

	/**获取建筑占领状态*/
	public getBuildingOccupyState(vo: ILeagueExploreBuildingVo): LeaugeExploreBuildingOccupyState {
		let state: LeaugeExploreBuildingOccupyState = LeaugeExploreBuildingOccupyState.Idle;
		if (vo && vo.vo) {
			let occupyBuildingConfigId = this.getBuildingOccupyLeagueId(vo);
			let myLeagueId: number = GIns.LeagueModel.getLeagueId();
			let myPlayerId: number = GIns.playerModel.playerId;
			if (occupyBuildingConfigId == 0) {
				//无人占领
				state = LeaugeExploreBuildingOccupyState.Idle;
			} else if (occupyBuildingConfigId == myLeagueId) {
				if (vo.briefVo.occupyPlayerBaseVos.find((value) => value.id == myPlayerId) != null) {
					//我占领了
					state = LeaugeExploreBuildingOccupyState.Me;
				} else {
					//我方占领
					let isFull: boolean = vo.briefVo.occupyPlayerBaseVos.length >= vo.cfg.defenderSeatCount;
					if (isFull) {
						//没有空位了
						if (this.activityinfo.playerInfoVo.occupyBuildingConfigId > 0) {
							//可互换
							state = LeaugeExploreBuildingOccupyState.MyLeagueCanExchange
						} else {
							//不可互换
							state = LeaugeExploreBuildingOccupyState.MyLeagueNoExchange
						}
					} else {
						state = LeaugeExploreBuildingOccupyState.MyLeagueNoFull
					}
				}
			} else {
				//敌方占领
				state = LeaugeExploreBuildingOccupyState.Enemy
			}
		}
		return state;
	}

	/**获取建筑收益列表*/
	public getBuildingIncomes(vo: ILeagueExploreBuildingVo): ILeagueExploreIncomeVo[] {
		let arr: ILeagueExploreIncomeVo[] = [];
		if (vo && vo.cfg) {
			if (vo.cfg.item1Id > 0) {
				arr.push({ itemId: vo.cfg.item1Id, itemAmountPerHour: vo.cfg.item1HourOutputCount })
			}
			// if (vo.cfg.item2Id > 0) {
			// 	arr.push({ itemId: vo.cfg.item2Id, itemAmountPerHour: vo.cfg.item2HourOutputCount })
			// }
		}
		return arr;
	}

	/**创建一个LeagueExploreBuildingVo*/
	protected createBuildingServerVo(): Vo.leagueexplore.LeagueExploreBuildingVo {
		let vo: Vo.leagueexplore.LeagueExploreBuildingVo = {
			buildingConfigId: 0,
			memberVos: [],
			robotVo: null,
			attacking: false,
			beAttackLeagueId: 0,
			beAttackPlayerId: 0,
			beAttackStartTime: 0,
			buildingState: 0,
			stateStartTime: 0,
			stateEndTime: 0,
			defendLeagueId: 0,
			defendLeagueName: '',
			parentMemberVos: [],
			parentRobotVo: null,
			beAttacking: false,
			capturePlayerMap: {},
			captureStartTime: 0,
		};
		return vo;
	}

	/**同步vo信息给brief*/
	protected syncBuildingBriefFromVo(vo: ILeagueExploreBuildingVo): void {
		if (vo.vo && vo.briefVo) {
			vo.briefVo.attacking = vo.vo.attacking;
			vo.briefVo.beAttackLeagueId = vo.vo.beAttackLeagueId;
			vo.briefVo.beAttackPlayerId = vo.vo.beAttackPlayerId;
			vo.briefVo.beAttackStartTime = vo.vo.beAttackStartTime;
			vo.briefVo.buildingConfigId = vo.vo.buildingConfigId;
			vo.briefVo.buildingState = vo.vo.buildingState;
			let arr = vo.vo.memberVos.concat();
			arr.sort((a, b) => {
				return a.occupyIndex - b.occupyIndex;
			})
			vo.briefVo.occupyPlayerBaseVos = arr.map((value) => { return value.baseVo });
			vo.briefVo.selfLeagueOccupy = vo.vo.memberVos.find((value) => value.baseVo.leagueId == GIns.LeagueModel.getLeagueId()) != null;
			vo.briefVo.stateEndTime = vo.vo.stateEndTime;
			vo.briefVo.stateStartTime = vo.vo.stateStartTime;
			vo.briefVo.defendLeagueId = vo.vo.defendLeagueId;
			vo.briefVo.defendLeagueName = vo.vo.defendLeagueName;
			vo.briefVo.beAttacking = vo.vo.beAttacking;
			vo.briefVo.capturePlayerMap = vo.vo.capturePlayerMap;
			vo.briefVo.captureStartTime = vo.vo.captureStartTime;
		}
	}

	/**更新建筑信息*/
	protected updateBuildingVo(vo: Vo.leagueexplore.LeagueExploreBuildingVo): ILeagueExploreBuildingVo {
		let buildingVo: ILeagueExploreBuildingVo = this.getBuildingVo(vo.buildingConfigId);
		if (buildingVo) {
			buildingVo.vo = vo;
			if (buildingVo.briefVo) {
				this.syncBuildingBriefFromVo(buildingVo);
			}
		}
		return buildingVo
	}

	/**根据简短信息更新建筑信息*/
	protected updateBuildingVoByBrief(vo: Vo.leagueexplore.LeagueExploreBuildingBriefVo): ILeagueExploreBuildingVo {
		let buildingVo: ILeagueExploreBuildingVo = this.getBuildingVo(vo.buildingConfigId);
		if (buildingVo) {
			buildingVo.briefVo = vo;
			if (buildingVo.vo == null) {
				//初始化
				buildingVo.vo = this.createBuildingServerVo();
			}
			//此时同步数据不包括玩家信息 因为信息不全
			buildingVo.vo.attacking = vo.attacking;
			buildingVo.vo.beAttackLeagueId = vo.beAttackLeagueId;
			buildingVo.vo.beAttackPlayerId = vo.beAttackPlayerId;
			buildingVo.vo.beAttackStartTime = vo.beAttackStartTime;

			buildingVo.vo.buildingConfigId = vo.buildingConfigId;
			buildingVo.vo.buildingState = vo.buildingState;
			buildingVo.vo.stateStartTime = vo.stateStartTime;
			buildingVo.vo.stateEndTime = vo.stateEndTime;
			buildingVo.vo.defendLeagueId = vo.defendLeagueId;
			buildingVo.vo.defendLeagueName = vo.defendLeagueName;
			buildingVo.vo.beAttacking = vo.beAttacking;
			buildingVo.vo.capturePlayerMap = vo.capturePlayerMap;
			buildingVo.vo.captureStartTime = vo.captureStartTime;
		}
		return buildingVo;
	}

	/**根据状态变更更新建筑信息*/
	protected updateBuildingVoByChange(vo: Vo.leagueexplore.LeagueExploreBuildingStateChangeVo): ILeagueExploreBuildingVo {
		let buildingVo: ILeagueExploreBuildingVo = this.getBuildingVo(vo.buildingConfigId);
		if (buildingVo) {
			if (buildingVo.vo == null) {
				//初始化
				buildingVo.vo = this.createBuildingServerVo();
			}
			buildingVo.vo.attacking = vo.attacking;
			buildingVo.vo.beAttackLeagueId = vo.beAttackLeagueId;
			buildingVo.vo.beAttackPlayerId = vo.beAttackPlayerId;
			buildingVo.vo.beAttackStartTime = vo.beAttackStartTime;
			buildingVo.vo.buildingConfigId = vo.buildingConfigId;
			buildingVo.vo.buildingState = vo.state;
			buildingVo.vo.stateStartTime = vo.stateStartTime;
			buildingVo.vo.stateEndTime = vo.stateEndTime;
			buildingVo.vo.memberVos = vo.occupyMemberVos;
			buildingVo.vo.defendLeagueId = vo.defendLeagueId;
			buildingVo.vo.defendLeagueName = vo.defendLeagueName;
			buildingVo.vo.parentMemberVos = vo.parentMemberVos;
			buildingVo.vo.parentRobotVo = vo.parentRobotVo;
			buildingVo.vo.beAttacking = vo.beAttacking;
			buildingVo.vo.capturePlayerMap = vo.capturePlayerMap;
			buildingVo.vo.captureStartTime = vo.captureStartTime;
			this.syncBuildingBriefFromVo(buildingVo);
		}
		return buildingVo;
	}

	/*********************************协议发送*********************************/

	/**
	 * 获取资源勘探活动信息
	 * 模块号：54	指令号：1
	 */
	public sendLoadLeagueExploreInfo(): void {
		this.send(this.MODULE, 1);
	}

	/**
	 * 获取星球列表
	 * 模块号：54	指令号：2
	 */
	public sendLoadStarList(): void {
		this.send(this.MODULE, 2);
	}

	/**
	 * 进入星球
	 * 模块号：54	指令号：3
	 */
	public sendEnterStar(c2s: Vo.leagueexplore.EnterStarC2S): void {
		this.send(this.MODULE, 3, c2s);
	}

	/**
	 * 退出星球
	 * 模块号：54	指令号：4
	 */
	public sendExitStar(c2s: Vo.leagueexplore.ExitStarC2S): void {
		this.send(this.MODULE, 4, c2s);
	}

	/**
	 * 获取星球建筑列表
	 * 模块号：54	指令号：5
	 */
	public sendLoadStarBuildingList(c2s: Vo.leagueexplore.LoadStarBuildingListC2S): void {
		this.send(this.MODULE, 5, c2s);
	}

	/**
	 * 获取星球建筑详情
	 * 模块号：54	指令号：6
	 */
	public sendLoadBuildingInfo(c2s: Vo.leagueexplore.LoadBuildingInfoC2S): void {
		this.send(this.MODULE, 6, c2s);
	}

	/**
	 * 攻击建筑
	 * 模块号：54	指令号：7
	 */
	public sendAttackBuilding(c2s: Vo.leagueexplore.AttackBuildingC2S): void {
		this.send(this.MODULE, 7, c2s);
	}

	/**
	 * 驻守建筑
	 * 模块号：54	指令号：8
	 */
	public sendDefendBuilding(c2s: Vo.leagueexplore.DefendBuildingC2S): void {
		this.send(this.MODULE, 8, c2s);
	}

	/**
	 * 互换建筑
	 * 模块号：54	指令号：9
	 */
	public sendExchangeBuilding(c2s: Vo.leagueexplore.ExchangeBuildingC2S): void {
		this.send(this.MODULE, 9, c2s);
	}

	/**
	 * 占领建筑
	 * 模块号：54	指令号：10
	 */
	public sendOccupyBuilding(c2s: Vo.leagueexplore.OccupyBuildingC2S): void {
		this.send(this.MODULE, 10, c2s);
	}

	/**
	 * 取消占领
	 * 模块号：54	指令号：11
	 */
	public sendCancelOccupy(): void {
		this.send(this.MODULE, 11);
	}

	/**
	 * 建筑置顶占领位置,返回当前占领位置
	 * 模块号：54	指令号：12
	 */
	public sendTopBuildingOccupy(): void {
		this.send(this.MODULE, 12);
	}

	/**
	 * 快速采矿
	 * 模块号：54	指令号：13
	 */
	public sendFastExplore(c2s: Vo.leagueexplore.FastExploreC2S): void {
		this.send(this.MODULE, 13, c2s);
	}

	/**
	 * 领取挂机奖励
	 * 模块号：54	指令号：14
	 */
	public sendDrawHangUpReward(): void {
		this.send(this.MODULE, 14);
	}

	/**
	 * 获取资源勘探个人日志记录
	 * 模块号：54	指令号：15
	 */
	public sendLoadPlayerExploreRecord(): void {
		this.send(this.MODULE, 15);
	}

	/**
	 * 获取资源勘探联盟日志记录
	 * 模块号：54	指令号：17
	 */
	public sendLoadLeagueExploreRecord(): void {
		this.send(this.MODULE, 17);
	}

	/**
	 * 分享建筑
	 * 模块号：54	指令号：16
	 */
	public sendShareBuilding(c2s: Vo.leagueexplore.ShareBuildingC2S): void {
		this.send(this.MODULE, 16, c2s, c2s);
	}

	/**
	 * 重置进攻冷却
	 * 模块号：54	指令号：18
	 */
	public sendResetAttackLimit(buildingId:number): void {
		this.send(this.MODULE, 18, {}, buildingId);
	}

	/*********************************协议监听*********************************/

	/**
	 * 获取资源勘探活动信息
	 * 模块号：54	指令号：1
	 */
	public recLoadLeagueExploreInfo(data: Vo.leagueexplore.LoadLeagueExploreInfoS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			this._activityinfo = data.content;
			this.emit(NotificationKey.LEAGUE_EXPLORE_TIME_CHANGE);
			this.emit(NotificationKey.LEAGUE_EXPLORE_MY_INFO_CHANGE);
		}
	}

	/**
	 * 获取星球列表
	 * 模块号：54	指令号：2
	 */
	public recLoadStarList(data: Vo.leagueexplore.LoadStarListS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			this._starLevelMap?.forEach((value) => {
				value.stars.length = 0;
			})
			this._showLevelIds.length = 0;
			data.content?.forEach((vo) => {
				let starVo: ILeagueExploreStarVo = null;
				if (this._starMap.has(vo.starConfigId)) {
					starVo = this._starMap.get(vo.starConfigId);
					starVo.vo = vo;
					let levelVo = this._starLevelMap.get(starVo.cfg.level);
					if (levelVo) {
						levelVo.stars.push(starVo);
						if (levelVo.stars.length == 1) {
							this._showLevelIds.push(levelVo.cfg.id);
						}
					}
				}
			});
			//星球等级排序
			this._showLevelIds.sort((a, b) => {
				return a - b;
			})
			//星球id排序
			this._showLevelIds.forEach((level) => {
				let starLevelVo = this._starLevelMap.get(level);
				starLevelVo.stars.sort((a, b) => {
					return a.cfg.id - b.cfg.id;
				})
			})
			this.emit(NotificationKey.LEAGUE_EXPLORE_STAR_INFO_CHANGE, 0);
		}
	}

	/**
	 * 进入星球
	 * 模块号：54	指令号：3
	 */
	public recEnterStar(data: Vo.leagueexplore.EnterStarS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			let starId: number = 0;
			data.content?.forEach((value) => {
				let vo = this.updateBuildingVoByBrief(value);
				starId = vo && vo.cfg ? vo.cfg.starConfigId : 0;
			});
			this.emit(NotificationKey.LEAGUE_EXPLORE_BUILDING_INFO_CHANGE_FOR_STAR, starId);
		}
	}

	/**
	 * 退出星球
	 * 模块号：54	指令号：4
	 */
	public recExitStar(data: Vo.leagueexplore.ExitStarS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
		}
	}

	/**
	 * 获取星球建筑列表
	 * 模块号：54	指令号：5
	 */
	public recLoadStarBuildingList(data: Vo.leagueexplore.LoadStarBuildingListS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			let starId: number = 0;
			data.content?.forEach((value) => {
				let vo = this.updateBuildingVoByBrief(value);
				starId = vo && vo.cfg ? vo.cfg.starConfigId : 0;
			});
			this.emit(NotificationKey.LEAGUE_EXPLORE_BUILDING_INFO_CHANGE_FOR_STAR, starId);
		}
	}

	/**
	 * 获取星球建筑详情
	 * 模块号：54	指令号：6
	 */
	public recLoadBuildingInfo(data: Vo.leagueexplore.LoadBuildingInfoS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			let vo = this.updateBuildingVo(data.content);
			this.emit(NotificationKey.LEAGUE_EXPLORE_BUILDING_INFO_CHANGE, vo.vo.buildingConfigId);
		}
	}

	/**
	 * 攻击建筑
	 * 模块号：54	指令号：7
	 */
	public recAttackBuilding(data: Vo.leagueexplore.AttackBuildingS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
		}
	}

	/**
	 * 驻守建筑
	 * 模块号：54	指令号：8
	 */
	public recDefendBuilding(data: Vo.leagueexplore.DefendBuildingS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
		}
	}

	/**
	 * 互换建筑
	 * 模块号：54	指令号：9
	 */
	public recExchangeBuilding(data: Vo.leagueexplore.ExchangeBuildingS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
		}
	}

	/**
	 * 占领建筑
	 * 模块号：54	指令号：10
	 */
	public recOccupyBuilding(data: Vo.leagueexplore.OccupyBuildingS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
		}
	}

	/**
	 * 取消占领
	 * 模块号：54	指令号：11
	 */
	public recCancelOccupy(data: Vo.leagueexplore.CancelOccupyS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
		}
	}

	/**
	 * 建筑置顶占领位置,返回当前占领位置
	 * 模块号：54	指令号：12
	 */
	public recTopBuildingOccupy(data: Vo.leagueexplore.TopBuildingOccupyS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			let topOccupyIndex: number = 1;
			let myOccupyConfigId: number = this._activityinfo.playerInfoVo.occupyBuildingConfigId;
			let vo = this._buildingMap.get(myOccupyConfigId);
			if (vo) {
				let myVo = vo.vo?.memberVos?.find(value => value.baseVo.id == GIns.playerModel.playerId);
				let exchangeVo = vo.vo?.memberVos?.find(value => value.occupyIndex == topOccupyIndex);
				if (myVo) {
					if (exchangeVo) {
						exchangeVo.occupyIndex = myVo.occupyIndex;
					}
					myVo.occupyIndex = topOccupyIndex;
				}
				this.emit(NotificationKey.LEAGUE_EXPLORE_BUILDING_INFO_CHANGE, vo.vo.buildingConfigId);
			}
		}
	}

	/**
	 * 快速采矿
	 * 模块号：54	指令号：13
	 */
	public recFastExplore(data: Vo.leagueexplore.FastExploreS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			if (data.content?.costItemResults?.length > 0) {
				this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content.costItemResults)
			}
			if (data.content?.rewardResults?.length > 0) {
				this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data.content?.rewardResults);
			}
		}
	}

	/**
	 * 领取挂机奖励
	 * 模块号：54	指令号：14
	 */
	public recDrawHangUpReward(data: Vo.leagueexplore.DrawHangUpRewardS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			if (data.content?.rewardResults?.length > 0) {
				this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data.content?.rewardResults);
			}
			this._activityinfo.playerInfoVo.hangUpStartTime = data.content.hangUpStartTime;
			this.emit(NotificationKey.LEAGUE_EXPLORE_MY_INFO_CHANGE);
		}
	}

	/**
	 * 获取资源勘探个人日志记录
	 * 模块号：54	指令号：15
	 */
	public recLoadPlayerExploreRecord(data: Vo.leagueexplore.LoadPlayerExploreRecordS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			this._myRecords = data.content;
			this.emit(NotificationKey.LEAGUE_EXPLORE_MY_RECORD_CHANGE);
		}
	}

	/**
	 * 获取资源勘探联盟日志记录
	 * 模块号：54	指令号：17
	 */
	public recLoadLeagueExploreRecord(data: Vo.leagueexplore.LoadLeagueExploreRecordS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			this._leagueRecords = data.content;
			this.emit(NotificationKey.LEAGUE_EXPLORE_LEAGUE_RECORD_CHANGE);
		}
	}

	/**
	 * 分享建筑
	 * 模块号：54	指令号：16
	 */
	public recShareBuilding(data: Vo.leagueexplore.ShareBuildingS2C, c2s: Vo.leagueexplore.ShareBuildingC2S): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			if (this._activityinfo?.playerInfoVo) {
				c2s.channelIds.forEach((channelId: number) => {
					this._activityinfo.playerInfoVo.channelShareTimeMap[channelId] = G.TimeManager.serverNow;
				})
			}
			this.emit(NotificationKey.LEAGUE_EXPLORE_SHARE_COMPLETE)
		}
	}

	/**
	 * 重置进攻冷却
	 * 模块号：54	指令号：18
	 */
	public recResetAttackLimit(data: Vo.leagueexplore.ResetAttackLimitS2C, buildingId:number): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据

			if (data.content?.costItemResults?.length > 0) {
				this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content.costItemResults)
			}
			if (this._activityinfo?.playerInfoVo) {
				this._activityinfo.playerInfoVo.attackLimitTime = data.content.attackLimitTime;
				this._activityinfo.playerInfoVo.attackLimitResetTimes++;
				this.emit(NotificationKey.LEAGUE_EXPLORE_MY_INFO_CHANGE);
				this.emit(NotificationKey.LEAGUE_EXPLORE_BUY_ATK_TIMES_COMPLETE);
			}
			//重置了进攻后 再次触发操作建筑
			GIns.leagueExploreMgr.handleOperBuilding(buildingId);
		}
	}

	/*********************************协议推送*********************************/

	/**
	 * 推送资源勘探活动开启,LeagueExploreStartVo
	 * 模块号：54	指令号：-1
	 */
	public pushActivityStart(data: Vo.leagueexplore.LeagueExploreActivityStartVo): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		if (this._activityinfo) {
			this._activityinfo.startTime = data.startTime;
			this._activityinfo.endTime = data.endTime;
			this._activityinfo.nextStartTime = data.nextStartTime;
			this.emit(NotificationKey.LEAGUE_EXPLORE_TIME_CHANGE);
		}
	}

	/**
	 * 推送建筑状态改变,LeagueExploreBuildingStateChangeVo
	 * 模块号：54	指令号：-2
	 */
	public pushBuildingStateChange(data: Vo.leagueexplore.LeagueExploreBuildingStateChangeVo): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		this.updateBuildingVoByChange(data);
		this.emit(NotificationKey.LEAGUE_EXPLORE_BUILDING_INFO_CHANGE, data.buildingConfigId);
	}

	/**
	 * 推送占领建筑,LeagueExploreBuildingOccupyResult
	 * 模块号：54	指令号：-3
	 */
	public pushOccupyBuildingResult(data: Vo.leagueexplore.LeagueExploreBuildingOccupyResult): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		if (this._activityinfo) {
			this._activityinfo.playerInfoVo = data.playerInfoVo;
			this.emit(NotificationKey.LEAGUE_EXPLORE_MY_INFO_CHANGE);
		}
		if (data.rewardResults?.length > 0) {
			this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, data.rewardResults);
		}
		let resultVo: IBattleResultVo = { isWin: data.win, fightType: FightType.LEAGUE_EXPLORE };
		this.emit(NotificationKey.BATTLE_RESULT, resultVo);
		this.emit(NotificationKey.BATTLE_RESULT_WIN, {
			fightType: FightType.LEAGUE_EXPLORE, exData: CommonBattleResultViewOpenArgs.create(
				data.win,
				false,
				NoOwnerItem.createByServerReward(data.rewardResults),
				null,
				FightType.LEAGUE_EXPLORE,
				0
			), isWin: data.win
		} as IBattleResultWinData);
	}

	/**
	 * 推送攻击建筑结果,LeagueExploreBuildingAttackResult
	 * 模块号：54	指令号：-4
	 */
	public pushAttackBuildingResult(data: Vo.leagueexplore.LeagueExploreBuildingAttackResult): void {
		//TODO 推送消息
		if (this._activityinfo) {
			this._activityinfo.playerInfoVo = data.playerInfoVo;
			this.emit(NotificationKey.LEAGUE_EXPLORE_MY_INFO_CHANGE);
		}

		if (data.rewardResults?.length > 0) {
			this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, data.rewardResults);
		}
		let resultVo: IBattleResultVo = { isWin: data.win, fightType: FightType.LEAGUE_EXPLORE };
		this.emit(NotificationKey.BATTLE_RESULT, resultVo);
		this.emit(NotificationKey.BATTLE_RESULT_WIN, {
			fightType: FightType.LEAGUE_EXPLORE, exData: CommonBattleResultViewOpenArgs.create(
				data.win,
				false,
				NoOwnerItem.createByServerReward(data.rewardResults),
				null,
				FightType.LEAGUE_EXPLORE,
				0
			), isWin: data.win
		} as IBattleResultWinData);
	}

	/**
	 * 推送建筑被攻击结果,LeagueExploreBuildingBeAttackResult
	 * 模块号：54	指令号：-5
	 */
	public pushBeAttackBuildingResult(data: Vo.leagueexplore.LeagueExploreBuildingBeAttackResult): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		if (this._activityinfo) {
			this._activityinfo.playerInfoVo = data.playerInfoVo;
			this.emit(NotificationKey.LEAGUE_EXPLORE_MY_INFO_CHANGE);
		}
	}

	// /**
	//  * 推送星球玩家建筑取消占领,LeagueExploreBuildingCancelOccupyVo
	//  * 模块号：54	指令号：-6
	//  */
	// public pushCancelOccupy(data: Vo.leagueexplore.LeagueExploreBuildingCancelOccupyVo): void {
	// 	//TODO 推送消息-在这里处理服务端返回的数据
	// 	this.updateBuildingVoByCancel(data);
	// 	this.emit(NotificationKey.LEAGUE_EXPLORE_BUILDING_INFO_CHANGE, data.buildingConfigId);
	// }

	/**
	 * 推送自己取消建筑占领,LeagueExploreSelfCancelOccupyVo
	 * 模块号：54	指令号：-7
	 */
	public pushSelfCancelOccupy(data: Vo.leagueexplore.LeagueExploreSelfCancelOccupyVo): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		if (this._activityinfo) {
			this._activityinfo.playerInfoVo = data.playerInfoVo;
			this.emit(NotificationKey.LEAGUE_EXPLORE_MY_INFO_CHANGE);
		}
	}

	/**
	 * 推送建筑驻守位置更新,LeagueExploreBuildingSeatUpdateVo
	 * 模块号：54	指令号：-8
	 */
	public pushBuildingSeatUpdate(data: Vo.leagueexplore.LeagueExploreBuildingSeatUpdateVo): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		let buildingVo: ILeagueExploreBuildingVo = this.getBuildingVo(data.buildingConfigId);
		if (buildingVo) {
			if (buildingVo.vo == null) {
				//初始化
				buildingVo.vo = this.createBuildingServerVo();
			}
			buildingVo.vo.memberVos = data.memberVos;
			this.syncBuildingBriefFromVo(buildingVo);
			this.emit(NotificationKey.LEAGUE_EXPLORE_BUILDING_INFO_CHANGE, data.buildingConfigId);
		}
	}

	/**
	 * 推送驻守建筑结果,LeagueExploreDefendBuildingResult
	 * 模块号：54	指令号：-9
	 */
	public pushDefendBuildingResult(data: Vo.leagueexplore.LeagueExploreDefendBuildingResult): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		if (this._activityinfo) {
			this._activityinfo.playerInfoVo = data.playerInfoVo;
			this.emit(NotificationKey.LEAGUE_EXPLORE_MY_INFO_CHANGE);
		}
	}

	/**
	 * 推送互换建筑结果,LeagueExploreExchangeBuildingResult
	 * 模块号：54	指令号：-10
	 */
	public pushExchangeBuildingResult(data: Vo.leagueexplore.LeagueExploreExchangeBuildingResult): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		if (this._activityinfo) {
			this._activityinfo.playerInfoVo = data.playerInfoVo;
			this.emit(NotificationKey.LEAGUE_EXPLORE_MY_INFO_CHANGE);
		}
		let resultVo: IBattleResultVo = { isWin: data.win, fightType: FightType.LEAGUE_EXPLORE };
		this.emit(NotificationKey.BATTLE_RESULT, resultVo);
		this.emit(NotificationKey.BATTLE_RESULT_WIN, {
			fightType: FightType.LEAGUE_EXPLORE, exData: CommonBattleResultViewOpenArgs.create(
				data.win,
				false,
				null,
				null,
				FightType.LEAGUE_EXPLORE,
				0
			), isWin: data.win
		} as IBattleResultWinData);
	}

	/**
	 * 推送被互换建筑结果,LeagueExploreBeExchangeBuildingResult
	 * 模块号：54	指令号：-11
	 */
	public pushBeExchangeBuildingResult(data: Vo.leagueexplore.LeagueExploreBeExchangeBuildingResult): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		if (this._activityinfo) {
			this._activityinfo.playerInfoVo = data.playerInfoVo;
			this.emit(NotificationKey.LEAGUE_EXPLORE_MY_INFO_CHANGE);
		}
	}

	/**
	 * 推送自动占领信息,LeagueExploreAutoOccupyBuildingVo
	 * 模块号：54	指令号：-12
	 */
	public pushAutoOccupyBuilding(data: Vo.leagueexplore.LeagueExploreAutoOccupyBuildingVo): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		if (this._activityinfo) {
			this._activityinfo.playerInfoVo = data.playerInfoVo;
			this.emit(NotificationKey.LEAGUE_EXPLORE_MY_INFO_CHANGE);
		}
	}

	/**
	 * 推送自己驻守的建筑信息变更,LeagueExploreBuildingVo
	 * 模块号：54	指令号：-13
	 */
	public pushSelfBuildingChange(data: Vo.leagueexplore.LeagueExploreBuildingVo): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		let vo = this.updateBuildingVo(data);
		this.emit(NotificationKey.LEAGUE_EXPLORE_BUILDING_INFO_CHANGE, vo.vo.buildingConfigId);
	}

	/**
	 * 推送自己离开星球
	 * 模块号：54	指令号：-14
	 */
	public pushSelfLeaveStar(): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		this.emit(NotificationKey.LEAGUE_EXPLORE_KICKED_OUT_STAR);
	}
}
