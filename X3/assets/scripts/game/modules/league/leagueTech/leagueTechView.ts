import * as fgui from "fairygui-cc";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { TableManager } from "../../../../core/table/TableManager";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import NotificationKey from "../../../event/NotificationKey";
import { AttrUtils } from "../../attr/utils/AttrUtils";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { ResoureceBtn } from "../../common/header/resoureceBtn";
import { ModelNode } from "../../common/node/ModelNode";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { ConstLeagueKey, UILeagueKey } from "../const/UILeagueConst";
import { LeagueModel } from "../LeagueModel";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { BtnChangGui1WithItem } from "../../common/btn/BtnChangGui1WithItem";
import GIns from "../../../GIns";

@bindScript(UILeagueKey.LeagueTechView)
export class LeagueTechView extends UICommWin {
    static pkgName: string = "leagueTech";

    static viewName: string = "leagueTechView";

    private get view(): ui.leagueTech.leagueTechView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.EVENT_LEAGUE_TECHNOLOGY_UPGRADE];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {

            case NotificationKey.EVENT_LEAGUE_TECHNOLOGY_UPGRADE:
                this.updateView();
                this.playLvUpAni();
                this._isBackData = true
                break;
        }
    }

    protected onInit(): void {
        let view = this.view;

        view.upBtn.on(fgui.Event.TOUCH_BEGIN, this.onLvUp, this);
        view.upBtn.on(fgui.Event.TOUCH_END, this.onLvUpEnd, this);
        view.tabList.onClick(this.selectJob, this);
        view.tabList.selectedIndex = 0;

    }
    //当前的职业   
    private jobIndex = 1;

    //当前的孔位
    private holeIndex = 1;

    //数据
    private leagueTechVos: Vo.league.LeagueTechVo[];

    public onOpen(): void {

       // LeagueModel.ins().loadLeagueApply();
        this.view.tabList.selectedIndex = this.jobIndex - 1;
        this.selectJob();



    }

    private updateView(): void {
        let view = this.view;
        let totalLv = LeagueModel.ins().getTotalLevel(this.jobIndex);
        view.totalLv.text = `总等级${totalLv}级`;
        view.jobIcon.getController("job").selectedIndex = this.jobIndex - 1;
        view.jobName.text = ItemUtils.getCareerName(this.jobIndex);

        //8个槽位都刷新
        for (let i = 1; i <= 8; i++) {
            this.updateHole(i);
        }

        this.onSelectHoled(this.holeIndex);

        //更新宝石
        this.showCost();

    }


    private showCost() {

        let itemId = 27;

        const header1 = FguiScriptUtils.toMyScriptClass(this.view.resourceBtn, ResoureceBtn);
        header1.reset(itemId,1);

    }
    private _isUp:boolean = false;
    private _isBackData:boolean = false
    private onLvUp(): void {
        this._isUp = true
        this._isBackData = true
        this.upTech()
    }

    //取消长按
    private onLvUpEnd(): void {
        this._isUp = false
        GameTimer.ins().clear(this, this.onLvUp);
    }

    protected upTech():void {
        if (this._isUp && this._isBackData) {
            let holeIndex = this.holeIndex;
            LeagueModel.ins().upgradeLeagueTech(this.jobIndex, holeIndex);
            GameTimer.ins().once(150, this, this.onLvUp);
        }
    }

    /**槽位 */
    private updateHole(index: number) {
        let hodeIndex = index;
        let state = LeagueModel.ins().getSlotState(this.jobIndex, hodeIndex);
        let level = 1;
        let cfgs = LeagueModel.ins().getAllTechCfg(this.jobIndex, hodeIndex);
        let lastCfg = cfgs[cfgs.length - 1];
        let hole: ui.leagueTech.btn.holeCell = this.view["hole" + (index - 1)];
        hole.holeLv.visible = true;
        if (state == 4) {
            //刚解锁
            level = 0;
        }
        else if (state == 2) {

            level = lastCfg.level;
            hole.holeLv.visible = false;
        }
        else {

            let cfg = LeagueModel.ins().getLeagueTechCfg(this.jobIndex, hodeIndex);

            level = cfg ? cfg.level : 0;
            if (state == 1)
                hole.holeLv.visible = false;
        }




        hole.lock.visible = state == 1;

        //显示的时候等级-1
        hole.holeLv.text = `${(level)}/${lastCfg.level}`
        // self.img_career.icon = ItemUtils.getCareerIcon(ServerEnums.Career[this._heroVo.heroCfg.career]);
        hole.clearClick();
        hole.onClick(this.onSelectHoled.bind(this, index), this);

        const attrConfigEffect = AttrUtils.parseKvArrayToOneAttr(lastCfg.attrs);
      
        hole.holeIcon.icon = attrConfigEffect.getIconPath();



    }
    private lastHoleIndex = -1;
    private onSelectHoled(index: number): void {
        let view = this.view;
        let hole: ui.leagueTech.btn.holeCell = view["hole" + (index - 1)];
        if (this.lastHoleIndex != -1) {
            let lastHole: ui.leagueTech.btn.holeCell = view["hole" + (this.lastHoleIndex - 1)];
            lastHole.selectImg.visible = false;
        }


        this.lastHoleIndex = index;
        hole.selectImg.visible = true;


        let hodeIndex = this.holeIndex = index;


        let cfg = LeagueModel.ins().getLeagueTechCfg(this.jobIndex, hodeIndex);
        let state = LeagueModel.ins().getSlotState(this.jobIndex, hodeIndex);
        //当前属性加成
        // 加成属性
        let attrKvArray: Array<{
            k: any;
            v: any;
        }>;
        let level: number = 0;
        let skillName: string = "";
        if (cfg) {
           let attrK =  attrKvArray = cfg.attrs[0].k;
            level = cfg.level;
            skillName = cfg.skillName;
            let tottalAttrV = LeagueModel.ins().getTechAttrTotal(this.jobIndex, hodeIndex, level);
            attrKvArray = [tottalAttrV]
        }

        else {
            cfg = LeagueModel.ins().getLeagueTechCfg(this.jobIndex, hodeIndex, 1);
            let cfgAttr = cfg.attrs[0];
            attrKvArray = [{ k: cfgAttr.k, v: 0 }]

        }

        const attrConfigEffect = AttrUtils.parseKvArrayToOneAttr(attrKvArray);
        view.attrName.text = attrConfigEffect.config.attrName;
        view.currAttrValue.text = `+${attrConfigEffect.getValueStringForUIShow()}`;
        view.attrIcon.icon = attrConfigEffect.getIconPath();
        if (state == 0 || state == 1 || state == 4) {
            //显示下一级属性加成
            let nextCfg = LeagueModel.ins().getLeagueTechCfg(this.jobIndex, hodeIndex, level + 1);
            let totalAttr = LeagueModel.ins().getTechAttrTotal(this.jobIndex, hodeIndex, level + 1);
            let nextAttrConfigEffect = AttrUtils.parseKvArrayToOneAttr([totalAttr]);

            view.nextAttr.text = nextAttrConfigEffect.getValueStringForUIShow();
            //显示升级消耗
            let cost = nextCfg.costItems[0];
            let noOwnerItem = NoOwnerItem.createByConfigKv(cost);
            FguiScriptUtils.toMyScriptClass(view.upBtn, BtnChangGui1WithItem).reset('升级', noOwnerItem)

            if (state == 1) {
                view.tips.text = "升满前置科技后解锁";
            }
            view.curAttrCom.x = 125;
        }
        else {
            this.onLvUpEnd();
            if (state == 2) {

                view.tips.text = "当前科技已升满";
                let tottalAttrV = LeagueModel.ins().getTechAttrTotal(this.jobIndex, hodeIndex, level);

                let attrKvArray = [{ k: tottalAttrV.k, v: tottalAttrV.v }]
                let attrConfigEffect = AttrUtils.parseKvArrayToOneAttr(attrKvArray);
                view.currAttrValue.text = `+${attrConfigEffect.getValueStringForUIShow()}`;

            }
            else if (state == 3) {
                let LeagueTechMaxLevelDiff = TableManager.getDataById(table.league.LeagueConstantConfig, ConstLeagueKey.LeagueTechDifference).content.toInt();
                view.tips.text = `不同科技总等级相差不超过${LeagueTechMaxLevelDiff}`;
            }
            view.curAttrCom.x = 231;
        }

        //显示下面的状态
        view.skillName.text = cfg.skillName;
        view.getController("state").selectedIndex = state;


    }


    private selectJob(): void {
        this.jobIndex = this.view.tabList.selectedIndex + 1;
        let hodeIndex = 1;
        //找出能升级的槽位
        for (let i = 1; i <= 8; i++) {
            let state = LeagueModel.ins().getSlotState(this.jobIndex, i);
            if (state == 0 || state == 4) {
                hodeIndex = i;
                break;
            }
        }
        this.holeIndex = hodeIndex;
        this.updateView();
    }

    protected onClose(): void {
        this.onLvUpEnd();
    }

    protected playLvUpAni(): void {
        let aniNode = this.view.modelNode as ModelNode
        aniNode.loadByPath('spine/ui/shengjibiaoxian/shengjibiaoxian1_upper')
        aniNode.playOrders([{
            name: 'enter',
            isLoop: false
        }])
    }
}