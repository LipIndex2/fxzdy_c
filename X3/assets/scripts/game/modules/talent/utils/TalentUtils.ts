import G from "db://assets/scripts/core/comm/G";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

export class TalentUtils {

    // 配置
    static getConfigById(talentId: number): table.talent.TalentConfig {
        return G.TableManager.getDataById(table.talent.TalentConfig, talentId);
    }

    static isBigTalent(talentId: number): boolean {
        const config = this.getConfigById(talentId);
        if (!config) {
            return false;
        }

        const type = ServerEnums.TalentType[config.talentType];
        return type === ServerEnums.TalentType.ADVANCED;
    }
}