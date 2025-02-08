export enum HttpEvent {
    NO_NETWORK = "http_request_no_network",                  // 断网
    UNKNOWN_ERROR = "http_request_unknown_error",            // 未知错误
    TIMEOUT = "http_request_timout"                          // 请求超时
}

export class HttpRequest {
    /** 当前请求地址集合 */
    private _urls = {};
    /**请求参数 */
    private _reqparams = {};

    /** 服务器地址 */
    private _local: string = "http://127.0.0.1/";
    /** 请求超时时间ms */
    timeout: number = 5000;
    /** socket链接协议 */
    //protocol: string = "ws";
    /**
     * HTTP GET请求
     * 例：
     * 
     * Get
        var complete = function(response){
            LogWrap.log(response);
        }
        var error = function(response){
            LogWrap.log(response);
        }
        this.get(name, complete, error);
    */
    get(name: string, completeCallback?: Function, errorCallback?: Function) {
        this.sendRequest(name, null, false, completeCallback, errorCallback)
    }
    getWithParams(name: string, params: any, completeCallback?: Function, errorCallback?: Function) {
        this.sendRequest(name, params, false, completeCallback, errorCallback)
    }

    getByArraybuffer(name: string, completeCallback?: Function, errorCallback?: Function) {
        this.sendRequest(name, null, false, completeCallback, errorCallback, 'arraybuffer', false);
    }
    getWithParamsByArraybuffer(name: string, params: any, completeCallback?: Function, errorCallback?: Function) {
        this.sendRequest(name, params, false, completeCallback, errorCallback, 'arraybuffer', false);
    }

    /** 
     * HTTP POST请求
     * 例：
     *      
     * Post
        var param = '{"LoginCode":"donggang_dev","Password":"e10adc3949ba59abbe56e057f20f883e"}'
        var complete = function(response){
                var jsonData = JSON.parse(response);
                var data = JSON.parse(jsonData.Data);
            LogWrap.log(data.Id);
        }
        var error = function(response){
            LogWrap.log(response);
        }
        this.post(name, param, complete, error);
    */
    post(name: string, params: any, completeCallback?: Function, errorCallback?: Function) {
        this.sendRequest(name, params, true, completeCallback, errorCallback);
    }

    /** 取消请求中的请求 */
    abort(name: string) {
        let url = this.formatUrl(name);
        var xhr = this._urls[url];
        if (xhr) {
            xhr.abort();
        }
    }

    /**
     * 获得字符串形式的参数
     */
    private getParamString(params: any) {
        var result = "";
        for (var name in params) {
            let data = params[name];
            if (data instanceof Object) {
                for (var key in data)
                    result += `${key}=${encodeURIComponent(data[key])}&`;
            }
            else {
                result += `${name}=${encodeURIComponent(data)}&`;
            }
        }

        return result.substring(0, result.length - 1);
    }

    /**格式化 */
    private formatUrl(url: string) {
        if (url.toLocaleLowerCase().indexOf("http") == 0) {
            return url;
        }
        else {
            return this._local + name;
        }
    }

    /** 
     * Http请求 
     * @param name(string)              请求地址
     * @param params(JSON)              请求参数
     * @param isPost(boolen)            是否为POST方式
     * @param callback(function)        请求成功回调
     * @param errorCallback(function)   请求失败回调
     * @param responseType(string)      响应类型
     */
    private sendRequest(name: string,
        params: any,
        isPost: boolean,
        completeCallback?: Function,
        errorCallback?: Function,
        responseType?: string,
        isOpenTimeout = true,
        timeout: number = this.timeout) {
        if (name == null || name == '') {
            //Logger.error("请求地址不能为空");
            return;
        }

        var getUrl: string, paramsStr: string;
        var url = this.formatUrl(name);

        if (params) {
            paramsStr = this.getParamString(params);
            if (url.indexOf("?") > -1)
                getUrl = url + "&" + paramsStr;
            else
                getUrl = url + "?" + paramsStr;
        }
        else {
            getUrl = url;
        }

        if (this._urls[url] != null) {
            //Logger.warn(`地址【${url}】已正在请求中，不能重复请求`);
            return;
        }

        var xhr = new XMLHttpRequest();

        // 防重复请求功能
        this._urls[url] = xhr;
        this._reqparams[url] = paramsStr!;

        if (isPost) {
            xhr.open("POST", url);
        }
        else {
            xhr.open("GET", getUrl);
            // console.log("getUrl: " + getUrl);
        }

        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
        // xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");

        var data: any = {};
        data.url = url;
        data.params = params;

        // 请求超时
        if (isOpenTimeout) {
            xhr.timeout = timeout;
            xhr.ontimeout = () => {
                this.deleteCache(url);

                data.event = HttpEvent.TIMEOUT;

                if (errorCallback) errorCallback(data);
            }
        }

        xhr.onloadend = (a) => {
            if (xhr.status == 500) {
                this.deleteCache(url);

                if (errorCallback == null) return;

                data.event = HttpEvent.NO_NETWORK;          // 断网

                if (errorCallback) errorCallback(data);
            }
        }

        xhr.onerror = () => {
            this.deleteCache(url);

            if (errorCallback == null) return;

            if (xhr.readyState == 0 || xhr.readyState == 1 || xhr.status == 0) {
                data.event = HttpEvent.NO_NETWORK;          // 断网 
            }
            else {
                data.event = HttpEvent.UNKNOWN_ERROR;       // 未知错误
            }

            console.error("xhr status  >>> " + xhr.status);

            if (errorCallback) errorCallback(data);
        };

        xhr.onload = () => {
            if (xhr.readyState != 4) return;

            this.deleteCache(url);

            if (xhr.status == 200) {
                if (completeCallback) {
                    if (responseType == 'arraybuffer') {
                        // 加载非文本格式
                        xhr.responseType = responseType;
                        if (completeCallback) completeCallback(xhr.response);
                    }
                    else {
                        // 加载非文本格式
                        var data: any = JSON.parse(xhr.response);

                        if (data) {
                            if (completeCallback) completeCallback(data);
                        } else {
                            if (errorCallback) errorCallback(data);
                        }
                    }
                }
            } else {
                console.error("xhr status  >>> " + xhr.status);
                if (errorCallback) errorCallback(null);
            }
        };


        if (isPost && paramsStr) {
            xhr.send(paramsStr);
        } else {
            xhr.send();
        }
    }

    private deleteCache(url: string) {
        delete this._urls[url];
        delete this._reqparams[url];
    }

    public isRequestingByUrl(url: string) {
        return !!this._urls[url];
    }
}