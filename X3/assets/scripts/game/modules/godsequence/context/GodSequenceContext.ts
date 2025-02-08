import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { GodSequenceConfigManager } from "db://assets/scripts/game/modules/godsequence/config/GodSequenceConfigManager";
import { FormationManager } from "db://assets/scripts/game/modules/formation/FormationManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import FightType = ServerEnums.FightType;
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import GIns from "../../../GIns";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";

/**
 * 序列验证
 */
export class GodSequenceContext {

    private _typeToLayerNumMap: Map<number, number> = new Map();


    @LogBusiness("重置GodSequence科技 by 登录数据")
    reset(data: Vo.ladder.LadderLoginVo) {
        if (!data) {
            return;
        }
        let map = data.ladderMap;
        if (map) {
            for (let key of Object.keys(map)) {
                let layerNum = map[key] || 0;
                let type = key.toInt();
                this._typeToLayerNumMap.set(type, layerNum);
            }
        }
    }

    getLayerNumByType(type: number) {
        return this._typeToLayerNumMap.get(type) || 0;
    }

    // 最大层
    getMaxLayerNum() {
        let maxLayerNum = 0;
        for (let layerNum of this._typeToLayerNumMap.values()) {
            if (layerNum > maxLayerNum) {
                maxLayerNum = layerNum;
            }
        }
        return maxLayerNum;
    }

    // 最小层
    getMinLayerNum(): number {
        let minLayerNum = -1;
        const typeArray = GodSequenceConfigManager.getAllTypeArray();
        for (let type of typeArray) {
            const otherLayerNum = this._typeToLayerNumMap.get(type) || 0;
            if (minLayerNum < 0) {
                minLayerNum = otherLayerNum;
            }
            if (otherLayerNum < minLayerNum) {
                minLayerNum = otherLayerNum;
            }
        }
        return Math.max(minLayerNum, 0);
    }

    /**
     * 序列进度百分比
     * @param type
     */
    getProgressPercent100(type: number) {
        let maxDiffLayerCount = GodSequenceConfigManager.maxDiffLayerCount;
        // 当前层数
        const curLayerNum = this.getLayerNumByType(type)
        let maxLayerNum = this.getMaxLayerNum();

        // 最低
        let floorLayerNum = Math.max(maxLayerNum - maxDiffLayerCount, 0);

        if (curLayerNum <= 0) {
            return 0;
        }
        if (floorLayerNum <= 0) {
            return (curLayerNum / maxDiffLayerCount) * 100;
        }

        let diffLayerNum = curLayerNum - floorLayerNum;

        return (diffLayerNum / maxDiffLayerCount) * 100;
    }

    isPass(config: table.ladder.LadderConfig) {
        if (!config) {
            return false;
        }
        let type = ServerEnums.Career[config.type];
        let layerNum = config.layerNum;


        let curLayerNum = this.getLayerNumByType(type);
        return curLayerNum >= layerNum;

    }

    // 是否可以继续挑战
    isCanContinueChallenge(type: number, isIgnoredJobCount: boolean): boolean {
        let curLayerNum = this.getLayerNumByType(type);
        let minLayerNum = this.getMinLayerNum();

        let nextLayerNum = curLayerNum + 1;
        const nextC = GodSequenceConfigManager.getConfigByTypeAndLayer(type, nextLayerNum)
        if (!nextC) {
            return false;
        }

        let diffLayer = Math.abs(curLayerNum - minLayerNum);
        // 超过10层偏差, 不允许继续挑战
        const isInDiffLayers = diffLayer < GodSequenceConfigManager.maxDiffLayerCount;
        if (!isInDiffLayers) {
            return false;
        }

        // 忽略职业限制
        if (isIgnoredJobCount) {
            return true;
        }

        // 阵容限制
        const limitJobCount = nextC.limitJobCount;
        const careerType: ServerEnums.Career = ServerEnums.Career[nextC.type];
        const formationVoByType = FormationManager.ins().getFormationVoByType(
            FightType.LADDER,
            0,
            `${careerType}`
        );
        if (!formationVoByType) {
            return false;
        }


        // 满足职业数量
        const countByCareerType = formationVoByType.getCountByCareerType(careerType);
        return countByCareerType >= limitJobCount;
    }

    setLayerNumByType(type: number, layerNum: number) {
        this._typeToLayerNumMap.set(type, layerNum);
    }


    isPassByLayerNum(type: number, layerNum: number) {
        if (layerNum <= 0) {
            return true;
        }
        const c = GodSequenceConfigManager.getConfigByTypeAndLayer(type, layerNum)
        if (!c) {
            return false;
        }
        return this.isPass(c);
    }

    // 是否不可以挑战
    isNotCanChallenge(config: table.ladder.LadderConfig): boolean {
        if (!config) {
            return false;
        }
        let type = ServerEnums.Career[config.type];
        let layerNum = config.layerNum;

        let curLayerNum = this.getLayerNumByType(type);
        return layerNum > (curLayerNum + 1);
    }

    /**
     * 是否当前挑战
     * @param config
     */
    isCurrentChallenge(config: table.ladder.LadderConfig): boolean {

        let type = ServerEnums.Career[config.type];

        const layerNumByType = this.getLayerNumByType(type);
        return config.layerNum == layerNumByType + 1;
    }

    isPassAllByType(type: number) {
        const layerNum = this.getLayerNumByType(type);
        const maxLayerNum = GodSequenceConfigManager.getMaxLayerNumByType(type);
        return layerNum >= maxLayerNum;
    }

    /**
     * 当前关卡限制的职业梳理
     * @param subType
     */
    getCurrentLevelLimitJobCount(subType: number): number {
        const layerNum = this.getLayerNumByType(subType);

        const nextLayer = layerNum + 1;
        const config = GodSequenceConfigManager.getConfigByTypeAndLayer(subType, nextLayer);

        if (!config) {
            return 0;
        }
        return config.limitJobCount;
    }

    /***是否能开启跳过战斗 */
    canSkipBattle(): boolean {
        let skipBattleCond = TableManager.getDataById(table.ladder.LadderConstantConfig, "LADDER:CAN_SKIP_BATTLE");
        let arr = StringUtils.strToArr(skipBattleCond.content)
        return GIns.conditionMgr.checkCondition(arr);
    }
}