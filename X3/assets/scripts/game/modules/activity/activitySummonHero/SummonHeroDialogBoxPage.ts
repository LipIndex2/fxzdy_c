import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { tween } from "cc";
import { Tween } from "cc";
import { TableManager } from "../../../../core/table/TableManager";
import G from "../../../../core/comm/G";
import { SummonHeroDialogBoxItem } from "./SummonHeroDialogBoxItem";
import { ActivitySummonHeroVo } from "../model/ActivitySummonHeroVo";

/**
 * 召唤英雄
 * 对话框容器
 */
@bindFguiExtension("ui://activitySummonHero/DialogBoxPage")
export class SummonHeroDialogBoxPage extends fgui.GComponent {
    static pkgName: string = "activitySummonHero";
    static viewName: string = "DialogBoxPage";

    private get view(): ui.activitySummonHero.DialogBoxPage {
        return this as any;
    }
    //对话队列
    private static readonly _textMap: Map<number, SummonHeroDialogBoxItem> = new Map();
    //队列序号
    private _index: number = 0;
    private _starPosY = 0;
    //上升的y轴总值
    private _posY = 0;

    //后端推送的对话列表

    private _vo: ActivitySummonHeroVo;
    //循环对话id
    private _loopId: number = 0;

    //间隔时间
    private _time: number = 2000;

    onInit() {
        this._starPosY = this.view.scroll.y;
        // this._time = +TableManager.getDataById(table.activity.GirlGroup.GirlGroupConstantConfig, "GIRLGROUP:SHOW_DIALOG_TIME").content;
    }

    setActivityVo(vo: ActivitySummonHeroVo) {
        this._vo = vo;
    }

    //添加立刻触发的对话
    public addDialog(dialog: Vo.activity.CallHeroJackpotRecordVo) {
        this.showTips(dialog);
        this.showDialog();
    }

    //获取对话配置
    private getDialog() {
        if (this._loopId > this._vo.record.length - 1) this._loopId = this._vo.record.length - 1;
        return this._vo.record[this._loopId];
    }

    //循环配置对话
    private showDialog() {
        G.GameTimer.clearAll(this);
        let self = this;
        G.GameTimer.loop(this._time, this, () => {
            this._loopId++;
            if (this._loopId < this._vo.record.length) {
                let data = self.getDialog();
                self.showTips(data);
            } else {
                // G.GameTimer.clearAll(this);
                //测试反馈希望循环
                this._loopId = 0;
                let data = self.getDialog();
                self.showTips(data);
            }
        });
    }

    //飘对话
    public showTips(textData: Vo.activity.CallHeroJackpotRecordVo) {
        this._index += 1;

        //整个队列往上走
        Tween.stopAllByTarget(this.view.scroll);
        tween(this.view.scroll)
            .to(0.2, { y: this._starPosY - 32 * this._index })
            .start();

        let item = SummonHeroDialogBoxPage._textMap[this._index];
        let textItem: SummonHeroDialogBoxItem;
        if (item) {
            textItem = item;
            Tween.stopAllByTarget(textItem);
        } else {
            textItem = fgui.UIPackage.createObject("activitySummonHero", "dialogBoxItem") as SummonHeroDialogBoxItem;
            SummonHeroDialogBoxPage._textMap[this._index] = textItem;
            this.view.scroll.addChild(textItem);
        }
        textItem.visible = true;
        textItem.alpha = 1;
        textItem.setData(textData);
        textItem.y = this._index * 32 - 32;
        textItem.x = 0;
        G.GameTimer.once(40000, this, () => {
            textItem.dispose();
            delete SummonHeroDialogBoxPage._textMap[this._index];
        });
    }

    public dispose(): void {
        G.GameTimer.clearAll(this);
        Tween.stopAllByTarget(this.view.scroll);
        let keys = Object.keys(SummonHeroDialogBoxPage._textMap);
        for (let key of keys) {
            let item = SummonHeroDialogBoxPage._textMap[key];
            item.dispose();
            delete SummonHeroDialogBoxPage._textMap[key];
        }
        super.dispose();
    }
}
