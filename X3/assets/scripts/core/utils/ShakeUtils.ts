import * as fgui from "fairygui-cc";
import { GameTimer } from "../timer/GameTimer";
import { Vec2 } from "cc";
import { v2, Node } from "cc";
import { ObjectMap } from "../info/ObjectMap";

export class ShakeUtils {
    private static shakeMap: ObjectMap<string, { point: Vec2, method: Function, thisObj: any }>;
    static init(): void {
        if (!this.shakeMap)
            this.shakeMap = new ObjectMap<string, { point: Vec2, method: Function, thisObj: any }>;
    }


    /**
     * 震动
     * @param dis 震动对象
     * @param times 震动时间
     * @param offest 震动幅度
     * @param speed 震动速度
     * @param mode 震动模式，1上下，2左右，3上下左右
     * */
    public static shake(dis: Node, times: number = 2, offset: number = 4, speed: number = 32, mode: number = 3): void {
        if (!dis)
            return
        ShakeUtils.init()
        if (this.shakeMap.hasKey(dis.uuid)) return;

        this.stopShake(dis);
        var point: Vec2 = v2(dis.position.x, dis.position.y);
        var num: number = 0;
        var offsetXYArray: any[] = [0, 0];

        var shakeHandler: Function = function (): void {
            offsetXYArray[num % 2] = (num++) % 4 < 2 ? 0 : offset;
            if (num > (times * 4 + 1)) {
                GameTimer.ins().clear(this, shakeHandler)
                num = 0;
                this.stopShake(dis);
                this.shakeMap.remove(dis);
                return;
            }

            if (!dis?.isValid)
                return

            if (mode == 1) {
                dis.setPosition(dis.position.x, offsetXYArray[1] + point.y)
            }
            else if (mode == 2) {
                dis.setPosition(offsetXYArray[0] + point.x, dis.position.y)
            }
            else {
                dis.setPosition(offsetXYArray[0] + point.x, offsetXYArray[1] + point.y)
            }
        };

        GameTimer.ins().loop(speed, this, shakeHandler);
        shakeHandler();
        this.shakeMap.put(dis.uuid, { point: point, method: shakeHandler, thisObj: this });
    }

    public static stopShake(dis: Node): void {
        if (!this.shakeMap)
            return;
        if (!dis)
            return;
        var obj = this.shakeMap.get(dis.uuid);
        if (!obj) return;

        GameTimer.ins().clear(obj.thisObj, obj.method)
        if (dis.isValid)
            dis.setPosition(obj.point.x, obj.point.y)
        this.shakeMap.remove(dis.uuid);
    }
}