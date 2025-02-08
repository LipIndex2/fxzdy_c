export class WorldBossRankVo
{
    /**
		 * 当前名次
		 */		
		rank:number;
		
		/**
		 * 玩家当前排行唯一ID
		 */		
		id:number;
		
		/**
		 * 单次最高伤害
		 */		
		hurt:number;
		
		/**
		 * 排行榜列表  key:页数 value:排行榜列表
		 */		
		list:Map<number,Array<Vo.worldboss.WorldBossRankItemVo>>;
		
		/**
		 * 最大页数
		 */		
		maxPage:number;
   
}