import { HeroSkillData } from "../../hero/HeroVo";

declare global {
    namespace IPet {
        type PetSkillData = Omit<HeroSkillData, "isUltimateSkill">
    }
}