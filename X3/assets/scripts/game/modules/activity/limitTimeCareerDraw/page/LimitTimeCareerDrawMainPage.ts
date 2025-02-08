import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { ActivityLimitTimeCareerDrawVo } from "../../model/ActivityLimitTimeCareerDrawVo";
import { UIManager } from "../../../../../core/mvc/UIManager";
import { UIActivityKey } from "../../const/UIActivityConfig";
import GIns from "../../../../GIns";
import { ItemUtils } from "../../../item/utils/ItemUtils";
import { QualityUtils } from "../../../common/quality/QualityUtils";
import G from "../../../../../core/comm/G";
import { Tween } from "cc";
import { tween } from "cc";
import { ModelNode } from "../../../common/node/ModelNode";
import { ActivitySyncData } from "../../../../comm/activity/model/ActivityModel";

/**
 * 职业招募page
 */
@bindFguiExtension("ui://activityLimitTimeCareerDraw/LimitTimeCareerDrawMainPage")
export class LimitTimeCareerDrawMainPage extends fgui.GComponent {
    static pkgName: string = "activityLimitTimeCareerDraw";
    static viewName: string = "LimitTimeCareerDrawMainPage";

    private get view(): ui.activityLimitTimeCareerDraw.LimitTimeCareerDrawMainPage {
        return this as any;
    }

    private _vo: ActivityLimitTimeCareerDrawVo;

    private _posY = [];

    private _drawHero: number = 0;

    onInit() {
        this.view.btn_shuaxin.on(fgui.Event.CLICK, this.onRefresh, this);
        this.view.img_sel.on(fgui.Event.CLICK, this.onRefresh, this);
    }

    public setData(vo: ActivityLimitTimeCareerDrawVo) {
        this._vo = vo;

        this.view.getController("c1").selectedIndex = 0;
        if (this._vo.activityVo.recruitId) {
            this.view.getController("c1").selectedIndex = 1;
            let careerCfg = this._vo.careerCfg;
            this.view.img_career.icon = careerCfg.assetPath;
            // this.view.img_career.setScale(0.35, 0.35);
            this.view.T_desc.text = `招募获得英雄时必定为${careerCfg.name}职业`;
        }

        //进游戏第一次不知道为什么遮罩没生效
        this.updateShowHeros();
    }

    //周围的英雄头像
    private updateShowHeros() {
        if (!this._vo.cfg) return;
        let heroIds = this._vo.cfg.showHeroIds;
        for (let i = 0; i < 7; i++) {
            let heroId = heroIds[i];
            if (heroId) {
                let heroVo = GIns.heroMgr.getHeroVoByID(heroId);
                let qualityCfg = QualityUtils.getQualityConfigById(heroVo.heroCfg.quality);
                this.view["item" + i].headItem.img_head.icon = ItemUtils.getNormalHeroHead(heroVo.heroCfg.headPath);
                this.view["item" + i].img_bg.icon = qualityCfg.drawHeadBg;
            } else {
                this.view["item" + i].headItem.img_head.icon = ``;
                this.view["item" + i].img_bg.icon = ``;
            }
            this._posY[i] = this.view["item" + i].y;
        }
        this.showFloatAnim();
    }

    //浮动动画
    private showFloatAnim() {
        for (let i = 0; i < 7; i++) {
            let item = this.view["item" + i];
            Tween.stopAllByTarget(item);
            let num = Math.random() * 1;
            let tween1 = tween(item)
                .to(0.5, { y: this._posY[i] + 3 })
                .to(0.5, { y: this._posY[i] - 3 });

            tween(item).delay(num).repeat(999, tween1).start();
        }
    }

    /** 抽奖动画 */
    public showDrawAnim1(drawHero: number) {
        this.closeAnim();

        this._drawHero = drawHero;

        if (this._vo.isSkip) {
            this.drawHero();
            return;
        }

        this.showDrawAnim(6);
        G.GameTimer.once(300, this, () => {
            this.showDrawAnim(5);
        });
        G.GameTimer.once(500, this, () => {
            this.showDrawAnim(4);
        });
        G.GameTimer.once(700, this, () => {
            this.showDrawAnim(3);
        });
        G.GameTimer.once(850, this, () => {
            this.showDrawAnim(2);
        });
        G.GameTimer.once(900, this, () => {
            this.showDrawAnim(1);
        });
        G.GameTimer.once(950, this, () => {
            this.showDrawAnim(0);
        });
        G.GameTimer.once(1000, this, () => {
            this.showDrawAnim(7);
        });
    }

    //抽奖动画
    private showDrawAnim(i: number) {
        if (i < 7) {
            let item = this.view["item" + i];

            let modelNode = item.modelNode as ModelNode;
            modelNode.loadByPath("spine/ui/Z_zhiyeshilian/Z_zhiyeshilian_zhuanquan");
            modelNode.playOrders([
                {
                    name: "idle",
                    isLoop: false,
                },
            ]);
        }
        if (i == 7) {
            this.view.modelNode.visible = true;
            let modelNode = this.view.modelNode as ModelNode;
            modelNode.loadByPath("spine/ui/Z_zhiyeshilian/Z_zhiyeshilian_baodian");
            modelNode.playOrders([
                {
                    name: "idle",
                    isLoop: false,

                    callbackForComplete: () => {
                        this.view.modelNode.visible = false;
                        this.showFloatAnim();
                        this.drawHero();
                    },
                },
            ]);
        }
    }

    private drawHero() {
        // 抽奖
        let syncData = {
            activityId: this._vo.activityId,
            itemId: "RECRUIT",
            times: this._drawHero,
            key: "RECRUIT",
            hidePopWin: 1,
        } as ActivitySyncData;
        GIns.activityModel.sendActionByKey(syncData);
    }

    //更换英雄
    private onRefresh() {
        UIManager.ins().open(UIActivityKey.LimitTimeCareerDrawWishWin, this._vo);
    }

    protected onPreDispose() {
        super.onPreDispose();
        this.closeAnim();
    }

    private closeAnim() {
        for (let i = 0; i < 7; i++) {
            let item = this.view["item" + i];
            Tween.stopAllByTarget(item);
            if (!item.isDisposed) {
                item.y = this._posY[i];
            }
        }
    }
}
