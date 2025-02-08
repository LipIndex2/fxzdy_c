export enum GuardShipFSMState {
    /**空闲状态*/
    Idle = 'Idle',
    /**波次状态*/
    Round = 'Round',
    /**创建怪物状态*/
    CreateMonster = 'CreateMonster',
    /**结束状态*/
    End = 'End'
}

export enum GuardShipFSMEvent {
    BacktoIdle = 'BacktoIdle',
    GotoRound = 'GotoRound',
    GotoCreateMonster = 'GotoCreateMonster',
    GotoEnd = 'GotoEnd'
}