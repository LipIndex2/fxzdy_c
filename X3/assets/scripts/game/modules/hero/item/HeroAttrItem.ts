import * as fgui from "fairygui-cc";


/** 属性item */
export class HeroAttrItem extends fgui.GComponent{
    static pkgName: string = "hero";
    static viewName: string = "HeroAttrItem";




    private get view(): ui.hero.item.HeroAttrItem {
        return this as any;
    }
    
    constructor(){
        super();
    }

    protected onConstruct(): void {
        
    }



}