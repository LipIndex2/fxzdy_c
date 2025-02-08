import G from "db://assets/scripts/core/comm/G";
import * as fgui from "fairygui-cc"
import { QualityUtils } from "../../common/quality/QualityUtils";
import { ModelNode } from "../../common/node/ModelNode";
import { EnumQuality } from "../../common/quality/enums/EnumQuality";
import { Color } from "cc";
import { UIViewItemDetailsKey } from "../../itemDetails/UIViewItemDetailsKey";
import type { ItemTipsViewOpenArgs } from "../../itemDetails/ItemTipsView";
import GIns from "../../../GIns";

interface IBaseShowPet extends fgui.GComponent {
    petName: fgui.GTextField
    modelNode: ModelNode
    petBtn: fgui.GButton
}


export class petGroupBaseShowPet extends fgui.GComponent {
    protected qualityCtr: fgui.Controller

    private petCfgId: number

    protected get view(): IBaseShowPet {
        return this as any;
    }

    protected onInit() {
        let view = this.view
        this.qualityCtr = view.getController("di");
        view.petBtn.onClick(this.onClickPet, this);
    }

    setData(petCfgId: number) {
        let view = this.view;
        this.petCfgId = petCfgId;
        let petCfg = G.TableManager.getDataById(table.pet.PetConfig, petCfgId);
        let quality = petCfg.quality;
        if (GIns.petCfgMgr.isCanShow(petCfgId)) {
            view.petName.text = petCfg.name;
        } else {
            view.petName.text = "???";
        }
        QualityUtils.setFGUIFontColorByQuality(view.petName, quality);

        let model = view.modelNode as any as ModelNode;
        model.loadByModelId(petCfg.showModelId);

        let di = 0;
        if (quality == EnumQuality.Blue) {
            di = 2;
        } else if (quality == EnumQuality.Purple) {
            di = 3;
        } else if (quality == EnumQuality.Orange) {
            di = 4;
        } else if (quality == EnumQuality.Red) {
            di = 5;
        } else if (quality > EnumQuality.COLORFUL) {
            di = 6;
        }
        view.getController("di").selectedIndex = di;
    }

    setPetColor(color: Color) {
        let animNode = this.view.modelNode.animNode;
        animNode.setColor(color);
    }

    private onClickPet() {
        if (GIns.petCfgMgr.isCanShow(this.petCfgId) == false) {
            return;
        }
        let petItem = G.TableManager.getDataById(table.item.ItemConfig, this.petCfgId);
        G.UIManager.open(UIViewItemDetailsKey.PetTipsView, {
            itemConfig: petItem,
        } as ItemTipsViewOpenArgs);
    }
}