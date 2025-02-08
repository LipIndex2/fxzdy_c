
export enum UIChooseServerKey {
   ChooseServerWin = "ChooseServerWin",
}

/* 1正常 2满员 3维护*/
export enum ServerState {
   /**推荐 */
   RECOMMEND = 0,
   /**正常 */
   NORMAL = 1,
   /**满员 */
   FULL,
   /**维护 */
   MAINTENANCE,
   /**未开放 */
   UNOPEN,
}