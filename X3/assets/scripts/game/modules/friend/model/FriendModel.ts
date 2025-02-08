import G from "../../../../core/comm/G";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import NotificationKey from "../../../event/NotificationKey";
import { AccountModel } from "../../account/model/AccountModel";
import { PrivilegeAdditionController } from "../../vip/PrivilegeAdditionController";
/**
 * 好友模块定义信息
 * @author GameCreator
 */
export class FriendModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 39;

    /**好友id列表*/
    protected _friendIds: number[] = []
    /**黑名单id列表*/
    protected _blackIds: number[] = []
    /**我已申请好友的角色id*/
    protected _myAppliedForIds: number[] = []

    /**是否需要刷新好友列表*/
    protected _friendDirty: boolean = true
    /**是否需要刷新黑名单列表*/
    protected _blackDirty: boolean = true
    /**是否需要刷新申请列表*/
    protected _applyDirty: boolean = true
    /**收到的好友申请数量*/
    protected _newApplyCount: number = 0
    /**是否需要刷新推荐列表*/
    protected _recommendDirty: boolean = true

    /**好友简要数据 主要是在未获取好友列表前处理红点用的*/
    protected _friendSimpleDatas: Vo.friend.SingleFriendSimpleVo[] = []
    /**好友列表*/
    protected _friends: Vo.friend.SingleFriendVo[] = []
    /**黑名单列表*/
    protected _blacks: Vo.friend.FriendQueryVo[] = []
    /**申请列表*/
    protected _applies: Vo.friend.FriendApplyVo[] = []
    /**推荐好友列表*/
    protected _recommends: Vo.friend.FriendQueryVo[] = []

    /**好友列表刷新间隔 (毫秒) 主要是为了刷新战力通关数这些动态会改变的数据*/
    protected _friendRefreshInterval: number = 3600000
    /**黑名单列表刷新间隔 (毫秒) 主要是为了刷新战力通关数这些动态会改变的数据*/
    protected _blackRefreshInterval: number = 3600000
    /**申请列表刷新间隔 (毫秒) 主要是为了刷新战力通关数这些动态会改变的数据*/
    protected _applyRefreshInterval: number = 3600000
    /**申请列表刷新间隔 (毫秒) 主要是为了刷新战力通关数这些动态会改变的数据*/
    protected _recommendRefreshInterval: number = 5000

    protected _lastFriendRefreshTime: number = 0
    protected _lastBlackRefreshTime: number = 0
    protected _lastApplyRefreshTime: number = 0
    protected _lastRecommendRefreshTime: number = 0

    /**配置数据*/
    protected _constDataMap: Map<string, number> = new Map()
    /**今日已赠送好友礼物次数*/
    public giftGiveCount: number;
    /**今日已领取好友礼物次数*/
    public giftDrawCount: number;
    /**上次点击刷新推荐好友时间*/
    public lastClickRefreshRecommendTime: number = 0

    constructor() {
        super();
        this.regist();
    }

    public static getModule(): number {
        return this.ins().MODULE;
    }

    listenNotifications(): string[] {
        return []
    }

    notificationHandler(event: string, args?: any): void {

    }

    /**
     * 注册所有从服务端收到的回调。
     */
    private regist(): void {
        // TODO 注册所有的指令
        let moduleId = this.MODULE;
        this.registerMsg(moduleId, 1, this.recGetInfo);
        this.registerMsg(moduleId, 2, this.recGiveAndDrawGift);
        this.registerMsg(moduleId, 3, this.recGiveAndDrawAllFriendGift);
        this.registerMsg(moduleId, 4, this.recGiveAndDrawAllGift);
        this.registerMsg(moduleId, 5, this.recGetBlacklist);
        this.registerMsg(moduleId, 6, this.recBlacklist);
        this.registerMsg(moduleId, 7, this.recRemoveFromBlacklist);
        this.registerMsg(moduleId, 8, this.recGetApplyInfo);
        this.registerMsg(moduleId, 9, this.recAgreeApply);
        this.registerMsg(moduleId, 10, this.recDisagreeApply);
        this.registerMsg(moduleId, 11, this.recAgreeAllApply);
        this.registerMsg(moduleId, 12, this.recDisagreeAllApply);
        this.registerMsg(moduleId, 13, this.recApplyFriends);
        this.registerMsg(moduleId, 14, this.recDeleteFriend);
        this.registerMsg(moduleId, 15, this.recQueryPlayerByName);
        this.registerMsg(moduleId, 16, this.recQueryPlayerById);
        this.registerMsg(moduleId, 17, this.recGetRecommendPlayers);
        this.registerMsg(moduleId, 18, this.recChallenge);
        this.registerMsg(moduleId, 19, this.recGetSingleFriendSimpleVos);
        this.registerMsg(moduleId, -1, this.pushNewApply);
        this.registerMsg(moduleId, -2, this.pushBeGivenFriendGift);
        this.registerMsg(moduleId, -3, this.pushNewFriend);
        this.registerMsg(moduleId, -4, this.pushApplyBeRemove);
        this.registerMsg(moduleId, -5, this.pushBeDelete);
        this.registerMsg(moduleId, -6, this.pushFriendOffline);
        this.registerMsg(moduleId, -7, this.pushFriendOnline);
    }

    /**初始化帐数据 */
    public initData(vo: Vo.friend.FriendLoginVo): void {
        this.clearData()
        this._friendIds = vo.friendIds
        this._blackIds = vo.blacklist
        this._myAppliedForIds = vo.myApplies
        this._newApplyCount = vo.beAppliedCount
        this.giftGiveCount = vo.giftGiveCount
        this.giftDrawCount = vo.giftDrawCount
        if (vo?.simpleVos) {
            this._friendSimpleDatas = vo.simpleVos
        }
        this.emit(NotificationKey.FRIEND_INIT_COMPLETE)
    }

    /*********************************数据处理*********************************/

    /**好友排序*/
    protected sortFriends(list: Vo.friend.SingleFriendVo[]): void {
        let curServer: string = AccountModel.ins().inServerName
        list?.sort((a, b) => {
            if (a.playerVo.baseVo.fight != b.playerVo.baseVo.fight) {
                //优先高战力
                return b.playerVo.baseVo.fight - a.playerVo.baseVo.fight
            } else if (a.playerVo.serverName == curServer && b.playerVo.serverName != curServer) {
                //其次优先本服
                return -1
            } else if (a.playerVo.serverName != curServer && b.playerVo.serverName == curServer) {
                //其次优先本服
                return 1
            }
        })
    }

    /**黑名单排序*/
    protected sortBlacks(list: Vo.friend.FriendQueryVo[]): void {
        list?.sort((a, b) => {
            //按照战力排序
            return a.playerVo.baseVo.fight - b.playerVo.baseVo.fight
        })
    }

    /**申请列表排序*/
    protected sortApplies(list: Vo.friend.FriendApplyVo[]): void {
        list?.sort((a, b) => {
            //按照时间排序
            return b.applyTime - a.applyTime
        })
    }

    protected updateFriendBySimpleData(data: Vo.friend.SingleFriendSimpleVo): Vo.friend.SingleFriendVo {
        let friendVo = this._friends?.find((value) => value.playerVo.baseVo.id == data.playerId)
        if (friendVo) {
            friendVo.drawState = data.drawState
            friendVo.giveState = data.giveState
            return friendVo
        }
        return null
    }

    protected updateFriendSimpleBySimpleData(data: Vo.friend.SingleFriendSimpleVo): Vo.friend.SingleFriendSimpleVo {
        let friendVo = this._friendSimpleDatas?.find((value) => value.playerId == data.playerId)
        if (friendVo) {
            friendVo.drawState = data.drawState
            friendVo.giveState = data.giveState
            return friendVo
        }
        return null
    }

    protected getConstConfig(id: string, defaultValue: string = ''): string {
        let constCfg = G.TableManager.getDataById(table.friend.FriendConstantConfig, id)
        if (constCfg) {
            return constCfg.content
        }
        return defaultValue
    }

    protected getConstNumberData(id: string, defaultValue: number = 0): number {
        if (this._constDataMap.has(id)) {
            return this._constDataMap.get(id)
        }
        let value = Number(this.getConstConfig(id, defaultValue + ''))
        this._constDataMap.set(id, value)
        return value
    }

    public resetGiveAndDrawCount(): void {
        //每日赠送数据变更 就当做好友数据变更处理
        this._friendDirty = true
        this.emit(NotificationKey.FRIEND_DATA_ID_CHANGE)
        //粗暴处理过天直接请求一次好友列表
        this.sendGetInfo()
    }

    /**最大好友数量*/
    public get maxFriendCount(): number {
        let maxCount = this.getConstNumberData('FRIEND_MAX_COUNT')
        return maxCount + PrivilegeAdditionController.ins().getFriendAmount()
    }

    /**最大申请数量*/
    public get maxApplyCount(): number {
        return this.getConstNumberData('APPLY_MAX_COUNT')
    }

    /**最大黑名单数量*/
    public get maxBlackCount(): number {
        return this.getConstNumberData('BLACKLIST_MAX_SIZE')
    }

    /**最大赠送礼物数量*/
    public get maxGiveGiftCount(): number {
        return this.getConstNumberData('FRIEND_GIFT_GIVE_MAX_COUNT')
    }

    /**最大接受礼物数量*/
    public get maxDrawGiftCount(): number {
        return this.getConstNumberData('FRIEND_GIFT_DRAW_MAX_COUNT')
    }

    /**好友推荐刷新间隔*/
    public get recommendRefreshInterval(): number {
        return this.getConstNumberData('RECOMMEND_REFRESH_INTERVAL')
    }

    /**好友id列表*/
    public get friendIds(): number[] {
        return this._friendIds
    }

    /**好友数量*/
    public get friendCount(): number {
        return this._friendIds.length
    }

    /**黑名单数量*/
    public get blackCount(): number {
        return this._blackIds.length
    }

    /**获取申请数量*/
    public get applyCount(): number {
        return this._newApplyCount
    }

    /**获取好友列表*/
    public get friends(): Vo.friend.SingleFriendVo[] {
        return this._friends
    }

    /**获取黑名单数据*/
    public get blacks(): Vo.friend.FriendQueryVo[] {
        return this._blacks
    }

    /**获取申请列表*/
    public get applies(): Vo.friend.FriendApplyVo[] {
        return this._applies
    }

    /**获取推荐列表*/
    public get recommends(): Vo.friend.FriendQueryVo[] {
        return this._recommends
    }

    /**是否有可领取或者赠送的礼物*/
    public hasGiveOrDrawGift(): boolean {
        if (this.giftDrawCount >= this.maxDrawGiftCount && this.giftGiveCount >= this.maxGiveGiftCount) {
            //赠送和领取数量都用完了
            return false
        }
        let hasGift: boolean = false
        for (let i = 0; i < this._friends.length; i++) {
            if (this._friends[i].drawState == 2 && this.giftDrawCount < this.maxDrawGiftCount) {
                //有礼物未领取
                hasGift = true
                break
            }
            if (this._friends[i].giveState == 1 && this.giftGiveCount < this.maxGiveGiftCount) {
                //有礼物未赠送
                hasGift = true
                break
            }
        }
        return hasGift
    }

    /**是否有可领取或者赠送的礼物(通过简短信息 可以在好友模块外部使用)*/
    public hasGiveOrDrawGiftBySimple(): boolean {
        if (!this._friendSimpleDatas)
            return

        if (this.giftDrawCount >= this.maxDrawGiftCount && this.giftGiveCount >= this.maxGiveGiftCount) {
            //赠送和领取数量都用完了
            return false
        }
        let hasGift: boolean = false
        for (let i = 0; i < this._friendSimpleDatas.length; i++) {
            if (this._friendSimpleDatas[i].drawState == 2 && this.giftDrawCount < this.maxDrawGiftCount) {
                //有礼物未领取
                hasGift = true
                break
            }
            if (this._friendSimpleDatas[i].giveState == 1 && this.giftGiveCount < this.maxGiveGiftCount) {
                //有礼物未赠送
                hasGift = true
                break
            }
        }
        return hasGift
    }

    /**单人是否有可领取礼物*/
    public hasDrawGiftForOne(drawState: number): boolean {
        if (drawState == 2 && this.giftDrawCount < this.maxDrawGiftCount) {
            return true
        }
        return false
    }

    /**单人是否有可赠送礼物*/
    public hasGiveGiftFroOne(giveState: number): boolean {
        if (giveState == 1 && this.giftGiveCount < this.maxGiveGiftCount) {
            return true
        }
        return false
    }

    /**是否是好友*/
    public isFriend(playerId: number): boolean {
        return this._friendIds.indexOf(playerId) != -1
    }

    /**是否在黑名单中*/
    public isBlack(playerId: number): boolean {
        return this._blackIds.indexOf(playerId) != -1
    }

    /**是否已申请好友*/
    public isApplied(playerId: number): boolean {
        return this._myAppliedForIds.indexOf(playerId) != -1
    }

    /**是否可申请好友 (已经是好友或者已经申请过 都不能再申请)*/
    public canApply(playerId: number): boolean {
        return this.isFriend(playerId) == false && this.isApplied(playerId) == false
    }

    /**获取好友数据*/
    public getFriendVo(playerId: number): Vo.friend.SingleFriendVo {
        return this._friends.find((value) => value.playerVo.baseVo.id == playerId)
    }

    /**获取黑名单数据*/
    public getBlackVo(playerId: number): Vo.friend.FriendQueryVo {
        return this._blacks.find((value) => value.playerVo.baseVo.id == playerId)
    }

    /**获取申请数据*/
    public getApplyVo(playerId: number): Vo.friend.FriendApplyVo {
        return this._applies.find((value) => value.simpleVo.baseVo.id == playerId)
    }

    /**获取简要数据*/
    public getSimpleVo(playerId: number): Vo.friend.SingleFriendSimpleVo {
        return this._friendSimpleDatas.find((value) => value.playerId == playerId)
    }

    /**添加好友id*/
    public addFriendId(playerId: number): boolean {
        let index = this._friendIds.indexOf(playerId)
        if (index == -1) {
            this._friendIds.push(playerId)
            return true
        }
        return false
    }

    /**添加好友id*/
    public addFriendSimpleData(data: Vo.friend.SingleFriendSimpleVo): boolean {
        let index = this._friendSimpleDatas.findIndex((value) => value.playerId == data.playerId)
        if (index != -1) {
            //移除旧数据
            this._friendSimpleDatas.splice(index, 1)
        }
        this._friendSimpleDatas.push(data)
        return true
    }


    /**移除好友id*/
    public removeFriendId(playerId: number): boolean {
        let index = this._friendIds.indexOf(playerId)
        if (index != -1) {
            this._friendIds.splice(index, 1)
            return true
        }
        return false
    }

    /**移除好友*/
    public removeFriend(playerId: number): Vo.friend.SingleFriendVo {
        let friendVo: Vo.friend.SingleFriendVo = null
        let index = this._friends.findIndex((value) => value.playerVo.baseVo.id == playerId)
        if (index != -1) {
            friendVo = this._friends[index]
            this._friends.splice(index, 1)
        }
        return friendVo
    }

    /**移除好友简短信息*/
    public removeFriendSimple(playerId: number): Vo.friend.SingleFriendSimpleVo {
        let friendVo: Vo.friend.SingleFriendSimpleVo = null
        let index = this._friendSimpleDatas.findIndex((value) => value.playerId == playerId)
        if (index != -1) {
            friendVo = this._friendSimpleDatas[index]
            this._friendSimpleDatas.splice(index, 1)
        }
        return friendVo
    }

    /**添加黑名单id*/
    public addBlackId(playerId: number): boolean {
        let index = this._blackIds.indexOf(playerId)
        if (index == -1) {
            this._blackIds.push(playerId)
            return true
        }
        return false
    }

    /**移除黑名单id*/
    public removeBlackId(playerId: number): boolean {
        let index = this._blackIds.indexOf(playerId)
        if (index != -1) {
            this._blackIds.splice(index, 1)
            return true
        }
        return false
    }

    /**移除黑名单*/
    public removeBlack(playerId: number): Vo.friend.FriendQueryVo {
        let blackVo: Vo.friend.FriendQueryVo = null
        let index = this._blacks.findIndex((value) => value.playerVo.baseVo.id == playerId)
        if (index != -1) {
            blackVo = this._blacks[index]
            this._blacks.splice(index, 1)
        }
        return blackVo
    }

    /**移除申请*/
    public removeApply(playerId: number): Vo.friend.FriendApplyVo {
        let index = this._applies.findIndex((value) => value.simpleVo.baseVo.id == playerId)
        if (index != -1) {
            let applyVo = this._applies[index]
            this._applies.splice(index, 1)
            return applyVo
        }
        return null
    }

    /**添加我的申请记录*/
    public addMyApplyFor(playerId: number): boolean {
        let index = this._myAppliedForIds.indexOf(playerId)
        if (index == -1) {
            this._myAppliedForIds.push(playerId)
            return true
        }
        return false
    }

    /**移除我的申请记录*/
    public removeMyApplyFor(playerId: number): boolean {
        let index = this._myAppliedForIds.indexOf(playerId)
        if (index != -1) {
            this._myAppliedForIds.splice(index, 1)
            return true
        }
        return false
    }

    public clearData(): void {
        this._friends.length = 0
        this._blacks.length = 0
        this._applies.length = 0
        this._friendDirty = true
        this._blackDirty = true
        this._applyDirty = true
        this._recommendDirty = true
        this._newApplyCount = 0
        this._lastFriendRefreshTime = 0
        this._lastBlackRefreshTime = 0
        this._lastApplyRefreshTime = 0
    }

    /**检测和刷新好友列表*/
    public checkAndRefreshFriends(): boolean {
        if (this._friendDirty
            || this._friendIds.length != this._friends.length
            || Date.now() - this._lastFriendRefreshTime >= this._friendRefreshInterval) {
            this.sendGetInfo()
            return true
        }
        return false
    }

    /**检测和刷新好友列表*/
    public checkAndRefreshApplies(): boolean {
        if (this._applyDirty || Date.now() - this._lastApplyRefreshTime >= this._applyRefreshInterval) {
            this.sendGetApplyInfo()
            return true
        }
        return false
    }

    /**申请列表是否已刷新*/
    public isAppliesRefreshed(): boolean {
        return this._applyDirty == false
    }

    /**检测和刷新黑名单列表*/
    public checkAndRefreshBlacks(): boolean {
        if (this._blackDirty
            || this._blackIds.length != this._blacks.length
            || Date.now() - this._lastBlackRefreshTime >= this._blackRefreshInterval) {
            this.sendGetBlacklist()
            return true
        }
        return false
    }

    /**检测和刷新好友列表*/
    public checkAndRefreshRecommends(): boolean {
        if (this._recommendDirty
            || Date.now() - this._lastRecommendRefreshTime >= this._recommendRefreshInterval) {
            this.sendGetRecommendPlayers()
            return true
        }
        return false
    }


    /*********************************协议发送*********************************/

    /**获取好友列表*/
    public sendGetInfo(): void {
        this.send(this.MODULE, 1, {});
    }

    /**赠送并领取奖励*/
    public sendGiveAndDrawGift(c2s: Vo.friend.GiveAndDrawFriendGiftC2S): void {
        this.send(this.MODULE, 2, c2s);
    }

    /**一键赠送并领取奖励*/
    public sendGiveAndDrawAllFriendGift(): void {
        this.send(this.MODULE, 3, {});
    }

    /**一键赠送并领取奖励(无好友数据)*/
    public sendGiveAndDrawAllGift(): void {
        this.send(this.MODULE, 4, {});
    }

    /**获取黑名单列表*/
    public sendGetBlacklist(): void {
        this.send(this.MODULE, 5, {});
    }

    /**加入黑名单*/
    public sendBlacklist(c2s: Vo.friend.BlacklistC2S): void {
        this.send(this.MODULE, 6, c2s, c2s);
    }

    /**移除黑名单*/
    public sendRemoveFromBlacklist(c2s: Vo.friend.RemoveFromBlacklistC2S): void {
        this.send(this.MODULE, 7, c2s, c2s);
    }

    /**获取申请列表*/
    public sendGetApplyInfo(): void {
        this.send(this.MODULE, 8, {});
    }

    /**同意申请*/
    public sendAgreeApply(c2s: Vo.friend.AgreeApplyC2S): void {
        this.send(this.MODULE, 9, c2s, c2s);
    }

    /**拒绝申请*/
    public sendDisagreeApply(c2s: Vo.friend.DisagreeApplyC2S): void {
        this.send(this.MODULE, 10, c2s, c2s);
    }

    /**同意所有申请*/
    public sendAgreeAllApply(): void {
        this.send(this.MODULE, 11, {});
    }

    /**拒绝所有申请*/
    public sendDisagreeAllApply(): void {
        this.send(this.MODULE, 12, {});
    }

    /**申请好友*/
    public sendApplyFriends(c2s: Vo.friend.ApplyFriendsC2S): void {
        this.send(this.MODULE, 13, c2s);
    }

    /**删除好友*/
    public sendDeleteFriend(c2s: Vo.friend.DeleteFriendC2S): void {
        this.send(this.MODULE, 14, c2s, c2s);
    }

    /**根据昵称查询玩家*/
    public sendQueryPlayerByName(c2s: Vo.friend.QueryPlayerByNameC2S): void {
        this.send(this.MODULE, 15, c2s, c2s);
    }

    /**根据id查询玩家*/
    public sendQueryPlayerById(c2s: Vo.friend.QueryPlayerByIdC2S): void {
        this.send(this.MODULE, 16, c2s, c2s);
    }

    /**获取推荐玩家*/
    public sendGetRecommendPlayers(): void {
        this.send(this.MODULE, 17, {});
    }

    /**挑战好友*/
    public sendChallenge(c2s: Vo.friend.ChallengeC2S): void {
        this.send(this.MODULE, 18, c2s, c2s);
    }

    /**获取全部好友的简短信息*/
    public sendGetSingleFriendSimpleVos(): void {
        this.send(this.MODULE, 19, {});
    }

    /*********************************协议监听*********************************/

    /**好友列表返回*/
    protected recGetInfo(data: Vo.friend.GetFriendsInfoS2C): void {
        if (data.code < 0) {
            return;
        }
        this._friends = data.content.friendVos.concat()
        this.giftGiveCount = data.content.giftGiveCount
        this.giftDrawCount = data.content.giftDrawCount
        this.sortFriends(this._friends)
        if (this._friendIds.length != this._friends.length) {
            //同步好友id列表
            this._friendIds = this._friends.map((value) => value.playerVo.baseVo.id)
            this.emit(NotificationKey.FRIEND_DATA_ID_CHANGE)
        }
        //这个缓存数据以friends数据为准
        this._friendSimpleDatas.length = 0
        this._friends.forEach((value) => {
            let simpleVo: Vo.friend.SingleFriendSimpleVo = {
                playerId: value.playerVo.baseVo.id,
                giveState: value.giveState,
                drawState: value.drawState
            }
            this._friendSimpleDatas.push(simpleVo)
        })
        this.emit(NotificationKey.FRIEND_SIMPLE_DATA_CHANGE)
        this._friendDirty = false
        this._lastFriendRefreshTime = Date.now()
        this.emit(NotificationKey.FRIEND_DATA_CHANGE)
    }

    /**赠送并领取奖励返回*/
    protected recGiveAndDrawGift(data: Vo.friend.GiveAndDrawFriendGiftS2C): void {
        if (data.code < 0) {
            return;
        }
        let oldGiveCount = this.giftGiveCount
        this.giftGiveCount = data.content.giftGiveCount
        this.giftDrawCount = data.content.giftDrawCount
        let friendVo = this.updateFriendBySimpleData(data.content.simpleVo)
        if (this.updateFriendSimpleBySimpleData(data.content.simpleVo)) {
            this.emit(NotificationKey.FRIEND_SIMPLE_DATA_CHANGE)
        }
        if (data.content.rewardResults?.length > 0) {
            this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS, data.content.rewardResults)
        }
        if (oldGiveCount != this.giftGiveCount) {
            this.emit(NotificationKey.FRIEND_GIVE_GIFT_COMPLETE)
        }
        if (friendVo) {
            this.emit(NotificationKey.FRIEND_DATA_CHANGE)
        }
    }

    /**一键赠送并领取奖励返回*/
    protected recGiveAndDrawAllFriendGift(data: Vo.friend.GiveAndDrawAllFriendGiftS2C): void {
        if (data.code < 0) {
            return;
        }
        let oldGiveCount = this.giftGiveCount
        let isFriendUpdate: boolean = false
        let isSimpleUpdate: boolean = false
        this.giftGiveCount = data.content.giftGiveCount
        this.giftDrawCount = data.content.giftDrawCount
        data.content.friendVos?.forEach((value) => {
            let friendVo = this.updateFriendBySimpleData(value)
            if (friendVo) {
                isFriendUpdate = true
            }
            if (this.updateFriendSimpleBySimpleData(value)) {
                isSimpleUpdate = true
            }
        })
        if (data.content.rewardResults?.length > 0) {
            this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS, data.content.rewardResults)
        }
        if (oldGiveCount != this.giftGiveCount) {
            this.emit(NotificationKey.FRIEND_GIVE_GIFT_COMPLETE)
        }
        if (isFriendUpdate) {
            this.emit(NotificationKey.FRIEND_DATA_CHANGE)
        }
        if (isSimpleUpdate) {
            this.emit(NotificationKey.FRIEND_SIMPLE_DATA_CHANGE)
        }
    }

    /**一键赠送并领取奖励返回(无好友数据)*/
    protected recGiveAndDrawAllGift(data: Vo.friend.GiveAndDrawAllGiftS2C): void {
        if (data.code < 0) {
            return;
        }
    }

    /**黑名单列表返回*/
    protected recGetBlacklist(data: Vo.friend.GetBlacklistS2C): void {
        if (data.code < 0) {
            return;
        }
        this._blacks = data.content.concat()
        this.sortBlacks(this._blacks)
        if (this._blackIds.length != this._blackIds.length) {
            //同步黑名单id列表
            this._blackIds = this._blacks.map((value) => value.playerVo.baseVo.id)
            this.emit(NotificationKey.FRIEND_BLACK_ID_CHANGE)
        }
        this._blackDirty = false
        this._lastBlackRefreshTime = Date.now()
        this.emit(NotificationKey.FRIEND_BLACK_CHANGE)
    }

    /**加入黑名单返回*/
    protected recBlacklist(data: Vo.friend.BlacklistS2C, c2s: Vo.friend.BlacklistC2S): void {
        if (data.code < 0) {
            return;
        }
        if (this.addBlackId(c2s.targetId)) {
            this.emit(NotificationKey.FRIEND_BLACK_ID_CHANGE)
        }
        //加入黑名单需要从好友中删除
        if (this.removeFriendId(c2s.targetId)) {
            this.emit(NotificationKey.FRIEND_DATA_ID_CHANGE)
        }
        if (this.removeFriend(c2s.targetId)) {
            this.emit(NotificationKey.FRIEND_DATA_CHANGE)
        }
        if (this.removeFriendSimple(c2s.targetId)) {
            this.emit(NotificationKey.FRIEND_SIMPLE_DATA_CHANGE)
        }
    }

    /**移除黑名单返回*/
    protected recRemoveFromBlacklist(data: Vo.friend.RemoveFromBlacklistS2C, c2s: Vo.friend.RemoveFromBlacklistC2S): void {
        if (data.code < 0) {
            return;
        }
        if (this.removeBlackId(c2s.targetId)) {
            this.emit(NotificationKey.FRIEND_BLACK_ID_CHANGE)
        }
        if (this.removeBlack(c2s.targetId)) {
            this.emit(NotificationKey.FRIEND_BLACK_CHANGE)
        }
    }

    /**申请列表返回*/
    protected recGetApplyInfo(data: Vo.friend.GetApplyInfoS2C): void {
        if (data.code < 0) {
            return;
        }
        this._applies = data.content.concat()
        this.sortApplies(this._applies)
        this._applyDirty = false
        if (this._applies.length != this._newApplyCount) {
            this._newApplyCount = this._applies.length
            this.emit(NotificationKey.FRIEND_APPLY_COUNT_CHANGE)
        }
        this._lastApplyRefreshTime = Date.now()
        this.emit(NotificationKey.FRIEND_APPLY_CHANGE)
    }

    /**同意申请返回*/
    protected recAgreeApply(data: Vo.friend.AgreeApplyS2C, c2s: Vo.friend.AgreeApplyC2S): void {
        if (data.code < 0) {
            return;
        }
        if (data.content.removeApply) {
            //代表成功
            this.removeApply(c2s.targetId)
            this._newApplyCount = this._applies.length
            this.emit(NotificationKey.FRIEND_APPLY_COUNT_CHANGE)
            this.emit(NotificationKey.FRIEND_APPLY_CHANGE)
        }
        if (data.content.code == 0) {
            //代表成功成为好友
            //添加好友列表刷新标记
            if (this.addFriendId(c2s.targetId)) {
                this._friendDirty = true
                this.emit(NotificationKey.FRIEND_DATA_ID_CHANGE)
                this.sendGetSingleFriendSimpleVos()
            }
        } else {
            this.emit(NotificationKey.SERVER_ERROR_CODE, data.content.code)
        }
    }

    /**拒绝申请返回*/
    protected recDisagreeApply(data: Vo.friend.DisagreeApplyS2C, c2s: Vo.friend.AgreeApplyC2S): void {
        if (data.code < 0) {
            return;
        }
        if (this.removeApply(c2s.targetId)) {
            this._newApplyCount = this._applies.length
            this.emit(NotificationKey.FRIEND_APPLY_COUNT_CHANGE)
            this.emit(NotificationKey.FRIEND_APPLY_CHANGE)
        }
    }

    /**同意所有申请返回*/
    protected recAgreeAllApply(data: Vo.friend.AgreeAllApplyS2C): void {
        if (data.code < 0) {
            return;
        }
        let hasAddFriend: boolean = false
        let hasRemoveApply: boolean = false
        data.content.newFriendIds?.forEach((playerId: number) => {
            //添加好友列表刷新标记
            this._friendDirty = true
            hasAddFriend = this.addFriendId(playerId) || hasAddFriend
            hasRemoveApply = this.removeApply(playerId) != null || hasRemoveApply
        })
        data.content.toRemoveAppliers?.forEach((playerId: number) => {
            hasRemoveApply = this.removeApply(playerId) != null || hasRemoveApply
        })
        if (hasAddFriend) {
            this.emit(NotificationKey.FRIEND_DATA_ID_CHANGE)
            this.sendGetSingleFriendSimpleVos()
        }
        if (hasRemoveApply) {
            this._newApplyCount = this._applies.length
            this.emit(NotificationKey.FRIEND_APPLY_COUNT_CHANGE)
            this.emit(NotificationKey.FRIEND_APPLY_CHANGE)
        }
        if (this.applyCount > 0) {
            //还有申请无法处理 就弹出无法处理的提示
            if (data.content.friendFull) {
                //自己好友满了
                this.emit(NotificationKey.SERVER_ERROR_CODE, -39006)
            } else if (data.content.failedAgreeApplier2Code) {
                //其他情况用返回的错误码
                let firstErrorCode = 0
                for (let key in data.content.failedAgreeApplier2Code) {
                    if (firstErrorCode == 0) {
                        firstErrorCode = Number(data.content.failedAgreeApplier2Code[key])
                    }
                }
                if (firstErrorCode != 0) {
                    this.emit(NotificationKey.SERVER_ERROR_CODE, firstErrorCode)
                }
            }
        }
    }

    /**拒绝所有申请返回*/
    protected recDisagreeAllApply(data: Vo.friend.DisagreeAllApplyS2C): void {
        if (data.code < 0) {
            return;
        }
        this._applies.length = 0
        this._newApplyCount = 0
        this.emit(NotificationKey.FRIEND_APPLY_COUNT_CHANGE)
        this.emit(NotificationKey.FRIEND_APPLY_CHANGE)
    }

    /**申请好友返回*/
    protected recApplyFriends(data: Vo.friend.ApplyFriendsS2C): void {
        if (data.code < 0) {
            return;
        }
        let hasNewApply: boolean = false
        let firstErrorCode: number = 0
        data.content.forEach((value) => {
            if (value.resultCode == 0) {
                hasNewApply = this.addMyApplyFor(value.playerId) || hasNewApply
            } else if (firstErrorCode == 0) {
                firstErrorCode = value.resultCode
            }
        })
        if (firstErrorCode != 0) {
            this.emit(NotificationKey.SERVER_ERROR_CODE, firstErrorCode)
        }
        if (hasNewApply) {
            this.emit(NotificationKey.FRIEND_MY_APPLY_CHANGE)
        }
        this.emit(NotificationKey.FRIEND_APPLY_COMPLETE)
    }

    /**删除好友返回*/
    protected recDeleteFriend(data: Vo.friend.DeleteFriendS2C, c2s: Vo.friend.DeleteFriendC2S): void {
        if (data.code < 0) {
            return;
        }
        if (this.removeFriendId(c2s.targetId)) {
            this.emit(NotificationKey.FRIEND_DATA_ID_CHANGE)
        }
        if (this.removeFriend(c2s.targetId)) {
            this.emit(NotificationKey.FRIEND_DATA_CHANGE)
        }
        if (this.removeFriendSimple(c2s.targetId)) {
            this.emit(NotificationKey.FRIEND_SIMPLE_DATA_CHANGE)
        }
        this.emit(NotificationKey.FRIEND_DELETE_COMPLETE, c2s.targetId)
    }

    /**昵称查询玩家返回*/
    protected recQueryPlayerByName(data: Vo.friend.QueryPlayerByNameS2C, c2s: Vo.friend.QueryPlayerByNameC2S): void {
        if (data.code < 0) {
            return;
        }
    }

    /**id查询玩家返回*/
    protected recQueryPlayerById(data: Vo.friend.QueryPlayerByIdS2C, c2s: Vo.friend.QueryPlayerByIdC2S): void {
        if (data.code < 0) {
            return;
        }
    }

    /**推荐好友返回*/
    protected recGetRecommendPlayers(data: Vo.friend.GetRecommendPlayersS2C): void {
        if (data.code < 0) {
            return;
        }
        this._recommends = data.content.concat()
        this._recommendDirty = false
        this._lastRecommendRefreshTime = Date.now()
        this.emit(NotificationKey.FRIEND_RECOMMEND_CHANGE)
    }

    /**挑战好友返回*/
    protected recChallenge(data: Vo.friend.ChallengeS2C): void {
        if (data.code < 0) {
            return;
        }
    }

    /**获取全量简短好友信息*/
    protected recGetSingleFriendSimpleVos(data: Vo.friend.GetSingleFriendSimpleVosS2C): void {
        this._friendSimpleDatas = data.content ? data.content : []
        this.emit(NotificationKey.FRIEND_SIMPLE_DATA_CHANGE)
    }

    /*********************************协议推送*********************************/

    /**推送新的好友申请*/
    protected pushNewApply(): void {
        this._applyDirty = true
        this._newApplyCount++
        this.emit(NotificationKey.FRIEND_APPLY_COUNT_CHANGE)
    }

    /**推送被赠与礼物*/
    protected pushBeGivenFriendGift(playerId: number): void {
        let friendVo = this.getFriendVo(playerId)
        if (friendVo) {
            friendVo.drawState = 2
            this.emit(NotificationKey.FRIEND_DATA_CHANGE)
        }
        let simpleVo = this.getSimpleVo(playerId)
        if (simpleVo) {
            simpleVo.drawState = 2
            this.emit(NotificationKey.FRIEND_SIMPLE_DATA_CHANGE)
        }
    }

    /**新增好友推送*/
    protected pushNewFriend(simpleVo: Vo.friend.SingleFriendSimpleVo): void {
        if (this.addFriendId(simpleVo.playerId)) {
            this._friendDirty = true
            this.emit(NotificationKey.FRIEND_DATA_ID_CHANGE)
        }
        this.addFriendSimpleData(simpleVo)
        this.emit(NotificationKey.FRIEND_SIMPLE_DATA_CHANGE)
        if (this.removeMyApplyFor(simpleVo.playerId)) {
            this.emit(NotificationKey.FRIEND_MY_APPLY_CHANGE)
        }
    }

    /**申请被移除*/
    protected pushApplyBeRemove(playerId: number): void {
        if (this.removeMyApplyFor(playerId)) {
            this.emit(NotificationKey.FRIEND_MY_APPLY_CHANGE)
        }
    }

    /**被好友删除*/
    protected pushBeDelete(playerId: number): void {
        if (this.removeFriendId(playerId)) {
            this.emit(NotificationKey.FRIEND_DATA_ID_CHANGE)
        }
        if (this.removeFriend(playerId)) {
            this.emit(NotificationKey.FRIEND_DATA_CHANGE)
        }
        if (this.removeFriendSimple(playerId)) {
            this.emit(NotificationKey.FRIEND_SIMPLE_DATA_CHANGE)
        }
    }

    /**好友下线*/
    protected pushFriendOffline(data: Vo.friend.FriendMinVo): void {
        let friendVo = this.getFriendVo(data.friendId)
        if (friendVo) {
            friendVo.logoutTime = G.TimeManager.serverNow
            this.emit(NotificationKey.FRIEND_DATA_CHANGE)
        }
        this.emit(NotificationKey.FRIEND_OFFLINE_COMPLETE, data)
    }

    /**好友上线*/
    protected pushFriendOnline(data: Vo.friend.FriendMinVo): void {
        let friendVo = this.getFriendVo(data.friendId)
        if (friendVo) {
            friendVo.logoutTime = -1
            this.emit(NotificationKey.FRIEND_DATA_CHANGE)
        }
        this.emit(NotificationKey.FRIEND_ONLINE_COMPLETE, data)
    }
}
