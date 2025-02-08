export enum GameTaskProgressTag {
    LoadServerDescriptionTask = "LoadServerDescriptionTask",
    AyncTableProcedureCheckTask = "AyncTableProcedureCheckTask",
    AyncScriptsProcedureCheckTask = "AyncScriptsProcedureCheckTask",
    LoadResTask = "LoadResTask",
    AccountLoginTask = "AccountLoginTask",
    InitPlayerInfoTask = "InitPlayerInfoTask",
    EnterTask = "EnterTask",
}

/**临时放这里 后面多语言需要另外处理 */
export enum GameTaskProgressText {
    LoadServerDescriptionTask = "获取服务器数据",
    AyncTableProcedureCheckTask = "加载配置数据",
    AyncScriptsProcedureCheckTask = "加载脚本数据",
    LoadResTask = "加载资源",
    AccountLoginTask = "登录游戏",
    InitPlayerInfoTask = "获取角色数据",
    EnterTask = "构建世界",
}

/**游戏任务进度权重 */
export enum GameTaskProgress {
    LoadServerDescriptionTask = 10,
    AyncTableProcedureCheckTask = 30,
    AyncScriptsProcedureCheckTask = 50,
    LoadResTask = 60,
    AccountLoginTask = 65,
    InitPlayerInfoTask = 75,
    EnterTask = 98,
    END = 100,
}

/**进度预计耗时 ms*/
export enum GameTaskProgressTime {
    LoadServerDescriptionTask = 500,
    AyncTableProcedureCheckTask = 2000,
    AyncScriptsProcedureCheckTask = 5000,
    LoadResTask = 2000,
    AccountLoginTask = 200,
    InitPlayerInfoTask = 500,
    EnterTask = 3000,
    END = 100,
}

// tasks.push(new LoadServerDescriptionTask());
// tasks.push(new AyncTableProcedureCheckTask());
// tasks.push(new LoadResTask());
// tasks.push(new AccountLoginTask());
// tasks.push(new InitPlayerInfoTask());
// tasks.push(new EnterTask());


