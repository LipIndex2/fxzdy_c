import { Handler } from "../../../../core/utils/Handler";
import { AudioManager, SoundType } from "../../mgr/AudioManager";
import { BattleCommandType } from "../BattleCommand";
import { BattleUtils } from "../BattleUtils";
import BattleConstantConfig from "../config/BattleConstantConfig";
import { ActorUnitNode } from "../node/ActorUnitNode";
import { RebirthBar } from "../ui/RebirthBar";
import { HeroUnit } from "../unit/battle/HeroUnit";
import { MineralUnit } from "../unit/MineralUnit";
import { BattleShowUnit } from "./BattleShowUnit";
import { Node } from "cc";
import { BattleDebugManager } from "../BattleDebugManager";
import { WorldManager } from "../../world/WorldManager";
import * as fgui from "fairygui-cc";
import { GameTimer } from "../../../../core/timer/GameTimer";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import NotificationKey from "../../../event/NotificationKey";

export class HeroShowUnit extends BattleShowUnit {
    public unitData: HeroUnit;
    private collectEffect: ActorUnitNode;
    private digSoundUid: number
    private extractSoundUid: number;

    private rebirthBar: RebirthBar;

    private debugNode: Node
    private testLab: fgui.GTextField

    public onInitData(): void {
        super.onInitData()
        this.rebirthBar = new RebirthBar(this.unitData);

        if (BattleDebugManager.ins().isDebug) {
            if (!this.debugNode) {
                this.debugNode = new Node()
                WorldManager.ins().effectTopLayer.addChild(this.debugNode);
            }

            // this.testLab = new fgui.GTextField()
            // this.testLab.fontSize = 20;
            // this.testLab.text = "speed:10000"
            // this.testLab.width = 100;
            // this.testLab.color = Color.WHITE;
            // this.testLab.align = HorizontalTextAlignment.CENTER
            // this.debugNode.addChild(this.testLab.node);
            // this.testLab.x = this.pos.x;
            // this.testLab.y = -this.pos.y
        }

        this.unitData.battleLogic.effectMgr.showSkillCD(this.unitData, this.unitData.attr.getSkillByIndex(2, true))
    }

    public update(): void {
        this.updateTestLabPos();
        this.updateRebirthBarPos()
        super.update()
    }

    protected updateRebirthBarPos(): void {
        if (this.rebirthBar)
            this.rebirthBar.setPosition(this.pos.x, this.pos.y)
    }

    protected updateTestLabPos(): void {
        if (this.testLab) {
            this.testLab.x = this.pos.x - 50;
            this.testLab.y = -this.pos.y - this.modelHeight;
            this.testLab.text = "speed:" + this.unitData.attr.moveSpeed;
        }
    }

    /***初始化监听的战斗指令 */
    protected initCommand(): void {
        super.initCommand();
        this.unitData.battleLogic.command.reg(BattleCommandType.beginCollect, this.uid, new Handler(this, this.beginCollect))
        this.unitData.battleLogic.command.reg(BattleCommandType.endCollect, this.uid, new Handler(this, this.endCollect))
    }

    /***隐藏复活框 */
    public hideRebirthBar(): void {
        this.rebirthBar.hide()
    }

    public onRebirth(): void {
        this.rebirthBar.onRebirth();
        if (!this.unitData.battleLogic.battleSetting.isCanActiveRebirth) {
            this.visible = true
            this.node.fadeIn(1000)
        }
        FacadeManager.ins().emit(NotificationKey.BATTLE_PLAY_UNIT_REVIVE, this.unitData);
    }

    public showRebirthBar(): void {
        this.rebirthBar.onDie(this.unitData.attr.rebirthMaxTime)
    }

    public updateRebirthBar(rebirthTime: number): void {
        if (this.rebirthBar)
            this.rebirthBar.updateRebirthBar(rebirthTime)
    }

    protected beginCollect(collectTarget: MineralUnit) {
        let collectAction = collectTarget.getCollcetAction()
        if (collectAction == "extract") {
            //采气
            AudioManager.ins().stopOtherMusic(this.extractSoundUid)
            this.extractSoundUid = AudioManager.ins().playOtherMusic(SoundType.extract, false, false)
            if (this.collectEffect && this.collectEffect.isValid)
                this.collectEffect.destroy()
            let node = new Node()
            this.collectEffect = new ActorUnitNode();
            // this.collectEffect.setPosition(8, -2)
            this.collectEffect.loadByModelId(1, false)
            this.collectEffect.setScale(1, 1)
            node["spine"] = this.collectEffect;
            node.addChild(this.collectEffect)
            if (this.node instanceof ActorUnitNode)
                this.node.addScoket("root/absorb", node)
            this.showTalk(BattleUtils.getUnitTalk(BattleConstantConfig.talkQiData, BattleConstantConfig.talkQiData.talkProbability), 400)
        }
        else {
            //采矿
            AudioManager.ins().stopOtherMusic(this.digSoundUid)
            this.digSoundUid = AudioManager.ins().playOtherMusic(SoundType.dig, false, false)
            this.showTalk(BattleUtils.getUnitTalk(BattleConstantConfig.talkKuangData, BattleConstantConfig.talkKuangData.talkProbability), 400)
        }
        collectTarget.showHurtEffect()
    }

    protected endCollect(): void {
        if (this.collectEffect && this.collectEffect.isValid)
            this.collectEffect.destroy()
        AudioManager.ins().stopOtherMusic(this.extractSoundUid)
        AudioManager.ins().stopOtherMusic(this.digSoundUid)
    }

    /***死亡动作播放完回调 */
    protected onDieActionComplete(): void {
        if (this.unitData.battleLogic.battleSetting.isCanActiveRebirth)
            return

        this.node.fadeOut(1000)
        GameTimer.ins().once(this.delayToDispose, this, () => {
            if (!this.isDisposed) {
                this.visible = false
            }
        })
    }

    /***设置边缘隐藏 */
    public setEdgeHide(v: boolean): void {
    }

    /**销毁 */
    dispose() {
        super.dispose()
        if (this.rebirthBar)
            this.rebirthBar.dispose()
    }
}