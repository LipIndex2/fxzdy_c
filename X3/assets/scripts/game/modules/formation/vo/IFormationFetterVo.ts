export interface IFromationFetterCntCfgs {
    /**触发需要上阵英雄数量*/
    triggetCnt: number;
    /**被动技能的配置列表*/
    passiveCfgs: table.formation.FormationGroupConfig[];
    /**战队科技的技能表 和被动可能有重叠*/
    captainSkillCfgs:table.formation.FormationGroupConfig[];
    /**全部不区分被动还是战队科技*/
    allCfgs:table.formation.FormationGroupConfig[];
}

export interface IFormationFetterTypeVo {
    typeParam: number,
    cntCfgsMap: Map<number, IFromationFetterCntCfgs>
    minTriggerCnt: number;
    maxTriggerCnt: number;
}

export interface IFormationFetterVo {
    groupType: string;
    typeVoMap: Map<number, IFormationFetterTypeVo>;
}