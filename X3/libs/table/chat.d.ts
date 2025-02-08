declare module table.chat{
	class ChatBarrageConfig {
		/**
		 *唯一id
		 */
		public id:number;
		/**
		 *对应界面id
		 */
		public systemType:number;
		/**
		 *系统名称
		 */
		public verifyName:string;
	}
	class ChatBoxConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *聊天框对应的物品ID
		 */
		public itemId:number;
		/**
		 *美术资源
		 */
		public boxpath:string;
		/**
		 *解锁条件描述
		 */
		public desc:string;
		/**
		 *九宫格
		 */
		public scale9Grid:Array<any>;
		/**
		 *艺术字路径
		 */
		public wordpath:string;
		/**
		 *是否隐藏
		 */
		public hide:number;
	}
	class ChatChannelConfig {
		/**
		 *频道ID
		 */
		public id:string;
		/**
		 *频道名称
		 */
		public name:string;
		/**
		 *排序
		 */
		public sort:number;
		/**
		 *设置栏中的名称
		 */
		public settingName:string;
		/**
		 *是否开启(前端使用)
		 */
		public isOpen:boolean;
		/**
		 *频道未解锁时，是否显示
		 */
		public isCanSeeWhenLock:boolean;
		/**
		 *频道解锁条件
		 */
		public unlockChannelCondition:Array<any>;
		/**
		 *锁定提示
		 */
		public lockTips:string;
		/**
		 *频道发言解锁条件
		 */
		public unlockSpeakCondition:Array<any>;
		/**
		 *是否只有弹幕
		 */
		public onlyBarrage:number;
		/**
		 *频道发言间隔(秒)
		 */
		public speakCdSecond:number;
		/**
		 *频道可发送内容
		 */
		public speakTypes:Array<any>;
		/**
		 *有无气泡提示
		 */
		public isbubble:number;
		/**
		 *对应频道的弹幕颜色
		 */
		public color:string;
		/**
		 *未按下按钮图标
		 */
		public upImagePath:string;
		/**
		 *按下按钮图标
		 */
		public downImagePath:string;
		/**
		 *同一个对话框中保留消息显示的数量
		 */
		public keepMessageCount:number;
		/**
		 *是否禁止发言
		 */
		public chatBan:boolean;
	}
	class ChatConstantConfig {
		/**
		 *唯一标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class ChatTemplateConfig {
		/**
		 *模板Id，即模板类型，参考"类型说明.md"文件的ChatTemplateType
		 */
		public id:string;
		/**
		 *模板内容
		 */
		public content:string;
		/**
		 *图片logo | vip 卡等
		 */
		public imageLogo:string;
		/**
		 *按钮内容
		 */
		public btnTitle:string;
		/**
		 *跳转id
		 */
		public btnJumpId:number;
	}
	class EmojiConfig {
		/**
		 *表情id
		 */
		public id:number;
		/**
		 *表情包名字
		 */
		public name:string;
		/**
		 *分类 = 表情包id = EmojiTypeConfig
		 */
		public type:number;
		/**
		 *是否大表情(大表情单独发送,小表情可与文字混合)
		 */
		public isMonoEmoji:boolean;
		/**
		 *所属图集
		 */
		public atlasPath:string;
		/**
		 *表情资源
		 */
		public icon:string;
	}
	class EmojiTypeConfig {
		/**
		 *类型id
		 */
		public id:number;
		/**
		 *类型名字
		 */
		public name:string;
		/**
		 *类型代表资源
		 */
		public icon:string;
	}
	class PostConfig {
		/**
		 *唯一id
		 */
		public id:number;
		/**
		 *公告类型,PostType
		 */
		public type:string;
		/**
		 *优先级
		 */
		public priority:number;
		/**
		 *间隔分钟，大于0生效
		 */
		public intervalMinutes:number;
		/**
		 *背景样式(1黑底 2蓝底)
		 */
		public bgStyle:number;
	}
	class PostDescConfig {
		/**
		 *公告类型,PostType
		 */
		public type:string;
		/**
		 *文本描述
		 */
		public desc:string;
	}
}
