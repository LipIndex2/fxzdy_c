import * as fgui from "fairygui-cc";
import {Color} from "cc";
import G from "../../../../core/comm/G";
import {bindScript} from "../../../../core/comm/UIScriptManager";
import {Logger} from "../../../../core/log/Logger";
import {UICommWin} from "../../../../core/mvc/view/UICommWin";
import {Res} from "../../../../core/res/Res";
import GIns from "../../../GIns";
import NotificationKey from "../../../event/NotificationKey";
import {AttrUtils} from "../../attr/utils/AttrUtils";
import {CollectionItem} from "../com/CollectionItem";
import {ECollectiblesSkillTargetType, UICollectionsKey} from "../const/UICollectionsConfig";
import {Label} from "cc";
import {NodeUtils} from "../../../../core/utils/NodeUtils";
import {Material} from "cc";
import {AssetBundleKeys} from "../../../../core/res/AssetBundleKeys";

declare global {
    namespace XJ {
        namespace collections {
            interface ISetActiveWinParam {
                suitCfgId: number
                activeStar: number  //
            }
        }
    }
}

@bindScript(UICollectionsKey.SET_ACTIVE_WIN)
export class CollectionsSetActiveWin extends UICommWin {
    public static pkgName = "collectibles"
    public static viewName = "CollectionsSetActiveWin"

    private collectionsId: number[]

    get view(): ui.collectibles.ui.win.CollectionsSetActiveWin {
        return this._view as any
    }

    protected onInit() {
        let view = this.view;
        view.list.itemRenderer = this.collectionRenderer.bind(this);

        view.newTip.layout = fgui.GroupLayoutType.Horizontal;
        view.lbAddAtrr.on(fgui.Event.SIZE_CHANGED, ()=>{
            view.newTip.ensureBoundsCorrect();
        });

        let label = view.lbSetName._label;
        label.color = new Color("#FFFFFF");
        G
        Res.getResRefByUrl("effect/color/FontColor", AssetBundleKeys.EFFECT, Material, (ref) => {
            if (!ref) {
                Logger.error("没找到 shader. ");
                return;
            }
            if (NodeUtils.isNotValidNode(label.node)) {
                return;
            }

            label.outlineWidth = 2;
            const material = ref.content;
            if (!material) {
                return;
            }
            label.customMaterial = material;

            label.cacheMode = Label.CacheMode.NONE;

            label.customMaterial.setProperty("color1", new Color("3ce9fe"));
            label.customMaterial.setProperty("color2", new Color("a8e6fe"));
            label.customMaterial.setProperty("color3", Color.WHITE);
        });
    }

    protected onOpen(args: XJ.collections.ISetActiveWinParam, isReopen?: boolean) {
        let view = this.view;
        this.collectionsId = GIns.collectionsCfgMgr.getSuit(args.suitCfgId).map(n => {
            return n.id;
        });

        let suitCfg = G.TableManager.getDataById(table.collectibles.CollectiblesSuitConfig, args.suitCfgId);
        view.lbSetName_di.text = view.lbSetName.text = suitCfg.name;
        if (args.activeStar == 0) {
            //激活套装
            view.lbActiveTip.text = "套装效果[color=#ffffff]已激活[/color]";
            let baseAttr = AttrUtils.parseKvArrayToOneAttr(suitCfg.baseAttrs);
            view.lbAddAtrr.text = `${baseAttr.config.attrName}${baseAttr.getShowValueTextWithSymbol()}`;
        } else {
            //激活*星套装
            let activeSet = GIns.collectionsCfgMgr.getSuitAllStarEffs(args.suitCfgId).find(n => {
                return n.star == args.activeStar;
            });
            if (activeSet) {
                view.lbActiveTip.text = `${activeSet.star}星效果[color=#ffffff]已激活[/color]`;
                if (activeSet.starAttrs) {
                    let starEff = AttrUtils.parseKvArrayToOneAttr(activeSet.starAttrs);
                    view.lbAddAtrr.text = `${starEff.config.attrName}${starEff.getShowValueTextWithSymbol()}`;
                } else if (activeSet.unlockSkills) {
                    let skillDesc = activeSet.unlockSkills.map(id => {
                        let skillEffCfg = G.TableManager.getDataById(table.collectibles.CollectiblesSkillEffectConfig, id);
                        if (skillEffCfg.targetType == ECollectiblesSkillTargetType.HERO) {
                            let heroSkill = G.TableManager.getDataById(table.battle.SkillConfig, skillEffCfg.skillId);
                            return heroSkill.name;
                        } else if (skillEffCfg.targetType == ECollectiblesSkillTargetType.COLLECTIBLES) {
                            let collSkill = G.TableManager.getDataById(table.battle.CollectionSkillConfig, skillEffCfg.skillId);
                            return collSkill.name;
                        }
                    }).join(",");
                    view.lbAddAtrr.text = `${skillDesc}`;
                }
            } else {
                Logger.error(`找不到套装配置 ${args.suitCfgId}, ${args.activeStar}`);
            }
        }
        view.list.numItems = this.collectionsId.length;
    }

    private collectionRenderer(index: number, item: CollectionItem) {
        let collectionsCfgId = this.collectionsId[index];
        item.setData(collectionsCfgId);
    }

    protected onClose() {
        this.emitNow(NotificationKey.COLLECTIONS_SET_ACTIVE_WIN_CLOSE);
    }
}