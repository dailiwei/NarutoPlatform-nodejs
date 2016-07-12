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
        "base/Library",
        "base/manager/HandlerManager",
        "base/widget/LeftMenu",
        "dojo/dom"

    ],
    function (xhr,
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
              Library,
              HandlerManager,
              LeftMenu,
              dom) {
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
        if (url.appId) {
            window.APP_ID = url.appId;
        }
        var menuid = null;
        if (url.menuid) {
            window.MENU_ID = url.menuid;
        }
        //获取APP的信息
        function getAppInfo() {
            return commonUtils.get(APP_ROOT + "base/api/app/" + APP_ID).then(lang.hitch(this, function (json) {
                return json.data;
            }));
        }

        //获取APP的组件
        function getAppCmpt() {

        }

        //根据APPID获取他所有的页面信息
        function getPagesByApp() {
            return commonUtils.get(APP_ROOT + "base/api/cfg/app/without/config/" + APP_ID + "?useVisible=0").then(lang.hitch(this, function (json) {
                return json.data;
            }));
        }

        console.time("获取数据");
        all([getAppInfo(), getPagesByApp()]).then(lang.hitch(this, function (list) {
            var appInfo = list[0][0];
            appInfo.header = appInfo.header || "base/widget/Header";
            window.document.title = appInfo.appNm;
            var pages = list[1];
            //动态加载header
            require([appInfo.header], lang.hitch(this, function (headerClass) {
                var widget = new headerClass({pages: pages,urlParams:url,appInfo:appInfo});
                domConstruct.place(widget.domNode, this.header);
                widget.startup();

                html.setStyle(window.document.body,"visibility","");
                console.timeEnd("获取数据");

            }));

        }));

        HandlerManager.getInstance();
        this.global = {};

    });
