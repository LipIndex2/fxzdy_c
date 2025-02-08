import { assetManager } from "cc";
import * as fgui from "fairygui-cc";
//import { Logger } from "../log/Logger";
import { key2URL } from "../res/ResURL";
import { Resource } from "../res/Resource";

export class FGUIPkgResource extends Resource {
    public forever: boolean = true;

    destroy(): void {
        let url = key2URL(this.url2key);
        if (typeof url != 'string') {
            fgui.UIPackage.removePackage(url.url);
            let bundle = assetManager.getBundle(url.bundle);
            let asset = bundle.get(url.url);
            assetManager.releaseAsset(asset);
            //Logger.logBusiness(`销毁:FGUIPackage->${url.bundle} ${url.url}`);
        } else {
            throw new Error("未处理的FGUIPackage销毁");
        }
        super.destroy();
    }
}

window["assetManager"] = assetManager;