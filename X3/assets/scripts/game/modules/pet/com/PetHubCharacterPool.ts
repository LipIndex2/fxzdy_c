/**@format */
import { PetHubCharacter } from "./PetHubCharacter";

/** 存储小人实例的对象池 */
export class PetHubCharacterPool {
    private pool: PetHubCharacter[] = [];

    constructor() {}

    public getCharacter(): PetHubCharacter {
        if (this.pool.length > 0) {
            let character = this.pool.pop();
            character.visible = true;
            return character;
        } else {
            return PetHubCharacter.create();
        }
    }

    public releaseCharacter(character: PetHubCharacter): void {
        character.reset();
        this.pool.push(character);
    }
}
