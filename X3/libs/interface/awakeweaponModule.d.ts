declare module Vo.awakeweapon{
	
	/**
	 * 专属武器信息
	 * @author GameCreator
	 */	
	class AwakeWeaponVo	{
		/**
		 * 唯一Id
		 */		
		id:number;
		
		/**
		 * 配置Id
		 */		
		baseId:number;
		
		/**
		 * 星级
		 */		
		star:number;
		
		/**
		 * 装备的英雄配置Id
		 */		
		heroBaseId:number;
		
		/**
		 * 是否上锁
		 */		
		locked:boolean;
		
	}


	
	/**
	 * 专属武器升星
	 * @author GameCreator
	 */	
	class UpStarC2S	{
		/**
		 * 专属武器唯一Id
		 */		
		weaponUniqueId:number;
		
		/**
		 * 消耗同专属武器唯一Id列表
		 */		
		consumeSameWeaponIds:Array<number>;
		
	}


	
	/**
	 * 专属武器升星
	 * @author GameCreator
	 */	
	class UpStarS2C	{
		content:Vo.awakeweapon.AwakeWeaponUpStarVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 专属武器登录信息
	 * @author GameCreator
	 */	
	class AwakeWeaponLoginVo	{
		/**
		 * 专属武器信息列表
		 */		
		weaponVos:Array<AwakeWeaponVo>;
		
	}


	
	/**
	 * 专属武器上锁/解锁
	 * @author GameCreator
	 */	
	class LockS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 专属武器上锁/解锁
	 * @author GameCreator
	 */	
	class LockC2S	{
		/**
		 * 专属武器唯一Id
		 */		
		weaponUniqueId:number;
		
	}


	
	/**
	 * 卸下专属武器
	 * @author GameCreator
	 */	
	class TakeOffC2S	{
		/**
		 * 专属武器唯一Id
		 */		
		weaponUniqueId:number;
		
	}


	
	/**
	 * 卸下专属武器
	 * @author GameCreator
	 */	
	class TakeOffS2C	{
		content:Vo.awakeweapon.AwakeWeaponVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 穿戴专属武器
	 * @author GameCreator
	 */	
	class WearS2C	{
		content:Array<Vo.awakeweapon.AwakeWeaponVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 穿戴专属武器
	 * @author GameCreator
	 */	
	class WearC2S	{
		/**
		 * 专属武器唯一Id
		 */		
		weaponUniqueId:number;
		
		/**
		 * 穿戴的英雄配置Id
		 */		
		heroBaseId:number;
		
	}


	
	/**
	 * 专属武器预览信息
	 * @author GameCreator
	 */	
	class AwakeWeaponVisitVo	{
		/**
		 * 专属武器配置Id
		 */		
		baseId:number;
		
		/**
		 * 星级
		 */		
		star:number;
		
		/**
		 * 装备的英雄配置Id
		 */		
		heroBaseId:number;
		
	}


	
	/**
	 * 专属武器升星信息
	 * @author GameCreator
	 */	
	class AwakeWeaponUpStarVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 奖励，升星消耗返还
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 升星的专属武器
		 */		
		weaponVo:AwakeWeaponVo;
		
	}


}
