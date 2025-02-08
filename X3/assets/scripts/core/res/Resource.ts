import { Asset } from "cc";
import { IResource } from "./IResource";
import { IResRef } from "./IResRef";
import { assetManager } from "cc";
import { Logger } from "../log/Logger";

export class Resource implements IResource {
    public url2key: string = "";

    public lastOpTime: number = 0;

    /**用不释放 */
    public forever = false;
    /**
     * @internal
     */
    private _refs: IResRef[] = [];
    private _content: any = null;

    constructor() {

    }

    reset(): void {

    }

    set content(value: any) {
        if (this._content) {
            throw new Error("不可修改资源！");
        }

        this._content = value;
        if (this._content instanceof Asset) {
            //防止自动回收
            this._content.addRef();
        }
    }

    get content(): any {
        return this._content;
    }

    addRef(ref?: IResRef) {
        let index: number = this._refs.indexOf(ref);
        if (index < 0) {
            this._refs.push(ref);
        }
    }

    removeRef(ref: IResRef): void {
        let index: number = this._refs.indexOf(ref);
        if (index < 0) {
            console.error("未找到需要删除的引用！" + this.url2key);
            return;
        }
        this._refs.splice(index, 1);
        ref.destroy();
    }

    destroy(): void {
        if (this.refCount > 0 || this.refLength > 0) {
            console.error("销毁资源时引用数量不为0！" + this.url2key);
        }

        //自身引用计数
        if (this._content instanceof Asset) {
            this._content.decRef();
            if (this._content.refCount <= 0) {
                Logger.system("资源销毁=>" + this.url2key);
                assetManager.releaseAsset(this._content);
            }
        }
        this.url2key = "";
        this._refs.length = 0;
        this._content = null;
    }

    /**
     * 引用数量
     */
    private get refCount(): number {
        if (this._content instanceof Asset) {
            return this._content.refCount - 1;
        }
        return this._refs.length;
    }

    /**
     * 引用列表长度
     */
    get refLength(): number {
        return this._refs.length;
    }
}