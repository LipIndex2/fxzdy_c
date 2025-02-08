import * as fgui from "fairygui-cc";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { tween } from "cc";
import { FloatingTextType, TextData } from "../FloatingTextManager";
import { AudioManager, SoundType } from "../../../comm/mgr/AudioManager";
import G from "../../../../core/comm/G";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { ModelNode } from "../../common/node/ModelNode";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";

/** 飘字Fgui item */
@bindFguiExtension("ui://floatingText/FightTextItem")
export class FightTextItem extends fgui.GComponent {
    static create() {
        return fgui.UIPackage.createObject("floatingText", "FightTextItem") as FightTextItem;
    }

    private get view(): ui.floatingText.item.FightTextItem {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onPreDispose() {
        G.GameTimer.clearAll(this);
    }

    /** 飘字数据 */
    setData(textData: TextData) {
        this.showTips(textData);
        this.view.T_change.y = this.view.T_change2.y = this.view.T_fight.y;
    }

    private showTips(textData: TextData) {
        let self = this.view;

        self.height = 76;

        this.setFight(textData.fight - textData.fightChange, textData.fightChange);

        AudioManager.ins().playSound(SoundType.zhanlitisheng);

    }

    /***战力提升特效 */
    public setFightUpEffect(iconEffect: { up: number, low: number }) {
        let modelNodeBottom: ModelNode = this.view.modelNodeBottom as ModelNode;
        let modelNodeTop: ModelNode = this.view.modelNodeTop as ModelNode;
        if (iconEffect) {
            if (iconEffect.low) {
                modelNodeBottom.loadByModelId(iconEffect.low, false);
                modelNodeBottom.play(null)
            }
            else {
                modelNodeBottom.clear();
            }

            if (iconEffect.up) {
                modelNodeTop.loadByModelId(iconEffect.up, false);
                modelNodeTop.play(null)
            }
            else {
                modelNodeTop.clear();
            }
        }
        else {
            modelNodeBottom.clear();
            modelNodeTop.clear();
        }
    }

    private _fightChange = 0; //变化量
    private _fightAllChange = 0; //初始变化总量
    private _figth = 0;
    //战力变化 allNum:变化前的战力， changeNum:变化的战力
    private setFight(allNum: number, changeNum: number) {
        this._figth = allNum;
        this._fightAllChange = changeNum;
        this._fightChange = 0;

        this.view.T_fight.text = "" + StringUtils.getFightStr(allNum);
        if (changeNum > 0) {
            this.view.T_change.visible = true;
            this.view.T_change2.visible = false;
            this.view.T_change.text = "+" + changeNum;
            this.setFightUpEffect({ up: 10010197, low: 10010198 })
            this.view.fightMc.visible = false;
        } else {
            this.view.T_change.visible = false;
            this.view.T_change2.visible = true;
            this.view.T_change2.text = "" + changeNum;
            this.view.fightMc.visible = true;
        }

        let num = Math.floor(changeNum / 8);

        this.view.T_change.x = this.view.T_change2.x = this.view.T_fight.x + this.view.T_fight.width + 10;
        G.GameTimer.once(650, this, () => {
            this.setFightChange(num, changeNum > 0);
        });
    }

    //战力变化动画
    private setFightChange(changeNum: number, isAdd: boolean) {
        this._fightChange += changeNum;

        if (Math.abs(this._fightAllChange) <= Math.abs(this._fightChange)) {
            this.view.T_fight.text = StringUtils.getFightStr(this._figth + this._fightAllChange);
            //策划要求，右边不想要变到0的数字，但是左边是正常变，所以右边数字变化量就小一点。
            if (isAdd) {
                this.view.T_change.text = "+" + Math.floor(this._fightAllChange - this._fightChange / 1.1);
            } else {
                this.view.T_change2.text = "" + Math.floor(this._fightAllChange - this._fightChange / 1.1);
            }
            G.GameTimer.clearAll(this);
            this.view.T_change.x = this.view.T_change2.x = this.view.T_fight.x + this.view.T_fight.width + 10;
            return;
        }

        this.view.T_fight.text = StringUtils.getFightStr(this._figth + this._fightChange);
        //策划要求，右边不想要变到0的数字，但是左边是正常变，所以右边数字变化量就小一点。
        if (isAdd) {
            this.view.T_change.text = "+" + Math.floor(this._fightAllChange - this._fightChange / 1.1);
        } else {
            this.view.T_change2.text = "" + Math.floor(this._fightAllChange - this._fightChange / 1.1);
        }

        this.view.T_change.x = this.view.T_change2.x = this.view.T_fight.x + this.view.T_fight.width + 10;
        G.GameTimer.once(50, this, () => {
            this.setFightChange(changeNum, isAdd);
        });
    }
}
