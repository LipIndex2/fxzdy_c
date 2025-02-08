import { sys } from "cc";
import { LocalPlayerData, LocalSysData } from "./LocalData";
import { PlayerModel } from "../../modules/player/model/PlayerModel";
import { AccountModel } from "../../modules/account/model/AccountModel";

/**
 * 本地数据存储管理
 */
export default class LocalStorage {
    private static _initSysData;
    private static _localSysData;

    /*************************************  系统级  *************************************/
    private static initSysData() {
        if (this._initSysData) return

        this._initSysData = new LocalSysData();
        for (const key in this._initSysData) {
            let str = sys.localStorage.getItem(key);
            if (str) {
                let data = JSON.parse(str);
                if (data)
                    this._initSysData[key] = data;
            }

        }
    }

    private static initSys(): void {
        this._localSysData = new Proxy(this._initSysData, {
            get(target, key) {
                return target[key];
            },
            set(target, key, value) {
                Reflect.set(target, key, value);
                var str: string = JSON.stringify(target[key]);
                sys.localStorage.setItem(key as string, str);
                return true
            }
        })
    }

    /**系统数据 */
    public static get sys(): LocalSysData {
        if (!this._localSysData) {
            this.initSysData();
            this.initSys();
        }
        return this._localSysData
    }

    /*************************************  玩家级  *************************************/
    private static _initPlayerData;
    private static _localPlayerData;
    public static playerKey;

    private static initLocalData() {
        if (this._initPlayerData) return
        if (!this.playerKey) return;

        this._initPlayerData = new LocalPlayerData();

        for (const key in this._initPlayerData) {
            let str = sys.localStorage.getItem(this.playerKey + "_" + key);

            if (str) {
                let data = JSON.parse(str);
                if (data != null)
                    this._initPlayerData[key] = data;
            }
        }
    }

    private static initPlayer(): void {
        if (!this._initPlayerData) return;
        this._localPlayerData = new Proxy(this._initPlayerData, {
            get(target, key: string) {
                return target[key];
            },
            set(target, key: string, value) {
                Reflect.set(target, key, value);
                var str: string = JSON.stringify(target[key]);
                sys.localStorage.setItem(LocalStorage.playerKey + "_" + key, str);
                return true
            }
        })
    }

    /**玩家数据 */
    public static get player(): LocalPlayerData {
        if (!this._localPlayerData) {
            this.initLocalData();
            this.initPlayer();
        }
        return this._localPlayerData
    }

}

