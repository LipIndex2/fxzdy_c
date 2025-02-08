import * as fgui from "fairygui-cc";


/** 属性item2 */
export class HeroAttrItem2 extends fgui.GComponent{
    static pkgName: string = "hero";
    static viewName: string = "HeroAttrItem2";



    private get view(): ui.hero.item.HeroAttrItem2 {
        return this as any;
    }
    
    constructor(){
        super();
    }

    protected onConstruct(): void {
        
    }


}