/////////////////////////////////////////////////////////////////////////// 
// create by dailiwei 2016-04-20 14:18
///////////////////////////////////////////////////////////////////////////
define(
    [
        "dojo/_base/declare",
        "dojo/_base/lang",
        'dojo/_base/html',
        'dojo/query',
        'dojo/on',
        "dojo/dom-construct",
        'dojo/topic',
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "base/_BaseWidget",
        "dojo/text!./templates/Header.html",
        "dojo/text!./css/Header.css"
    ],
    function (declare,
              lang,
              html,
              query,
              on,
              domConstruct,
              topic,
              _TemplatedMixin,
              _WidgetsInTemplateMixin,
              _Widget,
              template,
              css) {

        var instance = declare("base.widgets.Header", [_Widget, _TemplatedMixin],
            {
                templateString: template,
                baseClass: "",
                win: {},
                menus: [],
                currentMenu: null,
                pageMaps: {},
                isHtml:false,
                constructor: function (args) {

                    this.setCss(css);
                    this.win = window;

                    this.menus = [];
                    this.currentMenu = null;
                    this.pageMaps = {};
                },
                postCreate: function () {
                    this.inherited(arguments);

                    this.app_name.innerHTML = this.appInfo.appNm;
                    this.parsePages();
                    this.initEvent();
                },

                initEvent: function () {
                    this.own(topic.subscribe("/rich/base/index/changePage", lang.hitch(this, function (message) {
                        if (message) {

                        }
                    })));

                    //dojo.publish("/rich/base/index/changePage", {"target":"url","url":"module/pubMsg/pubMsgList.jsp"});

                    //topic.publish("/rich/base/index/changePage", {
                    //    "pageId": this.currentPage.page_id
                    //});
                },

                parsePages: function () {

                    var list = this.pages;//第一级别的菜单
                    for (var i = 0, max = list.length; i < max; i++) {
                        this.pageMaps[list[i].pageId] = list[i];
                    }

                    //设置当前的菜单ID
                    if(window.MENU_ID){
                        window.MENU_ID = window.MENU_ID;
                    }else{
                        window.MENU_ID = this.pages[0].pageId
                    }

                },

                startup: function () {
                    this.inherited(arguments);

                    this.createSide();

                    this.createMenus();
                },
                createMenus: function () {

                    //循环创建菜单
                    var list = this.pages;//第一级别的菜单
                    var paddingStyle = "padding:15px 15px;min-width: 75px;text-align: center;"; 
                    if(list.length>7&&list.length<10){
                    	 paddingStyle = "padding:15px 5px;min-width: 75px;text-align: center;";
                    }else if(list.length>10){
                    	 paddingStyle = "padding:15px 5px;font-size:14px; font-weight:normal;min-width: 75px;text-align: center;";
                    }
                    for (var i = 0, max = list.length; i < max; i++) {

                        var item = list[i];

                        var li = html.create('li', {
                            'class': ""
                        }, this.navLinks);
                        var a = html.create('a', {
                            "style":paddingStyle ,
                            "innerHTML": item.pageNm
                        }, li);
                        this.own(on(li, 'click', lang.hitch(this, lang.partial(function (pageId, e) {
                            var page = this.pageMaps[pageId];
                            console.log(page);
                            //topic.publish("rich/change/menu", pageId);

                            if (page.target == "_blank") {
                                var url = page.url;
                                if (url.indexOf("IP_PORT") > -1) {
                                    url = url.replace("IP_PORT", "");
                                    url = IP_PORT + url;
                                    window.open(url, "_blank");
                                    return true;
                                } else {
                                    window.open(url, "_blank");
                                    return true;
                                }
                            } else {
                                var baseUrl = window.location.href.split("?")[0];
                                location.href=baseUrl+"?appId="+APP_ID+"&menuid="+pageId;
                                //判断下类型，是不是弹出的，如果是不加激活的class
                                html.removeClass(this.currentMenu, "active");
                                html.addClass(e.currentTarget, "active");
                                this.currentMenu = e.currentTarget;
                            }

                        }, item.pageId))));

                        this.menus.push({li: li, a: item});

                        //判断那个菜单默认是选中的
                        if(item.pageId == window.MENU_ID){
                            this.currentMenu = li;
                            html.addClass(li, "active");
                        }
                    }

                },
                createSide: function () {
                    //动态加载side
                    require(["base/widget/LeftMenu"], lang.hitch(this, function (siderClass) {

                        this.sider = new siderClass({
                            appId: APP_ID,
                            menuid: window.MENU_ID,
                            wrapperHtml: this.isHtml?"base/layoutWrapperMin.html":"layoutWrapperMin.jsp",
                            //wrapperHtml: "layoutWrapperMin.jsp",
                            pages:this.pageMaps[window.MENU_ID].children?this.pageMaps[window.MENU_ID].children:[]
                            	
                        });
                        domConstruct.place(this.sider.domNode, dojo.byId("myMenu"));
                        this.sider.startup();
                        topic.subscribe("rich/change/menu",lang.hitch(this,function(menuId){

                        }))
                    }));
                },
                mouseOverHandler:function(e){
//                	html.addClass(e.currentTarget,"animated pulse");
                	
                	  var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
                      $(e.currentTarget).addClass('animated ' + 'pulse').one(animationEnd, function() {
                          $(this).removeClass('animated ' + 'pulse');
                      });
                      
                },
                mouseOutHandler:function(e){
                	html.removeClass(e.currentTarget,"animated pulse");
                }
            });
        return instance;
    });