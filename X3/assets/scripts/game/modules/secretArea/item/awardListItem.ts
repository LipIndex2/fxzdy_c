import * as fgui from "fairygui-cc";
import { TableManager } from "../../../../core/table/TableManager";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { SecretAreaManager } from "../SecretAreaManager";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";

/** 秘境主界面 Page-item */
@bindFguiExtension("ui://secretArea/awardListItem")
export class awardListItem extends fgui.GComponent {
    static pkgName: string = "secretArea";
    static viewName: string = "awardListItem";

    private _cfg:table.secretinstance.SecretInstanceConfig;

    private _awardList:Array<{k:any,v:any}> = [];

    private get view(): ui.secretArea.item.awardListItem {
        return this as any;
    }

    onInit(){
        this.view.list_award.itemRenderer = this.awardItem.bind(this);
    }

    updateData(id:number){
        if(!id) return;
        this._cfg = TableManager.getDataById(table.secretinstance.SecretInstanceConfig, id);
        this.view.T_rank.text = this._cfg.id + "";
        if(this._cfg.id == SecretAreaManager.ins().level+1){
            this.view.getController("c1").selectedIndex = 0;
        }else{
            this.view.getController("c1").selectedIndex = 1;
        }
        this._awardList = this._cfg.rewardStr;
        this.view.list_award.numItems = this._awardList.length;
    }

    private awardItem(index:number, item:ItemFrameBtn){
        let data = this._awardList[index]
        item.reset(data.k, data.v);
        item.isShowCount(false);
        item.setTopCount(data.v);
    }
    
}