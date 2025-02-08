import { Vec2, v2 } from "cc";
import { HeroUnit } from "./unit/battle/HeroUnit";

export default class TeamFormation {
   private static _tempVecA = v2();
   private static _tempVecB = v2();

   // static colRowToTempV2(col: number, row: number, colMax: number, rowMax: number) {
   //    let _tempVec = this._tempVecA;
   //    let d = 80;
   //    let x = 0;
   //    let y = 0;

   //    x = col * 80;
   //    y = row * 80;

   //    return _tempVec.set(x, y);
   // }

   // /**仅最大英雄数量6个 */
   // static setHeroFormationByTeam(_heros: HeroUnit[]) {
   //    let heroTypeMap = { 1: [], 2: [], 3: [] };

   //    let heroes = _heros.slice(); //浅拷贝
   //    heroes.sort((a, b) => {
   //       return b.seatSort - a.seatSort;
   //    })

   //    for (let i = 0; i < heroes.length; i++) {
   //       let hero = heroes[i];
   //       heroTypeMap[hero.seatType].push(hero);
   //    }

   //    for (let type = 1; type <= 3; type++) {
   //       if (heroTypeMap[type].length > 3) {
   //          if (type == 3) {
   //             heroTypeMap[type - 1].push(heroTypeMap[type].splice(3, heroTypeMap[type].length));
   //          } else {
   //             heroTypeMap[type + 1].unshift(heroTypeMap[type].splice(3, heroTypeMap[type].length));
   //          }
   //       }
   //    }

   //    let colArr: HeroUnit[][] = [];
   //    for (let type = 1; type <= 3; type++) {
   //       if (heroTypeMap[type].length) {
   //          colArr.push(heroTypeMap[type]);
   //       }
   //    }

   //    let colNum = colArr.length;
   //    for (let i = 0; i < colArr.length; i++) {
   //       let rowNum = colArr[i].length;
   //       for (let j = 0; j < colArr[i].length; j++) {
   //          colArr[i][j].formationPos = this.colRowToTempV2(i, j, colNum, rowNum);
   //       }
   //    }
   // }

   /**对位坐标 */
   // static setNearFormationPos(heroO: HeroUnit, heroA: HeroUnit, heroB: HeroUnit, posO: number[], posA: number[], posB: number[], teamPos: Vec2) {
   //    if (!heroO) return;

   //    let vecA = this._tempVecA.set(posA[0] + teamPos.x, posA[1] + teamPos.y);
   //    let vecB = this._tempVecB.set(posB[0] + teamPos.x, posB[1] + teamPos.y);

   //    if (heroA && heroB) {
   //       let dis1 = Vec2.distance(heroA.pos, vecA) + Vec2.distance(heroB.pos, vecB);
   //       let dis2 = Vec2.distance(heroA.pos, vecB) + Vec2.distance(heroB.pos, vecA);

   //       if (dis1 <= dis2) {
   //          heroA.formationPos = vecA;
   //          heroB.formationPos = vecB;
   //       } else {
   //          heroA.formationPos = vecB;
   //          heroB.formationPos = vecA;
   //       }
   //    } else if (heroA) {
   //       if (Vec2.distance(heroA.pos, vecA) <= Vec2.distance(heroA.pos, vecB)) {
   //          heroA.formationPos = vecA;
   //       } else {
   //          heroA.formationPos = vecB;
   //       }
   //    }

   //    heroO.formationPos = this._tempVecA.set(posO[0] + teamPos.x, posO[1] + teamPos.y);
   // }

   static setNearFormationPos(heroA: HeroUnit, heroB: HeroUnit, posA: number[], posB: number[], teamPos: Vec2, change: boolean, force: boolean = false) {
      if (!heroA && !heroB)
         return

      if (!change) {
         //不变阵
         if (heroA)
            heroA.formationPos = v2(posA[0] + teamPos.x, posA[1] + teamPos.y);
         if (heroB)
            heroB.formationPos = v2(posB[0] + teamPos.x, posB[1] + teamPos.y);
      }
      else {
         let vecA = this._tempVecA.set(posA[0] + teamPos.x, posA[1] + teamPos.y);
         let vecB = this._tempVecB.set(posB[0] + teamPos.x, posB[1] + teamPos.y);
         if (heroA && heroB) {
            //判断哪个阵位近点
            let dis1 = Vec2.distance(heroA.pos, vecA) + Vec2.distance(heroB.pos, vecB);
            let dis2 = Vec2.distance(heroA.pos, vecB) + Vec2.distance(heroB.pos, vecA);

            if (dis1 <= dis2) {
               heroA.formationPos = vecA;
               heroB.formationPos = vecB;
            } else {
               heroA.formationPos = vecB;
               heroB.formationPos = vecA;
            }
         }
         else if (heroA) {
            if (Vec2.distance(heroA.pos, vecA) <= Vec2.distance(heroA.pos, vecB)) {
               heroA.formationPos = vecA;
            } else {
               heroA.formationPos = vecB;
            }
         }
      }

      if (force) {
         if (heroA) {
            heroA.setPosXY(heroA.formationPos.x, heroA.formationPos.y)
         }
         if (heroB) {
            heroB.setPosXY(heroB.formationPos.x, heroB.formationPos.y)
         }
      }
   }
}