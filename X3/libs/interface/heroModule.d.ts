declare module Vo.hero{
	
	/**
	 * 英雄升级Vo
	 * @author GameCreator
	 */	
	class HeroDnaUpLevelVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 升级的dna信息
		 */		
		heroDnaVo:HeroDnaVo;
		
	}


	
	/**
	 * 英雄潜能模型
	 * @author GameCreator
	 */	
	class HeroDnaVo	{
		/**
		 * 英雄职业
		 */		
		career:Vo.hero.Career;
		
		/**
		 * 潜能阶级
		 */		
		stage:number;
		
		/**
		 * 潜能等级
		 */		
		level:number;
		
		/**
		 * 潜能觉醒信息 key: 潜能阶级 value: 潜能觉醒信息
		 */		
		awaken:Object;
		
		/**
		 * 潜能觉醒临时信息（用于第二次以后觉醒替换） key: 潜能阶级 value: 潜能觉醒临时信息
		 */		
		awakenTemp:Object;
		
	}


	
	/**
	 * 升级
	 * @author GameCreator
	 */	
	class UpLevelC2S	{
		/**
		 * 阵位卡槽ID
		 */		
		slotBaseId:number;
		
		/**
		 * 是否升阶,true-先升阶,然后升等级,false-只升等级
		 */		
		upStage:boolean;
		
	}


	
	/**
	 * 升级
	 * @author GameCreator
	 */	
	class UpLevelS2C	{
		content:Vo.hero.HeroUpLevelVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 英雄升星
	 * @author GameCreator
	 */	
	class UpStarC2S	{
		/**
		 * 英雄配置ID
		 */		
		baseId:number;
		
	}


	
	/**
	 * 英雄升星
	 * @author GameCreator
	 */	
	class UpStarS2C	{
		content:Vo.hero.HeroUpStarVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 使用皮肤
	 * @author GameCreator
	 */	
	class UseSkinC2S	{
		/**
		 * 英雄配置Id
		 */		
		baseId:number;
		
		/**
		 * 皮肤配置表Id
		 */		
		skinId:number;
		
	}


	
	/**
	 * 使用皮肤
	 * @author GameCreator
	 */	
	class UseSkinS2C	{
		content:Vo.hero.HeroVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 激活英雄
	 * @author GameCreator
	 */	
	class ActiveS2C	{
		content:Vo.hero.HeroActiveVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 英雄激活信息Vo
	 * @author GameCreator
	 */	
	class HeroActiveVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
	}


	
	/**
	 * 激活英雄
	 * @author GameCreator
	 */	
	class ActiveC2S	{
		/**
		 * 英雄配置id
		 */		
		baseId:number;
		
	}


	
	/**
	 * 英雄升级Vo
	 * @author GameCreator
	 */	
	class HeroUpLevelVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 升级的卡槽信息
		 */		
		slotVo:Vo.formation.SlotVo;
		
	}


	
	/**
	 * 英雄奖励信息
	 * @author GameCreator
	 */	
	class HeroRewardVo	{
		/**
		 * 英雄配置ID
		 */		
		heroBaseId:number;
		
		/**
		 * 英雄奖励数量
		 */		
		amount:number;
		
	}


	
	/**
	 * 潜能升级
	 * @author GameCreator
	 */	
	class UpDnaLevelC2S	{
		/**
		 * 英雄配置Id
		 */		
		baseId:number;
		
	}


	
	/**
	 * 潜能升级
	 * @author GameCreator
	 */	
	class UpDnaLevelS2C	{
		content:Vo.hero.HeroDnaUpLevelVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 潜能觉醒或者刷新
	 * @author GameCreator
	 */	
	class AwakenDnaS2C	{
		content:Vo.hero.HeroDnaAwakenResultVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 替换潜能觉醒属性
	 * @author GameCreator
	 */	
	class ReplaceAwakenDnaC2S	{
		/**
		 * 英雄配置Id
		 */		
		baseId:number;
		
		/**
		 * 潜能觉醒阶段
		 */		
		stage:number;
		
		/**
		 * 0-替换 1-取消
		 */		
		type:number;
		
	}


	
	/**
	 * 替换潜能觉醒属性
	 * @author GameCreator
	 */	
	class ReplaceAwakenDnaS2C	{
		content:Vo.hero.HeroDnaReplaceAwakenResultVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 英雄潜能觉醒结果
	 * @author GameCreator
	 */	
	class HeroDnaReplaceAwakenResultVo	{
		/**
		 * 潜能觉醒信息 key: 潜能阶级 value: 潜能觉醒信息
		 */		
		awaken:Object;
		
		/**
		 * 潜能觉醒临时信息（用于第二次以后觉醒替换） key: 潜能阶级 value: 潜能觉醒临时信息
		 */		
		awakenTemp:Object;
		
	}


	
	/**
	 * 英雄升星Vo
	 * @author GameCreator
	 */	
	class HeroUpStarVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 升星后英雄信息
		 */		
		heroVo:HeroVo;
		
	}


	
	/**
	 * 英雄模块登录下发Vo
	 * @author GameCreator
	 */	
	class HeroLoginVo	{
		/**
		 * 英雄列表
		 */		
		heroVos:Array<HeroVo>;
		
	}


	
	/**
	 * 潜能觉醒或者刷新
	 * @author GameCreator
	 */	
	class AwakenDnaC2S	{
		/**
		 * 英雄配置Id
		 */		
		baseId:number;
		
		/**
		 * 潜能觉醒阶段
		 */		
		stage:number;
		
	}


	
	/**
	 * 英雄升阶Vo
	 * @author GameCreator
	 */	
	class HeroUpStageVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 阵位卡槽信息
		 */		
		slotVo:Vo.formation.SlotVo;
		
	}


	
	/**
	 * 升阶
	 * @author GameCreator
	 */	
	class UpStageC2S	{
		/**
		 * 阵位卡槽ID
		 */		
		slotBaseId:number;
		
	}


	
	/**
	 * 升阶
	 * @author GameCreator
	 */	
	class UpStageS2C	{
		content:Vo.hero.HeroUpStageVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 英雄信息Vo
	 * @author GameCreator
	 */	
	class HeroVo	{
		/**
		 * 英雄唯一ID
		 */		
		id:number;
		
		/**
		 * 英雄配置ID
		 */		
		heroBaseId:number;
		
		/**
		 * 是否激活
		 */		
		active:boolean;
		
		/**
		 * 碎片数量
		 */		
		fragment:number;
		
		/**
		 * 英雄星级
		 */		
		star:number;
		
		/**
		 * 当前使用的皮肤Id
		 */		
		useSkinId:number;
		
		/**
		 * 拥有的皮肤Id集合
		 */		
		heroSkinIds:Array<number>;
		
		/**
		 * 英雄潜能数据
		 */		
		heroDna:HeroDnaVo;
		
	}


	
	/**
	 * 英雄升级Vo
	 * @author GameCreator
	 */	
	class HeroDnaAwakenVo	{
		/**
		 * 阶级
		 */		
		stage:number;
		
		/**
		 * 属性 key:属性id value:属性值
		 */		
		attrs:Object;
		
	}


	
	/**
	 * 英雄潜能觉醒结果
	 * @author GameCreator
	 */	
	class HeroDnaAwakenResultVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 是否首次觉醒
		 */		
		first:boolean;
		
		/**
		 * 潜能觉醒信息 key: 潜能阶级 value: 潜能觉醒信息
		 */		
		awaken:Object;
		
		/**
		 * 潜能觉醒临时信息（用于第二次以后觉醒替换） key: 潜能阶级 value: 潜能觉醒临时信息
		 */		
		awakenTemp:Object;
		
	}


}
