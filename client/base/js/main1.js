require([
         "dojo/_base/lang",
        "dojo/dom-construct",
        "dojo/Deferred",
        "dojo/on",
        "dojo/promise/all",
        "dojo/_base/unload", 
        "dojo/request/xhr",
        "base/Library",
        "base/manager/HandlerManager", 
        'dojo/io-query'
    ],
    function(
    		lang,
        domConstruct,
        Deferred,
        on,
        all,
        unload, 
        xhr,
        Library,
        HandlerManager,
        ioquery
    ) { 

        HandlerManager.getInstance();
        this._library = new Library();

        Logger.time("createWrapper");
        function getUrlParams() {
            var s = window.location.search,
                p;
            if (s === '') {
                return {};
            }

            p = ioquery.queryToObject(s.substr(1));
            return p;
        }
        var url = getUrlParams();
        var module = null;
        var restUrl = WEB_ROOT;
        if (url.config) {
            restUrl = restUrl + url.config;
        } 
        else if(url.module){
        	module = url.module;
        }else{
        	alert("请指定配置文件/或者模块路径");
        	return ;
        }
 
        if(module){
        	this._library.loadModule1(module).then(dojo.hitch(this, function(Module) {
           	 
           	 
                this.currentLayout = new Module({ 
                    style: "width:100%;height:100%",
                    parameters: {}
                });
                this.currentLayout.placeAt("main"); 
                if (this.currentLayout.startup) {
                    this.currentLayout.startup();
                }
                if (this.currentLayout.resize) {
                    this.currentLayout.resize();
                }
           
            
       }));
        }else{
        	xhr(restUrl, {
                handleAs: "json",
                preventCache: true
            }).then(dojo.hitch(this, function(data) {
                if (data) {
                    var _page = data[0].pages[0];
                    var _layoutId = _page.layout_id;
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
                        this._library.loadModule1(layoutModule.module).then(dojo.hitch(this, function(Module) {
                        	 
                        	 
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
                            
                             
                        }));
                    }  
                }; 
            })); 
        }

        window.clearWidget = lang.hitch(this,function(){
            if(this.currentLayout){
                this.currentLayout.destroy();
            }
        });


        window.createWidget = lang.hitch(this,function(){
            var url = getUrlParams();
            var module = null;
            var restUrl = WEB_ROOT;
            if (url.config) {
                restUrl = restUrl + url.config;
            }
            else if(url.module){
                module = url.module;
            }else{
                alert("请指定配置文件/或者模块路径");
                return ;
            }

            if(module){
                this._library.loadModule1(module).then(dojo.hitch(this, function(Module) {


                    this.currentLayout = new Module({
                        style: "width:100%;height:100%",
                        parameters: {}
                    });
                    this.currentLayout.placeAt("main");
                    if (this.currentLayout.startup) {
                        this.currentLayout.startup();
                    }
                    if (this.currentLayout.resize) {
                        this.currentLayout.resize();
                    }


                }));
            }else{
                xhr(restUrl, {
                    handleAs: "json",
                    preventCache: true
                }).then(dojo.hitch(this, function(data) {
                    if (data) {
                        var _page = data[0].pages[0];
                        var _layoutId = _page.layout_id;
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
                            this._library.loadModule1(layoutModule.module).then(dojo.hitch(this, function(Module) {


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


                            }));
                        }
                    };
                }));
            }
        });
        
    });
