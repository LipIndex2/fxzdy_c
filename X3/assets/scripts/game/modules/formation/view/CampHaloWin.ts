import * as fgui from "fairygui-cc";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { CampAttrItem } from "../item/CampAttrItem";
import { GroupType, HeroCampType } from "../../hero/HeroEnum";
import { FormationManager } from "../FormationManager";
import { FightType } from "../../../comm/battle/enum/FightType";
import { FormationVo } from "../vo/FormationVo";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIFormationKey } from "../const/UIFormationConfig";



/**
 * 阵营光环
 */
@bindScript(UIFormationKey.CAMP_FETTER_WIN)

export class CampHaloWin extends UIWin{
    static pkgName: string = "formation";
    static viewName: string = "CampHaloWin";

    //当前选择的阵营
    private _selCamp = HeroCampType.Human;

    private _cfg:table.formation.FormationGroupConfig[] = [];

    private _fightType: ServerEnums.FightType;

    private _tempFormationVo: FormationVo;

    private get view(): ui.formation.view.CampHaloWin {
        return this._view as any;
    }


    protected onInit(): void {
        let self = this.view;

        self.bg.on(fgui.Event.CLICK,this.closeSelf,this);
        self.list_camp.itemRenderer = this.campItem.bind(this);
        self.list_addAttr.itemRenderer = this.addAtttrItem.bind(this);

    }
    
    protected onOpen(args: { type: ServerEnums.FightType, formationVo: FormationVo}): void {
        this._fightType = args?.type || ServerEnums.FightType.TRUNK_MAP;
        this._tempFormationVo = args.formationVo;
        this.updateUI();
    }

    private updateUI(){
        let self = this.view;
        self.list_camp.numItems = 4;

        this._cfg = this._tempFormationVo.getCampFetterCfg(GroupType.CAMP, this._selCamp)
        self.list_addAttr.numItems = this._cfg.length;
        
    }

    //阵营item
    private campItem(index:number, item:ui.formation.item.CampAmountItem){
        let datas = this._tempFormationVo.getCampCount(null);
        let data = null;

        for(let k in datas){
            if(datas[k].type == index+1){
                data = datas[k];
            }
        }

        item.getController("camp").selectedIndex = data?data.type:index+1;
        item.getController("num").selectedIndex = data?data.num:0;
        item.onClick(()=>{
            this.campItemClick(index)
        }, this);
    }

    campItemClick(index:number){
        if((index+1) == this._selCamp) return;
        console.log(index);
        this._selCamp = index+1;
        this.updateUI();
    }

    //属性加成item
    private addAtttrItem(index:number, item:CampAttrItem){
        item.setData(this._fightType, this._cfg[index], this._tempFormationVo);
    }
}