import { Vec2, Vec3 } from "cc";

export class Vec3Extension {
}


declare module "cc" {
    interface Vec3 {


        toVec2(): Vec2

    }
}


Vec3.prototype.toVec2 = function (): Vec2 {
    return new Vec2(this.x, this.y);
}
