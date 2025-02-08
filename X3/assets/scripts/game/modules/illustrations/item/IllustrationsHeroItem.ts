import { assetManager, Color, EffectAsset, Material, math, sp } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { ModelNode } from "../../common/node/ModelNode";
import { FloatingTextManager } from "../../floatingText/FloatingTextManager";
import { UIHeroKey } from "../../hero/const/UIHeroConfig";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { IllustrationsScoreBtn } from "../btn/IllustrationsScoreBtn";
import { IllustrationsI18nKeys } from "../const/IllustrationsI18nKeys";
import { IllustrationsHeroCfg, IllustrationsModel, IllustrationsScoreState } from "../model/IllustrationsModel";
import GIns from "../../../GIns";
import { QualityUtils } from "../../common/quality/QualityUtils";
import { Res } from "../../../../core/res/Res";
import { AssetBundleKeys } from "../../../../core/res/AssetBundleKeys";
import { Logger } from "../../../../core/log/Logger";
import { IHeroInfoPreviewWinOpenArgs } from "../../hero/view/HeroInfoPreviewWin";


/** 图鉴英雄item */
export class IllustrationsHeroItem extends fgui.GComponent {
    static pkgName: string = "illustrations";
    static viewName: string = "IllustrationsHeroItem";

    protected _vo: IllustrationsHeroCfg = null
    protected _activeStar: number = -1
    protected _modelId: number = -1
    protected _isLoaded: boolean = false
    protected _initModelX: number = 0
    protected _initModelY: number = 0
    protected _shadowMtl: Material = null

    private get view(): ui.illustrations.item.IllustrationsHeroItem {
        return this as any;
    }

    protected onInit() {
        this.view.modelNode.setScale(-1.8, 1.8)
        let modeNode = this.view.modelNode as ModelNode
        modeNode.setLoadCompleteListener(() => {
            this._isLoaded = true
            this.handleLoadCompelte()
        })
        this.view.listStar.itemRenderer = this.itemRendererForStar.bind(this)
        this.view.btnBg.onClick(this.onClickItem, this)
        this.view.btnScore.onClick(this.onClickScore, this)
        this._initModelX = modeNode.x
        this._initModelY = modeNode.y
    }

    protected onClickItem(): void {
        //弹出详情
        G.UIManager.open(UIHeroKey.HERO_INFO_PREVIEW_WIN, [{ heroId: this._vo.cfg.id } as IHeroInfoPreviewWinOpenArgs])
    }

    protected onClickScore(): void {
        if (this._vo.state == IllustrationsScoreState.NotDraw) {
            GIns.floatingTextMgr.showTips(G.I18nManager.lang(IllustrationsI18nKeys.getScoreTip))
            return
        }
        if (this._activeStar == -1) {
            //激活
            IllustrationsModel.ins().sendDrawActiveHeroScore({ heroBaseId: this._vo.cfg.id })
        } else if (this._activeStar == 0) {
            //领取第一次升星积分
            IllustrationsModel.ins().sendDrawHeroUpStarScore({ heroBaseId: this._vo.cfg.id, star: this._vo.cfg.initStar + 1 })
        } else {
            IllustrationsModel.ins().sendDrawHeroUpStarScore({ heroBaseId: this._vo.cfg.id, star: this._activeStar + 1 })
        }
    }

    protected itemRendererForStar(index: number, item: ui.comm.item.StarIconItem): void {
        item.starIcon.icon = ItemUtils.getStarIcon(this._vo.showStar)
    }

    protected handleLoadCompelte(): void {
        if (this.view?.node?.isValid && this.view?.modelNode?.visible) {
            let modelNode = this.view.modelNode as ModelNode
            if (modelNode?.spineNode?.isLoaded
                && modelNode?.spineNode?.spine?.isValid
                && modelNode?.spineNode?.spine?.getState()?.getCurrent(0)) {
                if (this._activeStar < 0) {
                    //需要显示待激活状态 停在第一帧
                    modelNode.gotoAndStop(1)
                } else {
                    modelNode.playOrders(
                        [
                            {
                                name: "idle",
                                isLoop: true
                            }
                        ]
                    )
                }
            }
        }
        this.loadMtlComplete()
    }

    protected showModel() {
        this.view.iconSihouette.visible = false
        let modelNode = this.view.modelNode as ModelNode
        if (this._modelId != this._vo.cfg.showModelId) {
            this._modelId = this._vo.cfg.showModelId
            this._isLoaded = false
            modelNode.loadByModelId(this._vo.cfg.showModelId)
            modelNode.spineNode.premultipliedAlpha = false
        }

        let modelCfg = G.TableManager.getDataById(table.model.ModelConfig, this._modelId)
        if (modelCfg) {
            modelNode.visible = true
            if (modelCfg.showOffsetPos) {
                modelNode.x = this._initModelX + modelCfg.showOffsetPos.x
                modelNode.y = this._initModelY + modelCfg.showOffsetPos.y
            } else {
                modelNode.x = this._initModelX
                modelNode.y = this._initModelY
            }
            this.handleLoadCompelte()
            let animNode = modelNode.animNode
            if (animNode) {
                if (this._vo.curStar < 0) {
                    //当前角色未获取
                    animNode.setColor(Color.WHITE)
                    this.showShadow()
                } else if (this._activeStar == -1) {
                    animNode.setColor(math.color(60, 60, 60))
                    this.removeShadow()
                } else {
                    animNode.setColor(Color.WHITE)
                    this.removeShadow()
                }
            }
        } else {
            modelNode.visible = false
        }
    }

    protected hideModel() {
        this.view.modelNode.visible = false
        this.view.iconSihouette.visible = true
    }

    protected showShadow(): void {
        if (this._shadowMtl == null) {
            Res.getResRefByUrl("effect/color/color", AssetBundleKeys.EFFECT, Material, (ref) => {
                if (!ref) {
                    Logger.error("没找到 shader. ");
                    return;
                }
                const material: Material = ref.content;
                if (!material) {
                    return;
                }
                if (this.view?.node?.isValid) {
                    //使用加载好的 effect 初始化材质
                    material.setProperty('setColor', math.color(30, 30, 30, 255));
                    this._shadowMtl = material;
                    this.loadMtlComplete()
                }
            });
        } else {
            this.loadMtlComplete()
        }
    }

    protected loadMtlComplete(): void {
        if (this._shadowMtl == null) {
            return
        }
        let modelNode = this.view.modelNode as ModelNode
        if (modelNode?.spineNode?.spine?.isValid) {
            if (this._vo.curStar < 0) {
                modelNode.spineNode.spine.customMaterial = this._shadowMtl;
            } else {
                this.removeShadow()
            }
        }
    }

    protected removeShadow(): void {
        let modelNode = this.view.modelNode as ModelNode
        if (modelNode?.spineNode?.spine?.isValid) {
            modelNode.spineNode.spine.customMaterial = null;
        }
    }

    public setData(data: IllustrationsHeroCfg): void {
        this._vo = data
        this.view.bgLoader.icon = IllustrationsModel.ins().getItemBgUrl(data.cfg.quality)
        this._activeStar = IllustrationsModel.ins().getHeroStar(data.cfg.id)

        this.showModel()

        this.view.lbName.text = data.cfg.name
        QualityUtils.setFGUIFontColorByQuality(this.view.lbName, data.cfg.quality);

        //星级
        let num = data.showStar % 5
        if (num == 0 && data.showStar > 0) {
            num = 5
        }
        this.view.listStar.numItems = num

        //@ts-ignore
        let btnScore = this.view.btnScore as IllustrationsScoreBtn
        btnScore.updateByScoreAndState(data.score, data.state)
    }
}