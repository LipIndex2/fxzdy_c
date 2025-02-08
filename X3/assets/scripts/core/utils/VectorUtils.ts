import { Vec2, Vec3 } from "cc";

export class VectorUtils {

    static v3Tov2(v3: Vec3): Vec2 {
        return new Vec2(v3.x, v3.y);
    }

    static v2Tov3(v2: Vec2, z: number = 0): Vec3 {
        return new Vec3(v2.x, v2.y, z)
    }

}