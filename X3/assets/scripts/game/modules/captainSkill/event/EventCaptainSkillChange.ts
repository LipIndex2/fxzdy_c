import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

/**
 * 战技变化事件
 */
export class EventCaptainSkillChange {
    fightType: XJ.EFightType;
    captainId: number;

    static create(fightType: XJ.EFightType, captainId: number): EventCaptainSkillChange {
        const event = new EventCaptainSkillChange();
        event.fightType = fightType;
        event.captainId = captainId;
        return event;
    }
}