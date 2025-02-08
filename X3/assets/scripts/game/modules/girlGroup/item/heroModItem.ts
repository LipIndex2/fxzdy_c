import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { ModelNode } from "../../common/node/ModelNode";
import { GirlGroupPlayerPage } from "../page/GirlGroupPlayerPage";
import { TableManager } from "../../../../core/table/TableManager";

/**
 * 女团
 * 单个模型
 */
@bindFguiExtension("ui://girlGroup/heroModItem")
export class HeroModItem extends fgui.GComponent {
    static pkgName: string = "girlGroup";
    static viewName: string = "heroModItem";

    private get view(): ui.girlGroup.item.heroModItem {
        return this as any;
    }

    private _config: table.activity.GirlGroup.GirlGroupModelConfig;
    private _xCenter: number = 0;
    private _oldY: number = 0;
    private _index: number = 0;
    private _scrollX: number = 0;
    private _isChoose: boolean = false;
    private _parentView: GirlGroupPlayerPage;

    private _modScales = [];
    private _modPosY: string[] = [];

    reset(index: number, config: table.activity.GirlGroup.GirlGroupModelConfig, parentView: GirlGroupPlayerPage, xCenter: number, scrollX: number) {
        const oldConfig = this._config;
        this._scrollX = scrollX;
        this._index = index;
        this._config = config;
        this._xCenter = xCenter;
        this._parentView = parentView;

        const rankId = config.id;

        // config change
        // if (oldConfig != config) {
        // this.resetUIByConfig(config);
        // }
        let modScales = TableManager.getDataById(table.activity.GirlGroup.GirlGroupConstantConfig, "GIRLGROUP:SHOW_MODEL_SCALES").content;
        let modPosY = TableManager.getDataById(table.activity.GirlGroup.GirlGroupConstantConfig, "GIRLGROUP:SHOW_MODEL_POSY").content;
        this._modScales = modScales.split(";");
        this._modPosY = modPosY.split(";");

        this._isChoose = Math.abs(this.isInChooseRange()) < this.view.width - 205;
        this.setMod();
        if (this._isChoose) {
            // const name = config.name;
            // const rankName = I18nManager.ins().translate(name);
            // console.info(`选中了段位 id = ${rankId}, 段位名 = ${rankName}, index = ${index}`);
            this._parentView.setChooseRankIndex(this._config);
        }

        // this.onChangeXY();
    }

    private isInChooseRange() {
        const x = this.view.x - this._scrollX + this.view.width / 2 - 80;
        const diffX = x - this._xCenter;
        return diffX;
    }

    //设置模型
    private setMod() {
        let mod = this.view.modelNode as ModelNode;
        mod.loadByModelId(this._config.modelId);
        if (this._isChoose) {
            mod.setScale(Number(this._modScales[2]), Number(this._modScales[2]));
            // mod.setScale(3.5, 3.5);
            mod.y = Number(this._modPosY[2]);
            mod.play(this._config.exclusiveAnimName, true);
        } else {
            let num = this.isInChooseRange();
            if (Math.abs(num) < this.view.width - 50) {
                if (num < 0) {
                    mod.setScale(Number(this._modScales[1]), Number(this._modScales[1]));
                    mod.y = Number(this._modPosY[1]);
                    // mod.y = 385;
                } else {
                    mod.setScale(-Number(this._modScales[3]), Number(this._modScales[3]));
                    mod.y = Number(this._modPosY[3]);
                    // mod.y = 385;
                }
            } else {
                if (num < 0) {
                    mod.setScale(Number(this._modScales[0]), Number(this._modScales[0]));
                    mod.y = Number(this._modPosY[0]);
                    // mod.y = 385;
                } else {
                    mod.setScale(-Number(this._modScales[4]), Number(this._modScales[4]));
                    mod.y = Number(this._modPosY[4]);
                    // mod.y = 385;
                }
            }
            mod.play(this._config.normalAnimName, true);
        }

        // let isAdd = true;
        // for (let model of this._modelList) {
        //     if (model == mod) {
        //         isAdd = false;
        //     }
        // }
        // if (isAdd) this._modelList.push(mod);
    }

    //设置坐标
    private onChangeXY() {
        // const x = this.view.node.worldPosition.x;
        // const diffX = Math.abs(x - this._xCenter);
        // const maxX = 300;
        // const ratio = math.clamp(diffX / maxX, 0, 1);
        // const ratioR = 1 - ratio;
        // // 缩放
        // const scale = 0.5 + 0.8 * ratioR;
        // //  y 坐标
        // const y = this._oldY - 80 + 160 * ratio;
        // this.view.logo.setScale(scale, scale);
        // this.view.curComp.setScale(scale, scale);
        // const oldPos = this.view.logo.node.position;
        // this.view.logo.node.position = new Vec3(oldPos.x, y, 0);
    }
}
