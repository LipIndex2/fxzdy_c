declare module table.item{
	class ItemBoxConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *物品Id，即ItemConfig的Id
		 */
		public itemId:number;
		/**
		 *页签名称
		 */
		public pagetitle:string;
		/**
		 *掉落Id，即RewardDropConfig的Id
		 */
		public dropId:number;
		/**
		 *奖励信息，自选类型为“道具Id:数量;道具Id:数量”，挂机类型为"资源Id:分钟数"
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *物品入库条件（玩家属性校验类型(PlayerVerifyType)
		 */
		public verifys:any;
		/**
		 *圣宝Id
		 */
		public holyTreasureId:number;
	}
	class ItemBuyPackConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *道具id
		 */
		public itemId:number;
		/**
		 *跳转id
		 */
		public jumpId:number;
		/**
		 *礼包id(连续的所属模块相同时 可以填一起)
		 */
		public packIds:Array<any>;
		/**
		 *礼包所属模块
		 */
		public systemType:string;
		/**
		 *排序
		 */
		public sort:number;
		/**
		 *商品购买条件(商品的展示)
		 */
		public buyConditions:Array<any>;
	}
	class ItemComeFromConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *道具id
		 */
		public itemId:number;
		/**
		 *跳转id
		 */
		public jumpId:number;
		/**
		 *来源标题
		 */
		public title:string;
		/**
		 *右上角信息
		 */
		public otherDesc:string;
		/**
		 *右上角信息参数
		 */
		public otherDescParm:any;
		/**
		 *来源描述
		 */
		public desc:string;
		/**
		 *解锁条件 JSON
		 */
		public unlockCondition:Array<any>;
		/**
		 *锁定时的提示文本
		 */
		public lockTips:string;
	}
	class ItemCompoundCostConfig {
		/**
		 *道具Id
		 */
		public itemId:number;
		/**
		 *消耗数量
		 */
		public costNum:number;
		/**
		 *奖励Id
		 */
		public rewardId:number;
	}
	class ItemCompoundRewardConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *奖励列表
		 */
		public rewards:Array<{k:any,v:any}>;
	}
	class ItemConfig {
		/**
		 *ID
		 */
		public id:number;
		/**
		 *包装名
		 */
		public name:string;
		/**
		 *背包id
		 */
		public bagId:number;
		/**
		 *是否显示在背包中
		 */
		public showBackpackFlag:boolean;
		/**
		 *【后端物品1级类型】
- 详情查看"类型说明.md"文件
		 */
		public type:string;
		/**
		 *【后端物品2级分类】
详情查看"类型说明.md"文件


		 */
		public secondsType:string;
		/**
		 *客户端定义的道具类型
		 */
		public itemType:string;
		/**
		 *道具品质
		 */
		public quality:number;
		/**
		 *道具排序
- 数值越大越靠前. 默认0
		 */
		public sortId:number;
		/**
		 *物品上限,超出的奖励通过邮件补发,<=0则不限制
		 */
		public holdingCountLimit:number;
		/**
		 *背包格子堆叠数量上限
		 */
		public stackLimit:number;
		/**
		 *红点类型
		 */
		public isRed:number;
		/**
		 *图标
100*100
		 */
		public iconPath:string;
		/**
		 *背包中的物品小图标
64*64
		 */
		public smallIconPath:string;
		/**
		 *超大图标
		 */
		public bigIconPath:string;
		/**
		 *描述
		 */
		public desc:string;
		/**
		 *左上等级角标 
-因部分道具是装备
		 */
		public showLvFlag:boolean;
		/**
		 *购买跳转id。0=没有
关联 @JumpConfig.xlsx
		 */
		public buyJumpId:number;
		/**
		 *道具跳转id
		 */
		public way:Array<any>;
		/**
		 *道具来源文本
		 */
		public comeFromText:string;
		/**
		 *跳转的商店商品表的id
		 */
		public storeGoodIdArray:Array<any>;
		/**
		 *道具广告描述
		 */
		public adWords:string;
	}
	class ItemConstantConfig {
		/**
		 *唯一标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class ItemGetAnimConfig {
		/**
		 *道具ID
		 */
		public id:number;
		/**
		 *物品小图标
64*64
		 */
		public smallIconPath:string;
		/**
		 *半径
		 */
		public radius:number;
		/**
		 *随机时间
		 */
		public random:number;
		/**
		 *最大数量
		 */
		public maxCount:number;
		/**
		 *界面
		 */
		public uiKey:string;
		/**
		 *组件名字
		 */
		public compPaths:Array<any>;
		/**
		 *组件偏移坐标
		 */
		public fixPos:Array<any>;
		/**
		 *动画前调用的方法名
		 */
		public callBegin:string;
		/**
		 *到达组件后调用的方法名
		 */
		public callback:string;
		/**
		 *终点位置
		 */
		public endPos:Array<any>;
	}
}
