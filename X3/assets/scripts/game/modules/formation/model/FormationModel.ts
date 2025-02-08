import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { FightType } from "../../../comm/battle/enum/FightType";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { HeroManager } from "../../hero/HeroManager";
import { FormationManager } from "../FormationManager";

/**
 * 阵容模块协议号
 * @author GameCreator
 */
export class FormationModel extends BaseModel {
	/**
	 * 模块标识
	 */
	private MODULE = 21;

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
		this.registerMsg(moduleId, 1, this.recInBattleHero);
		this.registerMsg(moduleId, 2, this.recSetUpFormation);
		this.registerMsg(moduleId, 3, this.recSetUpCustomFormation);
		this.registerMsg(moduleId, -1, this.pushPositionUnlock);
	}

	/** 
	 * 初始下发
	 */
	public initData(vo: Vo.formation.FormationLoginVo): void {
		// 主线的阵容数据
		FormationManager.ins().updatePosDatasByTrunk(ServerEnums.FightType.TRUNK_MAP, vo.positionVos, vo.collectiblesId, vo.petBaseId);
		FormationManager.ins().updateSoltDatas(vo.slotVos);
		HeroManager.ins().setHeroPosIds(vo.positionVos);

		const formationVos = vo.customFormationVos;
		if (formationVos) {
			for (let i = 0, len = formationVos.length; i < len; i++) {
				let vo: Vo.formation.CustomFormationVo = formationVos[i];
				FormationManager.ins().updatePosDatas(vo);
			}
		}
	}

	/**
	 * 布置阵容
	 * 模块号：21	指令号：2
	 * @param fightType
	 * @param reqVo 布置的阵容请求信息
	 * @param customSubParam
	 */
	public setUpFormation(fightType: XJ.EFightType, reqVo: Vo.formation.SetupFormationReqVo, customSubParam?): void {
		if (fightType == FightType.TRUNK_MAP) {
			this.sendSetUpFormation(reqVo);
		} else if (fightType == FightType.LEAGUE_WAR) {
			// gvg
			GIns.GVGModel.sendUpdateFormation({
				reqVos: [{
					customFightType: FightType.LEAGUE_WAR,
					customSubParam: "",
					customIndex: 0,
					reqVo: reqVo,
				} as Vo.formation.SetupCustomFormationReqVo]
			} as Vo.leaguewar.UpdateFormationC2S);
		} else if (fightType == FightType.TEAM_INSTANCE) {
			const poses = FormationManager.ins().getPoses();
			const tops = FormationManager.ins().getSoltTop();
			const heroids = [];
			reqVo.positionVos.forEach(v => {
				if (poses.indexOf(v.position) != -1 && v.heroBaseId) {
					heroids.push(v.heroBaseId);
				}
				v.heroBaseId = undefined;
			})
			heroids.forEach((v, k) => {
				const vo = reqVo.positionVos.find((v) => {
					return v.position == tops[k]
				})
				vo.heroBaseId = v;
			})

			const count = FormationManager.ins().getHeroCount(reqVo);
			if (count > 2) {
				GIns.floatingTextMgr.showTips("组队副本不能上阵超过2位英雄");
				return;
			}
			this.sendSetUpCustomFormation(fightType, reqVo, customSubParam);
		} else {
			this.sendSetUpCustomFormation(fightType, reqVo, customSubParam);
		}
	}

	/*********************************协议发送*********************************/

	/**1
	 * 上阵英雄,仅支持空的阵位
	 * 模块号：21	指令号：1
	 * @param positionId 阵位配置ID
	 * @param heroBaseId 英雄配置ID
	 */
	public sendInBattleHero(positionId: number, heroBaseId: number): void {
		let c2s = {} as Vo.formation.InBattleHeroC2S;
		c2s.positionId = positionId;
		c2s.heroBaseId = heroBaseId;
		this.send(this.MODULE, 1, c2s);
	}

	/**
	 * 布置阵容
	 * 模块号：21	指令号：2
	 * @param reqVo 布置的阵容请求信息
	 */
	private sendSetUpFormation(reqVo: Vo.formation.SetupFormationReqVo): void {
		let c2s = {} as Vo.formation.SetUpFormationC2S;
		c2s.reqVo = reqVo;
		this.send(this.MODULE, 2, c2s);
	}

	/**
	 * 保存自定义阵容
	 * 模块号：21	指令号：3
	 */
	public sendSetUpCustomFormation(type: XJ.EFightType, vo: Vo.formation.SetupFormationReqVo, customSubParam = null): void {
		let c2s = {} as Vo.formation.SetUpCustomFormationC2S;
		c2s.reqVos = [];
		let reqVo: Vo.formation.SetupCustomFormationReqVo = {
			customFightType: type,
			customSubParam: customSubParam,
			customIndex: 0,
			reqVo: vo
		}
		c2s.reqVos.push(reqVo);
		this.send(this.MODULE, 3, c2s, c2s);
	}

	/**
	 * 保存自定义阵容
	 * 模块号：21	指令号：3
	 */
	public sendSetUpCustomFormationVos(type: FightType, vos: Vo.formation.SetupFormationReqVo[]): void {
		let c2s = {} as Vo.formation.SetUpCustomFormationC2S;
		c2s.reqVos = []; //预留多队
		for (let i = 0; i < vos.length; i++) {
			let vo = vos[i];
			let reqVo: Vo.formation.SetupCustomFormationReqVo = {
				customFightType: type,
				customSubParam: null,
				customIndex: i,
				reqVo: vo
			}
			c2s.reqVos.push(reqVo);
		}
		this.send(this.MODULE, 3, c2s, c2s);
	}


	/*********************************协议监听*********************************/

	/**
	 * 上阵英雄,仅支持空的阵位
	 * 模块号：21	指令号：1
	 */
	public recInBattleHero(data: Vo.formation.InBattleHeroS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			FormationManager.ins().updatePosData(ServerEnums.FightType.TRUNK_MAP, data.content.positionVo);
			HeroManager.ins().setHeroPosId(data.content.positionVo);
			FacadeManager.ins().emit(NotificationKey.FORMATION_IN_BATTLE_HERO);
			FacadeManager.ins().emit(NotificationKey.BATTLE_FORMATION_CHANGED);
			FacadeManager.ins().emit(NotificationKey.FIGHT_UPDATE_ALL_HERO);
		}
	}

	/**
	 * 布置阵容
	 * 模块号：21	指令号：2
	 */
	public recSetUpFormation(data: Vo.formation.SetUpFormationS2C): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据
			let arr = [];
			const formationVo = data.content;
			for (let k in formationVo.positionVoMap) {
				arr.push(formationVo.positionVoMap[k]);
				console.log(formationVo.positionVoMap[k]);
			}
			const collectiblesId = formationVo.collectiblesId || 0;
			const petId = formationVo.petBaseId || 0;
			FormationManager.ins().updatePosDatasByTrunk(ServerEnums.FightType.TRUNK_MAP, arr, collectiblesId, petId);
			HeroManager.ins().setHeroPosIds(arr);

			FacadeManager.ins().emit(NotificationKey.FORMATION_SET_UP_FORMATION);
			FacadeManager.ins().emit(NotificationKey.BATTLE_FORMATION_CHANGED);
			FacadeManager.ins().emit(NotificationKey.FIGHT_UPDATE_ALL_HERO);
		}
	}

	/**
	 * 保存自定义阵容
	 * 模块号：21	指令号：3
	 */
	public recSetUpCustomFormation(data: Vo.formation.SetUpCustomFormationS2C, s2c: Vo.formation.SetUpCustomFormationC2S): void {
		if (data.code >= 0) {
			//TODO 在这里处理服务端返回的数据


			if (data.content) {
				let formationVos = data.content;
				let fightType;
				for (let i = 0, len = formationVos.length; i < len; i++) {
					let vo: Vo.formation.CustomFormationVo = formationVos[i];

					// 只取第一个阵容
					/*
					const defaultFormationVo = vo.formationVo;
					const captainId = defaultFormationVo.captainId;
					const posArray: Vo.formation.PositionVo[] = new Array<Vo.formation.PositionVo>();
					const obj: Object = defaultFormationVo.positionVoMap;
					for (let key of Object.keys(obj)) {
						const posVo = obj[key];
						posArray.push(posVo);
					}*/

					fightType = vo.fightType;
					FormationManager.ins().updatePosDatas(vo);
				}

				FacadeManager.ins().emit(NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION, fightType);
			}

		}
	}
	/*********************************协议推送*********************************/

	/**
	 * 推送阵位解锁
	 * 模块号：21	指令号：-1
	 */
	public pushPositionUnlock(data: Vo.formation.PositionUnlockVo): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		FormationManager.ins().updateSoltDatas([data.slotVo]);
		FormationManager.ins().updatePosData(ServerEnums.FightType.TRUNK_MAP, data.positionVo);
		HeroManager.ins().setHeroPosId(data.positionVo);

		FacadeManager.ins().emit(NotificationKey.FORMATION_POSITION_UNLOCK);
	}

}
