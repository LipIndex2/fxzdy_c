/**排行榜接口返回的数据结构*/
export interface IFactoryRankRecData {
    curPage: number
    data: { rank: number, baseVo: Vo.factory.PlayerFactoryBaseVo }[]
    pageSize: number
    total: number
    totalPage: number
}