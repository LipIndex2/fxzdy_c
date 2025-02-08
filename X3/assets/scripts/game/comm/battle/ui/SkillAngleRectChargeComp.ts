import { Vec2, Mask, Graphics } from "cc";
import { MathUtils } from "../../../../core/utils/MathUtils";
import { WorldManager } from "../../world/WorldManager";
import { SkillBehavior } from "../skill/SkillBehavior";
import { BattleChargeRectComp, SkillRectChargeComp } from "./SkillRectChargeComp";
import * as fgui from "fairygui-cc";
import { Node } from "cc";

export class SkillAngleRectChargeComp extends SkillRectChargeComp {

    private angle: number = 0;
    public setData(behavior: SkillBehavior, pos: Vec2, arrow: boolean = false, param?: { w: number, h: number }): void {
        this.behavior = behavior;
        this.width = param?.w || this.behavior.cfg.rangeParam.width;
        this.height = param?.h || this.behavior.cfg.rangeParam.height;
        this.angle = +this.behavior.cfg.rangeParam.angle + (this.behavior.cfg.rangeParam.isLeft == 1 ? -90 : 90)
        let p = MathUtils.getCoordinates(this.angle, this.width) as Vec2
        p.x += pos.x
        p.y += pos.y
        this.centerPoint = p;
        this.chargeComp = fgui.UIPackage.createObject("commBattle", "BattleChargeRectComp") as BattleChargeRectComp;
        WorldManager.ins().shadowLayer.addChild(this.chargeComp.node);
        this.chargeComp.view.img.height = this.width * 4
        this.chargeComp.view.img.width = this.height;
        this.chargeComp.x = p.x;
        this.chargeComp.y = -p.y;

        this.chargeComp.node.angle = +this.behavior.cfg.rangeParam.angle;
        let mask = this.chargeComp.node.addComponent(Mask);
        mask.type = Mask.Type.GRAPHICS_STENCIL;
        this.graphics = mask.node.getComponent(Graphics)
        this.graphicsSp = new Node()
        WorldManager.ins().shadowLayer.addChild(this.graphicsSp)
        this.frameGraphics = this.graphicsSp.addComponent(Graphics);
        this.draw(this.frameGraphics, this.centerPoint.x, this.centerPoint.y, false, this.width * 0.5, this.height)
        this.update(0);
    }

    protected draw(g: Graphics, x: number, y: number, isFill: boolean = false, width: number, height: number, notAngle: boolean = false): void {

        var vectorRadian: number = 0;
        if (!notAngle) {
            vectorRadian = -MathUtils.angle2Radians(+this.behavior.cfg.rangeParam.angle);
        }

        var rectWidth: number = width * 2
        var rectHeight: number = height

        let p1: Vec2 = new Vec2(Math.sin(vectorRadian) * rectWidth + x, Math.cos(vectorRadian) * rectWidth + y);
        let p4: Vec2 = new Vec2(Math.sin(vectorRadian) * -rectWidth + x, Math.cos(vectorRadian) * -rectWidth + y);
        let p2: Vec2 = new Vec2(p1.x + Math.cos(-vectorRadian) * rectHeight, p1.y + Math.sin(-vectorRadian) * rectHeight);
        let p3: Vec2 = new Vec2(p4.x + Math.cos(-vectorRadian) * rectHeight, p4.y + Math.sin(-vectorRadian) * rectHeight);


        g.clear()
        g.lineWidth = 8;
        g.strokeColor.fromHEX('#ff0000')
        g.moveTo(p1.x, p1.y);
        g.lineTo(p2.x, p2.y);
        g.lineTo(p3.x, p3.y);
        g.lineTo(p4.x, p4.y);
        g.lineTo(p1.x, p1.y);
        g.stroke();
        if (isFill)
            g.fill()
    }
}