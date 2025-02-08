import { Vec2, v2 } from "cc";

export class MoveVec {
    /**临时计算变量 (不可持有，不可赋值)*/
    static tempVec: Vec2 = v2();

    public isDirty;
    /**是否在移动 */
    public isMoving;
    /**是否被摇杆控制 */
    public isCrtl;
    /**是否被强制移动 */
    public isForce;
    /**是否被强制移动，每帧不会被清除 */
    public isSustainForce;

    /**环境因素向量 */
    protected _envVec: Vec2 = v2();
    /*移动向量*/
    protected _moveVec: Vec2 = v2();
    /*控制向量*/
    protected _ctrlVec: Vec2 = v2();
    /*持续的向量*/
    protected _sustainVec: Vec2 = v2();

    /**获取角色总向量 */
    //public get3VecSumTemp() {
    //    return MoveVec.tempVec.set(this._envVec.x + this._moveVec.x + this._ctrlVec.x, this._envVec.y + this._moveVec.y + this._ctrlVec.y);
    //}

    /**获取角色向量 */
    public get2VecSumTemp() {
        return MoveVec.tempVec.set(this._envVec.x + this._moveVec.x, this._envVec.y + this._moveVec.y);
    }

    /**获取角色向量 */
    public getCrtlTemp() {
        return MoveVec.tempVec.set(this._envVec.x + this._moveVec.x, this._envVec.y + this._moveVec.y);
    }

    /**控制向量 */
    get ctrlVec() {
        return this._ctrlVec;
    }

    /**移动向量 */
    get moveVec() {
        return this._moveVec;
    }

    /**环境向量 */
    get envVec() {
        return this._envVec;
    }

    /**持续的向量 */
    get sustainVec() {
        return this._sustainVec;
    }

    /***是否存在环境变量的因素 */
    public hasEnvVec(): boolean {
        if (!this._envVec.x && !this._envVec.y)
            return false;
        return true;
    }

    /**
     * 方向
     * @returns 0 无方向 -1左 1右
     */
    getDirectionScale() {
        let x = this._ctrlVec.x
        if (!x) {
            x = this._moveVec.x
        }
        //return x == 0 ? 0 : x > 0 ? -1 : 1;
        return Math.abs(x) < 0.1 ? 0 : x > 0 ? -1 : 1;
    }

    setMoveVec(vec: Vec2) {
        this.isDirty = true;
        this.isMoving = true
        this._moveVec.set(vec);
    }

    setCtrlVec(vec: Vec2) {
        this.isDirty = true;
        this.isCrtl = true;
        this._ctrlVec.set(vec);
    }

    /**增加环境向量 */
    addEnvVec(vec: Vec2) {
        this.isDirty = true;
        this._envVec.add(vec);
    }

    /**被强制移动 */
    setForceMove(vec: Vec2) {
        this.isDirty = true;
        this.isForce = true;
        this._envVec.set(vec);
    }

    /**重置向量 （每帧需要清理）*/
    resetVec() {
        this.isDirty = false;
        this.isCrtl = false;
        this.isMoving = false;
        this.isForce = false;
        this._envVec.set(0, 0);
        this._moveVec.set(0, 0);
        this._ctrlVec.set(0, 0);
    }

    /**回池清理 */
    onRecovery() {
        this.resetVec();
    }
}