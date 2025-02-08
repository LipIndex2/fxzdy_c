import { Vec2 } from "cc";
import { WorldManager } from "../../world/WorldManager";
import { HurtNumType } from "../enum/BattleEnum";
import * as fgui from "fairygui-cc";
import { ActorUnitNode } from "../node/ActorUnitNode";
import {
    TargetDownArrowComponent,
    TargetDownArrowComponentOpenArgs
} from "db://assets/scripts/game/ui/guide/view/TargetDownArrowComponent";
import { BattleNum } from "../ui/num/BattleNum";
import RandomUtils from "../../../../core/utils/RandomUtils";
import { StringUtils } from "../../../../core/utils/StringUtils";
import ArrayUtils from "../../../../core/utils/ArrayUtils";
import { BattleManager } from "../BattleManager";
import { AnimBaseUnitNode } from "../node/AnimBaseUnitNode";
import { TableManager } from "../../../../core/table/TableManager";
import { PoolManager } from "../../../../core/pool/PoolManager";
import { SpriteFrameUnitNode } from "../node/SpriteFrameUnitNode";


export default class BattleShowFactory {
    private static hurtNumMap: { [type: number]: BattleNum[] } = {}
    static createNum(type: HurtNumType, val: number, pos: Vec2, offsetY = 100, ...arg) {

        let pkgName = BattleNum.pkgName;
        let viewName: string;
        let isRandomPos = true;
        let str = StringUtils.numShortToKM(Math.abs(val))
        let param: any;
        switch (type) {
            case HurtNumType.Skill:
                viewName = 'HurtNum';
                param = arg
                break
            case HurtNumType.Hurt:
                viewName = 'NormalHurtNum';
                param = arg
                break
            case HurtNumType.CirtNormalHurt:
                viewName = 'NormalHurtNum';
                param = arg
                str = "B" + str;
                break
            case HurtNumType.CirtHurt:
                viewName = 'CritNum';
                param = arg[0]
                str = "B" + str;
                break
            case HurtNumType.CirtHurt:
                viewName = 'CritNum';
                param = arg[0]
                str = "B" + str;
                break
            case HurtNumType.Heal:
                viewName = 'HealNum';
                str = "+" + str;
                break
            case HurtNumType.ShieldNum:
                viewName = 'ShieldNum';
                if (val > 0) {
                    param = 1
                    str = "B+" + str;
                }
                else {
                    param = 2
                    str = "B-" + str;
                }
                break
            case HurtNumType.RealHurtNum:
                viewName = 'RealHurtNum';
                param = arg[0]
                break
            case HurtNumType.CirtRealHurtNum:
                viewName = 'CritRealHurtNum';
                param = arg[0]
                str = "B" + str;
                break
            case HurtNumType.Exp:
                isRandomPos = false;
                viewName = 'MaterialNum';
                str = "E" + str;
                break
            case HurtNumType.Material:
                isRandomPos = false;
                viewName = 'MaterialNum';
                break
            case HurtNumType.AttrDown:
            case HurtNumType.AttrUp:
                isRandomPos = false;
                param = arg[0]
                viewName = 'AttrUpNum';
                break
            case HurtNumType.Abnormal:
                isRandomPos = false;
                param = arg[0]
                viewName = 'AbnormalDownNum';
                break
            case HurtNumType.Other:
                isRandomPos = true;
                param = arg[0]
                viewName = 'OtherNum';
                break

        }

        if (!pkgName || !viewName) return;

        let numCom: BattleNum = this.getHurtNum(type, pkgName, viewName);

        numCom.type = type;
        if (isRandomPos) {
            numCom.node.setPosition(pos.x + RandomUtils.randomInt(-20, 20), pos.y + offsetY + RandomUtils.randomInt(-20, 20));
        } else {
            numCom.node.setPosition(pos.x, pos.y + offsetY);
        }
        numCom.init();
        numCom.setParam(param)
        numCom.setValue(str);
        WorldManager.ins().floatLayer.addChild(numCom.node);
    }

    private static getHurtNum(type: number, pkgName: string, viewName: string): BattleNum {

        let numComs = this.hurtNumMap[type];
        if (!numComs)
            numComs = this.hurtNumMap[type] = [];

        let numCom: BattleNum
        if (numComs.length > 0) {
            numCom = numComs.shift()
            if (!numCom.node?.isValid)
                numCom = this.getHurtNum(type, pkgName, viewName);
        }
        else {
            numCom = fgui.UIPackage.createObject(pkgName, viewName) as BattleNum;
        }

        return numCom;
    }

    /***属性的增益减益状态飘字 */
    static createAttrBuffNum(type: HurtNumType, pos: Vec2, offsetY = 100, effectParm: any) {
        let attrArr: string[] = []
        for (let attrKey in effectParm) {
            ArrayUtils.iPush(attrArr, attrKey)
        }

        for (let i = 0; i < attrArr.length; i++)
            BattleShowFactory.createNum(type, 0, pos, offsetY, attrArr[i])
    }

    static recoveryBattleNum(item: BattleNum): void {
        if (item.node.isValid)
            this.hurtNumMap[item.type].push(item);
    }

    static createDrop(modelId: number, val: number, pos: Vec2, killerUid?: number) {
        let killer = BattleManager.ins().battleLogic.getBatteUintByUid(killerUid);

        let startX = pos.x;
        let startY = pos.y;

        let direction;
        if (killer) {
            direction = startX > killer.pos.x ? 1 : -1
        } else {
            direction = (Math.random() - 0.5);
        }

        let node: ActorUnitNode = new ActorUnitNode();//PoolManager.getItem(ActorUnitNode);
        node.loadByModelId(modelId);

        node.setPosition(startX, startY);
        node.setDirction(direction);
        node.setCompleteListener((aniName: string) => {
            node.destroy();
        });
        WorldManager.ins().floatLayer.addChild(node);
    }

    // static createSuperDrop(itemsIds: number[], pos: Vec2) {
    //     this.showEffectModel(10010040, pos, 1, false, false)
    //     this.showEffectModel(10010041, pos, 1, true, false)
    //     let dir = 1
    //     for (let i = 0; i < itemsIds.length; i++) {
    //         let randPos = v2(pos.x + RandomUtils.randomInt(0, 50 * dir) + 85 * dir, pos.y + RandomUtils.randomInt(-50, 50) - 35)
    //         UnitFactory.createDropUnit(itemsIds[i], randPos, dir)
    //         dir *= -1;
    //     }
    // }

    /**
     * 创建指示箭头 
     * ps: 指引玩家
     * @param args
     */
    static createTipsDownArrow(args: TargetDownArrowComponentOpenArgs) {
        let comp = WorldManager.ins().tipsLayer.getChildByName("tips-down-arrow") as any;
        if (comp && comp instanceof TargetDownArrowComponent) {
            comp.onOpen(args);
            return;
        }

        let fguiComp = fgui.UIPackage.createObject(TargetDownArrowComponent.pkgName, TargetDownArrowComponent.viewName) as TargetDownArrowComponent;
        const node = fguiComp.node;
        node.name = "tips-down-arrow"

        fguiComp.onOpen(args);

        // tips layer
        WorldManager.ins().tipsLayer.addChild(node);

    }

    /**展示特效 */
    static showEffectModel(modelId: number, pos: Vec2, dir: number = 1, isBg: boolean = false, isLoop: boolean = true, modelScale: number = 1): AnimBaseUnitNode {
        let startX = pos.x;
        let startY = pos.y;

        let cfg = TableManager.getDataById(table.model.ModelConfig, modelId)
        let node: AnimBaseUnitNode = cfg.spriteFrame ? PoolManager.getItem(SpriteFrameUnitNode) : PoolManager.getItem(ActorUnitNode);
        // let node: ActorUnitNode = new ActorUnitNode();//PoolManager.getItem(ActorUnitNode);
        node.loadByModelId(modelId, isLoop);
        node.setScale((dir > 0 ? node.getScale().x * modelScale : -node.getScale().x * modelScale), node.getScale().y * modelScale);

        node.setPosition(startX, startY);
        node.setCompleteListener((aniName: string) => {
            if (!node.isLoop)
                node.destroy();
        });

        node.name = modelId + ""

        if (isBg) {
            WorldManager.ins().bgLayer.addChild(node);
        } else {

            WorldManager.ins().effectLayer.addChild(node);
        }

        return node
    }
}
