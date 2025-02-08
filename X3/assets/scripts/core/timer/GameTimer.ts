import { game } from "cc";
import { Timer } from "./Timer";
import { CallLater } from "./CallLater";

/**
 * Timer在项目中使用的是最多的，出于对性能的考虑，项目中需要把所有的Timer集中起来进行管理，以便优化游戏性能
 * 1、分帧处理所有注册的Timer
 * 2、方便游戏后期调试性能
 *
 * 需要注意的是：这里执行的时机很可能不是你想要的时机
 * 例如 ： GameTimer.ins().frameOnce(1)
 * 这里，其实你想要延迟一帧执行。但在GameTimerTimer这里由于添加了分帧处理，有可能卡顿造成了这个会延后几帧执行，这个时机是不确定的
 * 所以，你们要注意这一点
 */
export class GameTimer extends Timer {
    private currentIndex: number = 0;

    private static _ins: GameTimer;

    static ins(): GameTimer {
        if (!this._ins) {
            this._ins = new GameTimer();
        }
        return this._ins;
    }

    constructor() {
        super();

    }

    get delta(): number {
        return this._delta * this.scale;
    }

    public update(): void {
        var now: number = Date.now();

        if (this.scale <= 0) {
            this._lastTimer = now;
            this._delta = 0;
            return;
        }

        this.currFrame = this.currFrame + this.scale;
        this._delta = (now - this._lastTimer) * this.scale;
        this.currTime = this.currTime + this._delta;
        this._lastTimer = now;

        this._update();
    }

    protected _update() {
        CallLater.I.update();

        var frame: number = this.currFrame;
        var timer: number = this.currTime;

        //处理handler
        var handlers: any[] = this._handlers;

        this._count = 0;
        var i: number = 0, n: number = handlers.length;
        for (i = this.currentIndex; i < n; ++i) {
            var handler = handlers[i];
            if (handler.method !== null) {
                var t: number = handler.userFrame ? frame : timer;
                if (t >= handler.exeTime) {
                    if (handler.repeat) {
                        handler.exeTime += handler.delay;
                        handler.run(false);
                        if (t > handler.exeTime) {
                            handler.exeTime += Math.ceil((t - handler.exeTime) / handler.delay) * handler.delay;
                        }
                    } else {
                        handler.run(true);
                    }
                }
            } else {
                //记录清理了多少个Handler
                // @ts-ignore
                this._count++;
            }

            //TODO
            if (game.totalTime - game.frameStartTime >= 16) {
                console.warn("frame handler处理超过一帧,影响了执行性能,检查逻辑是否过于复杂", handler);
            }

            //分帧处理
            if (game.totalTime - game.frameStartTime > 33) {
                if (i < n - 1) {
                    this.currentIndex = i + 1;
                } else {
                    i = n;
                }
                break;
            }
        }


        //如果被清理的Handler多于30个，或帧运行了200，则执行一次清理
        // @ts-ignore
        //if (this._count > 30 || frame % 200 === 0) {
        this.clearHandlers();
        //}

        if (i === n) {
            this.currentIndex = 0;
        }

    }

    private clearHandlers(): void {
        var handlers: any[] = this._handlers;
        var currentIndexT = this.currentIndex;
        for (var i: number = 0, n: number = handlers.length; i < n; i++) {
            var handler = handlers[i];
            if (handler.method !== null) {
                this._temp.push(handler)
            } else {
                //有可能移除了还没有执行，并且在currentIndex之后的Handler，这样就造成了currentIndex计数错误了
                if (i < currentIndexT) {
                    --this.currentIndex;
                }
                this._recoverHandler(handler);
            }
        }
        this._handlers = this._temp;
        // 可能移除后在currentIndex之后没有任何Handler了，则重置会第一个执行
        if (this._handlers.length === this.currentIndex) {
            this.currentIndex = 0;
        }
        handlers.length = 0;
        this._temp = handlers;
    }

    /**
     * 延迟执行。
     * @param	caller 执行域(this)。
     * @param	method 定时器回调函数。
     * @param	args 回调参数。
     */
    callLater(caller: any, method: Function, args: any[] = null): void {
        CallLater.I.callLater(caller, method, args);
    }
}
