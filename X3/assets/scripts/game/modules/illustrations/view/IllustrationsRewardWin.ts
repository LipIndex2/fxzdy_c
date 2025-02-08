import { Vec2 } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { IllustrationsRewardItem } from "../item/IllustrationsRewardItem";
import { IllustrationsModel } from "../model/IllustrationsModel";

/**
 * 图鉴奖励界面
 */
export class IllustrationsRewardWin extends UIPage {

    static pkgName: string = "illustrations";
    static viewName: string = "IllustrationsRewardWin";

    protected _datas: table.illustrations.IllustrationsLevelConfig[] = []
    protected _curScoreViewH: number = 0
    protected _curPosYForList: number = 0
    protected _targetPos: Vec2 = new Vec2()
    /**当前进度条最多超过屏幕外的距离*/
    protected _curPosMaxOutScreen: number = 200

    private get view(): ui.illustrations.view.IllustrationsRewardWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
        ];
    }

    notificationHandler(event: string, args?: any): void {

    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.listReward.setVirtual()
        this.view.listReward.itemRenderer = this.itemRendererForReward.bind(this)
        this.view.listReward.on(fgui.Event.SCROLL, this.onScroll, this)
        this.view.footer.btnBack.onClick(this.onClickBack, this)
    }

    protected updateUI(): void {
        this._datas = G.TableManager.getAllData(table.illustrations.IllustrationsLevelConfig).concat().reverse()
        this.view.listReward.numItems = this._datas.length
    }

    protected itemRendererForReward(index: number, item: ui.illustrations.item.IllustrationsRewardItem): void {
        //@ts-ignore
        let comp = item as IllustrationsRewardItem
        comp.setData(this._datas[index])
    }

    protected onScroll(): void {
        this.udpateCurScorePos()
    }

    protected udpateCurScorePos(): void {
        let totalListH = Math.max(this.view.listReward.scrollPane.contentHeight, this.view.listReward.height)
        let posY: number = totalListH - this._curPosYForList
        //@ts-ignore
        posY -= this.view.listReward.scrollPane._container.position.y
        // console.log('posY', posY)
        if (posY <= -this._curPosMaxOutScreen) {
            //超过上边框
            posY = -this._curPosMaxOutScreen
        }
        if (posY >= this.view.height + this._curPosMaxOutScreen) {
            posY = this.view.height + this._curPosMaxOutScreen
        }
        this.view.pCurScore.y = posY - this.view.pCurScore.height * 0.5
        this.view.progressScore.height = Math.max(0, this.view.progressScore.y - posY)
        this.view.bgProgress.height = Math.max(0, this.view.bgProgress.y - posY)
    }

    protected onClickBack(): void {
        this.closeSelf()
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this.updateUI()
        let curLv = IllustrationsModel.ins().rewardLv
        let curIndex = this._datas.findIndex((value) => value.id == curLv)
        if (curIndex == -1) {
            //没有领取过奖励就默认显示第一个奖励
            curIndex = this._datas.length - 1
        }
        this.view.listReward.scrollToView(curIndex)

        let curScore = IllustrationsModel.ins().score
        this.view.lbScore.text = curScore + ''
        let curMinIndex = 0
        let curMaxIndex = this._datas.length - 1
        for (let i = 0; i < this._datas.length; i++) {
            if (this._datas[i].needScore >= curScore) {
                curMinIndex = i
            }
        }
        let itemH = 200
        let itemScoreY = 70
        curMaxIndex = curMinIndex + 1
        let totalValue = 0
        if (curMaxIndex == this._datas.length) {
            //代表到底了 连第一阶段都不到
            totalValue = itemH - itemScoreY
            let maxValue = this._datas[curMinIndex].needScore
            totalValue = totalValue * curScore / maxValue
        } else {
            let preH = itemH + this.view.listReward.lineGap
            totalValue = itemH - itemScoreY + preH * (this._datas.length - 1 - curMaxIndex)
            let maxValue = this._datas[curMinIndex].needScore
            let minValue = this._datas[curMaxIndex].needScore
            let stageValue = preH * (curScore - minValue) / (maxValue - minValue)
            totalValue += stageValue
        }
        if (totalValue > this.view.height + this._curPosMaxOutScreen) {
            totalValue = this.view.height + this._curPosMaxOutScreen
        }
        this._curPosYForList = Math.max(this.view.pCurScore.height, totalValue)
        this.udpateCurScorePos()
    }

    protected onClose(): void {

    }
}