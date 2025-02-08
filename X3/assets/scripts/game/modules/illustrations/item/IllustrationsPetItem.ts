import { sp } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { IllustrationsScoreBtn } from "../btn/IllustrationsScoreBtn";
import { IllustrationsModel, IllustrationsScoreState, IllustrationsPetCfg } from "../model/IllustrationsModel";
import { IllustrationsI18nKeys } from "../const/IllustrationsI18nKeys";
import { math } from "cc";
import { Color } from "cc";
import GIns from "../../../GIns";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { HeroUtils } from "../../hero/utils/HeroUtils";
import { UIPetKey } from "../../pet/const/UIPetConfig";
import { ModelNode } from "../../common/node/ModelNode";
import { isValid } from "cc";
import { assetManager } from "cc";
import { Material } from "cc";
import { QualityUtils } from "../../common/quality/QualityUtils";
import { Res } from "../../../../core/res/Res";
import { AssetBundleKeys } from "../../../../core/res/AssetBundleKeys";
import { Logger } from "../../../../core/log/Logger";
import NotificationKey from "../../../event/NotificationKey";
import { EventClickItem } from "../../item/event/EventClickItem";
import { ItemTipsViewOpenArgs } from "../../itemDetails/ItemTipsView";
import { UIViewItemDetailsKey } from "../../itemDetails/UIViewItemDetailsKey";

enum EPetItemState {
    notUnlock = 0,  //当前宠物未解锁
    notActive = 1,  //当前图鉴宠物未激活
    star = 2,       //当前图鉴宠物显示领取升星积分状态
    noDraw = 3,     //未满足领取升星积分状态
}

/** 星灵item */
@bindFguiExtension("ui://illustrations/IllustrationsPetItem")
export class IllustrationsPetItem extends fgui.GComponent {
    static pkgName: string = "illustrations";
    static viewName: string = "IllustrationsPetItem";

    protected _vo: Readonly<IllustrationsPetCfg> = null

    protected _activeStar: number = -1
    protected _modelId: number = -1
    protected _isLoaded: boolean = false
    protected _initModelX: number = 0
    protected _initModelY: number = 0
    protected _shadowMtl: Material = null

    protected _itemPetState: EPetItemState

    private get view(): ui.illustrations.item.IllustrationsPetItem {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onInit() {
        let modeNode = this.view.modelNode as ModelNode
        this._initModelX = modeNode.x
        this._initModelY = modeNode.y
        modeNode.setLoadCompleteListener(() => {
            if (isValid(this.view.node) == false) {
                return
            }

            this._isLoaded = true
            this.handleLoadCompelte()
        })

        this.view.listStar.itemRenderer = this.itemRendererForStar.bind(this)
        this.view.btnBg.onClick(this.onClickItem, this)
        this.view.btnScore.onClick(this.onClickScore, this)
    }

    protected itemRendererForStar(index: number, item: ui.comm.item.StarIconItem): void {
        item.starIcon.icon = ItemUtils.getStarIcon(this._activeStar)
    }

    protected onClickItem(): void {
        //弹出详情
        // let param: IPet.TPetInfoPreviewWin_param = {
        //     petCfgId: this._vo.cfg.id,
        //     showMaxInfo: true,
        // }
        // G.UIManager.open(UIPetKey.PET_INFO_PREVIEW_VIEW, param)

        let petItem = G.TableManager.getDataById(table.item.ItemConfig, this._vo.cfg.id);
        G.UIManager.open(UIViewItemDetailsKey.PetTipsView, {
            itemConfig: petItem,
        } as ItemTipsViewOpenArgs);
    }

    protected onClickScore(): void {
        if (this._vo.state == IllustrationsScoreState.NotDraw) {
            GIns.floatingTextMgr.showTips(G.I18nManager.lang(IllustrationsI18nKeys.getScoreTip))
            return
        }
        if (this._itemPetState == EPetItemState.notActive) {
            //激活
            IllustrationsModel.ins().sendDrawActivePetScore({petBaseId: this._vo.cfg.id})
        } else if (this._itemPetState != EPetItemState.noDraw) {
            //领取第一次升星积分
            IllustrationsModel.ins().sendDrawPetUpStarScore({petBaseId: this._vo.cfg.id, star: this._activeStar + 1})
        }
    }

    protected handleLoadCompelte(): void {
        if (this.view?.node?.isValid && this.view?.modelNode?.visible) {
            let modelNode = this.view.modelNode as ModelNode
            if (modelNode?.spineNode?.isLoaded
                && modelNode?.spineNode?.spine?.isValid
                && modelNode?.spineNode?.spine?.getState()?.getCurrent(0)) {
                if (this._itemPetState == EPetItemState.notActive || this._itemPetState == EPetItemState.notUnlock) {
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
                if (this._itemPetState == EPetItemState.notUnlock) {
                    //当前角色未获取
                    animNode.setColor(Color.WHITE)
                    this.showShadow()
                } else if (this._itemPetState == EPetItemState.notActive) {
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
            if (this._itemPetState == EPetItemState.notUnlock) {
                modelNode.spineNode.spine.customMaterial = this._shadowMtl;
            } else {
                this.removeShadow()
            }
        }
    }

    protected removeShadow(): void {
        let modelNode = this.view.modelNode as ModelNode
        if (modelNode?.spineNode?.spine?.isValid) {
            modelNode.spineNode.spine.customMaterial = null
        }
    }

    public setData(data: Readonly<IllustrationsPetCfg>): void {
        this._vo = data
        this._activeStar = GIns.illustrationsModel.getPetStar(data.cfg.id)
        let petVo = GIns.petModel.petContext.getDataByCfgId(data.cfg.id)

        if (!petVo || petVo.active == false) {
            this._itemPetState = EPetItemState.notUnlock
        } else if (this._activeStar < 0) {
            this._itemPetState = EPetItemState.notActive
        } else if (this._activeStar < petVo.star) {
            this._itemPetState = EPetItemState.star
        } else {
            this._itemPetState = EPetItemState.noDraw
        }

        this.view.bgLoader.icon = IllustrationsModel.ins().getItemBgUrl(data.itemCfg.quality)

        this.showModel()
        this.view.lbName.text = data.itemCfg.name
        this.view.lbName.color = QualityUtils.getQualityColor(data.itemCfg.quality)

        //星级
        this.view.listStar.numItems = HeroUtils.getShowStarCount(Math.max(this._activeStar, 0))

        let btnScore = this.view.btnScore as any as IllustrationsScoreBtn
        btnScore.updateByScoreAndState(data.score, data.state)
    }
}