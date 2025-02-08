
/**
 * 对象池继承基类
 */
export interface IPool {
    /**
     * 销毁对象
     */
    onRecovery(): void;
}

