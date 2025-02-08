export class EventGodSequenceChangeLayerNum {

    type: number = 0;
    oldLayerNum: number = 0;
    newLayerNum: number = 0;

    static create(
        type: number,
        oldLayerNum: number,
        newLayerNum: number,
    ): EventGodSequenceChangeLayerNum {
        const event = new EventGodSequenceChangeLayerNum()
        event.type = type;
        event.oldLayerNum = oldLayerNum;
        event.newLayerNum = newLayerNum;
        return event
    }
}