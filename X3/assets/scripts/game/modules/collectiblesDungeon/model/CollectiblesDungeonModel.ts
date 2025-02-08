import { TableConstUtils } from "db://assets/scripts/core/utils/TableConstUtils";
import G from "../../../../core/comm/G";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { FightType } from "../../../comm/battle/enum/FightType";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { CommonBattleResultViewOpenArgs } from "../../battle/args/CommonBattleResultViewOpenArgs";
import { IBattleResultWinData } from "../../battle/vo/IBattleResultWinData";
import { IBattleResultVo } from "../../common/battle/structs/IBattleResultVo";
import { CollectiblesDungeonConditionVo } from "./vo/CollectiblesDungeonConditionVo";
import { ICollectiblesDungeonChapterVo } from "./vo/ICollectiblesDungeonChapterVo";
import { ICollectiblesDungeonConstCfg } from "./vo/ICollectiblesDungeonConstCfg";
import { ICollectiblesDungeonLevelVo } from "./vo/ICollectiblesDungeonLevelVo";

/**
 * 收藏品玩法
 * @author GameCreator
 */
export class CollectiblesDungeonModel extends BaseModel {
	/**
	 * 模块标识
	 */
	private MODULE = 57;

	/**静态配置*/
	protected _constCfg: ICollectiblesDungeonConstCfg = null;
	/**关卡最大星级*/
	protected _levelMaxStar: number = 3;
	/**关卡奖励星级*/
	protected _chapterRewardsStars: number[] = [10, 20, 30];
	/**副本数据*/
	protected _vo: Vo.collectiblesdungeon.CollectiblesDungeonVo = null;
	/**章节id列表*/
	protected _chapterIds: number[] = [];
	/**章节信息map*/
	protected _chapterVoMap: Map<number, ICollectiblesDungeonChapterVo> = new Map();
	/**关卡信息map*/
	protected _levelVoMap: Map<number, ICollectiblesDungeonLevelVo> = new Map();
	/**第一关关卡id*/
	protected _firstLevelId: number;
	/**最后一关关卡id*/
	protected _lastLevelId: number;
	/**当前通关的最大关卡id*/
	protected _maxPassLevelId: number;
	/**当前战斗的关卡id*/
	protected _battleId: number;
	/**当前战斗的关卡是否胜利*/
	protected _isBattleWin: boolean = false;

	constructor() {
		super();
		this.regist();
	}

	public static getModule(): number {
		return this.ins().MODULE;
	}

	listenNotifications(): string[] {
		return [
			NotificationKey.COLLECTIBLES_DUNGEON_UPDATE_FROM_GM
		];
	}

	notificationHandler(event: string, args?: any): void {
		switch (event) {
			case NotificationKey.COLLECTIBLES_DUNGEON_UPDATE_FROM_GM:
				this._vo = args;
				this.updateVoFromServer();
				this.emit(NotificationKey.COLLECTIBLES_DUNGEON_INFO_CHANGE);
				break;
		}
	}

	/**
   * 注册所有从服务端收到的回调。
   */
	private regist(): void {
		// TODO 注册所有的指令
		let moduleId = this.MODULE;
		this.registerMsg(moduleId, 1, this.recCollectiblesDungeonInfo);
		this.registerMsg(moduleId, 2, this.recChallenge);
		this.registerMsg(moduleId, 3, this.recSweep);
		this.registerMsg(moduleId, 4, this.recItemReward);
		this.registerMsg(moduleId, 5, this.recAddAdvertCount);
		this.registerMsg(moduleId, -1, this.pushCollectiblesChallengeResult);
	}

	public initData(): void {
		if (this._constCfg == null) {
			//初始化静态配置
			this._constCfg = {
				initSweepCount: TableConstUtils.getConstConfigToNumber(table.collectiblesdungeon.CollectiblesDungeonConstantConfig, 'COLLECTIBLES_DUNGEON:INIT_SWEEP_COUNT'),
			}

			let allCfgs = G.TableManager.getAllData(table.collectiblesdungeon.CollectiblesDungeonConfig);
			allCfgs?.forEach((cfg) => {
				let vo: ICollectiblesDungeonChapterVo = null;
				if (this._chapterVoMap.has(cfg.chapterId)) {
					vo = this._chapterVoMap.get(cfg.chapterId);
				} else {
					vo = {
						chapterId: cfg.chapterId,
						levelIds: [],
						curStar: 0,
						maxStar: 0,
						rewardStateMap: new Map(),
					};
					this._chapterVoMap.set(cfg.chapterId, vo);
					this._chapterIds.push(cfg.chapterId);
				}
				vo.levelIds.push(cfg.id);
				vo.maxStar += this._levelMaxStar;
				this._levelVoMap.set(cfg.id, {
					id: cfg.id,
					cfg: cfg,
					curStar: 0,
					conditions: [
						new CollectiblesDungeonConditionVo(cfg.conditionOne),
						new CollectiblesDungeonConditionVo(cfg.conditionTwo),
						new CollectiblesDungeonConditionVo(cfg.conditionThree)
					]
				})
			});
			if (allCfgs.length > 0) {
				this._firstLevelId = allCfgs[0].id;
				this._lastLevelId = allCfgs[allCfgs.length - 1].id;
			}

			let allChapterStarCfgs = G.TableManager.getAllData(table.collectiblesdungeon.CollectiblesDungeonChapterStarConfig);
			if (allChapterStarCfgs.length >= this._chapterRewardsStars.length) {
				this._chapterRewardsStars = allChapterStarCfgs.map((cfg) => cfg.star);
			}
		}

		//每次登录清除数据

		this._chapterVoMap.forEach((vo) => {
			vo.curStar = 0;
			this._chapterRewardsStars.forEach((star) => {
				vo.rewardStateMap.set(star, false);
			})
		});
		this._levelVoMap.forEach((vo) => {
			vo.curStar = 0;
		})
	}

	/*********************************数据处理*********************************/

	/**静态配置*/
	public get constCfg(): ICollectiblesDungeonConstCfg {
		return this._constCfg;
	}

	/**收藏品副本数据*/
	public get vo(): Vo.collectiblesdungeon.CollectiblesDungeonVo {
		return this._vo;
	}

	/**章节id列表*/
	public get chapterIds(): number[] {
		return this._chapterIds;
	}

	/**最小关卡id*/
	public get firstLevelId(): number {
		return this._firstLevelId;
	}

	/**最大关卡id*/
	public get lastLevelId(): number {
		return this._lastLevelId;
	}

	/**当前通关最大关卡id*/
	public get maxPassLevelId(): number {
		return this._maxPassLevelId;
	}

	/**所有章节数据*/
	public get chapterVoMap(): Map<number, ICollectiblesDungeonChapterVo> {
		return this._chapterVoMap;
	}

	/**章节奖励星级列表*/
	public get chapterRewardsStars(): number[] {
		return this._chapterRewardsStars
	}

	/**当前战斗的关卡id*/
	public get battleId(): number {
		return this._battleId;
	}

	/**当前战斗是否胜利*/
	public get isBattleWin(): boolean {
		return this._isBattleWin;
	}

	/**获取章节数据*/
	public getChapterVo(chapterId: number): ICollectiblesDungeonChapterVo {
		if (this._chapterVoMap.has(chapterId)) {
			return this._chapterVoMap.get(chapterId);
		}
		return null;
	}

	/**获取关卡数据*/
	public getLevelVo(floorId: number): ICollectiblesDungeonLevelVo {
		if (this._levelVoMap.has(floorId)) {
			return this._levelVoMap.get(floorId);
		}
		return null;
	}

	/**当前章节是否可挑战*/
	public isLevelCanChallenge(levelVo: ICollectiblesDungeonLevelVo): boolean {
		if (levelVo && levelVo.id == this.firstLevelId || levelVo.id <= this._maxPassLevelId + 1) {
			return true;
		}
		return false;
	}

	/**获取扫荡奖励*/
	public getSweepRewards(): { k: number, v: number }[] {
		// if (this._maxPassLevelId > 0) {
		// 	let vo = this.getLevelVo(this._maxPassLevelId);
		// 	if (vo) {
		// 		return vo.cfg.sweepRewards;
		// 	}
		// }
		// return [];
		let map: Map<number, { k: number, v: number }> = new Map();
		for (let i = this._firstLevelId; i <= this._maxPassLevelId; i++) {
			let vo = this._levelVoMap.get(i);
			if (vo && vo.cfg.sweepRewards) {
				vo.cfg.sweepRewards?.forEach((value) => {
					let reward: { k: number, v: number } = null;
					if (map.has(value.k)) {
						reward = map.get(value.k);
					} else {
						reward = { k: value.k, v: 0 };
						map.set(value.k, reward);
					}
					reward.v += value.v;
				})
			}
		}
		return Array.from(map.values());
	}

	/**通过服务器数据更新本地数据*/
	protected updateVoFromServer(): void {
		this._maxPassLevelId = 0;
		for (let key in this._vo.barrierInfoVo) {
			let barrierInfo: Vo.collectiblesdungeon.CollectiblesDungeonBarrierVo = this._vo.barrierInfoVo[key];
			if (this._levelVoMap.has(barrierInfo.id)) {
				let levelVo = this._levelVoMap.get(barrierInfo.id);
				let chapterVo = this._chapterVoMap.get(levelVo.cfg.chapterId);
				let diffStar = barrierInfo.star - levelVo.curStar;
				chapterVo.curStar += diffStar;
				levelVo.curStar = barrierInfo.star;
				if (barrierInfo.star > 0 && (this._maxPassLevelId < barrierInfo.id)) {
					this._maxPassLevelId = barrierInfo.id;
				}
			}
		}
		for (let key in this._vo.chapterStarVo) {
			let chapterStarInfo: Vo.collectiblesdungeon.CollectiblesDungeonChapterStarInfo = this._vo.chapterStarVo[key];
			if (this._chapterVoMap.has(chapterStarInfo.id)) {
				let chapterVo = this._chapterVoMap.get(chapterStarInfo.id);
				chapterVo.rewardStateMap.set(this._chapterRewardsStars[0], chapterStarInfo.rewardsOne);
				chapterVo.rewardStateMap.set(this._chapterRewardsStars[1], chapterStarInfo.rewardsTwo);
				chapterVo.rewardStateMap.set(this._chapterRewardsStars[2], chapterStarInfo.rewardsThree);
			}
		}
	}

	/*********************************协议发送*********************************/

	/**
	 * 获取收藏品玩法信息
	 * 模块号：57	指令号：1
	 */
	public sendCollectiblesDungeonInfo(): void {
		this.send(this.MODULE, 1);
	}

	/**
	 * 挑战收藏品玩法
	 * 模块号：57	指令号：2
	 */
	public sendChallenge(c2s: Vo.collectiblesdungeon.ChallengeC2S): void {
		this._battleId = c2s.collectiblesDungeonConfigId;
		this.send(this.MODULE, 2, c2s);
	}

	/**
	 * 收藏品玩法扫荡
	 * 模块号：57	指令号：3
	 */
	public sendSweep(): void {
		this.send(this.MODULE, 3);
	}

	/**
	 * 
	 * 模块号：57	指令号：4
	 */
	public sendItemReward(c2s: Vo.collectiblesdungeon.ItemRewardC2S): void {
		this.send(this.MODULE, 4, c2s);
	}

	/**
	 * 看广告增加次数
	 * 模块号：57	指令号：5
	 */
	public sendAddAdvertCount(): void {
		this.send(this.MODULE, 5);
	}

	/*********************************协议监听*********************************/

	/**
	 * 获取收藏品玩法信息
	 * 模块号：57	指令号：1
	 */
	public recCollectiblesDungeonInfo(data: Vo.collectiblesdungeon.CollectiblesDungeonInfoS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			this._vo = data.content;
			this.updateVoFromServer();
			this.emit(NotificationKey.COLLECTIBLES_DUNGEON_INFO_CHANGE);
		}
	}

	/**
	 * 挑战收藏品玩法
	 * 模块号：57	指令号：2
	 */
	public recChallenge(data: Vo.collectiblesdungeon.ChallengeS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			this.emit(NotificationKey.COLLECTIBLES_DUNGEON_CHALLENGE_START);
		}
	}

	/**
	 * 收藏品玩法扫荡
	 * 模块号：57	指令号：3
	 */
	public recSweep(data: Vo.collectiblesdungeon.SweepS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			if (data.content.rewardResults?.length > 0) {
				this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data.content.rewardResults);
			}
			this._vo = data.content.collectiblesDungeonVo;
			this.updateVoFromServer();
			this.emit(NotificationKey.COLLECTIBLES_DUNGEON_INFO_CHANGE);
			this.emit(NotificationKey.COLLECTIBLES_DUNGEON_SWEEP_COMPLETE);
		}
	}

	/**
	 * 
	 * 模块号：57	指令号：4
	 */
	public recItemReward(data: Vo.collectiblesdungeon.ItemRewardS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			if (data.content.rewardResults?.length > 0) {
				this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data.content.rewardResults);
			}
			this._vo = data.content.collectiblesDungeonVo;
			this.updateVoFromServer();
			this.emit(NotificationKey.COLLECTIBLES_DUNGEON_INFO_CHANGE);
		}
	}

	/**
	 * 看广告增加次数
	 * 模块号：57	指令号：5
	 */
	public recAddAdvertCount(data: Vo.collectiblesdungeon.AddAdvertCountS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			this._vo.challengeCount = data.content.challengeCount;
			this._vo.dailyAdvertChallengeCount = data.content.dailyAdvertChallengeCount;
			this.emit(NotificationKey.COLLECTIBLES_DUNGEON_INFO_CHANGE);
		}
	}

	/*********************************协议推送*********************************/

	/**
	 * 推送挑战结果,collectiblesDungeonChallengeVo
	 * 模块号：57	指令号：-1
	 */
	public pushCollectiblesChallengeResult(data: Vo.collectiblesdungeon.CollectiblesDungeonChallengeResult): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		if (data.rewardResults?.length > 0) {
			this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, data.rewardResults);
		}
		this._vo = data.playerInfoVo;
		this._isBattleWin = data.win;
		this.updateVoFromServer();
		this.emit(NotificationKey.COLLECTIBLES_DUNGEON_INFO_CHANGE);

		let nextLevelCb = null;
		let cfg = G.TableManager.getDataById(table.collectiblesdungeon.CollectiblesDungeonConfig, this._battleId);
		if (cfg && cfg.nextId && this._vo.challengeCount > 0) {
			let formationVo = GIns.formationMgr.getFormationVoByType(FightType.COLLECTIBLES_DUNGEON);
			if (!formationVo.isEmptyFormation()) {
				nextLevelCb = (): boolean => {
					return GIns.collectiblesDungeonMgr.challenge(cfg.id + 1);
				}
			}
		}
		let resultVo: IBattleResultVo = { isWin: data.win, fightType: FightType.COLLECTIBLES_DUNGEON };
		this.emit(NotificationKey.BATTLE_RESULT, resultVo);
		this.emit(NotificationKey.BATTLE_RESULT_WIN, {
			fightType: FightType.COLLECTIBLES_DUNGEON, exData: CommonBattleResultViewOpenArgs.create(
				data.win,
				false,
				NoOwnerItem.createByServerReward(data.rewardResults),
				nextLevelCb,
				FightType.COLLECTIBLES_DUNGEON,
				5,
				'',
				data
			), isWin: data.win
		} as IBattleResultWinData);
	}

}
