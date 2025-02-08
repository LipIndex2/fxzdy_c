import * as fgui from "fairygui-cc";
import { PositionVo, PositionVoData } from "../vo/PositionVo";
import { FormationManager } from "../FormationManager";
import { Layers, Node, sp } from "cc";
import { Res } from "../../../../core/res/Res";
import { HeroManager } from "../../hero/HeroManager";
import NotificationKey from "../../../event/NotificationKey";
import G from "../../../../core/comm/G";
import { SoltItem } from "../../common/item/SoltItem";
import { TableManager } from "../../../../core/table/TableManager";
import { Vec2 } from "cc";
import { FloatingTextManager } from "../../floatingText/FloatingTextManager";
import { NodeEventType } from "cc";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import { AudioManager, SoundType } from "../../../comm/mgr/AudioManager";
import { ModelNode } from "../../common/node/ModelNode";
import { tween } from "cc";
import { FightType } from "../../../comm/battle/enum/FightType";
import GIns from "../../../GIns";
import { TeamChallengeModel } from "../../teamChallenge/model/TeamChallengeModel";
import { Color } from "cc";



/** 布阵展示页 */
export class FormationItemPage extends fgui.GComponent {
    static pkgName: string = "formation";
    static viewName: string = "FormationItemPage";

    private _spine: sp.Skeleton[] = [];
    //临时布阵Vo
    private tempPosVo: PositionVo[] = [];

    //布阵初始位置
    private _tempPoss: Vec2[] = [];
    //布阵初始位置
    private _itemPoss: Vec2[] = [];

    //其他需要调整位置的布阵位置
    private _tempChangePoss: Vec2[] = null;
    private _itemChangePoss: Vec2[] = null;


    /*战斗类型 */
    private _fType: number;

    private _positions: number[] = [];

    private get view(): ui.formation.page.FormationItemPage {
        return this as any;
    }

    constructor() {
        super();
    }

    onInit() {
        this.view.anim0.draggable = true;
        this.view.anim1.draggable = true;
        this.view.anim2.draggable = true;
        this.view.anim3.draggable = true;
        this.view.anim4.draggable = true;
        this.view.anim5.draggable = true;
        // 添加拖动开始事件监听
        this.view.anim0.on(fgui.Event.TOUCH_BEGIN, this.onDragStart.bind(this, 0), this);
        this.view.anim1.on(fgui.Event.TOUCH_BEGIN, this.onDragStart.bind(this, 1), this);
        this.view.anim2.on(fgui.Event.TOUCH_BEGIN, this.onDragStart.bind(this, 2), this);
        this.view.anim3.on(fgui.Event.TOUCH_BEGIN, this.onDragStart.bind(this, 3), this);
        this.view.anim4.on(fgui.Event.TOUCH_BEGIN, this.onDragStart.bind(this, 4), this);
        this.view.anim5.on(fgui.Event.TOUCH_BEGIN, this.onDragStart.bind(this, 5), this);
        // 添加拖动结束事件监听
        this.view.anim0.on(fgui.Event.TOUCH_END, this.onDragEnd.bind(this, 0), this);
        this.view.anim1.on(fgui.Event.TOUCH_END, this.onDragEnd.bind(this, 1), this);
        this.view.anim2.on(fgui.Event.TOUCH_END, this.onDragEnd.bind(this, 2), this);
        this.view.anim3.on(fgui.Event.TOUCH_END, this.onDragEnd.bind(this, 3), this);
        this.view.anim4.on(fgui.Event.TOUCH_END, this.onDragEnd.bind(this, 4), this);
        this.view.anim5.on(fgui.Event.TOUCH_END, this.onDragEnd.bind(this, 5), this);

        for (let i = 0; i < 6; i++) {
            let anim = this.view.getChild("anim" + i) as ModelNode;
            if (anim) {
                this._tempPoss.push(new Vec2(anim.x, anim.y));
            }
        }

        for (let i = 0; i < 6; i++) {
            let item = this.view.getChild("item" + i) as ModelNode;
            if (item) {
                this._itemPoss.push(new Vec2(item.x, item.y));
            }
        }

        for (let i = 1; i <= 3; i++) {
            const group = this.view.getChild("group" + i);
            group.visible = false;
        }



        // console.log(`--------------------布阵初始位置--------------------`);
        // console.log(this._tempPoss);
    }

    protected onPreDispose() {
        // this.resetPos();
        this._tempChangePoss = null;
        this._itemChangePoss = null;
    }


    //更新item
    public updateData(tempPosVo: PositionVo[], _fType?: number) {
        this.tempPosVo = tempPosVo;
        this._fType = _fType;
        if (_fType == FightType.TEAM_INSTANCE) {
            this._positions = FormationManager.ins().getPoses();
            for (let i = 1; i <= 6; i++) {
                let index = i - 1;
                if (this._positions.indexOf(i) == -1) {
                    this.view["anim" + index].draggable = false;
                } else {
                    this.view["anim" + index].draggable = true;
                }
            }
        }
        this.updateTempPoss();
        this.updateUI();
    }

    updateTempPoss() {
        if (this._fType == FightType.TEAM_INSTANCE) {
            const members = TeamChallengeModel.ins().getMembers();
            for (let i = 1; i <= 3; i++) {
                const group = this.view.getChild("group" + i);
                group.visible = true;
                this.view.lbN_1
                const lb = this.view.getChild("lbN_" + (3 - i + 1)) as fgui.GTextField;
                const member = members[i - 1];
                if (member) {
                    lb.text = member.baseVo?.name || member.teamRobot?.name;
                    lb.color = GIns.teamChallengeModel.isMe(member.baseVo?.id) ? new Color("#19df51") : new Color("#AAE2FF");
                    
                } else {
                    lb.text = '';
                }
            }


            if (!this._tempChangePoss) {
                this._tempChangePoss = [];
                for (let i = 0; i < 6; i++) {
                    let anim = this.view.getChild("anim" + i) as ModelNode;
                    if (i >= 3) {
                        anim.x -= 62;
                    }
                    if (anim) {
                        this._tempChangePoss.push(new Vec2(anim.x, anim.y));
                    }
                }
            }

            if (!this._itemChangePoss) {
                this._itemChangePoss = [];
                for (let i = 0; i < 6; i++) {
                    let item = this.view.getChild("item" + i) as ModelNode;
                    if (i >= 3) {
                        item.x -= 62;
                    }
                    if (item) {
                        this._itemChangePoss.push(new Vec2(item.x, item.y));
                    }
                }
            }
        }

    }


    resetPos() {
        for (let i = 0; i < 6; i++) {
            let anim = this.view.getChild("anim" + i) as ModelNode;
            anim.x = this._tempPoss[0].x;
            anim.y = this._tempPoss[0].y;
        }

        for (let i = 0; i < 6; i++) {
            let item = this.view.getChild("item" + i) as ModelNode;
            item.x = this._itemPoss[0].x;
            item.y = this._itemPoss[0].y;
        }
    }

    private updateUI() {
        let self = this.view;

        this.closeAnim();
        let index = 0;
        let item = self.getChild("item" + index) as SoltItem;
        for (let data of this.tempPosVo) {
            item = self.getChild("item" + index) as SoltItem;
            let anim = self.getChild("anim" + index) as ModelNode;
            if (!item) return;
            item.updateData(data, this._fType);
            if (data.heroId) {
                let heroVo = HeroManager.ins().getHeroVoByID(data.heroId);
                // anim.loadByModelId(heroVo.heroCfg.showModelId);
                //可以抽出来，待优化TODO
                if (this._fType == FightType.TEAM_INSTANCE) {
                    //组队玩法
                    const skinMap = FormationManager.ins().getSkinMap(this._fType);
                    const poses = FormationManager.ins().getPoses();
                    //自己的走正常操作
                    if (skinMap && skinMap.get(data.positionId) && poses.indexOf(data.positionId) == -1) {
                        let skinCfg = TableManager.getDataById(table.hero.HeroSkinConfig, skinMap.get(data.positionId));
                        anim.loadByModelId(skinCfg.showModelId);
                    } else {
                        anim.loadByModelId(heroVo?.showModelId);
                    }
                } else {
                    anim.loadByModelId(heroVo.showModelId);
                }

                anim.setScale(-1.6, 1.6)
            } else {
                anim.clear();
            }
            anim.clearClick();
            anim.onClick(() => {
                if (data.heroId) {
                    if (this._fType == FightType.TEAM_INSTANCE) {
                        const poses = FormationManager.ins().getPoses();
                        if (poses.indexOf(data.BaseId) == -1) {
                            GIns.floatingTextMgr.showTips("只能更换自己的角色");
                            return;
                        }
                    }

                    //下阵英雄
                    let vo = FormationManager.ins().getPosVoById(data.BaseId);
                    let posVo = new PositionVo(vo.BaseId);
                    let posVoDate: PositionVoData = {
                        positionId: vo.BaseId,
                        heroBaseId: null,
                    };
                    posVo.setPosVoData(posVoDate);
                    FacadeManager.ins().emitNow(NotificationKey.FORMATION_TEMP_IN_BATTLE_HERO, posVo);
                    AudioManager.ins().playSound(SoundType.xiazhen);


                }
            }, this)
            index += 1;
        }


    }

    closeAnim() {
        for (let data of this._spine) {
            if (data) {
                data.destroy();
            }
        }
        this._spine = []
    }


    // 拖动开始的回调函数
    private onDragStart(index: number, evt: any): void {
        //设置层级
        let anim = this.view.getChild("anim" + index);
        anim.node.setSiblingIndex(index + 110);
        console.log("Drag start");
    }

    // 拖动结束的回调函数
    private onDragEnd(index: number, evt: any): void {
        //恢复层级
        for (let i = 0; i < 6; i++) {
            let anim = this.view.getChild("anim" + i) as ModelNode;
            if (anim) {
                anim.node.setSiblingIndex(100 + i);
            }
        }

        //偏移量
        let pos = { x: evt.pos.x - this.view.x, y: evt.pos.y - this.view.y };
        const tempPoss = this.getTempPoss();
        for (let i = 0; i < tempPoss.length; i++) {

            //判断是否在其他位置方位内
            if (i != index && pos.x > (tempPoss[i].x - 80) && pos.x < (tempPoss[i].x + 80) && pos.y > (tempPoss[i].y - 80) && pos.y < (tempPoss[i].y + 80)) {
                //交换英雄
                if (this._fType == FightType.TEAM_INSTANCE) {
                    if (this._positions.indexOf(i + 1) != -1 && this._positions.indexOf(index + 1) != -1) {
                        this.swapHero(index, i);
                        return;
                    } else {
                        GIns.floatingTextMgr.showTips('不能替换其他玩家');
                    }

                } else {
                    this.swapHero(index, i);
                    return;
                }

            }
        }

        //恢复位置
        this.view.getChild("anim" + index).x = tempPoss[index].x;
        this.view.getChild("anim" + index).y = tempPoss[index].y;

        console.log("Drag end");
    }

    //交换英雄
    private swapHero(index1: number, index2: number) {
        let anim1 = this.view.getChild("anim" + index1);
        // let anim2 = this.view.getChild("anim" + index2) as ModelNode;

        //位置信息
        let tempPos1 = this.tempPosVo[index1];
        let tempPos2 = this.tempPosVo[index2];
        let hero1 = tempPos1.heroId;
        let hero2 = tempPos2.heroId;

        //下阵
        this.downHero(tempPos1.BaseId)
        this.downHero(tempPos2.BaseId)

        //上阵
        this.upHero(tempPos1.BaseId, hero2);
        this.upHero(tempPos2.BaseId, hero1);

        const tempPoss = this.getTempPoss();
        //恢复位置
        tween(anim1).to(0.1, { x: tempPoss[index1].x, y: tempPoss[index1].y }).start();
        // tween(anim2).to({x: this._tempPoss[index2].x, y: this._tempPoss[index2].y}, 0.3).start();
    }

    private getTempPoss() {
        if (this._fType == FightType.TEAM_INSTANCE) {
            return this._tempChangePoss;
        }
        return this._tempPoss;
    }

    //上阵英雄
    private upHero(BaseId: number, heroId: number) {
        let posVo = new PositionVo(BaseId);
        let posVoDate: PositionVoData = {
            positionId: BaseId,
            heroBaseId: heroId,
        }
        posVo.setPosVoData(posVoDate);
        FacadeManager.ins().emitNow(NotificationKey.FORMATION_TEMP_IN_BATTLE_HERO, posVo);
    }

    //下阵英雄
    private downHero(BaseId: number) {
        //下阵英雄
        let vo = FormationManager.ins().getPosVoById(BaseId);
        let posVo = new PositionVo(vo.BaseId);
        let posVoDate: PositionVoData = {
            positionId: vo.BaseId,
            heroBaseId: null,
        };
        posVo.setPosVoData(posVoDate);
        FacadeManager.ins().emitNow(NotificationKey.FORMATION_TEMP_IN_BATTLE_HERO, posVo);
        AudioManager.ins().playSound(SoundType.xiazhen);
    }
}