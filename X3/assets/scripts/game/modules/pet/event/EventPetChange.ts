import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

/**
 * 战技变化事件
 */
export class EventPetChange {
    fightType: XJ.EFightType;
    petId: number;

    static create(fightType: XJ.EFightType, petId: number): EventPetChange {
        const event = new EventPetChange();
        event.fightType = fightType;
        event.petId = petId;
        return event;
    }
}