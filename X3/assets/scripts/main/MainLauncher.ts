import { _decorator, Node, profiler, Sprite, sys } from 'cc';
import { BaseLauncher } from '../core/base/BaseLauncher';

import { BootProcedure } from './procedure/BootProcedure';

const {ccclass, property} = _decorator;

@ccclass('MainLauncher')
export class MainLauncher extends BaseLauncher {

    @property({type: Node})
    public worldRoot: Node | null = null;

    @property({type: Sprite})
    public touchNode: Sprite | null = null;

    protected init(): void {
        // here init Manager 
        super.init();

    }

    protected run() {
        profiler.hideStats()
        
        sys.dump();
        //profiler.hideStats()
        BootProcedure.start();
    }

    protected update(dt: number) {
        super.update(dt);
        // 时间
    }

    // endregion 
}


