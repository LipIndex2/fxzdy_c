import { assetManager, AudioClip, AudioSource, director, Node } from "cc";
import BaseSingleton from "../../../core/base/BaseSingleton";
import { GameTimer } from "../../../core/timer/GameTimer";
import G from "../../../core/comm/G";
import NotificationKey from "../../event/NotificationKey";
import { INotification } from "../../../core/mvc/interface/INotification";
import { UIHeroKey } from "../../modules/hero/const/UIHeroConfig";
import { UIMainKey } from "../../ui/main/const/UIMainConfig";
import { DrawCardUIKeys } from "../../modules/drawcard/DrawCardUIKeys";
import { HangUpUIKeys } from "../../modules/hangup/HangUpUIKeys";
import { UIGameModeKeys } from "../../modules/gameMode/UIGameModeKeys";
import { UIGainKeys } from "../../modules/gain/const/UIGainKeys";
import { UICommonKey } from "../../modules/common/const/UICommonConfig";
import { UISecretAreaKey } from "../../modules/secretArea/const/UISecretAreaConfig";
import { SystemSettingManager } from "db://assets/scripts/core/settings/SystemSettingManager";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { AssetManager } from "cc";
import { AssetBundleKeys } from "../../../core/res/AssetBundleKeys";

export enum SoundType {
    //返回键的点击音效
    winBack = "02_back",
    //常规点击 没有设置特殊点击音效的情况下，都用该音效作为点击音
    click = "01_click",
    //打开侧边功能类时的音效
    cl_open = "08_cl_open",
    //关闭侧边功能类时的音效
    cl_close = "09_cl_close",
    //点击主界面下栏按钮进行切换页面时的音效
    _xl_click = "10_xl_click",
    //角色升级和升星时的音效
    shengjishengxing = "14_shengjishengxing",
    //提升战力时的音效
    zhanlitisheng = "15_zhanlitisheng",
    //删除邮件的音效
    delete = "16_delete",
    //点击已上阵角色让角色下阵时的音效
    xiazhen = "17_xiazhen",
    //领取任务奖励时的音效
    reward = "20_reward",
    //战斗失败时的音效
    battle_fail = "19_battle_fail",
    //交互键出现时的音效
    jiaohu = "05_jiaohu",
    //通过传送门或传送飞船进行传送的传送离开音效
    leave = "03_leave",
    //通过传送门或传送飞船进行传送的传送到达音效
    arrive = "04_arrive",
    //战斗开始的音效
    battle_start = "22_battle_start",
    //采集气泉的音效
    extract = "23_extract",
    //开采晶矿的音效
    dig = "24_dig",
    //加载过场动画的音效
    loading = "25_loading",
    //靠近已解锁建筑时的音效
    build2 = "12_build2",
    //远离已激解锁建筑时的音效
    build3 = "13_build3",
    //解锁建筑时的音效
    build1 = "11_build1",
    //新获得一个英雄
    newhero = "26_newhero",
    //角色翻页音效
    change = "27_change",
}

export class AudioManager extends BaseSingleton implements INotification {

    private audioBgmUrl: string = "audio/music/"
    private audioSoundUrl: string = "audio/sound/"

    private audioNode: Node;
    // jinchan 说默认开
    private _musicVolume: number = 1;
    private _soundVolume: number = 1;
    /***背景音乐 */
    private musicChannel: AudioSource;
    /***音效 */
    private soundChannel: AudioSource;
    /***对白 */
    private dialogChannel: AudioSource;
    private viewOpenSoundMap: { [name: string]: string } = {};
    private viewCloseSoundMap: { [name: string]: string } = {};

    /***其他音轨缓存 */
    private otherMusicChannelCacheArr: AudioSource[] = []
    /***当前的音轨列表 */
    private otherMusicChannelArr: AudioSource[] = []
    private otherUid: number = 0;

    private _needPlayBgmUrl: string;
    private _needPlayBgmVolume: number;

    private _bundleName: string = AssetBundleKeys.AUDIO;
    private _bundle: AssetManager.Bundle;

    private timerData: Date = new Date();

    listenNotifications(): string[] | null {
        return [
            NotificationKey.OPEN_ViEW,
            NotificationKey.CLOSE_ViEW,
            NotificationKey.SYSTEM_AUDIO_MUSIC_CHANGE_OPEN,
            NotificationKey.SYSTEM_AUDIO_EFFECT_CHANGE_OPEN,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.OPEN_ViEW: {
                const content = args as string;
                this.onOpenView(content);
                break;
            }
            case NotificationKey.CLOSE_ViEW:
                const content = args as string;
                this.onCloseView(content);
                break
            case NotificationKey.SYSTEM_AUDIO_MUSIC_CHANGE_OPEN:
                this.resetMusicVolume(args);
                break
            case NotificationKey.SYSTEM_AUDIO_EFFECT_CHANGE_OPEN:
                this.resetAudioEffectVolume(args);
                break
        }
    }

    constructor () {
        super();
    }

    /**加载bundle */
    loadAudioBundle(callback?: Function) {
        assetManager.loadBundle(this._bundleName, (err, bundle) => {
            if (err) {
                console.log(this._bundleName + " load failed ");
                return;
            }
            this._bundle = bundle;
            callback && callback();
        })
    }

    // 重置音效大小
    resetMusicVolume(isOpen: boolean) {
        let oldState = this.isMuiscEnable;
        this.musicVolume = isOpen ? 1 : 0;

        if (oldState != this.isMuiscEnable) {
            if (this.isMuiscEnable) {
                if (this._needPlayBgmUrl) {
                    //有要播放的bgm
                    this.playMusic(this._needPlayBgmUrl, this._needPlayBgmVolume);
                    this._needPlayBgmUrl = null;
                } else if (this.musicChannel?.clip) {
                    this.musicChannel.play();
                }
            } else {
                if (this.musicChannel) {
                    this.musicChannel.pause();
                }
            }
        }
    }

    // 重置音效大小
    resetAudioEffectVolume(isOpen: boolean) {
        this.soundVolume = isOpen ? 1 : 0;
    }

    public get isMuiscEnable(): boolean {
        return this._musicVolume > 0.05;
    }

    public get isSoundEnable(): boolean {
        return this._soundVolume > 0.05;
    }

    // 初始化时
    protected onInit(): void {
        this.init();
    };

    public init(): void {
        const isOpenMusic = SystemSettingManager.ins().isOpenMusic();
        this.musicVolume = isOpenMusic ? 1 : 0;
        const isOpenEffect = SystemSettingManager.ins().isOpenAudioEffect();
        this.soundVolume = isOpenEffect ? 1 : 0;

        //@zh 创建一个节点作为 audioMgr
        this.audioNode = new Node();
        //@zh 添加节点到场景
        director.getScene().addChild(this.audioNode);
        //@zh 标记为常驻节点，这样场景切换的时候就不会被销毁了
        director.addPersistRootNode(this.audioNode);

        this.musicChannel = this.audioNode.addComponent(AudioSource)
        this.soundChannel = this.audioNode.addComponent(AudioSource)
        this.dialogChannel = this.audioNode.addComponent(AudioSource)

        this.regViewSound();

        G.FacadeManager.registerNotification(this);
    }

    /***初始化界面打开和关闭的音乐 */
    private regViewSound(): void {
        //--------打开
        this.viewOpenSoundMap[UIMainKey.MAIN_MORE_VIEW] = SoundType.cl_open;
        // this.viewOpenSoundMap[UIBattleKeys.BattleStartView.key] = SoundType.battle_start;
        this.viewOpenSoundMap[DrawCardUIKeys.DrawCardNormalView] = SoundType._xl_click;
        this.viewOpenSoundMap[UIGameModeKeys.GameModeMainView] = SoundType._xl_click;
        this.viewOpenSoundMap[UIHeroKey.HERO_MAIN_VIEW] = SoundType._xl_click;
        this.viewOpenSoundMap[UIGainKeys.GainItemPopUpView] = SoundType.reward;
        this.viewOpenSoundMap[DrawCardUIKeys.DrawCardResultView] = SoundType.reward;
        this.viewOpenSoundMap[HangUpUIKeys.HangUpBattleResultFailV2View] = SoundType.battle_fail;
        this.viewOpenSoundMap[UICommonKey.BattleResultWin] = SoundType.battle_fail;
        this.viewOpenSoundMap[UISecretAreaKey.SecretAreaBattleResultWin] = SoundType.battle_fail;
        this.viewOpenSoundMap[DrawCardUIKeys.DrawCardFirstGetItemView] = SoundType.newhero;


        //--------关闭
        this.viewCloseSoundMap[HangUpUIKeys.HangUpMainView] = SoundType.winBack;
        this.viewCloseSoundMap[UIHeroKey.HERO_MAIN_VIEW] = SoundType.winBack;
        this.viewCloseSoundMap[UIMainKey.MAIN_MORE_VIEW] = SoundType.cl_close;
    }


    /***播放对白 */
    public playDialog(url: string, volume: number = 1.0): void {
        if (!this.isSoundEnable) {
            return;
        }

        this.dialogChannel.stop();
        if (!url)
            return
        this._bundle.load(this.audioSoundUrl + "dialog/" + url, (err, clip: AudioClip) => {
            if (err) {
                console.log(err);
            } else {
                this.onDialogSound(clip, volume)
            }
        });
    }

    public stopDialog(): void {
        this.dialogChannel.stop();
    }

    private onDialogSound(sound: AudioClip, volume: number = 1): void {
        this.dialogChannel.stop();
        this.dialogChannel.clip = sound;
        this.dialogChannel.loop = false;
        this.dialogChannel.play();
        this.dialogChannel.volume = this._soundVolume * volume;
    }

    private skillSoundMap: { [url: string]: AudioSource[] } = {};
    private skillSoundCacheArr: AudioSource[] = []

    /***播放技能音效 */
    public playSkillSound(url: string, volume: number = 1.0): void {
        if (!this.isSoundEnable) {
            return;
        }
        if (!url)
            return

        if (this.soundUrlTime[url] && (GameTimer.ins().currFrame - this.soundUrlTime[url] < 5)) {
            return
        }
        this.soundUrlTime[url] = GameTimer.ins().currFrame;

        this._bundle?.load(this.audioSoundUrl + url, (err, clip: AudioClip) => {
            if (err) {
                console.log(err);
            } else {
                this.onPlaySkillSound(url, clip, volume)
            }
        });
    }

    private onPlaySkillSound(url: string, sound: AudioClip, volume: number = 1): void {
        if (!this.skillSoundMap[url])
            this.skillSoundMap[url] = []
        let soundTemp = this.skillSoundCacheArr.shift()
        if (!soundTemp) {
            soundTemp = this.audioNode.addComponent(AudioSource)
            soundTemp.node.on(AudioSource.EventType.ENDED, this.onSkillSoundEnded, this);
        }
        this.skillSoundMap[url].push(soundTemp);
        soundTemp["__URL__"] = url;
        soundTemp.loop = false;
        soundTemp.clip = sound;
        soundTemp.play()
        soundTemp.volume = this._soundVolume * volume;
    }

    private onSkillSoundEnded(sound: AudioSource): void {
        this.stopSkillSound(sound["__URL__"])
    }

    public stopSkillSound(url: string): void {
        if (this.skillSoundMap[url]?.length > 0) {
            let sound = this.skillSoundMap[url].shift()
            sound.stop()
            this.skillSoundCacheArr.push(sound)
        }
    }

    /***相同时间内音效忽略 */
    private soundUrlTime: { [url: string]: number } = {}
    /***播放音效 */
    public playSound(url: string, volume: number = 1.0): void {
        if (!url || !this._soundVolume)
            return
        if (url == SoundType.click && !this.isClickSound) {
            return
        }

        if (this.soundUrlTime[url] && (GameTimer.ins().currFrame - this.soundUrlTime[url] < 5)) {
            return
        }
        this.soundUrlTime[url] = GameTimer.ins().currFrame;

        this.isClickSound = false;

        this._bundle?.load(this.audioSoundUrl + url, (err, clip: AudioClip) => {
            if (err) {
                console.log(err);
            } else {
                this.onPlaySound(clip, volume)
            }
        });
    }

    private isClickSound: boolean = false

    /***播放音效 */
    public playSoundDelay(delayTime: number, url: string, volume: number = 1.0): void {
        if (!this.isSoundEnable) {
            return;
        }
        this.isClickSound = true;
        GameTimer.ins().once(delayTime, this, this.playSound, [url, volume])
    }

    private onPlaySound(sound: AudioClip, volume: number = 1): void {
        if (this.soundChannel)
            this.soundChannel.playOneShot(sound, volume * this._soundVolume)
    }

    private nowLoadMuiscUrl: string
    /**
     * @zh
     * 播放长音频，比如 背景音乐
     * @param url clip or url for the sound
     * @param volume
     */
    public playMusic(url: string, volume: number = 1.0) {
        if (!this.isMuiscEnable) {
            this._needPlayBgmUrl = url;
            this._needPlayBgmVolume = volume;
            return;
        }

        if (!url) {
            return;
        }
        if (this.nowLoadMuiscUrl == url)
            return;

        if (!this._bundle) {
            this.loadAudioBundle(() => {
                this.playMusic(url, volume); //加载完成播放；
            })
            return;
        }

        this.nowLoadMuiscUrl = url;
        this._bundle?.load(this.audioBgmUrl + url, (err, clip: AudioClip) => {
            if (err) {
                this.nowLoadMuiscUrl = null;
            } else {
                this.onPlayMusic(clip, volume)
            }
        });
    }

    private onPlayMusic(sound: AudioClip, volume: number = 1): void {
        if (this.nowLoadMuiscUrl != sound.name) {
            return
        }
        this.musicChannel.stop();
        this.musicChannel.clip = sound;
        this.musicChannel.loop = true;
        this.musicChannel.play();
        this.musicChannel.volume = this._musicVolume * volume;
    }

    /***
     * 播放另外1个音轨的背景音乐
     * sameStop 相同路径暂停前面的
     *  */
    public playOtherMusic(url: string,
        sameStop: boolean = false,
        isLoop: boolean = true,
        volume: number = 1.0
    ): number {
        if (!this.isMuiscEnable) {
            return;
        }

        let otherMusicChannel = this.otherMusicChannelCacheArr.shift();
        if (!otherMusicChannel) {
            otherMusicChannel = this.audioNode.addComponent(AudioSource)
            this.otherUid++;
            otherMusicChannel["otherUid"] = this.otherUid;
        }
        this.otherMusicChannelArr.push(otherMusicChannel)

        this._bundle?.load(this.audioSoundUrl + url, (err, clip: AudioClip) => {
            if (err) {
                console.log(err);
            } else {
                this.onPlayOtherMusic(otherMusicChannel, clip, isLoop, volume)
            }
        });

        return otherMusicChannel["otherUid"]
    }

    private onPlayOtherMusic(otherMusicChannel: AudioSource,
        sound: AudioClip,
        isLoop: boolean = true,
        volume: number = 1
    ): void {
        otherMusicChannel.stop();
        otherMusicChannel.clip = sound;
        otherMusicChannel.loop = isLoop;
        otherMusicChannel.play();
        otherMusicChannel.volume = this._soundVolume * volume;
    }

    public stopOtherMusic(uid: number): void {
        for (let i = 0; i < this.otherMusicChannelArr.length; i++) {
            if (this.otherMusicChannelArr[i]["otherUid"] == uid) {
                this.otherMusicChannelArr[i].stop()
                this.otherMusicChannelCacheArr.push(this.otherMusicChannelArr[i])
                this.otherMusicChannelArr.splice(i, 1)
                break
            }
        }
    }

    public get musicVolume(): number {
        return this._musicVolume;
    }

    /***设置声音大小1~0 */
    public set musicVolume(value: number) {
        this._musicVolume = value;
        if (this.musicChannel)
            this.musicChannel.volume = value;
    }

    public get soundVolume(): number {
        return this._soundVolume;
    }

    /***设置声音大小1~0 */
    public set soundVolume(value: number) {
        this._soundVolume = value;
        for (let i = 0; i < this.otherMusicChannelArr.length; i++) {
            this.otherMusicChannelArr[i].volume = value
        }
        if (this.soundChannel)
            this.soundChannel.volume = value
    }

    /***界面关闭时播放的音效 */
    private onCloseView(key: string): void {
        if (this.viewCloseSoundMap[key])
            this.playSound(this.viewCloseSoundMap[key])
    }

    /***界面打开时播放的音效 */
    private onOpenView(key: string): void {
        const audioPath = this.viewOpenSoundMap[key];
        if (audioPath) {
            Logger.debug(`[Audio] UI open play music = ${audioPath}`);
            this.playSound(audioPath);
        }
    }

    /**
     * stop the audio play
     */
    stopBgm() {
        this.musicChannel.stop();
    }

    /**
     * pause the audio play
     */
    pause() {
        // this._audioSource.pause();
    }

    /**
     * resume the audio play
     */
    resume() {
        // this._audioSource.play();
    }

    protected onDestroy(): void {
        G.FacadeManager.removeNotification(this);
        if (this._bundle) {
            this._bundle.releaseAll();
            assetManager.removeBundle(this._bundle);
            this._bundle = null;
        }
    }
}