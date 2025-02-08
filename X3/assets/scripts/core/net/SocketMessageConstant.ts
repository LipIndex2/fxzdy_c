
    /**消息常量 */
    export class SocketMessageConstant {
        /**错误位 */
        public static ERROR_CODE_BIT = 16;

        /** 状态:正常(请求状态) */
        public static STATE_NORMAL = 0;

        /** 状态:回应(不是回应就是请求) */
        public static STATE_RESPONSE = 1;

        /** 压缩标记位(没有该状态代表未经压缩) */
        public static STATE_COMPRESS = 1 << 1;

        /** 错误标记位(没有该状态代表正常) 弃用*/
        //public static STATE_ERROR = 1 << 16;

        /** 请求指令不存在 */
        public static COMMAND_NOT_FOUND = 1;

        /** 解码异常 */
        public static DECODE_EXCEPTION = 2;

        /** 编码异常 */
        public static ENCODE_EXCEPTION = 3;

        /** 参数异常 */
        public static PARAMETER_EXCEPTION = 4;

        /** 会话身份异常 */
        public static IDENTITY_EXCEPTION = 5;

        /** 找不到转发目标，转发失败 */
        public static FORWARD_TARGET_NOT_FOUND = 6;

        /** 转发服务未开启*/
        public static FORWARD_SERVER_NOT_OPEN = 7;

        /** 不支持的编码方式*/
        public static NOT_SUPPORT_CODER = 8;

        /** 未知异常 */
        public static UNKNOWN_EXCEPTION = 9;

        /** 请求太频繁 */
        public static REQUEST_TO_FREQUENTLY = 10;
        
    }
