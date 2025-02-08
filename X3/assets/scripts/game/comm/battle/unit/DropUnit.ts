import { Vec2, Node } from "cc";
import { BaseUnit } from "./BaseUnit";
import { ItemUtils } from "../../../modules/item/utils/ItemUtils";
import BattleShowFactory from "../factory/BattleShowFactory";
import { ActorUnitNode } from "../node/ActorUnitNode";
import * as fgui from "fairygui-cc";
import { WorldManager } from "../../world/WorldManager";
import { BattleManager } from "../BattleManager";
import { QualityUtils } from "../../../modules/common/quality/QualityUtils";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { HeroUnit } from "./battle/HeroUnit";
import { MathUtils } from "db://assets/scripts/core/utils/MathUtils";
import { v2 } from "cc";
import { BattleUtils } from "../BattleUtils";

export interface IDropUnitVo {
    name: string;
    iconPath: string
    quality: number;
}

export class DropUnit extends BaseUnit {
    protected vo: IDropUnitVo;
    private dir: number = 0;
    private dropEffect: ActorUnitNode;
    private icon: ui.commBattle.battleComp.BattleDropIcon;
    private nameIcon: ui.commBattle.battleComp.BattleDropNameComp;
    /***是否可以拾取 */
    public canGet: boolean = false
    /***是否拾取了 */
    public isGet: boolean = false;
    public _isActive: boolean = true;
    private isEffectPlayComplete: boolean = false;
    private getTargetUnit: HeroUnit;
    private moveItems: Node[] = [];

    init(cfg: IDropUnitVo, pos: Vec2, dir: number, delayDestroy: number = -1, canGet: boolean = false) {
        this.vo = cfg;
        this.dir = dir
        this.setPosXY(pos.x, pos.y)
        if (!this.icon)
            this.icon = fgui.UIPackage.createObject("commBattle", "BattleDropIcon") as ui.commBattle.battleComp.BattleDropIcon;
        this.nameIcon = fgui.UIPackage.createObject("commBattle", "BattleDropNameComp") as ui.commBattle.battleComp.BattleDropNameComp;
        this.nameIcon.nameLab.color = QualityUtils.getQualityColor(cfg.quality)
        this.nameIcon.nameLab.text = cfg.name;
        this.nameIcon.visible = false;
        this.icon.iconLoader.icon = cfg.iconPath
        this.icon.iconLoader.rotation = -90;
        this.canGet = canGet;
        this._isActive = true;
        this.createDropEffect();
        if (delayDestroy > 0)
            GameTimer.ins().once(delayDestroy, this, this.dispose)

        this.moveItems.push(this.icon.node)
        this.moveItems.push(this.nameIcon.node)
        this.moveItems.push(this.dropEffect)
    }

    private createDropEffect(): void {
        if (this.vo) {
            let modelId: number = ItemUtils.getDropModelByQuality(this.vo.quality)
            if (modelId) {
                this.dropEffect = BattleShowFactory.showEffectModel(modelId, this.pos, this.dir, false, true) as ActorUnitNode;
                let node = new Node()
                node.addChild(this.icon.node)
                this.dropEffect.setLoadCompleteListener(() => {
                    this.dropEffect.addScoket("root/p10/images/icon_10003", node)
                })
                this.dropEffect.setCompleteListener((aniName: string) => {
                    if (aniName == "unlocking") {
                        if (this.dropEffect.isValid) {
                            this.dropEffect.removeSocket("root/p10/images/icon_10003")
                            this.dropEffect.play("idle", true)
                            this.icon.y = -this.pos.y + 2;
                            if (this.dir == 1) {
                                this.icon.x = this.pos.x + 6
                                this.icon.rotation = 114
                            }
                            else {
                                this.icon.x = this.pos.x - 6
                                this.icon.rotation = 65
                            }
                            this.nameIcon.visible = true;
                            this.nameIcon.scaleX = this.dir;
                            this.icon.iconLoader.scaleX = this.dir * this.icon.iconLoader.scaleX
                            this.dropEffect.addChild(this.nameIcon.node)
                            WorldManager.ins().roleLayer.addChild(this.icon.node);
                            BattleManager.ins().mainScene.getBattleProcessor().sortDepth(true)
                            this.isEffectPlayComplete = true;
                        }
                    }
                });
                WorldManager.ins().roleLayer.addChild(this.dropEffect);
            }
        }
    }

    public getDropByHero(hero: HeroUnit): void {
        if (this.isEffectPlayComplete) {
            this.isGet = true;
            this.getTargetUnit = hero;
        }
    }

    /**移动向量 */
    protected _moveVec: Vec2 = v2();

    /**每毫秒移动速度 */
    get moveSpeed() {
        return 1;
    }

    update(): boolean {
        if (this.getTargetUnit) {
            let radians = MathUtils.getRadians(this._pos.x, this._pos.y, this.getTargetUnit.hurtPoint.x, this.getTargetUnit.hurtPoint.y);
            this._moveVec.set(this.moveSpeed * Math.cos(radians), this.moveSpeed * Math.sin(radians));

            let t = BattleUtils.frameDeltaMs;
            this.pos.add2f(this._moveVec.x * t, this._moveVec.y * t);
            this.checkTrigger();

            for (let i = 0; i < this.moveItems.length; i++) {
                this.moveItems[i].setPosition(this.pos.x, this.pos.y);
            }
        }
        return true
    }

    /**检测是否触发 */
    private checkTrigger() {
        let dis = MathUtils.distance(this.pos, this.getTargetUnit.hurtPoint)
        if (dis < (this.moveSpeed * BattleUtils.frameDeltaMs * 1.2)) {
            this._isActive = false;
        }
    }

    /**是否活跃单位 */
    get isActive() {
        return this._isActive;
    }

    /**销毁 */
    dispose() {
        this._isActive = false;
        if (!this.isDisposed) {
            this.moveItems.length = 0;
            GameTimer.ins().clearAll(this)
            if (this.icon && this.icon.node && this.icon.node.parent)
                this.icon.node.removeFromParent()
            this.icon = null
            if (this.dropEffect?.isValid) {
                this.dropEffect.destroy(); //先销毁
            }
            super.dispose()
        }
    }
}