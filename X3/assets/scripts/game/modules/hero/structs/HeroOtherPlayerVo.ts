export class HeroOtherPlayerVo {
    heroId: number;
    lv: number;
    starCount: number;

    static create(
        heroId: number,
        lv: number,
        starCount: number
    ): HeroOtherPlayerVo {
        const vo = new HeroOtherPlayerVo();
        vo.heroId = heroId;
        vo.lv = lv;
        vo.starCount = starCount;
        return vo;
    }

}