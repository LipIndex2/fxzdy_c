/**
 * 阵容信息
 */
export class FormationInfoVo {

    private _captainId: number = 0;
    private _positionVoArray: Vo.formation.PositionVo[] = [];

    static createByServerFormation(vo: Vo.formation.FormationVo): FormationInfoVo {
        const formationInfoVo = new FormationInfoVo();

        formationInfoVo._captainId = vo.captainId;
        // 
        const array = [];
        if (vo.positionVoMap) {
            const keys = Object.keys(vo.positionVoMap);
            for (const key of keys) {
                const pos = vo.positionVoMap[key];
                array.push(pos);
            }
            formationInfoVo._positionVoArray = array;
        }

        return this.create(vo.captainId, array);
    }

    static create(captainId: number,
                  posArray: Vo.formation.PositionVo[]
    ): FormationInfoVo {
        const formationInfoVo = new FormationInfoVo();

        formationInfoVo._captainId = captainId;
        formationInfoVo._positionVoArray = posArray;


        return formationInfoVo;
    }


    get captainId(): number {
        return this._captainId;
    }

    get positionVoArray(): Vo.formation.PositionVo[] {
        return this._positionVoArray;
    }
}