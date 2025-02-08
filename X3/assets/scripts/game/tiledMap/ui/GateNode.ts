import * as fgui from "fairygui-cc";
import { SpineUnitNode } from "../../comm/battle/node/SpineUnitNode";
import { PoolManager } from "../../../core/pool/PoolManager";
import { WorldManager } from "../../comm/world/WorldManager";
import { IGateObject, IMapObject } from "../IMapObject";
import { MapUnlockItem } from "./MapUnlockItem";
import { MapManager } from "../MapManager";
import { GameTimer } from "../../../core/timer/GameTimer";
import { sp } from "cc";
import { AudioManager } from "../../comm/mgr/AudioManager";
import { ItemExchangeConfirmView } from "../../modules/item/view/confirm/ItemExchangeConfirmView";
import { IRect } from "../../comm/math/ICollision";
import { math } from "cc";
import { Rect } from "cc";
import FGUICocosNodeComponent from "../../../core/fgui/com/FGUICocosNodeComponent";

enum AnimKey {
    lock = 1,
    unlocking = 2,
    unlocked = 3,
}

/** 地图建筑节点 */
export class GateNode extends FGUICocosNodeComponent {
    static pkgName: string = "comm";
    static viewName: string = "GateNode";
    static offsetY = 0;

    static create() {
        return fgui.UIPackage.createObject(this.pkgName, this.viewName) as GateNode;
    }

    public _rect = new Rect()
    public mapObject: IGateObject;
    public cfg: table.map.BuildingGateConfig;

    protected _spineNode: SpineUnitNode;

    protected _isUnlock: boolean;

    private get view(): ui.comm.building.GateNode {
        return this as any;
    }

    get buildingId() {
        return this.mapObject?.building_id;
    }

    isNeedFocus() {
        return !!this.cfg?.unlockingFocusTime;
    }

    isInBg() {
        return this.cfg?.isPlane || this._isUnlock;
    }

    /**debug用到 */
    onInit() {
    }

    setData(cfg: table.map.BuildingGateConfig, mapObject: IGateObject) {
        this.cfg = cfg;
        this._isUnlock = MapManager.ins().getBuildingUnlockById(mapObject.building_id);
        this.mapObject = mapObject;
        this.node.setPosition(mapObject.x, mapObject.y);
        let r = 200;
        if (cfg.isPlane) {
            r = 400;
        }
        // this._rect.set(mapObject.x - r, mapObject.y - r, r * 2, r * 2);//渲染范围使用
        this.node._uiProps.uiTransformComp.setContentSize(r * 2, r * 2);
        // if (cfg.building_model) {
        //     this.setSpine(cfg.building_model);
        // }
    }

    // get rect(): Rect {
    //     return this._rect;
    // }

    setActive(active: boolean) {
        if (!this.node.isValid) {
            return;
        }

        if (active) {
            if (this.cfg.building_model) {
                this.setSpine(this.cfg.building_model);
            }
        } else {
            this._spineNode?.pause();
        }
    }


    setSpine(modelId: number) {
        if (!this._spineNode) {
            this._spineNode = PoolManager.getItem(SpineUnitNode);
            //this._spineNode.setCacheMode(sp.AnimationCacheMode.REALTIME);
            this._spineNode.loadByModelId(modelId);
            //this._spineNode.setPosition(0, 0);
            this.node.addChild(this._spineNode);
            this._spineNode.setDirction(this.mapObject.filp ? -1 : 1);
        }

        this.playAnim(this._isUnlock ? AnimKey.unlocked : AnimKey.lock);
    }

    private doPlayTransition(transitionName: string, loopName: string) {
        let hasTransition = false;
        if (transitionName) {
            this._spineNode.play(transitionName, false);
            hasTransition = true;
        }

        if (loopName) {
            if (hasTransition) {
                this._spineNode.setNextPlay(loopName, false);
            } else {
                this._spineNode.play(loopName, false);
            }
        }
    }

    private doPlayAnim(loopName: string) {
        if (loopName) {
            this._spineNode.play(loopName, false);
        }
    }

    playAnim(type: AnimKey) {
        if (!this._spineNode) return;

        switch (type) {
            case AnimKey.lock:
                this.doPlayAnim(this.cfg.lock);
                break;
            case AnimKey.unlocking:
                this.doPlayTransition(this.cfg.unlocking, this.cfg.unlocked);
                break;
            case AnimKey.unlocked:
                this.doPlayAnim(this.cfg.unlocked);
                break;
        }
    }

    unlock() {
        this._isUnlock = true;
        if (!this._spineNode) return;
        if (this.mapObject.delay > 0) {
            GameTimer.ins().once(this.mapObject.delay, this, () => {
                this.playAnim(AnimKey.unlocking);
            });
        } else {
            this.playAnim(AnimKey.unlocking);
        }

        this._spineNode?.setCompleteListener((animName) => {
            if (this.cfg.unlocked == animName) {
                if (!this.cfg.isPlane) {
                    GameTimer.ins().callLater(this, () => {
                        this.node.removeFromParent();
                        WorldManager.ins().bgLayer.addChild(this.node);
                    })
                }
            }
        });
        if (this.cfg.sound)
            AudioManager.ins().playSoundDelay(this.cfg.sound.delay || 0, this.cfg.sound.url)
    }

    dispose() {
        super.dispose();
        GameTimer.ins().clearAll(this);
    }
}