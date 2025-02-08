export enum ResRefType {
    /**自动释放 */
    AUTO = 0,
    /**手动释放 */
    MANUAL = 1,
}


export interface IResRef {
    /**唯一KEY */
    url2key: string;
    /**引用KEY */
    refKey: string | undefined;
    /**资源内容 */
    content: any;
    /**
     * 彻底销毁(注意内部接口，请勿调用)
     */
    destroy(): void;
}