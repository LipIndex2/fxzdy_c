import * as fgui from "fairygui-cc";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import NotificationKey from "../../../event/NotificationKey";
import G from "../../../../core/comm/G";
import { HeroCampType, HeroCareerType, HeroSelectKey } from "../../hero/HeroEnum";
import { HeroSelectData } from "../../hero/HeroVo";


/** 英雄筛选列表item */
export class HeroSelectItem extends fgui.GComponent{
    static pkgName: string = "comm";
    static viewName: string = "HeroSelectItem";

    private _campSelItem;
    private _careerSelItem;
    private _campType:HeroCampType;
    private _careerType:HeroCareerType;

    private _type:HeroSelectKey;

    private get view(): ui.comm.item.HeroSelectItem {
        return this as any;
    }
    
    constructor(){
        super();
    }

    public setType(type:HeroSelectKey){
        this._type = type;
    }

    protected onConstruct(): void {
        this.onInit();
    }

    onInit(){
        let self = this.view;
        self.list_camp.itemRenderer = this.itemCampSel.bind(this);
        self.list_career.itemRenderer = this.itemCareerSel.bind(this);
        self.btn_tab.on(fgui.Event.CLICK, this.onTabClick, this)

        self.getController("c1").selectedIndex = 0;
        self.list_camp.numItems = 4;
        self.list_career.numItems = 6;
    }

    //选择阵营
    itemCampSel(index:number, item:ui.comm.btn.HeroSelectBtn){
        item.onClick(()=>{
            let isShow = true;
            if(!this._campSelItem){
                this._campSelItem = item;
            }else{
                if(this._campSelItem == item){
                    isShow = false
                }else{
                    this._campSelItem.selected = false;
                    this._campSelItem = item;
                }
            }
            this.onCampClick(index, isShow);
        },this);
    }
    onCampClick(index:number, isShow:boolean){
        this._campSelItem.selected = isShow;
        this._campType = index+1;
        if(!isShow) {
            this._campSelItem = null;
            this._campType = null;
        }
        this.selectHero();
    }

    //选择职业
    itemCareerSel(index:number, item:ui.comm.btn.HeroSelectBtn){
        item.onClick(()=>{
            let isShow = true;
            if(!this._careerSelItem){
                this._careerSelItem = item;
            }else{
                if(this._careerSelItem == item){
                    isShow = false
                }else{
                    this._careerSelItem.selected = false;
                    this._careerSelItem = item;
                }
            }
            this.onCareerClick(index, isShow);
        },this);
    }
    onCareerClick(index:number, isShow:boolean){
        this._careerSelItem.selected = isShow;
        this._careerType = index+1;
        if(!isShow) {
            this._careerSelItem = null;
            this._careerType = null;
        }
        this.selectHero();
    }
    
    private selectHero(){
        let data:HeroSelectData = {
            key:this._type,
            campType:this._campType,
            careerType:this._careerType,
        }
        G.FacadeManager.emit(NotificationKey.HERO_SELECT_HERO, data);
    }


    onTabClick(){
        if(this.view.getController("c1").selectedIndex == 0){
            this.view.getController("c1").selectedIndex = 1;
        }else{
            this.view.getController("c1").selectedIndex = 0;
        }
    }

}