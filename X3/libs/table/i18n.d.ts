declare module table.i18n{
	class I18nConfig {
		/**
		 *唯一id=配置名.字段名.id
		 */
		public id:string;
		/**
		 *中文
		 */
		public Chinese:string;
		/**
		 *英文
		 */
		public English:string;
	}
	class I18nErrorCodeConfig {
		/**
		 *唯一ID
		 */
		public id:string;
		/**
		 *中文
		 */
		public Chinese:string;
		/**
		 *英文
		 */
		public English:string;
	}
	class I18nTipsConfig {
		/**
		 *唯一名
（问前端,必须 i18n: 开头, 且英文标点符号）
		 */
		public id:string;
		/**
		 *中文
		 */
		public Chinese:string;
		/**
		 *英文
		 */
		public English:string;
	}
}
