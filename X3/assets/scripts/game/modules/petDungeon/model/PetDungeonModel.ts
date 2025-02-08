import G from "../../../../core/comm/G";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { TableConstUtils } from "../../../../core/utils/TableConstUtils";
import { FightType } from "../../../comm/battle/enum/FightType";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { CommonBattleResultViewOpenArgs } from "../../battle/args/CommonBattleResultViewOpenArgs";
import { IBattleResultWinData } from "../../battle/vo/IBattleResultWinData";
import { IBattleResultVo } from "../../common/battle/structs/IBattleResultVo";
import { IPetDungeonConstCfg } from "./vo/IPetDungeonConstCfg";
import { IPetDungeonHeroVo } from "./vo/IPetDungeonHeroVo";
import { PetDungeonToyBoxVo } from "./vo/PetDungeonToyBoxVo";
import { PetDungeonToyShapeVo } from "./vo/PetDungeonToyShapeVo";

/**
 * 宠物副本模块协议号
 * @author GameCreator
 */
export class PetDungeonModel extends BaseModel {
	/**
	 * 模块标识
	 */
	private MODULE = 56;

	protected _constCfg: IPetDungeonConstCfg = null;

	protected _activityInfo: Vo.petdungeon.PetDungeonActivityInfoVo = null;

	protected _prepareHeroMap: Map<number, IPetDungeonHeroVo> = new Map();

	protected _toyShapeMap: Map<number, PetDungeonToyShapeVo> = new Map();

	protected _battleHeroIds: number[] = [];
	/**当前可上阵数量*/
	protected _curUnlockUpPositionCount: number = 0;
	/**最大可上阵数量*/
	protected _maxUpPositionCount: number = 0;
	/**当前通关记录id*/
	protected _curMaxFloorId: number = -1;
	/**当前座位数量对应关卡id*/
	protected _curPositionFloorId: number = 0;
	/**当前座位数量对应关卡列表下标*/
	protected _curPositionFloorIndex: number = 0;
	/**所有位置解锁所需关卡id配置*/
	protected _allPositionCfgMap: Map<number, number> = new Map();
	/**所有关卡建筑id列表*/
	protected _allFloorBuildingIds: number[] = [];
	/**第一关关卡id*/
	protected _firstFloorId: number = 0;
	/**最后一关关卡id*/
	protected _lastFloorId: number = 0;
	protected _firstFloorBuildingId: number = 0;
	/**下一关配置 没有就是空*/
	protected _nextFloorCfg: table.petdungeon.PetDungeonConfig = null;

	protected _curBuildingStarFloorId: number = 0;
	/**玩具格子数据*/
	protected _toyBoxVo: PetDungeonToyBoxVo = new PetDungeonToyBoxVo();

	/**我的排名*/
	public myRank: number = 0;
	/**扫荡奖励 只用于延时展示 展示完成就清空了数据*/
	public sweepRewards: Vo.reward.RewardResult[] = null;
	/**是否战斗中获取玩具*/
	public isBattleGetToy: boolean = false;
	/**记录返回仓库的玩具id 用于玩具归位动效*/
	public backToBoxId: number = 0;

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
		this.registerMsg(moduleId, 1, this.recLoadPetDungeonInfo);
		this.registerMsg(moduleId, 2, this.recSetUpPrepareHero);
		this.registerMsg(moduleId, 3, this.recChallenge);
		this.registerMsg(moduleId, 4, this.recSweep);
		this.registerMsg(moduleId, 5, this.recReset);
		this.registerMsg(moduleId, 6, this.recSetToyBuff);
		this.registerMsg(moduleId, 7, this.recInvalidToyBuff);
		this.registerMsg(moduleId, 8, this.recDiscardToy);
		this.registerMsg(moduleId, 9, this.recOpenToyBox);
		this.registerMsg(moduleId, 10, this.recSaveToyBox);
		this.registerMsg(moduleId, 11, this.recRefreshToyBox);
		this.registerMsg(moduleId, -1, this.pushPetDungeonStart);
		this.registerMsg(moduleId, -2, this.pushChallengeResult);
		this.registerMsg(moduleId, -3, this.pushSeasonReset);

	}

	/**初始化数据 */
	public initData(): void {
		if (this._constCfg == null) {
			//初始化静态配置
			this._constCfg = {
				dailyResetCosts: TableConstUtils.getConstConfigToKV(table.petdungeon.PetDungeonConstantConfig, 'PET_DUNGEON:DAILY_RESET_COSTS'),
				repeatResetCosts: TableConstUtils.getConstConfigToKV(table.petdungeon.PetDungeonConstantConfig, 'PET_DUNGEON:REPEAT_RESET_COSTS'),
				floorRepeatRewardTimes: TableConstUtils.getConstConfigToNumber(table.petdungeon.PetDungeonConstantConfig, 'PET_DUNGEON:FLOOR_REPEAT_REWARD_TIMES'),
				resetSweepFloorDiff: TableConstUtils.getConstConfigToNumber(table.petdungeon.PetDungeonConstantConfig, 'PET_DUNGEON:RESET_SWEEP_FLOOR_DIFF'),
				mapId: TableConstUtils.getConstConfigToNumber(table.petdungeon.PetDungeonConstantConfig, 'PET_DUNGEON:MAP_ID'),
				fightContinueMinutes: TableConstUtils.getConstConfigToNumber(table.petdungeon.PetDungeonConstantConfig, 'PET_DUNGEON:FIGHT_CONTINUE_MINUTES'),
				toyBoxMaxCount: TableConstUtils.getConstConfigToNumber(table.petdungeon.PetDungeonConstantConfig, 'PET_DUNGEON:TOY_BOX_MAX_COUNT'),
				toyMaxCount: TableConstUtils.getConstConfigToNumber(table.petdungeon.PetDungeonConstantConfig, 'PET_DUNGEON:TOY_MAX_COUNT'),
				refreshToyBoxCosts: TableConstUtils.getConstConfigToKV(table.petdungeon.PetDungeonConstantConfig, 'PET_DUNGEON:REFRESH_TOY_BOX_COSTS'),
				toyBoxRefreshCount: TableConstUtils.getConstConfigToNumber(table.petdungeon.PetDungeonConstantConfig, 'PET_DUNGEON:TOY_BOX_REFRESH_COUNT'),
				toyBoxIcon: TableConstUtils.getConstConfig(table.petdungeon.PetDungeonConstantConfig, 'PET_DUNGEON:TOY_BOX_ICON'),
			}

			let allCfgs = G.TableManager.getAllData(table.petdungeon.PetDungeonConfig);
			if (allCfgs?.length > 0) {
				//获取第一个和最后一个关卡id
				this._firstFloorId = allCfgs[0].id;
				this._lastFloorId = allCfgs[allCfgs.length - 1].id;
				this._firstFloorBuildingId = allCfgs[0].buildingConfigId;
			}

			this._curBuildingStarFloorId = this._firstFloorId;

			let allPositionCfgs = G.TableManager.getAllData(table.petdungeon.PetDungeonPositionConfig);
			if (allPositionCfgs.length > 0) {
				this._maxUpPositionCount = allPositionCfgs[allPositionCfgs.length - 1].positionCount;
			}
			let lastCnt: number = 1;
			allPositionCfgs?.forEach((cfg) => {
				for (let i = lastCnt; i <= cfg.positionCount; i++) {
					this._allPositionCfgMap.set(i, cfg.floorId);
				}
				lastCnt = cfg.positionCount + 1;
			});

			let allBuildingCfgs = G.TableManager.getAllData(table.petdungeon.PetDungeonBuildingConfig);
			this._allFloorBuildingIds = allBuildingCfgs.map(value => value.id);

			PetDungeonToyShapeVo.initMaxValue();
			let allShapeCfgs = G.TableManager.getAllData(table.petdungeon.PetDungeonToyShapeConfig);
			allShapeCfgs?.forEach((cfg) => {
				this._toyShapeMap.set(cfg.id, PetDungeonToyShapeVo.create(cfg));
			})
		}
	}

	/*********************************数据处理*********************************/
	/**活动信息*/
	public get activityInfo(): Vo.petdungeon.PetDungeonActivityInfoVo {
		return this._activityInfo;
	}

	/**静态配置*/
	public get constCfg(): IPetDungeonConstCfg {
		return this._constCfg;
	}

	/**备战英雄信息*/
	public get prepareHeroMap(): Map<number, IPetDungeonHeroVo> {
		return this._prepareHeroMap;
	}

	/**战斗英雄列表*/
	public get battleHeroIds(): number[] {
		return this._battleHeroIds
	}

	/**当前建筑开始关卡id*/
	public get curBuildingStarFloorId(): number {
		return this._curBuildingStarFloorId;
	}

	/**当前通关关卡id*/
	public get curMaxFloorId(): number {
		return this._curMaxFloorId;
	}

	/**下一关配置 如果通关了 就是最后一关配置*/
	public get nextFloorCfg(): table.petdungeon.PetDungeonConfig {
		return this._nextFloorCfg;
	}

	/**第一关id*/
	public get firstFloorId(): number {
		return this._firstFloorId;
	}

	/**最后一关id*/
	public get lastFloorId(): number {
		return this._lastFloorId;
	}

	/**第一个关卡建筑的id*/
	public get firstFoolBuildingId(): number {
		return this._firstFloorBuildingId;
	}

	/**是否已达最大关卡*/
	public get isFloorMax(): boolean {
		return this._curMaxFloorId >= this._lastFloorId;
	}

	/**当前已解锁备战位置这数量*/
	public get curUnlockUpPositionCount(): number {
		return this._curUnlockUpPositionCount
	}

	/**最大备战位置数量*/
	public get maxUpPositionCount(): number {
		return this._maxUpPositionCount;
	}

	/**玩具格子数据*/
	public get toyBoxVo(): PetDungeonToyBoxVo {
		return this._toyBoxVo;
	}

	/**通过玩具配置id获取玩具形状数据*/
	public getToyShapeVoByConfigId(toyConfigId: number): PetDungeonToyShapeVo {
		let cfg = G.TableManager.getDataById(table.petdungeon.PetDungeonToyConfig, toyConfigId);
		if (cfg) {
			return this.getToyShapeVo(cfg.shapeId);
		}
		return null;
	}

	/**获取玩具形状数据*/
	public getToyShapeVo(shapeId: number): PetDungeonToyShapeVo {
		if (this._toyShapeMap.has(shapeId)) {
			return this._toyShapeMap.get(shapeId);
		}
		return null;
	}

	/**是否是备战英雄*/
	public isPrepareHero(heroId: number): boolean {
		return this._prepareHeroMap.has(heroId);
	}

	/**获取英雄当前生命万分比*/
	public getPrepareHeroHpRatio(heroId: number): number {
		if (this._prepareHeroMap.has(heroId)) {
			return this._prepareHeroMap.get(heroId).hpRatio;
		}
		return 0;
	}

	/**获取位置解锁需要关卡id*/
	public getPositionIndexNeedFloorId(positionIndex: number): number {
		let cnt = positionIndex + 1;
		if (this._allPositionCfgMap.has(cnt)) {
			return this._allPositionCfgMap.get(cnt);
		}
		return 0;
	}

	/**是否可扫荡*/
	public isCanSweep(): boolean {
		let myInfo = this.activityInfo?.playerInfoVo;
		if (!myInfo) {
			return false;
		}
		let seasonMaxFloorDiff = myInfo.seasonMaxFloor - this.firstFloorId + 1;
		if (myInfo.currentMaxFloor <= 0 && seasonMaxFloorDiff > this.constCfg.resetSweepFloorDiff) {
			return true;
		}
		return false;
	}

	/**获取可扫荡到的关卡id*/
	public getSweepFloorId(): number {
		if (this.isCanSweep()) {
			//扫荡可达到赛季最高关卡的差值,m = 赛季最高关卡 - 差值
			let myInfo = this.activityInfo?.playerInfoVo;
			let floorId = myInfo.seasonMaxFloor - this.constCfg.resetSweepFloorDiff;
			return floorId;
		}
		return 0;
	}

	/**个人信息刷新处理*/
	protected onMyInfoUpdate(): void {
		let myInfo = this._activityInfo.playerInfoVo;
		//刷新新的备战英雄数据
		let newMap: Map<number, IPetDungeonHeroVo> = new Map();
		for (let key in myInfo.prepareHeroMap) {
			let heroId: number = Number(key);
			let heroVo: IPetDungeonHeroVo = null;
			if (this._prepareHeroMap.has(heroId)) {
				heroVo = this._prepareHeroMap.get(heroId);
			} else {
				heroVo = {
					heroId: heroId,
					hpRatio: 0,
				}
			}
			heroVo.hpRatio = Number(myInfo.prepareHeroMap[key]);
			newMap.set(heroId, heroVo);
		}
		this._prepareHeroMap = newMap;

		//刷新上阵阵容
		let formationVos = myInfo.customFormationVos;
		let formationVo = GIns.formationMgr.getFormationVoByType(FightType.PET_DUNGEON);
		formationVo.allPosData.forEach((value) => {
			value.setHeroId(0);
		})
		for (let i = 0, len = formationVos.length; i < len; i++) {
			let vo: Vo.formation.CustomFormationVo = formationVos[i];
			GIns.formationMgr.updatePosDatas(vo);
		}

		//关卡数变化处理
		if (this._curMaxFloorId != myInfo.currentMaxFloor) {
			this._curMaxFloorId = myInfo.currentMaxFloor;
			let allPositionCfgs = G.TableManager.getAllData(table.petdungeon.PetDungeonPositionConfig);
			if (myInfo.currentMaxFloor == 0) {
				//未通关
				this._curPositionFloorIndex = 0;
			} else {
				if (this._curPositionFloorId < this._curMaxFloorId) {
					//向上查找
					if (this._curPositionFloorIndex < allPositionCfgs.length - 1) {
						//代表还有更多的座位解锁
						let positionFloorIndex = this._curPositionFloorIndex + 1;
						while (positionFloorIndex < allPositionCfgs.length) {
							let cfg = allPositionCfgs[positionFloorIndex];
							if (cfg.floorId > this._curMaxFloorId) {
								//代表达到上限
								break;
							}
							positionFloorIndex++;
						}
						this._curPositionFloorIndex = Math.max(this._curPositionFloorIndex, positionFloorIndex - 1);
					}
				} else if (this._curPositionFloorId > this._curMaxFloorId) {
					//向下查找
					if (this._curPositionFloorIndex > 0) {
						//代表还有更少的座位解锁
						let positionFloorIndex = this._curPositionFloorIndex - 1;
						while (positionFloorIndex >= 0) {
							let cfg = allPositionCfgs[positionFloorIndex];
							if (cfg.floorId <= this._curMaxFloorId) {
								//代表找到了
								break;
							}
							positionFloorIndex--;
						}
						this._curPositionFloorIndex = Math.min(this._curPositionFloorIndex, positionFloorIndex);
					}
				}
			}
			this._curPositionFloorId = allPositionCfgs[this._curPositionFloorIndex].floorId;
			this._curUnlockUpPositionCount = allPositionCfgs[this._curPositionFloorIndex].positionCount;
			if (this._curMaxFloorId >= this._lastFloorId) {
				//已全部通关
				this._nextFloorCfg = G.TableManager.getDataById(table.petdungeon.PetDungeonConfig, this._lastFloorId);
			} else {
				//还有下一关
				this._nextFloorCfg = G.TableManager.getDataById(table.petdungeon.PetDungeonConfig, this._curMaxFloorId + 1);
			}

			//刷新地图当前需要展示的建筑起始关卡id
			this._curBuildingStarFloorId = this._firstFloorId;
			if (this._curMaxFloorId != 0) {
				//有战斗记录
				let nextCfg = this._nextFloorCfg;
				if (nextCfg) {
					let curIndex = this._allFloorBuildingIds.indexOf(nextCfg.buildingConfigId);
					if (curIndex != -1) {
						this._curBuildingStarFloorId = Math.max(this._firstFloorId, nextCfg.id - curIndex);
					}
				}
			}
			this.emit(NotificationKey.PET_DUNGEON_FLOOR_CHANGE);
		}
	}

	/**玩具信息变更*/
	protected onToyInfoUpdate(): void {
		this._toyBoxVo.updateToys(this._activityInfo?.playerInfoVo?.petDungeonToyBuffList);
	}

	/**更新当前战斗的英雄数据*/
	protected updateBattleHeros(): void {
		this._battleHeroIds.length = 0;
		//战斗完后会下阵死亡的角色 所以这里先记录下来 用来结算显示
		let formationVo = GIns.formationMgr.getFormationVoByType(FightType.PET_DUNGEON);
		if (formationVo) {
			formationVo.allPosData.forEach((value) => {
				if (value.heroId > 0) {
					this._battleHeroIds.push(value.heroId);
				}
			})
		}
	}

	/*********************************协议发送*********************************/

	/**
	 * 获取宠物副本活动信息
	 * 模块号：56	指令号：1
	 */
	public sendLoadPetDungeonInfo(): void {
		this.send(this.MODULE, 1);
	}

	/**
	 * 设置备战英雄
	 * 模块号：56	指令号：2
	 */
	public sendSetUpPrepareHero(c2s: Vo.petdungeon.SetUpPrepareHeroC2S): void {
		this.send(this.MODULE, 2, c2s);
	}

	/**
	 * 挑战宠物副本
	 * 模块号：56	指令号：3
	 */
	public sendChallenge(c2s: Vo.petdungeon.ChallengeC2S): void {
		this.send(this.MODULE, 3, c2s);
	}

	/**
	 * 宠物副本扫荡
	 * 模块号：56	指令号：4
	 */
	public sendSweep(): void {
		this.send(this.MODULE, 4);
	}

	/**
	 * 宠物副本重置
	 * 模块号：56	指令号：5
	 */
	public sendReset(): void {
		this.send(this.MODULE, 5);
	}

	/**
	 * 宠物副本放入补给箱玩具（如果有相同的直接升级）
	 * 模块号：56	指令号：6
	 * @param from 1 仓库上阵 2格子换位置 3升级
	 */
	public sendSetToyBuff(c2s: Vo.petdungeon.SetToyBuffC2S, from: number): void {
		this.send(this.MODULE, 6, c2s, from);
	}

	/**
	 * 玩具放回仓库
	 * 模块号：56	指令号：7
	 */
	public sendInvalidToyBuff(c2s: Vo.petdungeon.InvalidToyBuffC2S): void {
		this.send(this.MODULE, 7, c2s, c2s);
	}

	/**
	 * 丢弃玩具
	 * 模块号：56	指令号：8
	 */
	public sendDiscardToy(c2s: Vo.petdungeon.DiscardToyC2S, configId: number): void {
		this.send(this.MODULE, 8, c2s, configId);
	}

	/**
	 * 开启宝箱
	 * 模块号：56	指令号：9
	 */
	public sendOpenToyBox(c2s: Vo.petdungeon.OpenToyBoxC2S, configId: number): void {
		this.send(this.MODULE, 9, c2s, configId);
	}

	/**
	 * 存储宝箱 闯关后，如果获得宝箱，开启走开启宝箱协议，也就是type=1，不开启则存储进宝箱仓库中
	 * 模块号：56	指令号：10
	 */
	public sendSaveToyBox(): void {
		this.send(this.MODULE, 10);
	}

	/**
	 * 刷新玩具宝箱
	 * 模块号：56	指令号：11
	 */
	public sendRefreshToyBox(c2s: Vo.petdungeon.RefreshToyBoxC2S): void {
		this.send(this.MODULE, 11, c2s);
	}

	/*********************************协议监听*********************************/

	/**
	 * 获取宠物副本活动信息
	 * 模块号：56	指令号：1
	 */
	public recLoadPetDungeonInfo(data: Vo.petdungeon.LoadPetDungeonInfoS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			this._activityInfo = data.content;
			this.onMyInfoUpdate();
			this.onToyInfoUpdate();
			this.emit(NotificationKey.PET_DUNGEON_TIME_CHANGE);
			this.emit(NotificationKey.PET_DUNGEON_INFO_CHANGE);
			this.emit(NotificationKey.PET_DUNGEON_TOY_UPDATE);
		}
	}

	/**
	 * 设置备战英雄
	 * 模块号：56	指令号：2
	 */
	public recSetUpPrepareHero(data: Vo.petdungeon.SetUpPrepareHeroS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			if (this._activityInfo?.playerInfoVo) {
				this._activityInfo.playerInfoVo.prepareHeroMap = data.content.prepareHeroMap;
				this.onMyInfoUpdate();
				this.emit(NotificationKey.PET_DUNGEON_INFO_CHANGE);
			}
		}
	}

	/**
	 * 挑战宠物副本
	 * 模块号：56	指令号：3
	 */
	public recChallenge(data: Vo.petdungeon.ChallengeS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
		}
	}

	/**
	 * 宠物副本扫荡
	 * 模块号：56	指令号：4
	 */
	public recSweep(data: Vo.petdungeon.SweepS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			if (data.content?.rewardResults?.length > 0) {
				//先保存等待切换地图后才展示奖励
				this.sweepRewards = data.content.rewardResults;
				// this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data.content?.rewardResults);
			}

			if (this._activityInfo) {
				this._activityInfo.playerInfoVo = data.content.playerInfoVo;
				this.onMyInfoUpdate();
				this.onToyInfoUpdate();
				this.emit(NotificationKey.PET_DUNGEON_INFO_CHANGE);
				this.emit(NotificationKey.PET_DUNGEON_TOY_UPDATE);
			}

			this.emit(NotificationKey.PET_DUNGEON_SWEEP_COMPLETE);
		}
	}

	/**
	 * 宠物副本重置
	 * 模块号：56	指令号：5
	 */
	public recReset(data: Vo.petdungeon.ResetS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			if (data.content?.costItemResults?.length > 0) {
				this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content?.costItemResults)
			}
			if (this._activityInfo) {
				this._activityInfo.playerInfoVo = data.content.playerInfoVo;
				this.onMyInfoUpdate();
				this.onToyInfoUpdate();
				this.emit(NotificationKey.PET_DUNGEON_INFO_CHANGE);
				this.emit(NotificationKey.PET_DUNGEON_TOY_UPDATE);
			}
			this.emit(NotificationKey.PET_DUNGEON_RESET_COMPLETE);
		}
	}

	/**
	 * 宠物副本放入补给箱玩具（如果有相同的直接升级）
	 * 模块号：56	指令号：6
	 */
	public recSetToyBuff(data: Vo.petdungeon.SetToyBuffS2C, from: number): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			this._activityInfo.playerInfoVo.toyBoxList = data.content.toyBoxList;
			this._activityInfo.playerInfoVo.petDungeonToyList = data.content.petDungeonToyList;
			this._activityInfo.playerInfoVo.petDungeonToyBuffList = data.content.petDungeonToyBuffList;
			this.onToyInfoUpdate();
			this.emit(NotificationKey.PET_DUNGEON_TOY_UPDATE);
			if (from == 3) {
				GIns.floatingTextMgr.showTips('玩具合成成功！');
			} else {
				//数量没变 代表是升级了
				GIns.floatingTextMgr.showTips('玩具摆放成功！');
			}
		}
	}

	/**
	 * 玩具放回仓库
	 * 模块号：56	指令号：7
	 */
	public recInvalidToyBuff(data: Vo.petdungeon.InvalidToyBuffS2C, c2s: Vo.petdungeon.InvalidToyBuffC2S): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			this._activityInfo.playerInfoVo.toyBoxList = data.content.toyBoxList;
			this._activityInfo.playerInfoVo.petDungeonToyList = data.content.petDungeonToyList;
			this._activityInfo.playerInfoVo.petDungeonToyBuffList = data.content.petDungeonToyBuffList;
			this.onToyInfoUpdate();
			this.backToBoxId = c2s.id;
			this.emit(NotificationKey.PET_DUNGEON_TOY_UPDATE);
			GIns.floatingTextMgr.showTips('卸下成功');
		}
	}

	/**
	 * 丢弃玩具
	 * 模块号：56	指令号：8
	 */
	public recDiscardToy(data: Vo.petdungeon.DiscardToyS2C, configId: number): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			this._activityInfo.playerInfoVo.toyBoxList = data.content.toyBoxList;
			this._activityInfo.playerInfoVo.petDungeonToyList = data.content.petDungeonToyList;
			this._activityInfo.playerInfoVo.petDungeonToyBuffList = data.content.petDungeonToyBuffList;
			this.onToyInfoUpdate();
			this.emit(NotificationKey.PET_DUNGEON_TOY_UPDATE);
			let cfg = G.TableManager.getDataById(table.petdungeon.PetDungeonToyConfig, configId);
			if (cfg) {
				GIns.floatingTextMgr.showTips(`删除${cfg.name}成功`);
			}
		}
	}

	/**
	 * 开启宝箱
	 * 模块号：56	指令号：9
	 */
	public recOpenToyBox(data: Vo.petdungeon.OpenToyBoxS2C, configId: number): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			this._activityInfo.playerInfoVo.toyBoxList = data.content.toyBoxList;
			this._activityInfo.playerInfoVo.petDungeonToyList = data.content.petDungeonToyList;
			this._activityInfo.playerInfoVo.petDungeonToyBuffList = data.content.petDungeonToyBuffList;
			this.onToyInfoUpdate();
			this.emit(NotificationKey.PET_DUNGEON_TOY_UPDATE);
			let cfg = G.TableManager.getDataById(table.petdungeon.PetDungeonToyConfig, configId);
			if (cfg) {
				GIns.floatingTextMgr.showTips(`${cfg.name}已放入仓库`);
			}
		}
	}

	/**
	 * 存储宝箱 闯关后，如果获得宝箱，开启走开启宝箱协议，也就是type=1，不开启则存储进宝箱仓库中
	 * 模块号：56	指令号：10
	 */
	public recSaveToyBox(data: Vo.petdungeon.SaveToyBoxS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			this._activityInfo.playerInfoVo.toyBoxList = data.content.toyBoxList;
			this._activityInfo.playerInfoVo.petDungeonToyList = data.content.petDungeonToyList;
			this._activityInfo.playerInfoVo.petDungeonToyBuffList = data.content.petDungeonToyBuffList;
			this.onToyInfoUpdate();
			this.emit(NotificationKey.PET_DUNGEON_TOY_UPDATE);
		}
	}

	/**
	 * 刷新玩具宝箱
	 * 模块号：56	指令号：11
	 */
	public recRefreshToyBox(data: Vo.petdungeon.RefreshToyBoxS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			if (data.content.costItemResults?.length > 0) {
				this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content.costItemResults);
			}
			this._activityInfo.playerInfoVo.alreadyAdvertRefreshCount = data.content.alreadyAdvertRefreshCount;
			this._activityInfo.playerInfoVo.toyBoxList = data.content.toyBoxList;
			this.emit(NotificationKey.PET_DUNGEON_TOY_UPDATE);
		}
	}

	/*********************************协议推送*********************************/

	/**
	 * 推送宠物副本开启,PetDungeonActivityStartVo
	 * 模块号：56	指令号：-1
	 */
	public pushPetDungeonStart(data: Vo.petdungeon.PetDungeonActivityStartVo): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		if (this._activityInfo) {
			this._activityInfo.startTime = data.startTime;
			this._activityInfo.endTime = data.endTime;
			this._activityInfo.nextStartTime = data.nextStartTime;
			this.emit(NotificationKey.PET_DUNGEON_TIME_CHANGE);
		}
	}

	/**
	 * 推送挑战结果,PetDungeonChallengeResult
	 * 模块号：56	指令号：-2
	 */
	public pushChallengeResult(data: Vo.petdungeon.PetDungeonChallengeResult): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		if (this._activityInfo) {
			this._activityInfo.playerInfoVo = data.playerInfoVo;
			this.updateBattleHeros();
			this.onMyInfoUpdate();
			this.emit(NotificationKey.PET_DUNGEON_INFO_CHANGE);
		}
		if (data.rewardResults?.length > 0) {
			this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, data.rewardResults);
		}
		this.isBattleGetToy = data.tempPetDungeonToyBox != null;
		if (this.isBattleGetToy) {
			//获得了了玩具
			if (!this._activityInfo.playerInfoVo.toyBoxList) {
				this._activityInfo.playerInfoVo.toyBoxList = []
			}
			this._activityInfo.playerInfoVo.toyBoxList.push(data.tempPetDungeonToyBox);
			if (this._activityInfo.playerInfoVo.toyBoxList.length > this._constCfg.toyBoxMaxCount) {
				this._activityInfo.playerInfoVo.toyBoxList.shift();
			}
			this.sendSaveToyBox();
		}

		let nextLevelCb = null;
		if (this.isFloorMax == false && this.isBattleGetToy == false) {
			let formationVo = GIns.formationMgr.getFormationVoByType(FightType.PET_DUNGEON);
			if (!formationVo.isEmptyFormation()) {
				nextLevelCb = (): boolean => {
					return GIns.petDungeonMgr.challenge(this._nextFloorCfg.id);
				}
			}
		}
		let resultVo: IBattleResultVo = { isWin: data.win, fightType: FightType.PET_DUNGEON };
		this.emit(NotificationKey.BATTLE_RESULT, resultVo);
		this.emit(NotificationKey.BATTLE_RESULT_WIN, {
			fightType: FightType.PET_DUNGEON, exData: CommonBattleResultViewOpenArgs.create(
				data.win,
				false,
				NoOwnerItem.createByServerReward(data.rewardResults),
				nextLevelCb,
				FightType.PET_DUNGEON,
				5,
			), isWin: data.win
		} as IBattleResultWinData);
	}

	/**
	 * 推送赛季重置/每日重置,PetDungeonPlayerInfoVo
	 * 模块号：56	指令号：-3
	 */
	public pushSeasonReset(data: Vo.petdungeon.PetDungeonPlayerInfoVo): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		if (this._activityInfo) {
			this._activityInfo.playerInfoVo = data;
			this.onMyInfoUpdate();
			this.onToyInfoUpdate();
			this.emit(NotificationKey.PET_DUNGEON_INFO_CHANGE);
			this.emit(NotificationKey.PET_DUNGEON_TOY_UPDATE);
		}
	}

}
