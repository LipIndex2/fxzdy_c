import { Input } from "cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { TableManager } from "../../../../core/table/TableManager";
import { AttrData } from "../../attr/AttrManager";
import { UIHeroKey } from "../const/UIHeroConfig";
import { HeroManager } from "../HeroManager";
import { TouchUtils } from "../../../../core/utils/TouchUtils";

/**
 * 英雄属性预览界面
 */
@bindScript(UIHeroKey.HeroAttrPreviewWin)
export class HeroAttrPreviewWin extends UICommWin {

    static pkgName: string = "hero";
    static viewName: string = "HeroAttrPreviewWin";

    /** 英雄配置id */
    private _heroId = 101;

    private _attr1Map = {};
    private _attr2Map = {};
    private _attr1List:AttrData[] = [];
    private _attr2List:AttrData[] = [];

    private get view(): ui.hero.view.HeroAttrPreviewWin {
        return this._view as any;
    }

    protected onInit(): void {
        this.view.list_attr1.itemRenderer = this.attr1ItemRenderer.bind(this);
        this.view.list_attr2.itemRenderer = this.attr2ItemRenderer.bind(this);

        // this.view.HeroUpLevel.img_zy.on(fgui.Event.CLICK, this.onShow1Tips, this)
        // this.view.HeroSwitch.img_camp.on(fgui.Event.CLICK, this.onShow1Tips, this)
        // 触摸外部
        this.view.on(Input.EventType.TOUCH_END, this.onShowTips, this);
    }

    protected onOpen(heroId: number, isReopen?: boolean): void {
        if(!heroId){
            this.closeSelf();
            return;
        }
        this._heroId = heroId;
        let heroVo = HeroManager.ins().getHeroVoByID(this._heroId);

        let allAttr = heroVo.allAttrDataArr()
        for(let attr of allAttr){
            if(attr){
                if(attr.type == 1){
                    this._attr1List.push(attr);
                }else if(attr.type == 2){
                    this._attr2List.push(attr);
                }
            }
        }


        for(let attr1 of this._attr1List){
            if(attr1){
                if(this._attr1Map[attr1.id]){
                    this._attr1Map[attr1.id] += attr1.num;
                }else{
                    this._attr1Map[attr1.id] = attr1.num;
                }
            }
        }
        for(let attr2 of this._attr2List){
            if(attr2){
                if(this._attr2Map[attr2.id]){
                    this._attr2Map[attr2.id] += attr2.num;
                }else{
                    this._attr2Map[attr2.id] = attr2.num;
                }
            }
        }
        
        let keys1 = Object.keys(this._attr1Map);
        this.view.list_attr1.numItems = keys1.length;
        let keys2 = Object.keys(this._attr2Map);
        this.view.list_attr2.numItems = keys2.length;
    }


    private attr1ItemRenderer(index: number, item: ui.hero.item.TextItem2): void {
        let keys = Object.keys(this._attr1Map)[index];
        let data = this._attr1Map[keys];

        let cfg = TableManager.getDataById(table.battle.AttributeConfig, keys);
        item.T_name.text = cfg.attrName;
        if(cfg.isPermyriad){
            item.T_count.text = `${data/100}%`
        }else{
            item.T_count.text = `${data}`
        }

        item.clearClick();
        item.onClick(this.onShow1Tips.bind(this, cfg), this)
    }
    private attr2ItemRenderer(index: number, item: ui.hero.item.TextItem2): void {
        let keys = Object.keys(this._attr2Map)[index];
        let data = this._attr2Map[keys];

        let cfg = TableManager.getDataById(table.battle.AttributeConfig, keys);
        item.T_name.text = cfg.attrName;
        if(cfg.isPermyriad){
            item.T_count.text = `${data/100}%`
        }else{
            item.T_count.text = `${data}`
        }

        item.clearClick();
        item.onClick(this.onShow1Tips.bind(this, cfg), this)
    }

    private onShow1Tips(cfg:table.battle.AttributeConfig, event:any){
        let pos = event.pos;
        this.view.attrTipsItem.visible = true;
        this.view.attrTipsItem.setPosition(pos.x, pos.y);
        
        this.view.attrTipsItem.T_name.text = cfg.attrName;
        this.view.attrTipsItem.T_desc.text = cfg.attrDesc;
    }
    
    private onShowTips(event:any){
        this.view.attrTipsItem.visible = false;
    }

}