import { SpriteAtlas } from "cc";
import BaseSingleton from "../base/BaseSingleton";
import { js } from "cc";

export default class FrameAnimNamesManager extends BaseSingleton {
    /**正则获得动作名 gw—idle_01 */
    private _reg = /([a-zA-Z0-9]+)_([0-9]+)$/;

    private _map: { [atlasKey: string]: { [animName: string]: string[] } } = js.createMap();

    getAnimMap(atlas: SpriteAtlas) {
        let atlasKey = atlas.uuid;
        if (this._map[atlasKey]) {
            return this._map[atlasKey];
        }

        let animNames = this._map[atlasKey] = js.createMap();
        let frames = atlas.spriteFrames;

        Object.keys(frames).forEach((key) => {
            /**正则取出动作名 */
            let match = key.match(this._reg);
            if (match) {
                let animName = match[1].split("_")[0];
                if (!animNames[animName]) {
                    animNames[animName] = [];
                }
                animNames[animName].push(key);
            }
        });

        return animNames;
    }


}