import G from "../../../../../core/comm/G";
import { ServerEnums } from "../../../../../libs/extras/ServerEnums";
import GIns from "../../../../GIns";
import { FormationVo } from "../../../formation/vo/FormationVo";

/**星级条件信息*/
export class CollectiblesDungeonConditionVo {
    protected _conditionStr: string;
    protected _type: string = '';
    protected _value1: string = '';
    protected _value2: number = 0;
    protected _desc: string;

    constructor(condition: string) {
        this._conditionStr = condition;
        this.onInit();
    }

    protected onInit(): void {
        let arr = this._conditionStr.split(',');
        if (arr.length >= 3) {
            this._type = arr[0];
            this._value1 = arr[1];
            this._value2 = Number(arr[2]);
        } else {
            //未配置参数
            this._type = arr[0];;
            this._value1 = '';
            this._value2 = 0;
        }
        this.initDesc();
    }

    protected initDesc(): void {
        let type = ServerEnums.CollectiblesDungeonConditionType[this._type];
        switch (type) {
            case ServerEnums.CollectiblesDungeonConditionType.START_BATTLE_AFTER:
                this._desc = `战斗后${this._value2}秒内胜利`;
                break;
            case ServerEnums.CollectiblesDungeonConditionType.DEAD_HEROES_LESS:
                this._desc = `阵亡数小于等于${this._value2}`;
                break;

            case ServerEnums.CollectiblesDungeonConditionType.KEEP_HP_POINT:
                this._desc = `通关时血量大于${this._value2}%`;
                break;

            case ServerEnums.CollectiblesDungeonConditionType.BATTLE_WIN:
                this._desc = `战斗胜利`;
                break;
            case ServerEnums.CollectiblesDungeonConditionType.UP_SET_CAREER:
                let careerCfg = G.TableManager.getDataById(table.hero.HeroClassConfig, this._value1);
                let careerName: string = careerCfg ? careerCfg.name : '';
                this._desc = `上阵${this._value2}个${careerName}英雄 `;
                break;
            case ServerEnums.CollectiblesDungeonConditionType.UP_SET_CAMP:
                let campCfg = G.TableManager.getDataById(table.hero.HeroRaceConfig, this._value1);
                let campName: string = campCfg ? campCfg.name : '';
                this._desc = `上阵${this._value2}个${campName}英雄 `;
                break;
        }
    }

    /**获取条件类型*/
    public get type():ServerEnums.CollectiblesDungeonConditionType {
        return ServerEnums.CollectiblesDungeonConditionType[this._type]
    }

    /**第一个参数数值*/
    public get value1():string {
        return this._value1;
    }

    /**第二个参数数值*/
    public get value2():number {
        return this._value2;
    }

    /**获取描述*/
    public get desc(): string {
        return this._desc;
    }

    /**检测阵容是否符合要求*/
    public checkFormation(vo: FormationVo): boolean {
        let type = ServerEnums.CollectiblesDungeonConditionType[this._type];
        if (type == ServerEnums.CollectiblesDungeonConditionType.UP_SET_CAREER) {
            let careerCnt: number = 0;
            for (let i = 0; i < vo.allPosData.length; i++) {
                let heroId = vo.allPosData[i].heroId;
                if (heroId > 0) {
                    let heroVo = GIns.heroMgr.getHeroVoByID(heroId);
                    if (heroVo && heroVo.heroCfg.career == this._value1) {
                        careerCnt++;
                        if (careerCnt >= this._value2) {
                            return true;
                        }
                    }
                }
            }

        } else if (type == ServerEnums.CollectiblesDungeonConditionType.UP_SET_CAMP) {
            let campCnt: number = 0;
            for (let i = 0; i < vo.allPosData.length; i++) {
                let heroId = vo.allPosData[i].heroId;
                if (heroId > 0) {
                    let heroVo = GIns.heroMgr.getHeroVoByID(heroId);
                    if (heroVo && heroVo.heroCfg.camp + '' == this._value1) {
                        campCnt++;
                        if (campCnt >= this._value2) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
}