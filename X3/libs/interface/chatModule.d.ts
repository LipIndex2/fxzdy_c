declare module Vo.chat{
	
	/**
	 * 获取战区频道历史消息
	 * @author GameCreator
	 */	
	class LoadZoneHistoryS2C	{
		content:Array<Vo.chat.ChatContentVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取战区频道历史消息
	 * @author GameCreator
	 */	
	class LoadZoneHistoryC2S	{
		/**
		 * 获取此时间之前的历史消息
		 */		
		time:number;
		
	}


	
	/**
	 * 聊天模板信息
	 * @author GameCreator
	 */	
	class ChatTemplateVo	{
		/**
		 * 模板Id
		 */		
		templateId:number;
		
		/**
		 * 内容
		 */		
		termVo:Vo.common.TermVo;
		
	}


	
	/**
	 * 第三方语音数据
	 * @author GameCreator
	 */	
	class ChatVoiceVo	{
		/**
		 * 第三方语音key
		 */		
		voiceKey:string;
		
		/**
		 * 第三方语音时长
		 */		
		voiceTime:number;
		
	}


	
	/**
	 * 发送聊天信息
	 * @author GameCreator
	 */	
	class SendC2S	{
		/**
		 * 聊天信息
		 */		
		messageVo:Vo.chat.MessageVo;
		
	}


	
	/**
	 * 发送聊天信息
	 * @author GameCreator
	 */	
	class SendS2C	{
		content:Vo.chat.ChatCostVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取本服频道历史消息
	 * @author GameCreator
	 */	
	class LoadLocalHistoryC2S	{
		/**
		 * 获取此时间之前的历史消息
		 */		
		time:number;
		
	}


	
	/**
	 * 获取本服频道历史消息
	 * @author GameCreator
	 */	
	class LoadLocalHistoryS2C	{
		content:Array<Vo.chat.ChatContentVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取指定时间段内频道未读历史消息条数
	 * @author GameCreator
	 */	
	class LoadUnreadMsgCountC2S	{
		/**
		 * 聊天未读消息数量请求Vo列表
		 */		
		reqVos:Array<Vo.chat.ChatUnReadMsgCountReqVo>;
		
	}


	
	/**
	 * 获取指定时间段内频道未读历史消息条数
	 * @author GameCreator
	 */	
	class LoadUnreadMsgCountS2C	{
		content:Object;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 聊天未读消息数量请求Vo
	 * @author GameCreator
	 */	
	class ChatUnReadMsgCountReqVo	{
		/**
		 * 频道ID
		 */		
		channel:number;
		
		/**
		 * 开始时间
		 */		
		startTime:number;
		
		/**
		 * 结束时间
		 */		
		endTime:number;
		
	}


	
	/**
	 * 聊天多人频道内容对象
	 * @author GameCreator
	 */	
	class ChatContentVo	{
		/**
		 * 消息ID，使用字符串类型，兼容前端溢出
		 */		
		msgId:string;
		
		/**
		 * 下行频道序号,ChannelType
		 */		
		channel:number;
		
		/**
		 * 发送人标识
		 */		
		id:number;
		
		/**
		 * 发送人名称
		 */		
		name:string;
		
		/**
		 * 玩家等级
		 */		
		level:number;
		
		/**
		 * 称号
		 */		
		title:number;
		
		/**
		 * VIP经验值
		 */		
		vipExp:number;
		
		/**
		 * 玩家头像Id
		 */		
		headIcon:number;
		
		/**
		 * 玩家头像框Id
		 */		
		headFrame:number;
		
		/**
		 * 聊天框Id
		 */		
		chatBoxId:number;
		
		/**
		 * 聊天文字颜色Id
		 */		
		chatWordColorId:number;
		
		/**
		 * 文字内容
		 */		
		message:string;
		
		/**
		 * 语音内容
		 */		
		voiceVo:ChatVoiceVo;
		
		/**
		 * 消息发送时间
		 */		
		sendTime:number;
		
		/**
		 * 回复玩家Id,系统频道时忽略
		 */		
		replyPlayerId:number;
		
		/**
		 * 回复玩家昵称,系统频道时忽略
		 */		
		replyPlayerName:string;
		
		/**
		 * 消息类型,ChannelSendMessageType
		 */		
		msgType:number;
		
		/**
		 * 附加对象信息,根据消息类型处理
		 */		
		templateVo:ChatTemplateVo;
		
	}


	/**
	 * 聊天举报
	 * @author GameCreator
	 */	
	enum ChatReportReasonType
	{
		/**
		 * 昵称不雅
		 */		
		PLAYER_NAME_INDECENT = 0,
		/**
		 * 骚扰谩骂
		 */		
		HARASS_ABUSE = 1,
		/**
		 * 广告刷屏
		 */		
		ADVERTISING_SWIPE = 2,
		/**
		 * 色情暴力
		 */		
		PORN_VIOLENCE = 3,
		/**
		 * 反动证据
		 */		
		REACTIONARY_EVIDENCE = 4,
		/**
		 * 其他
		 */		
		OTHER = 5
	}


	
	/**
	 * 获取联盟对决频道历史消息
	 * @author GameCreator
	 */	
	class LoadLeagueWarHistoryC2S	{
		/**
		 * 获取此时间之前的历史消息
		 */		
		time:number;
		
	}


	
	/**
	 * 获取联盟对决频道历史消息
	 * @author GameCreator
	 */	
	class LoadLeagueWarHistoryS2C	{
		content:Array<Vo.chat.ChatContentVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取联盟频道历史消息
	 * @author GameCreator
	 */	
	class LoadLeagueHistoryC2S	{
		/**
		 * 获取此时间之前的历史消息
		 */		
		time:number;
		
	}


	
	/**
	 * 获取联盟频道历史消息
	 * @author GameCreator
	 */	
	class LoadLeagueHistoryS2C	{
		content:Array<Vo.chat.ChatContentVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 聊天撤回内容
	 * @author GameCreator
	 */	
	class MsgRetractVo	{
		/**
		 * 消息ID，使用字符串类型，兼容前端溢出
		 */		
		msgId:string;
		
		/**
		 * 聊天频道
		 */		
		channel:number;
		
		/**
		 * 私聊的玩家ID,仅撤回私聊消息有效
		 */		
		privatePlayerId:number;
		
	}


	
	/**
	 * 发送聊天消息
	 * @author GameCreator
	 */	
	class ChatCostVo	{
		/**
		 * 消耗道具
		 */		
		results:Array<Vo.cost.CostItemResult>;
		
		/**
		 * 频道号
		 */		
		channel:number;
		
	}


	
	/**
	 * 获取世界历史消息
	 * @author GameCreator
	 */	
	class LoadWorldHistoryC2S	{
		/**
		 * 获取历史消息的时间基准，在此时间之前(不包含)
		 */		
		time:number;
		
	}


	
	/**
	 * 获取世界历史消息
	 * @author GameCreator
	 */	
	class LoadWorldHistoryS2C	{
		content:Array<Vo.chat.ChatContentVo>;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 聊天登录下发Vo
	 * @author GameCreator
	 */	
	class ChatLoginVo	{
		/**
		 * 玩家离线时保存的私聊消息，<发送人Id, ChatContentVo列表>
		 */		
		offlinePrivateChatMsgMap:Object;
		
		/**
		 * 频道Id-撤回消息Id列表，消息Id使用字符串类型，兼容前端溢出
		 */		
		channel2RetractIds:Object;
		
	}


	
	/**
	 * 发送信息对象
	 * @author GameCreator
	 */	
	class MessageVo	{
		/**
		 * 目标频道，ChannelType
		 */		
		channel:number;
		
		/**
		 * 内容
		 */		
		message:string;
		
		/**
		 * 消息类型：1-文本消息，2-语音消息
		 */		
		type:number;
		
		/**
		 * 回复玩家Id，私聊频道时为私聊玩家Id，其他频道时为@的玩家Id
		 */		
		replyPlayerId:number;
		
		/**
		 * 语音内容
		 */		
		voiceVo:ChatVoiceVo;
		
	}


	
	/**
	 * 公告基本数据对象
	 * @author GameCreator
	 */	
	class PostVo	{
		/**
		 * 公告Id
		 */		
		id:number;
		
		/**
		 * 是否后台GM公告
		 */		
		gm:boolean;
		
		/**
		 * 公告内容参数，根据公共配置表事件类型处理
		 */		
		termVo:Vo.common.TermVo;
		
		/**
		 * 文本内容
		 */		
		txt:string;
		
	}


	
	/**
	 * 冷却时间对象，每用户一个
	 * @author GameCreator
	 */	
	class CoolTimeVo	{
		/**
		 * 各频道的最后发送时间
		 */		
		times:Object;
		
	}


}
