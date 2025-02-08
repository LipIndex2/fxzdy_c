declare module Vo.gm{
	
	/**
	 * 掉落奖励
	 * @author GameCreator
	 */	
	class DropRewardC2S	{
		/**
		 * 掉落id
		 */		
		dropId:number;
		
	}


	
	/**
	 * 掉落奖励
	 * @author GameCreator
	 */	
	class DropRewardS2C	{
		content:Array<Vo.reward.RewardResult>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 发送个人模板邮件
	 * @author GameCreator
	 */	
	class SendTemplateEmailC2S	{
		/**
		 * 邮件模板ID
		 */		
		templateId:number;
		
		/**
		 * 奖励,可为空
		 */		
		rewards:Array<Vo.reward.Reward>;
		
		/**
		 * 模板参数
		 */		
		termVo:Vo.common.TermVo;
		
	}


	
	/**
	 * 发送个人模板邮件
	 * @author GameCreator
	 */	
	class SendTemplateEmailS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 充值
	 * @author GameCreator
	 */	
	class ChargeC2S	{
		/**
		 * 充值物品id
		 */		
		goodsId:string;
		
	}


	
	/**
	 * 充值
	 * @author GameCreator
	 */	
	class ChargeS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 开启/关闭系统功能条件验证,服务器重启失效
	 * @author GameCreator
	 */	
	class ChangeVerifySystemC2S	{
		/**
		 * true-开启验证,false-关闭验证
		 */		
		verify:boolean;
		
	}


	
	/**
	 * 开启/关闭系统功能条件验证,服务器重启失效
	 * @author GameCreator
	 */	
	class ChangeVerifySystemS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 更新玩家新手引导信息
	 * @author GameCreator
	 */	
	class UpdateGuideC2S	{
		map:Object;
		
	}


	
	/**
	 * 更新玩家新手引导信息
	 * @author GameCreator
	 */	
	class UpdateGuideS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 设置账号模板
	 * @author GameCreator
	 */	
	class SetUpAccountTplC2S	{
		/**
		 * 账号模板信息
		 */		
		accountTplVo:com.cx.xj.gmmodule.gm.model.AccountTplVo;
		
	}


	
	/**
	 * 设置账号模板
	 * @author GameCreator
	 */	
	class SetUpAccountTplS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 列出所有隐藏指令
	 * @author GameCreator
	 */	
	class ListAllHideCmdS2C	{
		content:Array<com.cx.xj.gmmodule.gm.model.GmCommandVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 跳到指定主线任务并领取之前的任务奖励,不能往前跳
	 * @author GameCreator
	 */	
	class JumpTrunkTaskAndRewardC2S	{
		/**
		 * 主线任务ID,<=0则跳到最后一个任务
		 */		
		trunkTaskId:number;
		
	}


	
	/**
	 * 跳到指定主线任务并领取之前的任务奖励,不能往前跳
	 * @author GameCreator
	 */	
	class JumpTrunkTaskAndRewardS2C	{
		content:Array<Vo.reward.RewardResult>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 用字符串发送奖励
	 * @author GameCreator
	 */	
	class SendRewardStrC2S	{
		rewardStr:string;
		
	}


	
	/**
	 * 用字符串发送奖励
	 * @author GameCreator
	 */	
	class SendRewardStrS2C	{
		content:Array<Vo.reward.RewardResult>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * GM发送奖励或扣费
	 * @author GameCreator
	 */	
	class GmSendRewardOrCostC2S	{
		/**
		 * 物品ID
		 */		
		code:number;
		
		/**
		 * 数量,正数为奖励,负数为扣费
		 */		
		num:number;
		
	}


	
	/**
	 * GM发送奖励或扣费
	 * @author GameCreator
	 */	
	class GmSendRewardOrCostS2C	{
		content:Vo.cost.CostAndRewardVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 通关主线关卡
	 * @author GameCreator
	 */	
	class PassTrunkInstanceC2S	{
		/**
		 * 主线关卡ID
		 */		
		instanceId:number;
		
	}


	
	/**
	 * 通关主线关卡
	 * @author GameCreator
	 */	
	class PassTrunkInstanceS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 增加windows系统时间（分钟）
	 * @author GameCreator
	 */	
	class AddWindowsSystemMinutesS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 增加windows系统时间（分钟）
	 * @author GameCreator
	 */	
	class AddWindowsSystemMinutesC2S	{
		/**
		 * 目标时间
		 */		
		addMinutes:number;
		
	}


	
	/**
	 * 发送全服邮件
	 * @author GameCreator
	 */	
	class SendServerEmailC2S	{
		title:string;
		
		content:string;
		
		rewards:Array<Vo.reward.Reward>;
		
		/**
		 * 过期分钟
		 */		
		expireMinutes:number;
		
	}


	
	/**
	 * 发送全服邮件
	 * @author GameCreator
	 */	
	class SendServerEmailS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 自定义战斗单位
	 * @author GameCreator
	 */	
	class CustomFightUnitVo	{
		/**
		 * 阵位
		 */		
		position:number;
		
		/**
		 * 单位类型,HERO/MONSTER
		 */		
		unitType:number;
		
		/**
		 * 单位配置ID,根据单位类型构建
		 */		
		configId:number;
		
	}


	
	/**
	 * 英雄属性信息
	 * @author GameCreator
	 */	
	class HeroAttributeVo	{
		/**
		 * 战力
		 */		
		fight:number;
		
		/**
		 * 属性信息
		 */		
		attributeVo:Vo.battle.FightUnitAttributeVo;
		
	}


	
	/**
	 * 发送奖励配置
	 * @author GameCreator
	 */	
	class SendRewardConfigC2S	{
		rewardId:number;
		
		times:number;
		
	}


	
	/**
	 * 发送奖励配置
	 * @author GameCreator
	 */	
	class SendRewardConfigS2C	{
		content:Array<Vo.reward.RewardResult>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 执行隐藏gm指令
	 * @author GameCreator
	 */	
	class DoHideCmdC2S	{
		/**
		 * 参数 ，格式：类型:类型参数
		 */		
		param:string;
		
	}


	
	/**
	 * 执行隐藏gm指令
	 * @author GameCreator
	 */	
	class DoHideCmdS2C	{
		content:Object;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 竞技场积分变更
	 * @author GameCreator
	 */	
	class ArenaScoreChangeC2S	{
		/**
		 * 积分变化值,大于等于0加分,小于0扣分
		 */		
		scoreChange:number;
		
	}


	
	/**
	 * 竞技场积分变更
	 * @author GameCreator
	 */	
	class ArenaScoreChangeS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * copy账号
	 * @author GameCreator
	 */	
	class CopyAccountS2C	{
		content:string;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * copy账号
	 * @author GameCreator
	 */	
	class CopyAccountC2S	{
		playerName:string;
		
	}


	
	/**
	 * 自定义测试战斗
	 * @author GameCreator
	 */	
	class CustomTestBattleC2S	{
		attackerUnitVos:Array<com.cx.xj.gmmodule.gm.model.CustomFightUnitVo>;
		
		defenderUnitVos:Array<com.cx.xj.gmmodule.gm.model.CustomFightUnitVo>;
		
	}


	
	/**
	 * 重新加载excel配置文件
	 * @author GameCreator
	 */	
	class ReloadExcelC2S	{
		/**
		 * 资源名称，用,隔开
		 */		
		names:string;
		
	}


	
	/**
	 * 重新加载excel配置文件
	 * @author GameCreator
	 */	
	class ReloadExcelS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 自定义测试战斗
	 * @author GameCreator
	 */	
	class CustomTestBattleS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * gm指令说明
	 * @author GameCreator
	 */	
	class GmCommandVo	{
		/**
		 * 指令名称
		 */		
		cmd:string;
		
		/**
		 * 指令描述
		 */		
		des:string;
		
		/**
		 * 参数格式化说明
		 */		
		paramFormatDescription:string;
		
	}


	
	/**
	 * 发送配置表奖励格式的奖励
	 * @author GameCreator
	 */	
	class GmSendRewardsC2S	{
		/**
		 * 配置表格式的奖励字符串
		 */		
		rewardStr:string;
		
	}


	
	/**
	 * 发送配置表奖励格式的奖励
	 * @author GameCreator
	 */	
	class GmSendRewardsS2C	{
		content:Array<Vo.reward.RewardResult>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 短id转玩家id
	 * @author GameCreator
	 */	
	class ConvertShortPlayerIdC2S	{
		rawValue:number;
		
	}


	
	/**
	 * 短id转玩家id
	 * @author GameCreator
	 */	
	class ConvertShortPlayerIdS2C	{
		content:number;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 发送测试公告
	 * @author GameCreator
	 */	
	class SendGmPostC2S	{
		content:string;
		
	}


	
	/**
	 * 发送测试公告
	 * @author GameCreator
	 */	
	class SendGmPostS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取在线人数
	 * @author GameCreator
	 */	
	class GetOnlineCountS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 更新并重新加载资源
	 * @author GameCreator
	 */	
	class UpdateAndReloadResourceS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 添加收藏品玩法的次数
	 * @author GameCreator
	 */	
	class AddCollectiblesDungeonCountC2S	{
		/**
		 * 增加的剩余挑战次数
		 */		
		count:number;
		
		/**
		 * 增加的剩余扫荡次数
		 */		
		sweepCount:number;
		
	}


	
	/**
	 * 添加收藏品玩法的次数
	 * @author GameCreator
	 */	
	class AddCollectiblesDungeonCountS2C	{
		content:Vo.collectiblesdungeon.CollectiblesDungeonVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 账号模板信息Vo
	 * @author GameCreator
	 */	
	class AccountTplVo	{
		/**
		 * 账号模板配置ID,大于0则使用该配置模板,其他字段不处理
		 */		
		accountTplConfigId:number;
		
		/**
		 * 激活并上阵的英雄配置ID
		 */		
		heroConfigIds:Array<number>;
		
		/**
		 * 激活英雄对应星级
		 */		
		heroStars:Array<number>;
		
		/**
		 * 激活英雄对应等级
		 */		
		heroLevels:Array<number>;
		
		/**
		 * 使用的装备ID列表
		 */		
		equipConfigIds:Array<number>;
		
		/**
		 * 解锁的普通天赋,天赋解锁等级小于等于此等级的天赋
		 */		
		normalTalentLevel:number;
		
		/**
		 * 解锁的高级天赋,天赋解锁等级小于等于此等级的天赋
		 */		
		specialTalentLevel:number;
		
		/**
		 * 战队核心等级
		 */		
		captainCoreLevel:number;
		
		/**
		 * 战队科技等级列表,按战队科技id从小到大对应等级
		 */		
		captainLevels:Array<number>;
		
		/**
		 * 指定当前通关的主线关卡ID
		 */		
		assignTrunkInstanceId:number;
		
		/**
		 * 指定当前完成的主线任务ID
		 */		
		assignTrunkTaskId:number;
		
		/**
		 * 探索进度,所有sortId小于【配置值】的建筑状态设定为已解锁
		 */		
		assignBuildingSortId:number;
		
		/**
		 * 每日BOSS难度,所有难度小于【配置值】的（全部主题）每日Boss状态设定为已完成
		 */		
		assignDailyBossDifficulty:number;
		
		/**
		 * 秘境层数,所有层数小于【配置值】的秘境状态设定为已完成
		 */		
		assignSecretInstanceFloor:number;
		
		/**
		 * 阵营塔层数,所有层数小于【配置值】的（全部类型）阵营塔状态设定为已完成
		 */		
		assignLadderFloor:number;
		
		/**
		 * 队伍英雄对应魔方信息列表
		 */		
		magicCubeIds:Array<number>;
		
		/**
		 * 队伍英雄对应魔方等级列表
		 */		
		magicCubeLevels:Array<number>;
		
		/**
		 * 上阵的星灵宠物配置ID
		 */		
		usePetConfigId:number;
		
		/**
		 * 星灵宠物等级
		 */		
		petLevel:number;
		
		/**
		 * 星灵宠物等阶
		 */		
		petStage:number;
		
		/**
		 * 激活的星灵宠物配置ID列表
		 */		
		activePetConfigIds:Array<number>;
		
		/**
		 * 激活的星灵宠物对应的等级列表
		 */		
		activePetStars:Array<number>;
		
		/**
		 * 上阵的收藏品配置ID
		 */		
		useCollectiblesId:number;
		
		/**
		 * 激活的收藏品配置ID列表
		 */		
		activeCollectiblesIds:Array<number>;
		
		/**
		 * 激活的收藏品对应的等级列表
		 */		
		activeCollectiblesLevels:Array<number>;
		
		/**
		 * 激活的收藏品对应的星级列表
		 */		
		activeCollectiblesStars:Array<number>;
		
	}


	
	/**
	 * 获取英雄属性
	 * @author GameCreator
	 */	
	class LoadHeroAttributeS2C	{
		content:com.cx.xj.gmmodule.gm.model.HeroAttributeVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 发送个人邮件
	 * @author GameCreator
	 */	
	class SendEmailC2S	{
		title:string;
		
		content:string;
		
		rewards:Array<Vo.reward.Reward>;
		
		/**
		 * 过期分钟
		 */		
		expireMinutes:number;
		
	}


	
	/**
	 * 发送个人邮件
	 * @author GameCreator
	 */	
	class SendEmailS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 立即完成指定主线任务
	 * @author GameCreator
	 */	
	class FinishTrunkTaskC2S	{
		/**
		 * 任务id
		 */		
		taskId:number;
		
	}


	
	/**
	 * 立即完成指定主线任务
	 * @author GameCreator
	 */	
	class FinishTrunkTaskS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 模拟任务进度
	 * @author GameCreator
	 */	
	class FakeTaskProgressC2S	{
		/**
		 * 任务类型,TaskType
		 */		
		taskType:number;
		
		/**
		 * 任务ID
		 */		
		taskId:number;
		
		/**
		 * 增加的进度
		 */		
		addProgress:number;
		
	}


	
	/**
	 * 模拟任务进度
	 * @author GameCreator
	 */	
	class FakeTaskProgressS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取英雄属性
	 * @author GameCreator
	 */	
	class LoadHeroAttributeC2S	{
		/**
		 * 英雄配置ID
		 */		
		heroBaseId:number;
		
	}


	
	/**
	 * 刷新地图资源点
	 * @author GameCreator
	 */	
	class RefreshMapResourceC2S	{
		mapId:number;
		
	}


	
	/**
	 * 刷新地图资源点
	 * @author GameCreator
	 */	
	class RefreshMapResourceS2C	{
		content:Array<Vo.map.MapResourceVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


}
