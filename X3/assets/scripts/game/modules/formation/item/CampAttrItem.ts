import * as fgui from "fairygui-cc";
import { TableManager } from "../../../../core/table/TableManager";
import { FormationManager } from "../FormationManager";
import { FightType } from "../../../comm/battle/enum/FightType";
import { FormationVo } from "../vo/FormationVo";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";


/** 
 * 阵营光环
 * 阵营加成描述item
 */
export class CampAttrItem extends fgui.GComponent{
    static pkgName: string = "formation";
    static viewName: string = "CampAttrItem";

    //羁绊表
    private _cfg: table.formation.FormationGroupConfig;
    //技能描述表
    private _skillCfg:table.battle.SkillConfig;

    private _fightType: ServerEnums.FightType;

    private _tempFormationVo: FormationVo;

    private get view(): ui.formation.item.CampAttrItem {
        return this as any;
    }

    constructor(){
        super();
    }

    public setData(type:ServerEnums.FightType, cfg:any, formationVo: FormationVo){
        this._fightType = type || ServerEnums.FightType.TRUNK_MAP;
        if(!cfg)return;
        this._cfg = cfg;
        this._skillCfg = TableManager.getDataById(table.battle.SkillConfig, this._cfg.passiveId);
        this._tempFormationVo = formationVo;
        this.updateUI();
    }

    onInit(){
        let self = this.view;
        self.list_attr.itemRenderer = this.attrItem.bind(this);
    }

    private updateUI(){
        let self = this.view;
        self.T_title.text = this._skillCfg.desc;
        self.list_attr.visible = false;

        self.setSize(self.width, self.T_title.height+10);

        let data = this._tempFormationVo.getCampCount(this._cfg.typeParam)[0];
        self.getController("c1").selectedIndex = data.num >= this._cfg.triggerCount? 1:0;
    }

    private attrItem(index:number, item:ui.formation.item.Attritem1){

    }
}