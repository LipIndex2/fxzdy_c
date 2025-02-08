import * as fgui from "fairygui-cc";
import { HeroVo } from "../HeroVo";
import { HeroManager } from "../HeroManager";
import { TableManager } from "../../../../core/table/TableManager";
import { ItemModel } from "../../item/model/ItemModel";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { QualityUtils } from "db://assets/scripts/game/modules/common/quality/QualityUtils";


/** 英雄碎片进度条item */
export class HeroFragmentBarItem extends fgui.GComponent{
    static pkgName: string = "hero";
    static viewName: string = "HeroFragmentBarItem";

    /** 英雄配置id */
    private _heroId:number = 0;
    /** 英雄Vo */
    private _heroVo:HeroVo;

    private get view(): ui.hero.item.HeroFragmentBarItem {
        return this as any;
    }
    
    constructor(){
        super();
    }

    protected onConstruct(): void {
        this.onInit();
    }

    protected onInit(){
        this.view.btn_Add.on(fgui.Event.CLICK, this.onBtnClick, this);
    }

    //更新UI信息
    public updateInfo(id:number){
        if(!id) return;
        let self = this.view;

        this._heroId = id;
        this._heroVo = HeroManager.ins().getHeroVoByID(this._heroId);

        let starNextCfg = this._heroVo.getHeroStarCfg(this._heroVo.star+1);

        self.img_icon.icon = ItemUtils.getItemConfigByItemId(this._heroVo.heroCfg.fragmentItemId).iconPath;
        if(starNextCfg && starNextCfg.cost){
            self.T_num.text = this._heroVo.fragment + "/" + starNextCfg.cost;
            let width = this._heroVo.fragment/starNextCfg.cost > 1?1:this._heroVo.fragment/starNextCfg.cost;
            self.img_jdt.width = width * 359;
            self.btn_Add.visible = true;
        }else{
            self.T_num.text = this._heroVo.fragment + "";
            self.img_jdt.width = 359;
            self.btn_Add.visible = false;
        }

        let item = ItemUtils.getItemConfigByItemId(this._heroVo.heroCfg.fragmentItemId);
        
        self.T_name.text = item.name;
        QualityUtils.setFGUIFontColorByQuality(self.T_name, item.quality);
        
    }

    /** 添加碎片 */
    private onBtnClick() {
        
    }

}