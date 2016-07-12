/**
 * Created by richway on 2015/6/21.
 */

define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    'dojo/_base/html',
    "dojo/dom-construct",
    'dojo/on',
    "dojo/json",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "base/_BaseWidget",

    "dojo/text!../template/AppPagesConfig.html",
    "dojo/text!../css/AppPagesConfig.css",
    "dojo/topic",
    "dojo/Deferred",
    "./AppPageFrame",
    "./AppPageMenuFrame",
    "./AppPageLinkFrame",
    "../dijit/AppLayoutPrev",
    //"vendor/zTree_v3/widget/zTreeWidget",
    "../dijit/zTreeWidget",
    'base/admin/AppCommon',
    "base/utils/commonUtils",
    'require'
], function(declare,
    lang,
    html,
    domConstruct,
    on,
    JSON,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _Widget,

    template,
    css,
    topic,
    Deferred,
    AppPageFrame,
    AppPageMenuFrame,
    AppPageLinkFrame,
    AppLayoutPrev,
    Tree,
    AppCommon,
    commonUtils

) {
    return declare("base.admin.application.AppPagesConfig", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        'baseClass': "base-admin-application-AppPagesConfig",
        isEdit: null,
        currentPageFrame: null,
        widgetList: null,
        constructor: function(args) {
            var methodName = "constructor";
            declare.safeMixin(this, args);
            //设置样式
            this.setCss(css);
            //标示
            this.isEdit = false; //默认当前没有页面在编辑

            this.layoutList = [];
            this.currentPageFrame = null;
            this.pageId = null;
            if (window.global && window.global.widgetList) {
                this.widgetList = window.global.widgetList;
            } else {
                this.widgetList = [];
            }

        },

        postCreate: function() {
            this.inherited(arguments);

            commonUtils.mask("请稍等...");

            //获取所有layout的信息
            this.getAllLayout();
            //this.getAllWidgets();

            this._getPagesList().then(lang.hitch(this, this.createPagesList));
        },
        initPageConfig: function() {
        	 var list = this.tree.getTreeNodes();
        	 if(list&&list.length>0){
        		 var treeNode = list[0];
            	 if(treeNode.url&&treeNode.url.length>0){
                     this.loadLinkPage(treeNode.pageId,treeNode.pageNm,treeNode.nt,treeNode.url,treeNode.target,treeNode.visible);
                 }else{
                     this.loadPage(treeNode.pageId,treeNode.layoutId,treeNode.pageNm,treeNode.nt,treeNode.isParent,treeNode.visible);
                 }
        	 }
        	
//            var panel = new AppPageFrame({
//                "name": this.pageName
//            });
//            panel.startup();
//
//            this.currentPageFrame = panel;
//            domConstruct.place(panel.domNode, this.contentDiv);
        },
        resize: function() {},
        startup: function() {
            this.inherited(arguments);
        },
        _getPagesList: function() {
            //去后台请求数据
            var url;
            if (window.testApp) {
                url = APP_ROOT+"base/data/app_pages.json";
            } else {
                //url = AppCommon.getAppPageByAppId;
                url = AppCommon.cfg_app + "/" + this.appId + "/pageTree";
            }
            //return commonUtils.post( url,'{"sqlid":"com.ibm.rich.framework.persistence.CfgAppPageMapper.getAppPageByAppId","appId":"'+this.appId+'"}'
            //).then(lang.hitch(this, function (json) {
            //        return json.data;//选中的返回
            //    }));
            return commonUtils.get(url).then(lang.hitch(this, function(json) {
                return json.data; //选中的返回
            }));

        },
        createPagesList: function(list) {

            this.tree = new Tree({
                "menuList": list
            });

            domConstruct.place(this.tree.domNode, this.treeNode);
            this.tree.startup();

            commonUtils.mask("请稍等...");
            //调用第一个页面的配置
            setTimeout(lang.hitch(this,function(){
            	
            	  this.initPageConfig();
            }),1000);
          
        },
        validate: function() {
            //在这里判断是否都填写完整了

            return true;
        },
        save: function() {
            return dojo.xhrPost({
                url: APP_ROOT+"base/data/app_list.json",
                handleAs: "text",
                content: {
                    name: ""
                }
            }).then(lang.hitch(this, function(response) {
                var json = dojo.fromJson(response);
                if (json.success) { //成功返回
                    return json.data;
                } else {
                    return [];
                }
            }));
        },
        _addMenuGroup: function() {
            //添加菜单分组
            var dataNode = this.tree.addLeaf({
                isParent: true
            });
            if (dataNode == "") return;

            this.getMenuPage(dataNode);
        },
        _addRootMenuGroup: function() {

            //判断是否有正在编辑的，有的话，先保存
            if (this.isEdit) {
                alert("请先保存正在编辑的页面");
            } else {
                var data = this.tree.addRootLeaf();
                this.destroyContent();

                var panel = new AppPageMenuFrame({
                    "name": data.name,
                    "pageId": data.pageId,
                    "nt": data.nt
                });

                domConstruct.place(panel.domNode, this.contentDiv);
                panel.startup();
            }
        },
        destroyContent: function() {
            if (this.currentPageFrame) {
                this.currentPageFrame.destroy();
            }
            domConstruct.empty(this.contentDiv);
        },
        pageName: "综合监视",
        pageId: null,
        _addMenuPage: function() {
            //先假设选中的就是可添加页面的组
            //新建页面
            var dataNode = this.tree.addLeaf({
                isParent: false
            });

            if (dataNode == "") return;
            this.getMenuPage(dataNode);
        },
        _addLinkPage: function() {
            var dataNode = this.tree.addLeaf({
                isParent: false
            });

            if (dataNode == "") return;
            this.getLinkPage(dataNode);
        },
        getMenuPage: function(dataNode) {
            var name = dataNode.name;
            this.pageName = name;
            this.pageId = dataNode.pageId;

            this.destroyContent();

            if (dataNode.isParent) {
                var panel = new AppPageMenuFrame({
                    "name": dataNode.name,
                    "pageId": dataNode.pageId,
                    "nt": dataNode.nt
                });
                panel.startup();
                domConstruct.place(panel.domNode, this.contentDiv);

            } else {
                var panel = new AppLayoutPrev(this.layoutList || {});
                panel.startup();
                domConstruct.place(panel.domNode, this.contentDiv);
                panel.initAvalon();
            }

            this.isEdit = true; //修改状态，有页面正在编辑
        },
        getLinkPage: function(dataNode) {
            var name = dataNode.name;
            this.pageName = name;
            this.pageId = dataNode.pageId;

            this.destroyContent();

            var panel = new AppPageLinkFrame({
                "name": dataNode.name,
                "pageId": dataNode.pageId,
                "nt": dataNode.nt
            });
            domConstruct.place(panel.domNode, this.contentDiv);

            panel.startup();

            this.isEdit = true; //修改状态，有页面正在编辑
        },
        _addRootMenuPage: function() {
            //添加根页面 
        	
        	var dataNode = this.tree.addRootLeafPage();

            if (dataNode == "") return; 
             
        	var name = dataNode.name;
            this.pageName = name;
            this.pageId = dataNode.pageId;

            this.destroyContent(); 
            
            var panel = new AppLayoutPrev(this.layoutList || {});
            panel.startup();
            domConstruct.place(panel.domNode, this.contentDiv);
            panel.initAvalon();

            this.isEdit = true; //修改状态，有页面正在编辑
        },
        _addRootMenuLink:function(){
        	//添加根链接 
        	var dataNode = this.tree.addRootLeafPage();

            if (dataNode == "") return; 
        	 this.getLinkPage(dataNode);
        },
        _addMenuDel: function() {
            //判断当前选中的项， 删除他以及他的子页面，需要确认
            this.tree.removeSelectItem();
        },
        _setDefaultPage: function() {
            //得到当前选中的pageid，没有的话，叫他选择
            var node = this.tree.getSelectItem();
            if (node == "" || node.isParent) {
                alert("请选中叶子节点");
            } else {
                //更新
                //直接保存入库新建/更新，根据appid是否为null
                var dataStr = JSON.stringify({
                    "appId": this.appId,
                    "defaultPageId": node.pageId
                });
                //var url = AppCommon.saveAppProp;
                var url = AppCommon.cfg_app;
                url += "/" + this.appId;
                commonUtils.put(url, dataStr).
                then(lang.hitch(this, function(json) {
                    if (json.success) { //成功返回
                        topic.publish("base/manager/message", {
                            state: "info",
                            title: "设置成功",
                            content: "<div> 成功将【" + this.pageName + "】设置默认页</div>"
                        });
                    } else {}
                }));
            }
        },
        //清空页面
        emptyContentDiv: function() {
            this.isEdit = false;
            domConstruct.empty(this.contentDiv);
        },
        //删除页面布局选择的东西
        closeLayoutPrev: function(layoutId) {
            //得到layout的id
            //销毁当前的页面的东西
            this.destroyContent();

            //保存该页面的layout到数据库v
            var uuid_layout = dojox.uuid.generateRandomUuid();
            var jsonobj = {
                "sqlid": "com.ibm.rich.framework.persistence.CfgAppPageMapper.updateCfgAppPage",
                "list": [{
                    "pageId": this.pageId,
                    "layoutId": uuid_layout
                }]
            };
            var dataStr = JSON.stringify(jsonobj);
            commonUtils.put(AppCommon.cfg_app + "/" + this.appId + "/page", dataStr).then(lang.hitch(this, function(json) {
                Logger.log(json);
            }));
            
            //更新树
            this.tree.editPageLayout(uuid_layout);

            //通过某种方式得到layout的东西
            var layout = this.getLayoutById(layoutId);
            layout.layout_id = uuid_layout;
            layout.id = uuid_layout;
            //var layout = {
            //    "layout_id": "Base.layout3",
            //    "name": "Bootstrap Layout",
            //    "description": "左右的一种排列布局",
            //    "extensions": [{
            //        "id": "left",
            //        "name": "左视图",
            //        "Maximum": 1,
            //        "widget_types": ["view,controller"]
            //    }, {
            //        "id": "main",
            //        "name": "主视图",
            //        "Maximum": 1,
            //        "widget_types": ["view"]
            //    }
            //
            //    ],
            //    "thumbnail": APP_ROOT+"base/images/admin/layout/layout02.png",
            //    "module": {
            //        "name": "base/layout/IFELayoutWithTaskbar",
            //        "package": "base",
            //        "location": APP_ROOT+"base/js"
            //    }
            //};

            var panel = new AppPageFrame({
                "appId": this.appId,
                "name": this.pageName,
                "layout": layout,
                "pageConfig": [layout],
                "pageId": this.pageId,
                "nt":""
            });

            domConstruct.place(panel.domNode, this.contentDiv);
            panel.startup();

        },
        loadLinkPage: function(pageId, pageNm, nt, url, target,visible) {
            this.pageName = pageNm;
            this.pageId = pageId;
            //销毁当前的页面的东西
            this.destroyContent();

            var panel = new AppPageLinkFrame({
                "name": pageNm,
                "pageId": pageId,
                "nt": nt,
                "url": url,
                "target": target,
                "visible": visible

            });

            domConstruct.place(panel.domNode, this.contentDiv);
            panel.startup();
            return;

        },
        loadPage: function(pageId, layoutId, pageName, nt, isParent,visible) {
            //触发树的节点，获取相应的页面
            //alert("加载这个页面了哦："+pageId);
            this.pageName = pageName;
            this.pageId = pageId;
            //销毁当前的页面的东西
            this.destroyContent();

            if (isParent) { //如果是菜单
                var panel = new AppPageMenuFrame({
                    "name": pageName,
                    "pageId": pageId,
                    "nt": nt,
                    "visible": visible
                });

                domConstruct.place(panel.domNode, this.contentDiv);
                panel.startup();
                return;
            }
            //加载新的页面配置信息
            this._loadPageConfigInfo(pageId).then(lang.hitch(this, function(data) {

                var pageConfig = data.config;
                //获取layout 根据layoutId
                var layout = this.getLayoutByIdConfig(data, layoutId);
                var nt = data.nt;
                var panel = new AppPageFrame({
                    "appId": this.appId,
                    "name": this.pageName,
                    "layout": layout,
                    "pageConfig": pageConfig,
                    "pageId": pageId,
                    "nt": nt,
                    "visible": visible
                });


                domConstruct.place(panel.domNode, this.contentDiv);
                panel.startup();

            }));
        },
        getLayoutById: function(id) {
            //for(var i=0;i<this.layoutList.length;i++){
            //    if(this.layoutList[i].layout_id==id){
            //        var ss = this.layoutList[i];
            //        return lang.clone(ss);
            //    }
            //}
            //要从后台获取，根据组件的选择
            var widgetList = this.widgetList;

            var layout_widget = {};
            for (var i = 0; i < widgetList.length; i++) {
                if (widgetList[i].widget_id == id) {
                    layout_widget.widget_id = widgetList[i].widget_id;
                    layout_widget.module = widgetList[i].module.moduleName;
                    layout_widget.container = "root";
                    layout_widget.regions = widgetList[i].regions;
                    layout_widget.thumbnail = widgetList[i].thumbnail;
                    layout_widget.parameters = widgetList[i].parameters;
                    break;
                }
            }

            //for(var i=0;i<this.layoutList.length;i++){
            //    if(this.layoutList[i].layout_id==id){
            //        var ss = this.layoutList[i];
            //        return lang.clone(ss);
            //    }
            //}


            return layout_widget;
        },
        getLayoutByIdConfig: function(data, layoutId) {

            var widgetList = data.config;

            var layout_widget = {};
            for (var i = 0; i < widgetList.length; i++) {
                if (widgetList[i].id == layoutId) {
                    layout_widget.widget_id = widgetList[i].widget_id;
                    break;
                }
            }

            layout_widget = this.getLayoutById(layout_widget.widget_id);
            layout_widget.layout_id = layoutId;
            return layout_widget;
        },
        _loadPageConfigInfo: function(pageid) { //后台加载相关页面的config的信息
            //return dojo.xhrPost({
            //    url: APP_ROOT+"base/data/pageinf.json",
            //    handleAs: "text",
            //    content: {id: pageid}
            //}).then(lang.hitch(this, function (response) {
            //    var json = dojo.fromJson(response);
            //    if (json.success) {//成功返回
            //        return json.data;
            //    } else {
            //        return [];
            //    }
            //}));

            var url;
            if (window.testApp) {
                url = APP_ROOT+"base/data/app_page_info.json";
            } else {
                //url = AppCommon.getAppPageByPageId;
                url = AppCommon.cfg_app + "/" + this.appId + "/page/" + pageid;
            }
            //return commonUtils.post( url,'{"sqlid":"com.ibm.rich.framework.persistence.CfgAppPageMapper.getAppPageByPageId","pageId":"'+pageid+'"}'
            //).then(lang.hitch(this, function (json) {
            //        //Logger.log(json.data[0].config);
            //        return dojo.fromJson(json.data[0].config);//选中的返回
            //    }));
            return commonUtils.get(url).then(lang.hitch(this, function(json) {
                //Logger.log(json.data[0].config);
                return {
                    config: json.data[0].config,
                    layoutId: json.data[0].layoutId,
                    nt: json.data[0].nt
                }; //选中的返回
            }));


            //getAppPageByPageId
        },
        layoutList: null,
        getAllLayout: function() {
            //Base.FloatLayout
            //var js = "[{\"id\":\"main\",\"Maximum\":1,\"name\":\"主显示区域\",\"widget_types\":[\"manager\"]}]";
            //lang.isString(js)
            //var json = dojo.fromJson(js);
            //Logger.log(json);
            //组件开发一种新的layout怎么搞
            //var url = window.testApp?APP_ROOT+"base/data/app_layout_all.json":AppCommon.getLayouts;
            var cmpstr = "";
            cmpstr = window.selectCompsList.join("','");

            //var url = APP_ROOT+"base/data/app_layout_all.json";
            var url = AppCommon.getLayoutsByComponents + "('" + cmpstr + "')";
            return commonUtils.get(url).then(lang.hitch(this, function(json) {
                this.layoutList = json.data;
            }));

        },
        getAllWidgets: function() {
            var cmpstr = "";
            cmpstr = window.selectCompsList.join("','");
            var url = AppCommon.getWidgetsByComponents + "('" + cmpstr + "')";
            return commonUtils.get(url).then(lang.hitch(this, function(json) {
                this.widgetList = json.data;
            }));

        }


    });
});
