import type { HeroSkillData } from "../../hero/HeroVo"

declare global {
    namespace XJ {
        namespace collections {
            /**
             * region 前后端传输数据类型===================================================================================
             */
            /**
             * 收藏品信息
             */
            interface collectionsVo {
                /**
                 * 唯一Id
                 */
                id: number

                /**
                 * 基础配置Id
                 */
                baseId: number

                /**
                 * 是否激活
                 */
                active: boolean

                /**
                 * 碎片数量
                 */
                fragment: number

                /**
                 * 星级
                 */
                star: number

                /**
                 * 等级
                 */
                level: number

                /**
                 * 失效时间戳，>=0生效
                 */
                expiredTime: number
            }

            /**
             * 收藏品套装信息
             */
            interface CollectionsSuitVo {
                /**
                 * 套装配置Id
                 */
                suitId: number;

                /**
                 * 是否激活
                 */
                activated: boolean;

                /**
                 * 当前激活星数
                 */
                activateStarNum: number;
            }

            /**
             * region 前端自定义数据=======================================================================================
             */
            /**
             * 套装激活星级效果数据
             */
            interface ISetStarEff {
                star: number    //星级
                starAttrs?: Array<{ k: any, v: any }>  //星级属性
                unlockSkills?: string[] //解锁技能， table.collectibles.CollectiblesSkillEffectConfig 表的id
            }

            interface ICollectionSkill {
                /** collectibles.CollectiblesSkillEffectConfig */
                id: string
                /** 默认解锁 */
                unlock?: boolean
            }
        }
    }
}

export { }