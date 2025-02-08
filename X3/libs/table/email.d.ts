declare module table.email{
	class EmailConstantConfig {
		/**
		 *唯一ID
		 */
		public id:string;
		/**
		 *值内容
		 */
		public content:string;
	}
	class EmailTemplateConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *过期时间，单位：小时
		 */
		public expireTime:number;
		/**
		 *邮件标题
		 */
		public title:string;
		/**
		 *邮件模板内容（无超链接需求的邮件开头不要带“<” 此开头符号适用于外网链接）
		 */
		public content:string;
		/**
		 *邮件模板类型
- 找前端对
		 */
		public templateType:string;
		/**
		 *跳转id，有则显示前往
		 */
		public targetId:number;
		/**
		 *显示图标
		 */
		public icon:string;
		/**
		 *邮件发送者
		 */
		public senderName:string;
	}
}
