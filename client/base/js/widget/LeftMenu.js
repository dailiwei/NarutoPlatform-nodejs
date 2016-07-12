/////////////////////////////////////////////////////////////////////////// 
// create by dailiwei 2015-11-17 14:48
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
        "dojo/text!./templates/LeftMenu.html",
        "dojo/text!./css/LeftMenu.css",
        "dojo/parser",
        "dojo/request",
        "./LeftMenuSide",
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
              LeftMenuSide,
              ready) {

        var instance = null;
        ready(function () {
            parser.parse();
        });

        instance = declare("base.widgets.LeftMenu", [_Widget, _TemplatedMixin],
            {
                templateString: template,
                baseClass: 'base-widgets-LeftMenu',
                name: "测试",

                wrapperHtml: "layoutWrapperMin.jsp",
                constructor: function (args) {

                    this.p = args;
                    if (this.p.wrapperHtml) {
                        this.wrapperHtml = this.p.wrapperHtml;
                    }
                    this.setCss(css);

                    this.own(topic.subscribe("menu/select/change", lang.hitch(this, this.changeMenu)));
                    this.own(topic.subscribe("change/content/state", lang.hitch(this, this.changeState)));

                    this.itemList = [];

                },
                windowState: "small",//窗口的状态 "big"
                changeState: function () {
                    if (this.windowState == "small") {
                        html.setStyle(dojo.byId("myMenu"), "display", "none");
                        html.setStyle(dojo.byId("myMenu"), "display", "none");
                        html.setStyle(dojo.byId("header01"), "display", "none");
//						html.setStyle(dojo.byId("header02"),"display","none");
                        html.setStyle(dojo.byId("page-content"), "padding-top", "0"); //90
                        html.setStyle(dojo.byId("page-content"), "height", $(window).height() + "px");
                        html.setStyle(dojo.byId("page-wrapper"), "margin-left", "0"); //80
                        html.setStyle(dojo.byId("frames"), "height", $(window).height() - (this.IsSinge ? 0 : 40) + "px");

                        this.windowState = "big";
                    } else {
                        if (!this.IsSinge) {
                            html.setStyle(dojo.byId("myMenu"), "display", "block");
                            html.setStyle(dojo.byId("myMenu"), "display", "block");
                            html.setStyle(dojo.byId("page-wrapper"), "margin-left", "80" + "px"); //80
                        }

                        html.setStyle(dojo.byId("header01"), "display", "block");
//						html.setStyle(dojo.byId("header02"),"display","block");
                        html.setStyle(dojo.byId("page-content"), "padding-top", "52" + "px"); //90
                        html.setStyle(dojo.byId("page-content"), "height", $(window).height() - 52 + "px");
                        html.setStyle(dojo.byId("frames"), "height", $(window).height() - 52 - (this.IsSinge ? 0 : 40) + "px");
                        this.windowState = "small";
                    }
                },
                postCreate: function () {
                    this.inherited(arguments);
                },

                startup: function () {
                    this.inherited(arguments);
//			        MENU_ID 
                    this.getMenuList(this.p.appId, this.p.menuid);

                    var P = $(window).height();
                    this.HEIGHT = P - 52;  //菜单的最多高度

                    //设置iframe的高度
                    html.setStyle(dojo.byId("frames"), "height", (this.HEIGHT - 40) + "px");

//					this.createFirstMenu(this.data);
//					
//					//看看是不是从这边弄出来
//					this.side = new LeftMenuSide(this.data);
//					var container = dojo.byId("page-content"); 
//			        domConstruct.place(this.side.domNode,container);
//			        this.side.startup();
//			        this.side._resizeToMinFast(); 

//			        window.closeSide = lang.hitch(this,function(){
//			        	if(this.isShow){
//			        		this.side._resizeToMin();
//			        		 //超过长度显示滑标
//					        if(this.currentHeight>this.HEIGHT){
//					        	html.setStyle(this.upArrow,"display","none");
//					        	html.setStyle(this.downArrow,"display","none");
//					        }
//							this.isShow = false;
//			        	} 
//			        }); 
                    window.closeSide = lang.hitch(this, function () {
                        if (this.isShow) {
                            //超过长度显示滑标
                            if (this.currentHeight > this.HEIGHT) {
                                html.setStyle(this.upArrow, "display", "none");
                                html.setStyle(this.downArrow, "display", "none");
                            }
                            this.isShow = false;
                        }
                    });
                    //mouseover
                    this.own(on(window, "click", lang.hitch(this, function (e) {
                        window.closeSide();
                    })));
                    //mouseover
                    this.own(on(this.domNode, "mouseover", lang.hitch(this, function (e) {

                        if (!this.isShow) {
//							this.side._resizeToMax();
                            //超过长度显示滑标
                            if (this.currentHeight > this.HEIGHT) {
                                html.setStyle(this.upArrow, "display", "block");
                                html.setStyle(this.downArrow, "display", "block");
                            }
                            this.isShow = true;
                        }
                    })));
                    //mouseover
                    this.own(on(this.domNode, "mouseover", lang.hitch(this, function (e) {

                        if (!this.isShow) {
                            //超过长度显示滑标
                            if (this.currentHeight > this.HEIGHT) {
                                html.setStyle(this.upArrow, "display", "block");
                                html.setStyle(this.downArrow, "display", "block");
                            }
                            this.isShow = true;
                        }

                    })));

                    window.onresize = lang.hitch(this, function () {
                        //设置iframe的高度
                        var P = $(window).height();
                        this.HEIGHT = P - 52;  //菜单的最多高度
                        html.setStyle(dojo.byId("frames"), "height", (this.HEIGHT - (this.IsSinge ? 0 : 40)) + "px");
                    });

                },
                isShow: false,
                getMenuList: function (appId, menuId) {
                    request.get(window.APP_ROOT + "base/api/cfg/app/" + appId + "/page/" + menuId + "/jsonTree", {
                        handleAs: "json"
                    }).then(lang.hitch(this, function (json) {
                        if (json && json.success) {
                            if (json.data.children && json.data.children.length > 0) {
                                html.setStyle(dojo.byId("myMenu"), "display", "block");
                                this.createFirstMenu(json.data.children);
                                //创建侧边的
                                this.side = new LeftMenuSide(json.data.children);
                                this.side.wrapperHtml = this.wrapperHtml;
                                var container = dojo.byId("page-content");
                                domConstruct.place(this.side.domNode, container);
                                this.side.startup();
                                this.side._resizeToMinFast();
                            } else {
                                html.setStyle(dojo.byId("myMenu"), "display", "none");
                                //当前就是单页面的
                                this.addSingelPage(json.data);
                                this.IsSinge = true;
                            }
                        }
                    }));
                },
                addSingelPage: function (item) { 

                    html.setStyle(dojo.byId("myMenu"), "display", "none");
                    html.setStyle(dojo.byId("myMenu"), "display", "none");
                    html.setStyle(dojo.byId("page-wrapper"), "margin-left", "0"); //80
                    if (item.target=="_blank") {
                        window.open(item.url, '_blank');
                        return;
                    } 

                    var iframe = document.createElement("iframe");
                    var display = "block";
                    if (item.pageType == "url") {
                        iframe.src = (display == "block") ? (this.wrapperHtml + "?currentPageId=" + item.pageId + "&appId=" + APP_ID + "&url=" + item.url + "&pageType=" + item.pageType) : "about:blank";//"http://map.baidu.com/";//
                        iframe.border = "0";
                        iframe.id = item.appId;
                        iframe.frameborder = "0";
                        iframe.title = (this.wrapperHtml + "?currentPageId=" + item.pageId + "&appId=" + APP_ID + "&url=" + item.url + "&pageType=" + item.pageType);
                        iframe.vspace = "0";
                        iframe.style.frameSpacing = "0";
                        iframe.style.frameBorder = "0";
                        iframe.style.width = "100%";
                        iframe.style.height = "100%";
                        iframe.style.display = display;
                    }
                    else {

                        iframe.src = (display == "block") ? (this.wrapperHtml + "?currentPageId=" + item.pageId + "&appId=" + APP_ID) : "";//"http://map.baidu.com/";//
                        iframe.border = "0";
                        iframe.frameborder = "0";
                        iframe.title = (this.wrapperHtml + "?currentPageId=" + item.pageId + "&appId=" + APP_ID);
                        iframe.vspace = "0";
                        iframe.style.frameSpacing = "0";
                        iframe.style.frameBorder = "0";
                        iframe.style.width = "100%";
                        iframe.style.height = "100%";
                        iframe.style.display = display;

                    }
                    html.setStyle(dojo.byId("frameHeader"), "display", "none");
                    html.setStyle(dojo.byId("frames"), "height", $(window).height() - 52 + "px");
                    document.getElementById("frames").appendChild(iframe);

                },
                createFirstMenu: function (list) {
                    for (var i = 0; i < list.length; i++) {
                        var item = list[i];
                        this.createList(item, i);
                    }
                },
                itemList: [],
                currentHeight: 0,
                createList: function (item, index) {

                    var itemDiv = domConstruct.create("div");
                    domClass.add(itemDiv, "jimu-widget-leftpanel-list-item");

                    var imgNodeUrl = item.menuLogo;
                    //判断大法，需要判断是css还是img分别进行显示
                    if (imgNodeUrl && imgNodeUrl.startWith('class:')) {
                        //是图标
                        var label = html.create('i', {
                            'class': imgNodeUrl.replace('class:', '')
                        }, itemDiv);
                        if (index == 0) {//默认是第一个
                            html.addClass(itemDiv, 'jimu-widget-leftpanel-list-item-select');
                        }
                        domConstruct.place(itemDiv, this.leftpanelDiv);
                    }
                    else {
                        var ay;
                        if (item.menuLogo) {
                            ay = item.menuLogo.split("/");
                        } else {
                            ay = "base/images/menu/logos/diaoduyunxing/covering.png".split("/");
                        }

                        var name = ay[ay.length - 2] + "/" + ay[ay.length - 1];
                        name = name.replace(".png", "");
                        if (index == 0) {//默认是第一个
                            html.addClass(itemDiv, 'jimu-widget-leftpanel-list-item-select');
                            imgNodeUrl = "base/images/menu/logos/" + name + "-selected.png";
                            //可以派发个事件，说第一个选中了的
//		                    topic.publish("openSelectTab",widget);
                        }

                        domConstruct.place(itemDiv, this.leftpanelDiv);

                        var itemImgDiv = domConstruct.create("div");
                        html.addClass(itemImgDiv, 'jimu-widget-leftpanel-list-item-imgDiv');
                        var imgNodeBgUrl;
                        if (index == 0) {
                            imgNodeBgUrl = "base/images/menu/logos/round-blue.png"
                        } else {
                            imgNodeBgUrl = "base/images/menu/logos/round-white.png"
                        }
                        var imgNodeBg = html.create('img', {
                            src: imgNodeBgUrl, style: {
                                width: '48px', height: '48px'
                            }
                        }, itemImgDiv);

                        var imgNode = html.create('img', {
                            src: imgNodeUrl, style: {
                                width: '32px', height: '32px', margin: '8px'
                            }
                        }, itemImgDiv);
                        domConstruct.place(itemImgDiv, itemDiv);
                    }


                    var label = html.create('div', {
                        'class': 'content-title',
                        innerHTML: item.pageNm
                    }, itemDiv);

                    this.own(on(itemDiv, 'click', lang.hitch(this, function (e) {
                        this.setSelectWidget(item);
                        this.side.selectTitle(item.pageId);
                        window.closeSide();
                        dojo.stopEvent(e);
                    })));

                    this.itemList.push({
                        pageId: item.pageId,
                        div: itemDiv,
                        imageBg: imgNodeBg,
                        image: imgNode,
                        icon: name
                    });

                    this.currentHeight += 110;
                },
                setSelectWidget: function (item) {
                    for (var i = 0; i < this.itemList.length; i++) {
                        if (item.pageId == this.itemList[i].pageId) {
                            html.addClass(this.itemList[i].div, 'jimu-widget-leftpanel-list-item-select');
                            try{
                            	this.itemList[i].image.src = "base/images/menu/logos/"+this.itemList[i].icon+"-selected.png";
                                this.itemList[i].imageBg.src = "base/images/menu/logos/round-blue.png";
                            }catch(e){ 
                            }  
                        } else {
                            html.removeClass(this.itemList[i].div, 'jimu-widget-leftpanel-list-item-select');
                            try{
                            	this.itemList[i].image.src = "base/images/menu/logos/"+this.itemList[i].icon+".png";
                                this.itemList[i].imageBg.src = "base/images/menu/logos/round-white.png";
                            }catch(e){ 
                            }  
                        }
                    }
                }
                ,
                changeMenu: function (item) {
                    this.setSelectWidget(item);
                },
                /**
                 * 下面是一些基础函数，解决mouseover与mouserout事件不停切换的问题（问题不是由冒泡产生的）
                 */
                checkHover: function (e, target) {
                    if (this.getEvent(e).type == "mouseover") {
                        return !this.contains(target, this.getEvent(e).relatedTarget
                            || this.getEvent(e).fromElement)
                            && !((this.getEvent(e).relatedTarget || this.getEvent(e).fromElement) === target);
                    } else {
                        return !this.contains(target, this.getEvent(e).relatedTarget
                            || this.getEvent(e).toElement)
                            && !((this.getEvent(e).relatedTarget || this.getEvent(e).toElement) === target);
                    }
                },

                contains: function (parentNode, childNode) {
                    if (parentNode.contains) {
                        return parentNode != childNode && parentNode.contains(childNode);
                    } else {
                        return !!(parentNode.compareDocumentPosition(childNode) & 16);
                    }
                },
                //取得当前window对象的事件
                getEvent: function (e) {
                    return e || window.event;
                }
                ,
                downScroll: function (e) {
//	            	Logger.log(this.leftpanelDiv);//.scrollTop+=100;
                    this.startmarquee(100, 2, 20);
                    dojo.stopEvent(e);
                },
                upScroll: function (e) {
//	            	this.leftpanelDiv.scrollTop-=100;
                    this.startmarqueeUp(100, 2, 20);
                    dojo.stopEvent(e);
                },
                startmarquee: function (lh, speed, delay) {
                    var t;
                    var oHeight = this.HEIGHT;
                    /** div的高度 **/
                    　
	                var p = false;
                    var o = this.leftpanelDiv;
                    var preTop = 0;

                    setTimeout(lang.hitch(this, function () {
                        t = setInterval(lang.hitch(this, function () {
                            if (o.scrollTop % lh != 0
                                && o.scrollTop % (o.scrollHeight - oHeight - 1) != 0) {
                                preTop = o.scrollTop;
                                o.scrollTop += 1;
                                if (preTop >= o.scrollHeight || preTop == o.scrollTop) {
                                    clearInterval(t);
                                    return;
                                }
                            } else {
                                clearInterval(t);
                                setTimeout(lang.hitch(this, function () {
                                    t = setInterval(scrolling, speed);
                                    o.scrollTop += 1;
                                }), delay);
                            }
                        }), speed);
                        o.scrollTop += 1;
                    }), delay);
                },
                startmarqueeUp: function (lh, speed, delay) {
                    var t;
                    var oHeight = this.HEIGHT;
                    /** div的高度 **/
                    　
	                var p = false;
                    var o = this.leftpanelDiv;
                    var preTop = 0;

                    setTimeout(lang.hitch(this, function () {
                        t = setInterval(lang.hitch(this, function () {
                            if (o.scrollTop % lh != 0
                                && o.scrollTop % (o.scrollHeight + oHeight - 1) != 0) {
                                preTop = o.scrollTop;
                                o.scrollTop -= 1;
                                if (preTop >= o.scrollHeight || preTop == o.scrollTop) {
                                    clearInterval(t);
                                    return;
                                }
                            } else {
                                clearInterval(t);
                                setTimeout(lang.hitch(this, function () {
                                    t = setInterval(scrolling, speed);
                                    o.scrollTop -= 1;
                                }), delay);
                            }
                        }), speed);
                        o.scrollTop -= 1;
                    }), delay);
                },
                destroy: function () {
                    if( this.side){
                        this.side.destroy();
                    }

                    this.inherited(arguments);
                }
            });
        return instance;
    });