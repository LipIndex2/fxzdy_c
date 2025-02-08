import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";

/**
 * 冷却工具
 *
 * @author luohaojun
 */
export class CdUtils {

    // <key, 最后执行时间>
    private static _nameToLastTimeMsMap: Map<string, number> = new Map();
    // <key, 最后计算的CD完成时间>
    private static _nameToLastToCdTimeMs: Map<string, number> = new Map();

    /**
     * 冷却工具装饰器
     *
     * @param cdTimeMs 冷却时间（以毫秒为单位）。
     * @param tips 提示信息。
     * @returns 方法执行后, 会有一段 CD 时间。
     *
     * @code
     *  @CdUtils.ExecuteInCDTimeMs(1000, "挂机奖励领取 CD 中")
     */
    static ExecuteInCDTimeMs(cdTimeMs: number, tips: string = null) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
            const originalMethod = descriptor.value;

            descriptor.value = function (...args: any[]) {
                const key = `${target?.constructor?.name}_${propertyKey}`;
                const isInCd = CdUtils.isInCd(key, cdTimeMs);
                if (isInCd) {
                    if (tips) {
                        FloatingTextManager.ins().showTips(tips);
                    } else {
                        console.warn(`方法 ${propertyKey} 被调用，但仍在冷却时间内 (${cdTimeMs} ms)。`);

                    }
                    return;
                }

                CdUtils.updateLastExecuteTimeMs(key);
                return originalMethod.apply(this, args);
            };

            return descriptor;
        };
    }

    // 剩余多少毫秒的 CD
    static getRestCdTimeMs(key: string): number {
        const lastTime = this._nameToLastToCdTimeMs.get(key);
        if (lastTime == null) {
            return 0;
        }
        const currentTimeMs = Date.now();
        return lastTime - currentTimeMs;
    }

    // 剩余多少秒的 CD
    static getRestCdSecond(key: string): number {
        const restCdTimeMs = this.getRestCdTimeMs(key);
        if (restCdTimeMs <= 0) {
            return 0;
        }
        return Math.ceil(restCdTimeMs / 1000);
    }
    
    static remove(key: string) {
        this._nameToLastTimeMsMap.delete(key);
        this._nameToLastToCdTimeMs.delete(key);
    }

    /**
     * 执行是否在 cd 中? 懒重置 cd
     * @param key 操作的唯一标识键。
     * @param cdTimeMs 毫秒数表示的冷却时间。
     * @returns 如果冷却时间已过，返回 true；否则返回 false。
     */
    public static isInCd(key: string, cdTimeMs: number): boolean {
        const lastTime = this._nameToLastTimeMsMap.get(key);
        const currentTimeMs = Date.now();

        if (lastTime == null) {
            // ok
            this.updateLastExecuteTimeMs(key, currentTimeMs);
            this._nameToLastToCdTimeMs.set(key, currentTimeMs + cdTimeMs);
            return false;
        }
        const diffTimeMs = currentTimeMs - lastTime;
        // time rollback
        if (diffTimeMs < 0) {
            this.updateLastExecuteTimeMs(key, currentTimeMs);
            return true;
        }
        // in CD
        if (diffTimeMs < cdTimeMs) {
            return true;
        }

        // ok
        this.updateLastExecuteTimeMs(key, currentTimeMs);
        this._nameToLastToCdTimeMs.set(key, currentTimeMs + cdTimeMs);
        return false;
    }

    /**
     * 不在 CD 中
     */
    public static isNotInCd(key: string, cdTimeMs: number) {
        return !this.isInCd(key, cdTimeMs);
    }

    // 修改最后一次执行时间
    static updateLastExecuteTimeMs(key: string, currentTimeMs: number = Date.now()) {
        this._nameToLastTimeMsMap.set(key, currentTimeMs);
    }
}
