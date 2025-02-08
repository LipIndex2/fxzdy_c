import { Graphics } from "cc";
import { SkillArcChargeComp } from "./SkillArcChargeComp";

/***技能蓄力组件 */
export class SkillEllipseChargeComp extends SkillArcChargeComp {

    protected draw(g: Graphics, x: number, y: number, isFill: boolean = false, radius: number): void {
        g.clear()
        g.lineWidth = 8;
        g.strokeColor.fromHEX('#ff0000')
        g.circle(x, y, radius)
        g.stroke();
        if (isFill)
            g.fill()
    }
}