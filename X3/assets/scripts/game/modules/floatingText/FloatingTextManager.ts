import BaseSingleton from "../../../core/base/BaseSingleton";
import G from "../../../core/comm/G";
import NotificationKey from "../../event/NotificationKey";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { UIMainKey } from "db://assets/scripts/game/ui/main/const/UIMainConfig";
import { I18nManager } from "db://assets/scripts/core/i18n/I18nManager";
import { DebugUtils } from "db://assets/scripts/core/utils/DebugUtils";


/** 提示飘字 */
export class FloatingTextManager extends BaseSingleton {

    private _isShowFight:boolean = true;

    /** 是否可以显示战力弹窗 */
    set isShowFight(isShow:boolean){
        this._isShowFight = isShow;
    }
    get isShowFight(){
        return this._isShowFight;
    }

    /** 通用飘字 */
    public showTips(str: string){
        let textData:TextData = {
            type:FloatingTextType.common, 
            tipsText:str
        }
        G.FacadeManager.emit(NotificationKey.EVENT_NEW_FLOATING_TEXT, textData);
    }

    /** 提示字 debug Env */
    public showTipsInDebug(str: string) {
        if (!DebugUtils.isDebugAndInBrowser()) {
            return;
        }
        
        const tipsText = `[Debug] ${str}`;
        this.showTips(tipsText);
    }

    /** 获取道具飘字 */
    public showGetItem(itemId:number, num:number){
        let textData:TextData = {
            type: FloatingTextType.item, 
            itemId: itemId,
            num: num,
        }
        G.FacadeManager.emit(NotificationKey.EVENT_NEW_FLOATING_TEXT, textData);
    }

    /** 战力变化 */
    public showFight(Fight:number, changeFight:number){
        let textData:TextData = {
            type: FloatingTextType.fight, 
            fight: Fight,
            fightChange: changeFight,
        }
        G.FacadeManager.emit(NotificationKey.EVENT_NEW_FLOATING_TEXT, textData);
    }

    /** 区域变更飘字 */
    public showAreaItem(str:string){
        let textData:TextData = {
            type: FloatingTextType.area, 
            areaText: str,
        }

        if (!UIManager.ins().getUIByKey(UIMainKey.MAIN_PAGE)?.isOpened) {
            return;
        }
        G.FacadeManager.emit(NotificationKey.EVENT_NEW_FLOATING_TEXT, textData);
    }

    /**
     * 英雄升级属性飘字
     * @param str
     * @param target 相对于这个节点Y方向上的位置飘字
     */
    public showAttrItem(str:string, target?: fgui.GObject){
        let textData:TextData = {
            type: FloatingTextType.attr, 
            attrText: str,

            target: target,
        }
        G.FacadeManager.emit(NotificationKey.EVENT_NEW_FLOATING_TEXT, textData);
    }

}



/**
 * 漂字data
 */
export class TextData {
    /** 飘字类型 */
    type: FloatingTextType;
    /** 提示文字 */
    tipsText?: string;
    /** 道具id */
    itemId?: number;
    /** 道具增加数量 */
    num?:number;
    /** 当前战力 */
    fight?:number;
    /** 战力变化量 */
    fightChange?:number;
    /** 区域变更文字 */
    areaText?: string;
    /** 属性 */
    attrText?: string;

    /** 相对于这个节点Y方向上的位置飘字 */
    target?: fgui.GObject;
}

/** 飘字类型 */
export enum FloatingTextType{
    /** 通用（默认） */
    common = 0,
    /** 道具 */
    item,
    /** 战力 */
    fight,
    /** 区域变更 */
    area,
    /** 属性 */
    attr,
}