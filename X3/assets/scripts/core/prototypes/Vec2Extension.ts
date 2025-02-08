import { Vec2, Vec3 } from "cc";

export class Vec2Extension {
}


declare module "cc" {
    interface Vec2 {
        
        toVec3(z?: number): Vec3

    }
}


Vec2.prototype.toVec3 = function (z: number = 0): Vec3 {
    return new Vec3(this.x, this.y, z);
}
