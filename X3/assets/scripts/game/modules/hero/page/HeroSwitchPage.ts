import { QualityUtils } from "db://assets/scripts/game/modules/common/quality/QualityUtils";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { AudioManager, SoundType } from "../../../comm/mgr/AudioManager";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { ModelNode } from "../../common/node/ModelNode";
import { EnumRedDotShowType } from "../../common/redDot/enums/EnumRedDotShowType";
import { RedDotUtils } from "../../common/redDot/utils/RedDotUtils";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { HeroManager } from "../HeroManager";
import { HeroVo } from "../HeroVo";

/** 英雄展示页 */
export class HeroSwitchPage extends fgui.GComponent {
    static pkgName: string = "hero";
    static viewName: string = "HeroSwitchPage";

    private _baseId: number = 0;
    private _heroVo: HeroVo;

    private _heroStor: HeroVo[];

    //可升星的herolist
    private _heroVoList: HeroVo[];

    private _heroConstList: HeroVo[];

    private _index = 0;

    private get view(): ui.hero.page.HeroSwitchPage {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onConstruct(): void {
        this.onInit();
    }

    protected onInit() {
        this.view.btn_left.on(fgui.Event.CLICK, this.onBtnClick, this);
        this.view.btn_right.on(fgui.Event.CLICK, this.onBtnClick, this);
        this.view.btn_hero.on(fgui.Event.CLICK, this.onClickPlay, this);
        this.view.HeroStarItem.list_star1.itemRenderer = this.starItem.bind(this);
    }

    /**
     * 更新信息
     * @param baseId 英雄id
     */
    public updateInfo(baseId: number, constList: HeroVo[] = null) {
        if (!baseId) return;
        if (this._baseId != baseId) {
            this._baseId = baseId;
            this._heroVo = HeroManager.ins().getHeroVoByID(baseId);
        }
        this.setAnim();
        this._heroConstList = constList;
        if (constList == null) {
            //没有固定列表就需要每次刷新
            this._heroStor = [];
            this._heroVoList = [];
            let heroArr = HeroManager.ins().getAllHeroStor();
            for (let heroVo of heroArr) {
                if (this._heroVo.posId) {
                    if (heroVo.posId) {
                        this._heroStor.push(heroVo);
                    }
                } else {
                    if (!heroVo.posId && (heroVo.isCanActive || heroVo.heroVoData.isActivate)) {
                        this._heroStor.push(heroVo);

                        if (heroVo.isCanUpStar()) {
                            this._heroVoList.push(heroVo);
                        }
                    }
                }
            }
            //红点
            const redDotCom = RedDotUtils.castComp(this.view.redDot);
            if (this._heroVoList.length > 0) {
                redDotCom.showByType(EnumRedDotShowType.LV_UP_RED);
            } else {
                redDotCom.showByType(EnumRedDotShowType.NULL);
            }
        } else {
            let index = this._heroConstList.findIndex((value) => value.baseId == this._baseId);
            if (index == -1) {
                index = 0;
            }
            let nextIndex: number = index + 1;
            if (nextIndex >= this._heroConstList.length) {
                nextIndex = 0;
            }
            let nextHeroVo = this._heroConstList[nextIndex];
            //红点
            const redDotCom = RedDotUtils.castComp(this.view.redDot);
            if (nextHeroVo.isCanUpStar()) {
                redDotCom.showByType(EnumRedDotShowType.LV_UP_RED);
            } else {
                redDotCom.showByType(EnumRedDotShowType.NULL);
            }
        }

        this.updateUI();


    }

    private updateUI() {
        let self = this.view;
        //名字
        self.T_name.text = this._heroVo.heroCfg.name;
        self.img_camp.icon = ItemUtils.getCampIcon(this._heroVo.heroCfg.camp);
        const quality = this._heroVo.heroCfg.quality;
        QualityUtils.setFGUIFontColorByQuality(self.T_name, quality);

        //星级
        let num = this._heroVo.star % 5;
        self.HeroStarItem.list_star1.numItems = num == 0 ? 5 : num;
        //战力
        self.T_power.text = StringUtils.getFightStr(this._heroVo.getHeroFight + Math.floor((this._heroVo.getHeroFight * GIns.fightMgr.getFightMod()) / 10000));
        //是否上阵
        self.img_isUp.visible = this._heroVo.posId ? true : false;
    }

    public setAnim() {
        let showModelId = this._heroVo.showModelId;
        this.setAnimByModelId(showModelId);
    }

    /**外部调用赋值heroVo 防止预览界面各种逻辑错误*/
    public updateHeroVoById(baseId: number): void {
        this._heroVo = HeroManager.ins().getHeroVoByID(baseId);
    }

    public setAnimByModelId(modelId: number): void {
        let modelNode = this.view.modelNode as ModelNode;
        modelNode.loadByModelId(modelId);
        modelNode.playOrders([
            {
                name: "idle",
                isLoop: true,
            },
        ]);
    }

    private onClickPlay() {
        let modelNode = this.view.modelNode as ModelNode;
        if (!modelNode.animNode || !modelNode.animNode?.isLoaded) {
            G.Logger.error("spine 还没加载");
            GIns.floatingTextMgr.showTips("spine 还没加载");
            return;
        }

        let animNames = this._heroVo.heroCfg.heroAnimName;

        let index = Math.floor(Math.random() * animNames.length);
        let animationName = animNames[index];

        modelNode.playOrders([
            {
                name: animationName,
                isLoop: false,
            },
            {
                name: "idle",
                isLoop: true,
            },
        ]);
    }

    private onBtnClick(evt: any) {
        let btn = evt.currentTarget;
        switch (btn.name) {
            case "btn_left":
                this.getNextHeroId(-1);
                break;
            case "btn_right":
                this.getNextHeroId(1);
                break;
        }
        AudioManager.ins().playSound(SoundType.change);
    }

    //up -1拿上一个，1拿下一个
    private getNextHeroId(up: number) {
        if (this._heroConstList) {
            //固定列表处理
            let index = this._heroConstList.findIndex((value) => value.baseId == this._baseId);
            if (index == -1) {
                index = 0;
            }
            if (up == -1) {
                //上一个
                let prevIndex: number = index - 1;
                if (prevIndex < 0) {
                    prevIndex = this._heroConstList.length - 1;
                }
                FacadeManager.ins().emitNow(NotificationKey.HERO_SWITCH_HERO, this._heroConstList[prevIndex].baseId);
            } else {
                //下一个
                let nextIndex: number = index + 1;
                if (nextIndex >= this._heroConstList.length) {
                    nextIndex = 0;
                }
                FacadeManager.ins().emitNow(NotificationKey.HERO_SWITCH_HERO, this._heroConstList[nextIndex].baseId);
            }
            return
        }
        if (this._heroVoList.length > 1) {
            for (let key in this._heroVoList) {
                let vo = this._heroVoList[key];
                if (vo.baseId == this._baseId) {
                    let index = Number(key) + up;
                    if (index < 0) index = this._heroVoList.length - 1;
                    if (index >= this._heroVoList.length) index = 0;
                    FacadeManager.ins().emitNow(NotificationKey.HERO_SWITCH_HERO, this._heroVoList[index].baseId);
                    return;
                }
            }
            FacadeManager.ins().emitNow(NotificationKey.HERO_SWITCH_HERO, this._heroVoList[0].baseId);
            return;
        } else if (this._heroVoList.length == 1) {
            if (this._heroVoList[0].baseId != this._baseId) {
                FacadeManager.ins().emitNow(NotificationKey.HERO_SWITCH_HERO, this._heroVoList[0].baseId);
                return;
            }
        }
        for (let k in this._heroStor) {
            let data = this._heroStor[k];
            if (data.baseId == this._baseId) {
                let index = Number(k) + up;
                if (index < 0) index = this._heroStor.length - 1;
                if (index >= this._heroStor.length) index = 0;
                FacadeManager.ins().emitNow(NotificationKey.HERO_SWITCH_HERO, this._heroStor[index].baseId);
                return;
            }
        }
    }

    private starItem(index: number, item: ui.comm.item.StarIconItem) {
        item.starIcon.icon = ItemUtils.getStarIcon(this._heroVo.star);
    }
}
