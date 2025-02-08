declare module table.guide{
	class GuideConfig {
		/**
		 *ID
		 */
		public id:number;
		/**
		 *下一步引导id
		 */
		public nextId:number;
		/**
		 *组id
		 */
		public group:number;
		/**
		 *段落(记录后，重登整段落完成)
		 */
		public partId:number;
		/**
		 *记录点
		 */
		public savePoint:number;
		/**
		 *跳过结束点(包含)
		 */
		public passEnd:number;
		/**
		 *引导类型
		 */
		public type:string;
		/**
		 *类型参数
		 */
		public typeParam:Array<any>;
		/**
		 *对话组id || 教学组id
		 */
		public plot:any;
		/**
		 *是否强引导
		 */
		public isForce:boolean;
		/**
		 *是否可以战斗
		 */
		public battle:string;
		/**
		 *创角时间大于此时间才能触发该引导
没有配置则不受此条件限制
		 */
		public time:string;
		/**
		 *触发条件
		 */
		public triggerCondition:Array<any>;
		/**
		 *完成条件
		 */
		public finishCondition:Array<any>;
		/**
		 *遮罩透明度
		 */
		public maskAlpha:number;
		/**
		 *UI
		 */
		public UI:string;
		/**
		 *item
		 */
		public item:string;
		/**
		 *手指位置
		 */
		public fingerPos:Array<any>;
		/**
		 *遮罩挖空
		 */
		public maskInverted:Array<any>;
		/**
		 *脚本
		 */
		public script:string;
		/**
		 *参数
		 */
		public scriptParam:Array<any>;
		/**
		 *引导卡住时是否可以跳过这条引导
		 */
		public canJump:number;
	}
	class GuideConstantConfig {
		/**
		 *唯一标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class GuideDialogConfig {
		/**
		 *ID
		 */
		public id:number;
		/**
		 *组id
		 */
		public group:number;
		/**
		 *对话横向位置百分比（-50到50）
		 */
		public xPercent:number;
		/**
		 *对话纵向位置百分比（0到100）
		 */
		public yPercent:number;
		/**
		 *对话到底部距离像素
		 */
		public yToBottom:number;
		/**
		 *角色名称
		 */
		public npcName:string;
		/**
		 *停留时间毫秒
		 */
		public time:number;
		/**
		 *角色模型
		 */
		public npcModel:number;
		/**
		 *角色头像
		 */
		public npcHead:string;
		/**
		 *角色位置偏移[x,y]
		 */
		public npcPos:Array<any>;
		/**
		 *对白语音
		 */
		public sound:string;
		/**
		 *指引文本
		 */
		public text:string;
	}
	class GuideGroupConfig {
		/**
		 *组id
		 */
		public groupId:number;
		/**
		 *开启条件
		 */
		public openVerify:Array<any>;
		/**
		 *关闭条件
		 */
		public closeVerify:Array<any>;
		/**
		 *结束引导标志
		 */
		public endGuideId:number;
	}
	class GuideTeachConfig {
		/**
		 *ID
		 */
		public id:number;
		/**
		 *组id
		 */
		public group:number;
		/**
		 *图片
		 */
		public icon:string;
		/**
		 *动画
		 */
		public anim:number;
		/**
		 *停留时间
		 */
		public time:number;
		/**
		 *文本
		 */
		public text:string;
	}
}
