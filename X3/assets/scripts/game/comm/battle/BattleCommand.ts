import { Handler } from "../../../core/utils/Handler";
import { BattleLogic } from "./BattleLogic";

export enum BattleCommandType {
    /***显示BUFF特效 */
    showBuffEfect = 1,
    /***显示对白 */
    showTalk,
    /***血量更新 */
    updateHp,
    /**脱离战斗 */
    exitFight,
    /**切换动作 */
    changeAction,
    /**添加BUFF */
    addBuff,
    /**更新BUFF */
    updateBuff,
    /**移除BUFF */
    removeBuff,
    /**添加BUFF特效 */
    addBuffEff,
    /**移除BUFF特效 */
    clearBuffEff,
    /**触发掉落 */
    drop,
    /**战斗状态结束 */
    attackComplete,
    /**开始蓄力 */
    beginCharge,
    /**更新蓄力 */
    updateCharge,
    /**结束蓄力 */
    endCharge,
    /**死亡 */
    onDie,
    /**开始攻击 */
    attack,
    /**更改移动攻击动作 */
    changeMoveAttack,
    /**创建特效 */
    createFightEffect,
    /***收到伤害 */
    hurt,
    /***子弹命中 */
    hit,
    /***子弹特效 */
    bulletEffect,
    /***单位销毁 */
    dispose,
    /***添加到容器 */
    addChild,
    /***采集 */
    beginCollect,
    /***结束采集 */
    endCollect,

    //---------------------特殊指令
    /**更新贞德的旗子颜色 */
    zhenDe,
    /**更新玛丽居里的瓶子颜色 */
    maLiJuLi,
    /**火箭弹旋转角度 */
    rocketBulletRotateToAngle,
    /**无人机轰炸 */
    wuRenJiHongZha,
}

export class BattleCommand {
    public battleLogic: BattleLogic;
    private commandHandlerMap: { [command: string]: Handler } = {};
    private commandUidMap: { [uid: string]: string[] } = {};

    private saveCommandMapList: { [command_uid: string]: any[] } = {}

    public clear(): void {
        this.commandHandlerMap = {};
        this.commandUidMap = {};
        this.saveCommandMapList = {};
    }

    public reg(command: number, uid: number, handler: Handler): void {
        let key = command + "_" + uid;
        this.commandHandlerMap[key] = handler
        if (!this.commandUidMap[uid])
            this.commandUidMap[uid] = []
        this.commandUidMap[uid].push(key)
        let saveCommands = this.saveCommandMapList[command + "_" + uid]
        if (saveCommands?.length) {
            while (saveCommands.length) {
                this.send(command, uid, ...saveCommands.shift())
            }
        }
    }

    public send(command: number, uid: number, ...arg): void {
        if (this.battleLogic.isNotShowBattleEffect())
            return

        let commands = this.commandHandlerMap[command + "_" + uid]
        if (commands) {
            commands.runWith(arg);
        }
        else {
            if (!this.saveCommandMapList[command + "_" + uid]) {
                this.saveCommandMapList[command + "_" + uid] = []
            }
            this.saveCommandMapList[command + "_" + uid].push(arg)
        }
    }

    public remove(uid: number): void {
        let keys = this.commandUidMap[uid];
        if (keys) {
            for (let key of keys) {
                delete this.commandHandlerMap[key]
            }
        }
        delete this.commandUidMap[uid]
    }
}