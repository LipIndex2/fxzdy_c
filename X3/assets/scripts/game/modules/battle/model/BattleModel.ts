import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import G from "../../../../core/comm/G";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { TableManager } from "../../../../core/table/TableManager";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { BattleLogicManager } from "../../../comm/battle/BattleLogicManager";
import { FightType } from "../../../comm/battle/enum/FightType";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { BtnConfirmViewOpenArgs } from "../../common/confirm/BtnConfirmView";
import { UICommonKey } from "../../common/const/UICommonConfig";
import { CommonI18nKeys } from "../../common/i18n/CommonI18nKeys";
import { IBattleEnterData } from "../vo/IBattleEnterData";
import { IBattleResult } from "../vo/IBattleResult";
import { IBattleUnitData } from "../vo/IBattleUnitData";
import { IBattlePetData } from "../vo/IBattlePetData";
import { UIManager } from "../../../../core/mvc/UIManager";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import { TeamChallengeUIKeys } from "../../teamChallenge/TeamChallengeUIKeys";
import { TeamChallengeModel } from "../../teamChallenge/model/TeamChallengeModel";
import { IBattleTeamData } from "../vo/IBattleTeamData";
import { BattleUtils } from "../../../comm/battle/BattleUtils";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";

/**
 * 战斗模块
 * @author GameCreator
 */
export class BattleModel extends BaseModel {
	/**
	 * 模块标识
	 */
	private MODULE = 22;

	listenNotifications(): string[] {
		return [
			NotificationKey.BATTLE_PLAY_UNIT_DEAD,
			NotificationKey.BATTLE_PLAY_UNIT_VERIFY,
			NotificationKey.BATTLE_PLAY_REQUEST_REBIRTH
		];
	}

	notificationHandler(event: string, args?: any): void {
		switch (event) {
			case NotificationKey.BATTLE_PLAY_UNIT_DEAD:
				this.sendUnitDeadIds(args[0], args[1]);
				break;
			case NotificationKey.BATTLE_PLAY_UNIT_VERIFY:
				this.sendUnitVerifyBattleAttr(args[0], args[1]);
				break;
			case NotificationKey.BATTLE_PLAY_REQUEST_REBIRTH:
				this.sendRevive(!!args);
				break;
		}
	}


	constructor () {
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
		this.registerMsg(moduleId, 1, this.recCancelBattle, true);
		this.registerMsg(moduleId, 2, this.recBattleEnd);
		this.registerMsg(moduleId, 3, this.recLoadBattleMonster, true);
		this.registerMsg(moduleId, 4, this.recHandleBattleContent);
		this.registerMsg(moduleId, 5, this.recRevive);
		this.registerMsg(moduleId, -1, this.pushStartBattle);
		// this.registerMsg(moduleId, -1, this.pushBattleView);
		this.registerMsg(moduleId, -2, this.pushCancelBattle);
		this.registerMsg(moduleId, -3, this.pushBattleContent);
		this.registerMsg(moduleId, -4, this.pushBattleEnd);
		this.registerMsg(moduleId, -5, this.pushBattleView);
	}

	// public get battleConfigId() {
	// 	return GIns.battleMgr.battleConfigId;
	// }

	private toBattleTeamDatas(vos: Array<Vo.battle.FightUnitVo>): IBattleTeamData[] {
		let arr: IBattleTeamData[] = []
		if (vos) {
			for (let i = 0; i < vos.length; i++) {
				let data: IBattleTeamData = {
					uid: vos[i].id,
					skillIds: vos[i].skillIds,
					type: vos[i].type
				};
				arr.push(data)
			}
		}
		return arr
	}

	/*宠物技能数据 */
	private toBattlePetData(vo: Vo.battle.FightUnitVo): IBattlePetData[] {
		let data: IBattlePetData = {
			uid: vo.id,
			configId: vo.configId,
			skillIds: vo.skillIds,
			attrs: vo.attributeIdMap as any,
		};
		return [data];
	}

	/**单位数据 */
	public toBattleUnitDatas(vos: Array<Vo.battle.FightUnitVo>): IBattleUnitData[] {
		let arr = [];
		if (!vos) return arr;

		for (let i = 0, len = vos.length; i < len; i++) {
			let vo = vos[i];
			for (let idx = 0; idx < vo.count; idx++) {
				let data: IBattleUnitData = {
					uid: vo.id + idx,
					configId: vo.configId,
					type: vo.type,
					level: vo.level,
					stage: vo.stage,
					star: vo.star,
					attrs: vo.attributeIdMap as any,
					skillIds: vo.skillIds,
					modelId: vo.model.modelConfigId,
					skinId: vo.model.heroSkinId,
					resourceId: vo.resourceId,
					resourceIdx: idx,
					monsterResourceId: vo.monsterResourceId,
					position: vo.position,
					surplusHp: vo.surplusHp,
				};
				arr.push(data);
			}
		}
		return arr;
	}

	/*********************************发送*********************************/
	/**等待发送的缓存 */
	private _handleWaitingCache: { [battleConfigId: number]: any[] } = {};

	private get handleWaitingCache() {
		return this._handleWaitingCache;
	}
	private clearWaitingCache() {
		this._handleWaitingCache = {};
		// this._handleWaitingCache.length = 0;
		this.emitNow(NotificationKey.BATTLE_CLEAR_WAITING_CACHE)
	}

	protected getCache(battleConfigId: number): any[] {
		let arr = this._handleWaitingCache[battleConfigId];
		if (!arr)
			arr = this._handleWaitingCache[battleConfigId] = [];
		return arr;
	}

	/**
	 * 单位死亡
	 */
	public sendUnitDeadIds(uids: number[], battleConfigId: number): void {
		let cache = this.getCache(battleConfigId);

		let type = ServerEnums.ClientBattleContentType.UNIT_DEAD;
		let len = cache.length;
		if (len && cache[len - 1].type == type) {
			cache[len - 1].deadUnitIds.push(...uids); //合并
		} else {
			let vo = {
				type,
				deadUnitIds: uids
			} as Vo.battle.UnitDeadBattleContent;
			cache.push(vo); //合并
		}

		if (!GameTimer.ins().hasTimer(this, this.sendHandleBattleContent)) {
			GameTimer.ins().once(500, this, this.sendHandleBattleContent);
		}
	}

	/***死亡发送单位的属性验证 */
	public sendUnitVerifyBattleAttr(datas: { unitId: number, checkSum: number }[], battleConfigId: number): void {
		let cache = this.getCache(battleConfigId);

		let fightUnitVerifyVo = {
			type: ServerEnums.ClientBattleContentType.FIGHT_UNIT_VERIFY,
			fightUnitVerifyVos: datas
		} as Vo.battle.FightUnitVerifyBattleContent;
		cache.push(fightUnitVerifyVo); //合并

		if (!GameTimer.ins().hasTimer(this, this.sendHandleBattleContent)) {
			GameTimer.ins().once(500, this, this.sendHandleBattleContent);
		}
	}

	/**波次变更*/
	public sendRoundChange(round: number, battleConfigId: number): void {
		let cache = this.getCache(battleConfigId);
		let vo: Vo.battle.RoundBattleContent = {
			type: ServerEnums.ClientBattleContentType.ROUND,
			round: round
		};
		cache.push(vo);

		if (!GameTimer.ins().hasTimer(this, this.sendHandleBattleContent)) {
			GameTimer.ins().once(500, this, this.sendHandleBattleContent);
		}
	}

	/**选择buff*/
	public sendSelectBuff(buffId: number, level: number, groupIndex: number, battleConfigId: number): void {
		let cache = this.getCache(battleConfigId);
		let vo: Vo.battle.BuffSelectBattleContent = {
			type: ServerEnums.ClientBattleContentType.BUFF_SELECT,
			buffId: buffId,
			groupIndex: groupIndex,
			level: level
		};
		cache.push(vo);

		if (!GameTimer.ins().hasTimer(this, this.sendHandleBattleContent)) {
			GameTimer.ins().once(500, this, this.sendHandleBattleContent);
		}
	}

	/**刷新buff*/
	public sendRefreshBuff(buffIds: number[], level: number, groupIndex: number, initRefresh: boolean, battleConfigId: number): void {
		let cache = this.getCache(battleConfigId);
		let vo: Vo.battle.BuffRefreshBattleContent = {
			type: ServerEnums.ClientBattleContentType.BUFF_REFRESH,
			buffIds: buffIds,
			groupIndex: groupIndex,
			level: level,
			initRefresh: initRefresh
		};
		cache.push(vo);

		if (!GameTimer.ins().hasTimer(this, this.sendHandleBattleContent)) {
			GameTimer.ins().once(500, this, this.sendHandleBattleContent);
		}
	}

	/**传送至下一层数*/
	public sendNextFloor(battleConfigId: number) {
		let cache = this.getCache(battleConfigId);
		let vo: Vo.battle.TransferNextFloorBattleContent = {
			type: ServerEnums.ClientBattleContentType.TRANSFER_NEXT_FLOOR,
		};
		cache.push(vo);
		if (!GameTimer.ins().hasTimer(this, this.sendHandleBattleContent)) {
			GameTimer.ins().once(500, this, this.sendHandleBattleContent);
		}
	}

	/*********************************协议发送*********************************/

	/**
	 * 取消/退出战斗
	 * 模块号：22	指令号：1
	 */
	public sendCancelBattle(battleConfigId: number): void {
		this.clearWaitingCache();

		let c2s = {} as Vo.battle.CancelBattleC2S;
		c2s.battleConfigId = battleConfigId;
		this.send(this.MODULE, 1, c2s, battleConfigId);
	}

	/**
	 * 战斗结束
	 * 模块号：22	指令号：2
	 */
	public sendBattleEnd(data: IBattleResult): void {
		let logic = BattleLogicManager.ins().getBattleLogicById(data.battleConfigId); //清空战斗
		if (logic && logic.isWatcher) {
			//判断是否有观战的结果，有的话马上弹除
			FacadeManager.ins().emit(NotificationKey.BATTLE_WATCH_COMPLETE, data);
			return
		}
		//this.clearWaitingCache();
		// if (GameTimer.ins().hasTimer(this, this.sendHandleBattleContent)) {
		// 	GameTimer.ins().clear(this, this.sendHandleBattleContent);

		// }
		this.sendHandleBattleContent(data.battleConfigId); //战斗结束马上发送缓存数据

		let c2s = {} as Vo.battle.BattleEndC2S;
		c2s.reqVo = {} as Vo.battle.BattleEndReqVo;
		c2s.reqVo.battleConfigId = data.battleConfigId;
		c2s.reqVo.statisticsVo = {} as Vo.battle.BattleStatisticsVo;
		c2s.reqVo.statisticsVo.battleResult = data.battleResult;

		c2s.reqVo.statisticsVo.attackerTotalHurt = data.attackerTotalHurt;
		c2s.reqVo.statisticsVo.attackerSurplusHp = data.attackerSurplusHp;
		c2s.reqVo.statisticsVo.attackerUnitStatisticsVos = data.attackerUnitStatisticsVos;

		c2s.reqVo.statisticsVo.defenderTotalHurt = data.defenderTotalHurt;
		if (logic.battleSetting.winToClearDefHp) {
			c2s.reqVo.statisticsVo.defenderSurplusHp = 0;
		} else
			c2s.reqVo.statisticsVo.defenderSurplusHp = data.defenderSurplusHp;
		c2s.reqVo.statisticsVo.defenderUnitStatisticsVos = data.defenderUnitStatisticsVos;
		c2s.reqVo.statisticsVo.abnormalHurtVos = data.maxHurtList;

		c2s.reqVo.statisticsVo.attackerHpPercent = data.attackerHpPercent;
		c2s.reqVo.statisticsVo.defenderHpPercent = data.defenderHpPercent;

		this.send(this.MODULE, 2, c2s, data);
	}


	/**
	 * 加载战斗怪物
	 * 模块号：22	指令号：3
	 */
	public sendLoadBattleMonster(battleMonsterResourceIds: number[], battleConfigId: number): void {
		let c2s = {} as Vo.battle.LoadBattleMonsterC2S;
		c2s.reqVo = { battleConfigId, battleResourceIds: battleMonsterResourceIds } as Vo.battle.LoadBattleMonsterReqVo;
		this.send(this.MODULE, 3, c2s, battleMonsterResourceIds);
	}

	/**
	 * 处理客户端战斗信息
	 * 模块号：22	指令号：4
	 */
	private sendHandleBattleContent(battleConfigId: number = -1): void {
		if (battleConfigId > 0) {
			//只处理1场战斗
			let cache = this.handleWaitingCache[battleConfigId];
			if (cache?.length) {
				this.sendHandleBattleContentHandler(battleConfigId, cache)
				delete this.handleWaitingCache[battleConfigId];
			}
		}
		else {
			for (let k in this.handleWaitingCache) {
				let battleConfigId = +k;
				this.sendHandleBattleContentHandler(battleConfigId, this.handleWaitingCache[k])
			}
			this.clearWaitingCache();
		}
	}

	private sendHandleBattleContentHandler(battleConfigId: number, battleContents: any[]): void {
		let logic = BattleLogicManager.ins().getBattleLogicById(battleConfigId); //清空战斗
		if (logic && logic.isWatcher) {
			return
		}

		if (!logic || logic?.isEndFight) {
			return
		}

		if (battleContents?.length) {
			let c2s = {} as Vo.battle.HandleBattleContentC2S;
			c2s.reportReqVo = { battleConfigId, battleContents } as Vo.battle.BattleContentReqVo
			this.send(this.MODULE, 4, c2s);
		}
	}

	/**
	 * 复活
	 * 模块号：22	指令号：5
	 * @param isFree 免费复活
	 */
	public sendRevive(isFree: boolean): void {
		let c2s = {} as Vo.battle.ReviveC2S;
		c2s.battleConfigId = GIns.battleMgr.battleConfigId;//能手动复活的必定是前台战斗
		c2s.autoRevive = isFree;

		this.send(this.MODULE, 5, c2s, isFree);
	}

	/*********************************协议监听*********************************/

	/**
	 * 取消/退出战斗
	 * 模块号：22	指令号：1
	 */
	public recCancelBattle(data: Vo.battle.CancelBattleS2C, battleConfigId: number): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			let logic = BattleLogicManager.ins().getBattleLogicById(battleConfigId); //清空战斗
			if (logic)
				logic.endFight()
		}
	}

	/**
	 * 战斗结束
	 * 模块号：22	指令号：2
	 */
	public recBattleEnd(data: Vo.battle.BattleEndS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
		}
	}

	/**
	 * 加载战斗怪物
	 * 模块号：22	指令号：3
	 */
	public recLoadBattleMonster(data: Vo.battle.LoadBattleMonsterS2C, resourceIds: number[]): void {
		if (data.code >= 0) {
			//this.emit(NotificationKey.PLAY_RESOURCE_REFRESH_UPDATE, resourceIds);
		}
		this.emit(NotificationKey.PLAY_RESOURCE_REFRESH_UPDATE, resourceIds); //标记怪点请求过了
	}

	/**
	 * 处理客户端战斗信息
	 * 模块号：22	指令号：4
	 */
	public recHandleBattleContent(data: Vo.battle.HandleBattleContentS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
		}
	}

	/**
	   * 复活
	   * 模块号：22	指令号：5
	   */
	public recRevive(data: Vo.battle.ReviveS2C, isFree: boolean): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content);
			this.emit(NotificationKey.BATTLE_PLAY_REQUEST_REBIRTH_PASSED, isFree);
		}
	}

	/*********************************协议推送*********************************/

	/**
	 * 推送开始战斗,BattleVo
	 * 模块号：22	指令号：-1
	 * isWatch : 是否观战
	 */
	@LogBusiness("[Server 战斗推送] 开始战斗")
	public pushStartBattle(info: Vo.battle.BattleVo, isWatch: boolean = false): void {

		console.log(info);

		this.clearWaitingCache();

		let cfg = TableManager.getDataById(table.battle.BattleConfig, info.battleConfigId);
		if (cfg && FightType[cfg.fightType]) {
			if (!info.background)
				GIns.battleMgr.battleConfigId = info.battleConfigId;
			let endTime = info.startTime + cfg.fightMaxSecond * 1000;
			let attackerPetData;
			// info.attackerVo.petUnitVo = {
			// 	attributeIdMap: { 1: 2250, 2: 639, 3: 40875 },
			// 	configId: 502,
			// 	id: 2131238513,
			// 	skillIds: ["PET502_s101", "PET502_s204"],
			// 	level: 1,
			// 	stage: 1,
			// 	star: 1,
			// 	type: 5,
			// 	count: 1,
			// 	resourceId: 0,
			// 	position: 0,
			// 	monsterResourceId: 0,
			// 	surplusHp: 0,
			// 	model: { modelConfigId: 1000050200, heroSkinId: 0 }
			// }
			if (info.attackerVo.petUnitVo) {
				attackerPetData = this.toBattlePetData(info.attackerVo.petUnitVo);
			}

			let attackerUnitDatas = this.toBattleUnitDatas(info.attackerVo.unitVos);
			let defenderPetData;
			if (info.defenderVo.petUnitVo) {
				defenderPetData = this.toBattlePetData(info.defenderVo.petUnitVo);
			}

			let defenderUnitDatas = this.toBattleUnitDatas(info.defenderVo.unitVos);
			if (FightType[cfg.fightType] == FightType.TEST) {
				for (let i = 0; i < defenderUnitDatas.length; i++) {
					defenderUnitDatas[i].resourceId = i + 1;
				}
			}

			let atkPlayerId = info.attackerVo.playerId
			let defPlayerId = info.defenderVo.playerId
			let enterDatas: IBattleEnterData = {
				atkPlayerId,
				defPlayerId,
				endTime,
				endTimeFrame: BattleUtils.getFrameByTime(endTime - TimeManager.serverNow),
				fightType: FightType[cfg.fightType],
				attackerUnitDatas,
				defenderUnitDatas,
				attackerPetUnitDatas: attackerPetData,
				defenderPetUnitDatas: defenderPetData,
				attackerBattleTeamDatas: this.toBattleTeamDatas(info.attackerVo.teamUnitVos),
				defenderBattleTeamDatas: this.toBattleTeamDatas(info.defenderVo.teamUnitVos),
				battleConfigId: cfg.id,
				randomSeed: info.startTime,
				watcher: isWatch,
				defenderName: this.getBattleDefenderName(cfg.id, info.defenderVo.name),
				defenderIcon: info.defenderVo.headIcon ? info.defenderVo.headIcon : cfg.icon,
				hideBattle: info.background,
				modulePlayInfo: info.modulePlayInfo,
				verifyParam: info.verifyParam
			}

			let tempEnterData = this.battleEnterDataMap[enterDatas.fightType];
			if (tempEnterData) {
				for (let key in tempEnterData) {
					enterDatas[key] = tempEnterData[key];
				}
			}

			// let isSkipBattle = false;
			// if (FightType[cfg.fightType] == FightType.TRUNK_INSTANCE) {
			// 	// isSkipBattle = true
			// }
			if (info.background)
				this.emit(NotificationKey.NEXT_HIDE_BATTLE, enterDatas);
			// else if (isSkipBattle) {
			// 	this.emit(NotificationKey.SKIP_BATTLE, enterDatas);
			// }
			else {
				this.emit(NotificationKey.START_BATTLE, enterDatas);
			}
		}
	}

	/**
	 * 推送开始观战,BattleVo
	 * 模块号：22	指令号：-5
	 */
	public pushBattleView(info: Vo.battle.BattleVo): void {
		let cfg = TableManager.getDataById(table.battle.BattleConfig, info.battleConfigId);
		if (cfg) {
			//处理可观战的条件
			switch (FightType[cfg.fightType]) {
				case FightType.TEAM_INSTANCE:
					TeamChallengeModel.ins().teamBattle = true;
					//测试界面打开着才能观战
					if (!UIManager.ins().isOpened(TeamChallengeUIKeys.TeamChallengeMainView))
						return;
					if (GIns.battleMgr.battleLogic.fightType != FightType.TRUNK_MAP)
						return
					TeamChallengeModel.ins().isChallenge = false;
					if (!TeamChallengeModel.ins().isChallenge) {
						GIns.floatingTextMgr.showTips(`其他玩家发起挑战`);
					}
					break
				// case FightType.TRUNK_INSTANCE:
				// 	if (GIns.battleMgr.battleLogic.fightType != FightType.TRUNK_MAP)
				// 		return
				// 	break

			}
			this.pushStartBattle(info, true)
		}
	}

	/***通过战斗ID获取防守方的名字 */
	private getBattleDefenderName(cfgId: number, defaultName: string): string {
		let cfg = TableManager.getDataById(table.battle.BattleConfig, cfgId);
		switch (FightType[cfg.fightType]) {
			case FightType.TRUNK_INSTANCE:
				{
					return cfg.name;
				}
		}
		return defaultName
	}

	public showExitView(title: string, content: string, yes: Function, no?: Function): void {
		G.UIManager.open(UICommonKey.BtnConfirmView, {
			// 标题
			title: title,
			// 取消
			titleCancel: CommonI18nKeys.cancel,
			// 确认
			titleConfirm: CommonI18nKeys.confirm,
			// 内容
			content: content,
			// 点击确认回调
			onBtnYes: yes,
			closeCb: (isClickYes: boolean) => {
				if (no) {
					no();
				}
				// if (!isClickYes)
				// 	GIns.battleMgr.resumeBattle()
			},
		} as BtnConfirmViewOpenArgs)
		// GIns.battleMgr.pauseBattle()
	}

	/**
	 * 推送取消战斗,FightType
	 * 模块号：22	指令号：-2
	 */
	public pushCancelBattle(battleConfigId: number): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		let cfg = TableManager.getDataById(table.battle.BattleConfig, battleConfigId)
		if (cfg) {
			// GIns.battleMgr.clearSaveHeroHpByFightType(FightType[cfg.fightType])
		}
	}


	/**
	 * 推送战报,List<IServerBattleContent>
	 * 模块号：22	指令号：-3
	 */
	public pushBattleContent(arrContent: { type: number }[]): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		for (let i = 0, len = arrContent.length; i < len; i++) {
			this.parseServerBattleContent(arrContent[i]);
		}
	}

	/**解析后端推送内容 */
	private parseServerBattleContent(content: { type: number }) {
		switch (content.type) {
			case ServerEnums.ServerBattleContentType.REFRESH_MONSTER:
				{
					let data = content as Vo.battle.RefreshMonsterBattleContent;
					this.emit(NotificationKey.UPDATE_MONSTER_FROM_SERVER, data);
				}
				break;
		}
	}

	/***推送正常结束战斗,battleConfigId */
	private pushBattleEnd(battleConfigId: number): void {
		let cfg = TableManager.getDataById(table.battle.BattleConfig, battleConfigId)
		if (cfg) {
			// GIns.battleMgr.clearSaveHeroHpByFightType(FightType[cfg.fightType])
			GIns.battleMgr.onBattleComplete(FightType[cfg.fightType])
		}
	}

	private battleEnterDataMap: { [fightType: number]: IBattleEnterData } = {};
	/***设置进入战斗的数据 */
	public setEnterData(data: IBattleEnterData, ...args): boolean {
		data.battleEnterData = args;
		this.battleEnterDataMap[data.fightType] = data;
		return true;
	}

	public getEnterData(fightType: number): IBattleEnterData {
		return this.battleEnterDataMap[fightType]
	}
}
