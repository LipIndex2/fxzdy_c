import G from "db://assets/scripts/core/comm/G";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { EnumEmailState } from "db://assets/scripts/game/modules/email/enums/EnumEmailState";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { KvTemplate } from "../../../../core/utils/KvTemplate";
import { TeamChallengeConfigManager } from "../../teamChallenge/config/TeamChallengeConfigManager";
import { SeasonConfigManager } from "../../season/SeasonConfigManager";
import { TeamChallengeModel } from "../../teamChallenge/model/TeamChallengeModel";

/**
 * 邮箱中的单个邮件
 */
export class EmailVo {
    /**
     * 发送人昵称,没有则为NULL
     */
    senderName: string = "";

    /**
     * 邮件发送时间
     */
    sendAtTimeMs: number = 0;

    /**
     * 模板ID 小于0表示无模板
     */
    templateId: number = 0;

    /**
     * 邮件唯一ID
     */
    emailId: number = 0;

    /**
     * 是否已读
     */
    readFlag: boolean = false;

    /**
     * 是否已领取奖励
     */
    gainFlag: boolean = false;

    /**
     * 邮件标题 null时读配置
     */
    title: string = "";

    /**
     * 邮件内容 null时读配置
     */
    content: string = "";

    /**
     * 模板参数列表JSON
     */
    paramKvMap: Map<string, string> = new Map<string, string>();

    /**
     * 字符串格式的奖励
     */
    rewardArray: Array<NoOwnerItem> = [];

    /**
     * 过期时间点 ms
     */
    expireTimeAtTimeMs: number = 0;


    static from(it: Vo.email.SystemEmailVo) {
        const emailVo = new EmailVo();
        emailVo.senderName = it.senderName;
        emailVo.sendAtTimeMs = it.sendTime;
        emailVo.expireTimeAtTimeMs = it.expireTime;
        emailVo.emailId = it.emailId;
        emailVo.readFlag = it.read;
        emailVo.gainFlag = it.drew;
        emailVo.title = it.emailTitle;
        emailVo.content = it.emailContent;
        // 模板
        emailVo.templateId = it.template;

        emailVo.rewardArray = ItemUtils.parseStringToNoOwnerItemArray(it.rewards);
        emailVo.expireTimeAtTimeMs = it.expireTime;

        // lazy init 模板内容
        if (emailVo.isHaveTemplate()) {
            let templateVo: Vo.common.TermVo = null
            if (it.paramsContent) {
                try {
                    templateVo = JSON.parse(it.paramsContent) as Vo.common.TermVo
                } catch (e) {
                    G.Logger.error(`后端发来的邮件模板参数解析失败! template content = ${it.paramsContent}`, it);
                }
            }
            emailVo.parseTemplateParams(templateVo)
        }

        return emailVo;
    }

    protected setTemplateValueToMap(key: string, map: Map<string, string>, vo: Vo.common.TermVo): void {
        let param: string = key.replace('${', '').replace('}', '');
        let value: string = '';
        if (vo && vo[param]) {
            switch (param) {
                case 'itemId':
                    let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, vo.itemId);
                    value = itemCfg ? G.I18nManager.lang(itemCfg.name) : '';
                    break;
                case 'activityId':
                    let activityCfg = G.TableManager.getDataById(table.activity.ActivityConstant.ActivityConfig, vo.activityId);
                    value = activityCfg ? activityCfg.name : '';
                    break;
                case 'arenaRankConfigId':
                    let arenaRankCfg = G.TableManager.getDataById(table.arena.ArenaRankConfig, vo.arenaRankConfigId);
                    value = arenaRankCfg ? G.I18nManager.lang(arenaRankCfg.name) : '';
                    break;
                case 'fundId':
                    let fundCfg = G.TableManager.getDataById(table.activity.Fund.FundConfig, vo.fundId);
                    value = fundCfg ? fundCfg.passName : '';
                    break;
                case 'setShowId':
                    let setShowCfg = G.TableManager.getDataById(table.set.SetShowConfig, vo.setShowId);
                    value = setShowCfg ? G.I18nManager.lang(setShowCfg.name) : '';
                    break;
                case 'teamInstanceConfigId':
                    let tid = vo?.teamInstanceConfigId;
                    if(tid){
                        const info = TeamChallengeModel.ins().getFloorInfo(tid);
                        const cCfg = TeamChallengeConfigManager.getChapterCfg(tid)
                        value = cCfg.chapterName+`第${info?.cur}关`;
                    }
                    break;
                case 'subSeasonActivityId':
                    const  cfg = SeasonConfigManager.getSubConfigById(vo?.subSeasonActivityId);
                    value = cfg?.name ? cfg?.name:'';
                    break;
                default:
                    value = vo[param];
                    break;
            }
        }
        map.set(param, value);
    }

    /**解析模版有检查参数*/
    protected parseTemplateParams(vo: Vo.common.TermVo): void {
        // 使用正则表达式匹配出所有的 ${xxx} 模板变量
        const regex = /\$\{(.*?)\}/g;
        this.paramKvMap.clear();
        const templateCfg = G.TableManager.getDataById(table.email.EmailTemplateConfig, this.templateId);
        if (templateCfg == null) {
            return;
        }
        let arr: RegExpMatchArray = null;
        //解析标题
        if (templateCfg.title) {
            arr = templateCfg.title.match(regex);
            arr?.forEach((key) => {
                this.setTemplateValueToMap(key, this.paramKvMap, vo);
            })
        }

        //解析内容
        if (templateCfg.content) {
            arr = templateCfg.content.match(regex);
            arr?.forEach((key) => {
                this.setTemplateValueToMap(key, this.paramKvMap, vo);
            })
        }

        this.title = templateCfg.title;
        this.content = templateCfg.content;
        this.title = KvTemplate.create(this.title, this.paramKvMap).render();
        this.content = KvTemplate.create(this.content, this.paramKvMap).render();
    }

    /**
     * 是否有模板
     */
    isHaveTemplate(): boolean {
        return this.templateId > 0;
    }

    // 是否有奖励
    isWithReward(): boolean {
        return this.rewardArray && this.rewardArray.length > 0;
    }


    // 是否已读/已领取
    isHaveReadOrGain(): boolean {
        if (this.isWithReward()) {
            return this.readFlag && this.gainFlag
        }
        return this.readFlag
    }

    /**
     * 是否可读 / 可获取
     */
    isCanReadOrGain(): boolean {
        if (this.isWithReward()) {
            return !this.readFlag || !this.gainFlag
        }
        return !this.readFlag;
    }

    isExpire() {
        return this.expireTimeAtTimeMs < G.TimeManager.serverNow;
    }

    /**
     * 邮件状态
     */
    getEmailState(): EnumEmailState {
        if (this.readFlag) {
            if (this.gainFlag) {
                return EnumEmailState.READ_HAVE_GAIN;
            }

            // 没奖励
            if (ArrayUtils.isEmpty(this.rewardArray)) {
                return EnumEmailState.READ_HAVE_GAIN;
            }

            return EnumEmailState.READ_NO_GAIN;
        }
        return EnumEmailState.UNREAD;

    }
}