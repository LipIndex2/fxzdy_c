import BaseSingleton from "../../../core/base/BaseSingleton";
import { AttrNode } from "./AttrNode";

/** 属性 */
export class AttrMgr extends BaseSingleton {
    private nodeList: AttrNode[] = [];

    public create(): void {

    }
}