/**
 * Created by richway on 2015/6/3.
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/_base/html",
    "dojo/dom",
    "dojo/_base/xhr",
    "dojo/topic",
    "dojo/text!../template/TabPanel.html",
    "dojo/text!../css/TabPanel.css",
    "base/_BaseWidget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/layout/ContentPane",
    "dojo/parser",
    "dojo/ready",
    "base/Library",
    "dojo/Deferred",
    'dojo/_base/fx',
    'dojo/on',
    'dojo/query',
    'rdijit/utils',
    'dojo/mouse',
    'dojo/fx'

],function(
    declare,
    lang,
    array,
    domConstruct,
    domStyle,
    html,
    dom,
    xhr,
    topic,
    template,
    css,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    ContentPane,
    parser,
    ready,
    Library,
    Deferred,
    baseFx,
    on,
    query,
    utils,
    mouse,
    fx
){

    return declare("base.layout.FloatLayout", [_WidgetBase, _TemplatedMixin], {
        templateString:template,
        'baseClass':'jimu-widget-sidebar-controller',
        _library: null,

        maxWidth: 405,
        minWidth: 15,
        animTime: 200,

        tabs:null,
        moreTab: false,
        constructor:function(args){
            lang.mixin(this,args);

            //this.setCss(css);

            this._library = new Library();

            this.tabs = [];
        },

        postCreate:function() {
            this.inherited(arguments);
        },
        startup: function(){
            this.inherited(arguments);

            this.initEvents();

            //默认缩小不打开
            this._doResize();
        },
        //初始化一些事件
        initEvents:function(){
            topic.subscribe("base/layout/tabPanel/openSelectTab", lang.hitch(this, this.openSelectTab));
        },

        widgets:[],
        openSelectTab:function (widget){
            //判断是否已经存在了
            var isHas = false;
            for(var k =0;k<this.widgets.length;k++){
                if(this.widgets[k].id==widget.id){
                    isHas = true;
                    break;
                }
            }
            if(!isHas){
                //如果不存在那么就添加上
                this.widgets.push(widget);
            }

            var index =null;
            for(var i=0;i<this.tabs.length;i++){
                if(this.tabs[i].config.id==widget.id)
                {
                    index = i;
                    break;
                }
            }
            if(index==null){

                this.createTab(widget);

                for(var i=0;i<this.tabs.length;i++){
                    if(this.tabs[i].config.id==widget.id)
                    {
                        index = i;
                        break;
                    }
                }
            }

            this.selectTab(index);

            if(this.windowState === 'minimized'){
                this._doResize();
            }
        },
        hasMoreTab:false,
        widgets_bak_sub:[],
        createTab: function(g,other) {

            var spliceNum = 3;//默认显示个数，这里进行控制
            if (this.widgets.length <= spliceNum) {
                this.moreTab = false;
            } else {
                this.moreTab = true;
            }
            var tab;
            if (this.moreTab&&!other) {

                //新加的先创建出来
                //把最后的新添加的放到第一个
                this.widgets.reverse();
                //删除第一个的tab
                var index = 0;
                domConstruct.destroy(this.tabs[index].title);
                //domConstruct.destroy(this.tabs[index].content);
                this.tabs.splice(index,1);

                var contentNode = this._createContentNode(g);
                tab = {
                    title: this._createTitleNode(g),
                    content: contentNode,
                    contentPane: query('.content-pane', contentNode)[0],
                    config: g,
                    selected: false,
                    flag: g.flag,
                    moreGroupWidgets: [],
                    panels: []
                };
                this.tabs.splice(0, 0,tab);//插入到第一个
                ////再显示第一个的
                //if(this.tabs.length>0) {
                //  this.selectTab(0);//默认显示第一个出来
                //}

                /////////////////////////////////////////
                var widgets_bak = lang.clone(this.widgets);
                //创建more按钮
                if(this.hasMoreTab){
                    for(var kk=0;kk<this.tabs.length;kk++){
                        if(this.tabs[kk].flag=="more"){
                            domConstruct.destroy(this.tabs[kk].title);
                            //domConstruct.destroy(this.tabs[kk].content);
                            this.tabs.splice(kk,1);
                            break;
                        }
                    }
                }

                {
                    this.widgets_bak_sub=[];
                    for(var h=0;h<widgets_bak.length;h++){
                        var isHavethis = false;
                        for(var g=0;g<this.tabs.length;g++){

                            if(widgets_bak[h].id==this.tabs[g].config.id){
                                isHavethis = true;
                                break;
                            }
                        }
                        if(!isHavethis){
                            this.widgets_bak_sub.push(widgets_bak[h]);
                        }
                    }
                    g = {
                        label: '点击查看更多~',
                        flag: 'more',
                        icon: 'xx',
                        groups:   this.widgets_bak_sub
                    };

                    var contentNode = this._createContentNode(g);
                    tab = {
                        title: this._createTitleNode(g),
                        content: contentNode,
                        contentPane: query('.content-pane', contentNode)[0],
                        config: g,
                        selected: false,
                        flag: g.flag,
                        moreGroupWidgets: [],
                        panels: []
                    };
                    this.tabs.push(tab);
                    this.hasMoreTab = true;
                }
            }
            else{

                if(this.hasMoreTab&&this.widgets.length==3){
                    domConstruct.destroy(this.tabs[this.tabs.length-1].title);
                    this.tabs.splice(this.tabs.length-1,1);
                    this.hasMoreTab = false;
                }
                else if(this.hasMoreTab&&this.widgets.length>3)
                {
                    var contentNode = this._createContentNode(g);
                    tab = {
                        title: this._createTitleNode(g),
                        content: contentNode,
                        contentPane: query('.content-pane', contentNode)[0],
                        config: g,
                        selected: false,
                        flag: g.flag,
                        moreGroupWidgets: [],
                        panels: []
                    };
                    this.tabs.push(tab);

                    for(var kk=0;kk<this.tabs.length;kk++){
                        if(this.tabs[kk].flag=="more"){
                            domConstruct.destroy(this.tabs[kk].title);
                            this.tabs.splice(kk,1);

                            g = {
                                label: '+',
                                flag: 'more',
                                icon: 'xx',
                                groups:   this.widgets_bak_sub
                            };

                            var contentNode = this._createContentNode(g);
                            tab = {
                                title: this._createTitleNode(g),
                                content: contentNode,
                                contentPane: query('.content-pane', contentNode)[0],
                                config: g,
                                selected: false,
                                flag: g.flag,
                                moreGroupWidgets: [],
                                panels: []
                            };
                            this.tabs.push(tab);
                            this.hasMoreTab = true;

                            return tab;
                            break;
                        }
                    }
                }

                var contentNode = this._createContentNode(g);
                tab = {
                    title: this._createTitleNode(g),
                    content: contentNode,
                    contentPane: query('.content-pane', contentNode)[0],
                    config: g,
                    selected: false,
                    flag: g.flag,
                    moreGroupWidgets: [],
                    panels: []
                };
                this.tabs.push(tab);
            }

            return tab;
        },
        getSelectedIndex: function() {
            var i = 0;
            for (i = 0; i < this.tabs.length; i++) {
                if (this.tabs[i].selected) {
                    return i;
                }
            }
            return -1;
        },
        selectTab: function(index) {
            var color;
            topic.publish("setSelectWidget",this.tabs[index].config);

            if (this.tabs[index].selected && this.tabs[index].flag !== 'more') {

                return;
            }
            if (this.tabs[this.getSelectedIndex()] === undefined ||
                this.tabs[this.getSelectedIndex()].flag !== 'more') {
                this.lastSelectedIndex = this.getSelectedIndex();
            }

            //switch widget and tab state
            array.forEach(this.tabs, function(tab, i) {
                if (index === i) {
                    tab.selected = true;
                    query('.content-title', this.tabs[i].title).addClass('content-title-select');

                } else {
                    if (tab.selected) {
                        tab.selected = false;
                    }
                    query('.content-title', this.tabs[i].title).removeClass('content-title-select');

                }
            }, this);

            if (this.tabs[index].flag === 'more') {
                this.showMoreTabContent(this.tabs[index]);
            } else {
                query('.content-node', this.domNode).style({
                    display: 'none'
                });
                query(this.tabs[index].content).style({
                    display: 'block'
                });

                if (query('.jimu-wc-tpc', this.tabs[index].content).length === 0) {
                    this.showTabContent(this.tabs[index]);
                }
            }
            this.resize();
        },
        showMoreTabContent: function(tab) {
            var groups = tab.config.groups,
                anim;
            query(this.otherGroupNode).empty();
            this._createOtherGroupPaneTitle();
            array.forEach(groups, function(group) {
                this._createMoreGroupNode(group);
            }, this);

            var dd = query(this.maxStateNode)[0];
            dd.animateProperty({
                properties: {
                    left: this.minWidth - this.maxWidth,
                    right: this.maxWidth - this.minWidth
                },
                duration: this.animTime
            });

            anim = fx.combine([
                query(this.maxStateNode).animateProperty({
                    properties: {
                        left: this.minWidth - this.maxWidth,
                        right: this.maxWidth - this.minWidth
                    },
                    duration: this.animTime
                }),
                query(this.otherGroupNode).animateProperty({
                    properties: {
                        left: this.minWidth,
                        right: 5
                    },
                    duration: this.animTime
                })
            ]);
            anim.play();
            this.moreTabOpened = true;
        },
        _createMoreGroupNode: function(group) {
            var node = html.create('div', {
                    'class': 'other-group'
                }, this.otherGroupNode),
                arrowNode;
            html.create('img', {
                src: group.icon,
                'class': 'other-group-icon'
            }, node);
            html.create('div', {
                'class': 'other-group-title',
                innerHTML: group.label
            }, node);
            arrowNode = html.create('img', {
                'class': 'other-group-choose',
                style: {
                    opacity: 0
                },
                src: this.folderUrl + 'images/arrow_choose.png'
            }, node);
            this.own(on(node, 'click', lang.hitch(this, this._onOtherGroupClick, group)));
            this.own(on(node, 'mousedown', lang.hitch(this, function() {
                query(node).addClass('jimu-state-active');
            })));
            this.own(on(node, 'mouseup', lang.hitch(this, function() {
                query(node).removeClass('jimu-state-active');
            })));
            this.own(on(node, mouse.enter, lang.hitch(this, function() {
                query(arrowNode).style({
                    opacity: 1
                });
            })));
            this.own(on(node, mouse.leave, lang.hitch(this, function() {
                query(arrowNode).style({
                    opacity: 0
                });
            })));
            return node;
        },
        _onOtherGroupClick: function(group) {

            this._hideOtherGroupPane();
            this.openSelectTab(group);

        },
        _hideOtherGroupPane: function() {
            fx.combine([
                query(this.maxStateNode).animateProperty({
                    properties: {
                        left: 0,
                        right: 5
                    }
                }),
                query(this.otherGroupNode).animateProperty({
                    properties: {
                        left: this.maxWidth,
                        right: 5 - this.maxWidth
                    }
                })
            ]).play();

            this.moreTabOpened = false;
            var lastTab = this.tabs[this.getSelectedIndex()];
            if (lastTab && lastTab.flag === 'more') {
                this._hideIndicator(this.getSelectedIndex());
            }
        },
        _hideIndicator: function(index) {
            this._getIndicatorNodeByIndex(index).animateProperty({
                properties: {
                    width: 0
                },
                duration: this.animTime,
                auto: true
            });
        },
        _getTitleNodeByIndex: function(index) {
            var titleNode, contextNode;
            if (this.windowState === 'maximized') {
                contextNode = this.maxStateNode;
            } else {
                //contextNode = this.minStateNode;
            }
            titleNode = query('.title-node:nth-child(' + (index + 1) + ')', contextNode);
            return titleNode;
        },
        _getIndicatorNodeByIndex: function(index) {
            return query('.tab-indicator', this._getTitleNodeByIndex(index)[0]);
        },
        _createOtherGroupPaneTitle: function() {
            var node = html.create('div', {
                    'class': 'other-group-pane-title'
                }, this.otherGroupNode),
                closeNode;
            html.create('div', {
                'class': 'bg'
            }, node);
            html.create('div', {
                'class': 'text',
                innerHTML: '其他'
            }, node);
            closeNode = html.create('div', {
                'class': 'close'
            }, node);
            this.own(on(closeNode, 'click', lang.hitch(this, function() {
                this._hideOtherGroupPane();
                if (this.lastSelectedIndex !== -1) {
                    this.selectTab(this.lastSelectedIndex);
                }
            })));
            return node;
        },
        //can't show more tab
        showTabContent: function(tab) {
            var g = tab.config;
            this.showGroupContent(g, tab);

            this.currentTab = tab;
        },
        showGroupContent: function(g, tab) {
            var groupPane;
            if (g.widgets && g.widgets.length > 1) {
                query('.content-title', tab.content).text(g.i18nLabel);
            }

            //这里要整改
            this.showPanel(g).then(lang.hitch(this, function(panel) {
                var tabPane_domNode = panel;
                //query(panel.domNode).style(utils.getPositionStyle({
                //    left: 0,
                //    right: 0,
                //    top: 0,
                //    bottom: 0
                //}));
                if (tab.flag === 'more') {
                    groupPane = query('.more-group-pane[label="' + g.label + '"]', tab.contentPane);
                    groupPane.append(tabPane_domNode);
                } else {

                    //var ata =      query(tab.contentPane);
                    //query(tab.contentPane).append(tabPane.domNode);

                    domConstruct.place( tabPane_domNode, tab.contentPane);
                    tabPane_domNode.style.display="block";
                    Logger.log(tabPane_domNode.toString());
                }

                if (array.indexOf(tab.panels, panel) === -1) {
                    tab.panels.push(panel);
                }
                tab.panel = panel;
            }));
        },

        showPanel:function(widgetConfig){
            var deffer  =  new Deferred();

            //先判断有没有
            var isHas = false;

            if(this.widgetMap.hasOwnProperty(widgetConfig.id)){
                isHas = true;
            }

            if(isHas){

                deffer.resolve(this.widgetMap[widgetConfig.id]);

            }else{
                widgetConfig.path = {};

                if(widgetConfig.pathName && widgetConfig.pathLocation){
                    widgetConfig.path[widgetConfig.pathName] = widgetConfig.pathLocation;
                }else{
                    var pathIdx = widgetConfig.module.indexOf('/');
                    var pathName = widgetConfig.module.substr(0, pathIdx);
                    //lookup in dojo config
                    var dojoConfigPkgList = dojoConfig.packages;
                    for(var idx=0; idx<dojoConfigPkgList.length; idx++){
                        if(dojoConfigPkgList[idx].name === pathName){
                            pathLocation = dojoConfigPkgList[idx].location;
                            widgetConfig.path[pathName] = pathLocation;
                            widgetConfig.pathName=pathName;
                            widgetConfig.pathLocation=pathLocation;
                        }
                    }
                }

                this._library.loadWidget(widgetConfig.pathName, widgetConfig.pathLocation, widgetConfig.module).then(lang.hitch(this, function(WidgetModule){
                        var widget = new WidgetModule({parameters:widgetConfig});

                        domConstruct.place( widget.domNode, "main");

                        if(widget.startup){
                            widget.startup();
                        }
                        if(widget.resize){
                            widget.resize();
                        }
                        this.widgetMap[widgetConfig.id] = widget.domNode;
                        deffer.resolve(widget.domNode);
                    }),
                    lang.hitch(this, function(error){
                        Logger.log("002"+error);
                    })
                );
            }



            return deffer;
        },
        widgetMap:{},
        resize: function(){
            //array.forEach(this.tabs, function(tab) {
            //    if (!tab.selected) {
            //        return;
            //    }
            //    if (tab.panel) {
            //        tab.panel.resize();
            //    }
            //}, this);
        },
        _createContentNode: function(config) {
            var node = html.create('div', {
                id:config.id,
                'class': 'content-node'
            }, this.contentListNode);

            //这个节点承载widget
            html.create('div', {
                'class': 'content-pane'
            }, node);

            this.own(on(node, 'click', lang.hitch(this, function() {
                if (this.moreTabOpened) {
                    this._hideOtherGroupPane();
                    if (this.lastSelectedIndex !== -1) {
                        this.selectTab(this.lastSelectedIndex);
                    }
                }
            })));
            return node;
        },
        _createTitleNode: function(config) {
            /*jshint unused:false*/
            var title = config.i18nLabel,
                iconUrl = config.icon;
            var classNode = (iconUrl=="xx"?'title-node-more':'title-node');
            var  node = html.create('div', {
                title: title,
                'class': classNode,
                'settingid': config.id,
                'id': config.id,
                i: this.tabs.length
            }, this.titleListNode);

            if(iconUrl=="xx"){//更多的那个图标
                label = html.create('div', {
                    'class': 'content-title-more'
                }, node);
            }else{
                var imgNode = html.create('img', {
                    id:config.id,
                    src: APP_ROOT+"base/images/common/close.png"
                }, node);

                this.own(on(imgNode, 'click', lang.hitch(this, this.closeByImg)));
                label = html.create('div', {

                    'class': 'content-title',
                    innerHTML: title
                }, node);
            }



            this.own(on(node, 'click', lang.hitch(this, this.onSelect)));

            //这里可以做些扩展
            //this.own(on(node, mouse.enter, lang.hitch(this, this._onMouseEnter)));
            //this.own(on(node, mouse.leave, lang.hitch(this, this._onMouseLeave)));

            //this.own(on(minNode, 'click', lang.hitch(this, this._onMinIconClick, minNode)));
            //this.own(on(minNode, mouse.enter, lang.hitch(this, this._onMouseEnter)));
            //this.own(on(minNode, mouse.leave, lang.hitch(this, this._onMouseLeave)));
            return node;
        },
        closeByImg:function(evt){
            var node = evt.currentTarget;

            Logger.log(node.id);
            //先删除，
            var index;
            for(var i=0;i<this.tabs.length;i++){
                if(this.tabs[i].config.id==node.id)
                {
                    index = i;
                    break;
                }
            }

            domConstruct.destroy(this.tabs[index].title);
            //domConstruct.destroy(this.tabs[index].content);

            this.tabs.splice(index,1);
            //删除 widget
            for(var k =0;k<this.widgets.length;k++){
                if(this.widgets[k].id==node.id){
                    this.widgets.splice(k,1);
                }
            }

            //再显示第一个的
            if(this.widgets.length>0&&this.widgets.length<=2){
                this.selectTab(0);//默认显示第一个出来
            }else if(this.widgets.length>=3){
                var widget = this.widgets_bak_sub.pop();//得到第一个

                this.createTab(widget,true);
                var index =null;
                for(var i=0;i<this.tabs.length;i++){
                    if(this.tabs[i].config.id==widget.id)
                    {
                        index = i;
                        break;
                    }
                }

                this.selectTab(index);

            }
            else{
                //关闭面板
                //this.widgetManager.minimizeWidget(this);
                topic.publish("setSelectWidget",{id:"都关闭"});

            }

            evt.stopPropagation();
        },

        onSelect: function(evt) {
            var node = evt.currentTarget;
            var id = node.id;
            var index =3;
            for(var i=0;i<this.tabs.length;i++){
                if(this.tabs[i].config.id==id)
                {
                    index = i;
                    break;
                }
            }
            this.selectTab(index);
        },
        windowState:"maximized",
        _doResize: function() {
            if (this.windowState === 'maximized') {
                this._resizeToMin();
                this.windowState = "minimized";
            } else {
                if(this.tabs.length==0)return;
                this._resizeToMax();
                this.windowState = "maximized";
            }
        },
        _resizeToMin: function() {
            //这块加个动画效果
            this.doDnimate(this.domNode,{  width: {start: this.maxWidth, end: this.minWidth} },500);
            this.doDnimate(this.maxStateNode, {  opacity: {start: 1, end: 0}  },400);

            //topic.publish('changeMapPosition', {
            //    right: 0//以前是left
            //});

            //this.stateNode = this.minStateNode;

            topic.publish('base/layout/floatLayout/panelBottomContainer/size', {
                left: 1//以前是left
            });
        },
        _resizeToMax: function() {

            this.doDnimate(this.domNode, { width: {start: this.minWidth, end: this.maxWidth}  },500);
            this.doDnimate(this.maxStateNode,{ opacity: {start: 0, end: 1} },400);

            this.resize();
            //topic.publish('changeMapPosition', {
            //    right: 0//以前是left
            //});

            ////这块先注视掉
            //this.stateNode = this.maxStateNode;
            topic.publish('base/layout/floatLayout/panelBottomContainer/size', {
                left: 394//以前是left
            });
        },
        doDnimate:function(domNode,properties,duration){
            baseFx.animateProperty(
                {
                    node: domNode,
                    properties:properties,
                    duration: duration
                }).play();
        }

    });
});