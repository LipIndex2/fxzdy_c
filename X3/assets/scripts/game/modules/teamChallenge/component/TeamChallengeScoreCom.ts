import * as fgui from "fairygui-cc";
import { TeamChallengeModel } from "../model/TeamChallengeModel";
import { Color } from "cc";

export default class TeamChallengeScoreCom extends fgui.GComponent {

    private _data: number[];

    public get view(): ui.teamChallenge.components.TeamChallengeScoreCom {
        return (this as any);
    }

    public initData(data: number[], clickFun: Function): void {
        this._data = data;
        let list = this.view.list_score;
        list.itemRenderer = this.renderListItem.bind(this);
        list.setVirtual();
        list.numItems = data.length;
        list.on(fgui.Event.CLICK_ITEM, () => {
            clickFun(list.selectedIndex);
        }, this);
    }

    public resetItems(){
        if(this._data){
            this.view.list_score.numItems = this._data.length;
        }
    }

    private renderListItem(index: number, item: ui.teamChallenge.btn.TeamChallengeScoreItem) {
        if(this._data[index] == 0){
            item.lb.text = '无限制';
        }else{
            item.lb.text = Math.floor(this._data[index]/10000)+'万';
        }
        const s = TeamChallengeModel.ins().getFightScore();
        if( Math.floor(s/10000)  == Math.floor(this._data[index]/10000)){
            item.imgSel.visible = true;
        }else{
            item.imgSel.visible = false;
        }
    }
}