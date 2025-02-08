import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { GirlGroupUtil } from "../GirlGroupUtil";
import { tween } from "cc";
import { Tween } from "cc";
import { TableManager } from "../../../../core/table/TableManager";
import G from "../../../../core/comm/G";
import { DialogBoxItem } from "../item/DialogBoxItem";

/**
 * 女团
 * 对话框容器
 */
@bindFguiExtension("ui://girlGroup/DialogBoxPage")
export class DialogBoxPage extends fgui.GComponent {
    static pkgName: string = "girlGroup";
    static viewName: string = "DialogBoxPage";

    private get view(): ui.girlGroup.page.DialogBoxPage {
        return this as any;
    }
    //对话队列
    private static readonly _textMap: Map<number, DialogBoxItem> = new Map();
    //队列序号
    private _index: number = 0;
    private _starPosY = 0;
    //上升的y轴总值
    private _posY = 0;

    //后端推送的对话列表
    private _dialogData: DialogData;
    private _dialogList: Array<DialogData> = [];

    private _cfgs: table.activity.GirlGroup.GirlGroupTextConfig[];
    private _type0Cfgs: table.activity.GirlGroup.GirlGroupTextConfig[];
    private _type1Cfgs: table.activity.GirlGroup.GirlGroupTextConfig[];
    private _type2Cfgs: table.activity.GirlGroup.GirlGroupTextConfig[];
    private _activityId: number;
    //循环对话id
    private _loopId: number = 0;

    //间隔时间
    private _time: number = 1000;

    //对话概率
    private _dialogProbabilitys: string[];

    onInit() {
        this._starPosY = this.view.scroll.y;

        // this.showDialog();

        this._time = +TableManager.getDataById(table.activity.GirlGroup.GirlGroupConstantConfig, "GIRLGROUP:SHOW_DIALOG_TIME").content;
    }

    setActivityId(activityId: number) {
        this._activityId = activityId;
    }

    //添加立刻触发的对话
    public addDialog(dialog: DialogData) {
        this.showTips(dialog);
        this.showDialog();
    }

    //随机获取对话配置
    private showRandomDialog() {
        if (!this._dialogProbabilitys) {
            this._dialogProbabilitys = [];
            this._dialogProbabilitys = TableManager.getDataById(table.activity.GirlGroup.GirlGroupConstantConfig, "GIRLGROUP:SHOW_DIALOG_ODDS").content.split(";");
        }
        let random = Math.random();
        if (random <= Number(this._dialogProbabilitys[0])) {
            //0类型
            this._loopId = Math.floor(Math.random() * this._type0Cfgs.length);
            return this._type0Cfgs[this._loopId];
        } else if (random <= Number(this._dialogProbabilitys[0]) + Number(this._dialogProbabilitys[1])) {
            this._loopId = Math.floor(Math.random() * this._type1Cfgs.length);
            return this._type1Cfgs[this._loopId];
        } else {
            this._loopId = Math.floor(Math.random() * this._type2Cfgs.length);
            return this._type2Cfgs[this._loopId];
        }
    }

    //循环配置对话
    private showDialog() {
        if (!this._cfgs) {
            this._cfgs = [];
            let cfgs = TableManager.getAllData(table.activity.GirlGroup.GirlGroupTextConfig);
            for (let cfg of cfgs) {
                if (cfg && cfg.activityId == this._activityId) this._cfgs.push(cfg);
            }
        }
        if (!this._type0Cfgs) {
            this._type0Cfgs = [];
            for (let cfg of this._cfgs) {
                if (cfg && cfg.type == 0) this._type0Cfgs.push(cfg);
            }
        }
        if (!this._type1Cfgs) {
            this._type1Cfgs = [];
            for (let cfg of this._cfgs) {
                if (cfg && cfg.type == 1) this._type1Cfgs.push(cfg);
            }
        }
        if (!this._type2Cfgs) {
            this._type2Cfgs = [];
            for (let cfg of this._cfgs) {
                if (cfg && cfg.type == 2) this._type2Cfgs.push(cfg);
            }
        }

        G.GameTimer.clearAll(this);
        let self = this;
        G.GameTimer.loop(this._time, this, () => {
            let cfg = self.showRandomDialog();
            let data: DialogData = {
                type: cfg.type,
                text: cfg.text,
            };
            self.showTips(data);
            // self._loopId++;
            // if (self._loopId >= self._cfgs.length) self._loopId = 0;
        });
    }

    //飘对话
    public showTips(textData: DialogData) {
        this._index += 1;

        //整个队列往上走
        Tween.stopAllByTarget(this.view.scroll);
        tween(this.view.scroll)
            .to(0.2, { y: this._starPosY - 58 * this._index })
            .start();

        let item = DialogBoxPage._textMap[this._index];
        let textItem: DialogBoxItem;
        if (item) {
            textItem = item;
            Tween.stopAllByTarget(textItem);
        } else {
            textItem = fgui.UIPackage.createObject("girlGroup", "dialogBoxItem") as DialogBoxItem;
            DialogBoxPage._textMap[this._index] = textItem;
            this.view.scroll.addChild(textItem);
        }
        textItem.visible = true;
        textItem.alpha = 1;
        textItem.setData(textData);
        textItem.y = this._index * 58 - 58;
        textItem.x = 0;
        G.GameTimer.once(40000, this, () => {
            textItem.dispose();
            delete DialogBoxPage._textMap[this._index];
        });
    }

    public dispose(): void {
        G.GameTimer.clearAll(this);
        Tween.stopAllByTarget(this.view.scroll);
        let keys = Object.keys(DialogBoxPage._textMap);
        for (let key of keys) {
            let item = DialogBoxPage._textMap[key];
            item.dispose();
            delete DialogBoxPage._textMap[key];
        }
        super.dispose();
    }
}

/**
 * 对话data
 */
export class DialogData {
    /** 飘字类型 0:对话, 1:欢迎, 2:购买礼包 */
    type: number;
    /** 文案 */
    text?: string;
}
