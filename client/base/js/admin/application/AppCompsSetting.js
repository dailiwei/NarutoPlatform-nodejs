/**
 * Created by richway on 2015/6/21.
 */

define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    'dojo/_base/html',
    "dojo/dom-construct",
    "dojo/dom-class",
    'dojo/on',
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "base/_BaseWidget",
    "dojo/text!../template/AppCompsSetting.html",
    "dojo/text!../css/AppCompsSetting.css",
    "dojo/topic",
    "dojo/Deferred",
    "rdijit/layout/TabContainer2",
    "base/admin/dijit/AppCompServiceList",
    "base/admin/dijit/AppCompConfig",
    "base/utils/commonUtils",
    'require'
], function(declare,
    lang,
    html,
    domConstruct,
    domClass,
    on,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _Widget,

    template,
    css,
    topic,
    Deferred,
    TabContainer,
    AppCompServiceList,
    AppCompConfig,
    commonUtils
) {
    return declare("base.admin.application.AppCompsSetting", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        'baseClass': "base-admin-application-AppCompsSetting",
        itemList: null,
        currentCmp: null,
        constructor: function(args) {
            var methodName = "constructor";
            declare.safeMixin(this, args);
            //设置样式
            this.setCss(css);
            this.itemList = [];
            this.currentCmp = {};
        },

        postCreate: function() {
            this.inherited(arguments);

            //commonUtils.mask("请稍等...");
            //   this._getCompsList().then(lang.hitch(this, this.createCompsList));
            this.createCompsList(this.selectComps);

        },
        initTab: function() {
            // var content2 = domConstruct.create("div",{innerHTML:'组件参数'});
            var content2 = new AppCompConfig({});
            content2.startup();
            var content1 = new AppCompServiceList({
                "appId": this.appId
            });
            content1.startup();

            var tab1 = new TabContainer({
                id: dojox.uuid.generateRandomUuid(),
                tabs: [{
                    title: "服务设置",
                    content: content1.domNode
                }, {
                    title: "组件参数",
                    content: content2.domNode
                }],
                style: "width:100%;height:100%"
            }, this.contentDiv);
            tab1.startup();

            //派发第一个事件
            //this.currentCmp
            topic.publish("base/admin/AppCompsSetting/AppCompServiceList", {
                "cmpt": this.currentCmp
            });

        },
        resize: function() {},
        startup: function() {
            this.inherited(arguments);
        },
        _getCompsList: function() {
            //去后台请求数据

            return dojo.xhrPost({
                url: APP_ROOT + "base/data/app_comps_list.json",
                handleAs: "text",
                content: {
                    name: ""
                }
            }).then(lang.hitch(this, function(response) {

               // commonUtils.mask("请稍等...");
                var json = dojo.fromJson(response);
                if (json.success) { //成功返回
                    return this.selectComps;
                } else {
                    return [];
                }
            }));
        },
        createCompsList: function(list) {
            // if(list.length>0){//为了保持总有数据添加的
            // }else{
            //     list =  [
            //         {
            //             "cmptNm":"基础组件",
            //             "compId":"com0001",
            //             "thumbnail":APP_ROOT+"base/images/admin/components/base_info.png"
            //         },
            //         {
            //             "cmptNm":"数据监视",
            //             "compId":"com0001",
            //             "thumbnail":APP_ROOT+"base/images/admin/components/data_monitor.png"
            //         },
            //         {
            //             "cmptNm":"数据分析",
            //             "compId":"com0001",
            //             "thumbnail":APP_ROOT+"base/images/admin/components/data_any.png"
            //         },
            //         {
            //             "cmptNm":"图表管理",
            //             "compId":"com0001",
            //             "thumbnail":APP_ROOT+"base/images/admin/components/icon_mgnt.png"
            //         }
            //     ] ;
            // }

            //根据list创建菜单
            for (var i = 0; i < list.length; i++) {
                var itemDiv = domConstruct.create("div", {
                    id: list[i].cmptNm,
                    innerHTML: list[i].cmptNm
                });
                if (i == 0) {
                    domClass.add(itemDiv, "list-item list-item-selected");
                    this.currentCmp = list[0];
                } else {
                    domClass.add(itemDiv, "list-item");
                }
                domConstruct.place(itemDiv, this.compsList);

                html.create('img', {
                    'class': 'comp_list_item_icon',
                    "src": ((list[i].thumbnail == null) ? APP_ROOT + "base/images/logo_default.png" : list[i].thumbnail)
                }, itemDiv);

                this.own(on(itemDiv, 'click', lang.hitch(this, function(evt) {
                    var widgetid = evt.target.id;
                    for (var i = 0; i < list.length; i++) {
                        if (widgetid == list[i].cmptNm) {
                            this.currentCmp = list[i];
                            this.setSelectWidget(list[i]);
                            break;
                        }
                    }
                })));
                this.itemList.push({
                    cmptNm: list[i].cmptNm,
                    div: itemDiv
                });
            }

            //根据第一个去创建第一个tab
            this.initTab();


        },
        setSelectWidget: function(widget) {
            for (var i = 0; i < this.itemList.length; i++) {
                if (widget.cmptNm == this.itemList[i].cmptNm) {
                    html.addClass(this.itemList[i].div, 'list-item-selected');
                    topic.publish("base/admin/AppCompsSetting/AppCompServiceList", {
                        "cmpt": this.currentCmp
                    });
                } else {
                    html.removeClass(this.itemList[i].div, 'list-item-selected');
                }
            }
        },
        validate: function() {
            //在这里判断是否都填写完整了

            return true;
        },
        save: function() {
            return dojo.xhrPost({
                url: APP_ROOT + "base/data/app_list.json",
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
        }

    });
});
