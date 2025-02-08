import * as fgui from "fairygui-cc";
import { ModelNode } from "../../game/modules/common/node/ModelNode";
import { TableManager } from "../table/TableManager";

declare module "fairygui-cc" {
    interface GComponent {
        showEffectByModel(modelId: number, exData?: any): ModelNode;
        showEffectByUrl(url: string, animName: string): ModelNode;
        showEffectHandler(modelNode: ModelNode, exData?: any);
    }
}

fgui.GComponent.prototype.showEffectByModel = function (modelId: number, exData?: any): ModelNode {
    let modelCfg = TableManager.getDataById(table.model.ModelConfig, modelId);
    if (!modelCfg)
        return null;

    let modelNode = fgui.UIPackage.createObject("comm", "ModelNode") as ModelNode;
    modelNode.loadByModelId(modelId)
    this.showEffectHandler(this, modelNode, exData)
    this.addChild(modelNode)
    return modelNode;
}


fgui.GComponent.prototype.showEffectByUrl = function (url: string, animName: string, exData?: any): ModelNode {
    let modelNode = fgui.UIPackage.createObject("comm", "ModelNode") as ModelNode;
    modelNode.loadByPath(url)
    modelNode.playOrders([
        {
            name: animName,
            isLoop: true
        }
    ])
    this.showEffectHandler(this, modelNode, exData)
    this.addChild(modelNode)
    return modelNode
}

fgui.GComponent.prototype.showEffectHandler = function (parent: fgui.GComponent, modelNode: ModelNode,
    exData?: { x?: number, y?: number, scaleX?: number, scaleY?: number, fix?: number, fiy?: number }): void {
    if (!this.showEffectList)
        this.showEffectList = []
    this.showEffectList.push(modelNode)
    let x = 0;
    let y = 0;
    if (!exData || (exData.x == null && exData.y == null)) {
        x = this.width * 0.5;
        y = this.height * 0.5
    }
    else {
        x = exData.x;
        y = exData.y;
    }
    let fix = exData?.fix || 0;
    let fiy = exData?.fiy || 0;
    modelNode.setPosition(x + fix, y + fiy);
    let scaleX = exData?.scaleX != null ? exData.scaleX : parent.width / modelNode.spineNode.modelWidth;
    let scaleY = exData?.scaleY != null ? exData.scaleY : parent.height / modelNode.spineNode.modelHeight;
    modelNode.setScale(scaleX, scaleY)
}

const __dispose = fgui.GComponent.prototype.dispose;
fgui.GComponent.prototype.dispose = function () {
    if (this.showEffectList) {
        for (let i = 0; i < this.showEffectList.length; i++) {
            let node: ModelNode = this.showEffectList[i]
            if (node.node && node.node.isValid)
                node.dispose()
        }
        this.showEffectList = null;
    }
    __dispose.call(this);
}
