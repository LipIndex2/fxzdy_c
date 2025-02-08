import { tween, UITransform, v3, Vec3 } from 'cc';
import * as fgui from "fairygui-cc";
import G from "db://assets/scripts/core/comm/G";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import FGUICocosNodeComponent from '../../../../core/fgui/com/FGUICocosNodeComponent';

/**
 * 指向目标的 ↓ 箭头组件参数
 */
export interface TargetDownArrowComponentOpenArgs {
    // 目标的世界坐标
    mapPosition: { x: number, y: number };
    // 延迟多久才显示
    delaySecond: number;
}

/**
 * 指向目标的下箭头
 */
export class TargetDownArrowComponent extends FGUICocosNodeComponent implements INotification {
    private _tweenAnim: import("cc").Tween<import("cc").Node>;

    listenNotifications(): string[] | null {
        return [
            NotificationKey.TASK_GUIDE_END
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.TASK_GUIDE_END:
                this.close();
                break;
        }
    }


    static pkgName: string = "comm";

    static viewName: string = "TargetDownArrowComponent";

    private get view(): ui.comm.tips.TargetDownArrowComponent {
        return this as any;
    }


    public onInit(): void {
        G.FacadeManager.registerNotification(this)
    }

    onPreDispose(): void {
        G.FacadeManager.removeNotification(this);
        this._tweenAnim.stop();
        super.onPreDispose();
    }

    close() {
        this.dispose();
    }

    // 当打开时
    onOpen(args: TargetDownArrowComponentOpenArgs) {
        const mapPosition = args.mapPosition;
        if (mapPosition) {
            const ui = this.node.getComponent(UITransform);
            const offsetX = ui.width;
            const offsetY = ui.height;
            this.node.setPosition(mapPosition.x - offsetX / 2, mapPosition.y + offsetY);
        }

        // 箭头漂浮
        this._tweenAnim = tween(this.node)
            .sequence(
                tween().by(0.5, { position: v3(0, 20, 0) }, { easing: 'smooth' }),
                tween().by(0.5, { position: v3(0, -20, 0) }, { easing: 'smooth' })
            )
            .repeatForever()
            .start()

    }
}