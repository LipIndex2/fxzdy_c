import { Node, Sprite } from "cc";

export class Utils {
    /**@private */
    private static _gid: number = 1;

    /**获取一个全局唯一ID。*/
    static getGID(): number {
        return Utils._gid++;
    }

    static getGUID(): string {
        let guid: string = this.getGID().toString() + "-";
        for (let i = 1; i <= 32; i++) {
            let n = Math.floor(Math.random() * 16.0).toString(16);
            guid += n;
            if ((i == 8) || (i == 12) || (i == 16) || (i == 20))
                guid += "-";
        }
        return guid;
    }
}