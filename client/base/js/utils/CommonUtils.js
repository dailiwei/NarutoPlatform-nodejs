///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Richway. All Rights Reserved.
// create by dailiwei 2015-05-19 00:27
///////////////////////////////////////////////////////////////////////////

define(['dojo/_base/lang',
        'dojo/_base/array',
        'dojo/_base/html',
        'dojo/_base/sniff',
        'dojo/_base/config',
        'dojo/io-query',
        'dojo/query',
        'dojo/NodeList-traverse',
        'dojo/Deferred',
        'dojo/on',
        'dojo/json',
        'dojo/cookie',
        'dojo/request/xhr',
        'dojo/i18n',
        'dojo/number',
        'dojo/date/locale',
        "dojo/errors/RequestError",
        "dojo/topic",
        "dojo/promise/all"
    ],

    function (lang, array, html, has, config, ioQuery, query, nlt, Deferred, on, json, cookie,
              xhr, i18n, dojoNumber, dateLocale, RequestError, topic, all) {
        /* global esriConfig, dojoConfig, ActiveXObject */
        /**
         * 继承dojo.lang
         * */
        var utils = function () {
        };
        lang.extend(utils, lang);
        var commonUtils = new utils();
        /**
         * 生成UUID
         */
        commonUtils.UUID = function (prefix) {
            prefix = prefix || "";
            return (prefix + Math.random() + Math.random()).replace(/0\./g, "");
        }

        commonUtils.appId = APP_ID;

        /**
         * avalon相关方法
         */
        commonUtils.avalon = {
            clear: function (widget) {
                if (!widget.domNode && commonUtils.isDOM(widget.domNode)) {
                    Logger.log("commonUtils.avalon.clear()无法执行，传入的widget没有domNode或domNode不是一个DOM对象");
                } else {
                    var ctrl = $(widget.domNode).find("*[ms-controller]");
                    for (var i = 0, l = ctrl.length; i < l; i++) {
                        var vmName = ctrl[i].getAttribute("ms-controller");
                        if (vmName) {
                            delete avalon.vmodels[vmName];
                        }
                    }
                }
            },
            unique: function (widget) {
                if (!widget.domNode && commonUtils.isDOM(widget.domNode)) {
                    Logger.log("commonUtils.avalon.unique()无法执行，传入的widget没有domNode或domNode不是一个DOM对象");
                } else if (!widget.vmName) {
                    Logger.log("commonUtils.avalon.unique()无法执行，传入的widget没有vmName或vmName是空字符串");
                } else {
                    var vmName = widget.vmName + (new Date() - 0) + "_";
                    widget.vmName = vmName;
                    var ms_ctrl = widget.domNode.getAttribute("ms-controller");
                    if (typeof ms_ctrl === "string") {
                        if (widget.domNode.getAttribute("uniqued") !== "true") {
                            widget.domNode.setAttribute("ms-controller", vmName + ms_ctrl);
                            widget.domNode.setAttribute("uniqued", "true");
                        }
                    }
                    var ctrl = $(widget.domNode).find("*[ms-controller]");
                    for (var i = 0, l = ctrl.length; i < l; i++) {
                        if (ctrl[i].getAttribute("uniqued") === "true")continue;
                        ctrl[i].setAttribute("ms-controller", vmName + ctrl[i].getAttribute("ms-controller"));
                        ctrl[i].setAttribute("uniqued", "true");
                    }
                }
            }
        };

        /**
         * 全局遮罩
         */
        commonUtils.mask = function (text) {
            //WaitBar.show();
            text = text ? text : "处理中...";
            var mask = $(".loading-mask-layer", window.top.document);
            if (mask.length > 0) {
                mask.find("div").html("<i class='fa fa-spinner fa-spin'></i>" + text);
                mask.fadeToggle();
            } else {
                $("body", window.top.document).append("<div class='loading-mask-layer'><div><i class='fa fa-spinner fa-spin'></i>" + text + "</div></div>");
            }
        };

        /**
         * ajax相关方法
         */
        commonUtils.all = all;
        commonUtils.get = function (url, data, $id) {
            if (commonUtils.isString(url)) {
                url = {
                    url: url,
                    data: data,
                    id: $id
                }
            }
            _setDefTip(url, "获取");
            url.method = "get";
            return commonUtils.ajax(url);
        };
        commonUtils.put = function (url, data, $id) {
            if (commonUtils.isString(url)) {
                url = {
                    url: url,
                    data: data,
                    id: $id
                }
            }
            _setDefTip(url, "更新");
            url.method = "put";
            return commonUtils.ajax(url);
        };
        function _setDefTip(opt, pre) {
            if (opt.tip) {
                if (opt.tip.error) {
                    opt.tip.error = commonUtils.mix({title: pre + "失败", state: "error"}, opt.tip.error);
                }
                if (opt.tip.success) {
                    opt.tip.success = commonUtils.mix({title: pre + "成功", state: "success"}, opt.tip.success);
                }
            }
        }

        commonUtils.post = function (url, data, $id) {
            if (commonUtils.isString(url)) {
                url = {
                    url: url,
                    data: data,
                    id: $id
                }
            }
            _setDefTip(url, "新增");
            url.method = "post";
            return commonUtils.ajax(url);
        };
        commonUtils.del = function (url, data, $id) {
            if (commonUtils.isString(url)) {
                url = {
                    url: url,
                    data: data,
                    id: $id
                }
            }
            _setDefTip(url, "删除");
            url.method = "delete";
            return commonUtils.ajax(url);
        };
        commonUtils.isPC = function () {
            var userAgentInfo = navigator.userAgent;
//        var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
            var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone");
            var flag = true;
            for (var v = 0; v < Agents.length; v++) {
                if (userAgentInfo.indexOf(Agents[v]) > 0) {
                    flag = false;
                    break;
                }
            }
            return flag;
        };
        commonUtils.isMobile = function () {
            if (document.body.clientWidth > 820) {
                return false;
            } else {
                return true;
            }
        };
        commonUtils.ajax = function (url, data, method, $id) {
            var opt = {
                mask: false,
                message: "",
                tip: {
                    error: {
                        title: "失败",
                        state: "error",
                        content: ""
                    },
                    success: null
                }
            };
            if (commonUtils.isString(url)) {
                opt.url = url;
                opt.data = data;
                opt.method = method;
            } else {
                commonUtils.mix(true, opt, url);
            }
            if (!opt.method || !opt.url) {
                throw new Error("无效的url[" + opt.url + "]或method[" + opt.method + "]");
            }
            opt.method = opt.method.toLocaleLowerCase();
            var xhrOpt = {
                url: opt.url,
                handleAs: "text",
                headers: {
                    "appId": this.appId
                }
            };
            if (typeof opt.data !== "undefined") {
                if (opt.method == "get") {
                    xhrOpt.content = opt.data;
                    xhrOpt.headers = {
                        "appId": this.appId
                    }
                } else {
                    xhrOpt.postData = lang.isString(opt.data) ? opt.data : dojo.toJson(lang.isArray(opt.data) ? opt.data : opt.data);//以前是[]
                    xhrOpt.headers = {
                        "Content-Type": "application/json;charset=UTF-8",
                        "appId": this.appId
                    }
                }
            }

            var ajaxHandler;
            switch (opt.method) {
                case "get":
                    ajaxHandler = dojo.xhrGet;
                    break;
                case "post":
                    ajaxHandler = dojo.xhrPost;
                    break;
                case "put":
                    ajaxHandler = dojo.xhrPut;
                    break;
                case "delete":
                    ajaxHandler = dojo.xhrDelete;
                    break;
                default:
                    throw new Error("无效的method[" + opt.method + "]");
            }
//	    ajaxHandler.setRequestHeader("appId", this.appId);

            if (opt.mask) commonUtils.mask(commonUtils.isString(opt.mask) ? opt.mask : "");
            return _responseHandle(opt, ajaxHandler(xhrOpt));
        };
        var _RespInterceptCache = {};
        var _responseHandle = function (opt, promise) {
            var _v = 1;
            if (opt.id) {
                if (_RespInterceptCache[opt.id]) {
                    _RespInterceptCache[opt.id].promise.cancel("", true);
                    //_RespInterceptCache[opt.id].cancel("", true);
                }
                _RespInterceptCache[opt.id] = promise;
            }
            var resolvedCallback = function (response) {
                //    	Logger.log("======resolvedCallback======");
                if (opt.id) {
                    _RespInterceptCache[opt.id] = null;
                }
                if (opt.mask) commonUtils.mask();
                if (!response) {
                    return response;
                }
                var json = dojo.fromJson(response);
                if (json && json.success) {
                    if (opt.tip && opt.tip.success) {
                        topic.publish("base/manager/message", {
                            state: opt.tip.success.state || "",
                            title: opt.tip.success.title || "",
                            content: "<div>" + (opt.tip.success.content || json.message || "操作成功") + "</div>"
                        });
                    }
                    return json;
                } else {
                    var error = new RequestError(json.message, json);
                    error.httpCode = 200;
                    error.httpMessage = "";
                    error.responseText = response;
                    error.responseJson = json;
                    if (opt.tip && opt.tip.error) {
                        topic.publish("base/manager/message", {
                            state: opt.tip.error.state,
                            title: opt.tip.error.title,
                            content: "<div>" + (opt.tip.error.content ? opt.tip.error.content : (error.responseJson ? error.responseJson.message : error.httpMessage)) + "</div>"
                        });
                    }
                    throw error;
                }
            };
            var errorCallback = function (response) {
                //    	Logger.log("======errorCallback======");
                // Logger.log(response);
                // Logger.log(promise);
                // Logger.log(promise.isCanceled);
                // Logger.log(promise.isCanceled());
                if (promise.isCanceled) {
                    throw response;
                    promise.promise.cancel();
                }
                if (opt.id) {
                    _RespInterceptCache[opt.id] = null;
                }
                if (opt.mask) commonUtils.mask();
                var error = new RequestError(json.message);
                error.httpCode = response.status;
                error.httpMessage = response.message;
                error.responseText = response.responseText
                var contentType = response.response.getHeader("Content-Type");
                if (contentType && contentType.indexOf("application/json") != -1) {
                    error.responseJson = dojo.fromJson(response.responseText);
                }
                if (opt.tip && opt.tip.error) {
                    topic.publish("base/manager/message", {
                        state: opt.tip.error.state,
                        title: opt.tip.error.title,
                        content: opt.tip.error.content || "<div>" + (error.responseJson ? error.responseJson.message : error.httpMessage) + "</div>"
                    });
                }
                throw error;
            };
            var progressCallback = function () {
            };
            return promise.then(resolvedCallback, errorCallback, progressCallback);
        };


        return commonUtils;
    });