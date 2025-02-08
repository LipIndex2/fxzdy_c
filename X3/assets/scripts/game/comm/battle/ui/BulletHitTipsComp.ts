import { TableManager } from "../../../../core/table/TableManager";
import { WorldManager } from "../../world/WorldManager";
import { BulletType } from "../enum/BattleEnum";
import { BaseShowUnit } from "../show/BaseShowUnit";
import { BehaviorRangeType } from "../skill/SkillEnum";
import { BulletUnit } from "../unit/bullet/BulletUnit";
import * as fgui from "fairygui-cc";

/***子弹落点提示器 */
export class BulletHitTipsComp {
    public unitData: BulletUnit;
    private areaImgs: ui.commBattle.battleComp.BattleChargeRectComp[] | ui.commBattle.battleComp.BattleChargeEllipseComp[] = []
    protected targetPos: { x: number, y: number }
    protected hitTips: { type: number, w?: number, h?: number, r?: number }

    public setHitTipsCompTargetPos(targetPos: { x: number, y: number }, angle: number = 0): void {
        this.targetPos = targetPos;
        this.updateAreaPos(angle)
    }

    /***绑定战斗数据 */
    public setUnitData(unitData: BulletUnit): void {
        this.unitData = unitData;
        this.hitTips = unitData.cfg.hitTips;
        if (this.unitData.cfg.behaviors) {
            for (let i = 0; i < this.unitData.cfg.behaviors.length; i++) {
                this.createAreaImg(this.unitData.cfg.behaviors[i])
            }
        }
    }

    protected createAreaImg(behaviorsId: string): void {
        let behaviorCfg = TableManager.getDataById(table.battle.BehaviorConfig, behaviorsId)
        let comp: ui.commBattle.battleComp.BattleChargeRectComp | ui.commBattle.battleComp.BattleChargeEllipseComp = null;

        if (this.hitTips.type == 1) {
            if (this.hitTips.w && this.hitTips.h) {
                comp = fgui.UIPackage.createObject("commBattle", "BattleChargeRectComp") as ui.commBattle.battleComp.BattleChargeRectComp;
                comp.img.height = this.hitTips.w * 2
                comp.img.width = this.hitTips.h;
            }
            else if (this.hitTips.r) {
                comp = fgui.UIPackage.createObject("commBattle", "BattleChargeEllipseComp") as ui.commBattle.battleComp.BattleChargeEllipseComp;
                comp.img.height = this.hitTips.r * 2;
                comp.img.width = this.hitTips.r * 2;
            }
        }
        else {
            if (this.unitData.cfg.type == BulletType.ConvoluteBullet) {
                //回旋子弹拿的是他的射程路径
                comp = fgui.UIPackage.createObject("commBattle", "BattleChargeRectComp") as ui.commBattle.battleComp.BattleChargeRectComp;
                comp.img.height = this.unitData.cfg.parameter.radius * 2
                comp.img.width = this.unitData.cfg.distance;
            }
            else if (behaviorCfg?.rangeType == BehaviorRangeType.SELF_CIRCLE) {
                comp = fgui.UIPackage.createObject("commBattle", "BattleChargeEllipseComp") as ui.commBattle.battleComp.BattleChargeEllipseComp;
                comp.img.height = behaviorCfg.rangeParam.radius * 2;
                comp.img.width = behaviorCfg.rangeParam.radius * 2;
            }
            else if (behaviorCfg?.rangeType == BehaviorRangeType.SELF_RECTANGLE) {
                comp = fgui.UIPackage.createObject("commBattle", "BattleChargeRectComp") as ui.commBattle.battleComp.BattleChargeRectComp;
                comp.img.height = behaviorCfg.rangeParam.width * 2
                comp.img.width = behaviorCfg.rangeParam.height;
            }
        }

        if (comp) {
            this.areaImgs.push(comp)
            WorldManager.ins().shadowLayer.addChild(comp.node);
        }

        this.updateAreaPos()
    }

    protected updateAreaPos(angle: number = 0): void {
        if (this.areaImgs?.length && this.targetPos) {
            for (let i = 0; i < this.areaImgs.length; i++) {
                if (this.areaImgs[i].node?.isValid) {
                    this.areaImgs[i].x = this.targetPos.x
                    this.areaImgs[i].y = -this.targetPos.y
                    this.areaImgs[i].node.angle = angle;
                }
            }
        }
    }

    /**销毁 */
    dispose() {
        if (this.areaImgs?.length) {
            for (let i = 0; i < this.areaImgs.length; i++) {
                this.areaImgs[i].dispose();
            }
            this.areaImgs.length = 0;
        }
        this.unitData = null;
    }
}

