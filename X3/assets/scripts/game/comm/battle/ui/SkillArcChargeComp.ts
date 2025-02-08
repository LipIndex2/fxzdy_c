import { Vec2 } from "cc";
import { SkillBehavior } from "../skill/SkillBehavior";
import { MathUtils } from "../../../../core/utils/MathUtils";
import { WorldManager } from "../../world/WorldManager";
import { Mask } from "cc";
import { Graphics } from "cc";
import * as fgui from "fairygui-cc";
import { SkillChargeComp } from "./SkillChargeComp";
import { Node } from "cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import FGUICocosNodeComponent from "../../../../core/fgui/com/FGUICocosNodeComponent";

@bindFguiExtension("ui://commBattle/BattleChargeEllipseComp")
export class BattleChargeEllipseComp extends FGUICocosNodeComponent {
    public get view(): ui.commBattle.battleComp.BattleChargeEllipseComp {
        return this as any;
    }
}


/***技能蓄力组件 */
export class SkillArcChargeComp extends SkillChargeComp {

    protected chargeComp: BattleChargeEllipseComp;
    protected radius: number;
    protected angle: number;
    /***偏移角度 */
    protected fixAngle: number = 0;

    public setData(behavior: SkillBehavior, pos: Vec2, arrow: boolean = false, param?: { r: number, a: number, fixAngle: number }): void {
        this.behavior = behavior;
        this.radius = param?.r || this.behavior.cfg.rangeParam.radius;
        this.fixAngle = param?.fixAngle || 0;
        this.angle = (param?.a || this.behavior.cfg.rangeParam?.angle || 0) + this.fixAngle;
        this.centerPoint = pos;
        this.chargeComp = fgui.UIPackage.createObject("commBattle", "BattleChargeEllipseComp") as BattleChargeEllipseComp;
        WorldManager.ins().shadowLayer.addChild(this.chargeComp.node);
        this.chargeComp.view.img.height = this.chargeComp.view.img.width = this.radius * 2;
        this.chargeComp.x = pos.x;
        this.chargeComp.y = -pos.y;

        let mask = this.chargeComp.node.addComponent(Mask);
        mask.type = Mask.Type.GRAPHICS_STENCIL;
        this.graphics = mask.node.getComponent(Graphics)
        this.graphicsSp = new Node()
        WorldManager.ins().shadowLayer.addChild(this.graphicsSp)
        this.frameGraphics = this.graphicsSp.addComponent(Graphics);
        this.draw(this.frameGraphics, this.centerPoint.x, this.centerPoint.y, false, this.radius)
        this.update(0);
    }

    protected draw(g: Graphics, x: number, y: number, isFill: boolean = false, radius: number): void {

        let dir = MathUtils.angle(this.centerPoint, this.behavior.skillTarget.pos);
        let angle = this.angle;

        g.clear()
        g.lineWidth = 8;
        g.strokeColor.fromHEX('#ff0000')
        g.moveTo(x, y);
        let beginAngle = dir - angle * 0.5
        let bendAngle = dir + angle * 0.5
        let endPoint = MathUtils.getEllipsePoint(beginAngle, radius, radius, x, y)
        g.lineTo(endPoint.x, endPoint.y);
        g.arc(x, y, radius, beginAngle * Math.PI / 180, bendAngle * Math.PI / 180, true)
        g.lineTo(x, y);
        g.stroke();
        if (isFill)
            g.fill()
    }

    /***更新进度 */
    public update(value: number): void {
        if (this.graphics) {
            let radius = Math.floor(this.radius * value)
            this.draw(this.graphics, 0, 0, true, radius)
        }
    }

    /**销毁 */
    public dispose() {
        if (this.chargeComp) {
            this.chargeComp.dispose()
        }
        super.dispose();
    }
}