import { Tween, tween } from "cc";
import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";

/**
 * 角标 主要用于商品展示
*/
@bindFguiExtension('ui://comm/CornerMark')
export class CornerMark extends fgui.GComponent {
    protected _tipStr: string = ''
    protected _isPlayEffect: boolean = false

    protected get view(): ui.comm.view.CornerMark {
        return this as any
    }

    protected onInit(): void {
        this.view.gAll.visible = false
    }

    protected onPreDispose(): void {
        this.stopEffect()
    }

    public showTip(str: string, withEffect:boolean = true): void {
        if (this._tipStr != str) {
            this._tipStr = str
            this.view.gAll.visible = true
            this.view.lbTip.text = str
            this.view.lbTip.ensureSizeCorrect()
            this.view.bg.ensureSizeCorrect()
        }
        if (withEffect) {
            this.playEffect()
        } else {
            this.stopEffect()
        }
    }

    public clearTip(): void {
        this._tipStr = ''
        this.view.gAll.visible = false
        this.stopEffect()
    }

    protected playEffect(): void {
        if (this._isPlayEffect) {
            return
        }
        this._isPlayEffect = true

        let tween1 = tween(this.view).to(0.5, { rotation: 6 })
        let tween2 = tween(this.view).to(0.5, { rotation: -6 })
        tween(this.view).sequence(tween1, tween2).repeatForever().start()
    }

    protected stopEffect(): void {
        if (this._isPlayEffect) {
            Tween.stopAllByTarget(this.view)
            this.view.rotation = 0
        }
        this._isPlayEffect = false
    }
}