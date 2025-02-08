import { MapManager } from "../MapManager";
import { RectQuadtree } from "../../comm/math/RectQuadtree";
import { Rect } from "cc";
import { Vec2 } from "cc";
import { ITriggerObject } from "../IMapObject";
import { TriggerUnit } from "./TriggerUnit";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import NotificationKey from "../../event/NotificationKey";
import { TableManager } from "../../../core/table/TableManager";
import { MathUtils } from "../../../core/utils/MathUtils";
import GIns from "../../GIns";


/**区域触发器 */
export default class AreaTriggersManager extends BaseController {
    /**触发器四叉树 */
    private _triggerTree: RectQuadtree<TriggerUnit>;
    private _found: TriggerUnit[] = [];
    /**正在触发的触发器 (用于处理离开触发器 目前没有需求)*/
    private _inTriggerMap: Map<number, TriggerUnit> = new Map();
    /**当前地图是否有触发器 */
    private _hasTrigger: boolean;


    listenNotifications(): string[] {
        return [
            NotificationKey.ENTER_WORLD_RESOUCRE_REFRESH,
            NotificationKey.MAP_TEAN_POS_UPDATE
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ENTER_WORLD_RESOUCRE_REFRESH:
                this.init(); //初始化触发器
                break;
            case NotificationKey.MAP_TEAN_POS_UPDATE:
                if (this._hasTrigger) {
                    this.checkTriggers(MathUtils.tempVec2(args.x, args.y));
                }
                break;
        }
    }

    init() {
        this._inTriggerMap.clear();
        this._hasTrigger = false;

        let mapSize = MapManager.ins().getMapSize();
        let objects = MapManager.ins().getTriggerObjects();
        if (mapSize && objects?.length) {
            this._triggerTree = new RectQuadtree(new Rect(0, 0, mapSize.width, mapSize.height), null, 2);
            for (let i = objects.length - 1; i >= 0; i--) {
                let data = objects[i];

                let unit = TriggerUnit.createUnit(data);
                unit.triggerId = data.triggerId;

                let cfg = TableManager.getDataById(table.map.TriggerConfig, data.triggerId);
                if (cfg && (cfg.inEvent || cfg.outEvent)) {
                    //如果没有配置将不会触发事件
                    unit.cfg = cfg;
                }
                /**没有表也可以触发 @see isOutside @see isInside*/
                this._triggerTree.insert(unit);
            }
            this._hasTrigger = true;
        }
    }

    /**点所在的触发器 */
    inAreas(pos: Vec2): TriggerUnit[] {
        this._found.length = 0;
        if (this._hasTrigger) {
            let found: TriggerUnit[] = [];
            this._triggerTree?.queryByPoint(pos, found);

            for (let i = found.length - 1; i >= 0; i--) {
                if (found[i].isInside(pos)) {
                    this._found.push(found[i]);
                }
            }
        }

        return this._found;
    }

    /**点是否指定触发器内 */
    isInside(triggerId: number, pos: Vec2) {
        let units = this.inAreas(pos);
        for (let i = units.length - 1; i >= 0; i--) {
            const trigger = units[i];
            if (trigger.triggerId === triggerId) {
                return true;
            }
        }
        return false;
    }

    /**是否不在指定触发器内 */
    isOutside(triggerId: number, pos: Vec2) {
        return !this.isInside(triggerId, pos);
    }

    /**检测触发器 */
    private checkTriggers(pos: Vec2) {
        let found = this.inAreas(pos);

        if (!found.length && !this._inTriggerMap.size) {
            return;
        }

        let curMap = this._inTriggerMap;
        //离开范围内
        curMap.forEach(trigger => {
            if (found.indexOf(trigger) == -1) {
                curMap.delete(trigger.triggerId);
                if (trigger.isCanTrigger) {
                    if (trigger.triggerOutEvent) {
                        trigger.triggeredCount++;
                        this.emit(trigger.triggerOutEvent, trigger.eventOutParam);
                    }
                }
            }
        });

        for (let i = 0; i < found.length; i++) {
            const trigger = found[i];
            if (trigger.isCanTrigger && !curMap.has(trigger.triggerId)) {
                curMap.set(trigger.triggerId, trigger);
                if (trigger.triggerInEvent) {
                    trigger.triggeredCount++;
                    this.emit(trigger.triggerInEvent, trigger.eventInParam);
                }
            }
        }

        // curMap.clear();
        // for (let i = 0; i < found.length; i++) {
        //     curMap.set(found[i].triggerId, found[i]);
        // }
    }
}

AreaTriggersManager.ins().doInit();

