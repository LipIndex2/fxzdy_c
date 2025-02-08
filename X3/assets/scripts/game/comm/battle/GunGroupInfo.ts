import { Graphics } from "cc";
import { PoolManager } from "../../../core/pool/PoolManager";
import { TableManager } from "../../../core/table/TableManager";
import GIns from "../../GIns";
import { GunInfo } from "./GunInfo";
import { ICaster } from "./skill/ICaster";
import { SkillBehavior } from "./skill/SkillBehavior";
import { BattleDebugManager } from "./BattleDebugManager";

export class GunGroupInfo {
    public id: string
    public cfg: table.battle.GunGroupConfig
    public behavior: SkillBehavior
    public caster: ICaster
    public gunInfoList: GunInfo[] = [];
    public fix: number = 0;
    public fiy: number = 0;
    public notAtkPoint: boolean = false

    private static debuggggg: Graphics
    public init(effectParam: { group: string, fix?: number, fiy?: number, notAtkPoint?: number }, behavior: SkillBehavior, caster: ICaster): void {
        this.id = effectParam.group;
        this.cfg = TableManager.getDataById(table.battle.GunGroupConfig, this.id);
        this.fix = effectParam.fix || 0;
        this.fiy = effectParam.fiy || 0;
        this.notAtkPoint = effectParam.notAtkPoint == 1 ? true : false;
        this.behavior = behavior;
        this.caster = caster;

        if (BattleDebugManager.ins().isDebug) {
            if (!GunGroupInfo.debuggggg || !GunGroupInfo.debuggggg.isValid)
                GunGroupInfo.debuggggg = GIns.worldMgr.shadowLayer.addComponent(Graphics)
            GunGroupInfo.debuggggg.clear()
        }

        for (let i = 0; i < this.cfg.gunArray.length; i++) {
            let info = PoolManager.getItem(GunInfo)
            info.groupInfo = this;
            let outPos = caster.battleLogic.gunGroupMgr.randomGunInfoMap[this.caster.casterUid + "_" + this.cfg.id + "_" + i]
            if (outPos)
                info.setOutPos = outPos
            info.init(this.cfg.gunArray[i], behavior, caster, effectParam)
            this.gunInfoList.push(info)

            if (GunGroupInfo.debuggggg) {
                let randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
                GunGroupInfo.debuggggg.fillColor.fromHEX(randomColor)

                let atkPos = info.getAtkPos()
                let gunStartPos = info.getGunStartPos();
                GunGroupInfo.debuggggg.circle(atkPos.x + gunStartPos.x, atkPos.y + gunStartPos.y, 10)
                // let anglePos = MathUtils.getCoordinates(info.cfg.rotation, 300)
                // let x = anglePos.x + initX;
                // let y = anglePos.y + initY;
                // this.debuggggg.circle(this.caster.pos.x + x, this.caster.pos.y + y, 10)

                GunGroupInfo.debuggggg.stroke();
                GunGroupInfo.debuggggg.fill();
            }
        }
    }

    public initByGroupId(group: string): void {
        this.id = group;
        this.cfg = TableManager.getDataById(table.battle.GunGroupConfig, this.id);
    }

    public update(): boolean {
        if (this.gunInfoList.length) {
            for (var i: number = 0; i < this.gunInfoList.length; i++) {
                let gunInfo: GunInfo = this.gunInfoList[i]
                if (gunInfo.isReadyToRemove) {
                    this.gunInfoList.splice(i, 1);
                    i--;
                }
                else
                    gunInfo.nextFrame();
            }
        }
        if (this.gunInfoList.length == 0)
            return false
        return true;
    }

    public clearAll(): void {
        for (var i: number = 0; i < this.gunInfoList.length; i++) {
            this.gunInfoList[i].destoryTimeCheck()
        }
        this.gunInfoList.length = 0;
    }
}