import * as fgui from "fairygui-cc";

export class SeasonRankItem extends fgui.GComponent {


    private get view(): ui.season.com.SeasonRankItem {
        return this as any;
    }

    constructor() {
        super();
    }

    onConstruct() {
        this.onInit();
    }

    public onInit() {

    } 

    reset(vo:any) {
        const t = this;

    }
}