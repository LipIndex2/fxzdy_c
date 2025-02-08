import { error, log, native, sys } from "cc";
import LoginNotificationKey from "../../LoginNotificationKey";
import { game } from "cc";
import { UIHotUpdateKey } from "../const/UIHotUpdateConfig";
import BaseSingleton from "../../../../core/base/BaseSingleton";
import { Handler } from "../../../../core/utils/Handler";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import { UIManager } from "../../../../core/mvc/UIManager";
import { StartGameEvent, UploadEventManager } from "../../../../core/sdk/UploadEventManager";
import { DEBUG } from "cc/env";
import { UILoginKey } from "../../login/const/UILoginConfig";
import G from "../../../../core/comm/G";
import { Logger } from "../../../../core/log/Logger";

/** 热更参数 */
export class HotOptions {
    /** 获取到版本号信息 */
    onVersionInfo: Function | null = null;
    /** 更新失败 */
    onUpdateFailed: Function | null = null;
    /** 更新完成 */
    onUpdateSucceed: Function | null = null;

    /**无更新 */
    onNoUpdate: Function | null = null;

    check() {
        for (let key in this) {
            if (key !== 'check') {
                if (!this[key]) {
                    log(`参数HotOptions.${key}未设置！`);
                    return false;
                }
            }
        }
        return true
    }
}

/**热更新状态 */
export enum HotUpdateState {
    None = 0,
    Check,
    Update,
}


/** 热更管理 */
export class HotUpdateManager extends BaseSingleton {
    private assetsMgr: native.AssetsManager = null!;
    private options: HotOptions | null = null;
    private state = HotUpdateState.None;
    private storagePath: string = "";
    private manifest: string = "";
    private _localVersion: string = '';
    private _serverVersion: string = '';

    /** 热更初始化 */
    init(option: HotOptions) {

        UploadEventManager.ins().startGame(StartGameEvent.HotupdateCheck);

        this.options = option;
        if (!sys.isNative || !!this.assetsMgr) {
            this.options.onNoUpdate && this.options.onNoUpdate();
            return;
        }

        this.showSearchPath();

        this.manifest = native.fileUtils.fullPathForFilename("project.manifest");

        if (!this.manifest) {
            console.error("【热更新】缺少热更新配置文件");
            this.options.onNoUpdate && this.options.onNoUpdate();
            return;
        }


        console.info("【热更新】热更新配置文件加载成功");

        //let res = ref.content;
        //this.manifest = res.nativeUrl;
        this.storagePath = ((native.fileUtils ? native.fileUtils.getWritablePath() : '/') + 'hot');
        this.assetsMgr = new native.AssetsManager(this.manifest, this.storagePath, (versionA, versionB) => {
            //console.log("【热更新】客户端版本: " + versionA + ', 当前最新版本: ' + versionB);
            this._localVersion = versionA;
            this._serverVersion = versionB;
            this.options?.onVersionInfo && this.options.onVersionInfo({ local: versionA, server: versionB });

            // let vA = versionA.split('.');
            // let vB = versionB.split('.');
            // for (let i = 0; i < vA.length; ++i) {
            //     let a = parseInt(vA[i]);
            //     let b = parseInt(vB[i] || '0');
            //     if (a !== b) {
            //         return a - b;
            //     }
            // }

            // if (vB.length > vA.length) {
            //     return -1;
            // }
            // else {
            //     return 0;
            // }
            return versionA === versionB ? 0 : -1;//只要版本不同就可以更新，支持回退版本
        });

        // 设置验证回调，如果验证通过，则返回true，否则返回false
        this.assetsMgr.setVerifyCallback((path: string, asset: jsb.ManifestAsset) => {
            // 压缩资源时，我们不需要检查其md5，因为zip文件已被删除
            var compressed = asset.compressed;
            // 检索正确的md5值
            var expectedMD5 = asset.md5;
            // 资源路径是相对路径，路径是绝对路径
            var relativePath = asset.path;
            // 资源文件的大小，但此值可能不存在
            var size = asset.size;

            return true;
        });

        var localManifest = this.assetsMgr.getLocalManifest();
        window["_hotVersion"] = localManifest.getVersion();
        this.printUrl();

        this.checkUpdate();
        //})

    }

    /** 删除热更所有存储文件 */
    clearHotUpdateStorage() {
        native.fileUtils.removeDirectory(this.storagePath);
    }

    // 检查更新
    checkUpdate() {
        if (this.assetsMgr.getState() === native.AssetsManager.State.UNINITED) {
            error('【热更新】未初始化')
            return;
        }
        if (!this.assetsMgr.getLocalManifest().isLoaded()) {
            //console.log('【热更新】加载本地 manifest 失败 ...');
            return;
        }
        this.assetsMgr.setEventCallback(this.onHotUpdateCallBack.bind(this));
        this.state = HotUpdateState.Check;
        // 下载version.manifest，进行版本比对
        this.assetsMgr.checkUpdate();
    }

    /** 开始更热 */
    hotUpdate() {
        if (!this.assetsMgr) {
            //console.log('【热更新】请先初始化')
            return
        }

        UploadEventManager.ins().startGame(StartGameEvent.HotupdateStart);

        this.assetsMgr.setEventCallback(this.onHotUpdateCallBack.bind(this));
        this.state = HotUpdateState.Update;
        this.assetsMgr.update();
    }

    private onHotUpdateCallBack(event: native.EventAssetsManager) {
        let code = event.getEventCode();
        switch (code) {
            case native.EventAssetsManager.ALREADY_UP_TO_DATE:
                console.log("【热更新】当前版本与远程版本一致且无须更新");
                this.options.onNoUpdate && this.options.onNoUpdate();
                break;
            case native.EventAssetsManager.NEW_VERSION_FOUND:
                console.log('【热更新】发现新版本,请更新');
                // UIManager.ins().open(UIHotUpdateKey.HotUpdateWin);
                UIManager.ins().open(UILoginKey.LOGIN_PROGRESS_WIN, null, () => {
                    this.hotUpdate();
                });
                break;
            case native.EventAssetsManager.ASSET_UPDATED:
                //console.log('【热更新】资产更新');
                break;
            case native.EventAssetsManager.UPDATE_PROGRESSION:
                if (this.state === HotUpdateState.Update) {
                    // event.getPercent();
                    // event.getPercentByFile();
                    // event.getDownloadedFiles() + ' / ' + event.getTotalFiles();
                    // event.getDownloadedBytes() + ' / ' + event.getTotalBytes();
                    // //console.log('【热更新】更新中...', event.getDownloadedFiles(), event.getTotalFiles(), event.getPercent(), event.getAssetId());
                    if (!event.getPercent()) return;
                    FacadeManager.ins().emit(LoginNotificationKey.HOTUPDATE_PROGRESS, { percent: event.getPercent() * 100, totalBytes: event.getTotalBytes(), loadedBytes: event.getDownloadedBytes() });
                }
                break;
            case native.EventAssetsManager.UPDATE_FINISHED:
                this.onUpdateFinished();
                break;
            default:
                //console.log("hot update callback default");
                this.onUpdateFailed(event.getMessage());
                break;
        }
    }

    /**获取总资源大小 */
    public getTotalBytes() {
        if (!this.assetsMgr) return -1;
        return this.assetsMgr.getTotalBytes();
    }

    private onUpdateFailed(msg: any) {
        UploadEventManager.ins().startGame(StartGameEvent.HotupdateFailed);

        this.assetsMgr.setEventCallback(null!)

        Logger.net("【热更新】更新失败: " + msg);

        this.options?.onUpdateFailed && this.options.onUpdateFailed(msg);
    }

    private onUpdateFinished() {
        this.assetsMgr.setEventCallback(null!);
        // let searchPaths = native.fileUtils.getSearchPaths() || [];
        // let newPaths = this.assetsMgr.getLocalManifest().getSearchPaths() || [];
        // if (searchPaths.length <= 0) {
        //     Array.prototype.unshift.apply(searchPaths, newPaths);
        // } else {
        //     for (let i = newPaths.length - 1; i >= 0; i--) {
        //         let newPath = newPaths[i];
        //         let index = searchPaths.indexOf(newPath);
        //         //如果存在先删掉，再加到前面去，不能遍历删除（尝试过了，会导致更新完之后无法找到manifest文件，原因未知）
        //         //目前不会有问题的搜索路径是：
        //         //data/user/0/com.xxx.xxx/files/remote-asset/
        //         //@assets/assets/resources/native/aa/
        //         //data/user/0/com.xxx.xxx/files/remote-asset/
        //         // @assets/data/
        //         // @assets/Resources/
        //         // @assets/
        //         if (index === 0) {//如果在第一个位置先删掉，等下再加，保证永远之后一个在最前位置
        //             searchPaths.splice(index, 1);
        //         }
        //         searchPaths.unshift(newPath);
        //     }
        // }
        // localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
        // native.fileUtils.setSearchPaths(searchPaths);

        //console.log('【热更新】更新成功 !!');
        // this.options?.onUpdateSucceed && this.options.onUpdateSucceed();

        UploadEventManager.ins().startGame(StartGameEvent.HotupdateDone);

        this.restartGame();
    }

    private restartGame() {
        G.reload();
    }

    private showSearchPath() {
        if (DEBUG) {
            //console.log("========================搜索路径========================");
            let searchPaths = native.fileUtils.getSearchPaths();
            for (let i = 0; i < searchPaths.length; i++) {
                //console.log("[" + i + "]: " + searchPaths[i]);
            }
            //console.log("======================================================");
        }
    }

    private printUrl() {
        if (DEBUG) {
            var localManifest = this.assetsMgr.getLocalManifest();
            console.log('【热更新】热更资源存放路径: ' + this.storagePath);
            console.log('【热更新】本地资源配置路径: ' + this.manifest);
            console.log('【热更新】本地包地址: ' + localManifest.getPackageUrl());
            console.log('【热更新】远程 project.manifest 地址: ' + localManifest.getManifestFileUrl());
            console.log('【热更新】远程 version.manifest 地址: ' + localManifest.getVersionFileUrl());
        }
    }
}