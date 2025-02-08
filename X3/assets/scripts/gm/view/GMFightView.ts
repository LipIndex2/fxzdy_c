import * as fgui from "fairygui-cc";
import { GmModel } from "../model/GMModel";
import { TableManager } from "../../core/table/TableManager";
import { ServerEnums } from "../../libs/extras/ServerEnums";
import { FloatingTextManager } from "../../game/modules/floatingText/FloatingTextManager";
import G from "../../core/comm/G";
import LocalStorage from "../../game/comm/cache/LocalStorage";
import { FGUIMaskUtils } from "../../game/ui/common/mask/FGUIMaskUtils";
import { director } from "cc";
import GIns from "../../game/GIns";

export class GMFightSelectItem extends fgui.GComponent {
    // region 静态属性 for FGUI
    static pkgName: string = "gm";
    static viewName: string = "GMFightSelectItem";

    public info: table.hero.HeroConfig | table.monster.MonsterAttributeConfig
    private get view(): ui.gm.fight.GMFightSelectItem {
        return this as any;
    }

    onConstruct() {
        this.onInit()
    }

    public onInit() {
    }

    // 更新渲染
    updateData(data: table.hero.HeroConfig | table.monster.MonsterAttributeConfig) {
        this.info = data;
        this.view.title.text = data.name;
    }
}

export class GMFightView extends fgui.GComponent {

    // region 静态属性 for FGUI
    static pkgName: string = "gm";
    static viewName: string = "GMFightView";

    private heroListView: ui.gm.fight.GMFightSelectList;
    private monsterListView: ui.gm.fight.GMFightSelectList;

    private get view(): ui.gm.GMFightView {
        return this as any;
    }

    onConstruct() {
        this.onInit()
    }

    public onInit() {
        this.view.btnOk.labelTitle.text = "开始战斗"
        this.view.copyBtn.labelTitle.text = "粘贴"


        for (let i = 1; i <= 6; i++) {
            this.view[`item1_${i}`].title.text = "阵位" + i
            this.view[`item1_${i}`].idListBtn.data = { flag: "攻击方", pos: i }
            this.view[`item1_${i}`].idListBtn.onClick(this.onClickIdListBtn, this)
            this.view[`item1_${i}`].monsterListBtn.data = { flag: "攻击方", pos: i }
            this.view[`item1_${i}`].monsterListBtn.onClick(this.onClickMonsterListBtn, this)
        }

        for (let i = 1; i <= 6; i++) {
            this.view[`item2_${i}`].title.text = "阵位" + i
            this.view[`item2_${i}`].idListBtn.data = { flag: "防守方", pos: i }
            this.view[`item2_${i}`].idListBtn.onClick(this.onClickIdListBtn, this)
            this.view[`item2_${i}`].monsterListBtn.data = { flag: "防守方", pos: i }
            this.view[`item2_${i}`].monsterListBtn.onClick(this.onClickMonsterListBtn, this)
        }

        this.view.btnOk.on(fgui.Event.CLICK, this.onClickOk, this)
        this.view.copyBtn.on(fgui.Event.CLICK, this.onClickCopy, this)

        if (!LocalStorage.player.battleTest) {
            LocalStorage.player.battleTest = { isTestStopEnemy: false, isTestStopHero: false, isTestOnlyNormal: false, isTestNotHurt: false, lastJson: "" }
        }

        if (LocalStorage.player.battleTest.lastJson) {
            this.view.jsonInput.text = LocalStorage.player.battleTest.lastJson;
            this.onClickCopy();
        }
    }

    private isAtker: { flag: string, pos: number }
    private onClickIdListBtn(event: fgui.Event): void {
        if (!this.heroListView) {
            this.heroListView = fgui.UIPackage.createObject("gm", "GMFightSelectList") as ui.gm.fight.GMFightSelectList;
            this.heroListView.list.setVirtual();
            this.heroListView.list.itemRenderer = this.listHeroItemRenderer.bind(this);
            this.heroListView.list.on(fgui.Event.CLICK_ITEM, this.onClickHeroItem, this);
        }
        this.addChild(this.heroListView)
        this.heroListView.x = event.initiator.x;
        this.heroListView.y = event.initiator.y + event.initiator.height;
        this.isAtker = event.initiator.data;
        let datas = TableManager.getAllData(table.hero.HeroConfig)
        this.heroListView.list.numItems = datas.length;
    }

    private listHeroItemRenderer(index: number, view: GMFightSelectItem) {
        let datas = TableManager.getAllData(table.hero.HeroConfig)
        const itemVo = datas[index];
        if (!itemVo) {
            return
        }
        view.updateData(itemVo)
    }

    private onClickHeroItem(item: GMFightSelectItem): void {
        if (this.isAtker.flag == "攻击方") {
            this.view[`item1_${this.isAtker.pos}`].idInput.text = item.info.id
        }
        else {
            this.view[`item2_${this.isAtker.pos}`].idInput.text = item.info.id
        }
        this.heroListView.removeFromParent()
    }

    private onClickMonsterListBtn(event: fgui.Event): void {
        if (!this.monsterListView) {
            this.monsterListView = fgui.UIPackage.createObject("gm", "GMFightSelectList") as ui.gm.fight.GMFightSelectList;
            this.monsterListView.list.setVirtual();
            this.monsterListView.list.itemRenderer = this.listMonsterItemRenderer.bind(this);
            this.monsterListView.list.on(fgui.Event.CLICK_ITEM, this.onClickMonsterItem, this);
        }
        this.addChild(this.monsterListView)
        this.monsterListView.x = event.initiator.x;
        this.monsterListView.y = event.initiator.y + event.initiator.height;
        this.isAtker = event.initiator.data;
        let datas = TableManager.getAllData(table.monster.MonsterAttributeConfig)
        this.monsterListView.list.numItems = datas.length;
    }

    private listMonsterItemRenderer(index: number, view: GMFightSelectItem) {
        let datas = TableManager.getAllData(table.monster.MonsterAttributeConfig)
        const itemVo = datas[index];
        if (!itemVo) {
            return
        }
        view.updateData(itemVo)
    }

    private onClickMonsterItem(item: GMFightSelectItem): void {
        if (this.isAtker.flag == "攻击方") {
            this.view[`item1_${this.isAtker.pos}`].monsterInput.text = item.info.id
        }
        else {
            this.view[`item2_${this.isAtker.pos}`].monsterInput.text = item.info.id
        }
        this.monsterListView.removeFromParent()
    }

    private onClickCopy(): void {
        if (this.view.jsonInput.text) {
            let jsonData: { attacker: Vo.gm.CustomFightUnitVo[], defender: Vo.gm.CustomFightUnitVo[], attackerSkills: { [pos: number]: string[] }, defenderSkills: { [pos: number]: string[] } } = JSON.parse(this.view.jsonInput.text)

            for (let i = 1; i <= 6; i++) {
                this.view[`item1_${i}`].idInput.text = "";
                this.view[`item1_${i}`].skillInput.text = "";
                this.view[`item1_${i}`].monsterInput.text = "";

                this.view[`item2_${i}`].idInput.text = "";
                this.view[`item2_${i}`].skillInput.text = "";
                this.view[`item2_${i}`].monsterInput.text = "";
            }

            for (let i = 0; i < jsonData.attacker.length; i++) {
                let position = jsonData.attacker[i].position;
                if (jsonData.attacker[i].unitType == ServerEnums.UnitType.HERO) {
                    this.view[`item1_${position}`].idInput.text = jsonData.attacker[i].configId;
                }
                else {
                    this.view[`item1_${position}`].monsterInput.text = jsonData.attacker[i].configId;
                }
            }

            for (let i = 0; i < jsonData.defender.length; i++) {
                let position = jsonData.defender[i].position;
                if (jsonData.defender[i].unitType == ServerEnums.UnitType.HERO) {
                    this.view[`item2_${position}`].idInput.text = jsonData.defender[i].configId;
                }
                else {
                    this.view[`item2_${position}`].monsterInput.text = jsonData.defender[i].configId;
                }
            }

            for (let pos in jsonData.attackerSkills) {
                this.view[`item1_${pos}`].skillInput.text = jsonData.attackerSkills[pos].toString()
            }

            for (let pos in jsonData.defenderSkills) {
                this.view[`item2_${pos}`].skillInput.text = jsonData.defenderSkills[pos].toString()
            }

            this.view.jsonInput.text = ""
        }
    }

    private onClickOk() {
        // VideoManager.ins().play(this.view.node, "1")
        // return
        if (this.view.jsonInput.text) {
            let jsonData: { attacker: Vo.gm.CustomFightUnitVo[], defender: Vo.gm.CustomFightUnitVo[], attackerSkills: { [pos: number]: string[] }, defenderSkills: { [pos: number]: string[] } } = JSON.parse(this.view.jsonInput.text)
            this.sendFight(jsonData.attacker, jsonData.defender, jsonData.attackerSkills, jsonData.defenderSkills);
            return
        }

        let attackerUnitVos: Vo.gm.CustomFightUnitVo[] = [];
        let attackerSkills: { [pos: number]: string[] } = {}
        for (let i = 1; i <= 6; i++) {
            let heroId = this.view[`item1_${i}`].idInput.text
            let skillStr = this.view[`item1_${i}`].skillInput.text

            let vo = {} as Vo.gm.CustomFightUnitVo
            if (heroId) {
                let heroCfg = TableManager.getDataById(table.hero.HeroConfig, heroId);
                if (heroCfg) {
                    vo.unitType = ServerEnums.UnitType.HERO
                    vo.configId = +heroId
                    vo.position = i;
                    attackerUnitVos.push(vo)
                }
                else {
                    GIns.floatingTextMgr.showTips(`攻方阵位${i}的英雄配置错了`)
                }
            }

            if (skillStr) {
                attackerSkills[i] = skillStr.split(",")
            }
        }

        let defenderUnitVos: Vo.gm.CustomFightUnitVo[] = [];
        let defenderSkills: { [pos: number]: string[] } = {}
        for (let i = 1; i <= 6; i++) {
            let monsterId = this.view[`item2_${i}`].monsterInput.text
            let skillStr = this.view[`item2_${i}`].skillInput.text
            let heroId = this.view[`item2_${i}`].idInput.text

            let vo = {} as Vo.gm.CustomFightUnitVo
            if (heroId) {
                let heroCfg = TableManager.getDataById(table.hero.HeroConfig, heroId);
                if (heroCfg) {
                    vo.unitType = ServerEnums.UnitType.HERO
                    vo.configId = +heroId
                    vo.position = i;
                    defenderUnitVos.push(vo)
                }
                else {
                    GIns.floatingTextMgr.showTips(`守方阵位${i}的英雄配置错了`)
                }
            }
            else if (monsterId) {
                let monsterCfg = TableManager.getDataById(table.monster.MonsterAttributeConfig, monsterId);
                if (monsterCfg) {
                    vo.unitType = ServerEnums.UnitType.MONSTER
                    vo.configId = +monsterId
                    vo.position = i;
                    defenderUnitVos.push(vo)
                }
                else {
                    GIns.floatingTextMgr.showTips(`守方阵位${i}的怪物配置错了`)
                }
            }

            if (skillStr) {
                defenderSkills[i] = skillStr.split(",")
            }
        }
        this.sendFight(attackerUnitVos, defenderUnitVos, attackerSkills, defenderSkills)
    }

    private sendFight(attackerUnitVos: Vo.gm.CustomFightUnitVo[], defenderUnitVos: Vo.gm.CustomFightUnitVo[], attackerSkills: { [pos: number]: string[] }, defenderSkills: { [pos: number]: string[] }): void {
        if (attackerUnitVos.length == 0) {
            GIns.floatingTextMgr.showTips(`进攻阵容为空`)
            return;
        }

        if (defenderUnitVos.length == 0) {
            GIns.floatingTextMgr.showTips(`防守阵容为空`)
            return;
        }
        let str = JSON.stringify({ attacker: attackerUnitVos, defender: defenderUnitVos, attackerSkills: attackerSkills, defenderSkills: defenderSkills })
        if (navigator.clipboard)
            navigator.clipboard.writeText(str)
        else {
            const tempTextArea = document.createElement("textarea");
            tempTextArea.value = str;
            document.body.appendChild(tempTextArea);
            tempTextArea.select();
            try {
                document.execCommand('copy');
                console.log("Text copied to clipboard:", str);
            } catch (err) {
                console.error("Failed to copy text:", err);
            }

            document.body.removeChild(tempTextArea);
        }
        G.Logger.fight(`输出测试战斗阵容JSON`)
        G.Logger.fight(str)
        LocalStorage.player.battleTest.lastJson = str;
        GmModel.ins().sendTestFightInstance(attackerUnitVos, defenderUnitVos, attackerSkills, defenderSkills);
    }
}