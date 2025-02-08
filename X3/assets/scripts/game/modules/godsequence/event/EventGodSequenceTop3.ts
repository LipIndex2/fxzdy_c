import { RankCommonData } from "db://assets/scripts/game/modules/rank/structs/RankCommonData";


export class EventGodSequenceTop3 {
    
    top3List: RankCommonData[] = []
    
    static create(content:Array<Vo.ranking.RankItemVo>): EventGodSequenceTop3 {
        const event = new EventGodSequenceTop3()
        event.top3List = content.map(item => RankCommonData.createByGodSequence(item))
        return event
    }
}