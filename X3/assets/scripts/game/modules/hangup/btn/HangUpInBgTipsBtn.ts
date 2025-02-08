import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { HangUpUIKeys } from "db://assets/scripts/game/modules/hangup/HangUpUIKeys";
import { HangUpModel } from "db://assets/scripts/game/modules/hangup/model/HangUpModel";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { tween, Tween, v3 } from "cc";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import HangUpState = ServerEnums.HangUpState;
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";

@bindFguiExtension("ui://hangUp/HangUpInBgTipsBtn")
export class HangUpInBgTipsBtn extends FGUI.GButton implements INotification {

    private _array: FGUI.GTextField[] = [];
    private _tweenArray: Tween<any>[] = [];
    private _content: string = "托管推关中";
    private _oldLabelY: number = null;

    private get view(): ui.hangUp.btn.HangUpInBgTipsBtn {
        return this as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.HANG_UP_IN_BG_UPDATE,
            NotificationKey.HANG_UP_SET_IN_BG,
            NotificationKey.HANG_UP_IN_BG_PASS_NEW_LEVEL_ID
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.HANG_UP_IN_BG_UPDATE:
            case NotificationKey.HANG_UP_SET_IN_BG:
            case NotificationKey.HANG_UP_IN_BG_PASS_NEW_LEVEL_ID: {
                this.reset();
                break;
            }
        }
    }


    protected onConstruct() {
        super.onConstruct();

        FacadeManager.ins().registerNotification(this);

        this.view.charList.setVirtual();
        this.view.charList.itemRenderer = this.irChar.bind(this);
        this.view.charList.touchable = false;
        this._content = "托管推关中";
        this.view.charList.numItems = this._content.length;

        this.view.onClick(this.onClick0, this);

        // this._array = [
        //     this.view.labelContent1,
        //     this.view.labelContent2,
        //     this.view.labelContent3,
        //     this.view.labelContent4,
        //     this.view.labelContent5,
        // ];

        this.reset();
    }


    protected onPreDispose() {
        GameTimer.ins().clearAll(this);
        for (let t0 of this._tweenArray) {
            t0?.stop();
        }
        FacadeManager.ins().removeNotification(this);

        super.onPreDispose();
    }

    onClick0() {
        // conf
        UIManager.ins().open(HangUpUIKeys.HangUpInBgExitConfirmWin);
    }

    private reset() {

        const context = HangUpModel.ins().context;
        const bgCache = context.getInBgCache();

        const endLevelName = bgCache.getEndLevelName();
        const showLevelId = context.getCurrentLevelConfig()?.showLevelId;

        const state = bgCache.state;
        if (state == HangUpState.HANG_UP_ING) {
            this.view.labelCurLevel.text = `当前关卡进度: ${endLevelName}`;

            this._content = "托管推关中";
            this.view.charList.numItems = this._content.length;
            this.view.charList.refreshVirtualList();

        } else if (state == HangUpState.HANG_UP_FINISH) {
            const passCount = bgCache.passCount;
            this.view.labelCurLevel.text = `成功通过 ${passCount} 关`;

            this._content = "托管结束!";
            this.view.charList.numItems = this._content.length;
            this.view.charList.refreshVirtualList();
        }


    }


    irChar(i: number,
           comp: ui.hangUp.item.HangUpInBgTipsTextComp
    ) {
        const context = HangUpModel.ins().context;
        const bgCache = context.getInBgCache();

        comp.labelContent.text = this._content[i] || "";

        const jumpHeight = 20; // 跳动的高度
        const jumpDuration = 0.1; // 单次跳动的持续时间
        const delayBetweenChars = 0.1; // 每个字符之间的延迟时间

        const state = bgCache.state;
        if (state == HangUpState.HANG_UP_ING) {
            GameTimer.ins().loop(3000, this, () => {
                // 使用 tween 为每个字符设置跳动动画
                this._tweenArray[i]?.stop();
                const node = comp.labelContent.node;

                if (this._oldLabelY == null) {
                    this._oldLabelY = node.position.y;
                }

                node.position.set(node.position.x, this._oldLabelY);

                this._tweenArray[i] = tween(node)
                    .delay(i * delayBetweenChars)
                    .by(jumpDuration, {
                        // 上升
                        position: v3(0, jumpHeight, 0)
                    }, {easing: 'quadOut'})
                    .by(jumpDuration, {
                        // 回到原位
                        position: v3(0, -jumpHeight, 0)
                    }, {easing: 'quadIn'})
                    .start();
            });
        } else {
            GameTimer.ins().clearAll(this);
        }

    }


}