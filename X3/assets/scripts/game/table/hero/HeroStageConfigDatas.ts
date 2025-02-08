import { BaseTableManager } from "../BaseTabeManager";

export class HeroStageConfigDatas extends BaseTableManager<table.hero.HeroStageConfig> {
    /**技能槽位所需等级 */
    private mapSkillPosStage: { [skillPos: number]: number };


    constructor() {
        super(table.hero.HeroStageConfig);
    }

    init() {
        if (!this.mapSkillPosStage) {
            this.mapSkillPosStage = {};

            let configs = this.getAllData();
            for (let i = 0, len = configs.length; i < len; ++i) {
                let config = configs[i];

                if (config.skillPos) {
                    this.mapSkillPosStage[config.skillPos] = config.id;
                }
            }
        }
    }

    /**
     * 判断指定关卡是否解锁了特定技能位置。
     * @param skillPos - 技能位置编号。
     * @param stage - 当前关卡数。
     * @returns 如果技能位置已解锁或不存在，则返回true；否则返回false。
     */
    isUnlockSkillPos(skillPos: number, stage: number) {
        if (!this.mapSkillPosStage) {
            this.init();
        }
        if (!this.mapSkillPosStage[skillPos]) {
            return true;
        }

        return stage >= this.mapSkillPosStage[skillPos];
    }

    public getSkillUnlock
}