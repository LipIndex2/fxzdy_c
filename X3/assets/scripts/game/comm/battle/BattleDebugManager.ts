import { Graphics, Color, Node } from "cc";
import { PathPoint } from "../../../core/astar/PathPoint";
import BaseSingleton from "../../../core/base/BaseSingleton";
import UrlUtils from "../../../core/utils/UrlUtils";
import WorldInstance from "../world/WorldInstance";
import { Vec2 } from "cc";
import G from "../../../core/comm/G";
import { GameTimer } from "../../../core/timer/GameTimer";
import { MathUtils } from "../../../core/utils/MathUtils";
import RandomUtils from "../../../core/utils/RandomUtils";
import { HurtNumType, WorldUnitTeam } from "./enum/BattleEnum";
import BattleShowFactory from "./factory/BattleShowFactory";
import { DEBUG } from "cc/env";
import { DamageVo } from "./DamageVo";
import FacadeManager from "../../../core/mvc/FacadeManager";
import { PoolManager } from "../../../core/pool/PoolManager";
import NotificationKey from "../../event/NotificationKey";
import BattleConstantConfig from "./config/BattleConstantConfig";
import { ICreateMonsterData, ICreateMineralData } from "./interface/BattleInterface";
import { Handler } from "../../../core/utils/Handler";
import { UIManager } from "../../../core/mvc/UIManager";
import { UIMainKey } from "../../ui/main/const/UIMainConfig";
import { HorizontalTextAlignment } from "cc";
import * as fgui from "fairygui-cc";
import GIns from "../../GIns";
import { TableManager } from "../../../core/table/TableManager";
import { CameraAnimUtils } from "../../tiledMap/CameraAnimUtils";
import { v2 } from "cc";
import { BattleUtils } from "./BattleUtils";
import UnitFactory from "./factory/UnitFactory";
import { FightType } from "./enum/FightType";
import { TimeManager } from "../../../core/time/TimeManager";
import { TimeUtils } from "../utils/TimeUtils";
import { PlayerModel } from "../../modules/player/model/PlayerModel";

export class BattleDebugManager extends BaseSingleton {
    private _mainScene: WorldInstance;

    public get mainScene(): WorldInstance {
        return this._mainScene
    }

    public set mainScene(mainScene: WorldInstance) {
        this._mainScene = mainScene;
        if (DEBUG)
            window["BattleDebugManager"] = BattleDebugManager.ins()
    }

    public get isDebug(): boolean {
        return this.isTestBattle || UrlUtils.hasUrlParam(UrlUtils.isFightDebug)
    }

    public get isAllNotHurt(): boolean {
        if (!this.isDebug)
            return false
        return this.isTestNotHurt || UrlUtils.hasUrlParam(UrlUtils.isAllNotHurt)
    }

    public get isMonsterNotAttack(): boolean {
        if (!this.isDebug)
            return false
        return this.isTestStopEnemy || UrlUtils.hasUrlParam(UrlUtils.isMonsterNotAttack)
    }

    public get isOnlyNormalAttack(): boolean {
        if (!this.isDebug)
            return false
        return this.isTestOnlyNormal || UrlUtils.hasUrlParam(UrlUtils.isOnlyNormalAttack)
    }


    public get isHeroNotAttack(): boolean {
        if (!this.isDebug)
            return false
        return this.isTestStopHero
    }

    public isPerformanceTest: boolean = false
    public isNotEnvActive: boolean = false

    /***是否测试场景 */
    public isTestBattle: boolean = false;
    public isTestNotHurt: boolean = false;
    public isTestStopEnemy: boolean = false;
    public isTestStopHero: boolean = false;
    public isTestOnlyNormal: boolean = false;
    private debugIgnoreSkillMap: { [pos: string]: string[] }
    public debugIgnoreSkill(attack: { [pos: number]: string[] }, defend: { [pos: number]: string[] }): void {
        this.debugIgnoreSkillMap = {};
        for (let pos in attack) {
            this.debugIgnoreSkillMap["attack_" + pos] = attack[pos]
        }

        for (let pos in defend) {
            this.debugIgnoreSkillMap["defend" + pos] = attack[pos]
        }
    }

    public checkSkillIgnore(teamId: number, pos: number, skillGroup: string): boolean {
        if (teamId == 1) {
            return this.debugIgnoreSkillMap["attack_" + pos] && this.debugIgnoreSkillMap["attack_" + pos].indexOf(skillGroup) != -1
        }
        else if (teamId == 2)
            return this.debugIgnoreSkillMap["defend_" + pos] && this.debugIgnoreSkillMap["defend_" + pos].indexOf(skillGroup) != -1

        return false;
    }

    public exitBattleTest(): void {
        this.debugIgnoreSkillMap = {};
        this.isTestBattle = false;
    }

    /**继续战斗 */
    debugResume() {
        this.mainScene.resume()
    }

    private debugMapNode: Node
    private debugMapGraphics: Graphics;
    private testLabs: fgui.GTextField[] = []
    /***地图调试 */
    public debugMap(type: string): void {
        let battleLogic = GIns.battleMgr.battleLogic;
        if (type == "显示地图格子") {

            let startX = 0;//team.pos.x - screen.windowSize.x
            let endX = battleLogic.aStar.rows
            let startY = 0;//team.pos.y - screen.windowSize.y
            let endY = battleLogic.aStar.cols//team.pos.y + screen.windowSize.y

            if (!this.debugMapGraphics) {
                this.debugMapNode = new Node()
                this.debugMapGraphics = this.debugMapNode.addComponent(Graphics)
            }

            if (!this.debugMapNode.isValid) {
                this.debugMapNode = new Node()
                this.debugMapGraphics = this.debugMapNode.addComponent(Graphics)
            }
            GIns.worldMgr.bgLayer.addChild(this.debugMapNode)

            let g = this.debugMapGraphics;
            g.clear()

            let titleSize = battleLogic.aStar.tileSize

            let col = endX
            let row = endY
            for (let i = 0; i < col; i++) {
                for (let j = 0; j < row; j++) {
                    g.lineWidth = 5;
                    if (battleLogic.aStar.isPass(i, j)) {
                        g.fillColor.set(0, 0, 0, 0);
                    }
                    else {
                        g.fillColor.set(Color.RED.r, Color.RED.g, Color.RED.b, 100);
                    }

                    let teamX = GIns.battleMgr.battleLogic.getTeamByTeamId(1).pos.x
                    let teamY = GIns.battleMgr.battleLogic.getTeamByTeamId(1).pos.y
                    if ((teamX - 1000) < (startX + i * titleSize) && (teamX + 1000) > (startX + i * titleSize) && (teamY + 1000) > (startY + j * titleSize) && (teamY - 1000) < (startY + j * titleSize)) {
                        let lab = new fgui.GTextField()
                        lab.text = i + "\n" + (j - 1)
                        lab.fontSize = 20;
                        lab.width = titleSize;
                        lab.color = Color.WHITE;
                        lab.align = HorizontalTextAlignment.LEFT
                        this.testLabs.push(lab)
                        this.debugMapNode.addChild(lab.node);
                        lab.setPosition(startX + i * titleSize, -(startY + j * titleSize))

                        g.rect(startX + i * titleSize, startY + j * titleSize, titleSize, titleSize)
                        g.stroke();
                        g.fill();
                    }
                }
            }
        }
        else if (type == "输出当前坐标") {

            let heros = this.mainScene.getHeros();

            for (let i = 0; i < heros.length; i++) {
                let p = battleLogic.aStar.getTilePoint(heros[i].pos.x, heros[i].pos.y)
                G.Logger.fight(`当前点击的地图坐标 x=${p.x} y=${p.y}`)
            }
        }
    }

    /***地图调试 */
    private debugFindMapGraphics: Graphics;

    private debugShowPathsNode: Node;
    public debugShowPaths(paths: PathPoint[]): void {

        if (!this.isDebug)
            return;

        if (!this.debugFindMapGraphics) {
            this.debugShowPathsNode = new Node()
            this.debugFindMapGraphics = this.debugShowPathsNode.addComponent(Graphics)
        }

        if (!this.debugShowPathsNode.isValid)
            return
        GIns.worldMgr.bgLayer.addChild(this.debugShowPathsNode)

        let g = this.debugFindMapGraphics;
        g.clear()
        for (let i = 0; i < paths.length; i++) {
            g.lineWidth = 5;
            g.fillColor.set(Color.YELLOW);
            g.rect(paths[i].x * 64, paths[i].y * 64, 64, 64)
            g.stroke();
            g.fill();
        }
    }

    public debugPause() {
        this.mainScene.pause()
    }


    public debug1(type: number): void {
        var heros = this.mainScene.getHeros()
        for (var i = 0; i < heros.length; i++) {
            for (let j = 0; j < 10; j++) {
                GameTimer.ins().once(200 * j, this, (index) => {
                    // BattleShowFactory.createNum(type, RandomUtils.randomInt(-10000000, 10000000), heros[index].pos, heros[index].modelHeight);
                    if (RandomUtils.randomInt(0, 1) == 0)
                        BattleShowFactory.createAttrBuffNum(HurtNumType.AttrDown, heros[index].pos, heros[index].modelHeight, { CRI_RES: 2000 })
                    else
                        BattleShowFactory.createAttrBuffNum(HurtNumType.AttrUp, heros[index].pos, heros[index].modelHeight, { ATK_SPD: 2000 })
                    // BattleShowFactory.createNum(HurtNumType.Abnormal, 0, heros[index].pos, heros[index].modelHeight, 1)
                }, [i])
            }
        }
    }

    private debugRangeGraphics: Graphics;
    public showRangeArc(graphics: Graphics, x: number, y: number, dir: number, radius: number, angle: number): void {
        if (this.ShowBattleRange != 3)
            return;

        if (graphics) {
            this.debugRangeGraphics = graphics;
        }
        else if (!this.debugRangeGraphics)
            this.debugRangeGraphics = GIns.worldMgr.shadowLayer.addComponent(Graphics)

        if (this.debugRangeGraphics && !this.debugRangeGraphics.isValid) {
            this.debugRangeGraphics = GIns.worldMgr.shadowLayer.addComponent(Graphics)
        }

        let g = this.debugRangeGraphics;
        g.clear()
        g.lineWidth = 5;
        g.strokeColor.fromHEX('#ff0000')
        g.moveTo(x, y);
        let beginAngle = dir - angle * 0.5
        let bendAngle = dir + angle * 0.5
        let endPoint = MathUtils.getEllipsePoint(beginAngle, radius, radius, x, y)
        g.lineTo(endPoint.x, endPoint.y);
        g.arc(x, y, radius, beginAngle * Math.PI / 180, bendAngle * Math.PI / 180, true)
        g.lineTo(x, y);
        g.stroke();
        g.fill();
    }

    private debugRangeGraphics2: Graphics;
    public showRangeArc2(graphics: Graphics, x: number, y: number, dir: number, radius: number, angle: number): void {
        if (this.ShowBattleRange != 3)
            return;
        if (graphics) {
            this.debugRangeGraphics2 = graphics;
        }
        else if (!this.debugRangeGraphics2)
            this.debugRangeGraphics2 = GIns.worldMgr.bgLayer.addComponent(Graphics)

        if (this.debugRangeGraphics2 && !this.debugRangeGraphics2.isValid) {
            this.debugRangeGraphics2 = GIns.worldMgr.shadowLayer.addComponent(Graphics)
        }

        let g = this.debugRangeGraphics2;
        g.clear()
        g.lineWidth = 5;
        g.strokeColor.fromHEX('#ffff00')
        g.fillColor.fromHEX('#ff0000')
        g.moveTo(x, y);
        let beginAngle = dir - angle * 0.5
        let bendAngle = dir + angle * 0.5
        let endPoint = MathUtils.getEllipsePoint(beginAngle, radius, radius, x, y)
        g.lineTo(endPoint.x, endPoint.y);
        g.arc(x, y, radius, beginAngle * Math.PI / 180, bendAngle * Math.PI / 180, true)
        g.lineTo(x, y);
        g.stroke();
        g.fill();
    }

    public showRangeCircle(graphics: Graphics, x: number, y: number, radius: number): void {
        if (this.ShowBattleRange != 2)
            return;

        if (this.debugRangeGraphics && !this.debugRangeGraphics.isValid) {
            this.debugRangeGraphics = null;
        }
        if (graphics) {
            this.debugRangeGraphics = graphics;
        }
        else if (!this.debugRangeGraphics)
            this.debugRangeGraphics = GIns.worldMgr.shadowLayer.addComponent(Graphics)

        let g = this.debugRangeGraphics;
        g.clear()
        // g.fillColor.fromHEX('#ff0000')
        g.circle(x, y, radius)
        g.stroke();
        g.fill();
    }

    public showRangeCircle2(graphics: Graphics, x: number, y: number, radius: number): void {
        if (this.ShowBattleRange != 2)
            return;
        if (graphics) {
            this.debugRangeGraphics = graphics;
        }
        else if (!this.debugRangeGraphics)
            this.debugRangeGraphics = GIns.worldMgr.shadowLayer.addComponent(Graphics)

        let g = this.debugRangeGraphics;
        g.clear()
        // g.fillColor.fromHEX('#ff0000')
        g.circle(x, y, radius)
        g.stroke();
        g.fill();
    }

    public showRangeEllipse(graphics: Graphics, x: number, y: number, radiusX: number, radiusY: number): void {
        if (this.ShowBattleRange != 2)
            return;
        if (graphics) {
            this.debugRangeGraphics = graphics;
        }
        else if (!this.debugRangeGraphics)
            this.debugRangeGraphics = GIns.worldMgr.shadowLayer.addComponent(Graphics)

        let g = this.debugRangeGraphics;
        g.clear()
        // g.fillColor.fromHEX('#ff0000')
        g.ellipse(x, y, radiusX, radiusY)
        g.stroke();
        g.fill();
    }


    public showRange(hitRangeTopLeft: Vec2, hitRangeTopRight: Vec2, hitRangeBottomRight: Vec2, hitRangeBottomLeft: Vec2): void {
        if (this.ShowBattleRange != 1)
            return;
        if (this.debugRangeGraphics && !this.debugRangeGraphics.isValid) {
            this.debugRangeGraphics = null;
        }

        if (!this.debugRangeGraphics)
            this.debugRangeGraphics = GIns.worldMgr.shadowLayer.addComponent(Graphics)

        let g = this.debugRangeGraphics;
        g.clear()
        g.lineWidth = 1;
        g.fillColor.fromHEX('#ff0000');
        g.moveTo(hitRangeTopLeft.x, hitRangeTopLeft.y);
        g.lineTo(hitRangeTopRight.x, hitRangeTopRight.y);
        g.lineTo(hitRangeBottomRight.x, hitRangeBottomRight.y);
        g.lineTo(hitRangeBottomLeft.x, hitRangeBottomLeft.y);
        g.moveTo(hitRangeTopLeft.x, hitRangeTopLeft.y);
        g.stroke();
        g.fill();
    }

    public showLine(hitRangeTopLeft: Vec2, hitRangeTopRight: Vec2,): void {
        if (this.ShowBattleRange != 1)
            return;
        if (this.debugRangeGraphics && !this.debugRangeGraphics.isValid) {
            this.debugRangeGraphics = null;
        }

        if (!this.debugRangeGraphics)
            this.debugRangeGraphics = GIns.worldMgr.uiLayer.addComponent(Graphics)

        let g = this.debugRangeGraphics;
        g.clear()
        g.lineWidth = 20;
        g.strokeColor.fromHEX('#ff0000');
        g.moveTo(hitRangeTopLeft.x, hitRangeTopLeft.y);
        g.lineTo(hitRangeTopRight.x, hitRangeTopRight.y);
        g.stroke();
        g.fill();
    }


    public get ShowBattleRange(): number {
        return UrlUtils.getURLQuery(UrlUtils.ShowBattleRange)
    }

    public debug2(w: number, h: number, angle: number): void {
        if (!this.debugRangeGraphics)
            this.debugRangeGraphics = GIns.worldMgr.shadowLayer.addComponent(Graphics)

        let battleLogic = GIns.battleMgr.battleLogic;
        let team = battleLogic.getTeamByTeamId(1)
        let g = this.debugRangeGraphics;
        g.clear()

        g.lineWidth = 1;
        g.fillColor.fromHEX('#0ff000');
        for (let i = 0; i < 1000; i++) {
            // let xy: { x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number } = UnitFactory.createRandomCoordinate(team.pos, w, h, angle)
            // g.circle(xy.x1, xy.y1, 2)
            // g.circle(xy.x2, xy.y2, 2)
            // g.circle(xy.x3, xy.y3, 2)
            // g.circle(xy.x4, xy.y4, 2)
            let xy = MathUtils.createRandomCoordinate(team.pos, w, h, angle)
            g.circle(xy.x, xy.y, 2)
        }
        g.stroke();
        g.fill();

    }

    public debug3(w: number, h: number, bh: number): void {
        if (!this.debugRangeGraphics)
            this.debugRangeGraphics = GIns.worldMgr.shadowLayer.addComponent(Graphics)


        let battleLogic = GIns.battleMgr.battleLogic;
        let team = battleLogic.getTeamByTeamId(1)
        let g = this.debugRangeGraphics;
        g.clear()

        g.lineWidth = 1;
        g.fillColor.fromHEX('#0ff000');
        for (let i = 0; i < 1000; i++) {
            // let xy: { x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number } = UnitFactory.createRandomCoordinate(team.pos, w, h, angle)
            // g.circle(xy.x1, xy.y1, 2)
            // g.circle(xy.x2, xy.y2, 2)
            // g.circle(xy.x3, xy.y3, 2)
            // g.circle(xy.x4, xy.y4, 2)
            let xy = battleLogic.randomMgr.getRandomPointOnRectEdge(team.pos, w, h, bh)
            g.circle(xy.x, xy.y, 2)
        }
        g.stroke();
        g.fill();

    }


    public showHerosAttr(heroId: number = 0): void {

        let cfgs: table.battle.AttributeConfig[] = G.TableManager.getAllData(table.battle.AttributeConfig)
        let keyMap: { [id: number]: string } = {}
        for (let i = 0; i < cfgs.length; i++) {
            keyMap[cfgs[i].tid] = cfgs[i].id
        }

        console.log("===============输出英雄属性================")
        var heros = this._mainScene.getHeros()
        for (var i = 0; i < heros.length; i++) {
            if (heroId == 0 || heros[i].attr.getHeroConfigId() == heroId) {
                console.log(`[${heros[i].attr.name}(${heros[i].attr.getHeroConfigId()})] 属性：`)

                for (let attrKey in heros[i].attr["_attrs"]) {
                    let key = +attrKey
                    var fighterAttrBuff: { [key: number]: { value: number, per: number } } = heros[i].battleLogic.buffMgr.getBuffAttrMap(heros[i]);
                    var attrObj: { value: number, per: number } = { value: 0, per: 0 };
                    if (fighterAttrBuff && fighterAttrBuff[key])
                        attrObj = fighterAttrBuff[key];

                    // G.Logger.fight(`${keyMap[attrKey]}：${heros[i].attr["_attrs"][attrKey]} (+${attrObj.value})`)
                    console.log(`${keyMap[attrKey]}：${heros[i].attr["_attrs"][attrKey]}`)
                }
                console.log(`实际速度：${heros[i].attr.atkSpeed}`)
                console.log("==========================================")
            }
        }
    }

    public showMonstersAttr(heroId: number = 0): void {

        let cfgs: table.battle.AttributeConfig[] = G.TableManager.getAllData(table.battle.AttributeConfig)
        let keyMap: { [id: number]: string } = {}
        for (let i = 0; i < cfgs.length; i++) {
            keyMap[cfgs[i].tid] = cfgs[i].id
        }

        console.log("===============输出英雄属性================")
        var heros = this._mainScene.getEmenys()
        for (var i = 0; i < heros.length; i++) {
            if (heroId == 0 || heros[i].attr.getHeroConfigId() == heroId) {
                console.log(`[${heros[i].attr.name}(${heros[i].attr.getHeroConfigId()})] 属性：`)

                for (let attrKey in heros[i].attr["_attrs"]) {
                    let key = +attrKey
                    var fighterAttrBuff: { [key: number]: { value: number, per: number } } = heros[i].battleLogic.buffMgr.getBuffAttrMap(heros[i]);
                    var attrObj: { value: number, per: number } = { value: 0, per: 0 };
                    if (fighterAttrBuff && fighterAttrBuff[key])
                        attrObj = fighterAttrBuff[key];

                    // G.Logger.fight(`${keyMap[attrKey]}：${heros[i].attr["_attrs"][attrKey]} (+${attrObj.value})`)
                    console.log(`${keyMap[attrKey]}：${heros[i].attr["_attrs"][attrKey]}`)
                }
                console.log(`实际速度：${heros[i].attr.atkSpeed}`)
                console.log("==========================================")
            }
        }
    }

    public clearAllCD(isMonster: boolean = false): void {
        if (!isMonster) {
            var heros = this._mainScene.getHeros()
            for (var i = 0; i < heros.length; i++) {
                heros[i].attr.resetSkillAllCd()
            }
        }
        else {
            var monsters = this._mainScene.getEmenys()
            for (var i = 0; i < monsters.length; i++) {
                monsters[i].attr.resetSkillAllCd()
            }
        }
    }

    public skill1(id: string = "1021"): void {
        this.clearAllCD()
        var heros = this._mainScene.getHeros()
        for (var i = 0; i < heros.length; i++) {
            let heroId = +id.split("_")[0]
            if (heroId == heros[i].attr.getHeroConfigId()) {
                let skillIndex = +id.split("_s")[1]
                heros[i].useSkillByIndex(skillIndex - 1)
            }
        }
    }

    public skill2(id: string = "1022", isMonster: boolean = false): void {
        this.clearAllCD(isMonster)
        if (!isMonster) {
            var heros = this._mainScene.getHeros()
            for (var i = 0; i < heros.length; i++) {
                heros[i].useSkill(id)
            }
        }
        else {
            var monsters = this._mainScene.getEmenys()
            for (var i = 0; i < monsters.length; i++) {
                monsters[i].useSkill(id)
            }
        }
    }

    public addBuff(id: string = "Test_001_bf01"): void {
        var heros = this._mainScene.getHeros()
        for (var i = 0; i < heros.length; i++) {
            heros[i].battleLogic.buffMgr.buffControlByGroup(id, heros[i], heros[i])
        }
    }

    public removeBuff(id: string = "102501"): void {
        var heros = this._mainScene.getHeros()
        for (var i = 0; i < heros.length; i++) {
            heros[i].attr.removeBuffById(id)
        }
    }

    public dieHero(heroId: number): void {
        var heros = this._mainScene.getHeros()
        for (var i = 0; i < heros.length; i++) {
            if (heros[i].attr.getHeroConfigId() == heroId) {
                let da = new DamageVo()
                da.value = 999999999999;
                heros[i].hurt(da)
                break;
            }
        }
    }

    public stopAttack(): void {
        var heros = this._mainScene.getHeros()
        for (var i = 0; i < heros.length; i++) {
            heros[i].isAutoFight = false;
        }
    }

    public aotoAttack(): void {
        var heros = this._mainScene.getHeros()
        for (var i = 0; i < heros.length; i++) {
            heros[i].isAutoFight = true; 6
        }
    }

    /***模拟伤害 */
    public debugHurt(hp: number, teamId: number = 1): void {
        var heros = this._mainScene.getHeros()
        for (var i = 0; i < heros.length; i++) {
            if (heros[i].isDeath)
                continue

            if (heros[i].teamId == 1) {
                let damageVo = PoolManager.getItem(DamageVo)
                damageVo.target = heros[i]
                damageVo.caster = heros[i]
                damageVo.status = BattleConstantConfig.Normal;
                damageVo.ignoreSelfHurtText = false;
                damageVo.value = hp;
                heros[i].battleLogic.hurt(damageVo)
            }
        }
    }

    /***模拟伤害 */
    public debugHurtSummon(hp: number): void {
        var monsters = GIns.battleMgr.battleLogic.getUnitsByTeamId(1)
        for (var i = 0; i < monsters.length; i++) {
            if (monsters[i].summon) {
                let damageVo = PoolManager.getItem(DamageVo)
                damageVo.target = monsters[i]
                damageVo.caster = monsters[i]
                damageVo.status = BattleConstantConfig.Normal;
                damageVo.value = hp;
                monsters[i].hurt(damageVo)
            }
        }
    }

    public debugHurtAllMonster(hp: number): void {
        var monsters = this._mainScene.getEmenys()
        for (var i = 0; i < monsters.length; i++) {
            let damageVo = PoolManager.getItem(DamageVo)
            damageVo.target = monsters[i]
            damageVo.caster = monsters[i]
            damageVo.status = BattleConstantConfig.Normal;
            damageVo.value = hp;
            monsters[i].battleLogic.hurt(damageVo)
        }
    }

    public debugMonster(num: number = 1, monsetId: number = 17001, x: number = 0, y: number = 0): void {
        let monsterX = 0;
        let monsterY = 0;
        var heros = GIns.battleMgr.mainScene.getHeros()
        if (heros.length > 0) {
            monsterX = heros[0].pos.x + x;
            monsterY = heros[0].pos.y + y;
        }

        let monsterData: ICreateMonsterData = {} as any
        monsterData.resourceId = 400011003
        monsterData.monsterId = monsetId
        monsterData.pos = new Vec2(monsterX, monsterY)
        monsterData.teamId = WorldUnitTeam.Enemy
        monsterData.idxs = []
        for (let i = 0; i < num; i++)
            monsterData.idxs.push(Date.now() * 1000 + i)
        let monsterArr: ICreateMonsterData[] = [monsterData];
        FacadeManager.ins().emitNow(NotificationKey.CREATE_MONSTER_UNITS, monsterArr);
    }

    public debugMineralUnits(num: number = 1, hpNum: number = 5, mineralId: number = 1013001): void {

        let monsterX = 0;
        let monsterY = 0;
        var heros = GIns.battleMgr.mainScene.getHeros()
        if (heros.length > 0) {
            monsterX = heros[0].pos.x;
            monsterY = heros[0].pos.y;
        }

        for (let i = 0; i < num; i++) {
            let monsterData: ICreateMineralData = {} as any
            monsterData.mineralId = mineralId
            monsterData.pos = new Vec2(monsterX, monsterY)
            monsterData.idxs = []
            for (let i = 0; i < hpNum; i++)
                monsterData.idxs.push(RandomUtils.randomInt(0, 1000))
            let monsterArr: ICreateMineralData[] = [monsterData];
            this._mainScene.createMineralUnits(monsterArr);
        }
    }

    /***创建一堆怪物 */
    public debugMonsters(waves: { num: number, monster: number, delay: number, times: number, interval: number, x: number, y: number, randomRange: number }[]): void {
        for (let i = 0; i < waves.length; i++) {
            GIns.battleMgr.battleLogic.createTimeCheck(waves[i].delay, new Handler(this, (parm: { times: number, interval: number }) => {
                GIns.battleMgr.battleLogic.createTimeCheck(parm.interval, new Handler(this, (parm2: { num: number, monster: number, x: number, y: number, randomRange: number }) => {
                    if (parm2.randomRange)
                        this.debugMonster(parm2.num, parm2.monster, parm2.x + RandomUtils.randomInt(-parm2.randomRange, parm2.randomRange), parm2.y + RandomUtils.randomInt(-parm2.randomRange, parm2.randomRange))
                    else
                        this.debugMonster(parm2.num, parm2.monster, parm2.x, parm2.y)
                }, [parm], false), parm.times)
            }, [waves[i]], false))
        }
    }

    public hideMainPage(): void {
        G.networkDebugFlag = false
        UIManager.ins().close(UIMainKey.MAIN_PAGE);
    }

    public cleanDefenders(): void {
        this._mainScene.cleanDefenders()
        // let teamUnit = GIns.battleMgr.battleLogic.getTeamByTeamId(WorldUnitTeam.Self)
        // if (teamUnit)
        //     teamUnit.forbiddenMove = true;
    }

    public debugAddBuffByShip(id: number): void {
        let cfg = TableManager.getDataById(table.guardship.GuardShipUseItemConfig, id)
        if (cfg) {
            GIns.battleMgr.addBuff(cfg.buffGroup, cfg.targetType, cfg.targetFaction, cfg.targetParam, cfg.num)
        }
    }

    public debugAddSkillByShip(id: number): void {
        let cfg = TableManager.getDataById(table.guardship.GuardShipSkillConfig, id)
        if (cfg) {
            let type: number = 0;
            let param: any
            if (cfg.targetParam) {
                type = cfg.targetParam[0];
                param = cfg.targetParam.slice(1);
            }
            GIns.battleMgr.addSkillByParam(cfg.effect, WorldUnitTeam.Self, type, param)
        }
    }

    public debugAddSkill(id: string): void {
        var monsters = this._mainScene.getEmenys()
        for (var i = 0; i < monsters.length; i++) {
            GIns.battleMgr.addSkillByUnit(monsters[i], id)
        }
    }

    public zoomMap(scale: number): void {
        CameraAnimUtils.zoomMap(600, scale)
    }

    public setMovePointTarget(x: number, y: number): void {
        let hero = GIns.battleMgr.curUnitProcessor.heroes[0]
        let p = BattleUtils.setPosNotBlockPos(GIns.battleMgr.battleLogic.fightType, v2(hero.pos.x + x, hero.pos.y + y))
        hero.setMoveTarget(p, true, new Handler(this, () => {
            console.log("到达")
        }, null, false))
    }

    public setTeamMovePointTarget(x: number, y: number): void {
        let team = GIns.battleMgr.curUnitProcessor.getTeamById(1)
        let p = BattleUtils.setPosNotBlockPos(GIns.battleMgr.battleLogic.fightType, v2(team.pos.x + x, team.pos.y + y))
        team.setMoveTarget(p, new Handler(this, () => {
            console.log("到达")
        }, null, false))
    }

    public debugChangeHeroAttr(key: number, value: number): void {
        var heros = this._mainScene.getHeros()
        for (var i = 0; i < heros.length; i++) {
            heros[i].attr.attrs[key] = value;
        }
    }

    public debugInfo(): void {
        console.log(TimeUtils.formatTimeMsToDayHourMinuteSecondText(TimeManager.serverNow - PlayerModel.ins().loginTime))
        console.log(GIns.mapMgr.curMap?.getMapID())
    }

    public debug4(): void {
        // GIns.careerTrialModel.sendEnterBattle(1)
        var heros = this._mainScene.getHeros()
        for (var i = 0; i < heros.length; i++) {
            heros[i].setOtherVisible(false)
        }
    }

    /*** */
    // public debugCreateBoss(): void {
    //     let p = UnitFactory.findNotBlockPos(FightType.SECRET_INSTANCE, GIns.battleMgr.battleLogic.getTeamPosByTeamId(WorldUnitTeam.Self), { w: 600, h: 600 }, 0, 20, true);
    //     this.debugMonster(100, 8006, p.x, p.y)
    // }
}