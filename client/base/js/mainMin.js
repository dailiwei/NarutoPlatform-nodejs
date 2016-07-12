require([
         "dojo/_base/lang",
        "dojo/dom-construct",
        "dojo/Deferred",
        "dojo/on",
        "dojo/promise/all",
        "dojo/_base/unload",
//        "idx/app/HighLevelTemplate",
 //       "idx/layout/BorderContainer",
  //      "idx/layout/ContentPane",
//        "idx/app/Header",
//        "idx/widget/Menu",
//        "dijit/MenuItem",
        "dojo/request/xhr",
        "base/Library",
        "base/manager/HandlerManager",
        "dojo/dom"
    ],
    function(
    		lang,
        domConstruct,
        Deferred,
        on,
        all,
        unload,
//        HighLevelTemplate,
 //       BorderContainer,
 //       ContentPane,
//        Header,
//        Menu,
//       MenuItem,
        xhr,
        Library,
        HandlerManager
    ) {
		 //添加事件
	    on(window.document, "click", lang.hitch(this, function (evt) {
	        try{
	        	window.parent.closeSide();
	        }catch(e){
	        	
	        }
	    }));

        HandlerManager.getInstance();

        Logger.time("createWrapper");
        this._library = new Library();

        String.prototype.getParameter = function(key) {
            var re = new RegExp(key + '=([^&]*)(?:&)?');
            return this.match(re) && this.match(re)[1];
        };
        var url = document.location.href;
        var currentPageId = url.getParameter("currentPageId");
        var APP_ID = url.getParameter("appId");
        var pageType = url.getParameter("pageType"); 
        var url = url.getParameter("url"); 
//        Logger.log("currentPageId:" + currentPageId);
        
        //
        if (pageType=="url") {
	        var g = $("#main");
	        var _url;
	        if (url.indexOf("http") >= 0)
	            _url = url;
	        else {
	            _url = APP_ROOT + url
	        }
	        //WaitBar.show(2);
	        //先执行销毁程序
	        //sys.DESTROY_EXE();
	        //销毁执行完毕
	        g.load(_url, function() {
	        	//WaitBar.hide(2);
	        }); 
	        //WaitBar.hide(2);
	        return;
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
                        this._library.loadModule1(layoutModule.module).then(dojo.hitch(this, function(Module) {
                        	 
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
                             
                        }));
                    }  
                }; 
            }));
        }

        constructCurrentPage(currentPageId); 

        userTimeZoneOffset = new Date().getTimezoneOffset();

    });
