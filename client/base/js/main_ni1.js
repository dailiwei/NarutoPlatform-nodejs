require([
        "dojo/request/xhr",
        "dojo/_base/lang",
        "dojo/_base/html",
        "dojo/topic",
        "dojo/on",
        "dojo/dom-construct",
        "base/utils/PageMenuUtils_ni",
        "base/utils/commonUtils",
        "dojo/io-query",
        "dojo/Deferred",
        "dojo/promise/all",
        "dojo/_base/unload",
        //    "idx/app/HighLevelTemplate",
        //   "idx/app/Header",
        "base/Library",
        "base/manager/HandlerManager",
        "base/widget/LeftMenu",
        "dojo/dom"

    ],
    function(
        xhr,
        lang,
        html,
        topic,
        on,
        domConstruct,
        PageMenuUtils,
        commonUtils,
        ioquery,
        Deferred,
        all,
        unload,
        //   HighLevelTemplate,
        //     Header,
        Library,
        HandlerManager,
        LeftMenu,
        dom
    ) {
	  
    
        HandlerManager.getInstance();
        this.global = {};
        Logger.time("createWrapper");
        var s = window.location.search;

        var p = ioquery.queryToObject(s.substr(1));
    	var menuContainer = dojo.byId("myMenu");
//        html.setStyle(menuContainer,"background-color","red");
        var widget = new LeftMenu(p);
        domConstruct.place(widget.domNode,menuContainer);
        widget.startup();
        
        this._library = new Library();
    	if(commonUtils.isMobile()){  
    		  $("#navLinks").hide();
//    		  $("#warn_tag").hide(); 
    	} 

        $("#navLinks li").click(function() {
            $(this).addClass("active").siblings().removeClass("active");
            $(this).parent().siblings().removeClass("active");
            $(this).siblings().children().removeClass("active");
        });
        $('[data-toggle="menu"]').click(lang.hitch(this, function(h) {
            var menuBtn = $(h.target);
            var menuTarget = menuBtn.attr("data-target");
            var menuUrl = menuBtn.attr("data-url");
            var menuId = menuBtn.attr("data-id");
            var menuType = menuBtn.attr("data-type");
            //菜单执行
            if (menuType == "page") {
                menuUrl = menuId;
            }
            this._library.changePage(menuType, menuUrl, menuTarget, null);
        }));
        //解决点子元素没响应的问题
        $('[data-toggle="menu"]').children().click(lang.hitch(this, function(h) {
            var menuBtn = $(h.target).parent(); 
            var menuTarget = menuBtn.attr("data-target");
            var menuUrl = menuBtn.attr("data-url");
            var menuId = menuBtn.attr("data-id");
            var menuType = menuBtn.attr("data-type");
            //菜单执行
            if (menuType == "page") {
                menuUrl = menuId;
            }
            this._library.changePage(menuType, menuUrl, menuTarget, null);
        }));
        //整页面刷新
        $('[data-toggle="menuFresh"]').click(lang.hitch(this, function(h) {
            var menuBtn = $(h.target);
            var menuTarget = menuBtn.attr("data-target");
            var menuUrl = menuBtn.attr("data-url");
            var menuId = menuBtn.attr("data-id");
            var menuType = menuBtn.attr("data-type");
            //菜单执行
            if (menuType == "page") {
                menuUrl = menuId;
            }
            var strUrl=window.location.href;
            var name="menuid";
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
            var r = window.location.search.substr(1).match(reg);  //匹配目标参数
            
            if(menuTarget=="_blank"){
            	if(menuUrl.indexOf("IP_PORT")>-1){
            		menuUrl = menuUrl.replace("IP_PORT","");
            		menuUrl = IP_PORT+menuUrl;
            		window.open(menuUrl,"_blank");
            	}else{
            		window.open(menuUrl,"_blank");
            	}
        	
        		return; 
        	}
            
            if (r != null){
            	var menu=unescape(r[2]);
            	strUrl=strUrl.replace(menu,menuId);
            	location.href=strUrl;
            }else{
            	
            	if(strUrl.indexOf("?")>0){
            		location.href=strUrl+"&"+name+"="+menuId;
            	}
            	else{
            		location.href=strUrl+"?"+name+"="+menuId;
            	}
            }
            //this._library.changePage(menuType, menuUrl, menuTarget, null);
        }));

        function getUrlParams() {
            var s = window.location.search,
                p;
            if (s === '') {
                return {};
            }

            p = ioquery.queryToObject(s.substr(1));
            return p;
        }

        function encodeParameters(parameters) {
            var encodedParameter = "";
            if (parameters && parameters.data && parameters.namespace) {
                var parameterArray = [];
                parameterArray.push("namespace" + encodeURIComponent("=" + parameters.namespace));
                for (var name in parameters.data) {
                    parameterArray.push(name + encodeURIComponent("=" + parameters.data[name]));
                }
                encodedParameter = "parameters=" + parameterArray.join(encodeURIComponent("&"));
            }
            return encodedParameter;

        }

        function decodeParameters(parameters) {
            if (parameters) {
                var _parameter = decodeURIComponent(parameters);
                var _parameterObj = ioquery.queryToObject(_parameter);
                var _tmpObj = {
                    "namespace": null,
                    "data": null
                };
                _tmpObj.namespace = _parameterObj.namespace || "";
                if (_parameterObj.namespace) {
                    delete _parameterObj.namespace;
                };
                _tmpObj.data = _parameterObj;
                return _tmpObj;
            } else {
                return null;
            }


        }


        topic.subscribe("/rich/base/index/changePage", lang.hitch(this, function(message) {
            // Logger.log(message);
            if (message) {
                if (message.target == "_iframe") {
                    //iframe
                    $('#page-content').hide();
                    $('#masterContent').show();
                    $('#page-content').innerHTML = "";
                    var iframeEle = $("#framework");
                    var existUrl = iframeEle.src;
                    if (message.url) {
                        if (!(/^http?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i).test(message.url)) {
                            message.url = APP_ROOT + message.url;
                        }
                    } else {
                        message.url = APP_ROOT + "app.jsp?m&appId=" + APP_ID + "&currentPageId=" + message.pageId;
                        if (message.parameters) {
                            var _encodedParameter = encodeParameters(message.parameters);
                            message.url += _encodedParameter === "" ? "" : "&" + _encodedParameter;
                        };

                    }


                    if (iframeEle.length == 0) {
                        var iframe = document.createElement("iframe");
                        iframe.src = message.url;
                        iframe.id = "framework";
                        iframe.border="0";
                        iframe.frameborder="0";
                        iframe.scrolling="no";
                        iframe.style.frameSpacing="0";
                        iframe.style.frameBorder="0";
                        iframe.style.width = "100%";
                        iframe.style.height = "100%";
                        document.getElementById("masterContent").appendChild(iframe);
                        return;
                    } else {
                        iframeEle.attr("src", message.url);
                    }
                } else if (message.target == "_blank") {
                    var url;
                    if (message.url) {
                        url = message.url;
                    } else {
                        if (message.pageId) {

                            var _location = window.location;

                            if (!_location.search) {
                                url = _location.href + "?currentPageId=" + message.pageId;
                            } else {
                                var _url = getUrlParams();

                                _url.currentPageId = message.pageId;

                                _url.parameters = encodeParameters(message.parameters);
                                url = _location.host + _location.pathname + "?" + ioquery.objectToQuery(_url);
                                //} else {

                                //  }
                            }
                        }
                    }
                    window.open(url, '_blank');
                } else {


                    $('#page-content').show();
                    $('#masterContent').hide();
                    
//                    domConstruct.destroy("main");

//                    var div = domConstruct.create("div", {
//                        "id": "main",
//                        "style": "width:100%;border:0;margin:0;padding:0;height:100%"
//                    });
//
//
//                    domConstruct.place(div, "page-content");

//                    if (this.currentLayout) {
//                        if (this.currentLayout.destroy) {
//                            this.currentLayout.destroy();
//                        };
//                        this.currentLayout = null;
//                    };
                    //  message.url="rich/base/api";
                    if (message.url) {
                        var g = $("#frames"); 
                        var _url;
                        if (message.url.indexOf("http") >= 0)
                            _url = message.url;
                        else {
                            _url = APP_ROOT + message.url
                        }
                        g.load(_url, function() {

                        });
                    } else {
                        this.currentPageId = message.pageId;

                        if (message.parameters && message.parameters.namespace) {
                            this.global[message.parameters.namespace] = message.parameters.data;

                        }
//                        constructCurrentPage(this.currentPageId); 
                        //parseData(this.pageData);
                        $('#framework_new').attr("src", "layoutWrapperMin.jsp?currentPageId=" + message.pageId+"&appId="+APP_ID);
                        
                    }

                }


            }

        }));
        var _url = getUrlParams();
        if (_url.currentPageId) { //指定当前页的的优先级要高于默认页
            var _parameter;
            if (_url.parameters) {
                _parameter = decodeParameters(_url.parameters);
            };
            this._library.changePage("page", _url.currentPageId, "_self", _parameter);
        } else {
//            //加载默认页面信息
//        	Default_PageId = _url.menuid;
//            if (Default_PageId != null && Default_PageId != "") {
//                if (Default_PageType == "url") {
//                    this._library.changePage(Default_PageType, Default_Url, Default_Target, null);
//                } else
//                    this._library.changePage(Default_PageType, Default_PageId, Default_Target, null);
//            }

        }

        function constructCurrentPage(currentPageId) {
            var restUrl = APP_ROOT;
            var appId = APP_ID;
            restUrl += "/base/api/cfg/app/" + appId + "/page/" + currentPageId;

            xhr(restUrl, {
                handleAs: "json",
                preventCache: true
            }).then(dojo.hitch(this, function(data) {
                if (data && data.success && data.data) {
                    var _page = data.data[0];
                    var _layoutId = _page.layoutId;
                    var _config = _page.config;
                    currentPageWidgets = _config;
                    var layoutModule;
                    if (_layoutId) {
                        for (var item in _config) {
                            if (_config[item].id == _layoutId) {
                                layoutModule = _config[item];
                                break;
                            }
                        }
                    } 

                    if (layoutModule) {
                    	 if(layoutModule.widget_id=="Base.FloatLayout"&&this.mainVewLayout){
                    		 this.mainVewLayout.placeAt("main"); 
                    		 return;
                    	 }
                    	 
                        this._library.loadModule1(layoutModule.module).then(dojo.hitch(this, function(Module) {

                        	 if(layoutModule.widget_id=="Base.FloatLayout"){
                        		 //判断下如果是主页面，则只初始化一次
                             	if(!this.mainVewLayout){
                             		try {
                                        this.mainVewLayout = new Module({
                                            widget_id: layoutModule.id,
                                            style: "width:100%;height:100%",
                                            parameters: layoutModule.parameters
                                        });
                                        this.mainVewLayout.placeAt("main"); 
                                        if (this.mainVewLayout.startup) {
                                            this.mainVewLayout.startup();
                                        }
                                        if (this.mainVewLayout.resize) {
                                            this.mainVewLayout.resize();
                                        }
                                    } catch (error) {
                                        throw "Error create instance:" + layoutModule.id + ". " + error;
                                    }
                                 } 
                             }else{
                            	 try {
                                     this.currentLayout = new Module({
                                         widget_id: layoutModule.id,
                                         style: "width:100%;height:100%",
                                         parameters: layoutModule.parameters
                                     });
                                     this.currentLayout.placeAt("main"); 
                                     if (this.currentLayout.startup) {
                                         this.currentLayout.startup();
                                     }
                                     if (this.currentLayout.resize) {
                                         this.currentLayout.resize();
                                     }
                                 } catch (error) {
                                     throw "Error create instance:" + layoutModule.id + ". " + error;
                                 }
                             } 

                        }));
                    }


                };



            }));
        }





    });
