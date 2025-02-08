import * as fgui from "fairygui-cc";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import { UIManager } from "../../../../core/mvc/UIManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import { BtnConfirmViewOpenArgs } from "../../common/confirm/BtnConfirmView";
import { UICommonKey } from "../../common/const/UICommonConfig";
import { CommonI18nKeys } from "../../common/i18n/CommonI18nKeys";
import { GroupType } from "../../hero/HeroEnum";
import { HeroUtils } from "../../hero/utils/HeroUtils";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { FormationManager } from "../FormationManager";
import { IFetterData } from "../vo/IFetterData";
import { FormationRecHeroItem } from "./FormationRecHeroItem";

/** 推荐列表子项 */
export class FromationRecItem extends fgui.GComponent {
    static pkgName: string = "formation";
    static viewName: string = "FromationRecItem";
    public isShowMore = false;

    protected _vo: table.formation.FormationDiscountConfig = null
    protected _rewards: { k: any, v: any }[] = null
    protected _careeList: IFetterData[] = [];
    protected _openIds: number[] = null

    private get view(): ui.formation.item.FromationRecItem {
        return this as any;
    }

    protected onInit(): void {
        // this.view.list_hero.setVirtual()
        this.view.list_hero.itemRenderer = this.itemRendererForHero.bind(this)
        this.view.list_type.itemRenderer = this.itemRendererForType.bind(this)
        this.view.btn_more.onClick(this.onClickMore, this)
        this.view.btn_use.onClick(this.onClickUse, this)
    }

    protected itemRendererForHero(index: number, item: FormationRecHeroItem): void {
        let heroList = this._vo.heroList.split(",");
        item.reset(Number(heroList[index]), String(this._vo.coreHero))

    }

    protected itemRendererForType(index: number, item: ui.formation.item.FromationRecTypeItem): void {
        let data = this._careeList[index];
        item.img_type.icon = ItemUtils.getCareerIcon(data.type);
        item.lb_num.text = "x" + data.num;
    }

    protected onClickMore(): void {
        this.updateMore(!this.isShowMore)
        let index = this._openIds.indexOf(this._vo.id)
        if (this.isShowMore) {
            if (index == -1) {
                this._openIds.push(this._vo.id)
            }

        } else {
            if (index != -1) {
                this._openIds.splice(index, 1)
            }
        }
    }

    public updateMore(isShow) {
        this.isShowMore = isShow;
        this.view.height = this.isShowMore ? 364 : 251;
        this.view.btn_more.scaleY = this.isShowMore ? -1 : 1;
        this.view.grp_more.visible = this.isShowMore;
    }

    protected onClickUse(): void {
        let lackList = FormationManager.ins().getFormationDiscoutLack(this._vo.heroList);
        if (lackList.length > 1) {
            let content = "阵容内所需英雄缺少过多，不建议应用";
            UIManager.ins().open(UICommonKey.BtnConfirmView, {
                title: null,
                titleConfirm: CommonI18nKeys.confirm,
                content: content,
                canCloseByBg: true
            } as BtnConfirmViewOpenArgs);

            return;
        }
        let datas = FormationManager.ins().getFormationDiscountDatas(this._vo.heroList, lackList);
        if (lackList.length == 1) {
            let heroCfg = HeroUtils.getHeroConfigById(Number(lackList[0]));
            let color: string = ItemUtils.getTextColorText(heroCfg?.quality)
            let heroName = color ? `<color=${color}>${heroCfg.name}</color>` : heroCfg.name;
            let content = `该阵容内${heroName}并未获得，是否确认应用？`;
            UIManager.ins().open(UICommonKey.BtnConfirmView, {
                title: null,
                titleCancel: CommonI18nKeys.cancel,
                titleConfirm: CommonI18nKeys.confirm,
                content: content,
                onBtnYes: () => {
                    FacadeManager.ins().emit(NotificationKey.FORMATION_DISCOUNT_SETECT, datas);
                }
            } as BtnConfirmViewOpenArgs);

            return;
        }

        FacadeManager.ins().emit(NotificationKey.FORMATION_DISCOUNT_SETECT, datas);
    }

    public setData(vo: table.formation.FormationDiscountConfig, openIds: number[]): void {
        this._vo = vo;
        this._openIds = openIds
        let heroList = this._vo.heroList.split(",");
        this.view.list_hero.numItems = heroList.length;
        this.view.lb_name.text = vo.groupName;
        this.view.lb_tips.text = vo.tips;
        this._careeList = this.getCareeCount();
        this.view.list_type.numItems = this._careeList.length;
        this.isShowMore = openIds?.indexOf(vo.id) != -1
        this.updateMore(this.isShowMore);

        if (this._careeList.length <= 0) {
            //没有羁绊
            this.view.lbBond.text = '激活羁绊：无'
        } else {
            this.view.lbBond.text = '激活羁绊：'
        }
    }


    private getCareeCount() {
        let heroList = this._vo.heroList.split(",");
        let arr: IFetterData[] = [];
        let mashL = {}
        for (let heroId of heroList) {
            let heroCfg = HeroUtils.getHeroConfigById(Number(heroId));
            let career = ServerEnums.Career[heroCfg.career];
            mashL[career] = mashL[career] || 0;
            mashL[career]++;
        }
        for (let i in mashL) {
            let lvCfg = FormationManager.ins().getDefaultFormationVo().getCampFetterLvCfg(GroupType.CAREER, Number(i), mashL[i]);
            if (lvCfg) {
                arr.push({ num: lvCfg.triggerCount, type: Number(i) })
            }
        }

        arr.sort((a, b) => {
            return b.num - a.num;
        })
        return arr;
    }
}