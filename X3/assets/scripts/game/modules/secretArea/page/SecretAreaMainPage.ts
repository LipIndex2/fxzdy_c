import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { TableManager } from "../../../../core/table/TableManager";
import { FightType } from "../../../comm/battle/enum/FightType";
import { HeroItem } from "../../common/item/HeroItem";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { UIFormationKey } from "../../formation/const/UIFormationConfig";
import { FormationManager } from "../../formation/FormationManager";
import { PositionVo } from "../../formation/vo/PositionVo";
import { HeroManager } from "../../hero/HeroManager";
import { UISecretAreaKey } from "../const/UISecretAreaConfig";
import { SecretAreaManager } from "../SecretAreaManager";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";

type TAwardType = { k: number; v: number };

/** 秘境主界面 Page-item */
@bindFguiExtension("ui://secretArea/SecretAreaMainPage")
export class SecretAreaMainPage extends fgui.GComponent {
    static pkgName: string = "secretArea";
    static viewName: string = "SecretAreaMainPage";

    private _cfg: table.secretinstance.SecretInstanceConfig;

    private _awardListFirst: TAwardType[] = [];
    private _awardListDrop: TAwardType[] = [];
    private _formationVo: PositionVo[] = [];

    private get view(): ui.secretArea.page.SecretAreaMainPage {
        return this as any;
    }

    onInit() {
        this.view.list_award_first.itemRenderer = (index: number, item: ui.comm.item.ItemFrameBtnWithFirst) => {
            this.awardItem(index, item, this._awardListFirst);
        }
        this.view.list_award_draw.itemRenderer = (index: number, item: ui.comm.item.ItemFrameBtnWithFirst) => {
            this.awardItem(index, item, this._awardListDrop);
        }
        this.view.list_hero.itemRenderer = this.heroItem.bind(this);

        this.view.btn_formation.on(fgui.Event.CLICK, this.formation, this);
        this.view.btn_award.on(fgui.Event.CLICK, this.openAwardWin, this);
    }

    public updateData(id: number) {
        if (!id) return;
        this._cfg = TableManager.getDataById(table.secretinstance.SecretInstanceConfig, id);
        this._formationVo = [];
        let formation = SecretAreaManager.ins().formation.allPosData;
        for (let key in formation) {
            if (formation[key] && formation[key].heroId) {
                this._formationVo.push(formation[key]);
            }
        }

        this.view.list_hero.numItems = this._formationVo.length;
        this._awardListFirst = this._cfg.firstRewards;
        this._awardListDrop = this._cfg.rewardStr;
        this.view.list_award_first.numItems = this._awardListFirst.length;
        this.view.list_award_draw.numItems = this._awardListDrop.length;
    }

    private awardItem(index: number, item: ui.comm.item.ItemFrameBtnWithFirst, awardList: TAwardType[]) {
        let data = awardList[index];
        let itemFrame = item.itemFrame as unknown as ItemFrameBtn;
        itemFrame.reset(data.k, data.v);
        itemFrame.setTopCount(data.v);
        if (this._cfg.firstRewards === awardList) {
            item.pFirst.visible = true;
            item.getController('style').selectedIndex = 0;
            itemFrame.isShowCount(true);
            itemFrame.setHaveGain(SecretAreaManager.ins().level >= this._cfg.id);
        } else {
            item.pFirst.visible = false;
            itemFrame.isShowCount(false);
            itemFrame.setHaveGain(false);
        }
    }

    private heroItem(index: number, item: HeroItem) {
        let data: PositionVo = this._formationVo[index];
        let heroVo = HeroManager.ins().getHeroVoByID(data.heroId);
        item.setHeroVo(heroVo);
        item.setLevel(data.soltVo.level);
        item.isShowCareer(false);
        item.isShowCamp(false);
    }

    private formation() {
        FormationManager.ins().addAutoFightParam(FightType.SECRET_INSTANCE, this._cfg.id);
        G.UIManager.open(UIFormationKey.FORMATION_MAIN_VIEW, { type: FightType.SECRET_INSTANCE });
    }

    private openAwardWin() {
        G.UIManager.open(UISecretAreaKey.SecretAreaAwardView);
    }
}
