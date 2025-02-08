import { QualityUtils } from "db://assets/scripts/game/modules/common/quality/QualityUtils";
import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { HeroVo } from "../../hero/HeroVo";
import { HeroBaseItem } from "./HeroBaseItem";

/** 英雄带血量列表item */
@bindFguiExtension('ui://comm/HeroItemWithHp')
export class HeroItemWithHp extends fgui.GComponent {
    static pkgName: string = "comm";
    static viewName: string = "HeroItemWithHp";

    //英雄Vo
    private _heroVo: HeroVo;

    protected _curHp: number = 0;

    protected _maxHp: number = 0;

    //点击事件
    public onClickItemFunc: (item: HeroItemWithHp, data: HeroVo) => void;


    private get view(): ui.comm.item.HeroItemWithHp {
        return this as any;
    }

    protected onInit() {
        this.view.G_lockTip.visible = false;
        this.view.on(fgui.Event.CLICK, this.onBtnClick, this)
    }

    protected onPreDispose(): void {

    }

    public get heroBaseComp(): HeroBaseItem {
        return FguiScriptUtils.toMyScriptClass(this.view.baseItem, HeroBaseItem);
    }

    protected onBtnClick() {
        if (this.onClickItemFunc) {
            this.onClickItemFunc(this, this._heroVo);
        }
    }

    public get curHp():number {
        return this.view.hpBar.value;
    }

    /**
     * 设置英雄vo
     * @param heroVo 英雄Vo
     * @param isNew  是否使用初始数据
     */
    public setHeroVo(heroVo: HeroVo) {
        this._heroVo = heroVo;
        this.updateUI();
    }

    public setHp(curHp: number, maxHp: number): void {
        this.view.hpBar.min = 0;
        this.view.hpBar.max = maxHp;
        this.view.hpBar.value = curHp;

        if (curHp <= 0) {
            this.view.G_lockTip.visible = true;
            this.view.lbLockTip.text = '已阵亡';
        } else {
            this.view.G_lockTip.visible = false;
        }
    }

    private updateUI() {
        if (this._heroVo == null) {
            //空对象
            this.view.getController('state').selectedIndex = 1;
            return;
        }
        this.view.getController('state').selectedIndex = 0;
        this.heroBaseComp.setHeroVo(this._heroVo);

        //昵称
        this.view.T_name.text = this._heroVo.heroCfg.name;
        QualityUtils.setFGUIFontColorByQuality(this.view.T_name, this._heroVo.heroCfg.quality);
    }

    /** 是否显示选中框 */
    public isShowGou(isShow: boolean) {
        this.view.G_gou.visible = isShow;
    }
}