import * as fgui from "fairygui-cc";


/** 英雄专属武器item */
export class WeaponItem extends fgui.GComponent{
    static pkgName: string = "hero";
    static viewName: string = "WeaponItem";



    private get view(): ui.hero.item.WeaponItem {
        return this as any;
    }
    
    constructor(){
        super();
    }

    protected onConstruct(): void {
        this.onInit();
    }

    protected onInit(){
        // this.view.bg.on(fgui.Event.CLICK, this.onBtnClick, this);
        this.updateInfo();
    }

    //更新UI信息
    private updateInfo(){
        
    }

    
    private onBtnClick() {
        
    }

}