require([
        "dojo/request/xhr",
        "dojo/dom-construct",
        "dojo/dom",
        "base/utils/PageMenuUtils",
        "base/utils/commonUtils",
        'dojo/io-query'
    ],
    function(
        xhr,
        domConstruct,
        dom,
        PageMenuUtils,
        commonUtils,
        ioquery
    ) {

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
        var restUrl = WEB_ROOT;
        if (url.config) {
            restUrl = restUrl + url.config;
        } else if (url.appId) {
            restUrl = APP_ROOT + "/base/api/cfg/app/" + url.appId + "/json";
        } else {
            restUrl = restUrl + CONFIG_NAME;
        }

        Logger.time("loadConfig");
        //read json
        //xhr("/ibm/ife/framework-api/uiservice/pageConfig",{
        //test
        xhr("base/api", {
            handleAs: "json",
            preventCache: true
        }).then(dojo.hitch(this, function(data) {

        }));


        xhr(restUrl, {
            handleAs: "json",
            preventCache: true
        }).then(dojo.hitch(this, function(data) {
            Logger.timeEnd("loadConfig");
            Logger.time("createMenu");

            function fuckAyData(data) {
                //解析下data
                // var modd = data.data[0];
                var modd = url.appId ? data.data[0] : data[0];
                var pages = modd.pages;
                for (var i = 0; i < pages.length; i++) {
                    if (pages[i].pageId) pages[i].page_id = pages[i].pageId;
                    if (pages[i].pageNm) pages[i].name = pages[i].pageNm;
                    if (pages[i].layoutId) pages[i].layout_id = pages[i].layoutId;
                    if (pages[i].parentId) pages[i].parent_page_id = pages[i].parentId;
                    if (pages[i].pageType) pages[i].type = pages[i].pageType;
                }
                modd.pages = pages;
                //处理下layout
                var newLayouts = [];
                for (var i = 0; i < modd.layouts.length; i++) {
                    if (modd.layouts[i]) {
                        newLayouts.push(modd.layouts[i]);
                    }
                }
                modd.layouts = newLayouts;

                if (url.appId) {
                    //综合监视的页面，作为默认页面
                    if (modd.cfgApp.defaultPageId) {
                        modd.defaultPageId = modd.cfgApp.defaultPageId;
                    } else {
                        for (var k = 0; k < pages.length; k++) {
                            if (pages[k].pageNm == "实时监视") {
                                modd.defaultPageId = pages[k].pageId; // "device_mgmt_page_data_monitor_85efe25b1cf44e8a9a38978c62260b7d";
                                break;
                            }
                        }
                    }
                }

                dojo.byId("app_name").innerHTML = modd.cfgApp ? modd.cfgApp.appNm : "瑞通云平台";

                return [modd];
            }
            this.data = fuckAyData(data);
            if (this.data && this.data.length > 0) {
                var config = this.data[0];

                //this.data = url.appId?data.data : data;
                //if(data && data.length>0){
                //var config = data[0];

                //Logger.log(config);
                var pagesArray = config.pages;
                var pageMenuUtils = new PageMenuUtils();
                var defaultPageId = config.defaultPageId;
                var node = dom.byId("navLinks");
                node.innerHTML = "";
                pageMenuUtils.constructDefalutPageLabel(defaultPageId, pagesArray, node);
                pageMenuUtils.constructDropdownLabelsAndPages(pagesArray, node);

                Logger.timeEnd("createMenu");
            }
        }), dojo.hitch(this, function(err) {
            Logger.log(err);
        }));
    });
