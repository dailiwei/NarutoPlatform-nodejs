/////////////////////////////////////////////////////////////////////////// 
// create by dailiwei 2015-11-17 17:22
///////////////////////////////////////////////////////////////////////////
define(
    [
        "dojo/_base/declare",
        "dojo/_base/lang",
        'dojo/_base/html',
        'dojo/query',
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "base/_BaseWidget",
        "dojo/topic",
        "dojo/Deferred",
        "dojo/dom-construct",
        "dojo/dom-class",
        'dojo/on',
        "dojo/text!./templates/LeftMenuSide.html",
        "dojo/text!./css/LeftMenuSide.css",
        "dojo/parser",
        "dojo/request",
        'dojo/_base/fx',
        "base/Library",
        "dojo/ready"],
    function (declare,
              lang,
              html,
              query,
              _TemplatedMixin,
              _WidgetsInTemplateMixin,
              _Widget,
              topic,
              Deferred,
              domConstruct,
              domClass,
              on,
              template,
              css,
              parser,
              request,
              baseFx,
              Library,
              ready) {

        var instance = null;
        ready(function () {
            parser.parse();
        });

        instance = declare("base.widgets.LeftMenuSide", [_Widget, _TemplatedMixin],
            {
                templateString: template,
                baseClass: 'base-widgets-LeftMenuSide',
                name: "测试",
                wrapperHtml: "layoutWrapperMin.jsp",
                constructor: function (args) {

                    this.data = args;//数据list
                    this.setCss(css);
                    this._library = new Library();

                    this.itemList = [];
                    this.currentHeight = 0;
                    this.titleList = [];
                    this.frameHeadList = [];
                    this.selectPageId = "";
                },
                postCreate: function () {
                    this.inherited(arguments);
                },

                startup: function () {
                    this.inherited(arguments);

                    var P = $(window).height();
                    this.HEIGHT = P - 75;  //菜单的最多高度

                    html.setStyle(this.domNode, "height", this.HEIGHT + "px");
                    this.createFirstMenu(this.data);
                },
                createFirstMenu: function (list) {
                    for (var i = 0; i < list.length; i++) {
                        var item = list[i];
                        this.createList(item, i);
                    }
                },
                itemList: [],
                currentHeight: 0,
                titleList: [],
                frameHeadList: [],
                selectPageId: "",
                createList: function (item, index) {
                    var itemDiv = domConstruct.create("div");
                    domClass.add(itemDiv, "ibox mybox");//包围盒子

                    domConstruct.place(itemDiv, this.leftpanelSideDiv);

                    var itemDiv_title = domConstruct.create("div");
                    domClass.add(itemDiv_title, "ibox-title");//父级菜单

                    var itemDiv_title_span = domConstruct.create("span", {id: item.pageId});
                    itemDiv_title_span.innerHTML = '<span   style="cursor:pointer;">' + item.pageNm + '</span>';
                    domConstruct.place(itemDiv_title_span, itemDiv_title);
                    if (index == 0) {//默认是第一个
                        html.addClass(itemDiv_title_span, 'jimu-widget-leftpanel-list-item-select');
                        //可以派发个事件，说第一个选中了的
                        if (item.children && item.children.length > 0) {
                            var childrens = item.children;
                            this.showHeadTabs();
                            for (var k = 0; k < childrens.length; k++) {
                                var chlid = childrens[k];

                                if (k == 0) {
                                    this.selectPageId = chlid.pageId;
                                    this.createFrame(chlid, "block");
                                    this.createFrameHead(chlid, "select");
                                } else {
                                    this.createFrame(chlid, "none");
                                    this.createFrameHead(chlid, "noselect");
                                }
                            }
                        } else {
                            this.hideHeadTabs();
                            //只创建一个iframe
                            this.createFrame(item, "block");
                            this.createFrameHead(item, "select");
                            //设置当前的选中的pageId
                            this.selectPageId = item.pageId;
                        }
                    }
                    //title加到盒子上
                    domConstruct.place(itemDiv_title, itemDiv);

                    if (item.children && item.children.length > 0) {
//	                	//添加收缩的工具
//	                	var itemDiv_title_tools = domConstruct.create("div");
//	 	                domClass.add(itemDiv_title_tools, "ibox-tools");//小工具
//	 	                itemDiv_title_tools.innerHTML = ' <a class="collapse-link"><i class="fa fa-chevron-up"></i></a>';
//	 	                domConstruct.place(itemDiv_title_tools,itemDiv_title); 

                        var itemDiv_content = domConstruct.create("div", {
                            'style': "padding-top: 5px;padding-bottom: 5px;padding-left: 30px;"
                        });
                        domClass.add(itemDiv_content, "ibox-content");//zi级
                        //内容加到盒子上
                        domConstruct.place(itemDiv_content, itemDiv);
                        //循环是否有子项目
                        var childrens = item.children;
                        for (var k = 0; k < childrens.length; k++) {
                            var child = childrens[k];
                            var label = html.create('div', {
                                'id': child.pageId,
                                'align': item.pageId,
                                'class': 'content-title',
                                innerHTML: child.pageNm
                            }, itemDiv_content);
                            this.own(on(label, 'click', lang.hitch(this, function (e) {
                                var pageId = e.currentTarget.id;

                                if (this.selectPageId == pageId) {
                                    return;
                                }
                                this.selectPageId = pageId;//指定当前的选中页
                                //判断是不是以及打开的iframe，已经创建出来了
                                for (var k = 0; k < this.frameList.length; k++) {
                                    if (this.frameList[k].pageId == pageId) {
                                        this.FrameHeadChange(pageId);
                                        return;
                                    }
                                }

                                //先清除以前的
                                this.clearTabAndFrames();
                                //否则没有，需要创建新的

                                var parentId = e.currentTarget.align;
                                var it;
                                for (var n = 0; n < this.itemList.length; n++) {
                                    if (this.itemList[n].parentId == parentId) {
                                        var chlid = this.itemList[n].data;
                                        if (pageId == this.itemList[n].pageId) {
                                            this.createFrame(chlid, "block");
                                            this.createFrameHead(chlid, "select");
                                        } else {
                                            this.createFrame(chlid, "none");
                                            this.createFrameHead(chlid, "noselect");
                                        }
                                    }
                                }
                                //同时更新side选中状态
                                for (var k = 0; k < this.titleList.length; k++) {
                                    if (parentId == this.titleList[k].pageId) {
                                        html.addClass(this.titleList[k].title, 'jimu-widget-leftpanel-list-item-select');
                                        //更新menu的选项
                                        topic.publish("menu/select/change", this.titleList[k].data);
                                    } else {
                                        html.removeClass(this.titleList[k].title, 'jimu-widget-leftpanel-list-item-select');
                                    }
                                }
                                //更新side
                                for (var k = 0; k < this.itemList.length; k++) {
                                    html.removeClass(this.itemList[k].label, "jimu-widget-leftpanel-list-item-select")
                                    if (this.itemList[k].pageId == pageId) {
                                        html.addClass(this.itemList[k].label, "jimu-widget-leftpanel-list-item-select")
                                    }
                                }

//		  		                //菜单执行
//	  		                    var menuUrl;
//		  		                if (it.pageType == "page") {
//		  		                    menuUrl = it.pageId;
//		  		                }
//		  		                this._library.changePage(it.pageType, menuUrl, it.target, null);


//	  		                	dojo.stopEvent(e);
                            })));
                            if (index == 0 && k == 0) {//默认是第一个
                                html.addClass(label, 'jimu-widget-leftpanel-list-item-select');
                            }
                            this.itemList.push({
                                "label": label,
                                "pageId": child.pageId,
                                "parentId": item.pageId,
                                "data": child
                            });

                        }

                    }

                    this.own(on(itemDiv_title_span, 'click', lang.hitch(this, function (e) {
                        var pageId = e.currentTarget.id;

                        this.selectTitle(pageId);
                    })));
                    this.titleList.push({
                        "title": itemDiv_title_span,
                        "pageId": item.pageId,
                        childerns: item.children,
                        "data": item
                    });

                    this.currentHeight += 40;
                },
                selectTitle: function (pageId) {
                    if (this.selectPageId == pageId) {//当前就是他忽略
                        return;
                    }
                    //当前是他的子也忽略
                    var childerns;
                    var item;
                    for (var k = 0; k < this.titleList.length; k++) {
                        if (this.titleList[k].pageId == pageId) {
                            item = this.titleList[k].data;
                            childerns = this.titleList[k].childerns;
                            for (var i = 0; i < childerns.length; i++) {
                                if (childerns[i].pageId == this.selectPageId) {
                                    return;
                                }
                            }
                        }
                    }
                    //否则清空创建
                    this.clearTabAndFrames();

                    //可以派发个事件，说第一个选中了的 
                    if (childerns && childerns.length > 0) {

                        this.showHeadTabs();
                        for (var k = 0; k < childerns.length; k++) {
                            var chlid = childerns[k];
                            if (k == 0) {
                                this.selectPageId = chlid.pageId;
                                this.createFrame(chlid, "block");
                                this.createFrameHead(chlid, "select");
                            } else {
                                this.createFrame(chlid, "none");
                                this.createFrameHead(chlid, "noselect");
                            }
                        }

                    } else {
                        this.hideHeadTabs();
                        //只创建一个iframe
                        this.createFrame(item, "block");
                        this.createFrameHead(item, "select");

                        //设置当前的选中的pageId
                        this.selectPageId = item.pageId;
                    }

                    //清空选中状态
                    //同时更新side选中状态
                    for (var k = 0; k < this.titleList.length; k++) {
                        if (pageId == this.titleList[k].pageId) {
                            html.addClass(this.titleList[k].title, 'jimu-widget-leftpanel-list-item-select');
                        } else {
                            html.removeClass(this.titleList[k].title, 'jimu-widget-leftpanel-list-item-select');
                        }
                    }
                    //更新side
                    for (var k = 0; k < this.itemList.length; k++) {
                        html.removeClass(this.itemList[k].label, "jimu-widget-leftpanel-list-item-select")
                        if (this.itemList[k].pageId == this.selectPageId) {
                            html.addClass(this.itemList[k].label, "jimu-widget-leftpanel-list-item-select")
                        }
                    }

                    //更新menu的选项
                    topic.publish("menu/select/change", item);
                },
                hideHeadTabs: function () {
                    var tbs = dojo.byId("frameHeader");
                    html.setStyle(tbs, "display", "none");
                    var P = $(window).height();
                    //设置iframe的高度
                    html.setStyle(dojo.byId("frames"), "height", P - 52 + "px");
                },
                showHeadTabs: function () {
                    var tbs = dojo.byId("frameHeader");
                    html.setStyle(tbs, "display", "block");

                    var P = $(window).height();
                    //设置iframe的高度
                    html.setStyle(dojo.byId("frames"), "height", P - 52 - 40 + "px");
                },
                maxWidth: 202,
                minWidth: 0,
                _resizeToMin: function () {
                    //这块加个动画效果
                    this.doDnimate(this.domNode, {width: {start: this.maxWidth, end: this.minWidth}}, 300);
                    this.doDnimate(this.leftpanelSideDiv, {width: {start: this.maxWidth, end: this.minWidth}}, 300);


                    this.doDnimate(this.domNode, {opacity: {start: 1, end: 0}}, 200);

                },
                _resizeToMinFast: function () {
                    html.setStyle(this.domNode, "width", 0);
                    html.setStyle(this.leftpanelSideDiv, "width", 0);
                    html.setStyle(this.domNode, "opacity", 0);

                },
                _resizeToMax: function () {
                    this.doDnimate(this.domNode, {width: {start: this.minWidth, end: this.maxWidth}}, 300);
                    this.doDnimate(this.leftpanelSideDiv, {width: {start: this.minWidth, end: this.maxWidth}}, 300);

                    this.doDnimate(this.domNode, {opacity: {start: 0, end: 1}}, 200);
                },
                doDnimate: function (domNode, properties, duration) {
                    baseFx.animateProperty(
                        {
                            node: domNode,
                            properties: properties,
                            duration: duration
                        }).play();
                },
                clearTabAndFrames: function () {
                    domConstruct.empty(dojo.byId("tabFrames"));
                    domConstruct.empty(dojo.byId("frames"));

                    this.frameHeadList = [];
                    this.frameList = [];
                },
                createFrameHead: function (item, select) {
                    /*var tab = html.create('div', {
                     'id':item.pageId,
                     'class': 'content-title-tab breadcrumb',
                     "style":'float:left;padding-left:20px;padding-right:0px;',
                     innerHTML: item.pageNm//'<i class="fa fa-align-justify"></i>'+
                     }, dojo.byId("tabFrames"));  */
                    var tab = html.create('li', {
                        'id': item.pageId,
                        'data-url': item.url,
                        'data-type': item.pageType,
                        'class': '',
                        innerHTML: '<a>' + item.pageNm + '</a>'//'<i class="fa fa-align-justify"></i>'+
                    }, dojo.byId("tabFrames"));
                    if (select == "select") {
                        //html.addClass(tab,'content-title-tab-select');
                        html.addClass(tab, 'active');
                    }
                    this.own(on(tab, 'click', lang.hitch(this, function (e) {
                        var it;
                        var iframe;
                        var pageId = e.currentTarget.id;
                        if (this.selectPageId == pageId) {
                            return;
                        }
                        var pageType = e.currentTarget.getAttribute('data-type');

                        if (pageType == 'url') {
                            this.selectPageId = pageId;
                            //更新tab，选中状态
                            for (var k = 0; k < this.frameHeadList.length; k++) {
                                html.removeClass(this.frameHeadList[k].tab, "active");
                                if (this.frameHeadList[k].pageId == pageId) {
                                    html.addClass(this.frameHeadList[k].tab, "active");
                                }
                            }

                            //需要使用load方式加载
                            var g = $("#frames");
                            //g.css("padding-left","15px");
                            //g.css("padding-right","15px");
                            var _url = APP_ROOT + e.currentTarget.getAttribute('data-url');
                            WaitBar.show(2);
                            //先执行销毁程序
                            sys.DESTROY_EXE();
                            //销毁执行完毕
                            //url参数进数组，供页面取，获取方式：urlUtil.getRequest("name")
                            urlUtil.initUrlPars(_url);
                            g.load(_url, function () {
                                WaitBar.hide(2);
                            });
                        } else {
                            this.FrameHeadChange(pageId);
                        }

                        dojo.stopEvent(e);
                    })));
                    this.frameHeadList.push({"pageId": item.pageId, "tab": tab});
                },
                FrameHeadChange: function (pageId) {
                    for (var n = 0; n < this.frameList.length; n++) {
                        this.frameList[n].iframe.style.display = "none";
                        if (this.frameList[n].pageId == pageId) {
                            iframe = this.frameList[n].iframe;
                        }
                    }
                    iframe.style.display = "block";
                    if (iframe.src.endWith("about:blank"))
                        iframe.src = iframe.title;

                    /*if(iframe.src==window.APP_ROOT){
                     iframe.src = iframe.title;
                     }*/

                    this.selectPageId = pageId;
                    //更新tab，选中状态
                    for (var k = 0; k < this.frameHeadList.length; k++) {
                        //html.removeClass(this.frameHeadList[k].tab,"content-title-tab-select")
                        html.removeClass(this.frameHeadList[k].tab, "active");
                        if (this.frameHeadList[k].pageId == pageId) {
                            //html.addClass(this.frameHeadList[k].tab,"content-title-tab-select")
                            html.addClass(this.frameHeadList[k].tab, "active");
                        }
                    }
                    //更新side
                    for (var k = 0; k < this.itemList.length; k++) {
                        html.removeClass(this.itemList[k].label, "jimu-widget-leftpanel-list-item-select")
                        if (this.itemList[k].pageId == pageId) {
                            html.addClass(this.itemList[k].label, "jimu-widget-leftpanel-list-item-select")
                        }
                    }
                },
                frameList: [],
                createFrame: function (item, display) {
                    var iframe = document.createElement("iframe");
                    //Logger.log(item);
                    if (item.pageType != null) {
                        if (item.pageType == 'url' && item.target == "_iframe") {
                            //iframe,并且应该是外部链接
                            var strUrl = item.url;
                            if (strUrl.startWith("http"))
                                iframe.src = item.url;
                            else
                                iframe.src = (display == "block") ? (WEB_ROOT + item.url) : "about:blank";//"http://map.baidu.com/";//
                            iframe.border = "0";
                            iframe.id = item.appId;
                            iframe.frameborder = "0";
                            iframe.title = (WEB_ROOT + item.url);
                            iframe.vspace = "0";
                            iframe.style.frameSpacing = "0";
                            iframe.style.frameBorder = "0";
                            iframe.style.width = "100%";
                            iframe.style.height = "100%";
                            iframe.style.display = display;
                        }
                        else if (item.pageType == 'url') {
                            //jsp，用load的方式加载即可
                            //需要使用load方式加载
                            var g = $("#frames");
                            //g.css("padding-left","15px");
                            //g.css("padding-right","15px");
                            var _url = APP_ROOT + item.url;
                            WaitBar.show(2);
                            //先执行销毁程序
                            sys.DESTROY_EXE();
                            //销毁执行完毕
                            //url参数进数组，供页面取，获取方式：urlUtil.getRequest("name")
                            urlUtil.initUrlPars(_url);
                            g.load(_url, function () {
                                WaitBar.hide(2);
                            });
                        }
                        else if (item.pageType == 'page') {
                            //页面加载
                            iframe.src = (display == "block") ? (this.wrapperHtml + "?currentPageId=" + item.pageId + "&appId=" + APP_ID) : "about:blank";//"http://map.baidu.com/";//
                            iframe.border = "0";
                            iframe.id = item.appId;
                            iframe.frameborder = "0";
                            iframe.title = (this.wrapperHtml + "?currentPageId=" + item.pageId + "&appId=" + APP_ID);
                            iframe.vspace = "0";
                            iframe.style.frameSpacing = "0";
                            iframe.style.frameBorder = "0";
                            iframe.style.width = "100%";
                            iframe.style.height = "100%";
                            iframe.style.display = display;
                        }
                    }
                    /*if(item.target=="_iframe"){
                     iframe.src = (display=="block")?(IP_PORT+"/reportservice/"+item.url):"about:blank";//"http://map.baidu.com/";//
                     iframe.border="0";
                     iframe.id=item.appId;
                     iframe.frameborder="0";
                     iframe.title= (IP_PORT+"/reportservice/"+item.url);
                     iframe.vspace="0";
                     iframe.style.frameSpacing="0";
                     iframe.style.frameBorder="0";
                     iframe.style.width = "100%";
                     iframe.style.height = "100%";
                     iframe.style.display = display;
                     }else if(item.target=="iframe"){//外部的iframe
                     iframe.src = (display=="block")?(item.url):"about:blank";//"http://map.baidu.com/";//
                     iframe.border="0";
                     iframe.id=item.appId;
                     iframe.frameborder="0";
                     iframe.title= (item.url);
                     iframe.vspace="0";
                     iframe.style.frameSpacing="0";
                     iframe.style.frameBorder="0";
                     iframe.style.width = "100%";
                     iframe.style.height = "100%";
                     iframe.style.display = display;
                     }else if(item.pageType=="url"){
                     iframe.src = (display=="block")?("layoutWrapperMin.jsp?currentPageId=" + item.pageId+"&appId="+APP_ID+"&url="+item.url+"&pageType="+item.pageType):"about:blank";//"http://map.baidu.com/";//
                     iframe.border="0";
                     iframe.id=item.appId;
                     iframe.frameborder="0";
                     iframe.title= ("layoutWrapperMin.jsp?currentPageId=" + item.pageId+"&appId="+APP_ID+"&url="+item.url+"&pageType="+item.pageType);
                     iframe.vspace="0";
                     iframe.style.frameSpacing="0";
                     iframe.style.frameBorder="0";
                     iframe.style.width = "100%";
                     iframe.style.height = "100%";
                     iframe.style.display = display;
                     }
                     else{
                     iframe.src = (display=="block")?("layoutWrapperMin.jsp?currentPageId=" + item.pageId+"&appId="+APP_ID):"about:blank";//"http://map.baidu.com/";//
                     iframe.border="0";
                     iframe.id=item.appId;
                     iframe.frameborder="0";
                     iframe.title= ("layoutWrapperMin.jsp?currentPageId=" + item.pageId+"&appId="+APP_ID);
                     iframe.vspace="0";
                     iframe.style.frameSpacing="0";
                     iframe.style.frameBorder="0";
                     iframe.style.width = "100%";
                     iframe.style.height = "100%";
                     iframe.style.display = display;
                     }*/

                    document.getElementById("frames").appendChild(iframe);
                    this.frameList.push({"iframe": iframe, "pageId": item.pageId});
                },
                destroy:function(){
                    this.inherited(arguments);
                }
            });
        return instance;
    });