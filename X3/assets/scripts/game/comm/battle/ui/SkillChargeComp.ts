import { Vec2 } from "cc";
import { SkillBehavior } from "../skill/SkillBehavior";
import { Graphics } from "cc";
import { Node } from "cc";

/***技能蓄力组件 */
export class SkillChargeComp {

    protected behavior: SkillBehavior;
    protected centerPoint: Vec2;
    protected graphicsSp: Node
    protected graphics: Graphics;
    protected frameGraphics: Graphics
    public constructor () {

    }

    public setData(behavior: SkillBehavior, pos: Vec2, arrow: boolean = false, param?: any): void {
        this.behavior = behavior;
        this.centerPoint = pos;
    }

    protected draw(g: Graphics, x: number, y: number, isFill: boolean = false, ...arg): void {

    }

    /***更新进度 */
    public update(value: number): void {
    }

    /**销毁 */
    public dispose() {
        if (this.frameGraphics) {
            this.frameGraphics.clear()
            this.frameGraphics.destroy();
            this.frameGraphics = null;
        }

        if (this.graphics) {
            this.graphics.clear()
            this.graphics.destroy();
            this.graphics = null;
        }

        if (this.graphicsSp) {
            this.graphicsSp.destroy();
            this.graphicsSp = null;
        }
    }
}