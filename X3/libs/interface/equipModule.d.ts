declare module Vo.equip{
	
	/**
	 * 装备登录下发Vo
	 * @author GameCreator
	 */	
	class EquipLoginVo	{
		/**
		 * 当前使用的装备方案ID
		 */		
		usePlanId:number;
		
		/**
		 * 已解锁的装备位置
		 */		
		unlockPositionIds:Array<number>;
		
		/**
		 * 装备列表
		 */		
		equipVos:Array<EquipVo>;
		
		/**
		 * 分解选项
		 */		
		decomposeOptions:Array<number>;
		
	}


	
	/**
	 * 装备洗练信息Vo
	 * @author GameCreator
	 */	
	class EquipWashVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 装备信息
		 */		
		equipVo:EquipVo;
		
	}


	
	/**
	 * 保存装备分解选项
	 * @author GameCreator
	 */	
	class SaveDecomposeOptionsC2S	{
		/**
		 * 选项列表
		 */		
		options:Array<number>;
		
	}


	
	/**
	 * 保存装备分解选项
	 * @author GameCreator
	 */	
	class SaveDecomposeOptionsS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 装备分解信息Vo
	 * @author GameCreator
	 */	
	class EquipDecomposeVo	{
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
	 * 修改装备方案
	 * @author GameCreator
	 */	
	class ChangePlanC2S	{
		/**
		 * 装备方案ID
		 */		
		planId:number;
		
	}


	
	/**
	 * 修改装备方案
	 * @author GameCreator
	 */	
	class ChangePlanS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 穿戴装备
	 * @author GameCreator
	 */	
	class WearEquipC2S	{
		/**
		 * 方案ID
		 */		
		planId:number;
		
		/**
		 * 装备唯一ID
		 */		
		equipId:number;
		
	}


	
	/**
	 * 穿戴装备
	 * @author GameCreator
	 */	
	class WearEquipS2C	{
		content:Array<Vo.equip.EquipVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 装备洗练
	 * @author GameCreator
	 */	
	class WashEquipC2S	{
		/**
		 * 装备唯一ID
		 */		
		equipId:number;
		
		/**
		 * 初始属性ID,EquipAttrPoolConfig的id
		 */		
		attrId:number;
		
	}


	
	/**
	 * 装备洗练
	 * @author GameCreator
	 */	
	class WashEquipS2C	{
		content:Vo.equip.EquipWashVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 装备分解
	 * @author GameCreator
	 */	
	class DecomposeEquipC2S	{
		/**
		 * 装备唯一ID集合
		 */		
		equipIds:Array<number>;
		
	}


	
	/**
	 * 装备分解
	 * @author GameCreator
	 */	
	class DecomposeEquipS2C	{
		content:Vo.equip.EquipDecomposeVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 装备信息Vo
	 * @author GameCreator
	 */	
	class EquipVo	{
		/**
		 * 唯一ID
		 */		
		id:number;
		
		/**
		 * 配置ID
		 */		
		baseId:number;
		
		/**
		 * 初始二级属性MAP,EquipAttrPoolConfig#id-属性值
		 */		
		initSecondAttrMap:Object;
		
		/**
		 * 二级属性品质MAP,EquipAttrPoolConfig#id-EquipAttrRandomConfig#id,没有则使用最低品质,兼容旧数据
		 */		
		secondAttrRandomIdMap:Object;
		
		/**
		 * 洗练增加的二级属性MAP,EquipAttrPoolConfig#id-洗练增加值
		 */		
		washedSecondAttrMap:Object;
		
		/**
		 * 所属方案ID,没有装备则默认为0
		 */		
		planId:number;
		
	}


}
