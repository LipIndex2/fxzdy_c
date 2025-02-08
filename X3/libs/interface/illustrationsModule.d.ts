declare module Vo.illustrations{
	
	/**
	 * 一键领取英雄积分
	 * @author GameCreator
	 */	
	class OneKeyDrawHeroScoreS2C	{
		content:Vo.illustrations.IllustrationsOneKeyDrawHeroVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 一键领取专属武器积分
	 * @author GameCreator
	 */	
	class OneKeyDrawAwakeWeaponScoreS2C	{
		content:Vo.illustrations.IllustrationsOneKeyDrawAwakeWeaponVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 图鉴一键领取宠物积分信息
	 * @author GameCreator
	 */	
	class IllustrationsOneKeyDrawPetVo	{
		/**
		 * 当前积分
		 */		
		score:number;
		
		/**
		 * 宠物升星领取信息MAP，宠物配置Id-已领取的最高星级
		 */		
		petUpStarMap:Object;
		
		/**
		 * 宠物激活领取信息，已领取的宠物配置Id集合
		 */		
		activePetBaseIds:Array<number>;
		
	}


	
	/**
	 * 领取激活英雄的积分
	 * @author GameCreator
	 */	
	class DrawActiveHeroScoreS2C	{
		content:Vo.illustrations.IllustrationsDrawActiveHeroVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 图鉴领取激活宠物积分
	 * @author GameCreator
	 */	
	class IllustrationsDrawActivePetVo	{
		/**
		 * 当前积分
		 */		
		score:number;
		
		/**
		 * 领取的宠物配置ID
		 */		
		drawPetBaseId:number;
		
	}


	
	/**
	 * 图鉴领取英雄升星积分
	 * @author GameCreator
	 */	
	class IllustrationsDrawHeroUpStarVo	{
		/**
		 * 当前积分
		 */		
		score:number;
		
		/**
		 * 领取的英雄配置ID
		 */		
		heroBaseId:number;
		
		/**
		 * 当前已领取最高星级
		 */		
		maxStar:number;
		
	}


	
	/**
	 * 领取激活英雄的积分
	 * @author GameCreator
	 */	
	class DrawActiveHeroScoreC2S	{
		/**
		 * 英雄配置Id
		 */		
		heroBaseId:number;
		
	}


	
	/**
	 * 图鉴领取专属武器升星积分
	 * @author GameCreator
	 */	
	class IllustrationsDrawAwakeWeaponUpStarVo	{
		/**
		 * 当前积分
		 */		
		score:number;
		
		/**
		 * 领取的专属武器配置Id
		 */		
		weaponBaseId:number;
		
		/**
		 * 当前已领取最高星级
		 */		
		maxStar:number;
		
	}


	
	/**
	 * 领取激活收藏品的积分
	 * @author GameCreator
	 */	
	class DrawActiveCollectiblesScoreC2S	{
		/**
		 * 收藏品配置Id
		 */		
		collectiblesBaseId:number;
		
	}


	
	/**
	 * 领取激活收藏品的积分
	 * @author GameCreator
	 */	
	class DrawActiveCollectiblesScoreS2C	{
		content:Vo.illustrations.IllustrationsDrawActiveCollectiblesVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 图鉴一键领取收藏品积分信息
	 * @author GameCreator
	 */	
	class IllustrationsOneKeyDrawCollectiblesVo	{
		/**
		 * 当前积分
		 */		
		score:number;
		
		/**
		 * 收藏品升星积分情况，记录已领取积分的星级
		 */		
		collectiblesUpStarMap:Object;
		
		/**
		 * 已获得激活积分的收藏品配置Id信息
		 */		
		activeCollectiblesBaseIds:Array<number>;
		
	}


	
	/**
	 * 领取星灵宠物升星积分
	 * @author GameCreator
	 */	
	class DrawPetUpStarScoreC2S	{
		/**
		 * 星灵宠物配置ID
		 */		
		petBaseId:number;
		
		/**
		 * 领取的星级
		 */		
		star:number;
		
	}


	
	/**
	 * 领取星灵宠物升星积分
	 * @author GameCreator
	 */	
	class DrawPetUpStarScoreS2C	{
		content:Vo.illustrations.IllustrationsDrawPetUpStarVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 图鉴领取收藏品升星积分
	 * @author GameCreator
	 */	
	class IllustrationsDrawCollectiblesUpStarVo	{
		/**
		 * 当前积分
		 */		
		score:number;
		
		/**
		 * 领取的收藏品配置Id
		 */		
		collectiblesBaseId:number;
		
		/**
		 * 当前已领取最高星级
		 */		
		maxStar:number;
		
	}


	
	/**
	 * 一键领取宠物积分
	 * @author GameCreator
	 */	
	class OneKeyDrawPetScoreS2C	{
		content:Vo.illustrations.IllustrationsOneKeyDrawPetVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 领取英雄升星积分
	 * @author GameCreator
	 */	
	class DrawHeroUpStarScoreC2S	{
		/**
		 * 英雄配置Id
		 */		
		heroBaseId:number;
		
		/**
		 * 领取的星级
		 */		
		star:number;
		
	}


	
	/**
	 * 领取英雄升星积分
	 * @author GameCreator
	 */	
	class DrawHeroUpStarScoreS2C	{
		content:Vo.illustrations.IllustrationsDrawHeroUpStarVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 领取激活宠物的积分
	 * @author GameCreator
	 */	
	class DrawActivePetScoreC2S	{
		/**
		 * 星灵宠物配置ID
		 */		
		petBaseId:number;
		
	}


	
	/**
	 * 领取激活宠物的积分
	 * @author GameCreator
	 */	
	class DrawActivePetScoreS2C	{
		content:Vo.illustrations.IllustrationsDrawActivePetVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 图鉴领取激活专属英雄积分
	 * @author GameCreator
	 */	
	class IllustrationsDrawActiveAwakeWeaponVo	{
		/**
		 * 当前积分
		 */		
		score:number;
		
		/**
		 * 领取的专属配置Id
		 */		
		drawWeaponBaseId:number;
		
	}


	
	/**
	 * 图鉴登录下发信息
	 * @author GameCreator
	 */	
	class IllustrationsLoginVo	{
		/**
		 * 当前积分
		 */		
		score:number;
		
		/**
		 * 已领取奖励的等级
		 */		
		drawRewardLevel:number;
		
		/**
		 * 英雄升星领取信息MAP，英雄配置Id-已领取的最高星级
		 */		
		heroUpStarMap:Object;
		
		/**
		 * 宠物升星领取信息MAP，宠物配置Id-已领取的最高星级
		 */		
		petUpStarMap:Object;
		
		/**
		 * 英雄激活领取信息，已领取的英雄配置Id集合
		 */		
		activeHeroBaseIds:Array<number>;
		
		/**
		 * 宠物激活领取信息，已领取的宠物配置Id集合
		 */		
		activePetBaseIds:Array<number>;
		
		/**
		 * 专属武器升星领取信息MAP，专属武器配置Id-已领取的最高星级
		 */		
		awakeWeaponUpStarMap:Object;
		
		/**
		 * 专属武器激活领取信息，已领取的专属武器配置Id集合
		 */		
		activeAwakeWeaponBaseIds:Array<number>;
		
		/**
		 * 收藏品升星积分情况，记录已领取积分的星级
		 */		
		collectiblesUpStarMap:Object;
		
		/**
		 * 已获得激活积分的收藏品配置Id信息
		 */		
		activeCollectiblesBaseIds:Array<number>;
		
	}


	
	/**
	 * 领取收藏品升星积分
	 * @author GameCreator
	 */	
	class DrawCollectiblesUpStarScoreC2S	{
		/**
		 * 收藏品配置Id
		 */		
		collectiblesBaseId:number;
		
		/**
		 * 领取的星级
		 */		
		star:number;
		
	}


	
	/**
	 * 图鉴领取收藏品激活积分
	 * @author GameCreator
	 */	
	class IllustrationsDrawActiveCollectiblesVo	{
		/**
		 * 当前积分
		 */		
		score:number;
		
		/**
		 * 领取的收藏品配置Id
		 */		
		collectiblesBaseId:number;
		
	}


	
	/**
	 * 领取收藏品升星积分
	 * @author GameCreator
	 */	
	class DrawCollectiblesUpStarScoreS2C	{
		content:Vo.illustrations.IllustrationsDrawCollectiblesUpStarVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 图鉴领取宠物升星积分
	 * @author GameCreator
	 */	
	class IllustrationsDrawPetUpStarVo	{
		/**
		 * 当前积分
		 */		
		score:number;
		
		/**
		 * 领取的宠物配置ID
		 */		
		petBaseId:number;
		
		/**
		 * 当前已领取最高星级
		 */		
		maxStar:number;
		
	}


	
	/**
	 * 领取图鉴等级奖励
	 * @author GameCreator
	 */	
	class DrawLevelRewardS2C	{
		content:Vo.illustrations.IllustrationsDrawLevelRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 领取激活专武的积分
	 * @author GameCreator
	 */	
	class DrawActiveAwakeWeaponScoreC2S	{
		/**
		 * 专属武器配置Id
		 */		
		weaponBaseId:number;
		
	}


	
	/**
	 * 领取激活专武的积分
	 * @author GameCreator
	 */	
	class DrawActiveAwakeWeaponScoreS2C	{
		content:Vo.illustrations.IllustrationsDrawActiveAwakeWeaponVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 领取图鉴等级奖励
	 * @author GameCreator
	 */	
	class DrawLevelRewardC2S	{
		/**
		 * 领取的等级
		 */		
		level:number;
		
	}


	
	/**
	 * 领取专武升星积分
	 * @author GameCreator
	 */	
	class DrawAwakeWeaponUpStarScoreC2S	{
		/**
		 * 专属武器配置Id
		 */		
		weaponBaseId:number;
		
		/**
		 * 领取的星级
		 */		
		star:number;
		
	}


	
	/**
	 * 领取专武升星积分
	 * @author GameCreator
	 */	
	class DrawAwakeWeaponUpStarScoreS2C	{
		content:Vo.illustrations.IllustrationsDrawAwakeWeaponUpStarVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 一键领取收藏品积分
	 * @author GameCreator
	 */	
	class OneKeyDrawCollectiblesScoreS2C	{
		content:Vo.illustrations.IllustrationsOneKeyDrawCollectiblesVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 图鉴一键领取英雄积分信息
	 * @author GameCreator
	 */	
	class IllustrationsOneKeyDrawHeroVo	{
		/**
		 * 当前积分
		 */		
		score:number;
		
		/**
		 * 英雄升星领取信息MAP，英雄配置Id-已领取的最高星级
		 */		
		heroUpStarMap:Object;
		
		/**
		 * 英雄激活领取信息，已领取的英雄配置Id集合
		 */		
		activeHeroBaseIds:Array<number>;
		
	}


	
	/**
	 * 图鉴领取激活英雄积分
	 * @author GameCreator
	 */	
	class IllustrationsDrawActiveHeroVo	{
		/**
		 * 当前积分
		 */		
		score:number;
		
		/**
		 * 领取的英雄配置ID
		 */		
		drawHeroBaseId:number;
		
	}


	
	/**
	 * 图鉴一键领取专属武器积分信息
	 * @author GameCreator
	 */	
	class IllustrationsOneKeyDrawAwakeWeaponVo	{
		/**
		 * 当前积分
		 */		
		score:number;
		
		/**
		 * 专属武器升星领取信息MAP，专属武器配置Id-已领取的最高星级
		 */		
		awakeWeaponUpStarMap:Object;
		
		/**
		 * 专属武器激活领取信息，已领取的专属武器配置Id集合
		 */		
		activeAwakeWeaponBaseIds:Array<number>;
		
	}


	
	/**
	 * 图鉴领取等级奖励信息
	 * @author GameCreator
	 */	
	class IllustrationsDrawLevelRewardVo	{
		/**
		 * 已领取奖励的等级
		 */		
		drawRewardLevel:number;
		
		/**
		 * 奖励内容
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
	}


}
