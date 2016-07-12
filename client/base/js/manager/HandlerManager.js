///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Richway. All Rights Reserved.
// create by dailiwei 2015-05-21 11:56
///////////////////////////////////////////////////////////////////////////

define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        "dojo/Deferred",
        'dojo/_base/html',
        "dojo/_base/fx",
        "dojo/fx/easing",
        "dojo/dom-construct",
        "base/_BaseWidget",
        "base/Logger"
    ],
    function(declare,
        lang,
        topic,
        Deferred,
        html,
        fx,
        easing,
        domConstruct,
        _Widget,
        Logger
    ) {
        var instance = null,
            clazz;

        clazz = declare([_Widget], {
            constructor: function(options) {

                /**
                 *  监听filter hanler的参数
                 */
                topic.subscribe("base/manager/HandlerManager", lang.hitch(this, this._filterHanler));


                topic.subscribe("base/manager/message", lang.hitch(this, this.showMessage));

                window.Logger = Logger;//注入到全局里面

                ////去掉默认的contextmenu事件，否则会和右键事件同时出现。
                //document.oncontextmenu = function(e){
                //    e.preventDefault();
                //};

                var G={name:"RichWay JS SDK",version:"2.0.X",owner:"www.richway.cc"};
                window.G=G;
                var cons=window.console;cons&&cons.log&&(cons.log("%c","font-size:30px; padding:15px 150px;line-height:60px;background:url('"+APP_ROOT+"base/images/richway.png"+"') no-repeat;"),cons.log(G.name,G.version,"\u00a9",G.owner));
            },
            /**
             * 保存所有的 Handler
             */
            _handlerList: [],
            _filterHanler: function(args) {

                args = {
                    "filterName": "leftSearch",
                    "filterArgs": {
                        "check": true,
                        "type": "rain"
                    },
                    "layer": {
                        id: "RainLayer",
                        'name': "雨量站图层",
                        "icon": "base/icon/rain.png",
                        displayName: "stnm",
                        "displayValue": "drp"
                    },
                    "handlerPath": "base/manager/BaseHandler"
                };

                if (args.handlerPath) {
                    require([args.handlerPath], lang.hitch(this, function(Handler) {

                        //判断是否已经创建过了
                        for (var i = 0; i < this._handlerList.length; i++) {
                            if (_handlerList["path"] == args.handlerPath) {
                                _handlerList["handler"].handler(args);
                                return;
                            }
                        }
                        var handler = new Handler();
                        handler.handler(args);

                        this._handlerList.push({
                            "path": args.handlerPath,
                            "handler": handler
                        });

                    }));

                }
            },
            _dataStore: {},

            onDataPublished: function(name, id, data, keepHistory) {

            },

            onFetchData: function(id) {

            },
            listDiv: null,
            showMessage: function(message) {
                //message {state:"info",title:"测试",content:"<div>xxxxxxxxxx</div>"}

                this.ShowToast(message.content, message.title, message.state);
                //this.show(message);
            },
            count: 0,
            divList: [],
            show: function(message) {
                var gcolor = "#208e3e";
                if (message.state == "error") {
                    gcolor = "#d95450";
                } else if (message.state == "warn") {
                    gcolor = "#d9d931";
                } else {
                    gcolor = "#208e3e";
                }
                var listDiv = html.create('div', {
                    'style': 'position: absolute;z-index:100000;float:left;width:300px;height:115px;  border: solid 2px #E9F5FD;border-radius: 1px;  box-shadow: 0 0 10px #6b6a67; background-color: rgba(247, 249, 250, 0.74902);',
                    innerHTML: '<div style="width: 100%;height: 100%">' +
                        '<div style="font-family:微软雅黑;font-size:14px;color:#fcfcfc;text-align: center;vertical-align: middle;height: 30px;width: 100%;background-color:' + gcolor + ' ">' + message.title + '</div>' +
                        '<div style="height: 80px;width: 100%;margin:5px;color:#576cfd;">' + message.content + '</div>' +
                        '</div>'
                }, "main");

                dojo.style(listDiv, {
                    "right": 20 + "px",
                    "bottom": (20 + this.count * 120) + "px"
                });
                fx.animateProperty({
                    node: listDiv,
                    //easing: easing.backOut,
                    //easing: easing.bounceOut,
                    easing: easing.circOut,
                    properties: {
                        opacity: {
                            start: 0,
                            end: 1
                        },
                        bottom: {
                            start: -200,
                            end: (25 + this.count * 120)
                        }
                    },
                    duration: 700,
                    onEnd: lang.hitch(this, function() {
                        setTimeout(lang.hitch(this, this.closeMessageDiv), 4000);
                        //dojo.fx.wipeIn({
                        //    node: this.listDiv,
                        //    duration: 1000
                        //}).play();
                    })
                }).play();

                this.divList.push({
                    id: dojox.uuid.generateRandomUuid(),
                    div: listDiv,
                    bottom: (25 + this.count * 120)
                });
                this.count++;
                //setTimeout(lang.hitch(this,this.closeMessageDiv),3000);
            },
            closeMessageDiv: function() {
                var item = this.divList[0];
                fx.animateProperty({
                    node: item.div,
                    properties: {
                        opacity: {
                            start: 1,
                            end: 0
                        },
                        right: {
                            end: -330
                        }
                    },
                    duration: 300,
                    onEnd: lang.hitch(this, function() {
                        var item = this.divList[0];
                        this.count--;
                        //销毁
                        domConstruct.destroy(item.div);
                        item.div = null;
                        this.divList.splice(0, 1);

                    })
                }).play();
            },
            ///

            ShowSuccess: function(message, title) {
                toastr.options = {
                    closeButton: true,
                    progressBar: true,
                    showMethod: 'slideDown',
                    timeOut: 4000
                };
                if (title == '')
                    title = "成功";
                toastr.success(message, title);
            },
            ShowWarn: function(message, title) {
                toastr.options = {
                    closeButton: true,
                    progressBar: true,
                    showMethod: 'fadeIn',
                    timeOut: 4000
                };
                if (title == '')
                    title = "警告";
                toastr.warning(message, title);
            },
            ShowError: function(message, title) {
                toastr.options = {
                    closeButton: true,
                    progressBar: true,
                    showMethod: 'fadeIn',
                    timeOut: 40000
                };
                if (title == '')
                    title = "错误";
                toastr.error(message, title);
            },
            ShowInfo: function(message, title) {
                toastr.options = {
                    closeButton: true,
                    progressBar: true,
                    showMethod: 'slideDown',
                    timeOut: 4000
                };
                if (title == '')
                    title = "提示";
                toastr.info(message, title);
            },
            ShowToast: function(message, title, type) {
                if (type == 'info' || type == '')
                    this.ShowInfo(message, title);
                else if (type == 'warn')
                    this.ShowWarn(message, title);
                else if (type == 'error')
                    this.ShowError(message, title);
                else if (type == 'success')
                    this.ShowSuccess(message, title);
            }

        });

        clazz.getInstance = function() {
            if (instance === null) {
                instance = new clazz();
            }
            return instance;
        };
        return clazz;
    });
