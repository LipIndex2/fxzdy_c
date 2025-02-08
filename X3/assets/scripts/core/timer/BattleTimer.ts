import { Game, game, sys } from "cc";
import { Timer } from "./Timer";
import { System } from "cc";

/**
 * 专门用于战斗的帧循环管理器
 */
export default class BattleTimer extends Timer {
    private static _ins: BattleTimer;

    protected _priority = System.Priority.HIGH;

    /***多少心跳帧跑一次 */
    public static battleTickFrame: number = 2;

    /***每秒计算基准帧率 */
    private _battleCalFrameRate: number = 60;

    /***每秒多少次战斗逻辑处理次数 */
    private _perSecondTimes: number = 30;

    /**逻辑定时器key */
    protected _logicTimerKey: string;

    static ins(): BattleTimer {
        if (!this._ins) {
            this._ins = new BattleTimer();
        }
        return this._ins;
    }

    /**
     * 创建 <code>BattleTimer</code> 类的一个实例。
     */
    constructor() {
        super();
        game.on(Game.EVENT_SHOW, this.stageShow, this);
        game.on(Game.EVENT_HIDE, this.stageHide, this);
        this.initFrame();
    }

    setFrameRate(fps: number) {
        game.frameRate = fps;
        if (this._logicTimerKey) {
            let timer = this.getHandlerByKey(this._logicTimerKey);
            if (timer) {
                timer.delay = Math.ceil(fps / this._perSecondTimes);
            }
        }
    }

    getLogicStep(): number {
        let fps = Number(game.frameRate);
        return Math.ceil(fps / this._perSecondTimes);
    }

    initFrame() {
        BattleTimer.battleTickFrame = this._battleCalFrameRate / this._perSecondTimes; //逻辑帧固定30
    }

    private stageHide(): void {
        if (!sys.isBrowser) {
            //this._stageShow = false;
            this.pause();
        }
    }

    private stageShow(): void {
        this.resume();
    }

    get deltaSecond(): number {
        return this.delta * 0.001;
    }

    /**
     * 只能注册一个！！
     * 请勿滥用
     * 逻辑循环方法，用于以固定时间间隔调用指定的方法。
     * @param caller 调用者对象。
     * @param method 需要定时调用的方法。
     */
    public logicLoop(caller: any, method: Function): void {
        let step = this.getLogicStep();
        this._logicTimerKey = this.frameLoop(step, caller, method);
    }
}