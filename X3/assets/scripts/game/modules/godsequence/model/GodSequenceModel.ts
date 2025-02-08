import { BaseModel } from "db://assets/scripts/core/mvc/model/BaseModel";
import { GodSequenceContext } from "db://assets/scripts/game/modules/godsequence/context/GodSequenceContext";
import { EventGodSequenceTop3 } from "db://assets/scripts/game/modules/godsequence/event/EventGodSequenceTop3";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import G from "db://assets/scripts/core/comm/G";
import { GodSequenceConfigManager } from "db://assets/scripts/game/modules/godsequence/config/GodSequenceConfigManager";
import {
    EventGodSequenceChangeLayerNum
} from "db://assets/scripts/game/modules/godsequence/event/EventGodSequenceChangeLayerNum";
import { FightType } from "db://assets/scripts/game/comm/battle/enum/FightType";
import { IBattleResultWinData } from "db://assets/scripts/game/modules/battle/vo/IBattleResultWinData";
import {
    CommonBattleResultViewOpenArgs
} from "db://assets/scripts/game/modules/battle/args/CommonBattleResultViewOpenArgs";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { BattleModel } from "../../battle/model/BattleModel";
import { IBattleEnterData } from "../../battle/vo/IBattleEnterData";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { IBattleResultVo } from "../../common/battle/structs/IBattleResultVo";

/**
 * 序列校验模块
 * @author GameCreator
 */
export class GodSequenceModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 33;
    private _context: GodSequenceContext = new GodSequenceContext();

    constructor () {
        super();
        this.regist();
    }

    public static getModule(): number {
        return this.ins().MODULE;
    }

    /**
     * 注册所有从服务端收到的回调。
     */
    private regist(): void {
        // TODO 注册所有的指令
        let moduleId = this.MODULE;
        this.registerMsg(moduleId, 1, this.recChallengeLadder);
        this.registerMsg(moduleId, 2, this.recLoadTopLadder);
        this.registerMsg(moduleId, -1, this.pushLadderChallengeResult);

    }

    /*********************************协议发送*********************************/
    /**
     * 挑战
     * 模块号：33	指令号：1
     */
    public sendChallengeLadder(c2s: Vo.ladder.ChallengeLadderC2S): void {
        if (BattleModel.ins().setEnterData({ fightType: FightType.LADDER } as IBattleEnterData)) {
            this.emitNow(NotificationKey.LOADING_VIEW_SHOW);
            this.send(this.MODULE, 1, c2s, c2s);
        }
    }

    /**
     * 获取序列排行前几名
     * 模块号：33	指令号：2
     */
    public sendLoadTopLadder(c2s: Vo.ladder.LoadTopLadderC2S): void {
        this.send(this.MODULE, 2, c2s, c2s);
    }

    /*********************************协议监听*********************************/

    /**
     * 挑战
     * 模块号：33	指令号：1
     */
    public recChallengeLadder(data: Vo.ladder.ChallengeLadderS2C): void {
        if (data.code < 0) {
            return;
        }


        console.info("挑战成功! 开始战斗!");

        // loading
        G.FacadeManager.emit(NotificationKey.LOADING_VIEW_SHOW);
        this.emit(NotificationKey.GOD_SEQUENCE_START_CHALLENGE)

    }

    /**
     * 获取序列排行前几名
     * 模块号：33	指令号：2
     */
    public recLoadTopLadder(data: Vo.ladder.LoadTopLadderS2C): void {
        if (data.code < 0) {
            return;
        }

        FacadeManager.ins().emit(NotificationKey.GOD_SEQUENCE_RANK_TOP_3, EventGodSequenceTop3.create(data.content))


    }

    /*********************************协议推送*********************************/

    /**
     * 推送序列校验挑战结果,LadderChallengeVo
     * 模块号：33	指令号：-1
     */
    public pushLadderChallengeResult(vo: Vo.ladder.LadderChallengeVo): void {
        if (!vo) {
            console.error("序列 33/-1 | vo is null");
            return;
        }
        let context = this.context;

        // r
        let rewards = vo.rewardResults;
        if (rewards) {
            FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, rewards);
        }

        // layer
        let ladderConfigId = vo.ladderConfigId;
        let c = GodSequenceConfigManager.getConfigById(ladderConfigId);
        if (!c) {
            console.error(`没找到后端发过来的配置 configId = ${ladderConfigId}`)
            return;
        }
        let type = ServerEnums.Career[c.type];
        const oldLayerNum = context.getLayerNumByType(type);
        let newLayerNum = c.layerNum;

        FacadeManager.ins().emit(NotificationKey.GOD_SEQUENCE_CHANGE_LAYER, EventGodSequenceChangeLayerNum.create(type, oldLayerNum, newLayerNum));

        let isWin = vo.win;
        if (isWin) {
            // 赢了, 更新层数
            context.setLayerNumByType(type, newLayerNum);
        }
        let isCanNextLevel = context.isCanContinueChallenge(type, false);

        let resultVo: IBattleResultVo = { isWin: isWin, fightType: FightType.LADDER };
        this.emit(NotificationKey.BATTLE_RESULT, resultVo);
        this.emit(NotificationKey.BATTLE_RESULT_WIN, {
            fightType: FightType.LADDER,
            isWin: isWin,
            exData: CommonBattleResultViewOpenArgs.create(
                isWin,
                isCanNextLevel,
                NoOwnerItem.createByServerReward(vo.rewardResults),
                () => {
                    this.sendChallengeLadder({
                        ladderConfigId: ladderConfigId + 1,
                    });
                },
                FightType.LADDER,
                5
            )
        } as IBattleResultWinData);

    }

    /********************************* X *********************************/

    initData(data: Vo.ladder.LadderLoginVo) {
        this._context.reset(data)
    }


    get context(): GodSequenceContext {
        return this._context;
    }

}
