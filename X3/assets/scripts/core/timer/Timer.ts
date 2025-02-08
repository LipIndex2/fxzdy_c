import { ISchedulable, director } from "cc";
import { Utils } from "../utils/Utils";
import { System } from "cc";

/**
 * <code>Timer</code> 是基础时钟类，请勿直接使用。它是一个单例。参考laya timer
 */
export class Timer implements ISchedulable {

    /**@private */
    private _pool: any[] = [];
    /**@private */
    static _mid: number = 1;

    /** 当前帧开始的时间。*/
    currTime: number = Date.now();
    /** 当前的帧数。*/
    currFrame: number = 0;

    private _isPlaying: boolean = true;
    /** 时针缩放。*/
    private _scale: number = 1;

    /**@internal 两帧之间的时间间隔,单位毫秒。*/
    protected _delta: number = 0;
    /**@internal */
    protected _lastTimer: number = Date.now();
    /**@private */
    private _map: { [key: string]: TimerHandler } = {};

    protected _handlers: TimerHandler[] = [];
    protected _temp: TimerHandler[] = [];
    protected _count: number = 0;

    /**优先级 */
    protected _priority = System.Priority.MEDIUM;

    constructor() {
        this.init();
    }

    init() {
        /**@see ISchedulable */
        this["id"] = "time_" + Utils.getGID();
        this["uuid"] = "time_" + Utils.getGUID();
        director.getScheduler().scheduleUpdate(this, this._priority, false);
    }

    /**两帧之间的时间间隔,单位毫秒。*/
    get delta(): number {
        return this._delta;
    }

    /**
     * @internal
     * 帧循环处理函数。
     */
    public update(dt: number): void {
        if (this.scale <= 0) {
            this._lastTimer = Date.now();
            this._delta = 0;
            return;
        }
        var frame: number = this.currFrame = this.currFrame + this.scale;
        var now: number = Date.now();
        var awake: boolean = (now - this._lastTimer) > 30000;
        this._delta = (now - this._lastTimer) * this.scale;
        var timer: number = this.currTime = this.currTime + this._delta;
        this._lastTimer = now;

        //处理handler
        var handlers: any[] = this._handlers;
        this._count = 0;
        for (var i: number = 0, n: number = handlers.length; i < n; i++) {
            var handler: TimerHandler = handlers[i];
            if (handler.method !== null) {
                var t: number = handler.userFrame ? frame : timer;
                if (t >= handler.exeTime) {
                    if (handler.repeat) {
                        if (!handler.jumpFrame || awake) {
                            handler.exeTime += handler.delay;
                            handler.run(false);
                            if (t > handler.exeTime) {
                                //如果执行一次后还能再执行，做跳出处理，如果想用多次执行，需要设置jumpFrame=true
                                handler.exeTime += Math.ceil((t - handler.exeTime) / handler.delay) * handler.delay;
                            }
                        } else {
                            while (t >= handler.exeTime) {
                                handler.exeTime += handler.delay;
                                handler.run(false);
                            }
                        }
                    } else {
                        handler.run(true);
                    }
                }
            } else {
                this._count++;
            }
        }

        //if (this._count > 30 || frame % 200 === 0) this._clearHandlers();
        this._clearHandlers();
    }

    /** @private */
    protected _clearHandlers(): void {
        var handlers: any[] = this._handlers;
        for (var i: number = 0, n: number = handlers.length; i < n; i++) {
            var handler: TimerHandler = handlers[i];
            if (handler.method !== null) this._temp.push(handler);
            else this._recoverHandler(handler);
        }
        this._handlers = this._temp;
        handlers.length = 0;
        this._temp = handlers;
    }

    /** @private */
    protected _recoverHandler(handler: TimerHandler): void {
        if (this._map[handler.key] == handler) delete this._map[handler.key];
        handler.clear();
        this._pool.push(handler);
    }

    /** @internal */
    private _create(useFrame: boolean, repeat: boolean, delay: number, caller: any, method: Function, args: any[], coverBefore: boolean): TimerHandler {
        //如果延迟为0，则立即执行
        if (!delay) {
            method.apply(caller, args);
            return null;
        }

        //先覆盖相同函数的计时
        if (coverBefore) {
            var handler: TimerHandler = this._getHandler(caller, method);
            if (handler) {
                handler.repeat = repeat;
                handler.userFrame = useFrame;
                handler.delay = delay;
                handler.caller = caller;
                handler.method = method;
                handler.args = args;
                handler.exeTime = delay + (useFrame ? this.currFrame : this.currTime + Date.now() - this._lastTimer);
                return handler;
            }
        }

        //找到一个空闲的timerHandler
        handler = this._pool.length > 0 ? this._pool.pop() : new TimerHandler();
        handler.repeat = repeat;
        handler.userFrame = useFrame;
        handler.delay = delay;
        handler.caller = caller;
        handler.method = method;
        handler.args = args;
        handler.exeTime = delay + (useFrame ? this.currFrame : this.currTime + Date.now() - this._lastTimer);

        //索引handler
        this._indexHandler(handler);

        //插入数组
        this._handlers.push(handler);

        return handler;
    }

    /** @private */
    private _indexHandler(handler: TimerHandler): void {
        var caller: any = handler.caller;
        var method: any = handler.method;
        var cid: number = caller ? caller.$_GID || (caller.$_GID = Utils.getGID()) : 0;
        var mid: number = method.$_TID || (method.$_TID = Timer._mid++);
        handler.key = cid + "_" + mid;
        this._map[handler.key] = handler;
    }

    /**
     * 定时执行一次。
     * @param	delay	延迟时间(单位为毫秒)。
     * @param	caller	执行域(this)。
     * @param	method	定时器回调函数。
     * @param	args	回调参数。
     * @param	coverBefore	是否覆盖之前的延迟执行，默认为 true 。
     */
    once(delay: number, caller: any, method: Function, args: any[] = null, coverBefore: boolean = true): string {
        var handler = this._create(false, false, delay, caller, method, args, coverBefore);
        return handler?.key;
    }

    /**
     * 定时重复执行。
     * @param	delay	间隔时间(单位毫秒)。
     * @param	caller	执行域(this)。
     * @param	method	定时器回调函数。
     * @param	args	回调参数。
     * @param	coverBefore	是否覆盖之前的延迟执行，默认为 true 。
     * @param	jumpFrame 时钟是否跳帧。基于时间的循环回调，单位时间间隔内，如能执行多次回调，出于性能考虑，引擎默认只执行一次，设置jumpFrame=true后，则回调会连续执行多次
     */
    loop(delay: number, caller: any, method: Function, args: any[] = null, coverBefore: boolean = true, jumpFrame: boolean = false): string {
        var handler: TimerHandler = this._create(false, true, delay, caller, method, args, coverBefore);
        if (handler) handler.jumpFrame = jumpFrame;
        return handler?.key;
    }

    /**
     * 定时执行一次(基于帧率)。
     * @param	delay	延迟几帧(单位为帧)。
     * @param	caller	执行域(this)。
     * @param	method	定时器回调函数。
     * @param	args	回调参数。
     * @param	coverBefore	是否覆盖之前的延迟执行，默认为 true 。
     */
    frameOnce(delay: number, caller: any, method: Function, args: any[] = null, coverBefore: boolean = true): string {
        var handler = this._create(true, false, delay, caller, method, args, coverBefore);
        return handler?.key;
    }

    /**
     * 定时重复执行(基于帧率)。
     * @param	delay	间隔几帧(单位为帧)。
     * @param	caller	执行域(this)。
     * @param	method	定时器回调函数。
     * @param	args	回调参数。
     * @param	coverBefore	是否覆盖之前的延迟执行，默认为 true 。
     */
    frameLoop(delay: number, caller: any, method: Function, args: any[] = null, coverBefore: boolean = true): string {
        var handler = this._create(true, true, delay, caller, method, args, coverBefore);
        return handler?.key;
    }

    /** 返回统计信息。*/
    toString(): string {
        return " handlers:" + this._handlers.length + " pool:" + this._pool.length;
    }


    /**是否已有定时器 */
    hasTimer(caller: any, method: Function) {
        return !!this._getHandler(caller, method)
    }

    /**
     * 清理定时器。
     * @param handlerKey 定时器key。
     */
    clearByKey(handlerKey: string): void {
        if (this._map[handlerKey]) {
            this._map[handlerKey].clear();
        }
    }

    /**
     * 清理定时器。
     * @param	caller 执行域(this)。
     * @param	method 定时器回调函数。
     */
    clear(caller: any, method: Function): void {
        var handler: TimerHandler = this._getHandler(caller, method);
        if (handler) {
            handler.clear();
        }
    }

    /**
     * 清理对象身上的所有定时器。
     * @param	caller 执行域(this)。
     */
    clearAll(caller: any): void {
        if (!caller) return;
        for (var i: number = 0, n: number = this._handlers.length; i < n; i++) {
            var handler: TimerHandler = this._handlers[i];
            if (handler.caller === caller) {
                handler.clear();
            }
        }
    }

    /**
     * 根据提供的键获取对应的定时器处理器。
     * @param handlerKey - 定时器处理器的唯一标识键。
     * @returns 返回与键关联的定时器处理器。
     */
    protected getHandlerByKey(handlerKey: string): TimerHandler {
        return this._map[handlerKey];
    }

    /** @private */
    private _getHandler(caller: any, method: any): TimerHandler {
        var cid: number = caller ? caller.$_GID || (caller.$_GID = Utils.getGID()) : 0;
        var mid: number = method.$_TID || (method.$_TID = Timer._mid++);
        var key: any = cid + "_" + mid;
        return this._map[key];
    }


    /**
     * 暂停时钟
     */
    pause(): void {
        this._isPlaying = false;
    }

    /**
     * 恢复时钟
     */
    resume(): void {
        this._isPlaying = true;
    }

    set scale(s: number) {
        this._scale = s;
    }

    get scale(): number {
        return this._isPlaying ? this._scale : 0;
    }
}


/** @private */
export class TimerHandler {
    key: string;
    repeat: boolean;
    delay: number;
    userFrame: boolean;
    exeTime: number;
    caller: any
    method: Function;
    args: any[];
    jumpFrame: boolean;

    clear(): void {
        this.caller = null;
        this.method = null;
        this.args = null;
    }

    run(withClear: boolean): void {
        var caller: any = this.caller;
        if (caller && caller.destroyed) return this.clear();
        var method: Function = this.method;
        var args: any[] = this.args;
        withClear && this.clear();
        if (method == null) return;
        args ? method.apply(caller, args) : method.call(caller);
    }
}
