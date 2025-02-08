import * as fgui from "fairygui-cc";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { HeroUtils } from "db://assets/scripts/game/modules/hero/utils/HeroUtils";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { QualityUtils } from "db://assets/scripts/game/modules/common/quality/QualityUtils";
import G from "db://assets/scripts/core/comm/G";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { EventClickItem } from "db://assets/scripts/game/modules/item/event/EventClickItem";
import { Node, Tween, tween, UITransform, v3 } from "cc";
import { ModelNode } from "db://assets/scripts/game/modules/common/node/ModelNode";
import { NodeUtils } from "db://assets/scripts/core/utils/NodeUtils";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";


enum EnumGainItemType {
    item = 0,
    hero = 1,
    weapon = 2,
}


/**
 * 抽卡获得道具
 */
@bindFguiExtension("ui://drawCard/DrawCardGainItemComp")
export class DrawCardGainItemComp extends fgui.GComponent {
    private _item: NoOwnerItem;


    public static readonly SWEEP_TIME_MS = 3000;
    private _tween: Tween<Node>;

    protected onConstruct() {
        super.onConstruct();

        this.view.visible = false;
        this.view.starComp.starList.setVirtual();
        this.view.starComp.starList.itemRenderer = (index, item) => void {}

        this.view.imageItem.onClick(this.onClickItem, this)
    }

    onClickItem(event: fgui.Event) {
        const itemUI = this.view.imageItem.node.getComponent(UITransform);

        const itemConfig = this._item.getItemConfig();

        // event 点击道具
        G.FacadeManager.emit(NotificationKey.CLICK_ITEM, EventClickItem.create(
            event,
            itemConfig,
            itemUI
        ));
    }


    private get view(): ui.drawCard.components.DrawCardGainItemComp {
        return this as any;
    }


    protected onPreDispose() {
        if (this._tween) {
            this._tween.stop();
            this._tween.destroySelf();
            this._tween = null;
        }


        super.onPreDispose();
        GameTimer.ins().clearAll(this);
    }

// view 

    reset(item: NoOwnerItem) {
        if (!item) {
            return;
        }
        this._item = item;

        // item 
        const itemConfig = item.getItemConfig();
        const qualityConfig = item.getQualityConfig();
        const itemType = item.getItemType();

        const controller = this.getController("itemType");

        const isHero = item.isHero();
        // 高质量才动画
        const isNeedSweepQuality = item.getQuality() > 4;


        this.view.imageItem.icon = itemConfig.iconPath;
        this.view.labelName.text = itemConfig.name;
        this.view.labelItemCount.text = "" + item.count;

        // 品质
        let quality = itemConfig.quality;


        controller.selectedIndex = EnumGainItemType.item;
        if (isHero) {
            // 英雄本体
            controller.selectedIndex = EnumGainItemType.hero;

            // hero config
            const heroConfig: table.hero.HeroConfig = HeroUtils.getHeroConfigById(item.itemId);
            if (heroConfig) {
                this.view.starComp.starList.numItems = heroConfig.initStar;
                this.view.imageItem.icon = ItemUtils.getNormalHeroHead(heroConfig.headPath);
                this.view.labelName.text = heroConfig.name;
                this.view.imageHeroJob.icon = ItemUtils.getCareerIcon(ServerEnums.Career[heroConfig.career]);
                quality = heroConfig.quality;
            }


        } else if (itemType == ServerEnums.ItemType.AWAKE_WEAPON) {
            controller.selectedIndex = EnumGainItemType.weapon;


        } else {
            // 默认道具处理

        }


        // 设置品质相关
        if (qualityConfig) {
            const modelNodePopUp = this.view.modelNodePopUp as ModelNode;
            modelNodePopUp.loadByPath(qualityConfig.drawCardItemPopUpSpinePath)


            // 动画
            const node = this.view.node;

            this._tween?.stop();
            this._tween = tween(node)
                .call(() => {
                    if (NodeUtils.isNotValidNode(node)) {
                        this._tween?.destroySelf();
                        this._tween = null;
                        return;
                    }

                    node.scale = v3(0.3, 0.3, 1);
                    this.view.visible = true;

                    // 弹出
                    modelNodePopUp.playOrders([
                        {
                            name: "animation",
                        }
                    ])
                })
                .to(0.2, {scale: v3(1, 1, 1)})
                .delay(0.1)
                .call(() => {

                    const modelNodeSweep = this.view.modelNodeSweep as ModelNode;
                    modelNodeSweep.visible = false;

                    // 不到品质, 不扫光
                    if (!isNeedSweepQuality) {
                        return;
                    }

                    // 扫光
                    modelNodeSweep.visible = true;
                    GameTimer.ins().clearAll(this);
                    GameTimer.ins().loop(DrawCardGainItemComp.SWEEP_TIME_MS, this, () => {
                        if (NodeUtils.isNotValidNode(node)) {
                            this._tween?.destroySelf();
                            this._tween = null;
                            GameTimer.ins().clearAll(this);

                            return;
                        }

                        this.view.modelNodeSweep.visible = true;

                        // 扫光
                        modelNodeSweep.loadByPath(qualityConfig.drawCardItemSweepSpinePath);
                        modelNodeSweep.clearOrders();
                        modelNodeSweep.playOrders([
                            {
                                name: "animation",
                                callbackForComplete: (spine) => {

                                    spine.clearTracks();
                                    this.view.modelNodeSweep.visible = false;
                                }
                            },
                        ])
                    })
                })
                .start();

            this.view.bg.icon = qualityConfig.itemQualityBgPath;
            this.view.labelName.color = QualityUtils.getQualityColor(quality);
        }

    }
}