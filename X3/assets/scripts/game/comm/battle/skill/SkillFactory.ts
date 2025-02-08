import { PoolManager } from "../../../../core/pool/PoolManager";
import { ASiJiaDeZhiDianSkill } from "../unit/collectSkill/ASiJiaDeZhiDianUnit";
import { AoDingZhiMaoSkill } from "../unit/collectSkill/AoDingZhiMaoUnit";
import { HaiLaZhiGuanSkill } from "../unit/collectSkill/HaiLaZhiGuanUnit";
import { WuXianShouTaoSkill } from "../unit/collectSkill/WuXianShouTaoCollectUnit";
import { BaseSkillData } from "./BaseSkillData";
import { FightSkillInfo } from "./FightSkillInfo";
import { SkillData } from "./SkillData";
import { ANuBiSiMonsterPassivitySkill1 } from "./boss/ANuBiSiMonsterSkill";
import { BoSaiDongMonsterSkill2, BoSaiDongMonsterSkill3 } from "./boss/BoSaiDongMonsterSkill";
import { ChengFaZheMonsterSkill3 } from "./boss/ChengFaZheMonsterSkill";
import { ChuiXieSkill3 } from "./boss/ChuiXie";
import { CiSheSkill3 } from "./boss/CiShe";
import { DuYeMonsterPassivitySkill1 } from "./boss/DuYeMonsterSkill";
import { ELingMonsterSkill2, ELingMonsterSkill3 } from "./boss/ELingMonster";
import { FaLiKongMoZhaoHuanWuSkill1 } from "./boss/FaLiKongMo";
import { GangTieXiaMonsterPassivitySkill1, GangTieXiaMonsterSkill1, GangTieXiaMonsterSkill2, GangTieXiaMonsterSkill3 } from "./boss/GangTieXiaMonster";
import { GuanYuMonsterSkill2 } from "./boss/GuanYuMonsterSkill";
import { HaiMuDaErMonsterPassivitySkill1, HaiMuDaErMonsterSkill3 } from "./boss/HaiMuDaErMonsterSkill";
import { HeYaMonsterSkill3 } from "./boss/HeYaMonster";
import { HeiDongMonsterSkill2, HeiDongMonsterSkill3 } from "./boss/HeiDongMonsterSkill";
import { HuangXiongMonsterSkill1, HuangXiongMonsterSkill2, HuangXiongMonsterPassivitySkill1 } from "./boss/HuangXiongMonsterSkill";
import { HuiMieZheMonsterPassivitySkill1, HuiMieZheMonsterSkill2, HuiMieZheMonsterSkill3 } from "./boss/HuiMieZheMonsterSkill";
import { HuoFuMonsterSkill2 } from "./boss/HuoFuMonsterSkill";
import { JiXieYiXingSkill3 as JiXieYiXingSkill3 } from "./boss/JiXieYiXing";
import { JiaLiLveMonsterSkill2, JiaLiLveMonsterSkill3 } from "./boss/JiaLiLveMonsterSkill";
import { JuDuZhiCiSkill4 } from "./boss/JuDuZhiCi";
import { KaMoLaMonsterSkill2 } from "./boss/KaMoLaMonster";
import { LeiNuoMonsterSkill3 } from "./boss/LeiNuoMonsterSkill";
import { LiLiSiMonsterSkill3 } from "./boss/LiLiSiMonsterSkill";
import { LuXiFaMonsterSkill2, LuXiFaMonsterSkill3 } from "./boss/LuXiFaMonsterSkill";
import { MaErSiMonsterSkill2, MaErSiMonsterSkill3 } from "./boss/MaErSiMonsterSkill";
import { MaLiJuLiMonsterSkill1, MaLiJuLiMonsterSkill2, MaLiJuLiMonsterSkill3 } from "./boss/MaLiJuLiMonsterSkill";
import { MeiDuShaMonsterSkill2, MeiDuShaMonsterSkill3 } from "./boss/MeiDuShaMonsterSkill";
import { MieBaMonsterPassivitySkill1, MieBaMonsterSkill2, MieBaMonsterSkill3 } from "./boss/MieBaMonster";
import { NuoWaMonsterSkill2, NuoWaMonsterSkill3 } from "./boss/NuoWaMonsterSkill";
import { QiuBiTeMonsterSkill2, QiuBiTeMonsterSkill3 } from "./boss/QiuBiTeMonsterSkill";
import { SamaierMonsterSkill2 } from "./boss/SamaierMonsterSkill";
import { ShenHaiGeJiMonsterSkill2, ShenHaiGeJiMonsterSkill3 } from "./boss/ShenHaiGeJiMonsterSkill";
import { TiaoTiaoQiShouMonsterSkill3 } from "./boss/TiaoTiaoQiShouMonsterSkill";
import { TuoErMonsterSkill2, TuoErMonsterSkill3 } from "./boss/TuoErMonsterSkill";
import { WangNianJiShengShouSkill2 } from "./boss/WangNianJiShengShou";
import { WeiLaMonsterPassivitySkill1, WeiLaMonsterSkill3 } from "./boss/WeiLaMonsterSkill";
import { WengJiangMonsterPassivitySkill1, WengJiangMonsterSkill2, WengJiangMonsterSkill3 } from "./boss/WengJiangMonster";
import { WoErTeMonsterSkill2, WoErTeMonsterSkill3 } from "./boss/WoErTeMonsterSkill";
import { WuTouQiShiMonsterPassivitySkill1, WuTouQiShiMonsterSkill2, WuTouQiShiMonsterSkill3 } from "./boss/WuTouQiShiMonsterSkill";
import { XingJueMonsterPassivitySkill1, XingJueMonsterSkill1, XingJueMonsterSkill3 } from "./boss/XingJueMonster";
import { YangJianMonsterSkill2, YangJianMonsterSkill3 } from "./boss/YangJianMonsterSkill";
import { YeYingMonsterPassivitySkill1, YeYingMonsterSkill1, YeYingMonsterSkill2, YeYingMonsterSkill3 } from "./boss/YeYingMonsterSkill";
import { ZhanZhengZhiYingMonsterSkill1, ZhanZhengZhiYingMonsterSkill2, ZhanZhengZhiYingMonsterSkill3 } from "./boss/ZhanZhengZhiYingMonsterSkill";
import { ZhenDeMonsterPassivitySkill1, ZhenDeMonsterSkill2 } from "./boss/ZhenDeMonsterSkill";
import { ZhouSiMonsterSkill3 } from "./boss/ZhouSiMonsterSkill";
import { ZiZouRenXingMonsterSkill2 } from "./boss/ZiZouRenXingMonsterSkill";
import { ANuBiSiPassivitySkill1 } from "./hero/ANuBiSi";
import { BoSaiDongSkill2, BoSaiDongSkill3 } from "./hero/BoSaiDong";
import { BoSaiDongZhuanHuanWuSkill1 } from "./hero/BoSaiDongZhuanHuanWuSkill";
import { ChengFaZheSkill3 } from "./hero/ChengFaZhe";
import { DuYePassivitySkill1 } from "./hero/DuYe";
import { ELingSkill2, ELingSkill3, ELingZhaoHuanWuSkill1 } from "./hero/ELing";
import { GangTieXiaPassivitySkill1, GangTieXiaSkill1, GangTieXiaSkill2, GangTieXiaSkill3 } from "./hero/GangTieXia";
import { GuanYuSkill2 } from "./hero/GuanYu";
import { HaiMuDaErPassivitySkill1 as HaiMuDaErPassivitySkill1, HaiMuDaErSkill3 } from "./hero/HaiMuDaEr";
import { HeYaSkill3 } from "./hero/HeYa";
import { HeiDongSkill2, HeiDongSkill3 } from "./hero/HeiDong";
import { HuangXiongPassivitySkill1, HuangXiongSkill1, HuangXiongSkill2 } from "./hero/HuangXiong";
import { HuiMieZhePassivitySkill1, HuiMieZheSkill2, HuiMieZheSkill3 } from "./hero/HuiMieZhe";
import { HuoFuSkill2 } from "./hero/HuoFu";
import { JiaLiLveSkill2, JiaLiLveSkill3 } from "./hero/JiaLiLve";
import { KaMoLaSkill2 } from "./hero/KaMoLa";
import { KuoBuZheSkill3 } from "./hero/KuoBuZhe";
import { LeiNuoSkill3 } from "./hero/LeiNuo";
import { LiLiSiSkill3 } from "./hero/LiLiSi";
import { LuXiFaSkill2, LuXiFaSkill3 } from "./hero/LuXiFa";
import { LuoJiPassivitySkill1, LuoJiSkill2, LuoJiSkill3 } from "./hero/LuoJi";
import { LvBuPassivitySkill1, LvBuSkill2, LvBuSkill3 } from "./hero/LvBu";
import { MaErSiSkill2, MaErSiSkill3 } from "./hero/MaErSi";
import { MaLiJuLiSkill1, MaLiJuLiSkill2, MaLiJuLiSkill3 } from "./hero/MaLiJuLi";
import { MeiDuShaSkill2, MeiDuShaSkill3 } from "./hero/MeiDuSha";
import { MeiGuoDuiZhangXSkill1, MeiGuoDuiZhangSkill2, MeiGuoDuiZhangSkill31, MeiGuoDuiZhangSkill3 } from "./hero/MeiGuoDuiZhang";
import { MieBaPassivitySkill1, MieBaSkill2, MieBaSkill3 } from "./hero/MieBa";
import { NuoWaSkill2, NuoWaSkill3 } from "./hero/NuoWa";
import { NuoWaZhaoHuanWuSkill2 } from "./hero/NuoWaZhaoHuanWuSkill";
import { QiuBiTeSkill2, QiuBiTeSkill3 } from "./hero/QiuBiTe";
import { SamaierSkill2, SamaierXSkill1 } from "./hero/Samaier";
import { ShenHaiGeJiSkill2, ShenHaiGeJiSkill3 } from "./hero/ShenHaiGeJi";
import { SunWuKongPassivitySkill1, SunWuKongSkill1, SunWuKongSkill3 } from "./hero/SunWuKong";
import { TiaoTiaoQiShouSkill3 } from "./hero/TiaoTiaoQiShou";
import { TuoErSkill2, TuoErSkill3 } from "./hero/TuoEr";
import { WeiLaPassivitySkill1, WeiLaSkill3 } from "./hero/WeiLa";
import { WengJiangPassivitySkill1, WengJiangSkill2, WengJiangSkill3 } from "./hero/WengJiang";
import { WoErTeSkill2, WoErTeSkill3 } from "./hero/WoErTe";
import { WuTouQiShiPassivitySkill1, WuTouQiShiSkill2, WuTouQiShiSkill3 } from "./hero/WuTouQiShi";
import { XingJuePassivitySkill1, XingJueSkill1, XingJueSkill3 } from "./hero/XingJue";
import { YangJianSkill2, YangJianSkill3 } from "./hero/YangJian";
import { YeYingPassivitySkill1, YeYingSkill1, YeYingSkill2, YeYingSkill3 } from "./hero/YeYing";
import { ZhanZhengZhiYingPassivitySkill1, ZhanZhengZhiYingSkill1, ZhanZhengZhiYingSkill2, ZhanZhengZhiYingSkill3, ZhanZhengZhiYingXSkill1 } from "./hero/ZhanZhengZhiYing";
import { ZhenDePassivitySkill1, ZhenDeSkill2 } from "./hero/ZhenDe";
import { ZhouSiSkill3 } from "./hero/ZhouSi";
import { ZiZouRenXing2 } from "./hero/ZiZouRenXing";
import { CiYuanShouSkill2 } from "./pet/CiYuanShou";
import { JieFuSkill2 } from "./pet/JieFuSkill";
import { KaPiBaLaSkill2 } from "./pet/KaPiBaLaSkill";
import { SiKeMoSkill2 } from "./pet/SiKeMo";

/***
     * 技能创建工厂
     * liwenlong
     */
export class SkillFactory {

    static createFightSkillInfo(type: string): FightSkillInfo {
        switch (type) {
            // case "9201_s2"://BOSS法力恐魔
            //     return PoolManager.getItem(FaLiKongMoSkill2);
            case "206_s3"://BOSS机械异形
                return PoolManager.getItem(JiXieYiXingSkill3);
            case "208_s2"://BOSS妄念寄生兽
                return PoolManager.getItem(WangNianJiShengShouSkill2);
            case "211_s1"://BOSS法力恐魔召唤物优先选择BOSS距离500的目标
                return PoolManager.getItem(FaLiKongMoZhaoHuanWuSkill1);
            case "203_s3"://BOSS锤蝎
                return PoolManager.getItem(ChuiXieSkill3);
            case "202_s3"://BOSS刺蛇
                return PoolManager.getItem(CiSheSkill3);
            case "204_s4"://BOSS剧毒之刺
                return PoolManager.getItem(JuDuZhiCiSkill4);
            case "1120_s3"://赫娅
                return PoolManager.getItem(HeYaSkill3);
            case "102_s3"://赫娅怪物
                return PoolManager.getItem(HeYaMonsterSkill3);
            case "1240_s2"://萨麦尔
                return PoolManager.getItem(SamaierSkill2);
            case "1240_x1"://萨麦尔
                return PoolManager.getItem(SamaierXSkill1);
            case "104_s2"://萨麦尔怪物
                return PoolManager.getItem(SamaierMonsterSkill2);
            case "1320_s2"://玛尔斯
                return PoolManager.getItem(MaErSiSkill2);
            case "1320_s3"://玛尔斯
                return PoolManager.getItem(MaErSiSkill3);
            case "105_s2"://玛尔斯怪物
                return PoolManager.getItem(MaErSiMonsterSkill2);
            case "105_s3"://玛尔斯怪物
                return PoolManager.getItem(MaErSiMonsterSkill3);
            case "2220_s2"://杨戬
                return PoolManager.getItem(YangJianSkill2);
            case "2220_s3"://杨戬
                return PoolManager.getItem(YangJianSkill3);
            case "107_s2"://杨戬怪物
                return PoolManager.getItem(YangJianMonsterSkill2);
            case "107_s3"://杨戬怪物
                return PoolManager.getItem(YangJianMonsterSkill3);
            case "2222_s2"://托尔
                return PoolManager.getItem(TuoErSkill2);
            case "2222_s3"://托尔
                return PoolManager.getItem(TuoErSkill3);
            case "108_s2"://托尔怪物
                return PoolManager.getItem(TuoErMonsterSkill2);
            case "108_s3"://托尔怪物
                return PoolManager.getItem(TuoErMonsterSkill3);
            case "2230_s2"://恶灵
                return PoolManager.getItem(ELingSkill2);
            case "2230_s3"://恶灵
                return PoolManager.getItem(ELingSkill3);
            case "223001_p1"://恶灵召唤物
                return PoolManager.getItem(ELingZhaoHuanWuSkill1);
            case "109_s2"://恶灵怪物
                return PoolManager.getItem(ELingMonsterSkill2);
            case "109_s3"://恶灵怪物
                return PoolManager.getItem(ELingMonsterSkill3);
            case "3140_s3"://莉莉丝
                return PoolManager.getItem(LiLiSiSkill3);
            case "113_s3"://莉莉丝怪物
                return PoolManager.getItem(LiLiSiMonsterSkill3);
            case "3210_s1"://玛丽居里
                return PoolManager.getItem(MaLiJuLiSkill1);
            case "3210_s2"://玛丽居里
                return PoolManager.getItem(MaLiJuLiSkill2);
            case "3210_s3"://玛丽居里
                return PoolManager.getItem(MaLiJuLiSkill3);
            case "114_s1"://玛丽居里怪物
                return PoolManager.getItem(MaLiJuLiMonsterSkill1);
            case "114_s2"://玛丽居里怪物
                return PoolManager.getItem(MaLiJuLiMonsterSkill2);
            case "114_s3"://玛丽居里怪物
                return PoolManager.getItem(MaLiJuLiMonsterSkill3);
            case "4230_s1"://夜莺
                return PoolManager.getItem(YeYingSkill1);
            case "4230_s2"://夜莺
                return PoolManager.getItem(YeYingSkill2);
            case "4230_s3"://夜莺
                return PoolManager.getItem(YeYingSkill3);
            case "4230_p1"://夜莺
                return PoolManager.getItem(YeYingPassivitySkill1);
            case "123_s1"://夜莺怪物
                return PoolManager.getItem(YeYingMonsterSkill1);
            case "123_s2"://夜莺怪物
                return PoolManager.getItem(YeYingMonsterSkill2);
            case "123_s3"://夜莺怪物
                return PoolManager.getItem(YeYingMonsterSkill3);
            case "123_p1"://夜莺怪物
                return PoolManager.getItem(YeYingMonsterPassivitySkill1);
            case "4240_s2"://美杜莎
                return PoolManager.getItem(MeiDuShaSkill2);
            case "4240_s3"://美杜莎
                return PoolManager.getItem(MeiDuShaSkill3);
            case "124_s2"://美杜莎怪物
                return PoolManager.getItem(MeiDuShaMonsterSkill2);
            case "124_s3"://美杜莎怪物
                return PoolManager.getItem(MeiDuShaMonsterSkill3);
            case "4010_s3"://雷诺
                return PoolManager.getItem(LeiNuoSkill3);
            case "117_s3"://雷诺怪物
                return PoolManager.getItem(LeiNuoMonsterSkill3);
            case "4110_s2"://伽利略
                return PoolManager.getItem(JiaLiLveSkill2);
            case "4110_s3"://伽利略
                return PoolManager.getItem(JiaLiLveSkill3);
            case "119_s2"://伽利略怪物 
                return PoolManager.getItem(JiaLiLveMonsterSkill2);
            case "119_s3"://伽利略怪物
                return PoolManager.getItem(JiaLiLveMonsterSkill3);
            case "4130_s2"://自走人型
                return PoolManager.getItem(ZiZouRenXing2);
            case "121_s2"://自走人型怪物
                return PoolManager.getItem(ZiZouRenXingMonsterSkill2);
            case "2110_s2"://火蝠
                return PoolManager.getItem(HuoFuSkill2);
            case "106_s2"://火蝠怪物
                return PoolManager.getItem(HuoFuMonsterSkill2);
            case "2310_s2"://关羽
                return PoolManager.getItem(GuanYuSkill2);
            case "110_s2"://关羽怪物
                return PoolManager.getItem(GuanYuMonsterSkill2);
            case "3240_s2"://黑洞
                return PoolManager.getItem(HeiDongSkill2);
            case "3240_s3"://黑洞
                return PoolManager.getItem(HeiDongSkill3);
            case "115_s2"://黑洞怪物
                return PoolManager.getItem(HeiDongMonsterSkill2);
            case "115_s3"://黑洞怪物
                return PoolManager.getItem(HeiDongMonsterSkill3);
            case "3320_s3"://宙斯
                return PoolManager.getItem(ZhouSiSkill3);
            case "116_s3"://宙斯怪物
                return PoolManager.getItem(ZhouSiMonsterSkill3);
            case "3130_s3"://阔步者
                return PoolManager.getItem(KuoBuZheSkill3);
            case "4310_s3"://维拉
                return PoolManager.getItem(WeiLaSkill3);
            case "4310_p1"://维拉
                return PoolManager.getItem(WeiLaPassivitySkill1);
            case "125_s3"://维拉怪物
                return PoolManager.getItem(WeiLaMonsterSkill3);
            case "125_p1"://维拉怪物
                return PoolManager.getItem(WeiLaMonsterPassivitySkill1);
            case "4120_s3"://惩罚者
                return PoolManager.getItem(ChengFaZheSkill3);
            case "120_s3"://惩罚者怪物
                return PoolManager.getItem(ChengFaZheMonsterSkill3);
            case "4220_p1"://阿努比斯
                return PoolManager.getItem(ANuBiSiPassivitySkill1);
            case "122_p1"://阿努比斯怪物
                return PoolManager.getItem(ANuBiSiMonsterPassivitySkill1);
            case "4340_s2"://路西法
                return PoolManager.getItem(LuXiFaSkill2);
            case "4340_s3"://路西法
                return PoolManager.getItem(LuXiFaSkill3);
            case "126_s2"://路西法怪物
                return PoolManager.getItem(LuXiFaMonsterSkill2);
            case "126_s3"://路西法怪物
                return PoolManager.getItem(LuXiFaMonsterSkill3);
            case "5210_s2"://贞德
                return PoolManager.getItem(ZhenDeSkill2);
            case "5210_p1"://贞德
                return PoolManager.getItem(ZhenDePassivitySkill1);
            case "127_s2"://贞德怪物
                return PoolManager.getItem(ZhenDeMonsterSkill2);
            case "127_p1"://贞德怪物
                return PoolManager.getItem(ZhenDeMonsterPassivitySkill1);
            case "5330_s1"://战争之影
                return PoolManager.getItem(ZhanZhengZhiYingSkill1);
            case "5330_s2"://战争之影
                return PoolManager.getItem(ZhanZhengZhiYingSkill2);
            case "5330_s3"://战争之影
                return PoolManager.getItem(ZhanZhengZhiYingSkill3);
            case "5330_p1"://战争之影
                return PoolManager.getItem(ZhanZhengZhiYingPassivitySkill1);
            case "5330_x1"://战争之影
                return PoolManager.getItem(ZhanZhengZhiYingXSkill1);
            case "5330_x2"://战争之影
                return PoolManager.getItem(ZhanZhengZhiYingPassivitySkill1);
            case "131_s1"://战争之影怪物
                return PoolManager.getItem(ZhanZhengZhiYingMonsterSkill1);
            case "131_s2"://战争之影怪物
                return PoolManager.getItem(ZhanZhengZhiYingMonsterSkill2);
            case "131_s3"://战争之影怪物
                return PoolManager.getItem(ZhanZhengZhiYingMonsterSkill3);
            case "5220_s3": //海姆达尔
                return PoolManager.getItem(HaiMuDaErSkill3);
            case "5220_p1": //海姆达尔
                return PoolManager.getItem(HaiMuDaErPassivitySkill1);
            case "128_s3": //海姆达尔怪物
                return PoolManager.getItem(HaiMuDaErMonsterSkill3);
            case "128_p1": //海姆达尔怪物
                return PoolManager.getItem(HaiMuDaErMonsterPassivitySkill1);
            case "5240_s3"://跳跳射手
                return PoolManager.getItem(TiaoTiaoQiShouSkill3);
            case "130_s3"://跳跳射手怪物
                return PoolManager.getItem(TiaoTiaoQiShouMonsterSkill3);
            case "6220_s2"://丘比特
                return PoolManager.getItem(QiuBiTeSkill2);
            case "6220_s3"://丘比特
                return PoolManager.getItem(QiuBiTeSkill3);
            case "134_s2"://丘比特怪物
                return PoolManager.getItem(QiuBiTeMonsterSkill2);
            case "134_s3"://丘比特怪物
                return PoolManager.getItem(QiuBiTeMonsterSkill3);
            case "6330_s2"://深海歌姬
                return PoolManager.getItem(ShenHaiGeJiSkill2);
            case "6330_s3"://深海歌姬
                return PoolManager.getItem(ShenHaiGeJiSkill3);
            case "135_s2"://深海歌姬怪物
                return PoolManager.getItem(ShenHaiGeJiMonsterSkill2);
            case "135_s3"://深海歌姬怪物
                return PoolManager.getItem(ShenHaiGeJiMonsterSkill3);
            case "4311_s1"://星爵
                return PoolManager.getItem(XingJueSkill1);
            case "4311_s3"://星爵
                return PoolManager.getItem(XingJueSkill3);
            case "4311_p1"://星爵
                return PoolManager.getItem(XingJuePassivitySkill1);
            case "218_s1"://星爵怪物
                return PoolManager.getItem(XingJueMonsterSkill1);
            case "218_s3"://星爵怪物
                return PoolManager.getItem(XingJueMonsterSkill3);
            case "218_p1"://星爵怪物
                return PoolManager.getItem(XingJueMonsterPassivitySkill1);
            case "2340_s2"://卡魔拉
                return PoolManager.getItem(KaMoLaSkill2);
            case "215_s2"://卡魔拉怪物
                return PoolManager.getItem(KaMoLaMonsterSkill2);
            case "4330_s1"://钢铁侠
                return PoolManager.getItem(GangTieXiaSkill1);
            case "4330_s2"://钢铁侠
                return PoolManager.getItem(GangTieXiaSkill2);
            case "4330_s3"://钢铁侠
                return PoolManager.getItem(GangTieXiaSkill3);
            case "4330_p1": //钢铁侠
                return PoolManager.getItem(GangTieXiaPassivitySkill1);
            case "220_s1"://钢铁侠怪物
                return PoolManager.getItem(GangTieXiaMonsterSkill1);
            case "220_s2"://钢铁侠怪物
                return PoolManager.getItem(GangTieXiaMonsterSkill2);
            case "220_s3"://钢铁侠怪物
                return PoolManager.getItem(GangTieXiaMonsterSkill3);
            case "220_p1": //钢铁侠怪物
                return PoolManager.getItem(GangTieXiaMonsterPassivitySkill1);
            case "1340_p1": //毒液
                return PoolManager.getItem(DuYePassivitySkill1);
            case "213_p1": //毒液怪物
                return PoolManager.getItem(DuYeMonsterPassivitySkill1);
            case "6110_s2": //沃尔特
                return PoolManager.getItem(WoErTeSkill2);
            case "6110_s3": //沃尔特
                return PoolManager.getItem(WoErTeSkill3);
            case "222_s2": //沃尔特怪物
                return PoolManager.getItem(WoErTeMonsterSkill2);
            case "222_s3": //沃尔特怪物
                return PoolManager.getItem(WoErTeMonsterSkill3);
            case "3220_s2": //波塞冬
                return PoolManager.getItem(BoSaiDongSkill2);
            case "3220_s3": //波塞冬
                return PoolManager.getItem(BoSaiDongSkill3);
            case "322001_s1": //波塞冬召唤物
                return PoolManager.getItem(BoSaiDongZhuanHuanWuSkill1);
            case "216_s2": //波塞冬怪物
                return PoolManager.getItem(BoSaiDongMonsterSkill2);
            case "216_s3": //波塞冬怪物
                return PoolManager.getItem(BoSaiDongMonsterSkill3);
            case "5340_s2": //无头骑士
                return PoolManager.getItem(WuTouQiShiSkill2);
            case "5340_s3": //无头骑士
                return PoolManager.getItem(WuTouQiShiSkill3);
            case "5340_p1": //无头骑士
                return PoolManager.getItem(WuTouQiShiPassivitySkill1);
            case "221_s2": //无头骑士怪物
                return PoolManager.getItem(WuTouQiShiMonsterSkill2);
            case "221_s3": //无头骑士怪物
                return PoolManager.getItem(WuTouQiShiMonsterSkill3);
            case "221_p1": //无头骑士怪物
                return PoolManager.getItem(WuTouQiShiMonsterPassivitySkill1);
            case "4312_s2": //诺娃
                return PoolManager.getItem(NuoWaSkill2);
            case "4312_s3": //诺娃
                return PoolManager.getItem(NuoWaSkill3);
            case "219_s2": //诺娃怪物
                return PoolManager.getItem(NuoWaMonsterSkill2);
            case "219_s3": //诺娃怪物
                return PoolManager.getItem(NuoWaMonsterSkill3);
            case "431201_s2": //诺娃召唤物
                return PoolManager.getItem(NuoWaZhaoHuanWuSkill2);
            case "PET601_s2": //次元兽
                return PoolManager.getItem(CiYuanShouSkill2);
            case "1230_s1": //荒熊
                return PoolManager.getItem(HuangXiongSkill1);
            case "1230_s2": //荒熊
                return PoolManager.getItem(HuangXiongSkill2);
            case "1230_p1": //荒熊
                return PoolManager.getItem(HuangXiongPassivitySkill1);
            case "212_s1": //荒熊怪物
                return PoolManager.getItem(HuangXiongMonsterSkill1);
            case "212_s2": //荒熊怪物
                return PoolManager.getItem(HuangXiongMonsterSkill2);
            case "212_p1": //荒熊怪物
                return PoolManager.getItem(HuangXiongMonsterPassivitySkill1);
            case "2240_s2": //毁灭者
                return PoolManager.getItem(HuiMieZheSkill2);
            case "2240_s3": //毁灭者
                return PoolManager.getItem(HuiMieZheSkill3);
            case "2240_p1": //毁灭者
                return PoolManager.getItem(HuiMieZhePassivitySkill1);
            case "214_s2": //毁灭者怪物
                return PoolManager.getItem(HuiMieZheMonsterSkill2);
            case "214_s3": //毁灭者怪物
                return PoolManager.getItem(HuiMieZheMonsterSkill3);
            case "214_p1": //毁灭者怪物
                return PoolManager.getItem(HuiMieZheMonsterPassivitySkill1);
            case "3230_s2": //嗡酱
                return PoolManager.getItem(WengJiangSkill2);
            case "3230_s3": //嗡酱
                return PoolManager.getItem(WengJiangSkill3);
            case "3230_p1": //嗡酱
                return PoolManager.getItem(WengJiangPassivitySkill1);
            case "217_s2": //嗡酱怪物
                return PoolManager.getItem(WengJiangMonsterSkill2);
            case "217_s3": //嗡酱怪物
                return PoolManager.getItem(WengJiangMonsterSkill3);
            case "217_p1": //嗡酱怪物
                return PoolManager.getItem(WengJiangMonsterPassivitySkill1);
            case "2430_s1": //孙悟空
                return PoolManager.getItem(SunWuKongSkill1);
            case "2430_s3": //孙悟空
                return PoolManager.getItem(SunWuKongSkill3);
            case "2430_p1": //孙悟空
                return PoolManager.getItem(SunWuKongPassivitySkill1);
            case "5410_s2": //吕布
                return PoolManager.getItem(LvBuSkill2);
            case "5410_s3": //吕布
                return PoolManager.getItem(LvBuSkill3);
            case "5410_p1": //吕布
                return PoolManager.getItem(LvBuPassivitySkill1);
            case "2311_s2": //美国队长
                return PoolManager.getItem(MeiGuoDuiZhangSkill2);
            case "2311_s3": //美国队长
                return PoolManager.getItem(MeiGuoDuiZhangSkill3);
            case "2311_s31": //美国队长
                return PoolManager.getItem(MeiGuoDuiZhangSkill31);
            case "2311_x1": //美国队长
                return PoolManager.getItem(MeiGuoDuiZhangXSkill1);
            case "3321_s2": //洛基
                return PoolManager.getItem(LuoJiSkill2);
            case "3321_s3": //洛基
                return PoolManager.getItem(LuoJiSkill3);
            case "3321_p1": //洛基
                return PoolManager.getItem(LuoJiPassivitySkill1);
            case "3440_s2": //灭霸
                return PoolManager.getItem(MieBaSkill2);
            case "3440_s3": //灭霸
                return PoolManager.getItem(MieBaSkill3);
            case "3440_p1": //灭霸
                return PoolManager.getItem(MieBaPassivitySkill1);
            case "223_s2": //灭霸怪物
                return PoolManager.getItem(MieBaMonsterSkill2);
            case "223_s3": //灭霸怪物
                return PoolManager.getItem(MieBaMonsterSkill3);
            case "223_p1": //灭霸怪物
                return PoolManager.getItem(MieBaMonsterPassivitySkill1);
            case "PET602_s2": //宠物杰夫
                return PoolManager.getItem(JieFuSkill2);
            case "PET603_s2": //宠物斯科莫
                return PoolManager.getItem(SiKeMoSkill2);
            case "PET502_s2": //卡皮巴拉
                return PoolManager.getItem(KaPiBaLaSkill2);
            case "SCP_30001": //收藏品-无限手套
                return PoolManager.getItem(WuXianShouTaoSkill);
            case "SCP_20001": //收藏品-海拉之冠
                return PoolManager.getItem(HaiLaZhiGuanSkill);
            case "SCP_20002": //收藏品-阿斯加德之巅
                return PoolManager.getItem(ASiJiaDeZhiDianSkill);
            case "SCP_10001": //收藏品-奥丁之矛
                return PoolManager.getItem(AoDingZhiMaoSkill);
            default:
                return PoolManager.getItem(FightSkillInfo);
        }
    }

    static create(type: string): SkillData {
        let skillInfo = PoolManager.getItem(SkillData);
        skillInfo.fightSkillInfo = this.createFightSkillInfo(type)
        skillInfo.fightSkillInfo.skill = skillInfo;
        return skillInfo
    }
}