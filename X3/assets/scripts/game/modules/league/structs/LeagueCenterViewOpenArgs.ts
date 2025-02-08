export enum EnumLeagueCenterOpenType {
    // 打开 UI 后请求
    REQUEST,
    // 提供好数据
    DATA,
}

export class LeagueCenterViewOpenArgs {

    type: EnumLeagueCenterOpenType = EnumLeagueCenterOpenType.REQUEST;

    leagueId: number = 0;
    
    data: Vo.league.LeagueViewVo = null;

    static createForMe() {
        const args = new LeagueCenterViewOpenArgs();
        args.leagueId = 0;
        return args;
    }
    
    static createForReq(leagueId: number) {
        const args = new LeagueCenterViewOpenArgs();
        args.leagueId = leagueId;
        return args
    }
    static createForData(data: Vo.league.LeagueViewVo) {
        const args = new LeagueCenterViewOpenArgs();
        if (!data) {
            return args;
        }
        args.type = EnumLeagueCenterOpenType.DATA;
        args.leagueId = data.leagueId;
        args.data = data;
        return args
    }
}