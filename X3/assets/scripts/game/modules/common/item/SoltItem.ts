import * as fgui from "fairygui-cc";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { HeroManager } from "../../hero/HeroManager";
import { TableManager } from "../../../../core/table/TableManager";
import { PositionVo } from "../../formation/vo/PositionVo";
import { ModelNode } from "../node/ModelNode";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { FightType } from "../../../comm/battle/enum/FightType";




/** 槽位Item */
export class SoltItem extends fgui.GComponent{
    static pkgName: string = "comm";
    static viewName: string = "SoltItem";

    /** 临时槽位vo */
    private _tempSoltVo:PositionVo;

    private _func:Function;

    private _fType:FightType;

    private get view(): ui.comm.item.SoltItem {
        return this as any;
    }
    
    protected onConstruct(): void {
        this.onInit();
    }

    public onInit() {
        this.view.anim.on(fgui.Event.CLICK, this.onSelfClick, this)
    }

    //更新item
    public updateData(SoltVo:PositionVo, fightType:FightType = null){
        this._fType = fightType;
        this._tempSoltVo = SoltVo;
        this.updateUI();
    }

    private updateUI(){
        let self = this.view;
        
        let state = 0;
        self.img_quality.icon = ItemUtils.getFormationItemBg(1);
        self.T_level.visible = true;
        self.imgAdd.visible = true;
        if(this._tempSoltVo.isUnlock){
            if(this._tempSoltVo.heroId){
                state = 2;
                let heroVo = HeroManager.ins().getHeroVoByID(this._tempSoltVo.heroId);
                self.img_quality.icon = ItemUtils.getFormationItemBg(heroVo.heroCfg.quality);
            }else{
                state = 1;
                if(this._fType == ServerEnums.FightType.TEAM_INSTANCE){
                    self.T_level.visible = false;
                    self.imgAdd.visible = false;
                }
            }
        }
        self.T_unlockLevel.text = "Lv" + this._tempSoltVo.unlockLevel;
        self.getController("c1").selectedIndex = state;
        self.T_level.text = "Lv." + this._tempSoltVo.level;
        self.T_level.x = 0;
        if(this._fType == ServerEnums.FightType.TEAM_INSTANCE){
            const pos = this._tempSoltVo.BaseId;
            if(pos <= 3){
                self.T_level.x = -60;
            }
        }
    }

    set isShowQuality(isShow:boolean){
        this.view.img_quality.visible = isShow;
    }


    public setModel(){
        if(this._tempSoltVo.heroId){
            this.view.anim.visible = true;
            let heroVo = HeroManager.ins().getHeroVoByID(this._tempSoltVo.heroId);
            let model = this.view.anim as ModelNode;
            // model.loadByModelId(heroVo.heroCfg.showModelId);
            model.loadByModelId(heroVo.showModelId);
        }else{
            this.view.anim.visible = false;
        }
    }

    public setModelScale(scaleX:number, scaleY:number){
        let model = this.view.anim as ModelNode;
        model.setScale(scaleX,scaleY);
    }

    public setFun(fun:Function){
        this._func = fun;
    }

    private onSelfClick(){
        if(this._func){
            this._func();
        }
    }

}