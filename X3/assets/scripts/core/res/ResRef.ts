import { Asset } from "cc";
import { IResRef, ResRefType } from "./IResRef";
import { ResManager } from "./ResManager";
import { PoolManager } from "../pool/PoolManager";


export class ResRef implements IResRef {

    /**唯一KEY */
    url2key: string = "";
    /**引用KEY */
    refKey: string | undefined;

    /**资源内容*/
    content: any;

    /**是否已释放 */
    private _isDisposed: boolean = false;

    /**
     * 创建资源索引
     * @param content 资源内容
     * @param url2Key 资源key
     * @param refKey  引用key (没有引用key，则不修改其生命周期)
     * @returns 资源索引
     */
    static createRef(content: Asset | fgui.UIPackage, url2Key: string, refKey: string): ResRef {
        let ref: ResRef = PoolManager.getItem(ResRef);
        ref.url2key = url2Key;
        ref.refKey = refKey;
        ref.content = content;
        ref._isDisposed = false;
        ResManager.ins().addRef(ref);
        return ref;
    }

    get isDisposed(): boolean {
        return this._isDisposed;
    }

    /**释放 */
    dispose(): void {
        if (this._isDisposed) {
            console.error(this.url2key + "重复释放资源引用");
            return;
        }
        this._isDisposed = true;
        ResManager.ins().removeRef(this);
    }

    /**
     * 彻底销毁(注意内部接口，请勿调用)
     */
    destroy(): void {
        this.url2key = "";
        this.refKey = undefined;
        this.content = null;
        PoolManager.recovery(this);
    }
}