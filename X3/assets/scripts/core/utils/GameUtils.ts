import { Game, game, sys } from "cc";

/**
 * 游戏工具
 */
export class GameUtils {

    private static _exitCallbackSet: Set<Function> = new Set();
    private static _isInit: boolean = false;

    /**
     * 当游戏退出的时候
     * @param callback
     */
    static onGameExit(callback: Function) {
        if (!callback) {
            return;
        }
        if (!sys.isNative) {
            return;
        }
        this._exitCallbackSet.add(callback);

        this._initLazy();
    }
    
    static restartGame() {
        game.restart();
    }

    private static _initLazy() {
        if (this._isInit) {
            return;
        }
        this._isInit = true;

        if (
            sys.platform === sys.Platform.ANDROID
            || sys.platform === sys.Platform.IOS
        ) {
            // 监听 Android 的返回键
            game.on(Game.EVENT_SHOW, () => {
                this._exitCallbackSet.forEach(callback => callback());
            });
        }

        // hide
        game.on(Game.EVENT_HIDE, () => {
            this._exitCallbackSet.forEach(callback => callback());
        });
        // close
        game.on(Game.EVENT_CLOSE, () => {
            this._exitCallbackSet.forEach(callback => callback());
        });

        // 浏览器的刷新或关闭事件监听
        if (sys.isBrowser) {
            window.addEventListener('beforeunload', (event) => {
                this._exitCallbackSet.forEach(callback => callback());
            });
            window.addEventListener('unload', (event) => {
                this._exitCallbackSet.forEach(callback => callback());
            });
        }
    }
}
