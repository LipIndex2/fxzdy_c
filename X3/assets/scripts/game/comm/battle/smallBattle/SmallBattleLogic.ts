import { PoolManager } from "../../../../core/pool/PoolManager";
import { TableManager } from "../../../../core/table/TableManager";
import { GameTimer } from "../../../../core/timer/GameTimer";
import RandomUtils from "../../../../core/utils/RandomUtils";
import { DirctionType, WorldUnitTeam } from "../enum/BattleEnum";
import { SmallBattleBullet } from "./SmallBattleBullet";
import { SmallBattleUnit } from "./SmallBattleUnit";
import { Node } from "cc";

export class SmallBattleLogic {
    private cfg: table.trunkinstance.TrunkInstanceSmallBattleConfig
    private scene: Node;
    private heros: SmallBattleUnit[] = [];
    private monsters: SmallBattleUnit[] = [];
    private bulletMaps: { [uid: number]: SmallBattleBullet } = {};
    private bulletsPool: SmallBattleBullet[] = [];
    private monsterMaxHp: number = 0
    public isInit: boolean = false

    public init(cfg: table.trunkinstance.TrunkInstanceSmallBattleConfig, scene: Node): void {
        this.isInit = true;
        this.cfg = cfg;
        this.scene = scene
        this.monsterMaxHp = +TableManager.getDataById(table.trunkinstance.TrunkInstanceConstantConfig, "TRUNK_INSTANCE:monster_hp").content
        this.heros[0] = this.createHero(cfg.heros1, 0, cfg.heroPos.hero1)
        this.heros[1] = this.createHero(cfg.heros2, 1, cfg.heroPos.hero2)
        this.heros[2] = this.createHero(cfg.heros3, 2, cfg.heroPos.hero3)

        this.monsters[0] = this.createMonster(cfg.monster1, 0, cfg.monsterPos.monster1)
        this.monsters[1] = this.createMonster(cfg.monster2, 1, cfg.monsterPos.monster2)
        this.monsters[2] = this.createMonster(cfg.monster3, 2, cfg.monsterPos.monster3)
    }

    public start(): void {
        GameTimer.ins().frameLoop(1, this, this.onUpdate);
    }

    public stop(): void {
        GameTimer.ins().clearAll(this)
    }

    private onUpdate() {
        for (let i = 0; i < this.heros.length; i++) {
            this.heros[i].update()
        }

        for (let i = 0; i < this.monsters.length; i++) {
            this.monsters[i].update()
        }

        for (let i in this.bulletMaps) {
            this.bulletMaps[i].update()
        }
    }

    public createHero(hero: { id: number }, index: number, pos: number[]): SmallBattleUnit {
        let heroCfg = TableManager.getDataById(table.hero.HeroConfig, hero.id);
        if (!heroCfg)
            return

        let unit = PoolManager.getItem(SmallBattleUnit)
        unit.teamId = WorldUnitTeam.Self;
        unit.init(this.scene, this, heroCfg.skill0 + "01")
        unit.loadByModelId(heroCfg.modelId);
        unit.setHp(999);
        unit.setPosition(index);
        unit.setPosXY(+pos[0], +pos[1])
        unit.setDirction(DirctionType.Left)
        return unit;
    }

    public createMonster(monsters: number[], index: number, pos: number[], unitPool?: SmallBattleUnit): SmallBattleUnit {
        let randomIndex = RandomUtils.randomInt(0, monsters.length - 1)

        let monsterCfg = TableManager.getDataById(table.monster.MonsterAttributeConfig, monsters[randomIndex]);
        if (!monsterCfg)
            return

        let unit: SmallBattleUnit;
        if (unitPool)
            unit = unitPool
        else
            unit = PoolManager.getItem(SmallBattleUnit)

        unit.teamId = WorldUnitTeam.Enemy;
        unit.init(this.scene, this, monsterCfg.skillIds[0])
        unit.loadByModelId(monsterCfg.modelId);
        unit.setHp(this.monsterMaxHp);
        unit.setPosition(index);
        unit.setPosXY(+pos[0], +pos[1])
        unit.setDirction(DirctionType.Rigth)
        return unit;
    }

    public monsterRevive(unit: SmallBattleUnit): void {
        this.createMonster(this.cfg["monster" + (unit.position + 1)], unit.position, this.cfg.monsterPos["monster" + (unit.position + 1)], unit)
    }

    private uidIndex: number = 0;
    public createBullet(unit: SmallBattleUnit, target: SmallBattleUnit, missileId: number): void {
        let bulletCfg = TableManager.getDataById(table.battle.MissileConfig, missileId);
        if (!bulletCfg)
            return

        let bullet = this.bulletsPool.shift()
        if (!bullet) {
            bullet = new SmallBattleBullet(++this.uidIndex)
        }
        bullet.init(this.scene, this, bulletCfg)
        bullet.loadByModelId(bulletCfg.modelId[0]);
        bullet.owner = unit;
        bullet.target = target;
        let atkPoint = unit.getAtkPoint()
        bullet.setPosXY(atkPoint.x, atkPoint.y)
        this.bulletMaps[bullet.uid] = bullet
    }

    public poolBullet(bullet: SmallBattleBullet): void {
        delete this.bulletMaps[bullet.uid];
        this.bulletsPool.push(bullet)
    }

    /***根据对应的位置获取对应的目标 */
    public checkTargetByPosition(position: number, teamId: number): SmallBattleUnit {
        if (teamId == WorldUnitTeam.Self)
            return this.monsters[position]
        else
            return this.heros[position]
    }

    public dispose(): void {
        GameTimer.ins().clearAll(this);
        for (let i = 0; i < this.heros.length; i++) {
            this.heros[i].dispose()
        }
        this.heros.length = 0;

        for (let i = 0; i < this.monsters.length; i++) {
            this.monsters[i].dispose()
        }
        this.monsters.length = 0;

        for (let i in this.bulletMaps) {
            this.bulletMaps[i].dispose()
        }
        delete this.bulletMaps;

        for (let i = 0; i < this.bulletsPool.length; i++) {
            this.bulletsPool[i].dispose()
        }
        this.bulletsPool.length = 0;
    }
}