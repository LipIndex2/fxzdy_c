import { Graphics } from "cc";
import { SkillChargeComp } from "./SkillChargeComp";
import { Vec2, Mask } from "cc";
import { MathUtils } from "../../../../core/utils/MathUtils";
import { WorldManager } from "../../world/WorldManager";
import { SkillBehavior } from "../skill/SkillBehavior";
import * as fgui from "fairygui-cc";
import { Node } from "cc";
import { TweenUtils } from "../../../../core/utils/TweenUtils";
import { GameTimer } from "../../../../core/timer/GameTimer";
import FGUICocosNodeComponent from "../../../../core/fgui/com/FGUICocosNodeComponent";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";

@bindFguiExtension("ui://commBattle/BattleChargeRectComp")
export class BattleChargeRectComp extends FGUICocosNodeComponent {
    public get view(): ui.commBattle.battleComp.BattleChargeRectComp {
        return this as any;
    }
}

/***技能蓄力组件 */
export class SkillRectChargeComp extends SkillChargeComp {
    protected arrowSp: Node
    protected arrowComps: ui.commBattle.battleComp.BattleChargeJianTou[];
    protected chargeComp: BattleChargeRectComp;
    protected width: number;
    protected height: number;
    /***偏移角度 */
    protected fixAngle: number = 0;

    public setData(behavior: SkillBehavior, pos: Vec2, arrow: boolean = false, param?: { w: number, h: number, fixAngle: number }): void {
        this.behavior = behavior;
        this.width = param?.w || this.behavior.cfg.rangeParam.width;
        this.height = param?.h || this.behavior.cfg.rangeParam.height;
        this.fixAngle = param?.fixAngle || 0;
        this.centerPoint = pos;
        this.chargeComp = fgui.UIPackage.createObject("commBattle", "BattleChargeRectComp") as BattleChargeRectComp;
        WorldManager.ins().shadowLayer.addChild(this.chargeComp.node);
        this.chargeComp.view.img.height = this.width * 2
        this.chargeComp.view.img.width = this.height;
        this.chargeComp.x = pos.x;
        this.chargeComp.y = -pos.y;

        let dir = MathUtils.angle(this.centerPoint, this.behavior.skillTarget.pos) + this.fixAngle;
        this.chargeComp.node.angle = dir;
        let mask = this.chargeComp.node.addComponent(Mask);
        mask.type = Mask.Type.GRAPHICS_STENCIL;
        this.graphics = mask.node.getComponent(Graphics)
        this.graphicsSp = new Node()
        WorldManager.ins().shadowLayer.addChild(this.graphicsSp)
        this.frameGraphics = this.graphicsSp.addComponent(Graphics);
        this.draw(this.frameGraphics, this.centerPoint.x, this.centerPoint.y, false, this.width * 0.5, this.height)
        this.update(0);

        if (arrow) {
            this.arrowSp = new Node()
            this.arrowSp.angle = dir;
            this.arrowSp.setPosition(pos.x, pos.y)
            WorldManager.ins().shadowLayer.addChild(this.arrowSp)
            this.arrowComps = [];
            //按100的大小计算
            let arrowNum = Math.ceil((this.chargeComp.view.img.width - 35) / 100);
            for (let i = 0; i < arrowNum; i++) {
                let arrowComp = fgui.UIPackage.createObject("commBattle", "BattleChargeJianTou") as ui.commBattle.battleComp.BattleChargeJianTou;
                this.arrowSp.addChild(arrowComp.node);
                arrowComp.x = 100 * i + 35;
                arrowComp.alpha = 0;
                GameTimer.ins().once(200 * i, this, () => {
                    TweenUtils.yoyoAlpha(arrowComp.node, 0.5, 255, 0);
                })
            }
        }
    }

    protected draw(g: Graphics, x: number, y: number, isFill: boolean = false, width: number, height: number, notAngle: boolean = false): void {

        var vectorRadian: number = 0;
        if (!notAngle) {
            let dir = MathUtils.angle(this.centerPoint, this.behavior.skillTarget.pos) + this.fixAngle;
            vectorRadian = -MathUtils.angle2Radians(dir);
        }

        var rectWidth: number = width
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

    /***更新进度 */
    public update(value: number): void {
        if (this.graphics) {
            let height = Math.floor(this.height * value)
            this.draw(this.graphics, 0, 0, true, this.width * 0.5, height, true)
        }
    }

    /**销毁 */
    public dispose() {
        if (this.chargeComp) {
            this.chargeComp.dispose()
        }
        if (this.arrowSp)
            this.arrowSp.destroy()
        if (this.arrowComps) {
            for (let i = 0; i < this.arrowComps.length; i++) {
                this.arrowComps[i].dispose()
            }
            this.arrowComps.length = 0;
        }
        GameTimer.ins().clearAll(this)
        super.dispose();
    }
}