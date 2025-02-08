import * as fgui from "fairygui-cc";
import { UIView } from "../../../core/mvc/view/UIView";
import GIns from "../../../game/GIns";
import { native } from "cc";
import { HotUpdateManager } from "../../../main/modules/hotUpdate/model/HotUpdateManager";
import { bindScript } from "../../../core/comm/UIScriptManager";
import { UIGmKeys } from "../../const/UIGmKeys";
import { HttpRequest } from "../../../core/net/HttpRequest";
import G from "../../../core/comm/G";


/**
 * GM 修改热更新地址
 */
@bindScript(UIGmKeys.SetHotUpdateView)
export class SetHotUpdateView extends UIView {

    static pkgName: string = "gm";

    static viewName: string = "SetHotUpdateView";

    private _http: HttpRequest = new HttpRequest();

    private _assetsMgr: native.AssetsManager = null!;

    private _addr: string;

    private _dir = "/android/hot/";

    private _storagePath: string;

    private _saveData: object;

    private get view(): ui.gm.hotUpdate.SetHotUpdateView {
        return this._view as any;
    }

    protected onInit() {
        this.view.closeBtn.onClick(this.onCloseClick, this);
        this.view.saveBtn.onClick(this.onSaveClick, this);
        this.view.reloadBtn.onClick(this.onReloadClick, this);

        //@ts-ignore
        this._assetsMgr = HotUpdateManager.ins().assetsMgr;

        if (this._assetsMgr) {
            var localManifest = this._assetsMgr.getLocalManifest();
            let addr = localManifest.getPackageUrl();
            this._addr = addr.replace(this._dir, "");
            this.view.inputNameTxt.text = this._addr;

            //@ts-ignore
            this._storagePath = HotUpdateManager.ins().storagePath;
        }
    }

    protected onOpen(): void {
        //let isInBlock = UnitCollisionsManager.ins().isInBlock();
        //this.updatePosTxt();

        if (!this._assetsMgr) {
            this.view.inputNameTxt.text = "不支持热更新";
        }
    }

    private onSaveClick() {
        //不支持热更新
        if (!this._assetsMgr) {
            GIns.floatingTextMgr.showTips("不支持热更新！！");
            return;
        }

        let addr = this.view.inputNameTxt.text.trim();
        if (!addr.startsWith("http://") && !addr.startsWith("https://")) {
            addr = "http://" + addr;
        }

        if (addr.endsWith("/")) {
            addr = addr.substring(0, addr.length - 1);
        }

        console.log("热更新地址：" + addr);

        let str = native?.fileUtils?.getStringFromFile("project.manifest");
        if (!str) {
            GIns.floatingTextMgr.showTips("热更新文件不存在！！");
            return;
        }
        let data = JSON.parse(str);

        data.packageUrl = data.packageUrl.replace(this._addr, addr);
        data.remoteManifestUrl = data.remoteManifestUrl.replace(this._addr, addr);
        data.remoteVersionUrl = data.remoteVersionUrl.replace(this._addr, addr);

        this._saveData = data;

        this._http.get(data.remoteManifestUrl, this.save.bind(this), () => {
            GIns.floatingTextMgr.showTips("错误的地址！！！");
        });
    }

    private save(data: any) {
        if (!data?.packageUrl) {
            GIns.floatingTextMgr.showTips("错误的地址！！！");
            return;
        }

        if (!this._saveData) {
            return;
        }
        native?.fileUtils?.writeStringToFile(JSON.stringify(this._saveData), this._storagePath + "/project.manifest");

        GIns.floatingTextMgr.showTips("保存成功，重启后生效！！！");
    }

    private onReloadClick() {
        G.reload();
    }

    private onCloseClick() {
        this.closeSelf();
    }



}