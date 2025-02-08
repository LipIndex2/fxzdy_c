declare module Vo.formation{
	
	/**
	 * 上阵星灵宠物
	 * @author GameCreator
	 */	
	class InBattlePetC2S	{
		/**
		 * 星灵宠物配置ID
		 */		
		petBaseId:number;
		
	}


	
	/**
	 * 上阵星灵宠物
	 * @author GameCreator
	 */	
	class InBattlePetS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 收藏品信息
	 * @author GameCreator
	 */	
	class CollectiblesVisitVo	{
		/**
		 * 收藏品id
		 */		
		collectiblesId:number;
		
		/**
		 * 等级
		 */		
		level:number;
		
		/**
		 * 星级
		 */		
		star:number;
		
	}


	
	/**
	 * 星灵宠物查看信息Vo
	 * @author GameCreator
	 */	
	class PetVisitVo	{
		/**
		 * 宠物配置ID
		 */		
		petBaseId:number;
		
		/**
		 * 宠物等级
		 */		
		level:number;
		
		/**
		 * 宠物等阶
		 */		
		stage:number;
		
		/**
		 * 宠物星级
		 */		
		star:number;
		
	}


	
	/**
	 * 布阵登录下发信息
	 * @author GameCreator
	 */	
	class FormationLoginVo	{
		/**
		 * 收藏品ID
		 */		
		collectiblesId:number;
		
		/**
		 * 星灵配置ID
		 */		
		petBaseId:number;
		
		/**
		 * 默认阵位信息
		 */		
		positionVos:Array<Vo.formation.PositionVo>;
		
		/**
		 * 卡槽信息
		 */		
		slotVos:Array<SlotVo>;
		
		/**
		 * 自定义阵容CustomFormationVo列表
		 */		
		customFormationVos:Array<CustomFormationVo>;
		
	}


	
	/**
	 * 阵容查看信息vo
	 * @author GameCreator
	 */	
	class FormationVisitVo	{
		/**
		 * 收藏品查看信息
		 */		
		collectiblesVisitVo:CollectiblesVisitVo;
		
		/**
		 * 星灵宠物查看信息
		 */		
		petVisitVo:PetVisitVo;
		
		/**
		 * 阵位查看信息列表
		 */		
		positionVisitVos:Array<PositionVisitVo>;
		
	}


	
	/**
	 * 阵位上阵英雄
	 * @author GameCreator
	 */	
	class InBattleHeroVo	{
		/**
		 * 更新的阵位信息
		 */		
		positionVo:Vo.formation.PositionVo;
		
	}


	
	/**
	 * 保存自定义阵容
	 * @author GameCreator
	 */	
	class SetUpCustomFormationC2S	{
		/**
		 * 自定义阵容列表
		 */		
		reqVos:Array<Vo.formation.SetupCustomFormationReqVo>;
		
	}


	
	/**
	 * 保存自定义阵容
	 * @author GameCreator
	 */	
	class SetUpCustomFormationS2C	{
		content:Array<Vo.formation.CustomFormationVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 卡槽信息
	 * @author GameCreator
	 */	
	class SlotVo	{
		/**
		 * 阵位配置ID
		 */		
		slotBaseId:number;
		
		/**
		 * 卡槽等阶
		 */		
		stage:number;
		
		/**
		 * 卡槽等级
		 */		
		level:number;
		
	}


	
	/**
	 * 设置阵容请求Vo
	 * @author GameCreator
	 */	
	class SetupFormationReqVo	{
		/**
		 * 收藏品ID
		 */		
		collectiblesId:number;
		
		/**
		 * 上阵星灵配置ID
		 */		
		petBaseId:number;
		
		/**
		 * 阵位信息列表
		 */		
		positionVos:Array<Vo.formation.PositionVo>;
		
	}


	
	/**
	 * 布置阵容
	 * @author GameCreator
	 */	
	class SetUpFormationC2S	{
		/**
		 * 布置的阵容请求信息
		 */		
		reqVo:Vo.formation.SetupFormationReqVo;
		
	}


	
	/**
	 * 布置阵容
	 * @author GameCreator
	 */	
	class SetUpFormationS2C	{
		content:Vo.formation.FormationVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 自定义阵容信息
	 * @author GameCreator
	 */	
	class CustomFormationVo	{
		/**
		 * 所属战斗类型,FightType
		 */		
		fightType:number;
		
		/**
		 * 子类型,没有则为null
		 */		
		subParam:string;
		
		/**
		 * 阵容索引
		 */		
		index:number;
		
		/**
		 * 阵容信息
		 */		
		formationVo:FormationVo;
		
	}


	
	/**
	 * 上阵英雄,仅支持空的阵位
	 * @author GameCreator
	 */	
	class InBattleHeroC2S	{
		/**
		 * 阵位配置ID
		 */		
		positionId:number;
		
		/**
		 * 英雄配置ID
		 */		
		heroBaseId:number;
		
	}


	
	/**
	 * 上阵英雄,仅支持空的阵位
	 * @author GameCreator
	 */	
	class InBattleHeroS2C	{
		content:Vo.formation.InBattleHeroVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 阵位查看信息Vo
	 * @author GameCreator
	 */	
	class PositionVisitVo	{
		/**
		 * 阵位Id
		 */		
		positionId:number;
		
		/**
		 * 英雄配置Id
		 */		
		heroBaseId:number;
		
		/**
		 * 英雄等级
		 */		
		heroLevel:number;
		
		/**
		 * 英雄等阶
		 */		
		heroStage:number;
		
		/**
		 * 英雄星级
		 */		
		star:number;
		
		/**
		 * 战力
		 */		
		fight:number;
		
		/**
		 * 使用的皮肤Id
		 */		
		useSkinId:number;
		
		/**
		 * 魔方配置Id
		 */		
		magicCubeId:number;
		
		/**
		 * 魔方等级
		 */		
		magicCubeLevel:number;
		
		/**
		 * 专属武器配置Id
		 */		
		awakeWeaponId:number;
		
		/**
		 * 专属武器星级
		 */		
		awakeWeaponStar:number;
		
		/**
		 * 属性Id-属性值
		 */		
		attrId2Value:Object;
		
		/**
		 * 潜能觉醒信息 key: 潜能阶级
		 */		
		awakenKeys:Array<number>;
		
	}


	
	/**
	 * 阵位信息
	 * @author GameCreator
	 */	
	class PositionVo	{
		/**
		 * 阵位ID
		 */		
		position:number;
		
		/**
		 * 上阵英雄配置ID
		 */		
		heroBaseId:number;
		
	}


	
	/**
	 * 阵位解锁Vo
	 * @author GameCreator
	 */	
	class PositionUnlockVo	{
		/**
		 * 阵位信息
		 */		
		positionVo:Vo.formation.PositionVo;
		
		/**
		 * 卡槽信息
		 */		
		slotVo:SlotVo;
		
	}


	
	/**
	 * 设置自定义阵容请求Vo
	 * @author GameCreator
	 */	
	class SetupCustomFormationReqVo	{
		/**
		 * 自定义阵容对应战斗类型
		 */		
		customFightType:number;
		
		/**
		 * 自定义阵容子类型参数
		 */		
		customSubParam:string;
		
		/**
		 * 自定义阵容列表下标索引,从0开始
		 */		
		customIndex:number;
		
		/**
		 * 阵容信息
		 */		
		reqVo:SetupFormationReqVo;
		
	}


	
	/**
	 * 阵容信息
	 * @author GameCreator
	 */	
	class FormationVo	{
		/**
		 * 上阵的收藏品ID
		 */		
		collectiblesId:number;
		
		/**
		 * 上阵的星灵宠物配置ID
		 */		
		petBaseId:number;
		
		/**
		 * 阵容信息MAP,阵位ID-阵位信息PositionVo
		 */		
		positionVoMap:Object;
		
	}


}
