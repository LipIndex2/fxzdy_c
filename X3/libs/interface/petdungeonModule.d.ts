declare module Vo.petdungeon{
	
	/**
	 * 宠物副本活动信息vo
	 * @author GameCreator
	 */	
	class PetDungeonActivityInfoVo	{
		/**
		 * 开始时间
		 */		
		startTime:number;
		
		/**
		 * 结束时间
		 */		
		endTime:number;
		
		/**
		 * 下次开启时间
		 */		
		nextStartTime:number;
		
		/**
		 * 玩家信息
		 */		
		playerInfoVo:PetDungeonPlayerInfoVo;
		
	}


	
	/**
	 * 宠物副本重置vo
	 * @author GameCreator
	 */	
	class PetDungeonResetVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 玩家宠物副本信息
		 */		
		playerInfoVo:PetDungeonPlayerInfoVo;
		
	}


	
	/**
	 * 宠物副本设置备战英雄vo
	 * @author GameCreator
	 */	
	class PetDungeonSetupPrepareHeroVo	{
		/**
		 * 当前备战英雄MAP,英雄ID-英雄剩余血量(万分比)
		 */		
		prepareHeroMap:Object;
		
	}


	
	/**
	 * 宠物副本玩法信息
	 * @author GameCreator
	 */	
	class PetDungeonPlayInfo	{
		/**
		 * 开始时间
		 */		
		startTime:number;
		
		/**
		 * 结束时间
		 */		
		endTime:number;
		
		/**
		 * 下次开启时间
		 */		
		nextStartTime:number;
		
		/**
		 * 当前排名
		 */		
		rank:number;
		
	}


	
	/**
	 * 宠物副本扫荡vo
	 * @author GameCreator
	 */	
	class PetDungeonSweepVo	{
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 玩家宠物副本信息
		 */		
		playerInfoVo:PetDungeonPlayerInfoVo;
		
	}


	
	/**
	 * 宠物副本玩家信息vo
	 * @author GameCreator
	 */	
	class PetDungeonPlayerInfoVo	{
		/**
		 * 历史最高关卡
		 */		
		historyMaxFloor:number;
		
		/**
		 * 赛季最高关卡
		 */		
		seasonMaxFloor:number;
		
		/**
		 * 本次挑战最高关卡
		 */		
		currentMaxFloor:number;
		
		/**
		 * 赛季关卡奖励次数MAP,关卡ID-奖励次数
		 */		
		floorRewardTimesMap:Object;
		
		/**
		 * 备战英雄MAP,英雄ID-英雄剩余血量(万分比)
		 */		
		prepareHeroMap:Object;
		
		/**
		 * 今日重置次数
		 */		
		todayResetTimes:number;
		
		/**
		 * 玩法阵容列表
		 */		
		customFormationVos:Array<Vo.formation.CustomFormationVo>;
		
		/**
		 * 物质仓库(最多4个)
		 */		
		petDungeonToyList:Array<PetDungeonToy>;
		
		/**
		 * 物资补给箱（生效buff）
		 */		
		petDungeonToyBuffList:Array<PetDungeonToy>;
		
		/**
		 * 宝箱存储链最多20个
		 */		
		toyBoxList:Array<PetDungeonToyBox>;
		
		/**
		 * 看广告刷新宝箱的总次数
		 */		
		alreadyAdvertRefreshCount:number;
		
	}


	
	/**
	 * 存储宝箱 闯关后，如果获得宝箱，开启走开启宝箱协议，也就是type=1，不开启则存储进宝箱仓库中
	 * @author GameCreator
	 */	
	class SaveToyBoxS2C	{
		content:Vo.petdungeon.PetDungeonToyUpdateVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 玩具放回仓库
	 * @author GameCreator
	 */	
	class InvalidToyBuffC2S	{
		/**
		 * 玩具id（服务器生成的id）
		 */		
		id:number;
		
	}


	
	/**
	 * 玩具放回仓库
	 * @author GameCreator
	 */	
	class InvalidToyBuffS2C	{
		content:Vo.petdungeon.PetDungeonToyUpdateVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 开启宝箱
	 * @author GameCreator
	 */	
	class OpenToyBoxC2S	{
		/**
		 * 0-表示开启宝箱仓库的宝箱 1-表示闯关后，如果获得宝箱后，开启
		 */		
		type:number;
		
		/**
		 * 指定的玩具玩具id
		 */		
		id:number;
		
	}


	
	/**
	 * 开启宝箱
	 * @author GameCreator
	 */	
	class OpenToyBoxS2C	{
		content:Vo.petdungeon.PetDungeonToyUpdateVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 宠物副本重置
	 * @author GameCreator
	 */	
	class ResetS2C	{
		content:Vo.petdungeon.PetDungeonResetVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 玩具宝箱刷新返回数据
	 * @author GameCreator
	 */	
	class PetDungeonToyBoxRefreshVo	{
		/**
		 * 消耗
		 */		
		costItemResults:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 看广告刷新宝箱的总次数
		 */		
		alreadyAdvertRefreshCount:number;
		
		/**
		 * 宝箱存储链最多20个
		 */		
		toyBoxList:Array<PetDungeonToyBox>;
		
	}


	
	/**
	 * 宠物副本扫荡
	 * @author GameCreator
	 */	
	class SweepS2C	{
		content:Vo.petdungeon.PetDungeonSweepVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 宠物副本玩具数据更新
	 * @author GameCreator
	 */	
	class PetDungeonToyUpdateVo	{
		/**
		 * 物质仓库(最多4个)
		 */		
		petDungeonToyList:Array<PetDungeonToy>;
		
		/**
		 * 物资补给箱（生效buff）
		 */		
		petDungeonToyBuffList:Array<PetDungeonToy>;
		
		/**
		 * 宝箱存储链最多20个
		 */		
		toyBoxList:Array<PetDungeonToyBox>;
		
	}


	
	/**
	 * 宠物副本挑战结果
	 * @author GameCreator
	 */	
	class PetDungeonChallengeResult	{
		/**
		 * 是否胜利
		 */		
		win:boolean;
		
		/**
		 * 奖励
		 */		
		rewardResults:Array<Vo.reward.RewardResult>;
		
		/**
		 * 玩家宠物副本信息
		 */		
		playerInfoVo:PetDungeonPlayerInfoVo;
		
		/**
		 * 获得得宝箱数据
		 */		
		tempPetDungeonToyBox:PetDungeonToyBox;
		
	}


	
	/**
	 * 宠物副本玩具宝箱
	 * @author GameCreator
	 */	
	class PetDungeonToyBox	{
		/**
		 * 唯一id
		 */		
		id:number;
		
		/**
		 * 玩具组的id
		 */		
		groupId:number;
		
		/**
		 * 对应的宠物副本配置id
		 */		
		petDungeonConfigId:number;
		
		/**
		 * 随机到的玩具数量
		 */		
		count:number;
		
		/**
		 * 已刷新次数
		 */		
		refreshCount:number;
		
		/**
		 * 随机出来的玩具
		 */		
		toyBoxList:Array<PetDungeonToy>;
		
	}


	
	/**
	 * 宠物副本活动开始vo
	 * @author GameCreator
	 */	
	class PetDungeonActivityStartVo	{
		/**
		 * 开始时间
		 */		
		startTime:number;
		
		/**
		 * 结束时间
		 */		
		endTime:number;
		
		/**
		 * 下次开启时间
		 */		
		nextStartTime:number;
		
	}


	
	/**
	 * @author lrs
	 * @author GameCreator
	 */	
	class PetDungeonToy	{
		/**
		 * 自动生成的id
		 */		
		id:number;
		
		/**
		 * 配置表对应的玩具id，（相同id合成更高级的）
		 */		
		toyId:number;
		
		/**
		 * 占用得格子（5*5，格子计数1开始）
		 */		
		grids:Array<number>;
		
	}


	
	/**
	 * 挑战宠物副本
	 * @author GameCreator
	 */	
	class ChallengeC2S	{
		/**
		 * 宠物副本ID
		 */		
		petDungeonConfigId:number;
		
	}


	
	/**
	 * 挑战宠物副本
	 * @author GameCreator
	 */	
	class ChallengeS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 宠物副本放入补给箱玩具（如果有相同的直接升级）
	 * @author GameCreator
	 */	
	class SetToyBuffC2S	{
		petDungeonToy:Vo.petdungeon.PetDungeonToy;
		
	}


	
	/**
	 * 宠物副本放入补给箱玩具（如果有相同的直接升级）
	 * @author GameCreator
	 */	
	class SetToyBuffS2C	{
		content:Vo.petdungeon.PetDungeonToyUpdateVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取宠物副本活动信息
	 * @author GameCreator
	 */	
	class LoadPetDungeonInfoS2C	{
		content:Vo.petdungeon.PetDungeonActivityInfoVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 刷新玩具宝箱
	 * @author GameCreator
	 */	
	class RefreshToyBoxC2S	{
		advert:boolean;
		
	}


	
	/**
	 * 刷新玩具宝箱
	 * @author GameCreator
	 */	
	class RefreshToyBoxS2C	{
		content:Vo.petdungeon.PetDungeonToyBoxRefreshVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 设置备战英雄
	 * @author GameCreator
	 */	
	class SetUpPrepareHeroC2S	{
		/**
		 * 备战的英雄配置ID列表
		 */		
		heroBaseIds:Array<number>;
		
	}


	
	/**
	 * 设置备战英雄
	 * @author GameCreator
	 */	
	class SetUpPrepareHeroS2C	{
		content:Vo.petdungeon.PetDungeonSetupPrepareHeroVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 丢弃玩具
	 * @author GameCreator
	 */	
	class DiscardToyC2S	{
		/**
		 * 玩具id（服务器生成的id）
		 */		
		id:number;
		
	}


	
	/**
	 * 丢弃玩具
	 * @author GameCreator
	 */	
	class DiscardToyS2C	{
		content:Vo.petdungeon.PetDungeonToyUpdateVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


}
