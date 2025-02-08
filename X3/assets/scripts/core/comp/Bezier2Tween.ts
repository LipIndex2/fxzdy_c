import { tween } from "cc";
import { Vec2 } from "cc";
import { Handler } from "../utils/Handler";
import { Tween } from "cc";

/**
     * 2阶贝塞尔曲线缓动
     * liwenlong
     */
export class Bezier2Tween {

    public target: Vec2;
    private p0x: number;
    private p1x: number;
    private p2x: number;

    private p0y: number;
    private p1y: number;
    private p2y: number;

    public tweenX: number
    public tweenY: number

    public tweenCallback: Handler;
    public tweenComplete: Handler;

    private tweenObj: Tween<Node>

    public get factor(): number {
        return 0;
    }

    public set factor(value: number) {
        this.tweenX = (1 - value) * (1 - value) * this.p1x + 2 * value * (1 - value) * this.p0x + value * value * this.p2x;
        this.tweenY = (1 - value) * (1 - value) * this.p1y + 2 * value * (1 - value) * this.p0y + value * value * this.p2y;
        this.tweenCallback.runWith([this.tweenX, this.tweenY])
    }

    /**
     * @param time 秒
     * @param tweenCallback 
     * @param tweenComplete 
     */
    public tween(time: number, tweenCallback: Handler, tweenComplete?: Handler): void {
        this.tweenCallback = tweenCallback;
        this.tweenComplete = tweenComplete;
        this.stop();
        this.tweenObj = tween().target(this).to(time, { factor: 1 }).call(() => {
            if (this.tweenComplete)
                this.tweenComplete.run();
        }).start();
    }

    public setPoint(p1x: number, p1y: number, p0x: number, p0y: number, p2x: number, p2y: number): void {
        this.p1x = p1x;
        this.p1y = p1y;
        this.p0x = p0x;
        this.p0y = p0y;
        this.p2x = p2x;
        this.p2y = p2y;
    }

    public getPosByFactor(value: number): { x: number, y: number } {
        var xy: { x: number, y: number } = {
            x: (1 - value) * (1 - value) * this.p1x + 2 * value * (1 - value) * this.p0x + value * value * this.p2x,
            y: (1 - value) * (1 - value) * this.p1y + 2 * value * (1 - value) * this.p0y + value * value * this.p2y
        }
        return xy
    }

    public stop(): void {
        if (this.tweenObj)
            this.tweenObj.stop();
    }
}